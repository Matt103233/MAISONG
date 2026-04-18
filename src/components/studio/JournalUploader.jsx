import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, Loader2, BookOpen, Globe, X, Plus } from "lucide-react";
import { toast } from "sonner";

const BIBLE_BOOKS = [
  "Psalm 23", "Psalm 91", "Isaiah 40", "Romans 8", "John 3:16", "Jeremiah 29:11",
  "Philippians 4:13", "Revelation 21", "1 Corinthians 13", "Proverbs 31", "Genesis 1", "Matthew 5",
];

export default function JournalUploader() {
  const [entries, setEntries] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [manualText, setManualText] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [bibleRef, setBibleRef] = useState("");
  const [bibleContent, setBibleContent] = useState("");
  const [loadingBible, setLoadingBible] = useState(false);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Extract text content from file
    setExtracting(true);
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Full text content of the file" },
          themes: { type: "array", items: { type: "string" }, description: "Key themes or topics found in the text" },
          emotional_tone: { type: "string", description: "Overall emotional tone" },
        }
      }
    });
    setUploading(false);
    setExtracting(false);

    if (result.status === "success") {
      const entry = {
        id: Date.now(),
        title: file.name,
        content: result.output.content,
        themes: result.output.themes || [],
        emotional_tone: result.output.emotional_tone || "",
        source_type: "upload",
        file_url,
      };
      setEntries((prev) => [entry, ...prev]);
      toast.success(`"${file.name}" uploaded and analyzed!`);
    } else {
      toast.error("Could not read file. Try a .txt file.");
    }
  };

  const addManual = () => {
    if (!manualTitle || !manualText) return;
    setEntries((prev) => [{
      id: Date.now(), title: manualTitle, content: manualText, themes: [], source_type: "manual",
    }, ...prev]);
    setManualTitle("");
    setManualText("");
    toast.success("Note added!");
  };

  const fetchBiblePassage = async (ref) => {
    setLoadingBible(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide the full text of ${ref} from the Bible (KJV or NIV), then list 5 key themes and the emotional tone of this passage. Format as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          text: { type: "string" },
          themes: { type: "array", items: { type: "string" } },
          emotional_tone: { type: "string" },
        }
      }
    });
    setLoadingBible(false);
    const entry = {
      id: Date.now(), title: ref, content: result.text || "", themes: result.themes || [],
      emotional_tone: result.emotional_tone || "", source_type: "bible",
    };
    setEntries((prev) => [entry, ...prev]);
    toast.success(`${ref} added to your references!`);
  };

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">References & Inspiration</h2>
          <p className="text-white/50 text-sm">Upload journals, notes, and Bible passages — the AI will draw from these when writing your lyrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* File Upload */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-purple-400" /> Upload File</h3>
            <p className="text-white/40 text-xs mb-4">Upload .txt, .pdf, or .docx journal files</p>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 cursor-pointer hover:border-purple-500/40 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <input type="file" accept=".txt,.pdf,.docx,.doc" onChange={uploadFile} className="hidden" />
              {uploading || extracting ? (
                <><Loader2 className="w-6 h-6 animate-spin text-purple-400 mb-2" /><span className="text-xs text-white/40">{uploading ? "Uploading..." : "Analyzing..."}</span></>
              ) : (
                <><FileText className="w-6 h-6 text-white/20 mb-2" /><span className="text-xs text-white/40">Click to upload</span></>
              )}
            </label>
          </div>

          {/* Manual Note */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-green-400" /> Add Note</h3>
            <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Title..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-8 mb-2" />
            <Textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Paste your thoughts, ideas, lyrics drafts..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm min-h-[100px] mb-3" />
            <Button onClick={addManual} disabled={!manualTitle || !manualText} size="sm" className="w-full bg-green-600/70 hover:bg-green-600 border-0 h-8 text-xs">Add Note</Button>
          </div>

          {/* Bible */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" /> Bible Reference</h3>
            <Input value={bibleRef} onChange={(e) => setBibleRef(e.target.value)} placeholder="e.g. Psalm 23, Romans 8:28..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-8 mb-3" />
            <div className="flex flex-wrap gap-1 mb-3">
              {BIBLE_BOOKS.slice(0, 6).map((b) => (
                <button key={b} onClick={() => setBibleRef(b)} className="text-[10px] px-2 py-1 rounded-full border border-amber-400/20 text-amber-300/60 hover:border-amber-400/50 hover:text-amber-300 transition-all">{b}</button>
              ))}
            </div>
            <Button onClick={() => bibleRef && fetchBiblePassage(bibleRef)} disabled={!bibleRef || loadingBible} size="sm" className="w-full bg-amber-600/70 hover:bg-amber-600 border-0 h-8 text-xs">
              {loadingBible ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
              Add Bible Passage
            </Button>
          </div>
        </div>

        {/* Saved References */}
        {entries.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4 text-white/70">Saved References ({entries.length})</h3>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${entry.source_type === "bible" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : entry.source_type === "upload" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-white/10 text-white/50 border-white/20"}`}>
                        {entry.source_type}
                      </Badge>
                      <span className="font-medium text-sm">{entry.title}</span>
                    </div>
                    <button onClick={() => removeEntry(entry.id)}><X className="w-4 h-4 text-white/20 hover:text-white/60" /></button>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-3 mb-3">{entry.content}</p>
                  {entry.themes?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {entry.themes.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/20">{t}</span>
                      ))}
                    </div>
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