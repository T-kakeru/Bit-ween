import { GENDERS, STATUSES } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

export const PERIOD_LABELS = {
  current: "現在",
  month: "月",
  year: "年",
};

export const SERIES_MODE_LABELS = {
  reason: "退職理由",
  department: "部署",
  age: "年齢",
  tenure: "在籍月数",
};

export const buildPeriodSummary = (activeTab, selectedYear) => {
  const base = PERIOD_LABELS[activeTab] ?? "現在";
  if (activeTab === "month" && selectedYear) {
    return `${base}（${selectedYear}年）`;
  }
  return base;
};

export const buildAxisSummary = (seriesMode) => {
  return SERIES_MODE_LABELS[seriesMode] ?? "退職理由";
};

export const buildConditionSummary = ({ statuses, genders, clients, clientOptions }) => {
  const safeStatuses = Array.isArray(statuses) ? statuses : [];
  const safeGenders = Array.isArray(genders) ? genders : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeClientOptions = Array.isArray(clientOptions) ? clientOptions : [];

  const statusSummary =
    safeStatuses.length === 0
      ? "稼働状態:未選択"
      : safeStatuses.length === STATUSES.length
        ? "稼働状態:全て"
        : `稼働状態:${safeStatuses.length}件`;

  const genderSummary =
    safeGenders.length === 0
      ? "性別:未選択"
      : safeGenders.length === GENDERS.length
        ? "性別:男女"
        : `性別:${safeGenders.join("/")}`;

  const clientSummary =
    safeClients.length === 0
      ? "稼働先:未選択"
      : safeClients.length === safeClientOptions.length
        ? "稼働先:全て"
        : `稼働先:${safeClients.length}件`;

  return `${statusSummary} / ${genderSummary} / ${clientSummary}`;
};

export const buildFilterSummary = ({ activeTab, selectedYear, seriesMode, statuses, genders, clients, clientOptions }) => {
  const periodSummary = buildPeriodSummary(activeTab, selectedYear);
  const axisSummary = buildAxisSummary(seriesMode);
  const conditionSummary = buildConditionSummary({ statuses, genders, clients, clientOptions });

  return {
    periodSummary,
    axisSummary,
    conditionSummary,
    filterSummary: `${periodSummary} / ${axisSummary} / ${conditionSummary}`,
  };
};
