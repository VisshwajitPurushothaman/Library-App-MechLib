import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Lock, User as UserIcon, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [role, setRole] = useState("user");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!identifier.trim()) e.identifier = role === "admin" ? "Enter email or admin ID" : "Roll number is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password, role);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      const target = user.role === "admin" ? "/admin" : "/app";
      nav(loc.state?.from?.pathname || target, { replace: true });
    } catch (err) {
      const msg = formatApiError(err, "Unable to sign in");
      toast.error(msg);
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    if (role === "admin") {
      setIdentifier("admin@mechlib.edu");
      setPassword("Admin@123");
    } else {
      setIdentifier("ME2023001");
      setPassword("Student@123");
    }
    setErrors({});
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        {/* top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Logo size={44} />
            <div>
              <p className="font-heading font-bold leading-none">
                Mech<span className="text-brand-amber">Lib</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                Mechanical Engineering · Department Library
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-brand-amber" />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Sign in to continue
              </p>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome to <span className="text-brand-amber">MechLib</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              The academic library portal for the Mechanical Engineering department.
              Borrow, return, and discover books effortlessly.
            </p>

            {/* Role Selector */}
            <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/60 p-1.5">
              {[
                { key: "user", label: "Student", icon: UserIcon },
                { key: "admin", label: "Admin", icon: ShieldCheck },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  data-testid={`role-selector-${key}`}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                    role === key
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {role === "admin" ? "Admin Email / ID" : "Roll Number / Email"}
                </label>
                <div className={cn(
                  "mt-1.5 relative flex items-center rounded-xl border bg-background/80 transition-all",
                  errors.identifier ? "border-destructive ring-1 ring-destructive/20" : "border-border focus-within:border-brand-amber focus-within:ring-2 focus-within:ring-brand-amber/20"
                )}>
                  <UserIcon className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setErrors(x => ({ ...x, identifier: null })); }}
                    placeholder={role === "admin" ? "admin@mechlib.edu" : "ME2023001"}
                    autoComplete="username"
                    data-testid="login-identifier-input"
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm outline-none rounded-xl"
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1.5 text-xs text-destructive" data-testid="login-identifier-error">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className={cn(
                  "mt-1.5 relative flex items-center rounded-xl border bg-background/80 transition-all",
                  errors.password ? "border-destructive ring-1 ring-destructive/20" : "border-border focus-within:border-brand-amber focus-within:ring-2 focus-within:ring-brand-amber/20"
                )}>
                  <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(x => ({ ...x, password: null })); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    data-testid="login-password-input"
                    className="w-full bg-transparent pl-11 pr-11 py-3 text-sm outline-none rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password"
                    data-testid="login-password-toggle"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive" data-testid="login-password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              {errors.form && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive" data-testid="login-form-error">
                  {errors.form}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                data-testid="login-submit-btn"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy dark:bg-brand-amber text-white py-3 text-sm font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-brand-navy/20 dark:shadow-brand-amber/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {submitting ? "Signing in..." : `Sign in as ${role === "admin" ? "Admin" : "Student"}`}
              </button>

              <button
                type="button"
                onClick={fillDemo}
                data-testid="login-demo-btn"
                className="w-full text-xs text-muted-foreground hover:text-brand-amber underline-offset-4 hover:underline"
              >
                Fill demo {role} credentials
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-xs text-muted-foreground text-center">
              Protected by department-grade access controls.
              <br />
              Contact the library administrator for access issues.
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MechLib · Mechanical Engineering Department
          </p>
        </motion.div>
      </div>
    </div>
  );
}
