import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, ERROR_MESSAGES.AUTH.PASSWORD_MIN_8),
    confirmPassword: z.string().min(1, ERROR_MESSAGES.AUTH.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.AUTH.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export const useResetPasswordForm = () => {
  return useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });
};
