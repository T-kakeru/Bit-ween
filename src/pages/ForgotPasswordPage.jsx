import { useState } from "react";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import TextCaption from "@/shared/ui/TextCaption";
import Input from "@/shared/ui/Input";
import Spinner from "@/shared/ui/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useForgotPasswordForm } from "@/features/auth/hooks/useForgotPasswordForm";
import AuthScreenLayout from "@/features/auth/components/AuthScreenLayout";

const ForgotPasswordPage = ({ onBackToLogin }) => {
  const { requestPasswordReset } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForgotPasswordForm();

  const onSubmit = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    const result = await requestPasswordReset(values);
    if (!result.ok) {
      setSubmitError(result.message || "送信に失敗しました");
      return;
    }
    setSuccessMessage("再設定メールを送信しました。メールをご確認ください。");
  };

  return (
    <AuthScreenLayout>
      <section className="screen settings-screen">
        <Card className="settings-panel max-w-[520px] w-full mx-auto">
        <div className="settings-card-title-wrap">
          <Heading level={3}>パスワード再設定</Heading>
          <TextCaption>登録済みメールアドレス宛に再設定メールを送信します。</TextCaption>
        </div>

        <form className="settings-inline-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

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

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="danger"
              size="md"
              className="settings-action-button settings-cancel-button"
              onClick={onBackToLogin}
            >
              ログイン画面に戻る
            </Button>

            <Button type="submit" variant="outline" size="md" className="settings-action-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner label="送信中" />
                  送信中...
                </span>
              ) : (
                "再設定メールを送信"
              )}
            </Button>
          </div>
        </form>
        </Card>
      </section>
    </AuthScreenLayout>
  );
};

export default ForgotPasswordPage;
