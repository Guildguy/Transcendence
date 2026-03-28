import { apiFetch } from './api';

const API_BASE_URL = 'http://localhost:8080';
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
      // const response = await fetch(`${API_BASE_URL}/profiles/image/${profileId}`);
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
      const response = await fetch(`${PYTHON_API_URL}/profile/${profileId}`);
      // const response = await apiFetch(`profile/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        return data.stacks || [];
      }
      return [];
    } catch {
      return [];
    }
  }

  // NOVA FUNÇÃO: Processa um único usuário e seus perfis de uma vez
  private async processUser(userData: any): Promise<MentorCardData[]> {
    try {
      // const detailRes = await fetch(`${API_BASE_URL}/users/${userData.id}`);
      const detailRes = await apiFetch(`users/${userData.id}`);
      const fullData = await detailRes.json();
      
      const user = fullData.user;
      const mentorProfiles = (fullData.profiles || []).filter(
        (p: any) => p.role?.toUpperCase() === 'MENTOR'
      );

      // Aqui está o segredo: Processa todos os perfis desse usuário em paralelo
      return await Promise.all(mentorProfiles.map(async (profile: any) => {
        // Dispara imagem e skills simultaneamente para este perfil
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
      // const response = await fetch(`${API_BASE_URL}/users`);
      const response = await apiFetch('/users');
      const users = await response.json();

      // Dispara o processamento de TODOS os usuários ao mesmo tempo
      const results = await Promise.all(users.map((u: any) => this.processUser(u)));

      // Como results é um Array de Arrays (devido ao map), usamos flat() para juntar tudo
      return results.flat();
    } catch (error) {
      console.error('Erro ao obter mentores:', error);
      throw error;
    }
  }
}

export default new MentorService();