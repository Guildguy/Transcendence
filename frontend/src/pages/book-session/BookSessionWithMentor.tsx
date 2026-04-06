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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

        // Priority 1: Navigation state (best - has complete data from MentorCard)
        if (mentorState?.mentorId) {
          console.log('[BookSessionWithMentor] ✓ Using navigation state');
          const mentor: MentorDetailData = {
            id: mentorState.mentorId,
            profileId: mentorState.mentorId,
            userId: mentorState.mentorId,  // Use actual mentor ID, not 0
            name: mentorState.mentorName || 'Mentor',
            position: mentorState.mentorPosition || 'Position',
            skills: mentorState.mentorSkills || [],
            anosExperiencia: mentorState.mentorXp || 0,
            isActive: mentorState.mentorIsActive !== false,
            isAvailable: true,
            avatarUrl: mentorState.mentorAvatar,
            bio: 'Especialista em desenvolvimento e mentoria',
            rating: 4.8,
            menteeCount: 0
          };
          setSelectedMentor(mentor);
          setLoading(false);
          return;
        }

        // Priority 2: Backend fetch with URL parameter
        if (urlMentorId) {
          const profileId = parseInt(urlMentorId, 10);
          if (!isNaN(profileId)) {
            try {
              console.log(`[BookSessionWithMentor] Fetching from backend with profileId: ${profileId}`);
              const mentor = await mentorService.getMentorDetails(profileId);
              if (mentor) {
                console.log('[BookSessionWithMentor] ✓ Backend fetch successful');
                setSelectedMentor(mentor);
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn('[BookSessionWithMentor] Backend fetch failed:', err);
            }
          }
        }

        // Priority 3: Mock data fallback
        console.log('[BookSessionWithMentor] Using mock data fallback');
        const mockMentor = mentors.find(m => m.id === urlMentorId) || mentors[0];
        
        if (mockMentor) {
          const mentor: MentorDetailData = {
            id: parseInt(mockMentor.id.replace('m', ''), 10) || 0,
            profileId: parseInt(mockMentor.id.replace('m', ''), 10) || 0,
            userId: parseInt(mockMentor.id.replace('m', ''), 10) || 0,
            name: mockMentor.name,
            position: mockMentor.role,
            skills: mockMentor.skills.map((s: string, i: number) => ({
              id: `skill-${i}`,
              name: s
            })),
            anosExperiencia: parseInt(mockMentor.xp.replace(/\D/g, ''), 10) || 0,
            isActive: true,
            isAvailable: mockMentor.status === 'available',
            avatarUrl: mockMentor.avatar,
            bio: mockMentor.bio || 'Especialista em desenvolvimento e mentoria',
            rating: 4.8,
            menteeCount: 0
          };
          console.log('[BookSessionWithMentor] ✓ Mock data loaded');
          setSelectedMentor(mentor);
          setLoading(false);
          return;
        }

        // No mentor found
        console.error('[BookSessionWithMentor] No mentor data available');
        setError('Mentor não encontrado. Por favor, volta à página de mentorias e tente novamente.');
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
      setError('Nenhum mentor selecionado. Por favor, volta à página de mentorias.');
      setLoading(false);
    }
  }, [urlMentorId, mentorState, mentors]);

  if (loading) {
    return (
      <div className="book-session-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando dados do mentor...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedMentor) {
    return (
      <div className="book-session-error">
        <div className="error-container">
          <div className="error-box">
            <h2 className="error-title">Mentor não encontrado</h2>
            <p className="error-message">{error || 'Não conseguimos carregar os dados do mentor.'}</p>
            <button
              onClick={() => navigate('/mentoros')}
              className="error-button"
            >
              ← Voltar para mentorias
            </button>
          </div>
        </div>
      </div>
    );
  }

  const numericMenteeId = currentUserId ? parseInt(currentUserId, 10) : null;
  const mentorIdStr = selectedMentor.userId?.toString() || selectedMentor.profileId?.toString() || '0';

  return (
    <div className="book-session-with-mentor">
      <MentorInfo
        name={selectedMentor.name}
        position={selectedMentor.position}
        skills={selectedMentor.skills}
        experience={selectedMentor.anosExperiencia}
        isActive={selectedMentor.isActive}
        avatarUrl={selectedMentor.avatarUrl}
        bio={selectedMentor.bio}
      />

      {selectedMentor.isAvailable && currentUserId && (
        <div className="calendar-container">
          <SlotSelector 
            mentorId={mentorIdStr}
            menteeId={numericMenteeId?.toString() || '0'}
          />
        </div>
      )}

      <div className="calendar-container">
        <SessionList 
          mentorId={mentorIdStr}
          menteeId={numericMenteeId?.toString()}
          showHeader={true}
          upcomingOnly={true}
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