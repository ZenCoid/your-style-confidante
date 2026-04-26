// Edge function: analyze-outfit
// Calls Lovable AI Gateway with vision + structured tool-calling for guaranteed JSON shape.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  image: string; // base64, no data: prefix
  mimeType: string;
  occasion: string;
  occasionLabel?: string;
  occasionContext?: string;
  vibeGoal?: string;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function validate(body: unknown): { ok: true; data: RequestBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  if (typeof b.image !== "string" || b.image.length < 100) return { ok: false, error: "Missing image" };
  if (b.image.length > 14_000_000) return { ok: false, error: "Image too large" };
  if (typeof b.mimeType !== "string" || !ALLOWED_MIME.has(b.mimeType)) {
    return { ok: false, error: "Unsupported image type. Use JPEG, PNG or WebP." };
  }
  if (typeof b.occasion !== "string" || !b.occasion) return { ok: false, error: "Missing occasion" };
  return {
    ok: true,
    data: {
      image: b.image,
      mimeType: b.mimeType,
      occasion: b.occasion,
      occasionLabel: typeof b.occasionLabel === "string" ? b.occasionLabel : b.occasion,
      occasionContext: typeof b.occasionContext === "string" ? b.occasionContext : "",
      vibeGoal: typeof b.vibeGoal === "string" ? b.vibeGoal.slice(0, 280) : undefined,
    },
  };
}

function buildSystemPrompt(occasionLabel: string, occasionContext: string, vibeGoal?: string) {
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

Use the submit_fit_review tool to return your verdict. The "is_it_a_yes" field answers: would you let them leave the house like this for ${occasionLabel}? "yes" = go, "maybe" = with the fix, "no" = please change.`;
}

const reviewTool = {
  type: "function",
  function: {
    name: "submit_fit_review",
    description: "Submit the structured outfit review.",
    parameters: {
      type: "object",
      properties: {
        vibe_check: {
          type: "string",
          description: "1-2 sentences: immediate honest reaction to the outfit, friend-tone.",
        },
        the_good: {
          type: "string",
          description: "2-3 sentences: what's actually working, be specific to items in the photo.",
        },
        the_fix: {
          type: "string",
          description: "1-2 sentences: ONE specific, actionable improvement. Concrete swap or tweak.",
        },
        is_it_a_yes: {
          type: "string",
          enum: ["yes", "maybe", "no"],
          description: "Would you let them leave like this for the occasion?",
        },
        scores: {
          type: "object",
          properties: {
            overall: { type: "number", minimum: 1, maximum: 10 },
            occasion_match: { type: "number", minimum: 1, maximum: 10 },
            color_game: { type: "number", minimum: 1, maximum: 10 },
            fit_silhouette: { type: "number", minimum: 1, maximum: 10 },
            style_points: { type: "number", minimum: 1, maximum: 10 },
          },
          required: ["overall", "occasion_match", "color_game", "fit_silhouette", "style_points"],
          additionalProperties: false,
        },
        items_spotted: {
          type: "array",
          items: { type: "string" },
          description: "Actual garments / accessories visible in the image (e.g. 'black leather jacket', 'white sneakers').",
        },
        final_note: {
          type: "string",
          description: "2-3 sentences: parting thought, like a friend signing off the text.",
        },
      },
      required: ["vibe_check", "the_good", "the_fix", "is_it_a_yes", "scores", "items_spotted", "final_note"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await req.json().catch(() => null);
    const v = validate(json);
    if (!v.ok) {
      return new Response(JSON.stringify({ error: v.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { image, mimeType, occasionLabel, occasionContext, vibeGoal } = v.data;

    const systemPrompt = buildSystemPrompt(occasionLabel ?? "this occasion", occasionContext ?? "", vibeGoal);
    const dataUrl = `data:${mimeType};base64,${image}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Here's my fit for ${occasionLabel}. Be real with me. ${vibeGoal ? `My vibe goal: "${vibeGoal}".` : ""}`,
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [reviewTool],
        tool_choice: { type: "function", function: { name: "submit_fit_review" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "We're getting too many fits at once — try again in a sec." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({
          error: "AI credits exhausted. Top up in Settings → Workspace → Usage to keep styling.",
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "Stylist hit a snag. Try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr: string | undefined = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call in response", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "AI returned an unexpected shape. Try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis: unknown;
    try {
      analysis = JSON.parse(argsStr);
    } catch {
      return new Response(JSON.stringify({ error: "Could not parse stylist response." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        metadata: {
          occasion: v.data.occasion,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("analyze-outfit unhandled error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
