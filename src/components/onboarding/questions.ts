export interface OnboardingQuestion {
  id: number;
  text: string;
  type: "single-cards" | "multi-chips" | "input";
  options?: string[];
  dynamicSubjects?: boolean;
  phase: string;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // Phase 1 — Goals
  {
    id: 1,
    text: "What are you mainly here to do?",
    type: "single-cards",
    options: [
      "Prepare for upcoming exams",
      "Keep up with school and understand my subjects",
      "Get ahead and learn more than what's in class",
      "Just curious — I want to explore",
    ],
    phase: "Goals",
  },
  {
    id: 2,
    text: "Which subject do you feel most behind in right now?",
    type: "multi-chips",
    dynamicSubjects: true,
    phase: "Goals",
  },

  // Phase 2 — Emotional Context
  {
    id: 3,
    text: "Which subject actually excites you — the one you'd study even if it wasn't required?",
    type: "single-cards",
    dynamicSubjects: true,
    phase: "Emotional Context",
  },
  {
    id: 4,
    text: "And which subject stresses you out the most?",
    type: "single-cards",
    dynamicSubjects: true,
    phase: "Emotional Context",
  },

  // Phase 3 — Learning Style / VAK Probe
  {
    id: 5,
    text: "When you get stuck on something new, what helps you most first?",
    type: "single-cards",
    options: [
      "Seeing a diagram, chart, or worked example",
      "Reading or hearing a clear explanation",
      "Just trying a problem myself, even if I get it wrong",
    ],
    phase: "Learning Style",
  },
  {
    id: 6,
    text: "When I teach you a new concept, what would you prefer to get first?",
    type: "single-cards",
    options: [
      "A visual — flowchart, image, or comparison table",
      "A written explanation I can read through",
      "A short task or question to try right away",
    ],
    phase: "Learning Style",
  },
  {
    id: 7,
    text: "The night before an exam, what do you usually do?",
    type: "single-cards",
    options: [
      "Write summaries, draw mind maps, or review highlighted notes",
      "Re-read notes or explain topics out loud to myself",
      "Grind through as many practice questions as possible",
    ],
    phase: "Learning Style",
  },
  {
    id: 8,
    text: "If you forget something you learned last week, what brings it back fastest?",
    type: "single-cards",
    options: [
      "Looking at a visual or re-reading an example",
      "Hearing or reading a simpler explanation of it",
      "Doing a practice question on it with hints",
    ],
    phase: "Learning Style",
  },

  // Phase 4 — Pace and Focus
  {
    id: 9,
    text: "How long can you usually focus before your brain starts drifting?",
    type: "single-cards",
    options: [
      "Under 15 minutes",
      "15–30 minutes",
      "30–45 minutes",
      "Over 45 minutes",
    ],
    phase: "Pace & Focus",
  },
  {
    id: 10,
    text: "When you study, what do you prefer?",
    type: "single-cards",
    options: [
      "Short, fast sessions with lots of quick questions",
      "Longer, deep dives into one topic at a time",
      "A mix — it depends on the subject",
    ],
    phase: "Pace & Focus",
  },

  // Phase 5 — Self-Awareness
  {
    id: 11,
    text: "When you get a question wrong, what do you usually do?",
    type: "single-cards",
    options: [
      "Re-read the topic until I understand why",
      "Move on and hope it clicks later",
      "Look for a simpler explanation or example",
      "Try similar questions until I get it right",
    ],
    phase: "Self-Awareness",
  },
  {
    id: 12,
    text: "Last one — how do you usually know when you've truly understood something?",
    type: "single-cards",
    options: [
      "I can explain it in my own words without looking",
      "I can answer questions on it without hesitating",
      "It just feels clear in my head",
      "Honestly, I'm not always sure",
    ],
    phase: "Self-Awareness",
  },
];

export const OPENING_MESSAGE =
  "Before we get started, I want to figure out the best way to teach you — not guess it. I'll ask you 12 quick questions about how you actually study. Be honest, there are no right answers here.";

export const CLOSING_MESSAGE =
  "Perfect — that's everything I need. I've built your learning profile and I'm ready to start teaching you in a way that actually works for you. Let's go.";

const ACKNOWLEDGEMENTS = [
  "Got it! 👍",
  "Great, noted!",
  "That's helpful, thanks!",
  "Nice, I'll keep that in mind.",
  "Perfect, makes sense.",
  "Awesome, good to know!",
  "Thanks for sharing that!",
  "Interesting — I'll remember that.",
  "Cool, that helps a lot!",
  "Noted! Let's keep going.",
  "Love the honesty!",
  "Great answer!",
];

let lastAckIndex = -1;
export function getRandomAck(): string {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * ACKNOWLEDGEMENTS.length);
  } while (idx === lastAckIndex);
  lastAckIndex = idx;
  return ACKNOWLEDGEMENTS[idx];
}
