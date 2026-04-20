import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractUser = (payload) => {
    const nestedUser = payload?.data?.user ?? payload?.user;
    if (nestedUser) return nestedUser;
    if (payload?.data?.role && payload?.data?.name) return payload.data;
    return null;
  };
  const extractToken = (payload) => payload?.data?.token ?? payload?.token ?? null;

  const fetchMe = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H6_fetchme_race_overwrites_login_user',location:'AuthContext.jsx:14',message:'fetchMe started',data:{hasToken:!!localStorage.getItem('mechlib_token')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      const { data } = await api.get("/auth/me");
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H6_fetchme_race_overwrites_login_user',location:'AuthContext.jsx:17',message:'fetchMe success before setUser',data:{hasUserNested:!!data?.data?.user,hasUserFlat:!!data?.user},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setUser(extractUser(data));
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H6_fetchme_race_overwrites_login_user',location:'AuthContext.jsx:20',message:'fetchMe failed before setUser(null)',data:{hasToken:!!localStorage.getItem('mechlib_token')},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (identifier, password, role) => {
    const { data } = await api.post("/auth/login", { identifier, password, role });
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H2_backend_login_response_shape_for_student',location:'AuthContext.jsx:30',message:'auth context login response shape',data:{hasOuterData:!!data,hasNestedData:!!data?.data,hasUserNested:!!data?.data?.user,hasUserFlat:!!data?.user,nestedRole:data?.data?.user?.role,flatRole:data?.user?.role},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const token = extractToken(data);
    const nextUser = extractUser(data);
    if (token) localStorage.setItem("mechlib_token", token);
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H6_fetchme_race_overwrites_login_user',location:'AuthContext.jsx:35',message:'login about to setUser(nextUser)',data:{hasNextUser:!!nextUser,nextUserRole:nextUser?.role,hasTokenAfterSet:!!localStorage.getItem('mechlib_token')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setUser(nextUser);
    return nextUser;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const token = extractToken(data);
    const nextUser = extractUser(data);
    if (token) localStorage.setItem("mechlib_token", token);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("mechlib_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, formatApiError }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
