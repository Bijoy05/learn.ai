import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAllSubjects } from "@/hooks/useSubjects";
import { Sparkles, Send, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, completeOnboarding, supabaseUser } = useAuth();
  const navigate = useNavigate();
  const { data: allSubjects = [] } = useAllSubjects();
  const [phase, setPhase] = useState<"celebration" | "welcome" | "chat" | "building">("celebration");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ role: "ai" | "student"; text: string }[]>([]);

  const firstName = user?.firstName || "Student";

  // Build questions dynamically — subjects come from DB
  const subjectNames = allSubjects.map((s) => s.name);
  const questions = [
    { id: 1, text: "What grade or year are you in?", type: "input" as const, options: [] },
    { id: 2, text: "Which subjects are you studying this semester?", type: "chips" as const, options: subjectNames },
    { id: 3, text: "When you learn something new, what helps you most?", type: "cards" as const, options: ["Detailed explanations", "Real-world examples", "Visual diagrams", "Practice questions"] },
    { id: 4, text: "How would you describe your current study habits?", type: "cards" as const, options: ["I study a little every day", "I study in long sessions before tests", "I study when I feel like it", "I am just starting to build a routine"] },
    { id: 5, text: "What is one subject you find most challenging and why?", type: "input" as const, options: [] },
    { id: 6, text: "How do you prefer to be checked on your understanding?", type: "cards" as const, options: ["Short quizzes", "Open-ended questions", "Explain it back to me", "A mix of all"] },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("welcome"), 1800);
    return () => clearTimeout(t1);
  }, []);

  const addAiMessage = (text: string) => setMessages((prev) => [...prev, { role: "ai", text }]);
  const addStudentMessage = (text: string) => setMessages((prev) => [...prev, { role: "student", text }]);

  useEffect(() => {
    if (phase === "chat" && currentQ === 0 && messages.length === 0) {
      addAiMessage(questions[0].text);
    }
  }, [phase, currentQ, messages.length, questions]);

  const saveAllResponses = async (allAnswers: Record<number, string | string[]>) => {
    if (!supabaseUser) return;
    // Save onboarding responses
    const rows = questions.map((q, i) => ({
      user_id: supabaseUser.id,
      question_id: q.id,
      question_text: q.text,
      answer: JSON.stringify(allAnswers[i] ?? ""),
    }));
    await supabase.from("onboarding_responses").upsert(rows, { onConflict: "user_id,question_id" });

    // Save selected subjects (question index 1 = subjects)
    const selectedSubjectNames = allAnswers[1];
    if (Array.isArray(selectedSubjectNames)) {
      const subjectIds = allSubjects
        .filter((s) => selectedSubjectNames.includes(s.name))
        .map((s) => s.id);
      // Delete existing and insert new
      await supabase.from("user_subjects").delete().eq("user_id", supabaseUser.id);
      if (subjectIds.length > 0) {
        await supabase.from("user_subjects").insert(
          subjectIds.map((sid) => ({ user_id: supabaseUser.id, subject_id: sid }))
        );
      }
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    const displayText = Array.isArray(answer) ? answer.join(", ") : answer;
    addStudentMessage(displayText);
    const newAnswers = { ...answers, [currentQ]: answer };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => {
        setCurrentQ(currentQ + 1);
        addAiMessage(questions[currentQ + 1].text);
      }, 600);
    } else {
      setTimeout(() => setPhase("building"), 600);
      setTimeout(async () => {
        await saveAllResponses(newAnswers);
        await completeOnboarding();
        navigate("/dashboard");
      }, 3000);
    }
    setInputValue("");
    setSelectedChips([]);
  };

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === "celebration" && (
          <motion.div key="celebration" className="fixed inset-0 flex items-center justify-center gradient-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative">
              {[...Array(20)].map((_, i) => (
                <motion.div key={i} className="absolute w-3 h-3 rounded-full" style={{ background: i % 2 === 0 ? "hsl(252 90% 77%)" : "hsl(122 83% 80%)", left: "50%", top: "50%" }}
                  initial={{ scale: 0, x: 0, y: 0 }} animate={{ scale: [0, 1, 0], x: Math.cos((i * Math.PI * 2) / 20) * 150, y: Math.sin((i * Math.PI * 2) / 20) * 150 }} transition={{ duration: 1.5, delay: i * 0.05 }} />
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
          <motion.div key="chat" className="w-full max-w-2xl mx-auto h-screen flex flex-col p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground">LearnAI Setup</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((msg, i) => (
                <motion.div key={i} className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`max-w-md rounded-2xl px-5 py-3 text-sm ${msg.role === "ai" ? "bg-card border text-foreground" : "bg-primary text-primary-foreground"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {q && !answers[currentQ] && messages.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                  {q.type === "chips" && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => (
                          <button key={opt} onClick={() => setSelectedChips((prev) => prev.includes(opt) ? prev.filter((c) => c !== opt) : [...prev, opt])}
                            className={`px-4 py-2 rounded-xl text-sm border transition-all ${selectedChips.includes(opt) ? "bg-accent text-accent-foreground border-accent" : "bg-card text-foreground hover:bg-secondary"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                      {selectedChips.length > 0 && <Button size="sm" className="rounded-xl" onClick={() => handleAnswer(selectedChips)}>Continue</Button>}
                    </div>
                  )}
                  {q.type === "cards" && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt) => (
                        <button key={opt} onClick={() => handleAnswer(opt)} className="p-4 rounded-xl border bg-card text-foreground text-sm text-left hover:bg-secondary hover:border-accent transition-all">{opt}</button>
                      ))}
                    </div>
                  )}
                  {q.type === "input" && (
                    <div className="flex gap-2">
                      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type your answer..." className="rounded-xl" onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && handleAnswer(inputValue)} />
                      <Button size="icon" className="rounded-xl shrink-0" onClick={() => inputValue.trim() && handleAnswer(inputValue)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "building" && (
          <motion.div key="building" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Building your learning profile...</p>
            <p className="text-sm text-muted-foreground mt-2">This will just take a moment</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
