import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const AnalyticsDonutChart = ({
  data,
  chartHeight = "100%",
  innerRadius,
  outerRadius,
  cy,
  paddingAngle = 2,
  strokeWidth = 2,
  startAngle = 90,
  endAngle = -270,
  isAnimationActive = false,
  emptyKey = "__empty__",
  onSliceClick,
  tooltipContent,
}) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Tooltip content={tooltipContent} />
        <Pie
          data={safeData}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          paddingAngle={paddingAngle}
          isAnimationActive={isAnimationActive}
          onClick={(entry) => {
            const key = entry?.name;
            if (!key || key === emptyKey) return;
            onSliceClick?.(String(key));
          }}
        >
          {safeData.map((item) => (
            <Cell
              key={String(item?.name ?? "")}
              fill={item?.color ?? "#cbd5e1"}
              stroke="#ffffff"
              strokeWidth={strokeWidth}
              style={onSliceClick ? { cursor: "pointer" } : undefined}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsDonutChart;
