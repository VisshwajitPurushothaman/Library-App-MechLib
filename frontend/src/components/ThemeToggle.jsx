import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "auto", icon: Monitor, label: "Auto" },
  { key: "dark", icon: Moon, label: "Dark" },
];

export default function ThemeToggle({ compact = false }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      data-testid="theme-toggle"
      className={cn(
        "inline-flex items-center gap-1 rounded-full p-1 border border-border bg-card/60 backdrop-blur",
        compact && "scale-90"
      )}
    >
      {OPTIONS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setMode(key)}
          data-testid={`theme-toggle-${key}`}
          aria-label={label}
          title={label}
          className={cn(
            "h-8 w-8 inline-flex items-center justify-center rounded-full transition-all",
            mode === key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
