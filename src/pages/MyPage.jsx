import { useMemo, useState } from "react";
import mypageData from "@/shared/data/mock/mypage.json";
import Icon from "@/shared/ui/Icon";

const viewIds = {
  HOME: "home",
  ENGAGEMENT: "engagement",
  THANKS: "thanks",
  ACTIVITY: "activity",
  NOTIFICATIONS: "notifications",
};

const computeProfileCompleteness = (profile) => {
  const fields = [
    profile?.name,
    profile?.department,
    profile?.role,
    profile?.team,
    profile?.bio,
    profile?.avatar,
  ];

  const filledCount = fields.filter((value) => String(value ?? "").trim().length > 0).length;
  return Math.round((filledCount / fields.length) * 100);
};

// pages: 画面単位の状態（タブ/ビュー切替）を統合する
const MyPage = ({ onOpenSettings }) => {
  const [view, setView] = useState(viewIds.HOME);
  const [profile] = useState(mypageData.profile);
  const completeness = useMemo(() => computeProfileCompleteness(profile), [profile]);
  const { stats, engagement, recentActivities, thanksHistory } = mypageData;

  return (
    <section className="screen mypage-screen">
      <div className="content-header mypage-header">
        <div>
          <h1 className="title">マイページ</h1>
        </div>
      </div>

      {view === viewIds.HOME ? (
        <div className="mypage-grid">
          <section className="card-panel mypage-card">
            <div className="mypage-card-head">
              <div className="profile-row">
                <Icon className="avatar avatar-xl" name={profile.avatar} alt="" />
                <div>
                  <p className="profile-name">{profile.name}</p>
                  <p className="muted">{profile.role} / {profile.team}</p>
                  <span className={profile.status === "オフライン" ? "status-chip offline" : "status-chip"}>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div className="mypage-card-actions">
                <button type="button" className="pill-button" onClick={onOpenSettings}>
                  編集
                </button>
                <button type="button" className="pill-button" onClick={() => setView(viewIds.NOTIFICATIONS)}>
                  通知
                </button>
              </div>
            </div>

            <p className="muted">{profile.bio}</p>

            <div className="profile-coverage" aria-label="プロフィール充実度">
              <div className="profile-coverage-meta">
                <span className="muted">プロフィール充実度</span>
                <span className="profile-coverage-val">{completeness}%</span>
              </div>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completeness}>
                <div className="progress-fill" style={{ width: `${completeness}%` }} />
              </div>
              {completeness < 80 ? (
                <p className="muted small">部署・役割・ひとことを埋めると、マッチングやおすすめ精度が上がります。</p>
              ) : null}
            </div>
          </section>

          <section className="card-panel mypage-card">
            <div className="card-head">
              <h2 className="title">スタッツ</h2>
            </div>
            <div className="mypage-stats">
              <div>
                <p className="mypage-stat-number">{stats.read}</p>
                <p className="muted small">既読</p>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.saved}</p>
                <p className="muted small">保存</p>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.reactions}</p>
                <p className="muted small">リアクション</p>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.thanks}</p>
                <p className="muted small">感謝</p>
              </div>
            </div>
          </section>

          <section className="card-panel mypage-card">
            <div className="card-head">
              <h2 className="title">エンゲージメント</h2>
            </div>
            <div className="mypage-engagement">
              <div>
                <p className="mypage-stat-number">{engagement.score}</p>
                <p className="muted small">スコア</p>
              </div>
              <div>
                <p className="mypage-stat-number">{engagement.weeklyReactions}</p>
                <p className="muted small">今週のリアクション</p>
              </div>
              <div>
                <p className="mypage-stat-number">{engagement.streakDays}日</p>
                <p className="muted small">連続アクション</p>
              </div>
            </div>
            <div className="tag-list">
              {engagement.focusTags.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </section>

          <section className="card-panel mypage-card">
            <div className="card-head">
              <h2 className="title">最近の活動</h2>
              <button type="button" className="pill-button" onClick={() => setView(viewIds.ACTIVITY)}>
                一覧
              </button>
            </div>
            <ul className="mypage-list">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="mypage-list-item">
                  <p>{activity.title}</p>
                  <span className="muted small">{activity.meta}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-panel mypage-card">
            <div className="card-head">
              <h2 className="title">感謝されたこと</h2>
              <button type="button" className="pill-button" onClick={() => setView(viewIds.THANKS)}>
                一覧
              </button>
            </div>
            <ul className="mypage-list">
              {thanksHistory.map((item) => (
                <li key={item.id} className="mypage-list-item">
                  <p>{item.message}</p>
                  <span className="muted small">{item.to} ・ {item.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {view === viewIds.ACTIVITY ? (
        <section className="mypage-section">
          <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
            戻る
          </button>
          <h2 className="title">最近の活動</h2>
          <ul className="mypage-list">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="mypage-list-item">
                <p>{activity.title}</p>
                <span className="muted small">{activity.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === viewIds.THANKS ? (
        <section className="mypage-section">
          <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
            戻る
          </button>
          <h2 className="title">感謝されたこと</h2>
          <ul className="mypage-list">
            {thanksHistory.map((item) => (
              <li key={item.id} className="mypage-list-item">
                <p>{item.message}</p>
                <span className="muted small">{item.to} ・ {item.date}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view === viewIds.NOTIFICATIONS ? (
        <section className="mypage-section">
          <button type="button" className="pill-button" onClick={() => setView(viewIds.HOME)}>
            戻る
          </button>
          <h2 className="title">通知</h2>
          <p className="muted">通知は準備中です。</p>
        </section>
      ) : null}
    </section>
  );
};

export default MyPage;
