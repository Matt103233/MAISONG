import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Trash2, Zap, AlertTriangle, Music } from "lucide-react";
import { toast } from "sonner";

export default function AdminLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [consolidating, setConsolidating] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    const data = await base44.entities.SongLibrary.list("-created_date", 500);
    setLibrary(data);
    setLoading(false);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this song?")) return;
    setDeleting(true);
    await base44.entities.SongLibrary.delete(id);
    setLibrary(prev => prev.filter(s => s.id !== id));
    toast.success("Deleted");
    setDeleting(false);
  };

  const deleteAll = async () => {
    if (!window.confirm("🚨 DELETE ALL SONGS? This cannot be undone!")) return;
    if (!window.confirm("Are you REALLY sure? Type 'DELETE' to confirm...")) return;
    
    setDeleting(true);
    for (const record of library) {
      await base44.entities.SongLibrary.delete(record.id);
    }
    setLibrary([]);
    toast.success("All songs deleted");
    setDeleting(false);
    setShowDeleteAll(false);
  };

  const consolidate = async () => {
    setConsolidating(true);
    const res = await base44.functions.invoke('consolidateSongs', {});
    toast.success(`Consolidated: ${res.consolidated_count} songs`);
    await loadLibrary();
    setConsolidating(false);
  };

  const filtered = library.filter(s =>
    (s.title || "").toLowerCase().includes(search.toLowerCase())
  );

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
          <Music className="w-4 h-4 text-purple-400" />
          <span className="font-bold">Song Library Admin</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={consolidate} disabled={consolidating} className="bg-blue-600 hover:bg-blue-700 border-0 h-8 text-xs">
            {consolidating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
            Consolidate
          </Button>
          <Button onClick={() => setShowDeleteAll(true)} className="bg-red-600 hover:bg-red-700 border-0 h-8 text-xs">
            <Trash2 className="w-3 h-3 mr-1" /> Delete All
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search songs..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {showDeleteAll && (
            <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-300">Delete All Songs?</p>
                  <p className="text-red-200/70 text-sm mt-1">This will permanently delete ALL {library.length} songs. This cannot be undone.</p>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={deleteAll} disabled={deleting} className="bg-red-600 hover:bg-red-700 border-0 text-xs">
                      {deleting ? "Deleting..." : "Yes, Delete All"}
                    </Button>
                    <Button onClick={() => setShowDeleteAll(false)} variant="outline" className="border-white/10 text-white/40 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-white/20">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-white/20">No songs in library</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(song => (
                <div key={song.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start justify-between hover:bg-white/8 transition-all">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{song.title}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{song.source_app}</span>
                      {song.status && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{song.status}</span>}
                      {song.scripture?.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{song.scripture.length} scriptures</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(song.id)}
                    disabled={deleting}
                    className="ml-2 flex-shrink-0 text-red-400/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}