import { SCORE_LABELS, type Scores } from "@/lib/flaunt-types";
import { scoreBgClass, scoreColorClass } from "@/lib/flaunt-utils";
import { cn } from "@/lib/utils";

export function ScoreBars({ scores }: { scores: Scores }) {
  const order: (keyof Scores)[] = [
    "overall",
    "occasion_match",
    "color_game",
    "fit_silhouette",
    "style_points",
  ];
  return (
    <div className="space-y-3">
      {order.map((key) => {
        const value = Number(scores[key] ?? 0);
        const pct = Math.max(0, Math.min(100, (value / 10) * 100));
        const isOverall = key === "overall";
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span
                className={cn(
                  "text-sm",
                  isOverall ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {SCORE_LABELS[key]}
              </span>
              <span
                className={cn(
                  "tabular-nums font-display font-bold",
                  isOverall ? "text-xl" : "text-sm",
                  scoreColorClass(value),
                )}
              >
                {value.toFixed(1)}
                <span className="text-xs text-muted-foreground font-sans font-normal ml-0.5">/10</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-[width] duration-700 ease-out", scoreBgClass(value))}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
