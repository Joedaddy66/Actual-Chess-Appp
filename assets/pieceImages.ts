// Chess piece image paths - Replace PNG files with your custom pieces
// This system supports both Unicode fallback and custom images

export const pieceImagePaths = {
  // Map game piece codes to image files (using SVG for better browser compatibility)
  WK: '/assets/pieces/white_king_custom.svg', // White King
  WQ: '/assets/pieces/white_queen_custom.svg', // White Queen
  WR: '/assets/pieces/white_rook_custom.svg', // White Rook
  WB: '/assets/pieces/white_bishop_custom.svg', // White Bishop
  WN: '/assets/pieces/white_knight_custom.svg', // White Knight
  WP: '/assets/pieces/white_pawn_custom.svg', // White Pawn
  BK: '/assets/pieces/black_king_custom.svg', // Black King
  BQ: '/assets/pieces/black_queen_custom.svg', // Black Queen
  BR: '/assets/pieces/black_rook_custom.svg', // Black Rook
  BB: '/assets/pieces/black_bishop_custom.svg', // Black Bishop
  BN: '/assets/pieces/black_knight_custom.svg', // Black Knight
  BP: '/assets/pieces/black_pawn_custom.svg', // Black Pawn
};

// Unicode fallback for when images fail to load
export const chessPiecesUnicode: { [key: string]: string } = {
  WK: '♔', WQ: '♕', WR: '♖', WB: '♗', WN: '♘', WP: '♙',
  BK: '♚', BQ: '♛', BR: '♜', BB: '♝', BN: '♞', BP: '♟',
  // Helmbreaker Pieces
  WSE: '❖', // White Siege Engine
  BGR: '♜', // Black Guard Rook (re-using Rook)
  BFK: '♚', // Black Fortress King
};
