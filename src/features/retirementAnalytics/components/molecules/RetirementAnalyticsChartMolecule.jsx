import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
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

const extractPeriodFromBarClickArg = (arg) => {
  if (!arg) return "";
  const direct = arg?.payload?.period;
  if (direct) return direct;
  const nested = arg?.tooltipPayload?.[0]?.payload?.period;
  if (nested) return nested;
  const activeLabel = arg?.activeLabel;
  if (activeLabel) return activeLabel;
  return "";
};

const ClickableYearTick = ({ x, y, payload, onSelectYear }) => {
  const value = payload?.value;
  const label = String(value ?? "");
  const textWidth = Math.max(label.length * 8, 28);
  const pillWidth = textWidth + 20;
  const pillHeight = 26;
  return (
    <g
      transform={`translate(${x},${y})`}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      onClick={() => onSelectYear?.(value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectYear?.(value);
        }
      }}
    >
      <rect
        x={-pillWidth / 2}
        y={8}
        width={pillWidth}
        height={pillHeight}
        rx={13}
        ry={13}
        fill="#eff6ff"
        stroke="#bfdbfe"
      />
      <text x={0} y={0} dy={26} textAnchor="middle" fill="#111827" fontSize={12} fontWeight={600}>
        {label}
      </text>
    </g>
  );
};

const RetirementAnalyticsChartMolecule = ({
  data,
  seriesKeys,
  seriesMode,
  axis,
  enableYearTickClick,
  onYearTickClick,
  onBarClick,
}) => {
  const hasAnyValue =
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(seriesKeys) &&
    seriesKeys.length > 0 &&
    data.some((row) =>
      seriesKeys.some((key) => {
        const value = row?.[key];
        const num = typeof value === "number" ? value : Number(value ?? 0);
        return Number.isFinite(num) && num > 0;
      })
    );

  if (!data || data.length === 0 || !hasAnyValue) {
    return (
      <EmptyState
        title="該当するデータがありません"
        description="フィルタ条件を見直してください。"
      />
    );
  }

  const [hoveredSeriesKey, setHoveredSeriesKey] = useState("");
  const isYearTickMode = enableYearTickClick && axis === "year";

  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={isYearTickMode ? 340 : 320}>
        <BarChart
          data={data}
          margin={{ top: 24, right: 18, left: 6, bottom: isYearTickMode ? 16 : 4 }}
          barCategoryGap={12}
          barGap={6}
          maxBarSize={34}
        >
          <CartesianGrid stroke="#e6e8ec" strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tickMargin={isYearTickMode ? 12 : 6}
            tick={
              enableYearTickClick && axis === "year"
                ? (props) => <ClickableYearTick {...props} onSelectYear={onYearTickClick} />
                : undefined
            }
            tickFormatter={(value) => formatPeriodLabel(axis, value)}
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            cursor={false}
            content={
              <AnalyticsTooltip
                seriesKeys={seriesKeys}
                seriesMode={seriesMode}
                axis={axis}
              />
            }
          />
          {seriesKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="reasons"
              fill={getSeriesColors(seriesMode)[key] ?? "#94a3b8"}
              radius={[5, 5, 0, 0]}
              cursor="pointer"
              activeBar={
                hoveredSeriesKey === key
                  ? (props) => (
                      <Rectangle
                        {...props}
                        fill={props?.fill}
                        stroke="#60a5fa"
                        strokeWidth={2}
                        radius={[5, 5, 0, 0]}
                      />
                    )
                  : false
              }
              onMouseEnter={() => setHoveredSeriesKey(key)}
              onMouseLeave={() => setHoveredSeriesKey("")}
              onClick={(arg) => {
                const period = extractPeriodFromBarClickArg(arg);
                onBarClick?.(key, period);
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetirementAnalyticsChartMolecule;
