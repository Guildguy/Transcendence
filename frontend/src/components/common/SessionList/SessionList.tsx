import React, { useMemo, useEffect, useState } from "react";
import { Clock, Video, RefreshCw, ExternalLink, X } from "lucide-react";
import "./SessionList.css";
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiFetch } from '../../../services/api';
import Button from '../Button/Button';

interface Session {
  id: number;
  connectionId: number;
  scheduledDate: string;
  durationMinutes: number;
  meetUrl: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  isRecurrent: boolean;
  recurrenceIndex?: number;
  recurrenceGroupId?: string;
  menteeMissed?: boolean;
  mentorNotes?: string;
}

type SessionListProps = {
  mentorId: string;
  menteeId?: string;
  connectionId?: number | null;
  showHeader?: boolean;
  upcomingOnly?: boolean;
  daysLimit?: number;
  emptyStateMessage?: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'badge-scheduled' },
  COMPLETED: { label: 'Realizada', className: 'badge-completed' },
  RESCHEDULED: { label: 'Reagendada', className: 'badge-rescheduled' },
  NO_SHOW: { label: 'No-show', className: 'badge-no-show' },
  CANCELLED: { label: 'Cancelada', className: 'badge-cancelled' },
};

const SessionItem: React.FC<{ session: Session }> = ({ session }) => {
  const { status, isRecurrent, recurrenceIndex } = session;
  const isFuture = !isPast(parseISO(session.scheduledDate));
  const config = statusConfig[status] || { label: status, className: 'badge-scheduled' };

  const startTime = format(parseISO(session.scheduledDate), 'HH:mm');
  const endTime = format(
    new Date(new Date(session.scheduledDate).getTime() + session.durationMinutes * 60000),
    'HH:mm'
  );

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancelConfirm = async () => {
    try {
      setIsDeleting(true);
      const response = await apiFetch(`/mentorship-sessions/${session.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowCancelDialog(false);
        // Optionally: reload the session list or handle UI update
        window.location.reload();
      } else {
        console.error('Failed to cancel session:', response.status);
        alert('Erro ao cancelar a sessão. Tente novamente.');
      }
    } catch (error) {
      console.error('Error canceling session:', error);
      alert('Erro ao cancelar a sessão. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="session-item">
      <div className="session-date">
        <span className="session-date-day">{format(parseISO(session.scheduledDate), 'dd')}</span>
        <span className="session-date-month">{format(parseISO(session.scheduledDate), 'MMM', { locale: ptBR })}</span>
      </div>

      <div className="session-details">
        <div className="session-time">{startTime} – {endTime}</div>
        <div className="session-status">
          <span className={`session-status-badge ${config.className}`}>{config.label}</span>
          {isRecurrent && recurrenceIndex && (
            <div className="session-status-icon-container">
              <RefreshCw className="session-status-icon" />
              <span>{recurrenceIndex}/10</span>
            </div>
          )}
        </div>
      </div>

      {isFuture && status === 'SCHEDULED' && session.meetUrl && (
        <div className="session-actions">
          <a href={session.meetUrl} target="_blank" rel="noopener noreferrer" className="session-action-button">
            <Video className="meet-button-icon" />
            <span>Meet</span>
            <ExternalLink className="reschedule-button-icon" />
          </a>
          <button 
            className="session-action-button"
            onClick={() => setShowCancelDialog(true)}
          >
            <RefreshCw className="reschedule-button-icon" />
            <span>Cancelar</span>
          </button>
        </div>
      )}

      {showCancelDialog && (
        <div className="modal-overlay" onClick={() => !isDeleting && setShowCancelDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ justifyContent: 'space-between' }}>
              <div />
              <X size={24} onClick={() => !isDeleting && setShowCancelDialog(false)} cursor="pointer" color="var(--purple-primary)" />
            </div>
            <div className="modal-body">
              <h3>Atenção! Esta ação irá cancelar sua sessão</h3>
              <h4>Tem certeza de que quer continuar?</h4>
              <div className="attention-box">
                <p>Não se esqueça de entrar em contato com seu mentor/mentorado para remarcar essa sessão.</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button 
                onClick={() => setShowCancelDialog(false)}
                disabled={isDeleting}
                className="cancel-button"
              >
                Não
              </Button>
              <Button 
                onClick={handleCancelConfirm}
                disabled={isDeleting}
                className="confirm-button"
              >
                {isDeleting ? 'Cancelando...' : 'Sim, cancelar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function SessionList({ 
  mentorId, 
  menteeId, 
  connectionId,
  showHeader = true,
  upcomingOnly = false,
  daysLimit = 14,
  emptyStateMessage = 'Não há mentorias marcadas'
}: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        let url = '';
        // Best way: check by connection
        if (connectionId && connectionId !== 0) {
          url = upcomingOnly 
            ? `/mentorship-sessions/connection/${connectionId}/upcoming`
            : `/mentorship-sessions/connection/${connectionId}`;
        } 
        // Fallbacks
        else if (mentorId && mentorId.toString().match(/^\d+$/)) {
          url = `/mentorship-sessions/mentor/${mentorId}`;
        } else if (menteeId && menteeId.toString().match(/^\d+$/)) {
          url = `/mentorship-sessions/mentee/${menteeId}`;
        }
        
        if (!url) {
          setSessions([]);
          setLoading(false);
          return;
        }

        console.log(`[SessionList] Fetching sessions from: ${url}`);
        const response = await apiFetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setSessions(Array.isArray(data) ? data : []);
          setError(null);
        } else {
          console.warn(`[SessionList] Failed to fetch sessions: HTTP ${response.status}`);
          setSessions([]);
        }
      } catch (err) {
        console.error('[SessionList] Erro ao carregar sessões:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar sessões');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId || menteeId || connectionId) {
      fetchSessions();
    }
  }, [mentorId, menteeId, connectionId, upcomingOnly]);

  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (upcomingOnly) {
      const now = new Date();
      const futureDate = addDays(now, daysLimit);

      filtered = filtered.filter(s => {
        const sessionDate = parseISO(s.scheduledDate);
        return isWithinInterval(sessionDate, { start: now, end: futureDate }) && s.status === 'SCHEDULED';
      });
    }

    return filtered;
  }, [sessions, upcomingOnly, daysLimit]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#666', fontSize: '0.95rem' }}>
        Carregando sessões...
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#c00', fontSize: '0.95rem' }}>
        {error}
      </div>
    );
  }

  if (filteredSessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#666', fontSize: '0.95rem' }}>
        {emptyStateMessage}
      </div>
    );
  }

  const completedCount = filteredSessions.filter(s => s.status === 'COMPLETED').length;
  const upcomingSessions = filteredSessions.filter(s => !isPast(parseISO(s.scheduledDate)) && s.status !== 'COMPLETED' && s.status !== 'NO_SHOW');
  const pastSessions = filteredSessions.filter(s => isPast(parseISO(s.scheduledDate)) || s.status === 'COMPLETED' || s.status === 'NO_SHOW');

  return (
    <>
      {showHeader && (
        <div className="session-list-header">
          <div className="session-list-title-container">
            <Clock className="session-list-title-icon" />
            <h2 className="session-list-title">Histórico de Sessões</h2>
          </div>
          <span className="session-list-badge">
            {completedCount} mentoria(s) realizada(s)
          </span>
        </div>
      )}

      {upcomingSessions.length > 0 && (
        <div>
          {showHeader && <h3 className="session-list-section-title">PRÓXIMAS</h3>}
          {upcomingSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      )}

      {showHeader && pastSessions.length > 0 && (
        <div>
          <h3 className="session-list-section-title">ANTERIORES</h3>
          {pastSessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      )}
    </>
  );
}
