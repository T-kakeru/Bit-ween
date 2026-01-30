// 日付文字列のパース（純ロジック）

export const parseJapaneseMonthToMs = (value: any): any => {
  const match = String(value).match(/(\d{4})年(\d{1,2})月/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1).getTime();
};

export const parseSlashDateToMs = (value: any): any => {
  const match = String(value).match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getTime();
};
