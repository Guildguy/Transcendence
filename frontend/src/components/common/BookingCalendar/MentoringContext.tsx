import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Session, TimeBlock } from './types.ts';
import { addDays, format } from 'date-fns';
import { getMentorAvailability } from '../../../services/mentorAvailabilityService';
import { apiFetch } from '../../../services/api.ts';

interface BookCustomSlotParams {
  mentorId: string;
  menteeId: string;
  connectionId: number;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface MentoringContextType {
  sessions: Session[];
  bookCustomSlot: (params: BookCustomSlotParams) => Promise<void>;
  cancelSession: (sessionId: string) => void;
  getSessionsForMentor: (mentorId: string) => Session[];
  getSessionsForMentee: (menteeId: string) => Session[];
  getSessionsBetween: (mentorId: string, menteeId: string) => Session[];
  getBackendAvailability: (mentorId: string | number) => Promise<{ blocks: TimeBlock[]; slotDuration: number }>;
  getAvailableBlocksForDate: (mentorId: string, date: string, blocks: TimeBlock[]) => { startTime: string; endTime: string }[];
}

const MentoringContext = createContext<MentoringContextType | null>(null);

export function MentoringProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);

  const generateMeetLink = () =>
    `https://meet.google.com/${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

  const bookCustomSlot = useCallback(async ({ mentorId, menteeId, connectionId, date, startTime, endTime, isRecurring }: BookCustomSlotParams) => {
    console.log(`[MentoringContext] Booking session for connection ${connectionId}: ${date} at ${startTime}`);
    
    // Calculate duration in minutes for the backend
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const durationMinutes = toMinutes(endTime) - toMinutes(startTime);
    const scheduledDate = `${date}T${startTime}:00`;
    const myUserId = localStorage.getItem('userId');

    try {
      const response = await apiFetch('/mentorship-sessions', {
        method: 'POST',
        body: JSON.stringify({
          connectionId,
          scheduledDate,
          durationMinutes,
          isRecurrent: isRecurring,
          createdBy: myUserId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const createdSessions = Array.isArray(data) ? data : [data];
        
        // Map backend sessions to frontend Session type
        const newSessions: Session[] = createdSessions.map((s: any, i: number) => ({
          id: s.id.toString(),
          mentorId,
          menteeId,
          date: s.scheduledDate.split('T')[0],
          startTime: s.scheduledDate.split('T')[1].substring(0, 5),
          endTime: endTime, // backend might not return duration directly here in the same format
          status: 'scheduled',
          meetLink: s.meetUrl,
          isRecurring: s.isRecurrent,
          recurrenceCount: s.recurrenceIndex,
          maxRecurrence: 10,
        }));

        setSessions(prev => [...prev, ...newSessions]);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const firstError = Array.isArray(errorData) ? errorData[0] : errorData;
        throw new Error(firstError?.message || 'Erro ao salvar sessão no backend');
      }
    } catch (error) {
      console.error('[MentoringContext] Erro ao agendar sessão:', error);
      throw error;
    }
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  const getSessionsForMentor = useCallback((mentorId: string) =>
    sessions.filter(s => s.mentorId === mentorId), [sessions]);

  const getSessionsForMentee = useCallback((menteeId: string) =>
    sessions.filter(s => s.menteeId === menteeId), [sessions]);

  const getSessionsBetween = useCallback((mentorId: string, menteeId: string) =>
    sessions.filter(s => s.mentorId === mentorId && s.menteeId === menteeId), [sessions]);

  // Fetch real availability from backend
  const getBackendAvailability = useCallback(async (mentorId: string | number) => {
    try {
      const availability = await getMentorAvailability(mentorId);
      return availability;
    } catch (error) {
      console.error('[MentoringContext] Erro ao carregar disponibilidade do backend:', error);
      return { blocks: [], slotDuration: 60 };
    }
  }, []);

  // Calculate available time windows based on availability blocks and booked sessions
  const getAvailableBlocksForDate = useCallback((mentorId: string, date: string, blocks: TimeBlock[]) => {
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Filter blocks for this day of week
    const dayBlocks = blocks.filter(b => b.day === dayOfWeek);
    if (dayBlocks.length === 0) return [];

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

    for (const block of dayBlocks) {
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
  }, [sessions]);

  return (
    <MentoringContext.Provider
      value={{
        sessions,
        bookCustomSlot, cancelSession,
        getSessionsForMentor, getSessionsForMentee, getSessionsBetween,
        getBackendAvailability, getAvailableBlocksForDate,
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