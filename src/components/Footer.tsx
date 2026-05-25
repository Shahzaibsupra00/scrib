import { useState, FormEvent } from 'react';
import { ViewType } from '../types';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Send,
  Heart,
  Globe
} from 'lucide-react';

interface FooterProps {
  setView: (view: ViewType) => void;
}

export default function Footer({ setView }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1200);
  };

  const navColumns = [
    {
      title: "Workspace Engine",
      links: [
        { label: "Overview", view: "landing" as ViewType },
        { label: "Interactive Editor", view: "ai-tool" as ViewType },
        { label: "Dashboard Hub", view: "dashboard" as ViewType },
        { label: "Execution History", view: "history" as ViewType }
      ]
    },
    {
      title: "Resources & Scale",
      links: [
        { label: "Pricing Options", view: "pricing" as ViewType },
        { label: "Pristine Journal", view: "blog" as ViewType },
        { label: "Concierge Triage", view: "contact" as ViewType }
      ]
    },
    {
      title: "Compliance & Security",
      links: [
        { label: "Privacy Guidelines", view: "privacy" as ViewType },
        { label: "Terms of Service", view: "terms" as ViewType }
      ]
    }
  ];

  return (
    <footer className="bg-[#FAF9F6] border-t border-[#EBEAE4] text-[#1F1F1F] font-sans pt-16 pb-12 relative overflow-hidden">
      
      {/* Visual Ambient Blur Accents */}
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#3E5C4B]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-0 right-10 w-72 h-72 bg-[#C8A97E]/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Upper 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#EBEAE4]">
          
          {/* Column A: Logo & Editorial Pitch (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <div 
              onClick={() => { setView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 cursor-pointer group w-fit"
            >
              <div className="w-8 h-8 rounded-xl bg-[#3E5C4B] flex items-center justify-center text-[#FAF9F6] font-serif font-black text-sm shadow-2xs group-hover:bg-[#2F4739] transition-colors">
                S
              </div>
              <div>
                <span className="font-serif text-base font-bold tracking-tight text-[#1F1F1F]">ScribeStone</span>
                <span className="block text-[8px] font-mono tracking-widest text-[#C8A97E] uppercase font-bold leading-none mt-0.5">Micro-SaaS Platform</span>
              </div>
            </div>

            <p className="text-xs text-[#5C5A52] font-light leading-relaxed max-w-sm">
              ScribeStone integrates modern double-pass grammatical models with clean, tactile workspace environments to provide unparalleled prose density refinement.
            </p>

            {/* Social Connection Icons */}
            <div className="flex items-center gap-3.5 pt-1">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8.5 h-8.5 rounded-xl border border-[#EBEAE4] bg-white text-[#5C5A52] hover:text-[#3E5C4B] hover:border-[#3E5C4B] flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                title="ScribeStone on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8.5 h-8.5 rounded-xl border border-[#EBEAE4] bg-white text-[#5C5A52] hover:text-[#3E5C4B] hover:border-[#3E5C4B] flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                title="ScribeStone Editorial Feed"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8.5 h-8.5 rounded-xl border border-[#EBEAE4] bg-white text-[#5C5A52] hover:text-[#3E5C4B] hover:border-[#3E5C4B] flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                title="Enterprise Channels"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <div 
                className="w-8.5 h-8.5 rounded-xl border border-[#EBEAE4] bg-white text-[#5C5A52] hover:text-[#3E5C4B] hover:border-[#3E5C4B] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                onClick={() => setView('contact')}
                title="Direct Concierge Support Channel"
              >
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Columns B, C, D: Dynamic Nav lists (Span 5 total) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4">
            {navColumns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <span className="block text-[9px] font-mono tracking-widest text-[#C8A97E] uppercase font-bold">
                  {col.title}
                </span>
                <ul className="space-y-2.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <button
                        onClick={() => {
                          setView(link.view);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-left text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:underline cursor-pointer transition-colors font-light"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Column E: Mini-Newsletter Dispatch Box (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-[#C8A97E] uppercase font-bold">
              Sub-Weekly Briefings
            </span>
            <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed">
              Accept curated grammar manifestos. No promo telemetry, strictly high-craft prose theories.
            </p>

            <div className="bg-white border border-[#EBEAE4] p-4 rounded-2xl shadow-2xs">
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#3E5C4B] font-medium animate-soft-fade">
                  <div className="w-6 h-6 rounded-full bg-[#3E5C4B]/10 text-[#3E5C4B] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Secured registry active</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email"
                      required
                      placeholder="e.g. scribe@writing.org"
                      className="w-full text-[11px] bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl pl-8.5 pr-3 py-2 outline-none focus:border-[#3E5C4B] transition-colors font-light text-[#1F1F1F]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] py-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{submitting ? 'Registering...' : 'Dispatch'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Lower Metadata Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[#8E8C82]">
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3E5C4B]" />
            <span>ScribeStone sandbox environment fully compliant and secure.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} ScribeStone Inc. Crafted with</span>
            <Heart className="w-3 h-3 text-[#3E5C4B] fill-[#3E5C4B]" />
            <span>for high-integrity editors.</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
