import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function AddStyleDialog({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("custom");
  const [promptText, setPromptText] = useState("");

  const handleAdd = () => {
    if (!name || !promptText) return;
    onAdd({ name, category, prompt_text: promptText });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">Add Custom Style</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white/40" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Gospel Vibe" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {["genre", "mood", "theme", "bible_theme", "structure", "instrument", "custom"].map((c) => (
                  <SelectItem key={c} value={c} className="text-white capitalize">{c.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Prompt Text</label>
            <Textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="gospel, piano, soulful vocals, warm, uplifting..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]" />
          </div>
          <Button onClick={handleAdd} disabled={!name || !promptText} className="w-full bg-purple-600 hover:bg-purple-700 border-0">Add to Library</Button>
        </div>
      </div>
    </div>
  );
}