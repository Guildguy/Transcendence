import React, { useRef } from 'react';
import { User, Pencil } from 'lucide-react';
import './Avatar.css';

interface AvatarProps {
  avatarUrl?: string;
  size?: number; 
  isEditable?: boolean;
  onImageChange?: (file: File) => void;
}

export const Avatar = ({ avatarUrl, size = 120, isEditable=false, onImageChange }: AvatarProps) => { 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificação de segurança para a URL
  const hasValidUrl = avatarUrl && avatarUrl.length > 10; 

  const handlePencilClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      <div className="perfil-avatar-base">
        {hasValidUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="avatar-img"
            onError={(e) => {
              // Se a imagem falhar mostra o ícone de fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
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