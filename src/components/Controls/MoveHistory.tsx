import React, { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Check,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MoveEvaluation } from '../../types/chess';
import { MOVE_QUALITY_MAP } from '../../engine/explanationEngine';

interface MoveHistoryProps {
  history: string[];
  moveEvaluations: MoveEvaluation[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  onCopyPgn?: () => Promise<boolean>;
  onCopyFen?: () => Promise<boolean>;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  moveEvaluations,
  currentMoveIndex,
  onSelectMove,
  onCopyPgn,
  onCopyFen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  const handleCopyPgn = async () => {
    if (!onCopyPgn) return;
    const ok = await onCopyPgn();
    if (ok) {
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  };

  const handleCopyFen = async () => {
    if (!onCopyFen) return;
    const ok = await onCopyFen();
    if (ok) {
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    }
  };

  // Group moves into pairs (White & Black)
  const pairs: Array<{
    num: number;
    white: { san: string; index: number; eval?: MoveEvaluation };
    black?: { san: string; index: number; eval?: MoveEvaluation };
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    const num = Math.floor(i / 2) + 1;
    const whiteEval = moveEvaluations[i];
    const blackEval = moveEvaluations[i + 1];

    pairs.push({
      num,
      white: { san: history[i], index: i, eval: whiteEval },
      black: history[i + 1] ? { san: history[i + 1], index: i + 1, eval: blackEval } : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#181e29] border border-slate-700/80 rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#222b3c] border-b border-slate-700">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Storico Mosse
        </h4>
        <div className="flex items-center gap-1.5">
          {onCopyPgn && (
            <button
              onClick={handleCopyPgn}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
              title="Copia PGN"
            >
              {copiedPgn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPgn ? 'Copiato!' : 'PGN'}</span>
            </button>
          )}

          {onCopyFen && (
            <button
              onClick={handleCopyFen}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
              title="Copia FEN"
            >
              {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedFen ? 'Copiato!' : 'FEN'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Move list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs min-h-[200px] scrollbar-thin scrollbar-thumb-slate-700"
      >
        {pairs.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs italic font-sans">
            Nessuna mossa giocata. Fai la prima mossa sulla scacchiera!
          </div>
        ) : (
          pairs.map((p) => (
            <div
              key={p.num}
              className="flex items-center rounded hover:bg-slate-800/60 transition-colors px-2 py-1"
            >
              <span className="w-8 text-slate-500 font-semibold">{p.num}.</span>

              <button
                onClick={() => onSelectMove(p.white.index)}
                className={`flex-1 flex items-center justify-between px-2 py-0.5 rounded transition-all ${
                  currentMoveIndex === p.white.index
                    ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>{p.white.san}</span>
                {p.white.eval && (
                  <span
                    className="text-[10px] ml-1 select-none"
                    title={MOVE_QUALITY_MAP[p.white.eval.quality]?.label}
                  >
                    {MOVE_QUALITY_MAP[p.white.eval.quality]?.badge}
                  </span>
                )}
              </button>

              {p.black ? (
                <button
                  onClick={() => onSelectMove(p.black!.index)}
                  className={`flex-1 flex items-center justify-between px-2 py-0.5 rounded transition-all ml-1 ${
                    currentMoveIndex === p.black.index
                      ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{p.black.san}</span>
                  {p.black.eval && (
                    <span
                      className="text-[10px] ml-1 select-none"
                      title={MOVE_QUALITY_MAP[p.black.eval.quality]?.label}
                    >
                      {MOVE_QUALITY_MAP[p.black.eval.quality]?.badge}
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex-1 ml-1" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons (QoL Feature) */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1c2433] border-t border-slate-700/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectMove(-2)}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Inizio partita (posizione iniziale)"
          >
            <ChevronFirst className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectMove(currentMoveIndex === -2 ? -2 : Math.max(-2, currentMoveIndex - 1))}
            disabled={history.length === 0 || currentMoveIndex === -2}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Mossa precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (currentMoveIndex === -2) {
                onSelectMove(0);
              } else {
                onSelectMove(Math.min(history.length - 1, currentMoveIndex + 1));
              }
            }}
            disabled={history.length === 0 || (currentMoveIndex >= history.length - 1 && currentMoveIndex !== -2)}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Mossa successiva"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectMove(history.length - 1)}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
            title="Ultima mossa (diretta)"
          >
            <ChevronLast className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          {history.length > 0 ? (
            <span>
              {currentMoveIndex === -2
                ? 'Posizione iniziale'
                : `Mossa ${currentMoveIndex >= 0 ? currentMoveIndex + 1 : history.length}/${history.length}`}
            </span>
          ) : (
            <span>0 mosse</span>
          )}
        </div>
      </div>
    </div>
  );
};
