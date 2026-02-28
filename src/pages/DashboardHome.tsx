import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useUserSubjects } from "@/hooks/useSubjects";
import { useNotes } from "@/hooks/useNotes";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { EXTRACURRICULAR_COURSES } from "@/lib/extracurricularCourses";

export default function DashboardHome() {
  const { data: courses = [], isLoading } = useUserSubjects();
  const { data: notes = [] } = useNotes();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">My Courses</h2>
          <Link to="/dashboard/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects selected. <Link to="/dashboard/settings" className="text-accent hover:underline">Add subjects</Link></p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => {
              const completed = course.topics.filter((t) => t.status === "completed").length;
              const progress = course.topics.length > 0 ? Math.round((completed / course.topics.length) * 100) : 0;
              return (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link to={`/dashboard/courses/${course.id}`} className="block bg-card rounded-2xl border p-5 shadow-soft hover:shadow-card transition-shadow group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${course.color === "purple" ? "card-purple" : "card-green"}`}>{course.icon}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.topics.length} topics</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{progress}%</span></div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Continue <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        {/* EC link */}
        <button
          onClick={() => navigate("/dashboard/courses")}
          className="mt-3 text-xs text-accent hover:underline font-medium"
        >
          + View extra-curricular courses ({EXTRACURRICULAR_COURSES.length} available)
        </button>
      </section>

      {/* Notes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">My Notes</h2>
          <Link to="/dashboard/notes" className="text-sm text-muted-foreground hover:text-foreground">+ New</Link>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. <Link to="/dashboard/notes" className="text-accent hover:underline">Create one</Link></p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {notes.slice(0, 4).map((note, i) => (
              <motion.div
                key={note.id}
                className={`rounded-2xl p-5 ${note.color === "purple" ? "card-purple" : "card-green"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <h3 className="font-semibold text-sm mb-1">{note.title}</h3>
                <p className="text-xs leading-relaxed opacity-80 line-clamp-4">{note.content}</p>
                <p className="text-xs opacity-60 mt-3">{new Date(note.created_at).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
