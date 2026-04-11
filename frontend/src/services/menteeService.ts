import { apiFetch } from './api';

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
  async fetchProfileImage(profileId: number): Promise<string> {
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


  private async fetchSkillsFromJava(profileId: string | number): Promise<string[]> {
    try {
      const response = await apiFetch(`/profiles/${profileId}/stacks`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data?.stacks) ? data.stacks : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  async getMenteeDetails(profileId: number): Promise<MenteeDetailData | null> {
    try {
      const usersResponse = await apiFetch(`/users`);
      if (!usersResponse.ok) {
        console.warn(`[getMenteeDetails] Could not fetch users: HTTP ${usersResponse.status}`);
        return null;
      }

      const allUsers = await usersResponse.json();
      let profileData: any = null;
      let userId: number | null = null;
      let userName = 'Mentorado';

      for (const user of allUsers) {
        const userDetail = await apiFetch(`/users/${user.id}`);
        if (userDetail.ok) {
          const fullUserData = await userDetail.json();
          const menteeProfile = (fullUserData.profiles || []).find(
            (p: any) => p.id === profileId && p.role?.toUpperCase() === 'MENTORADO'
          );

          if (menteeProfile) {
            profileData = menteeProfile;
            userId = fullUserData.user?.id || user.id;
            userName = fullUserData.user?.name || 'Mentorado';
            break;
          }
        }
      }

      if (!profileData) {
        console.warn(`[getMenteeDetails] Profile with ID ${profileId} not found or is not a MENTORADO profile`);
        return null;
      }

      const userActive = true;

      let mentorCount = 0;
      if (userId) {
        try {
          const connectionsResponse = await apiFetch(`/mentorship-connections/mentee/${userId}`);
          if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            mentorCount = Array.isArray(connections) ? connections.filter(c => c.status === 'APPROVED').length : 0;
          }
        } catch (error) {
          console.warn(`[getMenteeDetails] Error fetching connections:`, error);
        }
      }

      const [finalAvatar, pythonStacks] = await Promise.all([
        this.fetchProfileImage(profileData.id),
        this.fetchSkillsFromJava(profileData.id)
      ]);

      const result: MenteeDetailData = {
        id: profileData.id,
        userId: userId || undefined,
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
      return result;
    } catch (error) {
      console.error(`[getMenteeDetails] Erro ao buscar detalhes do mentorado ${profileId}:`, error);
      if (error instanceof Error) {
        console.error(`[getMenteeDetails] Error message:`, error.message);
      }
      return null;
    }
  }

  async getAllMenteesForCards(): Promise<MenteeCardData[]> {
    try {
      const response = await apiFetch(`/users`);
      const users = await response.json();
      const allMentees: MenteeCardData[] = [];

      for (const user of users) {
        try {
          const detailRes = await apiFetch(`/users/${user.id}`);
          const fullData = await detailRes.json();

          const menteeProfiles = (fullData.profiles || []).filter(
            (p: any) => p.role?.toUpperCase() === 'MENTORADO'
          );

          if (menteeProfiles.length === 0) continue;

          for (const profile of menteeProfiles) {
            const [finalAvatar, pythonStacks] = await Promise.all([
              this.fetchProfileImage(profile.id),
              this.fetchSkillsFromJava(profile.id)
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
      return allMentees;
    } catch (error) {
      console.error('Erro ao obter mentorados:', error);
      throw error;
    }
  }

  async getMyMentors(menteeProfileId: number): Promise<any[]> {
    try {
      const response = await apiFetch(`/mentorship-connections/mentee/${menteeProfileId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar mentores:', error);
      return [];
    }
  }

  async getMyMentorsByUserId(userId: string | number): Promise<any[]> {
    try {
      const userRes = await apiFetch(`/users/${userId}`);
      if (!userRes.ok) return [];
      const userData = await userRes.json();
      
      const menteeProfile = (userData.profiles || []).find(
        (p: any) => p.role?.toUpperCase() === 'MENTORADO'
      );
      
      if (!menteeProfile) {
        console.warn("Perfil MENTORADO não encontrado para o usuário logado.");
        return [];
      }
      
      return await this.getMyMentors(menteeProfile.id);
    } catch (error) {
      console.error('Erro ao buscar mentores por usuário:', error);
      return [];
    }
  }
}

export default new MenteeService();
