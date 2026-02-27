import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.AUTH.EMAIL_REQUIRED_ZOD)
    .email(ERROR_MESSAGES.AUTH.EMAIL_FORMAT_REQUIRED),
});

export const useForgotPasswordForm = () => {
  return useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });
};
