import './ManageSessionWithMentee.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MentoringProvider } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import MenteeInfo from '../../components/common/MenteeInfo/MenteeInfo'
import { apiFetch } from '../../services/api'
import { toast } from '../../hooks/use-toast'
import { useChat } from '../../components/chat/ChatContext/ChatContext'
import mentorService, { type MenteeDetailData } from '../../services/mentorService'

interface Skill {
  id: string;
  name: string;
}

interface MenteeLocationState {
  menteeId?: number;
  menteeName?: string;
  menteePosition?: string;
  menteeSkills?: Skill[];
  menteeXp?: number;
  menteeAvatar?: string;
  menteeIsActive?: boolean;
  menteeBio?: string;
}

type ConnectionStatus = 'none' | 'pending' | 'active' | 'loading';

function ManageSessionContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mentorId: urlMentorId, menteeId: urlMenteeId } = useParams<{ mentorId?: string, menteeId?: string }>();
  const [selectedMentee, setSelectedMentee] = useState<MenteeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [mentorProfileId, setMentorProfileId] = useState<number | null>(null);
  const [myMenteeProfileId, setMyMenteeProfileId] = useState<number | null>(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const { setActiveChatId } = useChat();
  
  // Get current user ID from localStorage (authenticated mentor)
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const myUserId = currentUserId ? parseInt(currentUserId, 10) : null;
  const menteeState = location.state as MenteeLocationState | null;

  useEffect(() => {
    const loadMenteeData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (menteeState?.menteeId) {
          const mentee: MenteeDetailData = {
            id: menteeState.menteeId,
            profileId: menteeState.menteeId,
            userId: menteeState.menteeId, 
            name: menteeState.menteeName || 'Mentee',
            position: menteeState.menteePosition || 'Position',
            skills: menteeState.menteeSkills || [],
            anosExperiencia: menteeState.menteeXp || 0,
            isActive: menteeState.menteeIsActive !== false,
            isAvailable: true,
            avatarUrl: menteeState.menteeAvatar,
            bio: menteeState.menteeBio || undefined,
          };
          setSelectedMentee(mentee);
          setLoading(false);
          return;
        }

        // Fetch mentee data with URL parameter
        if (urlMenteeId) {
          const menteeId = parseInt(urlMenteeId, 10);
          if (!isNaN(menteeId)) {
            try {
              const mentee = await mentorService.getMenteeDetails(menteeId);
              if (mentee) {
                setSelectedMentee(mentee);
                setLoading(false);
                return;
              }
            } catch (err) {
              console.warn('[ManageSessionWithMentee] Backend fetch failed:', err);
              setError('Mentorado não encontrado. Por favor, volte à página anterior.');
              setLoading(false);
              return;
            }
          }
        }
      
              if (urlMentorId || urlMenteeId ||menteeState?.menteeId) {
                loadProfile();
              } else {
                setError('Nenhum perfil selecionado.');
                setLoading(false);
              }
            } catch (err) {
              console.error('[ManageSessionWithMentee] Error loading profile:', err);
              setError('Erro ao carregar o perfil.');
              setLoading(false);
            }
          };
      
          loadProfile();
        }, [urlMentorId, urlMenteeId, menteeState]);

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
        const mProfile = profiles.find(p => p.role?.toUpperCase() === 'MENTOR');
        if (mProfile) {
          console.log('[BookSessionWithMentor] Found Mentee Profile ID:', mProfile.id);
          setMentorProfileId(mProfile.id);
        }
        
        // Find MENTOR profile
        const mentorP = profiles.find(p => p.role?.toUpperCase() === 'MENTORADO');
        if (mentorP) {
          console.log('[BookSessionWithMentor] Found Mentor Profile ID:', mentorP.id);
          setMyMenteeProfileId(mentorP.id);
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
  if (!mentorProfileId || !selectedMentee) return;

  const loadConnection = async () => {
    const timer = setTimeout(() => setConnectionStatus('none'), 5000);
    setConnectionStatus('loading');
    try {
      const res = await apiFetch(`/mentorship-connections/mentor/${mentorProfileId}`);
      clearTimeout(timer);
      if (!res.ok) { setConnectionStatus('none'); return; }
      const connections = await res.json();
      
      const conn = connections.find(
        (c: { menteeProfileId: number; status: string; id: number }) =>
          Number(c.menteeProfileId) === Number(selectedMentee.profileId)
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
}, [mentorProfileId, selectedMentee]);

// If in mentor view, we need to find the connection ID for the action buttons
useEffect(() => {
  if (!selectedMentee || !myUserId) return;

  const loadMentorConnection = async () => {
    try {
      const res = await apiFetch(`/mentorship-connections/mentor/${myUserId}`);
      if (res.ok) {
        const connections = await res.json();
        const conn = connections.find(
          (c: { menteeProfileId: number; status: string; id: number }) =>
            Number(c.menteeProfileId) === Number(selectedMentee.profileId)
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
}, [selectedMentee, myUserId]);

const handleConnect = async () => {
  if (!mentorProfileId || !selectedMentee || !selectedMentee.profileId) {
    toast({ title: 'Atenção', description: 'Carregando informações do perfil...' });
    return;
  }
  
  setConnectionStatus('loading');
  try {
    const res = await apiFetch('/mentorship-connections', {
      method: 'POST',
      body: JSON.stringify({ 
        mentorProfileId: selectedMentee.profileId, 
        menteeProfileId: mentorProfileId,
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

if (error || !selectedMentee) {
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
const schedulerMentorId = selectedMentee.profileId?.toString();
const schedulerMenteeId = mentorProfileId?.toString();


  // const menteeIdNum = urlMenteeId ? parseInt(urlMenteeId, 10) : undefined;
  // const currentUserIdStr = currentUserId?.toString() || '0';

  return (
    <div className="manage-session-with-mentee">
      <MenteeInfo
          menteeId={selectedMentee.id || selectedMentee.profileId || selectedMentee.userId}
          name={selectedMentee.name}
          position={selectedMentee.position}
          experience={selectedMentee.anosExperiencia}
          avatarUrl={selectedMentee.avatarUrl}
          bio={selectedMentee.bio}
          connectionStatus={connectionStatus}
          onLeave={handleLeave}
          onChat={selectedMentee.userId ? () => setActiveChatId(selectedMentee.userId!) : undefined}
        />

      {selectedMentee.isAvailable && currentUserId && connectionStatus === 'active' && (
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

export function ManageSessionWithMentee() {
  return (
    <MentoringProvider>
      <ManageSessionContent />
    </MentoringProvider>
  )
}

export default ManageSessionWithMentee