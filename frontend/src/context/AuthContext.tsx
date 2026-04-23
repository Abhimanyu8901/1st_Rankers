import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { AuthResponse, AuthUser, Role } from "../types";
import { authStorage, themeStorage } from "../utils/storage";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  specialization?: string;
  teacherFatherName?: string;
  qualification?: string;
  contactNumber?: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  courseId?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  theme: "light" | "dark";
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const stored = authStorage.get();
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [theme, setTheme] = useState<"light" | "dark">(
    themeStorage.get() === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    themeStorage.set(theme);
  }, [theme]);

  const setAuth = (response: AuthResponse) => {
    setUser(response.user);
    setToken(response.token);
    authStorage.set(response);
  };

  const login = async (payload: { email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    setAuth(data);
    return data;
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    setAuth(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authStorage.clear();
  };

  const updateUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    const storedAuth = authStorage.get();
    if (storedAuth) {
      authStorage.set({ ...storedAuth, user: nextUser });
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      theme,
      login,
      register,
      updateUser,
      logout,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light"))
    }),
    [theme, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
