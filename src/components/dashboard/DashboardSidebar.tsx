import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, GitBranch, Calendar, MessageCircle, StickyNote, BarChart3,
  Settings, Bell, ChevronLeft, Sparkles, Network,
} from "lucide-react";
import { useNotifications, useStudent } from "@/hooks/useData";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Courses", icon: BookOpen, path: "/dashboard/courses" },
  { label: "Knowledge Graph", icon: Network, path: "/dashboard/knowledge-graph" },
  { label: "Schedule", icon: Calendar, path: "/dashboard/schedule" },
  { label: "Chat", icon: MessageCircle, path: "/dashboard/chat" },
  { label: "Notes", icon: StickyNote, path: "/dashboard/notes" },
  { label: "Reports", icon: BarChart3, path: "/dashboard/reports" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ collapsed, onToggle }: Props) {
  const location = useLocation();
  const { student } = useStudent();
  const { unreadCount } = useNotifications();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      className="h-screen bg-card border-r flex flex-col shrink-0 overflow-hidden"
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-2 border-b shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-accent-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-foreground text-lg">LearnAI</span>}
      </div>

      {/* Student info */}
      {!collapsed && (
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm shrink-0">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-muted-foreground">{student.grade}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.path)
                ? "nav-active"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.label === "Chat" && unreadCount > 0 && (
              <span className="ml-auto badge-purple text-xs px-2 py-0.5 rounded-full font-medium">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-1">
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
        >
          <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
