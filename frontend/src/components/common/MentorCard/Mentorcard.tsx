import React from 'react';
import { Circle, Users } from 'lucide-react'; // Adicionei o ícone Users para vagas
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../common/Avatar/Avatar';
import './Mentorcard.css';

interface Skill {
  id: string;
  name: string;
}

interface MentorCardProps {
  id: number;
  name: string;
  position: string;
  skills: Skill[];
  anosExperiencia: number;
  isActive: boolean;
  isAvailable: boolean; // Nova Prop vinda do MentorService
  avatarUrl?: string;
  bio?: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  id,
  name, 
  position, 
  skills, 
  anosExperiencia, 
  isActive, 
  isAvailable, // Destruturando a nova prop
  avatarUrl,
  bio
}) => {
  const navigate = useNavigate();
  const displaySkills = skills.slice(0, 5);
  const hasMoreSkills = skills.length > 5;

  const handleCardClick = () => {
    if (isAvailable) {
      navigate(`/book-session/${id}`, {
        state: {
          mentorId: id,
          mentorName: name,
          mentorPosition: position,
          mentorSkills: skills,
          mentorXp: anosExperiencia,
          mentorAvatar: avatarUrl,
          mentorIsActive: isActive,
          mentorBio: bio
        }
      });
    }
  };

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`mentor-card ${!isAvailable ? 'full-capacity' : 'clickable'}`}
      onClick={handleCardClick}
      role={isAvailable ? 'button' : 'article'}
      tabIndex={isAvailable ? 0 : -1}
    >
      <div className="mentor-card-header">
        <div className="mentor-avatar-container">
          <Avatar avatarUrl={avatarUrl} size={90} /> 
        </div>
        <div className="mentor-info-basic">
          <h3 className="mentor-name">{name}</h3>
          <p className="mentor-position"><strong>Cargo:</strong> {position}</p>
        </div>
      </div>

      <div className="mentor-skills-section">
        <p className="skills-label">Habilidades:</p>
        <div className="mentor-skills-list">
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
      </div>

      <div className="mentor-footer">
        <div className="mentor-stats-row">
          <p className="mentor-xp"><strong>Experiência:</strong> {anosExperiencia} anos</p>
          
          {/* Only show "Lista de Espera" badge/button if NO vagas available */}
          {!isAvailable && (
            <div className="vacancy-badge no-vagas">
              <Users size={14} />
              <span>Lista de Espera</span>
            </div>
          )}
        </div>
        
        <div className="mentor-status">
          <strong>Perfil:</strong> {isActive && isAvailable ? 'Ativo' : 'Inativo'}
          <Circle 
            size={12} 
            fill={isActive && isAvailable ? "#4ade80" : "#fb7185"} 
            color="transparent" 
            className="status-dot"
          />
        </div>
      </div>

      {/* Show action button only if NO vagas available */}
      {!isAvailable && (
        <button 
          className="btn-conectar btn-waitlist"
          onClick={handleWaitlistClick}
        >
          Entrar na Lista
        </button>
      )}
    </div>
  );
};

export default MentorCard;