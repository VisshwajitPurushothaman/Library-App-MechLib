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
    try {
      const { data } = await api.get("/auth/me");
      setUser(extractUser(data));
    } catch {
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
    const token = extractToken(data);
    const nextUser = extractUser(data);
    if (token) localStorage.setItem("mechlib_token", token);
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
