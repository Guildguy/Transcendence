import React from 'react';
import './IconButton.css';

interface IconButtonProps {
  variant?: 'primary' | 'secondary' | 'withdraw';
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  icon,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={`icon-button icon-button--${variant} ${className} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <span className="icon-button-icon">{icon}</span>}
      <span className="icon-button-text">{children}</span>
    </button>
  );
};

export default IconButton;
