import type { CatalogItem } from "@/shared/logic/catalogStorage";
import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { toCatalogItems } from "@/services/common/catalogNormalizer";
import { sortJaCatalogItems } from "@/services/common/catalogSorter";
import { logSupabaseErrorOnce } from "@/shared/errors/supabaseError";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

// DDL（docs/DDL/DDL_main1.sql）準拠
const DEPARTMENT_TABLE = "departments";

const fetchDepartmentsFromSupabase = async (): Promise<CatalogItem[] | null> => {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .select("id, name")
    .eq("company_id", DEFAULT_COMPANY_ID);
  if (error) return null;
  const normalized = toCatalogItems(data);
  return sortJaCatalogItems(normalized);
};

export const addDepartmentToSupabase = async (
  name: string
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return { ok: false, message: ERROR_MESSAGES.CATALOG.DEPARTMENT_NAME_REQUIRED_DOT };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  const { error } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .insert({ company_id: DEFAULT_COMPANY_ID, name: normalizedName });
  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.CATALOG.DEPARTMENT_CREATE_FAILED_DOT };
};

// 部署の更新は、部署名を変更するだけでなく、部署IDをもとに関連する従業員の部署名も更新する必要があるため、トランザクションで両方のテーブルを更新する
export const updateDepartmentInSupabase = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedId = String(id ?? "").trim();
  const normalizedName = String(name ?? "").trim();
  if (!normalizedId) return { ok: false, message: ERROR_MESSAGES.MASTER.DATA_NOT_FOUND };
  if (!normalizedName) return { ok: false, message: ERROR_MESSAGES.CATALOG.DEPARTMENT_NAME_REQUIRED_DOT };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  // データベースにて更新前の名称を検索するため、IDで更新対象を特定して名称を更新する
  const { error } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .update({ name: normalizedName })
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("id", normalizedId);

  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC };
};

// 部署は従業員の外部キーになっているため、部署を削除する際は関連する従業員の部署を空にする必要がある
export const deleteDepartmentFromSupabase = async (
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedId = String(id ?? "").trim();
  if (!normalizedId) return { ok: false, message: ERROR_MESSAGES.MASTER.DATA_NOT_FOUND };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  const { error } = await supabaseClient
    .from(DEPARTMENT_TABLE)
    .delete()
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("id", normalizedId);

  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC };
};

export const listDepartments = async (): Promise<CatalogItem[]> => {
  if (!supabaseClient) return [];

  try {
    const remote = await fetchDepartmentsFromSupabase();
    return remote ?? [];
  } catch (err) {
    logSupabaseErrorOnce({
      key: "departments:list",
      scope: "departmentService",
      action: "listDepartments",
      table: "departments",
      error: err,
    });
    return [];
  }
};

export const listDepartmentNames = async (): Promise<string[]> => {
  const items = await listDepartments();
  return items.map((x) => x.name);
};