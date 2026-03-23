import React from 'react';
import './IconButton.css';

interface IconButtonProps {
  variant?: 'primary' | 'secondary' | 'withdraw';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  onClick,
}) => {
  return (
    <button
      className={`icon-button icon-button--${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default IconButton;
