import { apiFetch } from './api';

const PYTHON_API_URL = "/api/python";

export interface MenteeCardData {
  id: number;
  name: string;
  position: string;
  skills: Array<{ id: string; name: string }>;
  anosExperiencia: number;
  isActive: boolean;
  isAvailable: boolean;
  avatarUrl?: string;
  bio?: string;
}

export interface MenteeDetailData extends MenteeCardData {
  bio?: string;
  rating?: number;
  mentorCount?: number;
  userId?: number;
  profileId?: number;
}

class MenteeService {
  /**
   * Busca a imagem de perfil no backend Java (8080)
   */
  private async fetchProfileImage(profileId: number): Promise<string> {
    try {
      const response = await apiFetch(`/profiles/image/${profileId}`);
      if (!response.ok) return '';
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
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Busca as stacks/habilidades no backend Python (8000)
   */
  private async fetchSkillsFromPython(profileId: string | number): Promise<string[]> {
    try {
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
   * Busca detalhes completos de um mentorado incluindo bio e contagem de mentores
   * APENAS retorna dados se o perfil tiver role MENTORADO
   */
  async getMenteeDetails(profileId: number): Promise<MenteeDetailData | null> {
    try {
      console.log(`[getMenteeDetails] Starting fetch for profileId: ${profileId}`);

      // Since there's no GET /profiles/{id} endpoint, fetch all profiles and find by ID
      const response = await apiFetch(`/profiles`);
      if (!response.ok) {
        console.warn(`[getMenteeDetails] Profile with ID ${profileId} not found: HTTP ${response.status}`);
        return null;
      }

      const allProfiles = await response.json();
      console.log(`[getMenteeDetails] All profiles:`, allProfiles);

      // Find the profile by ID
      const profileData = Array.isArray(allProfiles)
        ? allProfiles.find((p: any) => p.id === profileId)
        : null;

      if (!profileData) {
        console.warn(`[getMenteeDetails] Profile with ID ${profileId} not found in list`);
        return null;
      }

      // Validar que o perfil tem role MENTORADO
      if (profileData.role?.toUpperCase() !== 'MENTORADO') {
        console.warn(`[getMenteeDetails] Profile ${profileId} has role '${profileData.role}', not MENTORADO - skipping`);
        return null;
      }

      console.log(`[getMenteeDetails] Profile data received (role: ${profileData.role}):`, profileData);

      // Extract userId - could be in nested user object or direct field
      const userId = profileData.user?.id || profileData.userId;

      if (!userId) {
        console.error(`[getMenteeDetails] No userId found for mentee ${profileId}`);
      }

      // Extract user data - could be nested or flat
      let userData = profileData.user || null;

      // If user is nested, use it; otherwise fetch separately
      let userName = userData?.name || profileData.name || 'Mentorado';
      let userActive = userData?.status !== false;

      if (!userData && userId) {
        try {
          const userResponse = await apiFetch(`/users/${userId}`);
          if (userResponse.ok) {
            const fullUserData = await userResponse.json();
            userData = fullUserData.user || fullUserData;
            userName = userData?.name || userName;
            userActive = userData?.status !== false;
            console.log(`[getMenteeDetails] User data received:`, userData);
          }
        } catch (userError) {
          console.warn(`[getMenteeDetails] Error fetching user data:`, userError);
        }
      }

      // Busca contagem de mentores (conexões ativas)
      let mentorCount = 0;
      if (userId) {
        try {
          const connectionsResponse = await apiFetch(`/mentorship-connections/mentee/${userId}`);
          if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            mentorCount = Array.isArray(connections) ? connections.filter(c => c.status === 'APPROVED').length : 0;
            console.log(`[getMenteeDetails] Mentor count for ${userId}:`, mentorCount);
          }
        } catch (error) {
          console.warn(`[getMenteeDetails] Error fetching connections:`, error);
        }
      }

      // Busca imagem e skills em paralelo
      const [finalAvatar, pythonStacks] = await Promise.all([
        this.fetchProfileImage(profileData.id),
        this.fetchSkillsFromPython(profileData.id)
      ]);

      const result: MenteeDetailData = {
        id: profileData.id,
        userId: userId,
        profileId: profileData.id,
        name: userName,
        position: profileData.position || 'Mentorado(a)',
        skills: pythonStacks.map((s: string, i: number) => ({
          id: `skill-${profileData.id}-${i}`,
          name: s
        })),
        anosExperiencia: profileData.anosExperiencia || 0,
        isActive: userActive,
        isAvailable: true,
        bio: profileData.bio || 'Aprendiz em desenvolvimento',
        rating: profileData.rating || 4.5,
        mentorCount: mentorCount,
        avatarUrl: finalAvatar
      };

      console.log(`[getMenteeDetails] Returning mentee data:`, result);
      return result;
    } catch (error) {
      console.error(`[getMenteeDetails] Erro ao buscar detalhes do mentorado ${profileId}:`, error);
      if (error instanceof Error) {
        console.error(`[getMenteeDetails] Error message:`, error.message);
      }
      return null;
    }
  }

  /**
   * Retorna a lista de todos os mentorados para a vitrine
   * APENAS retorna usuários que possuem um perfil com role MENTORADO
   */
  async getAllMenteesForCards(): Promise<MenteeCardData[]> {
    try {
      const response = await apiFetch(`/users`);
      const users = await response.json();

      console.log(`[getAllMenteesForCards] Total users fetched: ${users.length}`);

      const allMentees: MenteeCardData[] = [];

      for (const user of users) {
        try {
          const detailRes = await apiFetch(`/users/${user.id}`);
          const fullData = await detailRes.json();

          // Filtra apenas perfis com role MENTORADO (case-insensitive)
          const menteeProfiles = (fullData.profiles || []).filter(
            (p: any) => p.role?.toUpperCase() === 'MENTORADO'
          );

          if (menteeProfiles.length === 0) continue;

          for (const profile of menteeProfiles) {
            const [finalAvatar, pythonStacks] = await Promise.all([
              this.fetchProfileImage(profile.id),
              this.fetchSkillsFromPython(profile.id)
            ]);

            const menteeCard: MenteeCardData = {
              id: profile.id,
              name: fullData.user?.name || 'Mentorado',
              position: profile.position || 'Mentorado(a)',
              skills: pythonStacks.map((s: string, i: number) => ({
                id: `py_${profile.id}_${i}`,
                name: s
              })),
              anosExperiencia: profile.anosExperiencia || 0,
              isActive: true,
              isAvailable: true,
              avatarUrl: finalAvatar,
              bio: profile.bio
            };

            allMentees.push(menteeCard);
          }
        } catch (err) {
          console.error(`Error processing user ${user.id}:`, err);
          continue;
        }
      }

      console.log(`[getAllMenteesForCards] Total MENTEE cards after filtering: ${allMentees.length}`);
      return allMentees;
    } catch (error) {
      console.error('Erro ao obter mentorados:', error);
      throw error;
    }
  }

  /**
   * Busca as conexões atuais do mentorado (Meus Mentores)
   */
  async getMyMentors(menteeProfileId: number): Promise<any[]> {
    try {
      // Chama o endpoint de conexões aprovadas para o mentorado
      const response = await apiFetch(`/mentorship-connections/mentee/${menteeProfileId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar mentores:', error);
      return [];
    }
  }
}

export default new MenteeService();
