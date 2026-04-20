import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Plus, Search, ArrowLeft, Loader2, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { STATUS_COLORS, SONG_STATUSES } from "@/lib/constants";
import SavedSongEditor from "@/components/catalog/SavedSongEditor";
import PasteSaveModal from "@/components/catalog/PasteSaveModal";

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showPasteModal, setShowPasteModal] = useState(false);

  useEffect(() => {
    base44.entities.Song.list("-updated_date", 200).then(data => {
      setSongs(data);
      setLoading(false);
      const songId = searchParams.get("song");
      if (songId) {
        const found = data.find(s => s.id === songId);
        if (found) setSelected(found);
      } else if (data.length > 0) {
        setSelected(data[0]);
      }
    });
  }, []);

  const filtered = songs.filter(s => {
    const matchSearch = s.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const grouped = filtered.reduce((acc, song) => {
    const key = song.volume || "— No Volume —";
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});

  const handleUpdate = (updated) => {
    setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelected(updated);
  };

  const handleDelete = async (id) => {
    await base44.entities.Song.delete(id);
    setSongs(prev => prev.filter(s => s.id !== id));
    setSelected(songs.find(s => s.id !== id) || null);
    toast.success("Song deleted");
  };

  const handlePasteSaved = (song) => {
    setSongs(prev => [song, ...prev]);
    setSelected(song);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <Music className="w-4 h-4 text-amber-400" />
          <span className="font-bold">My Catalog</span>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{songs.length} songs</Badge>
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
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0d0d15] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
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

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {loading ? (
              <div className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin text-white/20 mx-auto" /></div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center text-white/20 text-xs py-8">No songs yet</div>
            ) : Object.entries(grouped).map(([vol, volSongs]) => (
              <div key={vol}>
                <div className="text-[10px] uppercase tracking-widest text-white/25 px-2 mb-1 font-semibold">{vol}</div>
                {volSongs.map(song => (
                  <button key={song.id} onClick={() => setSelected(song)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selected?.id === song.id ? "bg-purple-600/20 border border-purple-500/30" : "hover:bg-white/5"}`}>
                    <div className="text-sm font-medium text-white truncate">{song.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[song.status || "draft"]}`}>{song.status || "draft"}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selected ? (
            <SavedSongEditor key={selected.id} song={selected} onUpdate={handleUpdate} onDelete={handleDelete} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
              <Music className="w-16 h-16 opacity-20" />
              <p>Select a song or build a new one</p>
            </div>
          )}
        </div>
      </div>

      {showPasteModal && <PasteSaveModal onClose={() => setShowPasteModal(false)} onSaved={handlePasteSaved} />}
    </div>
  );
}