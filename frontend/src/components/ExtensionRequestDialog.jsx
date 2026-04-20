import React, { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Loader2, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, formatApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ExtensionRequestDialog({ open, onOpenChange, issue, onDone }) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      return toast.error("Please provide a reason (at least 10 characters)");
    }
    setLoading(true);
    try {
      await api.post(`/issues/${issue.id}/request-extension`, { days, reason: reason.trim() });
      toast.success("Extension request sent to admin");
      setReason(""); setDays(7);
      onOpenChange?.(false);
      onDone?.();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <CalendarPlus className="h-5 w-5 text-brand-amber" />
            Request Deadline Extension
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Book</p>
            <p className="mt-1 font-medium text-sm">{issue.book_title}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Current due date: <span className="font-medium text-foreground">{formatDate(issue.due_date)}</span>
            </div>
          </div>

          <div>
            <Label className="text-xs">Extend by</Label>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {[3, 7, 14, 21].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  data-testid={`ext-days-${d}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    days === d
                      ? "bg-brand-amber text-white border-brand-amber"
                      : "border-border bg-transparent hover:bg-muted text-foreground"
                  }`}
                >
                  {d} days
                </button>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                  data-testid="ext-days-input"
                  className="w-20 h-10 px-3 rounded-lg border border-border bg-transparent text-sm font-mono text-center"
                />
                <span className="text-xs text-muted-foreground">max 30</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Reason</Label>
            <Textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain why you need more time (e.g., final exams, ongoing project)."
              data-testid="ext-reason"
              className="mt-1.5"
              maxLength={500}
            />
            <p className="text-[10px] text-muted-foreground text-right mt-1">{reason.length}/500</p>
          </div>

          <Button
            onClick={submit}
            disabled={loading}
            data-testid="ext-submit"
            className="w-full h-11 bg-brand-navy dark:bg-brand-amber dark:text-brand-navy text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarPlus className="h-4 w-4 mr-2" />}
            {loading ? "Sending..." : "Submit Request"}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Requests can only be made at least <b>2 days</b> before the due date and once per loan.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
