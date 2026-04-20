import React from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from "recharts";
import { TrendingUp, Users, BookOpen, Timer } from "lucide-react";

const CATEGORY = [
  { name: "Mechanics", value: 32 },
  { name: "Thermo", value: 26 },
  { name: "Fluids", value: 21 },
  { name: "Design", value: 18 },
  { name: "Manuf.", value: 15 },
  { name: "Others", value: 12 },
];
const COLORS = ["#D97706", "#0F172A", "#10B981", "#1D4ED8", "#9333EA", "#EA580C"];
const TREND = [
  { m: "Week 1", count: 22 },
  { m: "Week 2", count: 28 },
  { m: "Week 3", count: 36 },
  { m: "Week 4", count: 41 },
  { m: "Week 5", count: 52 },
  { m: "Week 6", count: 48 },
  { m: "Week 7", count: 58 },
  { m: "Week 8", count: 62 },
];

export default function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Aggregated analytics across the department library.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Borrow Time", value: "9.2 days", icon: Timer, tone: "bg-amber-500/15 text-amber-600" },
          { label: "Peak Day", value: "Wednesday", icon: TrendingUp, tone: "bg-emerald-500/15 text-emerald-600" },
          { label: "Active Readers", value: "86%", icon: Users, tone: "bg-blue-500/15 text-blue-600" },
          { label: "Top Category", value: "Mechanics", icon: BookOpen, tone: "bg-purple-500/15 text-purple-600" },
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
          <p className="text-xs text-muted-foreground mb-4">Sample visualisation</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND} margin={{ left: -10 }}>
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
          <p className="text-xs text-muted-foreground mb-4">Borrowing share</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {CATEGORY.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-heading font-semibold">Top Borrowed Books (6 mo)</h3>
        <p className="text-xs text-muted-foreground mb-4">Placeholder chart · will compute from DB</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { n: "Thermo", c: 58 }, { n: "Fluids", c: 52 }, { n: "Mechanics", c: 48 }, { n: "Heat Tx", c: 42 }, { n: "Design", c: 37 }, { n: "Manuf.", c: 31 }, { n: "CAD/CAM", c: 28 },
            ]} margin={{ left: -10 }}>
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
