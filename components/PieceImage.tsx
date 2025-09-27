import React, { useState } from 'react';
import { pieceImagePaths, chessPiecesUnicode } from '../assets/pieceImages';

interface PieceImageProps {
  piece: string;
  className?: string;
  style?: React.CSSProperties;
  gameMode?: string;
}

const PieceImage: React.FC<PieceImageProps> = ({ piece, className = '', style, gameMode }) => {
  const [imageError, setImageError] = useState(false);

  // Special handling for Leviathan mode
  if (gameMode === 'leviathan') {
    return (
      <div className={`flex items-center justify-center text-2xl font-bold ${className}`} style={style}>
        Λ
      </div>
    );
  }

  // Get image path and unicode fallback
  const imagePath = pieceImagePaths[piece as keyof typeof pieceImagePaths];
  const unicodePiece = chessPiecesUnicode[piece] || '?';

  // If no image path or image failed to load, use Unicode
  if (!imagePath || imageError) {
    return (
      <div className={`flex items-center justify-center text-2xl ${className}`} style={style}>
        {unicodePiece}
      </div>
    );
  }

  // Render image with fallback
  return (
    <img
      src={imagePath}
      alt={`${piece} chess piece`}
      className={`w-full h-full object-contain ${className}`}
      style={style}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
};

export default PieceImage;