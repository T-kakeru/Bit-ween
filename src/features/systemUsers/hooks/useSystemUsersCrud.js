import { useMemo, useState } from "react";

const STORAGE_KEY = "bit_ween.system_users";

const nowIso = () => new Date().toISOString();

const toText = (value) => String(value ?? "").trim();
const toEmail = (value) => toText(value).toLowerCase();

const SEED_SYSTEM_USERS = [
  {
    id: "seed-admin-1",
    company_id: "company-default",
    employee_id: "26-0001",
    employee_name: "山田 一郎",
    display_name: "山田 一郎",
    email: "yamada.ichiro@bitween.local",
    password: "Password@123",
    role: "admin",
    is_enabled: true,
    last_login_at: "2026-02-16T08:20:00.000Z",
    created_at: "2025-08-01T09:00:00.000Z",
    updated_at: "2026-02-16T08:20:00.000Z",
  },
  {
    id: "seed-member-1",
    company_id: "company-default",
    employee_id: "26-0021",
    employee_name: "佐藤 花子",
    display_name: "佐藤 花子",
    email: "member@bitween.local",
    role: "general",
    is_enabled: true,
    last_login_at: "2026-02-14T22:30:00.000Z",
    created_at: "2025-10-10T09:00:00.000Z",
    updated_at: "2026-02-14T22:30:00.000Z",
  },
  {
    id: "seed-member-2",
    company_id: "company-default",
    employee_id: "",
    employee_name: "",
    display_name: "監査閲覧アカウント",
    email: "auditor@bitween.local",
    role: "general",
    is_enabled: false,
    last_login_at: "",
    created_at: "2025-12-01T09:00:00.000Z",
    updated_at: "2026-01-05T01:00:00.000Z",
  },
];

const readUsers = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_SYSTEM_USERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SYSTEM_USERS;
  } catch {
    return SEED_SYSTEM_USERS;
  }
};

const writeUsers = (items) => {
  if (typeof window === "undefined") return;
  try {
    const next = Array.isArray(items) ? items : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // no-op
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `usr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const isEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail(email));

const isRole = (role) => ["admin", "general"].includes(toText(role).toLowerCase());

export const useSystemUsersCrud = ({ companyId = "company-default" } = {}) => {
  const [users, setUsers] = useState(() => readUsers());

  const companyUsers = useMemo(
    () => users.filter((u) => toText(u?.company_id) === toText(companyId)),
    [companyId, users]
  );

  const saveUsers = (next) => {
    setUsers(next);
    writeUsers(next);
  };

  const hasDuplicateCompanyEmail = ({ email, excludeId }) => {
    const targetEmail = toEmail(email);
    const targetCompany = toText(companyId);
    return companyUsers.some((u) => {
      if (excludeId && toText(u?.id) === toText(excludeId)) return false;
      return toText(u?.company_id) === targetCompany && toEmail(u?.email) === targetEmail;
    });
  };

  const createUser = ({ email, role, employeeCode, employeeName, displayName }) => {
    const normalizedEmail = toEmail(email);
    const normalizedRole = toText(role).toLowerCase();

    if (!isEmailFormat(normalizedEmail)) {
      return { ok: false, message: "メールアドレスの形式が正しくありません" };
    }
    if (!isRole(normalizedRole)) {
      return { ok: false, message: "role は admin / general のみです" };
    }
    if (hasDuplicateCompanyEmail({ email: normalizedEmail })) {
      return { ok: false, message: "同一テナント内で email が重複しています" };
    }

    const next = {
      id: createId(),
      company_id: toText(companyId),
      employee_id: toText(employeeCode),
      email: normalizedEmail,
      role: normalizedRole,
      employee_name: toText(employeeName),
      display_name: toText(displayName || employeeName || normalizedEmail.split("@")[0]),
      is_enabled: true,
      last_login_at: "",
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const merged = [...users, next];
    saveUsers(merged);
    return { ok: true, user: next };
  };

  const updateUser = (id, patch) => {
    const target = companyUsers.find((u) => toText(u?.id) === toText(id));
    if (!target) return { ok: false, message: "対象ユーザーが見つかりません" };

    const nextEmail = patch?.email != null ? toEmail(patch.email) : toEmail(target.email);
    const nextRole = patch?.role != null ? toText(patch.role).toLowerCase() : toText(target.role).toLowerCase();

    if (!isEmailFormat(nextEmail)) return { ok: false, message: "メールアドレスの形式が正しくありません" };
    if (!isRole(nextRole)) return { ok: false, message: "role は admin / general のみです" };
    if (hasDuplicateCompanyEmail({ email: nextEmail, excludeId: id })) {
      return { ok: false, message: "同一テナント内で email が重複しています" };
    }

    const merged = users.map((u) => {
      if (toText(u?.id) !== toText(id)) return u;
      return {
        ...u,
        email: nextEmail,
        role: nextRole,
        display_name: patch?.display_name != null ? toText(patch.display_name) : u.display_name,
        employee_id: patch?.employee_id != null ? toText(patch.employee_id) : u.employee_id,
        updated_at: nowIso(),
      };
    });

    saveUsers(merged);
    return { ok: true };
  };

  const removeUser = (id) => {
    const merged = users.filter((u) => toText(u?.id) !== toText(id));
    saveUsers(merged);
    return { ok: true };
  };

  const setSystemUserEnabled = (id, enabled) => {
    const merged = users.map((u) => {
      if (toText(u?.id) !== toText(id)) return u;
      return {
        ...u,
        is_enabled: Boolean(enabled),
        updated_at: nowIso(),
      };
    });
    saveUsers(merged);
    return { ok: true };
  };

  const resetSystemUserPassword = (id) => {
    const target = companyUsers.find((u) => toText(u?.id) === toText(id));
    if (!target) return { ok: false, message: "対象利用者が見つかりません" };
    return { ok: true, message: `利用者 ${toText(target.display_name || target.email)} に再設定案内を送信しました` };
  };

  return {
    users: companyUsers,
    createUser,
    updateUser,
    removeUser,
    setSystemUserEnabled,
    resetSystemUserPassword,
  };
};
