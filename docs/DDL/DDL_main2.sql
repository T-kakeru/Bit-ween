-- 本番環境のDDLに必要なデータの挿入
-- 稼働状態データの挿入
INSERT INTO work_statuses (name) VALUES
('稼働'),
('待機'),
('休職');

-- 退職理由データの挿入
INSERT INTO retirement_reasons (name) VALUES
('キャリアアップ'),
('同業他社転職'),
('家庭問題'),
('ITモチベ低下'),
('給与不満'),
('会社不信');