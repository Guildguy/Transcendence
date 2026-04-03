import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell/AppShell'
import Header from '../../components/layout/Header/Header'
import Footer from '../../components/layout/Footer/Footer'
import UserHeader from '../../components/layout/UserHeader/UserHeader'
import Avatar from '../../components/common/Avatar/Avatar'
import Button from '../../components/common/Button/Button'
import { Check, X } from 'lucide-react'
import { apiFetch } from '../../services/api'
import { mockRequests, mockSchedule, mockAchievements } from './HomeLogged.mock.tsx'
import './HomeLogged.css'

interface PendingRequest {
  id: number
  name: string
  avatar?: string
}

interface AchievementItem {
  name: string
  iconUrl: string
}

function HomeLogged() {
  useSearchParams()
  const [activeTab, setActiveTab] = useState<'pending' | 'notifications'>('pending')
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [mentorProfileId, setMentorProfileId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Resolve mentorProfileId + carrega dados reais com fallback automático
  useEffect(() => {
    const loadHomeData = async () => {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setRequests(mockRequests.map(r => ({ id: r.id, name: r.name })))
        setAchievements(mockAchievements.map(a => ({ name: a.title ?? '', iconUrl: a.icon ?? '' })))
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
          const mentorProfile = profiles.find(p => p?.role?.toUpperCase() === 'MENTOR') ?? profiles[0]
          resolvedProfileId = mentorProfile?.id ?? null
          setMentorProfileId(resolvedProfileId)
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
              // Dados reais prevalecem
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
        setRequests(mockRequests.map(r => ({ id: r.id, name: r.name })))
      }

      // Carrega conquistas do summary de gamificação
      try {
        const summaryRes = await apiFetch(`/gamification/users/${userId}/summary`)
        if (summaryRes.ok) {
          const summary = await summaryRes.json()
          const unlocked: AchievementItem[] = Array.isArray(summary?.unlockedAchievements)
            ? summary.unlockedAchievements
            : []
          if (unlocked.length > 0) {
            // Dados reais prevalecem
            setAchievements(unlocked)
          } else {
            // Nenhuma conquista desbloqueada ainda → fallback
            setAchievements(mockAchievements.map(a => ({ name: a.title ?? '', iconUrl: a.icon ?? '' })))
          }
        } else {
          setAchievements(mockAchievements.map(a => ({ name: a.title ?? '', iconUrl: a.icon ?? '' })))
        }
      } catch {
        setAchievements(mockAchievements.map(a => ({ name: a.title ?? '', iconUrl: a.icon ?? '' })))
      }

      setLoading(false)
    }

    loadHomeData()
  }, [])

  // 2. Accept/Decline conectados ao backend, com remoção otimista da lista
  const handleAccept = async (id: number) => {
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
    <AppShell
      sidebar={null}
      header={<Header isAuthenticated={true} />}
      footer={<Footer />}
    >
      <div className="home-logged">

        <UserHeader />

        <section className="main-content">

          {/* Left Panel */}
          <div className="left-panel">
            <div className="tab-bar">
              <button
                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Solicitações Pendentes
              </button>
              <button
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notificações
              </button>
            </div>

            <div className="requests-list">
              {activeTab === 'pending' && !loading && requests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-avatar img">
                    <Avatar size={80} avatarUrl={req.avatar} />
                  </div>
                  <p className="request-text">
                    <strong>{req.name}</strong> solicitou realizar mentoria. Aceita?
                  </p>
                  <div className="request-actions">
                    <Button onClick={() => handleAccept(req.id)} className="icon-button" aria-label="Accept">
                      <Check size={18} color="green" />
                    </Button>
                    <Button onClick={() => handleDecline(req.id)} className="icon-button" aria-label="Decline">
                      <X size={18} color="red" />
                    </Button>
                  </div>
                </div>
              ))}
              {activeTab === 'pending' && !loading && requests.length === 0 && (
                <div className="empty-state">Sem novas solicitações.</div>
              )}
              {activeTab === 'pending' && loading && (
                <div className="empty-state">Carregando...</div>
              )}
              {activeTab === 'notifications' && (
                <div className="empty-state">Sem novas notificações.</div>
              )}
            </div>
          </div>

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

        {/* Achievements — reais se desbloqueados, mock se não */}
        <section className="achievements-section">
          <h3 className="achievements-title">Conquistas</h3>
          <div className="achievements-grid">
            {achievements.map((a, i) => (
              <div key={i} className="achievement-card">
                {a.iconUrl && (
                  <img
                    src={a.iconUrl}
                    alt={a.name}
                    className="achievement-icon"
                    style={{ width: 48, height: 48, marginBottom: 8 }}
                  />
                )}
                <div className="achievement-title">{a.name}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  )
}

export default HomeLogged