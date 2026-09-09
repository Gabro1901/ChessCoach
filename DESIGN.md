---
name: Chess Coach AI
description: Studio scacchistico con Istruttore StockFish a forza regolabile, revisione in tempo reale alla massima potenza e spiegazione duale (tattica a livello di mosse e strategica a livello concettuale).
colors:
  bg-canvas: "#0b0e14"
  bg-panel: "#181e29"
  bg-card: "#222b3c"
  border-main: "#334155"
  accent-emerald: "#10b981"
  accent-amber: "#f59e0b"
  accent-cyan: "#06b6d4"
  accent-danger: "#ef4444"
  board-green-light: "#eeeed2"
  board-green-dark: "#769656"
  board-wood-light: "#f0d9b5"
  board-wood-dark: "#b58863"
  board-slate-light: "#e2e8f0"
  board-slate-dark: "#475569"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
  micro:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "10px"
    fontWeight: 600
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: Chess Coach AI

## Overview
Chess Coach AI ("The Master's Annotated Ledger") unisce il rigore analitico di una sala d'analisi per Grandi Maestri con la pedagogia interattiva moderna. La scacchiera è il fulcro focale dell'esperienza, affiancata da una barra di valutazione reattiva e da un pannello coach che articola le mosse consigliate in linguaggio umano naturale, scomponendole in sequenza tattica e principio strategico fondamentale.

## Colors
- **Sfondo Canvas**: `#0b0e14` (ossidiana scura, azzera l'affaticamento visivo durante lunghe sessioni).
- **Contenitori Primari**: `#181e29` e `#222b3c` (ardesia profonda con bordi `#334155`).
- **Valutazione e Virtù**:
  - `Brillante`: Ciano `#06b6d4`
  - `Migliore / Ottima`: Smeraldo `#10b981`
  - `Imprecisione`: Giallo ambra `#eab308`
  - `Errore`: Arancione `#f97316`
  - `Grave Errore (Blunder)`: Rosso rubino `#ef4444`
- **Temi Scacchiera**:
  - Torneo Internazionale: `#eeeed2` (chiare) / `#769656` (scure).
  - Noce Classico: `#f0d9b5` (chiare) / `#b58863` (scure).
  - Ardesia Moderna: `#e2e8f0` (chiare) / `#475569` (scure).

## Typography
- **Inter** come font primario dell'interfaccia: pesi 400, 500, 600, 700, 800 per una gerarchia cristallina.
- **JetBrains Mono** per notazione algebrica SAN/PGN, coordinate, centopedoni e valutazioni ELO.

## Layout
- **Desktop (>= 768px)**: Due colonne principali:
  - Sinistra: Scacchiera a proporzioni perfette (fino a 520px) con barra di valutazione verticale e contatore pezzi catturati.
  - Destra: Cruscotto dell'istruttore, scheda di spiegazione duale, cronologia mosse PGN interattiva e controlli partita.
- **Mobile (< 768px)**: La scacchiera si adatta alla massima larghezza dello schermo senza costrizioni; barra di navigazione inferiore fissa con 3 schede immediate (*Istruttore*, *Partita & PGN*, *Opzioni*).

## Elevation & Depth
- `shadow-board`: Ombra profonda `0 20px 40px -15px rgba(0, 0, 0, 0.7)` per distaccare la scacchiera dallo sfondo.
- `shadow-card`: Ombra morbida `0 10px 25px -5px rgba(0, 0, 0, 0.5)` con bordo sottile `rgba(255, 255, 255, 0.05)`.
- Frecce vettoriali con glow filter e indicatori semitrasparenti per non oscurare i pezzi.

## Shapes
- Angoli arrotondati calibrati: `rounded-2xl` (16px) per le schede, `rounded-xl` (12px) per i bottoni interattivi, `rounded-full` per i pallini di mossa legale.

## Components
- **ChessBoard**: Scacchiera touch-friendly con tap-to-move, indicatori di mossa legale verdi, anelli per cattura, scacco in rosso e frecce SVG dinamiche.
- **EvalBar**: Barra di valutazione verticale fluida con calcolo probabilistico sigmoide e visualizzazione matto.
- **ExplanationCard**: Scheda a doppio binario:
  - *Tattica (Mosse)*: sequenza di calcolo, forchette, inchiodature, pezzi sospesi.
  - *Concettuale (Strategia)*: principi posizionali in italiano (centro, sviluppo, sicurezza Re, profilassi).
- **MoveBadge**: Badge di qualità della mossa con icona, etichetta e variazione centopedoni.
- **PromotionModal**: Selezione rapida con un tocco per la promozione del pedone.

## Do's and Don'ts
- **DO**: Spiegare sempre *perché* una mossa è consigliata a entrambi i livelli (concreto e concettuale).
- **DO**: Garantire che il tocco su mobile funzioni immediatamente (tap casella partenza -> tap casella arrivo).
- **DO**: Mantenere la valutazione Stockfish coerente (positivo = vantaggio Bianco).
- **DON'T**: Mostrare solo la linea algebrica senza spiegazione concettuale.
- **DON'T**: Usare colori di contrasto deboli o testi grigi su sfondi colorati.
