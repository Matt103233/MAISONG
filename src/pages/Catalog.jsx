import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Search, ArrowLeft, Loader2, ClipboardPaste, Copy, Check, Trash2, Save, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { STATUS_COLORS, SONG_STATUSES, CAPTION_PLATFORMS } from "@/lib/constants";
import PasteSaveModal from "@/components/catalog/PasteSaveModal";
import SongVersionHistory from "@/components/catalog/SongVersionHistory";

function CopyBox({ label, content, mono = false, editable = false, onChange, rows = 6 }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content || "");
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
      {editable ? (
        <Textarea
          value={content || ""}
          onChange={e => onChange?.(e.target.value)}
          rows={rows}
          className={`border-0 rounded-none bg-black/30 text-white/85 text-sm leading-relaxed focus-visible:ring-0 ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <pre className={`p-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap bg-black/30 ${mono ? "font-mono" : "font-sans"}`}
          style={{ minHeight: `${rows * 1.6}rem` }}>
          {content || <span className="text-white/20 italic">—</span>}
        </pre>
      )}
    </div>
  );
}

const TABS = ["lyrics", "style", "captions", "meta", "versions"];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [local, setLocal] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("lyrics");
  const [activeCaption, setActiveCaption] = useState("instagram");
  const [versionLabel, setVersionLabel] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);

  useEffect(() => {
    base44.entities.Song.list("-updated_date", 500).then(data => {
      setSongs(data);
      setLoading(false);
      const songId = searchParams.get("song");
      const pick = songId ? data.find(s => s.id === songId) : data[0];
      if (pick) { setSelected(pick); setLocal(pick); }
    });
  }, []);

  const selectSong = (song) => { setSelected(song); setLocal(song); setActiveTab("lyrics"); };

  const updateLocal = (field, value) => setLocal(s => ({ ...s, [field]: value }));
  const updateCaption = (platform, value) => setLocal(s => ({ ...s, captions: { ...(s.captions || {}), [platform]: value } }));

  const save = async () => {
    setSaving(true);
    await base44.entities.Song.update(local.id, local);
    setSongs(prev => prev.map(s => s.id === local.id ? local : s));
    setSelected(local);
    setSaving(false);
    toast.success("Saved!");
  };

  const deleteSong = async (id) => {
    await base44.entities.Song.delete(id);
    const remaining = songs.filter(s => s.id !== id);
    setSongs(remaining);
    const next = remaining[0] || null;
    setSelected(next); setLocal(next);
    toast.success("Deleted");
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
    }));
    setActiveTab("lyrics");
    toast.success("Restored!");
  };

  const filtered = songs.filter(s => {
    const matchSearch = s.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const grouped = filtered.reduce((acc, song) => {
    const key = song.volume || "Unsorted";
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});

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
          <Music className="w-4 h-4 text-amber-400" />
          <span className="font-bold">My Catalog</span>
          <span className="text-xs text-white/30">{songs.length} songs</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPasteModal(true)} variant="ghost" size="sm" className="text-white/40 hover:text-white border border-white/10 h-8 text-xs">
            <ClipboardPaste className="w-3.5 h-3.5 mr-1" /> Paste & Save
          </Button>
          <Link to="/builder">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 border-0 h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Song
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — all songs */}
        <div className="w-60 border-r border-white/10 bg-[#0d0d15] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-7 text-xs" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {["all", ...SONG_STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize transition-all ${statusFilter === s ? "bg-white/10 border-white/30 text-white" : "border-white/10 text-white/30 hover:border-white/20"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-4 h-4 animate-spin text-white/20" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-white/20 text-xs py-8 px-3">No songs yet.<br />Build one in the Builder.</div>
            ) : (
              Object.entries(grouped).map(([vol, volSongs]) => (
                <div key={vol}>
                  <div className="text-[10px] uppercase tracking-widest text-white/20 px-3 py-2 font-semibold border-b border-white/5">{vol}</div>
                  {volSongs.map(song => (
                    <button key={song.id} onClick={() => selectSong(song)}
                      className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all ${selected?.id === song.id ? "bg-white/8 border-l-2 border-l-purple-500" : "hover:bg-white/5"}`}>
                      <div className="text-sm font-medium text-white truncate">{song.title}</div>
                      <div className="mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[song.status || "draft"]}`}>{song.status || "draft"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        {local ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Song header */}
            <div className="px-6 pt-5 pb-3 border-b border-white/10 bg-[#0d0d15] flex-shrink-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <Input value={local.title || ""} onChange={e => updateLocal("title", e.target.value)}
                    className="text-xl font-bold bg-transparent border-transparent hover:border-white/10 focus-visible:border-white/20 text-white px-0 h-auto py-1 mb-1" />
                  {local.hook_line && <p className="text-amber-300/60 italic text-sm">"{local.hook_line}"</p>}
                  {local.scripture?.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {local.scripture.map(ref => (
                        <span key={ref} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/60 border border-amber-500/20 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" />{ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={save} disabled={saving} size="sm" className="bg-purple-600 hover:bg-purple-700 border-0 h-8 text-xs">
                    <Save className="w-3 h-3 mr-1" />{saving ? "Saving..." : "Save"}
                  </Button>
                  <Button onClick={() => deleteSong(local.id)} size="sm" variant="ghost" className="text-red-400/40 hover:text-red-400 h-8 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex gap-1.5 flex-wrap">
                {SONG_STATUSES.map(s => (
                  <button key={s} onClick={() => updateLocal("status", s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border capitalize transition-all ${local.status === s ? STATUS_COLORS[s] : "border-white/10 text-white/25 hover:border-white/20"}`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-0.5 mt-3 -mb-3">
                {TABS.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${activeTab === t ? "text-white border-b-2 border-purple-400" : "text-white/30 hover:text-white/60"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-6 space-y-4">

              {activeTab === "lyrics" && (
                <CopyBox label="Block 1 — Lyrics" content={local.lyrics_block || ""} editable onChange={v => updateLocal("lyrics_block", v)} rows={24} />
              )}

              {activeTab === "style" && (
                <>
                  <CopyBox label={`Block 2 — Style Tag (${(local.style_tag || "").length}/950 chars)`}
                    content={local.style_tag || ""} editable mono onChange={v => updateLocal("style_tag", v)} rows={5} />
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                      <span className="text-[11px] font-mono font-semibold text-white/40 uppercase tracking-wider">Block 3 — Session Settings</span>
                    </div>
                    <div className="p-4 bg-black/30 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-xs text-white/40 font-mono">Weirdness</span><span className="text-xs font-bold text-purple-300 font-mono">{local.weirdness_pct ?? 25}%</span></div>
                        <input type="range" min="0" max="100" value={local.weirdness_pct ?? 25}
                          onChange={e => updateLocal("weirdness_pct", Number(e.target.value))} className="w-full accent-purple-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-xs text-white/40 font-mono">Style Influence</span><span className="text-xs font-bold text-amber-300 font-mono">{local.style_influence_pct ?? 80}%</span></div>
                        <input type="range" min="0" max="100" value={local.style_influence_pct ?? 80}
                          onChange={e => updateLocal("style_influence_pct", Number(e.target.value))} className="w-full accent-amber-500" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "captions" && (
                <>
                  <div className="flex gap-2 flex-wrap">
                    {CAPTION_PLATFORMS.map(p => (
                      <button key={p.id} onClick={() => setActiveCaption(p.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCaption === p.id ? "bg-blue-500/30 border-blue-400/50 text-blue-200" : "border-white/10 text-white/40 hover:border-white/20"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {CAPTION_PLATFORMS.filter(p => p.id === activeCaption).map(p => (
                    <div key={p.id}>
                      <CopyBox
                        label={`Block 4 — ${p.label} Caption (${(local.captions?.[p.id] || "").length}/${p.maxChars} chars)`}
                        content={local.captions?.[p.id] || ""}
                        editable
                        onChange={v => updateCaption(p.id, v)}
                        rows={6}
                      />
                      <p className="text-xs text-white/25 mt-1 px-1">{p.note}</p>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "meta" && (
                <div className="space-y-4">
                  {[
                    { field: "hook_line", label: "Hook Line", rows: 1 },
                    { field: "backstory", label: "Backstory", rows: 4 },
                    { field: "production_notes", label: "Production Notes", rows: 3 },
                    { field: "suno_url", label: "Suno URL", rows: 1 },
                    { field: "theme", label: "Theme", rows: 1 },
                    { field: "volume", label: "Volume / Collection", rows: 1 },
                  ].map(({ field, label, rows }) => (
                    <CopyBox key={field} label={label} content={local[field] || ""} editable onChange={v => updateLocal(field, v)} rows={rows} />
                  ))}
                  <div className="flex items-center gap-3 py-2">
                    <button onClick={() => updateLocal("jesus_named", !local.jesus_named)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${local.jesus_named ? "bg-purple-500 border-purple-400" : "border-white/20"}`}>
                      {local.jesus_named && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="text-sm text-white/50">Jesus named directly in lyrics</span>
                  </div>
                </div>
              )}

              {activeTab === "versions" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/50 mb-3">Save current state as a version</h3>
                    <div className="flex gap-2">
                      <Input value={versionLabel} onChange={e => setVersionLabel(e.target.value)}
                        placeholder="Label (e.g. 'After bridge rework')..."
                        className="bg-white/5 border-white/10 text-white text-sm"
                        onKeyDown={e => e.key === "Enter" && saveVersion()} />
                      <Button onClick={saveVersion} disabled={!versionLabel.trim() || savingVersion}
                        className="bg-purple-600 hover:bg-purple-700 border-0 flex-shrink-0">
                        <Clock className="w-3.5 h-3.5 mr-1" />{savingVersion ? "..." : "Save"}
                      </Button>
                    </div>
                  </div>
                  <SongVersionHistory songId={local.id} onRestore={restoreVersion} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
            <Music className="w-16 h-16 opacity-20" />
            <p>Select a song or build a new one</p>
          </div>
        )}
      </div>

      {showPasteModal && <PasteSaveModal onClose={() => setShowPasteModal(false)} onSaved={(song) => { setSongs(prev => [song, ...prev]); selectSong(song); setShowPasteModal(false); }} />}
    </div>
  );
}