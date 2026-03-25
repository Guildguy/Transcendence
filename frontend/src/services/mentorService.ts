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
  
    //BUSCA A IMAGEM 
  private async fetchProfileImage(profileId: number): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/image/${profileId}`);
      if (!response.ok) return "";

      const imgData = await response.json();
      
      if (imgData && imgData.avatarUrl) {
        try {
          const parsed = JSON.parse(imgData.avatarUrl);
          const base64 = parsed.image_base64 || imgData.avatarUrl;
          
          // Garante o prefixo para o navegador renderizar
          if (base64 && !base64.startsWith('data:')) {
            return `data:image/png;base64,${base64}`;
          }
          return base64;
        } catch {
          // Se não for JSON, retorna o valor puro 
          return imgData.avatarUrl.startsWith('data:') 
            ? imgData.avatarUrl 
            : `data:image/png;base64,${imgData.avatarUrl}`;
        }
      }
      return "";
    } catch (error) {
      console.error(`Erro ao buscar imagem do perfil ${profileId}:`, error);
      return "";
    }
  }


//BUSCA SKILLS NO PYTHON
  private async fetchSkillsFromPython(profileId: string | number): Promise<string[]> {
    try {
      const response = await fetch(`${PYTHON_API_URL}/profile/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        return data.stacks || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

 
   //ORQUESTRA A BUSCA DE TODOS OS MENTORES
  async getAllMentorsForCards(): Promise<MentorCardData[]> {
    try {
      // 1. Busca lista simplificada de usuários
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();
      const mentorCards: MentorCardData[] = [];

      for (const userData of users) {
        try {
          //Busca dados para pegar o Profile ID
          const detailRes = await fetch(`${API_BASE_URL}/users/${userData.id}`);
          const fullData = await detailRes.json();
          
          const user = fullData.user;
          const profiles = fullData.profiles || [];

          //Filtra MENTOR
          const mentorProfiles = profiles.filter(
            (p: any) => p.role?.toUpperCase() === 'MENTOR'
          );

          for (const profile of mentorProfiles) {
            const finalAvatar = await this.fetchProfileImage(profile.id);

            //Busca as habilidades no Python
            const pythonStacks = await this.fetchSkillsFromPython(profile.id);

            //Monta o objeto final do Card
            mentorCards.push({
              id: profile.id,
              name: user.name || "Mentor",
              position: profile.position || 'Pessoa Mentora',
              skills: pythonStacks.map((s, i) => ({ id: `py_${profile.id}_${i}`, name: s })),
              anosExperiencia: profile.anosExperiencia || 0,
              isActive: true,
              avatarUrl: finalAvatar // Injetando imagem
            });
          }
        } catch (err) {
          console.error(`Erro no usuário ${userData.id}:`, err);
          continue;
        }
      }

      return mentorCards;
    } catch (error) {
      console.error('Erro ao obter mentores:', error);
      throw error;
    }
  }
}

export default new MentorService();