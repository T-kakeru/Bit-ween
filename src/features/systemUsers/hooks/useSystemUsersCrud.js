import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/services/common/supabaseClient";
import { getSessionCompanyId } from "@/services/common/sessionCompany";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const nowIso = () => new Date().toISOString();

const toText = (value) => String(value ?? "").trim();
const toEmail = (value) => toText(value).toLowerCase();

const isEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail(email));

const isRole = (role) => ["admin", "general"].includes(toText(role).toLowerCase());

const toSortableDisplayName = ({ employee_name, email }) => toText(employee_name || email);

const loadSystemUsersFromSupabase = async (companyId) => {
  if (!supabaseClient) return [];

  const resolvedCompanyId = toText(companyId) || getSessionCompanyId();

  const { data: users, error: usersError } = await supabaseClient
    .from("users")
    .select("id, company_id, employee_id, email, role, password, last_login_at, created_at, updated_at")
    .eq("company_id", resolvedCompanyId);
  if (usersError || !Array.isArray(users)) return [];

  const employeeIds = users
    .map((u) => toText(u?.employee_id))
    .filter(Boolean);

  const employeesById = new Map();
  if (employeeIds.length > 0) {
    const { data: employees } = await supabaseClient
      .from("employees")
      .select("id, employee_code, full_name")
      .in("id", employeeIds);
    if (Array.isArray(employees)) {
      employees.forEach((e) => {
        const id = toText(e?.id);
        if (!id) return;
        employeesById.set(id, {
          employee_code: toText(e?.employee_code),
          full_name: toText(e?.full_name),
        });
      });
    }
  }

  return users.map((u) => {
    const employeeId = toText(u?.employee_id);
    const emp = employeeId ? employeesById.get(employeeId) : null;

    const employeeCode = toText(emp?.employee_code);
    const employeeName = toText(emp?.full_name);

    return {
      id: toText(u?.id),
      company_id: toText(u?.company_id),
      employee_uuid: employeeId,
      employee_id: employeeCode,
      employee_name: employeeName,
      display_name: toSortableDisplayName({ employee_name: employeeName, email: u?.email }),
      email: toEmail(u?.email),
      role: toText(u?.role).toLowerCase(),
      // スキーマに is_enabled が無いので「常に有効」として扱う
      is_enabled: true,
      last_login_at: toText(u?.last_login_at),
      created_at: toText(u?.created_at),
      updated_at: toText(u?.updated_at),
    };
  });
};

const findEmployeeIdByEmployeeCode = async ({ employeeCode, companyId }) => {
  const code = toText(employeeCode);
  if (!code) return null;
  if (!supabaseClient) return null;

  const resolvedCompanyId = toText(companyId) || getSessionCompanyId();
  const { data, error } = await supabaseClient
    .from("employees")
    .select("id, departments!inner(company_id)")
    .eq("departments.company_id", resolvedCompanyId)
    .eq("employee_code", code)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return toText(data?.id) || null;
};

export const useSystemUsersCrud = ({ companyId } = {}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      const next = await loadSystemUsersFromSupabase(companyId);
      if (disposed) return;
      setUsers(Array.isArray(next) ? next : []);
    };
    void load();
    return () => {
      disposed = true;
    };
  }, [companyId]);

  const companyUsers = useMemo(() => {
    const id = toText(companyId);
    if (!id) return users;
    return users;
  }, [companyId, users]);

  const hasDuplicateCompanyEmail = ({ email, excludeId }) => {
    const targetEmail = toEmail(email);
    return companyUsers.some((u) => {
      if (excludeId && toText(u?.id) === toText(excludeId)) return false;
      return toEmail(u?.email) === targetEmail;
    });
  };

  const reload = async () => {
    const next = await loadSystemUsersFromSupabase(companyId);
    setUsers(Array.isArray(next) ? next : []);
  };

  const createUser = async ({ email, role, employeeCode, password }) => {
      const resolvedCompanyId = toText(companyId) || getSessionCompanyId();
    const normalizedEmail = toEmail(email);
    const normalizedRole = toText(role).toLowerCase();
    const rawPassword = toText(password);

    if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED };
    if (!isEmailFormat(normalizedEmail)) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.INVALID_EMAIL };
    if (!isRole(normalizedRole)) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.INVALID_ROLE };
    if (!rawPassword) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.PASSWORD_REQUIRED };
    if (hasDuplicateCompanyEmail({ email: normalizedEmail })) {
      return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.EMAIL_DUPLICATE };
    }

    const employeeId = await findEmployeeIdByEmployeeCode({ employeeCode, companyId: resolvedCompanyId });

    const { data, error } = await supabaseClient
      .from("users")
      .insert({
        company_id: resolvedCompanyId,
        employee_id: employeeId,
        email: normalizedEmail,
        password: rawPassword,
        role: normalizedRole,
        created_at: nowIso(),
        updated_at: nowIso(),
      })
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, message: error.message };

    await reload();
    return { ok: true, user: { id: toText(data?.id) } };
  };

  const updateUser = async (id, patch) => {
    if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED };

    const resolvedCompanyId = toText(companyId) || getSessionCompanyId();

    const userId = toText(id);
    if (!userId) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.USER_NOT_FOUND };

    const nextEmail = patch?.email != null ? toEmail(patch.email) : "";
    const nextRole = patch?.role != null ? toText(patch.role).toLowerCase() : "";
    const nextEmployeeCode = patch?.employee_id != null ? toText(patch.employee_id) : "";

    if (nextEmail && !isEmailFormat(nextEmail)) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.INVALID_EMAIL };
    if (nextRole && !isRole(nextRole)) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.INVALID_ROLE };
    if (nextEmail && hasDuplicateCompanyEmail({ email: nextEmail, excludeId: userId })) {
      return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.EMAIL_DUPLICATE };
    }

    const employeeId = nextEmployeeCode
      ? await findEmployeeIdByEmployeeCode({ employeeCode: nextEmployeeCode, companyId: resolvedCompanyId })
      : null;
    if (nextEmployeeCode && !employeeId) {
      return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.EMPLOYEE_CODE_NOT_FOUND };
    }

    const payload = {
      updated_at: nowIso(),
    };
    if (nextEmail) payload.email = nextEmail;
    if (nextRole) payload.role = nextRole;
    if (patch?.employee_id != null) payload.employee_id = employeeId;

    const { error } = await supabaseClient
      .from("users")
      .update(payload)
      .eq("company_id", resolvedCompanyId)
      .eq("id", userId);
    if (error) return { ok: false, message: error.message };

    await reload();
    return { ok: true };
  };

  const removeUser = async (id) => {
    if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED };
    const resolvedCompanyId = toText(companyId) || getSessionCompanyId();
    const userId = toText(id);
    if (!userId) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.USER_NOT_FOUND };

    const { error } = await supabaseClient
      .from("users")
      .delete()
      .eq("company_id", resolvedCompanyId)
      .eq("id", userId);
    if (error) return { ok: false, message: error.message };
    await reload();
    return { ok: true };
  };

  const setSystemUserEnabled = async () => {
    // DDLにis_enabledが無いため、現状は「常に有効」で固定
    return { ok: true };
  };

  const resetSystemUserPassword = async (id) => {
    if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED };
    const resolvedCompanyId = toText(companyId) || getSessionCompanyId();
    const userId = toText(id);
    if (!userId) return { ok: false, message: ERROR_MESSAGES.SYSTEM_USERS.ACCOUNT_NOT_FOUND };

    const nextPassword = "Password@123";
    const { error } = await supabaseClient
      .from("users")
      .update({ password: nextPassword, updated_at: nowIso() })
      .eq("company_id", resolvedCompanyId)
      .eq("id", userId);
    if (error) return { ok: false, message: error.message };
    await reload();
    return { ok: true, message: `初期パスワードを ${nextPassword} に再設定しました` };
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
