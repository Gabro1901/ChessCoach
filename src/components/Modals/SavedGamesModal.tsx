import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Download,
  Trash2,
  Play,
  Plus,
  Calendar,
  Award,
  Check,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { SavedGame } from '../../types/chess';
import { gameStorageService } from '../../engine/gameStorageService';

interface SavedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGame: (game: SavedGame) => void;
  onSaveCurrentGame: (title?: string) => SavedGame;
  currentGameMoveCount: number;
}

export const SavedGamesModal: React.FC<SavedGamesModalProps> = ({
  isOpen,
  onClose,
  onLoadGame,
  onSaveCurrentGame,
  currentGameMoveCount,
}) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshList = () => {
    setGames(gameStorageService.getSavedGames());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setJustSaved(false);
      setDeleteConfirmId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    onSaveCurrentGame(saveTitle.trim() || undefined);
    setSaveTitle('');
    setJustSaved(true);
    refreshList();
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleDelete = (id: string) => {
    gameStorageService.deleteGame(id);
    setDeleteConfirmId(null);
    refreshList();
  };

  const handleExport = (g: SavedGame, e: React.MouseEvent) => {
    e.stopPropagation();
    gameStorageService.exportPgn(g);
  };

  const getResultBadge = (result: SavedGame['result']) => {
    switch (result) {
      case 'win':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Vittoria
          </span>
        );
      case 'loss':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Sconfitta
          </span>
        );
      case 'draw':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Patta
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/60">
            In corso
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#141a24] border border-slate-700 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Partite Salvate & Revisioni</h3>
              <p className="text-xs text-slate-400">
                Rivedi mosse, spiegazioni dell'Istruttore e prova varianti alternative
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Save Current Game Section */}
        <div className="p-3.5 bg-[#1a2332] border border-slate-800 rounded-2xl mb-4 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Salva la partita in corso ({currentGameMoveCount} mosse)
            </span>
            {justSaved && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Salvata con successo!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nome personalizzato (es: Difesa Francese, Partita 1...)"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              disabled={currentGameMoveCount === 0}
              className="flex-1 bg-[#10151f] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 disabled:opacity-40"
            />
            <button
              onClick={handleSaveCurrent}
              disabled={currentGameMoveCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-30 text-white text-xs font-bold transition-all shadow shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Salva Ora</span>
            </button>
          </div>
        </div>

        {/* Games List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700 min-h-[220px]">
          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-600" />
              <p className="text-xs sm:text-sm font-medium">Nessuna partita salvata al momento.</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Gioca o importa una partita, poi salvala per poterla revisionare mossa per mossa o creare linee alternative!
              </p>
            </div>
          ) : (
            games.map((g) => (
              <div
                key={g.id}
                className="p-3.5 bg-[#18202d] hover:bg-[#1b2535] border border-slate-800 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Game Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">
                      {g.title}
                    </h4>
                    {getResultBadge(g.result)}
                    {g.source === 'imported' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Importata
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {g.formattedDate || 'Recente'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-500" />
                      {g.opponentName} ({g.opponentElo} ELO)
                    </span>
                    <span className="text-slate-500">
                      • {g.moveCount} mosse
                    </span>
                    <span className="text-slate-500">
                      • Tu ({g.playerColor === 'w' ? 'Bianco ♔' : 'Nero ♚'})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onLoadGame(g);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow shadow-emerald-950"
                    title="Carica sulla scacchiera e revisiona"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Revisiona</span>
                  </button>

                  <button
                    onClick={(e) => handleExport(g, e)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Scarica file PGN"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === g.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all"
                      >
                        Conferma
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-[10px]"
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(g.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                      title="Elimina partita salvata"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
