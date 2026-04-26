import flauntMark from "@/assets/flaunt-mark.jpg";
import flauntFullLogo from "@/assets/flaunt-logo.jpg";

interface FlauntLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "full";
}

export function FlauntLogo({ size = "md", variant = "mark" }: FlauntLogoProps) {
  if (variant === "full") {
    const h = size === "lg" ? "h-16 md:h-20" : size === "sm" ? "h-9" : "h-12";
    return (
      <img
        src={flauntFullLogo}
        alt="flaunt.fit"
        className={`${h} w-auto select-none glow-mark`}
        draggable={false}
      />
    );
  }

  const wrap =
    size === "lg"
      ? "h-14 w-14 md:h-16 md:w-16"
      : size === "sm"
        ? "h-9 w-9"
        : "h-11 w-11";
  const text =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="inline-flex items-center gap-3">
      <div className={`relative ${wrap} rounded-2xl overflow-hidden border border-white/10 shadow-soft`}>
        <img src={flauntMark} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
      <span className={`font-display italic font-bold ${text} tracking-tight leading-none`}>
        flaunt<span className="text-gradient-brand">.fit</span>
      </span>
    </div>
  );
}
