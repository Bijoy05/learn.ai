import type { Course, Student } from "./mockData";

export type NodeType = "user" | "subject" | "skill";
export type NodeStatus = "locked" | "unlocked" | "completed";

export interface KGraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  status: NodeStatus;
  subjectId?: string;
  icon?: string;
  totalSkills?: number;
  completedSkills?: number;
  unlockedSkills?: number;
}

export interface KGraphEdge {
  source: string | KGraphNode;
  target: string | KGraphNode;
}

export const SUBJECT_COLORS: Record<string, string> = {
  math: "#a28ef9",
  bio: "#a4f5a6",
  eng: "#84d4f9",
  phys: "#f9c784",
  hist: "#f4a4a4",
};

export const NODE_RADIUS: Record<NodeType, number> = {
  user: 44,
  subject: 30,
  skill: 18,
};

export function buildGraphData(student: Student, courses: Course[]) {
  const nodes: KGraphNode[] = [];
  const edges: KGraphEdge[] = [];

  // User node — pinned at center (fx/fy set later)
  nodes.push({
    id: "user",
    label: student.firstName,
    type: "user",
    status: "completed",
  });

  courses.forEach((course) => {
    const completedSkills = course.topics.filter((t) => t.status === "completed").length;
    const unlockedSkills = course.topics.filter((t) => t.status === "unlocked").length;

    // Determine subject status
    let subjectStatus: NodeStatus = "unlocked";
    if (course.topics.every((t) => t.status === "completed")) subjectStatus = "completed";
    else if (course.topics.every((t) => t.status === "locked")) subjectStatus = "locked";

    nodes.push({
      id: course.id,
      label: course.name,
      type: "subject",
      status: subjectStatus,
      icon: course.icon,
      totalSkills: course.topics.length,
      completedSkills,
      unlockedSkills,
    });
    edges.push({ source: "user", target: course.id });

    course.topics.forEach((topic) => {
      nodes.push({
        id: topic.id,
        label: topic.name,
        type: "skill",
        status: topic.status as NodeStatus,
        subjectId: course.id,
      });
      edges.push({ source: course.id, target: topic.id });
    });
  });

  return { nodes, edges };
}

export function getNodeColor(node: KGraphNode): string {
  if (node.type === "user") return "#222222";
  const subjectId = node.type === "subject" ? node.id : node.subjectId ?? "";
  return SUBJECT_COLORS[subjectId] ?? "#cccccc";
}
