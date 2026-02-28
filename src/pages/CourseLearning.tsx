import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ChevronRight, GitBranch, Circle } from "lucide-react";
import { useCourses, useMessages } from "@/hooks/useData";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Message } from "@/lib/mockData";

function ChatMessage({ msg }: { msg: Message }) {
  if (msg.role === "student") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3 max-w-md text-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === "callout") {
    return (
      <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-4 max-w-lg">
        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
      </div>
    );
  }

  if (msg.type === "chart" && msg.chartData) {
    return (
      <div className="space-y-2 max-w-lg">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-sm text-foreground mb-3">{msg.content}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={msg.chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 92%)" />
              <XAxis dataKey="x" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="slope=1" stroke="hsl(252 90% 77%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="slope=2" stroke="hsl(122 83% 80%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="slope=0.5" stroke="hsl(0 0% 13.3%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (msg.type === "quiz" && msg.quizData) {
    return <QuizCard quiz={msg.quizData} />;
  }

  // Regular AI message
  return (
    <div className="flex gap-3 max-w-lg">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
        <span className="text-xs text-accent-foreground font-bold">AI</span>
      </div>
      <div className="bg-card border rounded-2xl rounded-bl-md px-5 py-3 text-sm text-foreground">
        {msg.content.split("\n").map((line, i) => {
          if (line.startsWith("**") && line.endsWith("**")) {
            return <p key={i} className="font-semibold">{line.replace(/\*\*/g, "")}</p>;
          }
          if (line.startsWith("- **")) {
            const parts = line.replace("- **", "").split("**");
            return <p key={i} className="ml-2">• <strong>{parts[0]}</strong>{parts.slice(1).join("")}</p>;
          }
          return <p key={i} className={line === "" ? "h-2" : ""}>{line}</p>;
        })}
      </div>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Message["quizData"] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) return null;

  return (
    <div className="bg-card border rounded-2xl p-5 max-w-lg">
      <p className="text-xs font-semibold text-accent mb-2">📝 Quick Quiz</p>
      <p className="text-sm font-medium text-foreground mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !submitted && setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
              submitted && i === quiz.correct ? "bg-success/20 border-success text-foreground" :
              submitted && i === selected && i !== quiz.correct ? "bg-destructive/10 border-destructive text-foreground" :
              selected === i ? "border-accent bg-accent/10 text-foreground" :
              "bg-background text-foreground hover:bg-secondary"
            }`}
            disabled={submitted}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && !submitted && (
        <Button size="sm" className="mt-3 rounded-xl" onClick={() => setSubmitted(true)}>Check answer</Button>
      )}
      {submitted && (
        <motion.p
          className={`mt-3 text-sm ${selected === quiz.correct ? "text-success-foreground" : "text-destructive"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selected === quiz.correct ? "✅ Correct! " : "❌ Not quite. "}
          {quiz.explanation}
        </motion.p>
      )}
    </div>
  );
}

export default function CourseLearning() {
  const { id } = useParams<{ id: string }>();
  const { getCourse } = useCourses();
  const course = getCourse(id || "");
  const { messages } = useMessages("s5");
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>(["t3"]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!course) return <div className="p-6 text-muted-foreground">Course not found</div>;

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  return (
    <div className="flex h-full">
      {/* Left pane */}
      <div className="w-72 border-r bg-card flex flex-col shrink-0">
        <div className="p-5 border-b">
          <h2 className="font-bold text-foreground">{course.name}</h2>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span><span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {course.topics.map((topic) => (
            <div key={topic.id}>
              <button
                onClick={() => topic.status !== "locked" && toggleTopic(topic.id)}
                className={`w-full flex items-center gap-2 px-5 py-2.5 text-sm text-left transition-colors ${
                  topic.status === "locked" ? "text-muted-foreground/50 cursor-not-allowed" : "text-foreground hover:bg-secondary"
                }`}
              >
                <Circle className={`w-3 h-3 shrink-0 ${
                  topic.status === "completed" ? "text-success fill-success" :
                  topic.status === "unlocked" ? "text-accent fill-accent" :
                  "text-muted"
                }`} />
                <span className="truncate">{topic.name}</span>
              </button>
              {expandedTopics.includes(topic.id) && (
                <div className="ml-10 border-l pl-3 py-1 space-y-1">
                  {topic.sessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        session.status === "complete" ? "bg-success" : session.status === "review" ? "bg-accent" : "bg-muted"
                      }`} />
                      <span className="truncate">{session.topicName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t">
          <Link
            to={`/dashboard/courses/${id}/skillgraph`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <GitBranch className="w-4 h-4" />
            Skill Graph
          </Link>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className="px-6 py-3 border-b flex items-center gap-2 text-sm text-muted-foreground">
          <span>{course.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span>Linear Equations</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Slope & Intercept</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ChatMessage msg={msg} />
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t bg-card">
          <div className="flex gap-3 items-end">
            <Input
              placeholder="Type your answer or question..."
              className="rounded-xl flex-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button size="icon" className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">AI may make mistakes — always verify important facts.</p>
        </div>
      </div>
    </div>
  );
}
