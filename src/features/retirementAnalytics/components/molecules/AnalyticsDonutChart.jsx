import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useElementSize } from "@/shared/hooks/useElementSize";

const AnalyticsDonutChart = ({
  data,
  chartHeight = "100%",
  minWidth = 1,
  minHeight = 1,
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
  const { ref, size } = useElementSize();

  const wrapperStyle = {
    width: "100%",
    height: typeof chartHeight === "number" ? `${chartHeight}px` : chartHeight,
    minWidth,
    minHeight,
  };

  const width = Math.floor(size.width);
  const height = Math.floor(size.height);
  const canRenderChart = width > 0 && height > 0;

  return (
    <div ref={ref} style={wrapperStyle}>
      {canRenderChart ? (
        <PieChart width={width} height={height}>
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
      ) : null}
    </div>
  );
};

export default AnalyticsDonutChart;
