import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Button from "@/shared/ui/Button";
import { MoveDiagonal, Minimize2 } from "lucide-react";
import SummaryDonutCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutCenter";
import SummaryDonutMiniCenter from "@/features/retirementAnalytics/components/molecules/SummaryDonutMiniCenter";
import AnalyticsDonutChart from "@/features/retirementAnalytics/components/molecules/AnalyticsDonutChart";

const EMPTY_DONUT_KEY = "__empty__";
const EMPTY_DONUT_DATA = [{ name: EMPTY_DONUT_KEY, value: 1, color: "#e5e7eb", percent: 0 }];

const toRenderableDonutData = (data) => {
  const safeData = (Array.isArray(data) ? data : []).filter((item) => Number(item?.value ?? 0) > 0);
  if (safeData.length === 0) return EMPTY_DONUT_DATA;

  const total = safeData.reduce((sum, item) => sum + Math.max(Number(item?.value ?? 0), 0), 0);
  if (total <= 0) return EMPTY_DONUT_DATA;

  return safeData.map((item) => {
    const safeValue = Math.max(Number(item?.value ?? 0), 0);
    return {
      ...item,
      value: safeValue,
      percent: (safeValue / total) * 100,
    };
  });
};

const formatDonutPercent = (percent) => {
  const safePercent = Number(percent);
  if (!Number.isFinite(safePercent) || safePercent <= 0) return "0.0%";
  return `${safePercent.toFixed(1)}%`;
};

const DonutTooltipContent = ({ active, payload }) => {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;

  const entry = payload[0]?.payload;
  if (!entry) return null;

  const isEmpty = entry?.name === EMPTY_DONUT_KEY;
  const safeValue = isEmpty ? 0 : Math.max(Number(entry?.value ?? 0), 0);
  const percentText = formatDonutPercent(isEmpty ? 0 : entry?.percent);
  const title = isEmpty ? "人数" : String(entry?.name ?? "人数");

  return (
    <div className="analytics-tooltip analytics-donut-tooltip">
      <div className="analytics-tooltip-title">{title}</div>
      <div className="analytics-tooltip-rows analytics-donut-tooltip-rows">
        <div className="analytics-tooltip-row analytics-donut-tooltip-row">
          <span className="analytics-tooltip-label analytics-donut-tooltip-label">人数</span>
          <span className="analytics-tooltip-value analytics-donut-tooltip-value">{safeValue}人</span>
        </div>
        <div className="analytics-tooltip-row analytics-donut-tooltip-row">
          <span className="analytics-tooltip-label analytics-donut-tooltip-label">割合</span>
          <span className="analytics-tooltip-value analytics-donut-tooltip-value">{percentText}</span>
        </div>
      </div>
    </div>
  );
};

const SummaryPieCardView = ({
  pieGroups,
  isChartMaximized,
  onToggleMaximize,
  onSliceClick,
  layoutMode = "single",
}) => {
  // 最大化時にCSSで非表示にするだけだと、Recharts(ResponsiveContainer)が width/height 0 で警告を出す。
  // UIとしては非表示なので、描画自体をスキップしてノイズを止める。
  if (isChartMaximized && layoutMode !== "triple-row") {
    return null;
  }

  const safeGroups = Array.isArray(pieGroups) ? pieGroups : [];
  const displayGroup = safeGroups.find((group) => group.id === "filtered") ?? safeGroups[0];
  const miniFirstGroup = safeGroups.find((group) => group.id === "eligible-window") ?? safeGroups[1];
  const miniSecondGroup = safeGroups.find((group) => group.id === "eligible-total") ?? safeGroups[2];

  const displayCount = Math.max(Number(displayGroup?.total ?? 0), 0);
  const miniFirstCount = Math.max(Number(miniFirstGroup?.total ?? 0), 0);
  const miniSecondCount = Math.max(Number(miniSecondGroup?.total ?? 0), 0);
  const mainData = toRenderableDonutData(displayGroup?.data);
  const miniFirstData = toRenderableDonutData(miniFirstGroup?.data);
  const miniSecondData = toRenderableDonutData(miniSecondGroup?.data);
  const tripleGroups = [displayGroup, miniFirstGroup, miniSecondGroup].filter(Boolean).map((group) => ({
    ...group,
    chartData: toRenderableDonutData(group?.data),
  }));

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
            className="analytics-toggle-button analytics-icon-only-button analytics-detail-icon-button icon-tooltip-trigger"
            aria-label={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
            data-tooltip={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
            onClick={onToggleMaximize}
          >
            {isChartMaximized ? (
              <Minimize2 className="manager-edit-icon" size={20} aria-hidden="true" />
            ) : (
              <MoveDiagonal className="manager-edit-icon" size={20} aria-hidden="true" />
            )}
          </Button>
        </div>

        <div className="analytics-pie-triple-grid" aria-label="概要ドーナツ（複数グラフ）">
          {tripleGroups.map((group, index) => (
            <section
              key={group.id}
              className={`analytics-pie-triple-item ${index === 0 ? "analytics-pie-triple-item--display" : ""}`}
              aria-label={group.title}
            >
              <div className="analytics-pie-triple-wrap">
                <AnalyticsDonutChart
                  data={group.chartData}
                  chartHeight="100%"
                  innerRadius={87}
                  outerRadius={126}
                  paddingAngle={2}
                  strokeWidth={2}
                  emptyKey={EMPTY_DONUT_KEY}
                  tooltipContent={<DonutTooltipContent />}
                  onSliceClick={(key) => onSliceClick?.(group.scope ?? group.id, key, group.selectionSeriesMode)}
                />

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
          className="analytics-toggle-button analytics-icon-only-button analytics-detail-icon-button icon-tooltip-trigger"
          aria-label={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
          data-tooltip={isChartMaximized ? "グラフを最小化" : "グラフを最大化"}
          onClick={onToggleMaximize}
        >
          {isChartMaximized ? (
            <Minimize2 className="manager-edit-icon" size={20} aria-hidden="true" />
          ) : (
            <MoveDiagonal className="manager-edit-icon" size={20} aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="analytics-pie-single" aria-label="概要ドーナツチャート">
        <div className="analytics-pie-wrap">
          <AnalyticsDonutChart
            data={mainData}
            chartHeight={360}
            innerRadius={72}
            outerRadius={106}
            cy="66.5%"
            paddingAngle={2}
            strokeWidth={2}
            emptyKey={EMPTY_DONUT_KEY}
            tooltipContent={<DonutTooltipContent />}
            onSliceClick={(key) => onSliceClick?.("filtered", key)}
          />

          <SummaryDonutCenter
            count={displayCount}
            className="analytics-donut-center--single"
          />
        </div>

        <div className="analytics-donut-mini-row">
          <div className="analytics-donut-mini" aria-label={`${miniFirstGroup?.title ?? "対象社員"}ミニドーナツ`}>
            <AnalyticsDonutChart
              data={miniFirstData}
              chartHeight="100%"
              innerRadius={34}
              outerRadius={56}
              paddingAngle={1}
              strokeWidth={1}
              emptyKey={EMPTY_DONUT_KEY}
              tooltipContent={<DonutTooltipContent />}
              onSliceClick={(key) => onSliceClick?.(miniFirstGroup?.scope ?? "filtered", key, miniFirstGroup?.selectionSeriesMode)}
            />
            <SummaryDonutMiniCenter label={miniFirstGroup?.title ?? "対象社員"} count={miniFirstCount} />
          </div>

          <div className="analytics-donut-mini" aria-label={`${miniSecondGroup?.title ?? "全社員"}ミニドーナツ`}>
            <AnalyticsDonutChart
              data={miniSecondData}
              chartHeight="100%"
              innerRadius={34}
              outerRadius={56}
              paddingAngle={1}
              strokeWidth={1}
              emptyKey={EMPTY_DONUT_KEY}
              tooltipContent={<DonutTooltipContent />}
              onSliceClick={(key) => onSliceClick?.(miniSecondGroup?.scope ?? "filtered", key, miniSecondGroup?.selectionSeriesMode)}
            />
            <SummaryDonutMiniCenter label={miniSecondGroup?.title ?? "全社員"} count={miniSecondCount} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SummaryPieCardView;
