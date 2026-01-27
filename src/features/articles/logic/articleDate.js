// 記事の日付（date）を扱うためのユーティリティ 扱う日付データを整形された状態で返す
// - データは "YYYY/MM/DD" と "YYYY-MM-DD" が混在しうる前提
// - フィルター/ソート側はこのモジュール経由で扱う

export const normalizeDateString = (value) => {
  return String(value ?? "").replace(/\//g, "-");
};

export const toDateTime = (value) => {
  const normalized = normalizeDateString(value);
  const time = new Date(normalized).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const sortByDateDesc = (list) => {
  return [...(list ?? [])].sort((a, b) => toDateTime(b?.date) - toDateTime(a?.date));
};

// 週の範囲（月曜始まり）を返す
export const getWeekRange = (base = new Date()) => {
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);

  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
};

export const toISODateString = (date = new Date()) => {
  return new Date(date).toISOString().slice(0, 10);
};
