import React, { useState } from 'react';
import { User, Circle, Users, MessageCircle, Star, LogOut } from 'lucide-react';
import './MentorInfo.css';
import IconButton from '../IconButton/IconButton';
import Rating from '../Rating/Rating';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../Dialog/Dialog';
import { apiFetch } from '../../../services/api';

interface Skill {
  id: string;
  name: string;
}

interface MentorCardProps {
  mentorId?: number | string;
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
  mentorId,
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
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState<number | undefined>(rating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displaySkills = skills.slice(0, 5);
  const hasMoreSkills = skills.length > 5;

  const handleStarClick = (starValue: number) => {
    setSelectedRating(starValue);
  };

  const handleSubmitRating = async () => {
    if (selectedRating === null || !mentorId) return;

    setIsSubmitting(true);
    try {
      console.log(`Submitting rating for mentor ${mentorId}: ${selectedRating}`);
      
      const response = await apiFetch(`/mentors/${mentorId}/rating`, {
        method: 'POST',
        body: JSON.stringify({ rating: selectedRating })
      });
      
      if (!response.ok) {
        throw new Error(`Rating submission failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Rating submission response:', data);
      
      // Update the displayed rating
      setCurrentRating(selectedRating);
      
      // Reset and close dialog
      setSelectedRating(null);
      setIsRatingDialogOpen(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erro ao enviar avaliação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <p className="mentor-info-bio">{bio || "Opa, esse mentor ainda não preencheu a bio."}</p>
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
              {currentRating !== undefined && (
                <Rating rating={currentRating} />
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
        <IconButton variant="secondary" icon={<Star size={18} />} onClick={() => setIsRatingDialogOpen(true)}>Avaliar</IconButton>
        <IconButton variant="withdraw" icon={<LogOut size={18} />}>Deixar Mentoria</IconButton>
      </div>

      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="rating-dialog">
          <DialogHeader>
            <DialogTitle>
              O quanto você curtiu esse mentor?
            </DialogTitle>
            <DialogDescription>
              Escolha uma nota de 0 a 5:
            </DialogDescription>
          </DialogHeader>
          <div className="rating-stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton 
                key={star} 
                variant="rating"
                onClick={() => handleStarClick(star)}
                className={selectedRating !== null && star <= selectedRating ? 'active' : ''}
              >
                <Star size={24} fill={selectedRating !== null && star <= selectedRating ? 'var(--rating-yellow-medium)' : 'none'} color='var(--rating-yellow-medium)'/>
              </IconButton>
            ))}
          </div>
          <IconButton 
            variant="primary" 
            onClick={handleSubmitRating} 
            disabled={selectedRating === null || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </IconButton>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorCard;