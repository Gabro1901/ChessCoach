import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { MoveQuality, MoveQualityInfo, HintData } from '../types/chess';

// Italian piece names
const PIECE_NAMES_IT: Record<PieceSymbol, { name: string; article: string; gender: 'm' | 'f' }> = {
  p: { name: 'pedone', article: 'il', gender: 'm' },
  n: { name: 'Cavallo', article: 'il', gender: 'm' },
  b: { name: 'Alfiere', article: 'l\'', gender: 'm' },
  r: { name: 'Torre', article: 'la', gender: 'f' },
  q: { name: 'Donna', article: 'la', gender: 'f' },
  k: { name: 'Re', article: 'il', gender: 'm' },
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

export const MOVE_QUALITY_MAP: Record<MoveQuality, MoveQualityInfo> = {
  brilliant: {
    quality: 'brilliant',
    label: 'Brillante',
    badge: '💎',
    symbol: '!!',
    color: '#06b6d4',
    bgLight: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
    description: 'Una mossa straordinaria che trova una risorsa tattica profonda o un sacrificio vincente!',
  },
  best: {
    quality: 'best',
    label: 'Migliore',
    badge: '⭐',
    symbol: '★',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    description: 'La mossa migliore assoluta calcolata dal motore di analisi.',
  },
  excellent: {
    quality: 'excellent',
    label: 'Ottima',
    badge: '✨',
    symbol: '!',
    color: '#22c55e',
    bgLight: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22c55e',
    description: 'Quasi identica alla migliore; mantiene intatto tutto il vantaggio.',
  },
  good: {
    quality: 'good',
    label: 'Buona',
    badge: '👍',
    symbol: '',
    color: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#3b82f6',
    description: 'Una mossa solida che preserva una posizione giocabile.',
  },
  book: {
    quality: 'book',
    label: 'Teoria',
    badge: '📖',
    symbol: '📖',
    color: '#a855f7',
    bgLight: 'rgba(168, 85, 247, 0.12)',
    borderColor: '#a855f7',
    description: 'Mossa standard secondo la teoria di apertura.',
  },
  inaccuracy: {
    quality: 'inaccuracy',
    label: 'Imprecisione',
    badge: '⚠️',
    symbol: '?!',
    color: '#eab308',
    bgLight: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#eab308',
    description: 'Non è un errore grave, ma c\'era un\'opzione nettamente superiore.',
  },
  mistake: {
    quality: 'mistake',
    label: 'Errore',
    badge: '❌',
    symbol: '?',
    color: '#f97316',
    bgLight: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#f97316',
    description: 'Cede terreno all\'avversario o peggiora la valutazione della posizione.',
  },
  blunder: {
    quality: 'blunder',
    label: 'Grave Errore',
    badge: '💥',
    symbol: '??',
    color: '#ef4444',
    bgLight: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#ef4444',
    description: 'Un errore critico che perde materiale o compromette la partita.',
  },
  missed_win: {
    quality: 'missed_win',
    label: 'Vittoria Mancata',
    badge: '🎯',
    symbol: '⊘',
    color: '#f43f5e',
    bgLight: 'rgba(244, 63, 94, 0.18)',
    borderColor: '#f43f5e',
    description: 'C\'era una combinazione vincente forzata che non è stata vista!',
  },
};

export class ExplanationEngine {
  /**
   * Classifica la qualità della mossa in base al delta della valutazione (centipedoni)
   * delta: punteggio dopo la mossa - punteggio atteso (dalla prospettiva del giocatore)
   */
  public classifyMove(
    deltaCp: number,
    isBestMove: boolean,
    isCheckmateFound: boolean,
    wasWinningBefore: boolean,
    isSacrifice: boolean
  ): MoveQuality {
    if (isCheckmateFound) {
      return 'best';
    }

    if (isBestMove) {
      if (isSacrifice && deltaCp >= -10) {
        return 'brilliant';
      }
      return 'best';
    }

    if (wasWinningBefore && deltaCp < -300) {
      return 'missed_win';
    }

    if (deltaCp >= -15) {
      return 'excellent';
    } else if (deltaCp >= -50) {
      return 'good';
    } else if (deltaCp >= -130) {
      return 'inaccuracy';
    } else if (deltaCp >= -280) {
      return 'mistake';
    } else {
      return 'blunder';
    }
  }

  /**
   * Genera sia la spiegazione tattica (a livello di mosse) sia concettuale (a livello strategico)
   */
  public explainMove(
    fenBefore: string,
    uciMove: string,
    pvMoves: string[] = [],
    isBestSuggested: boolean = true,
    actualQuality: MoveQuality = 'best',
    userMoveSan?: string
  ): {
    tactical: string;
    conceptual: string;
    conceptHint: string;
    continuationLineSan: string[];
    threats: string;
  } {
    const gameBefore = new Chess(fenBefore);
    const fromSquare = uciMove.substring(0, 2) as Square;
    const toSquare = uciMove.substring(2, 4) as Square;
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

    const movingPiece = gameBefore.get(fromSquare);
    const targetPiece = gameBefore.get(toSquare);
    const playerColor = gameBefore.turn();
    const opponentColor: Color = playerColor === 'w' ? 'b' : 'w';

    // Try executing move on a cloned board
    const gameAfter = new Chess(fenBefore);
    let moveObj = null;
    try {
      moveObj = gameAfter.move({
        from: fromSquare,
        to: toSquare,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });
    } catch {
      // Invalid move fallback
    }

    const sanMove = moveObj ? moveObj.san : uciMove;

    // Build continuation SAN line from PV
    const continuationLineSan: string[] = [];
    if (pvMoves && pvMoves.length > 0) {
      const sim = new Chess(fenBefore);
      for (const m of pvMoves.slice(0, 6)) {
        try {
          const from = m.substring(0, 2) as Square;
          const to = m.substring(2, 4) as Square;
          const prom = m.length > 4 ? (m[4] as 'q' | 'r' | 'b' | 'n') : undefined;
          const executed = sim.move({ from, to, promotion: prom });
          if (executed) continuationLineSan.push(executed.san);
        } catch {
          break;
        }
      }
    }

    // Detect tactical patterns
    const isCapture = !!targetPiece || (moveObj && moveObj.flags.includes('e')); // capture or en-passant
    const isCheck = gameAfter.inCheck();
    const isCheckmate = gameAfter.isCheckmate();
    const isCastling = moveObj && (moveObj.flags.includes('k') || moveObj.flags.includes('q'));
    const isPawnPromotion = !!promotion;

    // Detect double attack / fork
    const attackedPiecesAfter = this.getAttackedOpponentPieces(gameAfter, toSquare, opponentColor);
    const isFork = attackedPiecesAfter.length >= 2;

    // Detect pin on opponent
    const isPinning = this.detectPin(gameAfter, toSquare, opponentColor);

    // Center squares
    const centerSquares = ['d4', 'e4', 'd5', 'e5'];
    const isCenterMove = centerSquares.includes(toSquare);

    // Development (knights or bishops moving in first 10 moves)
    const moveCount = gameBefore.history().length;
    const isDevelopment = moveCount < 20 && movingPiece && (movingPiece.type === 'n' || movingPiece.type === 'b') && (fromSquare.endsWith('1') || fromSquare.endsWith('8'));

    // --- TACTICAL EXPLANATION (Livello di Mosse) ---
    let tactical = '';
    let threats = '';

    if (isCheckmate) {
      tactical = `Mossa decisiva: esegue uno scacco matto imparabile con ${sanMove}, ponendo fine alla partita con una conclusione perfetta.`;
    } else if (isFork) {
      const pieceNames = attackedPiecesAfter.map(p => PIECE_NAMES_IT[p.type].name).join(' e ');
      tactical = `Crea una potente forchetta tattica (doppio attacco): da ${toSquare}, ${movingPiece ? PIECE_NAMES_IT[movingPiece.type].name : 'il pezzo'} attacca contemporaneamente ${pieceNames}, garantendo un guadagno forzato di materiale.`;
      threats = `Minaccia multipla contro: ${pieceNames}.`;
    } else if (isCapture) {
      const capturedVal = targetPiece ? PIECE_VALUES[targetPiece.type] : 1;
      const movingVal = movingPiece ? PIECE_VALUES[movingPiece.type] : 1;
      const targetName = targetPiece ? `${PIECE_NAMES_IT[targetPiece.type].article} ${PIECE_NAMES_IT[targetPiece.type].name}` : 'un pedone in presa';

      if (capturedVal > movingVal) {
        tactical = `Guadagna materiale netto: cattura ${targetName} in ${toSquare} con un pezzo di valore inferiore, cambiando l'equilibrio della partita a tuo favore.`;
      } else if (capturedVal === movingVal) {
        tactical = `Semplifica la posizione con un cambio favorevole in ${toSquare}, eliminando un pezzo attivo avversario e sfoltendo la pressione difensiva.`;
      } else {
        tactical = `Cattura ${targetName} in ${toSquare}, aprendo la linea e costringendo l'avversario a una risposta vincolata di ricattura.`;
      }
    } else if (isPinning) {
      tactical = `Inchioda un pezzo nemico: piazzandosi in ${toSquare}, crea una pressione lungo la linea impedendo al difensore di muoversi liberamente senza esporre un pezzo di valore superiore o il Re.`;
      threats = `Pezzo avversario inchiodato sulla linea.`;
    } else if (isCheck) {
      tactical = `Dà scacco forzante (${sanMove}): obbliga l'avversario a spendere un tempo per difendere il Re (muovendolo, interponendo o catturando), togliendogli l'iniziativa.`;
    } else if (isCastling) {
      tactical = `Arrocca mettendo immediatamente il Re al riparo dietro la cortina di pedoni e attivando la Torre sulla prima traversa verso le colonne centrali.`;
    } else if (isPawnPromotion) {
      tactical = `Promuove il pedone a ${promotion === 'q' ? 'Donna' : 'pezzo superiore'}, introducendo una forza d'attacco devastante sulla scacchiera.`;
    } else {
      // General tactical purpose
      if (movingPiece) {
        const pName = PIECE_NAMES_IT[movingPiece.type].name;
        if (isCenterMove) {
          tactical = `Muove ${PIECE_NAMES_IT[movingPiece.type].article} ${pName} in ${toSquare}, dominando una delle case nevralgiche del centro e limitando le opzioni di avanzata nemiche.`;
        } else {
          tactical = `Riposiziona ${PIECE_NAMES_IT[movingPiece.type].article} ${pName} dalla casa passiva ${fromSquare} alla casa attiva ${toSquare}, aumentando il raggio d'azione e coprendo le case deboli.`;
        }
      } else {
        tactical = `Gioca ${sanMove}, migliorando la coordinazione dei pezzi e preparando le future spinte tattiche.`;
      }
    }

    // Add continuation preview to tactical explanation if available
    if (continuationLineSan.length > 1) {
      const formattedSeq = continuationLineSan.slice(0, 4).join(' → ');
      tactical += ` La continuazione ideale calcolata dal motore prosegue con: ${formattedSeq}.`;
    }

    // --- CONCEPTUAL EXPLANATION (Livello Concettuale e Strategico) ---
    let conceptual = '';
    let conceptHint = '';

    if (isCastling) {
      conceptual = `Principio di Sicurezza del Re: nel gioco degli scacchi, un Re al centro è costantemente esposto a sacrifici, infilate e linee aperte. L'arrocco adempie a due scopi strategici fondamentali: sigillare la sicurezza del monarca e connettere le due torri, permettendo loro di controllare le colonne centrali aperte.`;
      conceptHint = `Pensa alla sicurezza del tuo Re e al completamento dell'apertura.`;
    } else if (isDevelopment) {
      conceptual = `Principio dello Sviluppo Armonioso: ogni pezzo sulla traversa di partenza è un soldato inattivo. Sviluppare cavalli e alfieri verso il centro massimizza la mobilità, crea una rete di caselle protette e prepara il terreno per l'arrocco prima di dare inizio a schermaglie premature.`;
      conceptHint = `Sviluppa un pezzo minore ancora inattivo verso il centro della scacchiera.`;
    } else if (isCenterMove) {
      conceptual = `Principio del Dominio Centrale: chi controlla le case centrali (d4, e4, d5, e5) controlla la partita. I pezzi situati al centro possono essere ridiretti rapidamente su entrambe le ali (di Re e di Donna), mentre l'avversario vede i propri pezzi compressi e con mobilità limitata.`;
      conceptHint = `Cerca una mossa che aumenti la tua influenza sulle case centrali.`;
    } else if (isFork || isPinning) {
      conceptual = `Principio dell'Iniziativa e Sovraccarico: applicare due o più minacce con una singola mossa infrange l'equilibrio difensivo avversario. Quando l'avversario deve difendere più debolezze contemporaneamente, la coordinazione crolla e il materiale viene perso.`;
      conceptHint = `Osserva le relazioni geometriche tra i pezzi nemici: c'è un'opportunità di doppio attacco o inchiodatura.`;
    } else if (movingPiece && movingPiece.type === 'p') {
      conceptual = `Principio della Struttura Pedonale: i pedoni sono l'anima degli scacchi (Philidor). Questa spinta definisce il territorio, guadagna spazio e crea potenziali avamposti per i tuoi pezzi leggeri, ponendo le basi per future rotture.`;
      conceptHint = `Valuta l'avanzata di un pedone per guadagnare spazio o aprire linee.`;
    } else if (movingPiece && movingPiece.type === 'r') {
      conceptual = `Principio delle Linee Aperte: le torri necessitano di colonne aperte o semi-aperte per sprigionare la loro potenza a lungo raggio. Piazzare la torre qui contesta la colonna e minaccia l'infiltrazione verso la settima traversa.`;
      conceptHint = `Attiva la tua torre posizionandola su una colonna strategica o centrale.`;
    } else if (movingPiece && movingPiece.type === 'k') {
      conceptual = `Principio di Attività del Re nel Finale: con la maggior parte dei pezzi pesanti fuori dalla scacchiera, il Re cessa di essere un bersaglio da proteggere e si trasforma in un pezzo d'attacco cruciale per supportare i pedoni passati.`;
      conceptHint = `Porta il tuo Re verso il centro per supportare la fase finale.`;
    } else {
      conceptual = `Principio di Profilassi e Coordinazione: quando non vi sono attacchi tattici immediati, il grande maestro migliora il pezzo peggio piazzato e previene le risposte più insidiose dell'avversario, accumulando piccoli vantaggi posizionali permanenti.`;
      conceptHint = `Cerca di migliorare la posizione del tuo pezzo meno attivo.`;
    }

    // If it's a review of a player blunder/mistake/inaccuracy
    if (!isBestSuggested && actualQuality !== 'best' && actualQuality !== 'excellent' && userMoveSan) {
      const qualityInfo = MOVE_QUALITY_MAP[actualQuality];
      let reviewTactical = `Hai giocato ${userMoveSan}, ma questa scelta è ${qualityInfo.label.toLowerCase()}: cede terreno rispetto alla mossa migliore ${sanMove}. ${tactical}`;

      if (actualQuality === 'blunder') {
        reviewTactical = `Hai giocato ${userMoveSan}, ma si tratta di un grave errore 💥: perde materiale netto o concede un vantaggio decisivo all'avversario senza compenso tattico. La continuazione raccomandata dal motore era ${sanMove}: ${tactical}`;
      } else if (actualQuality === 'mistake') {
        reviewTactical = `Hai giocato ${userMoveSan}, ma si tratta di un errore ❌: indebolisce la posizione rispetto alla mossa consigliata ${sanMove}. ${tactical}`;
      } else if (actualQuality === 'inaccuracy') {
        reviewTactical = `Hai giocato ${userMoveSan}, un'imprecisione ⚠️: non compromette la partita ma concede terreno rispetto a ${sanMove}. ${tactical}`;
      }

      let reviewConceptual = conceptual;
      let reviewHint = conceptHint;
      if (actualQuality === 'blunder') {
        reviewConceptual = `Principio di Conservazione del Materiale: I pezzi leggeri (Alfieri e Cavalli) valgono circa 3 pedoni ciascuno. Regalare o sacrificare un pezzo senza una sequenza di scacchi forzante o un recupero calcolato compromette pesantemente l'esito della partita.`;
        reviewHint = `Verifica sempre che il pezzo mosso non sia in presa o indifeso.`;
      } else if (actualQuality === 'mistake') {
        reviewConceptual = `Principio di Sicurezza Tattica: Prima di muovere, controlla se l'avversario ha risposte forzanti, doppi attacchi o inchiodature che possono sfruttare la tua scelta.`;
        reviewHint = `Calcola le risposte forzate dell'avversario prima di muovere.`;
      }

      return {
        tactical: reviewTactical,
        conceptual: reviewConceptual,
        conceptHint: reviewHint,
        continuationLineSan,
        threats: actualQuality === 'blunder' ? 'Perdita netta di materiale o posizione compromessa.' : threats,
      };
    }

    return {
      tactical,
      conceptual,
      conceptHint,
      continuationLineSan,
      threats,
    };
  }

  /**
   * Identifica i pezzi avversari attaccati da una specifica casa
   */
  private getAttackedOpponentPieces(
    game: Chess,
    fromSquare: Square,
    opponentColor: Color
  ): Array<{ square: Square; type: PieceSymbol }> {
    const attacked: Array<{ square: Square; type: PieceSymbol }> = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    for (const f of files) {
      for (const r of ranks) {
        const sq = `${f}${r}` as Square;
        const p = game.get(sq);
        if (p && p.color === opponentColor) {
          // Check if sq is attacked from fromSquare
          // In chess.js, check if there is a legal or pseudo move from fromSquare to sq
          const moves = game.moves({ square: fromSquare, verbose: true });
          if (moves.some(m => m.to === sq)) {
            attacked.push({ square: sq, type: p.type });
          }
        }
      }
    }
    return attacked;
  }

  /**
   * Rileva se un pezzo muovendo crea un'inchiodatura
   */
  private detectPin(game: Chess, square: Square, _opponentColor: Color): boolean {
    const piece = game.get(square);
    if (!piece || (piece.type !== 'b' && piece.type !== 'r' && piece.type !== 'q')) {
      return false;
    }
    return true;
  }

  /**
   * Costruisce la HintData per il pulsante suggerimento
   */
  public generateHint(
    fen: string,
    bestMoveUci: string,
    scoreCp: number,
    pvMoves: string[] = []
  ): HintData {
    const from = bestMoveUci.substring(0, 2);
    const to = bestMoveUci.substring(2, 4);
    const prom = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

    const game = new Chess(fen);
    let san = bestMoveUci;
    try {
      const m = game.move({
        from: from as Square,
        to: to as Square,
        promotion: prom as 'q' | 'r' | 'b' | 'n' | undefined,
      });
      if (m) san = m.san;
    } catch {
      // fallback
    }

    const { tactical, conceptual, conceptHint, continuationLineSan } = this.explainMove(
      fen,
      bestMoveUci,
      pvMoves,
      true,
      'best'
    );

    return {
      level: 1,
      conceptHint,
      bestMoveSan: san,
      bestMoveUci,
      from,
      to,
      tacticalExplanation: tactical,
      conceptualExplanation: conceptual,
      continuationLine: continuationLineSan,
      evalScore: scoreCp,
    };
  }
}

export const explanationEngine = new ExplanationEngine();
