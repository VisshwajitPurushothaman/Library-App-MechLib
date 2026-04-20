import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Shield, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import ChangePasswordSection from "@/components/ChangePasswordSection";

export default function UserSettings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="ambient-bg space-y-6 max-w-3xl">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">Account</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Profile, appearance and security.</p>
      </div>

      <div className="panel rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-semibold">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Info icon={User} label="Name" value={user?.name} />
          <Info icon={Shield} label="Role" value={(user?.role || "").toUpperCase()} />
          <Info icon={Mail} label="Email" value={user?.email} />
          <Info icon={BookOpen} label="Roll Number" value={user?.roll_number} mono />
        </div>
      </div>

      <div className="panel rounded-2xl p-6 space-y-5">
        <h3 className="font-heading font-semibold">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">Light, dark, or follow system preference</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <ChangePasswordSection />

      <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5 p-6">
        <h3 className="font-heading font-semibold text-red-700 dark:text-red-300">Sign out</h3>
        <p className="text-sm text-muted-foreground mt-1">
          End this session. You'll need your credentials to log back in.
        </p>
        <button
          onClick={handleLogout}
          data-testid="user-settings-logout"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium
                     bg-red-600 text-white hover:bg-red-700 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium truncate ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
      </div>
    </div>
  );
}
