import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Loader2, Copy, Check, Music, BookOpen, Mic2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { STYLE_PALETTE, THEOLOGICAL_RULES, LYRIC_RULES, STYLE_TAG_RULES, CAPTION_PLATFORMS, SOURCE_ANALYSIS_RULES } from "@/lib/constants";

function CopyBox({ label, content, mono = false, rows = 6 }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-[11px] font-mono font-semibold text-white/40 uppercase tracking-wider">{label}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/10">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={`p-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap bg-black/30 ${mono ? "font-mono" : "font-sans"}`}
        style={{ minHeight: `${rows * 1.6}rem` }}>
        {content || <span className="text-white/20 italic">—</span>}
      </pre>
    </div>
  );
}

function formatMessage(text) {
  // Replace **bold** with <strong> and newlines with <br>
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser ? "bg-white/8 border border-white/10 text-white/90" : "bg-transparent text-white/80"
      }`}>
        {isUser ? msg.content : (
          <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
        )}
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  "Write a song about grief after losing a parent",
  "A recovery anthem — 5 years sober, still standing",
  "Grace that meets you in the lowest moment",
  "Surrender song — letting go of control",
  "Song about God's faithfulness through failure",
];

export default function Builder() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "What's on your heart? Tell me the theme, a story, or paste a journal entry — I'll build a complete song with lyrics, Suno style tag, and captions." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCaption, setActiveCaption] = useState("instagram");
  const [weirdness, setWeirdness] = useState(25);
  const [styleInfluence, setStyleInfluence] = useState(80);
  const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "output"
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    // Build conversation context
    const conversationHistory = newMessages
      .slice(1) // skip system greeting
      .map(m => `${m.role === "user" ? "USER" : "AI"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are SongForge AI — a world-class Christian lyricist and music producer for Harrison Productions.

${THEOLOGICAL_RULES}

${SOURCE_ANALYSIS_RULES}

${LYRIC_RULES}

${STYLE_TAG_RULES}

CONVERSATION SO FAR:
${conversationHistory}

Based on the conversation above, decide what to do:

A) If the user just pasted a source text (sermon, transcript, devotional, article, journal entry) AND has not yet confirmed a pre-check → return is_check=true with the six analysis fields. Do NOT write lyrics yet.

B) If the user confirmed the pre-check (said "looks good", "proceed", "write it", "yes", etc.) → write the full song.

C) If the user gave a simple theme/idea (not a full source text) → ask 1-2 focused questions OR build directly.

Return JSON with ALL of these fields (use null for unused ones):
- is_check: boolean (true = pre-check response, not lyrics yet)
- central_argument: string or null
- central_tension: string or null
- load_bearing_images: array of strings or null
- posture: string or null
- landing: string or null
- drift_to_avoid: string or null
- is_question: boolean
- question_text: string or null
- title: string or null
- hook_line: string or null
- lyrics: string or null
- style_tag: string or null
- backstory: string or null
- scripture_refs: array of strings or null
- production_notes: string or null
- captions: object { instagram, tiktok, facebook, youtube, twitter } or null`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          is_check: { type: "boolean" },
          central_argument: { type: "string" },
          central_tension: { type: "string" },
          load_bearing_images: { type: "array", items: { type: "string" } },
          posture: { type: "string" },
          landing: { type: "string" },
          drift_to_avoid: { type: "string" },
          is_question: { type: "boolean" },
          question_text: { type: "string" },
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
          },
        }
      }
    });

    if (res.is_check) {
      const checkText = `Before I write, let me confirm I'm capturing the heart of this text:\n\n📌 **Central argument:** ${res.central_argument}\n\n⚡ **Central tension:** ${res.central_tension}\n\n🖼 **Load-bearing images:** ${(res.load_bearing_images || []).map((img, i) => `${i+1}. ${img}`).join(" · ")}\n\n🧭 **Posture:** ${res.posture}\n\n🏁 **Where it lands:** ${res.landing}\n\n⚠️ **What this song must NOT become:** ${res.drift_to_avoid}\n\n---\nDoes this read right? Say "looks good" and I'll write the lyrics.`;
      setMessages(prev => [...prev, { role: "assistant", content: checkText }]);
    } else if (res.is_question && res.question_text) {
      setMessages(prev => [...prev, { role: "assistant", content: res.question_text }]);
    } else if (res.title && res.lyrics) {
      setMessages(prev => [...prev, { role: "assistant", content: `Built "${res.title}" — see the output below. Copy each block directly into Suno.` }]);
      setResult(res);
      setSaved(false);
      setMobileTab("output");
    }
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
      captions: result.captions,
      weirdness_pct: weirdness,
      style_influence_pct: styleInfluence,
      status: "draft",
    });
    setSaved(true);
    setSaving(false);
    toast.success("Saved to catalog!");
  };

  const restart = () => {
    setMessages([{ role: "assistant", content: "What's on your heart? Tell me the theme, a story, or paste a journal entry — I'll build a complete song with lyrics, Suno style tag, and captions." }]);
    setResult(null);
    setSaved(false);
    setInput("");
  };

  const copyAll = () => {
    if (!result) return;
    const all = `BLOCK 1 — LYRICS\n\n${result.lyrics}\n\n---\n\nBLOCK 2 — STYLE TAG\n\n${result.style_tag}\n\n---\n\nBLOCK 3 — SESSION SETTINGS\n\nTitle: ${result.title}\nWeirdness: ${weirdness}%\nStyle Influence: ${styleInfluence}%`;
    navigator.clipboard.writeText(all);
    toast.success("All blocks copied!");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15] flex-shrink-0">
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
        <div className="flex items-center gap-2">
          {result && !saved && (
            <Button onClick={saveSong} disabled={saving} size="sm" className="bg-purple-600 hover:bg-purple-700 border-0 h-8 text-xs">
              <Save className="w-3.5 h-3.5 mr-1" />{saving ? "Saving..." : "Save to Catalog"}
            </Button>
          )}
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg bg-green-500/10">
              <Check className="w-3 h-3" /> Saved
            </div>
          )}
          <button onClick={restart} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1.5 rounded hover:bg-white/5">
            <RotateCcw className="w-3 h-3" /> New Song
          </button>
        </div>
      </header>

      {/* Mobile tab switcher — only shows when result exists */}
      {result && (
        <div className="flex lg:hidden border-b border-white/10 bg-[#0d0d15] flex-shrink-0">
          <button onClick={() => setMobileTab("chat")}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${mobileTab === "chat" ? "text-white border-b-2 border-purple-400" : "text-white/40"}`}>
            Chat
          </button>
          <button onClick={() => setMobileTab("output")}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${mobileTab === "output" ? "text-white border-b-2 border-amber-400" : "text-white/40"}`}>
            Song Output
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className={`flex flex-col w-full lg:max-w-xl border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0 ${result && mobileTab === "output" ? "hidden lg:flex" : "flex"}`} style={{ minHeight: result ? "auto" : "100%" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex items-center gap-1.5 text-white/40 text-sm pt-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Building...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-5 pb-2 space-y-1.5">
              <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Quick starts</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => setInput(p)}
                    className="text-left text-xs text-white/40 hover:text-white/70 px-3 py-2 rounded-lg border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-[#0d0d15]">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Tap to type or paste a journal entry, prayer, or idea..."
                className="bg-white/5 border border-white/20 text-white placeholder:text-white/35 text-sm min-h-[72px] max-h-[180px] resize-none focus-visible:border-purple-500/50"
              />
              <Button onClick={send} disabled={!input.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700 border-0 h-auto px-4 self-stretch">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Output Blocks */}
        <div className={`flex-1 overflow-y-auto p-5 space-y-4 min-h-0 ${result && mobileTab === "chat" ? "hidden lg:block" : "block"}`}>
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full text-white/15 gap-4">
              <Mic2 className="w-14 h-14 opacity-20" />
              <p className="text-sm">Song blocks will appear here</p>
              <p className="text-xs text-white/10 text-center max-w-xs">Each block is a copyable text box — ready to paste directly into Suno, social media, or your notes</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{result.title}</h2>
                  {result.hook_line && <p className="text-amber-300/70 italic text-sm mt-1">"{result.hook_line}"</p>}
                  {result.scripture_refs?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {result.scripture_refs.map(ref => (
                        <span key={ref} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/60 border border-amber-500/20 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" />{ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={copyAll} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-all flex-shrink-0">
                  <Copy className="w-3 h-3" /> Copy Blocks 1–3
                </button>
              </div>

              {/* Block 1 */}
              <CopyBox label="Block 1 — Lyrics" content={result.lyrics} rows={20} />

              {/* Block 2 */}
              <CopyBox label={`Block 2 — Style Tag (${(result.style_tag || "").length}/950 chars)`} content={result.style_tag} mono rows={4} />

              {/* Block 3 */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-[11px] font-mono font-semibold text-white/40 uppercase tracking-wider">Block 3 — Session Settings</span>
                </div>
                <div className="p-4 bg-black/30 space-y-4">
                  <div className="font-mono text-sm text-white/70">Title: {result.title}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-white/50">Weirdness:</span>
                      <span className="font-mono text-sm text-purple-300 font-bold">{weirdness}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weirdness} onChange={e => setWeirdness(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-white/50">Style Influence:</span>
                      <span className="font-mono text-sm text-amber-300 font-bold">{styleInfluence}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={styleInfluence} onChange={e => setStyleInfluence(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Block 4 — Captions */}
              {result.captions && (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-white/40 uppercase tracking-wider mr-2">Block 4 — Caption</span>
                    {CAPTION_PLATFORMS.map(p => (
                      <button key={p.id} onClick={() => setActiveCaption(p.id)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${activeCaption === p.id ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "border-white/10 text-white/30 hover:border-white/20"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <CopyBox label={`${activeCaption} (${(result.captions[activeCaption] || "").length} chars)`}
                    content={result.captions[activeCaption] || ""} rows={5} />
                </div>
              )}

              {/* Backstory */}
              {result.backstory && <CopyBox label="Backstory" content={result.backstory} rows={3} />}
              {result.production_notes && <CopyBox label="Production Notes" content={result.production_notes} rows={2} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}