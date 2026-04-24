import React, { useEffect, useState } from "react";
import { BookCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ReturnBook() {
  const [q, setQ] = useState("");
  const [issues, setIssues] = useState([]);

  const load = async (roll) => {
    try {
      const response = await api.get("/issues", { params: { roll_number: roll || undefined, status: undefined } });
      const issues = response.data.data || [];
      setIssues(issues.filter((i) => i.status !== "returned"));
    } catch (e) { toast.error(formatApiError(e)); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const returnIt = async (id, title) => {
    try {
      await api.post(`/issues/${id}/return`);
      toast.success(`Returned: ${title}`);
      load(q);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Return Books</h1>
        <p className="text-sm text-muted-foreground">All books currently with students.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(q); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by roll number"
          data-testid="return-search"
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Issue</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-10 text-center text-muted-foreground">No books awaiting return.</td></tr>
              )}
              {issues.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/30" data-testid={`return-row-${i.book_code}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium">{i.user_name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{i.roll_number}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{i.book_title}</div>
                    <div className="text-xs font-mono text-muted-foreground">{i.book_code}</div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(i.issue_date)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(i.due_date)}</td>
                  <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" onClick={() => returnIt(i.id, i.book_title)} data-testid={`return-btn-${i.book_code}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <BookCheck className="h-4 w-4 mr-1.5" /> Mark Returned
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
