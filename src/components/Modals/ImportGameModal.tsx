import React, { useState } from 'react';
import {
  X,
  Upload,
  FileCode2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ImportGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (input: string) => { success: boolean; error?: string };
}

const SAMPLE_GAMES = [
  {
    label: 'Partita dell\'Opera (Morphy)',
    data: `[Event "Paris Opera"]
[Site "Paris FRA"]
[Date "1858.10.21"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    label: 'Difesa Siciliana Aperta',
    data: `[Event "Esempio Siciliana"]
[Site "Online"]
[Date "2024.01.01"]
[White "Giocatore 1"]
[Black "Giocatore 2"]
[Result "*"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 *`,
  },
  {
    label: 'Posizione FEN (Tattica)',
    data: 'r1bqk2r/pp2bppp/2n5/3pP3/2pP4/2N1BN2/PP3PPP/R2Q1RK1 w kq - 0 11',
  },
];

export const ImportGameModal: React.FC<ImportGameModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleImportSubmit = () => {
    setError(null);
    if (!input.trim()) {
      setError('Incolla una partita in formato PGN o una notazione FEN valida.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = onImport(input);
      setIsProcessing(false);
      if (res.success) {
        setInput('');
        onClose();
      } else {
        setError(res.error || 'Formato PGN o FEN non valido.');
      }
    }, 50);
  };

  const handleApplySample = (sampleText: string) => {
    setInput(sampleText);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#141a24] border border-slate-700 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Importa Partita (PGN / FEN)</h3>
              <p className="text-xs text-slate-400">
                Importa da Chess.com, Lichess o altri software per analisi e varianti
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Buttons */}
        <div className="mb-3 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Esempi rapidi per provare subito:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SAMPLE_GAMES.map((sample) => (
              <button
                key={sample.label}
                onClick={() => handleApplySample(sample.data)}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium border border-slate-700/60 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="flex-1 flex flex-col min-h-0 mb-4">
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            Testo PGN o stringa FEN:
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Incolla qui il testo PGN completo o la notazione FEN..."
            rows={8}
            className="w-full flex-1 bg-[#10151f] border border-slate-700 rounded-2xl p-3.5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 resize-none scrollbar-thin scrollbar-thumb-slate-700"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 mb-4 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Annulla
          </button>
          <button
            onClick={handleImportSubmit}
            disabled={isProcessing || !input.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-blue-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Analisi in corso...' : 'Importa ed Analizza'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
