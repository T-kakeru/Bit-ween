import Heading from "@/shared/ui/Heading";
import Card from "@/shared/ui/Card";
import TextCaption from "@/shared/ui/TextCaption";
import { CatalogManagerSection } from "@/features/settings/components/organisms/CatalogManagerSection";

type Props = {
  readOnly?: boolean;
};

export const SettingsMasterDataPanel = ({ readOnly = false }: Props) => {
  return (
    <Card className="settings-panel settings-menu-card settings-master-card">
      <div className="settings-card-title-wrap">
        <Heading level={3}>マスタ管理</Heading>
        <TextCaption>部署・稼働先をこのカード内で管理します。稼働状態は固定データのため一覧表示のみです。</TextCaption>
      </div>

      <CatalogManagerSection
        title="部署管理"
        description="部署の一覧表示・追加・編集・削除を行います。"
        keyName="departments"
        itemLabel="部署"
        embedded
        readOnly={readOnly}
      />

      <CatalogManagerSection
        title="稼働先管理"
        description="クライアント名の一覧表示・追加・編集・削除を行います。"
        keyName="clients"
        itemLabel="稼働先"
        embedded
        readOnly={readOnly}
      />

      <CatalogManagerSection
        title="稼働状態管理"
        description="稼働状態の一覧を表示します（固定データのため追加・編集・削除はできません）。"
        keyName="workStatuses"
        itemLabel="稼働状態"
        embedded
        readOnly
      />
    </Card>
  );
};
