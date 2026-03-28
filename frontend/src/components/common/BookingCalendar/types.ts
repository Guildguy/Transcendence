export type MentorStatus = 'available' | 'unavailable';
export type SessionStatus = 'scheduled' | 'completed' | 'rescheduled' | 'no-show';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeBlock {
  id: string;
  day: DayOfWeek;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface Slot {
  id: string;
  mentorId: string;
  date: string; // ISO date
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  booked: boolean;
  bookedBy?: string;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  xp: string;
  bio: string;
  skills: string[];
  level: 'Junior' | 'Pleno' | 'Senior';
  status: MentorStatus;
  rating: number;
  totalMentored: number;
  maxMentees: number;
  currentMentees: number;
  availability: TimeBlock[];
  slotDuration: number; // in minutes
}

export interface Mentee {
  id: string;
  name: string;
  avatar: string;
  stack: string[];
  goals: string;
  startDate: string;
  mentorId: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  meetLink: string;
  isRecurring: boolean;
  recurrenceCount?: number;
  maxRecurrence: number;
  notes?: string;
}

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
