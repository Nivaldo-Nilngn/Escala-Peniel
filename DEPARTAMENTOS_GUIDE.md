# Guia das Páginas de Departamentos

## Visão Geral

O sistema agora possui 4 páginas completas de departamentos, todas seguindo o mesmo padrão de interface e funcionalidades:

1. **Diaconato** (`/diaconato`)
2. **Louvor** (`/louvor`)
3. **Mídia** (`/midia`)
4. **Crianças** (`/criancas`)

---

## Características de Cada Departamento

### 1. Diaconato
- **Tipo**: `diaconato`
- **Cor**: `#1976d2` (Azul)
- **Descrição**: Departamento de Diaconato - Responsável pelo serviço e ordem da igreja
- **Funções Comuns**: 
  - Recepção
  - Ordem
  - Estacionamento
  - Segurança
  - Oferta

### 2. Louvor
- **Tipo**: `louvor`
- **Cor**: `#9c27b0` (Roxo)
- **Descrição**: Departamento de Louvor - Responsável por ministração musical e adoração
- **Funções Comuns**:
  - Vocal
  - Guitarra
  - Bateria
  - Teclado
  - Baixo
  - Backing Vocal

### 3. Mídia
- **Tipo**: `midia`
- **Cor**: `#ff5722` (Laranja/Vermelho)
- **Descrição**: Departamento de Mídia - Responsável por som, projeção e transmissões
- **Funções Comuns**:
  - Som
  - Projeção
  - Transmissão
  - Câmera
  - Iluminação

### 4. Crianças
- **Tipo**: `criancas`
- **Cor**: `#4caf50` (Verde)
- **Descrição**: Departamento de Crianças - Responsável pelo ministério infantil
- **Funções Comuns**:
  - Professor
  - Auxiliar
  - Recreação
  - Berçário
  - Coordenador

---

## Estrutura das Páginas

Todas as páginas de departamento seguem a mesma estrutura com 3 abas:

### Aba 1: MEMBROS
- Lista todos os membros do departamento
- **Funcionalidades**:
  - Visualizar membros cadastrados
  - Adicionar novos membros (Pastor/Líder)
  - Remover membros (Pastor/Líder)
- **Autocomplete**: Busca entre todos os usuários ativos do sistema
- **Sincronização**: Atualiza tanto `department.members[]` quanto `user.departmentIds[]`

### Aba 2: FUNÇÕES
- Lista as funções específicas do departamento
- **Funcionalidades**:
  - Visualizar funções cadastradas
  - Criar novas funções (Pastor/Líder)
  - Remover funções (Pastor/Líder)
- **Campos**:
  - Nome da função
  - Descrição (opcional)
  - Obrigatória (futuramente)

### Aba 3: ESCALAS
- Lista as escalas criadas para o departamento
- **Funcionalidades**:
  - Visualizar escalas do mês
  - (Futuro: Criar/editar escalas)
- **Informações**:
  - ID da escala
  - Data de criação

---

## Permissões por Função

### Pastor
- ✅ Criar departamento (auto-criação se não existir)
- ✅ Adicionar/remover membros
- ✅ Criar/excluir funções
- ✅ Visualizar todas as informações
- ✅ (Futuro) Criar/gerenciar escalas

### Líder
- ✅ Adicionar/remover membros
- ✅ Criar/excluir funções
- ✅ Visualizar todas as informações
- ✅ (Futuro) Criar/gerenciar escalas
- ❌ Não pode criar departamento

### Membro
- ✅ Visualizar membros do departamento
- ✅ Visualizar funções
- ✅ Visualizar escalas
- ❌ Não pode adicionar/remover membros
- ❌ Não pode criar/excluir funções

---

## Fluxo de Criação Automática

Quando um Pastor acessa pela primeira vez a página de um departamento que ainda não existe:

1. Sistema busca departamento pelo `type` (ex: `louvor`)
2. Se não encontrar, exibe alerta com botão "Criar Departamento"
3. Pastor clica em "Criar Departamento"
4. Sistema cria o departamento com:
   - Nome (ex: "Louvor")
   - Type (ex: "louvor")
   - Descrição padrão
   - Líder = Pastor atual
   - Members = array vazio
   - Cor específica
   - isActive = true
5. Página recarrega com departamento criado

---

## Sincronização Bidirecional

Todas as páginas implementam sincronização bidirecional entre `departments` e `users`:

### Ao Adicionar Membro:
```typescript
// Atualiza department.members[]
await DepartmentService.addMemberToDepartment(deptId, userId);

// Internamente também atualiza user.departmentIds[]
// Mantém consistência nos dois lados
```

### Ao Remover Membro:
```typescript
// Remove de department.members[]
await DepartmentService.removeMemberFromDepartment(deptId, userId);

// Internamente também remove de user.departmentIds[]
```

### Ao Carregar Membros:
```typescript
// Usa query array-contains para buscar usuários
const members = await UserService.getUsersByDepartment(departmentId);
```

**Veja**: `SYNC_DEPARTAMENTOS.md` para detalhes completos sobre sincronização.

---

## Navegação

### No Sidebar (Menu Lateral):
Todos os departamentos aparecem na seção "DEPARTAMENTOS":
- 🎵 Louvor → `/louvor`
- 🛡️ Diaconato → `/diaconato`
- 📹 Mídia → `/midia`
- 👶 Crianças → `/criancas`

### Rotas Configuradas em App.tsx:
```typescript
<Route path="/diaconato" element={<PrivateRoute><Layout><Diaconato /></Layout></PrivateRoute>} />
<Route path="/louvor" element={<PrivateRoute><Layout><Louvor /></Layout></PrivateRoute>} />
<Route path="/midia" element={<PrivateRoute><Layout><Midia /></Layout></PrivateRoute>} />
<Route path="/criancas" element={<PrivateRoute><Layout><Criancas /></Layout></PrivateRoute>} />
```

---

## Testando as Páginas

### 1. Login como Pastor
```
Email: pastor@escala-peniel.com
Senha: sua_senha
```

### 2. Acessar cada departamento
- Clique em "Louvor" no menu
- Sistema detecta que não existe
- Clique em "Criar Departamento"
- Repita para Mídia e Crianças

### 3. Adicionar Membros
- Vá para aba "MEMBROS"
- Clique em "Adicionar Membro"
- Selecione um usuário da lista
- Clique em "Adicionar"
- Verifique que membro aparece na lista

### 4. Criar Funções
- Vá para aba "FUNÇÕES"
- Clique em "Nova Função"
- Digite nome (ex: "Vocal", "Som", "Professor")
- Adicione descrição (opcional)
- Clique em "Criar"

### 5. Verificar Sincronização
- Vá para `/membros`
- Clique em um membro que foi adicionado ao departamento
- Verifique que o departamento aparece nos chips coloridos
- Remova o membro do departamento
- Volte para `/membros` e verifique que chip desapareceu

---

## Próximos Passos

### Funcionalidades Pendentes:

1. **Agenda Mensal** (`/agenda`)
   - Criar eventos mensais
   - Definir data/hora/tipo
   - Publicar agenda

2. **Criação de Escalas**
   - Vincular escala a evento da agenda
   - Atribuir membros às funções
   - Definir horários de chegada
   - Adicionar observações
   - Publicar escala

3. **Notificações Push**
   - Firebase Cloud Messaging
   - Notificar quando escala for publicada
   - Lembrete de chegada

4. **Sistema de Chat**
   - Chat por departamento
   - Chat geral da igreja
   - Mensagens diretas

---

## Arquitetura do Código

### Componentes Principais:
```
src/pages/
├── Diaconato.tsx    # Departamento de Diaconato
├── Louvor.tsx       # Departamento de Louvor
├── Midia.tsx        # Departamento de Mídia
└── Criancas.tsx     # Departamento de Crianças
```

### Serviços Utilizados:
```typescript
DepartmentService:
  - getAllDepartments()
  - getDepartmentById()
  - createDepartment()
  - addMemberToDepartment()
  - removeMemberFromDepartment()
  - getDepartmentFunctions()
  - createDepartmentFunction()
  - deleteDepartmentFunction()

UserService:
  - getUsersByDepartment()
  - getUsers()

ScheduleService:
  - getDepartmentSchedules()
```

### Hooks Utilizados:
```typescript
useAuth():
  - user: Usuário atual
  - hasRole(): Verifica permissões
  - loading: Estado de carregamento
```

---

## Troubleshooting

### Problema: Membro não aparece após adicionar
**Solução**: Verifique se o método `addMemberToDepartment()` está atualizando tanto `department.members` quanto `user.departmentIds`. Veja `SYNC_DEPARTAMENTOS.md`.

### Problema: Departamento não é criado
**Solução**: 
1. Verifique se usuário tem role `pastor`
2. Verifique console do navegador para erros
3. Verifique permissões do Firestore

### Problema: Erro de compilação TypeScript
**Solução**:
1. Execute `npm run build` para verificar erros
2. Verifique imports de componentes
3. Verifique tipos em `src/types/`

### Problema: Página em branco
**Solução**:
1. Verifique se rota está configurada em `App.tsx`
2. Verifique se componente está exportado corretamente
3. Verifique console do navegador para erros

---

## Padrão de Código

Todas as páginas seguem o mesmo padrão:

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Material-UI components }
import { useAuth, Services, Types }

// 2. Interface para TabPanel
interface TabPanelProps { ... }

// 3. Componente TabPanel
function TabPanel(props: TabPanelProps) { ... }

// 4. Componente Principal
export const NomeDepartamento: React.FC = () => {
  // 4.1 Hooks
  const { user, hasRole } = useAuth();
  
  // 4.2 Estados
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<Department | null>(null);
  // ... outros estados
  
  // 4.3 useEffect para carregar dados
  useEffect(() => {
    loadDepartmentData();
  }, []);
  
  // 4.4 Função loadDepartmentData
  const loadDepartmentData = async () => { ... }
  
  // 4.5 Handlers (handleAddMember, handleRemoveMember, etc)
  
  // 4.6 Render condicional (loading, departamento não existe)
  
  // 4.7 Render principal com Tabs
  return (
    <Box>
      <Typography>Nome Departamento</Typography>
      <Tabs>...</Tabs>
      <TabPanel index={0}>Membros</TabPanel>
      <TabPanel index={1}>Funções</TabPanel>
      <TabPanel index={2}>Escalas</TabPanel>
      <Dialogs>...</Dialogs>
    </Box>
  );
};
```

---

## Conclusão

Todas as 4 páginas de departamentos estão implementadas e funcionais:
- ✅ Diaconato
- ✅ Louvor
- ✅ Mídia
- ✅ Crianças

**Interface consistente** entre todos os departamentos.
**Sincronização bidirecional** funcionando corretamente.
**Permissões** baseadas em roles implementadas.
**Navegação** configurada no Sidebar e App.tsx.

O sistema está pronto para gerenciar múltiplos departamentos da igreja!
