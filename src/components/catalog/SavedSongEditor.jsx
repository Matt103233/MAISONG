import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Save, Clock, BookOpen, Mic2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CAPTION_PLATFORMS, STATUS_COLORS, SONG_STATUSES } from "@/lib/constants";
import SongVersionHistory from "./SongVersionHistory";

const TABS = [
  { id: "lyrics", label: "Lyrics" },
  { id: "style", label: "Style Tag" },
  { id: "captions", label: "Captions" },
  { id: "meta", label: "Metadata" },
  { id: "versions", label: "Versions" },
];

export default function SavedSongEditor({ song, onUpdate, onDelete }) {
  const [local, setLocal] = useState(song);
  const [activeTab, setActiveTab] = useState("lyrics");
  const [activeCaption, setActiveCaption] = useState("instagram");
  const [saving, setSaving] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);

  const update = (field, value) => setLocal(s => ({ ...s, [field]: value }));

  const save = async () => {
    setSaving(true);
    await base44.entities.Song.update(local.id, local);
    onUpdate(local);
    setSaving(false);
    toast.success("Saved!");
  };

  const copyLyrics = () => { navigator.clipboard.writeText(local.lyrics_block || ""); toast.success("Lyrics copied!"); };
  const copyStyle = () => { navigator.clipboard.writeText(local.style_tag || ""); toast.success("Style tag copied!"); };
  const copyCaption = (platform) => {
    const text = local.captions?.[platform] || "";
    navigator.clipboard.writeText(text);
    toast.success(`${platform} caption copied!`);
  };

  const saveVersion = async () => {
    if (!versionLabel.trim()) return;
    setSavingVersion(true);
    await base44.entities.SongVersion.create({
      song_id: local.id,
      version_label: versionLabel,
      lyrics: local.lyrics_block,
      style_tag: local.style_tag,
      weirdness_pct: local.weirdness_pct,
      style_influence_pct: local.style_influence_pct,
    });
    setVersionLabel("");
    setSavingVersion(false);
    toast.success("Version saved!");
  };

  const restoreVersion = (version) => {
    setLocal(s => ({
      ...s,
      lyrics_block: version.lyrics || s.lyrics_block,
      style_tag: version.style_tag || s.style_tag,
      weirdness_pct: version.weirdness_pct ?? s.weirdness_pct,
      style_influence_pct: version.style_influence_pct ?? s.style_influence_pct,
    }));
    setActiveTab("lyrics");
  };

  const updateCaption = (platform, value) => {
    setLocal(s => ({ ...s, captions: { ...(s.captions || {}), [platform]: value } }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Song Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-[#0d0d15]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <Input
              value={local.title}
              onChange={e => update("title", e.target.value)}
              className="text-xl font-bold bg-transparent border-transparent hover:border-white/10 focus-visible:border-white/20 text-white px-0 h-auto py-0.5 mb-1"
            />
            {local.hook_line && <p className="text-amber-300/70 italic text-sm">"{local.hook_line}"</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" onClick={save} disabled={saving} className="bg-purple-600 hover:bg-purple-700 border-0 h-8 text-xs">
              <Save className="w-3 h-3 mr-1" />{saving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(local.id)} className="text-red-400/40 hover:text-red-400 h-8 px-2">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {SONG_STATUSES.map(s => (
            <button key={s} onClick={() => update("status", s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all capitalize ${local.status === s ? STATUS_COLORS[s] : "border-white/10 text-white/25 hover:border-white/20"}`}>
              {s}
            </button>
          ))}
          {local.volume && <span className="text-[10px] text-white/30 px-2 py-1">{local.volume}</span>}
        </div>

        {/* Scripture refs */}
        {local.scripture?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {local.scripture.map(ref => (
              <span key={ref} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/60 border border-amber-500/20 flex items-center gap-1">
                <BookOpen className="w-2.5 h-2.5" />{ref}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-white/10 bg-[#0d0d15]">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${activeTab === tab.id ? "text-white border-b-2 border-purple-400" : "text-white/30 hover:text-white/60"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {activeTab === "lyrics" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Lyrics</label>
              <button onClick={copyLyrics} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <Textarea
              value={local.lyrics_block || ""}
              onChange={e => update("lyrics_block", e.target.value)}
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[400px] leading-relaxed"
            />
          </div>
        )}

        {activeTab === "style" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Style Tag (Block 2)</label>
                <span className="text-xs text-white/20 ml-2">({(local.style_tag || "").length}/950 chars)</span>
              </div>
              <button onClick={copyStyle} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <Textarea
              value={local.style_tag || ""}
              onChange={e => update("style_tag", e.target.value)}
              className="bg-white/5 border-white/10 text-white font-mono text-sm min-h-[120px]"
            />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-white/40">Weirdness</label>
                  <span className="text-sm font-bold text-purple-300">{local.weirdness_pct ?? 25}%</span>
                </div>
                <input type="range" min="0" max="100" value={local.weirdness_pct ?? 25}
                  onChange={e => update("weirdness_pct", Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-white/40">Style Influence</label>
                  <span className="text-sm font-bold text-amber-300">{local.style_influence_pct ?? 80}%</span>
                </div>
                <input type="range" min="0" max="100" value={local.style_influence_pct ?? 80}
                  onChange={e => update("style_influence_pct", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "captions" && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {CAPTION_PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setActiveCaption(p.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCaption === p.id ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "border-white/10 text-white/40 hover:border-white/20"}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {CAPTION_PLATFORMS.map(p => activeCaption === p.id && (
              <div key={p.id}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{p.label}</span>
                    <span className="text-xs text-white/20 ml-2">{p.note}</span>
                  </div>
                  <button onClick={() => copyCaption(p.id)} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <Textarea
                  value={local.captions?.[p.id] || ""}
                  onChange={e => updateCaption(p.id, e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm min-h-[200px]"
                />
                <div className="text-xs text-white/20 mt-1 text-right">{(local.captions?.[p.id] || "").length} / {p.maxChars}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "meta" && (
          <div className="space-y-4">
            {[
              { field: "hook_line", label: "Hook Line", type: "input" },
              { field: "backstory", label: "Backstory", type: "textarea", rows: 4 },
              { field: "production_notes", label: "Production Notes", type: "textarea", rows: 3 },
              { field: "suno_url", label: "Suno URL", type: "input" },
              { field: "theme", label: "Theme", type: "input" },
              { field: "volume", label: "Volume / Collection", type: "input" },
            ].map(({ field, label, type, rows }) => (
              <div key={field}>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">{label}</label>
                {type === "textarea" ? (
                  <Textarea value={local[field] || ""} onChange={e => update(field, e.target.value)}
                    rows={rows} className="bg-white/5 border-white/10 text-white text-sm" />
                ) : (
                  <Input value={local[field] || ""} onChange={e => update(field, e.target.value)}
                    className="bg-white/5 border-white/10 text-white text-sm" />
                )}
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => update("jesus_named", !local.jesus_named)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${local.jesus_named ? "bg-purple-500 border-purple-400" : "border-white/20"}`}>
                {local.jesus_named && <span className="text-white text-xs">✓</span>}
              </button>
              <span className="text-sm text-white/60">Jesus named directly in lyrics</span>
            </div>
          </div>
        )}

        {activeTab === "versions" && (
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/60 mb-3">Save Current Version</h3>
              <div className="flex gap-2">
                <Input value={versionLabel} onChange={e => setVersionLabel(e.target.value)}
                  placeholder="Version label (e.g. 'After bridge rework')..."
                  className="bg-white/5 border-white/10 text-white text-sm"
                  onKeyDown={e => e.key === "Enter" && saveVersion()} />
                <Button onClick={saveVersion} disabled={!versionLabel.trim() || savingVersion}
                  className="bg-purple-600 hover:bg-purple-700 border-0 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 mr-1" />{savingVersion ? "Saving..." : "Save Version"}
                </Button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white/60 mb-3">Version History</h3>
            <SongVersionHistory songId={local.id} onRestore={restoreVersion} />
          </div>
        )}
      </div>
    </div>
  );
}