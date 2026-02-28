import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Brain, BarChart3, Sparkles, ArrowRight, Zap, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-blur border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LearnAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className="rounded-xl">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold leading-tight text-foreground"
              variants={fadeUp}
              custom={0}
            >
              Learning that adapts to{" "}
              <span className="text-accent">you</span>, not the other way around.
            </motion.h1>
            <motion.p
              className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
              variants={fadeUp}
              custom={1}
            >
              AI agents that understand how you learn, remember what you know, and guide you to mastery — one conversation at a time.
            </motion.p>
            <motion.div className="mt-8 flex gap-4 justify-center" variants={fadeUp} custom={2}>
              <Link to="/auth?tab=signup">
                <Button size="lg" className="rounded-xl gap-2 px-8">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-xl px-8">
                See how it works
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            className="mt-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="bg-card rounded-2xl shadow-elevated p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full card-purple flex items-center justify-center text-lg">📐</div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Mathematics — Linear Equations</p>
                  <p className="text-xs text-muted-foreground">Session in progress</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-foreground">Welcome back! Let's continue with <strong>slope and intercept</strong>. Remember: y = mx + b 📈</p>
                </div>
                <div className="card-green rounded-xl p-4 ml-12">
                  <p className="text-sm">I remember! m is the slope and b is the y-intercept, right?</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-foreground">Exactly! 🌟 You've been nailing the fundamentals. Let's try a real-world example...</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground">Why students love LearnAI</h2>
            <p className="mt-3 text-muted-foreground">Three pillars of truly adaptive learning</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Personalised AI agents", desc: "Every subject has its own AI tutor that knows your strengths, weaknesses, and preferred learning style.", color: "card-purple" },
              { icon: Users, title: "Shared learning memory", desc: "Your AI agents share insights across subjects. Skills learned in Math inform your Physics sessions.", color: "card-green" },
              { icon: Target, title: "Skill graph tracking", desc: "Visual progress maps show exactly where you are and what to learn next, with spaced repetition reminders.", color: "card-purple" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-card rounded-2xl p-8 border shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">How it works</h2>
          <div className="space-y-12">
            {[
              { step: "01", title: "Sign up & tell us about yourself", desc: "A quick guided chat builds your learning profile — study habits, preferences, and goals." },
              { step: "02", title: "Start a subject conversation", desc: "Your AI agent adapts explanations, examples, and quizzes to the way you learn best." },
              { step: "03", title: "Track your progress", desc: "Skill graphs, spaced repetition reminders, and monthly reports keep you on track." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground">LearnAI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 LearnAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
