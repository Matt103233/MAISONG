import { Button } from "@/components/ui/button";
import { Check, X, BookOpen } from "lucide-react";

export default function ScriptureApproval({ verses, approved, onToggle }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 mb-4">Review each suggested verse. Approved verses will be woven into the lyrics.</p>
      {verses.map((verse, i) => {
        const isApproved = approved.includes(verse.ref);
        return (
          <div key={verse.ref} className={`border rounded-xl p-4 transition-all ${isApproved ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 border-white/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-300 text-sm">{verse.ref}</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">NASB95</span>
                </div>
                <blockquote className="text-white/80 text-sm leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                  "{verse.text}"
                </blockquote>
                {verse.relevance && (
                  <p className="text-xs text-white/30 mt-2">{verse.relevance}</p>
                )}
              </div>
              <button
                onClick={() => onToggle(verse.ref)}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  isApproved
                    ? "bg-amber-500/30 border-amber-400/50 text-amber-300"
                    : "bg-white/5 border-white/20 text-white/30 hover:border-white/40"
                }`}
              >
                {isApproved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}