import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().trim().min(1, "メールアドレスは必須です").email("メールアドレス形式で入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
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
