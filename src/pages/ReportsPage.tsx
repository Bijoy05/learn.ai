import { motion } from "framer-motion";
import { useReportData } from "@/hooks/useData";
import { useStudent } from "@/hooks/useData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Flame, BookOpen, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const { data } = useReportData();
  const { student } = useStudent();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Monthly Report</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Flame, label: "Study Streak", value: `${student.streak} days`, color: "card-green" },
          { icon: BookOpen, label: "Topics Completed", value: `${data.topicsCompleted}`, color: "card-purple" },
          { icon: TrendingUp, label: "Avg Quiz Score", value: `${Math.round(data.quizScores.reduce((a, b) => a + b.score, 0) / data.quizScores.length)}%`, color: "card-green" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className={`rounded-2xl p-5 ${card.color}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <card.icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm opacity-70">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly study time */}
        <div className="bg-card rounded-2xl border shadow-soft p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Study Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.weeklyStudyTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 92%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="hsl(252 90% 77%)" strokeWidth={2} dot={{ fill: "hsl(252 90% 77%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz scores */}
        <div className="bg-card rounded-2xl border shadow-soft p-5">
          <h3 className="font-semibold text-foreground mb-4">Quiz Scores by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.quizScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 92%)" />
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(122 83% 80%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
