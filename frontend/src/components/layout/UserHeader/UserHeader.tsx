import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import { apiFetch } from '../../../services/api'
import './UserHeader.css'

type HistoryItem = {
  reason: string
  xp: string
}

type UserHeaderData = {
  nome: string
  username: string
  cargo: string
  avatarUrl: string
  level: string
  xp: string
  nextLevelXp: string | null
  role: 'MENTOR' | 'MENTORADO'
  unlockedAchievements: string[]
  recentHistory: HistoryItem[]
}

const DEFAULT_USER_DATA: UserHeaderData = {
  nome: 'Carregando...',
  username: '...',
  cargo: '...',
  avatarUrl: '',
  level: '0',
  xp: '0',
  nextLevelXp: null,
  role: 'MENTOR',
  unlockedAchievements: [],
  recentHistory: [],
}

const FALLBACK_USER_DATA: UserHeaderData = {
  nome: 'Zezin 1',
  username: 'ze1',
  cargo: 'Mentor',
  avatarUrl: '',
  level: '1',
  xp: '0',
  nextLevelXp: '500',
  role: 'MENTOR',
  unlockedAchievements: ['Identidade Transcendental', 'Chama Acesa', 'Primeiro Match'],
  recentHistory: [
    { reason: 'PROFILE_COMPLETED', xp: '50' },
    { reason: 'MATCH_ACCEPTED', xp: '150' },
    { reason: 'SESSION_COMPLETED', xp: '50' },
  ],
}

export const UserHeader = () => {
  const [userData, setUserData] = useState<UserHeaderData>(DEFAULT_USER_DATA)

  useEffect(() => {
    const loadData = async () => {
      const loggedUserId = localStorage.getItem('userId') || '1'

      try {
        const res = await apiFetch(`/users/${loggedUserId}`)
        if (!res.ok) throw new Error('user not found')

        const data = await res.json()
        const user = data?.user || {}
        const profiles = Array.isArray(data?.profiles) ? data.profiles : []
        const mentorProfile = profiles.find((p: any) => p?.role === 'MENTOR') || profiles[0] || {}

        let level = mentorProfile?.level?.toString() || '0'
        let xp = mentorProfile?.xp?.toString() || '0'
        let nextLevelXp: null = null
        let unlockedAchievements: string[] = []
        let recentHistory: HistoryItem[] = []

        try {
          const summaryRes = await apiFetch(`/gamification/users/${loggedUserId}/summary`)
          if (summaryRes.ok) {
            const summary = await summaryRes.json()
            level = summary?.currentLevel?.toString() || level
            xp = summary?.totalXp?.toString() || xp
            nextLevelXp = summary?.nextLevelXp ?? null
            unlockedAchievements = Array.isArray(summary?.unlockedAchievements)
              ? summary.unlockedAchievements
              : []
            recentHistory = Array.isArray(summary?.recentHistory)
              ? summary.recentHistory
              : []
          }
        } catch {
          // Keep profile values if summary is unavailable.
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
          avatarUrl: mentorProfile?.avatarUrl || '',
          role: mentorProfile?.role === 'MENTORADO' ? 'MENTORADO' : 'MENTOR',
        })
      } catch {
        // Fallback to deterministic mock aligned with UserMockConfig seed.
        setUserData(FALLBACK_USER_DATA)
      }
    }

    loadData()
  }, [])

  return (
    <section className="user-header">
      <div className="profile-section">
        <div className="header-info">
          <div className="header-avatar">
            <Avatar avatarUrl={userData.avatarUrl} size={120} />
          </div>
        </div>
        <div className="header-info">
          <ProfileBadge text={userData.role === 'MENTOR' ? 'Pessoa Mentora' : 'Mentorada'} />
          <span className="profile-user-name">{userData.nome}</span>
          <span className="profile-details">
            @{userData.username} | {userData.cargo}
          </span>
        </div>
      </div>

      <div className="profile-stats-bg">
        <div className="profile-stats-container">
          <InputGroup
            label="Nível"
            value={userData.level}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            label="XP"
            value={`${userData.xp} XP`}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            label="Status"
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