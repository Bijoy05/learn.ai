import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useCourses } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const { courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const recentSessions = courses.flatMap((course) =>
    course.topics
      .filter((t) => t.status !== "locked")
      .flatMap((t) =>
        t.sessions
          .filter((s) => s.date)
          .map((s) => ({ ...s, courseName: course.name, courseId: course.id, courseIcon: course.icon, courseColor: course.color }))
      )
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Chat</h1>
      <p className="text-muted-foreground text-sm">Select a course to start or continue a learning session.</p>

      {/* Course selector */}
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
              className={`flex items-center gap-3 p-4 rounded-2xl border bg-card shadow-soft hover:shadow-card transition-all`}
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

      {/* Recent sessions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Sessions</h2>
        <div className="space-y-2">
          {recentSessions.slice(0, 8).map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
            >
              <Link
                to={`/dashboard/courses/${session.courseId}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border hover:bg-secondary transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  session.status === "complete" ? "bg-success" : session.status === "review" ? "bg-accent" : "bg-muted-foreground"
                }`} />
                <span className="text-sm font-medium text-foreground flex-1">{session.topicName}</span>
                <span className="text-xs text-muted-foreground">{session.courseName}</span>
                <span className="text-xs text-muted-foreground">{session.date}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
