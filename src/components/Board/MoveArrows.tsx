import React from 'react';
import { PlayerColor } from '../../types/chess';

interface ArrowDef {
  from: string; // e.g. 'e2'
  to: string;   // e.g. 'e4'
  color?: string; // CSS color
  opacity?: number;
  width?: number;
}

interface MoveArrowsProps {
  arrows: ArrowDef[];
  orientation: PlayerColor;
}

export const MoveArrows: React.FC<MoveArrowsProps> = ({ arrows, orientation }) => {
  if (!arrows || arrows.length === 0) return null;

  const getSquareCenter = (sq: string): { x: number; y: number } => {
    const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(sq[1], 10) - 1;

    let col = file;
    let row = 7 - rank;

    if (orientation === 'b') {
      col = 7 - file;
      row = rank;
    }

    // Centered percentage coordinates (0 - 100)
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5,
    };
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
      <defs>
        <marker
          id="arrowhead-emerald"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0.5, 3.5 2, 0 3.5" fill="#10b981" />
        </marker>
        <marker
          id="arrowhead-amber"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0.5, 3.5 2, 0 3.5" fill="#f59e0b" />
        </marker>
        <marker
          id="arrowhead-rose"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0.5, 3.5 2, 0 3.5" fill="#f43f5e" />
        </marker>
        <marker
          id="arrowhead-cyan"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0.5, 3.5 2, 0 3.5" fill="#06b6d4" />
        </marker>
      </defs>

      {arrows.map((arr, i) => {
        const start = getSquareCenter(arr.from);
        const end = getSquareCenter(arr.to);

        // Shorten line slightly so arrow head sits right before the square center
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;

        const offsetEnd = 3.5;
        const targetX = end.x - (dx / len) * offsetEnd;
        const targetY = end.y - (dy / len) * offsetEnd;

        let markerId = 'arrowhead-emerald';
        let strokeColor = '#10b981';

        if (arr.color?.includes('amber') || arr.color?.includes('f59e0b')) {
          markerId = 'arrowhead-amber';
          strokeColor = '#f59e0b';
        } else if (arr.color?.includes('rose') || arr.color?.includes('red') || arr.color?.includes('f43f5e')) {
          markerId = 'arrowhead-rose';
          strokeColor = '#f43f5e';
        } else if (arr.color?.includes('cyan') || arr.color?.includes('06b6d4')) {
          markerId = 'arrowhead-cyan';
          strokeColor = '#06b6d4';
        }

        return (
          <g key={`${arr.from}-${arr.to}-${i}`}>
            {/* Subtle glow filter */}
            <line
              x1={start.x}
              y1={start.y}
              x2={targetX}
              y2={targetY}
              stroke={strokeColor}
              strokeWidth={arr.width ? arr.width + 1.5 : 3.5}
              strokeOpacity={0.3}
              strokeLinecap="round"
            />
            {/* Main arrow shaft */}
            <line
              x1={start.x}
              y1={start.y}
              x2={targetX}
              y2={targetY}
              stroke={strokeColor}
              strokeWidth={arr.width || 2}
              strokeOpacity={arr.opacity || 0.85}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      })}
    </svg>
  );
};
