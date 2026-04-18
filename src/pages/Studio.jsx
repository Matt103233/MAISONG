import { useState } from "react";
import { Link } from "react-router-dom";
import { Music, BookOpen, Layers, FileText, Home } from "lucide-react";
import LyricChat from "@/components/studio/LyricChat";
import SunoBuilder from "@/components/studio/SunoBuilder";
import StyleLibrary from "@/components/studio/StyleLibrary";
import MySongs from "@/components/studio/MySongs";
import JournalUploader from "@/components/studio/JournalUploader";

const tabs = [
  { id: "chat", label: "Lyric Studio", icon: Music },
  { id: "suno", label: "Suno Builder", icon: Layers },
  { id: "library", label: "Style Library", icon: BookOpen },
  { id: "songs", label: "My Songs", icon: FileText },
  { id: "journal", label: "References", icon: BookOpen },
];

export default function Studio() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between bg-[#0d0d15]">
        <div className="flex items-center gap-3">
          <Link to="/">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center cursor-pointer">
              <Music className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>
          <span className="font-bold text-sm tracking-tight hidden sm:block">SongForge AI</span>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:block">{label}</span>
            </button>
          ))}
        </nav>
        <Link to="/">
          <button className="text-white/40 hover:text-white/70 transition-colors">
            <Home className="w-4 h-4" />
          </button>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "chat" && <LyricChat />}
        {activeTab === "suno" && <SunoBuilder />}
        {activeTab === "library" && <StyleLibrary />}
        {activeTab === "songs" && <MySongs />}
        {activeTab === "journal" && <JournalUploader />}
      </main>
    </div>
  );
}