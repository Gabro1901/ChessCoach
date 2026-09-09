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
    <div className="relative flex flex-col items-center w-full h-full rounded-lg overflow-hidden bg-[#1e293b] border border-slate-700/80 shadow-md select-none">
      {/* Top section (Black if orientation White, White if orientation Black) */}
      <div
        className="w-full bg-[#181e29] transition-all duration-500 ease-out flex items-start justify-center pt-1 px-0.5 overflow-hidden"
        style={{ height: `${topPercent}%` }}
      >
        {topPercent > 16 && (
          <span
            className={`font-sans font-bold tabular-nums tracking-tighter text-slate-300 leading-none whitespace-nowrap text-center block w-full select-none ${
              label.length >= 5 ? 'text-[8px] sm:text-[9px] md:text-[10px]' : 'text-[9px] sm:text-[10px] md:text-xs'
            }`}
          >
            {orientation === 'w' ? (score < 0 || (mate && mate < 0) ? label : '') : (score > 0 || (mate && mate > 0) ? label : '')}
          </span>
        )}
      </div>

      {/* Bottom section */}
      <div
        className="w-full bg-[#f8fafc] transition-all duration-500 ease-out flex items-end justify-center pb-1 px-0.5 overflow-hidden"
        style={{ height: `${100 - topPercent}%` }}
      >
        {100 - topPercent > 16 && (
          <span
            className={`font-sans font-bold tabular-nums tracking-tighter text-slate-900 leading-none whitespace-nowrap text-center block w-full select-none ${
              label.length >= 5 ? 'text-[8px] sm:text-[9px] md:text-[10px]' : 'text-[9px] sm:text-[10px] md:text-xs'
            }`}
          >
            {orientation === 'w' ? (score >= 0 && (!mate || mate >= 0) ? label : '') : (score <= 0 && (!mate || mate <= 0) ? label : '')}
          </span>
        )}
      </div>
    </div>
  );
};
