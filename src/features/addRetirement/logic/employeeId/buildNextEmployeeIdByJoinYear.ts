type BuildNextEmployeeIdArgs = {
  rows: Array<Record<string, any>>;
  joinDate?: string;
  today?: Date;
  preferHyphen?: boolean;
};

const parseJoinYear = (joinDate: string | undefined | null, fallbackYear: number): number => {
  const raw = String(joinDate ?? "").trim();
  if (!raw) return fallbackYear;

  const normalized = raw.includes("/") ? raw.replaceAll("/", "-") : raw;
  const [y] = normalized.split("-");
  const year = Number(y);
  return Number.isFinite(year) && year >= 1900 && year <= 9999 ? year : fallbackYear;
};

/**
 * 入社年 + 連番で社員IDを採番する（デフォルトは `YY-00001` 形式）。
 * 既存の社員IDから、同じ入社年の連番最大値を抽出し +1 します。
 *
 * - 形式A: `YYYY00001`（例: `202600001`）
 * - 形式B: `YY-00001`（例: `26-00001`）
 */
export const buildNextEmployeeIdByJoinYear = ({
  rows,
  joinDate,
  today = new Date(),
  preferHyphen = true,
}: BuildNextEmployeeIdArgs): string => {
  const fallbackYear = today.getFullYear();
  const joinYear = parseJoinYear(joinDate, fallbackYear);
  const year2 = String(joinYear).slice(-2);
  const year4 = String(joinYear);

  let maxSerial = 0;

  for (const row of rows ?? []) {
    const raw = String((row as any)?.["社員ID"] ?? "").trim();
    if (!raw || raw === "-") continue;

    const mA = raw.match(/^(\d{4})(\d{5})$/);
    if (mA && mA[1] === year4) {
      const serial = Number(mA[2]);
      if (Number.isFinite(serial)) maxSerial = Math.max(maxSerial, serial);
      continue;
    }

    const mB = raw.match(/^(\d{2})-(\d{5})$/);
    if (mB && mB[1] === year2) {
      const serial = Number(mB[2]);
      if (Number.isFinite(serial)) maxSerial = Math.max(maxSerial, serial);
    }
  }

  const nextSerial = String(maxSerial + 1).padStart(5, "0");
  return preferHyphen ? `${year2}-${nextSerial}` : `${year4}${nextSerial}`;
};
