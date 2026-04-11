import { apiFetch } from './api'; // Seu wrapper customizado

export interface MentorCardData {
  id: number;
  name: string;
  position: string;
  skills: Array<{ id: string; name: string }>;
  anosExperiencia: number;
  isActive: boolean;
  isAvailable: boolean; // Indica se o mentor tem vagas (RN02 do Java)
  avatarUrl?: string;
  bio?: string;
}

export interface MentorDetailData extends MentorCardData {
  bio?: string;
  rating?: number;
  menteeCount?: number;
  userId?: number;
  profileId?: number;
}

class MentorService {

  private normalizeSkills(rawSkills: any[]): Array<{ id: string; name: string }> {
    if (!Array.isArray(rawSkills)) return [];

    const seen = new Set<string>();
    const normalized: Array<{ id: string; name: string }> = [];

    rawSkills.forEach((skill, index) => {
      const name = (typeof skill === 'string' ? skill : skill?.name)?.trim();
      if (!name) return;

      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      normalized.push({
        id: `skill-${key}-${index}`,
        name
      });
    });

    return normalized;
  }

  private async fetchMentorRating(profileId: number): Promise<number> {
    try {
      const response = await apiFetch(`/mentors/${profileId}/rating`);
      if (!response.ok) return 5;

      const data = await response.json();
      const parsed = Number(data?.averageRating);
      if (!Number.isFinite(parsed)) return 5;

      return Math.max(1, Math.min(5, Math.ceil(parsed)));
    } catch {
      return 5;
    }
  }
  
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
   * Busca as stacks/habilidades via backend Java (proxy do Python)
   */
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

  /**
   * Verifica a disponibilidade (capacidade) do mentor no Java
   * @param mentorProfileId - The profile ID of the mentor (not user ID)
   */
  private async fetchAvailability(mentorProfileId: number): Promise<boolean> {
    try {
      // Use the same endpoint as HomeLogged: /mentorship-connections/mentor/{profileId}/capacity
      const response = await apiFetch(`/mentorship-connections/mentor/${mentorProfileId}/capacity`);
      console.log(`[fetchAvailability] Requesting /mentorship-connections/mentor/${mentorProfileId}/capacity, status: ${response.status}`);
      
      if (!response.ok) {
        console.warn(`Availability check failed for mentor profile ${mentorProfileId}: ${response.status}`, response.statusText);
        return true; // Default to true (has vagas) instead of false
      }
      const data = await response.json();
      console.log(`[fetchAvailability] Response data for mentor profile ${mentorProfileId}:`, data);
      
      // Handle different possible response structures
      if (typeof data === 'boolean') {
        console.log(`[fetchAvailability] Data is boolean: ${data}`);
        return data;
      }
      if (typeof data.isAvailable === 'boolean') {
        console.log(`[fetchAvailability] Data.isAvailable: ${data.isAvailable}`);
        return data.isAvailable;
      }
      if (typeof data.available === 'boolean') {
        console.log(`[fetchAvailability] Data.available: ${data.available}`);
        return data.available;
      }
      if (typeof data.hasCapacity === 'boolean') {
        console.log(`[fetchAvailability] Data.hasCapacity: ${data.hasCapacity}`);
        return data.hasCapacity;
      }
      
      // Check if it's a capacity object with currentMentees and maxMentees
      if (typeof data.currentMentees === 'number' && typeof data.maxMentees === 'number') {
        const isAvail = data.currentMentees < data.maxMentees;
        console.log(`[fetchAvailability] Capacity object: currentMentees=${data.currentMentees}, maxMentees=${data.maxMentees}, isAvailable=${isAvail}`);
        return isAvail;
      }
      
      console.warn(`Unexpected availability response structure for mentor profile ${mentorProfileId}:`, data);
      return true; // Default to true if structure is unexpected
    } catch (error) {
      console.error(`Error fetching availability for mentor profile ${mentorProfileId}:`, error);
      return true; // Default to true (has vagas) on error
    }
  }

  /**
   * Processa os dados brutos do usuário e perfis para o formato de Card
   * APENAS retorna dados se o usuário/perfil tiver role MENTOR
   */
  private async processUser(userData: any): Promise<MentorCardData[]> {
    try {
      const detailRes = await apiFetch(`/users/${userData.id}`);
      const fullData = await detailRes.json();

      const user = fullData.user;

      // Filtra apenas perfis com role MENTOR (case-insensitive)
      const mentorProfiles = (fullData.profiles || []).filter(
        (p: any) => p.role?.toUpperCase() === 'MENTOR'
      );

      // Se o usuário não tem nenhum perfil MENTOR, retorna array vazio
      if (mentorProfiles.length === 0) {
        console.log(`User ${user.id} (${user.name}) has no MENTOR profiles - skipping`);
        return [];
      }

      console.log(`Processing user ${user.id} (${user.name}) with ${mentorProfiles.length} mentor profile(s)`);

      return await Promise.all(mentorProfiles.map(async (profile: any) => {
        // Executa as chamadas de imagem, skills e disponibilidade em paralelo
        // NOTE: fetchAvailability now receives profileId, not userId
        const [finalAvatar, pythonStacks, isAvailable] = await Promise.all([
          this.fetchProfileImage(profile.id),
          this.fetchSkillsFromJava(profile.id),
          this.fetchAvailability(profile.id) // CHANGED: Pass profileId instead of userId
        ]);

        const mentorCard = {
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
          avatarUrl: finalAvatar,
          bio: profile.bio
        };

        console.log(`[MentorCard] ${mentorCard.name} (ID: ${profile.id}) - Available: ${mentorCard.isAvailable}`);

        return mentorCard;
      }));
    } catch (err) {
      console.error(`Erro ao processar usuário ${userData.id}:`, err);
      return [];
    }
  }

  /**
   * Retorna a lista de todos os mentores para a vitrine
   * APENAS retorna usuários que possuem um perfil com role MENTOR
   */
  async getAllMentorsForCards(): Promise<MentorCardData[]> {
    try {
      const response = await apiFetch(`/users`);
      const users = await response.json();

      console.log(`[getAllMentorsForCards] Total users fetched: ${users.length}`);

      // Processa todos os usuários em paralelo
      const results = await Promise.all(users.map((u: any) => this.processUser(u)));

      // Filtra e retorna apenas mentores (remove arrays vazios e cataloga)
      const allMentors = results.flat();

      console.log(`[getAllMentorsForCards] Total MENTOR cards after filtering: ${allMentors.length}`);

      return allMentors;
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
      const response = await apiFetch(`/mentorship-connections/mentee/${menteeId}`);
      if (!response.ok) return [];
      return await response.json(); 
    } catch (error) {
      console.error('Erro ao buscar conexões do mentorado:', error);
      return [];
    }
  }

  /**
   * Busca detalhes completos de um mentor incluindo bio, rating e contagem de mentees
   * APENAS retorna dados se o perfil tiver role MENTOR
   */
  async getMentorDetails(profileId: number): Promise<MentorDetailData | null> {
    try {
      console.log(`[getMentorDetails] Starting fetch for profileId: ${profileId}`);

      // Since there's no GET /profiles/{id} endpoint, fetch all profiles and find by ID
      const response = await apiFetch(`/profiles`);
      if (!response.ok) {
        console.warn(`[getMentorDetails] Profile with ID ${profileId} not found: HTTP ${response.status}`);
        return null;
      }

      const allProfiles = await response.json();
      console.log(`[getMentorDetails] All profiles:`, allProfiles);

      // Find the profile by ID
      const profileData = Array.isArray(allProfiles)
        ? allProfiles.find((p: any) => p.id === profileId)
        : null;

      if (!profileData) {
        console.warn(`[getMentorDetails] Profile with ID ${profileId} not found in list`);
        return null;
      }

      // Validar que o perfil tem role MENTOR
      if (profileData.role?.toUpperCase() !== 'MENTOR') {
        console.warn(`[getMentorDetails] Profile ${profileId} has role '${profileData.role}', not MENTOR - skipping`);
        return null;
      }

      console.log(`[getMentorDetails] Profile data received (role: ${profileData.role}):`, profileData);

      // Extract userId - could be in nested user object or direct field
      const userId = profileData.user?.id || profileData.userId;

      if (!userId) {
        console.error(`[getMentorDetails] No userId found for mentor ${profileId}`);
      }

      // Extract user data - could be nested or flat
      let userData = profileData.user || null;

      // If user is nested, use it; otherwise fetch separately
      let userName = userData?.name || profileData.name || 'Mentor';
      let userActive = userData?.status !== false;

      if (!userData && userId) {
        try {
          const userResponse = await apiFetch(`/users/${userId}`);
          if (userResponse.ok) {
            const fullUserData = await userResponse.json();
            userData = fullUserData.user || fullUserData;
            userName = userData?.name || userName;
            userActive = userData?.status !== false;
            console.log(`[getMentorDetails] User data received:`, userData);
          }
        } catch (userError) {
          console.warn(`[getMentorDetails] Error fetching user data:`, userError);
        }
      }

      // Busca contagem de mentees (conexões ativas)
      let menteeCount = 0;
      if (userId) {
        try {
          const connectionsResponse = await apiFetch(`/mentorship-connections/mentor/${userId}`);
          if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            menteeCount = Array.isArray(connections) ? connections.filter(c => c.status === 'APPROVED').length : 0;
            console.log(`[getMentorDetails] Mentee count for ${userId}:`, menteeCount);
          }
        } catch (error) {
        }
      }

      const [mentorRating, profileImage, pythonStacks] = await Promise.all([
        this.fetchMentorRating(profileData.id),
        this.fetchProfileImage(profileData.id),
        this.fetchSkillsFromJava(profileData.id)
      ]);

      const mergedSkills = this.normalizeSkills([
        ...(Array.isArray(profileData.skills) ? profileData.skills : []),
        ...pythonStacks
      ]);

      const result: MentorDetailData = {
        id: profileData.id,
        userId: userId,
        profileId: profileData.id,
        name: userName,
        position: profileData.position || 'Pessoa Mentora',
        skills: mergedSkills,
        anosExperiencia: profileData.anosExperiencia || 0,
        isActive: userActive,
        isAvailable: true,
        bio: profileData.bio || 'Especialista em desenvolvimento e mentoria',
        rating: mentorRating,
        menteeCount: menteeCount,
        avatarUrl: profileImage || profileData.avatarUrl
      };

      console.log(`[getMentorDetails] Returning mentor data:`, result);
      return result;
    } catch (error) {
      console.error(`[getMentorDetails] Erro ao buscar detalhes do mentor ${profileId}:`, error);
      if (error instanceof Error) {
        console.error(`[getMentorDetails] Error message:`, error.message);
      }
      return null;
    }
  }
}


export default new MentorService();