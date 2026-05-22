🍢 Espetinho Nilson - Sistema de Delivery

Sistema completo de delivery desenvolvido para um cliente real, permitindo pedidos online, gerenciamento de produtos e controle de pedidos em tempo real.

🚀 Demonstração

🌐 Frontend:https://github.com/EvandersondaSilva/espetinho-delivery-frontend

⚙️ Backend API:https://espetinho-delivery-production.up.railway.app/

📸 Preview

🛒 Cardápio Online
Listagem de produtos por categorias
Carrinho de compras
Checkout simplificado

📦 Painel Administrativo
Controle de pedidos
Gerenciamento de produtos
Gerenciamento de categorias
Atualização de status dos pedidos

🧑‍💻 Tecnologias Utilizadas
Frontend
Next.js
TypeScript
TailwindCSS
shadcn/ui
Context API

Backend
Node.js
Express
TypeScript
Prisma ORM
PostgreSQL
JWT Authentication

Deploy
Vercel
Railway

✨ Funcionalidades

👤 Cliente
Visualizar cardápio
Adicionar produtos ao carrinho
Alterar quantidade de itens
Finalizar pedido
Enviar pedido para loja
Integração com WhatsApp

🧑‍💼 Admin
Login administrativo
Criar categorias
Editar categorias
Criar produtos
Editar produtos
Ativar/desativar produtos
Visualizar pedidos
Atualizar status dos pedidos

🗄️ Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM.

Principais entidades:
Users
Categories
Products
Orders
OrderItems

🔐 Autenticação

O painel administrativo utiliza autenticação JWT para proteger rotas privadas.

⚙️ Como rodar o projeto

📦 Backend

git clone https://github.com/SEU-USUARIO/espetinho-nilson-backend

cd backend

npm install

Configure o .env

DATABASE_URL=""
JWT_SECRET=""
CLOUDINARY_NAME=""
CLOUDINARY_KEY=""
CLOUDINARY_SECRET=""

Execute as migrations: npx prisma migrate deploy

Inicie o servidor: npm run dev

--------------

💻 Frontend

git clone https://github.com/SEU-USUARIO/espetinho-nilson-frontend

cd frontend

npm install

Configure o .env.local: NEXT_PUBLIC_API_URL=""

Execute: npm run dev

📚 Aprendizados

Esse projeto foi desenvolvido com foco em experiência prática de desenvolvimento full stack, envolvendo:

Arquitetura backend
Modelagem de banco de dados
Integração frontend/backend
Deploy em produção
Autenticação
CRUD completo
Organização de código
UI/UX para delivery

👨‍💻 Desenvolvedor

Desenvolvido por Evanderson 🚀

📧 Entre em contato pelo LinkedIn/GitHub.
