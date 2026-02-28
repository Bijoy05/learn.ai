import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search, X, BookOpen, Award, RotateCcw } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useReviewNotifications } from "@/hooks/useReviewNotifications";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const { reviews } = useReviewNotifications();
  const navigate = useNavigate();

  const handleReviewClick = (subjectId: string, topicId: string) => {
    setShowNotifications(false);
    navigate(`/dashboard/courses/${subjectId}?reviewTopic=${topicId}`);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground font-medium">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            <button onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              {reviews.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 badge-purple rounded-full text-[10px] font-bold flex items-center justify-center">{reviews.length}</span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div className="fixed inset-0 bg-foreground/10 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} />
            <motion.div className="fixed right-0 top-0 h-full w-96 bg-card border-l z-50 p-6 shadow-elevated overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              {/* Review Section */}
              {reviews.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCcw className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Topics to Review</h3>
                  </div>
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl border bg-accent/5">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{r.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 rounded-lg text-xs gap-1.5"
                              onClick={() => handleReviewClick(r.subjectId, r.topicId)}
                            >
                              <RotateCcw className="w-3 h-3" />
                              Start Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up! No reviews needed right now.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
