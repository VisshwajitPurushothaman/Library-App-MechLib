import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["Mechanics", "Thermodynamics", "Fluids", "Heat", "Design", "Manufacturing", "Engines", "HVAC", "Metrology", "Analysis", "Management", "Automation", "Automotive", "Energy", "Drafting"];
const COLORS = ["#0F172A", "#1E40AF", "#B45309", "#047857", "#B91C1C", "#6D28D9", "#0F766E", "#9333EA", "#EA580C", "#0369A1"];

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", author: "", category: "Mechanics", total_copies: 1, description: "", cover_color: "#0F172A" });

  const load = async () => {
    try {
      const { data } = await api.get("/books", { params: { q: q || undefined } });
      setBooks(data);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    try {
      await api.post("/books", { ...form, total_copies: Number(form.total_copies) || 1 });
      toast.success("Book added");
      setOpen(false);
      setForm({ code: "", title: "", author: "", category: "Mechanics", total_copies: 1, description: "", cover_color: "#0F172A" });
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const remove = async (id) => {
    if (!confirm("Remove this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success("Book removed");
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Catalogue</h1>
        <p className="text-sm text-muted-foreground">All books in the MechLib collection.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 max-w-lg">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, code, category"
            data-testid="books-search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="books-add-btn" className="bg-brand-navy dark:bg-brand-amber dark:text-brand-navy">
              <Plus className="h-4 w-4 mr-1.5" /> Add Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Book</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ME201" data-testid="books-form-code" />
              </div>
              <div>
                <Label>Category</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  data-testid="books-form-category"
                  className="w-full h-10 px-3 rounded-md border border-border bg-transparent text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="books-form-title" />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} data-testid="books-form-author" />
              </div>
              <div>
                <Label>Total Copies</Label>
                <Input type="number" min="1" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: e.target.value })} data-testid="books-form-copies" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Cover color</Label>
                <div className="flex gap-2 flex-wrap mt-1.5">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, cover_color: c })}
                      className={`h-8 w-8 rounded-lg border-2 ${form.cover_color === c ? "border-foreground" : "border-transparent"}`}
                      style={{ background: c }} aria-label={c} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} data-testid="books-form-submit">Add to Catalogue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {books.map((b) => (
          <div key={b.id} data-testid={`book-card-${b.code}`}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="h-32 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${b.cover_color} 0%, ${b.cover_color}cc 100%)` }}>
              <BookOpen className="absolute top-3 right-3 h-6 w-6 text-white/40" />
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">{b.code}</span>
            </div>
            <div className="p-4 space-y-1.5">
              <p className="font-heading font-semibold leading-snug line-clamp-2">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.author}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs">
                  <span className="font-semibold text-foreground">{b.available_copies}</span>
                  <span className="text-muted-foreground"> / {b.total_copies} available</span>
                </span>
                <button onClick={() => remove(b.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive" data-testid={`book-delete-${b.code}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">No books match your search.</div>
        )}
      </div>
    </div>
  );
}
