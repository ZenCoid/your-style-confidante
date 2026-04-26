import { forwardRef } from "react";
import { ScoreBars } from "./ScoreBars";
import { FlauntLogo } from "./FlauntLogo";
import { verdictTone } from "@/lib/flaunt-utils";
import type { Analysis } from "@/lib/flaunt-types";
import { cn } from "@/lib/utils";

interface ResultsCardProps {
  analysis: Analysis;
  preview: string;
  occasionLabel: string;
  occasionEmoji: string;
}

export const ResultsCard = forwardRef<HTMLDivElement, ResultsCardProps>(
  ({ analysis, preview, occasionLabel, occasionEmoji }, ref) => {
    const tone = verdictTone(analysis.is_it_a_yes);

    return (
      <div ref={ref} className="space-y-5">
        {/* Verdict header */}
        <div className="animate-in-up">
          <div
            className={cn(
              "rounded-2xl border px-5 py-4 flex items-center justify-between gap-3",
              tone.bg,
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{tone.emoji}</span>
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80">Verdict</p>
                <p className="font-display font-bold text-xl leading-tight">{tone.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">For</p>
              <p className="font-medium text-foreground">
                <span aria-hidden className="mr-1">{occasionEmoji}</span>
                {occasionLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Vibe check banner */}
        <div className="glass rounded-2xl p-5 animate-in-up" style={{ animationDelay: "60ms" }}>
          <p className="text-xs uppercase tracking-wider text-brand-pink mb-2 font-medium">Vibe check</p>
          <p className="font-display text-lg md:text-xl leading-snug text-foreground">
            "{analysis.vibe_check}"
          </p>
        </div>

        {/* The good + the fix */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 animate-in-up" style={{ animationDelay: "120ms" }}>
            <p className="text-xs uppercase tracking-wider text-score-good mb-2 font-medium">The good</p>
            <p className="text-sm leading-relaxed text-foreground/95">{analysis.the_good}</p>
          </div>
          <div className="glass rounded-2xl p-5 animate-in-up" style={{ animationDelay: "180ms" }}>
            <p className="text-xs uppercase tracking-wider text-brand-orange mb-2 font-medium">The fix</p>
            <p className="text-sm leading-relaxed text-foreground/95">{analysis.the_fix}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="glass rounded-2xl p-5 animate-in-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Scorecard</p>
            <p className="text-[10px] text-muted-foreground/70">words matter more than numbers</p>
          </div>
          <ScoreBars scores={analysis.scores} />
        </div>

        {/* Items spotted */}
        {analysis.items_spotted?.length > 0 && (
          <div className="glass rounded-2xl p-5 animate-in-up" style={{ animationDelay: "300ms" }}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
              Items spotted
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.items_spotted.map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="inline-flex rounded-full px-3 py-1 text-xs bg-gradient-brand-soft border border-white/10 text-foreground/90"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Final note */}
        <div className="glass-strong rounded-2xl p-5 animate-in-up" style={{ animationDelay: "360ms" }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">— signing off</p>
          <p className="font-display italic text-foreground/95 leading-relaxed">{analysis.final_note}</p>
        </div>

        {/* Preview thumbnail (helps when downloaded as image) */}
        <div className="hidden">
          <img src={preview} alt="" />
        </div>
      </div>
    );
  },
);
ResultsCard.displayName = "ResultsCard";

interface ShareableCardProps extends ResultsCardProps {}

/** Portrait, story-sized card for PNG download */
export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ analysis, preview, occasionLabel, occasionEmoji }, ref) => {
    const tone = verdictTone(analysis.is_it_a_yes);
    return (
      <div
        ref={ref}
        className="relative w-[1080px] h-[1920px] p-16 flex flex-col"
        style={{ background: "var(--gradient-bg)", color: "hsl(var(--foreground))" }}
      >
        <div className="flex items-center justify-between">
          <FlauntLogo size="lg" />
          <span className="text-base text-muted-foreground">
            <span aria-hidden className="mr-2">{occasionEmoji}</span>
            {occasionLabel}
          </span>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 items-start flex-1">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-soft">
            <img src={preview} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col gap-7">
            <div className={cn("rounded-3xl border px-7 py-6", tone.bg)}>
              <p className="text-sm uppercase tracking-widest opacity-80">Verdict</p>
              <p className="font-display font-bold text-4xl mt-1">
                <span className="mr-2">{tone.emoji}</span>
                {tone.label}
              </p>
            </div>

            <div className="glass rounded-3xl p-7">
              <p className="text-sm uppercase tracking-widest text-brand-pink mb-3 font-medium">Vibe check</p>
              <p className="font-display text-3xl leading-snug">"{analysis.vibe_check}"</p>
            </div>

            <div className="glass rounded-3xl p-7">
              <p className="text-sm uppercase tracking-widest text-score-good mb-2 font-medium">The good</p>
              <p className="text-xl leading-relaxed text-foreground/95">{analysis.the_good}</p>
            </div>

            <div className="glass rounded-3xl p-7">
              <p className="text-sm uppercase tracking-widest text-brand-orange mb-2 font-medium">The fix</p>
              <p className="text-xl leading-relaxed text-foreground/95">{analysis.the_fix}</p>
            </div>

            <div className="glass rounded-3xl p-7">
              <ScoreBars scores={analysis.scores} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between text-base text-muted-foreground">
          <span className="font-display italic">"{analysis.final_note}"</span>
          <span>@flaunt.fit</span>
        </div>
      </div>
    );
  },
);
ShareableCard.displayName = "ShareableCard";
