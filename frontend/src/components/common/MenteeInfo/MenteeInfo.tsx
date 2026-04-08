import React, { useState, useEffect } from 'react';
import { User, Circle, MessageCircle, LogOut } from 'lucide-react';
import './MenteeInfo.css';
import IconButton from '../IconButton/IconButton';
import { apiFetch } from '../../../services/api';

interface Skill {
  id: string;
  name: string;
}

interface MenteeCardProps {
  menteeId?: number | string;
  name?: string;
  position?: string;
  skills?: Skill[];
  experience?: string | number;
  isActive?: boolean;
  bio?: string;
  avatarUrl?: string;
}

const MenteeCard: React.FC<MenteeCardProps> = ({ 
  menteeId,
  name: initialName, 
  position: initialPosition, 
  skills: initialSkills, 
  experience: initialExperience, 
  isActive: initialIsActive, 
  bio: initialBio,
  avatarUrl: initialAvatarUrl,
}) => {
  const [name, setName] = useState(initialName || "");
  const [position, setPosition] = useState(initialPosition || "");
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [experience, setExperience] = useState(initialExperience || 0);
  const [isActive, setIsActive] = useState(initialIsActive ?? true);
  const [bio, setBio] = useState(initialBio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [isLoading, setIsLoading] = useState(!initialName);
  const [error, setError] = useState<string | null>(null);
  // Fetch mentee data if menteeId is provided
  useEffect(() => {
    const fetchMenteeData = async () => {
      if (!menteeId && !initialName) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user and profile data
        const response = await apiFetch(`/users/${menteeId}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do mentorado');
        
        const data = await response.json();
        const user = data.user || {};
        const profiles = data.profiles || [];
        
        // Find mentee profile
        const menteeProfile = profiles.find(
          (p: any) => p.role?.toUpperCase() === 'MENTEE'
        ) || profiles[0];
        
        if (menteeProfile) {
          setName(user.name || "Mentorado");
          setPosition(menteeProfile.position || "Aprendiz");
          setExperience(menteeProfile.anosExperiencia || 0);
          setBio(menteeProfile.bio || "Esse mentorado ainda não preencheu a bio.");
          setIsActive(true);
          
          // Fetch avatar
          try {
            const imgResponse = await apiFetch(`/profiles/image/${menteeProfile.id}`);
            if (imgResponse.ok) {
              const imgData = await imgResponse.json();
              if (imgData && imgData.avatarUrl) {
                try {
                  const parsed = JSON.parse(imgData.avatarUrl);
                  setAvatarUrl(parsed.image_base64 || imgData.avatarUrl);
                } catch {
                  setAvatarUrl(imgData.avatarUrl);
                }
              }
            }
          } catch (err) {
            console.error('Erro ao carregar imagem:', err);
          }
          
          // TODO: Fetch skills from Python service if needed
          setSkills([]);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do mentorado:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialName) {
      fetchMenteeData();
    } else {
      setIsLoading(false);
    }
  }, [menteeId, initialName]);

  const displaySkills = skills.slice(0, 5);
  const hasMoreSkills = skills.length > 5;

  if (isLoading) {
    return <div className="mentee-info-card">Carregando dados...</div>;
  }

  if (error) {
    return <div className="mentee-info-card">Erro: {error}</div>;
  }

  return (
    <div className="mentee-info-card">
      <div className="mentee-info-card-header">
        <div className="mentee-info-avatar-container">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="mentee-avatar-img" />
          ) : (
            <User size={40} className="mentee-avatar-icon" />
          )}
        </div>
        
        <div className="mentee-info-basic">
          <h3 className="mentee-info-name">{name}</h3>
          <p className="mentee-info-details">{position} | {experience} anos</p>
          <div className="mentee-info-status">
            {isActive ? 'Ativo' : 'Indisponível'}
            <Circle 
              size={12} 
              fill={isActive ? "var(--is-active-green)" : "var(--is-inactive-red)"} 
              color="transparent" 
              className="status-dot-2"
            />
          </div>
          <p className="mentee-info-bio">{bio}</p>
          <div className="mentee-info-skills-pills">
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
      </div>
      <div className="mentee-info-divider" />

      <div className="mentee-info-footer">
        <IconButton variant="primary" icon={<MessageCircle size={18} />}>Conversar</IconButton>
        <IconButton variant="withdraw" icon={<LogOut size={18} />}>Deixar Mentoria</IconButton>
      </div>
    </div>
  );
};

export default MenteeCard;
