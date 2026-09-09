import React from 'react';
import { X, Crown, Lightbulb, Brain, Shield, Award } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#181e29] border border-slate-700 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Guida all'Istruttore Scacchi AI</h3>
              <p className="text-xs text-slate-400">Come funziona la revisione pedagogica in tempo reale</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>1. Partite contro l'Istruttore Regolabile</span>
            </div>
            <p className="text-slate-400 text-xs">
              Puoi selezionare la forza di gioco di StockFish da 800 ELO (Novizio) fino a 2850+ ELO (Gran Maestro). Il motore gioca alla forza selezionata, simulando imprecisioni tipiche umane nei livelli inferiori.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>2. Revisione in Tempo Reale alla Massima Potenza</span>
            </div>
            <p className="text-slate-400 text-xs">
              In background, una seconda istanza di Stockfish lavora alla massima profondità di calcolo per valutare ogni tua mossa (Brillante, Migliore, Ottima, Imprecisione, Errore, Blunder) e aggiornare la barra di valutazione dinamica.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>3. Suggerimento Pedagogico a Due Livelli</span>
            </div>
            <p className="text-slate-400 text-xs">
              Cliccando su <strong>Suggerimento</strong> ricevi prima un <em>Indizio Concettuale</em> per stimolare il tuo ragionamento autonomo. Se vuoi la soluzione, con un tocco sveli la mossa migliore con tanto di freccia direzionale sulla scacchiera.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>4. Spiegazione Duale: Mosse & Concetti</span>
            </div>
            <p className="text-slate-400 text-xs">
              La vera rivoluzione rispetto alle piattaforme tradizionali: ogni mossa consigliata o analizzata include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
              <li>
                <strong className="text-emerald-400">A livello di mosse (Tattica)</strong>: sequenza di calcolo, forchette, inchiodature, pezzi sospesi, minacce di scacco e guadagno di materiale.
              </li>
              <li>
                <strong className="text-amber-400">A livello concettuale (Strategia)</strong>: principi generali (controllo del centro, armoniosità dello sviluppo, sicurezza del Re e arrocco, struttura pedonale, colonne aperte e profilassi).
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Ho capito, giochiamo!
          </button>
        </div>
      </div>
    </div>
  );
};
