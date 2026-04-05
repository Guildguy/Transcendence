import { apiFetch } from './api'; // Seu wrapper customizado

const PYTHON_API_URL = 'http://localhost:8000';

export interface MentorCardData {
  id: number;
  name: string;
  position: string;
  skills: Array<{ id: string; name: string }>;
  anosExperiencia: number;
  isActive: boolean;
  isAvailable: boolean; // Indica se o mentor tem vagas (RN02 do Java)
  avatarUrl?: string;
}

class MentorService {
  
  /**
   * Busca a imagem de perfil no backend Java (8080)
   */
  private async fetchProfileImage(profileId: number): Promise<string> {
    try {
      const response = await apiFetch(`/profiles/image/${profileId}`);
      if (!response.ok) return "";
      const imgData = await response.json();
      
      if (imgData && imgData.avatarUrl) {
        try {
          const parsed = JSON.parse(imgData.avatarUrl);
          const base64 = parsed.image_base64 || imgData.avatarUrl;
          return base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
        } catch {
          return imgData.avatarUrl.startsWith('data:') 
            ? imgData.avatarUrl 
            : `data:image/png;base64,${imgData.avatarUrl}`;
        }
      }
      return "";
    } catch {
      return "";
    }
  }

  /**
   * Busca as stacks/habilidades no backend Python (8000)
   */
  private async fetchSkillsFromPython(profileId: string | number): Promise<string[]> {
    try {
      // Como o Python costuma rodar em porta diferente, usamos o fetch nativo 
      // ou garantimos que o apiFetch aceite URLs completas.
      const response = await fetch(`${PYTHON_API_URL}/profile/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        return data.stacks || [];
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Verifica a disponibilidade (capacidade) do mentor no Java
   */
  private async fetchAvailability(mentorUserId: number): Promise<boolean> {
    try {
      // Endpoint que mapeia para o MentorshipConnectionService.getMentorCapacity
      const response = await apiFetch(`/connections/capacity/${mentorUserId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.isAvailable; 
    } catch {
      return false;
    }
  }

  /**
   * Processa os dados brutos do usuário e perfis para o formato de Card
   */
  private async processUser(userData: any): Promise<MentorCardData[]> {
    try {
      const detailRes = await apiFetch(`/users/${userData.id}`);
      const fullData = await detailRes.json();
      
      const user = fullData.user;
      const mentorProfiles = (fullData.profiles || []).filter(
        (p: any) => p.role?.toUpperCase() === 'MENTOR'
      );

      return await Promise.all(mentorProfiles.map(async (profile: any) => {
        // Executa as chamadas de imagem, skills e disponibilidade em paralelo
        const [finalAvatar, pythonStacks, isAvailable] = await Promise.all([
          this.fetchProfileImage(profile.id),
          this.fetchSkillsFromPython(profile.id),
          this.fetchAvailability(user.id)
        ]);

        return {
          id: profile.id,
          name: user.name || "Mentor",
          position: profile.position || 'Pessoa Mentora',
          skills: pythonStacks.map((s: string, i: number) => ({ 
            id: `py_${profile.id}_${i}`, 
            name: s 
          })),
          anosExperiencia: profile.anosExperiencia || 0,
          isActive: true,
          isAvailable: isAvailable, 
          avatarUrl: finalAvatar
        };
      }));
    } catch (err) {
      console.error(`Erro ao processar usuário ${userData.id}:`, err);
      return [];
    }
  }

  /**
   * Retorna a lista de todos os mentores para a vitrine
   */
  async getAllMentorsForCards(): Promise<MentorCardData[]> {
    try {
      const response = await apiFetch(`/users`);
      const users = await response.json();

      const results = await Promise.all(users.map((u: any) => this.processUser(u)));
      return results.flat();
    } catch (error) {
      console.error('Erro ao obter mentores:', error);
      throw error;
    }
  }

  /**
   * Busca as conexões atuais do usuário (Meus Mentores)
   */
  async getMyMentors(menteeId: number): Promise<any[]> {
    try {
      // Chama o endpoint de conexões aprovadas para o mentorado
      const response = await apiFetch(`/connections/mentee/${menteeId}`);
      if (!response.ok) return [];
      return await response.json(); 
    } catch (error) {
      console.error('Erro ao buscar conexões do mentorado:', error);
      return [];
    }
  }
}

export default new MentorService();