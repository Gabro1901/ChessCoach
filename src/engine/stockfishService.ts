import { EngineLevel, PositionAnalysis } from '../types/chess';
import { localEngine } from './localEngine';
import { Chess } from 'chess.js';

export type AnalysisCallback = (analysis: PositionAnalysis) => void;

export class StockfishService {
  private opponentWorker: Worker | null = null;
  private analysisWorker: Worker | null = null;
  public opponentReady: boolean = false;
  public analysisReady: boolean = false;
  private analysisListeners: Set<AnalysisCallback> = new Set();
  private currentAnalysisFen: string = '';
  public isOpponentThinking: boolean = false;
  private opponentMoveResolver: ((moveUci: string) => void) | null = null;
  private opponentTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initWorkers();
  }

  private initWorkers() {
    if (typeof window === 'undefined') return;

    try {
      // Initialize Opponent Worker
      this.opponentWorker = new Worker('/stockfish/stockfish.js');
      this.opponentWorker.onmessage = (e) => this.handleOpponentMessage(e.data);
      this.opponentWorker.onerror = (err) => {
        console.warn('Opponent Stockfish worker error, using fallback engine:', err);
        this.opponentWorker = null;
      };
      this.opponentWorker.postMessage('uci');
      this.opponentWorker.postMessage('isready');

      // Initialize Analysis Worker
      this.analysisWorker = new Worker('/stockfish/stockfish.js');
      this.analysisWorker.onmessage = (e) => this.handleAnalysisMessage(e.data);
      this.analysisWorker.onerror = (err) => {
        console.warn('Analysis Stockfish worker error, using fallback engine:', err);
        this.analysisWorker = null;
      };
      this.analysisWorker.postMessage('uci');
      this.analysisWorker.postMessage('isready');
    } catch (err) {
      console.warn('Web Worker not supported or restricted, fallback engine activated:', err);
    }
  }

  public setOpponentLevel(level: EngineLevel) {
    if (!this.opponentWorker) return;
    try {
      this.opponentWorker.postMessage(`setoption name Skill Level value ${level.skillLevel}`);
      if (level.elo < 2800) {
        this.opponentWorker.postMessage('setoption name UCI_LimitStrength value true');
        this.opponentWorker.postMessage(`setoption name UCI_Elo value ${level.elo}`);
      } else {
        this.opponentWorker.postMessage('setoption name UCI_LimitStrength value false');
      }
    } catch (e) {
      console.warn('Failed to configure opponent level options', e);
    }
  }

  public notifyNewGame() {
    if (this.opponentWorker) {
      try {
        this.opponentWorker.postMessage('ucinewgame');
        this.opponentWorker.postMessage('isready');
      } catch {
        // ignore
      }
    }
    if (this.analysisWorker) {
      try {
        this.analysisWorker.postMessage('ucinewgame');
        this.analysisWorker.postMessage('isready');
      } catch {
        // ignore
      }
    }
  }

  // --- OPPONENT MOVE GENERATION ---
  public async getOpponentMove(fen: string, level: EngineLevel): Promise<string> {
    // Clear any previous hung resolver
    if (this.opponentTimeoutTimer) {
      clearTimeout(this.opponentTimeoutTimer);
      this.opponentTimeoutTimer = null;
    }
    this.isOpponentThinking = true;

    // If Web Worker is active, query it with guaranteed fallback timeout
    if (this.opponentWorker) {
      return new Promise((resolve) => {
        const finish = (uci: string) => {
          if (this.opponentTimeoutTimer) {
            clearTimeout(this.opponentTimeoutTimer);
            this.opponentTimeoutTimer = null;
          }
          this.opponentMoveResolver = null;
          this.isOpponentThinking = false;
          resolve(uci);
        };

        this.opponentMoveResolver = finish;
        this.setOpponentLevel(level);
        this.opponentWorker!.postMessage(`position fen ${fen}`);
        this.opponentWorker!.postMessage(`go depth ${Math.min(level.depth, 20)} movetime ${level.moveTimeMs}`);

        // Guaranteed safety fallback timer
        this.opponentTimeoutTimer = setTimeout(() => {
          console.warn('Stockfish worker timed out, calculating move with local engine');
          const fallback = this.getLocalFallbackMove(fen, level);
          finish(fallback);
        }, Math.max(level.moveTimeMs + 500, 1500));
      });
    }

    // Local Engine Fallback
    await new Promise((r) => setTimeout(r, Math.min(level.moveTimeMs, 500)));
    const move = this.getLocalFallbackMove(fen, level);
    this.isOpponentThinking = false;
    return move;
  }

  public getLocalFallbackMove(fen: string, level: EngineLevel): string {
    try {
      const chess = new Chess(fen);
      const legalMoves = chess.moves({ verbose: true });
      if (legalMoves.length === 0) return '';

      // For beginner (level 1), simulate human beginner mistakes occasionally
      if (level.id === 1 && Math.random() < 0.35) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        return randomMove.from + randomMove.to + (randomMove.promotion || '');
      }

      // Otherwise calculate best tactical move
      const depth = Math.min(level.depth, 4);
      const res = localEngine.searchBestMove(chess, depth);
      if (res.bestMove) {
        return res.bestMove.from + res.bestMove.to + (res.bestMove.promotion || '');
      }

      const m = legalMoves[0];
      return m.from + m.to + (m.promotion || '');
    } catch {
      return '';
    }
  }

  private handleOpponentMessage(line: string) {
    if (line === 'readyok') {
      this.opponentReady = true;
      return;
    }

    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const move = parts[1];
      if (this.opponentMoveResolver) {
        const res = this.opponentMoveResolver;
        this.opponentMoveResolver = null;
        if (this.opponentTimeoutTimer) {
          clearTimeout(this.opponentTimeoutTimer);
          this.opponentTimeoutTimer = null;
        }
        this.isOpponentThinking = false;
        res(move && move !== '(none)' ? move : '');
      }
    }
  }

  // --- CONTINUOUS REAL-TIME ANALYSIS ---
  public subscribeAnalysis(callback: AnalysisCallback): () => void {
    this.analysisListeners.add(callback);
    return () => this.analysisListeners.delete(callback);
  }

  private broadcastAnalysis(analysis: PositionAnalysis) {
    this.analysisListeners.forEach((cb) => cb(analysis));
  }

  public startAnalysis(fen: string, depth: number = 16) {
    this.currentAnalysisFen = fen;

    // Send immediate local estimate so UI responds within 0ms
    try {
      const chess = new Chess(fen);
      const isGameOver = chess.isGameOver();
      const localEval = localEngine.evaluate(chess);
      const quickSearch = localEngine.searchBestMove(chess, 2);
      const bestUci = quickSearch.bestMove
        ? quickSearch.bestMove.from + quickSearch.bestMove.to + (quickSearch.bestMove.promotion || '')
        : '';
      const bestSan = quickSearch.bestMove ? quickSearch.bestMove.san : '';

      this.broadcastAnalysis({
        fen,
        score: localEval,
        mate: isGameOver && chess.isCheckmate() ? (chess.turn() === 'w' ? -1 : 1) : null,
        depth: 2,
        bestMoveUci: bestUci,
        bestMoveSan: bestSan,
        pv: quickSearch.pv,
        winChanceWhite: this.calculateWinPercentage(localEval),
        isAnalyzing: true,
      });
    } catch {
      // ignore
    }

    // Now run high-depth Stockfish Web Worker in background
    if (this.analysisWorker) {
      try {
        this.analysisWorker.postMessage('stop');
        this.analysisWorker.postMessage(`position fen ${fen}`);
        this.analysisWorker.postMessage(`go depth ${depth}`);
      } catch (e) {
        console.warn('Failed to start Stockfish analysis worker:', e);
      }
    }
  }

  public stopAnalysis() {
    if (this.analysisWorker) {
      try {
        this.analysisWorker.postMessage('stop');
      } catch {
        // ignore
      }
    }
  }

  private handleAnalysisMessage(line: string) {
    if (line === 'readyok') {
      this.analysisReady = true;
      return;
    }

    if (line.startsWith('info') && line.includes('score')) {
      const parts = line.split(' ');

      let depth = 0;
      const depthIdx = parts.indexOf('depth');
      if (depthIdx !== -1) depth = parseInt(parts[depthIdx + 1], 10);

      let scoreCp = 0;
      let mate: number | null = null;
      const scoreIdx = parts.indexOf('score');
      if (scoreIdx !== -1) {
        const scoreType = parts[scoreIdx + 1];
        const scoreVal = parseInt(parts[scoreIdx + 2], 10);
        if (scoreType === 'cp') {
          scoreCp = scoreVal;
        } else if (scoreType === 'mate') {
          mate = scoreVal;
          scoreCp = scoreVal > 0 ? 10000 - scoreVal * 100 : -10000 - scoreVal * 100;
        }
      }

      const turn = this.currentAnalysisFen.split(' ')[1] || 'w';
      const normalizedScore = turn === 'w' ? scoreCp : -scoreCp;

      let pv: string[] = [];
      const pvIdx = parts.indexOf('pv');
      if (pvIdx !== -1) {
        pv = parts.slice(pvIdx + 1);
      }

      const bestUci = pv[0] || '';
      let bestSan = bestUci;

      if (bestUci && this.currentAnalysisFen) {
        try {
          const sim = new Chess(this.currentAnalysisFen);
          const from = bestUci.substring(0, 2);
          const to = bestUci.substring(2, 4);
          const prom = bestUci.length > 4 ? bestUci[4] : undefined;
          const m = sim.move({ from, to, promotion: prom as any });
          if (m) bestSan = m.san;
        } catch {
          // ignore
        }
      }

      this.broadcastAnalysis({
        fen: this.currentAnalysisFen,
        score: normalizedScore,
        mate,
        depth,
        bestMoveUci: bestUci,
        bestMoveSan: bestSan,
        pv,
        winChanceWhite: this.calculateWinPercentage(normalizedScore),
        isAnalyzing: true,
      });
    }
  }

  private calculateWinPercentage(cp: number): number {
    const win = 1 / (1 + Math.exp(-0.00368208 * cp));
    return Math.round(win * 100);
  }
}

export const stockfishService = new StockfishService();
