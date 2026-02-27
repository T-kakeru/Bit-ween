import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/shared/components/EmptyState";
import { getSeriesColors } from "@/features/retirementAnalytics/logic/retirementAnalytics.logic";
import AnalyticsYearTickButton from "@/features/retirementAnalytics/components/molecules/AnalyticsYearTickButton";
import { calcNiceYAxis } from "@/features/retirementAnalytics/logic/calcNiceYAxis.logic";
import { useElementSize } from "@/shared/hooks/useElementSize";

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

const RetirementAnalyticsChartMolecule = ({
  data,
  seriesKeys,
  seriesMode,
  axis,
  isChartMaximized,
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
        description="分析条件・詳細を見直してください。"
      />
    );
  }

  const [hoveredSeriesKey, setHoveredSeriesKey] = useState("");
  const isYearTickMode = enableYearTickClick && axis === "year";
  const baseChartHeight = isYearTickMode ? 430 : 360;
  const chartHeight = isChartMaximized ? 520 : baseChartHeight;
  const { ref, size } = useElementSize();

  const width = Math.floor(size.width);
  const height = Math.floor(size.height);
  const canRenderChart = width > 0 && height > 0;

  const stackedMax = Array.isArray(data)
    ? data.reduce((max, row) => {
        const sum = Array.isArray(seriesKeys)
          ? seriesKeys.reduce((acc, key) => {
              const value = row?.[key];
              const num = typeof value === "number" ? value : Number(value ?? 0);
              return acc + (Number.isFinite(num) ? num : 0);
            }, 0)
          : 0;
        return Math.max(max, sum);
      }, 0)
    : 0;

  const yAxisConfig = calcNiceYAxis({
    maxValue: stackedMax,
    multiplier: 1.1,
    minMax: 1,
  });

  return (
    <div className="analytics-chart">
      <div ref={ref} style={{ width: "100%", height: `${chartHeight}px`, minHeight: 1, minWidth: 1 }}>
        {canRenderChart ? (
          <BarChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 8, right: 18, left: 6, bottom: isYearTickMode ? 14 : 0 }}
            barCategoryGap={12}
            barGap={6}
            maxBarSize={34}
          >
            <CartesianGrid stroke="#e6e8ec" strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickMargin={isYearTickMode ? 10 : 6}
              tick={
                enableYearTickClick && axis === "year"
                  ? (props) => (
                      <AnalyticsYearTickButton
                        x={props?.x}
                        y={props?.y}
                        value={props?.payload?.value}
                        onSelect={onYearTickClick}
                      />
                    )
                  : undefined
              }
              tickFormatter={(value) => formatPeriodLabel(axis, value)}
            />
            <YAxis allowDecimals={false} domain={[0, yAxisConfig.max]} ticks={yAxisConfig.ticks} />
            <Tooltip
              cursor={false}
              content={<AnalyticsTooltip seriesKeys={seriesKeys} seriesMode={seriesMode} axis={axis} />}
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
        ) : null}
      </div>
    </div>
  );
};

export default RetirementAnalyticsChartMolecule;
