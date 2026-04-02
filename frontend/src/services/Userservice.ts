import { apiFetch } from './api';

export const userService = {
  async getFullProfile(userId: string) {
    // 1. Busca os dados básicos do usuário e profile
    const response = await apiFetch(`/users/${userId}`);
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    
    const data = await response.json();
    const user = data.user;
    const profile = data.profiles?.[0] || {};
    const profileId = profile.id;

    // 2. Busca a imagem separadamente (igual ao loadProfileImage da sua ProfilePage)
    let finalAvatar = "";
    if (profileId) {
      try {
        const imgResponse = await apiFetch(`/profiles/image/${profileId}`);
        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          // Aqui está o segredo: o seu backend retorna um JSON stringificado no campo avatarUrl
          if (imgData && imgData.avatarUrl) {
             const parsed = JSON.parse(imgData.avatarUrl);
             finalAvatar = parsed.image_base64 || imgData.avatarUrl;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar imagem no service:", error);
      }
    }

    // 3. Se ainda estiver vazio, tenta o campo do objeto user (fallback)
    if (!finalAvatar && user.avatarUrl) {
      try {
        const parsed = JSON.parse(user.avatarUrl);
        finalAvatar = parsed.image_base64 || user.avatarUrl;
      } catch {
        finalAvatar = user.avatarUrl;
      }
    }

    return {
      id: user.id,
      profile_id: profileId,
      nome: user.name || "Usuário",
      email: user.email || "",
      username: user.email ? user.email.split('@')[0] : 'username',
      cargo: profile.position || "Cargo não definido",
      avatarUrl: finalAvatar, // Agora vai preenchido!
      level: profile.level?.toString() || "0",
      xp: profile.xp?.toString() || "0",
      role: user.role || "MENTOR",
      presentationText: profile.bio || "",
      anosExperiencia: profile.anosExperiencia?.toString() || "0",
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      instagram: profile.instagram || "",
      telefone: user.phoneNumber || "",
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