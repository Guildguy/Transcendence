import React from 'react';
import { User, Circle, Users, MessageCircle, Star, LogOut } from 'lucide-react';
import './MentorInfo.css';
import IconButton from '../IconButton/IconButton';
import Rating from '../Rating/Rating';

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
  rating?: number;
  menteeCount?: number;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  position, 
  skills, 
  experience, 
  isActive, 
  bio,
  avatarUrl,
  rating,
  menteeCount
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
              fill={isActive ? "var(--is-active-green)" : "var(--is-inactive-red)"} 
              color="transparent" 
              className="status-dot-2"
            />
          </div>
          <p className="mentor-info-bio">{bio || "Opa, esse mentor ainda não preencheu sua bio."}</p>
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
              {rating !== undefined && (
                <Rating rating={rating} />
              )}
              <div className="mentor-info-mentorships">
                <Users size={16} />
                <span className="mentor-info-mentorships-text">{menteeCount ?? 0}</span>
              </div>
          </div>
        </div>
      </div>
      <div className="mentor-info-divider" />

      <div className="mentor-info-footer">
        <IconButton variant="primary" icon={<MessageCircle size={18} />}>Conversar</IconButton>
        <IconButton variant="secondary" icon={<Star size={18} />}>Avaliar</IconButton>
        <IconButton variant="withdraw" icon={<LogOut size={18} />}>Deixar Mentoria</IconButton>
      </div>
    </div>
  );
};

export default MentorCard;