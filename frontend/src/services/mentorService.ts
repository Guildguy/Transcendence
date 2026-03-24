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
      const data = await response.json();
      return data;
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
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mapeia dados do backend para o formato esperado pelo MentorCard
   */
  mapUserProfileToCardData(user: any, profile: MentorProfile): MentorCardData {
    return {
      id: profile.id,
      name: user.name,
      position: profile.position || 'Mentor',
      skills: this.extractSkills(profile.stacks),
      anosExperiencia: profile.anosExperiencia || 0,
      isActive: true,
      avatarUrl: profile.avatarUrl
    };
  }

  /**
   * Extrai habilidades do campo stacks do backend
   * Limita a 5 primeiras habilidades
   */
  private extractSkills(stacks?: Array<{ id: string; name: string }>): Array<{ id: string; name: string }> {
    if (!stacks || stacks.length === 0) {
      return [];
    }
    
    return stacks.slice(0, 5);
  }

  /**
   * Busca e mapeia todos os mentores para o formato do MentorCard
   * Filtra apenas usuários que têm perfil MENTOR
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

          // Filtrar apenas perfis MENTOR
          const mentorProfiles = profiles.filter((p: any) => p.role === 'MENTOR');

          for (const profile of mentorProfiles) {
            const cardData = this.mapUserProfileToCardData(user, profile);
            mentorCards.push(cardData);
          }
        } catch (error) {
          console.warn(`Erro ao processar usuário ${userData.id}:`, error);
          continue;
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
