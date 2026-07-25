# API — Contrato Backend (`espetinho-nilson`)

Documento de referência para o **frontend**. Descreve todos os endpoints, formatos de request/response, códigos HTTP e o **changelog** das mudanças recentes que afetam a integração.

**Base URL (dev):** `http://localhost:3333`
**Stack:** Express 5 + TypeScript + Prisma + PostgreSQL + JWT + Cloudinary + Zod

---

## ⚠️ Changelog — mudanças que afetam o frontend

Estas mudanças **alteram o contrato da API**. O frontend precisa se adaptar.

### 1. Códigos HTTP de erro agora são semânticos (BREAKING)

Antes, **todo erro de negócio retornava `400`**. Agora cada erro tem seu status correto via classe `AppError`:

| Situação | Antes | Agora |
|----------|-------|-------|
| Recurso não encontrado (usuário, produto, categoria, pedido) | `400` | **`404`** |
| Login inválido | `400` | **`401`** |
| E-mail já cadastrado | `400` | **`409`** |
| Produto indisponível no pedido | `400` | **`422`** |
| Falha interna (banco, upload) | `400` | **`500`** |

**Impacto no frontend:** se você tratava "não encontrado" checando `status === 400`, agora precisa checar `404`. O tratamento de login precisa olhar `401`.

### 2. Login: mensagem e status mudaram (BREAKING)

- **Antes:** `400` `{ "error": "Email/Senha é obrigatório" }`
- **Agora:** `401` `{ "error": "Email ou senha inválidos" }`

### 3. Rotas de item de pedido agora exigem autenticação (BREAKING)

`POST /order-item` e `DELETE /order-item/:id` **agora exigem** `Authorization: Bearer <token>`. Antes eram públicas.

### 4. Mensagens de erro padronizadas em português

| Antes | Agora |
|-------|-------|
| `Category does not exist` | `Categoria não encontrada` |
| `Product does not exist` | `Produto não encontrado` |
| `Pedido nao encontrado` | `Pedido não encontrado` |
| `Produto nao existe` | `Produto não encontrado` |
| `Produto indisponivel` | `Produto indisponível` |
| `Um ou mais produtos nao existem` | `Um ou mais produtos não existem` |
| `Pedido contem produto indisponivel` | `Pedido contém produto indisponível` |
| `Error uploading image` | `Falha ao fazer upload da imagem` |

### 5. Categoria: nome mínimo agora é 3 caracteres

`POST /category` agora exige `name` com **mínimo de 3 caracteres** (antes o schema aceitava 2 por engano).

### 6. Imagem em `POST /product` é opcional

O campo `file` **não é obrigatório**. Se omitido, o produto é criado com `imageUrl: null`. (Não existe mais o erro `Image is required`.)

### 7. Combos (NOVO)

- Novo recurso **Combo**: um pacote com preço fixo, composto por **groups** (`CATEGORY_CHOICE` ou `FIXED_PRODUCT`) que definem o que o cliente pode/deve escolher.
- `POST /order` agora aceita `combos: [{ comboId, selections }]` além de `items`. `items` passou a ser **opcional** — o pedido só precisa ter ao menos 1 item **ou** 1 combo.
- Ao mover o pedido para `PREPARANDO`, a baixa de estoque agora também considera os produtos usados dentro dos combos do pedido.

### 8. Controle de estoque (NOVO)

- Produto agora tem o campo **`stock`** (inteiro ≥ 0). Presente em **todas as respostas de produto**.
- `POST /product` e `PUT /product/:id` aceitam `stock` opcional no form (default `0` na criação).
- Ao mover um pedido para **`PREPARANDO`** (`PATCH /order/:id/status`), o estoque dos produtos é **baixado automaticamente** conforme as quantidades do pedido:
  - A baixa ocorre **uma única vez por pedido** (controlada por flag interna `stockDeducted`), mesmo que o status vá e volte.
  - Se o estoque de um produto zerar, ele é marcado **`available: false`** automaticamente.
  - Se algum produto não tiver estoque suficiente, retorna **`422`** e **nada é alterado** (a operação é transacional).

### 9. Loja aberta/fechada (NOVO)

- Novo recurso **Settings** — `GET /settings` (público) e `PATCH /settings/store-status` (JWT), ver [Configurações da loja](#configurações-da-loja).
- `POST /order` agora **rejeita com `422`** (`A loja está fechada no momento`) quando `Settings.isStoreOpen` for `false`. O frontend deve continuar bloqueando visualmente também, mas o backend agora garante isso mesmo se alguém chamar a API direto.

### 10. `GET /orders` agora é paginado (BREAKING)

- **Antes:** `200` retornava um **array puro** de pedidos.
- **Agora:** `200` retorna `{ orders, page, limit, hasMore }` — o array de pedidos está em `orders`, não mais na raiz da resposta.
- Aceita `page`, `limit` (máx. 50) e `status` como query params, todos opcionais — sem eles, comportamento equivalente ao anterior (todos os status, primeira página de 20).
- **Impacto no frontend:** quem fazia `response.data` esperando um array agora precisa usar `response.data.orders`.

### 11. Categoria: ordem de exibição no cardápio (BREAKING na ordenação)

- Categoria agora tem o campo **`displayOrder`** (inteiro ≥ 0, default `0`). `POST /category` e `PUT /category/:id` aceitam `displayOrder` opcional no body.
- **Antes:** `GET /category` retornava ordenado por `createdAt` desc (mais recente primeiro).
- **Agora:** ordenado por `displayOrder` asc (menor primeiro); em empate, por `createdAt` asc. Categorias existentes têm `displayOrder: 0` até o admin reordenar.

### 12. Impressão automática de pedidos (NOVO, aditivo)

- Pedido agora tem o campo **`autoPrinted`** (boolean, default `false`), presente em todas as respostas de pedido.
- Nova rota `PATCH /order/:id/mark-printed` marca `autoPrinted: true` — dá suporte à futura impressão automática via QZ Tray no frontend (evita reimprimir o mesmo pedido a cada polling).
- Não quebra nada existente: campo novo com default, rota nova.

### 13. Combo: group `CATEGORY_CHOICE` agora aceita múltiplas categorias (BREAKING)

Corrige um bug de modelagem: antes, um group `CATEGORY_CHOICE` só podia apontar para **1 categoria**. Pra modelar "escolha 2 espetos de qualquer tipo de carne" (bovina, frango ou suína), era preciso criar 3 groups separados — e como são independentes, o sistema permitia até `maxQuantity` de **cada um**, quando a intenção era um limite **combinado** entre as 3 categorias.

- **Payload (`POST`/`PUT /combo`):** campo `categoryId` (string) do group `CATEGORY_CHOICE` foi substituído por **`categoryIds`** (array de string, mín. 1 item).
- **Resposta (`GET /combo`, `GET /combo/:id`, `GET /combos`):** `group.categoryId`/`group.category` foram substituídos por **`group.categories`** (array `[{ id, name }, ...]`). Na listagem pública, o antigo `group.category.products` virou **`group.products`** — lista agregada dos produtos disponíveis de todas as categorias do group.
- **Regra de overlap** passou a considerar todas as categorias de cada group: uma categoria não pode aparecer em mais de um lugar do mesmo combo (nem repetida no próprio `categoryIds`, nem em outro group).
- **Validação do pedido (`POST /order`):** a soma das quantities de um group `CATEGORY_CHOICE` agora considera produtos de **qualquer uma** das categorias do group, não mais de uma única categoria.
- **Migration destrutiva:** a coluna `categoryId` de `combo_groups` foi removida (substituída pela tabela `combo_group_categories`, many-to-many). **Combos cadastrados antes dessa mudança perdem a associação de categoria dos groups `CATEGORY_CHOICE`** — o admin precisa recriá-los. Pedidos já feitos (`OrderCombo`/`OrderComboItem`) não são afetados, pois são snapshots independentes.

### 14. Combo: group `FIXED_PRODUCT` agora aceita múltiplos produtos fixos (BREAKING)

Mesma correção de modelagem da mudança #13, agora aplicada a `FIXED_PRODUCT`: antes, um group `FIXED_PRODUCT` só podia incluir **1 produto fixo** (`productId` único + `minQuantity` como a quantidade). Pra montar "acompanhamentos inclusos" com mais de 1 produto obrigatório (ex.: pão + vinagrete), era preciso criar 1 group por produto.

- **Payload (`POST`/`PUT /combo`):** campo `productId` (string) do group `FIXED_PRODUCT` foi substituído por **`fixedItems`** (array de `{ productId, quantity }`, mín. 1 item). O campo `minQuantity` do group deixou de ser usado/obrigatório para `FIXED_PRODUCT` — a quantidade agora é por item, em `fixedItems[].quantity`.
- **Resposta (`GET /combo`, `GET /combo/:id`, `GET /combos`):** `group.productId`/`group.product` foram substituídos por **`group.fixedItems`** — array com os dados completos de cada produto fixo mais a `quantity`, ex.: `[{ id, name, price, description, imageUrl, available, stock, categoryId, createdAt, quantity }, ...]`.
- **Regra de duplicata:** não é permitido repetir o mesmo `productId` dentro do `fixedItems` do mesmo group (`400`).
- **Regra de overlap** com categorias continua valendo, agora considerando todos os produtos de `fixedItems`: nenhum deles pode pertencer a uma categoria já usada em algum group `CATEGORY_CHOICE` do mesmo combo.
- **Validação do pedido (`POST /order`):** a selection do cliente precisa cobrir **exatamente** todos os itens de `fixedItems` do group, cada um com a `quantity` correspondente (nem a mais, nem a menos) — mesma lógica rígida de antes, agora aplicada a uma lista em vez de 1 produto só.
- **Migration destrutiva:** a coluna `productId` de `combo_groups` foi removida (substituída pela tabela `combo_group_fixed_items`, um produto fixo por linha). **Combos cadastrados antes dessa mudança perdem o produto fixo dos groups `FIXED_PRODUCT`** — o admin precisa recriá-los. Pedidos já feitos (`OrderCombo`/`OrderComboItem`) não são afetados, pois são snapshots independentes.

### 15. Valor mínimo de pedido (NOVO, aditivo)

- `Settings` ganhou o campo **`minOrderValue`** (centavos, default `1000` = R$ 10,00), presente em `GET /settings`.
- Nova rota `PATCH /settings/min-order-value` 🔒 JWT — body `{ minOrderValue: number }` (inteiro ≥ 0).
- `POST /order` passa a **rejeitar com `422`** (`Pedido mínimo de R$ X,XX não atingido`) quando a soma dos itens + combos (sem contar `deliveryFee`) ficar abaixo de `Settings.minOrderValue`. A checagem acontece depois da validação de itens/combos e antes de criar o pedido.
- Não quebra nada existente: campo novo com default, rota nova, checagem adicional no fluxo de criação de pedido.

### 16. `POST /order-item` e `DELETE /order-item/:id` reescritas — corrige total quebrado com combos e adiciona travas (BREAKING no comportamento)

Essas duas rotas existiam desde antes dos combos e nunca tinham sido atualizadas. Reescritas do zero (mesma assinatura de rota/body, comportamento interno corrigido):

- **Bug corrigido — `total` ignorava combos:** o recálculo de `total` somava só `OrderItem`, então adicionar/remover um item avulso de um pedido que também tinha combo **apagava o valor do combo** do total salvo. Agora soma `OrderItem` + `OrderCombo.price` + `deliveryFee`, mesmo padrão de `POST /order`.
- **Novo bloqueio de status:** pedidos `ENTREGUE` não podem mais ser editados por essas rotas → `422` `Pedido já entregue não pode ser editado`.
- **Novo ajuste de estoque bidirecional:** se o pedido já passou por `PREPARANDO` (`stockDeducted: true`), adicionar item agora **baixa** o estoque na hora (rejeitando com `422` `Estoque insuficiente para o produto {nome}` se não houver saldo, e marcando `available: false` se zerar) e remover item agora **devolve** o estoque na hora. Se o pedido ainda não passou por `PREPARANDO`, nada muda no estoque — a baixa geral continua acontecendo normalmente na transição de status.
- Escopo permanece limitado a produtos avulsos (`OrderItem`) — produtos dentro de combos (`OrderCombo`/`OrderComboItem`) não são afetados por essas rotas.
- Sem consumidores no frontend hoje — nenhuma tela chama essas rotas atualmente, então a correção não tem impacto de regressão visível.

### 17. Combo: novo group `PRODUCT_CHOICE` (NOVO, aditivo)

Terceiro tipo de group, entre os dois já existentes: `CATEGORY_CHOICE` (escolhe dentro de categorias inteiras) e `FIXED_PRODUCT` (produtos inclusos automaticamente, sem escolha do cliente). `PRODUCT_CHOICE` cobre o caso intermediário: o admin seleciona manualmente uma **lista específica de produtos** (não categorias inteiras), e o cliente escolhe quais e quantos deles quer, respeitando `minQuantity`/`maxQuantity` do group — mesma lógica de soma total já usada em `CATEGORY_CHOICE`, só que a lista de produtos válidos vem direto de uma lista fixa em vez de agregada por categoria. Ex.: group "Escolha 1 acompanhamento" com as opções "Baião Cremoso P" e "Arroz Branco P".

Ao contrário das mudanças #13 e #14, esta é **puramente aditiva**: novo valor de enum + nova tabela, nenhuma coluna existente foi removida. **Combos `CATEGORY_CHOICE`/`FIXED_PRODUCT` já cadastrados continuam funcionando sem qualquer alteração ou necessidade de recriação.**

- **Payload (`POST`/`PUT /combo`):** novo campo `productIds` (array de string, **mín. 2 produtos** — com 1 só, o group deveria ser `FIXED_PRODUCT`) para `type: "PRODUCT_CHOICE"`, junto com `minQuantity`/`maxQuantity` (mesma regra de `CATEGORY_CHOICE`: `maxQuantity` opcional, default = `minQuantity`).
- **Resposta (`GET /combo`, `GET /combo/:id`):** cada group `PRODUCT_CHOICE` retorna **`choiceProducts`** — array `[{ productId, product: {...} }]` (produto completo, sem achatamento, diferente do padrão de `fixedItems`/`categories`).
- **Resposta pública (`GET /combos`):** cada group `PRODUCT_CHOICE` retorna **`products`** — lista dos produtos da escolha filtrados por `available: true` (mesmo campo/formato já usado em `CATEGORY_CHOICE`; o frontend já trata qualquer group não-`FIXED_PRODUCT` de forma genérica olhando `group.products`, então nenhuma mudança de UI foi necessária).
- **Regra de duplicata:** não é permitido repetir o mesmo `productId` dentro do `productIds` do mesmo group (`400`).
- **Regra de exclusividade generalizada para 3 tipos:** `FIXED_PRODUCT` (`fixedItems`) e `PRODUCT_CHOICE` (`productIds`) agora formam um **único pool de produtos reservados** — um produto não pode se repetir entre/dentro desses dois tipos de group (antes, `FIXED_PRODUCT` só tinha dedup dentro do próprio group; agora um produto usado em qualquer group `FIXED_PRODUCT`/`PRODUCT_CHOICE` do combo não pode aparecer em nenhum outro group desses dois tipos). A regra de categoria continua valendo sobre esse mesmo pool: nenhum produto reservado pode pertencer a uma categoria já usada em algum group `CATEGORY_CHOICE` do combo.
- **Validação do pedido (`POST /order`):** a soma das quantities das selections cujo `productId` pertence à lista de `choiceProducts` do group precisa estar entre `minQuantity` e `maxQuantity` — mesma lógica de soma de `CATEGORY_CHOICE`, mas casando direto por `productId` em vez de categoria.

---

## Convenções gerais

**Content-Type**
- Rotas JSON: `Content-Type: application/json`
- Criar/editar produto: `multipart/form-data` (campo de arquivo `file` + demais campos no form)

**Autenticação**
- Rotas marcadas **JWT** exigem: `Authorization: Bearer <token>`
- Token emitido em `POST /session`, expira em **30 dias**

**Dados**
- `price`, `deliveryFee`, `total`: **centavos** (inteiro). Ex.: `1500` = R$ 15,00
- Datas: ISO 8601 (`createdAt`, `updatedAt`)
- IDs: UUID (string)

---

## Tabela de erros HTTP

| Status | Quando ocorre | Corpo (exemplo) |
|--------|---------------|-----------------|
| `400` | Validação Zod falhou | `{ "error": "Erro validação", "details": [ { "campo": "email", "mensagem": "digite um email válido" } ] }` |
| `401` | Token ausente | `{ "error": "token não fornecido" }` |
| `401` | Token inválido/expirado | `{ "error": "Token inválido" }` |
| `401` | Login inválido | `{ "error": "Email ou senha inválidos" }` |
| `404` | Recurso não encontrado | `{ "error": "Produto não encontrado" }` |
| `409` | Conflito (e-mail duplicado) | `{ "error": "Usuario já existente" }` |
| `422` | Regra de negócio | `{ "error": "Produto indisponível" }` |
| `500` | Falha interna | `{ "error": "Falha ao criar pedido" }` |

> **Formato da validação Zod:** o campo `details[].campo` já vem sem o prefixo (`body`/`params`) — ex.: `"email"`, `"name"`, `"items.0.quantity"`.

---

## Usuários e sessão

### `POST /users` — Criar usuário 🔒 JWT

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `name` | string | mínimo 3 caracteres |
| `email` | string | e-mail válido |
| `password` | string | mínimo 6 caracteres |

**Sucesso:** `200` — objeto usuário (sem senha): `{ id, name, email, role, createdAt }`

**Erros:** `409` `Usuario já existente` · `400` validação · `401` sem token

---

### `POST /session` — Login

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `email` | string | e-mail válido |
| `password` | string | mínimo 1 caractere |

**Sucesso:** `200`

```json
{
  "id": "uuid",
  "name": "Maria Admin",
  "role": "ADMIN",
  "token": "eyJhbGciOi..."
}
```

**Erros:** `401` `Email ou senha inválidos`

---

### `GET /me` — Detalhes do usuário logado 🔒 JWT

**Sucesso:** `200` — `{ id, name, email, role, createdAt }`

**Erros:** `404` `Usuário não encontrado` · `401` sem token

---

## Categorias

**Objeto categoria:** `{ id, name, displayOrder, createdAt }`

### `POST /category` — Criar categoria 🔒 JWT

**Body:**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `name` | string | mín. 3 caracteres |
| `displayOrder` | number | inteiro ≥ 0, opcional (default `0`) — controla a posição de exibição no cardápio |

**Sucesso:** `201` — objeto categoria

**Erros:** `400` validação · `500` `Falha ao criar categoria`

---

### `GET /category` — Listar categorias

Público. **Sucesso:** `200` — array de categorias ordenado por `displayOrder` asc (menor número primeiro); em caso de empate, por `createdAt` asc.

---

### `GET /category/:id/products` — Listar produtos de uma categoria

Público.

**Sucesso:** `200` — array de produtos (formato produto completo abaixo).

**Erros:** `404` `Categoria não encontrada` · `500` `Falha ao listar produtos por categoria`

---

### `PUT /category/:id` — Atualizar categoria 🔒 JWT

**Body:** igual ao `POST /category` (`name` obrigatório, `displayOrder` opcional).

**Sucesso:** `200` — categoria atualizada.

**Erros:** `400` validação · `500` `Falha ao editar categoria`

---

### `DELETE /category/:id` — Excluir categoria 🔒 JWT

**Sucesso:** `200` — categoria removida.

**Erros:** `500` `Falha ao deletar categoria`

> Excluir categoria remove em cascata os produtos vinculados (`onDelete: Cascade`).

---

## Produtos

**Objeto produto (completo):**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `name` | string | |
| `price` | number | centavos |
| `description` | string \| null | |
| `imageUrl` | string \| null | URL Cloudinary |
| `available` | boolean | |
| `stock` | number | quantidade em estoque (inteiro ≥ 0) |
| `categoryId` | string | |
| `createdAt` | string (ISO) | |

### `POST /product` — Criar produto 🔒 JWT · `multipart/form-data`

**Campos do form**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | arquivo | **não** | Imagem (jpeg/png/jpg, máx. 5MB). Se omitido → `imageUrl: null` |
| `name` | string | sim | |
| `price` | string | sim | Enviado como string; servidor faz `parseInt` → centavos |
| `description` | string | não | |
| `categoryId` | string | sim | UUID da categoria |
| `stock` | string | não | Inteiro ≥ 0. Se omitido → `0` |

**Sucesso:** `200` — produto criado.

**Erros:** `404` `Categoria não encontrada` · `500` `Falha ao fazer upload da imagem` · `400` validação

```bash
curl -X POST http://localhost:3333/product \
  -H "Authorization: Bearer <token>" \
  -F "file=@./foto.jpg" \
  -F "name=Espeto de carne" \
  -F "price=1500" \
  -F "description=500g" \
  -F "categoryId=<uuid-categoria>"
```

---

### `PUT /product/:id` — Atualizar produto 🔒 JWT · `multipart/form-data`

**Campos:** iguais ao POST (incluindo `stock` opcional — se enviado, sobrescreve o estoque atual). `file` opcional — se enviado, substitui a imagem. Campo extra opcional `removeImage="true"` remove a imagem atual.

**Sucesso:** `200` — produto atualizado (inclui `available`).

**Erros:** `404` `Produto não encontrado` · `404` `Categoria não encontrada` · `500` `Falha ao editar produto`

> Validação: o `:id` da rota é validado **antes** do upload do arquivo (economiza processamento se o id for inválido).

---

### `PATCH /product/:id/disable` — Desabilitar produto 🔒 JWT

**Body:** vazio. **Sucesso:** `200` — produto com `available: false`.

**Erros:** `404` `Produto não encontrado` · `500` `Falha ao desabilitar produto`

---

### `PATCH /product/:id/enable` — Habilitar produto 🔒 JWT

Igual ao disable, com `available: true`.

**Erros:** `404` `Produto não encontrado` · `500` `Falha ao habilitar produto`

---

### `GET /product` — Listar produtos

Público. **Sucesso:** `200` — array (formato completo, **inclui `available`**), ordenado por `createdAt` desc.

**Erros:** `500` `Falha ao listar produtos`

---

### `DELETE /product/:id` — Excluir produto 🔒 JWT

**Sucesso:** `200` — produto excluído.

**Erros:** `500` `Falha ao deletar produto`

---

## Combos

Um combo tem preço **fixo** (não varia conforme os produtos escolhidos) e é composto por um ou mais **groups**:

- `CATEGORY_CHOICE`: o cliente escolhe produtos de **uma ou mais categorias combinadas**, com quantidade total entre `minQuantity` e `maxQuantity`. Ex.: "escolha 2 espetos de qualquer tipo de carne" = um group com `categoryIds: [carnes-bovina, carnes-frango, carnes-suina]`, `minQuantity: 2`, `maxQuantity: 2` — soma-se a quantidade de produtos de **qualquer uma** dessas categorias.
- `FIXED_PRODUCT`: um ou mais produtos específicos e obrigatórios, cada um com sua própria quantidade fixa (`fixedItems: [{ productId, quantity }, ...]`), todos inclusos automaticamente no combo — o cliente não escolhe nada nesse group, só confirma a quantidade exata de cada item.
- `PRODUCT_CHOICE`: o admin seleciona manualmente uma **lista específica de produtos** (`productIds`, não uma categoria inteira), e o cliente escolhe quais e quantos deles quer, com quantidade total entre `minQuantity` e `maxQuantity` — mesma lógica de soma de `CATEGORY_CHOICE`, mas a lista de produtos válidos é explícita em vez de vir agregada por categoria. Ex.: "escolha 1 acompanhamento" = um group com `productIds: [baiao-cremoso-p, arroz-branco-p]`, `minQuantity: 1`, `maxQuantity: 1`.

Se `maxQuantity` não for informado ao criar/editar um group `CATEGORY_CHOICE` ou `PRODUCT_CHOICE`, assume `maxQuantity = minQuantity` (quantidade exata). `minQuantity`/`maxQuantity` não são usados em groups `FIXED_PRODUCT` (a quantidade de cada produto vem de `fixedItems[].quantity`).

> Regra de criação: nenhuma categoria pode aparecer em mais de um lugar do mesmo combo — nem repetida dentro do `categoryIds` do próprio group, nem em outro group `CATEGORY_CHOICE`, nem como categoria de um produto reservado (`fixedItems`/`productIds`). Viola essa regra → `400`. `FIXED_PRODUCT` (`fixedItems`) e `PRODUCT_CHOICE` (`productIds`) compartilham um único pool de produtos reservados: o mesmo `productId` não pode se repetir dentro do próprio group, nem aparecer em outro group `FIXED_PRODUCT`/`PRODUCT_CHOICE` do combo → `400`.

**Objeto combo (admin, `comboSelect`):**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `name` | string | |
| `description` | string \| null | |
| `price` | number | centavos, fixo |
| `imageUrl` | string \| null | |
| `available` | boolean | |
| `createdAt` | string (ISO) | |
| `groups` | array | ver abaixo |

**Group do combo (`groups[]`, visão admin)**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `type` | string | `CATEGORY_CHOICE` \| `FIXED_PRODUCT` \| `PRODUCT_CHOICE` |
| `label` | string | |
| `categories` | array | `[{ id, name }, ...]` — todas as categorias do group; vazio (`[]`) quando não `CATEGORY_CHOICE` |
| `fixedItems` | array | `[{ ...produto, quantity }, ...]` — produtos fixos do group (dados completos do produto + `quantity`); vazio (`[]`) quando não `FIXED_PRODUCT` |
| `choiceProducts` | array | `[{ productId, product: {...} }, ...]` — produtos que o admin selecionou para o group escolher entre eles (dados completos do produto, sem achatamento); vazio (`[]`) quando não `PRODUCT_CHOICE` |
| `minQuantity` | number | relevante para `CATEGORY_CHOICE`/`PRODUCT_CHOICE` |
| `maxQuantity` | number | relevante para `CATEGORY_CHOICE`/`PRODUCT_CHOICE` |

Na listagem **pública** (`GET /combos`), cada group `CATEGORY_CHOICE` ganha um campo extra `products` — lista **agregada** dos produtos com `available: true` de **todas** as categorias do group (não mais aninhado dentro de uma única categoria). Cada group `PRODUCT_CHOICE` também ganha `products` — os produtos de `choiceProducts` filtrados por `available: true` (mesmo campo/formato, pra o frontend tratar os dois tipos de forma genérica).

---

### `POST /combo` — Criar combo 🔒 JWT · `multipart/form-data`

**Campos do form**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | arquivo | não | Imagem (jpeg/png/jpg, máx. 5MB) |
| `name` | string | sim | |
| `price` | string | sim | Enviado como string; servidor faz `parseInt` → centavos |
| `description` | string | não | |
| `groups` | string | sim | **JSON stringificado** de um array de groups (ver abaixo) — ex.: `groups=[{"type":"FIXED_PRODUCT","label":"Acompanhamentos inclusos","fixedItems":[{"productId":"uuid","quantity":1}]}]` |

**Cada group em `groups`:**

```json
{
  "type": "CATEGORY_CHOICE",
  "label": "Escolha 2 espetos de qualquer carne",
  "categoryIds": ["uuid-carnes-bovina", "uuid-carnes-frango", "uuid-carnes-suina"],
  "minQuantity": 2,
  "maxQuantity": 2
}
```

```json
{
  "type": "FIXED_PRODUCT",
  "label": "Acompanhamentos inclusos",
  "fixedItems": [
    { "productId": "uuid-pao", "quantity": 1 },
    { "productId": "uuid-vinagrete", "quantity": 2 }
  ]
}
```

```json
{
  "type": "PRODUCT_CHOICE",
  "label": "Escolha 1 acompanhamento",
  "productIds": ["uuid-baiao-cremoso-p", "uuid-arroz-branco-p"],
  "minQuantity": 1,
  "maxQuantity": 1
}
```

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `type` | string | `CATEGORY_CHOICE` \| `FIXED_PRODUCT` \| `PRODUCT_CHOICE` |
| `label` | string | não vazio |
| `categoryIds` | array de string | obrigatório se `CATEGORY_CHOICE`, mín. 1 item; todas as categorias precisam existir |
| `fixedItems` | array de `{ productId, quantity }` | obrigatório se `FIXED_PRODUCT`, mín. 1 item; `productId` não pode se repetir na lista; todos os produtos precisam existir; `quantity` inteiro ≥ 1 |
| `productIds` | array de string | obrigatório se `PRODUCT_CHOICE`, **mín. 2 itens** (com 1 só, use `FIXED_PRODUCT`); `productId` não pode se repetir na lista; todos os produtos precisam existir |
| `minQuantity` | number | obrigatório se `CATEGORY_CHOICE`/`PRODUCT_CHOICE` (inteiro ≥ 1); ignorado se `FIXED_PRODUCT` |
| `maxQuantity` | number | opcional, usado em `CATEGORY_CHOICE`/`PRODUCT_CHOICE`; se informado, ≥ `minQuantity`. Default = `minQuantity` |

**Sucesso:** `200` — combo criado (formato admin).

**Erros:** `400` validação Zod · `400` groups sobrepostos · `404` `Categoria não encontrada` · `404` `Produto não encontrado` · `500` `Falha ao fazer upload da imagem` · `500` `Falha ao criar combo`

---

### `PUT /combo/:id` — Atualizar combo 🔒 JWT · `multipart/form-data`

**Campos:** iguais ao POST. Os groups existentes são **substituídos** (delete + recriação, não é diff) pelos enviados. `file` opcional — se enviado, substitui a imagem. Campo extra opcional `removeImage="true"` remove a imagem atual.

**Sucesso:** `200` — combo atualizado.

**Erros:** `404` `Combo não encontrado` · `404` `Categoria não encontrada` · `404` `Produto não encontrado` · `400` validação/groups sobrepostos · `500` `Falha ao editar combo`

---

### `GET /combo` — Listar combos (admin) 🔒 JWT

Retorna **todos** os combos (disponíveis e indisponíveis), ordenados por `createdAt` desc.

**Sucesso:** `200` — array de combos (formato admin).

---

### `GET /combo/:id` — Detalhar combo 🔒 JWT

**Sucesso:** `200` — combo (formato admin).

**Erros:** `404` `Combo não encontrado`

---

### `PATCH /combo/:id/disable` — Desabilitar combo 🔒 JWT

**Sucesso:** `200` — combo com `available: false`.

**Erros:** `404` `Combo não encontrado` · `500` `Falha ao desabilitar combo`

---

### `PATCH /combo/:id/enable` — Habilitar combo 🔒 JWT

Igual ao disable, com `available: true`.

**Erros:** `404` `Combo não encontrado` · `500` `Falha ao habilitar combo`

---

### `DELETE /combo/:id` — Excluir combo 🔒 JWT

**Sucesso:** `200` — combo excluído (cascade dos groups).

**Erros:** `404` `Combo não encontrado` · `400` `Combo já foi vendido e não pode ser excluído. Desabilite-o em vez disso.` (existe `OrderCombo` vinculado) · `500` `Falha ao deletar combo`

---

### `GET /combos` — Listar combos disponíveis

Público. Retorna apenas combos com `available: true`, ordenados por `createdAt` desc. Cada group `CATEGORY_CHOICE` inclui `categories` (metadados) e `products` (lista agregada dos produtos disponíveis de todas as categorias do group). Cada group `PRODUCT_CHOICE` inclui `products` (produtos de `productIds` filtrados por `available: true`) — mesmo campo usado por `CATEGORY_CHOICE`.

**Sucesso:** `200` — array de combos (formato público).

---

## Configurações da loja

Config global do estabelecimento (não por usuário). Existe **sempre exatamente 1 registro** — se ainda não existir nenhum, o próprio servidor cria um com `isStoreOpen: true` na primeira leitura ou escrita (não precisa de setup manual).

**Objeto settings:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `isStoreOpen` | boolean | se `false`, `POST /order` passa a rejeitar novos pedidos |
| `minOrderValue` | number | centavos; `POST /order` rejeita pedidos cuja soma de itens + combos (sem contar `deliveryFee`) fique abaixo desse valor. Default `1000` (R$ 10,00) |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

### `GET /settings` — Buscar configurações da loja

Público.

**Sucesso:** `200` — objeto settings.

---

### `PATCH /settings/store-status` — Abrir/fechar a loja 🔒 JWT

**Body:** `{ "isStoreOpen": boolean }`

**Sucesso:** `200` — objeto settings atualizado.

**Erros:** `400` validação Zod (`isStoreOpen` não é boolean) · `500` `Falha ao atualizar status da loja`

---

### `PATCH /settings/min-order-value` — Definir valor mínimo do pedido 🔒 JWT

**Body:** `{ "minOrderValue": number }` — centavos, inteiro ≥ 0.

**Sucesso:** `200` — objeto settings atualizado.

**Erros:** `400` validação Zod (`minOrderValue` não é inteiro ≥ 0) · `500` `Falha ao atualizar valor mínimo do pedido`

---

## Pedidos

Enum de status: `RECEBIDO` | `PREPARANDO` | `SAIU` | `ENTREGUE` (padrão: `RECEBIDO`).

**Objeto pedido (completo)** — retornado em criar, listar, detalhar, atualizar status, adicionar/remover item e cancelar:

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `customerName` | string | |
| `phone` | string | |
| `address` | string | |
| `deliveryFee` | number | centavos |
| `total` | number | centavos (itens + taxa) |
| `status` | string | enum acima |
| `paymentMethod` | string \| null | `"dinheiro"` \| `"debito"` \| `"credito"` \| `"pix"` — `null` em pedidos criados antes desse campo existir |
| `changeFor` | number \| null | troco em centavos, só quando `paymentMethod` é `"dinheiro"` e o cliente informou um valor |
| `noChangeNeeded` | boolean | `true` quando o cliente marcou "não preciso de troco" |
| `autoPrinted` | boolean | `true` depois que `PATCH /order/:id/mark-printed` é chamado — usado pelo frontend (QZ Tray) pra não reimprimir o mesmo pedido a cada polling |
| `createdAt` | string (ISO) | |
| `items` | array | ver abaixo |
| `combos` | array | ver abaixo |

**Item do pedido (`items[]`)**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | id do `OrderItem` |
| `productId` | string | |
| `quantity` | number | |
| `price` | number | preço unitário congelado no momento da compra (centavos) |
| `product` | object | `{ id, name, imageUrl }` |

**Combo do pedido (`combos[]`)**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | id do `OrderCombo` |
| `comboId` | string | |
| `price` | number | preço do combo congelado no momento da compra (centavos) |
| `combo` | object | `{ id, name, imageUrl }` |
| `items` | array | `OrderComboItem[]`: `{ id, productId, quantity, product: { id, name, imageUrl } }` — produtos que o cliente escolheu para montar o combo |

---

### `POST /order` — Criar pedido

**Público** (fluxo do cliente).

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `customerName` | string | não vazio |
| `phone` | string | não vazio |
| `address` | string | não vazio |
| `deliveryFee` | number | inteiro ≥ 0, opcional (padrão `0`) |
| `items` | array | opcional (padrão `[]`) |
| `combos` | array | opcional (padrão `[]`) |
| `paymentMethod` | string | obrigatório — `"dinheiro"` \| `"debito"` \| `"credito"` \| `"pix"` |
| `changeFor` | number | inteiro ≥ 0, opcional — troco em centavos (só faz sentido com `paymentMethod: "dinheiro"`, mas não é validado de forma cruzada) |
| `noChangeNeeded` | boolean | opcional (padrão `false`) |

> O pedido precisa ter ao menos **1 item ou 1 combo** — se ambos vierem vazios, `400`.

Cada item: `{ productId: string, quantity: number (inteiro ≥ 1) }`

Cada combo: `{ comboId: string, selections: [{ productId: string, quantity: number (inteiro ≥ 1) }] }`. Cada entrada de `combos` gera **1 `OrderCombo` separado** — para pedir o mesmo combo duas vezes (possivelmente com escolhas diferentes), envie duas entradas.

`selections` precisa cobrir exatamente os groups do combo:
- `CATEGORY_CHOICE`: a soma das quantities dos produtos selecionados daquela categoria deve estar entre `minQuantity` e `maxQuantity` do group.
- `FIXED_PRODUCT`: precisa haver uma selection pra **cada** produto de `fixedItems` do group, com `quantity` igual à `quantity` daquele item (nem a mais, nem a menos).
- `PRODUCT_CHOICE`: a soma das quantities dos produtos selecionados que pertencem à lista `productIds` do group deve estar entre `minQuantity` e `maxQuantity` do group — mesma lógica de `CATEGORY_CHOICE`, casando direto por `productId` em vez de categoria.
- Se sobrar alguma selection que não se encaixa em nenhum group, ou faltar cobertura de algum group, o **pedido inteiro** é rejeitado (nenhum item/combo é criado).
- O preço de cada combo no pedido é o `price` fixo do `Combo` (não soma o preço dos produtos escolhidos).

> **Loja fechada:** antes de validar qualquer item/combo, o servidor checa `Settings.isStoreOpen`. Se a loja estiver fechada, o pedido é rejeitado com `422` `A loja está fechada no momento` — nenhum outro dado é processado. Ver [Configurações da loja](#configurações-da-loja).

> **Valor mínimo do pedido:** depois de validar itens/combos, o servidor soma `preço dos items + preço fixo dos combos` (**sem** contar `deliveryFee`) e compara com `Settings.minOrderValue`. Se ficar abaixo, o pedido é rejeitado com `422` `Pedido mínimo de R$ X,XX não atingido` — nenhum item/combo é criado. Ver [Configurações da loja](#configurações-da-loja).

**Sucesso:** `201` — pedido completo. O `total` é calculado no servidor (soma dos itens + preço fixo de cada combo + `deliveryFee`).

**Erros:**
- `422` `A loja está fechada no momento`
- `404` `Um ou mais produtos não existem` · `422` `Pedido contém produto indisponível`
- `404` `Um ou mais combos não existem` · `422` `Combo "{nome}" indisponível`
- `404` `Um ou mais produtos das selections não existem` · `422` `Seleção contém produto indisponível`
- `400` `Seleção do combo "{nome}" não atende ao grupo obrigatório "{label}"` (FIXED_PRODUCT errado/faltando)
- `422` `Pedido mínimo de R$ X,XX não atingido` (soma de itens + combos abaixo de `Settings.minOrderValue`)
- `400` `Quantidade selecionada para o grupo "{label}" do combo "{nome}" deve estar entre {min} e {max}` (CATEGORY_CHOICE/PRODUCT_CHOICE fora do intervalo)
- `400` `Seleção contém produto que não pertence a nenhum grupo do combo "{nome}"` (selection sobrando)
- `500` `Falha ao criar pedido`

```json
{
  "customerName": "João",
  "phone": "11999990000",
  "address": "Rua A, 100",
  "deliveryFee": 500,
  "paymentMethod": "dinheiro",
  "changeFor": 5000,
  "noChangeNeeded": false,
  "items": [
    { "productId": "prod-uuid-1", "quantity": 2 },
    { "productId": "prod-uuid-2", "quantity": 1 }
  ],
  "combos": [
    {
      "comboId": "combo-uuid-1",
      "selections": [
        { "productId": "prod-uuid-3", "quantity": 2 },
        { "productId": "prod-uuid-4", "quantity": 1 }
      ]
    }
  ]
}
```

---

### `POST /order-item` — Adicionar item ao pedido 🔒 JWT

> **Mudança:** agora exige autenticação.

Escopo limitado a produtos avulsos (`OrderItem`) — não se aplica a produtos dentro de combos (`OrderCombo`/`OrderComboItem`).

**Body (JSON):** `{ orderId: string, productId: string, quantity: number (≥ 1) }`

**Comportamento:**
- Se já existir item com o mesmo `productId`, a quantidade é **somada**; senão, cria um novo item com o preço atual do produto (snapshot).
- **Bloqueio de status:** pedidos com status `ENTREGUE` não podem ser editados → `422`.
- **`total` recalculado corretamente:** soma `OrderItem` (preço congelado × quantidade) + `OrderCombo.price` (preço fixo de cada combo do pedido) + `deliveryFee`. *(Antes dessa correção, o recálculo considerava só os `OrderItem`, corrompendo o `total` de pedidos que também tinham combo — corrigido.)*
- **Ajuste de estoque bidirecional:** se o pedido **já teve estoque baixado** (`stockDeducted: true`, ou seja, já passou por `PREPARANDO`), o estoque do produto adicionado é baixado **na hora**, na quantidade recém-adicionada — com a mesma checagem de suficiência de `PATCH /order/:id/status` (rejeita com `422` se não houver estoque) e a mesma regra de marcar `available: false` se o estoque zerar. Se o pedido **ainda não** teve estoque baixado (`stockDeducted: false`), nada é alterado no estoque agora — a baixa geral acontece normalmente quando o status for para `PREPARANDO`, já considerando o item atualizado.

**Sucesso:** `201` — pedido completo atualizado.

**Erros:** `404` `Pedido não encontrado` · `422` `Pedido já entregue não pode ser editado` · `404` `Produto não encontrado` · `422` `Produto indisponível` · `422` `Estoque insuficiente para o produto {nome}` (só quando `stockDeducted: true`) · `500` `Falha ao adicionar item ao pedido`

---

### `DELETE /order-item/:id` — Remover item do pedido 🔒 JWT

> **Mudança:** agora exige autenticação.

Escopo limitado a produtos avulsos (`OrderItem`) — não se aplica a produtos dentro de combos.

**Parâmetro:** `id` — id do **OrderItem**.

**Comportamento:**
- **Bloqueio de status:** pedidos com status `ENTREGUE` não podem ser editados → `422`.
- **`total` recalculado corretamente:** mesma fórmula do `POST /order-item` (`OrderItem` + `OrderCombo.price` + `deliveryFee`).
- **Ajuste de estoque bidirecional:** se `stockDeducted: true`, o estoque do produto removido é **devolvido** (incrementado) na hora, na quantidade do item removido. Isso **não** reativa `available` automaticamente se o produto estava desabilitado por estoque zerado — reativar disponibilidade continua sendo uma ação manual do admin (`PATCH /product/:id/enable`). Se `stockDeducted: false`, nada é alterado no estoque.

**Sucesso:** `200` — pedido completo após recalcular `total`.

**Erros:** `404` `Item do pedido não encontrado` · `404` `Pedido não encontrado` · `422` `Pedido já entregue não pode ser editado` · `500` `Falha ao remover item do pedido`

---

### `GET /orders` — Listar pedidos (paginado) 🔒 JWT

**Query params (todos opcionais)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `page` | number | inteiro ≥ 1, default `1` |
| `limit` | number | inteiro entre 1 e 50, default `20` |
| `status` | string | `RECEBIDO` \| `PREPARANDO` \| `SAIU` \| `ENTREGUE` — se omitido, retorna todos os status |

Pedidos ordenados por `createdAt` desc (mais recentes primeiro).

**Sucesso:** `200`

```json
{
  "orders": [ /* array de pedidos, formato completo */ ],
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

> **Como `hasMore` é calculado:** o servidor busca `limit + 1` registros em vez de fazer uma segunda query de `COUNT`. Se vier o registro extra, `hasMore: true` e ele é descartado antes de devolver a página; senão `hasMore: false`. Evita uma query adicional na tabela de pedidos a cada listagem.

**Erros:** `400` validação Zod (`page`/`limit`/`status` inválidos) · `500` `Falha ao listar pedidos`

---

### `GET /order/:id` — Detalhar pedido 🔒 JWT

**Sucesso:** `200` — pedido completo.

**Erros:** `404` `Pedido não encontrado` · `500` `Falha ao buscar pedido`

---

### `PATCH /order/:id/status` — Atualizar status 🔒 JWT

**Body:** `{ "status": "RECEBIDO" | "PREPARANDO" | "SAIU" | "ENTREGUE" }`

**Sucesso:** `200` — pedido completo atualizado.

**⚙️ Efeito colateral — baixa de estoque:** ao mover o pedido para **`PREPARANDO`** pela primeira vez, para cada item (e também para cada produto dentro dos `combos` do pedido) o `stock` do produto é decrementado pela `quantity`. Comportamento:
- Baixa **única por pedido** (flag `stockDeducted`): repetir `PREPARANDO`, ou fazer `PREPARANDO → RECEBIDO → PREPARANDO`, **não** baixa de novo.
- Produtos usados dentro de combos entram na mesma baixa (somados junto com os `items` normais, se o mesmo produto aparecer nos dois).
- Produto cujo estoque zera é marcado `available: false`.
- Toda a operação é **transacional**: se qualquer produto não tiver estoque suficiente, nada é alterado.

**Erros:** `404` `Pedido não encontrado` · `422` `Estoque insuficiente para o produto {nome}` · `500` `Falha ao atualizar status do pedido`

---

### `PATCH /order/:id/mark-printed` — Marcar pedido como impresso 🔒 JWT

Marca `autoPrinted: true` no pedido. Existe pra suportar a impressão automática via QZ Tray no frontend: a cada polling, o frontend só imprime pedidos com `autoPrinted: false` e chama essa rota depois de imprimir, evitando reimprimir o mesmo pedido.

**Body:** vazio.

**Sucesso:** `200` — pedido completo, com `autoPrinted: true`.

**Erros:** `404` `Pedido não encontrado` · `500` `Falha ao marcar pedido como impresso`

---

### `DELETE /order/:id` — Cancelar/excluir pedido 🔒 JWT

**Sucesso:** `200` — pedido excluído (último estado, com itens).

**Erros:** `500` `Falha ao cancelar pedido`

---

## Resumo das rotas

| Método | Rota | Auth |
|--------|------|------|
| POST | `/users` | 🔒 JWT |
| POST | `/session` | — |
| GET | `/me` | 🔒 JWT |
| POST | `/category` | 🔒 JWT |
| GET | `/category` | — |
| GET | `/category/:id/products` | — |
| PUT | `/category/:id` | 🔒 JWT |
| DELETE | `/category/:id` | 🔒 JWT |
| POST | `/product` | 🔒 JWT (multipart) |
| PUT | `/product/:id` | 🔒 JWT (multipart) |
| PATCH | `/product/:id/disable` | 🔒 JWT |
| PATCH | `/product/:id/enable` | 🔒 JWT |
| GET | `/product` | — |
| DELETE | `/product/:id` | 🔒 JWT |
| POST | `/combo` | 🔒 JWT (multipart) |
| PUT | `/combo/:id` | 🔒 JWT (multipart) |
| GET | `/combo` | 🔒 JWT |
| GET | `/combo/:id` | 🔒 JWT |
| PATCH | `/combo/:id/disable` | 🔒 JWT |
| PATCH | `/combo/:id/enable` | 🔒 JWT |
| DELETE | `/combo/:id` | 🔒 JWT |
| GET | `/combos` | — |
| GET | `/settings` | — |
| PATCH | `/settings/store-status` | 🔒 JWT |
| PATCH | `/settings/min-order-value` | 🔒 JWT |
| POST | `/order` | — |
| POST | `/order-item` | 🔒 JWT |
| DELETE | `/order-item/:id` | 🔒 JWT |
| GET | `/orders` | 🔒 JWT |
| GET | `/order/:id` | 🔒 JWT |
| PATCH | `/order/:id/status` | 🔒 JWT |
| PATCH | `/order/:id/mark-printed` | 🔒 JWT |
| DELETE | `/order/:id` | 🔒 JWT |

---

## Melhorias internas (não afetam o contrato)

Refatorações que melhoraram a qualidade do backend, sem mudar request/response:

- **Classe `AppError`** (`src/errors/AppError.ts`) — erros com `statusCode`, tratados no handler global do `server.ts`.
- **Bug corrigido no `DetailUserService`** — o `catch` antigo mascarava erros reais de banco como "usuário não encontrado".
- **Anti-padrão de re-throw por string eliminado** — services agora identificam erros por `instanceof AppError`, não por comparação de mensagem.
- **Selects centralizados** (`src/prisma/selects.ts`) — `productSelect`, `orderItemSelect`, `orderSelect`, `comboSelect`, `publicComboSelect`, `orderComboSelect` reutilizados, eliminando duplicação em services.
- **`CreateOrderService` passou a usar o `orderSelect` centralizado** em vez de um select inline duplicado.
- **Código morto removido** — verificações `Array.isArray(id)` desnecessárias saíram de 9 controllers.
- **Upload reordenado** — no `PUT /product/:id`, o id é validado antes do arquivo ser carregado em memória.
