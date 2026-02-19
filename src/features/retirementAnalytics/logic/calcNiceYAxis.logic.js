const clampNumber = (value, fallback = 0) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const dedupeNumbers = (values) => Array.from(new Set(values)).sort((a, b) => a - b);

/**
 * Y軸の最大値(max)と目盛り(ticks)を「キリの良い単位」で作る。
 * - maxValue: 実データの最大（stackの場合は合計の最大）
 * - multiplier: 現在は通常/最大化ともに 1.1 を使用
 * - 戻り値の max は「maxValue * multiplier 以上」になる
 */
export const calcNiceYAxis = ({
  maxValue,
  multiplier,
  minMax = 1,
  desiredTickCount = 6,
  minTickCount = 4,
  maxTickCount = 8,
} = {}) => {
  const safeMaxValue = Math.max(0, clampNumber(maxValue, 0));
  const safeMultiplier = Math.max(1, clampNumber(multiplier, 1));

  if (safeMaxValue <= 0) {
    return { max: Math.max(1, minMax), step: 1, ticks: [0, Math.max(1, minMax)] };
  }

  const targetMax = Math.max(minMax, safeMaxValue * safeMultiplier);
  const desiredIntervals = Math.max(1, desiredTickCount - 1);
  const roughStep = Math.max(1, targetMax / desiredIntervals);

  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const stepMultipliers = [1, 2, 2.5, 5, 10];
  const magnitudeScales = [0.1, 1, 10];

  const candidateSteps = dedupeNumbers(
    magnitudeScales
      .flatMap((scale) =>
        stepMultipliers.map((m) => {
          const step = m * magnitude * scale;
          return step;
        })
      )
      .filter((step) => Number.isFinite(step) && step >= 1 && Math.round(step) === step)
  );

  const evaluate = (step) => {
    const max = Math.ceil(targetMax / step) * step;
    const tickCount = max / step + 1;

    const tickPenalty =
      tickCount < minTickCount ? (minTickCount - tickCount) * 100 : 0;
    const tickPenalty2 =
      tickCount > maxTickCount ? (tickCount - maxTickCount) * 100 : 0;

    const countPenalty = Math.abs(tickCount - desiredTickCount) * 10;
    const slackPenalty = (max - targetMax) / step;

    const score = tickPenalty + tickPenalty2 + countPenalty + slackPenalty;
    return { step, max, tickCount, score };
  };

  const best = candidateSteps
    .map(evaluate)
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.max !== b.max) return a.max - b.max;
      return a.step - b.step;
    })[0];

  const step = best?.step ?? Math.max(1, Math.round(roughStep));
  const max = best?.max ?? Math.ceil(targetMax / step) * step;
  const tickCount = Math.round(max / step) + 1;
  const ticks = Array.from({ length: tickCount }, (_, i) => i * step);

  return { max, step, ticks };
};
