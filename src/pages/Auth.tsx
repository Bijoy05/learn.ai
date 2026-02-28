import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup" | "sso">(initialTab as any);
  const [showPassword, setShowPassword] = useState(false);
  const [ssoInstitution, setSsoInstitution] = useState("");
  const [ssoStep, setSsoStep] = useState<"input" | "branded">("input");
  const navigate = useNavigate();
  const { login, signup, isLoading, isAuthenticated, needsOnboarding } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (needsOnboarding) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(form);
      toast({ title: "Check your email", description: "We sent you a confirmation link. Please verify your email to continue." });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSsoContinue = () => {
    if (ssoInstitution.trim()) setSsoStep("branded");
  };

  const tabs = [
    { key: "login" as const, label: "Log in" },
    { key: "signup" as const, label: "Sign up" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">LearnAI</span>
        </div>

        <div className="bg-card rounded-2xl border shadow-card p-8">
          {tab !== "sso" && (
            <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-6">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === "login" && (
              <motion.form key="login" onSubmit={handleLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@school.edu" className="mt-1 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="rounded-xl pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <button type="button" onClick={() => { setTab("sso"); setSsoStep("input"); }} className="text-accent hover:underline">
                    Sign in with SSO
                  </button>
                </p>
              </motion.form>
            )}

            {tab === "signup" && (
              <motion.form key="signup" onSubmit={handleSignup} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First name</Label>
                    <Input className="mt-1 rounded-xl" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input className="mt-1 rounded-xl" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" className="mt-1 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" className="mt-1 rounded-xl" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
                <div>
                  <Label>I am a</Label>
                  <div className="flex gap-2 mt-1">
                    {["student", "teacher", "admin"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={`flex-1 py-2 text-sm rounded-xl border transition-all capitalize ${
                          form.role === role ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                </Button>
              </motion.form>
            )}

            {tab === "sso" && (
              <motion.div key="sso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {ssoStep === "input" ? (
                  <>
                    <h3 className="text-lg font-semibold text-foreground text-center">Sign in with SSO</h3>
                    <div>
                      <Label>Institution name or domain</Label>
                      <Input className="mt-1 rounded-xl" placeholder="e.g. Springfield Academy" value={ssoInstitution} onChange={(e) => setSsoInstitution(e.target.value)} />
                    </div>
                    <Button className="w-full rounded-xl" onClick={handleSsoContinue}>Continue</Button>
                    <button onClick={() => setTab("login")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">← Back to log in</button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-2 flex items-center justify-center text-lg">🏫</div>
                      <p className="text-sm font-medium text-foreground">{ssoInstitution}</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input type="email" className="mt-1 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input type="password" className="mt-1 rounded-xl" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                      </div>
                      <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                      </Button>
                    </form>
                    <button onClick={() => setSsoStep("input")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">← Change institution</button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
