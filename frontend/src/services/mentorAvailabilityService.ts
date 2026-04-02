import { apiFetch } from './api';
import type { DayOfWeek, TimeBlock } from '../components/common/BookingCalendar/types';

type BackendDayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

interface MentorAvailabilitySlotDTO {
  dayOfWeek: BackendDayOfWeek;
  startTime: string;
  endTime: string;
}

interface MentorAvailabilityResponseDTO {
  mentorId: number;
  slotDuration: number;
  availability: MentorAvailabilitySlotDTO[];
}

interface SaveMentorAvailabilityPayload {
  mentorId: number;
  slotDuration: 30 | 60;
  availability: MentorAvailabilitySlotDTO[];
}

const BACKEND_TO_FRONT_DAY: Record<BackendDayOfWeek, DayOfWeek> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const FRONT_TO_BACK_DAY: Record<DayOfWeek, BackendDayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

function normalizeMentorId(mentorId: string | number): number {
  const numeric = Number(String(mentorId).replace(/[^0-9]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`Invalid mentorId: ${mentorId}`);
  }
  return numeric;
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

function toTimeBlock(slot: MentorAvailabilitySlotDTO, index: number): TimeBlock {
  const start = parseTime(slot.startTime);
  const end = parseTime(slot.endTime);

  return {
    id: `api-${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${index}`,
    day: BACKEND_TO_FRONT_DAY[slot.dayOfWeek],
    startHour: start.hour,
    startMinute: start.minute,
    endHour: end.hour,
    endMinute: end.minute,
  };
}

function toSlotDTO(block: TimeBlock): MentorAvailabilitySlotDTO {
  const startTime = `${String(block.startHour).padStart(2, '0')}:${String(block.startMinute).padStart(2, '0')}`;
  const endTime = `${String(block.endHour).padStart(2, '0')}:${String(block.endMinute).padStart(2, '0')}`;

  return {
    dayOfWeek: FRONT_TO_BACK_DAY[block.day],
    startTime,
    endTime,
  };
}

export async function getMentorAvailability(mentorId: string | number): Promise<{ slotDuration: number; blocks: TimeBlock[] }> {
  const normalizedMentorId = normalizeMentorId(mentorId);
  const response = await apiFetch(`/mentor-availability/${normalizedMentorId}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(`Failed to load mentor availability: ${response.status} ${JSON.stringify(errorBody)}`);
  }

  const data = (await response.json()) as MentorAvailabilityResponseDTO;
  return {
    slotDuration: data.slotDuration,
    blocks: data.availability.map(toTimeBlock),
  };
}

export async function saveMentorAvailability(
  mentorId: string | number,
  blocks: TimeBlock[],
  slotDuration: number
): Promise<MentorAvailabilityResponseDTO> {
  const normalizedMentorId = normalizeMentorId(mentorId);
  const normalizedSlotDuration: 30 | 60 = slotDuration === 30 ? 30 : 60;

  const payload: SaveMentorAvailabilityPayload = {
    mentorId: normalizedMentorId,
    slotDuration: normalizedSlotDuration,
    availability: blocks.map(toSlotDTO),
  };

  const response = await apiFetch('/mentor-availability', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(`Failed to save mentor availability: ${response.status} ${JSON.stringify(errorBody)}`);
  }

  return response.json();
}
