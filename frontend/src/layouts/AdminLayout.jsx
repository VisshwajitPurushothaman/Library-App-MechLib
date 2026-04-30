import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, BookPlus, BookCheck, History,
  BarChart3, Settings, LogOut, Menu, X, Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import QuickIssueDialog from "@/components/QuickIssueDialog";
import TopRightBar from "@/components/TopRightBar";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/books", label: "Books", icon: BookOpen },
  { to: "/admin/issue", label: "Issue Book", icon: BookPlus },
  { to: "/admin/return", label: "Return Book", icon: BookCheck },
  { to: "/admin/requests", label: "Requests", icon: Inbox, badgeKey: "pending" },
  { to: "/admin/history", label: "History", icon: History },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("mechlib_admin_collapsed") === "1");
  const [quickIssueOpen, setQuickIssueOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPending = useCallback(async () => {
    try {
      const response = await api.get("/issues/extension-requests/pending-count");
      setPendingCount(response.data.data.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPending();
    const onRefresh = () => fetchPending();
    window.addEventListener("mechlib:requests-refresh", onRefresh);
    const t = setInterval(fetchPending, 30000);
    return () => { window.removeEventListener("mechlib:requests-refresh", onRefresh); clearInterval(t); };
  }, [fetchPending]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("mechlib_admin_collapsed", next ? "1" : "0");
      return next;
    });
  };

  const handleLogout = async () => { await logout(); nav("/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Logo size={30} />
          <span className="font-heading font-bold">Mech<span className="text-brand-amber">Lib</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg border border-border"
          aria-label="Open menu"
          data-testid="admin-mobile-menu-btn"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar (collapsible) */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 76 : 256 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="hidden lg:flex shrink-0 border-r border-border/60 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl h-screen sticky top-0 overflow-hidden"
        >
          <SidebarInner
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
            pendingCount={pendingCount}
            user={user}
            onLogout={handleLogout}
            onNavClick={() => {}}
          />
        </motion.aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background border-r border-border lg:hidden"
              >
                <div className="flex justify-end p-3">
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg border border-border">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <SidebarInner
                  collapsed={false}
                  toggleCollapsed={() => {}}
                  pendingCount={pendingCount}
                  user={user}
                  onLogout={handleLogout}
                  onNavClick={() => setMobileOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-[1400px] mx-auto">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating Issue Book button */}
      <motion.button
        onClick={() => setQuickIssueOpen(true)}
        data-testid="fab-quick-issue"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-24 right-6 lg:bottom-6 lg:right-24 z-40 h-14 w-14 rounded-2xl grid place-items-center
                   bg-brand-amber text-white shadow-[0_12px_30px_-8px_rgba(217,119,6,0.55)]
                   hover:shadow-[0_14px_38px_-8px_rgba(217,119,6,0.7)] transition-shadow"
        aria-label="Quick issue book"
        title="Quick issue a book"
      >
        <BookPlus className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
      </motion.button>

      <QuickIssueDialog
        open={quickIssueOpen}
        onOpenChange={setQuickIssueOpen}
        onIssued={() => window.dispatchEvent(new CustomEvent("mechlib:issues-refresh"))}
      />

      {/* Top-right floating utility bar */}
      <TopRightBar />
    </div>
  );
}

function SidebarInner({ collapsed, toggleCollapsed, pendingCount, user, onLogout, onNavClick }) {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Logo toggle */}
      <button
        onClick={toggleCollapsed}
        data-testid="admin-sidebar-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-2.5 px-4 py-5 border-b border-border/60 hover:bg-muted/40 transition-colors w-full text-left"
      >
        <motion.div whileTap={{ scale: 0.9, rotate: -8 }} className="shrink-0">
          <Logo size={44} />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="font-heading font-bold text-lg leading-none">
                Mech<span className="text-brand-amber">Lib</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Admin Console</p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Profile card (moved to top) */}
      <div className={cn("px-3 pt-3", collapsed && "px-2")}>
        <div
          className={cn(
            "rounded-xl border border-border/60 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md transition-all",
            collapsed ? "p-2 flex justify-center" : "p-3 flex items-center gap-3"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-amber to-amber-600 text-white grid place-items-center text-sm font-semibold shrink-0 shadow-sm ring-2 ring-white/60 dark:ring-white/10">
            {user?.name?.[0] || "A"}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="prof"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap min-w-0"
              >
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber font-medium uppercase tracking-wider text-[9px] mr-1.5">
                    {user?.role}
                  </span>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, label, icon: Icon, end, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            data-testid={`admin-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {badgeKey === "pending" && pendingCount > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-brand-amber text-white tabular-nums",
                collapsed && "absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1"
              )}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — logout only */}
      <div className="p-3 border-t border-border/60">
        <button
          data-testid="admin-logout-btn"
          onClick={onLogout}
          title="Logout"
          className={cn(
            "inline-flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg border border-border hover:bg-muted transition w-full",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="lbl"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
