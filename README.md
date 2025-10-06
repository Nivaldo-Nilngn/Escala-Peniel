# Sistema de Escalas - Peniel

Sistema de gestão de escalas e organização de departamentos para igrejas.

## 🚀 Como Testar o Login

### 1. Criar um Usuário no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **escala-peniel**
3. No menu lateral, clique em **Authentication** → **Users**
4. Clique em **Add User**
5. Preencha:
   - **Email**: teste@peniel.com
   - **Password**: senha123
6. Clique em **Add User**

### 2. Adicionar Dados do Usuário no Firestore

1. No Firebase Console, vá para **Firestore Database**
2. Clique em **Start collection**
3. Collection ID: `users`
4. Document ID: Use o **UID** do usuário criado (copie do Authentication)
5. Adicione os campos:
   ```
   email: "teste@peniel.com"
   name: "Usuário Teste"
   role: "pastor"  (ou "lider" ou "membro")
   departmentIds: []
   isActive: true
   createdAt: (timestamp) agora
   updatedAt: (timestamp) agora
   ```
6. Clique em **Save**

### 3. Testar o Login

1. Acesse: `http://localhost:3000/login`
2. Use as credenciais:
   - **Email**: teste@peniel.com
   - **Password**: senha123
3. Clique em **Entrar**
4. Você será redirecionado para o Dashboard

### 4. Criar uma Nova Conta (Registro)

1. Na tela de login, clique em **Criar conta**
2. Preencha o formulário:
   - Nome completo
   - Email
   - Papel (Membro, Líder ou Pastor)
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Clique em **Criar Conta**
4. A conta será criada automaticamente no Firebase Authentication e Firestore

## 📦 Tecnologias

- **Frontend**: React + TypeScript
- **UI**: Material-UI (MUI)
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Cloud Firestore
- **Roteamento**: React Router v6
- **Notificações**: Firebase Cloud Messaging (futuro)

## 🛠️ Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

Abra [http://localhost:3000](http://localhost:3000) para ver no navegador.

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx       # Context de autenticação
├── hooks/
│   └── useAuth.ts            # Hook para usar autenticação
├── pages/
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── Login.tsx             # Tela de login
│   ├── Register.tsx          # Tela de registro
│   ├── Diaconato.tsx         # Gerenciamento do Diaconato
│   └── Membros.tsx           # Cadastro e listagem de membros
├── services/
│   ├── userService.ts        # Serviços de usuário
│   ├── departmentService.ts  # Serviços de departamento
src/
├── components/
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx       # Context de autenticação
├── hooks/
│   └── useAuth.ts            # Hook para usar autenticação
├── pages/
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── Login.tsx             # Tela de login
│   ├── Register.tsx          # Tela de registro
│   ├── Agenda.tsx            # Agenda mensal de eventos
│   ├── Diaconato.tsx         # Gerenciamento do Diaconato
│   ├── Louvor.tsx            # Gerenciamento de Louvor
│   ├── Midia.tsx             # Gerenciamento de Mídia
│   ├── Criancas.tsx          # Gerenciamento de Crianças
│   └── Membros.tsx           # Cadastro e listagem de membros
├── services/
│   ├── userService.ts        # Serviços de usuário
│   ├── departmentService.ts  # Serviços de departamento
│   ├── eventService.ts       # Serviços de eventos
│   └── scheduleService.ts    # Serviços de escalas
├── types/
│   ├── user.ts
│   ├── department.ts
│   ├── event.ts
│   ├── schedule.ts
│   └── message.ts
├── firebase-config.ts        # Configuração do Firebase
└── App.tsx                   # Rotas principais
```

## 🔐 Papéis (Roles)

- **Pastor/Administrador** (`pastor`): Acesso total ao sistema
- **Líder de Departamento** (`lider`): Gerencia seu departamento
- **Membro** (`membro`): Visualiza escalas e confirma presença

## 🎯 Funcionalidades Implementadas

- [x] Sistema de login e registro com Firebase Auth
- [x] **Dashboard dinâmico** com estatísticas em tempo real
  - Eventos próximos (7 dias)
  - Total de membros ativos
  - Departamentos e suas estatísticas
  - Navegação rápida entre páginas
- [x] Gerenciamento de 4 departamentos (Diaconato, Louvor, Mídia, Crianças)
  - Adicionar/remover membros
  - Criar/excluir funções
  - Visualizar escalas
- [x] Cadastro de membros com Firebase Auth integrado
- [x] Listagem e edição de membros com filtros
- [x] Controle de acesso por papel (Pastor/Líder/Membro)
- [x] **Interface responsiva** (Desktop, Tablet e Mobile)
- [x] **Agenda mensal de eventos** com calendário e lista
  - Visualização em calendário ou lista
  - Criar/editar/excluir eventos
  - Tipos de eventos coloridos
  - Navegação entre meses
- [x] **Importação rápida de eventos** (Outubro/2025 com 1 clique)
- [x] Sincronização bidirecional de departamentos e usuários

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo para funcionar perfeitamente em:

### 📱 Mobile (< 600px)
- Layout em cards verticais
- Formulários full-screen
- Botões em largura total
- Menu lateral otimizado
- Tipografia ajustada

### 📱 Tablet (600px - 960px)
- Tabelas compactas
- Grid de 2 colunas
- Menos colunas nas tabelas
- Espaçamento otimizado

### 💻 Desktop (> 960px)
- Tabelas completas com todas as colunas
- Grid de 4 colunas para estatísticas
- Layout em 2 colunas para conteúdo
- Espaçamento amplo

**Recursos de responsividade:**
- Breakpoints Material-UI (xs, sm, md, lg, xl)
- Componentes adaptativos (Table ↔ Cards no mobile)
- Dialog full-screen no mobile
- Ícones e avatares com tamanhos responsivos

## 🎯 Próximas Funcionalidades

- [ ] Criar agenda mensal
- [ ] Criar escalas por departamento
- [ ] Sistema de substituições
- [ ] Chat por departamento
- [ ] Notificações push
- [ ] Relatórios de presença
- [ ] Paleta de cores por evento

---

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
