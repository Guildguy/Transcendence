# Fluxo de Persistência de Imagens com MongoDB

## Arquitetura

```
Frontend (React)
    ↓ (enviar Base64)
Java Backend (Spring Boot)
    ↓ (POST /profile/image)
Python Service (FastAPI)
    ↓ (salvar no MongoDB)
MongoDB (collection: profile_images)
```

## Endpoints

### 1. **Java Backend** - POST `/profiles/image`
**URL**: `http://localhost:8080/profiles/image`

**Request (do Frontend)**:
```json
{
  "profileId": 1,
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "imageFileName": "avatar.png"
}
```

**Response (sucesso)**:
```json
{
  "message": "Imagem do perfil salva com sucesso",
  "profile_id": 1
}
```

### 2. **Python Service** - POST `/profile/image`
**URL**: `http://localhost:8000/profile/image`

**Documentação**: O Java envia automaticamente para este endpoint

**MongoDB Collection**: `profile_images`
**Documento Salvo**:
```json
{
  "_id": ObjectId("..."),
  "profile_id": "1",
  "image_base64": "data:image/png;base64,...",
  "image_file_name": "avatar.png"
}
```

### 3. **Python Service** - GET `/profile/image/{profile_id}`
**URL**: `http://localhost:8000/profile/image/1`

**Response**:
```json
{
  "profile_id": "1",
  "image_base64": "data:image/png;base64,...",
  "image_file_name": "avatar.png"
}
```

## Fluxo Completo

### Ao Salvar Imagem:
1. Frontend captura a imagem e converte para Base64
2. Frontend envia POST para Java: `/profiles/image`
3. Java valida os dados:
   - Verifica se `profileId` existe
   - Verifica se `imageBase64` não está vazio
   - Verifica se o Perfil existe no banco de dados
4. Java envia os dados para Python Service em `http://localhost:8000/profile/image`
5. Python recebe e salva no MongoDB (collection: `profile_images`)
6. Python retorna sucesso para Java
7. Java retorna sucesso para Frontend

### Ao Recuperar Imagem:
1. Frontend ou Backend precisa buscar a imagem
2. Chamar Python Service: `GET /profile/image/{profile_id}`
3. Python busca no MongoDB
4. Retorna o Base64 da imagem
5. Frontend renderiza a imagem ou armazena localmente

## Configuração Necessária

### Variáveis de Ambiente - Python

Já configuradas em `.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=transcendence
CORS_ORIGINS=http://localhost:8080,http://localhost:8000,http://localhost:5173
```

### Java - Nenhuma Configuração Adicional
A URL do Python Service está hardcoded como `http://localhost:8000`

Se precisar alterar, edite em `ProfileService.java`:
```java
private static final String PYTHON_SERVICE_URL = "http://localhost:8000";
```

## Validações Implementadas

✅ **Java**:
- Verifica se profileId é nulo
- Verifica se imageBase64 está vazio
- Verifica se Profile existe no banco PostgreSQL

✅ **Python**:
- Valida se profile_id é válido
- Valida se image_base64 está preenchido
- Captura exceções de conexão com MongoDB

## Benefícios desta Abordagem

1. **Separação de Responsabilidades**: Imagens no MongoDB (Python), dados estruturados no PostgreSQL (Java)
2. **Escalabilidade**: Fácil mover serviço Python para outro servidor
3. **Recuperação**: Imagens recuperáveis pelo `profile_id`
4. **Base64**: Não requer upload de arquivo, apenas string
5. **Segurança**: Validações em ambas as camadas

## Exemplo de Uso no Frontend

```typescript
// 1. Converter imagem para Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// 2. Enviar para backend
const handleImageUpload = async (file: File, profileId: number) => {
  const imageBase64 = await fileToBase64(file);
  
  const response = await fetch('http://localhost:8080/profiles/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId: profileId,
      imageBase64: imageBase64,
      imageFileName: file.name
    })
  });
  
  return response.json();
};

// 3. Usar em componente
<input 
  type="file" 
  onChange={(e) => {
    if (e.target.files?.[0]) {
      handleImageUpload(e.target.files[0], userData.profile_id);
    }
  }}
/>
```

## Troubleshooting

### Python Service não responde
```bash
# Verificar se está rodando
curl http://localhost:8000/health

# Iniciar serviço
cd python-service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Imagem não salva no MongoDB
1. Verificar logs do Python Service
2. Verificar conexão MongoDB: `curl http://localhost:8000/health`
3. Verificar formato do Base64 enviado

### Error 500 ao salvar
1. Verificar se profileId existe em PostgreSQL
2. Verificar se Base64 está completo (não truncado)
3. Verificar logs de ambos os serviços
