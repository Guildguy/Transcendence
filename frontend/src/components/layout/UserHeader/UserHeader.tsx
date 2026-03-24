import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import './UserHeader.css'

interface UserData {
  level: string
  xp: string
  cargo: string
  nome: string
  username: string
  avatarUrl: string
  role: string 
}

export const UserHeader = () => {
  const [userData, setUserData] = useState<UserData>({ 
    level: '0', 
    xp: '0', 
    cargo: 'Cargo', 
    nome: 'Nome do usuário', 
    username: 'username',
    avatarUrl: '',
    role: 'MENTOR'
  })

  useEffect(() => {
    const load = async () => {
      const loggedUserId = localStorage.getItem('userId') || "1" // Fallback para ID 1

      try {
        const res = await fetch(`http://localhost:8080/users/${loggedUserId}`)
        if (!res.ok) throw new Error('no user')
        
        const data = await res.json()
        const user = data.user
        const profile = data.profiles && data.profiles.length > 0 ? data.profiles[0] : {}

        // Lógica de tratamento da imagem (JSON parse do avatarUrl)
        let finalAvatar = ""
        if (user.avatarUrl) {
          try {
            const parsed = JSON.parse(user.avatarUrl)
            finalAvatar = parsed.image_base64 || user.avatarUrl
          } catch {
            finalAvatar = user.avatarUrl
          }
        }

        setUserData({
          level: profile.level?.toString() || '0',
          xp: profile.xp?.toString() || '0',
          cargo: profile.position || 'Desenvolvedor', // Mapeado de 'position' do backend
          nome: user.name || 'Nome do usuário',       // Mapeado de 'user.name'
          username: user.email ? user.email.split('@')[0] : 'username', // Fallback para username
          avatarUrl: finalAvatar,
          role: user.role || 'MENTOR'
        })
      } catch (e) {
        console.error("Erro ao carregar dados do UserHeader:", e)
        // Fallback mock para não quebrar o layout se o backend cair
        setUserData(prev => ({ ...prev, xp: '500', level: '10' }))
      }
    }
    load()
  }, [])

  return (
    <section className="user-header">
      <div className="profile-section">
        <div className="header-info">
          <div className="header-avatar">
            {/* Passando a avatarUrl para o componente Avatar */}
            <Avatar avatarUrl={userData.avatarUrl} size={120} />
          </div>
        </div>
        <div className="header-info">
          {/* Badge dinâmica baseada no Role */}
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