import { z } from "zod";
import { trimmedStringMinMax } from "../shared/primitives";
import { managerAddMessages } from "./messages";

const parseDate = (value: string): Date | null => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.includes("/") ? raw.replaceAll("/", "-") : raw;
  const [y, m, d] = normalized.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
};

const toDateOnly = (value: Date): Date => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const diffMonths = (start: Date, end: Date): number => {
  const base = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return end.getDate() < start.getDate() ? base - 1 : base;
};

const calculateAge = (birthDate: Date, today: Date): number => {
  return (
    today.getFullYear() -
    birthDate.getFullYear() -
    ((today.getMonth() < birthDate.getMonth()) ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ? 1
      : 0)
  );
};

const withinRangeDate = (value: Date, min: Date, max: Date): boolean => value >= min && value <= max;

export const managerAddSchema = z.object({
  // 現時点ではフォームで扱う主要項目のみを対象にバリデーション
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
  birthDate: z.string().trim(),
  joinDate: z.string().trim(),
  retireDate: z.string().trim(),
  status: z.string().trim().max(20, { message: managerAddMessages.statusTooLong }),
  client: z.string().trim().max(50, { message: managerAddMessages.clientTooLong }),
  reason: z.string().trim().max(100, { message: managerAddMessages.reasonTooLong }),
  educationPoint: z
    .number({ message: managerAddMessages.educationPointInvalid })
    .min(0, { message: managerAddMessages.educationPointInvalid })
    .max(99, { message: managerAddMessages.educationPointTooHigh })
    .optional(),
  careerPoint: z
    .number({ message: managerAddMessages.careerPointInvalid })
    .min(0, { message: managerAddMessages.careerPointInvalid })
    .max(99, { message: managerAddMessages.careerPointTooHigh })
    .optional(),
}).superRefine((values, ctx) => {
  const today = toDateOnly(new Date());
  const min1900 = new Date(1900, 0, 1);

  const birthDate = parseDate(values.birthDate);
  if (birthDate) {
    if (!withinRangeDate(birthDate, min1900, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: birthDate < min1900 ? managerAddMessages.birthDateBefore1900 : managerAddMessages.birthDateInFuture,
      });
    } else {
      const age = calculateAge(birthDate, today);
      if (age < 15) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: managerAddMessages.birthDateUnder15 });
      }
      if (age >= 75) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDate"], message: managerAddMessages.birthDateOver75 });
      }
    }
  }

  const joinDate = parseDate(values.joinDate);
  const retireDate = parseDate(values.retireDate);
  if (joinDate) {
    if (!withinRangeDate(joinDate, min1900, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["joinDate"],
        message: joinDate < min1900 ? managerAddMessages.joinDateBefore1900 : managerAddMessages.joinDateInFuture,
      });
    }
    if (birthDate) {
      const minJoin = new Date(birthDate.getFullYear() + 15, birthDate.getMonth(), birthDate.getDate());
      if (joinDate < minJoin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["joinDate"],
          message: managerAddMessages.joinDateBefore15Years,
        });
      }
    }
  }

  if (!retireDate) return;

  if (joinDate && retireDate < joinDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retireDate"],
      message: managerAddMessages.retireDateBeforeJoinDate,
    });
  }

  if (retireDate > today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retireDate"],
      message: managerAddMessages.retireDateInFuture,
    });
  }

  if (joinDate) {
    const tenureMonths = diffMonths(joinDate, retireDate);
    if (tenureMonths >= 50 * 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retireDate"],
        message: managerAddMessages.retireDateOver50Years,
      });
    }
  }
});

export type ManagerAddFormValues = z.infer<typeof managerAddSchema>;
