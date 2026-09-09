import React, { useState, useEffect, useMemo } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { useChessGame } from './hooks/useChessGame';
import { ChessBoard } from './components/Board/ChessBoard';
import { EvalBar } from './components/Board/EvalBar';
import { CoachPanel } from './components/Coach/CoachPanel';
import { MoveHistory } from './components/Controls/MoveHistory';
import { CapturedPieces } from './components/Controls/CapturedPieces';
import { GameSettings } from './components/Controls/GameSettings';
import { Header } from './components/Layout/Header';
import { SlideSheet } from './components/Layout/SlideSheet';
import { InfoModal } from './components/Coach/InfoModal';
import { ExplanationCard } from './components/Coach/ExplanationCard';
import { SavedGamesModal } from './components/Modals/SavedGamesModal';
import { ImportGameModal } from './components/Modals/ImportGameModal';
import {
  Undo2,
  Lightbulb,
  Sparkles,
  ScrollText,
  SlidersHorizontal,
  RotateCcw,
  Brain,
  ChevronLast,
} from 'lucide-react';
import { sounds } from './engine/soundService';

export const App: React.FC = () => {
  const {
    game,
    history,
    turn,
    playerColor,
    orientation,
    currentLevel,
    isEngineThinking,
    lastMove,
    hintData,
    isHintRevealed,
    arrows,
    moveEvaluations,
    lastMoveEval,
    positionAnalysis,
    gameStatus,
    theme,
    soundEnabled,
    showEvalBar,
    showArrows,
    executeMove,
    undoMove,
    requestHint,
    revealHintMove,
    clearHint,
    newGame,
    setPlayerColor,
    setCurrentLevel,
    flipBoard,
    handleResign,
    setTheme,
    toggleSound,
    setShowEvalBar,
    setShowArrows,
    copyFen,
    copyPgn,
    branchAt,
    saveCurrentGame,
    loadSavedGame,
    importPgnOrFen,
  } = useChessGame();

  // Desktop active tab
  const [desktopTab, setDesktopTab] = useState<'coach' | 'history' | 'settings'>('coach');

  // Mobile modal sheets (to avoid vertical scrolling on mobile)
  const [mobileModal, setMobileModal] = useState<'hint' | 'review' | 'moves' | 'settings' | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [branchNotification, setBranchNotification] = useState<string | null>(null);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(-1);

  // Replay board state when user clicks on a past move in history (-2 represents starting position)
  const isViewingHistory = (selectedMoveIndex >= 0 || selectedMoveIndex === -2) && selectedMoveIndex < history.length - 1;

  const displayGame = useMemo(() => {
    if (isViewingHistory) {
      const temp = new Chess();
      if (selectedMoveIndex === -2) {
        return temp;
      }
      for (let i = 0; i <= selectedMoveIndex; i++) {
        if (history[i]) {
          temp.move(history[i]);
        }
      }
      return temp;
    }
    return game;
  }, [game, history, isViewingHistory, selectedMoveIndex]);

  const displayLastMove = useMemo(() => {
    if (isViewingHistory) {
      if (selectedMoveIndex === -2) return null;
      const evalAtIdx = moveEvaluations[selectedMoveIndex];
      if (evalAtIdx?.uci) {
        return {
          from: evalAtIdx.uci.slice(0, 2) as Square,
          to: evalAtIdx.uci.slice(2, 4) as Square,
        };
      }
    }
    return lastMove;
  }, [lastMove, isViewingHistory, selectedMoveIndex, moveEvaluations]);

  const handleSelectMove = (index: number) => {
    if (index >= history.length - 1) {
      setSelectedMoveIndex(-1);
    } else {
      setSelectedMoveIndex(index);
    }
  };

  const handleUndoMove = () => {
    setSelectedMoveIndex(-1);
    undoMove();
  };

  const handleExecuteMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    if (isViewingHistory) {
      const branchIdx = selectedMoveIndex === -2 ? -1 : selectedMoveIndex;
      const success = branchAt(branchIdx, from, to, promotion);
      if (success) {
        setSelectedMoveIndex(-1);
        setBranchNotification('Variante alternativa creata! L\'Istruttore sta analizzando la nuova linea.');
        setTimeout(() => setBranchNotification(null), 4000);
        return true;
      }
      return false;
    }
    setSelectedMoveIndex(-1);
    return executeMove(from, to, promotion);
  };

  // Keyboard navigation for moves (left / right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedMoveIndex((prev) => {
          const current = prev >= 0 ? prev : history.length - 1;
          return Math.max(-2, current - 1);
        });
      } else if (e.key === 'ArrowRight') {
        setSelectedMoveIndex((prev) => {
          if (prev === -2) return 0;
          if (prev < 0 || prev >= history.length - 1) return -1;
          const next = prev + 1;
          return next >= history.length - 1 ? -1 : next;
        });
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndoMove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history.length, handleUndoMove]);

  const isPlayerTurn = turn === playerColor && !gameStatus.isOver;

  // Handle mobile hint click
  const handleMobileHintClick = () => {
    if (!hintData) {
      requestHint();
    }
    setMobileModal('hint');
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-screen bg-[#0b0e14] text-white font-sans antialiased overflow-hidden select-none">
      {/* Top Header */}
      <Header
        gameStatus={gameStatus}
        turn={turn}
        playerColor={playerColor}
        isEngineThinking={isEngineThinking}
        onNewGame={newGame}
        onOpenInfo={() => setIsInfoOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 min-h-0 max-w-[1560px] w-full mx-auto px-2 sm:px-6 lg:px-8 py-1 md:py-3 flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-8 justify-between md:justify-center items-center overflow-hidden">
        {/* ================= LEFT / CENTER: CHESS ARENA ================= */}
        <div className="flex flex-col justify-between md:justify-center items-center h-full min-h-0 w-full md:w-auto shrink-0">
          
          {/* Main Arena Unit: Full width on mobile, calibrated on desktop */}
          <div className={`flex flex-col justify-between md:justify-start h-full md:h-auto w-full max-w-md sm:max-w-lg md:max-w-none ${
            showEvalBar
              ? "md:w-[calc(min(640px,calc(100dvh-165px))+42px)] lg:w-[calc(min(720px,calc(100dvh-155px))+46px)] xl:w-[calc(min(760px,calc(100dvh-145px))+46px)]"
              : "md:w-[min(640px,calc(100dvh-165px))] lg:w-[min(720px,calc(100dvh-155px))] xl:w-[min(760px,calc(100dvh-145px))]"
          }`}>
            
            {/* Top Info Bar: Opponent Info & Captured Pieces */}
            <div className="w-full flex items-center justify-between px-2.5 py-1 bg-[#181e29]/90 border border-slate-800 rounded-xl mb-1 shadow-sm shrink-0 h-[34px]">
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileModal('settings');
                  } else {
                    setDesktopTab('settings');
                  }
                }}
                className="flex items-center gap-2 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer group"
                title="Clicca per scegliere o personalizzare il livello dell'avversario"
              >
                <span className="text-lg sm:text-xl select-none shrink-0 group-hover:scale-105 transition-transform">{currentLevel.avatar}</span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-none truncate group-hover:text-emerald-400 transition-colors">{currentLevel.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold leading-none shrink-0">
                      {currentLevel.elo} ELO
                    </span>
                  </div>
                  {isEngineThinking && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse leading-none mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">calcolo...</span>
                    </span>
                  )}
                </div>
              </button>

              {/* Opponent captured pieces */}
              <div className="shrink-0">
                <CapturedPieces game={displayGame} forColor={playerColor === 'w' ? 'b' : 'w'} />
              </div>
            </div>

            {/* Branch Notification Banner (if newly created) */}
            {branchNotification && (
              <div className="w-full flex items-center justify-between px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-[11px] font-semibold shadow-sm mb-1 shrink-0 animate-fade-in">
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{branchNotification}</span>
                </span>
                <button
                  onClick={() => setBranchNotification(null)}
                  className="text-emerald-400 hover:text-white text-xs font-bold px-1"
                >
                  ×
                </button>
              </div>
            )}

            {/* Historical Replay Banner (if open) */}
            {isViewingHistory && (
              <div className="w-full flex items-center justify-between px-2.5 py-1 bg-amber-950/85 border border-amber-500/50 rounded-xl text-amber-200 text-[11px] font-medium shadow-sm mb-1 shrink-0">
                <span className="flex items-center gap-1.5 font-sans truncate mr-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="truncate">
                    {selectedMoveIndex === -2
                      ? 'Inizio Partita • Fai una mossa per branchare'
                      : `Mossa ${selectedMoveIndex + 1}/${history.length}: ${history[selectedMoveIndex]} • Fai una mossa per branchare`}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedMoveIndex(-1)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Diretta</span>
                  <ChevronLast className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Board Row: EvalBar + Chessboard (Pixel-locked together with zero overlap) */}
            <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 my-auto md:my-1">
              {/* 1. Eval Bar */}
              {showEvalBar && (
                <div className="w-4 sm:w-5 md:w-7 lg:w-8 h-[min(calc(100vw-36px),calc(100dvh-220px))] md:h-[min(640px,calc(100dvh-165px))] lg:h-[min(720px,calc(100dvh-155px))] xl:h-[min(760px,calc(100dvh-145px))] shrink-0">
                  <EvalBar
                    score={positionAnalysis ? positionAnalysis.score : 0}
                    mate={positionAnalysis ? positionAnalysis.mate : null}
                    orientation={orientation}
                    winChanceWhite={positionAnalysis ? positionAnalysis.winChanceWhite : 50}
                  />
                </div>
              )}

              {/* 2. Chessboard (Exact width and height) */}
              <div className="w-[min(calc(100vw-36px),calc(100dvh-220px))] md:w-[min(640px,calc(100dvh-165px))] lg:w-[min(720px,calc(100dvh-155px))] xl:w-[min(760px,calc(100dvh-145px))] aspect-square shrink-0">
                <ChessBoard
                  game={displayGame}
                  orientation={orientation}
                  onMove={handleExecuteMove}
                  disabled={
                    (!isViewingHistory && (!isPlayerTurn || isEngineThinking)) ||
                    (isViewingHistory && (displayGame.turn() !== playerColor || isEngineThinking))
                  }
                  lastMove={displayLastMove}
                  hintSquare={hintData && isHintRevealed && !isViewingHistory ? { from: hintData.from, to: hintData.to } : null}
                  arrows={showArrows && !isViewingHistory ? arrows : []}
                  theme={theme}
                />
              </div>
            </div>

            {/* Bottom Info Bar: Player Info & Captured Pieces */}
            <div className="w-full flex items-center justify-between px-2.5 py-1 bg-[#181e29]/90 border border-slate-800 rounded-xl mt-1 shadow-sm shrink-0 h-[34px]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border border-slate-600 shrink-0">
                  {playerColor === 'w' ? '♔' : '♚'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white leading-none truncate">Tu ({playerColor === 'w' ? 'Bianco' : 'Nero'})</span>
                  {isViewingHistory ? (
                    <span className="text-[10px] text-amber-400 leading-none mt-0.5 truncate">
                      Replay / Branching
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 leading-none mt-0.5 truncate">
                      {playerColor === 'w' ? 'Giocatore Bianco' : 'Giocatore Nero'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Player captured pieces */}
                <CapturedPieces game={displayGame} forColor={playerColor} />

                {/* Quick Desktop Quick Actions */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={handleUndoMove}
                    disabled={history.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold disabled:opacity-40 transition-colors border border-slate-700/60"
                    title="Annulla mossa (Ctrl+Z)"
                  >
                    <Undo2 className="w-3 h-3 text-amber-400" />
                    <span>Annulla</span>
                  </button>

                  <button
                    onClick={flipBoard}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Capovolgi scacchiera"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons Bar (Docked at screen bottom with iOS Home Indicator safe area padding) */}
            <div className="md:hidden w-full grid grid-cols-5 gap-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shrink-0">
              {/* 1. Undo Button */}
              <button
                onClick={handleUndoMove}
                disabled={history.length === 0}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 disabled:opacity-30 border border-slate-700/70 transition-all text-slate-200"
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                <span className="text-[10px] font-bold">Annulla</span>
              </button>

              {/* 2. Hint Button */}
              <button
                onClick={handleMobileHintClick}
                disabled={!isPlayerTurn || isEngineThinking || isViewingHistory}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-emerald-950/40 active:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 disabled:opacity-30 transition-all font-bold"
              >
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                <span className="text-[10px]">Consiglio</span>
              </button>

              {/* 3. Review Last Move */}
              <button
                onClick={() => setMobileModal('review')}
                disabled={!lastMoveEval}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 disabled:opacity-30 border border-slate-700/70 transition-all text-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 mb-0.5" />
                <span className="text-[10px] font-bold">Analisi</span>
              </button>

              {/* 4. Move History */}
              <button
                onClick={() => setMobileModal('moves')}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 border border-slate-700/70 transition-all text-slate-200"
              >
                <ScrollText className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                <span className="text-[10px] font-bold">Mosse</span>
              </button>

              {/* 5. Settings */}
              <button
                onClick={() => setMobileModal('settings')}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 border border-slate-700/70 transition-all text-slate-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-300 mb-0.5" />
                <span className="text-[10px] font-bold">Opzioni</span>
              </button>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: DESKTOP TABBED WORKSPACE ================= */}
        <div className="hidden md:flex flex-col w-full md:w-[380px] lg:w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 h-[min(calc(100dvh-165px)+74px,834px)] max-h-[calc(100dvh-60px)] overflow-hidden bg-[#141a24] border border-slate-800/90 rounded-3xl p-4 shadow-xl">
          {/* Desktop Tabs Header */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1c2433] rounded-2xl mb-4 border border-slate-800/80 shrink-0">
            <button
              onClick={() => setDesktopTab('coach')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                desktopTab === 'coach'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Istruttore AI</span>
            </button>

            <button
              onClick={() => setDesktopTab('history')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                desktopTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>Mosse</span>
            </button>

            <button
              onClick={() => setDesktopTab('settings')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                desktopTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Opzioni</span>
            </button>
          </div>

          {/* Desktop Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 flex flex-col">
            {desktopTab === 'coach' && (
              <CoachPanel
                currentLevel={currentLevel}
                lastMoveEval={lastMoveEval}
                hintData={hintData}
                positionAnalysis={positionAnalysis}
                onRequestHint={requestHint}
                onRevealHintMove={revealHintMove}
                onDismissHint={clearHint}
                isHintRevealed={isHintRevealed}
                isEngineThinking={isEngineThinking}
                isPlayerTurn={isPlayerTurn}
                onChangeLevel={() => setDesktopTab('settings')}
              />
            )}

            {desktopTab === 'history' && (
              <div className="h-full flex flex-col">
                <MoveHistory
                  history={history}
                  moveEvaluations={moveEvaluations}
                  currentMoveIndex={selectedMoveIndex >= 0 || selectedMoveIndex === -2 ? selectedMoveIndex : history.length - 1}
                  onSelectMove={handleSelectMove}
                  onCopyPgn={copyPgn}
                  onCopyFen={copyFen}
                />
              </div>
            )}

            {desktopTab === 'settings' && (
              <GameSettings
                currentLevel={currentLevel}
                onSelectLevel={setCurrentLevel}
                playerColor={playerColor}
                onChangeColor={setPlayerColor}
                onFlipBoard={flipBoard}
                onNewGame={newGame}
                onResign={handleResign}
                theme={theme}
                onChangeTheme={setTheme}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                showEvalBar={showEvalBar}
                onToggleEvalBar={() => setShowEvalBar(!showEvalBar)}
                showArrows={showArrows}
                onToggleArrows={() => setShowArrows(!showArrows)}
              />
            )}
          </div>
        </div>
      </main>

      {/* ================= MOBILE SLIDE-UP MODALS (ZERO SCROLLING) ================= */}
      {/* 1. Mobile Hint Modal */}
      <SlideSheet
        isOpen={mobileModal === 'hint'}
        onClose={() => setMobileModal(null)}
        title="Suggerimento dell'Istruttore"
        icon={<Lightbulb className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {hintData && !isHintRevealed && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed">
                <span className="font-bold block text-amber-400 text-xs uppercase tracking-wider mb-1">
                  💡 Indizio Concettuale:
                </span>
                "{hintData.conceptHint}"
              </div>

              <button
                onClick={() => {
                  sounds.playHint();
                  revealHintMove();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Svela la Mossa Migliore & la Spiegazione
              </button>
            </div>
          )}

          {hintData && isHintRevealed && (
            <ExplanationCard
              san={hintData.bestMoveSan}
              quality="best"
              evalScore={hintData.evalScore}
              tacticalExplanation={hintData.tacticalExplanation}
              conceptualExplanation={hintData.conceptualExplanation}
              continuationLine={hintData.continuationLine}
              isHint={true}
            />
          )}

          {!hintData && (
            <div className="text-center py-6 text-slate-400 text-sm">
              L'istruttore sta analizzando la posizione...
            </div>
          )}
        </div>
      </SlideSheet>

      {/* 2. Mobile Move Review Modal */}
      <SlideSheet
        isOpen={mobileModal === 'review'}
        onClose={() => setMobileModal(null)}
        title="Revisione Ultima Mossa"
        icon={<Sparkles className="w-5 h-5" />}
      >
        {lastMoveEval ? (
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
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            Nessuna mossa recente da revisionare.
          </div>
        )}
      </SlideSheet>

      {/* 3. Mobile PGN Moves Modal */}
      <SlideSheet
        isOpen={mobileModal === 'moves'}
        onClose={() => setMobileModal(null)}
        title="Cronologia & PGN"
        icon={<ScrollText className="w-5 h-5" />}
      >
        <MoveHistory
          history={history}
          moveEvaluations={moveEvaluations}
          currentMoveIndex={selectedMoveIndex >= 0 || selectedMoveIndex === -2 ? selectedMoveIndex : history.length - 1}
          onSelectMove={(idx) => {
            handleSelectMove(idx);
            setMobileModal(null);
          }}
          onCopyPgn={copyPgn}
          onCopyFen={copyFen}
        />
      </SlideSheet>

      {/* 4. Mobile Settings Modal */}
      <SlideSheet
        isOpen={mobileModal === 'settings'}
        onClose={() => setMobileModal(null)}
        title="Impostazioni & Istruttore"
        icon={<SlidersHorizontal className="w-5 h-5" />}
      >
        <GameSettings
          currentLevel={currentLevel}
          onSelectLevel={(lvl) => {
            setCurrentLevel(lvl);
            setMobileModal(null);
          }}
          playerColor={playerColor}
          onChangeColor={setPlayerColor}
          onFlipBoard={flipBoard}
          onNewGame={() => {
            newGame();
            setMobileModal(null);
          }}
          onResign={() => {
            handleResign();
            setMobileModal(null);
          }}
          theme={theme}
          onChangeTheme={setTheme}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          showEvalBar={showEvalBar}
          onToggleEvalBar={() => setShowEvalBar(!showEvalBar)}
          showArrows={showArrows}
          onToggleArrows={() => setShowArrows(!showArrows)}
        />
      </SlideSheet>

      {/* Educational Guide Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Saved Games Modal */}
      <SavedGamesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadGame={(saved) => {
          loadSavedGame(saved);
          setSelectedMoveIndex(-1);
        }}
        onSaveCurrentGame={saveCurrentGame}
        currentGameMoveCount={history.length}
      />

      {/* Import PGN / FEN Modal */}
      <ImportGameModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(input) => {
          const res = importPgnOrFen(input);
          if (res.success) {
            setSelectedMoveIndex(-1);
          }
          return res;
        }}
      />
    </div>
  );
};

export default App;
