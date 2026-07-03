import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

// 1. Expected JSON Input Structure
export interface DailyComplianceData {
  date: string;              // Format: 'YYYY-MM-DD'
  complianceScore: number;   // 0 - 100
  flaggedIncidents: number;  // integer >= 0
}

interface ComplianceTrendChartProps {
  data: DailyComplianceData[];
  onDataAdd?: (newPoint: DailyComplianceData) => void;
  onClearData?: () => void;
}

export const ComplianceTrendChart: React.FC<ComplianceTrendChartProps> = ({
  data,
  onDataAdd,
  onClearData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<DailyComplianceData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 320 });

  // Handle responsive resize with a ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep a neat aspect ratio but constrain limits
        const newWidth = Math.max(450, width);
        setDimensions({
          width: newWidth,
          height: 320
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Helper to determine status and color based on compliance thresholds
  const getThresholdStatus = (score: number) => {
    if (score >= 90) {
      return {
        label: 'Stable Compliance',
        status: 'stable',
        color: '#10b981', // Green
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
      };
    } else if (score >= 80) {
      return {
        label: 'Cautionary State',
        status: 'cautionary',
        color: '#f59e0b', // Yellow/Amber
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30'
      };
    } else {
      return {
        label: 'Audit Trigger',
        status: 'critical',
        color: '#ef4444', // Red
        bgColor: 'bg-rose-500/10',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/30'
      };
    }
  };

  // Render D3 Line Chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous drawing
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    const { width, height } = dimensions;
    const paddingLeft = 55;
    const paddingRight = 30;
    const paddingTop = 40;
    const paddingBottom = 45;

    // Parse dates and map values
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formattedData = data.map(d => ({
      ...d,
      parsedDate: parseDate(d.date) || new Date()
    })).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    // 1. Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.parsedDate) as [Date, Date])
      .range([paddingLeft, width - paddingRight]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - paddingBottom, paddingTop]);

    // 2. Linear Gradient for the Dynamic Path Color
    // Map colors to percentage heights based on our thresholds (Y goes from top to bottom)
    const getPercent = (score: number) => {
      const yVal = yScale(score);
      const yMax = yScale(100); // top of chart
      const yMin = yScale(0);   // bottom of chart
      return ((yVal - yMax) / (yMin - yMax)) * 100;
    };

    const gradientId = 'compliance-trend-gradient';
    const svgDefs = svgElement.append('defs');

    const linearGradient = svgDefs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    // Add gradient stops
    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981'); // Green at top (100)

    linearGradient.append('stop')
      .attr('offset', `${Math.max(0, getPercent(90))}%`)
      .attr('stop-color', '#10b981'); // Green down to 90

    linearGradient.append('stop')
      .attr('offset', `${Math.max(0, getPercent(90) + 0.1)}%`)
      .attr('stop-color', '#f59e0b'); // Shift to Yellow at 90

    linearGradient.append('stop')
      .attr('offset', `${Math.max(0, getPercent(80))}%`)
      .attr('stop-color', '#f59e0b'); // Yellow down to 80

    linearGradient.append('stop')
      .attr('offset', `${Math.max(0, getPercent(80) + 0.1)}%`)
      .attr('stop-color', '#ef4444'); // Shift to Red at 80

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ef4444'); // Red at bottom (0)

    // Shaded Area Gradient (faded area under curve)
    const areaGradientId = 'compliance-area-gradient';
    const areaGradient = svgDefs.append('linearGradient')
      .attr('id', areaGradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.15);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 0.0);

    // Glow Filter
    const filter = svgDefs.append('filter')
      .attr('id', 'd3-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'blur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 3. Background Threshold Zones (Bands)
    // Red Zone (< 80%)
    svgElement.append('rect')
      .attr('x', paddingLeft)
      .attr('y', yScale(80))
      .attr('width', width - paddingLeft - paddingRight)
      .attr('height', yScale(0) - yScale(80))
      .attr('fill', '#ef4444')
      .attr('fill-opacity', 0.02);

    // Yellow Zone (80% - 90%)
    svgElement.append('rect')
      .attr('x', paddingLeft)
      .attr('y', yScale(90))
      .attr('width', width - paddingLeft - paddingRight)
      .attr('height', yScale(80) - yScale(90))
      .attr('fill', '#f59e0b')
      .attr('fill-opacity', 0.02);

    // Green Zone (90% - 100%)
    svgElement.append('rect')
      .attr('x', paddingLeft)
      .attr('y', yScale(100))
      .attr('width', width - paddingLeft - paddingRight)
      .attr('height', yScale(90) - yScale(100))
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.025);

    // 4. Threshold Boundary Reference Lines
    // Stable Compliance Line (90%)
    svgElement.append('line')
      .attr('x1', paddingLeft)
      .attr('y1', yScale(90))
      .attr('x2', width - paddingRight)
      .attr('y2', yScale(90))
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    svgElement.append('text')
      .attr('x', width - paddingRight - 5)
      .attr('y', yScale(90) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#10b981')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('opacity', 0.7)
      .text('90% SANS Stable');

    // Audit Trigger Line (80%)
    svgElement.append('line')
      .attr('x1', paddingLeft)
      .attr('y1', yScale(80))
      .attr('x2', width - paddingRight)
      .attr('y2', yScale(80))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0.6);

    svgElement.append('text')
      .attr('x', width - paddingRight - 5)
      .attr('y', yScale(80) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#ef4444')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .attr('opacity', 0.8)
      .text('80% Audit Trigger');

    // 5. Gridlines & Axes
    // Y-Axis gridlines (every 20%)
    const yGridValues = [20, 40, 60, 100];
    svgElement.selectAll('.grid-line')
      .data(yGridValues)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', paddingLeft)
      .attr('y1', d => yScale(d))
      .attr('x2', width - paddingRight)
      .attr('y2', d => yScale(d))
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.25);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(formattedData.length, 7))
      .tickFormat(d3.timeFormat('%d %b') as any);

    svgElement.append('g')
      .attr('transform', `translate(0, ${height - paddingBottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#334155').attr('stroke-width', 1))
      .call(g => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('dy', '10px')
      );

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    svgElement.append('g')
      .attr('transform', `translate(${paddingLeft}, 0)`)
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', '#334155').attr('stroke-width', 1))
      .call(g => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('dx', '-4px')
      );

    // 6. Path Generator (Line and Area)
    const lineGenerator = d3.line<any>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.complianceScore))
      .curve(d3.curveMonotoneX); // Smooth bezier curve

    const areaGenerator = d3.area<any>()
      .x(d => xScale(d.parsedDate))
      .y0(height - paddingBottom)
      .y1(d => yScale(d.complianceScore))
      .curve(d3.curveMonotoneX);

    // Append Area under curve
    svgElement.append('path')
      .datum(formattedData)
      .attr('d', areaGenerator)
      .attr('fill', `url(#${areaGradientId})`);

    // Append Main Line Plot (Glow filter applied)
    svgElement.append('path')
      .datum(formattedData)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', `url(#${gradientId})`)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'url(#d3-glow)')
      .style('transition', 'stroke 0.3s ease');

    // 7. Interactive Hover Vertical Guideline
    const hoverLine = svgElement.append('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', paddingTop)
      .attr('y2', height - paddingBottom)
      .style('display', 'none');

    // 8. Dynamic Data Point Circular Markers (Green / Yellow / Red highlights)
    const markersGroup = svgElement.append('g').attr('class', 'markers');
    
    formattedData.forEach((d, idx) => {
      const cx = xScale(d.parsedDate);
      const cy = yScale(d.complianceScore);
      const statusInfo = getThresholdStatus(d.complianceScore);

      // Warning pulse overlay
      if (statusInfo.status === 'critical') {
        markersGroup.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 10)
          .attr('fill', '#ef4444')
          .attr('fill-opacity', 0.25)
          .attr('class', 'animate-pulse');
      }

      // Outer halo circle on hover
      const hoverOuter = markersGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 8)
        .attr('fill', statusInfo.color)
        .attr('fill-opacity', 0.3)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 1)
        .style('display', 'none');

      // Solid central data node
      const centerNode = markersGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', statusInfo.color)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer');

      // Invisible larger target area for easy touch/mouse hovering
      markersGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 16)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          hoverOuter.style('display', 'block');
          centerNode.attr('r', 6.5);
          hoverLine
            .attr('x1', cx)
            .attr('x2', cx)
            .style('display', 'block');
          
          setHoveredData(d);
          
          // Position tooltip
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipPos({
              x: cx + 15,
              y: cy - 40
            });
          }
        })
        .on('mouseleave', () => {
          hoverOuter.style('display', 'none');
          centerNode.attr('r', 4.5);
          hoverLine.style('display', 'none');
          setHoveredData(null);
          setTooltipPos(null);
        });
    });

  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-4 font-sans text-slate-100">
      {/* Visual Status Indicator Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-950/30 p-4 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
          <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stable Zone</span>
            <span className="text-xs font-extrabold text-slate-100">90% - 100% Score</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cautionary Zone</span>
            <span className="text-xs font-extrabold text-slate-100">80% - 89% Score</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
          <span className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"></span>
          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Trigger Zone</span>
            <span className="text-xs font-extrabold text-slate-100">&lt; 80% (Action Needed)</span>
          </div>
        </div>
      </div>

      {/* SVG Stage */}
      <div className="relative w-full bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden p-2">
        <svg
          ref={svgRef}
          width="100%"
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        />

        {/* Hover Tooltip React Overlay */}
        {hoveredData && tooltipPos && (
          <div
            className="absolute bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] z-30 pointer-events-none text-xs font-mono min-w-[210px] backdrop-blur-sm animate-fadeIn"
            style={{
              left: `${Math.min(75, Math.max(5, (tooltipPos.x / dimensions.width) * 100))}%`,
              top: `${Math.min(65, Math.max(5, (tooltipPos.y / dimensions.height) * 100))}%`
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-slate-200 font-bold text-[11px]">
                {d3.timeFormat('%B %d, %Y')(d3.timeParse('%Y-%m-%d')(hoveredData.date) || new Date())}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getThresholdStatus(hoveredData.complianceScore).bgColor} ${getThresholdStatus(hoveredData.complianceScore).textColor}`}>
                {getThresholdStatus(hoveredData.complianceScore).status}
              </span>
            </div>
            
            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Compliance Score:</span>
                <span className={`font-black text-sm ${getThresholdStatus(hoveredData.complianceScore).textColor}`}>
                  {hoveredData.complianceScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Flagged Incidents:</span>
                <span className={`font-bold ${hoveredData.flaggedIncidents > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {hoveredData.flaggedIncidents} {hoveredData.flaggedIncidents === 1 ? 'incident' : 'incidents'}
                </span>
              </div>
            </div>

            {/* Quick corrective tip */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[9px] text-slate-500 leading-normal">
              {hoveredData.complianceScore >= 90 
                ? '✓ SANS protocol conditions meet standard thresholds.' 
                : hoveredData.complianceScore >= 80 
                  ? '⚠ Advisory alert. Standard SANS compliance drift detected.' 
                  : '✖ CRITICAL INCIDENT REPORT: Compliance audit failed safety limit!'}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons & Helper Actions */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="text-[11px] text-slate-400 italic">
          * Powered by dynamic <span className="text-indigo-400 font-bold font-mono">D3.js</span> SVG interpolation with continuous color gradients.
        </div>
        <div className="flex gap-2">
          {onClearData && (
            <button
              onClick={onClearData}
              className="px-3 py-1.5 bg-slate-950/50 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Reset to Base Trend
            </button>
          )}
          {onDataAdd && (
            <button
              onClick={() => {
                // Generate next chronological date organically
                const lastPoint = data[data.length - 1];
                let nextDateStr = '2026-07-04';
                if (lastPoint && lastPoint.date) {
                  const dObj = new Date(lastPoint.date);
                  dObj.setDate(dObj.getDate() + 1);
                  nextDateStr = dObj.toISOString().split('T')[0];
                }
                
                // organic swing between 65 and 100
                const scoreVariance = Math.floor(Math.random() * 24) - 11; // -11 to +12
                const previousScore = lastPoint ? lastPoint.complianceScore : 88;
                const nextScore = Math.max(50, Math.min(100, previousScore + scoreVariance));
                
                // higher incidents if score is lower
                const incidents = nextScore < 80 
                  ? Math.floor(Math.random() * 5) + 3 
                  : nextScore < 90 
                    ? Math.floor(Math.random() * 3) + 1 
                    : 0;

                onDataAdd({
                  date: nextDateStr,
                  complianceScore: nextScore,
                  flaggedIncidents: incidents
                });
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center shadow-md cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <svg className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Dynamic Daily Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
