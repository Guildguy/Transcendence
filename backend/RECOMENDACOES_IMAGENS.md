# Recomendações para Persistência de Imagens de Perfil

## Endpoint Criado
- **URL**: `POST /profiles/image`
- **Payload**:
```json
{
  "profileId": 1,
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "imageFileName": "profile_avatar.png"
}
```

## Opções Recomendadas para Persistência

### **Opção 1: Armazenamento em Banco de Dados (Atual - MongoDB)**
**Implementação Atual**: A imagem é armazenada como URL no campo `avatarUrl` do PostgreSQL

**Pros:**
- Simples de implementar
- Sem necessidade de servidor de arquivos
- Funciona bem com URLs remotas

**Contras:**
- Se usar Base64 direto, o banco fica muito pesado
- Limita-se ao tamanho máximo de coluna

**Recomendação**: Usar esta opção apenas com URLs remotas (CDN, AWS S3, etc.)

---

### **Opção 2: Armazenamento de Arquivo (RECOMENDADO)**
Salvar a imagem no servidor e armazenar apenas o caminho no banco.

**Implementação**:
```java
// 1. Decodificar Base64
byte[] imageBytes = Base64.getDecoder().decode(imageBase64);

// 2. Criar pasta de uploads
File uploadsDir = new File("uploads/profiles");
uploadsDir.mkdirs();

// 3. Salvar arquivo
String fileName = "profile_" + profileId + "_" + System.currentTimeMillis() + ".png";
Files.write(Paths.get(uploadsDir.getPath(), fileName), imageBytes);

// 4. Salvar apenas o caminho no banco
profile.avatarUrl = "/uploads/profiles/" + fileName;
```

**Pros:**
- Economiza espaço do banco de dados
- Melhor performance
- Fácil de servir arquivos estáticos

**Contras:**
- Requer gerenciamento de arquivos no servidor
- Problema se servidor cair (dados no servidor local)

---

### **Opção 3: Armazenamento em Nuvem (AWS S3 / Google Cloud Storage)**
Enviar imagem diretamente para um serviço de armazenamento em nuvem.

**Recomendação com AWS S3**:
```java
// Adicionar dependency no pom.xml:
// <dependency>
//   <groupId>software.amazon.awssdk</groupId>
//   <artifactId>s3</artifactId>
//   <version>2.20.0</version>
// </dependency>

AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();
String bucketName = "transcendence-profiles";
String key = "profiles/" + profileId + "_avatar.png";

byte[] imageBytes = Base64.getDecoder().decode(imageBase64);
s3Client.putObject(bucketName, key, new ByteArrayInputStream(imageBytes), 
    new ObjectMetadata());

String url = "https://" + bucketName + ".s3.amazonaws.com/" + key;
profile.avatarUrl = url;
```

**Pros:**
- Altamente escalável
- Durável e confiável
- Sem problemas de espaço em disco
- Melhor CDN automático

**Contras:**
- Custo adicional
- Requer configuração de credenciais

---

## Recomendação Final para Produção

1. **Curto Prazo (Desenvolvimento)**: Usar **Opção 2** (Arquivo no servidor)
2. **Médio Prazo (Staging)**: Implementar **Opção 3** (AWS S3 ou semelhante)
3. **Longo Prazo**: Integrar com CDN para melhor performance global

## Validações Já Implementadas
✅ Verifica se `profileId` é válido
✅ Verifica se `imageBase64` não está vazio
✅ Verifica se o perfil existe no banco
✅ Trata exceções adequadamente

## Próximos Passos Sugeridos
1. Decidir qual estratégia usar
2. Implementar validação de tipo de imagem (JPG, PNG, etc.)
3. Implementar validação de tamanho máximo (ex: 5MB)
4. Criar endpoint para deletar/remover imagem anterior
5. Considerar redimensionamento automático de imagens
