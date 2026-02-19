import Heading from "@/shared/ui/Heading";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import { CatalogManagerSection } from "@/features/settings/components/organisms/CatalogManagerSection";

export const SettingsMasterDataPanel = () => {
  return (
    <Card className="settings-panel settings-menu-card settings-master-card">
      <div className="settings-card-title-wrap">
        <Heading level={3}>マスタ管理</Heading>
        <TextCaption>部署・稼働先・稼働状態をこのカード内で管理します。</TextCaption>
      </div>

      <CatalogManagerSection
        title="部署管理"
        description="部署の一覧表示・追加・編集・削除を行います。"
        keyName="departments"
        itemLabel="部署"
        embedded
      />

      <CatalogManagerSection
        title="稼働先管理"
        description="クライアント名の一覧表示・追加・編集・削除を行います。"
        keyName="clients"
        itemLabel="稼働先"
        embedded
      />

      <CatalogManagerSection
        title="稼働状態管理"
        description="稼働状態の一覧表示・追加・編集・削除を行います。"
        keyName="workStatuses"
        itemLabel="稼働状態"
        embedded
      />
    </Card>
  );
};
