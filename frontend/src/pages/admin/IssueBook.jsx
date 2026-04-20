import React, { useEffect, useMemo, useState } from "react";
import { User as UserIcon, BookPlus, CalendarDays, Check, Plus, X, Library, Search } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function IssueBook() {
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
    // adjust arrays to match numBooks
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

  const lookupUser = async () => {
    setUser(null); setUserErr("");
    if (!roll.trim()) return;
    try {
      const { data } = await api.get(`/users/by-roll/${roll.trim().toUpperCase()}`);
      setUser(data);
    } catch (e) {
      setUserErr(formatApiError(e, "User not found"));
    }
  };

  const lookupBook = async (idx, code) => {
    const next = [...codes]; next[idx] = code; setCodes(next);
    if (!code.trim()) {
      const t = [...titles]; t[idx] = ""; setTitles(t);
      return;
    }
    try {
      const { data } = await api.get(`/books/${code.trim().toUpperCase()}`);
      const t = [...titles]; t[idx] = `${data.title} — ${data.author} (${data.available_copies} left)`;
      setTitles(t);
    } catch {
      const t = [...titles]; t[idx] = "Not found";
      setTitles(t);
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
      setCodes(Array(numBooks).fill(""));
      setTitles(Array(numBooks).fill(""));
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-amber font-medium">Circulation</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Issue a Book</h1>
        <p className="text-sm text-muted-foreground">Look up a student, pick the books and set the due date.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student panel */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-amber" />
            <h3 className="font-heading font-semibold">Student Lookup</h3>
          </div>
          <div>
            <Label>Roll Number</Label>
            <div className="flex gap-2 mt-1.5">
              <Input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="ME2023001" data-testid="issue-roll-input" />
              <Button onClick={lookupUser} data-testid="issue-lookup-btn">Find</Button>
            </div>
            {userErr && <p className="text-xs text-destructive mt-1.5" data-testid="issue-user-error">{userErr}</p>}
          </div>

          {user && (
            <div className="rounded-xl border border-border bg-muted/40 p-4" data-testid="issue-user-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-amber/15 text-brand-amber grid place-items-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 mt-4 gap-3 text-xs">
                <div><p className="text-muted-foreground">Roll No.</p><p className="font-mono font-medium">{user.roll_number}</p></div>
                <div><p className="text-muted-foreground">Department</p><p className="font-medium">{user.department}</p></div>
                <div><p className="text-muted-foreground">Currently Issued</p><p className="font-semibold text-brand-amber">{user.currently_issued}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium text-emerald-600">Eligible</p></div>
              </div>
            </div>
          )}
        </div>

        {/* Book panel */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-brand-amber" />
              <h3 className="font-heading font-semibold">Books to Issue</h3>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Number of books</Label>
              <div className="flex items-center rounded-lg border border-border">
                <button className="p-2 text-muted-foreground hover:text-foreground" onClick={() => setNumBooks(Math.max(1, numBooks - 1))} data-testid="issue-dec-books">
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 font-mono text-sm" data-testid="issue-num-books">{numBooks}</span>
                <button className="p-2 text-muted-foreground hover:text-foreground" onClick={() => setNumBooks(Math.min(5, numBooks + 1))} data-testid="issue-inc-books">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {codes.map((code, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 sm:col-span-4">
                  <Label className="text-xs">Book code #{i + 1}</Label>
                  <Input
                    value={code}
                    onChange={(e) => lookupBook(i, e.target.value)}
                    placeholder="ME101"
                    data-testid={`issue-book-code-${i}`}
                    className="font-mono"
                  />
                </div>
                <div className="col-span-12 sm:col-span-8">
                  <Label className="text-xs">Title (auto)</Label>
                  <div className={cn(
                    "mt-1.5 h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm flex items-center",
                    titles[i] === "Not found" && "text-destructive"
                  )} data-testid={`issue-book-title-${i}`}>
                    {titles[i] || <span className="text-muted-foreground">— Enter code to auto-populate —</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <Label className="text-xs">Issue Date</Label>
              <DatePickerBtn date={issueDate} setDate={setIssueDate} testid="issue-date-picker" />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <DatePickerBtn date={dueDate} setDate={setDueDate} testid="issue-due-picker" />
            </div>
          </div>

          <Button
            onClick={issue}
            disabled={submitting || !user}
            data-testid="issue-submit-btn"
            className="w-full bg-brand-navy dark:bg-brand-amber dark:text-brand-navy h-12"
          >
            <BookPlus className="h-4 w-4 mr-2" />
            {submitting ? "Issuing..." : "Issue Books"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DatePickerBtn({ date, setDate, testid }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-testid={testid}
          className="mt-1.5 w-full h-10 rounded-md border border-border bg-transparent px-3 text-sm text-left flex items-center gap-2"
        >
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
