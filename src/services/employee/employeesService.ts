import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { logSupabaseErrorOnce } from "@/shared/errors/supabaseError";
import type { ManagerRow } from "@/features/retirement/types";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
import { buildNextEmployeeIdByJoinYear } from "@/features/addRetirement/logic/employeeId/buildNextEmployeeIdByJoinYear";

type EmployeeUiRecord = Record<string, any>;

export type CreateEmployeeInput = {
  employeeCode: string;
  fullName: string;
  gender?: string | null;
  birthDate?: string | null; // YYYY-MM-DD
  joinDate?: string | null; // YYYY-MM-DD
  retireDate?: string | null; // YYYY-MM-DD
  departmentName: string;
  workStatusName: string;
  clientName?: string | null;
  retirementReasonName?: string | null;
  retirementReasonText?: string | null;
  // CSV一括登録など、特定導線のみ部署未選択を許可する
  allowEmptyDepartment?: boolean;
};

// DDL（docs/DDL/DDL_main1.sql）に合わせてテーブル名は snake_case に固定する
// ※ ここを曖昧にすると「外れテーブル名を先に叩く → 404 が大量発生」というノイズになります
const EMPLOYEE_TABLE = "employees";
const DEPARTMENT_TABLE = "departments";
const CLIENT_TABLE = "clients";
const WORK_STATUS_TABLE = "work_statuses";
const RETIREMENT_REASON_TABLE = "retirement_reasons";
const DEFAULT_EMPTY_DEPARTMENT_NAME = "未設定";

const EMPTY_MAP = new Map<string, string>();

const toIsoDate = (value: unknown): string | null => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateSlash = (value: unknown): string | null => {
  const iso = toIsoDate(value);
  if (!iso) return null;
  return iso.replace(/-/g, "/");
};

const calcAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const nowMmdd = (now.getMonth() + 1) * 100 + now.getDate();
  const birthMmdd = (birth.getMonth() + 1) * 100 + birth.getDate();
  if (nowMmdd < birthMmdd) age -= 1;
  return age >= 0 ? age : null;
};

const calcTenureMonths = (joinDate: string | null, retireDate: string | null): number | null => {
  if (!joinDate) return null;
  const start = new Date(joinDate);
  const end = retireDate ? new Date(retireDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end.getTime() < start.getTime()) return 0;

  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * 12 + months;
};

const toRetireMonth = (retireDate: string | null): string | null => {
  if (!retireDate) return null;
  return retireDate.slice(0, 7).replace(/-/g, "/");
};

const fetchMasterNameMap = async (tableName: string): Promise<Map<string, string>> => {
  if (!supabaseClient) return EMPTY_MAP;

  const { data, error } = await supabaseClient.from(tableName).select("id, name");
  if (error) return EMPTY_MAP;
  if (!Array.isArray(data)) return EMPTY_MAP;

  const mapped = new Map<string, string>();
  for (const row of data) {
    const id = String((row as any)?.id ?? "").trim();
    const name = String((row as any)?.name ?? "").trim();
    if (!id || !name) continue;
    mapped.set(id, name);
  }
  return mapped;
};

const invertNameMap = (idToName: Map<string, string>): Map<string, string> => {
  const nameToId = new Map<string, string>();
  idToName.forEach((name, id) => {
    const key = String(name ?? "").trim();
    if (!key) return;
    if (!nameToId.has(key)) nameToId.set(key, id);
  });
  return nameToId;
};

const findOrCreateDepartmentIdByName = async (name: string): Promise<string | null> => {
  const normalized = String(name ?? "").trim();
  if (!normalized || !supabaseClient) return null;

  const { data: currentRows, error: currentError } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .select("id")
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("name", normalized)
    .limit(1);

  if (!currentError && Array.isArray(currentRows) && currentRows[0]?.id) {
    return String((currentRows[0] as any).id ?? "").trim() || null;
  }

  await supabaseClient.from(DEPARTMENT_TABLE).insert({ company_id: DEFAULT_COMPANY_ID, name: normalized });

  const { data: rowsAfterInsert, error: afterError } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .select("id")
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("name", normalized)
    .limit(1);

  if (!afterError && Array.isArray(rowsAfterInsert) && rowsAfterInsert[0]?.id) {
    return String((rowsAfterInsert[0] as any).id ?? "").trim() || null;
  }

  return null;
};

const toNullableIso = (value: unknown): string | null => {
  const iso = toIsoDate(value);
  return iso ? iso : null;
};

const fetchEmployeeCodesByJoinYear = async (joinDate: string | null): Promise<string[]> => {
  if (!supabaseClient) return [];

  const today = new Date();
  const raw = String(joinDate ?? "").trim();
  const normalized = raw.includes("/") ? raw.replaceAll("/", "-") : raw;
  const [y] = normalized.split("-");
  const joinYear = Number(y);
  const year = Number.isFinite(joinYear) && joinYear >= 1900 && joinYear <= 9999 ? joinYear : today.getFullYear();
  const year2 = String(year).slice(-2);
  const year4 = String(year);

  // 形式A: YYYY00001 / 形式B: YY-00001 の両方を拾う
  const { data, error } = await supabaseClient
    .from(EMPLOYEE_TABLE)
    .select("employee_code")
    .or(`employee_code.like.${year4}%,employee_code.like.${year2}-%`);

  if (error || !Array.isArray(data)) return [];
  return data
    .map((r: any) => String(r?.employee_code ?? "").trim())
    .filter((v: string) => v);
};

const isEmployeeCodeUsed = async (employeeCode: string): Promise<boolean> => {
  const code = String(employeeCode ?? "").trim();
  if (!code) return false;
  if (!supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from(EMPLOYEE_TABLE)
    .select("id")
    .eq("employee_code", code)
    .limit(1);

  if (error) return false;
  return Array.isArray(data) ? data.length > 0 : Boolean((data as any)?.id);
};

const resolveUniqueEmployeeCode = async ({
  desiredEmployeeCode,
  joinDate,
}: {
  desiredEmployeeCode: string;
  joinDate: string | null;
}): Promise<string> => {
  const desired = String(desiredEmployeeCode ?? "").trim();
  if (!desired) return desired;
  if (!supabaseClient) return desired;

  const used = await isEmployeeCodeUsed(desired);
  if (!used) return desired;

  const existingCodes = await fetchEmployeeCodesByJoinYear(joinDate);
  const rowsForBuild = existingCodes.map((code) => ({ "社員ID": code }));
  const next = buildNextEmployeeIdByJoinYear({ rows: rowsForBuild, joinDate: joinDate ?? "", today: new Date(), preferHyphen: true });
  return next;
};

const fetchEmployeeRows = async (): Promise<any[] | null> => {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient.from(EMPLOYEE_TABLE).select("*");
  if (error) return null;
  if (!Array.isArray(data)) return [];
  return data;
};

const toUiEmployee = ({
  row,
  departmentNameById,
  clientNameById,
  workStatusNameById,
  retirementReasonNameById,
}: {
  row: any;
  departmentNameById: Map<string, string>;
  clientNameById: Map<string, string>;
  workStatusNameById: Map<string, string>;
  retirementReasonNameById: Map<string, string>;
}): EmployeeUiRecord => {
  const dbId = String(row?.id ?? "").trim();
  const employeeCode = String(row?.employee_code ?? "").trim();
  const fullName = String(row?.full_name ?? "").trim();

  const joinDateIso = toIsoDate(row?.join_date);
  const retireDateIso = toIsoDate(row?.retire_date);
  const birthDateIso = toIsoDate(row?.birth_date);

  const departmentId = String(row?.department_id ?? "").trim();
  const clientId = String(row?.client_id ?? "").trim();
  const workStatusId = String(row?.work_status_id ?? "").trim();
  const retirementReasonId = String(row?.retirement_reason_id ?? "").trim();

  const retirementReasonText = String(row?.retirement_reason_text ?? "").trim();
  const retirementReason =
    retirementReasonNameById.get(retirementReasonId) || retirementReasonText || null;

  const isActive = retireDateIso == null;

  return {
    id: dbId,
    社員ID: employeeCode || dbId,
    名前: fullName,
    入社日: formatDateSlash(joinDateIso),
    退職日: formatDateSlash(retireDateIso),
    退職月: toRetireMonth(retireDateIso),
    在籍月数: calcTenureMonths(joinDateIso, retireDateIso),
    生年月日: formatDateSlash(birthDateIso),
    ステータス: workStatusNameById.get(workStatusId) ?? null,
    退職理由: retirementReason,
    当時のクライアント: clientNameById.get(clientId) ?? null,
    性別: String(row?.gender ?? "").trim() || null,
    年齢: calcAge(birthDateIso),
    is_active: isActive,
    部署: departmentNameById.get(departmentId) ?? null,
  };
};

const fetchEmployeesFromSupabase = async (): Promise<EmployeeUiRecord[] | null> => {
  const rows = await fetchEmployeeRows();
  if (rows == null) return null;

  const [departmentNameById, clientNameById, workStatusNameById, retirementReasonNameById] =
    await Promise.all([
      fetchMasterNameMap(DEPARTMENT_TABLE),
      fetchMasterNameMap(CLIENT_TABLE),
      fetchMasterNameMap(WORK_STATUS_TABLE),
      fetchMasterNameMap(RETIREMENT_REASON_TABLE),
    ]);

  return rows.map((row) =>
    toUiEmployee({
      row,
      departmentNameById,
      clientNameById,
      workStatusNameById,
      retirementReasonNameById,
    })
  );
};

export const listEmployees = async (): Promise<EmployeeUiRecord[]> => {
  if (!supabaseClient) return [];

  try {
    const remote = await fetchEmployeesFromSupabase();
    return remote ?? [];
  } catch (err) {
    // JSONへはフォールバックしない（DBのみで構成する）
    logSupabaseErrorOnce({
      key: "employees:list",
      scope: "employeesService",
      action: "listEmployees",
      table: "employees",
      error: err,
    });
    return [];
  }
};

export const createEmployee = async (
  input: CreateEmployeeInput
): Promise<{ ok: true; employee: EmployeeUiRecord } | { ok: false; message: string }> => {
  if (!supabaseClient) {
    return {
      ok: false,
      message: ERROR_MESSAGES.SYSTEM.SUPABASE_NOT_CONFIGURED_CREATE_EMPLOYEE,
    };
  }

  const requestedEmployeeCode = String(input.employeeCode ?? "").trim();
  const fullName = String(input.fullName ?? "").trim();
  const inputDepartmentName = String(input.departmentName ?? "").trim();
  const workStatusName = String(input.workStatusName ?? "").trim();
  const allowEmptyDepartment = input.allowEmptyDepartment === true;
  const departmentName = allowEmptyDepartment && !inputDepartmentName
    ? DEFAULT_EMPTY_DEPARTMENT_NAME
    : inputDepartmentName;

  if (!requestedEmployeeCode) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.EMPLOYEE_ID_REQUIRED };
  if (!fullName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.NAME_REQUIRED };
  if (!allowEmptyDepartment && !departmentName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.DEPARTMENT_REQUIRED };
  if (!workStatusName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.WORK_STATUS_REQUIRED };

  const joinDateRaw = String(input.joinDate ?? "").trim();
  const employeeCode = await resolveUniqueEmployeeCode({
    desiredEmployeeCode: requestedEmployeeCode,
    joinDate: joinDateRaw || null,
  });

  const [departmentNameById, clientNameById, workStatusNameById, retirementReasonNameById] =
    await Promise.all([
      fetchMasterNameMap(DEPARTMENT_TABLE),
      fetchMasterNameMap(CLIENT_TABLE),
      fetchMasterNameMap(WORK_STATUS_TABLE),
      fetchMasterNameMap(RETIREMENT_REASON_TABLE),
    ]);

  const departmentIdByName = invertNameMap(departmentNameById);
  const clientIdByName = invertNameMap(clientNameById);
  const workStatusIdByName = invertNameMap(workStatusNameById);
  const retirementReasonIdByName = invertNameMap(retirementReasonNameById);

  let departmentId = departmentName ? departmentIdByName.get(departmentName) ?? null : null;
  if (!departmentId && allowEmptyDepartment && departmentName === DEFAULT_EMPTY_DEPARTMENT_NAME) {
    departmentId = await findOrCreateDepartmentIdByName(DEFAULT_EMPTY_DEPARTMENT_NAME);
  }
  if (!departmentId) {
    return { ok: false, message: `部署「${departmentName}」がDB上で見つかりません` };
  }

  const workStatusId = workStatusIdByName.get(workStatusName);
  if (!workStatusId) {
    return { ok: false, message: `稼働状態「${workStatusName}」がDB上で見つかりません` };
  }

  const clientName = String(input.clientName ?? "").trim();
  const clientId = clientName ? clientIdByName.get(clientName) ?? null : null;

  const reasonName = String(input.retirementReasonName ?? "").trim();
  const retirementReasonId = reasonName ? retirementReasonIdByName.get(reasonName) ?? null : null;
  const retirementReasonText = retirementReasonId
    ? null
    : String(input.retirementReasonText ?? reasonName).trim() || null;

  const payload = {
    employee_code: employeeCode,
    full_name: fullName,
    gender: String(input.gender ?? "").trim() || null,
    birth_date: toNullableIso(input.birthDate),
    join_date: toNullableIso(input.joinDate),
    retire_date: toNullableIso(input.retireDate),
    retirement_reason_id: retirementReasonId,
    retirement_reason_text: retirementReasonText,
    department_id: departmentId,
    work_status_id: workStatusId,
    client_id: clientId,
  };

  const { data, error } = await supabaseClient
    .from(EMPLOYEE_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { ok: false, message: error.message || ERROR_MESSAGES.EMPLOYEE.CREATE_FAILED };
  }

  if (!data) {
    return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.CREATE_RESULT_FETCH_FAILED };
  }

  const employee = toUiEmployee({
    row: data,
    departmentNameById,
    clientNameById,
    workStatusNameById,
    retirementReasonNameById,
  });

  return { ok: true, employee };
};

export type UpdateEmployeeInput = {
  originalEmployeeId: string;
  originalEmployeeCode: string;
  employeeCode: string;
  fullName: string;
  gender?: string | null;
  birthDate?: string | null;
  joinDate?: string | null;
  retireDate?: string | null;
  departmentName: string;
  workStatusName: string;
  clientName?: string | null;
  retirementReasonName?: string | null;
  retirementReasonText?: string | null;
};

export const updateEmployee = async (
  input: UpdateEmployeeInput
): Promise<{ ok: true; employee: EmployeeUiRecord } | { ok: false; message: string }> => {
  if (!supabaseClient) {
    return {
      ok: false,
      message: ERROR_MESSAGES.SYSTEM.SUPABASE_NOT_CONFIGURED_UPDATE_EMPLOYEE,
    };
  }

  const originalEmployeeId = String(input.originalEmployeeId ?? "").trim();
  const originalEmployeeCode = String(input.originalEmployeeCode ?? "").trim();
  const employeeCode = String(input.employeeCode ?? "").trim();
  const fullName = String(input.fullName ?? "").trim();
  const departmentName = String(input.departmentName ?? "").trim();
  const workStatusName = String(input.workStatusName ?? "").trim();

  if (!originalEmployeeId) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.UPDATE_TARGET_EMPLOYEE_ID_REQUIRED };
  if (!employeeCode) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.EMPLOYEE_ID_REQUIRED };
  if (!fullName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.NAME_REQUIRED };
  if (!departmentName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.DEPARTMENT_REQUIRED };
  if (!workStatusName) return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.WORK_STATUS_REQUIRED };

  const [departmentNameById, clientNameById, workStatusNameById, retirementReasonNameById] =
    await Promise.all([
      fetchMasterNameMap(DEPARTMENT_TABLE),
      fetchMasterNameMap(CLIENT_TABLE),
      fetchMasterNameMap(WORK_STATUS_TABLE),
      fetchMasterNameMap(RETIREMENT_REASON_TABLE),
    ]);

  const departmentIdByName = invertNameMap(departmentNameById);
  const clientIdByName = invertNameMap(clientNameById);
  const workStatusIdByName = invertNameMap(workStatusNameById);
  const retirementReasonIdByName = invertNameMap(retirementReasonNameById);

  const departmentId = departmentIdByName.get(departmentName);
  if (!departmentId) {
    return { ok: false, message: `部署「${departmentName}」がDB上で見つかりません` };
  }

  const workStatusId = workStatusIdByName.get(workStatusName);
  if (!workStatusId) {
    return { ok: false, message: `稼働状態「${workStatusName}」がDB上で見つかりません` };
  }

  const clientName = String(input.clientName ?? "").trim();
  const clientId = clientName ? clientIdByName.get(clientName) ?? null : null;

  const reasonName = String(input.retirementReasonName ?? "").trim();
  const retirementReasonId = reasonName ? retirementReasonIdByName.get(reasonName) ?? null : null;
  const retirementReasonText = retirementReasonId
    ? null
    : String(input.retirementReasonText ?? reasonName).trim() || null;

  const payload = {
    employee_code: employeeCode,
    full_name: fullName,
    gender: String(input.gender ?? "").trim() || null,
    birth_date: toNullableIso(input.birthDate),
    join_date: toNullableIso(input.joinDate),
    retire_date: toNullableIso(input.retireDate),
    retirement_reason_id: retirementReasonId,
    retirement_reason_text: retirementReasonText,
    department_id: departmentId,
    work_status_id: workStatusId,
    client_id: clientId,
  };

  const { data, error } = await supabaseClient
    .from(EMPLOYEE_TABLE)
    .update(payload)
    .eq("id", originalEmployeeId)
    .select("*")
    .single();

  if (error) {
    return { ok: false, message: error.message || ERROR_MESSAGES.EMPLOYEE.UPDATE_FAILED };
  }

  if (!data) {
    return { ok: false, message: ERROR_MESSAGES.EMPLOYEE.UPDATE_RESULT_FETCH_FAILED };
  }

  const employee = toUiEmployee({
    row: data,
    departmentNameById,
    clientNameById,
    workStatusNameById,
    retirementReasonNameById,
  });

  return { ok: true, employee };
};

export type ImportManagerRowsResult =
  | { ok: true; count?: number }
  | { ok: false; message: string };

const normalizeCsvCell = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text || text === "-") return "";
  return text;
};

export const importEmployeesFromManagerRows = async (
  rows: ManagerRow[]
): Promise<ImportManagerRowsResult> => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, message: "取り込み対象のデータがありません。" };
  }

  // 未接続時はDB登録を行わず、UI側ローカル反映で完了扱い
  if (!supabaseClient) {
    return { ok: true, count: rows.length };
  }

  for (const row of rows) {
    const employeeCode = normalizeCsvCell((row as any)?.["社員ID"]);
    const fullName = normalizeCsvCell((row as any)?.["名前"]);
    const gender = normalizeCsvCell((row as any)?.["性別"]);
    const birthDate = normalizeCsvCell((row as any)?.["生年月日"]);
    const joinDate = normalizeCsvCell((row as any)?.["入社日"]);
    const retireDate = normalizeCsvCell((row as any)?.["退職日"]);
    const departmentName = normalizeCsvCell((row as any)?.["部署"]);
    const workStatusName = normalizeCsvCell((row as any)?.["ステータス"]);
    const clientName = normalizeCsvCell((row as any)?.["当時のクライアント"]);
    const retirementReason = normalizeCsvCell((row as any)?.["退職理由"]);

    const result = await createEmployee({
      employeeCode,
      fullName,
      gender: gender || null,
      birthDate: birthDate || null,
      joinDate: joinDate || null,
      retireDate: retireDate || null,
      departmentName,
      workStatusName,
      clientName: clientName || null,
      retirementReasonName: retirementReason || null,
      retirementReasonText: retirementReason || null,
      allowEmptyDepartment: true,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: `社員ID:${employeeCode || "(未設定)"} の登録に失敗しました。${result.message}`,
      };
    }
  }

  return { ok: true, count: rows.length };
};

// エラーは、""で返す（例: 存在しない社員コードを指定 → null を返す）"
export const findEmployeeIdByEmployeeCode = async (employeeCode: string): Promise<string | null> => {
  const code = String(employeeCode ?? "").trim();
  if (!code) return null;
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from(EMPLOYEE_TABLE)
    .select("id")
    .eq("employee_code", code)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const id = String((data as any)?.id ?? "").trim();
  return id || null;
};