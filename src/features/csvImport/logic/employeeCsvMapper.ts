import type { ManagerRow } from "@/features/retirement/types";
import type { EmployeeCsvNormalizedRow } from "../types";
import {
  buildAgeFromBirthDate,
  buildRetireMonthLabelFromRetireDate,
  buildTenureMonthsFromJoinAndRetireDates,
} from "@/features/retirement/logic/employeeEdit.logic";

const createRowId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `import-${Date.now()}-${Math.floor(performance.now())}`;
};

export const mapEmployeeCsvRowsToManagerRows = (rows: EmployeeCsvNormalizedRow[]): ManagerRow[] => {
  return rows.map((row) => {
    const joinDate = row.joinDate ?? "";
    const retirementDate = row.retirementDate ?? "";
    const birthDate = row.birthDate ?? "";

    return {
      id: createRowId(),
      退職月: buildRetireMonthLabelFromRetireDate(retirementDate),
      名前: row.name,
      入社日: joinDate || "-",
      退職日: retirementDate || "-",
      在籍月数: buildTenureMonthsFromJoinAndRetireDates(joinDate, retirementDate),
      ステータス: row.workStatus,
      退職理由: row.retirementReason,
      備考: row.remark,
      当時のクライアント: row.workLocation ?? "-",
      性別: row.gender,
      生年月日: birthDate || "-",
      年齢: buildAgeFromBirthDate(birthDate),
      社員ID: row.employeeId ?? "",
      部署: row.department ?? "",
    } satisfies ManagerRow;
  });
};
