# Script para Adicionar Eventos de Outubro/2025

## Opção 1: Via Interface Web

Acesse `/agenda` e adicione um por um através do botão "Novo Evento".

## Opção 2: Via Console do Firebase (Rápido)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **escala-peniel**
3. Vá em **Firestore Database**
4. Crie a collection `events` (se não existir)
5. Clique em "Add Document" para cada evento abaixo:

### Evento 1: Esquenta (02/10)
```json
{
  "title": "Esquenta Conferência Jovem",
  "type": "esquenta",
  "date": "2025-10-02T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#f57c00",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 2: Culto de Celebração (05/10)
```json
{
  "title": "Culto de Celebração",
  "type": "culto_celebracao",
  "date": "2025-10-05T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#1976d2",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 3: Esquenta (09/10)
```json
{
  "title": "Esquenta Conferência Jovem",
  "type": "esquenta",
  "date": "2025-10-09T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#f57c00",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 4: Santa Ceia (12/10)
```json
{
  "title": "Santa Ceia",
  "type": "santa_ceia",
  "date": "2025-10-12T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#7b1fa2",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 5: Esquenta (16/10)
```json
{
  "title": "Esquenta Conferência Jovem",
  "type": "esquenta",
  "date": "2025-10-16T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#f57c00",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 6: Conferência (18/10)
```json
{
  "title": "Conferência Jovem",
  "type": "conferencia",
  "date": "2025-10-18T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#d32f2f",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 7: Conferência (19/10)
```json
{
  "title": "Conferência Jovem",
  "type": "conferencia",
  "date": "2025-10-19T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#d32f2f",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 8: Culto JP (23/10)
```json
{
  "title": "Culto de Celebração JP",
  "type": "culto_jp",
  "date": "2025-10-23T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#0288d1",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 9: Culto de Celebração (26/10)
```json
{
  "title": "Culto de Celebração",
  "type": "culto_celebracao",
  "date": "2025-10-26T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#1976d2",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

### Evento 10: Culto JP (30/10)
```json
{
  "title": "Culto de Celebração JP",
  "type": "culto_jp",
  "date": "2025-10-30T19:00:00.000Z",
  "time": "19:00",
  "description": "",
  "month": 10,
  "year": 2025,
  "color": "#0288d1",
  "isActive": true,
  "createdBy": "SEU_USER_ID",
  "createdAt": "TIMESTAMP_NOW",
  "updatedAt": "TIMESTAMP_NOW"
}
```

## Opção 3: Copiar Template (Mais Rápido!)

**RECOMENDADO**: Use a funcionalidade de DUPLICAR no sistema!

1. Crie o primeiro "Esquenta Conferência Jovem" (02/10)
2. Na lista de eventos, clique no ícone de **copiar (📋)**
3. Mude apenas a data para 09/10 e crie
4. Repita para 16/10
5. Faça o mesmo para os outros tipos de eventos

Isso economiza muito tempo! 🚀

## Nota Importante

- Substitua `"SEU_USER_ID"` pelo ID do seu usuário Pastor
- O Firestore gera timestamps automaticamente se você usar o botão "Set to current time"
- As datas estão no formato ISO com timezone UTC
- Se quiser outro horário, ajuste o time e a date

## Resultado Esperado

Após adicionar todos os eventos, você verá no calendário de Outubro:

```
02/10 (Qui) - Esquenta Conferência Jovem     [Laranja]
05/10 (Dom) - Culto de Celebração            [Azul]
09/10 (Qui) - Esquenta Conferência Jovem     [Laranja]
12/10 (Dom) - Santa Ceia                     [Roxo]
16/10 (Qui) - Esquenta Conferência Jovem     [Laranja]
18/10 (Sáb) - Conferência Jovem              [Vermelho]
19/10 (Dom) - Conferência Jovem              [Vermelho]
23/10 (Qui) - Culto de Celebração JP         [Azul Claro]
26/10 (Dom) - Culto de Celebração            [Azul]
30/10 (Qui) - Culto de Celebração JP         [Azul Claro]
```

## Para Meses Futuros

Use o mesmo processo para adicionar eventos de novembro, dezembro, etc.

**Dica**: Se você tem um padrão mensal fixo (ex: todo domingo tem culto), considere criar os eventos do primeiro mês e depois duplicá-los para os meses seguintes, ajustando apenas as datas.
