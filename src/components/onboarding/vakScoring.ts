export interface VAKProfile {
  visual: number;
  auditory: number;
  kinesthetic: number;
}

/**
 * Compute VAK scores from answers to questions 5–8 (indices 4–7).
 * Each question's options map to [visual, auditory, kinesthetic].
 * Selected option index: 0 → +2 visual, 1 → +2 auditory, 2 → +2 kinesthetic.
 * Max per mode = 8. Normalize to probability.
 */
export function computeVAK(answers: Record<number, string | string[]>): VAKProfile {
  const VAK_QUESTION_INDICES = [4, 5, 6, 7]; // 0-based indices for Q5–Q8
  const OPTIONS_BY_Q: Record<number, string[]> = {
    4: [
      "Seeing a diagram, chart, or worked example",
      "Reading or hearing a clear explanation",
      "Just trying a problem myself, even if I get it wrong",
    ],
    5: [
      "A visual — flowchart, image, or comparison table",
      "A written explanation I can read through",
      "A short task or question to try right away",
    ],
    6: [
      "Write summaries, draw mind maps, or review highlighted notes",
      "Re-read notes or explain topics out loud to myself",
      "Grind through as many practice questions as possible",
    ],
    7: [
      "Looking at a visual or re-reading an example",
      "Hearing or reading a simpler explanation of it",
      "Doing a practice question on it with hints",
    ],
  };

  let visual = 0;
  let auditory = 0;
  let kinesthetic = 0;

  for (const qi of VAK_QUESTION_INDICES) {
    const answer = answers[qi];
    if (typeof answer !== "string") continue;
    const opts = OPTIONS_BY_Q[qi];
    const idx = opts?.indexOf(answer) ?? -1;
    if (idx === 0) visual += 2;
    else if (idx === 1) auditory += 2;
    else if (idx === 2) kinesthetic += 2;
  }

  const total = visual + auditory + kinesthetic || 1;
  return {
    visual: Math.round((visual / total) * 100) / 100,
    auditory: Math.round((auditory / total) * 100) / 100,
    kinesthetic: Math.round((kinesthetic / total) * 100) / 100,
  };
}
