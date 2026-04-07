import './ManageSessionWithMentee.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MentoringProvider } from '../../components/common/BookingCalendar/MentoringContext'
import { SlotSelector } from '../../components/common/SlotSelector/SlotSelector'
import { SessionList } from '../../components/common/SessionList/SessionList'
import MenteeInfo from '../../components/common/MenteeInfo/MenteeInfo'
import { apiFetch } from '../../services/api'

function ManageSessionContent() {
  const navigate = useNavigate();
  const { menteeId: urlMenteeId } = useParams<{ menteeId?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user ID from localStorage (authenticated mentor)
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    const loadMenteeData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[ManageSessionContent] Starting mentee load...');
        console.log('[ManageSessionContent] URL menteeId:', urlMenteeId);

        // Fetch mentee data with URL parameter
        if (urlMenteeId) {
          const menteeId = parseInt(urlMenteeId, 10);
          if (!isNaN(menteeId)) {
            try {
              console.log(`[ManageSessionContent] Fetching mentee data with ID: ${menteeId}`);
              const response = await apiFetch(`/users/${menteeId}`);
              if (response.ok) {
                await response.json();
                console.log('[ManageSessionContent] ✓ Mentee data loaded successfully');
                // Data will be fetched by MenteeInfo component
                setLoading(false);
                return;
              } else if (response.status === 404) {
                throw new Error('Mentorado não encontrado');
              } else {
                throw new Error(`Erro ao carregar dados: ${response.status}`);
              }
            } catch (err) {
              console.error('[ManageSessionContent] Error fetching mentee:', err);
              setError(err instanceof Error ? err.message : 'Erro ao carregar dados do mentorado');
            }
          }
        } else {
          setError('ID do mentorado não fornecido.');
        }
      } catch (error) {
        console.error('[ManageSessionContent] Unexpected error:', error);
        setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Tente novamente'}`);
      } finally {
        setLoading(false);
      }
    };

    if (urlMenteeId) {
      loadMenteeData();
    } else {
      setError('Nenhum mentorado selecionado. Por favor, volta à página anterior.');
      setLoading(false);
    }
  }, [urlMenteeId]);


  if (loading) {
    return (
      <div className="manage-session-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando dados do mentorado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-session-error">
        <div className="error-container">
          <div className="error-box">
            <h2 className="error-title">Erro ao carregar mentorado</h2>
            <p className="error-message">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="error-button"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menteeIdNum = urlMenteeId ? parseInt(urlMenteeId, 10) : undefined;
  const currentUserIdStr = currentUserId?.toString() || '0';

  return (
    <div className="manage-session-with-mentee">
      <MenteeInfo menteeId={menteeIdNum} />

      {currentUserId && (
        <>
          <div className="calendar-container">
            <SlotSelector 
              mentorId={currentUserIdStr}
              menteeId={urlMenteeId || '0'}
              context="mentee"
            />
          </div>

          <div className="calendar-container">
            <SessionList 
              mentorId={currentUserIdStr}
              menteeId={urlMenteeId}
              showHeader={true}
              upcomingOnly={true}
            />
          </div>
        </>
      )}
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