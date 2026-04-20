import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PasteSaveModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [styleTag, setStyleTag] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const song = await base44.entities.Song.create({
      title,
      lyrics_block: lyrics,
      style_tag: styleTag,
      production_notes: notes,
      status: "draft",
    });
    setSaving(false);
    toast.success("Song saved to catalog!");
    onSaved(song);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#13131f] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-bold text-lg">Paste & Save Song</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-white/40 text-sm">Paste a song built outside the app — from another AI session or by hand.</p>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Song title..." className="bg-white/5 border-white/10 text-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Lyrics (Block 1)</label>
            <Textarea value={lyrics} onChange={e => setLyrics(e.target.value)} placeholder="Paste lyrics here..." rows={8} className="bg-white/5 border-white/10 text-white font-mono text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Style Tag (Block 2)</label>
            <Textarea value={styleTag} onChange={e => setStyleTag(e.target.value)} placeholder="Paste Suno style tag..." rows={3} className="bg-white/5 border-white/10 text-white font-mono text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this song..." rows={2} className="bg-white/5 border-white/10 text-white text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="ghost" className="border border-white/10 text-white/40 hover:text-white">Cancel</Button>
            <Button onClick={save} disabled={!title.trim() || saving} className="flex-1 bg-purple-600 hover:bg-purple-700 border-0">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save to Catalog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}