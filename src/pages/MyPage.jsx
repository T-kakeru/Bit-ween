import { useEffect, useMemo, useState } from "react";
import Icon from "@/shared/ui/Icon";
import Heading from "@/shared/ui/Heading";
import Divider from "@/shared/ui/Divider";
import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import TextCaption from "@/shared/ui/TextCaption";
import Avatar from "@/shared/ui/Avatar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchSettingsProfileByEmail } from "@/services/user/usersService";

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
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => ({
    name: String(user?.displayName ?? "ユーザー"),
    department: "",
    role: String(user?.role ?? "general") === "admin" ? "管理者" : "一般",
    team: "Bit-ween",
    bio: "",
    avatar: "",
    status: "オンライン",
  }));
  const completeness = useMemo(() => computeProfileCompleteness(profile), [profile]);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const email = String(user?.email ?? "").trim();
      if (!email) return;

      const dbProfile = await fetchSettingsProfileByEmail(email);
      if (disposed) return;
      if (!dbProfile) return;

      setProfile((prev) => ({
        ...prev,
        name: String(dbProfile.name ?? prev.name),
        department: String(dbProfile.department ?? ""),
        role: String(dbProfile.role ?? prev.role),
      }));
    };

    void load();
    return () => {
      disposed = true;
    };
  }, [user?.email]);

  const stats = { read: 0, saved: 0, reactions: 0, thanks: 0 };
  const engagement = { score: 0, weeklyReactions: 0, streakDays: 0, focusTags: [] };
  const recentActivities = [];
  const thanksHistory = [];

  return (
    <section className="screen mypage-screen">
      <div className="content-header mypage-header">
        <div>
          <Heading level={2} className="title" aria-hidden="true" />
        </div>
      </div>

      {view === viewIds.HOME ? (
        <div className="mypage-grid">
          <Card className="mypage-card">
            <div className="mypage-card-head">
              <div className="profile-row">
                {profile.avatar ? (
                  <Icon className="avatar avatar-xl" name={profile.avatar} alt="" />
                ) : (
                  <Avatar className="avatar avatar-xl" name={profile.name} />
                )}
                <div>
                  <p className="profile-name">{profile.name}</p>
                  <TextCaption>{profile.role} / {profile.team}</TextCaption>
                  <span className={profile.status === "オフライン" ? "status-chip offline" : "status-chip"}>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div className="mypage-card-actions">
                <Button type="button" variant="outline" onClick={onOpenSettings}>
                  編集
                </Button>
                <Button type="button" variant="outline" onClick={() => setView(viewIds.NOTIFICATIONS)}>
                  通知
                </Button>
              </div>
            </div>

            <TextCaption>{profile.bio}</TextCaption>

            <div className="profile-coverage" aria-label="プロフィール充実度">
              <div className="profile-coverage-meta">
                <TextCaption as="span">プロフィール充実度</TextCaption>
                <span className="profile-coverage-val">{completeness}%</span>
              </div>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completeness}>
                <div className="progress-fill" style={{ width: `${completeness}%` }} />
              </div>
              {completeness < 80 ? (
                <TextCaption className="small">部署・役割・ひとことを埋めると、マッチングやおすすめ精度が上がります。</TextCaption>
              ) : null}
            </div>
          </Card>

          <Card className="mypage-card">
            <div className="card-head">
              <Heading level={2}>スタッツ</Heading>
            </div>
            <div className="mypage-stats">
              <div>
                <p className="mypage-stat-number">{stats.read}</p>
                <TextCaption className="small">既読</TextCaption>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.saved}</p>
                <TextCaption className="small">保存</TextCaption>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.reactions}</p>
                <TextCaption className="small">リアクション</TextCaption>
              </div>
              <div>
                <p className="mypage-stat-number">{stats.thanks}</p>
                <TextCaption className="small">感謝</TextCaption>
              </div>
            </div>
          </Card>

          <Card className="mypage-card">
            <div className="card-head">
              <Heading level={2}>エンゲージメント</Heading>
            </div>
            <div className="mypage-engagement">
              <div>
                <p className="mypage-stat-number">{engagement.score}</p>
                <TextCaption className="small">スコア</TextCaption>
              </div>
              <div>
                <p className="mypage-stat-number">{engagement.weeklyReactions}</p>
                <TextCaption className="small">今週のリアクション</TextCaption>
              </div>
              <div>
                <p className="mypage-stat-number">{engagement.streakDays}日</p>
                <TextCaption className="small">連続アクション</TextCaption>
              </div>
            </div>
            <div className="tag-list">
              {engagement.focusTags.map((tag) => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </Card>

          <Card className="mypage-card">
            <div className="card-head">
              <Heading level={2}>最近の活動</Heading>
              <Button type="button" variant="outline" onClick={() => setView(viewIds.ACTIVITY)}>
                一覧
              </Button>
            </div>
            <ul className="mypage-list">
              {recentActivities.length ? (
                recentActivities.map((activity) => (
                  <li key={activity.id} className="mypage-list-item">
                    <p>{activity.title}</p>
                    <TextCaption as="span" className="small">{activity.meta}</TextCaption>
                  </li>
                ))
              ) : (
                <li className="mypage-list-item">
                  <TextCaption className="small">データは準備中です。</TextCaption>
                </li>
              )}
            </ul>
          </Card>

          <Card className="mypage-card">
            <div className="card-head">
              <Heading level={2}>感謝されたこと</Heading>
              <Button type="button" variant="outline" onClick={() => setView(viewIds.THANKS)}>
                一覧
              </Button>
            </div>
            <ul className="mypage-list">
              {thanksHistory.length ? (
                thanksHistory.map((item) => (
                  <li key={item.id} className="mypage-list-item">
                    <p>{item.message}</p>
                    <TextCaption as="span" className="small">{item.to} ・ {item.date}</TextCaption>
                  </li>
                ))
              ) : (
                <li className="mypage-list-item">
                  <TextCaption className="small">データは準備中です。</TextCaption>
                </li>
              )}
            </ul>
          </Card>
        </div>
      ) : null}

      {view === viewIds.ACTIVITY ? (
        <section className="mypage-section">
          <Button type="button" variant="outline" onClick={() => setView(viewIds.HOME)}>
            戻る
          </Button>
          <Heading level={2}>最近の活動</Heading>
          <ul className="mypage-list">
            {recentActivities.length ? (
              recentActivities.map((activity) => (
                <li key={activity.id} className="mypage-list-item">
                  <p>{activity.title}</p>
                  <TextCaption as="span" className="small">{activity.meta}</TextCaption>
                </li>
              ))
            ) : (
              <li className="mypage-list-item">
                <TextCaption className="small">データは準備中です。</TextCaption>
              </li>
            )}
          </ul>
        </section>
      ) : null}

      {view === viewIds.THANKS ? (
        <section className="mypage-section">
          <Button type="button" variant="outline" onClick={() => setView(viewIds.HOME)}>
            戻る
          </Button>
          <Heading level={2}>感謝されたこと</Heading>
          <ul className="mypage-list">
            {thanksHistory.length ? (
              thanksHistory.map((item) => (
                <li key={item.id} className="mypage-list-item">
                  <p>{item.message}</p>
                  <TextCaption as="span" className="small">{item.to} ・ {item.date}</TextCaption>
                </li>
              ))
            ) : (
              <li className="mypage-list-item">
                <TextCaption className="small">データは準備中です。</TextCaption>
              </li>
            )}
          </ul>
        </section>
      ) : null}

      {view === viewIds.NOTIFICATIONS ? (
        <section className="mypage-section">
          <Button type="button" variant="outline" onClick={() => setView(viewIds.HOME)}>
            戻る
          </Button>
          <Heading level={2}>通知</Heading>
          <TextCaption>通知は準備中です。</TextCaption>
        </section>
      ) : null}
    </section>
  );
};

export default MyPage;
