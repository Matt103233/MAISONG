import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Copy, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddStyleDialog from "./AddStyleDialog";

const DEFAULT_PROMPTS = [
  { name: "Soulful Gospel", category: "genre", prompt_text: "gospel choir, organ, piano, soulful vocals, uplifting, warm reverb, spiritual, powerful, rich harmonies", is_favorite: true },
  { name: "Intimate Worship", category: "mood", prompt_text: "acoustic guitar, soft piano, intimate, contemplative, whispered vocals, reverb, minimal production, sincere", is_favorite: false },
  { name: "Hip-Hop Testimony", category: "genre", prompt_text: "hip-hop, trap beats, spoken word, raw lyrics, 808 bass, authentic, street gospel, lo-fi textures", is_favorite: false },
  { name: "Triumphant Anthem", category: "mood", prompt_text: "epic orchestral, soaring vocals, choir, cinematic, powerful drums, key changes, building energy, triumphant", is_favorite: true },
  { name: "Psalm 23 Vibes", category: "bible_theme", prompt_text: "peaceful, flowing, shepherd imagery, gentle acoustic, soft strings, serene, meditative, folk gospel", is_favorite: false },
  { name: "Broken & Restored", category: "theme", prompt_text: "emotional ballad, piano-led, vulnerable vocals, crescendo, raw honesty, redemption arc, strings swell", is_favorite: false },
  { name: "Verse-Chorus-Bridge", category: "structure", prompt_text: "[Verse 1] setup [Chorus] hook/release [Verse 2] deepen [Chorus] [Bridge] twist/revelation [Final Chorus] elevated", is_favorite: false },
  { name: "Blues Soul", category: "genre", prompt_text: "blues guitar, Hammond organ, smoky vocals, 12-bar blues, gritty, authentic, vintage recording, emotional depth", is_favorite: false },
  { name: "R&B Love Song", category: "genre", prompt_text: "smooth R&B, falsetto, lush chords, melodic bass, 90s neo-soul influence, intimate, warm production", is_favorite: false },
  { name: "Country Storytelling", category: "genre", prompt_text: "acoustic guitar, fiddle, storytelling lyrics, conversational tone, Southern, twang, heartfelt, pedal steel", is_favorite: false },
  { name: "Revelation Imagery", category: "bible_theme", prompt_text: "apocalyptic, dramatic, powerful choir, thunder, majestic, cinematic, prophetic, intense, orchestral swells", is_favorite: false },
  { name: "Prodigal Son Theme", category: "bible_theme", prompt_text: "redemption, coming home, emotional, warm, welcoming, folk-pop, storytelling, forgiveness, tearful joy", is_favorite: false },
];

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
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = prompts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.prompt_text.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied!");
  };

  const toggleFavorite = (idx) => {
    setPrompts((prev) => prev.map((p, i) => i === idx ? { ...p, is_favorite: !p.is_favorite } : p));
  };

  const addPrompt = (newPrompt) => {
    setPrompts((prev) => [...prev, { ...newPrompt, is_favorite: false }]);
    setShowAdd(false);
    toast.success("Style added!");
  };

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Style Library</h2>
            <p className="text-white/50 text-sm">Copy & remix curated prompts for Suno</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-purple-600 hover:bg-purple-700 border-0">
            <Plus className="w-4 h-4 mr-1" /> Add Style
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search styles..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
                  filter === cat ? "bg-purple-600/30 border-purple-500/50 text-purple-300" : "border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((prompt, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">{prompt.name}</h3>
                  <Badge className={`text-xs border ${CATEGORY_COLORS[prompt.category] || CATEGORY_COLORS.custom}`}>
                    {prompt.category?.replace("_", " ")}
                  </Badge>
                </div>
                <button onClick={() => toggleFavorite(idx)} className="transition-colors">
                  <Star className={`w-4 h-4 ${prompt.is_favorite ? "fill-amber-400 text-amber-400" : "text-white/20 hover:text-amber-400"}`} />
                </button>
              </div>
              <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-3">{prompt.prompt_text}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyPrompt(prompt.prompt_text)}
                className="w-full text-white/40 hover:text-white hover:bg-white/10 h-8 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" /> Copy Prompt
              </Button>
            </div>
          ))}
        </div>

        {showAdd && <AddStyleDialog onAdd={addPrompt} onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}