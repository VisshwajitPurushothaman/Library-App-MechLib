import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, CalendarDays, Clock3, ListTree } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import CalendarView from "@/components/CalendarView";
import { formatDate } from "@/lib/utils";

export default function UserHistory() {
  const [issues, setIssues] = useState([]);
  const [view, setView] = useState("calendar");

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/issues");
        setIssues(response.data.data || []);
      } catch (e) { toast.error(formatApiError(e)); }
    })();
  }, []);

  return (
    <div className="ambient-bg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">My Timeline</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Borrowing History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A calendar of every book you've borrowed and returned.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card/60 backdrop-blur p-1">
          <button
            onClick={() => setView("calendar")}
            data-testid="user-history-view-calendar"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
          <button
            onClick={() => setView("timeline")}
            data-testid="user-history-view-timeline"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTree className="h-4 w-4" /> Timeline
          </button>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="panel rounded-2xl p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-semibold">No history yet</p>
          <p className="text-sm text-muted-foreground mt-1">Borrow a book to start building your reading timeline.</p>
        </div>
      ) : view === "calendar" ? (
        <CalendarView issues={issues} showStudent={false} />
      ) : (
        <div className="relative pl-6 border-l border-border space-y-6">
          {issues.map((i, idx) => (
            <motion.div
              key={i.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
              className="relative"
            >
              <div className="absolute -left-[31px] top-2 h-4 w-4 rounded-full border-2 border-background"
                style={{
                  background: i.status === "returned" ? "#10B981" : i.status === "overdue" ? "#EF4444" : "#D97706",
                }}
              />
              <div className="panel rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                  <div>
                    <p className="font-heading font-semibold">{i.book_title}</p>
                    <p className="text-xs font-mono text-muted-foreground">{i.book_code}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Issued</p>
                      <p className="font-medium">{formatDate(i.issue_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Due</p>
                      <p className="font-medium">{formatDate(i.due_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Returned</p>
                      <p className="font-medium">{formatDate(i.return_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
