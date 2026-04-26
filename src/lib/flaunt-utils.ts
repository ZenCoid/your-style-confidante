import type { Analysis, HistoryEntry, OccasionId } from "./flaunt-types";

const HISTORY_KEY = "flaunt:history:v1";
const MAX_HISTORY = 5;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: {
  thumbnail: string;
  occasion: OccasionId;
  occasionLabel: string;
  vibeGoal?: string;
  analysis: Analysis;
}): HistoryEntry {
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...entry,
  };
  const current = loadHistory();
  const updated = [newEntry, ...current].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — drop oldest and retry once with smaller payload
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 3)));
    } catch {}
  }
  return newEntry;
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

/** Compress an image File → base64 + small thumbnail data URL */
export async function processImage(
  file: File,
  opts: { maxEdge?: number; thumbEdge?: number; quality?: number } = {},
): Promise<{ base64: string; mimeType: string; previewDataUrl: string; thumbnailDataUrl: string }> {
  const { maxEdge = 1024, thumbEdge = 200, quality = 0.85 } = opts;
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const main = drawScaled(img, maxEdge, quality);
  const thumb = drawScaled(img, thumbEdge, 0.75);

  const base64 = main.dataUrl.split(",")[1] ?? "";
  return {
    base64,
    mimeType: "image/jpeg",
    previewDataUrl: main.dataUrl,
    thumbnailDataUrl: thumb.dataUrl,
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawScaled(img: HTMLImageElement, maxEdge: number, quality: number) {
  const ratio = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return { dataUrl: canvas.toDataURL("image/jpeg", quality), width: w, height: h };
}

export function scoreColorClass(score: number): string {
  if (score >= 8) return "text-score-good";
  if (score >= 5) return "text-score-mid";
  return "text-score-bad";
}

export function scoreBgClass(score: number): string {
  if (score >= 8) return "bg-score-good";
  if (score >= 5) return "bg-score-mid";
  return "bg-score-bad";
}

export function verdictTone(verdict: "yes" | "maybe" | "no") {
  if (verdict === "yes") {
    return {
      label: "It's a yes",
      bg: "bg-score-good/15 border-score-good/40 text-score-good",
      emoji: "✨",
    };
  }
  if (verdict === "maybe") {
    return {
      label: "It's a maybe",
      bg: "bg-score-mid/15 border-score-mid/40 text-score-mid",
      emoji: "🤔",
    };
  }
  return {
    label: "Hard pass — let's fix this",
    bg: "bg-score-bad/15 border-score-bad/40 text-score-bad",
    emoji: "🚫",
  };
}
