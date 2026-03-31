import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import { userService } from '../../../services/Userservice' 
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
      // Pega o ID do usuário logado no storage
      const loggedUserId = localStorage.getItem('userId');
      if (!loggedUserId) return;

      try {
        const data = await userService.getFullProfile(loggedUserId);
        setUserData(data);
      } catch (error) {
        console.error("Erro ao carregar dados do Header:", error);
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
          <h2 className="profile-user-name">{userData.nome}</h2>
          <span className="profile-details">
            @{userData.username} | {userData.cargo}
          </span>
        </div>
      </div>

      <div className="profile-stats-bg">
        <div className="profile-stats-container">
          <InputGroup label="Nível" value={userData.level} isEditing={false} onChange={() => {}} />
          <InputGroup label="XP" value={`${userData.xp} XP`} isEditing={false} onChange={() => {}} />
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