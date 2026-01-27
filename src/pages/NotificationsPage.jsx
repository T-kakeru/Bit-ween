import { useMemo, useState } from "react";

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
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>お知らせ</h2>
        <span style={{ color: "#666" }}>未読 {unreadCount}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          aria-pressed={activeTab === "all"}
        >
          すべて
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          aria-pressed={activeTab === "unread"}
        >
          未読のみ
        </button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {filtered.length === 0 ? (
          <p style={{ color: "#666" }}>該当するお知らせはありません。</p>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                background: n.isRead ? "#fff" : "#f8fafc",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong>{n.title}</strong>
                {!n.isRead && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "#111827",
                      color: "#fff",
                    }}
                  >
                    NEW
                  </span>
                )}
              </div>
              <p style={{ margin: "6px 0 0", color: "#555" }}>{n.body}</p>
              <div style={{ marginTop: 8, color: "#888", fontSize: 12 }}>
                type: {n.type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
