import Button from "@/shared/ui/Button";

const AnalyticsYearTickButton = ({ x, y, value, onSelect }) => {
  const label = String(value ?? "");
  const textWidth = Math.max(label.length * 8, 28);
  const buttonWidth = textWidth + 26;
  const buttonHeight = 30;

  return (
    <g transform={`translate(${x},${y})`} className="analytics-year-tick-button">
      <foreignObject
        x={-buttonWidth / 2}
        y={-10}
        width={buttonWidth}
        height={buttonHeight}
        className="analytics-year-tick-fo"
      >
        <div xmlns="http://www.w3.org/1999/xhtml" className="analytics-year-tick-html-wrap">
          <Button
            variant="outline"
            size="sm"
            className="analytics-year-tick-shared-btn"
            onClick={() => onSelect?.(value)}
            title={`${label}年を表示`}
          >
            {label}
          </Button>
        </div>
      </foreignObject>
    </g>
  );
};

export default AnalyticsYearTickButton;
