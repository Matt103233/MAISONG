import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Search, FileText, Music, Heart, Edit3, CloudRain, RefreshCw,
  Star, BookOpen, Mic, Mail, Users, Home, Folder, Sparkles, Plus,
  X, Check, Eye, Loader2, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { WAREHOUSE_CATEGORIES, autoCategorize, findMatchingScriptures } from "@/lib/scriptureData";

const ICON_MAP = { Edit3, Heart, Music, CloudRain, RefreshCw, Star, BookOpen, Mic, Mail, Users, Home, Folder };

const STATUS_COLORS = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  reviewed: "bg-green-500/20 text-green-300 border-green-500/30",
  used: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  archived: "bg-white/10 text-white/40 border-white/20",
};

export default function Warehouse() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Journals & Reflections");
  const [matchedScriptures, setMatchedScriptures] = useState([]);
  const [matchingScriptures, setMatchingScriptures] = useState(false);

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    setLoading(true);
    const data = await base44.entities.WarehouseFile.list("-created_date", 200);
    setFiles(data);
    setLoading(false);
  };

  const selectFile = async (file) => {
    setSelected(file);
    if (file.content) {
      const matches = findMatchingScriptures(file.content, 6);
      setMatchedScriptures(matches);
    } else {
      setMatchedScriptures([]);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Full text content" },
          themes: { type: "array", items: { type: "string" }, description: "Key themes" },
        }
      }
    });
    setUploading(false);
    if (result.status === "success") {
      const content = result.output.content || "";
      const category = autoCategorize(file.name, content);
      const themes = result.output.themes || [];
      const scriptures = findMatchingScriptures(content, 5);
      const created = await base44.entities.WarehouseFile.create({
        title: file.name.replace(/\.[^.]+$/, ""),
        category,
        content,
        file_url,
        file_name: file.name,
        themes,
        matched_scriptures: scriptures.map(s => s.ref),
        status: "new",
      });
      setFiles(prev => [created, ...prev]);
      toast.success(`"${file.name}" added to Warehouse — categorized as ${category}`);
    } else {
      toast.error("Could not read file. Try .txt or .md");
    }
  };

  const addManual = async () => {
    if (!newTitle.trim()) return;
    const category = newCategory || autoCategorize(newTitle, newContent);
    const scriptures = newContent ? findMatchingScriptures(newContent, 5) : [];
    const created = await base44.entities.WarehouseFile.create({
      title: newTitle,
      category,
      content: newContent,
      themes: [],
      matched_scriptures: scriptures.map(s => s.ref),
      status: "new",
    });
    setFiles(prev => [created, ...prev]);
    setNewTitle(""); setNewContent(""); setShowAdd(false);
    toast.success("Added to Warehouse!");
  };

  const updateStatus = async (id, status) => {
    await base44.entities.WarehouseFile.update(id, { status });
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  };

  const findScripturesForSelected = async () => {
    if (!selected?.content) return;
    setMatchingScriptures(true);
    const matches = findMatchingScriptures(selected.content, 8);
    setMatchedScriptures(matches);
    await base44.entities.WarehouseFile.update(selected.id, {
      matched_scriptures: matches.map(s => s.ref)
    });
    setMatchingScriptures(false);
    toast.success(`Found ${matches.length} matching scriptures!`);
  };

  const filtered = files.filter(f => {
    const matchSearch = f.title?.toLowerCase().includes(search.toLowerCase()) ||
      f.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const counts = WAREHOUSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = files.filter(f => f.category === cat.id).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/studio">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Studio
            </Button>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <Folder className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-base tracking-tight">The Warehouse</span>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs ml-1">
            {files.length} files
          </Badge>
        </div>
        <div className="flex gap-2">
          <label className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input type="file" accept=".txt,.md,.doc,.docx,.pdf" onChange={uploadFile} className="hidden" />
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload File
          </label>
          <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="bg-amber-600/80 hover:bg-amber-600 border-0 h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Categories */}
        <div className="w-52 border-r border-white/10 bg-[#0d0d15] overflow-y-auto flex-shrink-0 p-3">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium mb-1 transition-all flex items-center justify-between ${categoryFilter === "all" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"}`}
          >
            <span>All Files</span>
            <span className="text-white/25">{files.length}</span>
          </button>
          {WAREHOUSE_CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Folder;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition-all flex items-center gap-2 ${categoryFilter === cat.id ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.color }} />
                <span className="flex-1 truncate">{cat.id}</span>
                {counts[cat.id] > 0 && <span className="text-white/25 text-[10px]">{counts[cat.id]}</span>}
              </button>
            );
          })}
        </div>

        {/* Middle — File List */}
        <div className="w-72 border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search warehouse..." className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-8 text-xs" />
            </div>
          </div>

          {/* Quick Add Form */}
          {showAdd && (
            <div className="p-3 border-b border-amber-500/20 bg-amber-500/5">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title..." className="bg-white/5 border-white/10 text-white text-xs h-7 mb-2" />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-xs h-7 rounded px-2 mb-2">
                {WAREHOUSE_CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-[#1a1a2e]">{c.id}</option>)}
              </select>
              <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Paste your writing..." className="bg-white/5 border-white/10 text-white text-xs min-h-[80px] mb-2" />
              <div className="flex gap-1.5">
                <Button onClick={addManual} disabled={!newTitle} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 border-0 h-7 text-xs">Add</Button>
                <Button onClick={() => setShowAdd(false)} size="sm" variant="ghost" className="text-white/40 h-7 px-2 text-xs">Cancel</Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="text-center py-10 text-white/20 text-xs"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-white/20 text-xs">No files yet — upload or add one</div>
            ) : filtered.map(file => {
              const cat = WAREHOUSE_CATEGORIES.find(c => c.id === file.category);
              return (
                <button key={file.id} onClick={() => selectFile(file)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${selected?.id === file.id ? "bg-amber-500/10 border border-amber-500/30" : "hover:bg-white/5 border border-transparent"}`}>
                  <div className="flex items-start gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: cat?.color || "#888" }} />
                    <span className="text-sm font-medium text-white leading-tight line-clamp-2">{file.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-3.5">
                    <Badge className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[file.status || "new"]}`}>{file.status || "new"}</Badge>
                    {file.matched_scriptures?.length > 0 && (
                      <span className="text-[10px] text-amber-300/50 flex items-center gap-0.5">
                        <BookOpen className="w-2.5 h-2.5" />{file.matched_scriptures.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Content Viewer */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6 max-w-3xl">
              {/* File Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl font-bold text-white leading-tight">{selected.title}</h2>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {["new", "reviewed", "used", "archived"].map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all capitalize ${selected.status === s ? STATUS_COLORS[s] : "border-white/10 text-white/25 hover:border-white/20"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => { const cat = WAREHOUSE_CATEGORIES.find(c => c.id === selected.category); return cat ? (
                    <Badge className="text-xs px-2 py-0.5" style={{ background: cat.color + "30", color: cat.color, borderColor: cat.color + "50", border: "1px solid" }}>{selected.category}</Badge>
                  ) : null; })()}
                  {selected.themes?.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">{t}</span>
                  ))}
                </div>
              </div>

              {/* Content */}
              {selected.content ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 text-white/30 text-sm italic text-center py-10">
                  No content — file was uploaded but text could not be extracted
                </div>
              )}

              {/* Scripture Matches */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-300">
                    <BookOpen className="w-4 h-4" /> Matched Scriptures
                    {matchedScriptures.length > 0 && <span className="text-amber-300/50">({matchedScriptures.length})</span>}
                  </h3>
                  <Button size="sm" variant="ghost" onClick={findScripturesForSelected} disabled={matchingScriptures || !selected.content}
                    className="text-amber-300/60 hover:text-amber-300 h-7 text-xs">
                    {matchingScriptures ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Find Scriptures
                  </Button>
                </div>
                {matchedScriptures.length > 0 ? (
                  <div className="space-y-2">
                    {matchedScriptures.map(s => (
                      <div key={s.ref} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-amber-300 text-sm">{s.ref}</span>
                          <div className="flex gap-1">
                            {s.matchedThemes?.slice(0, 3).map(t => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300/60">{t}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed italic">"{s.esv || s.text}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/25 text-xs text-center">
                    Click "Find Scriptures" to match this content to relevant Bible verses
                  </div>
                )}
              </div>

              {/* Use in Studio */}
              <div className="flex gap-2">
                <Link to="/studio" state={{ warehouseContent: selected.content, warehouseTitle: selected.title }}>
                  <Button className="bg-purple-600 hover:bg-purple-700 border-0 text-sm">
                    <Music className="w-4 h-4 mr-2" /> Use in Lyric Studio
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <Folder className="w-16 h-16 text-amber-400/20 mb-4" />
              <h3 className="text-lg font-semibold text-white/30 mb-2">The Warehouse</h3>
              <p className="text-white/20 text-sm max-w-xs">Your personal library of journals, prayers, poems, sermons, and letters — all searchable and scripture-matched</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}