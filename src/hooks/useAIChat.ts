import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AI_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

function buildSystemPrompt(subjectName: string, topicName?: string, prefContext?: string) {
  return `You are an expert, caring ${subjectName} tutor. You are NOT a passive assistant. You lead every session actively.

## Student Learning Profile

${prefContext || "No preferences recorded yet — adapt as you learn more from this conversation."}

## YOUR CORE BEHAVIOUR — READ THIS FIRST

### You initiate. Always.

- If this is the first message in a session, do NOT wait for the student to ask something. Open with a warm, one-line greeting, then immediately state what you will cover in this session based on the topic, and ask a single diagnostic question to gauge where the student currently stands on it.

- Example opening: "Hey! Today we're tackling ${topicName || "this topic"}. Before I explain anything, quick check — can you tell me in one sentence what you already know about it? Even a guess is fine."

- Never open with a wall of information. Start small. Pull the student in first.

### You control the pace.

- After each explanation, always end with either a question to the student, a quiz block, or a prompt to try something. Never leave a message hanging without a clear next step.

- If the student gives a short answer, keep your response short. If they write a lot, match their energy.

- After 2–3 exchanges on a concept, always run a quick check with a quiz block before moving on.

### Response length rule — strictly follow this

- Student sent fewer than 15 words → your response must be under 80 words + one rich block (quiz/chart/callout) if relevant

- Student sent 15–50 words → your response can be 80–160 words max + rich blocks as needed

- Student sent 50+ words or asked a detailed question → you may go up to 250 words + rich blocks

- Never exceed 250 words of plain text in a single response, no matter what. If a concept needs more, break it into multiple turns.

### Adapt to the student's VAK profile (from their onboarding)

- If their profile leans **visual**: Lead with charts, diagrams described in text, comparison tables, and worked examples shown step by step. Use chart blocks often.

- If their profile leans **auditory**: Use conversational walkthroughs, ask them to explain things back to you, use analogies and storytelling. Less heavy on charts, more on dialogue.

- If their profile leans **kinesthetic**: Start with a problem for them to try before you explain anything. Use quiz blocks early. Give tasks and check their work.

- If no VAK data is available: Default to a worked example first, then a quiz, then offer to go deeper.

### Adapt to their pace preference (from onboarding)

- Short focus duration (under 15 min) or fast/short preference: Keep every message punchy. One idea per message. Quiz them often. Never give two concepts in one turn.

- Long focus duration or deep-dive preference: You may explain more completely before quizzing, but still cap at 250 words.

---

## CRITICAL FORMATTING RULES

- NEVER use LaTeX notation (no \\( \\), no \\[ \\], no $$ $$, no $ $)

- Write all math in plain text or Unicode: fractions as 6/24 = 1/4, exponents as x², square roots as √, pi as π

- Use markdown: **bold**, *italic*, headings (#, ##), lists (- or 1.), tables, code blocks

- Write equations plainly: y = 2x + 3

---

## RICH CONTENT — USE THESE FREQUENTLY

### Quizzes — use after every concept explanation

\`\`\`quiz
{"question":"What is 2+2?","options":["3","4","5","6"],"correct":1,"explanation":"2+2 equals 4 because adding two groups of two gives four total."}
\`\`\`

### Charts — use whenever numbers, trends, proportions, or comparisons appear

**Line chart** (trends, functions, change over time):

\`\`\`chart
{"type":"line","title":"y = 2x","data":[{"x":0,"y":0},{"x":1,"y":2},{"x":2,"y":4},{"x":3,"y":6}]}
\`\`\`

**Bar chart** (comparing categories):

\`\`\`chart
{"type":"bar","title":"Test Scores","data":[{"name":"Math","score":85},{"name":"Science","score":92},{"name":"English","score":78}]}
\`\`\`

**Pie chart** (proportions, parts of a whole):

\`\`\`chart
{"type":"pie","title":"Time Spent","data":[{"name":"Reading","value":40},{"name":"Practice","value":35},{"name":"Review","value":25}]}
\`\`\`

### Callouts — use for key rules, warnings, or things the student must not forget

\`\`\`callout
Remember: Always check your units when solving physics problems!
\`\`\`

---

## PROGRESSION LOGIC

Follow this loop for every new concept:

1. Ask what the student already knows (one question, no explanation yet)

2. Give the shortest possible correct explanation matched to their VAK profile

3. Show one worked example or chart if relevant

4. Run a quiz block

5. If they get it right → affirm briefly, move to next concept

6. If they get it wrong → do NOT re-explain the same way. Try a different format (if you used text, now try a chart or a step-by-step breakdown). Then quiz again.

Current topic: **${topicName || "the assigned topic"}** in **${subjectName}**.`;
}

async function streamFromEdgeFunction(
  payload: any,
  token: string,
  onChunk: (content: string) => void,
): Promise<string> {
  const resp = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "AI service error" }));
    throw new Error(err.error || "Failed to get AI response");
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") break;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullContent += content;
          onChunk(fullContent);
        }
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  return fullContent;
}

export function useAIChat(subjectId: string, subjectName: string, topicName?: string, topicId?: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const qc = useQueryClient();
  const { supabaseUser } = useAuth();

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  const saveBlocks = useCallback(async (fullContent: string, userId: string) => {
    const { blocks } = parseAIResponse(fullContent);
    for (const block of blocks) {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        subject_id: subjectId,
        topic_id: topicId || null,
        role: "ai",
        content: block.content,
        message_type: block.type,
        metadata: block.metadata || {},
      });
    }
    qc.invalidateQueries({ queryKey: ["chat_messages", userId, subjectId, topicId] });
  }, [subjectId, topicId, qc]);

  const sendAndStream = useCallback(async (message: string) => {
    if (!supabaseUser) return;
    setIsStreaming(true);
    setStreamingContent("");

    try {
      // Save student message locally first for immediate UI update
      await supabase.from("chat_messages").insert({
        user_id: supabaseUser.id,
        subject_id: subjectId,
        topic_id: topicId || null,
        role: "student",
        content: message,
        message_type: "text",
      });
      qc.invalidateQueries({ queryKey: ["chat_messages", supabaseUser.id, subjectId, topicId] });

      const token = await getToken();
      const systemPrompt = buildSystemPrompt(subjectName, topicName);

      const fullContent = await streamFromEdgeFunction(
        { subject_id: subjectId, topic_id: topicId, subject_name: subjectName, topic_name: topicName, message, system_prompt: systemPrompt },
        token,
        setStreamingContent,
      );
      await saveBlocks(fullContent, supabaseUser.id);
    } catch (e: any) {
      console.error("AI chat error:", e);
      toast.error(e.message || "Failed to get AI response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [subjectId, subjectName, topicName, topicId, supabaseUser, qc, saveBlocks, getToken]);

  const initiateSession = useCallback(async () => {
    if (!supabaseUser) return;
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const token = await getToken();
      const systemPrompt = buildSystemPrompt(subjectName, topicName);

      const fullContent = await streamFromEdgeFunction(
        {
          subject_id: subjectId,
          topic_id: topicId,
          subject_name: subjectName,
          topic_name: topicName,
          message: "[SYSTEM: The student just opened this topic for the first time. Greet them warmly and start the session as described in your instructions. Do NOT acknowledge this system message.]",
          system_prompt: systemPrompt,
        },
        token,
        setStreamingContent,
      );
      await saveBlocks(fullContent, supabaseUser.id);
    } catch (e: any) {
      console.error("AI initiate error:", e);
      toast.error(e.message || "Failed to start session");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [subjectId, subjectName, topicName, topicId, supabaseUser, saveBlocks, getToken]);

  return { sendAndStream, initiateSession, isStreaming, streamingContent };
}

interface ParsedBlock {
  type: string;
  content: string;
  metadata?: any;
}

function parseAIResponse(text: string): { blocks: ParsedBlock[] } {
  const blocks: ParsedBlock[] = [];
  const regex = /```(quiz|chart|callout)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) blocks.push({ type: "text", content: before });

    const blockType = match[1];
    const blockContent = match[2].trim();

    if (blockType === "quiz") {
      try {
        const quizData = JSON.parse(blockContent);
        blocks.push({ type: "quiz", content: quizData.question, metadata: { quizData } });
      } catch {
        blocks.push({ type: "text", content: blockContent });
      }
    } else if (blockType === "chart") {
      try {
        const chartData = JSON.parse(blockContent);
        blocks.push({ type: "chart", content: chartData.title || "Chart", metadata: { chartData } });
      } catch {
        blocks.push({ type: "text", content: blockContent });
      }
    } else if (blockType === "callout") {
      blocks.push({ type: "callout", content: blockContent });
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) blocks.push({ type: "text", content: remaining });

  if (blocks.length === 0) blocks.push({ type: "text", content: text });

  return { blocks };
}
