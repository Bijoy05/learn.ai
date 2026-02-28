import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const OPENROUTER_API_KEY = "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";

export function useAIChat(subjectId: string, subjectName: string, topicName?: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const qc = useQueryClient();
  const { supabaseUser } = useAuth();

  const sendAndStream = useCallback(async (message: string) => {
    if (!supabaseUser) return;

    setIsStreaming(true);
    setStreamingContent("");

    try {
      // Save student message first
      await supabase.from("chat_messages").insert({
        user_id: supabaseUser.id,
        subject_id: subjectId,
        role: "student",
        content: message,
        message_type: "text",
      });
      qc.invalidateQueries({ queryKey: ["chat_messages", supabaseUser.id, subjectId] });

      // Fetch user preferences
      const { data: prefs } = await supabase
        .from("onboarding_responses")
        .select("question_text, answer")
        .eq("user_id", supabaseUser.id);

      const prefContext = (prefs || [])
        .map((p) => `${p.question_text}: ${typeof p.answer === "string" ? p.answer : JSON.stringify(p.answer)}`)
        .join("\n");

      // Fetch recent chat history
      const { data: history } = await supabase
        .from("chat_messages")
        .select("role, content, message_type")
        .eq("user_id", supabaseUser.id)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true })
        .limit(30);

      const chatHistory = (history || []).map((m) => ({
        role: m.role === "student" ? "user" as const : "assistant" as const,
        content: m.content,
      }));

      const systemPrompt = `You are an expert, caring ${subjectName} teacher for a student. Your goal is to help them deeply understand ${topicName || "the current topic"} in ${subjectName}.

## Student Learning Profile
${prefContext || "No preferences available yet."}

## CRITICAL FORMATTING RULES
- NEVER use LaTeX notation (no \\( \\), no \\[ \\], no $$ $$, no $ $)
- Write all math in plain text or Unicode: use fractions like 6/24 = 1/4, exponents like x², x³, square roots like √, pi like π
- Use markdown formatting: **bold**, *italic*, headings (#, ##, ###), lists (- or 1.), tables, code blocks
- For fractions, write them as: 6/24 = 1/4 (plain text)
- For equations, write them plainly: y = 2x + 3, not in any LaTeX format

## Your Teaching Style Rules
- Adapt your explanations to match how this student learns best (see their preferences above)
- Be encouraging, patient, and break complex ideas into digestible steps
- Use analogies and real-world examples relevant to their grade level
- Keep responses focused and not too long unless they ask for detail

## Rich Content Generation
You can generate special interactive content by wrapping it in specific tags. Use these FREQUENTLY to make learning engaging:

### Quizzes
When testing understanding, generate a quiz block like this:
\`\`\`quiz
{"question":"What is 2+2?","options":["3","4","5","6"],"correct":1,"explanation":"2+2 equals 4 because adding two groups of two gives four total."}
\`\`\`

### Charts/Graphs
You MUST use one of these chart types when explaining data visually:

**Line chart** (for trends, functions, continuous data):
\`\`\`chart
{"type":"line","title":"y = 2x","data":[{"x":0,"y":0},{"x":1,"y":2},{"x":2,"y":4},{"x":3,"y":6}]}
\`\`\`

**Pie chart** (for proportions, percentages, parts of a whole):
\`\`\`chart
{"type":"pie","title":"Favorite Subjects","data":[{"name":"Math","value":6},{"name":"Biology","value":9},{"name":"Physics","value":3},{"name":"Other","value":6}]}
\`\`\`

**Bar chart** (for comparing categories, discrete data):
\`\`\`chart
{"type":"bar","title":"Test Scores","data":[{"name":"Math","score":85},{"name":"Science","score":92},{"name":"English","score":78}]}
\`\`\`

### Callouts
For important tips, warnings, or key takeaways:
\`\`\`callout
Remember: Always check your units when solving physics problems!
\`\`\`

## Important
- Generate quizzes after explaining concepts to check understanding
- Use charts whenever discussing numerical relationships, proportions, or comparisons
- Choose the right chart type: pie for parts-of-whole, bar for comparisons, line for trends
- Make quizzes have 4 options, with clear explanations for the correct answer
- Keep quiz questions at the student's grade level
- Be conversational and friendly, like a real tutor
- NEVER use LaTeX — use plain text math only`;

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.2",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: message },
          ],
          stream: true,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        toast.error(err.error?.message || err.error || "Failed to get AI response");
        setIsStreaming(false);
        return;
      }

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
              setStreamingContent(fullContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Parse the full content for rich blocks and save as AI message
      const { blocks } = parseAIResponse(fullContent);

      for (const block of blocks) {
        await supabase.from("chat_messages").insert({
          user_id: supabaseUser.id,
          subject_id: subjectId,
          role: "ai",
          content: block.content,
          message_type: block.type,
          metadata: block.metadata || {},
        });
      }

      qc.invalidateQueries({ queryKey: ["chat_messages", supabaseUser.id, subjectId] });
    } catch (e) {
      console.error("AI chat error:", e);
      toast.error("Failed to get AI response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [subjectId, subjectName, topicName, supabaseUser, qc]);

  return { sendAndStream, isStreaming, streamingContent };
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
