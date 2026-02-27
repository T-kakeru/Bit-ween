export type AppErrorKind = "Network" | "Timeout" | "Auth" | "Validation" | "Server" | "Unknown";

export type AppErrorDetails = {
  fields?: Record<string, string>;
  [key: string]: unknown;
};

export type AppError = Error & {
  kind: AppErrorKind;
  httpStatus?: number;
  code?: string;
  messageForUser: string;
  messageForDev: string;
  requestId?: string;
  traceId?: string;
  details?: AppErrorDetails;
  scope?: string;
  action?: string;
  endpoint?: string;
  raw?: unknown;
};

const toText = (value: unknown) => String(value ?? "");

const safeNumber = (value: unknown): number | undefined => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const inferKindFromStatus = (status?: number): AppErrorKind => {
  if (!status) return "Unknown";
  if (status === 401 || status === 403) return "Auth";
  if (status === 400 || status === 409 || status === 422) return "Validation";
  if (status >= 500) return "Server";
  return "Unknown";
};

const buildDevMessage = (parts: Array<string | undefined>) => parts.filter(Boolean).join(" ").trim();

export const isAppError = (error: unknown): error is AppError => {
  return Boolean(error) && typeof error === "object" && "kind" in (error as any) && "messageForUser" in (error as any);
};

export const normalizeError = ({
  error,
  requestId,
  scope,
  action,
  endpoint,
  fallbackMessageForUser = "処理に失敗しました。時間をおいて再試行してください。",
}: {
  error: unknown;
  requestId?: string;
  scope?: string;
  action?: string;
  endpoint?: string;
  fallbackMessageForUser?: string;
}): AppError => {
  if (isAppError(error)) return error;

  // AbortError はタイムアウト/キャンセル扱い
  const name = toText((error as any)?.name);
  if (name === "AbortError") {
    const err = Object.assign(new Error("通信がタイムアウトしました。"), {
      kind: "Timeout" as const,
      httpStatus: undefined,
      code: "timeout",
      messageForUser: "通信がタイムアウトしました。時間をおいて再試行してください。",
      messageForDev: buildDevMessage(["AbortError", scope, action, endpoint, requestId]),
      requestId,
      scope,
      action,
      endpoint,
      raw: error,
    });
    return err;
  }

  // fetch が失敗したときの典型（TypeError: Failed to fetch）
  if (name === "TypeError") {
    const msg = toText((error as any)?.message).toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed")) {
      const err = Object.assign(new Error("ネットワークエラーが発生しました。"), {
        kind: "Network" as const,
        code: "network",
        messageForUser: "ネットワークエラーが発生しました。接続状況を確認して再試行してください。",
        messageForDev: buildDevMessage([toText((error as any)?.message), scope, action, endpoint, requestId]),
        requestId,
        scope,
        action,
        endpoint,
        raw: error,
      });
      return err;
    }
  }

  // Supabase/PostgREST エラーっぽいオブジェクト
  const status = safeNumber((error as any)?.status);
  const code = toText((error as any)?.code).trim() || undefined;
  const message = toText((error as any)?.message).trim();
  const details = toText((error as any)?.details).trim();
  const hint = toText((error as any)?.hint).trim();
  if (message && (code || details || hint || status != null)) {
    const kind = inferKindFromStatus(status);
    const err = Object.assign(new Error(fallbackMessageForUser), {
      kind,
      httpStatus: status,
      code,
      messageForUser: fallbackMessageForUser,
      messageForDev: buildDevMessage([
        status != null ? `status=${status}` : undefined,
        code ? `code=${code}` : undefined,
        message ? `message=${message}` : undefined,
        details ? `details=${details}` : undefined,
        hint ? `hint=${hint}` : undefined,
        scope,
        action,
        endpoint,
        requestId,
      ]),
      requestId,
      scope,
      action,
      endpoint,
      raw: error,
    });
    return err;
  }

  // 汎用
  const genericMessage = message || toText(error);
  const err = Object.assign(new Error(fallbackMessageForUser), {
    kind: "Unknown" as const,
    code: undefined,
    messageForUser: fallbackMessageForUser,
    messageForDev: buildDevMessage([genericMessage, scope, action, endpoint, requestId]),
    requestId,
    scope,
    action,
    endpoint,
    raw: error,
  });
  return err;
};
