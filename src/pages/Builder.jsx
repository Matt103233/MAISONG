import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check, ChevronRight, Music } from "lucide-react";
import { toast } from "sonner";
import ScriptureApproval from "@/components/builder/ScriptureApproval";
import FourBlockOutput from "@/components/builder/FourBlockOutput";
import { STYLE_PALETTE, THEOLOGICAL_RULES, LYRIC_RULES, STYLE_TAG_RULES, CAPTION_PLATFORMS } from "@/lib/constants";

const STEPS = [
  { id: "theme", label: "Theme & Ideas" },
  { id: "style", label: "Style" },
  { id: "scripture", label: "Scripture" },
  { id: "build", label: "Build" },
];

export default function Builder() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [theme, setTheme] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [jesusNamed, setJesusNamed] = useState(true);

  // Step 2
  const [selectedStyle, setSelectedStyle] = useState(null);

  // Step 3
  const [suggestedVerses, setSuggestedVerses] = useState([]);
  const [approvedVerses, setApprovedVerses] = useState([]);

  // Step 4
  const [result, setResult] = useState(null);
  const [weirdness, setWeirdness] = useState(25);
  const [styleInfluence, setStyleInfluence] = useState(80);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const suggestScripture = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Christian theologian. Given this song theme, suggest 4 highly relevant Bible verses in NASB95 translation.

Theme: "${theme}"
Personal note: "${personalNote || "Not provided"}"

Return a JSON array of verse objects. Each object must have:
- ref: the verse reference (e.g. "Romans 8:1")
- text: the full verse text in NASB95
- relevance: one sentence explaining why this verse fits the theme`,
      response_json_schema: {
        type: "object",
        properties: {
          verses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ref: { type: "string" },
                text: { type: "string" },
                relevance: { type: "string" },
              }
            }
          }
        }
      }
    });
    setSuggestedVerses(res.verses || []);
    setApprovedVerses((res.verses || []).map(v => v.ref)); // default all approved
    setLoading(false);
    setStep(2);
  };

  const buildSong = async () => {
    setLoading(true);
    setStep(3);

    const approvedTexts = suggestedVerses
      .filter(v => approvedVerses.includes(v.ref))
      .map(v => `${v.ref}: "${v.text}"`)
      .join("\n");

    const styleInfo = STYLE_PALETTE.find(s => s.id === selectedStyle);

    const prompt = `You are SongForge AI — a world-class Christian lyricist and music producer.

${THEOLOGICAL_RULES}

${LYRIC_RULES}

${STYLE_TAG_RULES}

SONG INPUTS:
- Theme: "${theme}"
- Personal note: "${personalNote || "Not provided"}"
- Title: "${title || "AI decides"}"
- Volume/Collection: "${volume || "Not specified"}"
- Musical style: ${styleInfo ? `${styleInfo.label} — ${styleInfo.desc}` : "Not specified"}
- Jesus named directly: ${jesusNamed}
- Approved scriptures (NASB95):
${approvedTexts || "None selected"}

Build the COMPLETE song. For captions, write platform-specific versions following these rules:
${CAPTION_PLATFORMS.map(p => `- ${p.label}: ${p.note} (max ${p.maxChars} chars)`).join("\n")}`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          hook_line: { type: "string" },
          lyrics: { type: "string" },
          style_tag: { type: "string" },
          backstory: { type: "string" },
          scripture_refs: { type: "array", items: { type: "string" } },
          production_notes: { type: "string" },
          captions: {
            type: "object",
            properties: {
              instagram: { type: "string" },
              tiktok: { type: "string" },
              facebook: { type: "string" },
              youtube: { type: "string" },
              twitter: { type: "string" },
            }
          }
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  const saveSong = async () => {
    if (!result) return;
    setSaving(true);
    await base44.entities.Song.create({
      title: result.title,
      lyrics_block: result.lyrics,
      style_tag: result.style_tag,
      hook_line: result.hook_line,
      backstory: result.backstory,
      production_notes: result.production_notes,
      scripture: result.scripture_refs || [],
      theme,
      volume,
      captions: result.captions,
      weirdness_pct: weirdness,
      style_influence_pct: styleInfluence,
      jesus_named: jesusNamed,
      status: "draft",
    });
    setSaved(true);
    setSaving(false);
    toast.success("Saved to catalog!");
  };

  const restart = () => {
    setStep(0); setTheme(""); setPersonalNote(""); setTitle(""); setVolume(""); setJesusNamed(true);
    setSelectedStyle(null); setSuggestedVerses([]); setApprovedVerses([]);
    setResult(null); setWeirdness(25); setStyleInfluence(80); setSaving(false); setSaved(false);
  };

  const toggleVerse = (ref) => {
    setApprovedVerses(prev => prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold">Song Builder</span>
        </div>
        {step > 0 && step < 3 && (
          <button onClick={restart} className="text-xs text-white/30 hover:text-white/60 transition-colors">Start Over</button>
        )}
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 py-4 border-b border-white/5">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive ? "bg-purple-600/30 border border-purple-500/40 text-purple-300" :
                isDone ? "bg-green-500/20 border border-green-500/30 text-green-300" :
                "border border-white/10 text-white/25"
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-white/20" />}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">

          {/* Step 0 — Theme & Ideas */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">What's this song about?</h2>
                <p className="text-white/40 text-sm">Describe the theme, emotion, or message. Be raw and specific.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Theme / Core Idea *</label>
                <Textarea value={theme} onChange={e => setTheme(e.target.value)}
                  placeholder="e.g. 'Standing back up after years of addiction. The shame is real but so is the grace.'"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[100px]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Personal Note / Story (optional)</label>
                <Textarea value={personalNote} onChange={e => setPersonalNote(e.target.value)}
                  placeholder="Paste a journal entry, a prayer, a memory..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Song Title (optional)</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="AI will create one if blank"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Volume / Collection (optional)</label>
                  <Input value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g. Vol. 1, Lent Songs..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setJesusNamed(!jesusNamed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${jesusNamed ? "bg-purple-500 border-purple-400" : "border-white/20"}`}>
                  {jesusNamed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="text-sm text-white/60">Name Jesus directly in the lyrics</span>
              </div>
              <Button onClick={() => setStep(1)} disabled={!theme.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold">
                Next: Choose Style <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 1 — Style */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Choose your style</h2>
                <p className="text-white/40 text-sm">Select the musical palette for this song.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STYLE_PALETTE.map(style => (
                  <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${selectedStyle === style.id ? "bg-purple-500/20 border-purple-400/50" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                    <div className="font-semibold text-sm mb-1">{style.label}</div>
                    <div className="text-white/40 text-xs">{style.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(0)} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={suggestScripture} disabled={!selectedStyle || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Next: Find Scripture <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Scripture */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Approve your scriptures</h2>
                <p className="text-white/40 text-sm">These NASB95 verses matched your theme. Approve the ones to weave into the song.</p>
              </div>
              <ScriptureApproval verses={suggestedVerses} approved={approvedVerses} onToggle={toggleVerse} />
              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={buildSong} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" /> Build My Song
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Build Output */}
          {step === 3 && loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 to-amber-400/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Building your song...</h3>
                <p className="text-white/40 text-sm">Lyrics, style tag, and 5 platform captions</p>
              </div>
            </div>
          )}

          {step === 3 && !loading && result && (
            <div className="space-y-6">
              <FourBlockOutput
                result={result}
                weirdness={weirdness} setWeirdness={setWeirdness}
                styleInfluence={styleInfluence} setStyleInfluence={setStyleInfluence}
                onSave={saveSong} saving={saving} saved={saved}
              />
              {saved && (
                <div className="flex gap-3">
                  <Link to="/catalog" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700 border-0">
                      <Music className="w-4 h-4 mr-2" /> Open in Catalog
                    </Button>
                  </Link>
                  <Button onClick={restart} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">
                    Build Another
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}