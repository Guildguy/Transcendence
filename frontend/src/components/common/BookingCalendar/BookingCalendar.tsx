import { useState } from 'react';
import { useMentoring } from './MentoringContext';
import { Button } from '../Button/Button';
import { CalendarCard, CalendarCardContent, CalendarCardHeader, CalendarCardTitle } from '../ui/CalendarCard';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

interface BookingCalendarProps {
  mentorId: string;
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  modifiers?: Record<string, (date: Date) => boolean>;
  modifiersClassNames?: Record<string, string>;
  locale?: any;
  className?: string;
}

export default function BookingCalendar({ 
  mentorId, 
  mode = 'single',
  selected,
  onSelect,
  disabled,
  modifiers,
  modifiersClassNames,
  locale = ptBR,
  className
}: BookingCalendarProps) {
  const { mentors, getAvailableBlocksForDate } = useMentoring();
  const mentor = mentors.find(m => m.id === mentorId);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected);

  if (!mentor) return <div>Mentor não encontrado.</div>;

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onSelect?.(date);
  };

  const availableSlots = selectedDate 
    ? getAvailableBlocksForDate(mentorId, format(selectedDate, 'yyyy-MM-dd'))
    : [];

    
  return (
    <CalendarCard className="w-full">
      <CalendarCardHeader className="border-b mb-4 pb-4">
        <CalendarCardTitle className="font-display text-xl flex items-center gap-2 text-primary font-bold">
          <CalendarIcon size={18} color="var(--purple-primary)" className="mr-2" /> Agendar Próxima Mentoria
        </CalendarCardTitle>
      </CalendarCardHeader>
      <CalendarCardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <DayPicker
              mode={mode}
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={locale}
              disabled={disabled || ((date: Date) => isBefore(date, startOfDay(new Date())))}
              className={className || "border rounded-xl p-3 shadow-sm bg-white"}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
            />
          </div>
          
          <div className="flex-1 min-h-[300px] flex flex-col">
            {!selectedDate ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <p>Selecione uma data no calendário</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 rounded-lg border-dashed border-2">
                <p className="text-sm font-medium">Nenhum horário disponível para esta data.</p>
                <p className="text-xs mt-1">Por favor, selecione outro dia.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Horários Disponíveis</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {availableSlots.map((slot, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors h-11"
                      onClick={() => console.log('Booking slot:', slot)}
                    >
                      <Clock className="w-4 h-4" />
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CalendarCardContent>
    </CalendarCard>
  );
}
