import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Network, CheckCircle2, Circle, Lock, Loader2 } from "lucide-react";
import { KnowledgeGraph } from "@/components/KnowledgeGraph/KnowledgeGraph";
import { useUserSubjects } from "@/hooks/useSubjects";
import { SUBJECT_COLORS } from "@/lib/buildGraphData";
import { getExtracurricularSubjects, EXTRACURRICULAR_IDS } from "@/lib/extracurricularCourses";

export default function KnowledgeGraphPage() {
  const { data: courses = [], isLoading } = useUserSubjects();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const allCourses = useMemo(() => [...courses, ...getExtracurricularSubjects()], [courses]);

  const stats = useMemo(() => {
    let totalSkills = 0, completed = 0, unlocked = 0, subjectsInProgress = 0;
    allCourses.forEach((c) => {
      let hasUnlocked = false;
      c.topics.forEach((t) => {
        totalSkills++;
        if (t.status === "completed") completed++;
        if (t.status === "unlocked") { unlocked++; hasUnlocked = true; }
      });
      if (hasUnlocked || c.topics.some((t) => t.status === "completed" && !c.topics.every((t2) => t2.status === "completed"))) {
        subjectsInProgress++;
      }
    });
    return { totalSkills, completed, unlocked: completed + unlocked, subjectsInProgress };
  }, [allCourses]);

  const toggleSubject = (id: string) => setActiveSubject((prev) => (prev === id ? null : id));

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <motion.div className="w-[280px] shrink-0 border-r bg-card flex flex-col p-5 overflow-y-auto" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-bold text-foreground">Your Knowledge Universe</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-6">Every skill you unlock expands this graph.</p>

        <div className="mb-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Node Types</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-foreground" /><span className="text-xs text-foreground">You (center)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-accent" /><span className="text-xs text-foreground">Subject</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent/60" /><span className="text-xs text-foreground">Skill / Topic</span></div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /><span className="text-xs text-foreground">Completed</span></div>
            <div className="flex items-center gap-2"><Circle className="w-3.5 h-3.5 text-accent" /><span className="text-xs text-foreground">In Progress</span></div>
            <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-muted-foreground/40" /><span className="text-xs text-foreground">Locked</span></div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Subject</p>
          <div className="space-y-1">
            {allCourses.map((course) => {
              const color = SUBJECT_COLORS[course.id] ?? (EXTRACURRICULAR_IDS.has(course.id) ? "#999" : "#ccc");
              const isActive = activeSubject === course.id;
              const isEC = EXTRACURRICULAR_IDS.has(course.id);
              return (
                <button key={course.id} onClick={() => toggleSubject(course.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive ? "bg-secondary text-foreground ring-1 ring-border" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <div className={`w-3 h-3 rounded-full shrink-0 ${isEC ? "border border-dashed border-muted-foreground" : ""}`} style={{ backgroundColor: isEC ? "transparent" : color }} />
                  <span>{course.name}</span>
                  {isEC && <span className="text-[9px] text-muted-foreground/60 ml-0.5">EC</span>}
                  <span className="ml-auto text-[10px] opacity-60">{course.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stats</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary p-3"><p className="text-lg font-bold text-foreground">{stats.unlocked}</p><p className="text-[10px] text-muted-foreground">Skills Unlocked</p></div>
            <div className="rounded-xl bg-secondary p-3"><p className="text-lg font-bold text-foreground">{stats.completed}</p><p className="text-[10px] text-muted-foreground">Completed</p></div>
            <div className="rounded-xl bg-secondary p-3 col-span-2"><p className="text-lg font-bold text-foreground">{stats.subjectsInProgress}</p><p className="text-[10px] text-muted-foreground">Subjects In Progress</p></div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 min-w-0 h-full">
        <KnowledgeGraph activeSubject={activeSubject} courses={allCourses} />
      </div>
    </div>
  );
}
