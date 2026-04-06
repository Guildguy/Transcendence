import { useEffect, useState } from 'react'
import Button from '../Button/Button'
import { apiFetch } from '../../../services/api'
import './DailySchedule.css'

export interface ScheduleItem {
  id: number
  time: string
  mentee?: string
  mentor?: string
  connectionId?: number
}

interface DailyScheduleProps {
  userRole: 'MENTOR' | 'MENTEE'
  profileId?: number | null
}

export const DailySchedule = ({ userRole, profileId }: DailyScheduleProps) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDailySchedule = async () => {
      try {
        // Only fetch if profileId is available
        if (!profileId) {
          setLoading(false)
          return
        }

        // Fetch mentorship sessions for today
        // The endpoint should return sessions scheduled for today
        const endpoint = userRole === 'MENTOR' 
          ? `/mentorships/today/mentor/${profileId}`
          : `/mentorships/today/mentee/${profileId}`

        const response = await apiFetch(endpoint)
        
        if (response.ok) {
          const data: any[] = await response.json()
          
          if (Array.isArray(data) && data.length > 0) {
            // Transform backend data to match UI format
            const formattedSchedule = data.map((session: any) => ({
              id: session.id || session.connectionId,
              time: session.time || session.scheduledTime || '00:00h',
              mentee: session.menteeName || session.mentorName || 'Mentoria',
              mentor: session.mentorName,
              connectionId: session.connectionId || session.id,
            }))
            setSchedule(formattedSchedule)
          } else {
            // Backend returned empty → no sessions today
            setSchedule([])
          }
        } else {
          // API error → show empty state
          setSchedule([])
        }
      } catch (error) {
        console.warn('Error loading daily schedule:', error)
        // Error → show empty state
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }

    loadDailySchedule()
  }, [userRole, profileId])

  if (loading) {
    return (
      <div className="right-panel">
        <h3 className="panel-title">Agenda do Dia</h3>
        <div className="schedule-list">
          <div className="empty-state">Carregando agenda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="right-panel">
      <h3 className="panel-title">Agenda do Dia</h3>
      <div className="schedule-list">
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <div key={item.id} className="schedule-item">
              <span className="schedule-time">
                <strong>{item.time}</strong> - {item.mentee || item.mentor}
              </span>
              <Button>Remarcar</Button>
            </div>
          ))
        ) : (
          <div className="empty-state">Não há mentorias previstas para hoje</div>
        )}
      </div>
    </div>
  )
}

export default DailySchedule
