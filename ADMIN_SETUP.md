# Sistema de Autenticação Admin

Este documento descreve o sistema de autenticação criado para o painel administrativo.

## Arquivos Criados

### 1. Página de Login
**Arquivo:** `src/app/admin/login/page.tsx`

Página responsável pela autenticação do usuário.

**Funcionalidades:**
- Validação de campos (email e password obrigatórios)
- Requisição ao endpoint `/session` do backend
- Salvamento do token no localStorage
- Redirecionamento para dashboard após login bem-sucedido
- Exibição de mensagens de erro
- Estado de loading no botão (ex: "Entrando...")

**Componentes Usados:**
- `Card` - Container principal
- `Input` - Campos de email e senha
- `Label` - Labels dos campos
- `Button` - Botão de submissão

### 2. Página de Dashboard
**Arquivo:** `src/app/admin/dashboard/page.tsx`

Página principal do painel administrativo após o login.

**Funcionalidades:**
- Verifica autenticação do usuário
- Exibe informações do usuário logado
- Botão de logout
- Links para futuras seções (Produtos, Categorias, Pedidos)

### 3. Hook customizado `useAuth`
**Arquivo:** `src/hooks/useAuth.ts`

Hook para gerenciar autenticação em toda a aplicação.

**Funcionalidades:**
```typescript
const { user, token, loading, logout, isAuthenticated } = useAuth();
```

- `user` - Dados do usuário (id, name, role)
- `token` - Token JWT armazenado
- `loading` - Estado de carregamento
- `logout` - Função para fazer logout
- `isAuthenticated` - Boolean indicando se há token válido

**Como usar:**
```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
    const { user, loading } = useAuth();

    if (loading) return <div>Carregando...</div>;

    return <div>Bem-vindo, {user?.name}</div>;
}
```

## Fluxo de Autenticação

1. **Acesso a `/admin/login`:**
   - Usuário insere email e senha
   - Clica no botão "Entrar"

2. **Validação e Requisição:**
   - Valida se campos estão preenchidos
   - Faz POST para `/session` com `{ email, password }`

3. **Resposta do Backend:**
   - Backend retorna: `{ id, name, role, token }`

4. **Armazenamento:**
   - Token salvo em: `localStorage.setItem("authToken", token)`
   - Dados do usuário salvo em: `localStorage.setItem("user", JSON.stringify({...}))`

5. **Redirecionamento:**
   - Usuário é redirecionado para `/admin/dashboard`

6. **Proteção de Rotas:**
   - O hook `useAuth()` verifica se há token válido
   - Se não houver token, redireciona para `/admin/login`

## Segurança

- ✅ Validação de campos obrigatórios
- ✅ Verificação de token antes de acessar rotas protegidas
- ✅ Proteção contra SSR (verificação de `window`)
- ✅ Armazenamento seguro do token no localStorage
- ✅ Logout limpa todos os dados

## Próximas Etapas (Opcional)

Para melhorar o sistema, você pode:

1. **Middleware de autenticação:**
   - Criar um middleware Next.js que valida token em todas as rotas de `/admin`

2. **Refresh token:**
   - Implementar refresh token com expiração de 30 dias

3. **Interceptor de requests:**
   - Criar um interceptor que adiciona o token automaticamente em todas as requisições

4. **Validação de token:**
   - Validar se o token ainda é válido ao acessar o dashboard (chamar `GET /me`)

## Exemplo de Uso

### Proteger uma página:

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
    const { user, loading, logout } = useAuth();

    if (loading) return <div>Carregando...</div>;

    return (
        <div>
            <h1>Bem-vindo, {user?.name}</h1>
            <button onClick={logout}>Sair</button>
        </div>
    );
}
```

### Usar token em requisições:

```typescript
const { token } = useAuth();

const response = await apiClient("/some-protected-endpoint", {
    token: token!, // Use o ! após garantir que existe token
    method: "GET",
});
```

## Endpoints Utilizados

- **POST `/session`** - Login do usuário
  - Request: `{ email, password }`
  - Response: `{ id, name, role, token }`

- **GET `/me`** (Disponível para implementação futura)
  - Header: `Authorization: Bearer <token>`
  - Response: Dados completos do usuário

## Variáveis de Ambiente

Certifique-se que você tem a seguinte variável no `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Isso é necessário para o `apiClient` fazer as requisições ao backend.
