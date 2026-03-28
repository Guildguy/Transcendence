import type { Mentor, Mentee, Session, Slot } from './types';
import { addDays, format } from 'date-fns';

const generateMeetLink = () => `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

export const mockMentors: Mentor[] = [
  {
    id: 'm1',
    name: 'Ana Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    role: 'Staff Engineer',
    xp: '12 anos',
    bio: 'Especialista em arquitetura de microsserviços e liderança técnica. Apaixonada por mentoria e desenvolvimento de pessoas.',
    skills: ['React', 'Node.js', 'AWS', 'System Design'],
    level: 'Senior',
    status: 'available',
    rating: 4.9,
    totalMentored: 47,
    maxMentees: 10,
    currentMentees: 7,
    slotDuration: 60,
    availability: [
      { id: 'tb1', day: 1, startHour: 8, startMinute: 0, endHour: 12, endMinute: 0 },
      { id: 'tb2', day: 1, startHour: 19, startMinute: 0, endHour: 22, endMinute: 0 },
      { id: 'tb3', day: 3, startHour: 14, startMinute: 0, endHour: 18, endMinute: 0 },
      { id: 'tb4', day: 5, startHour: 9, startMinute: 0, endHour: 13, endMinute: 0 },
    ],
  },
  {
    id: 'm2',
    name: 'Carlos Mendes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'Tech Lead',
    xp: '8 anos',
    bio: 'Focado em frontend e experiência do usuário. Mentor ativo na comunidade de desenvolvimento.',
    skills: ['React', 'TypeScript', 'Design System', 'Performance'],
    level: 'Senior',
    status: 'available',
    rating: 4.7,
    totalMentored: 32,
    maxMentees: 8,
    currentMentees: 8,
    slotDuration: 60,
    availability: [
      { id: 'tb5', day: 2, startHour: 15, startMinute: 0, endHour: 19, endMinute: 0 },
      { id: 'tb6', day: 4, startHour: 10, startMinute: 0, endHour: 14, endMinute: 0 },
    ],
  },
  {
    id: 'm3',
    name: 'Fernanda Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda',
    role: 'Backend Developer',
    xp: '5 anos',
    bio: 'Desenvolvedora backend com foco em APIs RESTful e bancos de dados.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    level: 'Pleno',
    status: 'unavailable',
    rating: 4.5,
    totalMentored: 12,
    maxMentees: 5,
    currentMentees: 5,
    slotDuration: 90,
    availability: [
      { id: 'tb7', day: 1, startHour: 18, startMinute: 0, endHour: 21, endMinute: 0 },
      { id: 'tb8', day: 3, startHour: 18, startMinute: 0, endHour: 21, endMinute: 0 },
    ],
  },
];

export const mockMentees: Mentee[] = [
  {
    id: 'e1',
    name: 'João Pedro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
    stack: ['JavaScript', 'React'],
    goals: 'Migrar de Junior para Pleno, focando em arquitetura frontend.',
    startDate: '2024-11-01',
    mentorId: 'm1',
  },
  {
    id: 'e2',
    name: 'Maria Luísa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    stack: ['Python', 'FastAPI'],
    goals: 'Aprender boas práticas de backend e clean architecture.',
    startDate: '2025-01-15',
    mentorId: 'm1',
  },
  {
    id: 'e3',
    name: 'Pedro Henrique',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    stack: ['React', 'Node.js'],
    goals: 'Preparação para entrevistas em big techs.',
    startDate: '2025-02-01',
    mentorId: 'm2',
  },
];

// Generate slots for next 4 weeks based on mentor availability
export function generateSlots(mentor: Mentor): Slot[] {
  const slots: Slot[] = [];
  const today = new Date();

  for (let week = 0; week < 4; week++) {
    for (const block of mentor.availability) {
      const dayOffset = (block.day - today.getDay() + 7) % 7 + week * 7;
      const slotDate = addDays(today, dayOffset);
      if (slotDate <= today) continue;

      const dateStr = format(slotDate, 'yyyy-MM-dd');
      let currentHour = block.startHour;
      let currentMinute = block.startMinute;

      while (
        currentHour * 60 + currentMinute + mentor.slotDuration <=
        block.endHour * 60 + block.endMinute
      ) {
        const endMinutes = currentHour * 60 + currentMinute + mentor.slotDuration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        slots.push({
          id: `slot-${mentor.id}-${dateStr}-${String(currentHour).padStart(2, '0')}${String(currentMinute).padStart(2, '0')}`,
          mentorId: mentor.id,
          date: dateStr,
          startTime: `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`,
          endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
          booked: false,
        });

        currentMinute += mentor.slotDuration;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
  }

  return slots;
}

const today = new Date();
export const mockSessions: Session[] = [
  {
    id: 's1',
    mentorId: 'm1',
    menteeId: 'e1',
    date: format(addDays(today, -7), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '09:00',
    status: 'completed',
    meetLink: generateMeetLink(),
    isRecurring: true,
    recurrenceCount: 3,
    maxRecurrence: 10,
  },
  {
    id: 's2',
    mentorId: 'm1',
    menteeId: 'e1',
    date: format(addDays(today, 3), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '09:00',
    status: 'scheduled',
    meetLink: generateMeetLink(),
    isRecurring: true,
    recurrenceCount: 4,
    maxRecurrence: 10,
  },
  {
    id: 's3',
    mentorId: 'm1',
    menteeId: 'e2',
    date: format(addDays(today, 5), 'yyyy-MM-dd'),
    startTime: '14:00',
    endTime: '15:00',
    status: 'scheduled',
    meetLink: generateMeetLink(),
    isRecurring: false,
    maxRecurrence: 10,
  },
  {
    id: 's4',
    mentorId: 'm1',
    menteeId: 'e1',
    date: format(addDays(today, -14), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '09:00',
    status: 'no-show',
    meetLink: generateMeetLink(),
    isRecurring: true,
    recurrenceCount: 2,
    maxRecurrence: 10,
  },
];
