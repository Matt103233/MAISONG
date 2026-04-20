import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, FileText, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { THEOLOGICAL_RULES, LYRIC_RULES, STYLE_TAG_RULES, STYLE_PALETTE, CAPTION_PLATFORMS } from "@/lib/constants";

const FULL_PROMPT = `You are SongForge AI — a Christian lyricist and music production assistant.

═══════════════════════════════════════
THEOLOGICAL RULES
═══════════════════════════════════════
${THEOLOGICAL_RULES}

═══════════════════════════════════════
LYRIC FORMATTING RULES
═══════════════════════════════════════
${LYRIC_RULES}

═══════════════════════════════════════
STYLE TAG RULES (Suno Block 2)
═══════════════════════════════════════
${STYLE_TAG_RULES}

═══════════════════════════════════════
AVAILABLE STYLE PALETTE
═══════════════════════════════════════
${STYLE_PALETTE.map(s => `- ${s.label}: ${s.desc}`).join("\n")}

═══════════════════════════════════════
FOUR-BLOCK OUTPUT FORMAT
═══════════════════════════════════════
Every song must output four blocks:

BLOCK 1 — LYRICS
Full lyrics using square bracket structure tags and parentheses for backup vocals.

BLOCK 2 — STYLE TAG
Comma-separated Suno style descriptors. Max 950 chars. No sentences.

BLOCK 3 — SESSION SETTINGS
Title / Weirdness % / Style Influence %

BLOCK 4 — CAPTIONS
${CAPTION_PLATFORMS.map(p => `- ${p.label}: ${p.note}`).join("\n")}

═══════════════════════════════════════
WHEN BUILDING A SONG, ALWAYS CONFIRM:
═══════════════════════════════════════
1. Theme / personal note from the user
2. Musical style (from palette above)
3. Approved scriptures in NASB95
4. Whether Jesus should be named directly
5. Volume / collection name (if applicable)
6. Title (or AI generates)
`.trim();

export default function Prompt() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(FULL_PROMPT);
    setCopied(true);
    toast.success("System prompt copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  const sections = [
    { title: "Theological Rules", content: THEOLOGICAL_RULES, color: "border-amber-500/20 bg-amber-500/5" },
    { title: "Lyric Formatting Rules", content: LYRIC_RULES, color: "border-purple-500/20 bg-purple-500/5" },
    { title: "Style Tag Rules", content: STYLE_TAG_RULES, color: "border-blue-500/20 bg-blue-500/5" },
    { title: "Style Palette", content: STYLE_PALETTE.map(s => `${s.label}: ${s.desc}`).join("\n"), color: "border-green-500/20 bg-green-500/5" },
    {
      title: "Caption Platform Rules",
      content: CAPTION_PLATFORMS.map(p => `${p.label}: ${p.note} (max ${p.maxChars} chars)`).join("\n"),
      color: "border-white/10 bg-white/5"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-bold">System Prompt</span>
        </div>
        <Button onClick={copyPrompt} className={`border-0 h-9 ${copied ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Full Prompt"}
        </Button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Portable System Prompt</h1>
          <p className="text-white/40 text-sm">Copy this to carry your complete rule set into any external AI session (ChatGPT, Claude, etc.) — so your theological, lyrical, and production standards travel with you.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Full Prompt</span>
            <button onClick={copyPrompt} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{FULL_PROMPT}</pre>
        </div>

        <h2 className="font-semibold text-white/60 text-sm uppercase tracking-wider">Rule Sections</h2>
        <div className="space-y-4">
          {sections.map(sec => (
            <div key={sec.title} className={`border rounded-xl p-5 ${sec.color}`}>
              <h3 className="font-semibold text-sm mb-3">{sec.title}</h3>
              <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">{sec.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}