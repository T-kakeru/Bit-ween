import type { CatalogItem } from "@/shared/logic/catalogStorage";
import { supabaseClient } from "@/services/common/supabaseClient";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { toCatalogItems } from "@/services/common/catalogNormalizer";
import { sortJaCatalogItems } from "@/services/common/catalogSorter";
import { logSupabaseErrorOnce } from "@/shared/errors/supabaseError";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

// DDL（docs/DDL/DDL_main1.sql）準拠
const CLIENT_TABLE = "clients";

const fetchClientsFromSupabase = async (): Promise<CatalogItem[] | null> => {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from(CLIENT_TABLE)
    .select("id, name")
    .eq("company_id", DEFAULT_COMPANY_ID);
  if (error) return null;
  const normalized = toCatalogItems(data);
  return sortJaCatalogItems(normalized);
};

export const listClients = async (): Promise<CatalogItem[]> => {
  if (!supabaseClient) return [];

  try {
    const remote = await fetchClientsFromSupabase();
    return remote ?? [];
  } catch (err) {
    logSupabaseErrorOnce({
      key: "clients:list",
      scope: "clientService",
      action: "listClients",
      table: "clients",
      error: err,
    });
    return [];
  }
};

export const listClientNames = async (): Promise<string[]> => {
  const items = await listClients();
  return items.map((x) => x.name);
};

export const addClientToSupabase = async (
  name: string
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return { ok: false, message: ERROR_MESSAGES.CATALOG.CLIENT_NAME_REQUIRED_DOT };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  const { error } = await supabaseClient
    .from(CLIENT_TABLE)
    .insert({ company_id: DEFAULT_COMPANY_ID, name: normalizedName });
  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.CATALOG.CLIENT_CREATE_FAILED_DOT };
};

export const updateClientInSupabase = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedId = String(id ?? "").trim();
  const normalizedName = String(name ?? "").trim();
  if (!normalizedId) return { ok: false, message: ERROR_MESSAGES.MASTER.DATA_NOT_FOUND };
  if (!normalizedName) return { ok: false, message: ERROR_MESSAGES.CATALOG.CLIENT_NAME_REQUIRED_DOT };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  const { error } = await supabaseClient
    .from(CLIENT_TABLE)
    .update({ name: normalizedName })
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("id", normalizedId);

  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC };
};

export const deleteClientFromSupabase = async (
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const normalizedId = String(id ?? "").trim();
  if (!normalizedId) return { ok: false, message: ERROR_MESSAGES.MASTER.DATA_NOT_FOUND };
  if (!supabaseClient) return { ok: false, message: ERROR_MESSAGES.SYSTEM.DB_NOT_CONFIGURED_DOT };

  const { error } = await supabaseClient
    .from(CLIENT_TABLE)
    .delete()
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("id", normalizedId);

  if (!error) return { ok: true };
  return { ok: false, message: error.message || ERROR_MESSAGES.SYSTEM.UPDATE_FAILED_GENERIC };
};