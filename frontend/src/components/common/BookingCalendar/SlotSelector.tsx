import { useState, useMemo } from 'react';
import { useMentoring } from './MentoringContext';
import BookingCalendar from './BookingCalendar';
import Button from '../Button/Button';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { Label } from '../ui/Label';
import { CalendarCard, CalendarCardContent, CalendarCardHeader, CalendarCardTitle } from '../ui/CalendarCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { CalendarIcon, Clock, Video, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SlotSelectorProps {
  mentorId: string;
  menteeId: string;
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function SlotSelector({ mentorId, menteeId }: SlotSelectorProps) {
  const { mentors, bookCustomSlot, getAvailableBlocksForDate } = useMentoring();
  const mentor = mentors.find(m => m.id === mentorId);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // minutes
  const [isRecurring, setIsRecurring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const blocks = useMemo(() => {
    if (!dateStr) return [];
    return getAvailableBlocksForDate(mentorId, dateStr);
  }, [dateStr, mentorId, getAvailableBlocksForDate]);

  const selectedBlock = selectedBlockIdx !== null ? blocks[selectedBlockIdx] : null;

  // Generate possible start times for the selected block (30min increments)
  const startTimeOptions = useMemo(() => {
    if (!selectedBlock) return [];
    const blockStart = toMinutes(selectedBlock.startTime);
    const blockEnd = toMinutes(selectedBlock.endTime);
    const options: string[] = [];
    for (let t = blockStart; t + 60 <= blockEnd; t += 30) {
      options.push(fromMinutes(t));
    }
    return options;
  }, [selectedBlock]);

  // Max duration for selected start time
  const maxDuration = useMemo(() => {
    if (!selectedBlock || !selectedStartTime) return 60;
    const start = toMinutes(selectedStartTime);
    const blockEnd = toMinutes(selectedBlock.endTime);
    return Math.min(blockEnd - start, 240); // cap 4h
  }, [selectedBlock, selectedStartTime]);

  // Duration options (1h to 4h in 30min steps, capped by maxDuration)
  const durationOptions = useMemo(() => {
    const opts: number[] = [];
    for (let d = 60; d <= maxDuration; d += 30) {
      opts.push(d);
    }
    return opts;
  }, [maxDuration]);

  const endTime = selectedStartTime ? fromMinutes(toMinutes(selectedStartTime) + selectedDuration) : '';

  // Check which dates have availability (for calendar highlighting)
  const availableDates = useMemo(() => {
    if (!mentor) return new Set<string>();
    const dates = new Set<string>();
    const today = new Date();
    for (let i = 1; i <= 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ds = format(d, 'yyyy-MM-dd');
      const b = getAvailableBlocksForDate(mentorId, ds);
      if (b.length > 0) dates.add(ds);
    }
    return dates;
  }, [mentor, mentorId, getAvailableBlocksForDate]);

  const isDayAvailable = (date: Date) => availableDates.has(format(date, 'yyyy-MM-dd'));

  const resetSelection = () => {
    setSelectedBlockIdx(null);
    setSelectedStartTime(null);
    setSelectedDuration(60);
    setIsRecurring(false);
  };

  const handleConfirm = () => {
    if (!selectedStartTime || !dateStr) return;
    bookCustomSlot({
      mentorId,
      menteeId,
      date: dateStr,
      startTime: selectedStartTime,
      endTime,
      isRecurring,
    });
    // toast({
    //   title: 'Mentoria agendada!',
    //   description: isRecurring
    //     ? 'Agendamento recorrente criado (10 sessões semanais).'
    //     : `Sessão agendada para ${format(selectedDate!, "dd/MM/yyyy")} das ${selectedStartTime} às ${endTime}.`,
    // });
    setShowConfirm(false);
    setSelectedDate(undefined);
    resetSelection();
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `${h}h`;
    return `${h}h${m}min`;
  };

  return (
    <CalendarCard>
      <CalendarCardHeader>
        <CalendarCardTitle >
          <CalendarIcon 
            size={18}
            color="var(--purple-primary)"
          />
          Agendar Próxima Mentoria
        </CalendarCardTitle>
      </CalendarCardHeader>
      <CalendarCardContent>
          <div>
            <BookingCalendar
              mentorId={mentorId}
              mode="single"
              selected={selectedDate}
              onSelect={(d: Date | undefined) => { setSelectedDate(d); resetSelection(); }}
              modifiers={{ available: isDayAvailable }}
              modifiersClassNames={{ available: 'bg-primary/15 font-semibold text-primary' }}
            />
          </div>

          {/* Block & Time Selection */}
          <div className="flex-1 min-w-[280px]">
            {selectedDate ? (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Horários Disponíveis</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            ) : !selectedDate ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <p>Selecione uma data no calendário</p>
              </div>
            ) : null}
            
            {selectedDate ? (
              <div className="mt-4">
                {blocks.length > 0 ? (
                  <>
                    {/* Available Blocks */}
                    <div className="space-y-2">
                      {blocks.map((block, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setSelectedBlockIdx(idx); setSelectedStartTime(null); setSelectedDuration(60); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                            selectedBlockIdx === idx
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <Clock color="var(--purple-primary)"/>
                          <div>
                            <p className="text-sm font-medium">{block.startTime} – {block.endTime}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(toMinutes(block.endTime) - toMinutes(block.startTime))} disponível
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Start Time & Duration pickers */}
                    {selectedBlock && (
                      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Início</Label>
                            <Select
                              value={selectedStartTime || ''}
                              onValueChange={(v: string) => { setSelectedStartTime(v); setSelectedDuration(60); }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Horário" />
                              </SelectTrigger>
                              <SelectContent>
                                {startTimeOptions.map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Duração</Label>
                            <Select
                              value={String(selectedDuration)}
                              onValueChange={(v: string) => setSelectedDuration(Number(v))}
                              disabled={!selectedStartTime}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Duração" />
                              </SelectTrigger>
                              <SelectContent>
                                {durationOptions.map(d => (
                                  <SelectItem key={d} value={String(d)}>{formatDuration(d)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {selectedStartTime && (
                          <p className="text-xs text-muted-foreground">
                            Sessão: <strong>{selectedStartTime} – {endTime}</strong> ({formatDuration(selectedDuration)})
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recurring + Confirm */}
                    {selectedStartTime && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <Label htmlFor="recurring" className="text-sm font-medium">
                              Repetir semanalmente
                            </Label>
                            <p className="text-xs text-muted-foreground">Máx. 10 encontros</p>
                          </div>
                          <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                        </div>
                        <Button className="w-full" onClick={() => setShowConfirm(true)}>
                          <Video className="h-4 w-4 mr-2" />
                          Confirmar Agendamento
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum horário disponível nesta data.</p>
                )}
              </div>
            ) : null}
          </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Confirmar Agendamento</DialogTitle>
              <DialogDescription>
                {selectedDate && selectedStartTime && (
                  <div className="mt-3 space-y-2">
                    <p><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedStartTime} – {endTime} ({formatDuration(selectedDuration)})</p>
                    {isRecurring && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        <RefreshCw className="h-3 w-3 mr-1" /> Recorrente · 10 sessões
                      </Badge>
                    )}
                    <p className="text-xs mt-2">Um link do Google Meet será gerado automaticamente.</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button onClick={handleConfirm}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CalendarCardContent>
    </CalendarCard>
  );
}
