import type { GameState, GameMode, LegalMove } from '../types';

// Helper function to convert square ID to 0-7 coordinates [row, col]
const getCoords = (square: string): [number, number] => {
  const col = square.charCodeAt(0) - 'A'.charCodeAt(0);
  const row = 8 - parseInt(square.charAt(1));
  return [row, col];
};

// Helper function to convert 0-7 coordinates back to square ID
const getSquareId = (row: number, col: number): string | null => {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return `${String.fromCharCode('A'.charCodeAt(0) + col)}${8 - row}`;
};

// --- CHESS LOGIC ---
const getChessMoves = (square: string, piece: string, gameState: GameState): LegalMove[] => {
    const { board } = gameState;
    const moves: LegalMove[] = [];
    const [row, col] = getCoords(square);
    const pieceColor = piece.charAt(0);
    const opponentColor = pieceColor === 'W' ? 'B' : 'W';

    // Helper to check a potential move. Returns status to handle sliding pieces.
    const checkMove = (r: number, c: number): 'stop' | 'continue' | 'capture' => {
        const squareId = getSquareId(r, c);
        if (!squareId) return 'stop';
        const targetPiece = board[squareId];
        if (targetPiece) {
            if (targetPiece.startsWith(pieceColor)) {
                return 'stop'; // Blocked by own piece
            } else {
                moves.push({ to: squareId, type: 'capture' });
                return 'capture'; // Capture and stop sliding
            }
        }
        moves.push({ to: squareId, type: 'move' });
        return 'continue'; // Empty square, can continue sliding
    };
    
    const pieceType = piece.charAt(1);

    switch (pieceType) {
        case 'P': // Pawn
            const direction = pieceColor === 'W' ? -1 : 1;
            const startRow = pieceColor === 'W' ? 6 : 1;
            // Forward 1
            const oneForward = getSquareId(row + direction, col);
            if (oneForward && !board[oneForward]) {
                moves.push({ to: oneForward, type: 'move' });
                // Forward 2 on first move
                const twoForward = getSquareId(row + 2 * direction, col);
                if (row === startRow && twoForward && !board[twoForward]) {
                    moves.push({ to: twoForward, type: 'move' });
                }
            }
            // Captures
            [-1, 1].forEach(c_offset => {
                const captureSquareId = getSquareId(row + direction, col + c_offset);
                if (captureSquareId && board[captureSquareId] && board[captureSquareId].startsWith(opponentColor)) {
                    moves.push({ to: captureSquareId, type: 'capture' });
                }
            });
            break;

        case 'R': // Rook
        case 'Q': // Queen (part 1)
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const status = checkMove(row + i * dr, col + i * dc);
                    if (status === 'stop' || status === 'capture') break;
                }
            });
            if (pieceType === 'R') break;
            // Fallthrough for Queen's diagonal moves

        case 'B': // Bishop
        case 'Q': // Queen (part 2)
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const status = checkMove(row + i * dr, col + i * dc);
                    if (status === 'stop' || status === 'capture') break;
                }
            });
            break;

        case 'N': // Knight
            [
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                [1, 2], [1, -2], [-1, 2], [-1, -2]
            ].forEach(([dr, dc]) => {
                checkMove(row + dr, col + dc); // Knight moves are always 'stop' or 'capture'
            });
            break;

        case 'K': // King
            [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ].forEach(([dr, dc]) => {
                checkMove(row + dr, col + dc);
            });
            break;
    }
    return moves;
};


// --- LEVIATHAN LOGIC ---
const getLeviathanMoves = (square: string, piece: string, gameState: GameState): LegalMove[] => {
    const { board } = gameState;
    const moves: LegalMove[] = [];
    const [row, col] = getCoords(square);
    const pieceColor = piece.charAt(0);
    const opponentColor = pieceColor === 'W' ? 'B' : 'W';
    const direction = pieceColor === 'W' ? -1 : 1; // W moves up (row decreases), B moves down (row increases)

    // Basic forward move & Momentum
    const forward1 = getSquareId(row + direction, col);
    if (forward1 && !board[forward1]) {
        const forward2 = getSquareId(row + 2 * direction, col);
        if (forward2 && !board[forward2]) {
            moves.push({ to: forward2, type: 'move' }); // Momentum move
        } else {
            moves.push({ to: forward1, type: 'move' }); // Basic move
        }
    }

    // Diagonal captures
    [-1, 1].forEach(c_offset => {
        const captureSquareId = getSquareId(row + direction, col + c_offset);
        if (captureSquareId && board[captureSquareId] && board[captureSquareId].startsWith(opponentColor)) {
            moves.push({ to: captureSquareId, type: 'capture' });
        }
    });

    return moves;
};

// --- EXPORTED FUNCTION ---
export const getLegalMoves = (square: string, piece: string, gameState: GameState, playerColor: 'W' | 'B', gameMode: GameMode): LegalMove[] => {
  // Can only move own pieces
  if (piece.charAt(0) !== playerColor) return [];

  const { meta } = gameState;

  switch (gameMode) {
    case 'chess':
      return getChessMoves(square, piece, gameState);
    case 'leviathan':
      return getLeviathanMoves(square, piece, gameState);
    case 'rite':
      const chessMoves = getChessMoves(square, piece, gameState);
      // Filter out moves to inactive squares
      if (!meta?.activeSquares) return chessMoves;
      return chessMoves.filter(move => meta.activeSquares?.[move.to] === true);
    case 'lambda':
    case 'helmbreaker':
      // Return empty array as rules are not implemented yet
      return [];
    default:
      return [];
  }
};
