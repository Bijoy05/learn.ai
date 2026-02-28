import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: "purple" | "green";
  display_order: number;
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

/** All available subjects from the catalogue */
export function useAllSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data ?? []).map((row) => mapSubject(row, {}));
    },
  });
}

/** Only the subjects the current user has selected, with per-user topic progress merged */
export function useUserSubjects() {
  const { supabaseUser } = useAuth();
  return useQuery({
    queryKey: ["user_subjects", supabaseUser?.id],
    enabled: !!supabaseUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subjects")
        .select("subject_id, topic_progress, subjects(*)")
        .eq("user_id", supabaseUser!.id);
      if (error) throw error;
      return (data ?? []).map((row: any) => mapSubject(row.subjects, row.topic_progress || {}));
    },
  });
}

/** Save user's subject selections (replaces all) */
export function useSaveUserSubjects() {
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (subjectIds: string[]) => {
      if (!supabaseUser) throw new Error("Not authenticated");
      // Delete existing
      await supabase.from("user_subjects").delete().eq("user_id", supabaseUser.id);
      // Insert new
      if (subjectIds.length > 0) {
        const rows = subjectIds.map((sid) => ({ user_id: supabaseUser.id, subject_id: sid }));
        const { error } = await supabase.from("user_subjects").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_subjects"] });
    },
  });
}

/** Update per-user topic progress for a specific subject */
export function useUpdateTopicProgress() {
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, topicProgress }: { subjectId: string; topicProgress: Record<string, string> }) => {
      if (!supabaseUser) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_subjects")
        .update({ topic_progress: topicProgress as any })
        .eq("user_id", supabaseUser.id)
        .eq("subject_id", subjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_subjects"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

function mapSubject(row: any, topicProgress: Record<string, string>): Subject {
  const basTopics: any[] = row.topics as any[] ?? [];
  
  // Apply per-user progress overrides
  const topics = basTopics.map((t: any, idx: number) => {
    const userStatus = topicProgress[t.id];
    let status = t.status ?? "locked";
    
    if (userStatus) {
      status = userStatus;
    } else if (!userStatus) {
      // Check if a previous topic was completed by the user, unlocking this one
      const prevTopic = idx > 0 ? basTopics[idx - 1] : null;
      if (prevTopic) {
        const prevUserStatus = topicProgress[prevTopic.id];
        if (prevUserStatus === "completed" && status === "locked") {
          status = "unlocked";
        }
      }
    }
    
    return {
      id: t.id,
      name: t.name,
      status: status as "locked" | "unlocked" | "completed",
      sessions: (t.sessions ?? []).map((s: any) => ({
        id: s.id,
        topicName: s.topicName ?? s.name ?? "",
        date: s.date ?? "",
        status: s.status ?? "active",
      })),
    };
  });

  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color as "purple" | "green",
    display_order: row.display_order,
    topics,
  };
}
