import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";

const AUTH_USER_KEY = "bit_ween.auth.user";

type StoredAuthUserLike = {
  company_id?: unknown;
  companyId?: unknown;
};

const safeParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getSessionCompanyId = (): string => {
  if (typeof window === "undefined") return DEFAULT_COMPANY_ID;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return DEFAULT_COMPANY_ID;

  const parsed = safeParseJson(raw) as StoredAuthUserLike | null;
  if (!parsed) return DEFAULT_COMPANY_ID;

  const candidate = String(parsed.company_id ?? parsed.companyId ?? "").trim();
  return candidate || DEFAULT_COMPANY_ID;
};
