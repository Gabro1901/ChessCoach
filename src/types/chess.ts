export type PlayerColor = 'w' | 'b';

export type MoveQuality = 
  | 'brilliant'   // 💎 !! (Sacrificio vincente o mossa straordinaria)
  | 'best'        // ⭐ Migliore mossa calcolata dal motore
  | 'excellent'   // ✨ Ottima (quasi pari alla migliore)
  | 'good'        // 👍 Buona (mantiene la posizione)
  | 'inaccuracy'  // ⚠️ Imprecisione (perde 50-120 centopedoni)
  | 'mistake'     // ❌ Errore (perde 120-250 centopedoni)
  | 'blunder'     // 💥 Grave errore / Blunder (>250 cp o perde materiale)
  | 'missed_win'  // 🎯 Vittoria mancata (aveva matto o vantaggio decisivo)
  | 'book';       // 📖 Mossa di teoria d'apertura

export interface MoveQualityInfo {
  quality: MoveQuality;
  label: string;
  badge: string;
  symbol: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
}

export interface EngineLevel {
  id: number;
  name: string;
  elo: number;
  depth: number;
  skillLevel: number; // 0 - 20 UCI Skill Level
  moveTimeMs: number;
  description: string;
  avatar: string;
}

export interface MoveEvaluation {
  moveNumber: number;
  color: PlayerColor;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  scoreBefore: number; // in centipawns from White's perspective
  scoreAfter: number;
  scoreDiff: number;   // delta from player's perspective
  mate?: number | null;
  bestMoveSan?: string;
  bestMoveUci?: string;
  quality: MoveQuality;
  tacticalExplanation: string;
  conceptualExplanation: string;
  continuationLine: string[];
  threatsDescription?: string;
}

export interface HintData {
  level: 1 | 2; // 1 = Indizio concettuale, 2 = Mossa completa
  conceptHint: string;
  bestMoveSan: string;
  bestMoveUci: string;
  from: string;
  to: string;
  tacticalExplanation: string;
  conceptualExplanation: string;
  continuationLine: string[];
  evalScore: number;
}

export interface PositionAnalysis {
  fen: string;
  score: number; // centipawns from White's perspective
  mate: number | null;
  depth: number;
  bestMoveUci: string;
  bestMoveSan: string;
  pv: string[]; // principal variation
  winChanceWhite: number; // 0 - 100
  isAnalyzing: boolean;
}

export interface GameStatus {
  isOver: boolean;
  winner: PlayerColor | 'draw' | null;
  reason: 'checkmate' | 'stalemate' | 'threefold' | 'insufficient_material' | 'fifty_moves' | 'resignation' | null;
  inCheck: boolean;
}

export interface SavedGame {
  id: string;
  title: string;
  date: string; // ISO string
  formattedDate: string;
  playerColor: PlayerColor;
  opponentName: string;
  opponentElo: number;
  result: 'win' | 'loss' | 'draw' | 'in_progress';
  resultDescription: string;
  moveCount: number;
  pgn: string;
  fen: string;
  history: string[]; // SAN moves
  moveEvaluations: MoveEvaluation[];
  source?: 'played' | 'imported';
}
