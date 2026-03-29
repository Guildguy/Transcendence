## Contexto: Sistema de Disponibilidade de Mentor

Estou implementando um sistema de agendamento de mentorias onde um mentor define sua disponibilidade semanal.

### 📌 Regras de funcionamento (IMPORTANTE)

* O frontend permite que o mentor:

  * Selecione múltiplos horários por dia da semana
  * Ex: Segunda → 08:00–12:00 e 19:00–22:00
* Esses horários são manipulados **apenas no frontend inicialmente**
* Os dados **só devem ser persistidos quando o usuário clicar em "Salvar"**

---

## 🎯 Objetivo do backend

Criar um endpoint que:

1. Receba TODA a disponibilidade do mentor de uma vez
2. Substitua completamente a disponibilidade anterior
3. Salve os novos horários no banco

---

## 📦 Estrutura esperada da requisição

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

---

## 🗄️ Estrutura da tabela (PostgreSQL)

Tabela: `mentor_availability`

Campos:

* id (PK)
* mentor_id (FK)
* day_of_week
* start_time
* end_time
* created_at
* created_by
* last_update_at
* last_update_by

---

## ⚙️ Regras de negócio

1. Ao salvar:

   * Deletar todas as disponibilidades existentes do mentor
   * Inserir as novas recebidas na requisição

2. Validações obrigatórias:

   * start_time deve ser menor que end_time
   * Não permitir horários sobrepostos no mesmo dia
   * day_of_week deve ser válido (enum)

3. Considerar uso de:

   * `LocalTime` para horários
   * `Enum` para dias da semana

---

## 🚨 Pontos para revisar

Peça para o Copilot ajudar a verificar:

* Se a lógica de DELETE + INSERT está correta
* Se há risco de inconsistência (usar transação)
* Se a validação de conflito de horários está correta
* Se o parsing de horário ("08:00") → `LocalTime` está seguro
* Se a modelagem da entidade está adequada

---

## 🧠 Sugestões de melhoria (opcional)

* Gerar automaticamente slots com base em `slotDuration`
* Evitar salvar disponibilidade que conflita com sessões já agendadas
* Criar endpoint GET para retornar disponibilidade agrupada por dia

---

## 🎯 Objetivo final

Garantir que:

* O backend reflita exatamente o que o frontend enviou
* A disponibilidade seja consistente
* Não existam conflitos ou dados inválidos
