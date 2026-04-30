import React, { useEffect, useState } from "react";
import { BookOpen, Library, CheckCircle2, AlertTriangle, Clock3, CalendarDays, ArrowRight, CalendarPlus, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import ExtensionRequestDialog from "@/components/ExtensionRequestDialog";
import { api } from "@/lib/api";
import { formatDate, daysBetween } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [extOpen, setExtOpen] = useState(false);
  const [extIssue, setExtIssue] = useState(null);

  const load = async () => {
    try {
      const [{ data: s }, { data: i }] = await Promise.all([
        api.get("/stats/user"),
        api.get("/issues"),
      ]);
      const statsPayload = s?.data ?? s ?? null;
      const issuesPayload = Array.isArray(i?.data) ? i.data : Array.isArray(i) ? i : [];
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'post-fix',hypothesisId:'H9_student_dashboard_data_load_fails_after_login',location:'user/Dashboard.jsx:27',message:'user dashboard normalized payloads',data:{statsShape:s?Object.keys(s):[],issuesShape:i?Object.keys(i):[],normalizedIssuesCount:issuesPayload.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setStats(statsPayload);
      setIssues(issuesPayload);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H9_student_dashboard_data_load_fails_after_login',location:'user/Dashboard.jsx:29',message:'user dashboard data load failed',data:{message:err?.message,status:err?.response?.status,responseMessage:err?.response?.data?.message,path:err?.config?.url},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const active = issues.filter((i) => i.status !== "returned");
  const today = new Date();

  return (
    <div className="ambient-bg space-y-10">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">
            My Library
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-semibold tracking-tight">
            Hi, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
            A quick look at your active loans and what's waiting for you in the catalogue.
          </p>
        </div>
        <Link
          to="/app/browse"
          data-testid="cta-browse-books"
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium
                     bg-brand-navy text-white dark:bg-brand-amber dark:text-brand-navy
                     shadow-lg shadow-brand-navy/10 dark:shadow-brand-amber/20
                     hover:-translate-y-0.5 transition-all"
        >
          Browse catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        <StatCard testid="user-stat-borrowed" icon={BookOpen} label="Borrowed" value={stats?.borrowed ?? "—"} tone="amber" delay={0.05} />
        <StatCard testid="user-stat-returned" icon={CheckCircle2} label="Returned" value={stats?.returned ?? "—"} tone="emerald" delay={0.1} />
        <StatCard testid="user-stat-overdue" icon={AlertTriangle} label="Overdue" value={stats?.overdue ?? "—"} tone="red" delay={0.15} />
        <StatCard testid="user-stat-available" icon={Library} label="Available" value={stats?.available_books ?? "—"} tone="blue" delay={0.2} />
        <StatCard testid="user-stat-unavailable" icon={Clock3} label="Unavailable" value={stats?.unavailable_books ?? "—"} tone="default" delay={0.25} />
        <StatCard testid="user-stat-total" icon={BookOpen} label="Catalogue" value={stats?.total_books ?? "—"} tone="default" delay={0.3} />
      </div>

      {/* Active loans */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Currently Borrowed</h2>
            <p className="text-xs text-muted-foreground mt-1">{active.length} active loan{active.length === 1 ? "" : "s"}</p>
          </div>
          <Link to="/app/history" className="text-sm text-brand-amber hover:underline" data-testid="link-history">
            View full history →
          </Link>
        </div>

        {active.length === 0 ? (
          <div className="panel rounded-2xl p-12 text-center">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 items-center justify-center mb-4">
              <Library className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-heading text-lg font-semibold">Your shelf is empty</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              Visit the catalogue to request a book from the library desk.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {active.map((i, idx) => {
              const daysLeft = daysBetween(today, new Date(i.due_date));
              const tone = daysLeft < 0 ? "red" : daysLeft < 3 ? "amber" : "blue";
              const toneMap = {
                blue:  "from-blue-500/20 to-blue-500/0",
                amber: "from-amber-500/25 to-amber-500/0",
                red:   "from-red-500/25 to-red-500/0",
              };
              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  data-testid={`borrowed-card-${i.book_code}`}
                  className="panel group relative overflow-hidden rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
                >
                  <div className={`pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full blur-3xl bg-gradient-to-br ${toneMap[tone]}`} />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {i.book_code}
                      </span>
                      <p className="mt-2 font-heading font-semibold leading-snug line-clamp-2 tracking-tight">
                        {i.book_title}
                      </p>
                    </div>
                    <div className="shrink-0 h-10 w-10 rounded-xl grid place-items-center bg-white/60 dark:bg-white/[0.06] border border-white/60 dark:border-white/10">
                      <BookOpen className="h-4 w-4 text-brand-amber" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Issued</p>
                      <p className="font-medium mt-0.5">{formatDate(i.issue_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due</p>
                      <p className="font-medium mt-0.5">{formatDate(i.due_date)}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <StatusBadge status={i.status} />
                    <span className={`text-xs font-medium ${daysLeft < 0 ? "text-destructive" : daysLeft < 3 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>

                  {/* Extension request controls */}
                  <ExtensionArea
                    issue={i}
                    daysLeft={daysLeft}
                    onRequest={() => { setExtIssue(i); setExtOpen(true); }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming dates */}
      <section className="panel rounded-2xl p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-amber" />
          <h2 className="font-heading text-lg font-semibold tracking-tight">Upcoming Dates</h2>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {active.slice(0, 3).map((i) => (
            <div key={i.id} className="rounded-xl bg-white/50 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 p-4 flex items-center gap-3">
              <div className="shrink-0 h-10 w-10 rounded-xl bg-brand-amber/15 text-brand-amber grid place-items-center">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium line-clamp-1">{i.book_title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Return by {formatDate(i.due_date)}</p>
              </div>
            </div>
          ))}
          {active.length === 0 && (
            <p className="text-muted-foreground col-span-full">No upcoming return dates.</p>
          )}
        </div>
      </section>

      <ExtensionRequestDialog
        open={extOpen}
        onOpenChange={setExtOpen}
        issue={extIssue}
        onDone={load}
      />
    </div>
  );
}

function ExtensionArea({ issue, daysLeft, onRequest }) {
  const req = issue.extension_request;
  const eligible = daysLeft >= 2 && !issue.renewed && !(req && req.status === "pending");

  if (issue.renewed) {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
        <CheckCircle className="h-3 w-3" /> Renewed +{issue.renewed_days}d
      </div>
    );
  }

  if (req && req.status === "pending") {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
        <Clock3 className="h-3 w-3" /> Request pending · +{req.days}d
      </div>
    );
  }

  if (req && req.status === "declined") {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-red-700 dark:text-red-300 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
        <XCircle className="h-3 w-3" /> Extension declined
      </div>
    );
  }

  return (
    <button
      onClick={onRequest}
      disabled={!eligible}
      data-testid={`ext-request-${issue.book_code}`}
      title={eligible ? "Request a deadline extension" : "Extension can only be requested at least 2 days before due date"}
      className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition ${
        eligible
          ? "border-brand-amber/40 text-brand-amber hover:bg-brand-amber/10"
          : "border-border text-muted-foreground opacity-60 cursor-not-allowed"
      }`}
    >
      <CalendarPlus className="h-3 w-3" />
      Request Extension
    </button>
  );
}
