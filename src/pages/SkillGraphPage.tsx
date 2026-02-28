import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/useData";

const graphNodes: Record<string, { label: string; x: number; y: number; status: "completed" | "unlocked" | "locked" }[]> = {
  math: [
    { label: "Numbers", x: 400, y: 60, status: "completed" },
    { label: "Algebra", x: 250, y: 160, status: "completed" },
    { label: "Linear Equations", x: 550, y: 160, status: "unlocked" },
    { label: "Quadratic Functions", x: 250, y: 280, status: "locked" },
    { label: "Geometry", x: 550, y: 280, status: "locked" },
    { label: "Trigonometry", x: 400, y: 380, status: "locked" },
    { label: "Statistics", x: 250, y: 460, status: "locked" },
    { label: "Probability", x: 550, y: 460, status: "locked" },
  ],
};

const edges = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7],
];

const statusColors = {
  completed: { fill: "hsl(122, 83%, 80%)", stroke: "hsl(122, 83%, 70%)", text: "hsl(0, 0%, 13.3%)" },
  unlocked: { fill: "hsl(252, 90%, 77%)", stroke: "hsl(252, 90%, 67%)", text: "hsl(0, 0%, 100%)" },
  locked: { fill: "hsl(220, 20%, 92%)", stroke: "hsl(220, 20%, 85%)", text: "hsl(0, 0%, 60%)" },
};

export default function SkillGraphPage() {
  const { id } = useParams<{ id: string }>();
  const { getCourse } = useCourses();
  const course = getCourse(id || "");
  const nodes = graphNodes[id || ""] || graphNodes.math;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">{course?.name || "Course"} — Skill Graph</h1>
      <p className="text-sm text-muted-foreground mb-6">Click on completed or unlocked topics to start a session.</p>

      <div className="bg-card rounded-2xl border shadow-soft p-6 overflow-x-auto">
        <svg viewBox="0 0 800 530" className="w-full max-w-3xl mx-auto">
          {/* Edges */}
          {edges.map(([from, to], i) => (
            <line
              key={i}
              x1={nodes[from].x}
              y1={nodes[from].y}
              x2={nodes[to].x}
              y2={nodes[to].y}
              stroke="hsl(220, 20%, 88%)"
              strokeWidth={2}
              strokeDasharray={nodes[to].status === "locked" ? "6 4" : "none"}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const c = statusColors[node.status];
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                style={{ cursor: node.status !== "locked" ? "pointer" : "default" }}
              >
                <circle cx={node.x} cy={node.y} r={32} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                <text x={node.x} y={node.y + 50} textAnchor="middle" fill={c.text} fontSize={12} fontWeight={500} fontFamily="Fustat">
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {(["completed", "unlocked", "locked"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: statusColors[s].fill }} />
              <span className="text-xs text-muted-foreground capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
