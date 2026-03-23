import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Mentor, Mentee, Session, Slot, TimeBlock } from './types.ts';
import { mockMentors, mockMentees, mockSessions, generateSlots } from '@/data/mockData';
import { addDays, format } from 'date-fns';

interface BookCustomSlotParams {
  mentorId: string;
  menteeId: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface MentoringContextType {
  mentors: Mentor[];
  mentees: Mentee[];
  sessions: Session[];
  slots: Slot[];
  currentRole: 'mentor' | 'mentee';
  currentUserId: string;
  setCurrentRole: (role: 'mentor' | 'mentee') => void;
  bookSlot: (slotId: string, menteeId: string, isRecurring: boolean) => void;
  bookCustomSlot: (params: BookCustomSlotParams) => void;
  rescheduleSession: (sessionId: string, newSlotId: string) => void;
  rescheduleSessionCustom: (sessionId: string, date: string, startTime: string, endTime: string) => void;
  cancelSession: (sessionId: string) => void;
  updateAvailability: (mentorId: string, blocks: TimeBlock[], slotDuration: number) => void;
  getSessionsForMentor: (mentorId: string) => Session[];
  getSessionsForMentee: (menteeId: string) => Session[];
  getSessionsBetween: (mentorId: string, menteeId: string) => Session[];
  getSlotsForMentor: (mentorId: string) => Slot[];
  getMenteesForMentor: (mentorId: string) => Mentee[];
  getAvailableBlocksForDate: (mentorId: string, date: string) => { startTime: string; endTime: string }[];
}

const MentoringContext = createContext<MentoringContextType | null>(null);

export function MentoringProvider({ children }: { children: React.ReactNode }) {
  const [mentors, setMentors] = useState<Mentor[]>(mockMentors);
  const [mentees] = useState<Mentee[]>(mockMentees);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [slotsMap, setSlotsMap] = useState<Record<string, Slot[]>>(() => {
    const map: Record<string, Slot[]> = {};
    mockMentors.forEach(m => { map[m.id] = generateSlots(m); });
    return map;
  });
  const [currentRole, setCurrentRole] = useState<'mentor' | 'mentee'>('mentee');
  const currentUserId = currentRole === 'mentor' ? 'm1' : 'e1';

  const generateMeetLink = () =>
    `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

  const bookSlot = useCallback((slotId: string, menteeId: string, isRecurring: boolean) => {
    let targetSlot: Slot | undefined;
    const newSlotsMap = { ...slotsMap };

    for (const mentorId in newSlotsMap) {
      const idx = newSlotsMap[mentorId].findIndex(s => s.id === slotId);
      if (idx !== -1) {
        targetSlot = { ...newSlotsMap[mentorId][idx], booked: true, bookedBy: menteeId };
        newSlotsMap[mentorId] = [...newSlotsMap[mentorId]];
        newSlotsMap[mentorId][idx] = targetSlot;
        break;
      }
    }

    if (!targetSlot) return;

    const meetLink = generateMeetLink();
    const newSessions: Session[] = [];

    if (isRecurring) {
      const baseDate = new Date(targetSlot.date);
      for (let i = 0; i < 10; i++) {
        const sessionDate = addDays(baseDate, i * 7);
        const dateStr = format(sessionDate, 'yyyy-MM-dd');
        newSessions.push({
          id: `s-${Date.now()}-${i}`,
          mentorId: targetSlot.mentorId,
          menteeId,
          date: dateStr,
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime,
          status: 'scheduled',
          meetLink,
          isRecurring: true,
          recurrenceCount: i + 1,
          maxRecurrence: 10,
        });
      }
    } else {
      newSessions.push({
        id: `s-${Date.now()}`,
        mentorId: targetSlot.mentorId,
        menteeId,
        date: targetSlot.date,
        startTime: targetSlot.startTime,
        endTime: targetSlot.endTime,
        status: 'scheduled',
        meetLink,
        isRecurring: false,
        maxRecurrence: 10,
      });
    }

    setSlotsMap(newSlotsMap);
    setSessions(prev => [...prev, ...newSessions]);
  }, [slotsMap]);

  const rescheduleSession = useCallback((sessionId: string, newSlotId: string) => {
    let targetSlot: Slot | undefined;
    const newSlotsMap = { ...slotsMap };

    for (const mentorId in newSlotsMap) {
      const idx = newSlotsMap[mentorId].findIndex(s => s.id === newSlotId);
      if (idx !== -1) {
        targetSlot = { ...newSlotsMap[mentorId][idx], booked: true };
        newSlotsMap[mentorId] = [...newSlotsMap[mentorId]];
        newSlotsMap[mentorId][idx] = targetSlot;
        break;
      }
    }

    if (!targetSlot) return;

    setSlotsMap(newSlotsMap);
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, date: targetSlot!.date, startTime: targetSlot!.startTime, endTime: targetSlot!.endTime, status: 'rescheduled' as const }
          : s
      )
    );
  }, [slotsMap]);

  const bookCustomSlot = useCallback(({ mentorId, menteeId, date, startTime, endTime, isRecurring }: BookCustomSlotParams) => {
    const meetLink = generateMeetLink();
    const newSessions: Session[] = [];

    if (isRecurring) {
      const baseDate = new Date(date + 'T12:00:00');
      for (let i = 0; i < 10; i++) {
        const sessionDate = addDays(baseDate, i * 7);
        const dateStr = format(sessionDate, 'yyyy-MM-dd');
        newSessions.push({
          id: `s-${Date.now()}-${i}`,
          mentorId,
          menteeId,
          date: dateStr,
          startTime,
          endTime,
          status: 'scheduled',
          meetLink,
          isRecurring: true,
          recurrenceCount: i + 1,
          maxRecurrence: 10,
        });
      }
    } else {
      newSessions.push({
        id: `s-${Date.now()}`,
        mentorId,
        menteeId,
        date,
        startTime,
        endTime,
        status: 'scheduled',
        meetLink,
        isRecurring: false,
        maxRecurrence: 10,
      });
    }

    setSessions(prev => [...prev, ...newSessions]);
  }, []);

  const rescheduleSessionCustom = useCallback((sessionId: string, date: string, startTime: string, endTime: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, date, startTime, endTime, status: 'rescheduled' as const }
          : s
      )
    );
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  // Given a mentor and a date, return available free windows considering booked sessions
  const getAvailableBlocksForDate = useCallback((mentorId: string, date: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) return [];

    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay() as import('@/types/mentoring').DayOfWeek;

    const blocks = mentor.availability.filter(b => b.day === dayOfWeek);
    if (blocks.length === 0) return [];

    // Get booked sessions for this mentor on this date
    const bookedSessions = sessions.filter(
      s => s.mentorId === mentorId && s.date === date && (s.status === 'scheduled' || s.status === 'rescheduled')
    );

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMinutes = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const freeWindows: { startTime: string; endTime: string }[] = [];

    for (const block of blocks) {
      const blockStart = block.startHour * 60 + block.startMinute;
      const blockEnd = block.endHour * 60 + block.endMinute;

      // Collect booked intervals within this block
      const booked = bookedSessions
        .map(s => ({ start: toMinutes(s.startTime), end: toMinutes(s.endTime) }))
        .filter(b => b.start < blockEnd && b.end > blockStart)
        .sort((a, b) => a.start - b.start);

      let cursor = blockStart;
      for (const b of booked) {
        if (cursor < b.start) {
          // Only add if at least 1h free
          if (b.start - cursor >= 60) {
            freeWindows.push({ startTime: fromMinutes(cursor), endTime: fromMinutes(b.start) });
          }
        }
        cursor = Math.max(cursor, b.end);
      }
      if (cursor < blockEnd && blockEnd - cursor >= 60) {
        freeWindows.push({ startTime: fromMinutes(cursor), endTime: fromMinutes(blockEnd) });
      }
    }

    return freeWindows;
  }, [mentors, sessions]);

  const updateAvailability = useCallback((mentorId: string, blocks: TimeBlock[], slotDuration: number) => {
    setMentors(prev =>
      prev.map(m =>
        m.id === mentorId ? { ...m, availability: blocks, slotDuration } : m
      )
    );
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      const updatedMentor = { ...mentor, availability: blocks, slotDuration };
      setSlotsMap(prev => ({ ...prev, [mentorId]: generateSlots(updatedMentor) }));
    }
  }, [mentors]);

  const getSessionsForMentor = useCallback((mentorId: string) =>
    sessions.filter(s => s.mentorId === mentorId), [sessions]);

  const getSessionsForMentee = useCallback((menteeId: string) =>
    sessions.filter(s => s.menteeId === menteeId), [sessions]);

  const getSessionsBetween = useCallback((mentorId: string, menteeId: string) =>
    sessions.filter(s => s.mentorId === mentorId && s.menteeId === menteeId), [sessions]);

  const getSlotsForMentor = useCallback((mentorId: string) =>
    slotsMap[mentorId] || [], [slotsMap]);

  const getMenteesForMentor = useCallback((mentorId: string) =>
    mentees.filter(m => m.mentorId === mentorId), [mentees]);

  return (
    <MentoringContext.Provider
      value={{
        mentors, mentees, sessions, slots: Object.values(slotsMap).flat(),
        currentRole, currentUserId, setCurrentRole,
        bookSlot, bookCustomSlot, rescheduleSession, rescheduleSessionCustom, cancelSession, updateAvailability,
        getSessionsForMentor, getSessionsForMentee, getSessionsBetween,
        getSlotsForMentor, getMenteesForMentor, getAvailableBlocksForDate,
      }}
    >
      {children}
    </MentoringContext.Provider>
  );
}

export function useMentoring() {
  const ctx = useContext(MentoringContext);
  if (!ctx) throw new Error('useMentoring must be used within MentoringProvider');
  return ctx;
}