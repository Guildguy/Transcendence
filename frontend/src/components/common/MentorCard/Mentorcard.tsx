import React from 'react';
import { Circle, Users } from 'lucide-react'; // Adicionei o ícone Users para vagas
import { Avatar } from '../../common/Avatar/Avatar';
import './Mentorcard.css';

interface Skill {
  id: string;
  name: string;
}

interface MentorCardProps {
  name: string;
  position: string;
  skills: Skill[];
  anosExperiencia: number;
  isActive: boolean;
  isAvailable: boolean; // Nova Prop vinda do MentorService
  avatarUrl?: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  position, 
  skills, 
  anosExperiencia, 
  isActive, 
  isAvailable, // Destruturando a nova prop
  avatarUrl 
}) => {
  const displaySkills = skills.slice(0, 5);
  const hasMoreSkills = skills.length > 5;

  return (
    <div className={`mentor-card ${!isAvailable ? 'full-capacity' : ''}`}>
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
          
          {/* Nova seção de Disponibilidade de Vagas */}
          <div className={`vacancy-badge ${isAvailable ? 'has-vagas' : 'no-vagas'}`}>
            <Users size={14} />
            <span>{isAvailable ? 'Com Vagas' : 'Lista de Espera'}</span>
          </div>
        </div>
        
        <div className="mentor-status">
          <strong>Perfil:</strong> {isActive ? 'Ativo' : 'Inativo'}
          <Circle 
            size={12} 
            fill={isActive ? "#4ade80" : "#fb7185"} 
            color="transparent" 
            className="status-dot"
          />
        </div>
      </div>

      {/* Sugestão: Botão de Ação */}
      <button className={`btn-conectar ${!isAvailable ? 'btn-waitlist' : ''}`}>
        {isAvailable ? 'Solicitar Mentoria' : 'Entrar na Lista'}
      </button>
    </div>
  );
};

export default MentorCard;