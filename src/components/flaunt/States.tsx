import { Loader2 } from "lucide-react";

export function LoadingState() {
  const lines = [
    "Looking at the colors…",
    "Checking the silhouette…",
    "Reading the room for the occasion…",
    "Drafting honest thoughts…",
  ];
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-brand-pink" />
        <div>
          <p className="font-display text-lg">Your stylist is looking…</p>
          <p className="text-xs text-muted-foreground">This usually takes 6–12 seconds.</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 space-y-3">
        {lines.map((l, i) => (
          <div key={l} className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-brand-pink/70 pulse-soft" style={{ animationDelay: `${i * 200}ms` }} />
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-24 shimmer rounded-2xl" />
        <div className="h-32 shimmer rounded-2xl" />
        <div className="h-24 shimmer rounded-2xl" />
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="glass rounded-2xl p-10 text-center min-h-[480px] grid place-items-center">
      <div className="max-w-sm mx-auto">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-brand-soft border border-white/10 pulse-soft">
          <span className="text-4xl" aria-hidden>👀</span>
        </div>
        <h2 className="font-display text-2xl mb-2">Drop a fit, pick a vibe.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I'll tell you the truth — like a stylish friend texting back. No harsh scores, just whether it works for
          where you're going.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["honestly", "tbh", "lowkey", "carrying", "the fix"].map((w) => (
            <span
              key={w}
              className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground"
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
