import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search, X } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useStudent, useNotifications } from "@/hooks/useData";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { student } = useStudent();
  const { notifications, unreadCount } = useNotifications();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground font-medium">{student.firstName} {student.lastName}</span>
            <span className="text-xs text-muted-foreground">{student.grade}</span>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 badge-purple rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notification Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              className="fixed inset-0 bg-foreground/10 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-96 bg-card border-l z-50 p-6 shadow-elevated overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-4 rounded-xl border ${n.read ? "bg-background" : "bg-card"}`}>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
                    {n.type === "review" && (
                      <Button size="sm" className="mt-3 rounded-lg text-xs" variant="outline">Go to session</Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
