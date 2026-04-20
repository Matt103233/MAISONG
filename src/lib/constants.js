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

// ─── Source Analysis Rules ────────────────────────────────────────────────────
export const SOURCE_ANALYSIS_RULES = `
═══════════════════════════════════════
HOW TO CAPTURE THE HEART OF SOURCE TEXT
═══════════════════════════════════════

Your job is NOT to rhyme with the title or surface theme. Your job is to preach the argument.

WHAT "CAPTURE THE HEART" MEANS:
1. Read the whole text. Identify the author's actual argument — what they want the listener to see, do, or become. The UNDERLYING MOVE, not the surface topic.
2. Name the central tension. Every worth-writing text hinges on a "vs.": fear vs. faithfulness, my kingdom vs. His kingdom, hiding vs. investing, wound vs. scar. State it.
3. Extract load-bearing imagery. Find the SPECIFIC metaphors, acronyms, examples, and phrases the author used. "Mina in the handkerchief." "DPS." "Turtle beats rabbit." "Well done" vs. "I had so much more for you." These are your hooks — NOT generic worship vocabulary.
4. Match the posture EXACTLY. Active text → active song. Lament text → lament song. A sermon that commands "engage in business" CANNOT become a contemplative silence song. Posture mismatch is the #1 failure mode.
5. Land where the text lands. The outro echoes the final move of the source. No soft endings on hard texts.

THE FIVE FAILURE MODES (memorize and avoid):
1. Rhyming with the title word instead of the content (e.g., text says "wait = engage in business" → song says "wait = sit in silence" — WRONG)
2. Defaulting to generic worship vocabulary when the source had specific imagery
3. Softening a hard text (warning passage becomes comfort song)
4. Hardening a tender text (grief passage becomes battle cry)
5. Forcing a resolution or adding theology the source didn't offer

SECTION-LEVEL RULE: After confirming the check, every section — intro, verses, chorus, bridge, outro — must carry at least one load-bearing image or move from the source. A section with ZERO fingerprint from the source has drifted and must be rewritten before delivering.

WORKED EXAMPLE (Luke 19:11-27, Parable of the Minas):
- Argument: While waiting for Christ's return, stop hiding your gifts and actively invest what He gave you in His kingdom — an audit is coming.
- Tension: My kingdom vs. His kingdom / Fearful hiding vs. Faithful engaging.
- Load-bearing images: Mina in the handkerchief; friction (anxiety/bitterness) vs. fruit (Galatians 5); "Well done" vs. "I had so much more for you"; three servant types (faithful, fearful, foe).
- Posture: Active, confrontational, commissioning. Slight discomfort required.
- Landing: "Here I am, use me. Thy kingdom come, thy will be done."
- Must NOT become: A passive contemplative worship song about sitting in silence — that inverts the sermon entirely.

WHEN THE USER PASTES A SOURCE TEXT:
Your FIRST response is the six-line check below. NEVER lyrics first. Not even a partial lyric.

Output JSON with is_check=true and:
- central_argument: one sentence — the author's underlying move
- central_tension: one sentence — the "vs." this text is built on
- load_bearing_images: array of 3 SPECIFIC images/phrases/examples from the source (NO generic God-language)
- posture: exact posture the text demands (active / receptive / lament / declaration / warning / invitation / commissioning / confrontational)
- landing: one sentence — the final move, the closing call
- drift_to_avoid: one sentence — name the exact wrong song this could become

Only after the user confirms ("looks good", "proceed", "write it", "yes") → write the full song with every section carrying source fingerprints.
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