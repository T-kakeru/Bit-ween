import { Cell, Pie, PieChart } from "recharts";

type SegmentType = "active" | "resigned";

type DataVolumeIndicatorProps = {
  current: number;
  total: number;
  activeCount: number;
  resignedCount: number;
  onSegmentClick?: (segment: SegmentType) => void;
  size?: number;
};

const COLOR_ACTIVE = "#bfdbfe";
const COLOR_RESIGNED = "#fed7aa";

const toSafeNumber = (value: number) => (Number.isFinite(value) ? Math.max(value, 0) : 0);
const toPercent = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
};
const formatPercent = (value: number, total: number) => {
  if (total <= 0) return "0.0";
  return ((value / total) * 100).toFixed(1);
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
        <text x={x} y={y - 6} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700">
          {name}
        </text>
        <text x={x} y={y + 8} textAnchor="middle" fill="#111827" fontSize={fontSize} fontWeight="700">
          {percentText}
        </text>
      </g>
    );
  };

  const outerRadius = Math.max(Math.round(size * 0.45), 42);

  return (
    <aside className="relative shrink-0" style={{ width: size, height: size }} aria-label={`表示件数の内訳 現職${activePercentText}% 退職${resignedPercentText}%`}>
      <PieChart width={size} height={size}>
        <Pie
          data={chartData}
          dataKey="value"
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
        >
          {chartData.map((item) => (
            <Cell
              key={`display-${item.name}`}
              fill={item.fill}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              onClick={() => {
                if (!onSegmentClick) return;
                onSegmentClick(item.segment);
              }}
            />
          ))}
        </Pie>
      </PieChart>
    </aside>
  );
};

export default DataVolumeIndicator;
