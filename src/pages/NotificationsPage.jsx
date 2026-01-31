import { useMemo, useState } from "react";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";
import Badge from "@/shared/ui/Badge";

// pages: 画面単位の状態（フィルタ/既読など）を統合する

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = useMemo(
    () => [
      {
        id: "n1",
        type: "system",
        title: "メンテナンスのお知らせ",
        body: "本日 23:00-24:00 にメンテナンスを実施します。",
        isRead: false,
      },
      {
        id: "n2",
        type: "articles",
        title: "新しい記事が公開されました",
        body: "おすすめ記事をチェックしてみてください。",
        isRead: true,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [activeTab, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <section className="screen notifications-screen">
      <div className="notifications-header">
        <Heading level={2} className="title" aria-hidden="true" />
      </div>

      <div className="notifications-tabs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("all")}
          aria-pressed={activeTab === "all"}
        >
          すべて
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveTab("unread")}
          aria-pressed={activeTab === "unread"}
        >
          未読のみ
        </Button>
      </div>

      <div className="notifications-list">
        {filtered.length === 0 ? (
          <TextCaption>該当するお知らせはありません。</TextCaption>
        ) : (
          filtered.map((n) => (
            <Card key={n.id} className="notification-card">
              <div className="notification-title-row">
                <strong>{n.title}</strong>
                {!n.isRead && <Badge variant="danger">NEW</Badge>}
              </div>
              <TextCaption>{n.body}</TextCaption>
              <TextCaption className="notification-meta">type: {n.type}</TextCaption>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

export default NotificationsPage;
