import { Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/flaunt-types";
import { scoreColorClass } from "@/lib/flaunt-utils";
import { cn } from "@/lib/utils";

interface HistoryStripProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryStrip({ entries, onSelect, onClear }: HistoryStripProps) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-12">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="font-display text-lg">Recent fits</h3>
          <p className="text-xs text-muted-foreground">Stored only on this device.</p>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-score-bad transition"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {entries.map((e) => {
          const score = e.analysis.scores.overall;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="group glass rounded-xl overflow-hidden text-left hover:bg-white/[0.06] transition"
            >
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={e.thumbnail}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground truncate">{e.occasionLabel}</p>
                  <span className={cn("text-sm font-display font-bold tabular-nums", scoreColorClass(score))}>
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
