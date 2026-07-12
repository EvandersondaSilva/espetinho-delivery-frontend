# Frontend — Espetinho do Nilson (Delivery)

Documentação do que já foi implementado no frontend (Next.js 16 / React 19 / TypeScript / Tailwind v4). Serve como registro do estado atual do projeto.

## Stack

- **Next.js 16** (App Router, React Compiler habilitado via `babel-plugin-react-compiler`)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + `tw-animate-css`
- **shadcn/ui** sobre **Radix UI** / `@base-ui/react` (Button, Card, Dialog, Sheet, Select, Table, Input, Label, Textarea, Badge, Separator)
- `sonner` para toasts
- `js-cookie` para leitura/escrita de cookies no client
- `lucide-react` / `react-icons` para ícones
- `next-themes` (suporte a tema, ainda não explorado a fundo)
- Deploy: Vercel (frontend) e Railway (backend)

## Estrutura de pastas (`src/`)

- `app/` — rotas (App Router), divididas em route groups:
  - `(with-header)/` — páginas com header/footer do site (home, área admin)
  - `(no-header)/` — páginas sem header (login)
  - `api/` — route handlers internos do Next (proxy de login/logout/me, upload de imagem de produto)
  - `midlleware.ts` — middleware de proteção de rotas `/admin/*`
- `actions/` — Server Actions (`"use server"`): auth, categories, orders, products
- `services/` — chamadas à API do backend (fetch client-side/server-side), tipadas
- `components/` — componentes de UI organizados por domínio (`cartContent/`, `dashboard/`, `product/`, `homeCards/`, `header/`, `ui/`)
- `context/` — `cartContext.tsx` (Context API do carrinho)
- `hooks/` — `useAuth`, `useCheckout`, `useCheckoutForm`, `useBackNavigation`
- `lib/` — `api.ts` (client HTTP), `types.ts`, `constants.ts`, `currency.ts`, `MessageWhats.ts`, `getToken.ts`, `toast.ts`, `utils.ts`
- `assets/` — imagens (logo, logo de login)

## Rotas / páginas

| Rota | Grupo | Descrição |
|------|-------|-----------|
| `/` | `(with-header)` | Home / cardápio público — lista categorias com seus produtos disponíveis |
| `/admin/login` | `(no-header)` | Login administrativo |
| `/admin/dashboard` | `(with-header)` | Painel inicial do admin, com cards de navegação (Produtos, Categorias, Pedidos) |
| `/admin/dashboard/products` | `(with-header)` | CRUD de produtos |
| `/admin/dashboard/categories` | `(with-header)` | CRUD de categorias |
| `/admin/dashboard/pedidos` | `(with-header)` | Listagem e gestão de pedidos (status `RECEBIDO`/`PREPARANDO`/`SAIU`) |

### Route handlers internos (`app/api/`)
- `POST /api/login` — recebe credenciais do form, chama `/session` no backend e grava `authToken` em cookie httpOnly
- `POST /api/logout` — limpa cookie de autenticação
- `GET /api/me` — proxy para dados do usuário logado
- `app/api/product/[id]/route.ts` — provavelmente relacionado a upload/edição de imagem de produto

## Autenticação e proteção de rotas

- **Middleware** (`src/app/midlleware.ts`): intercepta qualquer rota `/admin/*`.
  - Se acessar `/admin/login` já com cookie `authToken` → redireciona para `/admin/dashboard`.
  - Se acessar rota admin (exceto login) sem `authToken` → redireciona para `/admin/login`.
- **Fluxo de login**: form em `/admin/login` → `POST /api/login` (route handler Next) → backend `/session` → token salvo em cookie `authToken`.
- **Hook `useAuth`** (`src/hooks/useAuth.ts`): expõe `user`, `token`, `loading`, `logout`, `isAuthenticated`; usado para proteger componentes client-side e mostrar dados do usuário.
- **Logout automático ao voltar para o login**: `useBackNavigation` + Server Action `handleAutoLogout` (`src/actions/auth.ts`) — se o usuário autenticado navegar de volta para `/admin/login` ou clicar em "Voltar", o sistema desloga automaticamente (chama `/api/logout` e limpa o estado local).
- Leitura de token no servidor via `getToken()` (`src/lib/getToken.ts`, usa `cookies()` do Next) para Server Components fazerem chamadas autenticadas ao backend (ex.: páginas de produtos/categorias/pedidos do admin).

## Carrinho de compras

- **Context API** (`src/context/cartContext.tsx`): `CartProvider` + hook `useCart()`.
  - Estado: lista de itens (`{ product, quantity, notes }`), com suporte a observações por item.
  - Ações: `addItem`, `decreaseItem`, `removeItem`, `clearCart`.
  - Derivados memoizados: `total` (em centavos) e `itemsCount`.
  - **Persistência em `localStorage`** (chave `cart`), com hidratação segura (evita mismatch de SSR).
- **UI do carrinho** (`components/cartContent/`):
  - `cartSheet.tsx` — drawer/sheet lateral do carrinho
  - `CartTriggerBadge.tsx` — ícone/badge com contagem de itens no header
  - `cartContent.tsx`, `CartItemsList.tsx`, `CartItemRow.tsx` — listagem e edição de itens
  - `CartTotal.tsx` — total formatado
  - `CartCheckoutForm.tsx` — formulário de checkout (nome, telefone, forma de pagamento, tipo de entrega — delivery/retirada, endereço: rua, bairro, complemento)

## Checkout e integração com WhatsApp

- **`useCheckout`** (`src/hooks/useCheckout.ts`): orquestra o fluxo de finalização do pedido.
  - Valida carrinho não vazio e campos obrigatórios (nome, telefone, rua, bairro).
  - Cria o pedido via `createOrder` (`services/order.ts`) → `POST /order` no backend.
  - Gera mensagem formatada para WhatsApp (`generateWhatsAppMessage`, em `lib/MessageWhats.ts`) com itens, observações, endereço, forma de pagamento/entrega e total.
  - Abre `https://wa.me/558586282445?text=...` em nova aba com a mensagem pronta.
  - Limpa o carrinho e dispara callback `onSuccess` após concluir.
- **`useCheckoutForm`**: gerencia estado dos campos do formulário de checkout (separa lógica de apresentação).
- **Formas de pagamento** (`lib/constants.ts`): Dinheiro, Débito, Crédito, PIX.
- **Tipos de entrega**: Delivery, Retirada no balcão.
- **`lib/currency.ts`**: formatação de valores em centavos para BRL (`formatBRLFromCents`).

## Painel administrativo

- **Dashboard** (`/admin/dashboard`): saudação ao usuário logado, botão de logout, atalhos para Produtos/Categorias/Pedidos.
- **Produtos** (`/admin/dashboard/products`):
  - Lista produtos (via `apiClient` autenticado, Server Component)
  - `ProductForm` — criação de produto (multipart, com upload de imagem — `productImageUpload.tsx`)
  - `ProductCard` — exibição/ações (editar, ativar/desativar, excluir)
  - `edit-product-form.tsx` / `EditProductFormFields.tsx` — edição de produto existente
- **Categorias** (`/admin/dashboard/categories`):
  - `CategoryForm` — criação
  - `CategoryCard` — exibição/ações
  - `edit-category-form.tsx` — edição
- **Pedidos** (`/admin/dashboard/pedidos`):
  - Componente `Orders` (client): busca `/orders` (JWT), filtra apenas pedidos com status `RECEBIDO`, `PREPARANDO` ou `SAIU` (esconde `ENTREGUE`)
  - Cards por pedido: número, status (badge), preview dos 2 primeiros itens, total calculado a partir dos itens, botão "Detalhes"
  - Botão de atualizar (refetch manual)
  - `OrderModal` — modal de detalhes do pedido, presumivelmente com opção de atualizar status (`RECEBIDO → PREPARANDO → SAIU → ENTREGUE`)

## Camada de serviços / integração com API

- **`lib/api.ts`** — `apiClient<T>()`: wrapper de `fetch` genérico.
  - Usa `NEXT_PUBLIC_API_URL` como base.
  - Suporta `token` (injeta `Authorization: Bearer`), `FormData` (não força `Content-Type` nesse caso) e opções de cache/revalidate do Next.
  - Lança erro com a mensagem vinda do backend em respostas não-OK.
- **`services/`** — funções tipadas por entidade, todas usando `apiClient`:
  - `catetory.ts` — `getAllCategories`, CRUD de categorias
  - `product.ts` — `getproductsByCategoryId`, CRUD de produtos (incluindo enable/disable)
  - `order.ts` — `createOrder`, listagem/detalhe/atualização de status/exclusão de pedidos
- **`endpoints.md`** documenta o contrato completo da API backend (Users/Session, Category, Product, Order) — preços em centavos, datas ISO 8601, IDs UUID, erros padronizados (Zod 400, token 401, etc).

## Tipos principais (`lib/types.ts`)

- `AuthResponse`, `User`, `UseAuthReturn`
- `Category`, `Product`
- `OrderStatus` (enum: `RECEBIDO | PREPARANDO | SAIU | ENTREGUE`)
- `OrderItem`, `OrderItemProduct`, `Order`

## Funcionalidades do cliente (loja)

- Visualização do cardápio público, agrupado por categoria, mostrando apenas produtos disponíveis (`available: true`)
- `ProductCard` / `ProductDialog` (`components/homeCards/`) — exibição de produto e modal de detalhes (com opção de adicionar ao carrinho, possivelmente com observações)
- Header do site com contador do carrinho (`CartTriggerBadge`) e footer (`components/header/`)
- Adição de produtos ao carrinho com quantidade e observações, ajuste de quantidade, remoção
- Finalização do pedido com envio automático para WhatsApp da loja

## Observações de configuração

- Variável de ambiente obrigatória: `NEXT_PUBLIC_API_URL` (URL do backend Express)
- Cookie de sessão: `authToken` (usado tanto pelo middleware quanto pelas Server Actions/Server Components)
- Número de WhatsApp da loja fixo no código: `558586282445` (em `useCheckout.ts`)
- `AGENTS.md` alerta que esta versão do Next.js pode ter diferenças de API em relação ao conhecimento padrão — consultar `node_modules/next/dist/docs/` antes de mudanças na camada de framework

## Documentos relacionados já existentes no repo

- [README.md](README.md) — visão geral do projeto, stack e como rodar
- [ADMIN_SETUP.md](ADMIN_SETUP.md) — detalhes do sistema de autenticação admin (parcialmente superado pela migração de `localStorage` para cookies + middleware)
- [endpoints.md](endpoints.md) — contrato completo da API backend
