import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useCourses, useNotes, useSchedule } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DashboardHome() {
  const { courses } = useCourses();
  const { notes } = useNotes();
  const { schedule } = useSchedule();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">My Courses</h2>
          <Link to="/dashboard/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/dashboard/courses/${course.id}`}
                className="block bg-card rounded-2xl border p-5 shadow-soft hover:shadow-card transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${course.color === "purple" ? "card-purple" : "card-green"}`}>
                    {course.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.topics.length} topics</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Continue <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">My Notes</h2>
            <Link to="/dashboard/notes" className="text-sm text-muted-foreground hover:text-foreground">+ New</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {notes.slice(0, 2).map((note, i) => (
              <motion.div
                key={note.id}
                className={`rounded-2xl p-5 ${note.color === "purple" ? "card-purple" : "card-green"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{note.title}</h3>
                  <button className="opacity-60 hover:opacity-100">•••</button>
                </div>
                <p className="text-xs leading-relaxed opacity-80 line-clamp-4">{note.content}</p>
                <p className="text-xs opacity-60 mt-3">{note.date}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">My Schedule</h2>
            <Link to="/dashboard/schedule" className="text-sm text-muted-foreground hover:text-foreground">
              May 14, Mon ↓
            </Link>
          </div>
          <div className="bg-card rounded-2xl border shadow-soft overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4 pb-3">Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4 pb-3">Lesson</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4 pb-3">Teacher</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4 pb-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {schedule.slice(0, 4).map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-4 text-sm text-muted-foreground">{item.time}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{item.lesson}</td>
                    <td className="p-4 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                          {item.teacher[0]}
                        </div>
                        {item.teacher}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
