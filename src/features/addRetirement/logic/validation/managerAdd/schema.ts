import { z } from "zod";
import { trimmedStringMinMax } from "../shared/primitives";
import { managerAddMessages } from "./messages";

export const managerAddSchema = z.object({
  // 現時点では「名前」だけ（他項目は今回対象外）
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
});

export type ManagerAddFormValues = z.infer<typeof managerAddSchema>;
