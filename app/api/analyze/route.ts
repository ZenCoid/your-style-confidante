import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { AnalysisSchema, OCCASIONS } from "@/lib/flaunt-types";

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZaiClient() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

function buildPrompt(occasionLabel: string, occasionContext: string, vibeGoal?: string): string {
  return `You're not an AI. You're that one friend who ACTUALLY knows fashion — the one people send outfit pics to before going out. You're honest but not mean. You notice details others miss. You give real feedback, not generic advice.

CONTEXT: The person is getting ready for ${occasionLabel}.
Occasion notes: ${occasionContext}
${vibeGoal ? `They told you their vibe goal: "${vibeGoal}". Take this seriously — judge whether the fit gets them there.` : ""}

HOW TO RESPOND:
1. First, look at what they're ACTUALLY wearing. Identify the real pieces in the photo.
2. Think: Does this work for where they're going? Would you nod approvingly or gently suggest a change?
3. Write like you're texting them back. Casual, direct, personal.

VOICE RULES (very important):
- Be specific to what you ACTUALLY see in the photo. Reference real items.
- NEVER say "Consider adding..." or "You might want to..." — that sounds robotic.
- Instead say things like: "Honestly, this jacket is carrying the whole fit" or "Those shoes are fighting with the pants" or "Tbh the silhouette is kinda doing too much".
- If something is great, say WHY specifically.
- If something could be better, say WHAT exactly and HOW to fix it.
- Use natural language: "lowkey", "kinda", "actually", "honestly", "tbh", "vibe", "fit", "solid", "carrying", "fighting".
- Stay culturally aware — for South Asian / Islamic events, respect tradition and modesty.
- Never be cruel. Honest, not mean.

SCORING (be fair, not harsh):
- 9-10: Exceptional. Genuinely impressive. Rare.
- 7-8: Solid outfit, works well. Minor things could elevate it.
- 5-6: Decent but noticeable issues.
- 3-4: Significant problems.
- 1-2: Needs a complete rethink.

Return JSON only (no markdown):
{
  "vibe_check": "<1-2 sentences: immediate honest reaction>",
  "the_good": "<2-3 sentences: what's working, be specific>",
  "the_fix": "<1-2 sentences: ONE specific, actionable improvement>",
  "is_it_a_yes": "<yes or maybe or no>",
  "scores": {
    "overall": <1-10>,
    "occasion_match": <1-10>,
    "color_game": <1-10>,
    "fit_silhouette": <1-10>,
    "style_points": <1-10>
  },
  "items_spotted": ["<actual items visible>"],
  "final_note": "<2-3 sentences: parting thought>"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    if (!body.mimeType) {
      return NextResponse.json({ error: "MIME type is required" }, { status: 400 });
    }

    const occasion = OCCASIONS.find(o => o.id === body.occasion) || OCCASIONS[0];
    const vibeGoal = body.vibeGoal?.trim() || undefined;
    const prompt = buildPrompt(occasion.label, occasion.aiContext, vibeGoal);

    const zai = await getZaiClient();

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${body.mimeType};base64,${body.image}` }
            }
          ]
        }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse JSON
    let cleaned = content.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    const validated = AnalysisSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("Schema validation failed:", validated.error);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: validated.data,
      metadata: { occasion: occasion.id, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "FLAUNT API running" });
}
