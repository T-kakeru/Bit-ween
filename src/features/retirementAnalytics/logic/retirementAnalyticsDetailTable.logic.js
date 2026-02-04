import {
  buildAgeFromBirthDate,
  buildRetireMonthLabelFromRetireDate,
  buildTenureMonthsFromJoinAndRetireDates,
} from "@/features/retirement/logic/employeeEdit.logic";
import { MANAGER_EMPLOYEE_COLUMNS } from "@/features/retirement/logic/managerEmployeeTableColumns";

const getRaw = (row, key) => {
  if (!row || !key) return undefined;
  return row?.[key];
};

const buildComputedValue = (row, key) => {
  if (key === "退職月") {
    const retireDate = getRaw(row, "退職日") ?? row?.retirementDate;
    return buildRetireMonthLabelFromRetireDate(retireDate);
  }

  if (key === "年齢") {
    const birthDate = getRaw(row, "生年月日");
    return buildAgeFromBirthDate(birthDate);
  }

  if (key === "在籍月数") {
    const joinDate = getRaw(row, "入社日");
    const retireDate = getRaw(row, "退職日") ?? row?.retirementDate;
    return buildTenureMonthsFromJoinAndRetireDates(joinDate, retireDate);
  }

  return undefined;
};

const resolveValue = (row, key) => {
  const computed = buildComputedValue(row, key);
  if (computed !== undefined) return computed;

  const direct = getRaw(row, key);
  if (direct !== undefined) return direct;

  // 退職者分析の正規化フィールドがある場合のフォールバック
  if (key === "ステータス") return row?.status;
  if (key === "退職理由") return row?.reason;
  return undefined;
};

export const buildDetailTableRowsLikeManagerList = (rows = []) => {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((row, index) => {
    const id = row?.id ?? index + 1;
    const next = { id };

    for (const col of MANAGER_EMPLOYEE_COLUMNS) {
      next[col.key] = resolveValue(row, col.key);
    }

    return next;
  });
};
