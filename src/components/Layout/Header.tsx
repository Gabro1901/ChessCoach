import React from 'react';
import { Crown, Volume2, VolumeX, RotateCcw, Info, FolderOpen, Upload } from 'lucide-react';
import { GameStatus, PlayerColor } from '../../types/chess';

interface HeaderProps {
  gameStatus: GameStatus;
  turn: PlayerColor;
  playerColor: PlayerColor;
  isEngineThinking: boolean;
  onNewGame: () => void;
  onOpenInfo: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSaved?: () => void;
  onOpenImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameStatus,
  playerColor,
  onNewGame,
  onOpenInfo,
  soundEnabled,
  onToggleSound,
  onOpenSaved,
  onOpenImport,
}) => {
  const getStatusBadge = () => {
    if (gameStatus.isOver) {
      if (gameStatus.winner === 'draw') {
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Partita Patta ({gameStatus.reason})
          </span>
        );
      }
      const playerWon = gameStatus.winner === playerColor;
      return (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            playerWon
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {playerWon ? '🎉 Vittoria per Scacco Matto!' : 'Sconfitta per Scacco Matto'}
        </span>
      );
    }

    if (gameStatus.inCheck) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
          ⚠️ Sotto Scacco!
        </span>
      );
    }

    return null;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 px-3 py-1.5 sm:px-4 sm:py-2.5 shrink-0 pt-[max(0.375rem,env(safe-area-inset-top,0px))]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white">
                Chess Coach AI
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                StockFish 16+
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-normal">
              Partite con Istruttore & Spiegazione Tattico-Concettuale
            </p>
          </div>
        </div>

        {/* Center Status */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Right quick actions */}
        <div className="flex items-center gap-1.5">
          {onOpenSaved && (
            <button
              onClick={onOpenSaved}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold"
              title="Partite Salvate & Revisione"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Partite</span>
            </button>
          )}

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold"
              title="Importa Partita (PGN / FEN)"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Importa</span>
            </button>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={soundEnabled ? 'Disattiva Suoni' : 'Attiva Suoni'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Come funziona l'Istruttore"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onNewGame}
            className="hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuova Partita</span>
          </button>
        </div>
      </div>
    </header>
  );
};
