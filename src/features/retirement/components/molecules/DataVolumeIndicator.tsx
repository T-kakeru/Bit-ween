import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { EMPLOYEE_STATUS_LIGHT_COLORS } from "@/shared/logic/chartColorPalettes";

type SegmentType = "active" | "resigned";

type DataVolumeIndicatorProps = {
  current: number;
  total: number;
  activeCount: number;
  resignedCount: number;
  onSegmentClick?: (segment: SegmentType) => void;
  size?: number;
};

const COLOR_ACTIVE = EMPLOYEE_STATUS_LIGHT_COLORS.active;
const COLOR_RESIGNED = EMPLOYEE_STATUS_LIGHT_COLORS.resigned;

const toSafeNumber = (value: number) => (Number.isFinite(value) ? Math.max(value, 0) : 0);
const resolveSegment = (entry: any): SegmentType | null => {
  const bySegment = entry?.segment;
  if (bySegment === "active" || bySegment === "resigned") return bySegment;

  const byName = entry?.name;
  if (byName === "現職") return "active";
  if (byName === "退職") return "resigned";

  return null;
};
const toPercent = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
};
const formatPercent = (value: number, total: number) => {
  if (total <= 0) return "0.0";
  return ((value / total) * 100).toFixed(1);
};

const SegmentTooltipContent = ({ active, payload }: any) => {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;

  const entry = payload[0]?.payload;
  if (!entry) return null;

  const value = toSafeNumber(entry?.rawValue ?? entry?.value);
  const total = toSafeNumber(entry?.total);
  const percentText = formatPercent(value, total);

  return (
    <div className="analytics-tooltip analytics-donut-tooltip">
      <div className="analytics-tooltip-title">{String(entry?.name ?? "-")}</div>
      <div className="analytics-tooltip-rows analytics-donut-tooltip-rows">
        <div className="analytics-tooltip-row analytics-donut-tooltip-row">
          <span className="analytics-tooltip-label analytics-donut-tooltip-label">人数</span>
          <span className="analytics-tooltip-value analytics-donut-tooltip-value">{value}人</span>
        </div>
        <div className="analytics-tooltip-row analytics-donut-tooltip-row">
          <span className="analytics-tooltip-label analytics-donut-tooltip-label">割合</span>
          <span className="analytics-tooltip-value analytics-donut-tooltip-value">{percentText}%</span>
        </div>
      </div>
    </div>
  );
};

const DataVolumeIndicator = ({
  current,
  total,
  activeCount,
  resignedCount,
  onSegmentClick,
  size = 112,// 円グラフのサイズ（幅・高さ）
}: DataVolumeIndicatorProps) => {
  const safeTotal = Math.max(toSafeNumber(total), 1);
  const safeCurrent = Math.min(toSafeNumber(current), safeTotal);
  const safeActive = toSafeNumber(activeCount);
  const safeResigned = toSafeNumber(resignedCount);
  const pieTotal = Math.max(safeActive + safeResigned, 1);
  const activePercentText = formatPercent(safeActive, pieTotal);
  const resignedPercentText = formatPercent(safeResigned, pieTotal);

  const chartData = [
    { name: "現職", value: Math.max(safeActive, 0.0001), fill: COLOR_ACTIVE, segment: "active" as const },
    { name: "退職", value: Math.max(safeResigned, 0.0001), fill: COLOR_RESIGNED, segment: "resigned" as const },
  ];
  const chartDataWithMeta = chartData.map((item) => ({
    ...item,
    rawValue: toSafeNumber(item.value),
    total: safeActive + safeResigned,
  }));

  const renderSliceLabel = (props: any) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      name,
    } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
    const radian = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * radian);
    const y = cy + radius * Math.sin(-midAngle * radian);
    const percentText = `${Math.round((percent ?? 0) * 100)}%`;

    const fontSize = Math.max(9, Math.round(size * 0.09));
    return (
      <g>
        <text x={x} y={y - 8} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700" pointerEvents="none">
          {name}
        </text>
        <text x={x} y={y + 10} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700" pointerEvents="none">
          {percentText}
        </text>
      </g>
    );
  };

  const outerRadius = Math.max(Math.round(size * 0.45), 42);

  return (
    <aside className="relative shrink-0" style={{ width: size, height: size }} aria-label={`表示件数の内訳 現職${activePercentText}% 退職${resignedPercentText}%`}>
      <PieChart width={size} height={size}>
        <Tooltip content={<SegmentTooltipContent />} wrapperStyle={{ zIndex: 30 }} />
        <Pie
          data={chartDataWithMeta}
          dataKey="value"
          rootTabIndex={-1}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={0}
          outerRadius={outerRadius}
          stroke="#ffffff"
          strokeWidth={2}
          paddingAngle={1}
          isAnimationActive={false}
          label={renderSliceLabel}
          labelLine={false}
          onClick={(entry) => {
            if (!onSegmentClick) return;
            const segment = resolveSegment(entry);
            if (!segment) return;
            onSegmentClick(segment);
          }}
        >
          {chartDataWithMeta.map((item) => (
            <Cell
              key={`display-${item.name}`}
              fill={item.fill}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              aria-label={`${item.name}セグメント`}
            />
          ))}
        </Pie>
      </PieChart>
    </aside>
  );
};

export default DataVolumeIndicator;
