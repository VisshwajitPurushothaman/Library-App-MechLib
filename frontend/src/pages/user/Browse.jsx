import React, { useEffect, useState, useMemo } from "react";
import { Search, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import BookDetailModal from "@/components/BookDetailModal";

export default function Browse() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | available | unavailable
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const response = await api.get("/books", { params: { q: q || undefined } });
      setBooks(response.data.data || []);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const visible = useMemo(() => {
    if (filter === "available") return books.filter((b) => b.available_copies > 0);
    if (filter === "unavailable") return books.filter((b) => b.available_copies === 0);
    return books;
  }, [books, filter]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Catalogue</h1>
        <p className="text-sm text-muted-foreground">Browse all {books.length} books in the department library.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 max-w-lg">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, code, category"
            data-testid="browse-search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {[
            { k: "all", l: "All" },
            { k: "available", l: "Available" },
            { k: "unavailable", l: "Unavailable" },
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              data-testid={`browse-filter-${k}`}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((b) => {
          const available = b.available_copies > 0;
          return (
            <button
              key={b.id}
              onClick={() => handleBookClick(b)}
              data-testid={`browse-card-${b.code}`}
              className={`group rounded-2xl border overflow-hidden transition-all text-left ${
                available
                  ? "border-border bg-card hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  : "border-red-500/30 bg-red-500/5 dark:bg-red-950/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              }`}
            >
              <div
                className={`h-36 relative flex items-end p-4 ${
                  available ? "" : "opacity-60"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${b.cover_color} 0%, ${b.cover_color}cc 100%)`,
                }}
              >
                <BookOpen className="absolute top-3 right-3 h-6 w-6 text-white/40" />
                <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">{b.code}</span>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-heading font-semibold leading-snug line-clamp-2">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.author}</p>
                <p className="text-[11px] inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">{b.category}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span
                    className={`chip flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      available
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {available ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {available ? `${b.available_copies} available` : "Unavailable"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Click to see details</p>
              </div>
            </button>
          );
        })}
        {visible.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">No books match your criteria.</div>
        )}
      </div>

      <BookDetailModal isOpen={showModal} onClose={() => setShowModal(false)} book={selectedBook} />
    </div>
  );
}
