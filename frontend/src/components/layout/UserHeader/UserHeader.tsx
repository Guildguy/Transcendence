import { useEffect, useState } from 'react'
import { Avatar } from '../../common/Avatar/Avatar'
import { ProfileBadge } from '../../common/ProfileBadge/ProfileBadge'
import InputGroup from '../../common/InputGroup/InputGroup'
import { userService } from '../../../services/Userservice' // Importe o service
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
      const data = await userService.getFullProfile(loggedUserId);
console.log("Dados que chegaram no Header:", data.avatarUrl); // Veja se aparece "data:image/..." no console
setUserData(data);
      try {
        const data = await userService.getFullProfile(loggedUserId);
        setUserData(data);
      } catch (error) {
        console.error("Erro no UserHeader:", error);
        // Fallback para manter o layout bonito se o backend falhar
        setUserData(prev => ({ ...prev, nome: "Usuário Offline", xp: "0" }));
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