import Heading from "@/shared/ui/Heading";
import { CatalogManagerSection } from "@/features/settings/components/organisms/CatalogManagerSection";

export const SettingsMasterDataPanel = () => {
  return (
    <>
      <div className="settings-section-head">
        <Heading level={2}>マスタ管理</Heading>
      </div>

      <CatalogManagerSection
        title="部署管理"
        description="部署の一覧表示・追加・編集・削除を行います。"
        keyName="departments"
        itemLabel="部署"
      />

      <div className="mt-4" />

      <CatalogManagerSection
        title="稼働先管理"
        description="稼働先（クライアント）の一覧表示・追加・編集・削除を行います。"
        keyName="clients"
        itemLabel="稼働先"
      />
    </>
  );
};
