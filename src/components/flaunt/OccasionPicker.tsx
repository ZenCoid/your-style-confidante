import { OCCASIONS, type OccasionId } from "@/lib/flaunt-types";
import { cn } from "@/lib/utils";

interface OccasionPickerProps {
  value: OccasionId | null;
  onChange: (id: OccasionId) => void;
  disabled?: boolean;
}

export function OccasionPicker({ value, onChange, disabled }: OccasionPickerProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/90">Where are you going?</label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
        Context changes everything. Pick the closest match.
      </p>
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(o.id)}
              title={o.description}
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                active
                  ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20",
              )}
            >
              <span aria-hidden>{o.emoji}</span>
              <span className={cn("font-medium", active ? "text-primary-foreground" : "text-foreground/90")}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
