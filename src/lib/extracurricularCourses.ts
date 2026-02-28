import type { Subject, Topic } from "@/hooks/useSubjects";

export interface ExtracurricularCourse {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  topics: { id: string; title: string; status: "unlocked" | "locked" | "completed" }[];
}

export const EXTRACURRICULAR_COURSES: ExtracurricularCourse[] = [
  {
    id: "ec-ai-literacy",
    name: "AI Literacy",
    description: "Understand how AI works, where it is used, and how to use it responsibly.",
    icon: "🤖",
    color: "#a28ef9",
    progress: 0,
    topics: [
      { id: "ec-ai-1", title: "What is AI?", status: "unlocked" },
      { id: "ec-ai-2", title: "How LLMs Work", status: "locked" },
      { id: "ec-ai-3", title: "AI Bias", status: "locked" },
      { id: "ec-ai-4", title: "AI as a Tool", status: "locked" },
      { id: "ec-ai-5", title: "AI and Careers", status: "locked" },
    ],
  },
  {
    id: "ec-online-safety",
    name: "Online Safety & Digital Citizenship",
    description: "Stay safe online and understand your rights and responsibilities in digital spaces.",
    icon: "🛡️",
    color: "#a4f5a6",
    progress: 0,
    topics: [
      { id: "ec-os-1", title: "Passwords & Privacy", status: "unlocked" },
      { id: "ec-os-2", title: "Scams & Phishing", status: "locked" },
      { id: "ec-os-3", title: "Digital Footprint", status: "locked" },
      { id: "ec-os-4", title: "Cyberbullying", status: "locked" },
      { id: "ec-os-5", title: "Your Online Rights", status: "locked" },
    ],
  },
  {
    id: "ec-financial-literacy",
    name: "Financial Literacy",
    description: "Learn how money works — budgeting, saving, investing, and avoiding debt traps.",
    icon: "💰",
    color: "#f9c784",
    progress: 0,
    topics: [
      { id: "ec-fl-1", title: "Budgeting Basics", status: "unlocked" },
      { id: "ec-fl-2", title: "Saving & Interest", status: "locked" },
      { id: "ec-fl-3", title: "Credit & Debt", status: "locked" },
      { id: "ec-fl-4", title: "Investing Basics", status: "locked" },
      { id: "ec-fl-5", title: "Spotting Scams", status: "locked" },
    ],
  },
  {
    id: "ec-critical-thinking",
    name: "Critical Thinking & Media Literacy",
    description: "Think clearly, question what you read, and make better decisions with information.",
    icon: "🧠",
    color: "#f4a4a4",
    progress: 0,
    topics: [
      { id: "ec-ct-1", title: "What is Thinking?", status: "unlocked" },
      { id: "ec-ct-2", title: "Logical Fallacies", status: "locked" },
      { id: "ec-ct-3", title: "Evaluating Sources", status: "locked" },
      { id: "ec-ct-4", title: "Fake News", status: "locked" },
      { id: "ec-ct-5", title: "Better Decisions", status: "locked" },
    ],
  },
  {
    id: "ec-mental-health",
    name: "Mental Health & Wellbeing",
    description: "Understand your mind, manage stress, and build habits that support long-term wellbeing.",
    icon: "🌱",
    color: "#84d4f9",
    progress: 0,
    topics: [
      { id: "ec-mh-1", title: "Understanding Stress", status: "unlocked" },
      { id: "ec-mh-2", title: "Study Burnout", status: "locked" },
      { id: "ec-mh-3", title: "Sleep & Exercise", status: "locked" },
      { id: "ec-mh-4", title: "Managing Anxiety", status: "locked" },
      { id: "ec-mh-5", title: "Building Routines", status: "locked" },
    ],
  },
];

export const EXTRACURRICULAR_IDS = new Set(EXTRACURRICULAR_COURSES.map((c) => c.id));

/** Convert an ExtracurricularCourse to the Subject shape used by the rest of the app */
export function ecToSubject(ec: ExtracurricularCourse): Subject {
  return {
    id: ec.id,
    name: ec.name,
    icon: ec.icon,
    color: ec.color === "#a28ef9" || ec.color === "#f4a4a4" ? "purple" : "green",
    display_order: 999,
    topics: ec.topics.map((t) => ({
      id: t.id,
      name: t.title,
      status: t.status,
      sessions: [],
    })),
  };
}

/** Get all EC courses as Subject[] */
export function getExtracurricularSubjects(): Subject[] {
  return EXTRACURRICULAR_COURSES.map(ecToSubject);
}
