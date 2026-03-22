# Integração MentorCard com Backend

## 📋 Resumo da Integração

A integração foi realizada para permitir que o componente `MentorCard` carregue dados de mentores diretamente do backend.

## 🔧 Arquivos Modificados/Criados

### 1. **Novo Arquivo: `/frontend/src/services/mentorService.ts`**
   - Serviço centralizado para todas as chamadas à API de mentores
   - Funções principais:
     - `fetchAllMentors()`: Busca todos os mentores do backend
     - `fetchMentorById(id)`: Busca um mentor específico
     - `getAllMentorsForCards()`: Retorna mentores formatados para o MentorCard
     - `mapProfileToCardData()`: Converte dados do backend para o formato do card
   - API chamada: `GET http://localhost:8080/profiles`

### 2. **Modificado: `/frontend/src/components/common/MentorCard/Mentorcard.tsx`**
   - Melhorias adicionadas:
     - Tratamento de habilidades vazias ("Sem habilidades informadas")
     - Exibição correta do contador "+X" quando há mais de 3 habilidades
     - Melhor integração com dados do backend

### 3. **Modificado: `/frontend/src/components/common/MentorCard/Mentorcard.css`**
   - Adicionado estilo `.no-skills-message` para mensagem de habilidades vazias

### 4. **Modificado: `/frontend/src/pages/mentoria/MentoriasPage.tsx`**
   - Integração com o novo `mentorService`
   - Busca automática de mentores ao carregar a página
   - Fallback para dados mock se o backend não estiver disponível

## 🚀 Como Funciona

### Fluxo de Dados:

```
Backend (/profiles)
    ↓
mentorService.fetchAllMentors()
    ↓
Filtrar apenas MENTOR
    ↓
mentorService.mapProfileToCardData()
    ↓
MentorCard renderiza os dados
```

### Formatação de Dados:

O serviço converte dados do backend:
```javascript
// Backend (Profile)
{
  id: 1,
  user: { name: "João Silva" },
  position: "Senior Developer",
  bio: "Experiência em React JavaScript TypeScript",
  xp: 5000,
  avatarUrl: "https://..."
}

// Para o MentorCard
{
  id: 1,
  name: "João Silva",
  position: "Senior Developer",
  skills: ["React", "JavaScript", "TypeScript"], // Extraído da bio
  experience: 5, // Convertido de XP
  isActive: true,
  avatarUrl: "https://..."
}
```

## 🎯 Recursos Implementados

✅ **Busca automática de mentores** ao carregar a página
✅ **Filtro automático** de perfis com role MENTOR
✅ **Extração inteligente** de habilidades da bio
✅ **Conversão de XP** em anos de experiência
✅ **Suporte a avatar** (imagem ou ícone padrão)
✅ **Fallback para mock data** se backend indisponível
✅ **Tratamento de erros** com console.error
✅ **Responsividade** mantida

## 🔌 Configuração

### Variável de Ambiente (Recomendado para o futuro):
```typescript
// Pode ser adicionado mais tarde em um arquivo .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

## ⚠️ Notas Importantes

1. **Habilidades**: Atualmente são extraídas da `bio` do mentor usando regex. Se o backend adicionar um campo específico de habilidades, o código pode ser atualizado em `mentorService.ts` na função `mapProfileToCardData()`.

2. **Status**: Por enquanto, todos os mentores são considerados "Ativo" (isActive: true). Se o backend adicionar um campo de status, ele pode ser facilmente integrado.

3. **Experiência**: A conversão de XP para anos é feita dividindo por 1000 (`Math.floor(profile.xp / 1000)`). Ajuste conforme necessário.

4. **URL do Backend**: Está configurada como `http://localhost:8080`. Altere em `mentorService.ts` se necessário.

## 🧪 Testando a Integração

1. Certifique-se que o backend está rodando em `http://localhost:8080`
2. Acesse a página de mentoras
3. Os cards devem carregar automaticamente com dados reais do backend
4. Se houver erro, verificar o console do navegador

## 📝 Exemplo de Uso Futuro

Para buscar um mentor específico:
```typescript
import mentorService from '../../services/mentorService';

const mentor = await mentorService.fetchMentorById(1);
```

## ✅ Validação

Todos os arquivos foram verificados e estão sem erros de compilação.
