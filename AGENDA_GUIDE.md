# Guia da Agenda do Mês

## Visão Geral

A página **Agenda do Mês** permite que Pastores e Líderes gerenciem todos os eventos da igreja mês a mês. Esta é a base para a criação de escalas posteriores.

**Rota**: `/agenda`

---

## Funcionalidades

### 1. **Visualização de Calendário**
- Mostra todos os eventos do mês em formato de calendário
- Cada evento tem uma cor baseada no seu tipo
- Dias com eventos exibem chips coloridos
- Dia atual é destacado em azul claro

### 2. **Visualização de Lista**
- Mostra eventos em lista ordenada por data
- Exibe:
  - Título do evento
  - Tipo (com chip colorido)
  - Data e dia da semana
  - Horário
  - Descrição

### 3. **Navegação entre Meses**
- Botões `<` e `>` para navegar entre meses
- Exibe: "Outubro 2025"
- Muda automaticamente o ano ao passar de dezembro para janeiro

### 4. **Adicionar Eventos** (Pastor/Líder)
- Clique em "Novo Evento"
- Preencha:
  - **Título**: Nome do evento (ex: "Culto de Celebração")
  - **Tipo**: Selecione o tipo de evento
  - **Data**: Data do evento (formato: AAAA-MM-DD)
  - **Horário**: Hora de início (formato: HH:MM)
  - **Descrição** (opcional): Informações adicionais

### 5. **Editar Eventos** (Pastor/Líder)
- Clique no chip do evento no calendário, ou
- Clique no ícone de editar (✏️) na lista
- Modifique os campos desejados
- Clique em "Salvar"

### 6. **Duplicar Eventos** (Pastor/Líder)
- Útil para eventos recorrentes
- Clique no ícone de copiar (📋) na lista
- Formulário abre pré-preenchido
- Altere a data e crie

### 7. **Excluir Eventos** (Pastor/Líder)
- Clique no ícone de deletar (🗑️) na lista
- Confirme a exclusão
- Evento é marcado como inativo (soft delete)

---

## Tipos de Eventos

### Culto de Celebração
- **Cor**: Azul (#1976d2)
- **Uso**: Cultos dominicais regulares
- **Exemplo**: "05/10 (domingo): Culto de Celebração"

### Santa Ceia
- **Cor**: Roxo (#7b1fa2)
- **Uso**: Cultos com santa ceia
- **Exemplo**: "12/10 (domingo): Santa Ceia"

### Culto de Celebração JP
- **Cor**: Azul Claro (#0288d1)
- **Uso**: Cultos de quinta-feira (Jovens e Profissionais)
- **Exemplo**: "23/10 (quinta-feira): Culto de Celebração JP"

### Conferência
- **Cor**: Vermelho (#d32f2f)
- **Uso**: Eventos especiais como conferências
- **Exemplo**: "18/10 (sábado): Conferência Jovem"

### Esquenta
- **Cor**: Laranja (#f57c00)
- **Uso**: Eventos de preparação para conferências
- **Exemplo**: "02/10 (quinta-feira): Esquenta Conferência Jovem"

### Ensaio
- **Cor**: Verde (#388e3c)
- **Uso**: Ensaios de louvor, teatro, etc.

### Reunião
- **Cor**: Cinza (#455a64)
- **Uso**: Reuniões administrativas, de líderes, etc.

### Outro
- **Cor**: Cinza Escuro (#616161)
- **Uso**: Eventos que não se encaixam nas categorias acima

---

## Como Adicionar os Eventos de Outubro/2025

### Exemplo Prático

1. Acesse `/agenda`
2. Navegue até **Outubro 2025** (use as setas se necessário)
3. Clique em **"Novo Evento"**

#### Evento 1: Esquenta (02/10)
```
Título: Esquenta Conferência Jovem
Tipo: Esquenta
Data: 2025-10-02
Horário: 19:00
Descrição: (opcional)
```

#### Evento 2: Culto de Celebração (05/10)
```
Título: Culto de Celebração
Tipo: Culto de Celebração
Data: 2025-10-05
Horário: 19:00
Descrição: (opcional)
```

#### Evento 3: Esquenta (09/10)
```
Título: Esquenta Conferência Jovem
Tipo: Esquenta
Data: 2025-10-09
Horário: 19:00
Descrição: (opcional)
```

#### Evento 4: Santa Ceia (12/10)
```
Título: Santa Ceia
Tipo: Santa Ceia
Data: 2025-10-12
Horário: 19:00
Descrição: (opcional)
```

#### Evento 5: Esquenta (16/10)
```
Título: Esquenta Conferência Jovem
Tipo: Esquenta
Data: 2025-10-16
Horário: 19:00
Descrição: (opcional)
```

#### Evento 6: Conferência (18/10)
```
Título: Conferência Jovem
Tipo: Conferência
Data: 2025-10-18
Horário: 19:00
Descrição: (opcional)
```

#### Evento 7: Conferência (19/10)
```
Título: Conferência Jovem
Tipo: Conferência
Data: 2025-10-19
Horário: 19:00
Descrição: (opcional)
```

#### Evento 8: Culto JP (23/10)
```
Título: Culto de Celebração JP
Tipo: Culto de Celebração JP
Data: 2025-10-23
Horário: 19:00
Descrição: (opcional)
```

#### Evento 9: Culto de Celebração (26/10)
```
Título: Culto de Celebração
Tipo: Culto de Celebração
Data: 2025-10-26
Horário: 19:00
Descrição: (opcional)
```

#### Evento 10: Culto JP (30/10)
```
Título: Culto de Celebração JP
Tipo: Culto de Celebração JP
Data: 2025-10-30
Horário: 19:00
Descrição: (opcional)
```

---

## Dica: Usar Duplicação para Eventos Recorrentes

Se você tem eventos que se repetem (como "Esquenta Conferência Jovem"), pode:

1. Criar o primeiro evento
2. Na lista, clicar no ícone de **copiar (📋)**
3. Alterar apenas a data
4. Clicar em "Criar Evento"

Isso economiza tempo ao não precisar preencher título, tipo e horário novamente!

---

## Estrutura de Dados (Firestore)

### Collection: `events`

```typescript
{
  id: string,                    // ID automático do Firestore
  title: string,                 // "Culto de Celebração"
  type: EventType,               // "culto_celebracao"
  date: Timestamp,               // Data e hora do evento
  time: string,                  // "19:00"
  description: string,           // Opcional
  month: number,                 // 10 (outubro)
  year: number,                  // 2025
  color: string,                 // "#1976d2"
  isActive: boolean,             // true
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string              // ID do usuário
}
```

### Tipos de Eventos (EventType)
```typescript
type EventType = 
  | 'culto_celebracao'
  | 'santa_ceia'
  | 'culto_jp'
  | 'conferencia'
  | 'esquenta'
  | 'ensaio'
  | 'reuniao'
  | 'outro';
```

---

## Permissões

### Pastor
- ✅ Criar eventos
- ✅ Editar qualquer evento
- ✅ Excluir qualquer evento
- ✅ Duplicar eventos
- ✅ Visualizar todos os eventos

### Líder
- ✅ Criar eventos
- ✅ Editar qualquer evento
- ✅ Excluir qualquer evento
- ✅ Duplicar eventos
- ✅ Visualizar todos os eventos

### Membro
- ✅ Visualizar todos os eventos
- ❌ Não pode criar/editar/excluir eventos

---

## Fluxo de Trabalho Recomendado

### 1. **Início do Mês**
- Pastor/Líder acessa `/agenda`
- Adiciona todos os eventos do mês atual
- Pode também adicionar eventos dos meses seguintes

### 2. **Durante o Mês**
- Ajusta horários se necessário
- Adiciona eventos extras (reuniões, ensaios)
- Remove eventos cancelados

### 3. **Criação de Escalas** (Futuro)
- Após ter eventos cadastrados na agenda
- Acessa página de criação de escalas
- Seleciona um evento da agenda
- Atribui membros às funções dos departamentos

---

## Queries Firestore

### Buscar eventos de um mês
```typescript
// Exemplo: Outubro/2025
const events = await EventService.getEventsByMonth(10, 2025);
```

### Buscar todos os eventos ativos
```typescript
const allEvents = await EventService.getAllEvents();
```

### Buscar eventos por tipo
```typescript
const conferences = await EventService.getEventsByType('conferencia');
```

---

## Interface do Usuário

### Modo Calendário
```
┌─────────────────────────────────────────────┐
│  <    Outubro 2025    >   [Calendário|Lista]│
├─────────────────────────────────────────────┤
│ Dom  Seg  Ter  Qua  Qui  Sex  Sáb           │
│                 1    2    3    4             │
│                     [Esquenta]               │
│  5    6    7    8    9   10   11             │
│ [Culto]                [Esquenta]            │
│ 12   13   14   15   16   17   18             │
│[Santa Ceia]          [Esquenta] [Conf]       │
│ 19   20   21   22   23   24   25             │
│[Conf]                [Culto JP]              │
│ 26   27   28   29   30   31                  │
│[Culto]              [Culto JP]               │
└─────────────────────────────────────────────┘
```

### Modo Lista
```
┌─────────────────────────────────────────────┐
│  <    Outubro 2025    >   [Calendário|Lista]│
├─────────────────────────────────────────────┤
│ • Esquenta Conferência Jovem                │
│   02/10 (Qui) às 19:00       [📋][✏️][🗑️]  │
├─────────────────────────────────────────────┤
│ • Culto de Celebração                       │
│   05/10 (Dom) às 19:00       [📋][✏️][🗑️]  │
├─────────────────────────────────────────────┤
│ • Santa Ceia                                │
│   12/10 (Dom) às 19:00       [📋][✏️][🗑️]  │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### Problema: Não consigo criar evento
**Solução**: 
1. Verifique se você tem role `pastor` ou `lider`
2. Verifique se todos os campos obrigatórios estão preenchidos (Título e Data)
3. Verifique console do navegador para erros

### Problema: Evento não aparece no calendário
**Solução**:
1. Verifique se a data está correta
2. Verifique se você está no mês certo
3. Recarregue a página

### Problema: Cor do evento está errada
**Solução**:
1. A cor é definida automaticamente pelo tipo
2. Edite o evento e altere o tipo se necessário

### Problema: Erro ao salvar no Firestore
**Solução**:
1. Verifique regras de segurança do Firestore
2. Verifique se collection `events` existe
3. Veja console do Firebase para detalhes

---

## Próximos Passos

Após ter a agenda do mês cadastrada, você poderá:

1. **Criar Escalas** (em desenvolvimento)
   - Selecionar evento da agenda
   - Atribuir membros de cada departamento às funções
   - Definir horários de chegada
   - Publicar escala

2. **Notificações** (futuro)
   - Notificar membros quando escala for publicada
   - Lembretes antes do evento

3. **Relatórios** (futuro)
   - Estatísticas de participação
   - Membros mais ativos
   - Eventos com maior/menor participação

---

## Exportar/Importar Agenda

### Formato JSON para Importação Rápida
```json
[
  {
    "title": "Esquenta Conferência Jovem",
    "type": "esquenta",
    "date": "2025-10-02",
    "time": "19:00"
  },
  {
    "title": "Culto de Celebração",
    "type": "culto_celebracao",
    "date": "2025-10-05",
    "time": "19:00"
  }
  // ... outros eventos
]
```

**Nota**: Funcionalidade de importação em lote será adicionada em versão futura.

---

## Conclusão

A página de Agenda do Mês é a **fundação** do sistema de escalas:

1. ✅ **Primeiro**, cadastre todos os eventos do mês aqui
2. ✅ **Depois**, crie escalas baseadas nesses eventos
3. ✅ **Por fim**, publique e notifique os membros

**A agenda organizada garante escalas bem planejadas!** 🎯
