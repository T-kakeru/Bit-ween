import { createRequestId } from "@/shared/api/requestId";
import { normalizeError, type AppError } from "@/shared/api/error";

type FetchJsonArgs = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  scope?: string;
  action?: string;
};

const toJsonBody = (body: unknown): string | undefined => {
  if (body == null) return undefined;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

export const fetchJson = async <T = unknown>({
  url,
  method = "GET",
  headers,
  body,
  timeoutMs = 15000,
  scope = "api",
  action = "fetchJson",
}: FetchJsonArgs): Promise<{ data: T; requestId: string }> => {
  const requestId = createRequestId();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...(headers ?? {}),
      },
      body: method === "GET" || method === "HEAD" ? undefined : toJsonBody(body),
    });

    const contentType = String(res.headers.get("content-type") ?? "");
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      let payload: any = null;
      try {
        payload = isJson ? await res.json() : await res.text();
      } catch {
        payload = null;
      }

      const normalized: AppError = normalizeError({
        error: {
          status: res.status,
          code: payload?.code,
          message: payload?.message ?? `HTTP ${res.status}`,
          details: payload?.details,
        },
        requestId,
        scope,
        action,
        endpoint: url,
        fallbackMessageForUser:
          res.status >= 500
            ? "サーバー側で問題が発生しました。時間をおいて再試行してください。"
            : "データの取得に失敗しました。入力や権限を確認してください。",
      });

      throw normalized;
    }

    const data = (isJson ? await res.json() : await res.text()) as T;
    return { data, requestId };
  } catch (error) {
    throw normalizeError({
      error,
      requestId,
      scope,
      action,
      endpoint: url,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};
