# Integracao Frontend - Disponibilidade do Mentor

Este guia mostra como usar o payload da API de disponibilidade e como conectar isso na tela do frontend.

## 1. Endpoints do backend

### Salvar disponibilidade (replace total)
- Metodo: `POST`
- URL: `http://localhost:8080/mentor-availability`

### Buscar disponibilidade do mentor
- Metodo: `GET`
- URL: `http://localhost:8080/mentor-availability/{mentorId}`

## 2. Payload de salvamento

Formato esperado pelo backend:

```json
{
  "mentorId": 1,
  "slotDuration": 60,
  "availability": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "08:00",
      "endTime": "12:00"
    },
    {
      "dayOfWeek": "MONDAY",
      "startTime": "19:00",
      "endTime": "22:00"
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "startTime": "14:00",
      "endTime": "18:00"
    }
  ]
}
```

## 3. Regras importantes (backend)

- `slotDuration` permitido: `30` ou `60`.
- `startTime` deve ser menor que `endTime`.
- Nao pode haver sobreposicao de horarios no mesmo dia.
- `dayOfWeek` deve ser enum valido:
  - `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`.
- O `POST` faz replace completo:
  - deleta todas as disponibilidades anteriores do mentor
  - insere apenas as novas recebidas no payload

## 4. Mapeamento de dias (PT -> EN)

Use esse mapa na camada de transformacao do frontend:

- Domingo -> `SUNDAY`
- Segunda -> `MONDAY`
- Terca -> `TUESDAY`
- Quarta -> `WEDNESDAY`
- Quinta -> `THURSDAY`
- Sexta -> `FRIDAY`
- Sabado -> `SATURDAY`

## 5. Exemplo de tipos no frontend (TypeScript)

```ts
export interface AvailabilitySlotPayload {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface SaveMentorAvailabilityPayload {
  mentorId: number;
  slotDuration: 30 | 60;
  availability: AvailabilitySlotPayload[];
}
```

## 6. Exemplo de service no frontend

```ts
const API_BASE_URL = 'http://localhost:8080';

export async function saveMentorAvailability(payload: SaveMentorAvailabilityPayload) {
  const response = await fetch(`${API_BASE_URL}/mentor-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw { status: response.status, errorBody };
  }

  return response.json();
}

export async function getMentorAvailability(mentorId: number) {
  const response = await fetch(`${API_BASE_URL}/mentor-availability/${mentorId}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw { status: response.status, errorBody };
  }

  return response.json();
}
```

## 7. Fluxo para conectar na tela

### Passo 1: carregar no mount da pagina

- Ao abrir a tela, chamar `getMentorAvailability(mentorId)`.
- Converter a resposta para o formato interno da UI (cards por dia).
- Preencher os blocos de horario em cada dia.

### Passo 2: editar localmente

- Usuario adiciona/remove blocos no estado local (sem salvar ainda).
- Nao enviar para API a cada mudanca.

### Passo 3: salvar no botao "Salvar"

- Transformar o estado local em `SaveMentorAvailabilityPayload`.
- Chamar `saveMentorAvailability(payload)`.
- Em sucesso:
  - mostrar toast "Disponibilidade salva"
  - opcional: recarregar via `getMentorAvailability` para sincronizar

### Passo 4: tratar erros 422

Se o backend retornar `422`, exibir mensagem amigavel:

- conflito de horario no mesmo dia
- formato invalido de hora
- `startTime >= endTime`
- `slotDuration` invalido

## 8. Exemplo de handler de salvar

```ts
async function handleSave() {
  try {
    const payload: SaveMentorAvailabilityPayload = buildPayloadFromUiState();
    await saveMentorAvailability(payload);
    showToast('Disponibilidade salva!');
  } catch (e: any) {
    if (e?.status === 422) {
      showToast('Verifique os horarios: existe conflito ou dado invalido.');
      return;
    }
    showToast('Erro ao salvar disponibilidade.');
  }
}
```

## 9. Observacao sobre `slotDuration` no GET

Atualmente o `GET /mentor-availability/{mentorId}` retorna `slotDuration: null`, porque esse campo nao esta persistido na tabela `mentor_availability`.

Isso nao bloqueia salvar/buscar os blocos de horario.
Se a tela precisar exibir esse valor vindo do backend, sera necessario modelar persistencia para `slotDuration`.
