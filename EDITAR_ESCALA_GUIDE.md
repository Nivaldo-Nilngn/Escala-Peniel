# GUIA: Edição de Escalas

## O que foi implementado

### 1. **Nova Página: EditarEscala.tsx**
- Página dedicada para edição de escalas existentes
- Carrega todos os dados da escala automaticamente
- Permite alterar: evento, horários, cores, membros, observações
- Validações completas antes de salvar

### 2. **Novo Método: getDepartmentScheduleById()**
- Adicionado em `scheduleService.ts`
- Busca uma escala específica por ID no Firestore
- Converte timestamps do Firebase para Date

### 3. **Nova Rota: /editar-escala/:scheduleId**
- Adicionada em `App.tsx`
- Protegida com autenticação (PrivateRoute)
- Integrada ao Layout padrão

### 4. **Botão "Editar" Funcional**
- Antes: Mostrava mensagem "será implementada em breve"
- Agora: Navega para página de edição
- Localização: Cards de escala na aba "Escalas" do Diaconato

## Como testar

### Pré-requisitos
1. ✅ Ter membros cadastrados no Diaconato
2. ✅ Ter funções cadastradas (Porta, Corredor, Altar, etc)
3. ✅ Ter eventos cadastrados na Agenda
4. ✅ Ter pelo menos uma escala criada

### Se o botão "Criar Escala" está desabilitado:

**Problema:** O botão fica cinza e não funciona

**Solução:**
1. Vá para `/diaconato`
2. Verifique a **aba "Membros"**:
   - Deve ter pelo menos 1 membro cadastrado
   - Se não tiver, clique em "Adicionar Membro" e adicione
3. Verifique a **aba "Funções"**:
   - Deve ter pelo menos 1 função (ex: "Porta Principal")
   - Se não tiver, clique em "Adicionar Função" e adicione:
     - Nome: "Porta Principal"
     - Descrição: "Responsável pela entrada principal"
     - Obrigatório: Sim
4. Volte para a **aba "Escalas"**
5. O botão "Criar Escala" agora deve estar AZUL e clicável

### Testar criação de escala:

1. **Acessar:** `/diaconato` → Aba "Escalas"
2. **Clicar:** Botão "Criar Escala" (azul)
3. **Selecionar:** Um evento (clique em um card)
4. **Preencher:**
   - Horários (já vem preenchido)
   - Cores (já vem com cores padrão)
   - Atribuir um membro para CADA função
   - Observações (opcional)
5. **Salvar:** Clique em "Salvar Escala"
6. **Resultado:** Volta para `/diaconato` e escala aparece listada

### Testar edição de escala:

1. **Acessar:** `/diaconato` → Aba "Escalas"
2. **Localizar:** Uma escala existente (card expandido ou colapsado)
3. **Expandir:** Clique na setinha ⬇️ se estiver colapsado
4. **Clicar:** Botão "EDITAR" (azul, com ícone de lápis)
5. **Editar:**
   - Mudar evento (se quiser)
   - Alterar horários
   - Trocar cores
   - Realocar membros para outras funções
   - Adicionar/editar observações
6. **Salvar:** Clique em "Salvar Alterações"
7. **Resultado:** Volta para `/diaconato` e escala aparece atualizada

### Testar exclusão de escala:

1. **Acessar:** `/diaconato` → Aba "Escalas"
2. **Expandir:** Card da escala (setinha ⬇️)
3. **Clicar:** Botão "EXCLUIR" (vermelho)
4. **Confirmar:** Dialog de confirmação
5. **Resultado:** Escala é removida da lista e do Firebase

## Estrutura de Dados

### Escala no Firestore (departmentSchedules):
```javascript
{
  id: "abc123",
  departmentId: "365jfYtgyfj6hlbmENhT",
  departmentName: "Diaconato",
  eventId: "evento-001",
  eventTitle: "Culto de Celebração",
  eventDate: Timestamp,
  assignments: [
    {
      userId: "user-001",
      userName: "João Silva",
      functionId: "func-porta",
      functionName: "Porta Principal"
    },
    // ... mais assignments
  ],
  arrivalTime: "17:40",
  eventStartTime: "18:30",
  colorPalette: {
    primary: "#1976d2",
    secondary: "#dc004e",
    accent: "#ff9800",
    description: "Azul, Rosa e Laranja"
  },
  notes: "Observações...",
  isPublished: false,
  createdBy: "user-admin",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Funcionalidades da Edição

### ✅ Carregamento Automático
- Busca escala por ID
- Carrega departamento associado
- Carrega funções atuais do departamento
- Carrega membros ativos
- Carrega eventos do mês
- Preenche formulário com dados existentes

### ✅ Validações
- Evento deve ser selecionado
- Horários obrigatórios
- Todos os membros devem ser atribuídos
- Não permite membro duplicado em múltiplas funções
- Descrição da paleta obrigatória

### ✅ Interface
- Botão "Voltar" para retornar ao Diaconato
- Alert informando evento original
- Formulário simplificado (sem cards visuais de eventos)
- Feedback visual (loading, success, error)
- Redirecionamento automático após salvar

## Diferenças: Criar vs Editar

| Funcionalidade | Criar Escala | Editar Escala |
|---------------|--------------|---------------|
| Seleção de Evento | Cards visuais (calendário) | Dropdown simples |
| Dados Iniciais | Vazios | Preenchidos automaticamente |
| Botão Principal | "Salvar Escala" | "Salvar Alterações" |
| Após Salvar | Cria novo documento | Atualiza documento existente |
| Rota | `/criar-escala/:departmentId` | `/editar-escala/:scheduleId` |
| Parâmetro | ID do departamento | ID da escala |

## Troubleshooting

### "Botão Criar Escala está cinza/desabilitado"
- **Causa:** Falta membros ou funções no departamento
- **Solução:** Cadastre pelo menos 1 membro e 1 função

### "Erro ao carregar escala"
- **Causa:** ID da escala inválido ou escala foi excluída
- **Solução:** Volte para lista de escalas e tente outra

### "Erro ao salvar alterações"
- **Causa:** Validação falhou ou problema no Firestore
- **Solução:** Verifique se preencheu todos os campos obrigatórios

### "Página não encontrada ao clicar em Editar"
- **Causa:** Rota não foi adicionada ou app não foi recarregado
- **Solução:** Recarregue a página (F5) ou reinicie o servidor

## Próximos Passos (Futuro)

- [ ] Publicar/despublicar escalas
- [ ] Notificar membros quando escalados
- [ ] Histórico de alterações
- [ ] Conflitos de escalas (mesmo membro em múltiplos eventos)
- [ ] Exportar escala em PDF
- [ ] Enviar escala por WhatsApp/Email

## Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Ver logs do Firebase
# Abra DevTools (F12) → Console

# Limpar cache e recarregar
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

## Firebase Console

Para verificar se as alterações foram salvas:
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Firestore Database
4. Coleção: `departmentSchedules`
5. Encontre o documento da escala
6. Veja campo `updatedAt` (deve ser recente)

---

**Status:** ✅ Implementado e funcionando
**Data:** 04/10/2025
**Versão:** 1.0
