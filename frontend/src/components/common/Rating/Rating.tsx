import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

interface RatingProps {
  rating?: number;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, size = 16 }) => {
  const parsedRating = Number(rating);
  const normalizedRating = Number.isFinite(parsedRating)
    ? Math.max(1, Math.min(5, parsedRating))
    : 0;
  const displayRating = Number.isFinite(normalizedRating)
    ? (Number.isInteger(normalizedRating) ? `${normalizedRating}` : normalizedRating.toFixed(1))
    : '0';
  
  return (
    <div className="rating">
      <Star 
        size={size}
        fill="var(--rating-yellow)" 
        color="transparent" 
        className="rating-star" 
      />
      <span className="rating-text">{displayRating}</span>
    </div>
  );
};

export default Rating;
