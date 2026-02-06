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
  isActive: z.boolean(),
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
  birthDate: OPTIONAL_DATE,
  email: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (!v) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.emailRequired });
        return;
      }
      const ok = z.string().email().safeParse(v).success;
      if (!ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: managerAddMessages.emailInvalid });
    }),
  joinDate: OPTIONAL_DATE,
  retireDate: OPTIONAL_DATE,
  retireReason: z.string().trim(),
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
  educationPoint: z.union([z.number().min(0).max(999), z.literal("")]),
  careerPoint: z.union([z.number().min(0).max(999), z.literal("")]),
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

export type ManagerAddFormValues = z.infer<typeof managerAddSchema>;
