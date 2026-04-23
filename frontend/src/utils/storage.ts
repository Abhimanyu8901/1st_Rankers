import { AuthResponse } from "../types";

const AUTH_KEY = "cms-auth";
const THEME_KEY = "cms-theme";

export const authStorage = {
  get(): AuthResponse | null {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  },
  set(value: AuthResponse) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(value));
    localStorage.removeItem(AUTH_KEY);
  },
  clear() {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
  }
};

export const themeStorage = {
  get() {
    return localStorage.getItem(THEME_KEY) || "light";
  },
  set(value: "light" | "dark") {
    localStorage.setItem(THEME_KEY, value);
  }
};
