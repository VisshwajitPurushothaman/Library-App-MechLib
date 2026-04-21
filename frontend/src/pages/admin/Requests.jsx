import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CalendarDays, CalendarClock, CheckCircle2, XCircle, Clock3, User as UserIcon,
  MessageSquare, Inbox, Loader2,
} from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function Requests() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    try {
      const response = await api.get("/extension-requests", { params: { status } });
      setItems(response.data.data || []);
    } catch (e) { toast.error(formatApiError(e)); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const decide = async (issueId, decision) => {
    setBusyId(issueId);
    try {
      await api.post(`/issues/${issueId}/extension/decide`, {
        decision,
        admin_note: notes[issueId] || "",
      });
      toast.success(decision === "approve" ? "Extension approved · deadline renewed" : "Request declined");
      await load();
      window.dispatchEvent(new CustomEvent("mechlib:requests-refresh"));
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusyId(null); }
  };

  return (
    <div className="ambient-bg space-y-6">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-amber">Inbox</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Extension Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve or decline student deadline extension requests. Approvals renew the loan by the requested days.
        </p>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList data-testid="req-tabs">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {items.length === 0 ? (
        <div className="panel rounded-2xl p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-semibold">No {status === "all" ? "" : status} requests</p>
          <p className="text-sm text-muted-foreground mt-1">Students haven't requested any extensions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((i, idx) => {
              const req = i.extension_request || {};
              const isPending = req.status === "pending";
              return (
                <motion.div
                  key={i.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.04 }}
                  className="panel rounded-2xl p-5 sm:p-6"
                  data-testid={`req-card-${i.book_code}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-amber/15 text-brand-amber grid place-items-center shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-semibold truncate">{i.user_name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{i.roll_number}</p>
                      </div>
                    </div>
                    <StatusPill status={req.status} />
                  </div>

                  <div className="mt-4 rounded-xl bg-muted/30 border border-border p-3.5 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Book</p>
                    <p className="text-sm font-medium">{i.book_title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{i.book_code}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <Meta icon={CalendarDays} label="Current due" value={formatDate(i.due_date)} />
                    <Meta icon={CalendarClock} label="Extend by" value={`+${req.days}d`} tone="amber" />
                    <Meta icon={Clock3} label="Requested" value={formatDate(req.requested_at)} />
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3" /> Reason
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed">{req.reason}</p>
                  </div>

                  {req.status !== "pending" && req.admin_note && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                      <p className="text-muted-foreground">Admin note</p>
                      <p className="mt-1">{req.admin_note}</p>
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-5 space-y-3">
                      <Textarea
                        rows={2}
                        placeholder="Optional note for the student…"
                        value={notes[i.id] || ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [i.id]: e.target.value }))}
                        data-testid={`req-note-${i.book_code}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(i.id, "approve")}
                          disabled={busyId === i.id}
                          data-testid={`req-approve-${i.book_code}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                                     bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-sm font-medium
                                     disabled:opacity-60 transition"
                        >
                          {busyId === i.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Approve & Renew
                        </button>
                        <button
                          onClick={() => decide(i.id, "decline")}
                          disabled={busyId === i.id}
                          data-testid={`req-decline-${i.book_code}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                                     border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 py-2.5 text-sm font-medium transition"
                        >
                          <XCircle className="h-4 w-4" /> Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {i.renewed && (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Renewed by {i.renewed_days} day{i.renewed_days === 1 ? "" : "s"}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending:  { cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",  label: "Pending" },
    approved: { cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", label: "Approved" },
    declined: { cls: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30", label: "Declined" },
  };
  const m = map[status] || map.pending;
  return (
    <span className={cn("text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full border", m.cls)}>
      {m.label}
    </span>
  );
}

function Meta({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-2.5">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className={cn("mt-1 text-sm font-medium tabular-nums", tone === "amber" && "text-brand-amber")}>{value}</p>
    </div>
  );
}
