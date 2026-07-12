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

**Objeto categoria:** `{ id, name, createdAt }`

### `POST /category` — Criar categoria 🔒 JWT

**Body:** `{ "name": string (mín. 3 caracteres) }`

**Sucesso:** `201` — objeto categoria

**Erros:** `400` validação · `500` `Falha ao criar categoria`

---

### `GET /category` — Listar categorias

Público. **Sucesso:** `200` — array de categorias (ordenado por `createdAt` desc).

---

### `GET /category/:id/products` — Listar produtos de uma categoria

Público.

**Sucesso:** `200` — array de produtos (formato produto completo abaixo).

**Erros:** `404` `Categoria não encontrada` · `500` `Falha ao listar produtos por categoria`

---

### `PUT /category/:id` — Atualizar categoria 🔒 JWT

**Body:** `{ "name": string (mín. 3 caracteres) }`

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

**Campos:** iguais ao POST. `file` opcional — se enviado, substitui a imagem. Campo extra opcional `removeImage="true"` remove a imagem atual.

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
| `createdAt` | string (ISO) | |
| `items` | array | ver abaixo |

**Item do pedido (`items[]`)**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | id do `OrderItem` |
| `productId` | string | |
| `quantity` | number | |
| `price` | number | preço unitário congelado no momento da compra (centavos) |
| `product` | object | `{ id, name, imageUrl }` |

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
| `items` | array | mínimo 1 item |

Cada item: `{ productId: string, quantity: number (inteiro ≥ 1) }`

**Sucesso:** `201` — pedido completo. O `total` é calculado no servidor (soma dos itens + `deliveryFee`).

**Erros:** `404` `Um ou mais produtos não existem` · `422` `Pedido contém produto indisponível` · `500` `Falha ao criar pedido`

```json
{
  "customerName": "João",
  "phone": "11999990000",
  "address": "Rua A, 100",
  "deliveryFee": 500,
  "items": [
    { "productId": "prod-uuid-1", "quantity": 2 },
    { "productId": "prod-uuid-2", "quantity": 1 }
  ]
}
```

---

### `POST /order-item` — Adicionar item ao pedido 🔒 JWT

> **Mudança:** agora exige autenticação.

**Body (JSON):** `{ orderId: string, productId: string, quantity: number (≥ 1) }`

**Comportamento:** se já existir item com o mesmo `productId`, a quantidade é **somada**. O `total` do pedido é recalculado.

**Sucesso:** `201` — pedido completo atualizado.

**Erros:** `404` `Pedido não encontrado` · `404` `Produto não encontrado` · `422` `Produto indisponível` · `500` `Falha ao adicionar item ao pedido`

---

### `DELETE /order-item/:id` — Remover item do pedido 🔒 JWT

> **Mudança:** agora exige autenticação.

**Parâmetro:** `id` — id do **OrderItem**.

**Sucesso:** `200` — pedido completo após recalcular `total`.

**Erros:** `404` `Item do pedido não encontrado` · `404` `Pedido não encontrado` · `500` `Falha ao remover item do pedido`

---

### `GET /orders` — Listar todos os pedidos 🔒 JWT

**Sucesso:** `200` — array de pedidos (ordenado por `createdAt` desc).

**Erros:** `500` `Falha ao listar pedidos`

---

### `GET /order/:id` — Detalhar pedido 🔒 JWT

**Sucesso:** `200` — pedido completo.

**Erros:** `404` `Pedido não encontrado` · `500` `Falha ao buscar pedido`

---

### `PATCH /order/:id/status` — Atualizar status 🔒 JWT

**Body:** `{ "status": "RECEBIDO" | "PREPARANDO" | "SAIU" | "ENTREGUE" }`

**Sucesso:** `200` — pedido completo atualizado.

**Erros:** `404` `Pedido não encontrado` · `500` `Falha ao atualizar status do pedido`

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
| POST | `/order` | — |
| POST | `/order-item` | 🔒 JWT |
| DELETE | `/order-item/:id` | 🔒 JWT |
| GET | `/orders` | 🔒 JWT |
| GET | `/order/:id` | 🔒 JWT |
| PATCH | `/order/:id/status` | 🔒 JWT |
| DELETE | `/order/:id` | 🔒 JWT |

---

## Melhorias internas (não afetam o contrato)

Refatorações que melhoraram a qualidade do backend, sem mudar request/response:

- **Classe `AppError`** (`src/errors/AppError.ts`) — erros com `statusCode`, tratados no handler global do `server.ts`.
- **Bug corrigido no `DetailUserService`** — o `catch` antigo mascarava erros reais de banco como "usuário não encontrado".
- **Anti-padrão de re-throw por string eliminado** — services agora identificam erros por `instanceof AppError`, não por comparação de mensagem.
- **Selects centralizados** (`src/prisma/selects.ts`) — `productSelect`, `orderItemSelect` e `orderSelect` reutilizados, eliminando duplicação em ~11 services.
- **Código morto removido** — verificações `Array.isArray(id)` desnecessárias saíram de 9 controllers.
- **Upload reordenado** — no `PUT /product/:id`, o id é validado antes do arquivo ser carregado em memória.
