# Guia: Gerenciamento do Departamento de Diaconato

## 🎯 Funcionalidades Implementadas

### 1. **Página do Diaconato** (`/diaconato`)
- Gerenciamento completo de membros
- Cadastro de funções específicas
- Sistema de escalas mensais
- Interface com 3 abas: Membros, Funções e Escalas

### 2. **Gerenciamento de Membros**
- ✅ Adicionar membros ao departamento
- ✅ Remover membros
- ✅ Visualizar lista de membros com email
- ✅ Controle de acesso (apenas Pastor e Líderes podem editar)

### 3. **Gerenciamento de Funções**
- ✅ Criar funções personalizadas (Porta, Corredor, Altar, etc.)
- ✅ Adicionar descrição às funções
- ✅ Marcar funções como obrigatórias
- ✅ Remover funções

### 4. **Sistema de Escalas**
- 🚧 Em desenvolvimento
- Criação de escalas por evento
- Atribuição de membros às funções
- Verificação de conflitos automática
- Paleta de cores por evento

---

## 🚀 Como Testar

### Passo 1: Fazer Login
1. Acesse: `http://localhost:3000/login`
2. Use suas credenciais ou crie uma conta como **Pastor** (para ter acesso total)

### Passo 2: Acessar o Diaconato
1. No Dashboard, clique no menu (☰) superior esquerdo
2. No Sidebar, na seção **DEPARTAMENTOS**, clique em **Diaconato**
3. Você será redirecionado para `/diaconato`

### Passo 3: Adicionar Membros

#### 3.1 Primeiro, criar usuários no sistema:
Você tem 2 opções:

**Opção A: Via Tela de Registro**
1. Faça logout
2. Vá para a tela de registro
3. Crie usuários com role **"Membro"**
4. Exemplo de usuários para teste:
   - João Silva - joao@peniel.com
   - Maria Santos - maria@peniel.com
   - Pedro Costa - pedro@peniel.com

**Opção B: Via Firebase Console**
1. Acesse: https://console.firebase.google.com/
2. Vá em **Authentication** → Criar usuários
3. Vá em **Firestore** → Collection `users` → Adicionar documentos

#### 3.2 Adicionar ao Departamento:
1. Na página do Diaconato, clique na aba **"Membros"**
2. Clique em **"Adicionar Membro"**
3. Selecione um usuário da lista
4. Clique em **"Adicionar"**
5. ✅ Membro adicionado com sucesso!

#### 3.3 Remover Membro:
1. Na lista de membros, clique no ícone de lixeira (🗑️)
2. O membro será removido do departamento

### Passo 4: Cadastrar Funções

1. Clique na aba **"Funções"**
2. Clique em **"Adicionar Função"**
3. Exemplos de funções para criar:
   - **Nome**: Porta Principal
     - **Descrição**: Responsável pela entrada principal da igreja
   - **Nome**: Corredor Central
     - **Descrição**: Organização dos membros no corredor
   - **Nome**: Altar
     - **Descrição**: Próximo ao púlpito, auxílio ao pastor
   - **Nome**: Recepção
     - **Descrição**: Recepção de visitantes
   - **Nome**: Estacionamento
     - **Descrição**: Organização do estacionamento

4. Clique em **"Criar Função"**
5. ✅ Função criada!

### Passo 5: Preparar para Criar Escalas

Para criar escalas, você precisa:
- ✅ Ter membros cadastrados no departamento
- ✅ Ter funções cadastradas
- 📅 Ter uma agenda mensal criada (próxima funcionalidade)

---

## 📋 Estrutura de Dados Criada

### Collection: `departments`
```javascript
{
  id: "auto-generated",
  name: "Diaconato",
  type: "diaconato",
  description: "Departamento de Diaconato - Responsável por recepção, porta, altar e ordem",
  leaderId: "userId",
  members: ["userId1", "userId2", "userId3"],
  color: "#1976d2",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `departmentFunctions`
```javascript
{
  id: "auto-generated",
  departmentId: "diaconato-id",
  name: "Porta Principal",
  description: "Responsável pela entrada principal",
  isRequired: false,
  maxMembers: null
}
```

### Collection: `departmentSchedules` (em breve)
```javascript
{
  id: "auto-generated",
  departmentId: "diaconato-id",
  eventId: "event-id",
  arrivalTime: "17:30",
  colorPalette: {
    primary: "#FFFFFF",
    secondary: "#0000FF",
    description: "Branco e Azul"
  },
  assignments: [
    {
      id: "assignment-id",
      userId: "user-id",
      functionId: "function-id",
      functionName: "Porta Principal",
      isConfirmed: false,
      hasRequestedSubstitution: false
    }
  ],
  notes: "Chegada às 17h30",
  isPublished: false,
  createdBy: "leader-id",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔐 Controle de Acesso

### Pastor
- ✅ Criar departamento automaticamente se não existir
- ✅ Adicionar/remover membros
- ✅ Criar/editar/remover funções
- ✅ Criar/editar/publicar escalas

### Líder de Departamento
- ✅ Adicionar/remover membros do seu departamento
- ✅ Criar/editar/remover funções
- ✅ Criar/editar/publicar escalas do seu departamento

### Membro
- ✅ Visualizar membros e funções
- ✅ Visualizar suas escalas
- ❌ Não pode editar

---

## 🔄 Próximos Passos

### Implementação de Escalas (Próxima Etapa)
1. **Criar Agenda Mensal**
   - Pastor define eventos do mês (cultos, reuniões, etc.)
   - Define data, hora e tipo de evento

2. **Criar Escala**
   - Selecionar evento da agenda
   - Atribuir membros às funções
   - Definir horário de chegada
   - Escolher paleta de cores
   - Publicar escala

3. **Visualizar Escalas**
   - Lista de escalas criadas
   - Calendário visual
   - Status de confirmação dos membros

4. **Notificações**
   - Notificar membros quando escala for publicada
   - Lembretes antes do evento
   - Alertas de substituições

---

## 🐛 Troubleshooting

### Problema: "Departamento não encontrado"
**Solução**: O departamento é criado automaticamente no primeiro acesso se você for Pastor. Se não funcionar:
1. Verifique se está logado como Pastor
2. Recarregue a página
3. Verifique o console do navegador para erros

### Problema: "Não consigo adicionar membros"
**Solução**:
1. Verifique se você tem permissão (Pastor ou Líder)
2. Certifique-se que existem usuários com role "membro" no sistema
3. Crie usuários via tela de registro primeiro

### Problema: Botão "Criar Escala" está desabilitado
**Solução**:
1. Adicione pelo menos 1 membro ao departamento
2. Crie pelo menos 1 função
3. O botão será habilitado automaticamente

---

## 📊 Exemplo de Teste Completo

```
1. Login como Pastor
2. Ir para /diaconato
3. Adicionar 3 membros:
   - João Silva
   - Maria Santos
   - Pedro Costa
4. Criar 3 funções:
   - Porta Principal
   - Corredor Central
   - Altar
5. Ir para aba "Escalas"
6. Clicar em "Criar Escala" (próxima implementação)
7. Selecionar evento
8. Atribuir membros:
   - João Silva → Porta Principal
   - Maria Santos → Corredor Central
   - Pedro Costa → Altar
9. Publicar escala
10. Membros recebem notificação
```

---

## 🎨 Interface

- **Design**: Material-UI (MUI)
- **Layout**: Responsivo (mobile-first)
- **Cores**: Azul (#1976d2) como cor primária do Diaconato
- **Navegação**: Tabs para organização (Membros / Funções / Escalas)
- **Feedback**: Alerts de sucesso/erro para todas as ações

---

## ✅ Checklist de Testes

- [ ] Login como Pastor
- [ ] Acessar página do Diaconato
- [ ] Adicionar 3 membros
- [ ] Remover 1 membro
- [ ] Criar 3 funções
- [ ] Remover 1 função
- [ ] Verificar que botão "Criar Escala" aparece desabilitado sem membros/funções
- [ ] Fazer logout
- [ ] Login como Membro
- [ ] Verificar que não pode editar nada no Diaconato

---

**Pronto!** A base do sistema de gerenciamento do Diaconato está funcionando. 
Próxima etapa: Sistema de Escalas Mensais. 🚀
