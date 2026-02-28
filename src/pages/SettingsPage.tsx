import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Bell, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllSubjects, useUserSubjects, useSaveUserSubjects } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: allSubjects = [] } = useAllSubjects();
  const { data: userSubjects = [] } = useUserSubjects();
  const saveSubjects = useSaveUserSubjects();
  const [notifications, setNotifications] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);

  // Sync selected subjects once loaded
  useEffect(() => {
    if (userSubjects.length > 0 && !subjectsLoaded) {
      setSelectedIds(userSubjects.map((s) => s.id));
      setSubjectsLoaded(true);
    } else if (userSubjects.length === 0 && allSubjects.length > 0 && !subjectsLoaded) {
      setSubjectsLoaded(true);
    }
  }, [userSubjects, allSubjects, subjectsLoaded]);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleSaveSubjects = async () => {
    await saveSubjects.mutateAsync(selectedIds);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const hasChanges = JSON.stringify(selectedIds.sort()) !== JSON.stringify(userSubjects.map((s) => s.id).sort());

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <motion.div className="bg-card rounded-2xl border shadow-soft p-6 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">First name</Label>
            <Input className="mt-1 rounded-xl" defaultValue={user?.firstName} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last name</Label>
            <Input className="mt-1 rounded-xl" defaultValue={user?.lastName} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input className="mt-1 rounded-xl" defaultValue={user?.email} disabled />
        </div>
        <Button className="rounded-xl">Save changes</Button>
      </motion.div>

      {/* Subjects */}
      <motion.div className="bg-card rounded-2xl border shadow-soft p-6 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">My Subjects</h2>
        </div>
        <p className="text-xs text-muted-foreground">Select the subjects you're studying. These will appear across your dashboard, courses, and knowledge graph.</p>
        <div className="flex flex-wrap gap-2">
          {allSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                selectedIds.includes(subject.id)
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {subject.icon} {subject.name}
            </button>
          ))}
        </div>
        {hasChanges && (
          <Button className="rounded-xl" onClick={handleSaveSubjects} disabled={saveSubjects.isPending}>
            {saveSubjects.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save subjects
          </Button>
        )}
      </motion.div>

      {/* Notifications */}
      <motion.div className="bg-card rounded-2xl border shadow-soft p-6 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Push notifications</p>
            <p className="text-xs text-muted-foreground">Get notified about new content</p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Spaced repetition reminders</p>
            <p className="text-xs text-muted-foreground">Reminders to review past topics</p>
          </div>
          <Switch checked={reviewReminders} onCheckedChange={setReviewReminders} />
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div className="bg-card rounded-2xl border shadow-soft p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button variant="outline" className="rounded-xl gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </motion.div>
    </div>
  );
}
