export const UNKNOWN_CHART_LABEL = "未選択";
export const UNKNOWN_CHART_COLOR = "#d1d5db";

const UNKNOWN_LABELS = new Set(["", "-", "未設定", "未選択", "なし", "N/A"]);

export const DONUT_COLOR_PALETTE = [
  "#60a5fa",
  "#34d399",
  "#f59e0b",
  "#a78bfa",
  "#f472b6",
  "#22d3ee",
  "#f87171",
  "#84cc16",
  "#fb7185",
  "#38bdf8",
];

export const EMPLOYEE_STATUS_LIGHT_COLORS = {
  active: "#bfdbfe",
  resigned: "#fed7aa",
};

export const NON_DONUT_LIGHT_COLOR_PALETTE = [
  "#bfdbfe",
  "#FED7AA",
  "#fde68a",
  "#ddd6fe",
  "#fbcfe8",
  "#bae6fd",
  "#fecdd3",
  "#d9f99d",
  "#fed7aa",
  "#a7f3d0",
];

// チャートのラベルが未知の値を表すかどうかを判定する関数
export const isUnknownChartLabel = (label: unknown) => {
  const text = String(label ?? "").trim();
  return UNKNOWN_LABELS.has(text);
};

// 社員情報のステータスを表すセグメントタイプ
export const getPaletteColorByIndex = (index: number, palette: string[]) => {
  if (!Array.isArray(palette) || palette.length === 0) return UNKNOWN_CHART_COLOR;
  const safeIndex = Number.isFinite(index) ? Math.max(Math.floor(index), 0) : 0;
  return palette[safeIndex % palette.length] ?? UNKNOWN_CHART_COLOR;
};
