import React, { useMemo } from "react";
import { Clock, Video, RefreshCw, ExternalLink } from "lucide-react";
import "./SessionList.css";
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data and hooks - replace with your actual data fetching
// You should have a `useMentoring` hook that provides sessions
const useMentoring = () => ({
  getSessionsBetween: (mentorId: string, menteeId?: string) => [
    { id: '1', mentorId, menteeId: menteeId || 'generic', date: '2026-04-04T11:00:00.000Z', startTime: '08:00', endTime: '09:00', status: 'scheduled', isRecurring: true, recurrenceCount: 4, meetLink: '#' },
    { id: '2', mentorId, menteeId: menteeId || 'generic', date: '2026-03-25T12:00:00.000Z', startTime: '08:00', endTime: '09:00', status: 'completed', isRecurring: true, recurrenceCount: 3, meetLink: '#' },
    { id: '3', mentorId, menteeId: menteeId || 'generic', date: '2026-03-18T13:00:00.000Z', startTime: '08:00', endTime: '09:00', status: 'no-show', isRecurring: true, recurrenceCount: 2, meetLink: '#' },
  ],
});

type Session = ReturnType<ReturnType<typeof useMentoring>['getSessionsBetween']>[0];

interface SessionListProps {
  mentorId: string;
  menteeId?: string;
  showHeader?: boolean;
  upcomingOnly?: boolean;
  daysLimit?: number;
  emptyStateMessage?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'badge-scheduled' },
  completed: { label: 'Realizada', className: 'badge-completed' },
  rescheduled: { label: 'Reagendada', className: 'badge-rescheduled' },
  'no-show': { label: 'No-show', className: 'badge-no-show' },
};

const SessionItem: React.FC<{ session: Session }> = ({ session }) => {
  const { status, isRecurring, recurrenceCount } = session;
  const isFuture = !isPast(parseISO(session.date));
  const config = statusConfig[status];

  return (
    <div className="session-item">
      <div className="session-date">
        <span className="session-date-day">{format(parseISO(session.date), 'dd')}</span>
        <span className="session-date-month">{format(parseISO(session.date), 'MMM', { locale: ptBR })}</span>
      </div>

      <div className="session-details">
        <div className="session-time">{session.startTime} – {session.endTime}</div>
        <div className="session-status">
          <span className={`session-status-badge ${config.className}`}>{config.label}</span>
          {isRecurring && (
            <div className="session-status-icon-container">
              <RefreshCw className="session-status-icon" />
              <span>{recurrenceCount}/10</span>
            </div>
          )}
        </div>
      </div>

      {isFuture && status === 'scheduled' && (
        <div className="session-actions">
          <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="session-action-button">
            <Video className="meet-button-icon" />
            <span>Meet</span>
            <ExternalLink className="reschedule-button-icon" />
          </a>
          <button className="session-action-button">
            <RefreshCw className="reschedule-button-icon" />
            <span>Reagendar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export function SessionList({ 
  mentorId, 
  menteeId, 
  showHeader = true,
  upcomingOnly = false,
  daysLimit = 14,
  emptyStateMessage = 'Não há mentorias marcadas'
}: SessionListProps) {
  const { getSessionsBetween } = useMentoring();
  const sessions = getSessionsBetween(mentorId, menteeId);

  // Filter sessions based on options
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (upcomingOnly) {
      const now = new Date();
      const twoWeeksFromNow = addDays(now, daysLimit);

      // Only upcoming sessions within the time limit
      filtered = filtered.filter(s => {
        const sessionDate = parseISO(s.date);
        return isWithinInterval(sessionDate, { start: now, end: twoWeeksFromNow }) && s.status === 'scheduled';
      });
    }

    return filtered;
  }, [sessions, upcomingOnly, daysLimit]);

  if (filteredSessions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        color: '#666',
        fontSize: '0.95rem'
      }}>
        {emptyStateMessage}
      </div>
    );
  }

  const completedCount = filteredSessions.filter(s => s.status === 'completed').length;
  const upcomingSessions = filteredSessions.filter(s => !isPast(parseISO(s.date)) && s.status !== 'completed' && s.status !== 'no-show');
  const pastSessions = filteredSessions.filter(s => isPast(parseISO(s.date)) || s.status === 'completed' || s.status === 'no-show');

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
