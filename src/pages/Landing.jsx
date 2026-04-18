import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, BookOpen, Mic2, Download, Crown, Zap, Star, Check, Folder } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Lyric Studio", desc: "Chat-based AI that turns your raw ideas, journals, and faith into polished song lyrics" },
  { icon: Folder, title: "The Warehouse", desc: "Upload your personal journals, prayers, sermons, poems — auto-categorized and scripture-matched" },
  { icon: BookOpen, title: "Scripture Finder", desc: "80+ KJV/ESV/NASB verses organized by theme — grief, redemption, recovery, praise, identity" },
  { icon: Music, title: "Suno Prompt Builder", desc: "Auto-generates ready-to-paste prompts for Suno AI music generation" },
  { icon: Mic2, title: "Style Library", desc: "Your personal voice library — 12 Harrison Productions signature styles" },
  { icon: Star, title: "My Songs Vault", desc: "Full song management with lyrics, Suno prompts, backstories, and production notes" },
];

const pricingTiers = [
  {
    name: "One-Time Download",
    price: "$89.99",
    period: "one time",
    badge: null,
    color: "border-border",
    buttonStyle: "outline",
    features: [
      "Full desktop app download",
      "AI Lyric Studio (100 generations)",
      "Suno Prompt Builder",
      "Style Library",
      "Bible reference engine",
      "Upload journals & notes",
      "Lifetime access to this version",
    ],
  },
  {
    name: "Creator",
    price: "$19",
    period: "/ month",
    badge: "Most Popular",
    color: "border-purple-500",
    buttonStyle: "purple",
    features: [
      "Everything in One-Time",
      "Unlimited AI generations",
      "Priority AI speed",
      "New styles & prompts monthly",
      "Web search inspiration",
      "Cloud song vault",
      "Email support",
    ],
  },
  {
    name: "Pro Artist",
    price: "$49",
    period: "/ month",
    badge: "Best Value",
    color: "border-amber-400",
    buttonStyle: "amber",
    features: [
      "Everything in Creator",
      "Unlimited uploads",
      "Custom style training",
      "Early access to new features",
      "Priority support",
      "Team collaboration (3 seats)",
      "Export to multiple formats",
    ],
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SongForge AI</span>
        </div>
        <div className="flex gap-2">
          <Link to="/warehouse">
            <Button variant="ghost" className="text-white/60 hover:text-white text-sm">Warehouse</Button>
          </Link>
          <Link to="/scripture">
            <Button variant="ghost" className="text-white/60 hover:text-white text-sm">Scripture</Button>
          </Link>
          <Link to="/studio">
            <Button className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white border-0">
              Open Studio
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/40 text-sm px-4 py-1">
            ✦ AI-Powered Song Creation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Ideas.{" "}
            <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              Your Songs.
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your journals, faith, and raw inspiration into complete lyrics and Suno AI prompts — powered by AI that speaks your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/studio">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white border-0 px-8 text-lg h-14">
                <Sparkles className="w-5 h-5 mr-2" /> Open the Studio
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-lg h-14">
                <Download className="w-5 h-5 mr-2" /> See Pricing
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need to create</h2>
        <p className="text-white/50 text-center mb-16 text-lg">One platform. Infinite songs.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-purple-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-amber-400/20 flex items-center justify-center mb-4 group-hover:from-purple-500/50 group-hover:to-amber-400/40 transition-all">
                <Icon className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-white/50 text-center mb-16 text-lg">Own it forever or grow with a subscription</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`relative bg-white/5 border-2 ${tier.color} rounded-2xl p-8 flex flex-col`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${tier.name === "Creator" ? "bg-purple-600" : "bg-amber-500"} text-white`}>
                    {tier.badge}
                  </div>
                )}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {tier.name === "Pro Artist" && <Crown className="w-4 h-4 text-amber-400" />}
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-white/40 mb-1">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/studio">
                  <Button className={`w-full h-12 font-semibold ${tier.name === "Creator" ? "bg-purple-600 hover:bg-purple-700" : tier.name === "Pro Artist" ? "bg-amber-500 hover:bg-amber-600" : "bg-white/10 hover:bg-white/20 border border-white/20"}`}>
                    {tier.name === "One-Time Download" ? "Download Now" : "Start Free Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center">
            <Music className="w-3 h-3 text-white" />
          </div>
          <span className="text-white/50 font-semibold">SongForge AI</span>
        </div>
        <p>© 2026 SongForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}