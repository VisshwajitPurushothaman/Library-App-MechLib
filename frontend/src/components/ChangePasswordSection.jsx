import React, { useState } from "react";
import { Lock, Eye, EyeOff, KeyRound, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ChangePasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ c: false, n: false, r: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!current) e.current = "Current password is required";
    if (!next) e.next = "Enter a new password";
    else if (next.length < 6) e.next = "Must be at least 6 characters";
    else if (next === current) e.next = "New password must be different";
    if (next !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.patch("/auth/change-password", { current_password: current, new_password: next });
      toast.success("Password updated successfully");
      setCurrent(""); setNext(""); setConfirm(""); setErrors({});
    } catch (err) {
      const msg = formatApiError(err);
      toast.error(msg);
      setErrors({ form: msg });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="panel rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-brand-amber/15 text-brand-amber grid place-items-center">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading font-semibold">Change Password</h3>
          <p className="text-xs text-muted-foreground">Use a strong, unique password (≥ 6 characters).</p>
        </div>
      </div>

      {[
        { key: "c", label: "Current password", value: current, set: setCurrent, err: errors.current, testid: "pw-current" },
        { key: "n", label: "New password", value: next, set: setNext, err: errors.next, testid: "pw-new" },
        { key: "r", label: "Confirm new password", value: confirm, set: setConfirm, err: errors.confirm, testid: "pw-confirm" },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
          <div className={cn(
            "mt-1.5 relative flex items-center rounded-xl border bg-background/80 transition",
            f.err ? "border-destructive" : "border-border focus-within:border-brand-amber focus-within:ring-2 focus-within:ring-brand-amber/20"
          )}>
            <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type={show[f.key] ? "text" : "password"}
              value={f.value}
              onChange={(e) => { f.set(e.target.value); setErrors((x) => ({ ...x, [f.testid === "pw-confirm" ? "confirm" : f.testid === "pw-new" ? "next" : "current"]: null })); }}
              data-testid={f.testid}
              autoComplete="new-password"
              className="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm outline-none rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, [f.key]: !s[f.key] }))}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
              aria-label="Toggle visibility"
            >
              {show[f.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {f.err && <p className="mt-1 text-xs text-destructive">{f.err}</p>}
        </div>
      ))}

      {errors.form && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        data-testid="pw-submit"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-navy dark:bg-brand-amber dark:text-brand-navy text-white px-5 py-2.5 text-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
