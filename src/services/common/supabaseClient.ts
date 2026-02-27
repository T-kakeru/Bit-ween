import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_COMPANY_ID } from "@/services/common/defaultCompany";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

const hasSupabaseEnv = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabaseClient: SupabaseClient | null = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => hasSupabaseEnv;

export const requireSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new Error(
      "Supabase が未設定です（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を確認してください）。"
    );
  }
  return supabaseClient;
};

type ProbeUsersReadOneResult =
  | {
      ok: true;
      data: {
        id: string;
        email: string;
        company_id: string;
        role: string;
      } | null;
    }
  | {
      ok: false;
      errorMessage: string;
      errorCode?: string;
      errorDetails?: string;
    };

export const probeUsersReadOne = async (
  email = "test1@example.com"
): Promise<ProbeUsersReadOneResult> => {
  if (!supabaseClient) {
    return {
      ok: false,
      errorMessage:
        "Supabase未設定です。VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を確認してください。",
    };
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const { data, error } = await supabaseClient
    .from("users")
    .select("id, email, company_id, role")
    .eq("company_id", DEFAULT_COMPANY_ID)
    .eq("email", normalizedEmail)
    .limit(1);

  if (error) {
    return {
      ok: false,
      errorMessage: String(error.message || "users テーブルの取得に失敗しました。"),
      errorCode: String(error.code || ""),
      errorDetails: String(error.details || ""),
    };
  }

  const first = Array.isArray(data) ? data[0] : null;

  return {
    ok: true,
    data: first
      ? {
          id: String(first.id ?? ""),
          email: String(first.email ?? ""),
          company_id: String(first.company_id ?? ""),
          role: String(first.role ?? ""),
        }
      : null,
  };
};