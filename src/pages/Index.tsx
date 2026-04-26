import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw, Sparkles, Wand2, Lock } from "lucide-react";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { FlauntLogo } from "@/components/flaunt/FlauntLogo";
import { UploadDropzone } from "@/components/flaunt/UploadDropzone";
import { OccasionPicker } from "@/components/flaunt/OccasionPicker";
import { ResultsCard, ShareableCard } from "@/components/flaunt/ResultsCard";
import { EmptyState, LoadingState } from "@/components/flaunt/States";
import { HistoryStrip } from "@/components/flaunt/HistoryStrip";

import {
  AnalysisSchema,
  OCCASIONS,
  type Analysis,
  type HistoryEntry,
  type OccasionId,
} from "@/lib/flaunt-types";
import { loadHistory, processImage, saveHistoryEntry, clearHistory } from "@/lib/flaunt-utils";

interface PendingImage {
  base64: string;
  mimeType: string;
  previewDataUrl: string;
  thumbnailDataUrl: string;
}

const Index = () => {
  const { toast } = useToast();

  // Inputs
  const [pending, setPending] = useState<PendingImage | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [vibeGoal, setVibeGoal] = useState("");

  // Status
  const [loading, setLoading] = useState(false);

  // Result (current display — may come from a fresh analysis OR a history click)
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [resultOccasion, setResultOccasion] = useState<OccasionId | null>(null);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Refs
  const shareRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const occasionMeta = useMemo(() => {
    const id = resultOccasion ?? occasion;
    return OCCASIONS.find((o) => o.id === id);
  }, [occasion, resultOccasion]);

  const canAnalyze = !!pending && !!occasion && !loading;

  async function handleFile(file: File) {
    try {
      const processed = await processImage(file);
      setPending(processed);
      // Reset previous result if user picks a new photo
      setAnalysis(null);
      setResultPreview(null);
      setResultOccasion(null);
    } catch {
      toast({
        title: "Couldn't read that image",
        description: "Try a different file.",
        variant: "destructive",
      });
    }
  }

  function handleClearImage() {
    setPending(null);
  }

  async function handleAnalyze() {
    if (!pending || !occasion) return;
    const occ = OCCASIONS.find((o) => o.id === occasion);
    if (!occ) return;

    setLoading(true);
    setAnalysis(null);
    setResultPreview(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-outfit", {
        body: {
          image: pending.base64,
          mimeType: pending.mimeType,
          occasion: occ.id,
          occasionLabel: occ.label,
          occasionContext: occ.aiContext,
          vibeGoal: vibeGoal.trim() || undefined,
        },
      });

      if (error) {
        // edge function returned non-2xx; supabase wraps it
        const ctx = (error as any).context;
        let message = error.message || "Analysis failed.";
        try {
          if (ctx?.body) {
            const parsed = typeof ctx.body === "string" ? JSON.parse(ctx.body) : ctx.body;
            if (parsed?.error) message = parsed.error;
          }
        } catch {}
        toast({ title: "Stylist's busy", description: message, variant: "destructive" });
        return;
      }

      const validated = AnalysisSchema.safeParse(data?.analysis);
      if (!validated.success) {
        console.error("Schema mismatch", validated.error);
        toast({
          title: "Got a weird response",
          description: "Try analyzing again — sometimes the stylist mumbles.",
          variant: "destructive",
        });
        return;
      }

      setAnalysis(validated.data);
      setResultPreview(pending.previewDataUrl);
      setResultOccasion(occ.id);

      const saved = saveHistoryEntry({
        thumbnail: pending.thumbnailDataUrl,
        occasion: occ.id,
        occasionLabel: occ.label,
        vibeGoal: vibeGoal.trim() || undefined,
        analysis: validated.data,
      });
      setHistory((h) => [saved, ...h].slice(0, 5));

      // Smooth scroll into view on mobile
      setTimeout(() => {
        resultsScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      console.error(err);
      toast({
        title: "Couldn't connect",
        description: "Check your network and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!shareRef.current) return;
    try {
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1920,
      });
      const link = document.createElement("a");
      link.download = `flaunt-fit-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Saved", description: "Your flaunt card is in your downloads." });
    } catch (e) {
      console.error(e);
      toast({
        title: "Couldn't save image",
        description: "Try again or screenshot the page.",
        variant: "destructive",
      });
    }
  }

  function handleReanalyzeWithDifferentOccasion() {
    setAnalysis(null);
    setResultPreview(null);
    setResultOccasion(null);
    // Keep pending image and let user pick a new occasion
  }

  function handleAnalyzeAnother() {
    setPending(null);
    setOccasion(null);
    setVibeGoal("");
    setAnalysis(null);
    setResultPreview(null);
    setResultOccasion(null);
  }

  function handleHistoryClick(entry: HistoryEntry) {
    setAnalysis(entry.analysis);
    setResultPreview(entry.thumbnail);
    setResultOccasion(entry.occasion);
    setTimeout(() => {
      resultsScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="container max-w-6xl pt-8 pb-4 flex items-center justify-between">
        <FlauntLogo />
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Photos analyzed, never stored
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl pt-2 pb-8 text-center md:text-left">
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
          Don't rate. <span className="text-gradient-brand">Match.</span>
        </h1>
        <p className="mt-3 max-w-xl mx-auto md:mx-0 text-muted-foreground">
          Your AI stylist. Honest, friend-tone feedback on whether your fit actually works for where you're going.
        </p>
      </section>

      {/* Main grid */}
      <section className="container max-w-6xl pb-12">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 items-start">
          {/* Left: inputs */}
          <div className="space-y-5 lg:sticky lg:top-6">
            <UploadDropzone
              preview={pending?.previewDataUrl ?? null}
              onFile={handleFile}
              onClear={handleClearImage}
              disabled={loading}
            />

            <OccasionPicker value={occasion} onChange={setOccasion} disabled={loading} />

            <div>
              <label htmlFor="vibe" className="text-sm font-medium text-foreground/90">
                Vibe goal <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                e.g. "approachable but authoritative", "soft launch energy"
              </p>
              <Input
                id="vibe"
                value={vibeGoal}
                onChange={(e) => setVibeGoal(e.target.value.slice(0, 140))}
                placeholder="What energy are you going for?"
                disabled={loading}
                className="bg-white/[0.03] border-white/10 placeholder:text-muted-foreground/60"
              />
            </div>

            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-brand hover:opacity-95 text-primary-foreground shadow-glow disabled:bg-white/[0.05] disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
            >
              <Wand2 className="h-5 w-5" />
              {loading ? "Reading the fit…" : "Analyze my fit"}
            </Button>

            {!pending && (
              <p className="text-xs text-muted-foreground text-center">Drop a photo to get started.</p>
            )}
            {pending && !occasion && (
              <p className="text-xs text-muted-foreground text-center">Pick where you're going.</p>
            )}
          </div>

          {/* Right: results */}
          <div ref={resultsScrollRef} className="min-w-0">
            {loading ? (
              <LoadingState />
            ) : analysis && resultPreview && occasionMeta ? (
              <div className="space-y-5">
                <ResultsCard
                  analysis={analysis}
                  preview={resultPreview}
                  occasionLabel={occasionMeta.label}
                  occasionEmoji={occasionMeta.emoji}
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="border-white/15 bg-white/[0.03] hover:bg-white/[0.07]"
                  >
                    <Download className="h-4 w-4" /> Save as image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReanalyzeWithDifferentOccasion}
                    className="border-white/15 bg-white/[0.03] hover:bg-white/[0.07]"
                  >
                    <RefreshCw className="h-4 w-4" /> Try a different occasion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAnalyzeAnother}
                    className="border-white/15 bg-white/[0.03] hover:bg-white/[0.07]"
                  >
                    <Sparkles className="h-4 w-4" /> Analyze another fit
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        <HistoryStrip entries={history} onSelect={handleHistoryClick} onClear={handleClearHistory} />
      </section>

      <footer className="container max-w-6xl pb-10 pt-4 text-center text-xs text-muted-foreground">
        <p>
          flaunt.fit · @flaunt.fit · honest fits, no judgement · Photos are processed and discarded — nothing
          stored on our servers.
        </p>
      </footer>

      {/* Off-screen shareable card for PNG export */}
      <div
        aria-hidden
        style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}
      >
        {analysis && resultPreview && occasionMeta && (
          <ShareableCard
            ref={shareRef}
            analysis={analysis}
            preview={resultPreview}
            occasionLabel={occasionMeta.label}
            occasionEmoji={occasionMeta.emoji}
          />
        )}
      </div>
    </main>
  );
};

export default Index;
