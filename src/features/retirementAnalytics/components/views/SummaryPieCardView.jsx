import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Button from "@/shared/ui/Button";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MoveDiagonal, Minimize2 } from "lucide-react";
import SummaryDonutCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutCenter";
import SummaryDonutMiniCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutMiniCenter";

const EMPTY_DONUT_KEY = "__empty__";
const EMPTY_DONUT_DATA = [{ name: EMPTY_DONUT_KEY, value: 1, color: "#e5e7eb" }];

const toRenderableDonutData = (data) => {
  const safeData = (Array.isArray(data) ? data : []).filter((item) => Number(item?.value ?? 0) > 0);
  return safeData.length > 0 ? safeData : EMPTY_DONUT_DATA;
};

const formatDonutTooltip = (value, name) => {
  if (name === EMPTY_DONUT_KEY) return ["0人", "人数"];
  return [`${value}人`, "人数"];
};

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
  const mainData = toRenderableDonutData(displayGroup?.data);
  const miniMatchedData = toRenderableDonutData(matchedGroup?.data);
  const miniTotalData = toRenderableDonutData(totalGroup?.data);

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
          <Heading level={3}>データの構成比</Heading>
          <Button
            type="button"
            variant="outline"
            size="md"
            className="analytics-toggle-button analytics-icon-only-button"
            aria-label={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
            onClick={onToggleMaximize}
          >
            {isChartMaximized ? (
              <Minimize2 className="manager-edit-icon" size={16} aria-hidden="true" />
            ) : (
              <MoveDiagonal className="manager-edit-icon" size={16} aria-hidden="true" />
            )}
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
                    <Tooltip formatter={formatDonutTooltip} />
                    <Pie
                      data={toRenderableDonutData(group?.data)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={86}
                      outerRadius={120}
                      paddingAngle={2}
                      isAnimationActive={false}
                      onClick={(entry) => {
                        const key = entry?.name;
                        if (!key || key === EMPTY_DONUT_KEY) return;
                        onSliceClick?.(group.id, key);
                      }}
                    >
                      {toRenderableDonutData(group?.data).map((item) => (
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
        <Heading level={3}>データの構成比</Heading>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="analytics-toggle-button analytics-icon-only-button"
          aria-label={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
          onClick={onToggleMaximize}
        >
          {isChartMaximized ? (
            <Minimize2 className="manager-edit-icon" size={16} aria-hidden="true" />
          ) : (
            <MoveDiagonal className="manager-edit-icon" size={16} aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="analytics-pie-single" aria-label="概要ドーナツチャート">
        <div className="analytics-pie-wrap">
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Tooltip formatter={formatDonutTooltip} />
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
                  if (!key || key === EMPTY_DONUT_KEY) return;
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
                    if (!key || key === EMPTY_DONUT_KEY) return;
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

          <div className="analytics-donut-mini" aria-label="全社員ミニドーナツ">
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
                    if (!key || key === EMPTY_DONUT_KEY) return;
                    onSliceClick?.("eligible-total", String(key));
                  }}
                >
                  {miniTotalData.map((item) => (
                    <Cell key={`mini-total-${item.name}`} fill={item.color ?? "#cbd5e1"} stroke="#ffffff" strokeWidth={1} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <SummaryDonutMiniCenter label="全社員" count={totalCount} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SummaryPieCardView;
