import React, { useRef, useState, useEffect } from 'react';
import { User, Pencil } from 'lucide-react';
import { processAvatarUrl } from '../../../utils/imageUtils';
import './Avatar.css';

interface AvatarProps {
  avatarUrl?: string;
  size?: number; 
  isEditable?: boolean;
  onImageChange?: (file: File) => void;
}

export const Avatar = ({ avatarUrl, size = 120, isEditable = false, onImageChange }: AvatarProps) => { 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFallback, setShowFallback] = useState(true);
  const [processedUrl, setProcessedUrl] = useState<string>('');

  // Process the avatarUrl when it changes
  useEffect(() => {
    const processed = processAvatarUrl(avatarUrl);
    
    if (processed) {
      setProcessedUrl(processed);
      setShowFallback(false);
    } else {
      setProcessedUrl('');
      setShowFallback(true);
    }
  }, [avatarUrl]);

  const handlePencilClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const handleImageError = () => {
    console.warn('Failed to load avatar image from:', processedUrl);
    setShowFallback(true);
  };

  return (
    <div 
      className="avatar-wrapper" 
      style={{ width: size, height: size }}
    >
      <div className="perfil-avatar-base">
        {!showFallback && processedUrl ? (
          <img 
            src={processedUrl} 
            alt="Avatar do usuário" 
            className="avatar-img"
            onError={handleImageError}
          />
        ) : (
          <User size={size / 2} color="#e5e7eb" />
        )}
      </div>

      {isEditable && (
        <>
          <button className="avatar-edit-button" onClick={handlePencilClick}>
            <Pencil size={size / 6} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default Avatar;