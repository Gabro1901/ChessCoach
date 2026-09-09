import React from 'react';
import { Swords, Brain, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { MoveBadge } from './MoveBadge';
import { MoveQuality } from '../../types/chess';

interface ExplanationCardProps {
  san: string;
  quality?: MoveQuality;
  diffCp?: number;
  evalScore?: number;
  tacticalExplanation: string;
  conceptualExplanation: string;
  continuationLine?: string[];
  threats?: string;
  onPreviewLine?: (moves: string[]) => void;
  isHint?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  san,
  quality = 'best',
  diffCp,
  evalScore,
  tacticalExplanation,
  conceptualExplanation,
  continuationLine = [],
  threats,
  isHint = false,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#1c2433]/90 border border-slate-700/70 rounded-2xl p-3.5 shadow-sm text-slate-200 transition-all animate-fade-in ${className}`}
    >
      {/* Header: Move & Quality badge + Eval + Optional Dismiss */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {isHint ? 'Consiglio' : 'Analisi'}
          </span>
          <MoveBadge quality={quality} san={san} diffCp={diffCp} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          {evalScore !== undefined && (
            <div className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-emerald-400">
              {evalScore > 0 ? `+${(evalScore / 100).toFixed(1)}` : (evalScore / 100).toFixed(1)}
            </div>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Chiudi consiglio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unified Explanations (No nested cards, no tabs) */}
      <div className="space-y-2.5 text-xs">
        {/* 1. Tactical line */}
        <div className="flex items-start gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-emerald-400 mr-1.5">Tattica:</span>
            <span className="text-slate-200 leading-relaxed">{tacticalExplanation}</span>
          </div>
        </div>

        {/* 2. Continuation chips */}
        {continuationLine && continuationLine.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 pl-6 font-mono text-[11px] scrollbar-none">
            {continuationLine.slice(0, 5).map((move, idx) => (
              <React.Fragment key={idx}>
                <span
                  className={`px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${
                    idx === 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {move}
                </span>
                {idx < Math.min(continuationLine.length - 1, 4) && (
                  <ArrowRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 3. Strategic / Conceptual Idea */}
        <div className="flex items-start gap-2 pt-2 border-t border-slate-700/40">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-amber-400 mr-1.5">Strategia:</span>
            <span className="text-slate-300 leading-relaxed">{conceptualExplanation}</span>
          </div>
        </div>

        {/* 4. Threat warning if any */}
        {threats && (
          <div className="flex items-center gap-2 text-[11px] text-rose-300 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{threats}</span>
          </div>
        )}
      </div>
    </div>
  );
};

