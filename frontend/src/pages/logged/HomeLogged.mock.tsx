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
  title: string
  icon?: string
}

export const mockRequests: PendingRequest[] = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'João' },
  { id: 3, name: 'Maria' },
]

export const mockSchedule: ScheduleItem[] = [
  { id: 1, time: '08:00h', mentee: 'Mentoria Pedro Monteiro' },
  { id: 2, time: '10:00h', mentee: 'Mentoria André Fields' },
  { id: 3, time: '15:00h', mentee: 'Mentoria Julia Coelho' },
  { id: 4, time: '19:00h', mentee: 'Mentoria Fábio Leite' },
  { id: 5, time: '20:30h', mentee: 'Mentoria Adedayo Sanni' },
]

export const mockAchievements: Achievement[] = [
  { id: 1, title: 'Identidade Transcendental', icon: '/achievements/identidade_transcendental.png' },
  { id: 2, title: 'Chama Acesa', icon: '/achievements/chama_acessa.png' },
  { id: 3, title: 'Imparável', icon: '/achievements/comeco_da_jornada.png' },
  { id: 4, title: 'Primeiro Match', icon: '/achievements/primeiro_aperto_de_mao.png' },
  { id: 5, title: 'Hub de Conexões', icon: '/achievements/hub_de_conexoes.png' },
  { id: 6, title: 'Quebrando o Gelo', icon: '/achievements/quebrando_o-gelo.png' },
]