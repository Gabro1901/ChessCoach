import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPieces';

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onCancel }) => {
  const pieces: Array<{ type: PieceSymbol; label: string }> = [
    { type: 'q', label: 'Donna' },
    { type: 'r', label: 'Torre' },
    { type: 'b', label: 'Alfiere' },
    { type: 'n', label: 'Cavallo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-xs w-full text-center">
        <h3 className="text-lg font-bold text-white mb-1">Promozione del Pedone</h3>
        <p className="text-xs text-slate-400 mb-5">Scegli il pezzo per completare l'avanzata</p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {pieces.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 group"
            >
              <div className="w-12 h-12 mb-1 drop-shadow-md group-hover:drop-shadow-lg">
                <ChessPiece type={type} color={color} />
              </div>
              <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-400">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white underline transition-colors"
        >
          Annulla mossa
        </button>
      </div>
    </div>
  );
};
