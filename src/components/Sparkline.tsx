import React, { useMemo } from 'react';

interface SparklineProps {
  scores: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  scores,
  width = 140,
  height = 36,
  strokeColor = '#f59e0b', // Amber 500
  fillColor = 'rgba(245, 158, 11, 0.1)', // Amber with opacity
  lineWidth = 2,
}) => {
  // Ensure we have data to plot
  const points = useMemo(() => {
    if (!scores || scores.length === 0) return '';
    
    const minVal = Math.min(...scores);
    const maxVal = Math.max(...scores);
    const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    
    // Add 10% padding to bounds for elegant framing
    const yMin = Math.max(0, minVal - valRange * 0.1);
    const yMax = Math.min(100, maxVal + valRange * 0.1);
    const yRange = yMax - yMin;

    const xStep = width / (scores.length - 1 || 1);

    return scores.map((score, index) => {
      const x = index * xStep;
      // SVG coordinate system starts at top-left, so invert Y
      const y = height - ((score - yMin) / yRange) * (height - 6) - 3;
      return { x, y };
    });
  }, [scores, width, height]);

  const linePath = useMemo(() => {
    if (!points || points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  const fillPath = useMemo(() => {
    if (!points || points.length === 0) return '';
    return `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
  }, [points, linePath, height]);

  const lastPoint = points ? points[points.length - 1] : null;

  return (
    <div className="inline-flex items-center gap-2 select-none" style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        {fillPath && (
          <path
            d={fillPath}
            fill="url(#sparkline-grad)"
            className="transition-all duration-300"
          />
        )}

        {/* Stroke Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Pulse & Point Highlight on Current (Last) Value */}
        {lastPoint && (
          <>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={4}
              fill={strokeColor}
              className="animate-ping"
              style={{ transformOrigin: `${lastPoint.x}px ${lastPoint.y}px`, animationDuration: '2s' }}
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={3}
              fill={strokeColor}
              stroke="#0f172a" // Deep slate matching background
              strokeWidth={1}
            />
          </>
        )}
      </svg>
    </div>
  );
};
