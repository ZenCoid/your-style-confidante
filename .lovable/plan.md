# FLAUNT — AI Fashion Stylist

A premium, friend-tone AI stylist that answers **"Does this fit work for where I'm going?"** instead of rating outfits 1-10.

## Stack & key choices
- **Frontend:** React + Vite + Tailwind + shadcn/ui (project default — Next.js isn't supported on Lovable, but the architecture maps cleanly).
- **AI:** Lovable AI Gateway with `google/gemini-2.5-pro` for vision analysis (fair, nuanced) and `google/gemini-2.5-flash` for lighter calls (item tagging, suggestions).
- **Backend:** Lovable Cloud edge functions for the analyze endpoint (keeps the Lovable AI key safe, allows prompt tuning server-side).
- **Storage:** localStorage for analysis history (per your choice). Wardrobe items also stored locally with images as compressed data URLs.
- **Sharing:** Download result as PNG via `html-to-image`.

---

## Design system

- **Background:** Deep navy `hsl(240 40% 6%)` → near-black `hsl(240 35% 4%)` gradient
- **Primary gradient:** Pink `hsl(330 90% 70%)` → Orange `hsl(20 95% 65%)` (for CTAs, the "f", score highlights)
- **Surfaces:** Glassmorphism — `bg-white/[0.03]`, `border-white/10`, `backdrop-blur-xl`
- **Score colors:** Emerald (8+), Amber (5–7.9), Rose (<5)
- **Typography:** Serif italic display for the "f" logo (Playfair or Fraunces), Inter for everything else
- **Motion:** Soft fade/slide on results, pulse on empty state, shimmer on loading

A small reusable `<ScoreBar>`, `<GlassCard>`, `<GradientButton>`, and `<OccasionPill>` will anchor the look.

---

## Phase 1 — Core Analyzer (the heart of the app)

**The one feature that has to feel magical.** Everything else is meaningless if this doesn't sound human.

### Pages / flows
- **Home (`/`)** — Two-column on desktop, stacked on mobile.
  - **Left:** Drag-and-drop upload zone with preview, occasion picker (10 occasions as pills with emoji + tooltip context), optional "vibe goal" text input ("approachable but authoritative"), big gradient **"Analyze My Fit"** button.
  - **Right:** Empty state ("Drop a fit, pick a vibe, get the truth") OR loading shimmer OR results.

### Results display
- **Vibe Check** banner — large quote-style text, the AI's gut reaction
- **Is it a yes?** — big YES / MAYBE / NO badge, color-coded
- **The Good** and **The Fix** in two glass cards
- **Score breakdown** — 5 thin animated bars (overall, occasion match, color game, fit/silhouette, style points), each with a one-word label
- **Items spotted** — pill row of detected garments
- **Final note** — sign-off paragraph
- **Actions:** Download as image, Re-analyze with different occasion, Analyze another fit

### Backend
- Edge function `analyze-outfit` accepts `{ image (base64), mimeType, occasion, vibeGoal? }`
- Calls Lovable AI Gateway with the full system prompt from spec §9, occasion-specific context injected, **structured tool-calling** to guarantee the JSON shape (vibe_check, the_good, the_fix, is_it_a_yes, scores, items_spotted, final_note)
- Handles 429 (rate limit) and 402 (credits) with friendly toasts
- Returns analysis + timestamp; nothing persisted server-side (privacy-first)

### History
- Last 5 analyses stored in localStorage with thumbnail, occasion, overall score, timestamp
- Sidebar drawer or bottom strip to revisit; click reopens the full result
- "Clear history" button

### Sharing
- Download result as a polished portrait PNG (1080×1920, Instagram-story sized) using `html-to-image` — branded with flaunt.fit logo footer

### Validation & errors
- File type check (JPEG/PNG/WebP), 20 MB limit, friendly error messages
- Image client-side compressed to ~1024px max edge before sending (faster + cheaper)
- zod schema on the analysis response so malformed AI output gracefully degrades

**Phase 1 alone is a shippable, lovable product.** Recommend launching here, gathering reactions, then layering phase 2.

---

## Phase 2 — Wardrobe Ghost (the moat)

The actual retention driver per your research.

- **Closet page (`/closet`)** — grid of saved items
- **Add items two ways:**
  1. Single item upload → AI auto-tags (category, color, formality, season) using gemini-2.5-flash
  2. "Bulk scan" — upload one wide photo of a closet/rail, AI segments and proposes items to confirm
- **From any analysis result:** "Save items to closet" button extracts each `items_spotted` entry as a tagged closet entry
- **"Dress me" flow:** pick occasion (+ optional weather note) → AI picks 3 outfit combinations using only items in the user's closet, shown as collages
- All wardrobe data + images stored in localStorage (compressed); a clear "Export my closet" JSON button

---

## Phase 3 — Gap Analysis & Shopping Validator

- **Closet gap report:** AI analyzes the saved wardrobe and surfaces ratio issues ("11 shirts, 2 trousers — one more pair unlocks 14 outfits") and missing essentials per the user's typical occasions
- **Shopping validator:** new upload mode → "I'm thinking of buying this" → AI returns: how many existing items it pairs with, what else you'd need, estimated total to make it functional
- Suggested items shown as text + search links (no commerce integration in MVP)

---

## Phase 4 — Social Runway, Planning Hooks & Notifications

The engagement layer — built last, after core utility is proven.

- **Challenge Arena (`/runway`)** — weekly themed prompts ("Best Lahore summer wedding fit", "Monochrome Monday"). Opt-in submissions, category-based community voting, badges only (no global leaderboard, per the toxicity warnings in your research). Requires Lovable Cloud accounts at this phase — we'll add auth then.
- **"Steal this look"** — tap a winning entry, AI reverse-engineers the closest version from your own closet
- **Morning hook:** browser push notification ("What are you wearing today?") with a one-tap upload — optional, user toggles in settings
- **Event planner:** "What should I wear to [event] on [date]?" — combines occasion + manually entered weather/location → outfit suggestions from closet (calendar/weather APIs deferred)

---

## Cultural & inclusivity details (woven through all phases)
- The 10 occasions ship with rich, culturally-aware context strings — Dholki/Mehndi, Nikah, Wedding Guest get specific guidance baked into the system prompt
- Optional **modesty preference** toggle in settings (affects suggestions and feedback tone)
- Color symbolism awareness mentioned in the system prompt so the AI flags things like white at certain ceremonies

## Privacy posture (marketed clearly)
- Footer + onboarding line: "Your photos are analyzed and discarded. Nothing stored on our servers by default."
- History and wardrobe live only in your browser unless you explicitly export

## What we'll deliberately NOT build (for now)
- Native mobile app (web-first, mobile-responsive)
- Real calendar/weather API integrations (manual entry first, validate demand)
- Global leaderboards (toxicity risk)
- Shopping affiliate integration (out of scope; text suggestions only)

---

## Suggested first deliverable
Approve this plan and I'll build **Phase 1 end-to-end** — the analyzer, all 10 occasions, results display, history, and PNG download — fully polished and ready to test with real outfits. Then we layer phase 2 on top in a follow-up.