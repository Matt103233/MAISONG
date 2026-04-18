import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Sparkles, Copy, Star, ArrowLeft, Music } from "lucide-react";
import { toast } from "sonner";
import { findMatchingScriptures, SCRIPTURE_DATABASE } from "@/lib/scriptureData";

const ALL_THEMES = [...new Set(SCRIPTURE_DATABASE.flatMap(s => s.themes))].sort();

export default function ScriptureFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [themeFilter, setThemeFilter] = useState("");
  const [translation, setTranslation] = useState("kjv");

  const search = () => {
    if (!query.trim() && !themeFilter) return;
    const fullQuery = themeFilter ? `${query} ${themeFilter}` : query;
    const matches = findMatchingScriptures(fullQuery, 15);
    setResults(matches);
    setSearched(true);
  };

  const browseByTheme = (theme) => {
    setThemeFilter(theme);
    setQuery("");
    const matches = findMatchingScriptures(theme, 12);
    setResults(matches);
    setSearched(true);
  };

  const copyVerse = (s) => {
    const text = translation === "esv" && s.esv ? s.esv : translation === "nasb" && s.nasb ? s.nasb : s.text;
    navigator.clipboard.writeText(`${s.ref} — "${text}"`);
    toast.success("Verse copied!");
  };

  const toggleFavorite = (ref) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(ref) ? next.delete(ref) : next.add(ref);
      return next;
    });
  };

  const getVerseText = (s) => {
    if (translation === "esv" && s.esv) return s.esv;
    if (translation === "nasb" && s.nasb) return s.nasb;
    return s.text;
  };

  const THEME_GROUPS = {
    "Redemption & Grace": ["redemption", "grace", "salvation", "forgiveness", "mercy"],
    "Grief & Healing": ["grief", "healing", "comfort", "mourning", "tears", "brokenness"],
    "Recovery & Surrender": ["recovery", "surrender", "strength", "weakness", "renewal"],
    "Faith & Trust": ["faith", "trust", "hope", "courage", "perseverance"],
    "Identity & Purpose": ["identity", "purpose", "calling", "transformation"],
    "Praise & Worship": ["praise", "worship", "joy", "singing", "new song"],
    "Family & Legacy": ["family", "parenting", "children", "generational"],
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/studio">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Studio
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-bold">Scripture Finder</span>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{SCRIPTURE_DATABASE.length} verses</Badge>
        </div>
        <div className="flex gap-1.5">
          {["kjv", "esv", "nasb"].map(t => (
            <button key={t} onClick={() => setTranslation(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase transition-all ${translation === t ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "border-white/10 text-white/30 hover:border-white/20"}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Scripture</h1>
          <p className="text-white/40 text-sm mb-5">Type a theme, emotion, song idea, or life situation — the engine finds the most relevant verses from your library</p>
          <div className="flex gap-2">
            <Textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), search())}
              placeholder="e.g. 'grief and loss after a loved one dies' or 'redemption from addiction' or 'broken but finding hope'..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[72px] flex-1 text-sm"
            />
            <Button onClick={search} className="bg-amber-600 hover:bg-amber-700 border-0 h-full px-6 self-stretch">
              <Search className="w-5 h-5" />
            </Button>
          </div>
          {themeFilter && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-white/40">Filtering by:</span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{themeFilter}</Badge>
              <button onClick={() => { setThemeFilter(""); setResults([]); setSearched(false); }} className="text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Theme Browser */}
        {!searched && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Browse by Theme</h3>
            <div className="space-y-4">
              {Object.entries(THEME_GROUPS).map(([group, themes]) => (
                <div key={group}>
                  <p className="text-xs text-white/30 mb-2 font-medium">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {themes.map(theme => (
                      <button key={theme} onClick={() => browseByTheme(theme)}
                        className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-white/50 hover:border-amber-400/40 hover:text-amber-300 capitalize transition-all">
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white/70">
                {results.length > 0 ? `${results.length} matching scriptures` : "No matches found"}
              </h3>
              {results.length > 0 && (
                <button onClick={() => { setResults([]); setSearched(false); setThemeFilter(""); }}
                  className="text-xs text-white/30 hover:text-white/60">Clear</button>
              )}
            </div>
            <div className="space-y-3">
              {results.map(s => (
                <div key={s.ref} className="bg-white/5 border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-amber-300 text-base mb-1">{s.ref}</h4>
                      <div className="flex flex-wrap gap-1">
                        {s.matchedThemes?.slice(0, 4).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/20 capitalize">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleFavorite(s.ref)}
                        className={`p-1.5 rounded-lg transition-all ${favorites.has(s.ref) ? "text-amber-400" : "text-white/20 hover:text-amber-400"}`}>
                        <Star className={`w-4 h-4 ${favorites.has(s.ref) ? "fill-amber-400" : ""}`} />
                      </button>
                      <button onClick={() => copyVerse(s)} className="p-1.5 rounded-lg text-white/20 hover:text-white/60 transition-all">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <blockquote className="text-white/80 text-sm leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                    "{getVerseText(s)}"
                  </blockquote>
                  {translation === "kjv" && s.esv && (
                    <p className="text-white/30 text-xs mt-2 pl-3">ESV: "{s.esv}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}