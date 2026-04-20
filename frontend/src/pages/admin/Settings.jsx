import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import ChangePasswordSection from "@/components/ChangePasswordSection";
import { Shield, User, Mail, BookOpen, LogOut } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Appearance, profile and account actions.</p>
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

      <div className="panel rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-semibold">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{user?.name}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Role</p><p className="font-medium uppercase">{user?.role}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium">{user?.department}</p></div>
          </div>
        </div>
      </div>

      <div className="panel rounded-2xl p-6">
        <h3 className="font-heading font-semibold">Library Policy</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Default loan period is 14 days. Overdue books incur a nominal fine per the department's circulation policy.
        </p>
      </div>

      <ChangePasswordSection />

      {/* Account actions */}
      <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5 p-6">
        <h3 className="font-heading font-semibold text-red-700 dark:text-red-300">Account</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sign out of this device. You'll need your credentials to log back in.
        </p>
        <button
          onClick={handleLogout}
          data-testid="settings-logout-btn"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium
                     bg-red-600 text-white hover:bg-red-700 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
