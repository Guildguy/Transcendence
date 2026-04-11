import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import './DailySchedule.css'
import IconButton from '../IconButton/IconButton'

export interface ScheduleItem {
  id: number
  time: string
  date: string
  mentee?: string
  mentor?: string
  connectionId?: number
  partnerProfileId?: number
}

interface DailyScheduleProps {
  userRole: 'MENTOR' | 'MENTEE'
  profileId?: number | null
}

type ViewMode = 'day' | 'week'

const PT_DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

interface WeekGroup {
  dateKey: string
  dateLabel: string
  items: ScheduleItem[]
}

export const DailySchedule = ({ userRole, profileId }: DailyScheduleProps) => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [dailySchedule, setDailySchedule] = useState<ScheduleItem[]>([])
  const [weeklyGroups, setWeeklyGroups] = useState<WeekGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [weekLoading, setWeekLoading] = useState(false)

  const handleRemarcar = (item: ScheduleItem) => {
    const targetId = item.partnerProfileId;
    if (!targetId) {
      console.warn('ID do perfil do parceiro não encontrado para a conexão:', item.connectionId)
      return;
    }
    if (userRole === 'MENTEE') {
      navigate(`/book-session/${targetId}`);
    } else {
      navigate(`/manage-session/${targetId}`);
    }
  }

  // Daily schedule (existing behaviour)
  useEffect(() => {
    const loadDailySchedule = async () => {
      try {
        if (!profileId) {
          setLoading(false)
          return
        }

        const sessionsEndpoint = userRole === 'MENTOR'
          ? `/mentorship-sessions/mentor/${profileId}`
          : `/mentorship-sessions/mentee/${profileId}`
        const connectionsEndpoint = userRole === 'MENTOR'
          ? `/mentorship-connections/mentor/${profileId}`
          : `/mentorship-connections/mentee/${profileId}`

        const [sessionsRes, connectionsRes] = await Promise.all([
          apiFetch(sessionsEndpoint),
          apiFetch(connectionsEndpoint),
        ])

        const sessions: any[] = sessionsRes.ok ? await sessionsRes.json() : []
        const connections: any[] = connectionsRes.ok ? await connectionsRes.json() : []

        // Map connectionId to partner name and profileId
        const nameMap = new Map<number, string>()
        const profileIdMap = new Map<number, number>()
        connections.forEach((c: any) => {
          if (c.id != null) {
            const partnerName = userRole === 'MENTOR'
              ? (c.menteeName || 'Mentorado')
              : (c.mentorName || 'Mentor')
            nameMap.set(c.id, partnerName)
            const partnerProfileId = userRole === 'MENTOR' ? c.menteeProfileId : c.mentorProfileId
            profileIdMap.set(c.id, partnerProfileId)
          }
        })

        const now = new Date()
        const todayYear = now.getFullYear()
        const todayMonth = now.getMonth()
        const todayDate = now.getDate()

        const todaySessions = sessions.filter((s: any) => {
          if (s.status === 'CANCELLED') return false
          const raw = s.scheduledDate || s.scheduledTime
          if (!raw) return false
          const d = new Date(raw)
          return d.getFullYear() === todayYear && d.getMonth() === todayMonth && d.getDate() === todayDate
        })

        const mappedDaily = todaySessions.map((session: any) => {
          const dateObj = new Date(session.scheduledDate || session.scheduledTime)
          const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h'
          const partnerName = nameMap.get(session.connectionId) || 'Mentoria'

          return {
            id: session.id,
            time: timeStr,
            date: dateObj.toISOString().split('T')[0],
            mentee: partnerName,
            mentor: partnerName,
            connectionId: session.connectionId,
            partnerProfileId: profileIdMap.get(session.connectionId),
          }
        }).sort((a, b) => a.time.localeCompare(b.time))

        setDailySchedule(mappedDaily)
      } catch (error) {
        console.warn('Error loading daily schedule:', error)
        setDailySchedule([])
      } finally {
        setLoading(false)
      }
    }

    loadDailySchedule()
  }, [userRole, profileId])

  // Weekly schedule — loaded lazily when the user switches to the week view
  useEffect(() => {
    if (viewMode !== 'week' || !profileId) return

    const loadWeeklySchedule = async () => {
      setWeekLoading(true)
      try {
        const sessionsEndpoint = userRole === 'MENTOR'
          ? `/mentorship-sessions/mentor/${profileId}`
          : `/mentorship-sessions/mentee/${profileId}`
        const connectionsEndpoint = userRole === 'MENTOR'
          ? `/mentorship-connections/mentor/${profileId}`
          : `/mentorship-connections/mentee/${profileId}`

        const [sessionsRes, connectionsRes] = await Promise.all([
          apiFetch(sessionsEndpoint),
          apiFetch(connectionsEndpoint),
        ])

        const sessions: any[] = sessionsRes.ok ? await sessionsRes.json() : []
        const connections: any[] = connectionsRes.ok ? await connectionsRes.json() : []

        // Map connectionId to partner name
        const nameMap = new Map<number, string>()
        const profileIdMap = new Map<number, number>()
        connections.forEach((c: any) => {
          if (c.id != null) {
            const partnerName = userRole === 'MENTOR'
              ? (c.menteeName || 'Mentorado')
              : (c.mentorName || 'Mentor')
            nameMap.set(c.id, partnerName)
            const partnerProfileId = userRole === 'MENTOR' ? c.menteeProfileId : c.mentorProfileId
            profileIdMap.set(c.id, partnerProfileId)
          }
        })

        const { start, end } = getCurrentWeekRange()

        // Initialise Mon-Sun buckets
        const grouped = new Map<string, WeekGroup>()
        for (let i = 0; i < 7; i++) {
          const d = new Date(start)
          d.setDate(start.getDate() + i)
          const key = d.toISOString().split('T')[0]
          const label = `${PT_DAY_LABELS[d.getDay()]} ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
          grouped.set(key, { dateKey: key, dateLabel: label, items: [] })
        }

        // Bucket sessions into the correct day
        sessions.forEach((s: any) => {
          if (s.status === 'CANCELLED') return
          const raw = s.scheduledDate || s.scheduledTime
          if (!raw) return
          const date = new Date(raw)
          if (date < start || date > end) return

          const key = date.toISOString().split('T')[0]
          if (!grouped.has(key)) return

          const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + 'h'
          grouped.get(key)!.items.push({
            id: s.id,
            time: timeStr,
            date: key,
            mentee: nameMap.get(s.connectionId) || 'Mentoria',
            connectionId: s.connectionId,
            partnerProfileId: profileIdMap.get(s.connectionId),
          })
        })

        // Keep only days with sessions, sorted by time
        const result = Array.from(grouped.values())
          .filter(g => g.items.length > 0)
          .map(g => ({ ...g, items: g.items.sort((a, b) => a.time.localeCompare(b.time)) }))

        setWeeklyGroups(result)
      } catch (error) {
        console.warn('Error loading weekly schedule:', error)
        setWeeklyGroups([])
      } finally {
        setWeekLoading(false)
      }
    }

    loadWeeklySchedule()
  }, [viewMode, userRole, profileId])

  const isWeekView = viewMode === 'week'
  const isLoading = loading || (isWeekView && weekLoading)

  return (
    <div className="right-panel">
      <div className="schedule-header">
        <h3 className="panel-title">{isWeekView ? 'Agenda da Semana' : 'Agenda do Dia'}</h3>
        <div className="view-toggle">
          <button
            className={`toggle-btn${viewMode === 'day' ? ' active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Dia
          </button>
          <button
            className={`toggle-btn${viewMode === 'week' ? ' active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="schedule-list">
        {isLoading ? (
          <div className="empty-state">Carregando agenda...</div>
        ) : isWeekView ? (
          weeklyGroups.length > 0 ? (
            weeklyGroups.map((group) => (
              <div key={group.dateKey} className="week-day-group">
                <div className="week-day-header">{group.dateLabel}</div>
                {group.items.map((item) => (
                  <div key={item.id} className="schedule-item">
                    <span className="schedule-time">
                      <strong>{item.time}</strong> - {item.mentee}
                    </span>
                    <IconButton onClick={() => handleRemarcar(item)}>Remarcar</IconButton>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="empty-state">Nao ha mentorias previstas para esta semana</div>
          )
        ) : (
          dailySchedule.length > 0 ? (
            dailySchedule.map((item) => (
              <div key={item.id} className="schedule-item">
                <span className="schedule-time">
                  <strong>{item.time}</strong> - {item.mentee || item.mentor}
                </span>
                <IconButton onClick={() => handleRemarcar(item)}>Remarcar</IconButton>
              </div>
            ))
          ) : (
            <div className="empty-state">Nao ha mentorias previstas para hoje</div>
          )
        )}
      </div>
    </div>
  )
}

export default DailySchedule
