import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { student } = useStudent();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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
            <Input className="mt-1 rounded-xl" defaultValue={user?.firstName || student.firstName} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Last name</Label>
            <Input className="mt-1 rounded-xl" defaultValue={user?.lastName || student.lastName} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input className="mt-1 rounded-xl" defaultValue={user?.email || student.email} disabled />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Grade / Class</Label>
          <Input className="mt-1 rounded-xl" defaultValue={student.grade} />
        </div>
        <Button className="rounded-xl">Save changes</Button>
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
