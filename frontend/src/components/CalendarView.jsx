import React, { useMemo, useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isValid,
} from "date-fns";
import { ChevronLeft, ChevronRight, BookOpen, BookCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Google Calendar–style month view for library circulation.
 * Plots issue (orange) + return (emerald) events per day.
 * issues: array of { id, book_title, book_code, user_name, roll_number,
 *                    issue_date (YYYY-MM-DD or ISO), return_date (ISO|null) }
 * showStudent: whether to show student name on chip (admin=true)
 */
export default function CalendarView({ issues = [], showStudent = false }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const events = useMemo(() => {
    const list = [];
    for (const i of issues) {
      const issueD = safeDate(i.issue_date);
      if (issueD) list.push({
        date: issueD, type: "issued",
        title: i.book_title, code: i.book_code,
        user: i.user_name, roll: i.roll_number, id: i.id,
      });
      const returnD = safeDate(i.return_date);
      if (returnD) list.push({
        date: returnD, type: "returned",
        title: i.book_title, code: i.book_code,
        user: i.user_name, roll: i.roll_number, id: i.id + "-r",
      });
    }
    return list;
  }, [issues]);

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  const eventsForDay = (day) => events.filter((e) => isSameDay(e.date, day));

  const selectedEvents = selected ? eventsForDay(selected) : [];

  const totals = useMemo(() => {
    const monthEvents = events.filter((e) => isSameMonth(e.date, monthStart));
    return {
      issued: monthEvents.filter((e) => e.type === "issued").length,
      returned: monthEvents.filter((e) => e.type === "returned").length,
    };
  }, [events, monthStart]);

  return (
    <div className="panel rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight">
            {format(cursor, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => setCursor(new Date())}
            className="text-xs font-medium px-2.5 py-1 rounded-md border border-border hover:bg-muted transition"
            data-testid="cal-today"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Issued <b className="tabular-nums">{totals.issued}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Returned <b className="tabular-nums">{totals.returned}</b>
            </span>
          </div>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setCursor(subMonths(cursor, 1))}
              className="p-2 hover:bg-muted"
              data-testid="cal-prev"
              aria-label="Previous month"
            ><ChevronLeft className="h-4 w-4" /></button>
            <button
              onClick={() => setCursor(addMonths(cursor, 1))}
              className="p-2 hover:bg-muted"
              data-testid="cal-next"
              aria-label="Next month"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-border bg-border/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-muted/40 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium text-center py-2">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const inMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = selected && isSameDay(day, selected);
          const dayEvents = eventsForDay(day);
          return (
            <button
              key={idx}
              onClick={() => setSelected(day)}
              data-testid={`cal-day-${format(day, "yyyy-MM-dd")}`}
              className={cn(
                "relative text-left min-h-[92px] sm:min-h-[110px] bg-card p-2 hover:bg-muted/40 transition",
                !inMonth && "bg-muted/20 text-muted-foreground/60",
                isSelected && "ring-2 ring-brand-amber ring-inset"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium tabular-nums",
                  isToday && "h-6 w-6 rounded-full bg-brand-amber text-white grid place-items-center"
                )}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="mt-1.5 space-y-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "flex items-center gap-1 text-[10px] leading-tight font-medium rounded px-1.5 py-0.5 truncate",
                      e.type === "issued"
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                    )}
                  >
                    {e.type === "issued" ? <BookOpen className="h-2.5 w-2.5 shrink-0" /> : <BookCheck className="h-2.5 w-2.5 shrink-0" />}
                    <span className="truncate">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-muted-foreground font-medium pl-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5"
          >
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Events on</p>
                  <p className="font-heading text-lg font-semibold">{format(selected, "EEEE, d MMM yyyy")}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  data-testid="cal-close-detail"
                ><X className="h-4 w-4" /></button>
              </div>

              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No circulation activity on this day.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg grid place-items-center shrink-0",
                        e.type === "issued" ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"
                      )}>
                        {e.type === "issued" ? <BookOpen className="h-4 w-4" /> : <BookCheck className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {e.code}{showStudent ? ` · ${e.user} (${e.roll})` : ""}
                        </p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
                        e.type === "issued"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      )}>
                        {e.type}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function safeDate(s) {
  if (!s) return null;
  try {
    const d = s.length === 10 ? parseISO(s + "T00:00:00") : parseISO(s);
    return isValid(d) ? d : null;
  } catch { return null; }
}
