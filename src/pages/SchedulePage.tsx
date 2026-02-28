import { motion } from "framer-motion";
import { useSchedule } from "@/hooks/useData";

export default function SchedulePage() {
  const { schedule } = useSchedule();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
        <span className="text-sm text-muted-foreground">May 14, Monday</span>
      </div>
      <motion.div
        className="bg-card rounded-2xl border shadow-soft overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left text-xs font-medium text-muted-foreground p-5 pb-3">Time</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-5 pb-3">Lesson</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-5 pb-3">Teacher</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-5 pb-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="p-5 text-sm text-muted-foreground">{item.time}</td>
                <td className="p-5 text-sm font-medium text-foreground">{item.lesson}</td>
                <td className="p-5 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground font-medium">
                      {item.teacher !== "—" ? item.teacher.split(" ").map(w => w[0]).join("") : "—"}
                    </div>
                    {item.teacher}
                  </div>
                </td>
                <td className="p-5 text-sm text-muted-foreground">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
