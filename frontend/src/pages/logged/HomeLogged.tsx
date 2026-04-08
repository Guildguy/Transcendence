import { useState, useEffect } from 'react'
import UserHeader from '../../components/layout/UserHeader/UserHeader'
import Achievements from '../../components/common/Achievements/Achievements'
import Requests from '../../components/common/Requests/Requests'
import DailySchedule from '../../components/common/DailySchedule/DailySchedule'
import { mockRequests, mockAchievements } from './HomeLogged.mock.tsx'
import { apiFetch } from '../../services/api'
import { extractBase64FromAvatarUrl } from '../../utils/imageUtils'
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

      // Carrega solicitações pendentes — agora usa o profileId do mentor
      if (resolvedProfileId) {
        try {
          console.log(`[HomeLogged] Fetching pending requests for Mentor Profile ID: ${resolvedProfileId}`);
          const incomingRes = await apiFetch(`/mentorship-connections/mentor/${resolvedProfileId}/pending`)
          if (incomingRes.ok) {
            const data: any[] = await incomingRes.json()
            console.log('[HomeLogged] Pending requests received:', data);
            if (Array.isArray(data) && data.length > 0) {
              setRequests(data.map(m => ({
                id: m.id,
                name: m.menteeName || `Mentorado #${m.menteeId}`,
                avatar: undefined,
              })))
            } else {
              console.log('[HomeLogged] No pending requests found');
              setRequests([])
            }
          } else {
            console.warn('[HomeLogged] Failed to fetch pending requests:', incomingRes.status);
            setRequests([])
          }
        } catch (err) {
          console.error('[HomeLogged] Error fetching pending requests:', err);
          setRequests([])
        }
      } else {
        console.log('[HomeLogged] User is not a mentor or mentorProfileId not resolved yet');
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

  // 2. Accept/Decline → usa PATCH /mentorship-connections/{id}/accept?mentorUserId=
  const handleAccept = async (id: number) => {
    const userId = localStorage.getItem('userId')
    if (!userId) return

    console.log(`[HomeLogged] Accepting connection ID: ${id} for mentor user: ${userId}`);
    setRequests(prev => prev.filter(r => r.id !== id))
    try {
      const res = await apiFetch(`/mentorship-connections/${id}/accept?mentorUserId=${userId}`, {
        method: 'PATCH',
      })
      if (!res.ok) console.error('[HomeLogged] Failed to accept connection:', res.status);
    } catch (err) {
      console.error('[HomeLogged] Error accepting connection:', err);
    }
  }

  const handleDecline = async (id: number) => {
    const userId = localStorage.getItem('userId')
    if (!userId) return

    console.log(`[HomeLogged] Rejecting connection ID: ${id} for mentor user: ${userId}`);
    setRequests(prev => prev.filter(r => r.id !== id))
    try {
      const res = await apiFetch(`/mentorship-connections/${id}/reject?mentorUserId=${userId}`, {
        method: 'PATCH',
      })
      if (!res.ok) console.error('[HomeLogged] Failed to reject connection:', res.status);
    } catch (err) {
      console.error('[HomeLogged] Error rejecting connection:', err);
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

          <DailySchedule
            userRole={userRole}
            profileId={mentorProfileId}
          />

        </section>

        <Achievements achievements={achievements} />

      </div>
  )
}

export default HomeLogged