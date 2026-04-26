import { motion } from "framer-motion";
import { SCORE_LABELS, type Scores } from "@/lib/flaunt-types";
import { scoreBgClass, scoreColorClass } from "@/lib/flaunt-utils";
import { cn } from "@/lib/utils";

interface ScoreBarsProps {
  scores: Scores;
  /** Skip motion (useful inside the off-screen ShareableCard for PNG export) */
  staticRender?: boolean;
}

export function ScoreBars({ scores, staticRender = false }: ScoreBarsProps) {
  const order: (keyof Scores)[] = [
    "overall",
    "occasion_match",
    "color_game",
    "fit_silhouette",
    "style_points",
  ];

  return (
    <div className="space-y-3">
      {order.map((key, i) => {
        const value = Number(scores[key] ?? 0);
        const pct = Math.max(0, Math.min(100, (value / 10) * 100));
        const isOverall = key === "overall";

        return (
          <motion.div
            key={key}
            initial={staticRender ? false : { opacity: 0, y: 6 }}
            animate={staticRender ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.35, ease: "easeOut" }}
          >
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
              <motion.div
                className={cn("h-full rounded-full", scoreBgClass(value))}
                initial={staticRender ? false : { width: 0 }}
                animate={staticRender ? { width: `${pct}%` } : { width: `${pct}%` }}
                transition={{
                  delay: 0.1 + 0.07 * i,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
