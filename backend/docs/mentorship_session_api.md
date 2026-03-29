# API — Módulo `mentorship_session`

> Base URL: `http://localhost:8080`  
> Content-Type: `application/json`

---

## Tabela de endpoints

| Método | Endpoint | Quando usar no front |
|---|---|---|
| `POST` | `/mentorship-sessions` | Mentor agenda uma sessão (simples ou recorrente) |
| `GET` | `/mentorship-sessions/connection/{id}` | Carregar histórico completo de sessões |
| `GET` | `/mentorship-sessions/connection/{id}/upcoming` | Carregar próximas sessões no dashboard |
| `PUT` | `/mentorship-sessions` | Reagendar, mudar status, registrar falta |
| `DELETE` | `/mentorship-sessions/{id}` | Cancelar uma sessão |
| `GET` | `/mentorship-sessions/{id}/notes` | Carregar anotação do mentor ao abrir a sessão |
| `PATCH` | `/mentorship-sessions/{id}/notes` | Salvar anotação do mentor |

---

## Campos da entidade `MentorshipSession`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `Long` | ID único da sessão (gerado pelo banco) |
| `connectionId` | `Long` | ID da conexão mentor-mentorado |
| `scheduledDate` | `LocalDateTime` | Data e hora da sessão (`"2026-04-10T10:00:00"`) |
| `durationMinutes` | `Integer` | Duração: 60, 90, 120, 150, 180, 210 ou 240 |
| `meetUrl` | `String` | Link do Google Meet (gerado automaticamente) |
| `status` | `String` | `SCHEDULED` / `COMPLETED` / `NO_SHOW` / `CANCELLED` |
| `isRecurrent` | `Boolean` | Se faz parte de um ciclo recorrente |
| `recurrenceGroupId` | `UUID` | Agrupa as 10 sessões de um ciclo (mesmo UUID) |
| `recurrenceIndex` | `Integer` | Posição no ciclo: 1 a 10 |
| `menteeMissed` | `Boolean` | `true` se o mentorado faltou |
| `mentorNotes` | `String` | Anotação privada do mentor (máx 2048 chars) |
| `createdAt` | `LocalDateTime` | Data de criação |
| `createdBy` | `Long` | ID do usuário que criou |
| `lastUpdateAt` | `LocalDateTime` | Data da última atualização |
| `lastUpdateBy` | `Long` | ID do usuário que atualizou |

---

## Formato de erro (HTTP 422)

Toda validação que falha retorna um array:

```json
[
  { "field": "scheduledDate", "message": "A data da sessão não pode ser no passado." },
  { "field": "durationMinutes", "message": "A duração deve ser múltiplo de 30 minutos." }
]
```

---

## POST `/mentorship-sessions`

Cria uma sessão simples ou um bloco de **10 sessões semanais** recorrentes.

### Body

```json
{
  "connectionId": 1,
  "scheduledDate": "2026-04-10T10:00:00",
  "durationMinutes": 90,
  "isRecurrent": false,
  "createdBy": 42
}
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `connectionId` | ✅ | ID da conexão ativa |
| `scheduledDate` | ✅ | Não pode ser no passado |
| `durationMinutes` | ✅ | 60, 90, 120, 150, 180, 210 ou 240 |
| `isRecurrent` | ❌ | `false` por padrão. Se `true`, cria 10 sessões semanais |
| `createdBy` | ❌ | ID do usuário que está criando |

### Resposta — sessão simples (HTTP 201)

```json
{
  "id": 7,
  "connectionId": 1,
  "scheduledDate": "2026-04-10T10:00:00",
  "durationMinutes": 90,
  "meetUrl": "https://meet.google.com/abc-defg-hij",
  "status": "SCHEDULED",
  "isRecurrent": false,
  "recurrenceGroupId": null,
  "recurrenceIndex": null,
  "menteeMissed": false,
  "mentorNotes": null,
  "createdAt": "2026-03-27T14:00:00",
  "createdBy": 42
}
```

### Resposta — recorrente (HTTP 201)

Array com 10 objetos. Todos com o **mesmo** `recurrenceGroupId` e `scheduledDate` avançando 1 semana:

```json
[
  {
    "id": 10,
    "connectionId": 1,
    "scheduledDate": "2026-04-10T10:00:00",
    "meetUrl": "https://meet.google.com/aaa-bbbb-ccc",
    "status": "SCHEDULED",
    "isRecurrent": true,
    "recurrenceGroupId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "recurrenceIndex": 1
  },
  {
    "id": 11,
    "connectionId": 1,
    "scheduledDate": "2026-04-17T10:00:00",
    "meetUrl": "https://meet.google.com/ddd-eeee-fff",
    "status": "SCHEDULED",
    "isRecurrent": true,
    "recurrenceGroupId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "recurrenceIndex": 2
  }
]
```

### Exemplo no front (React/TS)

```ts
async function createSession(data: CreateSessionPayload) {
  const response = await fetch('http://localhost:8080/mentorship-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errors = await response.json(); // [{ field, message }]
    throw errors;
  }

  return response.json(); // MentorshipSession | MentorshipSession[]
}
```

---

## GET `/mentorship-sessions/connection/{connectionId}`

Retorna **todas** as sessões (passadas e futuras) de uma conexão.

### Onde usar no front
- Histórico de sessões na tela do mentorado
- Lista de sessões na visão do mentor sobre um aluno

### Resposta (HTTP 200)

```json
[
  {
    "id": 1,
    "connectionId": 1,
    "scheduledDate": "2026-03-20T10:00:00",
    "durationMinutes": 60,
    "meetUrl": "https://meet.google.com/xxx-yyyy-zzz",
    "status": "COMPLETED",
    "isRecurrent": true,
    "recurrenceGroupId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "recurrenceIndex": 1,
    "menteeMissed": false,
    "mentorNotes": null
  }
]
```

### Exemplo no front

```ts
async function getSessionHistory(connectionId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-sessions/connection/${connectionId}`
  );
  return response.json(); // MentorshipSession[]
}
```

---

## GET `/mentorship-sessions/connection/{connectionId}/upcoming`

Retorna apenas as sessões com `scheduledDate` **no futuro**.

### Onde usar no front
- Componente "Próximas sessões" no dashboard do mentorado
- Card de próxima sessão no dashboard do mentor
- Lista de agendamentos futuros no perfil do mentor (visão mentorado)

### Resposta

Mesmo formato do endpoint acima, filtrado para sessões futuras.

### Exemplo no front

```ts
async function getUpcomingSessions(connectionId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-sessions/connection/${connectionId}/upcoming`
  );
  return response.json(); // MentorshipSession[]
}
```

---

## PUT `/mentorship-sessions`

Atualiza parcialmente uma sessão. Apenas os campos enviados serão alterados.

### Body

```json
{
  "sessionId": 7,
  "scheduledDate": "2026-04-15T14:00:00",
  "durationMinutes": 120,
  "status": "COMPLETED",
  "menteeMissed": false,
  "mentorNotes": "Aluno evoluiu bem em closures.",
  "lastUpdateBy": 42
}
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `sessionId` | ✅ | ID da sessão a atualizar |
| `scheduledDate` | ❌ | Novo horário — valida conflito |
| `durationMinutes` | ❌ | 60–240, múltiplo de 30 |
| `status` | ❌ | `SCHEDULED`, `COMPLETED`, `NO_SHOW`, `CANCELLED` |
| `menteeMissed` | ❌ | `true` se o mentorado faltou |
| `mentorNotes` | ❌ | Anotação privada do mentor |
| `lastUpdateBy` | ❌ | ID do usuário que está atualizando |

### Resposta (HTTP 200)

Objeto `MentorshipSession` atualizado.

### Casos de uso no front

**Reagendar:**
```ts
await fetch('http://localhost:8080/mentorship-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 7,
    scheduledDate: '2026-04-15T14:00:00',
    lastUpdateBy: 42,
  }),
});
```

**Marcar como concluída:**
```ts
await fetch('http://localhost:8080/mentorship-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 7, status: 'COMPLETED', lastUpdateBy: 42 }),
});
```

**Registrar falta (no-show) + nota:**
```ts
await fetch('http://localhost:8080/mentorship-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 7,
    status: 'NO_SHOW',
    menteeMissed: true,
    mentorNotes: 'Não compareceu sem avisar.',
    lastUpdateBy: 42,
  }),
});
```

---

## DELETE `/mentorship-sessions/{id}`

Cancela a sessão (muda `status` para `CANCELLED`). Não remove o registro do banco — o histórico é preservado.

### Onde usar no front
- Botão "Cancelar sessão" na lista de agendamentos futuros
- Opção de cancelamento no reagendamento

### Resposta (HTTP 200)

Objeto `MentorshipSession` com `status: "CANCELLED"`.

### Exemplo no front

```ts
async function cancelSession(sessionId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-sessions/${sessionId}`,
    { method: 'DELETE' }
  );
  return response.json();
}
```

---

## Mapeamento de telas → endpoints

| Tela / Componente | Endpoint |
|---|---|
| Dashboard mentorado — "Próximas sessões" | `GET /upcoming` |
| Perfil do mentor — histórico de sessões | `GET /connection/{id}` |
| Modal de agendamento (mentor) — sessão única | `POST` com `isRecurrent: false` |
| Modal de agendamento (mentor) — recorrente | `POST` com `isRecurrent: true` |
| Botão "Reagendar" | `PUT` com novo `scheduledDate` |
| Botão "Cancelar sessão" | `DELETE /{id}` |
| Formulário pós-sessão — nota + status | `PUT` com `status`, `mentorNotes`, `menteeMissed` |
| Badge de link do Meet | Campo `meetUrl` retornado no `GET` |

---

## Status possíveis e transições

```
SCHEDULED ──→ COMPLETED
          ──→ NO_SHOW
          ──→ CANCELLED

COMPLETED  → estado final
NO_SHOW    → estado final
CANCELLED  → estado final
```

> No front: após uma sessão entrar em `COMPLETED`, `NO_SHOW` ou `CANCELLED`,
> ocultar ou desabilitar os botões de reagendamento e cancelamento.

---

## GET `/mentorship-sessions/{id}/notes`

Retorna apenas o texto da anotação do mentor para uma sessão específica.

### Onde usar no front
- Ao abrir o painel/modal de detalhes da sessão — popula o campo de texto
- Permite que o front carregue a nota sem precisar do objeto completo da sessão

### Resposta (HTTP 200)

```json
"Aluno demonstrou dificuldade com closures. Revisar na próxima sessão."
```

Retorna `null` se ainda não houver nenhuma anotação.

### Exemplo no front

```ts
async function getMentorNotes(sessionId: number): Promise<string | null> {
  const response = await fetch(
    `http://localhost:8080/mentorship-sessions/${sessionId}/notes`
  );
  return response.json(); // string | null
}
```

---

## PATCH `/mentorship-sessions/{id}/notes`

Salva (cria ou substitui) a anotação do mentor. Só toca no campo `mentorNotes` — nenhum outro dado da sessão é alterado.

### Regras
- Só o mentor da sessão deve chamar este endpoint (controle no front por enquanto)
- O conteúdo antigo é **substituído** pelo novo — o front deve sempre enviar o texto completo
- `mentorNotes` pode ser enviado como `null` ou `""` para limpar a anotação

### Body

```json
{
  "mentorNotes": "Aluno evoluiu bem em closures. Próximo foco: async/await.",
  "lastUpdateBy": 42
}
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `mentorNotes` | ✅ | Texto completo da anotação (máx 2048 chars) |
| `lastUpdateBy` | ❌ | ID do mentor que está salvando |

### Resposta (HTTP 200)

Objeto `MentorshipSession` completo com o campo `mentorNotes` atualizado.

### Exemplo no front

```ts
async function saveMentorNotes(sessionId: number, notes: string, mentorId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-sessions/${sessionId}/notes`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorNotes: notes, lastUpdateBy: mentorId }),
    }
  );

  if (!response.ok) {
    const errors = await response.json();
    throw errors;
  }

  return response.json(); // MentorshipSession atualizada
}
```

### Quando salvar no front

Recomenda-se salvar a nota em **uma das situações** abaixo (não nas duas para evitar chamadas excessivas):

| Estratégia | Quando chamar o PATCH |
|---|---|
| **Auto-save com debounce** | Após o mentor parar de digitar por ~2 segundos |
| **Salvar ao fechar** | No evento `onBlur` do textarea ou ao fechar o modal |

```ts
// Exemplo com debounce (recomendado)
import { useDebouncedCallback } from 'use-debounce';

const saveNotes = useDebouncedCallback(async (text: string) => {
  await saveMentorNotes(session.id, text, currentMentorId);
}, 2000);

// No textarea:
<textarea
  defaultValue={session.mentorNotes ?? ''}
  onChange={(e) => saveNotes(e.target.value)}
  disabled={!session.id} // Só habilita se a sessão já existe
/>
```

