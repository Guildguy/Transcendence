import { apiFetch } from './api';

export const userService = {
  async getFullProfile(userId: string) {
    // 1. Busca os dados básicos do usuário e profile
    const response = await apiFetch(`/users/${userId}`);
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    
    const data = await response.json();
    const user = data.user || {};
    const profile = data.profiles?.[0] || {};
    const profileId = profile.id;

    // 2. Busca a imagem (também via apiFetch para passar o Token)
    let finalAvatar = "";
    if (profileId) {
      try {
        const imgResponse = await apiFetch(`/profiles/image/${profileId}`);
        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          if (imgData && imgData.avatarUrl) {
            try {
              // Tenta parsear caso o backend envie como string JSON
              const parsed = JSON.parse(imgData.avatarUrl);
              finalAvatar = parsed.image_base64 || imgData.avatarUrl;
            } catch {
              finalAvatar = imgData.avatarUrl;
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imagem no service:", error);
      }
    }

    // Fallback para imagem no objeto user se o profile-image falhar
    if (!finalAvatar && user.avatarUrl) {
      try {
        const parsed = JSON.parse(user.avatarUrl);
        finalAvatar = parsed.image_base64 || user.avatarUrl;
      } catch {
        finalAvatar = user.avatarUrl;
      }
    }

    // Retorna o objeto formatado exatamente como o UserHeader espera
    return {
      nome: user.name || "Usuário",
      username: user.email ? user.email.split('@')[0] : 'username',
      cargo: profile.position || "Cargo não definido",
      avatarUrl: finalAvatar,
      level: profile.level?.toString() || "0",
      xp: profile.xp?.toString() || "0",
      role: user.role || "MENTOR",
    };
  },

  // PUT /profiles - Atualiza os dados do perfil
  async updateProfile(profilePayload: any) {
    const response = await apiFetch('/profiles', {
      method: 'PUT',
      body: JSON.stringify(profilePayload),
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil');
    return response.json();
  },

  // POST /profiles/image - Faz o upload da foto
  async uploadAvatar(profileId: number, imageBase64: string, fileName: string) {
    const response = await apiFetch('/profiles/image', {
      method: 'POST',
      body: JSON.stringify({ 
        profileId, 
        imageBase64, 
        imageFileName: fileName 
      }),
    });
    if (!response.ok) throw new Error('Erro no upload da imagem');
    return response.json();
  }
};