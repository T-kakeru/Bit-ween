import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ERROR_MESSAGES } from "@/shared/constants/messages/appMessages";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.AUTH.EMAIL_REQUIRED_ZOD)
    .email(ERROR_MESSAGES.AUTH.EMAIL_FORMAT_REQUIRED),
  password: z.string().min(1, ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED_ZOD),
});

export const useLoginForm = () => {
  return useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });
};
