import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Music, Plus, Search, Copy, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  draft: "bg-white/10 text-white/50 border-white/20",
  complete: "bg-green-500/20 text-green-300 border-green-500/30",
  exported: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function MySongs() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    const data = await base44.entities.Song.list("-updated_date", 50);
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

  const filtered = songs.filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0d0d15] flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="text-center text-white/20 text-xs py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-white/20 text-xs py-8">No songs yet</div>
          ) : (
            filtered.map((song) => (
              <button
                key={song.id}
                onClick={() => setSelected(song)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${selected?.id === song.id ? "bg-purple-600/20 border border-purple-500/30" : "hover:bg-white/5"}`}
              >
                <div className="text-sm font-medium text-white truncate">{song.title}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[song.status || "draft"]}`}>{song.status || "draft"}</Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <Input
                value={selected.title}
                onChange={(e) => setSelected((s) => ({ ...s, title: e.target.value }))}
                onBlur={() => updateSong(selected.id, { title: selected.title })}
                className="text-2xl font-bold bg-transparent border-transparent hover:border-white/10 focus-visible:border-white/20 text-white px-0 h-auto py-1"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyLyrics} className="text-white/40 hover:text-white h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteSong(selected.id)} className="text-red-400/50 hover:text-red-400 h-8 text-xs">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["style", "mood", "theme"].map((field) => (
                <div key={field}>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">{field}</label>
                  <Input
                    value={selected[field] || ""}
                    onChange={(e) => setSelected((s) => ({ ...s, [field]: e.target.value }))}
                    onBlur={() => updateSong(selected.id, { [field]: selected[field] })}
                    placeholder={`Add ${field}...`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm h-8"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Lyrics</label>
              <Textarea
                value={selected.lyrics || ""}
                onChange={(e) => setSelected((s) => ({ ...s, lyrics: e.target.value }))}
                onBlur={() => updateSong(selected.id, { lyrics: selected.lyrics })}
                placeholder="Write or paste your lyrics here..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[300px] font-mono text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Suno Prompt</label>
              <Textarea
                value={selected.suno_prompt || ""}
                onChange={(e) => setSelected((s) => ({ ...s, suno_prompt: e.target.value }))}
                onBlur={() => updateSong(selected.id, { suno_prompt: selected.suno_prompt })}
                placeholder="Your Suno style prompt..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] text-sm"
              />
            </div>
            <div className="flex gap-2">
              {["draft", "complete", "exported"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateSong(selected.id, { status })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${selected.status === status ? STATUS_COLORS[status] : "border-white/10 text-white/30 hover:border-white/20"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
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