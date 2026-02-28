import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string | null;
  role: "student" | "ai";
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
}

export function useChatMessages(subjectId: string, topicId?: string) {
  const { supabaseUser } = useAuth();
  return useQuery({
    queryKey: ["chat_messages", supabaseUser?.id, subjectId, topicId],
    enabled: !!supabaseUser && !!subjectId,
    queryFn: async () => {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", supabaseUser!.id)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: true });
      if (topicId) query = query.eq("topic_id", topicId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ChatMessage[];
    },
  });
}

export function useSendMessage() {
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: {
      subject_id: string;
      topic_id?: string;
      role: "student" | "ai";
      content: string;
      message_type?: string;
      metadata?: any;
    }) => {
      if (!supabaseUser) throw new Error("Not authenticated");
      const { error } = await supabase.from("chat_messages").insert({
        user_id: supabaseUser.id,
        subject_id: msg.subject_id,
        topic_id: msg.topic_id || null,
        role: msg.role,
        content: msg.content,
        message_type: msg.message_type || "text",
        metadata: msg.metadata || {},
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chat_messages", supabaseUser!.id, vars.subject_id] });
    },
  });
}
