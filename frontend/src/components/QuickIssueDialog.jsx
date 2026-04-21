import React, { useEffect, useState } from "react";
import { BookPlus, User as UserIcon, Plus, X, CalendarDays, Search } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function QuickIssueDialog({ open, onOpenChange, trigger, onIssued }) {
  const [roll, setRoll] = useState("");
  const [user, setUser] = useState(null);
  const [userErr, setUserErr] = useState("");

  const [numBooks, setNumBooks] = useState(1);
  const [codes, setCodes] = useState([""]);
  const [titles, setTitles] = useState([""]);

  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(addDays(new Date(), 14));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCodes((prev) => {
      const next = [...prev];
      while (next.length < numBooks) next.push("");
      next.length = numBooks;
      return next;
    });
    setTitles((prev) => {
      const next = [...prev];
      while (next.length < numBooks) next.push("");
      next.length = numBooks;
      return next;
    });
  }, [numBooks]);

  const reset = () => {
    setRoll(""); setUser(null); setUserErr("");
    setNumBooks(1); setCodes([""]); setTitles([""]);
    setIssueDate(new Date()); setDueDate(addDays(new Date(), 14));
  };

  const lookupUser = async () => {
    setUser(null); setUserErr("");
    if (!roll.trim()) return;
    try {
      const response = await api.get(`/users/by-roll/${roll.trim().toUpperCase()}`);
      setUser(response.data.data);
    } catch (e) { setUserErr(formatApiError(e, "User not found")); }
  };

  const lookupBook = async (idx, code) => {
    const next = [...codes]; next[idx] = code; setCodes(next);
    if (!code.trim()) {
      const t = [...titles]; t[idx] = ""; setTitles(t);
      return;
    }
    try {
      const response = await api.get(`/books/${code.trim().toUpperCase()}`);
      const data = response.data.data;
      const t = [...titles]; t[idx] = `${data.title} — ${data.author} (${data.available_copies} left)`; setTitles(t);
    } catch {
      const t = [...titles]; t[idx] = "Not found"; setTitles(t);
    }
  };

  const issue = async () => {
    if (!user) return toast.error("Lookup a student first");
    const valid = codes.filter((c) => c.trim()).length === numBooks && titles.every((t) => t && t !== "Not found");
    if (!valid) return toast.error("Enter valid book codes");
    setSubmitting(true);
    try {
      await api.post("/issues", {
        roll_number: user.roll_number,
        book_codes: codes.map((c) => c.toUpperCase()),
        issue_date: format(issueDate, "yyyy-MM-dd"),
        due_date: format(dueDate, "yyyy-MM-dd"),
      });
      toast.success(`Issued ${numBooks} book${numBooks > 1 ? "s" : ""} to ${user.name}`);
      reset();
      onOpenChange?.(false);
      onIssued?.();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <BookPlus className="h-5 w-5 text-brand-amber" />
            Quick Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-xs">Student Roll Number</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupUser())}
                  placeholder="ME2023001"
                  data-testid="quick-issue-roll"
                  className="pl-9 font-mono"
                />
              </div>
              <Button onClick={lookupUser} data-testid="quick-issue-lookup">Find</Button>
            </div>
            {userErr && <p className="mt-1.5 text-xs text-destructive">{userErr}</p>}
          </div>

          {user && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-amber/20 text-brand-amber grid place-items-center">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.roll_number} · {user.currently_issued} active</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Books</Label>
              <div className="flex items-center rounded-lg border border-border">
                <button className="p-1.5 text-muted-foreground hover:text-foreground" onClick={() => setNumBooks(Math.max(1, numBooks - 1))}>
                  <X className="h-3 w-3" />
                </button>
                <span className="px-3 font-mono text-xs">{numBooks}</span>
                <button className="p-1.5 text-muted-foreground hover:text-foreground" onClick={() => setNumBooks(Math.min(5, numBooks + 1))}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {codes.map((code, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input
                  value={code}
                  onChange={(e) => lookupBook(i, e.target.value)}
                  placeholder={`Code #${i + 1}`}
                  data-testid={`quick-issue-code-${i}`}
                  className="col-span-4 font-mono"
                />
                <div className={cn(
                  "col-span-8 h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs flex items-center",
                  titles[i] === "Not found" && "text-destructive border-destructive/40"
                )}>
                  {titles[i] || <span className="text-muted-foreground">Title will appear automatically</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Issue Date</Label>
              <DateBtn date={issueDate} setDate={setIssueDate} />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <DateBtn date={dueDate} setDate={setDueDate} />
            </div>
          </div>

          <Button
            onClick={issue}
            disabled={submitting || !user}
            data-testid="quick-issue-submit"
            className="w-full bg-brand-navy dark:bg-brand-amber dark:text-brand-navy h-11"
          >
            <BookPlus className="h-4 w-4 mr-2" />
            {submitting ? "Issuing..." : "Issue Books"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DateBtn({ date, setDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="mt-1.5 w-full h-10 rounded-md border border-border bg-transparent px-3 text-sm text-left flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {format(date, "PP")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
