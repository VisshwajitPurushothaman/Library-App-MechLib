import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TONES = {
  default: {
    dot: "bg-slate-900 dark:bg-white",
    icon: "text-slate-900 dark:text-white",
    iconBg: "bg-slate-900/10 dark:bg-white/10 border-slate-900/10 dark:border-white/15",
    tint: "bg-slate-200/40 dark:bg-white/[0.04]",
    glow: "bg-slate-500/25 dark:bg-slate-300/15",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-500/25 dark:bg-amber-500/30 border-amber-500/40",
    tint: "bg-amber-100/70 dark:bg-amber-500/[0.18]",
    glow: "bg-amber-400/50 dark:bg-amber-500/40",
  },
  emerald: {
    dot: "bg-emerald-500",
    icon: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-500/25 dark:bg-emerald-500/30 border-emerald-500/40",
    tint: "bg-emerald-100/70 dark:bg-emerald-500/[0.18]",
    glow: "bg-emerald-400/50 dark:bg-emerald-500/40",
  },
  red: {
    dot: "bg-red-500",
    icon: "text-red-700 dark:text-red-300",
    iconBg: "bg-red-500/25 dark:bg-red-500/30 border-red-500/40",
    tint: "bg-red-100/70 dark:bg-red-500/[0.18]",
    glow: "bg-red-400/50 dark:bg-red-500/40",
  },
  blue: {
    dot: "bg-blue-600",
    icon: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-500/25 dark:bg-blue-500/30 border-blue-500/40",
    tint: "bg-blue-100/70 dark:bg-blue-500/[0.18]",
    glow: "bg-blue-400/50 dark:bg-blue-500/40",
  },
};

export default function StatCard({ icon: Icon, label, value, hint, tone = "default", delay = 0, testid }) {
  const t = TONES[tone] || TONES.default;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      data-testid={testid}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 sm:p-6",
        "backdrop-blur-xl border border-white/60 dark:border-white/10",
        "shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_8px_24px_-12px_rgba(15,23,42,0.18)]",
        "dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_8px_24px_-12px_rgba(0,0,0,0.6)]",
        "hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_14px_32px_-12px_rgba(15,23,42,0.25)] transition-all duration-300",
        t.tint
      )}
    >
      {/* brighter ambient glow */}
      <div className={cn("pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl", t.glow)} />
      <div className={cn("pointer-events-none absolute -bottom-20 -left-10 h-32 w-32 rounded-full blur-3xl opacity-60", t.glow)} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </p>
          </div>
          <p className="mt-4 font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("shrink-0 h-10 w-10 rounded-xl grid place-items-center border", t.iconBg)}>
            <Icon className={cn("h-4 w-4", t.icon)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
