import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Trash2, Loader2 } from "lucide-react";
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NotesPage() {
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<"purple" | "green">("green");

  const handleSave = async () => {
    if (!title.trim()) return;
    await createNote.mutateAsync({ title, content, color });
    setTitle("");
    setContent("");
    setColor("green");
    setShowModal(false);
  };

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Notes</h1>
        <Button className="rounded-xl gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No notes yet. Create your first note!</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              className={`rounded-2xl p-5 relative group ${note.color === "purple" ? "card-purple" : "card-green"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{note.title}</h3>
                <button
                  onClick={() => deleteNote.mutate(note.id)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs leading-relaxed opacity-80 line-clamp-5">{note.content}</p>
              <p className="text-xs opacity-60 mt-3">{new Date(note.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/10" onClick={() => setShowModal(false)} />
          <motion.div
            className="relative bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">New Note</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <Input placeholder="Note title" className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Write your note..." className="rounded-xl min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="flex gap-2">
                <button className={`w-8 h-8 rounded-lg card-green ${color === "green" ? "ring-2 ring-accent" : ""}`} onClick={() => setColor("green")} />
                <button className={`w-8 h-8 rounded-lg card-purple ${color === "purple" ? "ring-2 ring-accent" : ""}`} onClick={() => setColor("purple")} />
              </div>
              <Button className="w-full rounded-xl" onClick={handleSave} disabled={createNote.isPending}>
                {createNote.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save note"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
