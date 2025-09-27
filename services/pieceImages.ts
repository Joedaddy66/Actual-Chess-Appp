// Chess piece image imports and mapping
// These images will be used instead of Unicode characters for chess pieces

// Import all piece images
import whiteKing from '../assets/pieces/white_king.png';
import whiteQueen from '../assets/pieces/white_queen.png';
import whiteRook from '../assets/pieces/white_rook.png';
import whiteBishop from '../assets/pieces/white_bishop.png';
import whiteKnight from '../assets/pieces/white_knight.png';
import whitePawn from '../assets/pieces/white_pawn.png';

import blackKing from '../assets/pieces/black_king.png';
import blackQueen from '../assets/pieces/black_queen.png';
import blackRook from '../assets/pieces/black_rook.png';
import blackBishop from '../assets/pieces/black_bishop.png';
import blackKnight from '../assets/pieces/black_knight.png';
import blackPawn from '../assets/pieces/black_pawn.png';

// Helmbreaker pieces
import whiteSiegeEngine from '../assets/pieces/white_siege_engine.png';
import blackGuardRook from '../assets/pieces/black_guard_rook.png';
import blackFortressKing from '../assets/pieces/black_fortress_king.png';

// Mapping of piece codes to image URLs
export const pieceImages: { [key: string]: string } = {
  // Standard chess pieces
  WK: whiteKing,
  WQ: whiteQueen,
  WR: whiteRook,
  WB: whiteBishop,
  WN: whiteKnight,
  WP: whitePawn,
  
  BK: blackKing,
  BQ: blackQueen,
  BR: blackRook,
  BB: blackBishop,
  BN: blackKnight,
  BP: blackPawn,
  
  // Helmbreaker pieces
  WSE: whiteSiegeEngine, // White Siege Engine
  BGR: blackGuardRook,   // Black Guard Rook
  BFK: blackFortressKing, // Black Fortress King
};

// Fallback Unicode characters (kept as backup)
export const fallbackChessPieces: { [key: string]: string } = {
  WK: '♔', WQ: '♕', WR: '♖', WB: '♗', WN: '♘', WP: '♙',
  BK: '♚', BQ: '♛', BR: '♜', BB: '♝', BN: '♞', BP: '♟',
  // Helmbreaker Pieces
  WSE: '❖', // White Siege Engine
  BGR: '♜', // Black Guard Rook (re-using Rook)
  BFK: '♚', // Black Fortress King
};