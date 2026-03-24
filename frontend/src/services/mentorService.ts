// src/services/mentorService.ts
const API_BASE_URL = 'http://localhost:8080';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface MentorProfile {
  id: number;
  user: User;
  position: string;
  bio: string;
  avatarUrl?: string;
  xp: number;
  level?: number;
  anosExperiencia: number;
  linkedin?: string;
  github?: string;
  instagram?: string;
  createdAt?: string;
  role: string;
  stacks?: Array<{ id: string; name: string }>;
}

export interface MentorCardData {
  id: number;
  name: string;
  position: string;
  skills: Array<{ id: string; name: string }>;
  anosExperiencia: number;
  isActive: boolean;
  avatarUrl?: string;
}

class MentorService {
  /**
   * Busca todos os usuários do backend
   */
  async fetchAllUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários do backend:', error);
      throw error;
    }
  }

  /**
   * Busca um usuário específico pelo ID
   */
  async fetchUserById(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mapeia dados do backend para o formato esperado pelo MentorCard
   * Resolve o problema da imagem JSON stringificada
   */
  mapUserProfileToCardData(user: any, profile: any): MentorCardData {
    // --- TRATAMENTO DO AVATAR ---
    let finalAvatar = "";
    const rawAvatar = profile.avatarUrl || user.avatarUrl || "";

    if (rawAvatar && rawAvatar !== "") {
      try {
        // Se for o JSON stringificado do banco: {"image_base64": "data:..."}
        const parsed = JSON.parse(rawAvatar);
        finalAvatar = parsed.image_base64 || parsed.avatarUrl || rawAvatar;
      } catch (e) {
        // Se for a string direta (URL ou Base64 pura)
        finalAvatar = rawAvatar;
      }
    }

    return {
      id: profile.id,
      name: user.name || "Mentor",
      position: profile.position || 'Pessoa Mentora',
      skills: this.extractSkills(profile.stacks),
      anosExperiencia: profile.anosExperiencia || 0,
      isActive: true, // Pode ser expandido para checar status real futuramente
      avatarUrl: finalAvatar
    };
  }

  /**
   * Extrai habilidades e garante que o formato esteja correto para o Card
   */
  private extractSkills(stacks?: any[]): Array<{ id: string; name: string }> {
    if (!stacks || !Array.isArray(stacks)) return [];
    
    // Mapeia e limita às 5 primeiras habilidades como o MentorCard exige
    return stacks.slice(0, 5).map(s => ({
      id: s.id?.toString() || Math.random().toString(),
      name: s.name || s.toString()
    }));
  }

  /**
   * Busca e mapeia todos os mentores para o formato do MentorCard
   * Faz o filtro de ROLE e o mapeamento de imagem automaticamente
   */
  async getAllMentorsForCards(): Promise<MentorCardData[]> {
    try {
      const users = await this.fetchAllUsers();
      const mentorCards: MentorCardData[] = [];

      for (const userData of users) {
        try {
          const userFullData = await this.fetchUserById(userData.id);
          const user = userFullData.user;
          const profiles = userFullData.profiles || [];

          // Filtra apenas perfis MENTOR (Case Insensitive)
          const mentorProfiles = profiles.filter(
            (p: any) => p.role?.toUpperCase() === 'MENTOR'
          );

          for (const profile of mentorProfiles) {
            const cardData = this.mapUserProfileToCardData(user, profile);
            mentorCards.push(cardData);
          }
        } catch (error) {
          console.warn(`Erro ao processar usuário ${userData.id}:`, error);
          continue; // Pula para o próximo se um falhar
        }
      }

      return mentorCards;
    } catch (error) {
      console.error('Erro ao obter mentores para cards:', error);
      throw error;
    }
  }
}

export default new MentorService();