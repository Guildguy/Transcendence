import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import { apiFetch } from '../../../services/api'
import './UserHeader.css'

export const UserHeader = () => {
  const [userData, setUserData] = useState({
    nome: 'Carregando...',
    username: '...',
    cargo: '...',
    avatarUrl: '',
    level: '0',
    xp: '0',
    role: 'MENTOR'
  });

useEffect(() => {
    const loadData = async () => {
      const loggedUserId = localStorage.getItem('userId') || "1";
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
    };
    loadData();
  }, []);

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
            value={userData.role === 'MENTOR' ? "Ensinando 🔥" : "Aprendendo 🚀"}
            isEditing={false}
            onChange={() => {}}
          />
        </div>
      </div>
    </section>
  )
}

export default UserHeader