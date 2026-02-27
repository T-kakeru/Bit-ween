-- ==========================================
-- 1. フェーズ１DB初期化（既存テーブルを削除してリセット）
-- ==========================================
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS retirement_reasons CASCADE;
DROP TABLE IF EXISTS work_statuses CASCADE;
DROP TABLE IF EXISTS companies CASCADE;