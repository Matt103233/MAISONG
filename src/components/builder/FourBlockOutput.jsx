import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { CAPTION_PLATFORMS } from "@/lib/constants";

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {label}
    </button>
  );
}

export default function FourBlockOutput({ result, weirdness, setWeirdness, styleInfluence, setStyleInfluence, onSave, saving, saved }) {
  const [activeCaption, setActiveCaption] = useState("instagram");

  if (!result) return null;

  const block1 = result.lyrics || "";
  const block2 = result.style_tag || "";
  const block3 = `Title: ${result.title}\nWeirdness: ${weirdness}%\nStyle Influence: ${styleInfluence}%`;
  const block4 = result.captions?.[activeCaption] || "";

  const copyAll = () => {
    const all = `BLOCK 1 — LYRICS\n\n${block1}\n\n---\n\nBLOCK 2 — STYLE TAG\n\n${block2}\n\n---\n\nBLOCK 3 — SESSION SETTINGS\n\n${block3}`;
    navigator.clipboard.writeText(all);
    toast.success("All blocks copied!");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{result.title}</h2>
          {result.hook_line && <p className="text-amber-300/80 italic mt-1">"{result.hook_line}"</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white text-xs transition-all">
            <Copy className="w-3 h-3" /> Copy All Blocks
          </button>
          {saved ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs">
              <Check className="w-3 h-3" /> Saved
            </div>
          ) : (
            <Button onClick={onSave} disabled={saving} size="sm" className="bg-purple-600 hover:bg-purple-700 border-0">
              {saving ? "Saving..." : "Save to Catalog"}
            </Button>
          )}
        </div>
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

      {/* Block 1 — Lyrics */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Block 1 — Lyrics</span>
          <CopyButton text={block1} label="Copy Lyrics" />
        </div>
        <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">{block1}</pre>
      </div>

      {/* Block 2 — Style Tag */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Block 2 — Style Tag</span>
            <span className="text-white/20 text-xs ml-2">({block2.length}/950 chars)</span>
          </div>
          <CopyButton text={block2} label="Copy Style" />
        </div>
        <p className="text-white/80 text-sm font-mono leading-relaxed">{block2}</p>
      </div>

      {/* Block 3 — Session Settings */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Block 3 — Session Settings</span>
          <CopyButton text={block3} label="Copy Settings" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-base font-bold text-white truncate">{result.title}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Title</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-purple-300">{weirdness}%</div>
            <input type="range" min="0" max="100" value={weirdness} onChange={e => setWeirdness(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer mt-1" />
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Weirdness</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-amber-300">{styleInfluence}%</div>
            <input type="range" min="0" max="100" value={styleInfluence} onChange={e => setStyleInfluence(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer mt-1" />
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Style Influence</div>
          </div>
        </div>
      </div>

      {/* Block 4 — Captions */}
      {result.captions && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Block 4 — Captions</span>
            <CopyButton text={block4} label="Copy Caption" />
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {CAPTION_PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setActiveCaption(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCaption === p.id ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "border-white/10 text-white/40 hover:border-white/20"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{result.captions[activeCaption] || "—"}</p>
        </div>
      )}

      {/* Backstory + Production Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.backstory && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Backstory</h3>
            <p className="text-white/70 text-sm leading-relaxed">{result.backstory}</p>
          </div>
        )}
        {result.production_notes && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Production Notes</h3>
            <p className="text-white/70 text-sm leading-relaxed">{result.production_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}