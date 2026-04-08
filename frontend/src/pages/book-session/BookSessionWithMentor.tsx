import './BookSessionWithMentor.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import { MentoringProvider } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import { apiFetch } from '../../services/api'
import { toast } from '../../hooks/use-toast'
import { useChat } from '../../components/chat/ChatContext/ChatContext'
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
  mentorBio?: string;
  mentorRating?: number;
  menteeCount?: number;
}

type ConnectionStatus = 'none' | 'pending' | 'active' | 'loading';

function BookSessionContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mentorId: urlMentorId, menteeId: urlMenteeId } = useParams<{ mentorId?: string, menteeId?: string }>();
  const [selectedMentor, setSelectedMentor] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [menteeProfileId, setMenteeProfileId] = useState<number | null>(null);
  const [myMentorProfileId, setMyMentorProfileId] = useState<number | null>(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const { setActiveChatId } = useChat();
  
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const myUserId = currentUserId ? parseInt(currentUserId, 10) : null;

  const mentorState = location.state as MentorLocationState | null;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Priority 1: Navigation state (best - has complete data from MentorCard)
        if (mentorState?.mentorId) {
          const mentor: MentorDetailData = {
            id: mentorState.mentorId,
            profileId: mentorState.mentorId,
            userId: mentorState.mentorId, 
            name: mentorState.mentorName || 'Mentor',
            position: mentorState.mentorPosition || 'Position',
            skills: mentorState.mentorSkills || [],
            anosExperiencia: mentorState.mentorXp || 0,
            isActive: mentorState.mentorIsActive !== false,
            isAvailable: true,
            avatarUrl: mentorState.mentorAvatar,
            bio: mentorState.mentorBio || undefined,
            rating: mentorState.mentorRating !== undefined ? mentorState.mentorRating : 5.0,
            menteeCount: mentorState.menteeCount || 0
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
              const mentor = await mentorService.getMentorDetails(profileId);
              if (mentor) {
                setSelectedMentor(mentor);
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn('[BookSessionWithMentor] Backend fetch failed:', err);
              setError('Mentor não encontrado. Por favor, volte à página de mentorias.');
              setLoading(false);
              return;
            }
          }
        }
      
              if (urlMentorId || urlMenteeId || mentorState?.mentorId) {
                loadProfile();
              } else {
                setError('Nenhum perfil selecionado.');
                setLoading(false);
              }
            } catch (err) {
              console.error('[BookSessionWithMentor] Error loading profile:', err);
              setError('Erro ao carregar o perfil.');
              setLoading(false);
            }
          };
      
          loadProfile();
        }, [urlMentorId, urlMenteeId, mentorState]);

  // Load current user's profile IDs (MENTOR and MENTORADO)
  useEffect(() => {
    if (!myUserId) return;
    const loadMyProfiles = async () => {
      try {
        const res = await apiFetch(`/users/${myUserId}`);
        if (res.ok) {
          const data = await res.json();
          const profiles: any[] = data.profiles || [];
          
          // Find MENTORADO profile
          const mProfile = profiles.find(p => p.role?.toUpperCase() === 'MENTORADO');
          if (mProfile) {
            console.log('[BookSessionWithMentor] Found Mentee Profile ID:', mProfile.id);
            setMenteeProfileId(mProfile.id);
          }
          
          // Find MENTOR profile
          const mentorP = profiles.find(p => p.role?.toUpperCase() === 'MENTOR');
          if (mentorP) {
            console.log('[BookSessionWithMentor] Found Mentor Profile ID:', mentorP.id);
            setMyMentorProfileId(mentorP.id);
          }
        }
      } catch (err) {
        console.error('[BookSessionWithMentor] Error loading user profiles:', err);
      }
    };
    loadMyProfiles();
  }, [myUserId]);

  // Load connection status between current user's profile and the target profile
  useEffect(() => {
    if (!menteeProfileId || !selectedMentor) return;

    const loadConnection = async () => {
      const timer = setTimeout(() => setConnectionStatus('none'), 5000);
      setConnectionStatus('loading');
      try {
        const res = await apiFetch(`/mentorship-connections/mentee/${menteeProfileId}`);
        clearTimeout(timer);
        if (!res.ok) { setConnectionStatus('none'); return; }
        const connections = await res.json();
        
        const conn = connections.find(
          (c: { mentorProfileId: number; status: string; id: number }) =>
            Number(c.mentorProfileId) === Number(selectedMentor.profileId)
        );
        if (!conn) {
          setConnectionStatus('none');
        } else if (conn.status === 'APPROVED') {
          setConnectionStatus('active');
          setConnectionId(conn.id);
        } else if (conn.status === 'PENDING') {
          setConnectionStatus('pending');
          setConnectionId(conn.id);
        } else {
          setConnectionStatus('none');
        }
      } catch {
        clearTimeout(timer);
        setConnectionStatus('none');
      }
    };

    loadConnection();
  }, [menteeProfileId, selectedMentor]);

  // If in mentor view, we need to find the connection ID for the action buttons
  useEffect(() => {
    if (!selectedMentor || !myUserId) return;

    const loadMentorConnection = async () => {
      try {
        const res = await apiFetch(`/mentorship-connections/mentor/${myUserId}`);
        if (res.ok) {
          const connections = await res.json();
          const conn = connections.find(
            (c: { menteeProfileId: number; status: string; id: number }) =>
              Number(c.menteeProfileId) === Number(selectedMentor.profileId)
          );
          if (conn && conn.status === 'APPROVED') {
            setConnectionId(conn.id);
            setConnectionStatus('active');
          }
        }
      } catch (err) {
        console.error('[BookSessionWithMentor] Error loading mentor side connection:', err);
      }
    };
    loadMentorConnection();
  }, [selectedMentor, myUserId]);

  const handleConnect = async () => {
    if (!menteeProfileId || !selectedMentor || !selectedMentor.profileId) {
      toast({ title: 'Atenção', description: 'Carregando informações do perfil...' });
      return;
    }
    
    setConnectionStatus('loading');
    try {
      const res = await apiFetch('/mentorship-connections', {
        method: 'POST',
        body: JSON.stringify({ 
          mentorProfileId: selectedMentor.profileId, 
          menteeProfileId: menteeProfileId,
          createdBy: myUserId
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || JSON.stringify(err));
      }
      const conn = await res.json();
      setConnectionId(conn.id);
      setConnectionStatus('pending');
      toast({ title: 'Solicitação enviada!', description: 'Aguarde a aprovação do mentor.' });
    } catch (err) {
      setConnectionStatus('none');
      toast({ title: 'Erro ao solicitar conexão', description: String(err) });
    }
  };

  const handleLeave = async () => {
    if (!connectionId || !myUserId) return;
    setConnectionStatus('loading');
    try {
      const res = await apiFetch(`/mentorship-connections/${connectionId}?userId=${myUserId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setConnectionStatus('none');
      setConnectionId(null);
      toast({ title: 'Mentoria encerrada', description: 'Você saiu da mentoria com sucesso.' });
    } catch (err) {
      setConnectionStatus('active');
      toast({ title: 'Erro ao sair da mentoria', description: String(err) });
    }
  };

  if (loading) {
    return (
      <div className="book-session-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedMentor) {
    return (
      <div className="book-session-error">
        <div className="error-container">
          <div className="error-box">
            <h2 className="error-title">Perfil não encontrado</h2>
            <p className="error-message">{error || 'Não conseguimos carregar os dados.'}</p>
            <button
              onClick={() => navigate('/mentorias')}
              className="error-button"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define Profile IDs for scheduling components
  // If I am the mentor viewing a mentee: mentorId is my Mentor Profile, menteeId is the target profile
  // If I am the mentee viewing a mentor: mentorId is target profile, menteeId is my Mentee Profile
  // const schedulerMentorId = myMentorProfileId?.toString() : selectedMentor.profileId?.toString();
  // const schedulerMenteeId = isMentorView ? selectedMentor.profileId?.toString() : menteeProfileId?.toString();
  const schedulerMentorId = selectedMentor.profileId?.toString();
  const schedulerMenteeId = menteeProfileId?.toString();

  return (
    <div className="book-session-with-mentor">
        <MentorInfo
          mentorId={selectedMentor.id || selectedMentor.profileId || selectedMentor.userId}
          name={selectedMentor.name}
          position={selectedMentor.position}
          skills={selectedMentor.skills}
          experience={selectedMentor.anosExperiencia}
          isActive={selectedMentor.isActive}
          avatarUrl={selectedMentor.avatarUrl}
          bio={selectedMentor.bio}
          rating={selectedMentor.rating}
          menteeCount={selectedMentor.menteeCount}
          connectionStatus={connectionStatus}
          onConnect={handleConnect}
          onLeave={handleLeave}
          onChat={selectedMentor.userId ? () => setActiveChatId(selectedMentor.userId!) : undefined}
        />

      {selectedMentor.isAvailable && currentUserId && connectionStatus === 'active' && (
        <div className="calendar-container">
          <SlotSelector 
            mentorId={schedulerMentorId || '0'}
            menteeId={schedulerMenteeId || '0'}
            connectionId={connectionId}
            onBooked={() => setSessionRefreshKey(k => k + 1)}
          />
        </div>
      )}

      <div className="calendar-container">
        <SessionList 
          key={sessionRefreshKey}
          mentorId={schedulerMentorId || '0'}
          menteeId={schedulerMenteeId}
          connectionId={connectionId}
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