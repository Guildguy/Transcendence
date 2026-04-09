import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

interface RatingProps {
  rating?: number;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, size = 16 }) => {
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating as any);
  
  return (
    <div className="rating">
      <Star 
        size={size}
        fill="var(--rating-yellow)" 
        color="transparent" 
        className="rating-star" 
      />
      <span className="rating-text">{isNaN(numericRating) ? '0.0' : numericRating.toFixed(1)}</span>
    </div>
  );
};

export default Rating;
