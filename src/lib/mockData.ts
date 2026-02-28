export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  avatar: string;
  learningStyle: string[];
  studyHabit: string;
  joinedAt: string;
  streak: number;
}

export interface Course {
  id: string;
  name: string;
  icon: string;
  progress: number;
  color: "purple" | "green";
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  status: "locked" | "unlocked" | "completed";
  sessions: Session[];
}

export interface Session {
  id: string;
  topicName: string;
  date: string;
  status: "active" | "complete" | "review";
}

export interface Message {
  id: string;
  role: "ai" | "student";
  content: string;
  type?: "text" | "chart" | "quiz" | "callout" | "code" | "steps";
  chartData?: any;
  quizData?: { question: string; options: string[]; correct: number; explanation: string };
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  course: string;
  type: "review" | "reminder" | "achievement";
  read: boolean;
}

export interface ScheduleItem {
  time: string;
  lesson: string;
  teacher: string;
  location: string;
  avatar: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: "purple" | "green";
}

export const mockStudent: Student = {
  id: "s1",
  firstName: "Kate",
  lastName: "Malone",
  email: "kate@school.edu",
  grade: "Class 9A",
  avatar: "",
  learningStyle: ["Real-world examples", "Visual diagrams"],
  studyHabit: "I study a little every day",
  joinedAt: "2025-01-15",
  streak: 14,
};

export const mockCourses: Course[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    progress: 68,
    color: "purple",
    topics: [
      {
        id: "t1", name: "Numbers & Operations", status: "completed",
        sessions: [
          { id: "s1", topicName: "Integers & Rationals", date: "Apr 20, 2025", status: "complete" },
          { id: "s2", topicName: "Order of Operations", date: "Apr 22, 2025", status: "complete" },
        ],
      },
      {
        id: "t2", name: "Algebra", status: "completed",
        sessions: [
          { id: "s3", topicName: "Variables & Expressions", date: "Apr 25, 2025", status: "complete" },
          { id: "s4", topicName: "Solving Equations", date: "Apr 28, 2025", status: "review" },
        ],
      },
      {
        id: "t3", name: "Linear Equations", status: "unlocked",
        sessions: [
          { id: "s5", topicName: "Slope & Intercept", date: "May 02, 2025", status: "active" },
          { id: "s6", topicName: "Graphing Lines", date: "", status: "active" },
        ],
      },
      {
        id: "t4", name: "Quadratic Functions", status: "locked",
        sessions: [
          { id: "s7", topicName: "Parabolas", date: "", status: "active" },
        ],
      },
      {
        id: "t5", name: "Geometry", status: "locked",
        sessions: [{ id: "s8", topicName: "Triangles & Angles", date: "", status: "active" }],
      },
      {
        id: "t6", name: "Trigonometry", status: "locked",
        sessions: [{ id: "s9", topicName: "Sin, Cos, Tan", date: "", status: "active" }],
      },
      {
        id: "t7", name: "Statistics", status: "locked",
        sessions: [{ id: "s10", topicName: "Mean, Median, Mode", date: "", status: "active" }],
      },
      {
        id: "t8", name: "Probability", status: "locked",
        sessions: [{ id: "s11", topicName: "Basic Probability", date: "", status: "active" }],
      },
    ],
  },
  {
    id: "bio",
    name: "Biology",
    icon: "🧬",
    progress: 42,
    color: "green",
    topics: [
      {
        id: "bt1", name: "Cell Biology", status: "completed",
        sessions: [
          { id: "bs1", topicName: "Cell Structure", date: "Apr 18, 2025", status: "complete" },
          { id: "bs2", topicName: "Cell Division", date: "Apr 21, 2025", status: "review" },
        ],
      },
      {
        id: "bt2", name: "Genetics", status: "unlocked",
        sessions: [
          { id: "bs3", topicName: "DNA & RNA", date: "May 01, 2025", status: "active" },
        ],
      },
      {
        id: "bt3", name: "Evolution", status: "locked",
        sessions: [{ id: "bs4", topicName: "Natural Selection", date: "", status: "active" }],
      },
    ],
  },
  {
    id: "eng",
    name: "English Literature",
    icon: "📚",
    progress: 55,
    color: "purple",
    topics: [
      {
        id: "et1", name: "Poetry Analysis", status: "completed",
        sessions: [
          { id: "es1", topicName: "Metaphor & Simile", date: "Apr 19, 2025", status: "complete" },
        ],
      },
      {
        id: "et2", name: "Shakespeare", status: "unlocked",
        sessions: [
          { id: "es2", topicName: "Romeo & Juliet Act 1", date: "May 03, 2025", status: "active" },
        ],
      },
    ],
  },
  {
    id: "phys",
    name: "Physics",
    icon: "⚡",
    progress: 30,
    color: "green",
    topics: [
      {
        id: "pt1", name: "Mechanics", status: "unlocked",
        sessions: [
          { id: "ps1", topicName: "Newton's Laws", date: "May 05, 2025", status: "active" },
        ],
      },
    ],
  },
  {
    id: "hist",
    name: "History",
    icon: "🏛️",
    progress: 20,
    color: "purple",
    topics: [
      {
        id: "ht1", name: "Ancient Civilizations", status: "unlocked",
        sessions: [
          { id: "hs1", topicName: "Mesopotamia", date: "May 04, 2025", status: "active" },
        ],
      },
    ],
  },
];

export const mockMessages: Record<string, Message[]> = {
  s5: [
    {
      id: "m1", role: "ai", type: "text",
      content: "Welcome back, Kate! Today we're going to explore **slope and intercept** — the building blocks of linear equations. Ready to dive in?",
      timestamp: "10:00 AM",
    },
    {
      id: "m2", role: "student", type: "text",
      content: "Yes! I remember we talked about variables last time.",
      timestamp: "10:01 AM",
    },
    {
      id: "m3", role: "ai", type: "text",
      content: "Great memory! 🎉 So, a linear equation looks like this:\n\n**y = mx + b**\n\nWhere:\n- **m** is the slope (how steep the line is)\n- **b** is the y-intercept (where the line crosses the y-axis)\n\nThink of slope as the \"steepness\" of a hill. A bigger number means a steeper hill!",
      timestamp: "10:01 AM",
    },
    {
      id: "m4", role: "ai", type: "callout",
      content: "💡 **Key Insight:** The slope tells you how much y changes when x increases by 1. If the slope is 2, then for every step right, you go 2 steps up!",
      timestamp: "10:02 AM",
    },
    {
      id: "m5", role: "ai", type: "chart",
      content: "Here's how different slopes look on a graph:",
      chartData: {
        type: "line",
        data: [
          { x: 0, "slope=1": 0, "slope=2": 0, "slope=0.5": 0 },
          { x: 1, "slope=1": 1, "slope=2": 2, "slope=0.5": 0.5 },
          { x: 2, "slope=1": 2, "slope=2": 4, "slope=0.5": 1 },
          { x: 3, "slope=1": 3, "slope=2": 6, "slope=0.5": 1.5 },
          { x: 4, "slope=1": 4, "slope=2": 8, "slope=0.5": 2 },
        ],
      },
      timestamp: "10:02 AM",
    },
    {
      id: "m6", role: "ai", type: "quiz",
      content: "",
      quizData: {
        question: "If a line has the equation y = 3x + 2, what is the slope?",
        options: ["2", "3", "5", "1"],
        correct: 1,
        explanation: "In y = mx + b, the coefficient of x is the slope. Here m = 3, so the slope is 3!",
      },
      timestamp: "10:03 AM",
    },
    {
      id: "m7", role: "student", type: "text",
      content: "The slope is 3!",
      timestamp: "10:04 AM",
    },
    {
      id: "m8", role: "ai", type: "text",
      content: "Exactly right! 🌟 You're getting the hang of this. The slope is **3**, which means for every 1 unit increase in x, y increases by 3 units.\n\nNow let's look at a real-world example...",
      timestamp: "10:04 AM",
    },
  ],
};

export const mockNotifications: Notification[] = [
  { id: "n1", title: "Time to review: Cell Biology", description: "Spaced repetition reminder — due today", course: "Biology", type: "review", read: false },
  { id: "n2", title: "New topic unlocked!", description: "DNA & RNA is now available in Biology", course: "Biology", type: "reminder", read: false },
  { id: "n3", title: "7-day streak! 🔥", description: "You've studied every day this week", course: "", type: "achievement", read: true },
  { id: "n4", title: "Review: Solving Equations", description: "It's been 5 days since your last review", course: "Mathematics", type: "review", read: false },
];

export const mockSchedule: ScheduleItem[] = [
  { time: "8:30 AM", lesson: "Math", teacher: "Mrs. Goodman", location: "B3, Room 124", avatar: "" },
  { time: "9:30 AM", lesson: "Biology", teacher: "Mr. Chen", location: "A1, Lab 3", avatar: "" },
  { time: "10:45 AM", lesson: "English Lit", teacher: "Ms. Rivera", location: "C2, Room 210", avatar: "" },
  { time: "12:00 PM", lesson: "Lunch Break", teacher: "—", location: "Cafeteria", avatar: "" },
  { time: "1:00 PM", lesson: "Physics", teacher: "Dr. Patel", location: "A1, Lab 1", avatar: "" },
  { time: "2:15 PM", lesson: "History", teacher: "Mr. Thompson", location: "B2, Room 108", avatar: "" },
];

export const mockNotes: Note[] = [
  { id: "note1", title: "Math conspect", content: "A linear equation is an equation of the form: ax+b=cax + b = cax+b=c, where x is the variable, a, b, and c are constants, and a≠0.", date: "May 05, 2025", color: "green" },
  { id: "note2", title: "Biology conspect", content: "A cell is the basic structural, functional, and biological unit of all living organisms. It is the smallest unit capable of performing life functions.", date: "Apr 29, 2025", color: "purple" },
  { id: "note3", title: "Poetry notes", content: "Metaphor: a figure of speech that directly compares two unlike things. Simile: uses 'like' or 'as' to make a comparison.", date: "Apr 25, 2025", color: "green" },
];

export const mockReportData = {
  weeklyStudyTime: [
    { week: "W1", hours: 8 },
    { week: "W2", hours: 12 },
    { week: "W3", hours: 10 },
    { week: "W4", hours: 15 },
    { week: "W5", hours: 11 },
    { week: "W6", hours: 14 },
  ],
  quizScores: [
    { subject: "Math", score: 85 },
    { subject: "Biology", score: 72 },
    { subject: "English", score: 90 },
    { subject: "Physics", score: 65 },
    { subject: "History", score: 78 },
  ],
  topicsCompleted: 12,
};
