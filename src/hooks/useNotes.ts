import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: "purple" | "green";
  subject_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { supabaseUser } = useAuth();
  return useQuery({
    queryKey: ["notes", supabaseUser?.id],
    enabled: !!supabaseUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", supabaseUser!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });
}

export function useCreateNote() {
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { title: string; content: string; color: string; subject_id?: string }) => {
      if (!supabaseUser) throw new Error("Not authenticated");
      const { error } = await supabase.from("notes").insert({
        user_id: supabaseUser.id,
        title: note.title,
        content: note.content,
        color: note.color,
        subject_id: note.subject_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!supabaseUser) throw new Error("Not authenticated");
      const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("user_id", supabaseUser.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
