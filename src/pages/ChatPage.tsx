import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserSubjects } from "@/hooks/useSubjects";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { data: courses = [], isLoading } = useUserSubjects();

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Chat</h1>
      <p className="text-muted-foreground text-sm">Select a course to start or continue a learning session.</p>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subjects selected. <Link to="/dashboard/settings" className="text-accent hover:underline">Add subjects</Link></p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/dashboard/courses/${course.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl border bg-card shadow-soft hover:shadow-card transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${course.color === "purple" ? "card-purple" : "card-green"}`}>
                  {course.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground">{course.topics.filter(t => t.status !== "locked").length} active topics</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
