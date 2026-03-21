import React from 'react';
import { User, Circle } from 'lucide-react';
import './Mentorcard.css';

interface MentorCardProps {
  name: string;
  position: string;
  skills: string[];
  experience: string | number;
  isActive: boolean;
  avatarUrl?: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  position, 
  skills, 
  experience, 
  isActive, 
  avatarUrl 
}) => {
  return (
    <div className="mentor-card">
      <div className="mentor-card-header">
        <div className="mentor-avatar-container">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="mentor-avatar-img" />
          ) : (
            <User size={40} className="mentor-avatar-icon" />
          )}
        </div>
        
        <div className="mentor-info-basic">
          <h3 className="mentor-name">{name}</h3>
          <p className="mentor-position"><strong>Cargo:</strong> {position}</p>
        </div>
      </div>

      <div className="mentor-skills-section">
        <p className="skills-label">Habilidades:</p>
        <div className="mentor-skills-list">
          {skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
          <button className="skill-tag btn-ver-mais">Ver mais</button>
        </div>
      </div>

      <div className="mentor-footer">
        <p className="mentor-xp"><strong>Nível de Experiência:</strong> {experience} anos</p>
        
        <div className="mentor-status">
          <strong>Status:</strong> {isActive ? 'Ativo' : 'Indisponível'}
          <Circle 
            size={12} 
            fill={isActive ? "#4ade80" : "#fb7185"} 
            color="transparent" 
            className="status-dot"
          />
        </div>
      </div>
    </div>
  );
};

export default MentorCard;