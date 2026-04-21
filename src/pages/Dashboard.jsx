import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Music, BookOpen, Sparkles, FileText, ArrowRight, Clock } from "lucide-react";
import { STATUS_COLORS } from "@/lib/constants";

const STATUS_BADGE = {
  draft: "bg-[#2a2018] text-amber-300/70 border border-amber-800/40",
  complete: "bg-[#1a2a18] text-green-300/70 border border-green-800/40",
  exported: "bg-[#18202a] text-blue-300/70 border border-blue-800/40",
  published: "bg-[#2a2010] text-amber-400 border border-amber-600/50",
};

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

  return (
    <div className="min-h-screen text-white" style={{ background: "#0f0b09" }}>
      {/* Header */}
      <header className="border-b border-amber-900/30 px-5 py-3 flex items-center justify-between" style={{ background: "#160f08" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c87c20, #8a5010)" }}>
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">mAIsong.ai</span>
        </div>
        <nav className="flex gap-1">
          {[{ to: "/builder", label: "Builder" }, { to: "/catalog", label: "Catalog" }, { to: "/journal", label: "Journal" }, { to: "/prompt", label: "Prompt" }].map(n => (
            <Link key={n.to} to={n.to}
              className="px-4 py-1.5 rounded-lg text-sm text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/20 transition-all border border-transparent hover:border-amber-800/30">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">

        {/* Stats — gauge style */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Songs", value: stats.total },
            { label: "Complete", value: stats.complete },
            { label: "Drafts", value: stats.draft },
            { label: "Exported", value: stats.exported },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              {/* Gauge arc */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full">
                  {/* Track */}
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#2a1f10" strokeWidth="6" strokeDasharray="167 201" strokeDashoffset="-17" strokeLinecap="round" />
                  {/* Arc */}
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#c87c20" strokeWidth="6"
                    strokeDasharray={`${Math.min((loading ? 0 : s.value) / Math.max(stats.total, 1), 1) * 150} 201`}
                    strokeDashoffset="-17" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px #c87c2088)" }} />
                </svg>
                <span className="text-2xl font-bold text-amber-400 relative z-10">{loading ? "—" : s.value}</span>
              </div>
              <span className="text-xs text-amber-200/50 text-center">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Nav Cards */}
        <div className="space-y-3">
          {/* Song Builder — wide */}
          <Link to="/builder">
            <div className="rounded-2xl p-6 border border-amber-700/30 hover:border-amber-500/50 transition-all group relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #2a1a6e 0%, #6b3a10 60%, #8a5010 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              <h3 className="font-bold text-xl mb-1 text-white">Song Builder</h3>
              <p className="text-white/60 text-sm">Build a new song — 4-step AI wizard</p>
            </div>
          </Link>

          {/* My Catalog — wide */}
          <Link to="/catalog">
            <div className="rounded-2xl p-6 border border-amber-700/30 hover:border-amber-500/50 transition-all group relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1a1208 0%, #7a5010 80%, #a06820 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <Music className="w-6 h-6 text-amber-400" />
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              <h3 className="font-bold text-xl mb-1 text-white">My Catalog</h3>
              <p className="text-white/60 text-sm">Workshop your songs, copy blocks, versions</p>
            </div>
          </Link>

          {/* Journal + System Prompt side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/journal">
              <div className="rounded-2xl p-5 border border-green-800/30 hover:border-green-600/50 transition-all group h-full"
                style={{ background: "linear-gradient(135deg, #0d2a18 0%, #1a4a28 100%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-6 h-6 text-green-400" />
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1 text-white">Journal</h3>
                <p className="text-white/60 text-sm leading-snug">Extract song seeds from raw journal entries</p>
              </div>
            </Link>
            <Link to="/prompt">
              <div className="rounded-2xl p-5 border border-blue-800/30 hover:border-blue-600/50 transition-all group h-full"
                style={{ background: "linear-gradient(135deg, #0d1a2a 0%, #1a2a4a 100%)" }}>
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-1 text-white">System Prompt</h3>
                <p className="text-white/60 text-sm leading-snug">Export your portable rules for outside AI sessions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Songs */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500/70" /> Recent Songs
              </h2>
              <Link to="/catalog" className="text-sm text-amber-500/70 hover:text-amber-400 transition-colors">View all →</Link>
            </div>
            <div className="space-y-2">
              {recent.map(song => (
                <Link key={song.id} to={`/catalog?song=${song.id}`}>
                  <div className="rounded-xl px-4 py-3 flex items-center justify-between transition-all border border-amber-900/20 hover:border-amber-700/40"
                    style={{ background: "#1a1208" }}>
                    <div className="flex items-center gap-3">
                      <Music className="w-4 h-4 text-amber-600/60" />
                      <span className="text-sm font-medium text-white/90">{song.title}</span>
                      {song.volume && <span className="text-xs text-white/30">{song.volume}</span>}
                    </div>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[song.status || "draft"]}`}>
                      {song.status || "draft"}
                    </span>
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