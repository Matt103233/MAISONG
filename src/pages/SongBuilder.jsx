import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Sparkles, Music, BookOpen, Mic2,
  Check, Loader2, Copy, Save, RefreshCw, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { id: "ideas", label: "Your Ideas", icon: Sparkles },
  { id: "direction", label: "Song Direction", icon: Music },
  { id: "build", label: "AI Build", icon: Mic2 },
  { id: "refine", label: "Refine & Save", icon: Check },
];

const GENRES = ["Gospel", "R&B Soul", "Hip-Hop", "Worship", "Country", "Pop", "Blues", "Folk/Acoustic"];
const MOODS = ["Uplifting", "Raw/Vulnerable", "Triumphant", "Peaceful", "Melancholic", "Hopeful", "Intense", "Joyful"];
const STRUCTURES = ["Verse / Chorus / Verse / Chorus / Bridge / Chorus", "Verse / Pre-Chorus / Chorus", "AABA", "Verse / Chorus only"];

const SCRIPTURE_THEMES = [
  "redemption", "grace", "grief", "healing", "recovery", "surrender",
  "identity", "purpose", "praise", "family", "hope", "freedom"
];

export default function SongBuilder() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Step 1 — Ideas
  const [rawIdea, setRawIdea] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [selectedThemes, setSelectedThemes] = useState([]);

  // Step 2 — Direction
  const [genre, setGenre] = useState("Gospel");
  const [mood, setMood] = useState("Uplifting");
  const [structure, setStructure] = useState(STRUCTURES[0]);
  const [title, setTitle] = useState("");

  // Step 3 — Output
  const [result, setResult] = useState(null);

  // Step 4 — Refine
  const [editedLyrics, setEditedLyrics] = useState("");
  const [refineNote, setRefineNote] = useState("");

  const toggleTheme = (t) => {
    setSelectedThemes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const buildSong = async () => {
    setLoading(true);
    setStep(2);

    const prompt = `You are SongForge AI — a world-class gospel/Christian lyricist and music producer assistant for Harrison Productions.

Your task: Combine the user's raw ideas and personal notes into a COMPLETE, emotionally powerful, production-ready song.

INPUTS:
- Raw idea / inspiration: "${rawIdea}"
- Personal note or story: "${personalNote || "Not provided"}"
- Themes: ${selectedThemes.join(", ") || "Not specified"}
- Genre: ${genre}
- Mood: ${mood}
- Song structure: ${structure}
- Suggested title: "${title || "Let the AI decide"}"

OUTPUT — Return a JSON object with:
1. "title": A powerful, memorable song title
2. "hook_line": The single most memorable line of the entire song (1 sentence)
3. "lyrics": Complete structured lyrics using [Verse 1], [Chorus], [Verse 2], [Bridge], etc. — emotionally authentic, scripture-informed where relevant, with rhyme and flow
4. "suno_prompt": A detailed Suno AI style prompt (comma-separated descriptors: genre, instruments, vocal style, mood, tempo, production)
5. "backstory": 2-3 sentences on the heart behind this song
6. "scripture_refs": Array of 2-4 Bible verse references that inspired or match this song (e.g. ["Romans 8:1", "Isaiah 61:3"])
7. "production_notes": Key production ideas — tempo, key, instrumentation, feel

Make the lyrics REAL, DEEP, and AUTHENTIC — not generic. Draw from the personal note and raw idea to make this song feel lived-in.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          hook_line: { type: "string" },
          lyrics: { type: "string" },
          suno_prompt: { type: "string" },
          backstory: { type: "string" },
          scripture_refs: { type: "array", items: { type: "string" } },
          production_notes: { type: "string" },
        }
      }
    });

    setResult(res);
    setEditedLyrics(res.lyrics || "");
    setLoading(false);
  };

  const refineLyrics = async () => {
    if (!refineNote.trim()) return;
    setLoading(true);
    const prompt = `You are a professional lyricist. Here are the current lyrics:

${editedLyrics}

The artist wants these specific changes:
"${refineNote}"

Return ONLY the updated complete lyrics, keeping the same structure. Make the changes feel natural and authentic.`;

    const updated = await base44.integrations.Core.InvokeLLM({ prompt });
    setEditedLyrics(updated);
    setRefineNote("");
    setLoading(false);
    toast.success("Lyrics refined!");
  };

  const saveSong = async () => {
    if (!result) return;
    setLoading(true);
    await base44.entities.Song.create({
      title: result.title,
      lyrics: editedLyrics,
      suno_prompt: result.suno_prompt,
      hook_line: result.hook_line,
      backstory: result.backstory,
      production_notes: result.production_notes,
      scripture_refs: result.scripture_refs || [],
      theme: selectedThemes.join(", "),
      style: genre,
      mood,
      status: "draft",
    });
    setSaved(true);
    setLoading(false);
    toast.success("Song saved to My Songs vault!");
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const restart = () => {
    setStep(0);
    setRawIdea(""); setPersonalNote(""); setSelectedThemes([]);
    setGenre("Gospel"); setMood("Uplifting"); setStructure(STRUCTURES[0]); setTitle("");
    setResult(null); setEditedLyrics(""); setRefineNote(""); setSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/studio">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Studio
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-bold">Song Builder</span>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">AI-Powered</Badge>
        </div>
        {step > 0 && step < 3 && (
          <Button onClick={restart} variant="ghost" size="sm" className="text-white/30 hover:text-white/60 h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Start Over
          </Button>
        )}
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 py-5 border-b border-white/5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive ? "bg-purple-600/30 border border-purple-500/40 text-purple-300" :
                isDone ? "bg-green-500/20 border border-green-500/30 text-green-300" :
                "border border-white/10 text-white/25"
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-white/20" />}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">

          {/* ── STEP 0: Ideas ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">What's on your heart?</h2>
                <p className="text-white/40 text-sm">Share your raw ideas, emotions, or the message you want this song to carry. Don't filter — just pour it out.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Raw Idea / Inspiration *</label>
                <Textarea
                  value={rawIdea}
                  onChange={e => setRawIdea(e.target.value)}
                  placeholder="e.g. 'A song about coming out of addiction and finally feeling free. Like standing up after being knocked down for years. The feeling that God never gave up even when I did.'"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[120px] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Personal Note or Story (optional)</label>
                <Textarea
                  value={personalNote}
                  onChange={e => setPersonalNote(e.target.value)}
                  placeholder="Paste a journal entry, prayer, or personal memory. The AI will use this to make the song feel real and lived-in..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[100px] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Themes (pick any that fit)</label>
                <div className="flex flex-wrap gap-2">
                  {SCRIPTURE_THEMES.map(t => (
                    <button key={t} onClick={() => toggleTheme(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${
                        selectedThemes.includes(t)
                          ? "bg-purple-500/30 border-purple-400/50 text-purple-200"
                          : "border-white/10 text-white/40 hover:border-purple-400/30 hover:text-white/60"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(1)}
                disabled={!rawIdea.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold"
              >
                Next: Set Song Direction <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── STEP 1: Direction ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Shape the sound</h2>
                <p className="text-white/40 text-sm">Tell the AI how this song should feel and sound.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Song Title (optional — AI will create one if blank)</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 'Still Standing', 'Grace Found Me Here'..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button key={g} onClick={() => setGenre(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        genre === g ? "bg-purple-500/30 border-purple-400/50 text-purple-200" : "border-white/10 text-white/40 hover:border-white/20"
                      }`}>{g}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        mood === m ? "bg-amber-500/30 border-amber-400/50 text-amber-200" : "border-white/10 text-white/40 hover:border-white/20"
                      }`}>{m}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 block">Song Structure</label>
                <div className="space-y-2">
                  {STRUCTURES.map(s => (
                    <button key={s} onClick={() => setStructure(s)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                        structure === s ? "bg-white/10 border-white/30 text-white" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(0)} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={buildSong}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Build My Song
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Building ── */}
          {step === 2 && loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 to-amber-400/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Building your song...</h3>
                <p className="text-white/40 text-sm">The AI is combining your ideas into a complete lyrical production</p>
              </div>
              <div className="flex gap-1.5">
                {["Analyzing ideas", "Crafting lyrics", "Building Suno prompt", "Finishing touches"].map((label, i) => (
                  <div key={label} className="flex items-center gap-1 text-xs text-white/30">
                    <Loader2 className="w-3 h-3 animate-spin" style={{ animationDelay: `${i * 0.2}s` }} />
                    <span className="hidden sm:block">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Results ── */}
          {step === 2 && !loading && result && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{result.title}</h2>
                  {result.hook_line && (
                    <p className="text-amber-300/80 italic text-base">"{result.hook_line}"</p>
                  )}
                </div>
                <Button onClick={() => setStep(3)} className="bg-purple-600 hover:bg-purple-700 border-0">
                  Refine & Save <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Scripture refs */}
              {result.scripture_refs?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {result.scripture_refs.map(ref => (
                    <span key={ref} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/20 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />{ref}
                    </span>
                  ))}
                </div>
              )}

              {/* Lyrics */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wider">Lyrics</h3>
                  <Button size="sm" variant="ghost" onClick={() => copy(result.lyrics)} className="text-white/30 hover:text-white h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.lyrics}</pre>
              </div>

              {/* Suno Prompt */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-300 text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Mic2 className="w-4 h-4" /> Suno Prompt
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => copy(result.suno_prompt)} className="text-purple-300/40 hover:text-purple-300 h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <p className="text-white/70 text-sm">{result.suno_prompt}</p>
              </div>

              {/* Backstory + Production Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold text-white/50 text-xs uppercase tracking-wider mb-2">Backstory</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{result.backstory}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold text-white/50 text-xs uppercase tracking-wider mb-2">Production Notes</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{result.production_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Refine & Save ── */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Refine & Save</h2>
                <p className="text-white/40 text-sm">Edit lyrics directly, ask the AI for specific changes, then save to your vault.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Lyrics</label>
                  <Button size="sm" variant="ghost" onClick={() => copy(editedLyrics)} className="text-white/30 hover:text-white h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <Textarea
                  value={editedLyrics}
                  onChange={e => setEditedLyrics(e.target.value)}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[300px] leading-relaxed"
                />
              </div>

              {/* AI Refine */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-300 mb-3">Ask AI to refine</h3>
                <div className="flex gap-2">
                  <Input
                    value={refineNote}
                    onChange={e => setRefineNote(e.target.value)}
                    placeholder="e.g. 'Make the bridge more hopeful' or 'Add a pre-chorus' or 'Change verse 2 to focus more on family'..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm flex-1"
                    onKeyDown={e => e.key === "Enter" && refineLyrics()}
                  />
                  <Button onClick={refineLyrics} disabled={!refineNote.trim() || loading}
                    className="bg-purple-600 hover:bg-purple-700 border-0 px-4">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                {saved ? (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl py-3 text-green-300 font-semibold">
                    <Check className="w-5 h-5" /> Saved to My Songs!
                    <Link to="/studio" className="ml-4">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 border-0 h-8 text-xs">Open Studio</Button>
                    </Link>
                  </div>
                ) : (
                  <Button onClick={saveSong} disabled={loading || saved}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save to My Songs Vault
                  </Button>
                )}
              </div>

              {saved && (
                <Button onClick={restart} variant="ghost" className="w-full border border-white/10 text-white/40 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> Build Another Song
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}