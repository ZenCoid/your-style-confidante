import { Sparkles } from "lucide-react";

export function FlauntLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const wrap =
    size === "lg" ? "h-12 w-12 md:h-14 md:w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const f =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";

  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={`relative ${wrap} rounded-xl bg-[hsl(240_45%_10%)] border border-white/10 grid place-items-center shadow-soft`}
      >
        <span className={`font-display italic font-bold ${f} text-gradient-brand leading-none`}>f</span>
        <Sparkles
          className="absolute -top-1 -right-1 h-3.5 w-3.5 text-brand-orange"
          fill="currentColor"
          strokeWidth={1.5}
        />
      </div>
      <span className={`font-display italic font-bold ${cls} tracking-tight`}>
        flaunt<span className="text-gradient-brand">.fit</span>
      </span>
    </div>
  );
}
