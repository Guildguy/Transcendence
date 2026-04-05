import { useState, useEffect } from 'react'
import UserHeader from '../../components/layout/UserHeader/UserHeader'
import Button from '../../components/common/Button/Button'
import Achievements from '../../components/common/Achievements/Achievements'
import Requests from '../../components/common/Requests/Requests'
import { mockRequests, mockSchedule, mockAchievements } from './HomeLogged.mock.tsx'
import { apiFetch } from '../../services/api'
import './HomeLogged.css'

interface PendingRequest {
  id: number
  name: string
  avatar?: string
}

interface AchievementsData {
  id: number
  title: string
  icon?: string
}

function HomeLogged() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [achievements, setAchievements] = useState<AchievementsData[]>([])
  const [mentorProfileId, setMentorProfileId] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<'MENTOR' | 'MENTEE'>('MENTEE')
  const [loading, setLoading] = useState(true)

  // 1. Resolve mentorProfileId + carrega dados reais com fallback automático
  useEffect(() => {
    const loadHomeData = async () => {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setRequests(mockRequests.map(r => ({ id: r.id, name: r.name })))
        setAchievements(mockAchievements)
        setLoading(false)
        return
      }

      // Resolve profileId do mentor
      let resolvedProfileId: number | null = null
      try {
        const userRes = await apiFetch(`/users/${userId}`)
        if (userRes.ok) {
          const data = await userRes.json()
          const profiles: any[] = Array.isArray(data.profiles) ? data.profiles : []
          const mentorProfile = profiles.find(p => p?.role?.toUpperCase() === 'MENTOR')
          resolvedProfileId = mentorProfile?.id ?? null
          setMentorProfileId(resolvedProfileId)
          setUserRole(resolvedProfileId !== null ? 'MENTOR' : 'MENTEE')
        }
      } catch {
        // segue para fallback
      }

      // Carrega solicitações pendentes
      if (resolvedProfileId !== null) {
        try {
          const incomingRes = await apiFetch(`/mentorships/incoming/${resolvedProfileId}`)
          if (incomingRes.ok) {
            const data: any[] = await incomingRes.json()
            if (data.length > 0) {
              setRequests(data.map(m => ({
                id: m.id,
                name: m.menteeName ?? m.menteeProfileId ?? `Mentorado #${m.id}`,
                avatar: m.avatarUrl,
              })))
            } else {
              // Backend respondeu vazio → sem pendências reais, não usa mock
              setRequests([])
            }
          } else {
            // Erro de rede/servidor → fallback
            setRequests(mockRequests.map(r => ({ id: r.id, name: r.name })))
          }
        } catch {
          setRequests(mockRequests.map(r => ({ id: r.id, name: r.name })))
        }
      } else {
        setRequests([])
      }

      // Carrega conquistas do summary de gamificação
      try {
        const summaryRes = await apiFetch(`/gamification/users/${userId}/summary`)
        if (summaryRes.ok) {
          const summary = await summaryRes.json()
          const unlocked: AchievementsData[] = Array.isArray(summary?.unlockedAchievements)
            ? summary.unlockedAchievements
            : []
          if (unlocked.length > 0) {
            setAchievements(unlocked)
          } else {
            setAchievements(mockAchievements)
          }
        } else {
          setAchievements(mockAchievements)
        }
      } catch {
        setAchievements(mockAchievements)
      }

      setLoading(false)
    }

    loadHomeData()
  }, [])

  // 2. Accept/Decline conectados ao backend, com remoção otimista da lista
  const handleAccept = async (id: number) => {
    if (mentorProfileId === null) return

    setRequests(prev => prev.filter(r => r.id !== id))
    try {
      await apiFetch(`/mentorships/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ actorProfileId: mentorProfileId }),
      })
    } catch {
      // falha silenciosa — a remoção otimista já deu feedback visual
    }
  }

  const handleDecline = async (id: number) => {
    if (mentorProfileId === null) return

    setRequests(prev => prev.filter(r => r.id !== id))
    try {
      await apiFetch(`/mentorships/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ actorProfileId: mentorProfileId }),
      })
    } catch {
      // falha silenciosa
    }
  }

  return (
      <div className="home-logged">

        <UserHeader />

        <section className="main-content">

          <Requests
            userRole={userRole}
            mentorRequests={userRole === 'MENTOR' ? requests : []}
            menteeAcceptedRequests={userRole === 'MENTEE' ? requests : []}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />

          {/* Right Panel - Schedule (mock provisório, sem backend ainda) */}
          <div className="right-panel">
            <h3 className="panel-title">Agenda do Dia</h3>
            <div className="schedule-list">
              {mockSchedule.map((item) => (
                <div key={item.id} className="schedule-item">
                  <span className="schedule-time">
                    <strong>{item.time}</strong> - {item.mentee}
                  </span>
                  <Button>Remarcar</Button>
                </div>
              ))}
            </div>
          </div>

        </section>

        <Achievements achievements={achievements} />

      </div>
  )
}

export default HomeLogged