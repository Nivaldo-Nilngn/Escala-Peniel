# Guia de Criação de Escalas - Sistema Escala Peniel

## Visão Geral
A funcionalidade de criação de escalas permite que pastores e líderes organizem as escalas de trabalho dos departamentos para eventos específicos, atribuindo membros às suas funções, definindo horários e estabelecendo um código de vestimenta através da paleta de cores.

## Acesso à Funcionalidade

### Navegação
1. Acesse a página do **Diaconato** (ou outro departamento)
2. Clique na aba **"Escalas"**
3. Clique no botão **"Criar Escala"**
4. Você será redirecionado para `/criar-escala/[departmentId]`

### Pré-requisitos
- Ter permissão de Pastor ou Líder
- O departamento deve ter pelo menos:
  - **1 membro ativo** cadastrado
  - **1 função** cadastrada
- Deve haver **eventos cadastrados** no mês atual ou futuro

## Interface de Criação

A página de criação de escala é dividida em 5 seções principais:

### 1. Seleção de Evento

**Campos:**
- Dropdown com lista de eventos disponíveis
- Mostra: Título do evento + Data + Horário

**Comportamento:**
- Lista apenas eventos **futuros** (data >= hoje)
- Eventos do **mês atual** são priorizados
- Ao selecionar um evento:
  - Chip com tipo do evento aparece
  - Horários são preenchidos automaticamente

**Exemplo:**
```
Culto de Celebração - 07/01/2025 às 19:30
```

### 2. Horários

**Campos:**
- **Horário de Chegada**: Quando os membros devem chegar
- **Início do Evento**: Horário oficial de início do culto/evento

**Horários Padrão (Auto-preenchidos):**

#### Domingo
- **Chegada**: 17:40
- **Início**: 18:30

#### Dias de Semana (Segunda a Sábado)
- **Chegada**: 18:50
- **Início**: 19:30

#### Conferências e Eventos Especiais
- Horários customizáveis (sem padrão)
- Baseado no horário do evento com 50 minutos de antecedência

**Lógica de Cálculo:**
```typescript
// Domingo
if (dayOfWeek === 0) {
  eventStartTime = '18:30'
  arrivalTime = '17:40'
}

// Dia de semana
else {
  eventStartTime = '19:30'
  arrivalTime = '18:50'
}

// Conferência
if (eventType === 'conferencia') {
  eventStartTime = event.time
  arrivalTime = event.time - 50 minutes
}
```

### 3. Paleta de Cores (Vestimenta)

**Objetivo:** Definir o código de vestimenta para o evento

**Campos:**
- **Cor Principal**: Cor primária do uniforme/roupa
- **Cor Secundária**: Cor de complemento
- **Cor de Destaque**: Detalhes (gravata, acessórios)
- **Descrição**: Texto livre descrevendo a vestimenta

**Exemplos de Descrições:**
- "Terno preto com gravata azul"
- "Camisa social branca e calça preta"
- "Roupa social escura"
- "Uniforme oficial do departamento"

**Preview Visual:**
- 3 quadrados coloridos mostram as cores selecionadas
- Atualiza em tempo real conforme o usuário escolhe as cores

### 4. Atribuir Membros às Funções

**Layout:**
- Tabela com 2 colunas:
  - **Função**: Nome da função (ex: Porta, Corredor, Altar)
  - **Membro Escalado**: Dropdown para selecionar o membro

**Regras:**
1. **Todas as funções** devem ter um membro atribuído
2. **Um membro não pode** estar em mais de uma função
3. Apenas **membros ativos** aparecem na lista

**Validações:**
- ❌ Não permite salvar se houver função sem membro
- ❌ Não permite duplicar membros em múltiplas funções
- ❌ Não permite conflitos (membro já escalado em outro departamento para o mesmo evento)

**Exemplo de Atribuição:**
```
+------------------+-------------------+
| Função           | Membro Escalado   |
+------------------+-------------------+
| Porta Principal  | João Silva        |
| Corredor         | Maria Santos      |
| Altar            | Pedro Oliveira    |
| Recepção         | Ana Costa         |
+------------------+-------------------+
```

### 5. Observações (Opcional)

**Campo:**
- Textarea de texto livre
- Máximo 500 caracteres (sugerido)

**Exemplos de Uso:**
- "Evento especial com convidados - todos uniformizados"
- "Culto de Santa Ceia - chegar com 1h de antecedência"
- "Reunião de oração - traje casual aceito"

## Resumo Visual

Aparece automaticamente quando **pelo menos um membro** for atribuído a uma função.

**Mostra:**

### Seção: Evento
- Título do evento (negrito)
- Data por extenso (ex: "domingo, 07 de janeiro de 2025")
- Horários: "🕐 Chegada: 17:40 | Início: 18:30"

### Seção: Vestimenta
- Preview das 3 cores (quadrados coloridos)
- Descrição da vestimenta

### Seção: Membros Escalados
- Cards com:
  - Nome da função (cor primária)
  - Nome do membro

**Layout Responsivo:**
- Desktop: 3 cards por linha
- Tablet: 2 cards por linha
- Mobile: 1 card por linha

## Salvamento e Validações

### Validações Antes de Salvar

1. **Evento Selecionado**
   - ❌ Erro: "Selecione um evento"

2. **Horários Preenchidos**
   - ❌ Erro: "Informe os horários de chegada e início do evento"

3. **Todas as Funções com Membros**
   - ❌ Erro: "Atribua membros para: [lista de funções]"

4. **Sem Membros Duplicados**
   - ❌ Erro: "Membros não podem estar em mais de uma função: [lista de membros]"

5. **Descrição da Paleta**
   - ❌ Erro: "Descreva a paleta de cores (ex: Terno preto)"

6. **Conflitos de Escala**
   - ❌ Erro: "Conflitos detectados: [lista de membros já escalados]"

### Processo de Salvamento

1. **Validar** todos os campos
2. **Verificar conflitos** com ScheduleService
3. **Criar objeto** DepartmentSchedule
4. **Salvar** no Firestore (collection `departmentSchedules`)
5. **Mostrar mensagem** de sucesso
6. **Redirecionar** para página do Diaconato após 2 segundos

### Estrutura de Dados Salva

```typescript
{
  departmentId: "diaconato-id",
  departmentName: "Diaconato",
  eventId: "event-id",
  eventTitle: "Culto de Celebração",
  eventDate: Date("2025-01-07"),
  assignments: [
    {
      userId: "user-id-1",
      userName: "João Silva",
      functionId: "function-id-1",
      functionName: "Porta Principal"
    },
    // ...mais atribuições
  ],
  arrivalTime: "17:40",
  eventStartTime: "18:30",
  colorPalette: {
    primary: "#000000",
    secondary: "#FFFFFF",
    accent: "#0000FF",
    description: "Terno preto com gravata azul"
  },
  notes: "Evento especial com convidados",
  isPublished: false, // Inicialmente não publicado
  createdBy: "pastor-user-id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Fluxo de Uso Completo

### Exemplo Prático

**Cenário:** Criar escala para Culto de Celebração de Domingo

1. **Acessar:** Diaconato > Escalas > Criar Escala

2. **Selecionar Evento:**
   - Escolher: "Culto de Celebração - 12/01/2025 às 18:30"
   - Sistema preenche: Chegada 17:40, Início 18:30

3. **Verificar Horários:**
   - Conferir se os horários estão corretos
   - Ajustar se necessário (eventos especiais)

4. **Definir Vestimenta:**
   - Cor Principal: Preto (#000000)
   - Cor Secundária: Branco (#FFFFFF)
   - Cor de Destaque: Azul (#0000FF)
   - Descrição: "Terno preto com gravata azul"

5. **Atribuir Membros:**
   - Porta Principal → João Silva
   - Corredor → Maria Santos
   - Altar → Pedro Oliveira
   - Recepção → Ana Costa

6. **Adicionar Observação:**
   - "Culto com batismo - todos devem estar uniformizados"

7. **Revisar Resumo:**
   - Verificar todas as informações no card de resumo

8. **Salvar:**
   - Clicar em "Salvar Escala"
   - Aguardar confirmação
   - Redirecionamento automático

## Estados da Interface

### Loading
- Aparece enquanto carrega:
  - Departamento
  - Funções
  - Membros
  - Eventos do mês
- Mostra CircularProgress centralizado

### Sem Eventos
```
⚠️ Nenhum evento disponível
```
- Dropdown de eventos desabilitado
- Sugestão: Cadastrar eventos na Agenda

### Sem Membros
```
⚠️ Nenhum membro ativo encontrado no departamento
```
- Tabela vazia
- Sugestão: Cadastrar membros no departamento

### Erro
```
❌ [Mensagem de erro específica]
```
- Alert vermelho no topo
- Permite fechar (x)

### Sucesso
```
✅ Escala criada com sucesso!
```
- Alert verde no topo
- Redireciona após 2 segundos

## Permissões

### Quem Pode Criar Escalas
- ✅ Pastor
- ✅ Líder
- ❌ Membro (apenas visualiza)

### Controle de Acesso
```typescript
const canEdit = hasRole(['Pastor', 'Líder']);
```

## Integração com Outros Módulos

### Eventos (Agenda)
- **Fonte:** EventService.getEventsByMonth()
- **Filtro:** Apenas eventos futuros (date >= hoje)
- **Uso:** Selecionar evento para criar escala

### Membros
- **Fonte:** UserService.getUsersByDepartment()
- **Filtro:** Apenas membros ativos (isActive = true)
- **Uso:** Atribuir membros às funções

### Funções
- **Fonte:** DepartmentService.getDepartmentFunctions()
- **Uso:** Listar funções que precisam ser preenchidas

### Verificação de Conflitos
- **Serviço:** ScheduleService.checkMemberConflicts()
- **Verifica:** Se membro já está escalado em outro departamento para o mesmo evento
- **Previne:** Sobrecarga de um membro

## Próximos Passos

Após criar uma escala, as próximas funcionalidades serão:

1. **Publicar Escala** - Tornar visível para os membros
2. **Notificar Membros** - Enviar push notifications
3. **Editar Escala** - Modificar atribuições
4. **Visualizar Escala** - Ver detalhes completos
5. **Confirmar Presença** - Membros confirmam participação
6. **Chat da Escala** - Comunicação entre membros

## Troubleshooting

### Problema: Botão "Salvar" desabilitado
**Causas:**
- Nenhum evento selecionado
- Processo de salvamento em andamento

**Solução:**
- Selecione um evento válido
- Aguarde salvamento anterior finalizar

### Problema: Não aparecem eventos
**Causas:**
- Não há eventos cadastrados
- Todos os eventos são passados

**Solução:**
- Cadastre eventos na página Agenda
- Verifique se os eventos têm data futura

### Problema: Não aparecem membros
**Causas:**
- Departamento sem membros cadastrados
- Todos os membros estão inativos

**Solução:**
- Cadastre membros na aba "Membros"
- Ative membros inativos se necessário

### Problema: Erro ao salvar - "Conflitos detectados"
**Causa:**
- Membro já escalado em outro departamento para o mesmo evento

**Solução:**
- Escolha outro membro
- Ou remova o membro da escala conflitante

## Boas Práticas

1. **Criar Escalas com Antecedência**
   - Mínimo 1 semana antes do evento
   - Permite membros se organizarem

2. **Revisar Resumo Antes de Salvar**
   - Verificar todos os membros
   - Confirmar horários e vestimenta

3. **Usar Descrições Claras**
   - Paleta de cores: "Terno preto" é melhor que "Escuro"
   - Observações: Ser específico e conciso

4. **Não Sobrecarregar Membros**
   - Distribuir funções entre diferentes pessoas
   - Evitar escalar mesma pessoa em eventos próximos

5. **Backup de Funções Críticas**
   - Ter membros substitutos em mente
   - Criar escalas com folga

## Referências Técnicas

### Services Utilizados
- `EventService.getEventsByMonth(month, year)`
- `DepartmentService.getDepartmentById(id)`
- `DepartmentService.getDepartmentFunctions(deptId)`
- `UserService.getUsersByDepartment(deptId)`
- `ScheduleService.createDepartmentSchedule(schedule)`

### Types
```typescript
interface DepartmentSchedule {
  id: string;
  departmentId: string;
  departmentName?: string;
  eventId: string;
  eventTitle?: string;
  eventDate?: Date;
  assignments: Assignment[];
  arrivalTime: string;
  eventStartTime: string;
  colorPalette?: ColorPalette;
  notes?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Assignment {
  userId: string;
  userName?: string;
  functionId: string;
  functionName: string;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}
```

### Rotas
- Criação: `/criar-escala/:departmentId`
- Listagem: `/diaconato` (aba Escalas)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0
