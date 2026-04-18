import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, BookOpen, Globe, Loader2, Copy, Save } from "lucide-react";
import { toast } from "sonner";

const SYSTEM_PROMPT = `You are SongForge AI, a world-class lyricist and creative music writing assistant. 
Your job is to help users write powerful, emotionally resonant song lyrics.
You draw inspiration from:
- The user's personal journals, notes, and ideas they share
- Biblical themes, scripture, and spiritual depth when relevant
- Current cultural references and web knowledge
- Various music genres, moods, and structures

Always offer:
1. Full lyric sections (verse, chorus, bridge, hook)
2. Multiple options or variations when helpful
3. Suno-ready style suggestions
4. Emotional depth and authenticity

Format lyrics clearly with section labels like [Verse 1], [Chorus], [Bridge], etc.`;

const QUICK_PROMPTS = [
  "Write a chorus about redemption and hope",
  "Give me a verse about feeling lost but found",
  "Create a bridge with a gospel feel",
  "Write lyrics inspired by Psalm 23",
  "Help me finish these lyrics:",
  "Make this rhyme better:",
];

export default function LyricChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to your **Lyric Studio**! 🎵\n\nI'm here to help you turn your ideas, journals, and inspirations into powerful song lyrics. Share a thought, a line, a feeling, a Bible verse — anything — and let's create together.\n\nWhat's on your heart today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [useBible, setUseBible] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const contextAddons = [];
    if (useBible) contextAddons.push("Draw from relevant Bible verses and scripture themes to inspire the lyrics.");
    if (useWeb) contextAddons.push("Use current cultural references and web knowledge to add depth.");

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${contextAddons.join("\n")}\n\nConversation so far:\n${[...messages, userMsg].map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n")}\n\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: useWeb,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const copyLastLyrics = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last) {
      navigator.clipboard.writeText(last.content);
      toast.success("Lyrics copied!");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Controls Bar */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3 flex-wrap bg-[#0d0d15]">
        <span className="text-xs text-white/40 font-medium">ENHANCE WITH:</span>
        <button
          onClick={() => useBible ? setUseBible(false) : setUseBible(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            useBible ? "bg-amber-500/20 border-amber-400/40 text-amber-300" : "border-white/10 text-white/40 hover:border-white/20"
          }`}
        >
          <BookOpen className="w-3 h-3" /> Bible
        </button>
        <button
          onClick={() => setUseWeb(!useWeb)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            useWeb ? "bg-blue-500/20 border-blue-400/40 text-blue-300" : "border-white/10 text-white/40 hover:border-white/20"
          }`}
        >
          <Globe className="w-3 h-3" /> Web Search
        </button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" className="text-white/40 hover:text-white text-xs h-7" onClick={copyLastLyrics}>
            <Copy className="w-3 h-3 mr-1" /> Copy
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-purple-600/30 border border-purple-500/30 text-white"
                : "bg-white/5 border border-white/10 text-white/90"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-purple-400/40 hover:text-purple-300 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-[#0d0d15]">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share an idea, a feeling, a Bible verse, a line... anything"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none min-h-[52px] max-h-32 flex-1 focus-visible:ring-purple-500/50"
            rows={2}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border-0 h-[52px] px-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}