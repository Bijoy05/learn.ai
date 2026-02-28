import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ChevronRight, GitBranch, Circle, Loader2, CheckCircle2, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useUserSubjects, useUpdateTopicProgress } from "@/hooks/useSubjects";
import type { Subject } from "@/hooks/useSubjects";
import { EXTRACURRICULAR_IDS, getExtracurricularSubjects } from "@/lib/extracurricularCourses";
import { useChatMessages, type ChatMessage } from "@/hooks/useChatMessages";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const CHART_COLORS = [
  "hsl(252, 90%, 67%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)", "hsl(199, 89%, 48%)", "hsl(280, 65%, 60%)",
];

function RenderChart({ chartData }: { chartData: any }) {
  const type = chartData.type || "line";
  const data = chartData.data || [];

  if (type === "pie") {
    return (
      <div className="bg-card border rounded-2xl p-4 max-w-lg">
        <p className="text-sm font-medium text-foreground mb-3">{chartData.title || "Chart"}</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "bar") {
    const keys = Object.keys(data[0] || {}).filter(k => k !== "x" && k !== "name" && k !== "label");
    return (
      <div className="bg-card border rounded-2xl p-4 max-w-lg">
        <p className="text-sm font-medium text-foreground mb-3">{chartData.title || "Chart"}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={data[0]?.name !== undefined ? "name" : "x"} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {keys.map((key, idx) => <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const keys = Object.keys(data[0] || {}).filter(k => k !== "x");
  return (
    <div className="bg-card border rounded-2xl p-4 max-w-lg">
      <p className="text-sm font-medium text-foreground mb-3">{chartData.title || "Chart"}</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {keys.map((key, idx) => <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} dot={false} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
        h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
        p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) return <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
          return <pre className="bg-secondary rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono"><code>{children}</code></pre>;
        },
        blockquote: ({ children }) => <blockquote className="border-l-3 border-accent pl-3 my-2 text-muted-foreground italic">{children}</blockquote>,
        table: ({ children }) => <div className="overflow-x-auto my-2"><table className="w-full text-sm border-collapse">{children}</table></div>,
        thead: ({ children }) => <thead className="bg-secondary">{children}</thead>,
        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border-b border-border">{children}</th>,
        td: ({ children }) => <td className="px-3 py-2 border-b border-border">{children}</td>,
        hr: () => <hr className="my-3 border-border" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function MessageBubble({ msg, onQuizAnswer }: { msg: ChatMessage; onQuizAnswer?: (result: string) => void }) {
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
        <div className="text-sm text-foreground"><MarkdownContent content={msg.content} /></div>
      </div>
    );
  }

  if (msg.message_type === "chart" && msg.metadata?.chartData) {
    return <RenderChart chartData={msg.metadata.chartData} />;
  }

  if (msg.message_type === "quiz" && msg.metadata?.quizData) {
    return <QuizCard quiz={msg.metadata.quizData} onAnswer={onQuizAnswer} />;
  }

  return (
    <div className="flex gap-3 max-w-lg">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
        <span className="text-xs text-accent-foreground font-bold">AI</span>
      </div>
      <div className="bg-card border rounded-2xl rounded-bl-md px-5 py-3 text-sm text-foreground">
        <MarkdownContent content={msg.content} />
      </div>
    </div>
  );
}

function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3 max-w-lg">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1 animate-pulse">
        <span className="text-xs text-accent-foreground font-bold">AI</span>
      </div>
      <div className="bg-card border rounded-2xl rounded-bl-md px-5 py-3 text-sm text-foreground">
        <MarkdownContent content={content} />
        <span className="animate-pulse">▊</span>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onAnswer }: { quiz: { question: string; options: string[]; correct: number; explanation: string }; onAnswer?: (result: string) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (onAnswer && selected !== null) {
      const isCorrect = selected === quiz.correct;
      const result = isCorrect
        ? `I answered the quiz correctly! The answer was "${quiz.options[quiz.correct]}".`
        : `I got the quiz wrong. I chose "${quiz.options[selected]}" but the correct answer was "${quiz.options[quiz.correct]}". ${quiz.explanation}`;
      // Delay slightly so the student sees the result first
      setTimeout(() => onAnswer(result), 1500);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-5 max-w-lg">
      <p className="text-xs font-semibold text-accent mb-2">📝 Quick Quiz</p>
      <p className="text-sm font-medium text-foreground mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <button key={i} onClick={() => !submitted && setSelected(i)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
              submitted && i === quiz.correct ? "bg-green-500/20 border-green-500 text-foreground" :
              submitted && i === selected && i !== quiz.correct ? "bg-destructive/10 border-destructive text-foreground" :
              selected === i ? "border-accent bg-accent/10 text-foreground" :
              "bg-background text-foreground hover:bg-secondary"
            }`} disabled={submitted}>{opt}</button>
        ))}
      </div>
      {selected !== null && !submitted && <Button size="sm" className="mt-3 rounded-xl" onClick={handleSubmit}>Check answer</Button>}
      {submitted && (
        <motion.p className={`mt-3 text-sm ${selected === quiz.correct ? "text-green-600" : "text-destructive"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selected === quiz.correct ? "✅ Correct! " : "❌ Not quite. "}{quiz.explanation}
        </motion.p>
      )}
    </div>
  );
}

export default function CourseLearning() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: courses = [] } = useUserSubjects();
  const ecSubjects = getExtracurricularSubjects();
  const allCourses = [...courses, ...ecSubjects];
  const { supabaseUser } = useAuth();
  const qc = useQueryClient();
  const updateProgress = useUpdateTopicProgress();
  const course = allCourses.find((c) => c.id === id);
  const isEC = EXTRACURRICULAR_IDS.has(id ?? "");
  // Active topic selection
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [hasAutoInitiated, setHasAutoInitiated] = useState<Set<string>>(new Set());

  // Check for review param (from notification center)
  const reviewTopicId = searchParams.get("reviewTopic");

  // Set initial active topic
  useEffect(() => {
    if (course && !activeTopicId) {
      if (reviewTopicId) {
        // Navigate to the review topic directly
        const topic = course.topics.find((t) => t.id === reviewTopicId);
        if (topic) {
          setActiveTopicId(reviewTopicId);
          searchParams.delete("reviewTopic");
          setSearchParams(searchParams, { replace: true });
          return;
        }
      }
      const firstUnlocked = course.topics.find((t) => t.status === "unlocked");
      if (firstUnlocked) setActiveTopicId(firstUnlocked.id);
      else {
        const firstCompleted = course.topics.find((t) => t.status === "completed");
        if (firstCompleted) setActiveTopicId(firstCompleted.id);
      }
    }
  }, [course, reviewTopicId]);

  const activeTopic = course?.topics.find((t) => t.id === activeTopicId);

  const { data: chatMessages = [], isLoading: messagesLoading } = useChatMessages(id || "", activeTopicId || undefined);
  const { sendAndStream, initiateSession, isStreaming, streamingContent } = useAIChat(
    id || "",
    course?.name || "",
    activeTopic?.name,
    activeTopicId || undefined,
  );
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  // Auto-initiate AI session when topic has no messages
  useEffect(() => {
    if (
      activeTopicId &&
      !messagesLoading &&
      chatMessages.length === 0 &&
      !isStreaming &&
      !hasAutoInitiated.has(activeTopicId) &&
      activeTopic &&
      (activeTopic.status === "unlocked" || activeTopic.status === "completed")
    ) {
      setHasAutoInitiated((prev) => new Set(prev).add(activeTopicId));
      
      // Check if this is a review navigation
      const isReview = reviewTopicId === activeTopicId;
      if (isReview) {
        // For reviews, send a review prompt instead
        sendAndStream(`I'd like to review ${activeTopic.name}. Can you give me a quick recap of the key concepts and then quiz me to see what I remember?`);
      } else {
        initiateSession();
      }
    }
  }, [activeTopicId, messagesLoading, chatMessages.length, isStreaming, hasAutoInitiated, activeTopic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingContent]);

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

  const selectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    if (!expandedTopics.includes(topicId)) {
      setExpandedTopics((prev) => [...prev, topicId]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !id || isStreaming) return;
    const msg = inputValue.trim();
    setInputValue("");
    await sendAndStream(msg);
  };

  const handleQuizAnswer = async (result: string) => {
    if (!id || isStreaming) return;
    await sendAndStream(result);
  };

  const handleMarkComplete = async (topicId: string) => {
    if (!course || !supabaseUser || !id) return;
    
    // Build the new topic_progress object
    // First, get current user_subjects row to get existing progress
    const { data: userSubRow } = await supabase
      .from("user_subjects")
      .select("topic_progress")
      .eq("user_id", supabaseUser.id)
      .eq("subject_id", id)
      .single();

    const currentProgress: Record<string, string> = (userSubRow?.topic_progress as any) || {};
    const updatedProgress = { ...currentProgress, [topicId]: "completed" };
    
    // Find the next locked topic and unlock it
    const topicIndex = course.topics.findIndex((t) => t.id === topicId);
    if (topicIndex >= 0 && topicIndex < course.topics.length - 1) {
      const nextTopic = course.topics[topicIndex + 1];
      if (nextTopic.status === "locked" && !updatedProgress[nextTopic.id]) {
        updatedProgress[nextTopic.id] = "unlocked";
      }
    }

    updateProgress.mutate(
      { subjectId: id, topicProgress: updatedProgress },
      {
        onSuccess: () => {
          toast.success(`"${course.topics.find(t => t.id === topicId)?.name}" marked as complete!`);
          qc.invalidateQueries({ queryKey: ["user_subjects"] });
          
          // Move to next available topic
          const nextUnlocked = course.topics.find((t, idx) => idx > topicIndex && (t.status === "unlocked" || updatedProgress[t.id] === "unlocked"));
          if (nextUnlocked) {
            setActiveTopicId(nextUnlocked.id);
          }
        },
        onError: () => {
          toast.error("Failed to update topic status");
        },
      }
    );
  };

  const handleNewChat = async () => {
    if (!activeTopicId || !supabaseUser || !id) return;
    await supabase.from("chat_messages").insert({
      user_id: supabaseUser.id,
      subject_id: id,
      topic_id: activeTopicId,
      role: "ai",
      content: "---\n\n**New session started.** Let's pick up where we left off or tackle something new! 🚀",
      message_type: "text",
    });
    qc.invalidateQueries({ queryKey: ["chat_messages", supabaseUser.id, id, activeTopicId] });
    toast.success("New chat session started");
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
          {course.topics.map((topic) => {
            const isActive = activeTopicId === topic.id;
            return (
              <div key={topic.id}>
                <button
                  onClick={() => {
                    if (topic.status !== "locked") {
                      selectTopic(topic.id);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-5 py-2.5 text-sm text-left transition-colors ${
                    topic.status === "locked" ? "text-muted-foreground/50 cursor-not-allowed" :
                    isActive ? "bg-accent/10 text-accent font-medium" :
                    "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Circle className={`w-3 h-3 shrink-0 ${
                    topic.status === "completed" ? "text-green-500 fill-green-500" :
                    topic.status === "unlocked" ? (isActive ? "text-accent fill-accent" : "text-accent") : "text-muted"
                  }`} />
                  <span className="truncate flex-1">{topic.name}</span>
                  {isActive && topic.status === "unlocked" && (
                    <MessageSquare className="w-3 h-3 text-accent shrink-0" />
                  )}
                </button>
                {expandedTopics.includes(topic.id) && topic.sessions.length > 0 && (
                  <div className="ml-10 border-l pl-3 py-1 space-y-1">
                    {topic.sessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          session.status === "complete" ? "bg-green-500" : session.status === "review" ? "bg-accent" : "bg-muted"
                        }`} />
                        <span className="truncate">{session.topicName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
        {/* Header with topic name and actions */}
        <div className="px-6 py-3 border-b flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{course.name}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-foreground font-medium flex-1">
            {activeTopic?.name || "Select a topic"}
          </span>
          <div className="flex items-center gap-2">
            {activeTopicId && activeTopic && (activeTopic.status === "unlocked" || activeTopic.status === "completed") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 text-xs"
                  onClick={handleNewChat}
                  disabled={isStreaming}
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chat
                </Button>
                {activeTopic.status === "unlocked" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-xl gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleMarkComplete(activeTopicId)}
                    disabled={isStreaming}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Complete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messagesLoading && <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          {chatMessages.length === 0 && !messagesLoading && !isStreaming && (
            <div className="text-center text-muted-foreground text-sm py-12">
              {activeTopic
                ? `Starting your session on "${activeTopic.name}"...`
                : `Select a topic from the sidebar to start learning.`}
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <MessageBubble msg={msg} onQuizAnswer={handleQuizAnswer} />
            </motion.div>
          ))}
          {isStreaming && streamingContent && <StreamingBubble content={streamingContent} />}
          {isStreaming && !streamingContent && (
            <div className="flex gap-3 max-w-lg">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 animate-pulse">
                <span className="text-xs text-accent-foreground font-bold">AI</span>
              </div>
              <div className="bg-card border rounded-2xl px-5 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-4 border-t bg-card">
          <div className="flex gap-3 items-end">
            <Input
              placeholder={activeTopic ? `Ask about ${activeTopic.name}...` : "Select a topic to start chatting..."}
              className="rounded-xl flex-1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isStreaming || !activeTopicId}
            />
            <Button size="icon" className="rounded-xl shrink-0" onClick={handleSend} disabled={isStreaming || !activeTopicId}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">AI may make mistakes — always verify important facts.</p>
        </div>
      </div>
    </div>
  );
}
