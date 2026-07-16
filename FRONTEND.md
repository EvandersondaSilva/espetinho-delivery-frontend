# Frontend — Espetinho do Nilson (Delivery)

Documentação do que já foi implementado no frontend (Next.js 16 / React 19 / TypeScript / Tailwind v4). Serve como registro do estado atual do projeto.

## Stack

- **Next.js 16** (App Router, React Compiler habilitado via `babel-plugin-react-compiler`)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + `tw-animate-css`
- **shadcn/ui** sobre **Radix UI** / `@base-ui/react` (Button, Card, Dialog, Sheet, Select, Table, Input, Label, Textarea, Badge, Separator, Skeleton)
- `sonner` para toasts
- `js-cookie` para leitura/escrita de cookies no client
- `lucide-react` / `react-icons` para ícones
- `next-themes` (suporte a tema, ainda não explorado a fundo)
- Deploy: Vercel (frontend) e Railway (backend)

## Estrutura de pastas (`src/`)

- `app/` — rotas (App Router), divididas em route groups:
  - `(with-header)/` — páginas com header/footer do site (home, área admin)
  - `(no-header)/` — páginas sem header (login)
  - `api/` — route handlers internos do Next (proxy de login/logout/me)
  - `midlleware.ts` — middleware de proteção de rotas `/admin/*`
- `actions/` — Server Actions (`"use server"`): categories, orders, products (não há mais `actions/auth.ts` — o logout automático virou uma chamada direta a `useAuth().logout()`)
- `services/` — chamadas à API do backend (fetch client-side/server-side), tipadas
- `components/` — componentes de UI organizados por domínio (`cartContent/`, `dashboard/`, `product/`, `homeCards/`, `header/`, `ui/`)
- `context/` — `cartContext.tsx` (Context API do carrinho)
- `hooks/` — `useAuth`, `useCheckout`, `useCheckoutForm`, `useBackNavigation`, `useCategories`, `useImageUpload`, `usePixReceiptUpload`
- `lib/` — `api.ts` (client HTTP), `types.ts`, `constants.ts`, `currency.ts`, `MessageWhats.ts`, `getToken.ts`, `toast.ts`, `utils.ts`, `cloudinary.ts`
- `assets/` — imagens (logo, logo de login)

## Rotas / páginas

| Rota | Grupo | Descrição |
|------|-------|-----------|
| `/` | `(with-header)` | Home / cardápio público — busca de produtos, categorias com skeleton loading |
| `/admin/login` | `(no-header)` | Login administrativo |
| `/admin/dashboard` | `(with-header)` | Painel inicial do admin, com cards de navegação (Produtos, Categorias, Pedidos) |
| `/admin/dashboard/products` | `(with-header)` | CRUD de produtos (com controle de estoque) |
| `/admin/dashboard/categories` | `(with-header)` | CRUD de categorias |
| `/admin/dashboard/pedidos` | `(with-header)` | Listagem e gestão de pedidos, com filtro por status |

### Route handlers internos (`app/api/`)
- `POST /api/login` — recebe credenciais do form, chama `/session` no backend e grava `authToken` em cookie httpOnly
- `POST /api/logout` — limpa cookie de autenticação
- `GET /api/me` — proxy para dados do usuário logado

> A rota `app/api/product/[id]/route.ts` (proxy de atualização de produto) foi **removida** — a edição de produto passou a usar diretamente a Server Action `updateProductAction`, eliminando um salto de rede desnecessário (fetch → rota interna → fetch no backend).

## Autenticação e proteção de rotas

- **Middleware** (`src/app/midlleware.ts`): intercepta qualquer rota `/admin/*`.
  - Se acessar `/admin/login` já com cookie `authToken` → redireciona para `/admin/dashboard`.
  - Se acessar rota admin (exceto login) sem `authToken` → redireciona para `/admin/login`.
- **Fluxo de login**: form em `/admin/login` → `POST /api/login` (route handler Next) → backend `/session` → token salvo em cookie `authToken` (httpOnly).
- **Hook `useAuth`** (`src/hooks/useAuth.ts`): expõe `user`, `token` (sempre `null` — o token não é acessível no client, só via cookie httpOnly lido no servidor), `loading`, `logout`, `isAuthenticated`.
- **Logout automático ao voltar para o login**: `useBackNavigation` + `useAuth().logout()` — se o usuário autenticado navegar de volta para `/admin/login` ou clicar em "Voltar", desloga automaticamente.
- **`getToken()` centralizado** (`src/lib/getToken.ts`, usa `cookies()` do Next): é a **única** implementação usada por toda a camada de Server Components/Server Actions que precisam do token (`(with-header)/layout.tsx`, todas as `actions/*.ts`, as páginas `products`/`categories`/`pedidos` do admin) — antes essa função estava duplicada em 5 lugares diferentes, incluindo uma cópia em `actions/products.ts` que lia o cookie manualmente com um nome de variável hardcoded.

## Carrinho de compras

- **Context API** (`src/context/cartContext.tsx`): `CartProvider` + hook `useCart()`.
  - Estado: lista de itens (`{ product, quantity, notes }`), com suporte a observações por item.
  - Ações: `addItem`, `decreaseItem`, `removeItem`, `clearCart`.
  - Derivados memoizados: `total` (em centavos) e `itemsCount`.
  - **Persistência em `localStorage`** (chave `cart`), com hidratação segura (evita mismatch de SSR).
- **UI do carrinho** (`components/cartContent/`):
  - `cartSheet.tsx` — drawer/sheet lateral do carrinho (monta `CartContent` de forma lazy, só depois que a animação de abertura começa)
  - `CartTriggerBadge.tsx` — ícone/badge com contagem de itens no header
  - `cartContent.tsx`, `CartItemsList.tsx`, `CartItemRow.tsx` — listagem e edição de itens
  - `CartTotal.tsx` — total formatado
  - `CartCheckoutForm.tsx` — formulário de checkout (nome, telefone, forma de pagamento, tipo de entrega, endereço), com duas seções condicionais:
    - `PixReceiptUpload.tsx` — aparece quando a forma de pagamento é "PIX": mostra a chave PIX (`NEXT_PUBLIC_PIX_KEY`) com botão de copiar, upload do comprovante direto pro Cloudinary (sem passar pelo backend, via `lib/cloudinary.ts` + `hooks/usePixReceiptUpload.ts`), com preview, estado de "enviando" e confirmação visual
    - `CashChangeField.tsx` — aparece quando a forma de pagamento é "Dinheiro": campo "Troco para quanto?" com máscara BRL, e um botão-toggle "Não preciso de troco" que desabilita e limpa o campo
  - `OrderSuccessView.tsx` — tela de confirmação exibida **dentro do mesmo Sheet** após o pedido ser criado com sucesso (ver seção de Checkout)

## Checkout e integração com WhatsApp

- **`useCheckout`** (`src/hooks/useCheckout.ts`): orquestra o fluxo de finalização do pedido.
  - Valida carrinho não vazio e campos obrigatórios (nome, telefone, rua, bairro).
  - Cria o pedido via `createOrder` (`services/order.ts`) → `POST /order` no backend.
  - Gera mensagem formatada para WhatsApp (`generateWhatsAppMessage`, em `lib/MessageWhats.ts`) com itens, observações, endereço, forma de pagamento/entrega, total, e condicionalmente:
    - link do comprovante PIX (`*Comprovante PIX:* {url}`), quando a forma de pagamento é PIX
    - linha de troco (`*Troco para:* R$ X` ou `*Troco:* Sem troco`), quando a forma de pagamento é dinheiro
  - Abre `${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=...` em nova aba com a mensagem pronta (o número da loja **não está mais hardcoded no código** — vem inteiramente da env var, usada também no header e footer do site).
  - Limpa o carrinho e dispara callback `onSuccess(orderId)`.
- **Tela de confirmação de pedido**: ao contrário do comportamento anterior (fechar o carrinho imediatamente), o `Sheet` do carrinho **permanece aberto** e troca seu conteúdo para `OrderSuccessView` — ícone de sucesso, código do pedido (8 primeiros caracteres do id), botão "Acompanhar pelo WhatsApp" (reabre o link da loja) e botão "Voltar ao cardápio" (fecha o Sheet e navega para `/`). O formulário e o estado do comprovante PIX são resetados nesse momento.
- **`useCheckoutForm`**: gerencia estado dos campos do formulário de checkout, incluindo `changeFor`/`noChangeNeeded`. Expõe `setPaymentMethod` (limpa os campos de troco automaticamente ao trocar para uma forma de pagamento diferente de "dinheiro") e `setNoChangeNeeded` (limpa o campo de troco ao marcar a opção).
- **Formas de pagamento** (`lib/constants.ts`): Dinheiro, Débito, Crédito, PIX.
- **Tipos de entrega**: Delivery, Retirada no balcão.
- **`lib/currency.ts`**: `formatBRLFromCents` (centavos → texto BRL), `parseBRLToCents` (texto digitado → centavos) e `maskBRLInput` (máscara de input de dinheiro) — usados tanto no checkout (campo de troco) quanto nos formulários de produto do admin (campo de preço).
- **`lib/cloudinary.ts`**: `uploadToCloudinary()` (upload unsigned direto pro Cloudinary usando `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`/`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) e `validateReceiptFile()` (tipo de imagem + máx. 5MB) — usado só pelo comprovante de PIX.

## Painel administrativo

- **Dashboard** (`/admin/dashboard`): saudação ao usuário logado, atalhos para Produtos/Categorias/Pedidos. O botão de logout é um ícone (`LogOut`) no topo-esquerda, ao lado do título — padrão replicado nas páginas de Produtos/Categorias/Pedidos (ícone de voltar no mesmo lugar).
- **Contador de pedidos pendentes** (`components/dashboard/pendingOrdersBadge.tsx`): sino no header do admin, visível em qualquer página do painel (`siteHeader.tsx` alterna entre esse badge e o carrinho dependendo da rota). Busca `/orders` a cada 30s (`setInterval`), conta pedidos com `status !== "ENTREGUE"` e some quando a contagem é zero. Usa o mesmo token repassado via prop pelo `(with-header)/layout.tsx` (Server Component que lê o cookie e passa pro `SiteHeader`).
- **Produtos** (`/admin/dashboard/products`):
  - Lista produtos (via `apiClient` autenticado, Server Component)
  - `ProductForm` — criação de produto (multipart, com upload de imagem opcional e campo "Estoque inicial")
  - `ProductCard` — exibição/ações (editar, ativar/desativar, excluir) + **badge de estoque** colorido: vermelho "Esgotado" (0), amarelo "Estoque: N" (≤5), verde "Estoque: N" (>5)
  - `edit-product-form.tsx` / `EditProductFormFields.tsx` — edição de produto existente, incluindo campo "Estoque"
- **Categorias** (`/admin/dashboard/categories`):
  - `CategoryForm` — criação
  - `CategoryCard` — exibição/ações
  - `edit-category-form.tsx` — edição
- **Pedidos** (`/admin/dashboard/pedidos`):
  - Componente `Orders` (client): busca **todos** os pedidos via `getOrders(token)` (`services/order.ts`) — antes filtrava e escondia pedidos `ENTREGUE` na própria busca; agora isso é só um filtro visual (ver abaixo)
  - **Filtro por status**: barra de botões "Todos | Recebido | Preparando | Saiu | Entregue", cada um com a contagem entre parênteses (ex. "Recebido (3)"), calculada via `useMemo` sobre os pedidos já carregados — sem nova chamada à API. O filtro ativo fica destacado em vermelho.
  - Cards por pedido: número, status (badge, label traduzido), preview dos 2 primeiros itens, total (`order.total`, vindo direto da API), botão "Detalhes"
  - Botão de atualizar (refetch manual)
  - `OrderModal` — modal de detalhes do pedido, com timeline visual de status e botão para avançar status (`RECEBIDO → PREPARANDO → SAIU → ENTREGUE`) via `updateOrderStatusAction`

## Controle de estoque

- **Tipo**: campo `stock: number` presente em `Product` (`lib/types.ts` e `services/product.ts` — são duas definições de `Product` que já existiam divergentes antes do estoque; o campo foi adicionado nas duas).
- **Cardápio público**: `ProductCard` (`components/homeCards/productCard.tsx`) **não esconde mais** produtos indisponíveis (antes tinha um `if (!product.available) return null`). Quando `!product.available || product.stock <= 0`:
  - O card inteiro fica com opacidade reduzida (`opacity-60`)
  - Aparece um badge vermelho "Esgotado" sobre a imagem
  - Dentro do `ProductDialog`, o botão "Adicionar ao carrinho" e os botões de +/- quantidade ficam desabilitados, com um aviso "Produto esgotado no momento"
  - O clique no card continua abrindo o dialog normalmente (o cliente ainda pode ver nome/descrição/preço)
- **Painel admin**: badge de estoque no card de produto (ver seção Painel administrativo acima).
- **Formulários**: campo numérico "Estoque inicial" (criar) / "Estoque" (editar), `min={0}`, `step={1}`, opcional — se vazio, o backend usa o default `0`. Repassado via `createProductAction`/`prepareUpdateProductFormData` (`services/product.ts`).
- **Fora do frontend**: a baixa automática de estoque ao mover pedido para `PREPARANDO` é 100% backend (documentado em `API.md`).

## Busca de produtos (cardápio)

- **`components/homeCards/ProductSearch.tsx`** (Client Component): recebe as categorias já com produtos carregados (buscados no servidor por `ProductCatalog`) e filtra **no cliente**, sem nova chamada à API.
- Campo de busca com ícone de lupa (`Search`) e botão de limpar (`X`, só aparece com texto digitado), centralizado, mais largo em telas `md:` (`max-w-2xl` → `md:max-w-3xl`).
- Filtro case-insensitive por `name` **ou** `description` do produto (via `useMemo`); categorias que ficam sem produto após o filtro somem da lista.
- Mensagem "Nenhum produto encontrado para sua busca." quando há texto digitado e o resultado é vazio (diferente da mensagem "Nenhum produto disponível no momento.", que é o caso de não haver produto nenhum cadastrado).

## Skeleton loading (cardápio)

- A home (`app/(with-header)/page.tsx`) não é mais um Server Component `async` monolítico — o hero (logo) renderiza imediatamente, e a busca de categorias/produtos foi extraída para `components/homeCards/ProductCatalog.tsx` (Server Component `async` separado), envolvido em `<Suspense fallback={<ProductCatalogSkeleton />}>` (streaming, padrão documentado em `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` desta versão do Next).
- **`ProductCatalogSkeleton.tsx`**: simula 2 seções fantasma (título + grid) com 4 `ProductCardSkeleton` cada, usando as mesmas classes de grid da página real (sem salto de layout ao trocar pelo conteúdo real).
- **`ProductCardSkeleton.tsx`**: espelha exatamente a estrutura do `ProductCard` real (mesmo `flex-row`, mesmo tamanho de imagem `w-32 h-32 sm:w-40 sm:h-40`), usando o componente `Skeleton` do shadcn (instalado via `npx shadcn@latest add skeleton`).

## Camada de serviços / integração com API

- **`lib/api.ts`** — `apiClient<T>()`: wrapper de `fetch` genérico.
  - Usa `NEXT_PUBLIC_API_URL` como base.
  - Suporta `token` (injeta `Authorization: Bearer`), `FormData` (não força `Content-Type` nesse caso) e opções de cache/revalidate do Next.
  - Lança erro com a mensagem vinda do backend em respostas não-OK — não faz nenhuma checagem de status HTTP específico, então é compatível tanto com o contrato antigo (tudo `400`) quanto com o novo (códigos semânticos `404`/`401`/`409`/`422`/`500`, ver `API.md`).
- **`services/`** — funções tipadas por entidade, todas usando `apiClient`:
  - `catetory.ts` — `getAllCategories` (só isso; a função `getCategories` com `fetch` cru duplicado foi removida)
  - `product.ts` — `getproductsByCategoryId`, `getAllProducts`, `prepareUpdateProductFormData` (monta o FormData de atualização, incluindo `stock` opcional)
  - `order.ts` — `createOrder`, `getOrders` (nova — usada tanto pela página de Pedidos quanto pelo `PendingOrdersBadge`)
- **`actions/`** — Server Actions, todas usando `getToken()` centralizado e retornando `{ success, message }` de forma consistente:
  - `products.ts` — `createProductAction`, `updateProductAction`, `deleteProductAction`, `enableProductAction`, `disableProductAction`
  - `categories.ts` — `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`
  - `orders.ts` — `updateOrderStatusAction`
- **`API.md`** (raiz do repo) é o documento de referência **atual** do contrato do backend — inclui changelog de breaking changes (códigos HTTP semânticos, mensagens em português, autenticação em `/order-item`), controle de estoque, e a modelagem de Combos (só banco de dados até agora, sem rotas). `endpoints.md` é uma versão mais antiga do mesmo contrato e pode estar desatualizada em alguns pontos — prefira `API.md`.

## Tipos principais (`lib/types.ts`)

- `AuthResponse`, `User`, `UseAuthReturn`
- `Category`, `Product` (agora com `stock: number`)
- `OrderStatus` (enum: `RECEBIDO | PREPARANDO | SAIU | ENTREGUE`)
- `OrderItem`, `OrderItemProduct`, `Order`

> Existe uma segunda definição de `Product`/`Order`/`OrderStatus` em `services/product.ts` e `services/order.ts` (com pequenas diferenças de nullability), usada por partes diferentes do app. É uma duplicação conhecida, não unificada ainda.

## Funcionalidades do cliente (loja)

- Visualização do cardápio público, agrupado por categoria, com busca em tempo real (nome/descrição) e skeleton loading enquanto os dados carregam
- Produtos esgotados/indisponíveis aparecem no cardápio (não somem mais) com indicação visual clara e ação de compra bloqueada
- `ProductCard` / `ProductDialog` (`components/homeCards/`) — exibição de produto e modal de detalhes, com quantidade e observações
- Header do site com contador do carrinho (`CartTriggerBadge`) e footer (`components/header/siteFooter.tsx`, com nome da loja, horário de funcionamento, link pro cardápio e pro WhatsApp)
- Adição de produtos ao carrinho com quantidade e observações, ajuste de quantidade, remoção
- Checkout com campo de troco (dinheiro) ou comprovante PIX (upload direto pro Cloudinary), finalizado com envio automático para o WhatsApp da loja e tela de confirmação de pedido dentro do próprio carrinho

## Observações de configuração

- Variáveis de ambiente (`.env.local`):
  - `NEXT_PUBLIC_API_URL` — URL do backend Express (obrigatória)
  - `NEXT_PUBLIC_WHATSAPP_NUMBER` — link completo do WhatsApp da loja (ex.: `https://wa.me/55...`), usado no checkout, header e footer — **não há mais número hardcoded no código**
  - `NEXT_PUBLIC_PIX_KEY` — chave PIX exibida no checkout
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — upload unsigned do comprovante de PIX
- Cookie de sessão: `authToken` (httpOnly; usado pelo middleware e lido no servidor via `getToken()` para Server Components/Server Actions)
- `AGENTS.md` alerta que esta versão do Next.js pode ter diferenças de API em relação ao conhecimento padrão — consultar `node_modules/next/dist/docs/` antes de mudanças na camada de framework (confirmado necessário na implementação do skeleton loading com Suspense)

## Documentos relacionados já existentes no repo

- [README.md](README.md) — visão geral do projeto, stack e como rodar
- [ADMIN_SETUP.md](ADMIN_SETUP.md) — detalhes do sistema de autenticação admin (parcialmente superado pela migração de `localStorage` para cookies + middleware)
- [API.md](API.md) — contrato **atual** da API backend, com changelog de breaking changes, controle de estoque e modelagem de Combos
- [endpoints.md](endpoints.md) — versão mais antiga do contrato da API (preferir `API.md`)
