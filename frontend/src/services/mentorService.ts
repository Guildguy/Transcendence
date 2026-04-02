import { apiFetch } from './api'; // Importe seu wrapper

const PYTHON_API_URL = 'http://localhost:8000';

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
  
  private async fetchProfileImage(profileId: number): Promise<string> {
    try {
      // Usando apiFetch para o Java (8080)
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

  private async fetchSkillsFromPython(profileId: string | number): Promise<string[]> {
    try {
      // Python (8000) geralmente não usa o mesmo JWT do Java, mantemos fetch normal
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

  private async processUser(userData: any): Promise<MentorCardData[]> {
    try {
      // Usando apiFetch para buscar detalhes do usuário
      const detailRes = await apiFetch(`/users/${userData.id}`);
      const fullData = await detailRes.json();
      
      const user = fullData.user;
      const mentorProfiles = (fullData.profiles || []).filter(
        (p: any) => p.role?.toUpperCase() === 'MENTOR'
      );

      return await Promise.all(mentorProfiles.map(async (profile: any) => {
        const [finalAvatar, pythonStacks] = await Promise.all([
          this.fetchProfileImage(profile.id),
          this.fetchSkillsFromPython(profile.id)
        ]);

        return {
          id: profile.id,
          name: user.name || "Mentor",
          position: profile.position || 'Pessoa Mentora',
          skills: pythonStacks.map((s: string, i: number) => ({ id: `py_${profile.id}_${i}`, name: s })),
          anosExperiencia: profile.anosExperiencia || 0,
          isActive: true,
          avatarUrl: finalAvatar
        };
      }));
    } catch (err) {
      console.error(`Erro ao processar usuário ${userData.id}:`, err);
      return [];
    }
  }

  async getAllMentorsForCards(): Promise<MentorCardData[]> {
    try {
      // Usando apiFetch para listar todos os usuários
      const response = await apiFetch(`/users`);
      const users = await response.json();

      const results = await Promise.all(users.map((u: any) => this.processUser(u)));
      return results.flat();
    } catch (error) {
      console.error('Erro ao obter mentores:', error);
      throw error;
    }
  }
}

export default new MentorService();