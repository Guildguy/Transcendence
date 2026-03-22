# Integração de Gerenciamento de Imagem de Perfil

## Visão Geral
A página de perfil (ProfilePage.tsx) agora consome os endpoints de gerenciamento de imagem criados no backend Java.

## Componentes

### 1. Função `fileToBase64()`
Converte um arquivo File em Base64 usando a FileReader API.

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
```

**Uso**: Chamada quando o usuário seleciona uma imagem no Avatar.

---

### 2. Função `handleImageUpload(file: File)`
Gerencia o upload da imagem para o backend.

**Fluxo**:
1. Valida se `userData.id` existe
2. Converte arquivo para Base64
3. Envia POST para `/profiles/image` com:
   - `profileId`: ID do usuário
   - `imageBase64`: Arquivo em Base64
   - `imageFileName`: Nome original do arquivo
4. Se sucesso:
   - Exibe mensagem de confirmação
   - Recarrega a imagem chamando `loadProfileImage()`
5. Se erro:
   - Log do erro no console
   - Exibe mensagem de erro ao usuário

**Request Body**:
```json
{
  "profileId": 123,
  "imageBase64": "data:image/png;base64,iVBORw0KGg...",
  "imageFileName": "avatar.png"
}
```

---

### 3. Função `loadProfileImage(profileId: number)`
Recupera a imagem salva no backend.

**Fluxo**:
1. Faz GET para `/profiles/image/{profileId}`
2. Se encontrada:
   - Extrai `image_base64` do response
   - Atualiza `userData.avatarUrl` com a imagem
3. Se não encontrada:
   - Log informativo (nenhuma imagem ainda)
4. Trata erros de rede

**Response Esperado**:
```json
{
  "image_base64": "data:image/png;base64,iVBORw0KGg...",
  "image_file_name": "avatar.png",
  "profile_id": 123
}
```

---

### 4. useEffect para Carregamento Inicial
Carrega a imagem quando o componente monta ou quando `userData.id` muda.

```typescript
useEffect(() => {
  if (userData.id) {
    loadProfileImage(userData.id);
  }
}, [userData.id]);
```

---

### 5. Integração com Avatar
O callback `onImageChange` do componente Avatar agora chama `handleImageUpload`:

```typescript
<Avatar 
  avatarUrl={userData.avatarUrl} 
  size={128} 
  isEditable={true} 
  onImageChange={(file) => handleImageUpload(file)}
/>
```

---

## Fluxo Completo do Usuário

### Primeiro Acesso
1. Componente monta
2. `loadProfileImage()` é chamada
3. Se imagem existe no backend → Avatar carrega com a imagem
4. Se não existe → Avatar mostra imagem padrão

### Upload de Nova Imagem
1. Usuário clica no Avatar (editable)
2. Seleciona arquivo de imagem
3. `onImageChange` callback acionado
4. `handleImageUpload()` executa:
   - Converte para Base64
   - Envia para backend POST `/profiles/image`
   - Recarrega imagem com `loadProfileImage()`
   - Avatar atualiza com nova imagem
5. Mensagem de sucesso/erro exibida

---

## Tratamento de Erros

| Erro | Tratamento |
|------|-----------|
| ID do usuário não encontrado | Alert: "Erro: ID do usuário não encontrado" |
| Falha na conversão Base64 | Console.error, Alert: "Erro de conexão" |
| Upload falhado (status != 200) | Console.error com response, Alert: "Erro ao atualizar imagem" |
| Falha ao carregar imagem | Console.error, sem alert (não crítico) |
| Imagem não encontrada (404) | Log informativo, Avatar mantém estado atual |

---

## Requisições HTTP

### Upload de Imagem
```http
POST /profiles/image HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "profileId": 123,
  "imageBase64": "data:image/png;base64,...",
  "imageFileName": "profile.png"
}
```

**Response (Sucesso)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Imagem salva com sucesso"
}
```

### Recuperação de Imagem
```http
GET /profiles/image/123 HTTP/1.1
Host: localhost:8080
```

**Response (Sucesso)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "image_base64": "data:image/png;base64,...",
  "image_file_name": "profile.png",
  "profile_id": "123"
}
```

**Response (Não encontrada)**:
```http
HTTP/1.1 404 Not Found
```

---

## Dependências

- **Frontend**: React hooks (useState, useEffect), fetch API
- **Backend**: Spring Boot, ProfileController, ProfileService
- **Storage**: MongoDB (via Python microservice)

---

## Estados do Componente

| State | Tipo | Descrição |
|-------|------|-----------|
| `userData.avatarUrl` | string | URL/Base64 da imagem do avatar |
| `userData.id` | number | ID do usuário para requisições |

---

## Próximas Melhorias

- [ ] Validação de tipo de arquivo (apenas imagens)
- [ ] Validação de tamanho de arquivo
- [ ] Indicador de carregamento durante upload/download
- [ ] Preview da imagem antes de salvar
- [ ] Suporte a arrastar e soltar (drag and drop)
- [ ] Histórico de imagens anteriores
- [ ] Compressão de imagem antes de salvar

---

## Testes Manuais

### Teste 1: Upload bem-sucedido
1. Fazer login
2. Ir para página de perfil
3. Clicar no Avatar
4. Selecionar imagem (PNG, JPG)
5. **Esperado**: Mensagem "Imagem atualizada com sucesso!"
6. **Verificar**: Avatar atualiza com nova imagem

### Teste 2: Carregamento ao abrir página
1. Fazer login
2. Ir para página de perfil
3. **Esperado**: Avatar carrega com imagem salva anteriormente

### Teste 3: Sem imagem anterior
1. Novo usuário
2. Abrir página de perfil
3. **Esperado**: Avatar mostra imagem padrão

### Teste 4: Erro de conexão
1. Desligar backend Java
2. Tentar fazer upload
3. **Esperado**: Alert "Erro de conexão ao atualizar imagem!"
