import React, { useEffect, useState, useMemo } from "react";
import { Search, BookOpen, CheckCircle2, XCircle, Flame } from "lucide-react";
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
  
  // Reload when query changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { groupedBooks, topBooks } = useMemo(() => {
    const map = new Map();
    books.forEach(b => {
      const key = (b.title + '|' + b.author).toLowerCase();
      if (!map.has(key)) {
        map.set(key, { ...b, available_copies: 0, total_copies: 0, codes: [] });
      }
      const entry = map.get(key);
      entry.available_copies += b.available_copies;
      entry.total_copies += b.total_copies;
      entry.codes.push(b.code);
    });
    
    const unique = Array.from(map.values());
    const top = [...unique].sort((a, b) => b.total_copies - a.total_copies).slice(0, 6);
    return { groupedBooks: unique, topBooks: top };
  }, [books]);

  const visible = useMemo(() => {
    if (filter === "available") return groupedBooks.filter((b) => b.available_copies > 0);
    if (filter === "unavailable") return groupedBooks.filter((b) => b.available_copies === 0);
    return groupedBooks;
  }, [groupedBooks, filter]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Catalogue</h1>
        <p className="text-sm text-muted-foreground">Browse {books.length} physical volumes across {groupedBooks.length} unique titles.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 flex-1 max-w-lg">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author, barcode, category"
              data-testid="browse-search"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>

          <div className="inline-flex rounded-xl border border-border bg-card p-1 shrink-0">
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

        {/* Quick Filters */}
        {!q && topBooks.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-brand-amber" /> Popular
            </div>
            {topBooks.map((b, idx) => (
              <button
                key={idx}
                onClick={() => setQ(b.title)}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
              >
                {b.title.length > 25 ? b.title.substring(0, 25) + '...' : b.title} ({b.total_copies})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((b) => {
          const available = b.available_copies > 0;
          return (
            <button
              key={b.id}
              onClick={() => handleBookClick(b)}
              data-testid={`browse-card-${b.code}`}
              className={`group rounded-2xl border overflow-hidden transition-all text-left flex flex-col ${
                available
                  ? "border-border bg-card hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  : "border-red-500/30 bg-red-500/5 dark:bg-red-950/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              }`}
            >
              <div
                className={`h-36 relative flex items-end p-4 shrink-0 ${
                  available ? "" : "opacity-60"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${available ? b.cover_color : '#EF4444'} 0%, ${available ? b.cover_color : '#B91C1C'}cc 100%)`,
                }}
              >
                <BookOpen className="absolute top-3 right-3 h-6 w-6 text-white/40" />
                <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">{b.total_copies > 1 ? `COPIES: ${b.total_copies}` : `CODE: ${b.code}`}</span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <p className="font-heading font-semibold leading-snug line-clamp-2">{b.title}</p>
                <p className="text-xs text-muted-foreground flex-1">{b.author}</p>
                <p className="text-[11px] inline-block px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider self-start mb-1">{b.category}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                  <span
                    className={`chip flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      available
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {available ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {available ? `${b.available_copies} of ${b.total_copies} left` : "0 left"}
                  </span>
                </div>
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
