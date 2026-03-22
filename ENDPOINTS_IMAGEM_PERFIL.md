# Endpoints de Imagem do Perfil - Guia de Uso

## Endpoints Disponíveis

### 1. **POST /profiles/image** - Salvar Imagem
Envia a imagem do frontend para ser persistida no MongoDB através do serviço Python.

**Request**:
```json
POST http://localhost:8080/profiles/image

{
  "profileId": 1,
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "imageFileName": "avatar.png"
}
```

**Response (Sucesso - 201)**:
```json
{
  "message": "Imagem do perfil salva com sucesso",
  "profile_id": 1
}
```

**Response (Erro - 422)**:
```json
[
  {
    "field": "profileId",
    "message": "ID do perfil é obrigatório."
  }
]
```

---

### 2. **GET /profiles/image/{profileId}** - Recuperar Imagem
Busca a imagem do MongoDB através do serviço Python e a retorna para o frontend renderizar.

**Request**:
```
GET http://localhost:8080/profiles/image/1
```

**Response (Sucesso - 200)**:
```json
{
  "id": 1,
  "name": "Fulano da Silva",
  "email": "fulano@example.com",
  "avatarUrl": null,
  "position": "Developer",
  "bio": "Passionate about coding",
  "role": "MENTOR",
  "xp": 1000,
  "level": 5,
  "linkedin": null,
  "github": null,
  "instagram": null,
  "createdAt": null,
  "createdBy": null,
  "lastUpdateAt": null,
  "lastUpdateBy": null,
  "anosExperiencia": null
}
```

**Response (Erro - 404)**:
```json
[
  {
    "field": "Image",
    "message": "Imagem não encontrada para este perfil."
  }
]
```

---

## Fluxo Completo no Frontend

### 1. Converter Arquivo para Base64
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

### 2. Fazer Upload da Imagem
```typescript
const handleImageUpload = async (file: File, profileId: number) => {
  try {
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
    
    if (response.ok) {
      const data = await response.json();
      console.log('Imagem salva com sucesso:', data.message);
      alert('Imagem atualizada com sucesso!');
    } else {
      const errors = await response.json();
      console.error('Erro ao salvar imagem:', errors);
      alert('Erro ao atualizar imagem!');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro de conexão ao atualizar imagem!');
  }
};
```

### 3. Recuperar Imagem para Renderizar
```typescript
const getProfileImage = async (profileId: number) => {
  try {
    const response = await fetch(`http://localhost:8080/profiles/image/${profileId}`);
    
    if (response.ok) {
      const imageData = await response.json();
      
      // A imagem vem do MongoDB (obtida via Python)
      // O campo imageData será a resposta do Python Service
      console.log('Dados da imagem:', imageData);
      
      // Para renderizar a imagem:
      // <img src={imageData.image_base64} alt="Avatar do Perfil" />
      
      return imageData;
    } else {
      console.error('Imagem não encontrada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return null;
  }
};
```

### 4. Usar em Componente React
```tsx
import { useState } from 'react';

function ProfileImageUploader({ profileId }: { profileId: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    await handleImageUpload(file, profileId);
    setLoading(false);
    
    // Recarregar imagem após upload
    const image = await getProfileImage(profileId);
    if (image?.image_base64) {
      setImageUrl(image.image_base64);
    }
  };

  const loadImage = async () => {
    const image = await getProfileImage(profileId);
    if (image?.image_base64) {
      setImageUrl(image.image_base64);
    }
  };

  return (
    <div className="profile-image-section">
      {imageUrl ? (
        <img src={imageUrl} alt="Avatar" className="profile-avatar" />
      ) : (
        <div className="avatar-placeholder">Sem imagem</div>
      )}
      
      <label htmlFor="image-upload" className="upload-btn">
        {loading ? 'Enviando...' : 'Trocar Imagem'}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
        style={{ display: 'none' }}
      />
      
      <button onClick={loadImage} className="load-btn">
        Carregar Imagem
      </button>
    </div>
  );
}

export default ProfileImageUploader;
```

---

## Arquitetura de Fluxo

```
Frontend (React)
  ↓ (POST com Base64)
Java Backend (/profiles/image)
  ↓ (envia para Python)
Python Service (/profile/image)
  ↓ (salva no MongoDB)
MongoDB (collection: profile_images)

---

Frontend (React)
  ↓ (GET)
Java Backend (/profiles/image/{id})
  ↓ (busca do Python)
Python Service (/profile/image/{id})
  ↓ (busca do MongoDB)
MongoDB (retorna Base64)
  ↑ (retorna para Frontend)
```

---

## Notas Importantes

1. **Base64**: A imagem é codificada em Base64 antes do envio
2. **Tamanho**: Tenha cuidado com imagens muito grandes (podem exceder limite de requisição)
3. **Tipos Suportados**: JPEG, PNG, GIF, WebP (qualquer tipo que o navegador suporte)
4. **Segurança**: Adicione validações de tamanho máximo no frontend antes de enviar
5. **Performance**: Considere redimensionar a imagem antes de converter para Base64

---

## Validações Recomendadas

```typescript
const validateImage = (file: File): { valid: boolean; error?: string } => {
  // Tamanho máximo: 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Imagem muito grande (máximo 5MB)' };
  }

  // Tipos aceitos
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de imagem não aceito' };
  }

  return { valid: true };
};

// Usar antes de enviar
const handleImageUpload = async (file: File, profileId: number) => {
  const validation = validateImage(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }
  
  // Continuar com upload...
};
```
