import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  ONBOARDING_QUESTIONS,
  OPENING_MESSAGE,
  CLOSING_MESSAGE,
  getRandomAck,
} from "./questions";
import type { OnboardingQuestion } from "./questions";

interface Message {
  role: "ai" | "student";
  text: string;
}

interface OnboardingChatProps {
  subjectNames: string[];
  onComplete: (answers: Record<number, string | string[]>) => void;
}

export default function OnboardingChat({ subjectNames, onComplete }: OnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQ, setCurrentQ] = useState(-1); // -1 = opening message
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [waiting, setWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = ONBOARDING_QUESTIONS;
  const totalQ = questions.length;
  const progress = currentQ < 0 ? 0 : Math.round(((currentQ + (answers[currentQ] !== undefined ? 1 : 0)) / totalQ) * 100);

  const addMsg = (role: "ai" | "student", text: string) =>
    setMessages((prev) => [...prev, { role, text }]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, waiting]);

  // Opening message
  useEffect(() => {
    if (messages.length === 0) {
      addMsg("ai", OPENING_MESSAGE);
      setTimeout(() => {
        setCurrentQ(0);
        addMsg("ai", questions[0].text);
      }, 1500);
    }
  }, []);

  const getOptionsForQuestion = (q: OnboardingQuestion): string[] => {
    if (q.dynamicSubjects) {
      return subjectNames.length > 0 ? subjectNames : [];
    }
    return q.options ?? [];
  };

  const handleAnswer = (answer: string | string[]) => {
    const displayText = Array.isArray(answer) ? answer.join(", ") : answer;
    addMsg("student", displayText);
    const newAnswers = { ...answers, [currentQ]: answer };
    setAnswers(newAnswers);
    setInputValue("");
    setSelectedChips([]);
    setWaiting(true);

    if (currentQ < totalQ - 1) {
      // Show acknowledgement then next question
      setTimeout(() => {
        addMsg("ai", getRandomAck());
        setTimeout(() => {
          const nextQ = currentQ + 1;
          setCurrentQ(nextQ);
          addMsg("ai", questions[nextQ].text);
          setWaiting(false);
        }, 800);
      }, 600);
    } else {
      // Final question answered
      setTimeout(() => {
        addMsg("ai", CLOSING_MESSAGE);
        setTimeout(() => onComplete(newAnswers), 2000);
      }, 800);
    }
  };

  const q = currentQ >= 0 && currentQ < totalQ ? questions[currentQ] : null;
  const showInput = q && answers[currentQ] === undefined && !waiting;
  const options = q ? getOptionsForQuestion(q) : [];

  // For dynamic subjects with no data, fall back to input
  const effectiveType =
    q?.dynamicSubjects && subjectNames.length === 0 ? "input" : q?.type;

  return (
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-foreground text-sm">LearnAI Setup</span>
          <p className="text-xs text-muted-foreground">This takes about 2 minutes</p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.min(currentQ + 1, totalQ)}/{totalQ}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5 mb-4" />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-card border text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {waiting && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-card border rounded-2xl px-4 py-2.5 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {/* Answer input area */}
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 space-y-3"
          >
            {effectiveType === "single-cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="p-3 rounded-xl border bg-card text-foreground text-sm text-left hover:bg-secondary hover:border-accent transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {effectiveType === "multi-chips" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setSelectedChips((prev) =>
                          prev.includes(opt)
                            ? prev.filter((c) => c !== opt)
                            : [...prev, opt]
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        selectedChips.includes(opt)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {selectedChips.length > 0 && (
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleAnswer(selectedChips)}
                  >
                    Continue
                  </Button>
                )}
              </div>
            )}

            {effectiveType === "input" && (
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  className="rounded-xl"
                  onKeyDown={(e) =>
                    e.key === "Enter" && inputValue.trim() && handleAnswer(inputValue)
                  }
                />
                <Button
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={() => inputValue.trim() && handleAnswer(inputValue)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
