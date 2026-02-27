import { z } from "zod";
import { trimmedStringMinMax } from "../shared/primitives";
import { managerAddMessages } from "./messages";
import { REASONS } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import { validateEmploymentStatusConsistency } from "@/shared/validation/employeeValidation";

const OPTIONAL_DATE = z
  .string()
  .trim()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "日付の形式が正しくありません" });

const EMPLOYEE_ID_MAX_LENGTH = 30;

export const managerAddSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (!v) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.employeeIdRequired });
        return;
      }
      if (v.length > EMPLOYEE_ID_MAX_LENGTH) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.employeeIdTooLong });
      }
    }),
  department: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (!v) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.departmentRequired });
      }
    }),
  name: trimmedStringMinMax({
    min: 2,
    max: 50,
    minMessage: managerAddMessages.nameTooShort,
    maxMessage: managerAddMessages.nameTooLong,
  }),
  employmentStatus: z.string().trim().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.employmentStatusRequired,
        params: { appErrorCode: "EMPLOYMENT_STATUS_REQUIRED" },
      });
      return;
    }
    if (v !== "在籍" && v !== "退職") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.employmentStatusInvalid,
        params: { appErrorCode: "EMPLOYMENT_STATUS_INVALID" },
      });
    }
  }),
  gender: z.string().trim().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.genderRequired,
        params: { appErrorCode: "GENDER_REQUIRED" },
      });
      return;
    }
    if (v !== "男性" && v !== "女性" && v !== "その他") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.genderInvalid,
        params: { appErrorCode: "GENDER_INVALID" },
      });
    }
  }),
  birthDate: OPTIONAL_DATE.superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.birthDateRequired });
    }
  }),
  joinDate: OPTIONAL_DATE.superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.joinDateRequired });
    }
  }),
  // 退職日/退職理由は「退職」選択時のみ必須（条件チェックは superRefine で行う）
  retireDate: OPTIONAL_DATE,
  retireReason: z.string().trim(),
  remark: z.string().trim().max(200, { message: managerAddMessages.remarkTooLong }),
  workStatus: z.string().trim().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.workStatusRequired });
    }
  }),
  client: z.string().trim(),
}).superRefine((values, ctx) => {
  const reasons = REASONS as unknown as string[];

  const employmentStatus = String((values as any).employmentStatus ?? "").trim();

  // 在籍状態と退職情報の矛盾（在籍なのに退職日/退職理由/備考が入っている等）
  // ※ ここで返すエラーには params.appErrorCode を付け、呼び出し側で識別できるようにする
  const consistencyErrors = validateEmploymentStatusConsistency({
    employmentStatus,
    retireDate: values.retireDate,
    retireReason: values.retireReason,
    remark: values.remark,
  });
  for (const e of consistencyErrors) {
    // 在籍状態の「不正値」はフィールド側で専用メッセージを出すため、ここでは二重に出さない
    if (e.code === "EMPLOYMENT_STATUS_INVALID") continue;

    const path =
      e.field === "retireDate"
        ? ["retireDate"]
        : e.field === "retireReason"
          ? ["retireReason"]
          : e.field === "remark"
            ? ["remark"]
            : ["employmentStatus"];
    ctx.addIssue({
      path,
      code: z.ZodIssueCode.custom,
      message: e.message,
      params: { appErrorCode: e.code },
    });
  }

  if (employmentStatus === "在籍") {
    return;
  }

  if (employmentStatus !== "退職") {
    // employmentStatus 自体の必須はフィールド側で見るので、ここでは何もしない
    return;
  }

  // 「退職」の場合のみ必須
  if (!String(values.retireDate ?? "").trim()) {
    ctx.addIssue({
      path: ["retireDate"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireDateRequired,
      params: { appErrorCode: "RETIRE_DATE_REQUIRED" },
    });
  }

  if (!values.retireReason) {
    ctx.addIssue({
      path: ["retireReason"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireReasonRequired,
      params: { appErrorCode: "RETIRE_REASON_REQUIRED" },
    });
    return;
  }

  // 退職理由が入力されている場合は選択肢に含まれるかチェック
  if (!reasons.includes(values.retireReason)) {
    ctx.addIssue({
      path: ["retireReason"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireReasonInvalid,
      params: { appErrorCode: "RETIRE_REASON_INVALID_OPTION" },
    });
  }
});

export type ManagerAddFormValues = {
  employeeId: string;
  department: string;
  name: string;
  employmentStatus: string;
  gender: string;
  birthDate: string;
  joinDate: string;
  retireDate: string;
  retireReason: string;
  remark: string;
  workStatus: string;
  client: string;
};
