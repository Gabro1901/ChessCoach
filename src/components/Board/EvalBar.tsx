import React from 'react';
import { PlayerColor } from '../../types/chess';

interface EvalBarProps {
  score: number; // centipawns from White's perspective
  mate?: number | null;
  orientation: PlayerColor;
  winChanceWhite: number; // 0 - 100
}

export const EvalBar: React.FC<EvalBarProps> = ({
  score,
  mate,
  orientation,
  winChanceWhite,
}) => {
  // Determine White's bar height percentage (0 to 100)
  let whitePercent = 50;
  let label = '0.0';

  if (mate !== null && mate !== undefined) {
    if (mate > 0) {
      whitePercent = 100;
      label = `M${mate}`;
    } else {
      whitePercent = 0;
      label = `-M${Math.abs(mate)}`;
    }
  } else {
    // Sigmoid mapping for smooth visual representation (-1000 cp to +1000 cp)
    whitePercent = Math.min(Math.max(winChanceWhite, 3), 97);
    const scoreVal = score / 100;
    label = scoreVal > 0 ? `+${scoreVal.toFixed(1)}` : scoreVal.toFixed(1);
  }

  // If orientation is Black, invert the visual bar representation
  const topPercent = orientation === 'w' ? 100 - whitePercent : whitePercent;

  return (
    <div className="relative flex flex-col items-center w-7 md:w-8 h-full rounded-lg overflow-hidden bg-[#1e293b] border border-slate-700/80 shadow-md select-none">
      {/* Top section (Black if orientation White, White if orientation Black) */}
      <div
        className="w-full bg-[#181e29] transition-all duration-500 ease-out flex items-start justify-center pt-1"
        style={{ height: `${topPercent}%` }}
      >
        {topPercent > 18 && (
          <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300">
            {orientation === 'w' ? (score < 0 || (mate && mate < 0) ? label : '') : (score > 0 || (mate && mate > 0) ? label : '')}
          </span>
        )}
      </div>

      {/* Bottom section */}
      <div
        className="w-full bg-[#f8fafc] transition-all duration-500 ease-out flex items-end justify-center pb-1"
        style={{ height: `${100 - topPercent}%` }}
      >
        {100 - topPercent > 18 && (
          <span className="text-[10px] md:text-xs font-mono font-bold text-slate-800">
            {orientation === 'w' ? (score >= 0 && (!mate || mate >= 0) ? label : '') : (score <= 0 && (!mate || mate <= 0) ? label : '')}
          </span>
        )}
      </div>
    </div>
  );
};
