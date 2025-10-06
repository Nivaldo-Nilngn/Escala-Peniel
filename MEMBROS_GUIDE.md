# Guia de Teste - Página de Membros

Este guia explica como testar a funcionalidade de cadastro e gerenciamento de membros.

## 📋 Pré-requisitos

1. **Criar um Departamento**: Antes de adicionar membros, você precisa ter pelo menos um departamento criado.
   - Acesse `/diaconato` 
   - Se não existir, clique em "Criar Departamento" (apenas Pastor)
   - O departamento será criado automaticamente

## 🧑‍🤝‍🧑 Testando o Cadastro de Membros

### 1. Acessar a Página

1. Faça login como **Pastor** ou **Líder**
2. No menu lateral (☰), clique em **"Membros"** na seção **GERAL**
3. Você será direcionado para: `http://localhost:3000/membros`

### 2. Cadastrar um Novo Membro

1. Clique no botão **"+ Novo Membro"** no canto superior direito (ou no botão flutuante + no mobile)
2. Preencha o formulário:
   - **Nome completo**: Ex: "João Silva"
   - **Email**: Ex: "joao@peniel.com" (deve ser único)
   - **Telefone**: Ex: "(11) 98765-4321" (opcional)
   - **Senha**: Mínimo 6 caracteres (será usada para login)
   - **Confirmar Senha**: Repita a senha
   - **Função**: Selecione entre:
     - **Membro**: Acesso básico
     - **Líder**: Pode gerenciar departamentos
     - **Pastor**: Acesso total (apenas Pastor pode criar outro Pastor)
   - **Departamentos**: Selecione um ou mais departamentos (múltipla seleção)
3. Clique em **"Cadastrar"**
4. Uma mensagem de sucesso será exibida

**O que acontece no backend:**
1. ✅ Usuário é criado no **Firebase Authentication** com email e senha
2. ✅ O **UID** gerado pelo Authentication é usado como ID do documento
3. ✅ Documento é criado no **Firestore** collection `users` com o UID
4. ✅ Usuário pode fazer login imediatamente com email e senha cadastrados

### 3. Ver Lista de Membros

A tabela mostra:
- Nome
- Email
- Telefone
- Função (com chip colorido)
- Departamentos associados
- Ações (Editar/Excluir) - apenas para Pastor/Líder

### 4. Editar um Membro

1. Clique no ícone de **lápis (✏️)** na linha do membro (ou botão "Editar" no mobile)
2. O formulário será aberto com os dados preenchidos
3. **Observação**: O email não pode ser editado (é usado para login)
4. **Observação**: A senha não pode ser alterada aqui (usuário deve redefinir via "Esqueci minha senha")
5. Faça as alterações necessárias (nome, telefone, função, departamentos)
6. Clique em **"Salvar"**

### 5. Excluir um Membro

1. Clique no ícone de **lixeira (🗑️)** na linha do membro
2. Confirme a exclusão
3. O membro será marcado como inativo (`isActive: false`)
4. **Observação**: O membro não é deletado permanentemente, apenas desativado

## 🔐 Controle de Acesso

### Pastor
- ✅ Pode cadastrar novos membros
- ✅ Pode editar todos os membros
- ✅ Pode excluir membros
- ✅ Pode criar outros Pastores

### Líder
- ✅ Pode cadastrar novos membros
- ✅ Pode editar todos os membros
- ✅ Pode excluir membros
- ❌ Não pode criar Pastores

### Membro
- ❌ Não pode acessar a página de membros
- ❌ Não vê o link no menu

## 🎨 Interface

### Responsividade

A página se adapta automaticamente ao tamanho da tela:

#### 📱 Mobile (Smartphones)
- **Lista em Cards**: Em vez de tabela, cada membro aparece em um card individual
- **Informações Completas**: Nome, email, telefone, função e departamentos
- **Botões Destacados**: "Editar" e "Excluir" aparecem como botões no rodapé do card
- **Formulário Full-Screen**: O dialog de cadastro ocupa a tela inteira
- **Botões em Largura Total**: Mais fácil de clicar em telas pequenas
- **Emojis Visuais**: 📧 para email, 📱 para telefone

#### 💻 Tablet
- **Tabela Compacta**: Tabela com menos colunas (esconde email e telefone)
- **Tamanho Reduzido**: Fonte e espaçamento otimizados
- **2 Cards por linha**: Para estatísticas e seções

#### 🖥️ Desktop
- **Tabela Completa**: Todas as colunas visíveis (Nome, Email, Telefone, Função, Departamentos, Ações)
- **4 Cards por linha**: Para estatísticas
- **Hover Effects**: Efeitos ao passar o mouse
- **Dialog Modal**: Formulário aparece como popup

### Chips de Função (Papel)
- **Pastor**: Chip azul (primary)
- **Líder**: Chip roxo (secondary)
- **Membro**: Chip cinza (default)

### Seleção Múltipla de Departamentos
- Permite selecionar vários departamentos por membro
- Mostra chips coloridos com os nomes dos departamentos selecionados
- Na tabela (desktop), os departamentos aparecem separados por vírgula
- No mobile, aparecem como chips abaixo do nome

## 🧪 Cenários de Teste

### Teste 1: Cadastro Básico
1. Criar um membro com apenas nome e email
2. Não selecionar departamento
3. Verificar que foi criado com sucesso
4. Verificar que aparece na lista com "Nenhum" em departamentos

### Teste 2: Membro com Múltiplos Departamentos
1. Criar departamentos: Diaconato, Louvor, Mídia
2. Cadastrar um membro e selecionar os 3 departamentos
3. Verificar que os 3 aparecem na coluna "Departamentos"

### Teste 3: Edição de Função
1. Criar um membro com função "Membro"
2. Editar e alterar para "Líder"
3. Verificar que o chip mudou de cinza para roxo

### Teste 4: Validação de Email Único
1. Cadastrar um membro: teste@peniel.com
2. Tentar cadastrar outro com o mesmo email
3. Deve mostrar erro do Firestore (email duplicado)

### Teste 5: Acesso como Membro
1. Fazer login como usuário com papel "Membro"
2. Verificar que o link "Membros" não aparece no menu
3. Tentar acessar diretamente `/membros`
4. Deve aparecer apenas visualização (sem botões de ação)

## 🔍 Verificação no Firebase

Após cadastrar membros, verifique no Firebase Console:

### Firebase Authentication
1. Acesse **Authentication** → **Users**
2. Verifique os usuários criados com email
3. Note o **UID** de cada usuário

### Firestore Database
1. Acesse **Firestore Database**
2. Abra a coleção **users**
3. Verifique que o **Document ID** é o mesmo **UID** do Authentication
4. Estrutura do documento:
   ```json
   {
     email: "joao@peniel.com",
     name: "João Silva",
     phone: "(11) 98765-4321",
     role: "membro",
     departmentIds: ["dept-id-1", "dept-id-2"],
     isActive: true,
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

### Testando o Login
1. Faça logout do sistema
2. Vá para `/login`
3. Use o **email** e **senha** cadastrados
4. O usuário deve conseguir fazer login com sucesso

## ⚠️ Observações Importantes

1. **ID do Documento**: O ID do documento no Firestore é o **UID** do Firebase Authentication
2. **Email = Login**: O email cadastrado é usado para fazer login no sistema
3. **Senha Inicial**: A senha definida no cadastro é a senha de login do usuário
4. **Email Único**: Cada membro deve ter um email único (validado pelo Firebase Auth)
5. **Departamentos**: Certifique-se de criar departamentos antes de adicionar membros
6. **Soft Delete**: Membros excluídos são marcados como `isActive: false` (não são deletados do Authentication)
7. **Paginação**: Atualmente mostrando até 100 membros (pode ser ajustado)
8. **Senha Mínima**: Firebase exige mínimo de 6 caracteres

## 🐛 Possíveis Problemas

### "Nenhum membro cadastrado"
- Verifique se há usuários na coleção `users` do Firestore
- Verifique se os usuários têm `isActive: true`

### Departamentos não aparecem
- Verifique se os departamentos existem na coleção `departments`
- Verifique se os IDs em `departmentIds` correspondem aos IDs dos documentos

### Erro ao cadastrar
- **"Este email já está em uso"**: O email já tem uma conta no Firebase Authentication
- **"Email inválido"**: Formato de email incorreto
- **"A senha deve ter pelo menos 6 caracteres"**: Senha muito curta
- **"As senhas não coincidem"**: Senha e confirmação diferentes
- Verifique o console do navegador (F12) para erros detalhados

## 📝 Próximos Passos

Após testar o cadastro de membros, você pode:
1. Ir para `/diaconato` e adicionar os membros cadastrados ao departamento
2. Criar funções (Porta, Corredor, Altar, etc.)
3. Criar escalas mensais atribuindo membros às funções
