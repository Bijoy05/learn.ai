import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAllSubjects } from "@/hooks/useSubjects";
import { Sparkles, Loader2 } from "lucide-react";
import OnboardingChat from "@/components/onboarding/OnboardingChat";
import VAKProfileVisual from "@/components/onboarding/VAKProfileVisual";
import { computeVAK } from "@/components/onboarding/vakScoring";
import { ONBOARDING_QUESTIONS } from "@/components/onboarding/questions";
import type { VAKProfile as VAKProfileType } from "@/components/onboarding/vakScoring";

export default function OnboardingPage() {
  const { user, completeOnboarding, supabaseUser } = useAuth();
  const navigate = useNavigate();
  const { data: allSubjects = [] } = useAllSubjects();
  const [phase, setPhase] = useState<"celebration" | "welcome" | "chat" | "building">("celebration");
  const [vakProfile, setVakProfile] = useState<VAKProfileType | null>(null);

  const firstName = user?.firstName || "Student";
  const subjectNames = allSubjects.map((s) => s.name);

  useEffect(() => {
    const t = setTimeout(() => setPhase("welcome"), 1800);
    return () => clearTimeout(t);
  }, []);

  const saveAllResponses = async (allAnswers: Record<number, string | string[]>) => {
    if (!supabaseUser) return;

    const rows = ONBOARDING_QUESTIONS.map((q, i) => ({
      user_id: supabaseUser.id,
      question_id: q.id,
      question_text: q.text,
      answer: JSON.stringify(allAnswers[i] ?? ""),
    }));
    await supabase.from("onboarding_responses").upsert(rows, { onConflict: "user_id,question_id" });

    // Save subjects from Q2 (index 1) — behind subjects
    const behindSubjects = allAnswers[1];
    if (Array.isArray(behindSubjects)) {
      const subjectIds = allSubjects
        .filter((s) => behindSubjects.includes(s.name))
        .map((s) => s.id);
      await supabase.from("user_subjects").delete().eq("user_id", supabaseUser.id);
      if (subjectIds.length > 0) {
        await supabase.from("user_subjects").insert(
          subjectIds.map((sid) => ({ user_id: supabaseUser.id, subject_id: sid }))
        );
      }
    }

    // Save VAK profile as a special onboarding response
    const vak = computeVAK(allAnswers);
    setVakProfile(vak);
    await supabase.from("onboarding_responses").upsert(
      [{
        user_id: supabaseUser.id,
        question_id: 99,
        question_text: "VAK Learning Profile",
        answer: JSON.stringify(vak),
      }],
      { onConflict: "user_id,question_id" }
    );
  };

  const handleChatComplete = async (answers: Record<number, string | string[]>) => {
    setPhase("building");
    await saveAllResponses(answers);
    // Show VAK for a few seconds, then navigate
    setTimeout(async () => {
      await completeOnboarding();
      navigate("/dashboard");
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === "celebration" && (
          <motion.div key="celebration" className="fixed inset-0 flex items-center justify-center gradient-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{ background: i % 2 === 0 ? "hsl(252 90% 77%)" : "hsl(122 83% 80%)", left: "50%", top: "50%" }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: [0, 1, 0], x: Math.cos((i * Math.PI * 2) / 20) * 150, y: Math.sin((i * Math.PI * 2) / 20) * 150 }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                />
              ))}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Sparkles className="w-16 h-16 text-accent" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === "welcome" && (
          <motion.div key="welcome" className="text-center max-w-lg px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.h1 className="text-4xl font-bold text-foreground">
              {"Welcome, ".split("").map((c, i) => (
                <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>{c}</motion.span>
              ))}
              {firstName.split("").map((c, i) => (
                <motion.span key={`n${i}`} className="text-accent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i + 9) * 0.05 }}>{c}</motion.span>
              ))}
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (firstName.length + 9) * 0.05 }}>.</motion.span>
            </motion.h1>
            <motion.p className="mt-4 text-muted-foreground text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              Let's set up your learning experience.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
              <Button size="lg" className="mt-8 rounded-xl px-10" onClick={() => setPhase("chat")}>Let's go</Button>
            </motion.div>
          </motion.div>
        )}

        {phase === "chat" && (
          <motion.div key="chat" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <OnboardingChat subjectNames={subjectNames} onComplete={handleChatComplete} />
          </motion.div>
        )}

        {phase === "building" && (
          <motion.div key="building" className="text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Building your learning profile...</p>
            <p className="text-sm text-muted-foreground mt-2">This will just take a moment</p>
            {vakProfile && <VAKProfileVisual profile={vakProfile} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
