import { z } from "zod";
import { trimmedStringMinMax } from "../shared/primitives";
import { managerAddMessages } from "./messages";
import { REASONS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const OPTIONAL_DATE = z
  .string()
  .trim()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "日付の形式が正しくありません" });

const EMPLOYEE_ID_MAX_LENGTH = 30;

export const managerAddSchema = z.object({
  isActive: z
    .boolean()
    .nullable()
    .refine((v) => v !== null, { message: managerAddMessages.isActiveRequired }),
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
  gender: z.string().trim().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.genderRequired });
      return;
    }
    if (v !== "男性" && v !== "女性" && v !== "その他") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.genderRequired });
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
  retireDate: OPTIONAL_DATE,
  retireReason: z.string().trim(),
  remark: z.string().trim().max(200, { message: managerAddMessages.remarkTooLong }),
  workStatus: z.string().trim().superRefine((v, ctx) => {
    if (!v) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.workStatusRequired });
      return;
    }
    const options = STATUSES as unknown as string[];
    if (!options.includes(v)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.workStatusRequired });
    }
  }),
  client: z.string().trim(),
}).superRefine((values, ctx) => {
  const reasons = REASONS as unknown as string[];

  // 在籍中の場合
  if (values.isActive) {
    // 退職日が未入力なら退職理由は入力不可
    if (!values.retireDate && values.retireReason) {
      ctx.addIssue({
        path: ["retireReason"],
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.retireReasonRequiresDate,
      });
      return;
    }

    // 退職日が入力されている（退職予定など）の場合、退職理由は任意（入力されていれば選択肢だけチェック）
    if (values.retireDate && values.retireReason && !reasons.includes(values.retireReason)) {
      ctx.addIssue({
        path: ["retireReason"],
        code: z.ZodIssueCode.custom,
        message: managerAddMessages.retireReasonRequired,
      });
    }
    return;
  }

  // 退職済の場合
  if (!values.retireDate) {
    ctx.addIssue({
      path: ["retireDate"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireDateRequired,
    });
    return;
  }
  if (!values.retireReason) {
    ctx.addIssue({
      path: ["retireReason"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireReasonRequired,
    });
    return;
  }
  if (!reasons.includes(values.retireReason)) {
    ctx.addIssue({
      path: ["retireReason"],
      code: z.ZodIssueCode.custom,
      message: managerAddMessages.retireReasonRequired,
    });
  }
});

export type ManagerAddFormValues = {
  isActive: boolean | null;
  employeeId: string;
  department: string;
  name: string;
  gender: string;
  birthDate: string;
  joinDate: string;
  retireDate: string;
  retireReason: string;
  remark: string;
  workStatus: string;
  client: string;
};
