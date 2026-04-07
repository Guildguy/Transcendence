import React from 'react';
import { User, Circle, LogOut, MessageCircle } from 'lucide-react';
import './MenteeInfo.css';
import IconButton from '../IconButton/IconButton';

interface MenteeInfoProps {
  name: string;
  position: string;
  experience: string | number;
  bio?: string;
  avatarUrl?: string;
  connectionStatus?: 'none' | 'pending' | 'active' | 'loading';
  onLeave?: () => void;
}

const MenteeInfo: React.FC<MenteeInfoProps> = ({ 
  name, 
  position, 
  experience, 
  bio,
  avatarUrl,
  connectionStatus = 'none',
  onLeave,
}) => {
  return (
    <div className="mentor-info-card mentee-info-card">
      <div className="mentor-info-card-header">
        <div className="mentor-info-avatar-container">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="mentor-avatar-img" />
          ) : (
            <User size={40} className="mentor-avatar-icon" />
          )}
        </div>
        
        <div className="mentor-info-basic">
          <h3 className="mentor-info-name">{name}</h3>
          <p className="mentor-info-details">{position} | {experience} anos de experiência</p>
          <div className="mentor-info-status">
            Mentorado Ativo
            <Circle 
              size={12} 
              fill="#4ade80" 
              color="transparent" 
              className="status-dot"
            />
          </div>
          <p className="mentor-info-bio">{bio || "Mentorado dedicado em busca de aprimoramento técnico e desenvolvimento de carreira."}</p>
        </div>
      </div>
      <div className="mentor-info-divider" />

      <div className="mentor-info-footer">
        <IconButton variant="primary" icon={<MessageCircle size={18} />}>Conversar</IconButton>
        
        {connectionStatus === 'loading' && (
          <IconButton variant="secondary" icon={<Circle size={18} />} disabled>Carregando...</IconButton>
        )}
        
        {connectionStatus === 'active' && (
          <IconButton variant="withdraw" icon={<LogOut size={18} />} onClick={onLeave}>Encerrar Mentoria</IconButton>
        )}
      </div>
    </div>
  );
};

export default MenteeInfo;
