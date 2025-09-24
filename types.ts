export interface BoardState {
  [key: string]: string; // e.g., 'W', 'B', 'WP' (White Pawn), 'BR' (Black Rook)
}

export interface GameMeta {
  ply?: number;
  activeSquares?: { [key: string]: boolean };
  // Lambda Protocol
  planes?: {
    mind: BoardState;
    body: BoardState;
    spirit: BoardState;
  };
  currentPlane?: 'mind' | 'body' | 'spirit';
  resources?: {
    white: number;
    black: number;
  };
  // Helmbreaker
  turnLimit?: number;
  fortifications?: { [key: string]: number }; // squareId -> health
  reinforcements?: number;
  [key: string]: any;
}

export interface GameState {
  board: BoardState;
  meta: GameMeta;
}

export type GameMode = 'leviathan' | 'chess' | 'lambda' | 'helmbreaker' | 'rite';

export interface LegalMove {
  to: string;
  type: 'move' | 'capture';
}

export type Player = 'W' | 'B';

export type MovePair = { white: string; black: string };

export type Essence = {
  white: number;
  black: number;
};

export type VictoryState = {
  winner: 'W' | 'B' | 'draw';
  reason: string;
} | null;
