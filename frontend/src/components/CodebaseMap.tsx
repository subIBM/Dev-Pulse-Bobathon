import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
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

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create hierarchy
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create partition layout
    const partition = d3.partition<FileNode>().size([2 * Math.PI, radius]);

    partition(root);

    // Color scale based on risk
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 0.3, 0.6, 1])
      .range(['#4ade80', '#fbbf24', '#fb923c', '#ef4444']);

    // Create arc generator
    const arc = d3
      .arc<d3.HierarchyRectangularNode<FileNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    // Draw arcs
    const paths = svg
      .selectAll('path')
      .data(root.descendants())
      .join('path')
      .attr('d', arc as any)
      .attr('fill', (d) => {
        const risk = d.data.risk || 0;
        return colorScale(risk);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', (d) => (d.data.value ? 'pointer' : 'default'))
      .style('opacity', 0.9)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.value) {
          setSelectedNode(d.data);
          onFileClick(d.data);
          
          // Highlight selected node
          paths.style('opacity', (node) => (node === d ? 1 : 0.6));
        }
      })
      .on('mouseover', function (_event, d) {
        if (d.data.value) {
          d3.select(this)
            .style('opacity', 1)
            .attr('stroke-width', 2);
        }
      })
      .on('mouseout', function (_event, d) {
        if (d.data !== selectedNode) {
          d3.select(this)
            .style('opacity', 0.9)
            .attr('stroke-width', 1.5);
        }
      });

    // Add tooltips
    paths.append('title').text((d) => {
      const name = d.data.name;
      const loc = d.value || 0;
      const risk = ((d.data.risk || 0) * 100).toFixed(0);
      const complexity = d.data.complexity || 0;
      
      return `${name}\nLOC: ${loc}\nRisk: ${risk}%\nComplexity: ${complexity}`;
    });

    // Add labels for larger segments
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
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text((d) => {
        const name = d.data.name;
        return name.length > 15 ? name.substring(0, 12) + '...' : name;
      });

    // Add center label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(data.name);

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(`${root.value} LOC`);

  }, [data, onFileClick, width, height, selectedNode]);

  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Codebase Architecture Map</h2>
        <p className="text-sm text-gray-600 mt-1">
          Click on any segment to view details. Color indicates risk level.
        </p>
      </div>
      
      <svg ref={svgRef} className="drop-shadow-md"></svg>
      
      <div className="mt-6 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-risk-low"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-risk-medium"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-risk-high"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-risk-critical"></div>
          <span>Critical Risk</span>
        </div>
      </div>
    </div>
  );
};

export default CodebaseMap;

// Made with Bob
