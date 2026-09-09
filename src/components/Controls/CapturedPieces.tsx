import React from 'react';
import { Chess, PieceSymbol } from 'chess.js';
import { ChessPiece } from '../Board/ChessPieces';
import { PlayerColor } from '../../types/chess';

interface CapturedPiecesProps {
  game: Chess;
  forColor: PlayerColor;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Order for displaying captured pieces (highest value first, like Chess.com/Lichess)
const DISPLAY_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ game, forColor }) => {
  const board = game.board();
  const startingCounts: Record<PieceSymbol, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1,
  };

  const currentWhite: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const currentBlack: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.color === 'w') currentWhite[p.type]++;
      else currentBlack[p.type]++;
    }
  }

  // Pieces captured by White (lost by Black)
  const capturedByWhite: PieceSymbol[] = [];
  // Pieces captured by Black (lost by White)
  const capturedByBlack: PieceSymbol[] = [];

  let whiteMaterial = 0;
  let blackMaterial = 0;

  DISPLAY_ORDER.forEach((type) => {
    const whiteLost = Math.max(0, startingCounts[type] - currentWhite[type]);
    for (let i = 0; i < whiteLost; i++) capturedByBlack.push(type);

    const blackLost = Math.max(0, startingCounts[type] - currentBlack[type]);
    for (let i = 0; i < blackLost; i++) capturedByWhite.push(type);

    whiteMaterial += currentWhite[type] * PIECE_VALUES[type];
    blackMaterial += currentBlack[type] * PIECE_VALUES[type];
  });

  const captured = forColor === 'w' ? capturedByWhite : capturedByBlack;
  const oppColor: PlayerColor = forColor === 'w' ? 'b' : 'w';
  const diff = forColor === 'w' ? whiteMaterial - blackMaterial : blackMaterial - whiteMaterial;

  // Don't render anything if no pieces have been captured and no material advantage
  if (captured.length === 0 && diff <= 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono select-none px-2 py-0.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {captured.map((type, idx) => (
          <div key={idx} className="w-4 h-4 shrink-0 drop-shadow-sm">
            <ChessPiece type={type} color={oppColor} />
          </div>
        ))}
      </div>
      {diff > 0 && (
        <span className="text-emerald-400 font-bold text-[11px] leading-none ml-0.5">
          +{diff}
        </span>
      )}
    </div>
  );
};
