import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Clock, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function SongVersionHistory({ songId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!songId) return;
    base44.entities.SongVersion.filter({ song_id: songId }, "-created_date", 20).then(data => {
      setVersions(data);
      setLoading(false);
    });
  }, [songId]);

  const restore = (version) => {
    onRestore(version);
    toast.success(`Restored version: ${version.version_label || "Snapshot"}`);
  };

  if (loading) return <div className="text-white/20 text-xs py-4 text-center">Loading versions...</div>;
  if (!versions.length) return <div className="text-white/20 text-xs py-4 text-center">No saved versions yet</div>;

  return (
    <div className="space-y-2">
      {versions.map(v => (
        <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5"
            onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              <span className="text-sm font-medium">{v.version_label || "Snapshot"}</span>
              <span className="text-xs text-white/30">{new Date(v.created_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); restore(v); }}
                className="flex items-center gap-1 text-xs text-purple-400/60 hover:text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-500/10 transition-all">
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
              {expanded === v.id ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
            </div>
          </div>
          {expanded === v.id && (
            <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
              {v.notes && <p className="text-xs text-white/40 italic">{v.notes}</p>}
              {v.lyrics && (
                <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-black/20 rounded-lg p-3 max-h-48 overflow-y-auto">{v.lyrics}</pre>
              )}
              {v.style_tag && (
                <p className="text-white/40 text-xs font-mono bg-black/20 rounded-lg p-2">{v.style_tag}</p>
              )}
              <div className="flex gap-3 text-xs text-white/30">
                {v.weirdness_pct != null && <span>Weirdness: {v.weirdness_pct}%</span>}
                {v.style_influence_pct != null && <span>Style Influence: {v.style_influence_pct}%</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}