import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminBooks from "@/pages/admin/Books";
import IssueBook from "@/pages/admin/IssueBook";
import ReturnBook from "@/pages/admin/ReturnBook";
import History from "@/pages/admin/History";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Requests from "@/pages/admin/Requests";

import UserLayout from "@/layouts/UserLayout";
import UserDashboard from "@/pages/user/Dashboard";
import Browse from "@/pages/user/Browse";
import UserHistory from "@/pages/user/History";
import UserSettings from "@/pages/user/Settings";

function Root() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={
              <ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin"><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/books" element={
              <ProtectedRoute role="admin"><AdminLayout><AdminBooks /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/issue" element={
              <ProtectedRoute role="admin"><AdminLayout><IssueBook /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/return" element={
              <ProtectedRoute role="admin"><AdminLayout><ReturnBook /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/history" element={
              <ProtectedRoute role="admin"><AdminLayout><History /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute role="admin"><AdminLayout><Requests /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute role="admin"><AdminLayout><Reports /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute role="admin"><AdminLayout><Settings /></AdminLayout></ProtectedRoute>
            } />

            <Route path="/app" element={
              <ProtectedRoute role="user"><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>
            } />
            <Route path="/app/browse" element={
              <ProtectedRoute role="user"><UserLayout><Browse /></UserLayout></ProtectedRoute>
            } />
            <Route path="/app/history" element={
              <ProtectedRoute role="user"><UserLayout><UserHistory /></UserLayout></ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute role="user"><UserLayout><UserSettings /></UserLayout></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
