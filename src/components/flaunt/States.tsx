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
  const samples = [
    { tag: "vibe check", text: "okay this is actually solid — that jacket is doing a LOT of work." },
    { tag: "the good", text: "neutral palette + tailored shoulders = quiet confidence." },
    { tag: "the fix", text: "swap the white sneakers for clean loafers and you're golden." },
  ];
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-8 md:p-10 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-brand-soft border border-white/10 pulse-soft">
          <span className="text-4xl" aria-hidden>👀</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl mb-2">Drop a fit, pick a vibe.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          I'll text you back like a stylish friend would — no harsh scores, just whether it works
          for where you're going.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {["honestly", "tbh", "lowkey", "carrying", "the fix"].map((w) => (
            <span
              key={w}
              className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground font-display italic"
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Sample preview — shows what feedback looks like, fills space */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-3 px-1">
          A taste of the feedback
        </p>
        <div className="space-y-3">
          {samples.map((s, i) => (
            <div
              key={s.tag}
              className="glass rounded-xl p-4 animate-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-pink mb-1.5 font-medium">
                {s.tag}
              </p>
              <p className="font-display italic text-foreground/90 leading-snug">"{s.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
