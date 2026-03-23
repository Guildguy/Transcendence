import { useState } from 'react';
// import { useMentoring } from '@/context/MentoringContext';
import Button from '../Button/Button';
import { CalendarCard, CalendarCardContent, CalendarCardHeader, CalendarCardTitle } from '../ui/CalendarCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
// import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock, Save } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';

export const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface TestCalendarProps {
  mentorId: string;
}

export function TestCalendar({ mentorId }: TestCalendarProps) {
  // const { mentors, updateAvailability } = useMentoring();
  // const mentor = mentors.find(m => m.id === mentorId);

  // const [blocks, setBlocks] = useState<TimeBlock[]>(mentor?.availability || []);
  // const [slotDuration, setSlotDuration] = useState(mentor?.slotDuration || 60);
  const [addingDay, setAddingDay] = useState<DayOfWeek | null>(null);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('12:00');

  // if (!mentor) return null;

  const hours = Array.from({ length: 24 }, (_, i) =>
    Array.from({ length: 2 }, (_, j) => {
      const h = String(i).padStart(2, '0');
      const m = j === 0 ? '00' : '30';
      return `${h}:${m}`;
    })
  ).flat();

  const handleAddBlock = () => {
    if (addingDay === null) return;
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    // if (sh * 60 + sm >= eh * 60 + em) {
    //   toast({ title: 'Horário inválido', description: 'O fim deve ser após o início.', variant: 'destructive' });
    //   return;
    // }
    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      day: addingDay,
      startHour: sh,
      startMinute: sm,
      endHour: eh,
      endMinute: em,
    };
    setBlocks(prev => [...prev, newBlock]);
    setAddingDay(null);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleSave = () => {
    updateAvailability(mentorId, blocks, slotDuration);
    toast({ title: 'Disponibilidade salva!', description: 'Seus slots foram atualizados.' });
  };

  const blocksForDay = (day: DayOfWeek) => blocks.filter(b => b.day === day);

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <CalendarCard>
      <CalendarCardHeader className="flex flex-row items-center justify-between space-y-0">
        <CalendarCardTitle className="font-display text-xl">Minha Disponibilidade</CalendarCardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select value={String(slotDuration)} onValueChange={(v) => setSlotDuration(Number(v))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
                <SelectItem value="240">4 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-1" /> Salvar
          </Button>
        </div>
      </CalendarCardHeader>
      <CalendarCardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map(day => (
            <div key={day} className="rounded-lg border bg-secondary/30 p-3 min-h-[140px]">
              <p className="text-sm font-semibold mb-2 font-display">{DAY_NAMES_FULL[day]}</p>
              <div className="space-y-1.5">
                {blocksForDay(day).map(block => (
                  <div key={block.id} className="flex items-center justify-between bg-primary/10 rounded-md px-2 py-1 text-xs">
                    <span className="font-medium text-primary">
                      {formatTime(block.startHour, block.startMinute)} – {formatTime(block.endHour, block.endMinute)}
                    </span>
                    <button onClick={() => removeBlock(block.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {addingDay === day ? (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    <Select value={newStart} onValueChange={setNewStart}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={newEnd} onValueChange={setNewEnd}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs flex-1" onClick={handleAddBlock}>Adicionar</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingDay(null)}>✕</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full h-7 text-xs text-muted-foreground"
                  onClick={() => { setAddingDay(day); setNewStart('08:00'); setNewEnd('12:00'); }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Horário
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Duração dos slots: {slotDuration}min
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {blocks.length} bloco(s) definido(s)
          </Badge>
        </div>
      </CalendarCardContent>
    </CalendarCard>
  );
}
