# API — Endpoints

Servidor Express sem prefixo de rota global. Porta padrão: `3333` (variável `PORT` no `.env`).

**Base URL (exemplo):** `http://localhost:3333`

**Content-Type**

- Rotas JSON: `Content-Type: application/json`
- Criar/editar produto: `multipart/form-data` com campo de arquivo `file` e demais campos no form

**Autenticação**

- Rotas marcadas como **JWT** exigem header: `Authorization: Bearer <token>`
- O token é emitido em `POST /session`

**Erros comuns**

| Situação | Status | Corpo (exemplo) |
|----------|--------|------------------|
| Validação Zod | 400 | `{ "error": "Erro validação", "details": [ { "campo": "body.email", "mensagem": "..." } ] }` |
| Erro de negócio / `throw new Error` | 400 | `{ "error": "<mensagem>" }` |
| Token ausente | 401 | `{ "error": "token não fornecido" }` |
| Token inválido | 401 | `{ "error": "Token inválido" }` |
| Erro não tratado no handler global | 500 | `{ "error": "Internal server error!" }` |

**Convenções de dados**

- `price` em produtos e itens de pedido: **centavos** (inteiro), ex.: `1000` = R$ 10,00
- Datas: ISO 8601 (`createdAt`, `updatedAt`)
- IDs: UUID (string)

---

## Usuários e sessão

### `POST /users` — Criar usuário (JWT)

**Autenticação:** JWT obrigatório.

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `name` | string | mínimo 3 caracteres |
| `email` | string | e-mail válido |
| `password` | string | mínimo 6 caracteres |

**Resposta sucesso:** `200` (padrão Express) — objeto usuário (sem senha).

**Propriedades da resposta**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | UUID |
| `name` | string | |
| `email` | string | |
| `role` | string | `"ADMIN"` (enum no banco) |
| `createdAt` | string | data ISO |

**Exemplo de requisição**

```http
POST /users HTTP/1.1
Host: localhost:3333
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Maria Admin",
  "email": "maria@example.com",
  "password": "secret12"
}
```

**Exemplo de resposta**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Maria Admin",
  "email": "maria@example.com",
  "role": "ADMIN",
  "createdAt": "2026-04-03T12:00:00.000Z"
}
```

**Erros típicos:** `Usuario já existente` (e-mail duplicado).

---

### `POST /session` — Login

**Autenticação:** não.

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `email` | string | e-mail válido |
| `password` | string | obrigatório (mínimo 1 caractere) |

**Resposta sucesso:** `200`.

**Propriedades da resposta**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | UUID do usuário |
| `name` | string | |
| `role` | string | `ADMIN` |
| `token` | string | JWT (expira em 30 dias) |

**Exemplo de requisição**

```json
{
  "email": "maria@example.com",
  "password": "secret12"
}
```

**Exemplo de resposta**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Maria Admin",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros típicos:** `Email/Senha é obrigatório` (usuário inexistente ou senha incorreta).

---

### `GET /me` — Detalhes do usuário logado (JWT)

**Autenticação:** JWT obrigatório.

**Resposta sucesso:** `200`.

**Propriedades da resposta**

| Propriedade | Tipo |
|-------------|------|
| `id` | string |
| `name` | string |
| `email` | string |
| `role` | string |
| `createdAt` | string (ISO) |

**Exemplo de requisição**

```http
GET /me HTTP/1.1
Host: localhost:3333
Authorization: Bearer <token>
```

**Exemplo de resposta**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Maria Admin",
  "email": "maria@example.com",
  "role": "ADMIN",
  "createdAt": "2026-04-03T12:00:00.000Z"
}
```

**Erros típicos:** `Usuário não encontrado`.

---

## Categorias

### `POST /category` — Criar categoria (JWT)

**Autenticação:** JWT obrigatório.

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `name` | string | texto, mínimo **2** caracteres (schema Zod) |

**Resposta sucesso:** `201`.

**Propriedades da resposta (categoria)**

| Propriedade | Tipo |
|-------------|------|
| `id` | string |
| `name` | string |
| `createdAt` | string (ISO) |
| `updatedAt` | string (ISO) |

**Exemplo**

```json
{
  "name": "Espetinhos"
}
```

```json
{
  "id": "cat-uuid-here",
  "name": "Espetinhos",
  "createdAt": "2026-04-03T12:00:00.000Z",
  "updatedAt": "2026-04-03T12:00:00.000Z"
}
```

---

### `GET /category` — Listar categorias

**Autenticação:** não.

**Resposta sucesso:** `200` — array de categorias (mesma forma do objeto acima).

**Exemplo de resposta**

```json
[
  {
    "id": "cat-uuid-1",
    "name": "Espetinhos",
    "createdAt": "2026-04-03T10:00:00.000Z",
    "updatedAt": "2026-04-03T10:00:00.000Z"
  }
]
```

---

### `GET /category/:id/products` — Listar produtos por categoria

**Autenticação:** não.

**Parâmetros de rota**

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | string | UUID da categoria, não vazio |

**Resposta sucesso:** `200` — array de produtos.

**Propriedades de cada item**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | |
| `name` | string | |
| `price` | number | centavos |
| `description` | string \| null | |
| `imageUrl` | string \| null | URL (ex.: Cloudinary) |
| `available` | boolean | |
| `categoryId` | string | |
| `createdAt` | string (ISO) | |

**Exemplo**

```http
GET /category/550e8400-e29b-41d4-a716-446655440000/products HTTP/1.1
Host: localhost:3333
```

**Erros típicos:** `Category does not exist`.

---

### `PUT /category/:id` — Atualizar categoria (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros de rota**

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | string | não vazio |

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `name` | string | mínimo **3** caracteres |

**Resposta sucesso:** `200` — objeto categoria atualizado.

**Exemplo**

```http
PUT /category/cat-uuid HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Carnes e espetos" }
```

---

### `DELETE /category/:id` — Excluir categoria (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros de rota**

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | string | não vazio |

**Resposta sucesso:** `200` — registro da categoria removida (formato Prisma `delete`).

---

## Produtos

### `POST /product` — Criar produto (JWT + upload)

**Autenticação:** JWT obrigatório.

**Formato:** `multipart/form-data`.

**Campos do form**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `file` | arquivo | **sim** | Imagem (buffer processado pelo Multer) |
| `name` | string | sim | |
| `price` | string | sim | Enviado como string; o servidor faz `parseInt` → valor em **centavos** |
| `description` | string | sim | |
| `categoryId` | string | sim | UUID da categoria |

**Resposta sucesso:** `200` — produto criado.

**Propriedades da resposta**

| Propriedade | Tipo |
|-------------|------|
| `id` | string |
| `name` | string |
| `price` | number |
| `description` | string \| null |
| `imageUrl` | string \| null |
| `categoryId` | string |
| `createdAt` | string (ISO) |

**Exemplo (curl)**

```bash
curl -X POST http://localhost:3333/product \
  -H "Authorization: Bearer <token>" \
  -F "file=@./foto.jpg" \
  -F "name=Espeto de carne" \
  -F "price=1500" \
  -F "description=500g" \
  -F "categoryId=<uuid-categoria>"
```

**Erros típicos:** `400` `{ "error": "Image is required" }`; `Category does not exist`; `Error uploading image`.

---

### `PUT /product/:id` — Atualizar produto (JWT + upload opcional)

**Autenticação:** JWT obrigatório.

**Parâmetros de rota**

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | string | não vazio |

**Formato:** `multipart/form-data` (pode omitir `file` para manter imagem atual).

**Campos do form (mesmos nomes do POST)**

| Campo | Obrigatório |
|-------|-------------|
| `name`, `price`, `description`, `categoryId` | sim (validação Zod) |
| `file` | não — se enviado, substitui `imageUrl` |

**Resposta sucesso:** `200` — produto atualizado.

**Propriedades da resposta**

| Propriedade | Tipo |
|-------------|------|
| `id` | string |
| `name` | string |
| `price` | number |
| `description` | string \| null |
| `imageUrl` | string \| null |
| `available` | boolean |
| `categoryId` | string |
| `createdAt` | string (ISO) |

**Erros típicos:** `Product does not exist`; `Category does not exist`.

---

### `PATCH /product/:id/disable` — Desabilitar produto (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros:** `id` (string, não vazio).

**Body:** vazio.

**Resposta sucesso:** `200` — produto com `available: false` (mesmo conjunto de campos do `PUT` na resposta).

---

### `PATCH /product/:id/enable` — Habilitar produto (JWT)

Igual ao disable, com `available: true`.

---

### `GET /product` — Listar produtos

**Autenticação:** não.

**Resposta sucesso:** `200` — array.

**Propriedades de cada item** (sem `available` nesta listagem)

| Propriedade | Tipo |
|-------------|------|
| `id` | string |
| `name` | string |
| `price` | number |
| `description` | string \| null |
| `imageUrl` | string \| null |
| `categoryId` | string |
| `createdAt` | string (ISO) |

**Nota:** A listagem geral **não** inclui `available`; já `GET /category/:id/products` inclui.

---

### `DELETE /product/:id` — Excluir produto (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros:** `id` (string, não vazio).

**Resposta sucesso:** `200` — produto excluído (select sem `available`).

**Propriedades:** `id`, `name`, `price`, `description`, `imageUrl`, `categoryId`, `createdAt`.

---

## Pedidos

Enum de status (corpo e resposta): `RECEBIDO` | `PREPARANDO` | `SAIU` | `ENTREGUE`.

**Objeto pedido “completo”** (listagem, detalhe, criar, atualizar status, adicionar/remover item, cancelar) segue o mesmo padrão de campos quando o service retorna o pedido com itens:

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
| `price` | number | preço unitário snapshot (centavos) |
| `product` | object | `{ "id", "name", "imageUrl" }` |

---

### `POST /order` — Criar pedido

**Autenticação:** não.

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `customerName` | string | não vazio |
| `phone` | string | não vazio |
| `address` | string | não vazio |
| `deliveryFee` | number | inteiro ≥ 0, **opcional** (padrão no service: `0`) |
| `items` | array | mínimo 1 item |

**Cada elemento de `items`**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `productId` | string | não vazio |
| `quantity` | number | inteiro ≥ 1 |

**Resposta sucesso:** `201` — pedido criado (com `items` e `product` aninhado).

**Exemplo de requisição**

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

**Erros típicos:** `Um ou mais produtos nao existem`; `Pedido contem produto indisponivel`; `Falha ao criar pedido`.

---

### `POST /order-item` — Adicionar item ao pedido

**Autenticação:** não.

**Body (JSON)**

| Propriedade | Tipo | Regras |
|-------------|------|--------|
| `orderId` | string | não vazio |
| `productId` | string | não vazio |
| `quantity` | number | inteiro ≥ 1 |

**Comportamento:** se já existir item com o mesmo `productId` no pedido, a quantidade é **somada**.

**Resposta sucesso:** `201` — pedido atualizado (formato “pedido completo” acima).

**Erros típicos:** `Pedido nao encontrado`; `Produto nao existe`; `Produto indisponivel`; `Falha ao adicionar item ao pedido`.

**Exemplo**

```json
{
  "orderId": "order-uuid",
  "productId": "prod-uuid",
  "quantity": 3
}
```

---

### `DELETE /order-item/:id` — Remover item do pedido

**Autenticação:** não.

**Parâmetros de rota**

| Parâmetro | Tipo | Regras |
|-----------|------|--------|
| `id` | string | id do **OrderItem**, não vazio |

**Resposta sucesso:** `200` — pedido após recalcular `total`.

**Erros típicos:** `Item do pedido nao encontrado`; `Pedido nao encontrado`; `Falha ao remover item do pedido`.

---

### `GET /orders` — Listar todos os pedidos (JWT)

**Autenticação:** JWT obrigatório.

**Resposta sucesso:** `200` — array de pedidos (ordenado por `createdAt` desc), cada um no formato “pedido completo”.

**Erro típico:** `Falha ao listar pedidos`.

---

### `GET /order/:id` — Detalhar pedido (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros:** `id` — UUID do pedido.

**Resposta sucesso:** `200` — um pedido (formato completo).

**Erros típicos:** `Pedido nao encontrado`; `Falha ao buscar pedido`.

---

### `PATCH /order/:id/status` — Atualizar status (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros:** `id` — UUID do pedido.

**Body (JSON)**

| Propriedade | Tipo | Valores |
|-------------|------|---------|
| `status` | string | `RECEBIDO`, `PREPARANDO`, `SAIU`, `ENTREGUE` |

**Resposta sucesso:** `200` — pedido atualizado (com itens).

**Exemplo**

```json
{
  "status": "PREPARANDO"
}
```

**Erros típicos:** `Pedido nao encontrado`; `Falha ao atualizar status do pedido`.

---

### `DELETE /order/:id` — Cancelar / excluir pedido (JWT)

**Autenticação:** JWT obrigatório.

**Parâmetros:** `id` — UUID do pedido.

**Resposta sucesso:** `200` — pedido excluído (último estado, com itens).

**Erro típico:** `Falha ao cancelar pedido`.

---

## Resumo das rotas

| Método | Rota | Auth |
|--------|------|------|
| POST | `/users` | JWT |
| POST | `/session` | — |
| GET | `/me` | JWT |
| POST | `/category` | JWT |
| GET | `/category` | — |
| GET | `/category/:id/products` | — |
| PUT | `/category/:id` | JWT |
| DELETE | `/category/:id` | JWT |
| POST | `/product` | JWT (multipart) |
| PUT | `/product/:id` | JWT (multipart) |
| PATCH | `/product/:id/disable` | JWT |
| PATCH | `/product/:id/enable` | JWT |
| GET | `/product` | — |
| DELETE | `/product/:id` | JWT |
| POST | `/order` | — |
| POST | `/order-item` | — |
| DELETE | `/order-item/:id` | — |
| GET | `/orders` | JWT |
| GET | `/order/:id` | JWT |
| PATCH | `/order/:id/status` | JWT |
| DELETE | `/order/:id` | JWT |
