import React, { useState, useRef, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Move } from 'chess.js';
import { PlayerColor } from '../../types/chess';
import { ChessPiece } from './ChessPieces';
import { MoveArrows } from './MoveArrows';
import { PromotionModal } from './PromotionModal';

interface ArrowDef {
  from: string;
  to: string;
  color?: string;
  opacity?: number;
  width?: number;
}

interface ChessBoardProps {
  game: Chess;
  orientation: PlayerColor;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  disabled?: boolean;
  lastMove?: { from: Square; to: Square } | null;
  hintSquare?: { from: string; to: string } | null;
  arrows?: ArrowDef[];
  theme?: 'tournament' | 'classic' | 'slate';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation,
  onMove,
  disabled = false,
  lastMove = null,
  hintSquare = null,
  arrows = [],
  theme = 'tournament',
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Clear selection if turn changes or board resets
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.fen()]);

  // Color schemes
  const colorThemes = {
    tournament: {
      light: '#eeeed2',
      dark: '#769656',
      lightText: '#769656',
      darkText: '#eeeed2',
    },
    classic: {
      light: '#f0d9b5',
      dark: '#b58863',
      lightText: '#b58863',
      darkText: '#f0d9b5',
    },
    slate: {
      light: '#e2e8f0',
      dark: '#475569',
      lightText: '#475569',
      darkText: '#e2e8f0',
    },
  };

  const currentTheme = colorThemes[theme];

  // Generate board grid according to orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  // Check if king is in check
  const inCheck = game.inCheck();
  let kingSquare: Square | null = null;
  if (inCheck) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          kingSquare = `${files[c]}${ranks[r]}` as Square;
        }
      }
    }
  }

  // Handle square tap/click (essential for mobile!)
  const handleSquareClick = (sq: Square) => {
    if (disabled) return;

    const piece = game.get(sq);
    const turn = game.turn();

    // 1. If a square is already selected, check if clicked square is a legal destination
    if (selectedSquare) {
      const isLegal = legalMoves.some((m) => m.to === sq);

      if (isLegal) {
        // Check for promotion (pawn moving to 8th or 1st rank)
        const selectedPiece = game.get(selectedSquare);
        const isPromotion =
          selectedPiece &&
          selectedPiece.type === 'p' &&
          (sq.endsWith('8') || sq.endsWith('1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          return;
        }

        // Execute regular move
        const success = onMove(selectedSquare, sq);
        if (success) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      }

      // If clicked on another piece of own color, switch selection
      if (piece && piece.color === turn) {
        setSelectedSquare(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setLegalMoves(moves);
        return;
      }

      // Otherwise cancel selection
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // 2. No piece currently selected: select if piece belongs to side to move
    if (piece && piece.color === turn) {
      setSelectedSquare(sq);
      const moves = game.moves({ square: sq, verbose: true });
      setLegalMoves(moves);
    }
  };

  const handlePromotionSelect = (prom: PieceSymbol) => {
    if (!pendingPromotion) return;
    onMove(pendingPromotion.from, pendingPromotion.to, prom);
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  return (
    <div className="relative w-full h-full aspect-square rounded-2xl overflow-hidden shadow-board border-4 border-[#2b364c] bg-[#1a202c]">
      {/* Grid of 64 squares */}
      <div ref={boardRef} className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, cIdx) => {
            const sq = `${file}${rank}` as Square;
            const piece = game.get(sq);
            const isLight = (rIdx + cIdx) % 2 === 0;

            const isSelected = selectedSquare === sq;
            const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isHint = hintSquare && (hintSquare.from === sq || hintSquare.to === sq);
            const isKingInCheck = kingSquare === sq;

            // Check if this square is a legal destination
            const legalMove = legalMoves.find((m) => m.to === sq);
            const isLegalDestination = !!legalMove;
            const isCapture = legalMove && (!!piece || legalMove.flags.includes('e'));

            // Background color logic
            let squareBg = isLight ? currentTheme.light : currentTheme.dark;

            return (
              <div
                key={sq}
                onClick={() => handleSquareClick(sq)}
                style={{ backgroundColor: squareBg }}
                className="relative flex items-center justify-center cursor-pointer transition-colors duration-150 select-none overflow-hidden"
              >
                {/* Last move highlight */}
                {isLastMove && (
                  <div className="absolute inset-0 bg-amber-400/35 pointer-events-none" />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-emerald-400/45 ring-2 ring-emerald-500 ring-inset pointer-events-none" />
                )}

                {/* Hint highlight */}
                {isHint && (
                  <div className="absolute inset-0 bg-teal-400/40 animate-pulse pointer-events-none" />
                )}

                {/* King in check red glow */}
                {isKingInCheck && (
                  <div className="absolute inset-0 bg-rose-600/60 ring-2 ring-rose-500 animate-pulse pointer-events-none" />
                )}

                {/* Algebraic Coordinates */}
                {/* Rank number on the leftmost column */}
                {cIdx === 0 && (
                  <span
                    className="absolute top-1 left-1 text-[10px] md:text-[11px] font-bold pointer-events-none leading-none select-none"
                    style={{ color: isLight ? currentTheme.lightText : currentTheme.darkText }}
                  >
                    {rank}
                  </span>
                )}
                {/* File letter on the bottommost row */}
                {rIdx === 7 && (
                  <span
                    className="absolute bottom-1 right-1 text-[10px] md:text-[11px] font-bold pointer-events-none leading-none select-none"
                    style={{ color: isLight ? currentTheme.lightText : currentTheme.darkText }}
                  >
                    {file}
                  </span>
                )}

                {/* Piece rendering */}
                {piece && (
                  <div className="w-[85%] h-[85%] relative z-10 transition-transform active:scale-95 drop-shadow-md">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move Indicator Dots */}
                {isLegalDestination && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {isCapture ? (
                      // Capture ring
                      <div className="w-[80%] h-[80%] rounded-full border-4 border-emerald-500/70 animate-scale-up" />
                    ) : (
                      // Move dot
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-emerald-500/75 shadow-sm" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Arrows Overlay */}
      <MoveArrows arrows={arrows} orientation={orientation} />

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={game.turn()}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
};
