# JWT + CORS: Alteracoes Realizadas

Data: 2026-04-04

## Objetivo
Centralizar CORS em um unico ponto e manter o `JwtAuthenticationFilter` focado apenas em autenticacao/autorizacao.

## Contexto do problema
Antes, a politica de CORS estava duplicada em dois lugares:

1. `backend/src/main/java/com/ft/trans/filter/JwtAuthenticationFilter.java`
2. `backend/src/main/java/com/ft/trans/config/CorsConfig.java`

Isso aumentava o risco de divergencia de comportamento (origins, headers, methods) e dificultava manutencao.

## O que foi alterado

1. `backend/src/main/java/com/ft/trans/filter/JwtAuthenticationFilter.java`
- Removida a responsabilidade de CORS (`applyCorsHeaders` e constantes de origin).
- Mantido somente o fluxo de autenticacao JWT:
  - bypass de endpoints publicos
  - validacao do header `Authorization`
  - resposta `401` para token ausente/invalido
  - continuidade do chain para `OPTIONS`

2. `backend/src/main/java/com/ft/trans/configuration/WebConfig.java`
- Adicionado `CorsFilter` global com ordem anterior ao JWT (`order = 0`).
- Politica de CORS definida no proprio filtro global:
  - allowed origins: `localhost:5173`, `0.0.0.0:5173`, `127.0.0.1:5173`
  - allowed methods: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
  - allowed headers: `*`
  - exposed headers: `Authorization, Content-Type`
  - allow credentials: `true`
  - max age: `3600`

3. `backend/src/main/java/com/ft/trans/config/CorsConfig.java`
- Removido para evitar duplicidade de configuracao.

## Resultado esperado
- Uma unica fonte de verdade para CORS.
- Menor risco de inconsistencias futuras.
- `JwtAuthenticationFilter` mais simples e previsivel.

## Validacao executada (antes x depois)
Foram executados testes com `curl` em cenarios de preflight, rotas protegidas e rotas publicas.

### Cenarios principais
1. OPTIONS preflight com header custom
- Antes: 200
- Depois: 200
- Resultado: sem regressao

2. GET protegido sem token (origin permitida)
- Antes: 401 + CORS
- Depois: 401 + CORS
- Resultado: sem regressao

3. GET protegido com token invalido (origin permitida)
- Antes: 401 + CORS
- Depois: 401 + CORS
- Resultado: sem regressao

4. Origin nao permitida
- Antes: 401 sem `Allow-Origin`
- Depois: 403 `Invalid CORS request`
- Resultado: comportamento mais estrito e coerente com CORS centralizado

5. POST publico `/login`
- Antes: 500 (payload invalido) + CORS
- Depois: 500 (payload invalido) + CORS
- Resultado: sem regressao

### Testes extras (fora do fluxo de mentoria)
- OPTIONS `/users` com headers custom: OK
- GET `/users/1` sem token: 401 + CORS
- GET `/users/1` com token valido: 200 + CORS
- GET `/gamification/users/1/summary` com token valido: 200 + CORS
- GET `/ws/info` sem token: 401 + CORS

## Observacoes tecnicas
1. Mudanca focada em CORS/JWT, sem alterar regra de negocio dos endpoints.
2. `OPTIONS` continua passando no chain, evitando short-circuit no JWT.
3. Como CORS agora e global, ajustes futuros devem ser feitos em um unico lugar (`WebConfig`).

## Pendencias recomendadas (nao bloqueantes desta refatoracao)
1. Revisar retorno de erro em `POST /users` com payload invalido (atualmente 500 em alguns cenarios).
2. Nao expor `password` (hash) em payload de `GET /users/{id}`.
