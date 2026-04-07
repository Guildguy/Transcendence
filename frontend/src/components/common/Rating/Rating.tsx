import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

interface RatingProps {
  rating?: number;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ rating, size = 16 }) => {
  return (
    <div className="rating">
      <Star 
        size={size}
        fill="var(--rating-yellow)" 
        color="transparent" 
        className="rating-star" 
      />
      <span className="rating-text">{rating?.toFixed(1)}</span>
    </div>
  );
};

export default Rating;
