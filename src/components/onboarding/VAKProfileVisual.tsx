import { motion } from "framer-motion";
import type { VAKProfile } from "./vakScoring";
import { Eye, Ear, Hand } from "lucide-react";

const MODES = [
  { key: "visual" as const, label: "Visual", icon: Eye, color: "hsl(252 90% 77%)" },
  { key: "auditory" as const, label: "Auditory", icon: Ear, color: "hsl(200 80% 60%)" },
  { key: "kinesthetic" as const, label: "Kinesthetic", icon: Hand, color: "hsl(122 83% 60%)" },
];

export default function VAKProfileVisual({ profile }: { profile: VAKProfile }) {
  const dominant = MODES.reduce((a, b) => (profile[b.key] > profile[a.key] ? b : a), MODES[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-sm mx-auto mt-6 space-y-4"
    >
      <p className="text-sm text-muted-foreground text-center">Your learning style</p>

      <div className="space-y-3">
        {MODES.map((mode, i) => {
          const pct = Math.round(profile[mode.key] * 100);
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: mode.color + "33" }}
              >
                <Icon className="w-4 h-4" style={{ color: mode.color }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{mode.label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: mode.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 1 + i * 0.2, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-center text-xs text-muted-foreground pt-2"
      >
        You're primarily a <span className="font-semibold text-foreground">{dominant.label}</span> learner
      </motion.p>
    </motion.div>
  );
}
