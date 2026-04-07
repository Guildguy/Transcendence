import React from 'react';
import { User, Circle, Star, Users, MessageCircle, X, LogOut } from 'lucide-react';
import './MentorInfo.css';
import IconButton from '../IconButton/IconButton';

interface Skill {
  id: string;
  name: string;
}

interface MentorCardProps {
  name: string;
  position: string;
  skills: Skill[];
  experience: string | number;
  isActive: boolean;
  bio?: string;
  avatarUrl?: string;
  // Connection callbacks
  connectionStatus?: 'none' | 'pending' | 'active' | 'loading';
  onConnect?: () => void;
  onLeave?: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  position, 
  skills, 
  experience, 
  isActive, 
  bio,
  avatarUrl,
  connectionStatus = 'none',
  onConnect,
  onLeave,
}) => {
  const displaySkills = skills.slice(0, 5);
  const hasMoreSkills = skills.length > 5;

  return (
    <div className="mentor-info-card">
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
          <p className="mentor-info-details">{position} | {experience} anos</p>
          <div className="mentor-info-status">
            {isActive ? 'Ativo' : 'Indisponível'}
            <Circle 
              size={12} 
              fill={isActive ? "#4ade80" : "#fb7185"} 
              color="transparent" 
              className="status-dot"
            />
          </div>
          <p className="mentor-info-bio">{bio || "Especialista em arquitetura de microsserviços e liderança técnica. Apaixonado por mentoria e desenvolvimento de pessoas."}</p>
          <div className="mentor-info-skills-pills">
            {displaySkills.length > 0 ? (
              <>
                {displaySkills.map((skill) => (
                  <span key={skill.id} className="skill-tag">{skill.name}</span>
                ))}
                {hasMoreSkills && (
                  <button className="skill-tag btn-ver-mais">+{skills.length - 5}</button>
                )}
              </>
            ) : (
              <p className="no-skills-message">Sem habilidades informadas</p>
            )}
          </div>
          <div className="mentor-info-stats-section">
              <div className="mentor-info-rating">
                <Star size={16} fill="#fbbf24" color="transparent" className="mentor-rating-star" />
                <span className="mentor-info-rating-text">4.8</span>
              </div>
              <div className="mentor-info-mentorships">
                <Users size={16} />
                <span className="mentor-info-mentorships-text">4.8</span>
              </div>
          </div>
        </div>
      </div>
      <div className="mentor-info-divider" />

      <div className="mentor-info-footer">
        <IconButton variant="primary" icon={<MessageCircle size={18} />}>Conversar</IconButton>
        <IconButton variant="secondary" icon={<Star size={18} />}>Avaliar</IconButton>

        {connectionStatus === 'loading' && (
          <IconButton variant="secondary" icon={<Circle size={18} />} disabled>Carregando...</IconButton>
        )}
        {connectionStatus === 'none' && (
          <IconButton variant="primary" icon={<Users size={18} />} onClick={onConnect}>Conectar</IconButton>
        )}
        {connectionStatus === 'pending' && (
          <IconButton variant="secondary" icon={<Circle size={18} />} disabled>Aguardando aprovação</IconButton>
        )}
        {connectionStatus === 'active' && (
          <IconButton variant="withdraw" icon={<LogOut size={18} />} onClick={onLeave}>Deixar Mentoria</IconButton>
        )}
      </div>
    </div>
  );
};

export default MentorCard;