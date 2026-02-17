import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "メールアドレスは必須です").email("メールアドレス形式で入力してください"),
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
