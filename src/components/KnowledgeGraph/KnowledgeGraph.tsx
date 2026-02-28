import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { motion } from "framer-motion";
import {
  KGraphNode,
  KGraphEdge,
  NODE_RADIUS,
  getNodeColor,
  buildGraphData,
} from "@/lib/buildGraphData";
import { mockStudent, mockCourses } from "@/lib/mockData";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  node: KGraphNode | null;
}

interface Props {
  activeSubject: string | null;
}

export function KnowledgeGraph({ activeSubject }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simulationRef = useRef<d3.Simulation<KGraphNode, KGraphEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, node: null });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<KGraphNode[]>([]);
  const [edges, setEdges] = useState<KGraphEdge[]>([]);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const width = containerRef.current?.clientWidth ?? 900;
    const height = containerRef.current?.clientHeight ?? 700;
    const cx = width / 2;
    const cy = height / 2;

    const { nodes: graphNodes, edges: graphEdges } = buildGraphData(mockStudent, mockCourses);

    // Pin user node
    const userNode = graphNodes.find((n) => n.id === "user")!;
    userNode.fx = cx;
    userNode.fy = cy;

    simulationRef.current = d3
      .forceSimulation<KGraphNode>(graphNodes)
      .force(
        "link",
        d3
          .forceLink<KGraphNode, KGraphEdge>(graphEdges)
          .id((d) => d.id)
          .distance((link) => {
            const src = link.source as KGraphNode;
            return src.type === "user" ? 220 : 130;
          })
          .strength(1)
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(cx, cy))
      .force(
        "collide",
        d3.forceCollide<KGraphNode>().radius((d) => NODE_RADIUS[d.type] + 14)
      )
      .on("tick", () => {
        setNodes([...graphNodes]);
        setEdges([...graphEdges]);
      });

    // Zoom
    if (svgRef.current) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (e) => {
          if (gRef.current) {
            gRef.current.setAttribute("transform", e.transform.toString());
          }
        });
      d3.select(svgRef.current).call(zoom);
      zoomRef.current = zoom;
    }

    setTimeout(() => setMounted(true), 100);

    return () => {
      simulationRef.current?.stop();
    };
  }, []);

  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, node: KGraphNode) => {
      setHoveredId(node.id);
      const rect = containerRef.current?.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: e.clientX - (rect?.left ?? 0),
        y: e.clientY - (rect?.top ?? 0),
        node,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (tooltip.visible) {
        const rect = containerRef.current?.getBoundingClientRect();
        setTooltip((prev) => ({
          ...prev,
          x: e.clientX - (rect?.left ?? 0),
          y: e.clientY - (rect?.top ?? 0),
        }));
      }
    },
    [tooltip.visible]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip({ visible: false, x: 0, y: 0, node: null });
  }, []);

  const handleNodeClick = useCallback(
    (node: KGraphNode) => {
      if (node.type === "skill" && node.status !== "locked" && node.subjectId) {
        navigate(`/dashboard/courses/${node.subjectId}`);
      } else if (node.type === "subject" && node.status !== "locked") {
        navigate(`/dashboard/courses/${node.id}`);
      }
    },
    [navigate]
  );

  const isHighlighted = (node: KGraphNode) => {
    if (!activeSubject) return true;
    if (node.id === "user") return true;
    if (node.type === "subject") return node.id === activeSubject;
    if (node.type === "skill") return node.subjectId === activeSubject;
    return false;
  };

  const isEdgeHighlighted = (edge: KGraphEdge) => {
    if (!activeSubject) return true;
    const src = edge.source as KGraphNode;
    const tgt = edge.target as KGraphNode;
    if (src.id === "user" && tgt.id === activeSubject) return true;
    if (src.id === activeSubject) return true;
    if (tgt.id === activeSubject) return true;
    return false;
  };

  const getNodeDelay = (node: KGraphNode) => {
    if (node.type === "user") return 0;
    if (node.type === "subject") return 0.2;
    return 0.4;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background" onMouseMove={handleMouseMove}>
      {/* Reset button */}
      <button
        onClick={resetZoom}
        className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-card border text-xs font-medium text-foreground hover:bg-secondary transition-colors shadow-soft"
      >
        Reset view
      </button>

      <motion.svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <defs>
          {/* Dot pattern background */}
          <pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="hsl(220 20% 88%)" />
          </pattern>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Orbit gradient */}
          <linearGradient id="orbitGrad" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a28ef9" />
            <stop offset="50%" stopColor="#a4f5a6" />
            <stop offset="100%" stopColor="#a28ef9" />
          </linearGradient>
        </defs>

        {/* Background dots */}
        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        <g ref={gRef}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const src = edge.source as KGraphNode;
            const tgt = edge.target as KGraphNode;
            if (src.x == null || tgt.x == null || src.y == null || tgt.y == null) return null;
            const highlighted = isEdgeHighlighted(edge);
            const isLocked = tgt.type === "skill" && (tgt as KGraphNode).status === "locked";
            const subjectId = tgt.type === "subject" ? tgt.id : (tgt as KGraphNode).subjectId ?? src.id;
            const edgeColor = getNodeColor({ ...tgt, subjectId, type: "skill" } as KGraphNode);

            return (
              <line
                key={`edge-${i}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={edgeColor}
                strokeWidth={1.5}
                strokeOpacity={highlighted ? (isLocked ? 0.2 : 0.35) : 0.06}
                strokeDasharray={isLocked ? "6 4" : "none"}
                style={{ transition: "stroke-opacity 300ms ease" }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const r = NODE_RADIUS[node.type];
            const color = getNodeColor(node);
            const isHovered = hoveredId === node.id;
            const isUser = node.type === "user";
            const highlighted = isHighlighted(node);
            const statusOpacity =
              node.status === "completed" ? 1 : node.status === "unlocked" ? 0.85 : 0.3;
            const finalOpacity = highlighted ? statusOpacity : 0.08;

            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: mounted ? 1 : 0,
                  opacity: mounted ? finalOpacity : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: getNodeDelay(node),
                  opacity: { duration: 0.3 },
                }}
                style={{
                  cursor: node.status !== "locked" && node.type !== "user" ? "pointer" : "default",
                  transformOrigin: `${node.x ?? 0}px ${node.y ?? 0}px`,
                }}
                onMouseEnter={(e) => handleMouseEnter(e, node)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleNodeClick(node)}
              >
                {/* Orbit ring — user only */}
                {isUser && node.x != null && node.y != null && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 10}
                    fill="none"
                    stroke="url(#orbitGrad)"
                    strokeWidth={2}
                    strokeDasharray="12 8"
                    style={{
                      animation: isHovered ? "none" : "spin 12s linear infinite",
                      transformOrigin: `${node.x}px ${node.y}px`,
                    }}
                  />
                )}

                {/* Hover glow */}
                {isHovered && !isUser && node.x != null && node.y != null && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    filter="url(#glow)"
                  />
                )}

                {/* Main circle */}
                {node.x != null && node.y != null && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered && !isUser ? r + 3 : r}
                    fill={color}
                    stroke={isHovered ? color : "transparent"}
                    strokeWidth={isHovered ? 3 : 0}
                    style={{ transition: "r 200ms ease, stroke 200ms ease" }}
                  />
                )}

                {/* Completed badge for skills */}
                {node.status === "completed" && node.type === "skill" && node.x != null && node.y != null && (
                  <g transform={`translate(${node.x + r * 0.6}, ${node.y - r * 0.6})`}>
                    <circle r={7} fill="#222222" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize={9}
                      fontWeight={700}
                    >
                      ✓
                    </text>
                  </g>
                )}

                {/* Icon for subject nodes */}
                {node.type === "subject" && node.icon && node.x != null && node.y != null && (
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={18}
                    style={{ pointerEvents: "none" }}
                  >
                    {node.icon}
                  </text>
                )}

                {/* User label inside */}
                {isUser && node.x != null && node.y != null && (
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={14}
                    fontWeight={700}
                    fontFamily="Fustat"
                    style={{ pointerEvents: "none" }}
                  >
                    You
                  </text>
                )}

                {/* Label below */}
                {node.type !== "user" && node.x != null && node.y != null && (
                  <text
                    x={node.x}
                    y={node.y + r + 16}
                    textAnchor="middle"
                    fill="hsl(0 0% 13.3%)"
                    fontSize={node.type === "subject" ? 12 : 10}
                    fontWeight={node.type === "subject" ? 600 : 400}
                    fontFamily="Fustat"
                    style={{ pointerEvents: "none", opacity: highlighted ? 0.9 : 0.1, transition: "opacity 300ms" }}
                  >
                    {node.label}
                  </text>
                )}
              </motion.g>
            );
          })}
        </g>
      </motion.svg>

      {/* Tooltip */}
      {tooltip.visible && tooltip.node && (
        <TooltipCard tooltip={tooltip} />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function TooltipCard({ tooltip }: { tooltip: TooltipState }) {
  const node = tooltip.node!;
  const statusLabel: Record<string, string> = {
    completed: "Completed",
    unlocked: "In Progress",
    locked: "Locked",
  };
  const statusDot: Record<string, string> = {
    completed: "#a4f5a6",
    unlocked: "#a28ef9",
    locked: "#e5e7eb",
  };

  const color = getNodeColor(node);

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
    >
      <div className="bg-card border rounded-xl shadow-elevated px-4 py-3 min-w-[160px]">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-foreground">{node.label}</span>
        </div>
        <p className="text-xs text-muted-foreground capitalize mb-1.5">{node.type}</p>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusDot[node.status] }}
          />
          <span className="text-xs text-foreground">{statusLabel[node.status]}</span>
        </div>
        {node.type === "subject" && node.totalSkills != null && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Skills</span>
              <span>{node.completedSkills}/{node.totalSkills}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${((node.completedSkills ?? 0) / (node.totalSkills ?? 1)) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}
        {node.type === "user" && (
          <p className="text-[10px] text-muted-foreground mt-1">Your learning profile</p>
        )}
        {node.type === "skill" && node.status !== "locked" && (
          <p className="text-[10px] text-accent mt-1.5 font-medium">Click to open session →</p>
        )}
      </div>
    </div>
  );
}
