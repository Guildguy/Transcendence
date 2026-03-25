// src/services/mentorService.ts

const API_BASE_URL = 'http://localhost:8080';
const PYTHON_API_URL = 'http://localhost:8000'; // URL do Microserviço Python/MongoDB

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
   * Busca todos os usuários do backend principal
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
   * Busca um usuário específico pelo ID no backend principal
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
   * Busca as stacks (habilidades) diretamente no microserviço Python
   * Se o perfil não existir no MongoDB (404), retorna uma lista vazia.
   */
  private async fetchSkillsFromPython(profileId: string | number): Promise<string[]> {
    try {
      const response = await fetch(`${PYTHON_API_URL}/profile/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        // O Python retorna {"profile_id": "...", "stacks": ["React", "Python"]}
        return data.stacks || [];
      }
      return []; 
    } catch (error) {
      console.warn(`Microserviço Python offline ou erro para o perfil ${profileId}`);
      return [];
    }
  }

  /**
   * Mapeia dados do backend e integra as habilidades vindas do Python
   */
// No seu MentorService.ts, altere o método mapUserProfileToCardData:

mapUserProfileToCardData(user: any, profile: any, pythonStacks: string[]): MentorCardData {
  let finalAvatar = "";
  
  // O backend pode enviar a imagem em profile.avatarUrl ou user.avatarUrl
  const rawAvatar = profile.avatarUrl || user.avatarUrl || "";

  if (rawAvatar && rawAvatar !== "") {
    try {
      // Tenta fazer o parse caso seja o JSON stringificado: {"image_base64": "..."}
      const parsed = JSON.parse(rawAvatar);
      finalAvatar = parsed.image_base64 || parsed.avatarUrl || rawAvatar;
    } catch (e) {
      // Se não for JSON (for uma URL direta ou Base64 pura), usa o rawAvatar
      finalAvatar = rawAvatar;
    }
  }

  // Verificação extra: Se o finalAvatar não começar com "data:image" e não for uma URL "http", 
  // pode ser que o Base64 precise do prefixo para o componente <img /> entender.
  if (finalAvatar && !finalAvatar.startsWith('data:') && !finalAvatar.startsWith('http')) {
    finalAvatar = `data:image/png;base64,${finalAvatar}`;
  }

  const formattedSkills = pythonStacks.map((stackName, index) => ({
    id: `py_${profile.id}_${index}`,
    name: stackName
  }));

  return {
    id: profile.id,
    name: user.name || "Mentor",
    position: profile.position || 'Pessoa Mentora',
    skills: formattedSkills,
    anosExperiencia: profile.anosExperiencia || 0,
    isActive: true,
    avatarUrl: finalAvatar // Agora com tratamento completo
  };
}

  /**
   * Orquestra a busca: Filtra mentores e busca habilidades no microserviço Python
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

          // Filtra apenas perfis MENTOR
          const mentorProfiles = profiles.filter(
            (p: any) => p.role?.toUpperCase() === 'MENTOR'
          );

          for (const profile of mentorProfiles) {
            // Busca as habilidades reais no MongoDB (Python)
            const pythonStacks = await this.fetchSkillsFromPython(profile.id);
            
            const cardData = this.mapUserProfileToCardData(user, profile, pythonStacks);
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