type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
};

import { createRequestId } from "@/shared/api/requestId";
import { normalizeError } from "@/shared/api/error";

const loggedKeys = new Set<string>();

const toText = (value: unknown) => String(value ?? "");

export const isSupabaseMissingTableError = (error: unknown): boolean => {
  const msg = toText((error as any)?.message).toLowerCase();
  // PostgREST がテーブル未存在のときに出しがちな文言
  return msg.includes("could not find the table") || msg.includes("schema cache") || msg.includes("not found");
};

export const formatSupabaseErrorForLog = (error: unknown): string => {
  const e = (error ?? {}) as SupabaseErrorLike;
  const parts = [
    e.status != null ? `status=${e.status}` : "",
    e.code ? `code=${e.code}` : "",
    e.message ? `message=${e.message}` : "",
    e.details ? `details=${e.details}` : "",
    e.hint ? `hint=${e.hint}` : "",
  ].filter(Boolean);
  return parts.join(" ") || toText(error);
};

export const logSupabaseErrorOnce = ({
  key,
  scope,
  action,
  table,
  error,
}: {
  key: string;
  scope: string;
  action: string;
  table?: string;
  error: unknown;
}) => {
  if (loggedKeys.has(key)) return;
  loggedKeys.add(key);

  const requestId = createRequestId();

  const base = `[supabase][${scope}] ${action}${table ? ` (${table})` : ""}`;
  const normalized = normalizeError({
    error,
    requestId,
    scope,
    action,
    endpoint: table ? `supabase:${table}` : "supabase",
    fallbackMessageForUser: "データの取得に失敗しました。時間をおいて再試行してください。",
  });
  const detail = normalized.messageForDev || formatSupabaseErrorForLog(error);

  if (isSupabaseMissingTableError(error)) {
    console.warn(`${base} テーブル未作成/名前不一致の可能性: ${detail}`);
    return;
  }

  console.error(`${base} 失敗: ${detail}`);
};
