import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, History, LogOut, Menu, X, Settings as SettingsIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import TopRightBar from "@/components/TopRightBar";
import Logo from "@/components/Logo";

const NAV = [
  { to: "/app", label: "My Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/browse", label: "Browse Books", icon: BookOpen },
  { to: "/app/history", label: "Borrowing History", icon: History },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("mechlib_user_collapsed") === "1");

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("mechlib_user_collapsed", next ? "1" : "0");
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
          data-testid="user-mobile-menu-btn"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 76 : 256 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="hidden lg:flex shrink-0 border-r border-border/60 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl h-screen sticky top-0 overflow-hidden"
        >
          <SidebarInner
            collapsed={collapsed}
            toggleCollapsed={toggleCollapsed}
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

      <TopRightBar />
    </div>
  );
}

function SidebarInner({ collapsed, toggleCollapsed, user, onLogout, onNavClick }) {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Logo toggle */}
      <button
        onClick={toggleCollapsed}
        data-testid="user-sidebar-toggle"
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
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Student Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Profile card */}
      <div className={cn("px-3 pt-3", collapsed && "px-2")}>
        <div
          className={cn(
            "rounded-xl border border-border/60 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md transition-all",
            collapsed ? "p-2 flex justify-center" : "p-3 flex items-center gap-3"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-amber to-amber-600 text-white grid place-items-center text-sm font-semibold shrink-0 shadow-sm ring-2 ring-white/60 dark:ring-white/10">
            {user?.name?.[0] || "U"}
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
                <p className="text-[11px] text-muted-foreground truncate font-mono">{user?.roll_number}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            data-testid={`user-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
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
          </NavLink>
        ))}
      </nav>

      {/* Footer — logout only */}
      <div className="p-3 border-t border-border/60">
        <button
          data-testid="user-logout-btn"
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
