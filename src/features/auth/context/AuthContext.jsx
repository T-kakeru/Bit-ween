import { createContext, useContext, useMemo, useState } from "react";
import baseUsers from "@/shared/data/mock/users.json";

const AUTH_TOKEN_KEY = "bit_ween.auth.token";
const AUTH_USER_KEY = "bit_ween.auth.user";
const SYSTEM_USERS_KEY = "bit_ween.system_users";
const AUTH_LOGGED_OUT_KEY = "bit_ween.auth.logged_out";

const AuthContext = createContext(null);

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  return safeParse(raw, null);
};

const readStoredToken = () => {
  if (typeof window === "undefined") return "";
  return String(window.localStorage.getItem(AUTH_TOKEN_KEY) || "");
};

const readSystemUsers = () => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SYSTEM_USERS_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};
const readBaseUsers = () => {
  const parsed = safeParse(JSON.stringify(baseUsers), []);
  return Array.isArray(parsed) ? parsed : [];
};

const findUserByEmail = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const systemUsers = readSystemUsers();
  const matchedSystemUser = systemUsers.find((u) => String(u?.email || "").trim().toLowerCase() === normalized);
  if (matchedSystemUser) return matchedSystemUser;

  const users = readBaseUsers();
  return users.find((u) => String(u?.email || "").trim().toLowerCase() === normalized) || null;
};

const buildSessionUser = (systemUser, email) => ({
  id: String(systemUser?.id || "session-user"),
  email: String(email || systemUser?.email || "").trim().toLowerCase(),
  displayName: String(systemUser?.display_name || systemUser?.employee_name || systemUser?.name || "山田 一郎").trim(),
  role: String(systemUser?.role || "admin").trim().toLowerCase(),
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const writeLoggedOutFlag = (value) => {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(AUTH_LOGGED_OUT_KEY, "1");
    return;
  }
  window.localStorage.removeItem(AUTH_LOGGED_OUT_KEY);
};

const buildDevDefaultSession = () => {
  const defaultEmail = "yamada.ichiro@bitween.local";
  const userFromSystem = findUserByEmail(defaultEmail);
  const nextUser = buildSessionUser(userFromSystem, defaultEmail);
  const nextToken = `dev-token-${Date.now()}`;
  return { token: nextToken, user: nextUser };
};

const readInitialSession = () => {
  const storedToken = readStoredToken();
  const storedUser = readStoredUser();

  if (storedToken && storedUser) {
    return { token: storedToken, user: storedUser };
  }

  return buildDevDefaultSession();
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readInitialSession());
  const { token, user } = session;

  const setSessionState = (nextToken, nextUser) => {
    setSession({ token: nextToken, user: nextUser });
  };

  const persistSession = (nextToken, nextUser) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    writeLoggedOutFlag(false);
  };

  const clearSession = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  };

  const login = async ({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawPassword = String(password || "");

    await wait(600);

    const userFromSystem = findUserByEmail(normalizedEmail);
    const isSeedAdmin = normalizedEmail === "admin@bitween.local";
    const isDefaultPassword = rawPassword === "Password@123";

    if (!normalizedEmail || !rawPassword) {
      return { ok: false, message: "メールアドレスまたはパスワードが間違っています" };
    }

    const canLogin = isDefaultPassword && (Boolean(userFromSystem) || isSeedAdmin);
    if (!canLogin) {
      return { ok: false, message: "メールアドレスまたはパスワードが間違っています" };
    }

    const nextUser = buildSessionUser(userFromSystem, normalizedEmail);
    const nextToken = `token-${Date.now()}`;

    setSessionState(nextToken, nextUser);
    persistSession(nextToken, nextUser);

    return { ok: true, user: nextUser };
  };

  const logout = () => {
    setSessionState("", null);
    clearSession();
    writeLoggedOutFlag(true);

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/login");
    }
  };

  const requestPasswordReset = async ({ email }) => {
    await wait(500);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return { ok: false, message: "メールアドレスを入力してください" };
    }
    return { ok: true };
  };

  const resetPassword = async ({ password }) => {
    await wait(500);
    if (!String(password || "")) {
      return { ok: false, message: "パスワードを入力してください" };
    }
    return { ok: true };
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(token && user),
      login,
      logout,
      requestPasswordReset,
      resetPassword,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
