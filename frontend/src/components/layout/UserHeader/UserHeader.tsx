import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import Achievements from '../../common/Achievements/Achievements'
import { apiFetch } from '../../../services/api'
import './UserHeader.css'

type HistoryItem = {
  reason: string
  xp: number
}

type AchievementItem = {
  name: string
  iconUrl: string
}

type UserHeaderData = {
  nome: string
  username: string
  cargo: string
  avatarUrl: string
  level: number
  xp: number
  nextLevelXp: number | null
  role: 'MENTOR' | 'MENTORADO'
  unlockedAchievements: AchievementItem[]
  recentHistory: HistoryItem[]
}

const DEFAULT_USER_DATA: UserHeaderData = {
  nome: 'Carregando...',
  username: '...',
  cargo: '...',
  avatarUrl: '',
  level: 0,
  xp: 0,
  nextLevelXp: null,
  role: 'MENTOR',
  unlockedAchievements: [],
  recentHistory: [],
}

const FALLBACK_USER_DATA: UserHeaderData = {
  nome: 'Nome de Usuário',
  username: 'ze1',
  cargo: 'Mentor',
  avatarUrl: '',
  level: 1,
  xp: 250,
  nextLevelXp: 500,
  role: 'MENTOR',
  unlockedAchievements: [
  { name: 'Identidade Transcendental', iconUrl: '/achievements/identidade_transcendental.png' },
  { name: 'Chama Acesa',               iconUrl: '/achievements/chama_acessa.png' },
  { name: 'Primeiro Match',            iconUrl: '/achievements/primeiro_aperto_de_mao.png' },
  ],
  recentHistory: [
  { reason: 'PROFILE_COMPLETED', xp: 50 },
  { reason: 'MATCH_ACCEPTED',    xp: 150 },
  { reason: 'SESSION_COMPLETED', xp: 50 },
  ],
}

const REASON_LABELS: Record<string, string> = {
  PROFILE_COMPLETED: 'Perfil completo',
  MATCH_ACCEPTED: 'Match aceito',
  SESSION_COMPLETED: 'Sessão concluída',
  CYCLE_COMPLETED: 'Ciclo fechado',
  REVIEW_SENT: 'Avaliação enviada',
  REVIEW_RECEIVED_5: 'Avaliação 5 estrelas recebida',
  REVIEW_RECEIVED_4: 'Avaliação 4 estrelas recebida',
  STREAK_7: 'Streak de 7 dias',
  NO_SHOW_WAITING_BONUS: 'Bônus de espera',
}

function formatReason(reason: string): string {
  return REASON_LABELS[reason] ?? reason
}

export const UserHeader = () => {
  const [userData, setUserData] = useState<UserHeaderData>(DEFAULT_USER_DATA)

  useEffect(() => {
    const loadData = async () => {
      const loggedUserId = localStorage.getItem('userId') || '1'

      try {
        const res = await apiFetch(`/users/${loggedUserId}`)
        if (!res.ok) throw new Error('user not found')

        const { user, profiles: fetchedProfiles } = await res.json()
        const profiles = Array.isArray(fetchedProfiles) ? fetchedProfiles : []
        const mentorProfile = profiles.find((p: any) => p?.role === 'MENTOR') || profiles[0] || {}
        const profileId = mentorProfile?.id

        let level: number = mentorProfile?.level ?? 0
        let xp: number = mentorProfile?.xp ?? 0
        let nextLevelXp: number | null = null
        let unlockedAchievements: AchievementItem[] = []
        let recentHistory: HistoryItem[] = []
        let avatarUrl = ''

        // Fetch gamification summary
        try {
          const summaryRes = await apiFetch(`/gamification/users/${loggedUserId}/summary`)
          if (summaryRes.ok) {
            const summary = await summaryRes.json()
            level = summary?.currentLevel ?? level
            xp = summary?.totalXp ?? xp
            nextLevelXp = summary?.nextLevelXp ?? null
            unlockedAchievements = Array.isArray(summary?.unlockedAchievements)
              ? summary.unlockedAchievements
              : []
            recentHistory = Array.isArray(summary?.recentHistory)
              ? summary.recentHistory
              : []
          }
        } catch {
          // Mantém valores do perfil se gamification falhar
        }

        // Fetch profile image separately (like ProfilePage does)
        if (profileId) {
          try {
            const imgRes = await apiFetch(`/profiles/image/${profileId}`)
            if (imgRes.ok) {
              const imgData = await imgRes.json()
              if (imgData && imgData.avatarUrl) {
                try {
                  // Try to parse as JSON (backend might wrap in JSON)
                  const parsed = JSON.parse(imgData.avatarUrl)
                  avatarUrl = parsed.image_base64 || parsed.avatarUrl || imgData.avatarUrl
                } catch {
                  // Not JSON, use as-is
                  avatarUrl = imgData.avatarUrl
                }
              }
            }
          } catch (err) {
            console.warn('Failed to load profile image:', err)
          }
        }

        setUserData({
          level,
          xp,
          nextLevelXp,
          unlockedAchievements,
          recentHistory,
          cargo: mentorProfile?.position || 'Cargo',
          nome: user?.name || 'Nome do usuario',
          username: user?.email ? String(user.email).split('@')[0] : 'username',
          avatarUrl,
          role: mentorProfile?.role === 'MENTORADO' ? 'MENTORADO' : 'MENTOR',
        })
      } catch {
        setUserData(FALLBACK_USER_DATA)
      }
    }

    loadData()
  }, [])

  return (
    <section className="user-header">

      {/* Perfil */}
      <div className="profile-section">
        <div className="header-info">
          <div className="header-avatar">
            <Avatar avatarUrl={userData.avatarUrl} size={150} />
          </div>
        </div>
        <div className="header-info">
          <ProfileBadge text={userData.role === 'MENTOR' ? 'Pessoa Mentora' : 'Mentorada'} />
          <h2 className="profile-user-name">{userData.nome}</h2>
          <span className="profile-details">
            @{userData.username} | {userData.cargo}
          </span>
        </div>
      </div>

      {/* Stats */}

      <div className="profile-stats-bg">
        <div className="profile-stats-container">
          <InputGroup
            value={`NÍVEL: ${String(userData.level)}`}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            value={`XP: ${userData.xp}`}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            value={userData.role === 'MENTOR' ? 'Ensinando 🔥' : 'Aprendendo 🚀'}
            isEditing={false}
            onChange={() => {}}
          />
        </div>
      </div>
    </section>
  )
}

export default UserHeader