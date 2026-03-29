import { useState } from 'react';
import { useMentoring } from './MentoringContext';
import type { Session } from './types.ts';
import { CalendarCard, CalendarCardContent, CalendarCardHeader, CalendarCardTitle } from '../ui/CalendarCard';
import Button from '../Button/Button';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Calendar, Video, RefreshCw, ArrowRightLeft, ExternalLink, History } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../../../hooks/use-toast';

interface SessionListProps {
  mentorId: string;
  menteeId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-primary/10 text-primary' },
  completed: { label: 'Realizada', className: 'bg-success/10 text-success' },
  rescheduled: { label: 'Reagendada', className: 'bg-warning/10 text-warning' },
  'no-show': { label: 'No-show', className: 'bg-destructive/10 text-destructive' },
};

export function SessionList({ mentorId, menteeId }: SessionListProps) {
  const { getSessionsBetween, getSlotsForMentor, rescheduleSession } = useMentoring();
  const sessions = getSessionsBetween(mentorId, menteeId);
  const [rescheduleTarget, setRescheduleTarget] = useState<Session | null>(null);
  const [newSlotId, setNewSlotId] = useState<string | null>(null);

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const futureSessions = sessions.filter(s => !isPast(parseISO(s.date)) && s.status !== 'completed' && s.status !== 'no-show');
  const pastSessions = sessions.filter(s => isPast(parseISO(s.date)) || s.status === 'completed' || s.status === 'no-show');

  const availableSlots = getSlotsForMentor(mentorId).filter(s => !s.booked);

  const handleReschedule = () => {
    if (!rescheduleTarget || !newSlotId) return;
    rescheduleSession(rescheduleTarget.id, newSlotId);
    toast({ title: 'Sessão reagendada!', description: 'O horário foi atualizado.' });
    setRescheduleTarget(null);
    setNewSlotId(null);
  };

  const renderSession = (session: Session) => {
    const config = statusConfig[session.status];
    const isFuture = !isPast(parseISO(session.date));

    return (
      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-Calendarcard hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[50px]">
            <p className="text-lg font-bold font-display leading-none">
              {format(parseISO(session.date), 'dd')}
            </p>
            <p className="text-xs text-muted-foreground uppercase">
              {format(parseISO(session.date), 'MMM', { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">{session.startTime} – {session.endTime}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={`${config.className} text-[10px] px-1.5 py-0`}>{config.label}</Badge>
              {session.isRecurring && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <RefreshCw size={18} color="var(--purple-primary)" />
                  {session.recurrenceCount}/10
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isFuture && session.status === 'scheduled' && (
            <>
              <Button>
                <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                  <Video size={18} color="var(--purple-primary)" /> Meet
                  <ExternalLink size={18} color="var(--purple-primary)" />
                </a>
              </Button>
              <Button onClick={() => setRescheduleTarget(session)}>
                <ArrowRightLeft size={18} color="var(--purple-primary)" /> Reagendar
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <CalendarCard>
        <CalendarCardHeader>
          <div className="flex items-center justify-between">
            <CalendarCardTitle className="font-display text-lg flex items-center gap-2">
              <History size={18} color="var(--purple-primary)" />
              Histórico de Sessões
            </CalendarCardTitle>
            <Badge>
              {completedCount} mentoria(s) realizada(s)
            </Badge>
          </div>
        </CalendarCardHeader>
        <CalendarCardContent className="space-y-4">
          {futureSessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Próximas</p>
              <div className="space-y-2">{futureSessions.map(renderSession)}</div>
            </div>
          )}
          {pastSessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Anteriores</p>
              <div className="space-y-2">{pastSessions.map(renderSession)}</div>
            </div>
          )}
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma sessão registrada.</p>
          )}
        </CalendarCardContent>
      </CalendarCard>

      <Dialog open={!!rescheduleTarget} onOpenChange={() => { setRescheduleTarget(null); setNewSlotId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Reagendar Sessão</DialogTitle>
            <DialogDescription>Escolha um novo horário disponível.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {availableSlots.slice(0, 20).map(slot => (
              <Button
                key={slot.id}
                onClick={() => setNewSlotId(slot.id)}
              >
                <Calendar className="h-3 w-3 mr-2" />
                {format(parseISO(slot.date), "dd/MM (EEE)", { locale: ptBR })} · {slot.startTime} – {slot.endTime}
              </Button>
            ))}
            {availableSlots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sem slots disponíveis.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setRescheduleTarget(null)}>Cancelar</Button>
            <Button onClick={handleReschedule}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
