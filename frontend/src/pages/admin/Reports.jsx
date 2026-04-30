import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";
import { TrendingUp, Users, BookOpen, Timer, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const COLORS = ["#D97706", "#0F172A", "#10B981", "#1D4ED8", "#9333EA", "#EA580C"];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/stats/reports");
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-amber" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Aggregated analytics across the department library.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Borrow Time", value: stats?.avg_borrow_time || "-", icon: Timer, tone: "bg-amber-500/15 text-amber-600" },
          { label: "Peak Day", value: stats?.peak_day || "-", icon: TrendingUp, tone: "bg-emerald-500/15 text-emerald-600" },
          { label: "Active Readers", value: stats?.active_readers || "-", icon: Users, tone: "bg-blue-500/15 text-blue-600" },
          { label: "Top Category", value: stats?.top_category || "-", icon: BookOpen, tone: "bg-purple-500/15 text-purple-600" },
        ].map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${k.tone}`}>
              <k.icon className="h-4 w-4" />
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">{k.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{k.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading font-semibold">Weekly Borrowing Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 8 weeks circulation</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weekly_trend || []} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
                <Area type="monotone" dataKey="count" stroke="#D97706" strokeWidth={2} fill="url(#amber)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading font-semibold">By Category</h3>
          <p className="text-xs text-muted-foreground mb-4">Borrowing share across sections</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.category_share || []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {(stats?.category_share || []).map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-heading font-semibold">Top Borrowed Books</h3>
        <p className="text-xs text-muted-foreground mb-4">Highest circulation titles</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.top_books || []} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="n" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
              <Bar dataKey="c" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
