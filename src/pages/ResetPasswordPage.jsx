import { useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import Input from "@/shared/ui/Input";
import Spinner from "@/shared/ui/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";
import AuthScreenLayout from "@/features/auth/components/AuthScreenLayout";

const ResetPasswordPage = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useResetPasswordForm();

  const onSubmit = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    const result = await resetPassword({ password: values.password });
    if (!result.ok) {
      setSubmitError(result.message || "パスワード更新に失敗しました");
      return;
    }
    setSuccessMessage("パスワードを変更しました。ログイン画面からログインしてください。");
  };

  return (
    <AuthScreenLayout>
      <section className="screen settings-screen">
        <Card className="settings-panel max-w-[520px] w-full mx-auto">
        <div className="settings-card-title-wrap">
          <Heading level={2}>パスワード変更</Heading>
          <TextCaption>新しいパスワードを入力してください。</TextCaption>
        </div>

        <form className="settings-inline-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

          <label className="settings-field">
            <span className="settings-field-label">新しいパスワード</span>
            <div className="settings-password-input-wrap">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="新しいパスワード"
                autoComplete="new-password"
                error={Boolean(errors.password)}
                {...register("password")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="settings-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁"}
              </Button>
            </div>
            {errors.password?.message ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </label>

          <label className="settings-field">
            <span className="settings-field-label">新しいパスワード（確認用）</span>
            <div className="settings-password-input-wrap">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="新しいパスワード（確認用）"
                autoComplete="new-password"
                error={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="settings-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </Button>
            </div>
            {errors.confirmPassword?.message ? <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p> : null}
          </label>

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="text-sm text-slate-600 underline" onClick={onBackToLogin}>
              ログイン画面に戻る
            </button>

            <Button type="submit" variant="outline" size="md" className="settings-action-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner label="更新中" />
                  更新中...
                </span>
              ) : (
                "パスワードを変更する"
              )}
            </Button>
          </div>
        </form>
        </Card>
      </section>
    </AuthScreenLayout>
  );
};

export default ResetPasswordPage;
