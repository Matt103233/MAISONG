import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Music, BookOpen, Sparkles, Layers, ArrowRight, FileText, Clock, CheckCircle } from "lucide-react";
import { STATUS_COLORS } from "@/lib/constants";

export default function Dashboard() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Song.list("-updated_date", 100).then(data => {
      setSongs(data);
      setLoading(false);
    });
  }, []);

  const stats = {
    total: songs.length,
    complete: songs.filter(s => s.status === "complete" || s.status === "published").length,
    draft: songs.filter(s => s.status === "draft").length,
    exported: songs.filter(s => s.status === "exported" || s.status === "published").length,
  };

  const recent = songs.slice(0, 5);

  const navCards = [
    { to: "/builder", icon: Sparkles, label: "Song Builder", desc: "Build a new song — 4-step AI wizard", color: "from-purple-600/30 to-purple-400/10", border: "border-purple-500/30", iconColor: "text-purple-400" },
    { to: "/catalog", icon: Music, label: "My Catalog", desc: "Workshop your songs, copy blocks, manage versions", color: "from-amber-600/30 to-amber-400/10", border: "border-amber-500/30", iconColor: "text-amber-400" },
    { to: "/journal", icon: BookOpen, label: "Journal", desc: "Extract song seeds from raw journal entries", color: "from-green-600/30 to-green-400/10", border: "border-green-500/30", iconColor: "text-green-400" },
    { to: "/prompt", icon: FileText, label: "System Prompt", desc: "Export your portable rules for outside AI sessions", color: "from-blue-600/30 to-blue-400/10", border: "border-blue-500/30", iconColor: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 px-6 py-4 bg-[#0d0d15] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SongForge AI</span>
        </div>
        <nav className="flex gap-3">
          {[{ to: "/builder", label: "Builder" }, { to: "/catalog", label: "Catalog" }, { to: "/journal", label: "Journal" }, { to: "/prompt", label: "Prompt" }].map(n => (
            <Link key={n.to} to={n.to} className="text-white/50 hover:text-white text-sm transition-colors">{n.label}</Link>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Songs", value: stats.total, color: "text-white" },
            { label: "Complete", value: stats.complete, color: "text-green-400" },
            { label: "Drafts", value: stats.draft, color: "text-amber-400" },
            { label: "Exported", value: stats.exported, color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navCards.map(({ to, icon: Icon, label, desc, color, border, iconColor }) => (
            <Link key={to} to={to}>
              <div className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 hover:scale-[1.01] transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-white/50 text-sm">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Songs */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white/70 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Songs</h2>
              <Link to="/catalog" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
            </div>
            <div className="space-y-2">
              {recent.map(song => (
                <Link key={song.id} to={`/catalog?song=${song.id}`}>
                  <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <Music className="w-4 h-4 text-white/30" />
                      <span className="text-sm font-medium">{song.title}</span>
                      {song.volume && <span className="text-xs text-white/30">{song.volume}</span>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[song.status || "draft"]}`}>{song.status || "draft"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}