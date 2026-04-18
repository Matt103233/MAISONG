import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Copy, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AddStyleDialog from "./AddStyleDialog";

const CATEGORY_COLORS = {
  genre: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  mood: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  instrument: "bg-green-500/20 text-green-300 border-green-500/30",
  structure: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  theme: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  bible_theme: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  custom: "bg-white/10 text-white/60 border-white/20",
};

const CATEGORY_FILTERS = ["all", "genre", "mood", "bible_theme", "theme", "structure", "instrument", "custom"];

export default function StyleLibrary() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    const data = await base44.entities.StylePrompt.list("-is_favorite", 100);
    setPrompts(data);
    setLoading(false);
  };

  const filtered = prompts.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.prompt_text?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied!");
  };

  const toggleFavorite = async (prompt) => {
    const updated = { is_favorite: !prompt.is_favorite };
    await base44.entities.StylePrompt.update(prompt.id, updated);
    setPrompts((prev) => prev.map((p) => p.id === prompt.id ? { ...p, ...updated } : p));
  };

  const addPrompt = async (newPrompt) => {
    const created = await base44.entities.StylePrompt.create({ ...newPrompt, is_favorite: false });
    setPrompts((prev) => [...prev, created]);
    setShowAdd(false);
    toast.success("Style added!");
  };

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Style Library</h2>
            <p className="text-white/50 text-sm">Your personal Suno prompt library — from your own Harrison Productions voice</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-purple-600 hover:bg-purple-700 border-0">
            <Plus className="w-4 h-4 mr-1" /> Add Style
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search styles..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_FILTERS.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${filter === cat ? "bg-purple-600/30 border-purple-500/50 text-purple-300" : "border-white/10 text-white/40 hover:border-white/20"}`}>
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prompt) => (
              <div key={prompt.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{prompt.name}</h3>
                    <Badge className={`text-xs border ${CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.custom}`}>
                      {prompt.category?.replace("_", " ")}
                    </Badge>
                  </div>
                  <button onClick={() => toggleFavorite(prompt)} className="transition-colors flex-shrink-0 ml-2">
                    <Star className={`w-4 h-4 ${prompt.is_favorite ? "fill-amber-400 text-amber-400" : "text-white/20 hover:text-amber-400"}`} />
                  </button>
                </div>
                {prompt.description && (
                  <p className="text-white/40 text-xs mb-2 italic">{prompt.description}</p>
                )}
                <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">{prompt.prompt_text}</p>
                <Button size="sm" variant="ghost" onClick={() => copyPrompt(prompt.prompt_text)}
                  className="w-full text-white/40 hover:text-white hover:bg-white/10 h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy Prompt
                </Button>
              </div>
            ))}
          </div>
        )}

        {showAdd && <AddStyleDialog onAdd={addPrompt} onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}