import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Sparkles, Upload, Plus, Loader2, X, ArrowRight, Music } from "lucide-react";
import { toast } from "sonner";

export default function Journal() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [seeds, setSeeds] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(null);

  useEffect(() => {
    base44.entities.JournalEntry.list("-created_date", 100).then(data => {
      setEntries(data);
      setLoading(false);
      if (data.length > 0) setSelected(data[0]);
    });
  }, []);

  const addManual = async () => {
    if (!newTitle.trim()) return;
    const entry = await base44.entities.JournalEntry.create({
      title: newTitle,
      content: newContent,
      source_type: "manual",
    });
    setEntries(prev => [entry, ...prev]);
    setSelected(entry);
    setNewTitle(""); setNewContent(""); setShowNew(false);
    toast.success("Journal entry added!");
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
        }
      }
    });
    setUploading(false);
    if (result.status === "success") {
      const entry = await base44.entities.JournalEntry.create({
        title: file.name.replace(/\.[^.]+$/, ""),
        content: result.output.content || "",
        file_url,
        file_name: file.name,
        source_type: "upload",
      });
      setEntries(prev => [entry, ...prev]);
      setSelected(entry);
      toast.success("Journal uploaded!");
    } else {
      toast.error("Could not read file. Try .txt");
    }
  };

  const extractSeeds = async () => {
    if (!selected?.content) return;
    setExtracting(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Christian songwriter's assistant. Read this journal entry and extract 3-5 distinct song seed ideas.

For each idea extract:
- theme: the core emotional/spiritual theme (1-2 sentences)
- hook_idea: a potential hook line or title concept
- scripture_hint: one relevant scripture theme (not a quote, just a reference direction)
- mood: the emotional tone

Journal entry:
"${selected.content}"`,
      response_json_schema: {
        type: "object",
        properties: {
          seeds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme: { type: "string" },
                hook_idea: { type: "string" },
                scripture_hint: { type: "string" },
                mood: { type: "string" },
              }
            }
          }
        }
      }
    });
    setSeeds(res.seeds || []);
    await base44.entities.JournalEntry.update(selected.id, {
      extracted_themes: (res.seeds || []).map(s => s.theme),
    });
    
    // Format seeds as markdown and send email
    const seedsMd = `# Song Seeds from: ${selected.title}\n\nExtracted: ${new Date().toLocaleDateString()}\n\n${(res.seeds || []).map((seed, i) => 
      `## Seed ${i + 1}\n\n**Theme:** ${seed.theme}\n\n**Hook:** ${seed.hook_idea || "—"}\n\n**Mood:** ${seed.mood}\n\n**Scripture Hint:** ${seed.scripture_hint}\n`
    ).join("---\n\n")}`;
    
    await base44.integrations.Core.SendEmail({
      to: "gsueaglefan@gmail.com",
      subject: `Song Seeds: ${selected.title}`,
      body: seedsMd,
    });
    
    setExtracting(false);
    toast.success(`Extracted ${res.seeds?.length || 0} song seeds and emailed!`);
  };

  const buildAndEmail = async (seed) => {
    setSendingEmail(seed.theme);
    const user = await base44.auth.me();
    const seedContent = seed.hook_idea 
      ? `${seed.theme}\n\nHook: "${seed.hook_idea}"\nMood: ${seed.mood}\nScripture hint: ${seed.scripture_hint}`
      : `${seed.theme}\n\nMood: ${seed.mood}\nScripture hint: ${seed.scripture_hint}`;
    
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Song Seed: ${seed.hook_idea || seed.theme}`,
      body: `Song seed from: ${selected.title}\n\n${seedContent}`,
    });
    
    setSendingEmail(null);
    navigate("/builder", { state: { seedTheme: seed.theme, seedHook: seed.hook_idea } });
    toast.success("Seed emailed and Builder opened!");
  };

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
          <BookOpen className="w-4 h-4 text-green-400" />
          <span className="font-bold">Journal</span>
        </div>
        <div className="flex gap-2">
          <label className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input type="file" accept=".txt,.md,.doc,.docx,.pdf" onChange={uploadFile} className="hidden" />
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
          </label>
          <Button onClick={() => setShowNew(true)} size="sm" className="bg-green-600/80 hover:bg-green-600 border-0 h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-[#0d0d15] flex flex-col flex-shrink-0">
          {showNew && (
            <div className="p-3 border-b border-green-500/20 bg-green-500/5 space-y-2">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title..."
                className="bg-white/5 border-white/10 text-white text-xs h-7" />
              <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Journal entry..."
                className="bg-white/5 border-white/10 text-white text-xs min-h-[80px]" />
              <div className="flex gap-1.5">
                <Button onClick={addManual} disabled={!newTitle} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 border-0 h-7 text-xs">Save</Button>
                <Button onClick={() => setShowNew(false)} size="sm" variant="ghost" className="text-white/40 h-7 px-2 text-xs">Cancel</Button>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? <div className="text-center py-10 text-white/20 text-xs"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /></div> :
              entries.map(entry => (
                <button key={entry.id} onClick={() => { setSelected(entry); setSeeds([]); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${selected?.id === entry.id ? "bg-green-600/20 border border-green-500/30" : "hover:bg-white/5"}`}>
                  <div className="text-sm font-medium text-white truncate">{entry.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="text-[10px] px-1.5 py-0 bg-white/5 text-white/40 border-white/10 border">{entry.source_type}</Badge>
                    {entry.extracted_themes?.length > 0 && (
                      <span className="text-[10px] text-green-400/50">{entry.extracted_themes.length} seeds</span>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold">{selected.title}</h2>
                <Button onClick={extractSeeds} disabled={extracting || !selected.content} className="bg-green-600 hover:bg-green-700 border-0 flex-shrink-0">
                  {extracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Extract Song Seeds
                </Button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{selected.content || "No content"}</p>
              </div>

              {seeds.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-300 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Extracted Song Seeds
                  </h3>
                  <div className="space-y-3">
                    {seeds.map((seed, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl p-5 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <p className="text-white/90 text-sm font-medium mb-1">{seed.theme}</p>
                            {seed.hook_idea && <p className="text-amber-300/70 italic text-sm">"{seed.hook_idea}"</p>}
                          </div>
                          <Button 
                            onClick={() => buildAndEmail(seed)} 
                            disabled={sendingEmail === seed.theme}
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 border-0 flex-shrink-0 h-8 text-xs"
                          >
                            {sendingEmail === seed.theme ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            Build <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {seed.mood && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/70 border border-blue-500/20">{seed.mood}</span>}
                          {seed.scripture_hint && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/20">{seed.scripture_hint}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
              <BookOpen className="w-16 h-16 opacity-20" />
              <p>Select a journal entry or add one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}