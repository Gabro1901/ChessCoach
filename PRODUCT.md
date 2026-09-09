# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
delegated: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + chess.js + Stockfish Web Workers (client-side UCI engine)

## Users
Appassionati e studenti di scacchi (dai principianti ai giocatori intermedi e avanzati) che desiderano giocare contro un istruttore virtuale con forza regolabile, comprendendo a fondo non solo la valutazione numerica o la sequenza algebrica della mossa consigliata, ma la vera spiegazione pedagogica: sia a livello concreto di mosse/tattiche, sia a livello concettuale/strategico.

## Product Purpose
Offrire una web app moderna, reattiva e utilizzabile su desktop e mobile (smartphone/tablet), che simula l'esperienza dell'istruttore di scacchi di Chess.com, risolvendone il difetto fondamentale: la mancanza di spiegazioni chiare del perché una mossa è considerata "migliore". La web app fornisce:
1. Partita giocabile contro Stockfish con livello di difficoltà/ELO personalizzabile.
2. Analizzatore Stockfish in tempo reale a massima potenza in background che valuta ogni mossa e calcola la mossa migliore.
3. Classificazione della qualità di ogni mossa (Brillante, Migliore, Ottima, Buona, Imprecisione, Errore, Blunder).
4. Suggerimento ("Hint") a due livelli: indizio concettuale e mossa migliore completa.
5. Motore di spiegazione duale:
   - Spiegazione a livello di mosse: continuazione tattica, minacce, pezzi indifesi, forchette, inchiodature, sacrifici.
   - Spiegazione a livello concettuale: principi strategici (controllo del centro, sviluppo pezzi, sicurezza del Re, struttura pedonale, avamposti, colonne aperte, profilassi).

## Positioning
A differenza di Chess.com e Lichess dove le frecce del motore e i valori dei centopedoni lasciano spesso il principiante/intermedio senza capire il "senso" del piano, Chess Coach AI agisce come un istruttore paziente che traduce il calcolo del motore in concetti umani e linee logiche commentate in italiano naturale.

## Operating Context
Allenamento interattivo da browser sia su desktop che su mobile. Partite rapide o sessioni di studio prolungate, con comandi touch ottimizzati (tap-to-move e drag-and-drop), suoni realistici e layout adattivo che pone scacchiera, barra di valutazione e pannello dell'istruttore in perfetta armonia visiva.

## Capabilities and Constraints
- Gioco contro bot istruttore Stockfish regolabile (Principiante ~800 ELO, Amatore ~1200 ELO, Intermedio ~1500 ELO, Avanzato ~1800 ELO, Maestro ~2200 ELO, Gran Maestro ~2800+ ELO).
- Motore di analisi continuo a profondità elevata in background Web Worker con barra di valutazione dinamica (Eval bar) e stima della percentuale di vittoria (Win chance %).
- Classificazione della correttezza di ogni mossa con badge visivo e spiegazione dell'errore (confronto con la mossa migliore e differenza in centopedoni).
- Sistema di spiegazione pedagogica strutturata per la mossa migliore e per gli errori commessi:
  * Dimensione tattica: minacce immediate, risposte forzate, guadagno/perdita materiale, motivi tattici.
  * Dimensione concettuale: idee posizionali, piani strategici a medio termine, principi di apertura/mediogioco/finale.
- Tasto "Suggerimento" con modalità "Indizio" (ti spinge a riflettere senza svelare la mossa) e "Soluzione" (mostra la mossa, la freccia e la spiegazione completa).
- Scacchiera touch-friendly per mobile e mouse su desktop: tap-to-move, drag-and-drop, evidenziazione case di destinazione legali, coordinate algebriche chiare, frecce di suggerimento e minaccia visiva.
- Cronologia mosse PGN interattiva con possibilità di navigazione e riesame.
- Effetti sonori di scacchi sintetizzati con Web Audio API (zero dipendenze esterne bloccate da CORS) per mossa, cattura, scacco e vittoria/sconfitta.
- Modalità capovolgi scacchiera (gioca col Bianco o col Nero).
- Resa estetica impeccabile: Dark Mode elegante "Grandmaster Study", contrasto elevato, design tipografico e responsive design senza scroll orizzontali.

## Brand Commitments
Stile pulito, accademico e tecnologico ("Grandmaster Study"): scacchiera classica in toni legno caldo/ardesia moderna, cruscotto scuro antracite con accenti verde brillante/ambra per le valutazioni, tipografia nitida e badge di mossa ad alta leggibilità.

## Evidence on Hand
Richiesta utente esplicita:
- Ispirazione alla modalità partita con istruttore di Chess.com con Stockfish regolabile.
- Revisione in tempo reale con Stockfish alla massima potenza.
- Suggerimento della mossa "best" con spiegazione del perché sia a livello di mosse che a livello concettuale.
- Perfetto funzionamento anche su mobile.

## Product Principles
1. La spiegazione è il valore: la mossa senza spiegazione è solo rumore; ogni consiglio deve chiarire l'intento scacchistico.
2. Dualità tattico-concettuale: una mossa è sia calcolo concreto sia principio strategico; spiegarli entrambi simultaneamente.
3. Precisione di gioco garantita: Stockfish via Web Worker calcola legalità, mosse e valutazioni UCI reali.
4. Mobile-first ergonomics: su smartphone la scacchiera deve occupare lo spazio ideale senza sacrificare la chat/pannello dell'istruttore.

## Accessibility & Inclusion
Contrasto WCAG AA garantito, indicatori di testo accanto a quelli di colore per la classificazione delle mosse, supporto completo per interazione touch senza trascinamenti forzati.
