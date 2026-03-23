-- テーブル名(companies)は、実際の環境に合わせて必ず変更すること！
INSERT INTO companies (id, company_name, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333', 
  '株式会社ENseed', 
  now(), 
  now()
);


-- ↓上記を実行した後、以下のINSERT文を実行すること！


-- テーブル名（departments など）は、左側のリストを見て必ず本物の名前に書き換えること！
INSERT INTO departments (id, company_id, name, created_at, updated_at)
VALUES (
  'd3333333-3333-3333-3333-333333333333', -- 今回新しく作る「部署」のID
  '33333333-3333-3333-3333-333333333333', -- 先ほど作った「株式会社ENseed」の会社ID
  '経営', 
  now(), 
  now()
);


-- アプリから登録し、部署を関連づける。