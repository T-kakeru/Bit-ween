import type { ManagerRowInput } from "@/features/addRetirement/hooks/useManagerAddForm";

export type EmployeeCredentials = {
  initialPassword: string;
  copyText: string;
};

// ランダム文字列生成（パスワード用）
const buildRandomString = (length: number): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const max = chars.length;

  // ランダムに文字列を生成
  try {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars[bytes[i] % max];
    }
    return out;
  } catch {
    // fallback
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars[Math.floor(Math.random() * max)];
    }
    return out;
  }
};

export const buildEmployeeCredentials = (payload: ManagerRowInput): EmployeeCredentials => {
  const employeeName = String(payload?.["名前"] ?? "").trim();
  const employeeId = String(payload?.["社員ID"] ?? "").trim();

  const initialPassword = buildRandomString(10);

  const copyText = [
    `${employeeName || "新規社員"} 様`,
    "",
    "アカウントを作成しました。以下の情報でログインしてください。",
    "",
    `社員ID: ${employeeId || "(未入力)"}`,
    `初期パスワード: ${initialPassword}`,
    "",
    "※初回ログイン後、パスワードの変更をお願いします。",
  ].join("\n");

  return { initialPassword, copyText };
};
