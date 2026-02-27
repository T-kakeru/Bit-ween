import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { sortJa } from "@/services/common/catalogSorter";
import { addDepartmentToSupabase, listDepartmentNames } from "@/services/department/departmentService";
import { addClientToSupabase, listClientNames } from "@/services/client/clientService";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";
type CatalogKey = "departments" | "clients" | "workStatuses";

const normalizeName = (value: unknown) => String(value ?? "").trim();

const listNamesFromTable = async (tableName: string): Promise<string[]> => {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient.from(tableName).select("name");
  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return sortJa(
    data
      .map((row) => normalizeName((row as any)?.name))
      .filter(Boolean)
  );
};

const listCompanyScopedNamesFromTable = async (tableName: string): Promise<string[]> => {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from(tableName)
    .select("name")
    .eq("company_id", DEFAULT_COMPANY_ID);
  if (error) throw error;
  if (!Array.isArray(data)) return [];
  return sortJa(
    data
      .map((row) => normalizeName((row as any)?.name))
      .filter(Boolean)
  );
};

// 部署マスタの名前リストを取得
export const fetchDepartmentNames = async (): Promise<string[]> => {
  return listDepartmentNames();
};

// クライアントマスタの名前リストを取得
export const fetchClientNames = async (): Promise<string[]> => {
  return listClientNames();
};

// 勤務ステータスマスタの名前リストを取得
export const fetchWorkStatusNames = async (): Promise<string[]> => {
  try {
    return await listNamesFromTable("work_statuses");
  } catch (err) {
    console.error("[fetchWorkStatusNames] Supabaseからの取得に失敗しました", err);
    return [];
  }
};

// 退職理由マスタの名前リストを取得
export const fetchRetirementReasonNames = async (): Promise<string[]> => {
  try {
    return await listNamesFromTable("retirement_reasons");
  } catch (err) {
    console.error("[fetchRetirementReasonNames] Supabaseからの取得に失敗しました", err);
    return [];
  }
};

export const addCatalogOption = async ({
  keyName,
  value,
}: {
  keyName: Extract<CatalogKey, "departments" | "clients" | "workStatuses">;
  value: string;
}): Promise<string[]> => {
  const name = normalizeName(value);
  if (!name) return [];

  if (keyName === "departments") {
    await addDepartmentToSupabase(name);
    return await fetchDepartmentNames();
  }

  if (keyName === "clients") {
    await addClientToSupabase(name);
    return await fetchClientNames();
  }

  // 稼働状態は固定マスタのため追加不可
  if (keyName === "workStatuses") {
    console.warn("[addCatalogOption] workStatuses は固定データのため追加できません");
    return await fetchWorkStatusNames();
  }

  return [];
};

export const renameCatalogOption = async ({
  keyName,
  prevName,
  nextName,
}: {
  keyName: Extract<CatalogKey, "departments" | "clients" | "workStatuses">;
  prevName: string;
  nextName: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  const fromName = normalizeName(prevName);
  const toName = normalizeName(nextName);
  if (!fromName || !toName) return { ok: false, message: ERROR_MESSAGES.MASTER.NAME_REQUIRED };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED };

  if (keyName === "workStatuses") {
    return { ok: false, message: ERROR_MESSAGES.MASTER.WORK_STATUS_IMMUTABLE };
  }

  try {
    if (keyName === "departments") {
      const { error } = await supabaseClient
        .from("departments")
        .update({ name: toName })
        .eq("company_id", DEFAULT_COMPANY_ID)
        .eq("name", fromName);
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    }

    if (keyName === "clients") {
      const { error } = await supabaseClient
        .from("clients")
        .update({ name: toName })
        .eq("company_id", DEFAULT_COMPANY_ID)
        .eq("name", fromName);
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    }

   return { ok: false, message: ERROR_MESSAGES.MASTER.INVALID_KEY_NAME };
  } catch (err: any) {
   return { ok: false, message: String(err?.message ?? err ?? ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC) };
  }
};

export const deleteCatalogOption = async ({
  keyName,
  value,
}: {
  keyName: Extract<CatalogKey, "departments" | "clients" | "workStatuses">;
  value: string;
}): Promise<string[]> => {
  const name = normalizeName(value);
  if (!name) return [];
  if (!supabaseClient) return [];

  // 稼働状態は固定マスタのため削除不可
  if (keyName === "workStatuses") {
    console.warn("[deleteCatalogOption] workStatuses は固定データのため削除できません");
    return await fetchWorkStatusNames();
  }

  try {
    if (keyName === "departments") {
      await supabaseClient
        .from("departments")
        .delete()
        .eq("company_id", DEFAULT_COMPANY_ID)
        .eq("name", name);
      return await listCompanyScopedNamesFromTable("departments");
    }

    if (keyName === "clients") {
      await supabaseClient
        .from("clients")
        .delete()
        .eq("company_id", DEFAULT_COMPANY_ID)
        .eq("name", name);
      return await listCompanyScopedNamesFromTable("clients");
    }

    return await fetchWorkStatusNames();
  } catch (err) {
    console.error("[deleteCatalogOption] 削除に失敗しました", err);
    if (keyName === "departments") return await fetchDepartmentNames();
    if (keyName === "clients") return await fetchClientNames();
    return await fetchWorkStatusNames();
  }
};