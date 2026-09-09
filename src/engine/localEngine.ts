import { Chess, Move } from 'chess.js';

// Piece-Square Tables (from White's perspective)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-20,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

const PIECE_VALS = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export class LocalChessEngine {
  /**
   * Valuta la posizione statica (in centopedoni dal punto di vista del Bianco)
   */
  public evaluate(game: Chess): number {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -20000 : 20000;
    }
    if (game.isDraw()) {
      return 0;
    }

    let score = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALS[piece.type];
        const idx = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;

        let pst = 0;
        switch (piece.type) {
          case 'p': pst = PAWN_TABLE[idx]; break;
          case 'n': pst = KNIGHT_TABLE[idx]; break;
          case 'b': pst = BISHOP_TABLE[idx]; break;
          case 'r': pst = ROOK_TABLE[idx]; break;
          case 'q': pst = QUEEN_TABLE[idx]; break;
          case 'k': pst = KING_TABLE_MID[idx]; break;
        }

        const total = val + pst;
        score += piece.color === 'w' ? total : -total;
      }
    }

    return score;
  }

  /**
   * Ricerca Alpha-Beta con quiescenza per trovare la mossa migliore e la valutazione
   */
  public searchBestMove(
    game: Chess,
    depth: number
  ): { bestMove: Move | null; score: number; pv: string[] } {
    const isWhite = game.turn() === 'w';
    let bestScore = isWhite ? -Infinity : Infinity;
    let bestMove: Move | null = null;
    let pv: string[] = [];

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      return { bestMove: null, score: this.evaluate(game), pv: [] };
    }

    // Sort moves: captures and checks first (Move ordering)
    moves.sort((a, b) => {
      const aVal = (a.captured ? PIECE_VALS[a.captured] : 0) + (a.san.includes('+') ? 50 : 0);
      const bVal = (b.captured ? PIECE_VALS[b.captured] : 0) + (b.san.includes('+') ? 50 : 0);
      return bVal - aVal;
    });

    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      game.move(move);
      const score = this.minimax(game, depth - 1, alpha, beta, !isWhite);
      game.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
          pv = [move.from + move.to + (move.promotion || '')];
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
          pv = [move.from + move.to + (move.promotion || '')];
        }
        beta = Math.min(beta, bestScore);
      }

      if (beta <= alpha) break;
    }

    return { bestMove, score: bestScore, pv };
  }

  private minimax(
    game: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth <= 0) {
      return this.quiescence(game, alpha, beta, isMaximizing, 2);
    }
    if (game.isGameOver()) {
      return this.evaluate(game);
    }

    const moves = game.moves({ verbose: true });
    // Move ordering
    moves.sort((a, b) => {
      const aVal = a.captured ? PIECE_VALS[a.captured] : 0;
      const bVal = b.captured ? PIECE_VALS[b.captured] : 0;
      return bVal - aVal;
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = this.minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private quiescence(
    game: Chess,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    qDepth: number
  ): number {
    const standPat = this.evaluate(game);
    if (qDepth <= 0 || game.isGameOver()) {
      return standPat;
    }

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (alpha < standPat) alpha = standPat;

      const captureMoves = game.moves({ verbose: true }).filter(m => m.captured);
      captureMoves.sort((a, b) => (b.captured ? PIECE_VALS[b.captured] : 0) - (a.captured ? PIECE_VALS[a.captured] : 0));

      for (const move of captureMoves) {
        game.move(move);
        const score = this.quiescence(game, alpha, beta, false, qDepth - 1);
        game.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      if (standPat <= alpha) return alpha;
      if (beta > standPat) beta = standPat;

      const captureMoves = game.moves({ verbose: true }).filter(m => m.captured);
      captureMoves.sort((a, b) => (b.captured ? PIECE_VALS[b.captured] : 0) - (a.captured ? PIECE_VALS[a.captured] : 0));

      for (const move of captureMoves) {
        game.move(move);
        const score = this.quiescence(game, alpha, beta, true, qDepth - 1);
        game.undo();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }
}

export const localEngine = new LocalChessEngine();
