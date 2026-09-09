import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  PlayerColor,
  EngineLevel,
  MoveEvaluation,
  HintData,
  PositionAnalysis,
  GameStatus,
  SavedGame,
} from '../types/chess';
import { ENGINE_LEVELS } from '../engine/engineLevels';
import { explanationEngine } from '../engine/explanationEngine';
import { stockfishService } from '../engine/stockfishService';
import { localEngine } from '../engine/localEngine';
import { sounds } from '../engine/soundService';
import { gameStorageService } from '../engine/gameStorageService';

export function useChessGame() {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(() => game.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [orientation, setOrientation] = useState<PlayerColor>('w');
  const [currentLevel, setCurrentLevel] = useState<EngineLevel>(ENGINE_LEVELS[2]); // Marco 1500 ELO default
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const fenRef = useRef<string>(fen);
  fenRef.current = fen;
  const playerColorRef = useRef<PlayerColor>(playerColor);
  playerColorRef.current = playerColor;
  const [hintData, setHintData] = useState<HintData | null>(null);
  const [isHintRevealed, setIsHintRevealed] = useState<boolean>(false);
  const [arrows, setArrows] = useState<Array<{ from: string; to: string; color?: string }>>([]);
  const [moveEvaluations, setMoveEvaluations] = useState<MoveEvaluation[]>([]);
  const [lastMoveEval, setLastMoveEval] = useState<MoveEvaluation | null>(null);
  const [positionAnalysis, setPositionAnalysis] = useState<PositionAnalysis | null>(null);
  const [theme, setTheme] = useState<'tournament' | 'classic' | 'slate'>('tournament');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showEvalBar, setShowEvalBar] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState<boolean>(true);

  // Keep a ref to latest positionAnalysis to decouple executeMove from frequent analysis updates
  const positionAnalysisRef = useRef<PositionAnalysis | null>(null);
  positionAnalysisRef.current = positionAnalysis;

  const isBotRunningRef = useRef<boolean>(false);

  // Status computation
  const getGameStatus = useCallback((): GameStatus => {
    const isOver = game.isGameOver();
    const inCheck = game.inCheck();
    let winner: PlayerColor | 'draw' | null = null;
    let reason: GameStatus['reason'] = null;

    if (game.isCheckmate()) {
      winner = game.turn() === 'w' ? 'b' : 'w';
      reason = 'checkmate';
    } else if (game.isDraw()) {
      winner = 'draw';
      if (game.isStalemate()) reason = 'stalemate';
      else if (game.isThreefoldRepetition()) reason = 'threefold';
      else if (game.isInsufficientMaterial()) reason = 'insufficient_material';
      else reason = 'fifty_moves';
    }

    return { isOver, winner, reason, inCheck };
  }, [game]);

  const [gameStatus, setGameStatus] = useState<GameStatus>(getGameStatus());

  // Subscribe to Stockfish real-time analysis
  useEffect(() => {
    const unsubscribe = stockfishService.subscribeAnalysis((analysis) => {
      setPositionAnalysis(analysis);

      // Refine last player move evaluation with deep Stockfish score if available
      if (analysis.depth >= 10 && analysis.fen === fenRef.current) {
        setLastMoveEval((prev) => {
          if (!prev || prev.color !== playerColorRef.current) return prev;
          if (prev.quality === 'best' || prev.quality === 'brilliant') return prev;

          const deepDelta = playerColorRef.current === 'w'
            ? analysis.score - prev.scoreBefore
            : -(analysis.score - prev.scoreBefore);

          const refinedQuality = explanationEngine.classifyMove(
            deepDelta,
            false,
            false,
            prev.scoreBefore > 200,
            false
          );

          if (refinedQuality !== prev.quality) {
            return {
              ...prev,
              scoreAfter: analysis.score,
              scoreDiff: deepDelta,
              quality: refinedQuality,
            };
          }
          return prev;
        });
      }
    });

    stockfishService.startAnalysis(game.fen());

    return () => {
      unsubscribe();
      stockfishService.stopAnalysis();
    };
  }, []);

  // Update analysis & status whenever FEN changes
  useEffect(() => {
    stockfishService.startAnalysis(fen);
    setGameStatus(getGameStatus());
  }, [fen, getGameStatus]);

  // Audio & confetti triggers
  useEffect(() => {
    if (gameStatus.inCheck && !gameStatus.isOver) {
      sounds.playCheck();
    } else if (gameStatus.isOver) {
      if (gameStatus.winner === playerColor) {
        sounds.playVictory();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else if (gameStatus.winner && gameStatus.winner !== 'draw') {
        sounds.playDefeat();
      }
    }
  }, [gameStatus, playerColor]);

  // Execute Move (Stable callback that doesn't churn on positionAnalysis)
  const executeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      try {
        const currentAnalysis = positionAnalysisRef.current;
        const fenBefore = game.fen();
        const scoreBefore = currentAnalysis ? currentAnalysis.score : 0;
        const bestMoveUciBefore = currentAnalysis ? currentAnalysis.bestMoveUci : '';

        const move = game.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (!move) return false;

        // Sound effect
        if (move.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        const fenAfter = game.fen();
        const newHistory = game.history();

        // Clear previous hints
        setHintData(null);
        setIsHintRevealed(false);
        setArrows([]);
        setLastMove({ from, to });
        setFen(fenAfter);
        setHistory(newHistory);

        const uci = `${from}${to}${promotion || ''}`;
        const isBest = bestMoveUciBefore ? uci.startsWith(bestMoveUciBefore.slice(0, 4)) : false;
        const wasPlayer = move.color === playerColor;

        // Accurate evaluation difference (centipawn delta)
        let delta = 0;
        let scoreAfterEst = scoreBefore;

        if (wasPlayer) {
          if (isBest) {
            delta = 0;
            scoreAfterEst = scoreBefore;
          } else {
            // Evaluate position before and after with localEngine tactical search
            try {
              const chessBefore = new Chess(fenBefore);
              const localBefore = localEngine.searchBestMove(chessBefore, 2).score;
              const chessAfter = new Chess(fenAfter);
              const localAfter = localEngine.searchBestMove(chessAfter, 2).score;

              const localDelta = playerColor === 'w'
                ? localAfter - localBefore
                : -(localAfter - localBefore);

              delta = localDelta;
              scoreAfterEst = scoreBefore + (playerColor === 'w' ? delta : -delta);
            } catch {
              delta = -100;
            }
          }
        }

        const isSacrifice =
          isBest &&
          ['q', 'r', 'b', 'n'].includes(move.piece) &&
          delta >= -15 &&
          (move.captured ? ['p', 'n', 'b'].includes(move.captured) && move.piece !== 'n' && move.piece !== 'b' : true);

        const quality = explanationEngine.classifyMove(
          delta,
          isBest,
          game.isCheckmate(),
          scoreBefore > 200,
          isSacrifice
        );

        if (quality === 'brilliant') {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        const explanations = explanationEngine.explainMove(
          fenBefore,
          bestMoveUciBefore || uci,
          currentAnalysis?.pv || [],
          isBest,
          quality,
          move.san
        );

        const evalRecord: MoveEvaluation = {
          moveNumber: Math.floor(newHistory.length / 2) + 1,
          color: move.color as PlayerColor,
          san: move.san,
          uci,
          fenBefore,
          fenAfter,
          scoreBefore,
          scoreAfter: scoreAfterEst,
          scoreDiff: delta,
          bestMoveSan: currentAnalysis?.bestMoveSan || move.san,
          bestMoveUci: bestMoveUciBefore || uci,
          quality,
          tacticalExplanation: explanations.tactical,
          conceptualExplanation: explanations.conceptual,
          continuationLine: explanations.continuationLineSan,
          threatsDescription: explanations.threats,
        };

        setMoveEvaluations((prev) => [...prev, evalRecord]);
        if (wasPlayer) {
          setLastMoveEval(evalRecord);
        }

        return true;
      } catch (e) {
        console.warn('Move execution error:', e);
        return false;
      }
    },
    [game, playerColor]
  );

  // BOT TURN TRIGGER (Guaranteed execution without premature cancellation)
  useEffect(() => {
    if (game.isGameOver()) return;

    const currentTurn = game.turn();
    const isBotTurn = currentTurn !== playerColor;

    if (isBotTurn && !isBotRunningRef.current) {
      isBotRunningRef.current = true;
      setIsEngineThinking(true);

      const runBot = async () => {
        try {
          const moveUci = await stockfishService.getOpponentMove(game.fen(), currentLevel);
          if (moveUci && moveUci.length >= 4) {
            const from = moveUci.substring(0, 2) as Square;
            const to = moveUci.substring(2, 4) as Square;
            const prom = moveUci.length > 4 ? (moveUci[4] as PieceSymbol) : undefined;
            executeMove(from, to, prom);
          }
        } catch (err) {
          console.error('Error during bot move execution:', err);
        } finally {
          isBotRunningRef.current = false;
          setIsEngineThinking(false);
        }
      };

      const timer = setTimeout(runBot, 200);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [fen, playerColor, currentLevel, game, executeMove]);

  // UNDO MOVE FEATURE (QoL Feature)
  const undoMove = useCallback(() => {
    if (history.length === 0) return;

    // If bot is thinking, cancel
    isBotRunningRef.current = false;
    setIsEngineThinking(false);

    // If it's player's turn, undo 2 moves (bot move + player move)
    // If it's bot's turn, undo 1 move (player move)
    const currentTurn = game.turn();
    const movesToUndo = currentTurn === playerColor ? (history.length >= 2 ? 2 : 1) : 1;

    for (let i = 0; i < movesToUndo; i++) {
      game.undo();
    }

    const newFen = game.fen();
    const newHistory = game.history();

    setFen(newFen);
    setHistory(newHistory);
    setHintData(null);
    setIsHintRevealed(false);
    setArrows([]);
    setLastMove(null);
    setMoveEvaluations((prev) => prev.slice(0, Math.max(0, prev.length - movesToUndo)));
    setLastMoveEval(null);

    sounds.playMove();
    stockfishService.startAnalysis(newFen);
  }, [game, history.length, playerColor]);

  // Request Hint
  const requestHint = useCallback(() => {
    const currentAnalysis = positionAnalysisRef.current;
    if (!currentAnalysis || !currentAnalysis.bestMoveUci) {
      // If analysis not ready yet, compute fast fallback
      const quick = stockfishService.getLocalFallbackMove(game.fen(), currentLevel);
      if (!quick) return;
      const hint = explanationEngine.generateHint(game.fen(), quick, 0, []);
      setHintData(hint);
      setIsHintRevealed(false);
      setArrows([]);
      return;
    }

    const hint = explanationEngine.generateHint(
      game.fen(),
      currentAnalysis.bestMoveUci,
      currentAnalysis.score,
      currentAnalysis.pv
    );

    setHintData(hint);
    setIsHintRevealed(false);
    setArrows([]);
  }, [game, currentLevel]);

  // Reveal Best Move from Hint
  const revealHintMove = useCallback(() => {
    if (!hintData) return;
    setIsHintRevealed(true);
    setArrows([
      {
        from: hintData.from,
        to: hintData.to,
        color: '#10b981',
      },
    ]);
  }, [hintData]);

  // New Game
  const newGame = useCallback(() => {
    isBotRunningRef.current = false;
    setIsEngineThinking(false);
    stockfishService.notifyNewGame();

    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setHistory([]);
    setLastMove(null);
    setHintData(null);
    setIsHintRevealed(false);
    setArrows([]);
    setMoveEvaluations([]);
    setLastMoveEval(null);
    stockfishService.startAnalysis(newG.fen());
  }, []);

  // Change Player Color
  const handleSetPlayerColor = useCallback(
    (color: PlayerColor) => {
      setPlayerColor(color);
      setOrientation(color);
      newGame();
    },
    [newGame]
  );

  // Resign
  const handleResign = useCallback(() => {
    sounds.playDefeat();
    setGameStatus({
      isOver: true,
      winner: playerColor === 'w' ? 'b' : 'w',
      reason: 'resignation',
      inCheck: false,
    });
  }, [playerColor]);

  // Flip Board
  const flipBoard = useCallback(() => {
    setOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  }, []);

  // Toggle Sound
  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
  }, [soundEnabled]);

  // Copy FEN & PGN to clipboard
  const copyFen = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(game.fen());
      return true;
    } catch {
      return false;
    }
  }, [game]);

  const copyPgn = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(game.pgn());
      return true;
    } catch {
      return false;
    }
  }, [game]);

  // Branching from a past move in history
  const branchAt = useCallback(
    (moveIndex: number, from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      try {
        isBotRunningRef.current = false;
        setIsEngineThinking(false);

        const branched = new Chess();
        for (let i = 0; i <= moveIndex; i++) {
          if (history[i]) {
            branched.move(history[i]);
          }
        }

        const fenBefore = branched.fen();

        const move = branched.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (!move) return false;

        if (move.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        const fenAfter = branched.fen();
        const truncatedHistory = history.slice(0, moveIndex + 1);
        const truncatedEvals = moveEvaluations.slice(0, moveIndex + 1);
        const newHistory = [...truncatedHistory, move.san];

        setGame(branched);
        setFen(fenAfter);
        setHistory(newHistory);
        setLastMove({ from, to });
        setHintData(null);
        setIsHintRevealed(false);
        setArrows([]);

        const uci = `${from}${to}${promotion || ''}`;
        const wasPlayer = move.color === playerColor;

        // Calculate delta for the branched move
        let delta = 0;
        let scoreAfterEst = 0;
        if (wasPlayer) {
          try {
            const chessBefore = new Chess(fenBefore);
            const localBefore = localEngine.searchBestMove(chessBefore, 2).score;
            const chessAfter = new Chess(fenAfter);
            const localAfter = localEngine.searchBestMove(chessAfter, 2).score;
            delta = playerColor === 'w' ? localAfter - localBefore : -(localAfter - localBefore);
            scoreAfterEst = localAfter;
          } catch {
            delta = 0;
          }
        }

        const quality = explanationEngine.classifyMove(
          delta,
          false,
          branched.isCheckmate(),
          false,
          false
        );

        const explanations = explanationEngine.explainMove(
          fenBefore,
          uci,
          [],
          true,
          quality,
          move.san
        );

        const evalRecord: MoveEvaluation = {
          moveNumber: Math.floor(newHistory.length / 2) + 1,
          color: move.color as PlayerColor,
          san: move.san,
          uci,
          fenBefore,
          fenAfter,
          scoreBefore: 0,
          scoreAfter: scoreAfterEst,
          scoreDiff: delta,
          bestMoveSan: move.san,
          bestMoveUci: uci,
          quality,
          tacticalExplanation: explanations.tactical,
          conceptualExplanation: explanations.conceptual,
          continuationLine: explanations.continuationLineSan,
          threatsDescription: explanations.threats,
        };

        const updatedEvals = [...truncatedEvals, evalRecord];
        setMoveEvaluations(updatedEvals);
        if (wasPlayer) {
          setLastMoveEval(evalRecord);
        }

        return true;
      } catch (e) {
        console.warn('Branch error:', e);
        return false;
      }
    },
    [history, moveEvaluations, playerColor, game]
  );

  // Save Current Game to localStorage
  const saveCurrentGame = useCallback((customTitle?: string): SavedGame => {
    const id = Date.now().toString();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let result: 'win' | 'loss' | 'draw' | 'in_progress' = 'in_progress';
    let resultDescription = 'In corso';
    if (gameStatus.isOver) {
      if (gameStatus.winner === 'draw') {
        result = 'draw';
        resultDescription = `Patta (${gameStatus.reason || 'accordo'})`;
      } else if (gameStatus.winner === playerColor) {
        result = 'win';
        resultDescription = 'Vittoria del giocatore';
      } else {
        result = 'loss';
        resultDescription = 'Vittoria dell\'avversario';
      }
    }

    const saved: SavedGame = {
      id,
      title: customTitle || `vs ${currentLevel.name} (${currentLevel.elo})`,
      date: now.toISOString(),
      formattedDate,
      playerColor,
      opponentName: currentLevel.name,
      opponentElo: currentLevel.elo,
      result,
      resultDescription,
      moveCount: history.length,
      pgn: game.pgn(),
      fen: game.fen(),
      history: [...history],
      moveEvaluations: [...moveEvaluations],
      source: 'played',
    };

    gameStorageService.saveGame(saved);
    return saved;
  }, [game, gameStatus, playerColor, currentLevel, history, moveEvaluations]);

  // Load a Saved Game for review
  const loadSavedGame = useCallback((saved: SavedGame) => {
    isBotRunningRef.current = false;
    setIsEngineThinking(false);

    const reloaded = new Chess();
    for (const san of saved.history) {
      try {
        reloaded.move(san);
      } catch {
        break;
      }
    }

    setGame(reloaded);
    setFen(reloaded.fen());
    setHistory([...saved.history]);
    setMoveEvaluations([...saved.moveEvaluations]);
    setLastMove(null);
    setHintData(null);
    setIsHintRevealed(false);
    setArrows([]);
    setPlayerColor(saved.playerColor);
    setOrientation(saved.playerColor);
    setLastMoveEval(saved.moveEvaluations.length > 0 ? saved.moveEvaluations[saved.moveEvaluations.length - 1] : null);
    stockfishService.startAnalysis(reloaded.fen());
  }, []);

  // Import PGN or FEN from external websites (Chess.com, Lichess, etc.)
  const importPgnOrFen = useCallback((input: string): { success: boolean; error?: string } => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, error: 'Il testo inserito è vuoto.' };
    }

    // Try FEN first
    try {
      const testFen = new Chess();
      testFen.load(trimmed);
      isBotRunningRef.current = false;
      setIsEngineThinking(false);
      setGame(testFen);
      setFen(testFen.fen());
      setHistory([]);
      setMoveEvaluations([]);
      setLastMove(null);
      setLastMoveEval(null);
      setPlayerColor(testFen.turn() as PlayerColor);
      setOrientation(testFen.turn() as PlayerColor);
      stockfishService.startAnalysis(testFen.fen());
      return { success: true };
    } catch {
      // Not a pure FEN, try PGN
    }

    // Try PGN
    try {
      const testPgn = new Chess();
      testPgn.loadPgn(trimmed);
      const pgnHistory = testPgn.history();

      if (pgnHistory.length === 0 && !trimmed.includes('1.')) {
        return { success: false, error: 'Formato non riconosciuto. Incolla una notazione PGN valida o una stringa FEN.' };
      }

      isBotRunningRef.current = false;
      setIsEngineThinking(false);

      // Replay and build move evaluations
      const sim = new Chess();
      const evals: MoveEvaluation[] = [];

      for (let i = 0; i < pgnHistory.length; i++) {
        const fenBefore = sim.fen();
        const moveObj = sim.move(pgnHistory[i]);
        if (!moveObj) break;
        const fenAfter = sim.fen();
        const uci = `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`;

        const expl = explanationEngine.explainMove(
          fenBefore,
          uci,
          [],
          true,
          'good',
          moveObj.san
        );

        evals.push({
          moveNumber: Math.floor(i / 2) + 1,
          color: moveObj.color as PlayerColor,
          san: moveObj.san,
          uci,
          fenBefore,
          fenAfter,
          scoreBefore: 0,
          scoreAfter: 0,
          scoreDiff: 0,
          quality: 'good',
          tacticalExplanation: expl.tactical,
          conceptualExplanation: expl.conceptual,
          continuationLine: expl.continuationLineSan,
        });
      }

      setGame(testPgn);
      setFen(testPgn.fen());
      setHistory(pgnHistory);
      setMoveEvaluations(evals);
      setLastMoveEval(evals.length > 0 ? evals[evals.length - 1] : null);
      setPlayerColor('w');
      setOrientation('w');
      stockfishService.startAnalysis(testPgn.fen());

      // Automatically archive into Saved Games
      const now = new Date();
      const headerObj = testPgn.header();
      const saved: SavedGame = {
        id: Date.now().toString(),
        title: headerObj.White && headerObj.Black
          ? `${headerObj.White} vs ${headerObj.Black}`
          : `Partita Importata (${pgnHistory.length} mosse)`,
        date: now.toISOString(),
        formattedDate: now.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
        playerColor: 'w',
        opponentName: headerObj.Black || 'Avversario',
        opponentElo: parseInt(headerObj.BlackElo || '1800') || 1800,
        result: 'in_progress',
        resultDescription: 'Partita Importata',
        moveCount: pgnHistory.length,
        pgn: trimmed,
        fen: testPgn.fen(),
        history: pgnHistory,
        moveEvaluations: evals,
        source: 'imported',
      };
      gameStorageService.saveGame(saved);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Errore nel parsing del PGN.' };
    }
  }, []);

  return {
    game,
    fen,
    history,
    turn: game.turn() as PlayerColor,
    playerColor,
    orientation,
    currentLevel,
    isEngineThinking,
    lastMove,
    hintData,
    isHintRevealed,
    arrows: showArrows ? arrows : [],
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
    newGame,
    setPlayerColor: handleSetPlayerColor,
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
  };
}
