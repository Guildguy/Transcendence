import { useState, useMemo, useEffect } from 'react';
import { useMentoring } from '../BookingCalendar/MentoringContext';
import BookingCalendar from '../BookingCalendar/BookingCalendar';
import Button from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { Switch } from '../Switch/Switch';
import { Label } from '../Label/Label';
import { CalendarCardContent, CalendarCardHeader, CalendarCardTitle } from '../CalendarCard/CalendarCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../Dialog/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select/Select';
import { CalendarIcon, Clock, Video, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../../../hooks/use-toast';
import type { TimeBlock } from '../BookingCalendar/types';
import './SlotSelector.css';


interface SlotSelectorProps {
  mentorId: string;
  menteeId: string;
  context?: 'mentor' | 'mentee';
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function SlotSelector({ mentorId, menteeId, context = 'mentor' }: SlotSelectorProps) {
  const { bookCustomSlot, getBackendAvailability, getAvailableBlocksForDate } = useMentoring();

  const [availabilityBlocks, setAvailabilityBlocks] = useState<TimeBlock[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // minutes
  const [isRecurring, setIsRecurring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch availability from backend on mount or when mentorId changes
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        const { blocks } = await getBackendAvailability(mentorId);
        setAvailabilityBlocks(blocks);
        console.log(`[SlotSelector] Loaded ${blocks.length} availability block(s) for mentor ${mentorId}`);
      } catch (error) {
        console.error('[SlotSelector] Error loading availability:', error);
        setAvailabilityError('Não conseguimos carregar a disponibilidade do mentor. Tente novamente mais tarde.');
        setAvailabilityBlocks([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (mentorId) {
      fetchAvailability();
    }
  }, [mentorId, getBackendAvailability]);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Get available time blocks for selected date
  const blocks = useMemo(() => {
    if (!dateStr || availabilityBlocks.length === 0) return [];
    return getAvailableBlocksForDate(mentorId, dateStr, availabilityBlocks);
  }, [dateStr, mentorId, availabilityBlocks, getAvailableBlocksForDate]);

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
    if (availabilityBlocks.length === 0) return new Set<string>();
    const dates = new Set<string>();
    const today = new Date();
    for (let i = 1; i <= 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ds = format(d, 'yyyy-MM-dd');
      const b = getAvailableBlocksForDate(mentorId, ds, availabilityBlocks);
      if (b.length > 0) dates.add(ds);
    }
    return dates;
  }, [mentorId, availabilityBlocks, getAvailableBlocksForDate]);

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
    toast({
      title: 'Mentoria agendada!',
      description: isRecurring
        ? 'Agendamento recorrente criado (10 sessões semanais).'
        : `Sessão agendada para ${format(selectedDate!, "dd/MM/yyyy")} das ${selectedStartTime} às ${endTime}.`,
    });
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
    <>
      <CalendarCardHeader className="slot-selector-card-header">
        <CalendarCardTitle className="slot-selector-card-title">
          <CalendarIcon 
            size={18}
            color="var(--purple-primary)"
          />
          Agendar Próxima Mentoria
        </CalendarCardTitle>
      </CalendarCardHeader>
      <CalendarCardContent className="slot-selector-card-content">
          {loadingAvailability && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                display: 'inline-block',
                width: '2rem', 
                height: '2rem', 
                border: '2px solid transparent',
                borderTopColor: 'var(--primary, #3b82f6)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>Carregando disponibilidade...</p>
            </div>
          )}

          {availabilityError && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#b91c1c'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Erro ao carregar disponibilidade</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{availabilityError}</p>
              </div>
            </div>
          )}

          {!loadingAvailability && availabilityBlocks.length === 0 && !availabilityError && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#92400e'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>{context === 'mentee' 
                    ? 'Nenhuma sessão agendada.' 
                    : 'Nenhuma disponibilidade.'}</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {context === 'mentee' 
                    ? 'O mentorado ainda não tem nenhuma sessão de mentoria agendada' 
                    : 'O mentor ainda não configurou sua disponibilidade.'}
                </p>
              </div>
            </div>
          )}

          {!loadingAvailability && (
          <div className="slot-selector-calendar-container">
            <BookingCalendar
              mentorId={mentorId}
              mode="single"
              selected={selectedDate}
              onSelect={(d: Date | undefined) => { setSelectedDate(d); resetSelection(); }}
              modifiers={{ available: isDayAvailable }}
              modifiersClassNames={{ available: 'bg-primary/15 font-semibold text-primary' }}
            />
          </div>
          )}

          {/* Block & Time Selection */}
          <div className="slot-selector-selection-container">
            {selectedDate ? (
              <div className="slot-selector-selection-header">
                <h4 className="slot-selector-selection-title">Horários Disponíveis</h4>
                <p className="slot-selector-selection-subtitle">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            ) : (
              <div className="slot-selector-placeholder">
                <p>Selecione uma data no calendário</p>
              </div>
            )}
            
            {selectedDate && (
              <div className="slot-selector-blocks-container">
                {blocks.length > 0 ? (
                  <>
                    {/* Available Blocks */}
                    <div className="slot-selector-block-list">
                      {blocks.map((block, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setSelectedBlockIdx(idx); setSelectedStartTime(null); setSelectedDuration(60); }}
                          className={`slot-selector-block-button ${selectedBlockIdx === idx ? 'selected' : ''}`}
                        >
                          <Clock color="var(--purple-primary)"/>
                          <div className="slot-selector-block-button-info">
                            <p>{block.startTime} – {block.endTime}</p>
                            <p>
                              {formatDuration(toMinutes(block.endTime) - toMinutes(block.startTime))} disponível
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Start Time & Duration pickers */}
                    {selectedBlock && (
                      <div className="slot-selector-pickers">
                        <div className="slot-selector-pickers-grid">
                          <div>
                            <Label className="slot-selector-picker-label">Início</Label>
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
                            <Label className="slot-selector-picker-label">Duração</Label>
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
                          <p className="slot-selector-session-info">
                            Sessão: <strong>{selectedStartTime} – {endTime}</strong> ({formatDuration(selectedDuration)})
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recurring + Confirm */}
                    {selectedStartTime && (
                      <div className="slot-selector-actions">
                        <div className="slot-selector-recurring-option">
                          <RefreshCw className="slot-selector-recurring-icon" />
                          <div className="slot-selector-recurring-text">
                            <Label htmlFor="recurring" className="slot-selector-recurring-label">
                              Repetir semanalmente
                            </Label>
                            <p className="slot-selector-recurring-description">Máx. 10 encontros</p>
                          </div>
                          <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                        </div>
                        <Button className="slot-selector-confirm-button" onClick={() => setShowConfirm(true)}>
                          <Video className="slot-selector-confirm-button-icon" />
                          Confirmar Agendamento
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="slot-selector-no-slots">Nenhum horário disponível nesta data.</p>
                )}
              </div>
            )}
          </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Confirmar Agendamento</DialogTitle>
              <DialogDescription>
                {selectedDate && selectedStartTime && (
                  <div className="slot-selector-dialog-description">
                    <p><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedStartTime} – {endTime} ({formatDuration(selectedDuration)})</p>
                    {isRecurring && (
                      <Badge className="slot-selector-dialog-badge">
                        <RefreshCw className="slot-selector-dialog-badge-icon" /> Recorrente · 10 sessões
                      </Badge>
                    )}
                    <p className="slot-selector-dialog-info">Um link do Google Meet será gerado automaticamente.</p>
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
    </>
  );
}
