import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

export interface DailyComplianceData {
  date: string;        // Format: 'YYYY-MM-DD'
  complianceScore: number; // 0 - 100
  flaggedIncidents: number; // integer >= 0
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

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
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

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = d3.timeParse('%Y-%m-%d');
    const formattedData = data.map(d => ({
      ...d,
      parsedDate: parseTime(d.date) || new Date()
    })).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    const x = d3
      .scaleTime()
      .domain(d3.extent(formattedData, d => d.parsedDate) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Background threshold bands
    g.append('rect')
      .attr('x', 0)
      .attr('y', y(100))
      .attr('width', width)
      .attr('height', y(90) - y(100))
      .attr('fill', '#10b981')
      .attr('opacity', 0.06);

    g.append('rect')
      .attr('x', 0)
      .attr('y', y(90))
      .attr('width', width)
      .attr('height', y(80) - y(90))
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.06);

    g.append('rect')
      .attr('x', 0)
      .attr('y', y(80))
      .attr('width', width)
      .attr('height', y(0) - y(80))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.06);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''));

    // Axes
    g.append('g')
      .attr('transform', `translate(0,-5)`)
      .attr('opacity', 0.5)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickFormat(() => ''));

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %d') as any));

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Gradient definition for the line
    const gradientId = 'compliance-line-gradient';
    const defs = svg.append('defs');
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', y(0))
      .attr('x2', 0)
      .attr('y2', y(100));

    linearGradient.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
    linearGradient.append('stop').attr('offset', '75%').attr('stop-color', '#ef4444');
    linearGradient.append('stop').attr('offset', '80%').attr('stop-color', '#f59e0b');
    linearGradient.append('stop').attr('offset', '90%').attr('stop-color', '#10b981');
    linearGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

    // Trend line path generator
    const line = d3
      .line<any>()
      .x(d => x(d.parsedDate))
      .y(d => y(d.complianceScore))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', `url(#${gradientId})`)
      .attr('stroke-width', 3.5)
      .attr('d', line);

    // Interactive Overlay Data Nodes
    g.selectAll('.data-dot')
      .data(formattedData)
      .enter()
      .append('circle')
      .attr('class', 'data-dot')
      .attr('cx', d => x(d.parsedDate))
      .attr('cy', d => y(d.complianceScore))
      .attr('r', 5)
      .attr('fill', d => (d.complianceScore >= 90 ? '#10b981' : d.complianceScore >= 80 ? '#f59e0b' : '#ef4444'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        setHoveredData(d);
        setTooltipPos({ x: event.clientX, y: event.clientY - 40 });
      })
      .on('mouseout', () => {
        setHoveredData(null);
        setTooltipPos(null);
      });

  }, [data, dimensions]);

  const handleSimulateNode = () => {
    if (!onDataAdd) return;
    const lastPoint = data[data.length - 1];
    const lastDate = lastPoint ? new Date(lastPoint.date) : new Date();
    lastDate.setDate(lastDate.getDate() + 1);
    
    const year = lastDate.getFullYear();
    const month = String(lastDate.getMonth() + 1).padStart(2, '0');
    const day = String(lastDate.getDate()).padStart(2, '0');
    
    const randomScore = Math.floor(Math.random() * (100 - 72 + 1)) + 72;
    const randomIncidents = randomScore < 80 ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 2);

    onDataAdd({
      date: `${year}-${month}-${day}`,
      complianceScore: randomScore,
      flaggedIncidents: randomIncidents
    });
  };

  return (
    <div ref={containerRef} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 relative text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-200">ISO/IEC 42001 Auditing Timeline</h3>
          <p className="text-xs text-slate-400">Site compliance performance & anomaly drift maps</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSimulateNode}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition"
          >
            + Append Audit Log
          </button>
          {onClearData && (
            <button 
              onClick={onClearData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="overflow-visible select-none">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
      </div>

      {hoveredData && tooltipPos && (
        <div 
          className="fixed z-50 pointer-events-none bg-slate-950/95 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg text-xs shadow-xl min-w-[140px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="text-slate-400 font-medium mb-1">{hoveredData.date}</div>
          <div className="flex justify-between mb-0.5">
            <span>Compliance:</span>
            <span className={`font-semibold ${hoveredData.complianceScore >= 90 ? 'text-emerald-400' : hoveredData.complianceScore >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
              {hoveredData.complianceScore}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Incidents:</span>
            <span className="font-semibold text-slate-200">{hoveredData.flaggedIncidents}</span>
          </div>
        </div>
      )}
    </div>
  );
};
