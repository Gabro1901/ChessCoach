import React from 'react';
import { MoveQuality } from '../../types/chess';
import { MOVE_QUALITY_MAP } from '../../engine/explanationEngine';

interface MoveBadgeProps {
  quality: MoveQuality;
  san: string;
  diffCp?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MoveBadge: React.FC<MoveBadgeProps> = ({
  quality,
  san,
  diffCp,
  size = 'md',
}) => {
  const info = MOVE_QUALITY_MAP[quality] || MOVE_QUALITY_MAP.good;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs md:text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-sm md:text-base gap-2',
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg border font-medium transition-all shadow-sm ${sizeClasses[size]}`}
      style={{
        backgroundColor: info.bgLight,
        borderColor: info.borderColor,
        color: info.color,
      }}
    >
      <span className="text-base select-none">{info.badge}</span>
      <span className="font-bold tracking-tight text-white">{san}</span>
      <span className="text-slate-300 font-semibold">{info.label}</span>
      {diffCp !== undefined && Math.abs(diffCp) > 10 && (
        <span
          className={`text-[11px] font-mono px-1 rounded ${
            diffCp > 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
          }`}
        >
          {diffCp > 0 ? `+${(diffCp / 100).toFixed(1)}` : `${(diffCp / 100).toFixed(1)}`}
        </span>
      )}
    </div>
  );
};
