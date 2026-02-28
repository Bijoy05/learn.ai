import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          subject_id: subjectId,
          subject_name: subjectName,
          topic_name: topicName,
          message,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        toast.error(err.error || "Failed to get AI response");
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
