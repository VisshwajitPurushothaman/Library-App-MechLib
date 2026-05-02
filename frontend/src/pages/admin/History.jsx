import React, { useEffect, useState } from "react";
import { Search, CalendarDays, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import CalendarView from "@/components/CalendarView";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function History() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("calendar"); // calendar | table
  const [issues, setIssues] = useState([]);

  const load = async () => {
    try {
      const params = {};
      if (status !== "all") params.status = status;
      if (q) params.roll_number = q;
      const response = await api.get("/issues", { params });
      setIssues(response.data.data || []);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status]);

  return (
    <div className="ambient-bg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">Audit Log</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every borrow and return, laid out on a calendar for easy scanning.
          </p>
        </div>

        {/* View toggle */}
        <div className="inline-flex rounded-xl border border-border bg-card/60 backdrop-blur p-1">
          <button
            onClick={() => setView("calendar")}
            data-testid="history-view-calendar"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
          <button
            onClick={() => setView("table")}
            data-testid="history-view-table"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="h-4 w-4" /> Table
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by roll number"
            data-testid="history-search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <Tabs value={status} onValueChange={setStatus}>
          <TabsList data-testid="history-tabs">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="issued">Issued</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "calendar" ? (
        <CalendarView issues={issues} showStudent={true} />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Roll No.</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Book</th>
                  <th className="px-5 py-3 font-medium">Issue</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Returned</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 && (
                  <tr><td colSpan="7" className="px-5 py-10 text-center text-muted-foreground">No records found.</td></tr>
                )}
                {issues.map((i) => (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{i.roll_number}</td>
                    <td className="px-5 py-3 font-medium">{i.user_name}</td>
                    <td className="px-5 py-3">
                      <div>{i.book_title}</div>
                      <div className="text-xs font-mono text-muted-foreground">{i.book_code}</div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(i.issue_date)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(i.due_date)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(i.return_date)}</td>
                    <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
