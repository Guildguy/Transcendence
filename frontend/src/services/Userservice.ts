// src/services/userService.ts
const BASE_URL = 'http://localhost:8080';

export const userService = {
  
  // GET /users/:id - Centraliza a busca e o tratamento de dados
  async getFullProfile(userId: string) {
    const response = await fetch(`${BASE_URL}/users/${userId}`);
    
    if (!response.ok) throw new Error('Erro ao buscar perfil no servidor');
    
    const data = await response.json();
    const user = data.user;
    const profile = data.profiles && data.profiles.length > 0 ? data.profiles[0] : {};

    // 1. Tratamento do Avatar (extração da Base64 do JSON string)
    let finalAvatar = "";
    if (user.avatarUrl) {
      try {
        // Tenta parsear caso venha como JSON string do banco
        const parsed = JSON.parse(user.avatarUrl);
        finalAvatar = parsed.image_base64 || user.avatarUrl;
      } catch (e){
        // Se não for JSON, usa a string direta
        finalAvatar = user.avatarUrl;
      }
    }

    // 2. Retorno do objeto formatado (o que o componente espera receber)
    return {
      id: user.id,
      profile_id: profile.id,
      nome: user.name || "Usuário",
      email: user.email || "",
      username: user.email ? user.email.split('@')[0] : 'username',
      cargo: profile.position || "Cargo não definido",
      avatarUrl: finalAvatar,
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
    const response = await fetch(`${BASE_URL}/profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload),
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil');
    return response.json();
  },

  // POST /profiles/image - Faz o upload da foto
  async uploadAvatar(profileId: number, imageBase64: string, fileName: string) {
    const response = await fetch(`${BASE_URL}/profiles/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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