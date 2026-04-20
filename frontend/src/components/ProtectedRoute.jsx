import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  // #region agent log
  fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H7_protected_route_redirects_user_after_successful_login',location:'ProtectedRoute.jsx:9',message:'protected route render state',data:{pathname:loc.pathname,loading,hasUser:!!user,userRole:user?.role,requiredRole:role},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) {
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H7_protected_route_redirects_user_after_successful_login',location:'ProtectedRoute.jsx:18',message:'protected route redirect to login',data:{pathname:loc.pathname,reason:'no-user'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (role && user.role !== role) {
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H7_protected_route_redirects_user_after_successful_login',location:'ProtectedRoute.jsx:22',message:'protected route redirect due role mismatch',data:{pathname:loc.pathname,userRole:user?.role,requiredRole:role},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }
  return children;
}
