import { Cell, Pie, PieChart, Tooltip } from "recharts";

type KPIType = "total" | "active" | "resigned";
type SegmentType = "active" | "resigned";

type KPICardProps = {
  label: string;
  value: number;
  activeCount: number;
  resignedCount: number;
  type: KPIType;
  onSegmentClick?: (segment: SegmentType) => void;
  size?: number;
};

const COLOR_ACTIVE = "#bfdbfe";
const COLOR_RESIGNED = "#fed7aa";

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

const buildChartData = ({ activeCount, resignedCount }: { type: KPIType; activeCount: number; resignedCount: number }) => {
  const safeActive = toSafeNumber(activeCount);
  const safeResigned = toSafeNumber(resignedCount);
  return [
    { name: "現職", value: Math.max(safeActive, 0.0001), fill: COLOR_ACTIVE, segment: "active" as const },
    { name: "退職", value: Math.max(safeResigned, 0.0001), fill: COLOR_RESIGNED, segment: "resigned" as const },
  ];
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

const KPICard = ({
  label,
  value,
  activeCount,
  resignedCount,
  type,
  onSegmentClick,
  size = 112,
}: KPICardProps) => {
  const chartData = buildChartData({ type, activeCount, resignedCount });
  const safeActive = toSafeNumber(activeCount);
  const safeResigned = toSafeNumber(resignedCount);
  const safeTotal = Math.max(safeActive + safeResigned, 1);
  const activePercent = toPercent(safeActive, safeTotal);
  const resignedPercent = toPercent(safeResigned, safeTotal);
  const centerPercent = type === "resigned" ? resignedPercent : type === "active" ? activePercent : activePercent;
  const activePercentText = formatPercent(safeActive, safeTotal);
  const resignedPercentText = formatPercent(safeResigned, safeTotal);

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
        <text x={x} y={y - 6} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700" pointerEvents="none">
          {name}
        </text>
        <text x={x} y={y + 8} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700" pointerEvents="none">
          {percentText}
        </text>
      </g>
    );
  };

  const outerRadius = Math.max(Math.round(size * 0.45), 42);

  return (
    <article className="relative shrink-0" style={{ width: size, height: size }} aria-label={`${label}の内訳 現職${activePercentText}% 退職${resignedPercentText}%`}>
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
              key={`${label}-${item.name}`}
              fill={item.fill}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              aria-label={`${item.name}セグメント`}
            />
          ))}
        </Pie>
      </PieChart>
    </article>
  );
};

export default KPICard;
