import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const AUTH_TOKEN_KEY = "bit_ween.auth.token";
const AUTH_USER_KEY = "bit_ween.auth.user";
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

const readLoggedOutFlag = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_LOGGED_OUT_KEY) === "1";
};

const toText = (value) => String(value ?? "").trim();

const buildSessionUser = ({ id, email, displayName, role }) => ({
  id: toText(id || "session-user"),
  email: toText(email).toLowerCase(),
  displayName: toText(displayName || email || ""),
  role: toText(role || "general").toLowerCase(),
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

const readInitialSession = () => {
  const storedToken = readStoredToken();
  const storedUser = readStoredUser();

  if (storedToken && storedUser) {
    return { token: storedToken, user: storedUser };
  }

  return { token: "", user: null };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readInitialSession());
  const [isInitializing, setIsInitializing] = useState(true);
  const [initMessage, setInitMessage] = useState("");
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

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const rawPassword = String(password || "");

    await wait(600);

    if (!normalizedEmail || !rawPassword) {
      return { ok: false, message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    if (!supabaseClient) {
      return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_SUPABASE_ENV };
    }

    // users テーブルで認証（Supabase Authは未使用の前提）
    const { data: userRows, error: userError } = await supabaseClient
      .from("users")
      .select("id, company_id, employee_id, email, password, role")
      .eq("company_id", DEFAULT_COMPANY_ID)
      .eq("email", normalizedEmail)
      .limit(1);

    if (userError) {
      if (import.meta.env.DEV) {
        // 開発時のみ: DB接続/RLS/テーブル不整合などの原因を追いやすくする
        console.warn("[auth] users fetch error", userError);
      }
      return { ok: false, message: ERROR_MESSAGES.AUTH.USERS_FETCH_FAILED };
    }

    const userRow = Array.isArray(userRows) ? userRows[0] : null;

    if (!userRow) {
      return { ok: false, message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    const expectedPassword = String(userRow.password ?? "");
    if (!expectedPassword || rawPassword !== expectedPassword) {
      return { ok: false, message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    let displayName = normalizedEmail;
    const employeeId = toText(userRow.employee_id);
    if (employeeId) {
      const { data: employeeRow } = await supabaseClient
        .from("employees")
        .select("full_name")
        .eq("id", employeeId)
        .maybeSingle();
      const fullName = toText(employeeRow?.full_name);
      if (fullName) displayName = fullName;
    }

    const nextUser = buildSessionUser({
      id: userRow.id,
      email: userRow.email,
      displayName,
      role: userRow.role,
    });

    const nextToken = `token-${Date.now()}`;

    setSessionState(nextToken, nextUser);
    persistSession(nextToken, nextUser);

    return { ok: true, user: nextUser };
  }, []);

  useEffect(() => {
    let disposed = false;

    const run = async () => {
      if (disposed) return;

      // 既にセッション復元済みなら即完了
      if (token && user) {
        setIsInitializing(false);
        return;
      }

      if (typeof window === "undefined") {
        setIsInitializing(false);
        return;
      }

      // 本番は自動ログインしない
      if (!import.meta.env.DEV) {
        setIsInitializing(false);
        return;
      }

      const forceDevAutoLogin = String(import.meta.env.VITE_DEV_AUTO_LOGIN_FORCE ?? "").trim() === "1";
      if (readLoggedOutFlag() && !forceDevAutoLogin) {
        setIsInitializing(false);
        return;
      }

      if (!supabaseClient) {
        setInitMessage(ERROR_MESSAGES.AUTH.AUTO_LOGIN_SUPABASE_NOT_CONFIGURED);
        setIsInitializing(false);
        return;
      }

      // Supabase疎通確認（開発時のみ）
      try {
        const { data: companyRow, error: companyError } = await supabaseClient
          .from("companies")
          .select("id, company_name")
          .eq("id", DEFAULT_COMPANY_ID)
          .maybeSingle();

        if (companyError) {
          console.warn("[supabase] connectivity check failed (companies)", companyError);
        } else {
          console.info("[supabase] connectivity check ok (companies)", companyRow);
        }
      } catch (err) {
        console.warn("[supabase] connectivity check exception", err);
      }

      // devではデフォルトで自動ログインON。
      // 明示的にOFFにしたい場合は VITE_DEV_AUTO_LOGIN=0
      const autoLoginFlag = String(import.meta.env.VITE_DEV_AUTO_LOGIN ?? "").trim();
      const hasExplicitOff = autoLoginFlag === "0";
      const hasExplicitOn = autoLoginFlag === "1";

      const enabled =
        !hasExplicitOff &&
        (hasExplicitOn ||
          autoLoginFlag === "" ||
          Boolean(import.meta.env.VITE_DEV_AUTO_LOGIN_EMAIL) ||
          Boolean(import.meta.env.VITE_DEV_AUTO_LOGIN_PASSWORD));

      if (!enabled) {
        setIsInitializing(false);
        return;
      }

      const email = String(import.meta.env.VITE_DEV_AUTO_LOGIN_EMAIL || "test1@example.com")
        .trim()
        .toLowerCase();
      const password = String(import.meta.env.VITE_DEV_AUTO_LOGIN_PASSWORD || "testpassword1");

      if (import.meta.env.DEV) {
        console.info("[auth] dev auto-login start", { email, hasPassword: Boolean(password) });
      }

      const result = await login({ email, password });
      if (!result?.ok) {
        if (import.meta.env.DEV) {
          console.warn("[auth] dev auto-login failed", result);
        }
        setInitMessage(result?.message || ERROR_MESSAGES.AUTH.AUTO_LOGIN_FAILED);
      }

      setIsInitializing(false);
    };

    void run();
    return () => {
      disposed = true;
    };
  }, []);

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
      return { ok: false, message: ERROR_MESSAGES.AUTH.EMAIL_REQUIRED };
    }
    return { ok: true };
  };

  const resetPassword = async ({ password }) => {
    await wait(500);
    if (!String(password || "")) {
      return { ok: false, message: ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED };
    }
    return { ok: true };
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(token && user),
      isInitializing,
      initMessage,
      login,
      logout,
      requestPasswordReset,
      resetPassword,
    }),
    [token, user, isInitializing, initMessage]
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
