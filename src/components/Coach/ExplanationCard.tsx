import React, { useState } from 'react';
import { Swords, Brain, ArrowRight, Lightbulb, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
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
}) => {
  const [activeTab, setActiveTab] = useState<'tactical' | 'conceptual'>('tactical');

  return (
    <div className="bg-[#1e293b]/95 border border-slate-700/80 rounded-2xl p-4 md:p-5 shadow-card backdrop-blur-sm transition-all animate-fade-in text-slate-200">
      {/* Top bar with move and badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            {isHint ? 'Mossa Consigliata' : 'Revisione Mossa'}
          </span>
          <MoveBadge quality={quality} san={san} diffCp={diffCp} size="sm" />
        </div>

        {evalScore !== undefined && (
          <div className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            Val: {evalScore > 0 ? `+${(evalScore / 100).toFixed(1)}` : (evalScore / 100).toFixed(1)}
          </div>
        )}
      </div>

      {/* Dual Tab Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/70 rounded-xl mb-4 border border-slate-800">
        <button
          onClick={() => setActiveTab('tactical')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'tactical'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>A livello di Mosse</span>
        </button>

        <button
          onClick={() => setActiveTab('conceptual')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === 'conceptual'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>A livello Concettuale</span>
        </button>
      </div>

      {/* Tab Content: Tactical (Mosse & Calcolo) */}
      {activeTab === 'tactical' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">
                Logica Tattica e Calcolo Concreto
              </h4>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                {tacticalExplanation}
              </p>
            </div>
          </div>

          {/* Continuation sequence */}
          {continuationLine && continuationLine.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Sequenza di continuazione calcolata dal motore:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {continuationLine.map((move, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        idx === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {move}
                    </span>
                    {idx < continuationLine.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Threats warning if present */}
          {threats && (
            <div className="flex items-center gap-2 text-xs text-amber-300 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{threats}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Conceptual (Principi Strategici) */}
      {activeTab === 'conceptual' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
                Principio Posizionale e Strategia
              </h4>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                {conceptualExplanation}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Comprendere il principio ti permette di trovare la mossa corretta non solo in questa posizione, ma in tutte le strutture simili che incontrerai in futuro.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
