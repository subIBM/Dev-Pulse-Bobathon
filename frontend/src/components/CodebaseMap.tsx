import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, CornerDownLeft, FolderTree, MousePointerClick } from 'lucide-react';
import type { FileNode } from '../types';

interface CodebaseMapProps {
  data: FileNode;
  onFileClick: (file: FileNode) => void;
  width?: number;
  height?: number;
}

const findNodeByPath = (node: FileNode, targetPath: string | null): FileNode | null => {
  if (!targetPath) return node;
  if (node.path === targetPath) return node;

  for (const child of node.children || []) {
    const match = findNodeByPath(child, targetPath);
    if (match) return match;
  }

  return null;
};

export const CodebaseMap: React.FC<CodebaseMapProps> = ({
  data,
  onFileClick,
  width = 1280,
  height = 860,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(width);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; type: string; meta: string } | null>(null);

  const focusedData = useMemo(() => findNodeByPath(data, focusPath) || data, [data, focusPath]);

  const breadcrumb = useMemo(() => {
    const pathParts = focusPath?.split('/').filter(Boolean) || [];
    return [data.name, ...pathParts];
  }, [data.name, focusPath]);

  const focusChildren = useMemo(() => {
    const children = focusedData.children || [];
    return [...children].sort((a, b) => {
      const aIsFolder = !!a.children?.length;
      const bIsFolder = !!b.children?.length;
      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [focusedData]);

  useEffect(() => {
    const updateSize = () => {
      const containerWidth = containerRef.current?.clientWidth || width;
      setChartWidth(Math.max(560, Math.min(containerWidth - 8, width)));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width]);

  useEffect(() => {
    if (!svgRef.current || !focusedData) return;

    const chartHeight = Math.max(680, Math.min(height, chartWidth * 0.82));

    d3.select(svgRef.current).selectAll('*').remove();

    const root = d3
      .hierarchy<FileNode>(focusedData)
      .sum((d) => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const pack = d3.pack<FileNode>().size([chartWidth, chartHeight]).padding(18);
    const packedRoot = pack(root);

    const riskColor = d3
      .scaleLinear<string>()
      .domain([0, 0.35, 0.7, 1])
      .range(['#22c55e', '#38bdf8', '#fb7185', '#f43f5e']);

    const svg = d3
      .select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`);

    const visibleNodes = packedRoot
      .descendants()
      .filter((d) => d.depth === 0 || d.parent === packedRoot || !d.data.children?.length);

    const nodes = svg
      .selectAll<SVGGElement, d3.HierarchyCircularNode<FileNode>>('g.node')
      .data(visibleNodes)
      .join('g')
      .attr('class', (d) => `node depth-${d.depth} ${d.data.children?.length ? 'is-folder' : 'is-file'}`)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodes
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        if (d.depth === 0) return 'rgba(17, 94, 89, 0.92)';
        if (d.data.children?.length) {
          return d.depth === 1 ? 'rgba(15, 23, 42, 0.84)' : 'rgba(8, 47, 73, 0.78)';
        }
        return riskColor(d.data.risk || 0.2);
      })
      .attr('stroke', (d) => {
        if (d.depth === 0) return 'rgba(45, 212, 191, 0.55)';
        if (d.data.children?.length) return 'rgba(56, 189, 248, 0.22)';
        return 'rgba(255, 255, 255, 0.14)';
      })
      .attr('stroke-width', (d) => {
        if (d.depth === 0) return 2.5;
        if (d.data.children?.length) return 1.4;
        return 1.1;
      })
      .style('cursor', (d) => (d.data.children?.length || d.data.path ? 'pointer' : 'default'))
      .style('filter', (d) => {
        if (d.depth === 0) return 'drop-shadow(0 0 40px rgba(45,212,191,0.18))';
        if (d.data.children?.length) return 'drop-shadow(0 0 18px rgba(56,189,248,0.12))';
        return 'drop-shadow(0 0 18px rgba(244,63,94,0.16))';
      })
      .on('mouseover', function (_event, d) {
        setHoveredNode({
          name: d.data.name,
          type: d.data.children?.length ? 'Folder' : 'File',
          meta: d.data.children?.length
            ? `${d.children?.length || 0} nested items`
            : `Risk ${(100 * (d.data.risk || 0)).toFixed(0)}%`,
        });

        d3.select(this)
          .transition()
          .duration(180)
          .attr('stroke-width', d.depth === 0 ? 3 : 2.4)
          .style('filter', 'drop-shadow(0 0 28px rgba(56,189,248,0.24))');
      })
      .on('mouseout', function (_event, d) {
        setHoveredNode(null);

        d3.select(this)
          .transition()
          .duration(180)
          .attr('stroke-width', d.depth === 0 ? 2.5 : d.data.children?.length ? 1.4 : 1.1)
          .style(
            'filter',
            d.depth === 0
              ? 'drop-shadow(0 0 40px rgba(45,212,191,0.18))'
              : d.data.children?.length
                ? 'drop-shadow(0 0 18px rgba(56,189,248,0.12))'
                : 'drop-shadow(0 0 18px rgba(244,63,94,0.16))'
          );
      })
      .on('click', (event, d) => {
        event.stopPropagation();

        const isFolder = !!d.data.children?.length;
        const isFile = !isFolder;

        if (isFile && d.data.path) {
          onFileClick(d.data);
          return;
        }

        if (d.depth === 0) {
          if (focusPath) {
            setFocusPath(null);
          }
          return;
        }

        if (isFolder) {
          setFocusPath(d.data.path || null);
        }
      });

    nodes
      .filter((d) => d.r > 26)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => {
        if (d.depth === 0) return '-0.45em';
        return d.data.children?.length ? '-0.55em' : '0.15em';
      })
      .attr('class', 'codebase-map-label')
      .style('font-size', (d) => {
        if (d.depth === 0) return `${Math.max(20, Math.min(28, d.r / 4.2))}px`;
        if (d.data.children?.length) return `${Math.max(12, Math.min(18, d.r / 4.7))}px`;
        return `${Math.max(10, Math.min(16, d.r / 4.1))}px`;
      })
      .style('pointer-events', 'none')
      .text((d) => {
        const name = d.data.name;
        const limit = d.depth === 0 ? 30 : d.data.children?.length ? (d.r > 92 ? 24 : 18) : d.r > 90 ? 22 : d.r > 58 ? 16 : 12;
        return name.length > limit ? `${name.slice(0, limit - 3)}...` : name;
      });

    nodes
      .filter((d) => d.depth === 0 || (!!d.data.children?.length && d.r > 62))
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => {
        if (d.depth === 0) return '1.55em';
        return '0.95em';
      })
      .attr('class', 'codebase-map-subtext')
      .style('font-size', (d) => {
        if (d.depth === 0) return `${Math.max(11, Math.min(14, d.r / 7))}px`;
        return `${Math.max(10, Math.min(13, d.r / 6.4))}px`;
      })
      .style('pointer-events', 'none')
      .text((d) => {
        if (d.depth === 0) return focusPath ? 'Click center to reset' : 'Click folder to drill down';
        return `${d.children?.length || 0} items`;
      });

    nodes
      .filter((d: d3.HierarchyCircularNode<FileNode>) => !d.data.children?.length && !!d.parent && d.r > 52)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('y', (d) => Math.max(-d.r + 10, -28))
      .attr('class', 'codebase-map-subtext')
      .style('font-size', (d) => `${Math.max(10, Math.min(12, d.r / 7.2))}px`)
      .style('font-weight', '700')
      .style('fill', 'rgba(186, 230, 253, 0.92)')
      .style('pointer-events', 'none')
      .text((d) => {
        const parentName = d.parent?.data?.name || '';
        const limit = d.r > 90 ? 18 : 14;
        return parentName.length > limit ? `${parentName.slice(0, limit - 3)}...` : parentName;
      });

    nodes.append('title').text((d) => {
      const typeLabel = d.data.children?.length ? 'Folder' : 'File';
      const risk = ((d.data.risk || 0) * 100).toFixed(0);
      const weight = d.value || 0;
      return `${typeLabel}: ${d.data.path || d.data.name}\nWeight: ${weight}\nRisk: ${risk}%`;
    });

    svg.on('click', () => {
      if (focusPath) {
        setFocusPath(null);
      }
    });
  }, [chartWidth, focusPath, focusedData, height, onFileClick]);

  return (
    <div className="glass-panel-strong overflow-hidden p-6 sm:p-8 xl:p-10">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="section-label">Architecture Visualization</div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-white xl:text-[2rem]">Codebase Architecture Explorer</h2>
            <div className="status-pill border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
              <Activity className="h-4 w-4 text-cyan-300" />
              Packed Circle Explorer
            </div>
          </div>
          <p className="max-w-4xl text-sm text-slate-300 xl:text-base">
            Explore the codebase as nested architecture clusters. Folders use cool glass tones, while files inherit risk intensity from the dashboard palette.
          </p>
        </div>

        <div className="codebase-map-toolbar">
          <div className="codebase-map-toolbar-item">
            <MousePointerClick className="h-4 w-4 text-cyan-300" />
            Click folders to drill in
          </div>
          <button
            type="button"
            onClick={() => setFocusPath(null)}
            disabled={!focusPath}
            className="codebase-map-reset"
          >
            <CornerDownLeft className="h-4 w-4" />
            Reset view
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="codebase-map-breadcrumb">
          <FolderTree className="h-4 w-4 text-cyan-300" />
          {breadcrumb.map((segment, index) => (
            <React.Fragment key={`${segment}-${index}`}>
              <span className={index === breadcrumb.length - 1 ? 'text-white' : 'text-slate-300'}>
                {segment}
              </span>
              {index < breadcrumb.length - 1 && <span className="text-slate-500">/</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="codebase-map-hover">
          {hoveredNode ? (
            <>
              <span className="text-cyan-200">{hoveredNode.type}</span>
              <span className="text-white">{hoveredNode.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{hoveredNode.meta}</span>
            </>
          ) : (
            <span className="text-slate-400">Hover nodes for quick context</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px] 2xl:grid-cols-[minmax(0,1.5fr)_400px]">
        <div ref={containerRef} className="codebase-map-stage">
          <svg ref={svgRef} className="block max-w-full drop-shadow-[0_20px_50px_rgba(2,6,23,0.55)]" />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 xl:p-6 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Folder Contents
              </div>
              <div className="mt-1 text-sm text-slate-300">
                {focusPath ? focusedData.name : 'Root overview'} · {focusChildren.length} items
              </div>
            </div>
          </div>

          <div className="max-h-[680px] space-y-3 overflow-auto pr-1">
            {focusChildren.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3 text-sm text-slate-400">
                No nested items in this view.
              </div>
            ) : (
              focusChildren.map((child) => {
                const isFolder = !!child.children?.length;
                return (
                  <button
                    key={child.path || child.name}
                    type="button"
                    onClick={() => {
                      if (isFolder) {
                        setFocusPath(child.path || null);
                        return;
                      }
                      onFileClick(child);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3.5 text-left transition duration-200 hover:border-cyan-400/30 hover:bg-cyan-400/8"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{child.name}</div>
                      <div className="mt-1 truncate text-xs text-slate-400">
                        {isFolder
                          ? `${child.children?.length || 0} nested items`
                          : child.path || 'File'}
                      </div>
                    </div>

                    <div
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        isFolder
                          ? 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                          : 'border border-rose-400/20 bg-rose-400/10 text-rose-200'
                      }`}
                    >
                      {isFolder ? 'Folder' : 'File'}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
        <div className="status-pill border-emerald-400/15 bg-emerald-400/8">
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
          Low Risk Files
        </div>
        <div className="status-pill border-cyan-400/15 bg-cyan-400/8">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
          Folder Clusters
        </div>
        <div className="status-pill border-rose-400/15 bg-rose-400/8">
          <div className="h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]" />
          High Risk Files
        </div>
      </div>
    </div>
  );
};

export default CodebaseMap;

// Made with Bob
