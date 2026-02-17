import { useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import Input from "@/shared/ui/Input";
import Spinner from "@/shared/ui/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import AuthScreenLayout from "@/features/auth/components/AuthScreenLayout";

const LoginPage = ({ onNavigateForgotPassword, onLoginSuccess }) => {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  const onSubmit = async (values) => {
    setSubmitError("");
    const result = await login(values);
    if (!result.ok) {
      setSubmitError("メールアドレスまたはパスワードが間違っています");
      return;
    }
    if (typeof onLoginSuccess === "function") {
      onLoginSuccess();
    }
  };

  return (
    <AuthScreenLayout>
      <section className="screen settings-screen">
        <Card className="settings-panel max-w-[520px] w-full mx-auto">
        <div className="settings-card-title-wrap">
          <Heading level={2}>ログイン</Heading>
          <TextCaption>登録済みのメールアドレスとパスワードを入力してください。</TextCaption>
        </div>

        <form className="settings-inline-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

          <label className="settings-field">
            <span className="settings-field-label">メールアドレス</span>
            <Input
              type="email"
              placeholder="メールアドレス"
              error={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email?.message ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
          </label>

          <label className="settings-field">
            <span className="settings-field-label">パスワード</span>
            <div className="settings-password-input-wrap">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="パスワード"
                autoComplete="current-password"
                error={Boolean(errors.password)}
                {...register("password")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="settings-password-toggle"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-label={isPasswordVisible ? "パスワードを隠す" : "パスワードを表示"}
                title={isPasswordVisible ? "隠す" : "表示"}
              >
                {isPasswordVisible ? "🙈" : "👁"}
              </Button>
            </div>
            {errors.password?.message ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </label>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="text-sm text-slate-600 underline"
              onClick={onNavigateForgotPassword}
            >
              パスワードをお忘れの方はこちら
            </button>

            <Button type="submit" variant="outline" size="md" className="settings-action-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner label="ログイン中" />
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </Button>
          </div>
        </form>
        </Card>
      </section>
    </AuthScreenLayout>
  );
};

export default LoginPage;
