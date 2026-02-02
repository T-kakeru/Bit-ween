import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/shared/components/EmptyState";
import { getSeriesColors } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";

const formatPeriodLabel = (axis, period) => {
  if (axis === "month") {
    const m = Number(String(period).slice(5, 7));
    return `${m}月`;
  }
  return String(period);
};

const AnalyticsTooltip = ({ active, payload, label, seriesKeys, seriesMode, axis }) => {
  if (!active || !payload || payload.length === 0) return null;

  const colors = getSeriesColors(seriesMode);
  const rows = seriesKeys.map((key) => {
    const entry = payload.find((item) => item.dataKey === key);
    return {
      key,
      value: entry?.value ?? 0,
      color: entry?.color ?? colors[key],
    };
  });

  return (
    <div className="analytics-tooltip">
      <div className="analytics-tooltip-title">{formatPeriodLabel(axis, label)}</div>
      <div className="analytics-tooltip-rows">
        {rows.map((row) => (
          <div key={row.key} className="analytics-tooltip-row">
            <span className="analytics-tooltip-dot" style={{ background: row.color }} />
            <span className="analytics-tooltip-label">{row.key}</span>
            <span className="analytics-tooltip-value">{row.value}件</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RetirementAnalyticsChart = ({ data, seriesKeys, seriesMode, axis }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="表示できるデータがありません"
        description="フィルタ条件を見直してください。"
      />
    );
  }

  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 18, left: 6, bottom: 8 }}
          barCategoryGap={24}
          barGap={4}
          maxBarSize={18}
        >
          <CartesianGrid stroke="#e6e8ec" strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tickMargin={6}
            tickFormatter={(value) => formatPeriodLabel(axis, value)}
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={
              <AnalyticsTooltip
                seriesKeys={seriesKeys}
                seriesMode={seriesMode}
                axis={axis}
              />
            }
          />
          <Legend />
          {seriesKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="reasons"
              fill={getSeriesColors(seriesMode)[key] ?? "#94a3b8"}
              radius={[5, 5, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetirementAnalyticsChart;
