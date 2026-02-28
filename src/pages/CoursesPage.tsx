import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/useData";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

export default function CoursesPage() {
  const { courses } = useCourses();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Courses</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={`/dashboard/courses/${course.id}`} className="block bg-card rounded-2xl border p-5 shadow-soft hover:shadow-card transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${course.color === "purple" ? "card-purple" : "card-green"}`}>{course.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground">{course.topics.length} topics</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{course.progress}%</span></div>
                <Progress value={course.progress} className="h-2" />
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Continue <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
