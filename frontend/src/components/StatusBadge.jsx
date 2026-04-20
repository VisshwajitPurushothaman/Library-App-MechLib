import React from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
  const map = {
    issued: { label: "Not Returned", cls: "chip-issued" },
    returned: { label: "Returned", cls: "chip-returned" },
    overdue: { label: "Overdue", cls: "chip-overdue" },
    pending: { label: "Pending", cls: "chip-pending" },
  };
  const c = map[status] || { label: status, cls: "chip-pending" };
  return (
    <span className={cn("chip", c.cls)} data-testid={`status-badge-${status}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {c.label}
    </span>
  );
}
