import { useMemo, useState } from "react";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import TextCaption from "@/shared/ui/TextCaption";

// プロフィール編集（マイページから遷移する想定）
const ProfileEditPage = ({ profile, onSave, onCancel, onBack }) => {
  const initial = useMemo(
    () => ({
      name: profile?.name ?? "",
      department: profile?.department ?? "",
      role: profile?.role ?? "",
      team: profile?.team ?? "",
      status: profile?.status ?? "オンライン",
      avatar: profile?.avatar ?? "",
      bio: profile?.bio ?? "",
    }),
    [profile]
  );

  const [form, setForm] = useState(initial);

  const isDirty = useMemo(() => {
    return (
      form.name !== initial.name ||
      form.department !== initial.department ||
      form.role !== initial.role ||
      form.team !== initial.team ||
      form.status !== initial.status ||
      form.avatar !== initial.avatar ||
      form.bio !== initial.bio
    );
  }, [form, initial]);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.(form);
  };

  const handleCancel = () => {
    if (isDirty) {
      const ok = window.confirm("変更を破棄して戻りますか？");
      if (!ok) return;
    }
    setForm(initial);
    (onCancel ?? onBack)?.();
  };

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("画像ファイル（PNG/JPG など）を選択してください");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      window.alert("画像サイズが大きすぎます（2MB以下）");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setForm((prev) => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="screen profile-edit-screen">
      <header className="content-header profile-edit-header">
        <div>
          <Heading level={1}>プロフィール編集</Heading>
          <TextCaption>名前と基本情報、自己紹介を編集できます。</TextCaption>
        </div>
        <div className="profile-edit-actions">
          <Button type="button" variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button
            type="submit"
            form="profile-edit-form"
            variant="primary"
            disabled={!isDirty}
          >
            保存
          </Button>
        </div>
      </header>

      <Divider />

      <Card as="form" id="profile-edit-form" className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">名前</label>
          <Input type="text" value={form.name} onChange={handleChange("name")} />
        </div>
        <div className="form-row">
          <label className="form-label">部署</label>
          <Input type="text" value={form.department} onChange={handleChange("department")} />
        </div>
        <div className="form-row">
          <label className="form-label">役割</label>
          <Input type="text" value={form.role} onChange={handleChange("role")} />
        </div>
        <div className="form-row">
          <label className="form-label">チーム</label>
          <Input type="text" value={form.team} onChange={handleChange("team")} />
        </div>
        <div className="form-row">
          <label className="form-label">ステータス</label>
          <Select value={form.status} onChange={handleChange("status")}>
            {['オンライン', 'オフライン', '取り込み中'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </div>
        <div className="form-row">
          <label className="form-label">プロフィール画像</label>
          <Input type="file" accept="image/*" onChange={handleAvatarFile} />
          {form.avatar ? (
            <img src={form.avatar} alt="プロフィール" className="avatar-preview" />
          ) : null}
        </div>
        <div className="form-row">
          <label className="form-label">自己紹介</label>
          <textarea rows={4} value={form.bio} onChange={handleChange("bio")} />
        </div>
      </Card>
    </section>
  );
};

export default ProfileEditPage;
