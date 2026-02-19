import { Cell, Pie, PieChart, Tooltip } from "recharts";

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

type ManagerCategoryPieProps = {
  chartLabel: string;
  data: PieDatum[];
  size?: number;
};

const toSafeNumber = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(num) ? Math.max(num, 0) : 0;
};

const toPercentText = (value: number, total: number) => {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

const CategoryPieTooltipContent = ({ active, payload }: any) => {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;

  const entry = payload[0]?.payload;
  if (!entry) return null;

  const value = toSafeNumber(entry?.rawValue ?? entry?.value);
  const total = toSafeNumber(entry?.total);
  const percentText = toPercentText(value, total);

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
          <span className="analytics-tooltip-value analytics-donut-tooltip-value">{percentText}</span>
        </div>
      </div>
    </div>
  );
};

const ManagerCategoryPie = ({ chartLabel, data, size = 168 }: ManagerCategoryPieProps) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, item) => sum + toSafeNumber(item?.value), 0);

  const chartData =
    safeData.length > 0
      ? safeData.map((item) => ({
          ...item,
          rawValue: toSafeNumber(item?.value),
          total,
          value: Math.max(toSafeNumber(item?.value), 0.0001),
        }))
      : [{ name: "未選択", value: 1, rawValue: 0, total: 0, fill: "#d1d5db" }];

  const outerRadius = Math.max(Math.round(size * 0.45), 42);

  const renderSliceLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius: sliceOuterRadius, payload } = props;
    const rawValue = toSafeNumber(payload?.rawValue);
    const totalValue = toSafeNumber(payload?.total);
    const percent = totalValue > 0 ? (rawValue / totalValue) * 100 : 0;

    if (percent <= 12) return null;

    const isSmallLabel = percent <= 20;

    const radius = innerRadius + (sliceOuterRadius - innerRadius) * (isSmallLabel ? 0.74 : 0.66);
    const radian = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * radian);
    const y = cy + radius * Math.sin(-midAngle * radian);
    const baseFontSize = Math.max(9, Math.round(size * 0.088));
    const fontSize = isSmallLabel ? Math.max(8, Math.round(baseFontSize * 0.82)) : baseFontSize;
    const topYOffset = isSmallLabel ? 5 : 7;//  ラベルが小さい場合は上下のスペースをさらに詰める
    const bottomYOffset = isSmallLabel ? 8 : 10;// ラベルが小さい場合は上下のスペースをさらに詰める

    return (
      <g>
        <text
          x={x}
          y={y - topYOffset}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={fontSize}
          fontWeight="700"
          pointerEvents="none"
        >
          {String(payload?.name ?? "-")}
        </text>
        <text
          x={x}
          y={y + bottomYOffset}
          textAnchor="middle"
          fill="#0f172a"
          fontSize={fontSize}
          fontWeight="700"
          pointerEvents="none"
        >
          {toPercentText(rawValue, totalValue)}
        </text>
      </g>
    );
  };

  return (
    <article className="relative shrink-0" style={{ width: size, height: size }} aria-label={chartLabel}>
      <PieChart width={size} height={size}>
        <Tooltip content={<CategoryPieTooltipContent />} wrapperStyle={{ zIndex: 30 }} />
        <Pie
          data={chartData}
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
        >
          {chartData.map((item) => (
            <Cell key={`${chartLabel}-${item.name}`} fill={item.fill} stroke="#ffffff" strokeWidth={2} />
          ))}
        </Pie>
      </PieChart>
    </article>
  );
};

export default ManagerCategoryPie;
