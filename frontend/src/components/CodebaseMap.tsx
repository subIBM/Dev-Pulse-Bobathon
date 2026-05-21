import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity } from 'lucide-react';
import type { FileNode } from '../types';

interface CodebaseMapProps {
  data: FileNode;
  onFileClick: (file: FileNode) => void;
  width?: number;
  height?: number;
}

export const CodebaseMap: React.FC<CodebaseMapProps> = ({
  data,
  onFileClick,
  width = 800,
  height = 800,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const radius = Math.min(width, height) / 2;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3.partition<FileNode>().size([2 * Math.PI, radius]);
    partition(root);

    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 0.3, 0.6, 1])
      .range(['#34d399', '#fbbf24', '#fb7185', '#f43f5e']);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<FileNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    const paths = svg
      .selectAll('path')
      .data(root.descendants())
      .join('path')
      .attr('d', arc as any)
      .attr('fill', (d) => colorScale(d.data.risk || 0))
      .attr('stroke', 'rgba(15, 23, 42, 0.9)')
      .attr('stroke-width', 1.3)
      .style('cursor', (d) => (d.data.value ? 'pointer' : 'default'))
      .style('opacity', 0.92)
      .style('filter', (d) =>
        d.data.value ? 'drop-shadow(0 0 18px rgba(59,130,246,0.10))' : 'none'
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.value) {
          setSelectedNode(d.data);
          onFileClick(d.data);
          paths.style('opacity', (node) => (node === d ? 1 : 0.5));
        }
      })
      .on('mouseover', function (_event, d) {
        if (d.data.value) {
          d3.select(this).style('opacity', 1).attr('stroke-width', 2.4);
        }
      })
      .on('mouseout', function (_event, d) {
        if (d.data !== selectedNode) {
          d3.select(this).style('opacity', 0.92).attr('stroke-width', 1.3);
        }
      });

    paths.append('title').text((d) => {
      const name = d.data.name;
      const loc = d.value || 0;
      const risk = ((d.data.risk || 0) * 100).toFixed(0);
      const complexity = d.data.complexity || 0;

      return `${name}\nLOC: ${loc}\nRisk: ${risk}%\nComplexity: ${complexity}`;
    });

    svg
      .selectAll('text')
      .data(
        root.descendants().filter((d: any) => {
          const angle = d.x1 - d.x0;
          return angle > 0.1 && d.depth > 0 && d.depth < 3;
        })
      )
      .join('text')
      .attr('transform', (d: any) => {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#dbeafe')
      .style('pointer-events', 'none')
      .text((d) => {
        const name = d.data.name;
        return name.length > 15 ? name.substring(0, 12) + '...' : name;
      });

    svg
      .append('circle')
      .attr('r', radius * 0.18)
      .attr('fill', 'rgba(15, 23, 42, 0.82)')
      .attr('stroke', 'rgba(34, 211, 238, 0.25)')
      .attr('stroke-width', 1.4);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.7em')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .style('fill', '#f8fafc')
      .text(data.name);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '12px')
      .style('fill', '#94a3b8')
      .text(`${root.value} LOC`);
  }, [data, onFileClick, width, height, selectedNode]);

  return (
    <div className="glass-panel-strong overflow-hidden p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-label mb-2">Architecture Visualization</div>
          <h2 className="text-2xl font-semibold text-white">Codebase Architecture Map</h2>
          <p className="mt-2 text-sm text-slate-300">
            Click any segment to inspect risk details. Brighter tones indicate higher risk and volatility.
          </p>
        </div>
        <div className="status-pill self-start sm:self-auto">
          <Activity className="h-4 w-4 text-cyan-300" />
          Interactive D3 Sunburst
        </div>
      </div>

      <div className="flex justify-center">
        <svg ref={svgRef} className="max-w-full drop-shadow-[0_20px_50px_rgba(2,6,23,0.6)]" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
        <div className="status-pill">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
          Low Risk
        </div>
        <div className="status-pill">
          <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
          Medium Risk
        </div>
        <div className="status-pill">
          <div className="h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]" />
          High Risk
        </div>
        <div className="status-pill">
          <div className="h-3 w-3 rounded-full bg-rose-600 shadow-[0_0_14px_rgba(244,63,94,0.8)]" />
          Critical Risk
        </div>
      </div>
    </div>
  );
};

export default CodebaseMap;

// Made with Bob
