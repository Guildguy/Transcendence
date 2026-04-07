import React from 'react';
import './IconButton.css';

interface IconButtonProps {
  variant?: 'primary' | 'secondary' | 'withdraw' | 'rating';
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  icon,
  onClick,
}) => {
  return (
    <button
      className={`icon-button icon-button--${variant} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="icon-button-icon">{icon}</span>}
      <span className="icon-button-text">{children}</span>
    </button>
  );
};

export default IconButton;
