import React from "react";
import { cn } from "@/lib/utils";

/**
 * MechLib logo — flat SVG style based on light theme request
 *
 * Props:
 *   size     : pixel size of the mark (default 40)
 *   lockup   : also render wordmark next to the symbol
 *   subtitle : optional small text under wordmark
 */
export default function Logo({ size = 40, lockup = false, subtitle, className }) {
  const mark = (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Book pages */}
        <path d="M 32 56 L 32 12 Q 20 8 6 14 L 6 48 Q 20 42 32 56 Z" fill="#FFFFFF" />
        <path d="M 32 56 L 32 12 Q 44 8 58 14 L 58 48 Q 44 42 32 56 Z" fill="#FFFFFF" />
        
        {/* Left page text lines */}
        <line x1="14" y1="24" x2="24" y2="22" />
        <line x1="14" y1="32" x2="25" y2="30" />
        <line x1="14" y1="40" x2="25" y2="38" />
        <line x1="14" y1="48" x2="24" y2="46" />

        {/* Right page text lines */}
        <line x1="40" y1="22" x2="50" y2="24" />
        <line x1="39" y1="30" x2="50" y2="32" />
        <line x1="39" y1="38" x2="50" y2="40" />
        <line x1="40" y1="46" x2="50" y2="48" />

        {/* Central Gear */}
        <g transform="translate(32, 32)" fill="#FBBF24">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect
              key={a}
              x="-2.5"
              y="-13"
              width="5"
              height="26"
              rx="1"
              transform={`rotate(${a})`}
            />
          ))}
          <circle cx="0" cy="0" r="10" />
          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );

  if (!lockup) return mark;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {mark}
      <div className="leading-none">
        <p className="font-heading font-bold text-lg leading-none tracking-tight">
          Mech<span className="text-brand-amber">Lib</span>
        </p>
        {subtitle && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
