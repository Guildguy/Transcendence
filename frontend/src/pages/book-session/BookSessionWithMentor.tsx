import './BookSessionWithMentor.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import { MentoringProvider, useMentoring } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import mentorService, { type MentorDetailData } from '../../services/mentorService'

interface Skill {
  id: string;
  name: string;
}

interface MentorLocationState {
  mentorId?: number;
  mentorName?: string;
  mentorPosition?: string;
  mentorSkills?: Skill[];
  mentorXp?: number;
  mentorAvatar?: string;
  mentorIsActive?: boolean;
}

function BookSessionContent() {
  const { mentors } = useMentoring();
  const location = useLocation();
  const navigate = useNavigate();
  const { mentorId: urlMentorId } = useParams<{ mentorId?: string }>();
  const [selectedMentor, setSelectedMentor] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshSessionList, setRefreshSessionList] = useState(false);
  
  // Get real user ID from localStorage (authenticated user), not from mock context
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const mentorState = location.state as MentorLocationState | null;

  useEffect(() => {
    const loadMentor = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[BookSessionWithMentor] Starting mentor load...');
        console.log('[BookSessionWithMentor] URL mentorId:', urlMentorId);
        console.log('[BookSessionWithMentor] Location state:', mentorState);

        // Priority 1: URL parameter (should be mentorId from MentorCard click)
        if (urlMentorId) {
          const mentorProfileId = parseInt(urlMentorId, 10);
          
          if (!isNaN(mentorProfileId)) {
            try {
              console.log(`[BookSessionWithMentor] ✓ Attempting backend fetch with profileId: ${mentorProfileId}`);
              const detailedMentor = await mentorService.getMentorDetails(mentorProfileId);
              
              if (detailedMentor) {
                console.log('[BookSessionWithMentor] ✓ Successfully loaded mentor from backend:', detailedMentor);
                setSelectedMentor(detailedMentor);
                return;
              } else {
                console.warn(`[BookSessionWithMentor] Backend returned null for profileId ${mentorProfileId}`);
              }
            } catch (error) {
              console.error('[BookSessionWithMentor] Error fetching from backend:', error);
            }
          }
        }

        // Priority 2: Navigation state (fallback if URL param or backend fails)
        if (mentorState?.mentorId) {
          console.log('[BookSessionWithMentor] ⚠ Using navigation state (backend fetch failed or no URL param)');
          const cardData: MentorDetailData = {
            id: mentorState.mentorId,
            name: mentorState.mentorName || 'Mentor',
            position: mentorState.mentorPosition || 'Position',
            skills: mentorState.mentorSkills || [],
            anosExperiencia: mentorState.mentorXp || 0,
            isActive: true,
            isAvailable: true,
            avatarUrl: mentorState.mentorAvatar,
            bio: 'Especialista em desenvolvimento e mentoria',
            rating: 4.8,
            menteeCount: 0,
            userId: 0,
            profileId: mentorState.mentorId
          };
          console.log('[BookSessionWithMentor] Loaded from navigation state:', cardData);
          setSelectedMentor(cardData);
          return;
        }

        // Priority 3: Mock data fallback from MentoringContext
        console.log('[BookSessionWithMentor] Trying mock data fallback...');
        let mentor = null;
        
        if (urlMentorId) {
          mentor = mentors.find(m => m.id === urlMentorId);
          if (mentor) {
            console.log(`[BookSessionWithMentor] Found mock mentor with ID "${urlMentorId}"`);
          }
        }
        
        if (!mentor) {
          mentor = mentors.find(m => m.id === 'm1') || mentors[0];
          console.log('[BookSessionWithMentor] Using first available mock mentor:', mentor?.id);
        }

        if (mentor) {
          const mockMentorData: MentorDetailData = {
            id: 0,
            profileId: 0,
            userId: 0,
            name: mentor.name,
            position: mentor.role,
            skills: mentor.skills.map((s: string, i: number) => ({
              id: `skill-${i}`,
              name: s
            })),
            anosExperiencia: parseInt(mentor.xp.replace(/\D/g, ''), 10) || 0,
            isActive: true,
            isAvailable: mentor.status === 'available',
            avatarUrl: mentor.avatar,
            bio: mentor.bio || 'Especialista em desenvolvimento e mentoria',
            rating: 4.8,
            menteeCount: 0
          };
          console.log('[BookSessionWithMentor] ✓ Loaded from mock data:', mockMentorData);
          setSelectedMentor(mockMentorData);
          return;
        }

        console.error('[BookSessionWithMentor] All fallbacks failed - no mentor data available');
        setError('Nenhum mentor selecionado. Por favor, volta à página de mentorias e clique em um mentor.');
      } catch (error) {
        console.error('[BookSessionWithMentor] Unexpected error:', error);
        setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Tente novamente'}`);
      } finally {
        setLoading(false);
      }
    };

    if (urlMentorId || mentorState?.mentorId) {
      loadMentor();
    } else {
      setError('Nenhum mentor selecionado. Por favor, volta à página de mentorias e clique em um mentor.');
      setLoading(false);
    }
  }, [urlMentorId, mentorState, mentors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do mentor...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedMentor) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar mentor</h2>
            <p className="text-red-700 mb-6">{error || 'Mentor não encontrado.'}</p>
            <button
              onClick={() => navigate('/mentoros')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              ← Voltar para mentorias
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingSuccess = () => {
    console.log('[BookSessionWithMentor] Booking successful, refreshing SessionList');
    setRefreshSessionList(prev => !prev);
  };

  const handleBookingError = (error: string) => {
    console.error('[BookSessionWithMentor] Booking error:', error);
  };

  // Get numeric mentee ID from localStorage
  const numericMenteeId = currentUserId ? parseInt(currentUserId, 10) : null;
  if (numericMenteeId && isNaN(numericMenteeId)) {
    console.warn('[BookSessionWithMentor] Invalid mentee ID in localStorage:', currentUserId);
  }

  // Convert skills array format if needed
  const mappedSkills = Array.isArray(selectedMentor.skills)
    ? selectedMentor.skills.map((s: any) => ({
        id: s.id || `skill-${s.name}`,
        name: s.name || s
      }))
    : [];

  return (
    <div className="book-session-with-mentor">
      <MentorInfo
        name={selectedMentor.name}
        position={selectedMentor.position}
        skills={mappedSkills}
        experience={selectedMentor.anosExperiencia}
        isActive={true}
        avatarUrl={selectedMentor.avatarUrl}
        bio={selectedMentor.bio}
        rating={selectedMentor.rating}
        menteeCount={selectedMentor.menteeCount}
      />

      <div className="calendar-container">
        {/* Slot Selector with integrated calendar */}
        {selectedMentor?.isAvailable && currentUserId && (
          <SlotSelector 
            mentorId={selectedMentor.userId?.toString() || selectedMentor.profileId?.toString() || selectedMentor.id.toString()}
            menteeId={numericMenteeId?.toString() || '0'}
            onBookingSuccess={handleBookingSuccess}
            onBookingError={handleBookingError}
          />
        )}
      </div>
      <div className="calendar-container">
        <SessionList 
          mentorId={selectedMentor.userId?.toString() || selectedMentor.profileId?.toString() || selectedMentor.id.toString()}
          menteeId={numericMenteeId?.toString()}
          showHeader={true}
          upcomingOnly={true}
          key={refreshSessionList.toString()}
        />
      </div>
    </div>
  );
}

export function BookSessionWithMentor() {
  return (
    <MentoringProvider>
      <BookSessionContent />
    </MentoringProvider>
  )
}

export default BookSessionWithMentor