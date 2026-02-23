# Python Profile Service

Microserviço Python para acessar perfis armazenados no MongoDB.

## 📦 O que foi removido e por quê

### ❌ Removido:
- **`pymongo`** - Redundante, `motor` já inclui
- **`pydantic`** - Já vem incluído com FastAPI  
- **`pydantic-settings`** - Desnecessário para configs simples
- **`python-dotenv`** - Usamos os.getenv() direto
- **`setup.sh`** - Desnecessário, pip instala direto
- **Multi-stage build** - Complicação desnecessária para microserviço
- **Virtual env no Docker** - Container já é isolado
- **Compiladores (gcc, g++)** - Motor tem wheels pré-compiladas

### ✅ Mantido (essencial):
- **`fastapi`** - Framework web leve e rápido
- **`uvicorn[standard]`** - Servidor ASGI de alta performance
- **`motor`** - Driver assíncrono do MongoDB (melhor para FastAPI)

## 🚀 Como usar

### Build da imagem:
```bash
docker build -t profile-service ./python-service/
```

### Rodar localmente:
```bash
docker run -p 8000:8000 \
  -e MONGO_URL=mongodb://host.docker.internal:27017 \
  -e DB_NAME=transcendence \
  profile-service
```

### Testar:
```bash
# Health check
curl http://localhost:8000/health

# Buscar perfil
curl http://localhost:8000/profile/123
```

## 📋 Endpoints

- `GET /` - Status do serviço
- `GET /profile/{user_id}` - Busca perfil por ID
- `GET /health` - Verifica saúde do serviço e MongoDB

## 🔧 Variáveis de ambiente

- `MONGO_URL` - URL de conexão do MongoDB (default: mongodb://localhost:27017)
- `DB_NAME` - Nome do banco de dados (default: transcendence)


## sites de estudo:
- `dotenv:` - https://medium.com/@habbema/dotenv-9915bd642533
- `API:` - https://www.youtube.com/watch?v=eel1OVIdfUw
- `FastAPI:` - https://www.youtube.com/watch?v=R26iojTwUv8&t=99s
