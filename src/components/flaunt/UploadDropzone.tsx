import { useCallback, useRef, useState } from "react";
import { Upload, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface UploadDropzoneProps {
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function UploadDropzone({ preview, onFile, onClear, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!ALLOWED.includes(file.type)) {
        setError("Please use a JPEG, PNG or WebP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("Image is over the 20 MB limit.");
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile],
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "glass relative aspect-[3/4] w-full overflow-hidden rounded-2xl transition-all cursor-pointer outline-none",
          "hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-brand-pink",
          dragOver && "ring-2 ring-brand-pink bg-white/[0.06]",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {preview ? (
          <>
            <img src={preview} alt="Outfit preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-3 right-3 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background border border-white/15 transition"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
              <p className="text-xs text-muted-foreground">Click to swap photo</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand-soft border border-white/10 pulse-soft">
                <ImagePlus className="h-7 w-7 text-brand-pink" />
              </div>
              <p className="font-display text-xl">Drop your fit here</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or click to upload <span className="text-foreground/80">JPG · PNG · WebP</span>, up to 20 MB
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Upload className="h-3 w-3" /> Photos are analyzed and discarded — never stored.
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-score-bad px-1">{error}</p>}
    </div>
  );
}
