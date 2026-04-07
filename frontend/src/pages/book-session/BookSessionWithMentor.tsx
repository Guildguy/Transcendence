import './BookSessionWithMentor.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MentorInfo from '../../components/common/MentorInfo/MentorInfo'
import { MentoringProvider } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import mentorService, { type MentorDetailData } from '../../services/mentorService'
import { apiFetch } from '../../services/api'
import { toast } from '../../hooks/use-toast'
import MenteeInfo from '../../components/common/MenteeInfo/MenteeInfo'

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

type ConnectionStatus = 'none' | 'pending' | 'active' | 'loading';

function BookSessionContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mentorId: urlMentorId, menteeId: urlMenteeId } = useParams<{ mentorId?: string, menteeId?: string }>();
  const [targetProfile, setTargetProfile] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMentorView = !!urlMenteeId;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [menteeProfileId, setMenteeProfileId] = useState<number | null>(null);
  const [myMentorProfileId, setMyMentorProfileId] = useState<number | null>(null);
  
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const myUserId = currentUserId ? parseInt(currentUserId, 10) : null;

  const mentorState = location.state as MentorLocationState | null;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileId = urlMenteeId || urlMentorId;
        
        if (profileId) {
          const id = parseInt(profileId, 10);
          console.log(`[BookSessionWithMentor] Loading details for Profile ID: ${id} (Mode: ${isMentorView ? 'Mentor' : 'Mentee'})`);
          try {
            const data = await mentorService.getMentorDetails(id);
            if (data) {
              setTargetProfile(data);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('[BookSessionWithMentor] Backend fetch failed', err);
          }
        }

        // No profile found
        setError(isMentorView ? 'Mentorado não encontrado.' : 'Mentor não encontrado. Por favor, volte à página de mentorias.');
      } catch (error) {
        console.error('[BookSessionWithMentor] Unexpected error:', error);
        setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Tente novamente'}`);
      } finally {
        setLoading(false);
      }
    };

    if (urlMentorId || urlMenteeId || mentorState?.mentorId) {
      loadProfile();
    } else {
      setError('Nenhum perfil selecionado.');
      setLoading(false);
    }
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
    if (!menteeProfileId || !targetProfile || isMentorView) return;

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
            Number(c.mentorProfileId) === Number(targetProfile.profileId)
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
  }, [menteeProfileId, targetProfile, isMentorView]);

  // If in mentor view, we need to find the connection ID for the action buttons
  useEffect(() => {
    if (!isMentorView || !targetProfile || !myUserId) return;

    const loadMentorConnection = async () => {
      try {
        const res = await apiFetch(`/mentorship-connections/mentor/${myUserId}`);
        if (res.ok) {
          const connections = await res.json();
          const conn = connections.find(
            (c: { menteeProfileId: number; status: string; id: number }) =>
              Number(c.menteeProfileId) === Number(targetProfile.profileId)
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
  }, [isMentorView, targetProfile, myUserId]);

  const handleConnect = async () => {
    if (!menteeProfileId || !targetProfile || !targetProfile.profileId) {
      toast({ title: 'Atenção', description: 'Carregando informações do perfil...' });
      return;
    }
    
    setConnectionStatus('loading');
    try {
      const res = await apiFetch('/mentorship-connections', {
        method: 'POST',
        body: JSON.stringify({ 
          mentorProfileId: targetProfile.profileId, 
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

  if (error || !targetProfile) {
    return (
      <div className="book-session-error">
        <div className="error-container">
          <div className="error-box">
            <h2 className="error-title">Perfil não encontrado</h2>
            <p className="error-message">{error || 'Não conseguimos carregar os dados.'}</p>
            <button
              onClick={() => navigate(isMentorView ? '/mentor-dashboard' : '/mentoros')}
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
  const schedulerMentorId = isMentorView ? myMentorProfileId?.toString() : targetProfile.profileId?.toString();
  const schedulerMenteeId = isMentorView ? targetProfile.profileId?.toString() : menteeProfileId?.toString();

  return (
    <div className="book-session-with-mentor">
      {isMentorView ? (
        <MenteeInfo
          name={targetProfile.name}
          position={targetProfile.position}
          experience={targetProfile.anosExperiencia}
          avatarUrl={targetProfile.avatarUrl}
          bio={targetProfile.bio}
          connectionStatus={connectionStatus}
          onLeave={handleLeave}
        />
      ) : (
        <MentorInfo
          name={targetProfile.name}
          position={targetProfile.position}
          skills={targetProfile.skills}
          experience={targetProfile.anosExperiencia}
          isActive={targetProfile.isActive}
          avatarUrl={targetProfile.avatarUrl}
          bio={targetProfile.bio}
          connectionStatus={connectionStatus}
          onConnect={handleConnect}
          onLeave={handleLeave}
        />
      )}

      {targetProfile.isAvailable && currentUserId && connectionStatus === 'active' && (
        <div className="calendar-container">
          <SlotSelector 
            mentorId={schedulerMentorId || '0'}
            menteeId={schedulerMenteeId || '0'}
            connectionId={connectionId}
          />
        </div>
      )}

      <div className="calendar-container">
        <SessionList 
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