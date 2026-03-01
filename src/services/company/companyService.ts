import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";
import { supabaseClient } from "@/services/common/supabaseClient";

const toText = (value: unknown) => String(value ?? "").trim();

let cachedCompanyName: string | null = null;
let cachedCompanyId: string | null = null;
let inflight: Promise<string | null> | null = null;

export const fetchCompanyName = async (companyId: string = DEFAULT_COMPANY_ID): Promise<string | null> => {
  const normalizedCompanyId = toText(companyId);
  if (!normalizedCompanyId) return null;

  if (cachedCompanyId === normalizedCompanyId && cachedCompanyName) {
    return cachedCompanyName;
  }

  if (!supabaseClient) return null;

  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabaseClient
      .from("companies")
      .select("company_name")
      .eq("id", normalizedCompanyId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.warn("[company] fetchCompanyName failed", error);
      }
      return null;
    }

    const name = toText((data as any)?.company_name);
    cachedCompanyId = normalizedCompanyId;
    cachedCompanyName = name || null;

    return cachedCompanyName;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
};
