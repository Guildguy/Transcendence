# Guia de Uso - Mock de `mentor_availability`

Este documento explica como usar e validar o mock da tabela `mentor_availability`.

## O que foi implementado

O backend possui um seed de dados em:

- `backend/src/main/java/com/ft/trans/configuration/MentorAvailabilityMockConfig.java`

Comportamento:

1. No startup da API, verifica se a tabela `mentor_availability` esta vazia.
2. Se estiver vazia e existir pelo menos 1 usuario, insere 3 registros mockados.
3. Se ja houver dados, nao insere novamente.

## Dados mockados inseridos

Para o primeiro usuario encontrado (`users.id` mais baixo):

- `MONDAY` `08:00` `12:00`
- `MONDAY` `19:00` `22:00`
- `WEDNESDAY` `14:00` `18:00`

## Como subir e testar

### 1. Subir banco e API

```bash
cd /home/cadete/transcendence
docker compose up -d db api
```

### 2. Validar no banco (PostgreSQL)

```bash
docker exec -i postgres-db psql -U appuser -d appdb -c "SELECT mentor_availability_id, mentor_id, day_of_week, start_time, end_time, created_by, last_update_by FROM mentor_availability ORDER BY mentor_availability_id;"
```

### 3. Validar no endpoint

```bash
curl -i http://localhost:8080/mentor-availability/1
```

## Como reinserir o mock do zero

Se quiser limpar e gerar novamente:

```bash
docker exec -i postgres-db psql -U appuser -d appdb -c "TRUNCATE mentor_availability RESTART IDENTITY;"
docker restart springboot-api
```

Depois disso, execute novamente as validacoes SQL e HTTP.

## Observacoes

- O seed nao duplica dados: ele so roda se `mentor_availability` estiver vazia.
- Se nao existir usuario na tabela `users`, o seed da disponibilidade nao sera executado.
- O projeto tem alguns dados legados em `users` que podem gerar warnings de schema, mas nao impedem o uso deste mock.
