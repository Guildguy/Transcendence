import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import { apiFetch } from '../../../services/api'
import './UserHeader.css'

interface UserData {
  level?: string
  xp?: string
  cargo?: string
  nome?: string
  username?: string
  profile?: string //MENTOR OU MENTORADO
}

export const UserHeader = () => {
  const [userData, setUserData] = useState<UserData>({ level: '0', xp: '0' })

  useEffect(() => {
    const load = async () => {
      const loggedUserId = localStorage.getItem('userId')
      if (!loggedUserId) return

      try {
        const res = await apiFetch(`/users/${loggedUserId}`)
        if (!res.ok) throw new Error('no user')
        const data = await res.json()
        const profile = data.profiles && data.profiles.length > 0 ? data.profiles[0] : {}
        setUserData({ //CHECAR SE ESSE C[ODIGO ESTA CERTO
          level: profile.level?.toString() || '0',
          xp: profile.xp?.toString() || '0',
          cargo: profile.cargo || 'Cargo',
          nome: profile.nome || 'Nome do usuário',
          username: profile.username || 'username',
          profile: profile.profile || 'Mentor' //MENTOR OU MENTORADO
        })
      } catch (e) {
        // fallback mock when backend is unavailable
        setUserData({ level: '0', xp: '500' })
      }
    }
    load()
  }, [])

  return (
    <section className="user-header">
      <div className="profile-section">
        <div className="header-info">
          <div className="header-avatar">
           <Avatar />
          </div>
        </div>
        <div className="header-info">
          <ProfileBadge text={userData.nome || 'Mentor'} />
          <span className="profile-user-name">{userData.nome || 'Nome do usuário'}</span>
          <span className="profile-details">@{userData.username || 'username'} | {userData.cargo || 'Cargo'}</span>
        </div>
      </div>
      <div className="profile-stats-bg">
        <div className="profile-stats-container">
          <InputGroup
            placeholder="Nível"
            value={userData.level || '0'}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            placeholder="XP"
            value={`${userData.xp || '0'} XP`}
            isEditing={false}
            onChange={() => {}}
          />
          <InputGroup
            placeholder="Dias ensinando"
            value={"XX Dias Ensinando 🔥"}
            isEditing={false}
            onChange={() => {}}
          />
        </div>
      </div>
    </section>
  )
}

export default UserHeader
