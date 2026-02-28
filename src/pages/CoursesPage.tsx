import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserSubjects } from "@/hooks/useSubjects";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Loader2 } from "lucide-react";
import { EXTRACURRICULAR_COURSES, EXTRACURRICULAR_IDS, ecToSubject } from "@/lib/extracurricularCourses";
import type { Subject } from "@/hooks/useSubjects";

function CourseCard({ course, index, isEC = false }: { course: Subject; index: number; isEC?: boolean }) {
  const completed = course.topics.filter((t) => t.status === "completed").length;
  const progress = course.topics.length > 0 ? Math.round((completed / course.topics.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <Link to={`/dashboard/courses/${course.id}`} className="block bg-card rounded-2xl border p-5 shadow-soft hover:shadow-card transition-shadow group relative">
        {isEC && (
          <span className="absolute top-3 right-3 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            Extra
          </span>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isEC ? "" : course.color === "purple" ? "card-purple" : "card-green"}`}
            style={isEC ? { backgroundColor: `${EXTRACURRICULAR_COURSES.find(e => e.id === course.id)?.color ?? '#a28ef9'}22` } : undefined}
          >
            {course.icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{course.name}</p>
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
}

export default function CoursesPage() {
  const { data: allUserCourses = [], isLoading } = useUserSubjects();
  const courses = allUserCourses.filter((c) => !EXTRACURRICULAR_IDS.has(c.id));
  const ecSubjects = EXTRACURRICULAR_COURSES.map(ecToSubject);

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* My Courses */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No subjects selected yet. Go to Settings to add subjects.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t" />

      {/* Extra-Curricular */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-foreground">Extra-Curricular</h2>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "hsl(252 90% 77% / 0.15)", color: "hsl(252 90% 67%)" }}>
            Free for all students
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {ecSubjects.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} isEC />
          ))}
        </div>
      </section>
    </div>
  );
}
