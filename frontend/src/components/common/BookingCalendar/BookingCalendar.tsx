import { useState } from 'react';
import { useMentoring } from './MentoringContext';
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
    </div>
  );
}
