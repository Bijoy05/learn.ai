import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ChevronRight, GitBranch, Circle, Loader2 } from "lucide-react";
import { useUserSubjects } from "@/hooks/useSubjects";
import { useChatMessages, useSendMessage, type ChatMessage } from "@/hooks/useChatMessages";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "student") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3 max-w-md text-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.message_type === "callout") {
    return (
      <div className="bg-accent/10 border-l-4 border-accent rounded-xl p-4 max-w-lg">
        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
      </div>
    );
  }

  if (msg.message_type === "chart" && msg.metadata?.chartData) {
    return (
      <div className="space-y-2 max-w-lg">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-sm text-foreground mb-3">{msg.content}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={msg.metadata.chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 92%)" />
              <XAxis dataKey="x" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {Object.keys(msg.metadata.chartData.data[0] || {}).filter(k => k !== 'x').map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={["hsl(252 90% 77%)", "hsl(122 83% 80%)", "hsl(0 0% 13.3%)"][idx % 3]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (msg.message_type === "quiz" && msg.metadata?.quizData) {
    return <QuizCard quiz={msg.metadata.quizData} />;
  }

  return (
    <div className="flex gap-3 max-w-lg">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
        <span className="text-xs text-accent-foreground font-bold">AI</span>
      </div>
      <div className="bg-card border rounded-2xl rounded-bl-md px-5 py-3 text-sm text-foreground">
        {msg.content.split("\n").map((line, i) => {
          if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold">{line.replace(/\*\*/g, "")}</p>;
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

function QuizCard({ quiz }: { quiz: { question: string; options: string[]; correct: number; explanation: string } }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-card border rounded-2xl p-5 max-w-lg">
      <p className="text-xs font-semibold text-accent mb-2">📝 Quick Quiz</p>
      <p className="text-sm font-medium text-foreground mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <button key={i} onClick={() => !submitted && setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
              submitted && i === quiz.correct ? "bg-success/20 border-success text-foreground" :
              submitted && i === selected && i !== quiz.correct ? "bg-destructive/10 border-destructive text-foreground" :
              selected === i ? "border-accent bg-accent/10 text-foreground" :
              "bg-background text-foreground hover:bg-secondary"
            }`} disabled={submitted}>{opt}</button>
        ))}
      </div>
      {selected !== null && !submitted && <Button size="sm" className="mt-3 rounded-xl" onClick={() => setSubmitted(true)}>Check answer</Button>}
      {submitted && (
        <motion.p className={`mt-3 text-sm ${selected === quiz.correct ? "text-success-foreground" : "text-destructive"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selected === quiz.correct ? "✅ Correct! " : "❌ Not quite. "}{quiz.explanation}
        </motion.p>
      )}
    </div>
  );
}

export default function CourseLearning() {
  const { id } = useParams<{ id: string }>();
  const { data: courses = [] } = useUserSubjects();
  const course = courses.find((c) => c.id === id);
  const { data: chatMessages = [], isLoading: messagesLoading } = useChatMessages(id || "");
  const sendMessage = useSendMessage();
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Expand first unlocked topic by default
  useEffect(() => {
    if (course && expandedTopics.length === 0) {
      const firstUnlocked = course.topics.find((t) => t.status === "unlocked");
      if (firstUnlocked) setExpandedTopics([firstUnlocked.id]);
    }
  }, [course]);

  if (!course) return <div className="p-6 text-muted-foreground">Course not found. Make sure you've selected this subject.</div>;

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;
    const msg = inputValue.trim();
    setInputValue("");
    await sendMessage.mutateAsync({ subject_id: id, role: "student", content: msg });
  };

  const completed = course.topics.filter((t) => t.status === "completed").length;
  const progress = course.topics.length > 0 ? Math.round((completed / course.topics.length) * 100) : 0;

  return (
    <div className="flex h-full">
      {/* Left pane */}
      <div className="w-72 border-r bg-card flex flex-col shrink-0">
        <div className="p-5 border-b">
          <h2 className="font-bold text-foreground">{course.name}</h2>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{progress}%</span></div>
            <Progress value={progress} className="h-2" />
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
                  topic.status === "unlocked" ? "text-accent fill-accent" : "text-muted"
                }`} />
                <span className="truncate">{topic.name}</span>
              </button>
              {expandedTopics.includes(topic.id) && topic.sessions.length > 0 && (
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
        <div className="px-6 py-3 border-b flex items-center gap-2 text-sm text-muted-foreground">
          <span>{course.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Chat</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messagesLoading && <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          {chatMessages.length === 0 && !messagesLoading && (
            <div className="text-center text-muted-foreground text-sm py-12">
              Start a conversation about {course.name}!
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <MessageBubble msg={msg} />
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-4 border-t bg-card">
          <div className="flex gap-3 items-end">
            <Input
              placeholder="Type your answer or question..."
              className="rounded-xl flex-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" className="rounded-xl shrink-0" onClick={handleSend} disabled={sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">AI may make mistakes — always verify important facts.</p>
        </div>
      </div>
    </div>
  );
}
