import React, { useState } from 'react';
import { Lightbulb, Sparkles, Eye, HelpCircle, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { EngineLevel, MoveEvaluation, HintData, PositionAnalysis } from '../../types/chess';
import { ExplanationCard } from './ExplanationCard';
import { sounds } from '../../engine/soundService';

interface CoachPanelProps {
  currentLevel: EngineLevel;
  lastMoveEval: MoveEvaluation | null;
  hintData: HintData | null;
  positionAnalysis: PositionAnalysis | null;
  onRequestHint: () => void;
  onRevealHintMove: () => void;
  isHintRevealed: boolean;
  isEngineThinking: boolean;
  isPlayerTurn: boolean;
  onChangeLevel?: () => void;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  currentLevel,
  lastMoveEval,
  hintData,
  positionAnalysis,
  onRequestHint,
  onRevealHintMove,
  isHintRevealed,
  isEngineThinking,
  isPlayerTurn,
  onChangeLevel,
}) => {
  const [showFullReview, setShowFullReview] = useState<boolean>(true);

  // Determine coach speech / mood
  const getCoachSpeech = () => {
    if (isEngineThinking) {
      return `${currentLevel.name} sta calcolando la prossima mossa...`;
    }

    if (lastMoveEval) {
      switch (lastMoveEval.quality) {
        case 'brilliant':
          return 'Fantastico! Hai trovato una risorsa brillante degna di un Grande Maestro!';
        case 'best':
          return 'Mossa eccellente! È esattamente la scelta suggerita dal motore di massima potenza.';
        case 'excellent':
          return 'Ottima giocata. Mantieni una pressione costante e coordinate bene i pezzi.';
        case 'good':
          return 'Una mossa solida. La posizione resta equilibrata.';
        case 'inaccuracy':
          return 'Attenzione: una piccola imprecisione. C\'era un piano più ambizioso a disposizione.';
        case 'mistake':
          return 'Un errore posizionale: l\'avversario ora può guadagnare iniziativa. Guarda la spiegazione qui sotto.';
        case 'blunder':
          return 'Grave svista! Questa mossa compromette la sicurezza o perde materiale. Vediamo perché.';
        case 'missed_win':
          return 'Vittoria mancata! C\'era una linea vincente forzata. Non scoraggiarti, analizziamola insieme!';
        default:
          return 'Continua così. Concentrati sul piano strategico a lungo termine.';
      }
    }

    return 'Sono il tuo istruttore in tempo reale. Gioca con calma e clicca su "Suggerimento" se hai dubbi sul piano da seguire!';
  };

  return (
    <div className="flex flex-col gap-4 w-full text-slate-100">
      {/* Instructor Avatar Card */}
      <div className="bg-[#181e29] border border-slate-700/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {currentLevel.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h3 className="font-bold text-base text-white truncate">{currentLevel.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap shrink-0">
                {currentLevel.elo} ELO
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{currentLevel.description}</p>
            {onChangeLevel && (
              <button
                onClick={onChangeLevel}
                className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition-colors"
                title="Cambia livello o seleziona Stockfish personalizzato"
              >
                <Sliders className="w-3 h-3" />
                <span>Cambia Livello</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Analysis Engine Status Indicator */}
        <div className="hidden sm:flex flex-col items-end shrink-0 pl-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Stockfish Max</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {positionAnalysis ? `Profondità ${positionAnalysis.depth}` : 'In attesa'}
          </span>
        </div>
      </div>

      {/* Coach Speech Bubble */}
      <div className="relative bg-[#222b3c] border border-slate-700/90 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
              Feedback dell'Istruttore
            </h4>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
              {getCoachSpeech()}
            </p>
          </div>
        </div>
      </div>

      {/* HINT BUTTON & HINT CONTAINER */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">Chiedi un Consiglio</h4>
          </div>

          <button
            onClick={() => {
              sounds.playHint();
              onRequestHint();
            }}
            disabled={!isPlayerTurn || isEngineThinking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
              isPlayerTurn && !isEngineThinking
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggerimento</span>
          </button>
        </div>

        {/* Level 1 Hint: Conceptual Indizio */}
        {hintData && !isHintRevealed && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 animate-fade-in space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">💡</span>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Indizio Concettuale (Pensa prima di svelare):
                </span>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  "{hintData.conceptHint}"
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playHint();
                onRevealHintMove();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all hover:scale-[1.01] active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Svela la mossa migliore e la spiegazione completa</span>
            </button>
          </div>
        )}

        {/* Level 2 Hint: Full Move & Dual Explanation */}
        {hintData && isHintRevealed && (
          <div className="animate-fade-in mt-2">
            <ExplanationCard
              san={hintData.bestMoveSan}
              quality="best"
              evalScore={hintData.evalScore}
              tacticalExplanation={hintData.tacticalExplanation}
              conceptualExplanation={hintData.conceptualExplanation}
              continuationLine={hintData.continuationLine}
              isHint={true}
            />
          </div>
        )}

        {!hintData && (
          <p className="text-xs text-slate-400">
            Se ti trovi in difficoltà o vuoi capire la strategia ideale per questa posizione, clicca su Suggerimento.
          </p>
        )}
      </div>

      {/* MOVE REVIEW CARD (Shows after player makes a move) */}
      {lastMoveEval && (
        <div className="space-y-2">
          <div
            onClick={() => setShowFullReview(!showFullReview)}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                Analisi Ultima Mossa: <span className="font-mono text-white">{lastMoveEval.san}</span>
              </span>
            </div>
            <button className="text-slate-400 hover:text-white">
              {showFullReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFullReview && (
            <ExplanationCard
              san={lastMoveEval.san}
              quality={lastMoveEval.quality}
              diffCp={lastMoveEval.scoreDiff}
              evalScore={lastMoveEval.scoreAfter}
              tacticalExplanation={lastMoveEval.tacticalExplanation}
              conceptualExplanation={lastMoveEval.conceptualExplanation}
              continuationLine={lastMoveEval.continuationLine}
              threats={lastMoveEval.threatsDescription}
            />
          )}
        </div>
      )}
    </div>
  );
};
