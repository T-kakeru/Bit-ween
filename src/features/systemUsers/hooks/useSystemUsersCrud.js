import { useMemo, useState } from "react";

const STORAGE_KEY = "bit_ween.system_users";

const nowIso = () => new Date().toISOString();

const toText = (value) => String(value ?? "").trim();
const toEmail = (value) => toText(value).toLowerCase();

const readUsers = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

  const createUser = ({ email, role, employeeCode, employeeName }) => {
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

  return {
    users: companyUsers,
    createUser,
    updateUser,
    removeUser,
  };
};
