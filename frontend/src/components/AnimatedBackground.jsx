import React from "react";
import { motion } from "framer-motion";

/* Subtle animated abstract library background: floating gears, book shapes & blurred gradient orbs */
export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle at center, rgba(217,119,6,0.25), transparent 60%)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle at center, rgba(15,23,42,0.35), transparent 60%)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating gear */}
      <motion.svg
        className="absolute top-12 right-16 text-brand-navy/10 dark:text-white/5"
        width="240" height="240" viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M50 14l4 8 9-2 2 9 8 4-4 8 5 8-8 4-2 9-9-2-4 8-4-8-9 2-2-9-8-4 4-8-5-8 8-4 2-9 9 2z"
        />
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
      </motion.svg>

      {/* small gear */}
      <motion.svg
        className="absolute bottom-24 left-24 text-brand-amber/15"
        width="140" height="140" viewBox="0 0 100 100"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M50 18l3 7 8-1 1 8 7 3-3 7 3 7-7 3-1 8-8-1-3 7-3-7-8 1-1-8-7-3 3-7-3-7 7-3 1-8 8 1z"
        />
      </motion.svg>

      {/* book shape */}
      <motion.div
        className="absolute top-1/3 left-10 w-24 h-32 rounded-sm opacity-20"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
          boxShadow: "inset -6px 0 0 rgba(255,255,255,0.08)",
        }}
        animate={{ y: [0, -18, 0], rotate: [-6, -4, -6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 right-20 w-20 h-28 rounded-sm opacity-20"
        style={{
          background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
        }}
        animate={{ y: [0, 16, 0], rotate: [4, 7, 4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />

      {/* Dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.2) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 45%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 45%, transparent 75%)",
        }}
      />
    </div>
  );
}
