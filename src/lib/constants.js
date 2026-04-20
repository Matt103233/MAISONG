// ─── Theological & Lyric Rules ───────────────────────────────────────────────
export const THEOLOGICAL_RULES = `
THEOLOGICAL RULES (non-negotiable):
- Scripture references must be NASB95 translation
- Jesus must be named directly at least once unless jesus_named=false is requested
- No prosperity gospel language
- Redemption must be grounded in the cross, not just positive thinking
- Grief and darkness are valid — do not force resolution where none exists
- Use "Lord" / "God" / "Jesus" / "Christ" — not vague "higher power" language
`.trim();

export const LYRIC_RULES = `
LYRIC FORMATTING RULES (Suno v5/v5.5 — critical):
- Square brackets [like this] = structure/stage directions ONLY. Suno reads these as instructions — does NOT sing them.
  Use for: [Intro], [Verse 1 — piano only], [Chorus], [Bridge — voice alone], [Outro — fade]
- Parentheses (like this) = backup vocals / delivery cues. Suno WILL sing/render these.
  Use for: echo lines, harmonies, choir responses, (whispered), (belted), (spoken word)
- NEVER swap them. Stage direction in parens = Suno tries to sing it. Backup vocals in brackets = ignored.
- Rhyme and meter must be intentional and consistent within each section
- Each verse should carry the narrative forward — no filler lines
`.trim();

export const STYLE_TAG_RULES = `
STYLE TAG RULES (Block 2 — Suno):
- Comma-separated SHORT tags only (1-3 words each, max 950 chars, NO full sentences)
- Order: genre → mood/energy → vocal direction → key instruments → production aesthetic → exact BPM → negative prompts last
- Example: "cinematic gospel soul, confessional, weathered raspy baritone, fingerpicked acoustic, cello undertone, brushed snare, warm analog, intimate, 72 BPM, no autotune, no electronic drums"
`.trim();

// ─── Style Palette ───────────────────────────────────────────────────────────
export const STYLE_PALETTE = [
  { id: "gospel_soul", label: "Gospel Soul", desc: "Warm, churchy, Hammond organ, choir swells" },
  { id: "raw_acoustic", label: "Raw Acoustic", desc: "Fingerpicked guitar, intimate, no production gloss" },
  { id: "hip_hop_gospel", label: "Hip-Hop Gospel", desc: "Boom-bap or trap beats, spoken word, street-to-church" },
  { id: "country_faith", label: "Country Faith", desc: "Storytelling, pedal steel, Appalachian grit" },
  { id: "rb_worship", label: "R&B Worship", desc: "Neo-soul harmonies, lush chords, devotional" },
  { id: "blues_lament", label: "Blues Lament", desc: "Delta blues, raw grief, call-and-response" },
  { id: "folk_testimony", label: "Folk Testimony", desc: "Simple, honest, confessional, acoustic" },
  { id: "cinematic_pop", label: "Cinematic Pop", desc: "Orchestral swells, anthemic, radio-ready" },
];

// ─── Caption Platform Rules ───────────────────────────────────────────────────
export const CAPTION_PLATFORMS = [
  { id: "instagram", label: "Instagram", maxChars: 2200, note: "Hooks first, hashtags last, 3–5 emojis max" },
  { id: "tiktok", label: "TikTok", maxChars: 2200, note: "First 3 words must stop the scroll. Trend-aware." },
  { id: "facebook", label: "Facebook", maxChars: 63206, note: "Longer story format, community-feel" },
  { id: "youtube", label: "YouTube", maxChars: 5000, note: "Include scripture ref, production notes, full story" },
  { id: "twitter", label: "Twitter/X", maxChars: 280, note: "One punchy line + scripture ref. No hashtags." },
];

// ─── Song Statuses ────────────────────────────────────────────────────────────
export const SONG_STATUSES = ["draft", "complete", "exported", "published"];

export const STATUS_COLORS = {
  draft: "bg-white/10 text-white/50 border-white/20",
  complete: "bg-green-500/20 text-green-300 border-green-500/30",
  exported: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  published: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};