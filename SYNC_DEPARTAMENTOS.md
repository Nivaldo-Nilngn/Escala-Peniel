# Sincronização de Membros e Departamentos

## 🔄 Como Funciona

O sistema mantém sincronização bidirecional entre usuários e departamentos:

### Estrutura de Dados

**Usuário (collection: `users`)**
```json
{
  "id": "uid-firebase-auth",
  "name": "João Silva",
  "email": "joao@peniel.com",
  "departmentIds": ["dept-id-1", "dept-id-2"],  // ← Array de IDs
  "role": "membro",
  "isActive": true
}
```

**Departamento (collection: `departments`)**
```json
{
  "id": "dept-id-1",
  "name": "Diaconato",
  "type": "diaconato",
  "members": ["uid-1", "uid-2", "uid-3"],  // ← Array de UIDs
  "leaderId": "uid-leader",
  "isActive": true
}
```

## ✅ Fluxos de Sincronização

### 1. Cadastrar Novo Membro em `/membros`

**O que acontece:**
1. Usuário preenche formulário com nome, email, senha e **seleciona departamentos**
2. Sistema cria conta no Firebase Authentication (gera UID)
3. Sistema cria documento em `users` usando o UID como ID
4. ✅ `departmentIds` já é preenchido com os departamentos selecionados

**Resultado:**
- Usuário cadastrado com departamentos
- **MAS** os arrays `members` dos departamentos **NÃO** são atualizados automaticamente

### 2. Adicionar Membro ao Departamento em `/diaconato`

**O que acontece:**
1. Líder/Pastor acessa página do departamento
2. Clica em "Adicionar Membro"
3. Seleciona um usuário da lista
4. Sistema executa `addMemberToDepartment(departmentId, userId)`:
   - ✅ Adiciona `userId` ao array `members` do departamento
   - ✅ Adiciona `departmentId` ao array `departmentIds` do usuário

**Resultado:**
- Sincronização completa em ambas as direções

### 3. Remover Membro do Departamento

**O que acontece:**
1. Líder/Pastor remove membro do departamento
2. Sistema executa `removeMemberFromDepartment(departmentId, userId)`:
   - ✅ Remove `userId` do array `members` do departamento
   - ✅ Remove `departmentId` do array `departmentIds` do usuário

**Resultado:**
- Sincronização completa, usuário não aparece mais no departamento

## 📋 Fluxo Correto de Cadastro

### Opção A: Cadastrar Membro SEM Departamento

1. Vá para `/membros`
2. Clique em "Novo Membro"
3. Preencha nome, email, senha
4. **Não selecione departamentos**
5. Cadastre
6. Vá para `/diaconato` (ou outro departamento)
7. Clique em "Adicionar Membro"
8. Selecione o membro recém-cadastrado
9. ✅ Sincronização completa!

### Opção B: Cadastrar Membro COM Departamento

1. Vá para `/membros`
2. Clique em "Novo Membro"
3. Preencha nome, email, senha
4. **Selecione departamento(s)** no campo "Departamentos"
5. Cadastre
6. ⚠️ **IMPORTANTE**: O membro terá `departmentIds` preenchido
7. **MAS** não aparecerá na listagem do departamento ainda
8. Vá para `/diaconato`
9. Clique em "Adicionar Membro"
10. Selecione o membro (ele aparecerá pois tem todos os usuários ativos)
11. ✅ Agora sim a sincronização está completa!

## 🔍 Queries Utilizadas

### Buscar Membros de um Departamento

```typescript
// userService.getUsersByDepartment(departmentId)
query(
  collection(db, 'users'),
  where('departmentIds', 'array-contains', departmentId),
  where('isActive', '==', true)
)
```

### Listar Todos os Usuários Ativos

```typescript
// userService.getUsers()
query(
  collection(db, 'users'),
  where('isActive', '==', true),
  limit(100)
)
```

## ⚠️ Observações Importantes

1. **Cadastro em `/membros`**: Apenas preenche `departmentIds` no usuário
2. **Adicionar em `/departamento`**: Sincroniza ambos os lados (members ↔ departmentIds)
3. **Array members no departamento**: É a fonte de verdade para membros ativos
4. **departmentIds no usuário**: Permite queries rápidas por departamento
5. **Ambos devem estar sincronizados** para o sistema funcionar corretamente

## 🧪 Testando a Sincronização

### Teste 1: Verificar Sincronização

1. Cadastre um membro em `/membros` e selecione "Diaconato"
2. Vá para Firebase Console → Firestore → `users` → Verifique o documento
3. ✅ `departmentIds` deve conter o ID do Diaconato
4. Vá para Firestore → `departments` → Diaconato → Verifique o documento
5. ❌ `members` ainda NÃO contém o UID do usuário
6. Agora vá para `/diaconato` no app
7. Clique em "Adicionar Membro" e selecione o usuário
8. Volte ao Firebase Console → `departments` → Diaconato
9. ✅ Agora `members` contém o UID!

### Teste 2: Remover e Verificar

1. Na página `/diaconato`, remova um membro
2. Verifique no Firebase Console:
   - ✅ `members` do departamento não tem mais o UID
   - ✅ `departmentIds` do usuário não tem mais o department ID

## 🚀 Melhorias Futuras

### Cloud Functions (Recomendado)

Criar Firebase Cloud Functions para sincronização automática:

```typescript
// functions/src/index.ts
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const departmentIds = userData.departmentIds || [];
    
    // Adicionar userId ao array members de cada departamento
    for (const deptId of departmentIds) {
      await admin.firestore()
        .collection('departments')
        .doc(deptId)
        .update({
          members: admin.firestore.FieldValue.arrayUnion(context.params.userId)
        });
    }
  });
```

Isso eliminaria a necessidade de adicionar manualmente no departamento!

## 📝 Resumo

✅ **O que está funcionando:**
- Cadastro de membros com Authentication
- Listagem de membros por departamento
- Sincronização bidirecional ao adicionar/remover membros
- Queries sem necessidade de índices compostos

⚠️ **Atenção:**
- Selecionar departamentos em `/membros` não sincroniza automaticamente o array `members`
- É necessário adicionar o membro via página do departamento para sincronização completa
- Futuramente, Cloud Functions podem automatizar isso

✨ **Recomendação:**
Por enquanto, o fluxo ideal é:
1. Cadastrar membro em `/membros` SEM selecionar departamentos
2. Adicionar aos departamentos via páginas específicas (`/diaconato`, etc.)
3. Isso garante sincronização completa!
