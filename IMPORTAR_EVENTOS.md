# 🚀 Guia Rápido: Importar Eventos de Outubro/2025

## Como Usar o Botão de Importação

### Passo 1: Acesse a Agenda
1. Faça login como **Pastor** ou **Líder**
2. Clique em **"Agenda do Mês"** no menu lateral
3. A página `/agenda` será aberta

### Passo 2: Navegue até Outubro/2025
1. Use as setas `< >` para navegar entre meses
2. Vá até **Outubro 2025**

### Passo 3: Clique em "Importar Outubro"
1. Se não houver eventos cadastrados em Outubro/2025
2. Você verá um botão azul **"Importar Outubro"** ao lado de "Novo Evento"
3. Clique nele

### Passo 4: Confirme a Importação
1. Uma janela de confirmação aparecerá:
   ```
   Isso irá adicionar 10 eventos de Outubro/2025. 
   Deseja continuar?
   ```
2. Clique em **"OK"**

### Passo 5: Aguarde a Importação
1. O botão mudará para **"Importando..."**
2. Aguarde alguns segundos
3. Uma mensagem de sucesso aparecerá:
   ```
   ✅ Todos os 10 eventos foram criados com sucesso!
   ```

### Passo 6: Visualize os Eventos
1. Os eventos aparecerão automaticamente no calendário
2. Você pode alternar entre visualização de **Calendário** e **Lista**

---

## 📅 Eventos que Serão Importados

| Data | Dia | Evento | Tipo | Horário |
|------|-----|--------|------|---------|
| 02/10 | Qui | Esquenta Conferência Jovem | 🟠 Esquenta | 19:00 |
| 05/10 | Dom | Culto de Celebração | 🔵 Culto | 19:00 |
| 09/10 | Qui | Esquenta Conferência Jovem | 🟠 Esquenta | 19:00 |
| 12/10 | Dom | Santa Ceia | 🟣 Santa Ceia | 19:00 |
| 16/10 | Qui | Esquenta Conferência Jovem | 🟠 Esquenta | 19:00 |
| 18/10 | Sáb | Conferência Jovem | 🔴 Conferência | 19:00 |
| 19/10 | Dom | Conferência Jovem | 🔴 Conferência | 19:00 |
| 23/10 | Qui | Culto de Celebração JP | 🔵 Culto JP | 19:00 |
| 26/10 | Dom | Culto de Celebração | 🔵 Culto | 19:00 |
| 30/10 | Qui | Culto de Celebração JP | 🔵 Culto JP | 19:00 |

---

## ⚠️ Importante

### O botão "Importar Outubro" só aparece quando:
1. ✅ Você está logado como **Pastor** ou **Líder**
2. ✅ Está visualizando **Outubro de 2025**
3. ✅ **NÃO** há eventos cadastrados em Outubro/2025

### Se você não vê o botão:
- Verifique se já existem eventos em Outubro/2025
- Verifique se está no mês correto
- Verifique se tem permissão (Pastor/Líder)

### Execute apenas UMA vez!
- A importação cria 10 novos eventos
- Se executar novamente, criará eventos duplicados
- Se isso acontecer, delete os duplicados manualmente

---

## 🎨 Visualização no Calendário

Após a importação, o calendário de Outubro ficará assim:

```
┌─────────────────────────────────────────────────┐
│         <    Outubro 2025    >                  │
├─────────────────────────────────────────────────┤
│ Dom  Seg  Ter  Qua  Qui  Sex  Sáb              │
│                 1    2    3    4                │
│                     🟠                          │
│  5    6    7    8    9   10   11                │
│ 🔵                  🟠                          │
│ 12   13   14   15   16   17   18                │
│ 🟣                  🟠       🔴                │
│ 19   20   21   22   23   24   25                │
│ 🔴                  🔵                          │
│ 26   27   28   29   30   31                     │
│ 🔵                  🔵                          │
└─────────────────────────────────────────────────┘

Legenda:
🔵 Culto de Celebração / Culto JP
🟣 Santa Ceia
🟠 Esquenta
🔴 Conferência
```

---

## 🔧 Para Outros Meses

### Opção 1: Adicionar Manualmente
1. Clique em **"Novo Evento"**
2. Preencha o formulário
3. Clique em **"Criar Evento"**

### Opção 2: Duplicar Eventos Existentes
1. Na visualização de **Lista**
2. Clique no ícone **📋 (Copiar)** de um evento
3. Altere a data
4. Clique em **"Criar Evento"**

### Opção 3: Solicitar Importação para Outro Mês
- Entre em contato com o desenvolvedor
- Informe os eventos do mês desejado
- Um novo script de importação será criado

---

## 🐛 Troubleshooting

### Problema: Botão não aparece
**Solução**:
```
1. Verifique se está em Outubro/2025
2. Verifique se não há eventos cadastrados
3. Faça logout e login novamente
4. Verifique seu role (deve ser pastor ou lider)
```

### Problema: Importação falhou
**Solução**:
```
1. Verifique sua conexão com internet
2. Verifique console do navegador (F12)
3. Verifique permissões do Firestore
4. Tente novamente em alguns minutos
```

### Problema: Eventos duplicados
**Solução**:
```
1. Vá para visualização de Lista
2. Clique em 🗑️ para deletar duplicados
3. Confirme a exclusão
```

### Problema: Erro "Usuário não autenticado"
**Solução**:
```
1. Faça logout
2. Faça login novamente
3. Aguarde alguns segundos
4. Tente importar novamente
```

---

## 💡 Dicas

### Dica 1: Edite após importar
- Os eventos são importados com configurações padrão
- Você pode editá-los depois para adicionar descrições
- Clique no evento para editar

### Dica 2: Verifique antes de criar escalas
- Certifique-se que todos os eventos estão corretos
- Verifique datas e horários
- Ajuste se necessário

### Dica 3: Use cores para organizar
- Cada tipo de evento tem uma cor
- Facilita visualização no calendário
- Esquenta = Laranja, Culto = Azul, etc.

---

## 📊 Tecnologia Usada

### Script de Importação
- **Arquivo**: `src/utils/seedOctoberEvents.ts`
- **Função**: `seedOctoberEvents(userId)`
- **Service**: `EventService.createEvent()`
- **Collection**: `events` no Firestore

### Dados Importados
```typescript
{
  title: string,        // "Culto de Celebração"
  type: EventType,      // "culto_celebracao"
  date: Date,           // new Date('2025-10-05T19:00:00')
  time: string,         // "19:00"
  description: string,  // Opcional
  month: number,        // 10
  year: number,         // 2025
  color: string,        // "#1976d2"
  isActive: true,
  createdBy: userId
}
```

---

## ✅ Checklist Pós-Importação

Após importar os eventos, verifique:

- [ ] Todos os 10 eventos estão no calendário
- [ ] Datas estão corretas (02, 05, 09, 12, 16, 18, 19, 23, 26, 30)
- [ ] Horários estão corretos (todos às 19:00)
- [ ] Cores estão corretas por tipo
- [ ] Não há eventos duplicados
- [ ] Descrições adicionadas (se necessário)

---

## 🎯 Próximo Passo

Após ter a agenda de Outubro completa:

1. ✅ Eventos importados
2. ➡️ Criar escalas por departamento
3. ➡️ Atribuir membros às funções
4. ➡️ Publicar escalas
5. ➡️ Notificar membros

**A agenda organizada é a base para escalas eficientes!** 🚀
