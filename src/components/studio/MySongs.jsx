import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Music, Plus, Search, Copy, Trash2, X, Check, BookOpen, Mic2, Tag } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  draft: "bg-white/10 text-white/50 border-white/20",
  complete: "bg-green-500/20 text-green-300 border-green-500/30",
  exported: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  published: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const FIELD_SECTIONS = [
  { key: "lyrics", label: "Lyrics", type: "textarea", rows: 12, mono: true },
  { key: "suno_prompt", label: "Suno Prompt", type: "textarea", rows: 3 },
  { key: "hook_line", label: "Hook Line", type: "input" },
  { key: "production_notes", label: "Production Notes", type: "textarea", rows: 3 },
  { key: "backstory", label: "Backstory", type: "textarea", rows: 4 },
];

export default function MySongs() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [activeSection, setActiveSection] = useState("lyrics");

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    const data = await base44.entities.Song.list("-updated_date", 100);
    setSongs(data);
    setLoading(false);
  };

  const createSong = async () => {
    if (!newTitle.trim()) return;
    const song = await base44.entities.Song.create({ title: newTitle, status: "draft" });
    setSongs((prev) => [song, ...prev]);
    setSelected(song);
    setShowNew(false);
    setNewTitle("");
    toast.success("Song created!");
  };

  const updateSong = async (id, data) => {
    await base44.entities.Song.update(id, data);
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    if (selected?.id === id) setSelected((s) => ({ ...s, ...data }));
  };

  const deleteSong = async (id) => {
    await base44.entities.Song.delete(id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Deleted");
  };

  const copyLyrics = () => {
    navigator.clipboard.writeText(selected?.lyrics || "");
    toast.success("Lyrics copied!");
  };

  const copySunoPrompt = () => {
    navigator.clipboard.writeText(selected?.suno_prompt || "");
    toast.success("Suno prompt copied!");
  };

  // Group songs by album
  const grouped = songs
    .filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc, song) => {
      const key = song.album || "— No Album —";
      if (!acc[key]) acc[key] = [];
      acc[key].push(song);
      return acc;
    }, {});

  // Sort tracks within each album
  Object.values(grouped).forEach((g) => g.sort((a, b) => (a.track_number || 999) - (b.track_number || 999)));

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0d0d15] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search songs..." className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
          </div>
          <Button onClick={() => setShowNew(true)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700 border-0 h-8 text-xs">
            <Plus className="w-3 h-3 mr-1" /> New Song
          </Button>
          {showNew && (
            <div className="mt-3 flex gap-1">
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Song title..." className="bg-white/5 border-white/10 text-white text-xs h-8 flex-1" onKeyDown={(e) => e.key === "Enter" && createSong()} autoFocus />
              <button onClick={createSong} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
              <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {loading ? (
            <div className="text-center text-white/20 text-xs py-8">Loading...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center text-white/20 text-xs py-8">No songs yet</div>
          ) : (
            Object.entries(grouped).map(([album, albumSongs]) => (
              <div key={album}>
                <div className="text-[10px] uppercase tracking-widest text-white/25 px-2 mb-1 font-semibold">{album}</div>
                <div className="space-y-0.5">
                  {albumSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => setSelected(song)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selected?.id === song.id ? "bg-purple-600/20 border border-purple-500/30" : "hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {song.track_number && <span className="text-[10px] text-white/25 w-4 flex-shrink-0">{song.track_number}</span>}
                        <span className="text-sm font-medium text-white truncate flex-1">{song.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 pl-5">
                        <Badge className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[song.status || "draft"]}`}>{song.status || "draft"}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selected ? (
          <>
            {/* Song Header */}
            <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-[#0d0d15]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Input
                    value={selected.title}
                    onChange={(e) => setSelected((s) => ({ ...s, title: e.target.value }))}
                    onBlur={() => updateSong(selected.id, { title: selected.title })}
                    className="text-xl font-bold bg-transparent border-transparent hover:border-white/10 focus-visible:border-white/20 text-white px-0 h-auto py-0.5 mb-2"
                  />
                  <div className="flex flex-wrap gap-2 items-center">
                    <Input value={selected.album || ""} onChange={(e) => setSelected((s) => ({ ...s, album: e.target.value }))} onBlur={() => updateSong(selected.id, { album: selected.album })} placeholder="Album..." className="bg-white/5 border-white/10 text-white/60 placeholder:text-white/20 text-xs h-6 w-36 px-2" />
                    <Input value={selected.theme || ""} onChange={(e) => setSelected((s) => ({ ...s, theme: e.target.value }))} onBlur={() => updateSong(selected.id, { theme: selected.theme })} placeholder="Theme..." className="bg-white/5 border-white/10 text-white/60 placeholder:text-white/20 text-xs h-6 w-32 px-2" />
                    <Input value={selected.style || ""} onChange={(e) => setSelected((s) => ({ ...s, style: e.target.value }))} onBlur={() => updateSong(selected.id, { style: selected.style })} placeholder="Style..." className="bg-white/5 border-white/10 text-white/60 placeholder:text-white/20 text-xs h-6 w-36 px-2" />
                    {selected.hook_line && (
                      <span className="text-xs text-amber-300/70 italic truncate max-w-xs">"{selected.hook_line}"</span>
                    )}
                  </div>
                  {selected.scripture_refs?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {selected.scripture_refs.map((ref) => (
                        <span key={ref} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/20 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" />{ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={copyLyrics} className="text-white/40 hover:text-white h-7 text-xs px-2">
                    <Copy className="w-3 h-3 mr-1" /> Lyrics
                  </Button>
                  {selected.suno_prompt && (
                    <Button size="sm" variant="ghost" onClick={copySunoPrompt} className="text-purple-400/60 hover:text-purple-300 h-7 text-xs px-2">
                      <Mic2 className="w-3 h-3 mr-1" /> Suno
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteSong(selected.id)} className="text-red-400/40 hover:text-red-400 h-7 px-2">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex gap-1.5 mt-3">
                {["draft", "complete", "exported", "published"].map((status) => (
                  <button key={status} onClick={() => updateSong(selected.id, { status })}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all capitalize ${selected.status === status ? STATUS_COLORS[status] : "border-white/10 text-white/25 hover:border-white/20"}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-1 px-6 pt-3 border-b border-white/10 bg-[#0d0d15]">
              {FIELD_SECTIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setActiveSection(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${activeSection === key ? "text-white border-b-2 border-purple-400" : "text-white/30 hover:text-white/60"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Active Section */}
            <div className="flex-1 overflow-y-auto p-6">
              {FIELD_SECTIONS.map(({ key, label, type, rows, mono }) => (
                activeSection === key && (
                  <div key={key}>
                    {type === "textarea" ? (
                      <Textarea
                        value={selected[key] || ""}
                        onChange={(e) => setSelected((s) => ({ ...s, [key]: e.target.value }))}
                        onBlur={() => updateSong(selected.id, { [key]: selected[key] })}
                        placeholder={`${label}...`}
                        rows={rows}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[200px] ${mono ? "font-mono" : ""} text-sm leading-relaxed w-full`}
                      />
                    ) : (
                      <Input
                        value={selected[key] || ""}
                        onChange={(e) => setSelected((s) => ({ ...s, [key]: e.target.value }))}
                        onBlur={() => updateSong(selected.id, { [key]: selected[key] })}
                        placeholder={`${label}...`}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
                      />
                    )}
                  </div>
                )
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
            <Music className="w-16 h-16 opacity-20" />
            <p className="text-lg">Select a song or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}