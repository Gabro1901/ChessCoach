# ♟️ ChessCoach AI

> Un'applicazione web moderna per giocare a scacchi e imparare in tempo reale, alimentata da **Stockfish 16+ NNUE WebAssembly** e da un **Istruttore Didattico Bivalente** (analisi tattica immediata e comprensione concettuale a lungo termine).

---

## 🌟 Caratteristiche Principali

### 🧠 Motore Stockfish 16+ NNUE nel Browser
- Esecuzione locale ad alte prestazioni via **WebAssembly (WASM)** e **Web Workers**, senza necessità di server backend.
- Calcolo in tempo reale della barra di valutazione (centipedoni e matto) e frecce visive per la migliore linea consigliata.

### 🎓 Istruttore Didattico Bivalente
- **Spiegazione Tattica Immediata**: dettagli precisi su guadagno di materiale, forchette, inchiodature, pezzi sospesi e minacce concrete.
- **Visione Concettuale / Strategica**: principi di apertura, controllo delle case centrali, struttura pedonale, attività dei pezzi e profilassi.
- **Valutazione Obiettiva delle Mosse**: categorizzazione accurata (*Migliore*, *Ottima*, *Buona*, *Imprecisione*, *Errore*, *Grave Errore*) basata sulla variazione di centipedoni e sul contesto di posizione.

### 🎚️ Calibrazione dell'Avversario (Skill Level & ELO)
- **Preset Rapidi**: Principiante (~800 ELO), Intermedio (~1400 ELO), Maestro (~2000 ELO), Stockfish Max (~3200 ELO).
- **Controllo Granulare**: Slider personalizzato da livello 0 a 20 con calcolo dinamico dell'ELO stimato (~400 - 3200 ELO) e profondità di ricerca configurabile.

### 💾 Gestione Partite & Branching Interattivo
- **Salvataggio Locale**: memorizzazione automatica delle partite giocate con data, risultato, mosse e FEN.
- **Navigazione Storico Mosse**: clicca su qualsiasi mossa nel pannello notazione per riportare la scacchiera a quello stato.
- **Branching delle Varianti**: tornando a una mossa precedente, puoi eseguire una nuova mossa alternativa per esplorare nuove linee di gioco!

### 📥 Importazione Partite Esterne (PGN e FEN)
- Importa partite da **Chess.com**, **Lichess** o database PGN per analizzarle e ricevere i consigli dell'istruttore.
- Supporto per stringhe **FEN** per posizionare qualsiasi situazione di studio o finale.

### 📱 Design Responsive Zero-Scroll & Mobile First
- **Desktop**: scacchiera ad alta risoluzione a pieno schermo affiancata dal pannello dell'istruttore e dalla notazione.
- **Mobile**: interfaccia ottimizzata "Zero-Scroll" a schermo intero con comandi a portata di pollice e pannelli modali/slide-sheet per impostazioni e partite salvate.
- **Pezzi Vettoriali SVG**: grafica nitida e scalabile per tutti i pezzi e tema scacchiera scuro obsidian/wood.
- **Audio Sintetico Web Audio API**: feedback sonoro per mosse, catture, scacchi e fine partita.

---

## 🛠️ Stack Tecnologico

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Stile & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Motore Scacchistico**: Stockfish 16+ NNUE compilato in WebAssembly (`stockfish.js`, `stockfish.wasm`)
- **Regole & Logica**: [chess.js](https://github.com/jhlywa/chess.js)

---

## 🚀 Guida all'Installazione e Avvio Locale

### Prerequisiti
- [Node.js](https://nodejs.org/) (versione 18.x o superiore consigliata)
- `npm` (incluso con Node.js)

### 1. Clonare il repository
```bash
git clone https://github.com/Gabro1901/ChessCoach.git
cd ChessCoach
```

### 2. Installare le dipendenze
```bash
npm install
```

### 3. Avviare il server di sviluppo
```bash
npm run dev
```
L'applicazione sarà accessibile all'indirizzo `http://localhost:5173`.

### 4. Compilazione per la Produzione
```bash
npm run build
```
I file ottimizzati per la produzione verranno generati nella cartella `dist/`. Per provarli localmente:
```bash
npm run preview
```

---

## 📁 Struttura della Cartella `src/`

```text
src/
├── components/
│   ├── Board/               # Scacchiera, pezzi SVG, barra valutazione, frecce
│   │   ├── ChessBoard.tsx
│   │   ├── ChessPieces.tsx
│   │   ├── EvalBar.tsx
│   │   ├── MoveArrows.tsx
│   │   └── PromotionModal.tsx
│   ├── Coach/               # Pannello istruttore didattico e carte spiegazione
│   │   ├── CoachPanel.tsx
│   │   ├── ExplanationCard.tsx
│   │   ├── InfoModal.tsx
│   │   └── MoveBadge.tsx
│   ├── Controls/            # Notazione mosse, pezzi catturati, selettore livello/impostazioni
│   │   ├── CapturedPieces.tsx
│   │   ├── GameSettings.tsx
│   │   └── MoveHistory.tsx
│   ├── Layout/              # Header e SlideSheet per mobile
│   │   ├── Header.tsx
│   │   └── SlideSheet.tsx
│   └── Modals/              # Finestre modali per importazione PGN e partite salvate
│       ├── ImportGameModal.tsx
│       └── SavedGamesModal.tsx
├── engine/                  # Servizi per Stockfish, spiegazioni didattiche, audio e storage
│   ├── engineLevels.ts
│   ├── explanationEngine.ts
│   ├── gameStorageService.ts
│   ├── localEngine.ts
│   ├── soundService.ts
│   └── stockfishService.ts
├── hooks/                   # Hook principale gestione partita e sincronizzazione engine
│   └── useChessGame.ts
├── types/                   # Definizioni TypeScript
│   └── chess.ts
├── App.tsx                  # Componente radice e layout responsive
└── main.tsx                 # Entrypoint Vite
```

---

## 📜 Licenza

Rilasciato sotto licenza MIT. Libero di essere utilizzato, modificato e distribuito.
