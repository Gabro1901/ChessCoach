import React from 'react';
import { Lightbulb, Sparkles, Eye, Sliders, Zap } from 'lucide-react';
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
  onDismissHint?: () => void;
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
  onDismissHint,
  isHintRevealed,
  isEngineThinking,
  isPlayerTurn,
  onChangeLevel,
}) => {
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
          return 'Mossa eccellente! È la scelta consigliata dal motore di massima potenza.';
        case 'excellent':
          return 'Ottima giocata. Mantieni una pressione costante e coordina bene i pezzi.';
        case 'good':
          return 'Una mossa solida. La posizione resta equilibrata.';
        case 'inaccuracy':
          return 'Attenzione: piccola imprecisione. C\'era un piano più ambizioso a disposizione.';
        case 'mistake':
          return 'Un errore posizionale: l\'avversario ora può guadagnare iniziativa. Guarda l\'analisi qui sotto.';
        case 'blunder':
          return 'Grave svista! Questa mossa compromette la sicurezza o perde materiale.';
        case 'missed_win':
          return 'Vittoria mancata! C\'era una linea forzata. Analizziamola insieme!';
        default:
          return 'Continua così. Concentrati sul piano strategico a lungo termine.';
      }
    }

    return 'Sono il tuo istruttore in tempo reale. Gioca con calma o chiedi un consiglio se hai dubbi sul piano da seguire!';
  };

  return (
    <div className="flex flex-col gap-3 w-full text-slate-100">
      {/* 1. Header: Opponent & Engine Calibration (Compact row, no nested boxes) */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl select-none shrink-0">{currentLevel.avatar}</span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">{currentLevel.name}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0">
                {currentLevel.elo} ELO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate">{currentLevel.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onChangeLevel && (
            <button
              onClick={onChangeLevel}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
              title="Cambia livello o seleziona Stockfish personalizzato"
            >
              <Sliders className="w-3 h-3" />
              <span>Cambia</span>
            </button>
          )}
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{positionAnalysis ? `P.${positionAnalysis.depth}` : 'NNUE'}</span>
          </div>
        </div>
      </div>

      {/* 2. Coach Note / Speech */}
      <div className="py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">{getCoachSpeech()}</p>
      </div>

      {/* 3. Dynamic Center: Hint / Move Analysis / Call To Action */}
      <div className="flex flex-col justify-start gap-2.5">
        {/* CASE A: Full Hint Revealed */}
        {hintData && isHintRevealed && (
          <div className="animate-fade-in space-y-2">
            <ExplanationCard
              san={hintData.bestMoveSan}
              quality="best"
              evalScore={hintData.evalScore}
              tacticalExplanation={hintData.tacticalExplanation}
              conceptualExplanation={hintData.conceptualExplanation}
              continuationLine={hintData.continuationLine}
              isHint={true}
              onDismiss={onDismissHint}
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Mossa tracciata in verde sulla scacchiera
              </span>
              {onDismissHint && (
                <button
                  onClick={onDismissHint}
                  className="text-[10px] text-slate-400 hover:text-white font-semibold underline decoration-slate-600 transition-colors"
                >
                  Nascondi consiglio
                </button>
              )}
            </div>
          </div>
        )}

        {/* CASE B: Conceptual Hint (Step 1) */}
        {hintData && !isHintRevealed && (
          <div className="p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-2.5 animate-fade-in">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  Indizio Strategico (Pensa prima di svelare)
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  "{hintData.conceptHint}"
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playHint();
                onRevealHintMove();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Svela la mossa migliore e la spiegazione</span>
            </button>
          </div>
        )}

        {/* CASE C: Move Analysis (If no active hint) */}
        {!hintData && lastMoveEval && (
          <div className="space-y-2 animate-fade-in">
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

            {/* Quick action to ask hint for the NEXT move */}
            {isPlayerTurn && !isEngineThinking && (
              <button
                onClick={() => {
                  sounds.playHint();
                  onRequestHint();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold transition-all hover:text-white"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Chiedi consiglio per la prossima mossa</span>
              </button>
            )}
          </div>
        )}

        {/* CASE D: Initial or Idle State (Waiting for move or hint) */}
        {!hintData && !lastMoveEval && (
          <div className="flex flex-col items-center justify-center py-5 px-3 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white mb-0.5">Hai bisogno di un consiglio?</h5>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                L'istruttore Stockfish analizzerà la posizione spiegando la continuazione ideale, la tattica e la strategia.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playHint();
                onRequestHint();
              }}
              disabled={!isPlayerTurn || isEngineThinking}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>Chiedi Suggerimento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

