export interface PendingRequest {
  id: number
  name: string
  avatar?: string
}

export interface ScheduleItem {
  id: number
  time: string
  mentee: string
}

export interface Achievement {
  id: number
  title?: string
  icon?: string
}

export const mockRequests: PendingRequest[] = [
  { id: 1, name: 'Vítoria' },
  { id: 2, name: 'Vítoria' },
  { id: 3, name: 'Carlos' },
]

export const mockSchedule: ScheduleItem[] = [
  { id: 1, time: '08:00h', mentee: 'Mentoria Carla' },
  { id: 2, time: '10:00h', mentee: 'Mentoria Carla' },
  { id: 3, time: '15:00h', mentee: 'Mentoria Carla' },
  { id: 4, time: '19:00h', mentee: 'Mentoria Carla' },
  { id: 5, time: '20:30h', mentee: 'Mentoria Carla' },
]

export const mockAchievements: Achievement[] = [
  { id: 1 }, { id: 2 }, { id: 3 },
  { id: 4 }, { id: 5 }, { id: 6 },
]