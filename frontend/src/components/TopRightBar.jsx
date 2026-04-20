import React from "react";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Floating utility bar in the top-right corner of the viewport.
 * Theme toggle on the left, app wordmark on the right.
 * Desktop only (mobile layouts have their own topbars).
 */
export default function TopRightBar() {
  return (
    <div
      data-testid="top-right-bar"
      className="hidden lg:flex fixed top-4 right-4 z-30 items-center gap-2"
    >
      <ThemeToggle compact />
      <div className="h-11 px-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-sm flex items-center">
        <span className="font-heading font-bold text-base tracking-tight leading-none">
          Mech<span className="text-brand-amber">Lib</span>
        </span>
      </div>
    </div>
  );
}
