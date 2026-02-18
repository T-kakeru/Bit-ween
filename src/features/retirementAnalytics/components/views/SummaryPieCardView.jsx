import Card from "@/shared/ui/Card";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import SummaryDonutCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutCenter";
import SummaryDonutMiniCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutMiniCenter";

const SummaryPieCardView = ({
  pieGroups,
  isChartMaximized,
  onToggleMaximize,
  onSliceClick,
  layoutMode = "single",
}) => {
  const safeGroups = Array.isArray(pieGroups) ? pieGroups : [];
  const displayGroup = safeGroups.find((group) => group.id === "filtered") ?? safeGroups[0];
  const matchedGroup = safeGroups.find((group) => group.id === "eligible-window");
  const totalGroup = safeGroups.find((group) => group.id === "eligible-total");

  const displayCount = Math.max(Number(displayGroup?.total ?? 0), 0);
  const matchedCount = Math.max(Number(matchedGroup?.total ?? 0), 0);
  const totalCount = Math.max(Number(totalGroup?.total ?? 0), 0);
  const displaySeriesData = (Array.isArray(displayGroup?.data) ? displayGroup.data : [])
    .filter((item) => Number(item?.value ?? 0) > 0);

  const mainData =
    displaySeriesData.length > 0
      ? displaySeriesData
      : [
          { name: "該当", value: displayCount, color: "#3b82f6" },
          { name: "残り", value: Math.max(totalCount - displayCount, 0), color: "#f3f4f6" },
        ];

  const miniMatchedData = (Array.isArray(matchedGroup?.data) ? matchedGroup.data : [])
    .filter((item) => Number(item?.value ?? 0) > 0);
  const miniTotalData = (Array.isArray(totalGroup?.data) ? totalGroup.data : [])
    .filter((item) => Number(item?.value ?? 0) > 0);

  const getGroupTotal = (group) => {
    if (Number.isFinite(Number(group?.total))) {
      return Math.max(Number(group.total), 0);
    }

    return (Array.isArray(group?.data) ? group.data : []).reduce(
      (sum, item) => sum + Math.max(Number(item?.value ?? 0), 0),
      0,
    );
  };

  const hiddenClass = isChartMaximized && layoutMode !== "triple-row" ? "analytics-pie-pane is-hidden" : "analytics-pie-pane";

  if (layoutMode === "triple-row") {
    return (
      <Card className="analytics-layout-card analytics-pie-card analytics-pie-row-card transition-all duration-300">
        <div className="analytics-card-title-row">
          <Heading level={3}>概要ドーナツ</Heading>
          <Button type="button" variant="outline" size="sm" onClick={onToggleMaximize}>
            {isChartMaximized ? "グラフの縮小" : "グラフの最大化"}
          </Button>
        </div>

        <div className="analytics-pie-triple-grid" aria-label="概要ドーナツ（3グラフ）">
          {safeGroups.slice(0, 3).map((group, index) => (
            <section
              key={group.id}
              className={`analytics-pie-triple-item ${index === 0 ? "analytics-pie-triple-item--display" : ""}`}
              aria-label={group.title}
            >
              <div className="analytics-pie-triple-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => [`${value}人`, "人数"]} />
                    <Pie
                      data={Array.isArray(group.data) ? group.data : []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={86}
                      outerRadius={120}
                      paddingAngle={2}
                      isAnimationActive={false}
                      onClick={(entry) => {
                        const key = entry?.name;
                        if (!key) return;
                        onSliceClick?.(group.id, key);
                      }}
                    >
                      {(Array.isArray(group.data) ? group.data : []).map((item) => (
                        <Cell key={`${group.id}-${item.name}`} fill={item.color ?? "#cbd5e1"} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <SummaryDonutCenter
                  label={group.title}
                  count={getGroupTotal(group)}
                  className="analytics-donut-center--triple"
                />
              </div>
            </section>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`analytics-layout-card analytics-pie-card transition-all duration-300 ${hiddenClass}`} aria-hidden={isChartMaximized}>
      <div className="analytics-card-title-row">
        <Heading level={3}>概要ドーナツ</Heading>
        <Button type="button" variant="outline" size="sm" onClick={onToggleMaximize}>
          {isChartMaximized ? "グラフの縮小" : "グラフの最大化"}
        </Button>
      </div>

      <div className="analytics-pie-single" aria-label="概要ドーナツチャート">
        <div className="analytics-pie-wrap">
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Tooltip formatter={(value) => [`${value}人`, "人数"]} />
              <Pie
                data={mainData}
                dataKey="value"
                nameKey="name"
                innerRadius={102}
                outerRadius={148}
                cy="64%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                isAnimationActive={false}
                onClick={(entry) => {
                  const key = entry?.name;
                  if (!key) return;
                  onSliceClick?.("filtered", String(key));
                }}
              >
                {mainData.map((item) => (
                  <Cell
                    key={`filtered-${item.name}`}
                    fill={item.color ?? "#cbd5e1"}
                    stroke="#ffffff"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <SummaryDonutCenter
            count={displayCount}
            className="analytics-donut-center--single"
          />
        </div>

        <div className="analytics-donut-mini-row">
          <div className="analytics-donut-mini" aria-label="該当人数ミニドーナツ">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={miniMatchedData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={56}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={1}
                  isAnimationActive={false}
                  onClick={(entry) => {
                    const key = entry?.name;
                    if (!key) return;
                    onSliceClick?.("eligible-window", String(key));
                  }}
                >
                  {miniMatchedData.map((item) => (
                    <Cell key={`mini-matched-${item.name}`} fill={item.color ?? "#cbd5e1"} stroke="#ffffff" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <SummaryDonutMiniCenter label="該当人数" count={matchedCount} />
          </div>

          <div className="analytics-donut-mini" aria-label="全社員数ミニドーナツ">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={miniTotalData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={56}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={1}
                  isAnimationActive={false}
                  onClick={(entry) => {
                    const key = entry?.name;
                    if (!key) return;
                    onSliceClick?.("eligible-total", String(key));
                  }}
                >
                  {miniTotalData.map((item) => (
                    <Cell key={`mini-total-${item.name}`} fill={item.color ?? "#cbd5e1"} stroke="#ffffff" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <SummaryDonutMiniCenter label="全社員数" count={totalCount} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SummaryPieCardView;
