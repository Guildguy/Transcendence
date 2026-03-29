# API — Módulo `mentorship_connection`

> Base URL: `http://localhost:8080`  
> Content-Type: `application/json`

---

## Tabela de endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/mentorship-connections` | Mentorado solicita conexão com mentor |
| `PATCH` | `/mentorship-connections/{id}/accept?mentorUserId=X` | Mentor aceita solicitação |
| `PATCH` | `/mentorship-connections/{id}/reject?mentorUserId=X` | Mentor rejeita solicitação |
| `DELETE` | `/mentorship-connections/{id}?userId=X` | Encerrar mentoria (qualquer um) |
| `GET` | `/mentorship-connections/mentee/{menteeId}` | Listar mentores ativos do mentorado |
| `GET` | `/mentorship-connections/mentor/{mentorId}` | Listar mentorados ativos do mentor |
| `GET` | `/mentorship-connections/mentor/{mentorId}/pending` | Listar solicitações pendentes |
| `GET` | `/mentorship-connections/mentor/{mentorId}/capacity` | Verificar capacidade do mentor |
| `POST` | `/mentorship-connections/limit` | Configurar limite de mentorados |

---

## Fluxo de Conexão (RN01)

```
Mentorado solicita ──→ PENDING ──→ Mentor aceita ──→ APPROVED
                                ──→ Mentor rejeita ──→ REJECTED
APPROVED ──→ Encerrar mentoria ──→ REJECTED (permite re-candidatura)
```

Após a conexão entrar em `REJECTED`, o mentorado pode solicitar uma nova conexão com o mesmo mentor.

---

## Campos da entidade `MentorshipConnection`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `Long` | ID da conexão (gerado automaticamente) |
| `mentor` | `User` | Referência ao mentor (user_id) |
| `mentee` | `User` | Referência ao mentorado (user_id) |
| `status` | `String` | `PENDING` / `APPROVED` / `REJECTED` |
| `acceptedAt` | `LocalDateTime` | Data/hora de aceite (preenchido pelo sistema) |
| `createdAt` | `LocalDateTime` | Data de criação |
| `createdBy` | `Long` | ID do usuário que criou |
| `lastUpdateAt` | `LocalDateTime` | Data da última atualização |
| `lastUpdateBy` | `Long` | ID do usuário que atualizou |

---

## Formato de erro (HTTP 422)

```json
[
  { "field": "mentorId", "message": "Mentor não encontrado." },
  { "field": "capacity", "message": "O mentor atingiu o limite de mentorados (10)." }
]
```

---

## POST `/mentorship-connections`

Mentorado solicita uma conexão com um mentor.

### Body

```json
{
  "mentorId": 1,
  "menteeId": 2,
  "createdBy": 2
}
```

### Regras de validação

- `mentorId` e `menteeId` são obrigatórios
- Mentor e mentorado não podem ser a mesma pessoa
- Ambos os usuários devem existir
- Mentor deve ter perfil `MENTOR`, mentorado deve ter perfil `MENTORADO`
- Não pode existir conexão ativa (PENDING ou APPROVED) duplicada
- Mentor precisa ter capacidade disponível (RN02)

### Resposta (HTTP 201)

```json
{
  "id": 1,
  "mentor": { "id": 1, "name": "João Mentor" },
  "mentee": { "id": 2, "name": "Maria Aluna" },
  "status": "PENDING",
  "acceptedAt": null,
  "createdAt": "2026-03-29T16:00:00"
}
```

### Exemplo no front

```ts
async function requestMentorship(mentorId: number, menteeId: number) {
  const response = await fetch('http://localhost:8080/mentorship-connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mentorId, menteeId, createdBy: menteeId }),
  });

  if (!response.ok) {
    const errors = await response.json();
    throw errors;
  }

  return response.json();
}
```

---

## PATCH `/mentorship-connections/{id}/accept?mentorUserId=X`

Mentor aceita a solicitação. O sistema:
1. Valida que a conexão é PENDING
2. Revalida capacidade (RN02)
3. Muda status para APPROVED
4. Preenche `acceptedAt`
5. Cria registro em `mentorship_count`

### Resposta (HTTP 200)

Objeto `MentorshipConnection` com `status: "APPROVED"`.

### Exemplo no front

```ts
async function acceptConnection(connectionId: number, mentorUserId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-connections/${connectionId}/accept?mentorUserId=${mentorUserId}`,
    { method: 'PATCH' }
  );
  return response.json();
}
```

---

## PATCH `/mentorship-connections/{id}/reject?mentorUserId=X`

Mentor rejeita a solicitação. Só funciona se status for PENDING.

### Resposta (HTTP 200)

Objeto `MentorshipConnection` com `status: "REJECTED"`.

---

## DELETE `/mentorship-connections/{id}?userId=X`

Encerra uma mentoria ativa. Pode ser chamada pelo mentor OU pelo mentorado.

### Regras

- Só funciona em conexões com status `APPROVED`
- Muda status para `REJECTED`
- Inativa o registro em `mentorship_count` (status → `ENCERRADO`)
- Após encerramento, o mentorado pode solicitar nova conexão

### Exemplo no front

```ts
async function endMentorship(connectionId: number, userId: number) {
  const response = await fetch(
    `http://localhost:8080/mentorship-connections/${connectionId}?userId=${userId}`,
    { method: 'DELETE' }
  );
  return response.json();
}
```

---

## GET `/mentorship-connections/mentee/{menteeId}`

Lista os **mentores ativos** de um mentorado (conexões APPROVED).

### Resposta (HTTP 200)

```json
[
  {
    "id": 1,
    "mentorId": 1,
    "mentorName": "João Mentor",
    "menteeId": 2,
    "menteeName": "Maria Aluna",
    "status": "APPROVED",
    "acceptedAt": "2026-03-29T16:30:00",
    "createdAt": "2026-03-29T16:00:00"
  }
]
```

### Onde usar no front

- Carrossel "Meus Mentores" no dashboard do mentorado
- Indicador de mentores ativos

---

## GET `/mentorship-connections/mentor/{mentorId}`

Lista os **mentorados ativos** de um mentor (conexões APPROVED).

### Onde usar no front

- Seção "Meus Mentorados" no dashboard do mentor
- Cards de alunos com próxima sessão

---

## GET `/mentorship-connections/mentor/{mentorId}/pending`

Lista as **solicitações pendentes** que o mentor precisa aceitar/rejeitar.

### Onde usar no front

- Badge de notificação com contagem de pedidos
- Lista de solicitações na visão do mentor

---

## GET `/mentorship-connections/mentor/{mentorId}/capacity`

Retorna a capacidade atual do mentor.

### Resposta (HTTP 200)

```json
{
  "mentorUserId": 1,
  "mentorProfileId": 3,
  "currentMentees": 7,
  "maxMentees": 10,
  "isAvailable": true
}
```

### Onde usar no front

- Display "Sua capacidade: 7/10 mentorados"
- Indicador de disponibilidade (🟢/🔴)
- Card do mentor na busca

---

## POST `/mentorship-connections/limit`

Configura o limite máximo de mentorados simultâneos do mentor.

### Body

```json
{
  "mentorProfileId": 3,
  "limitOfMentee": 15
}
```

### Regras

- `mentorProfileId` é obrigatório (é o ID da tabela `profiles`, tipo MENTOR)
- `limitOfMentee` deve ser entre 1 e 50
- Se não configurado, o padrão é 10

### Resposta (HTTP 201)

Objeto `LimitMentee` salvo.

---

## Mapeamento de telas → endpoints

| Tela / Componente | Endpoint |
|---|---|
| Botão "Solicitar Mentoria" (mentorado) | `POST /mentorship-connections` |
| Notificação de aceite pelo mentor | `PATCH /{id}/accept` |
| Notificação de rejeição pelo mentor | `PATCH /{id}/reject` |
| Botão "Deixar Mentoria" (mentorado) | `DELETE /{id}` |
| Botão "Deixar de Mentorar" (mentor) | `DELETE /{id}` |
| Dashboard mentorado — "Meus Mentores" | `GET /mentee/{menteeId}` |
| Dashboard mentor — "Meus Mentorados" | `GET /mentor/{mentorId}` |
| Badge de solicitações pendentes | `GET /mentor/{mentorId}/pending` |
| Display de capacidade (X/Y) | `GET /mentor/{mentorId}/capacity` |
| Configuração de limite | `POST /limit` |
| Indicador 🟢/🔴 no card do mentor | `GET /mentor/{mentorId}/capacity` → `isAvailable` |

---

## Integração com `mentorship_session`

> **IMPORTANTE**: Agora, ao criar uma sessão (`POST /mentorship-sessions`), o sistema valida que:
> 1. O `connectionId` informado existe na tabela `mentorship_connection`
> 2. O status da conexão é `APPROVED`
> 3. O `mentor_id` para validação de disponibilidade é extraído diretamente da conexão (não do payload)
>
> Se a conexão não existe ou não está aprovada, retorna HTTP 422 com mensagem de erro.
