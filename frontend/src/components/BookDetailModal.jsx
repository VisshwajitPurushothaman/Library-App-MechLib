import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Users, Calendar, Clock } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function BookDetailModal({ isOpen, onClose, book }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      setLoading(true);
      (async () => {
        try {
          const response = await api.post(`/books/issues/batch`, { codes: book.codes });
          setIssues(response.data.data.issues || []);
        } catch (e) {
          toast.error(formatApiError(e));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, book]);

  if (!book) return null;

  const available = book.available_copies > 0;
  const totalIssued = book.total_copies - book.available_copies;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-20 h-28 rounded-lg flex items-end p-2"
                    style={{ background: `linear-gradient(135deg, ${available ? book.cover_color : '#EF4444'} 0%, ${available ? book.cover_color : '#B91C1C'}cc 100%)` }}
                  >
                    <BookOpen className="h-4 w-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-2xl font-semibold line-clamp-2">{book.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-2">{book.code}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Book Details */}
                <div>
                  <h3 className="font-heading font-semibold mb-4">📚 Book Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium">{book.category}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Total Copies</p>
                      <p className="font-medium">{book.total_copies}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className={`font-medium ${available ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {book.available_copies}/{book.total_copies}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Currently Issued</p>
                      <p className="font-medium">{totalIssued}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {book.description && (
                  <div>
                    <h3 className="font-heading font-semibold mb-2">📖 Description</h3>
                    <p className="text-sm text-muted-foreground">{book.description}</p>
                  </div>
                )}

                {/* Who Has It */}
                {issues.length > 0 ? (
                  <div>
                    <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Currently Issued ({issues.length})
                    </h3>
                    <div className="space-y-3">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      ) : (
                        issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{issue.user_name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{issue.roll_number}</p>
                              </div>
                              <div
                                className={`px-2.5 py-1 rounded text-xs font-medium ${
                                  issue.status === "returned"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                    : issue.status === "overdue"
                                      ? "bg-red-500/15 text-red-700 dark:text-red-400"
                                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>Issued: {formatDate(issue.issue_date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>Due: {formatDate(issue.due_date)}</span>
                              </div>
                              {issue.return_date && (
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>Returned: {formatDate(issue.return_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">✅ This book is available and not currently issued to anyone.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
