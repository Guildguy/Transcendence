import { apiFetch } from './api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ConnectionDTO {
  id: number;         // connectionId
  mentorId: number;
  mentorName: string;
  menteeId: number;
  menteeName: string;
  status: string;     // 'ACTIVE' | 'PENDING' | 'ENDED'
  acceptedAt: string | null;
  createdAt: string;
}

export interface BackendSession {
  id: number;
  connectionId: number;
  scheduledDate: string;   // ISO-8601: "2026-04-10T14:00:00"
  durationMinutes: number;
  meetUrl: string | null;
  status: string;          // 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  isRecurrent: boolean;
  recurrenceGroupId: string | null;
  recurrenceIndex: number | null;
}

interface CreateSessionPayload {
  connectionId: number;
  scheduledDate: string;   // ISO-8601
  durationMinutes: number;
  isRecurrent: boolean;
  createdBy: number;
}

// ──────────────────────────────────────────────
// Connection endpoints
// ──────────────────────────────────────────────

/** Retorna todas as conexões do mentee (para obter connectionId) */
export async function getConnectionsByMentee(menteeId: number): Promise<ConnectionDTO[]> {
  const res = await apiFetch(`/mentorship-connections/mentee/${menteeId}`);
  if (!res.ok) throw new Error(`Failed to load connections: ${res.status}`);
  return res.json();
}

/** Retorna todas as conexões do mentor */
export async function getConnectionsByMentor(mentorId: number): Promise<ConnectionDTO[]> {
  const res = await apiFetch(`/mentorship-connections/mentor/${mentorId}`);
  if (!res.ok) throw new Error(`Failed to load connections: ${res.status}`);
  return res.json();
}

// ──────────────────────────────────────────────
// Session endpoints
// ──────────────────────────────────────────────

/** Cria uma sessão (requer connectionId) */
export async function createSession(payload: CreateSessionPayload): Promise<BackendSession | BackendSession[]> {
  const res = await apiFetch('/mentorship-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`Failed to create session: ${res.status} ${JSON.stringify(err)}`);
  }
  return res.json();
}

/** Busca sessões de uma conexão */
export async function getSessionsByConnection(connectionId: number): Promise<BackendSession[]> {
  const res = await apiFetch(`/mentorship-sessions/connection/${connectionId}`);
  if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`);
  return res.json();
}

/** Busca sessões upcoming de uma conexão */
export async function getUpcomingSessionsByConnection(connectionId: number): Promise<BackendSession[]> {
  const res = await apiFetch(`/mentorship-sessions/connection/${connectionId}/upcoming`);
  if (!res.ok) throw new Error(`Failed to load upcoming sessions: ${res.status}`);
  return res.json();
}
