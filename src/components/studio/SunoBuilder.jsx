import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const GENRES = ["Gospel", "R&B Soul", "Hip-Hop", "Country", "Pop", "Rock", "Folk/Acoustic", "Worship", "Blues", "Jazz", "Electronic", "Indie"];
const MOODS = ["Uplifting", "Melancholic", "Triumphant", "Peaceful", "Intense", "Hopeful", "Raw/Vulnerable", "Joyful", "Dark", "Meditative"];
const TEMPOS = ["Slow ballad", "Mid-tempo groove", "Upbeat energetic", "Fast driving"];
const STRUCTURES = ["Verse-Chorus-Verse-Chorus-Bridge-Chorus", "Verse-Pre-Chorus-Chorus", "AABA", "Through-composed"];

export default function SunoBuilder() {
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [tempo, setTempo] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePrompt = async () => {
    if (!lyrics && !genre && !mood) {
      toast.error("Add some lyrics or select a genre/mood first");
      return;
    }
    setLoading(true);
    const aiPrompt = `You are a Suno AI music generation expert. Create a detailed, optimized Suno prompt based on these inputs:

Lyrics/Theme: ${lyrics || "Not provided"}
Genre: ${genre || "Not specified"}
Mood: ${mood || "Not specified"}
Tempo: ${tempo || "Not specified"}
Extra Notes: ${extraNotes || "None"}

Output a complete Suno-ready style prompt in this format:
[Style prompt]: A detailed comma-separated list of musical descriptors (genre, instruments, mood, production style, vocal style, era, etc.)
[Title suggestion]: A compelling song title
[Tags for Suno]: relevant tags

Make it specific, evocative, and ready to paste directly into Suno. Include instrument details, vocal characteristics, production quality descriptors, and emotional feel.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt: aiPrompt });
    setGeneratedPrompt(result);
    setLoading(false);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("Suno prompt copied!");
  };

  return (
    <div className="h-[calc(100vh-57px)] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Suno Prompt Builder</h2>
          <p className="text-white/50 text-sm">Generate optimized prompts to paste directly into Suno AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Side */}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Your Lyrics or Theme</label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics or describe what the song is about..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[140px] focus-visible:ring-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {GENRES.map((g) => <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Mood</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {MOODS.map((m) => <SelectItem key={m} value={m} className="text-white">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Tempo</label>
                <Select value={tempo} onValueChange={setTempo}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select tempo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {TEMPOS.map((t) => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Extra Notes</label>
              <Textarea
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="Any specific instruments, vocal style, era, references..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] focus-visible:ring-purple-500/50"
              />
            </div>

            <Button
              onClick={generatePrompt}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-12 text-base font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Generate Suno Prompt
            </Button>
          </div>

          {/* Output Side */}
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Generated Suno Prompt</label>
            <div className="bg-white/5 border border-white/10 rounded-xl min-h-[400px] p-5 relative">
              {generatedPrompt ? (
                <>
                  <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">{generatedPrompt}</pre>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={copyPrompt} className="bg-purple-600 hover:bg-purple-700 border-0">
                      <Copy className="w-3 h-3 mr-1" /> Copy to Clipboard
                    </Button>
                    <Button size="sm" variant="outline" onClick={generatePrompt} className="border-white/20 text-white hover:bg-white/10">
                      <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-sm flex-col gap-3 py-20">
                  <Wand2 className="w-10 h-10 opacity-30" />
                  <p>Your Suno prompt will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}