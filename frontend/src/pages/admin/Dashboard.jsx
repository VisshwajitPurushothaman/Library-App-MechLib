import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, BookMarked, CheckCircle2, Clock3, AlertTriangle,
  Search, ArrowUpRight, Sparkles, TrendingUp, BookCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { api, formatApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const POPULAR_BOOKS = [
  { name: "Thermo", borrows: 28 },
  { name: "Fluids", borrows: 24 },
  { name: "Mechanics", borrows: 22 },
  { name: "Heat Tx", borrows: 18 },
  { name: "Design", borrows: 17 },
  { name: "CAD", borrows: 14 },
];
const TREND = [
  { m: "Jul", issued: 42, returned: 30 },
  { m: "Aug", issued: 56, returned: 44 },
  { m: "Sep", issued: 68, returned: 58 },
  { m: "Oct", issued: 74, returned: 63 },
  { m: "Nov", issued: 82, returned: 71 },
  { m: "Dec", issued: 64, returned: 60 },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [q, setQ] = useState("");
  const [lookup, setLookup] = useState(null);
  const [lookupErr, setLookupErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data: s }, { data: i }] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/issues"),
      ]);
      setStats(s);
      setIssues(i.slice(0, 6));
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("mechlib:issues-refresh", onRefresh);
    return () => window.removeEventListener("mechlib:issues-refresh", onRefresh);
  }, [load]);

  const handleReturn = async (id, title) => {
    try {
      await api.post(`/issues/${id}/return`);
      toast.success(`Returned: ${title}`);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const doLookup = async (e) => {
    e.preventDefault();
    setLookupErr("");
    setLookup(null);
    if (!q.trim()) return;
    try {
      const { data } = await api.get(`/users/by-roll/${q.trim().toUpperCase()}`);
      setLookup(data);
    } catch (err) {
      setLookupErr(err?.response?.data?.detail || "User not found");
    }
  };

  return (
    <div className="ambient-bg space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">
            Control Room
          </p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-semibold tracking-tight">
            Library Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
            A live snapshot of members, catalogue and active circulation across the department.
          </p>
        </div>

        {/* Roll number lookup */}
        <form onSubmit={doLookup} className="w-full lg:w-auto">
          <div className="panel flex items-center gap-2 rounded-2xl px-4 py-2.5 min-w-0 lg:min-w-[360px]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Lookup by roll number (e.g. ME2023001)"
              data-testid="admin-roll-search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              data-testid="admin-roll-search-btn"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-navy text-white dark:bg-brand-amber dark:text-brand-navy hover:-translate-y-px transition"
            >
              Find
            </button>
          </div>
          {lookupErr && <p className="mt-2 text-xs text-destructive">{lookupErr}</p>}
          {lookup && (
            <div className="mt-2 panel rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium">{lookup.name}</span>
              <span className="text-muted-foreground">· {lookup.roll_number}</span>
              <span className="ml-auto text-muted-foreground">{lookup.currently_issued} active</span>
            </div>
          )}
        </form>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        <StatCard testid="stat-total-users" icon={Users} label="Total Users" value={stats?.total_users ?? "—"} hint="Students registered" tone="blue" delay={0.05} />
        <StatCard testid="stat-total-books" icon={BookOpen} label="Total Books" value={stats?.total_books ?? "—"} hint={`${stats?.total_copies ?? 0} copies`} tone="default" delay={0.1} />
        <StatCard testid="stat-issued" icon={BookMarked} label="Issued" value={stats?.issued_books ?? "—"} hint="In circulation" tone="amber" delay={0.15} />
        <StatCard testid="stat-returned" icon={CheckCircle2} label="Returned" value={stats?.returned_books ?? "—"} hint="All time" tone="emerald" delay={0.2} />
        <StatCard testid="stat-pending" icon={Clock3} label="Pending" value={stats?.pending_returns ?? "—"} hint="Awaiting return" tone="default" delay={0.25} />
        <StatCard testid="stat-overdue" icon={AlertTriangle} label="Overdue" value={stats?.overdue_books ?? "—"} hint="Past due date" tone="red" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="panel lg:col-span-2 rounded-2xl p-6 sm:p-7"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-lg font-semibold tracking-tight">Borrowing Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 6 months · sample data</p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" /> +12% MoM
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="issued" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="returned" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="panel rounded-2xl p-6 sm:p-7"
        >
          <h3 className="font-heading text-lg font-semibold tracking-tight">Most Popular</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Top borrowed categories</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POPULAR_BOOKS} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="borrows" fill="#D97706" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent issues */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="panel rounded-2xl p-6 sm:p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading text-lg font-semibold tracking-tight">Recent Issues</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest 6 transactions</p>
          </div>
          <button
            onClick={() => nav("/admin/history")}
            className="text-sm inline-flex items-center gap-1 text-brand-amber hover:underline"
            data-testid="recent-view-all"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto -mx-2 sm:-mx-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-2 sm:px-3 py-3 font-medium">Roll No.</th>
                <th className="px-2 sm:px-3 py-3 font-medium">Student</th>
                <th className="px-2 sm:px-3 py-3 font-medium">Book</th>
                <th className="px-2 sm:px-3 py-3 font-medium">Due</th>
                <th className="px-2 sm:px-3 py-3 font-medium">Status</th>
                <th className="px-2 sm:px-3 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr><td colSpan="6" className="py-12 text-center text-muted-foreground">No issued books yet. Issue a book to begin.</td></tr>
              )}
              {issues.map((i) => (
                <tr key={i.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="px-2 sm:px-3 py-3.5 font-mono text-xs">{i.roll_number}</td>
                  <td className="px-2 sm:px-3 py-3.5 font-medium">{i.user_name}</td>
                  <td className="px-2 sm:px-3 py-3.5">
                    <span className="text-xs font-mono text-muted-foreground">{i.book_code}</span>
                    <span className="ml-2">{i.book_title}</span>
                  </td>
                  <td className="px-2 sm:px-3 py-3.5 text-muted-foreground">{formatDate(i.due_date)}</td>
                  <td className="px-2 sm:px-3 py-3.5"><StatusBadge status={i.status} /></td>
                  <td className="px-2 sm:px-3 py-3.5 text-right">
                    {i.status !== "returned" ? (
                      <button
                        onClick={() => handleReturn(i.id, i.book_title)}
                        data-testid={`recent-return-${i.book_code}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                                   bg-emerald-500/15 text-emerald-700 dark:text-emerald-300
                                   border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                      >
                        <BookCheck className="h-3.5 w-3.5" /> Return
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
