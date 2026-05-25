import { useState, useEffect } from 'react';
import { ViewType, UserSubscription } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  MessageSquare, 
  Play, 
  X, 
  FileUp, 
  Scale, 
  FileCheck, 
  ChevronRight, 
  Sliders, 
  Quote 
} from 'lucide-react';

interface LandingPageProps {
  setView: (view: ViewType) => void;
  subscription: UserSubscription;
  onSubscribe: (tier: 'pro' | 'enterprise', interval: 'month' | 'year') => void;
}

export default function LandingPage({ setView, subscription, onSubscribe }: LandingPageProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(1);
  const [demoProgress, setDemoProgress] = useState(0);

  const proPrice = billingInterval === 'month' ? 19 : 15;
  const enterprisePrice = billingInterval === 'month' ? 99 : 79;

  // Simulate video/walkthrough progress inside mock demo modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDemoOpen) {
      interval = setInterval(() => {
        setDemoProgress((prev) => {
          if (prev >= 100) {
            setCurrentDemoStep((step) => (step < 3 ? step + 1 : 1));
            return 0;
          }
          return prev + 1.5;
        });
      }, 50);
    } else {
      setDemoProgress(0);
      setCurrentDemoStep(1);
    }
    return () => clearInterval(interval);
  }, [isDemoOpen]);

  // Handle Demo Step Click
  const selectDemoStep = (step: number) => {
    setCurrentDemoStep(step);
    setDemoProgress(0);
  };

  const faqs = [
    {
      id: "faq-1",
      q: "What makes ScribeStone different from traditional automated grammar validators?",
      a: "Traditional tools focus merely on rote syntactical rules and commas. ScribeStone is an editorial assistant that utilizes calibrated, double-pass Gemini engines to evaluate text density, structural coherence, and authentic human style paradigms."
    },
    {
      id: "faq-2",
      q: "Is my personal draft data safe and private?",
      a: "Absolutely. We strictly enforce a private sandbox environment. ScribeStone does not store, share, or lease your files, and we do not utilize user drafts to train external models. Your data remains entirely yours."
    },
    {
      id: "faq-3",
      q: "Can I toggle styles for different audiences?",
      a: "Yes. ScribeStone provides four distinct humanized voice profiles: Executive (structured business impact), Concise (minimalistic prose), Warm & Supportive (empathetic team copy), and Witty & Hooky (high-click marketing and newsletter copy)."
    },
    {
      id: "faq-4",
      q: "How does the Stripe billing subscription work?",
      a: "Your level upgrades are authorized securely using the mock-Stripe Checkout framework. You can choose monthly or yearly intervals for your allowances, and self-manage or cancel your active plan from Settings anytime."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Drop Your Raw Material",
      desc: "Paste your raw copy drafts or upload documents securely. Our ingest pipeline extracts pure text instantly."
    },
    {
      num: "02",
      title: "Fine-tune Tone Persona",
      desc: "Select matching targets (Executive, Warm, Concise, Witty) to align your writing with your audience's intent."
    },
    {
      num: "03",
      title: "Receive Revision Ledger",
      desc: "Extract clean revised copy instantly, accompanied by meticulous grammar check matrices and style improvement explanations."
    }
  ];

  const features = [
    {
      id: "feat-ingest",
      icon: <FileUp className="w-5 h-5 text-[#3E5C4B]" />,
      badge: "DRAG & DROP",
      title: "Contextual Document Ingestion",
      desc: "Upload text, PDFs, or markdown ledgers directly. The engine parses hierarchy, titles, and body divisions without styling loss."
    },
    {
      id: "feat-tone",
      icon: <Sliders className="w-5 h-5 text-[#3E5C4B]" />,
      badge: "DIAL PARADIGMS",
      title: "Pliant Human Voice Tuning",
      desc: "Instantly reprocess high-jargon engineering briefs into light-density team bulletins, or crisp executive summaries for stakeholders."
    },
    {
      id: "feat-critique",
      icon: <Scale className="w-5 h-5 text-[#3E5C4B]" />,
      badge: "DOUBLE-PASS",
      title: "Grammatical Audit Matrix",
      desc: "A meticulous comparative system displaying what is modified, why it was changed, and how to master stronger vocabulary structures."
    },
    {
      id: "feat-history",
      icon: <CheckCircle2 className="w-5 h-5 text-[#3E5C4B]" />,
      badge: "SECURE SQL",
      title: "Durable History Logs",
      desc: "All analyzed documents and style preferences are stored in personal, encrypted ledger rows with direct clipboard export."
    }
  ];

  const testimonials = [
    {
      quote: "ScribeStone totally transformed how our remote organization structures customer communications. We stripped out robotic AI markers and replaced them with humanized, high-clarity copy.",
      author: "Miriam Vance",
      role: "Lead Content Architect, Apex Group",
      avatar: "MV"
    },
    {
      quote: "The comparative split-screen editor is unparalleled. Being able to see identical side-by-side revisions with real humanized explanations teaches our junior editors how to prioritize styling depth.",
      author: "Julien Mercer",
      role: "Director of Brand Voice, Craft & Co.",
      avatar: "JM"
    }
  ];

  return (
    <div className="relative">
      
      {/* 1. Hero Section */}
      <section id="hero-sec" className="px-6 py-20 lg:py-32 bg-radial from-[#FAF9F6] to-[#F8F7F4] border-b border-[#EBEAE4] relative overflow-hidden">
        
        {/* Decorative Grid Accents */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3E5C4B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E5C4B]/5 border border-[#3E5C4B]/15 mb-6 text-xs text-[#3E5C4B]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A97E] animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider">PREMIUM EDITORIAL ASSISTANT</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1F1F1F] font-semibold tracking-tight leading-[1.12] mb-8"
          >
            Smarter Document Analysis <br className="hidden sm:inline" />
            <span className="italic text-[#3E5C4B] font-normal font-serif">Without Complexity</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-[#5C5A52] max-w-xl mx-auto leading-relaxed mb-10 font-light"
          >
            Upload your files and receive instant AI-powered insights in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto sm:max-w-none"
          >
            <button
              id="btn-try-free"
              onClick={() => setView('ai-tool')}
              className="w-full sm:w-auto bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              Try Free
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              id="btn-watch-demo"
              onClick={() => {
                setIsDemoOpen(true);
                setCurrentDemoStep(1);
                setDemoProgress(0);
              }}
              className="w-full sm:w-auto bg-white hover:bg-[#FAF9F6] text-[#1F1F1F] border border-[#E5E3DC] px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
            >
              <Play className="w-4 h-4 text-[#3E5C4B] fill-[#3E5C4B]" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] text-[#8E8C82] font-mono"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#3E5C4B]" /> PRIVATE SANDBOX SECURED</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#D9D6CE]"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#C8A97E]" /> ZERO ROBO-AI MARKERS</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#D9D6CE]"></span>
            <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-[#3E5C4B]" /> SUPPORTS TXT, MD, & PDF</span>
          </motion.div>

        </div>
      </section>

      {/* 2. Comparative Mock Workspace Preview */}
      <section id="preview-sec" className="px-6 py-12 bg-white">
        <div className="max-w-5xl mx-auto -mt-16 md:-mt-24 bg-white rounded-2xl border border-[#EBEAE4] shadow-lg p-1.5 relative z-20">
          <div className="rounded-xl bg-[#F8F7F4] border border-[#F1EFEA] overflow-hidden">
            
            {/* Window title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#EBEAE4]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-stone-200"></span>
                <span className="h-4 w-px bg-stone-200 mx-2"></span>
                <span className="text-[10px] font-mono text-[#8E8C82]">ScribeStone_Active_Evaluation.txt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3E5C4B] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#3E5C4B]">Active Scribe Hub</span>
              </div>
            </div>

            {/* Editor visual showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#EBEAE4]">
              
              {/* Left element: Raw verbose trash */}
              <div className="p-6 bg-[#FAF9F6]">
                <div className="flex items-center justify-between mb-4 border-b border-[#F1EFEA] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8C82] font-semibold">1. Jargon-Heavy Input Draft</span>
                  <span className="text-[9px] bg-amber-50 text-[#C8A97E] px-2 py-0.5 rounded font-mono font-medium border border-amber-200/40">Density: Weak</span>
                </div>
                <div className="font-serif text-xs text-[#5C5A52] leading-relaxed italic space-y-3">
                  <p>
                    "We basically wanted to reach out to you guys as fast as possible to make sure you know we are launching a database tool that we think will save you massive hours. You just hit some button and put your documents in and wait for it."
                  </p>
                  <p className="text-stone-400 text-[11px] font-sans mt-4">
                    ❌ Robotic passive voice and redundant qualifiers.
                  </p>
                </div>
              </div>

              {/* Right element: Beautiful editorial polish */}
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4 border-b border-[#F1EFEA] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#3E5C4B] font-bold">2. ScribeStone Polished Result</span>
                  <span className="text-[9px] bg-[#3E5C4B]/10 text-[#3E5C4B] px-2 py-0.5 rounded font-mono font-bold">Preset: Concise Executive</span>
                </div>
                <div className="font-serif text-xs text-[#1F1F1F] leading-relaxed space-y-3">
                  <p className="font-medium">
                    "Our database infrastructure streamlines operations and significantly reduces administration overhead. Deploying our automated ingestion engine removes typical processing bottlenecks instantly."
                  </p>
                  <p className="text-[#3E5C4B] text-[11px] font-sans mt-4 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> 98% Syntactical Density Score
                  </p>
                </div>
              </div>

            </div>

            {/* Quick telemetry footer of mockup */}
            <div className="bg-white border-t border-[#EBEAE4] px-6 py-4 grid grid-cols-3 text-center gap-2">
              <div>
                <span className="block text-lg font-bold text-[#3E5C4B] font-serif">85%</span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#8E8C82] block mt-0.5">Clarity Gain</span>
              </div>
              <div className="border-x border-[#F1EFEA]">
                <span className="block text-lg font-bold text-[#3E5C4B] font-serif">1/3</span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#8E8C82] block mt-0.5">Sentence Length</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-[#C8A97E] font-serif">100%</span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#8E8C82] block mt-0.5">Humanized Voice</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works-sec" className="px-6 py-20 bg-[#FAF9F6] border-y border-[#EBEAE4]">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-2">OPERATIONAL BLUEPRINT</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1F1F1F]">How it works.</h2>
            <p className="text-xs text-[#5C5A52] max-w-sm mx-auto mt-2 font-light">
              We design elegant text structures through a three-stage server transaction process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EBEAE4] relative group hover:border-[#3E5C4B] transition-all duration-300">
                <div className="absolute -top-4 left-6 w-9 h-9 rounded-xl bg-[#3E5C4B] text-[#F8F7F4] flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                  {st.num}
                </div>
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-[#1F1F1F] mb-3 font-serif">{st.title}</h3>
                  <p className="text-xs text-[#5C5A52] leading-relaxed font-light">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Fine-Tune Feature Matrices Grid */}
      <section id="features-sec" className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-mono text-[#3E5C4B] tracking-widest font-bold uppercase block mb-2">SYSTEM UTILITIES</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1F1F1F]">Pristine features, no extra noise.</h2>
            <p className="text-xs text-[#8E8C82] max-w-sm mx-auto mt-2 font-light">
              Crafted for professionals who appreciate typography, whitespace, and immediate utility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <div 
                key={feat.id} 
                className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#EBEAE4] hover:bg-white hover:border-[#3E5C4B] transition-all duration-300 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EBEAE4] flex items-center justify-center shrink-0 shadow-xs">
                  {feat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-[#C8A97E] bg-[#C8A97E]/5 border border-[#C8A97E]/15 px-1.5 py-0.5 rounded uppercase">
                      {feat.badge}
                    </span>
                    <h3 className="text-sm font-semibold text-[#1F1F1F] font-serif">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-[#5C5A52] leading-relaxed font-light">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Minimal Human Testimonials Section */}
      <section id="testimonials-sec" className="px-6 py-20 bg-[#FAF9F6] border-y border-[#EBEAE4] relative">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-2">ORGANIZATIONAL ADVOCATES</span>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1F1F1F]">Endorsed by communications leaders.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, index) => (
              <div 
                key={index} 
                className="bg-white p-7 rounded-2xl border border-[#EBEAE4] relative flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-8 h-8 text-[#EBEAE4] absolute right-6 top-6" />
                  <p className="text-xs font-serif leading-relaxed text-[#1F1F1F] font-light italic mb-6">
                    "{test.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-[#F1EFEA] pt-4 mt-3">
                  <div className="w-8 h-8 rounded-full bg-[#3E5C4B]/10 text-[#3E5C4B] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#3E5C4B]/20">
                    {test.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1F1F1F]">{test.author}</h4>
                    <span className="text-[10px] font-mono text-[#8E8C82] block">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Pricing Preview Section */}
      <section id="pricing-grid" className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-2">TRANSPARENT TIERING</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1F1F1F]">Investment in Clear Style</h2>
            <p className="text-xs text-[#5C5A52] max-w-sm mx-auto mt-2 font-light">
              Begin with our starter allocation. Instantly deploy Stripe simulated test cycles below.
            </p>

            {/* Billing toggler */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF9F6] border border-[#EBEAE4] mt-6">
              <button
                onClick={() => setBillingInterval('month')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  billingInterval === 'month' 
                    ? 'bg-white text-[#3E5C4B] shadow-xs' 
                    : 'text-[#8E8C82] hover:text-[#1F1F1F]'
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  billingInterval === 'year' 
                    ? 'bg-white text-[#3E5C4B] shadow-xs' 
                    : 'text-[#8E8C82] hover:text-[#1F1F1F]'
                }`}
              >
                Yearly billing
                <span className="text-[9px] bg-[#3E5C4B]/10 text-[#3E5C4B] px-1.5 py-0.5 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Free Sandbox */}
            <div className="bg-[#FAF9F6] p-7 rounded-2xl border border-[#EBEAE4] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#8E8C82] uppercase block mb-1">SANDBOX FREE</span>
                <h3 className="font-serif text-lg font-semibold text-[#1F1F1F] mb-4">Starter Portal</h3>
                
                <div className="mb-6">
                  <span className="font-serif text-3xl font-bold text-[#1F1F1F] tracking-tight">$0</span>
                  <span className="text-[11px] text-[#8E8C82] font-mono"> / life</span>
                </div>

                <hr className="border-[#EBEAE4] my-5" />

                <ul className="space-y-3.5 mb-8 text-left">
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    5,000 processed words allowance
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Access to primary writing tool
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Standard text draft inputs
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-stone-400 line-through">
                    Local document file indexing (.txt)
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setView('ai-tool')}
                className="w-full bg-white hover:bg-[#FAF9F6] text-[#1F1F1F] border border-[#E5E3DC] text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-all"
              >
                Access Free Sandbox
              </button>
            </div>

            {/* Pro Tier (Recommended) */}
            <div className="bg-white p-7 rounded-2xl border-2 border-[#3E5C4B] relative shadow-md flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3E5C4B] text-[#F8F7F4] text-[9px] font-mono tracking-wider font-semibold uppercase px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#3E5C4B] uppercase block mb-1">MOST POPULAR TIER</span>
                <h3 className="font-serif text-lg font-semibold text-[#1F1F1F] mb-4">ScribeStone Pro</h3>
                
                <div className="mb-6">
                  <span className="font-serif text-4xl font-bold text-[#1F1F1F] tracking-tight">${proPrice}</span>
                  <span className="text-[11px] text-[#8E8C82] font-mono"> / {billingInterval === 'month' ? 'month' : 'year'}</span>
                </div>

                <hr className="border-[#F1EFEA] my-5" />

                <ul className="space-y-3.5 mb-8 text-left">
                  <li className="flex items-start gap-2.5 text-xs text-[#1F1F1F] font-medium">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    50,000 processed words per month
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Unlimited local file uploads (.txt, .md)
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Unlock all 4 Style Paradigms
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Meticulous grammar correction ledger
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Full database log persistence
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSubscribe('pro', billingInterval)}
                className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {subscription.tier === 'pro' ? 'Currently Active' : 'Upgrade to Pro via Stripe'}
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-[#FAF9F6] p-7 rounded-2xl border border-[#EBEAE4] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#8E8C82] uppercase block mb-1">HIGH-VOLUME LICENSE</span>
                <h3 className="font-serif text-lg font-semibold text-[#1F1F1F] mb-4">Enterprise Cap</h3>
                
                <div className="mb-6">
                  <span className="font-serif text-3xl font-bold text-[#1F1F1F] tracking-tight">${enterprisePrice}</span>
                  <span className="text-[11px] text-[#8E8C82] font-mono"> / {billingInterval === 'month' ? 'month' : 'year'}</span>
                </div>

                <hr className="border-[#EBEAE4] my-5" />

                <ul className="space-y-3.5 mb-8 text-left">
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    1,000,000 processed words allowance
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Custom custom voice templates
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Coordinated team panels (up to 10 users)
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#5C5A52]">
                    <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                    Priority email support SLAs (2 hrs)
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onSubscribe('enterprise', 'year')}
                className="w-full bg-white hover:bg-[#FAF9F6] text-[#1F1F1F] border border-[#E5E3DC] text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-all"
              >
                {subscription.tier === 'enterprise' ? 'Currently Active' : 'Acquire Enterprise License'}
              </button>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setView('pricing')}
              className="inline-flex items-center gap-2 group px-5 py-3 rounded-2xl bg-[#3E5C4B]/5 hover:bg-[#3E5C4B]/10 text-xs font-semibold text-[#3E5C4B] border border-[#3E5C4B]/15 transition-all text-center cursor-pointer"
            >
              <span>Explore Interactive Grand Feature Matrix & FAQs</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </section>

      {/* 7. Structured Frequently Asked Questions */}
      <section id="faq-sec" className="px-6 py-20 bg-[#FAF9F6] border-t border-[#EBEAE4]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono text-[#8E8C82] tracking-widest font-bold uppercase block mb-2">COMMON INQUIRIES</span>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1F1F1F]">Everything you need to know.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white p-6 rounded-xl border border-[#EBEAE4] shadow-xs">
                <h4 className="text-xs font-semibold text-[#1F1F1F] mb-2.5 flex items-start gap-1.5 font-serif">
                  <MessageSquare className="w-4 h-4 text-[#C8A97E] mt-0.5 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-[#5C5A52] leading-relaxed pl-5 font-light">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Bottom Instant Conversion Block */}
      <section className="px-6 py-16 bg-[#3E5C4B] text-[#FAF9F6] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            SECURE INTEGRAL ECOSYSTEM
          </span>
          <h2 className="font-serif text-2xl md:text-3.5xl font-bold tracking-tight">
            Elevate Your Organizational Communications
          </h2>
          <p className="text-xs text-stone-200/95 max-w-md mx-auto leading-relaxed font-light">
            Upload text documents or write directly in your personal sandbox. Upgrade with secure mock checkout limits in one click.
          </p>
          <div>
            <button
              onClick={() => setView('ai-tool')}
              className="bg-[#C8A97E] hover:bg-[#Bca075] text-[#1F1F1F] px-8 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md cursor-pointer transition-all duration-200"
            >
              Analyze Your Copy Today
            </button>
          </div>
        </div>
      </section>

      {/* 9. Watch Demo Walkthrough Simulator Modal */}
      <AnimatePresence>
        {isDemoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1F1F1F]/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl border border-[#EBEAE4] max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#3E5C4B] fill-[#3E5C4B] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#1F1F1F] uppercase tracking-wider">
                    ScribeStone Walkthrough Demo Simulator
                  </span>
                </div>
                <button 
                  onClick={() => setIsDemoOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step Navigation Slider */}
              <div className="grid grid-cols-3 border-b border-[#FAF9F6] font-mono text-[10px] uppercase text-center bg-white">
                <button 
                  onClick={() => selectDemoStep(1)}
                  className={`py-3.5 border-b-2 font-bold cursor-pointer transition-colors ${
                    currentDemoStep === 1 
                      ? 'border-[#3E5C4B] text-[#3E5C4B] bg-[#3E5C4B]/5' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Step 1: Raw Ingest
                </button>
                <button 
                  onClick={() => selectDemoStep(2)}
                  className={`py-3.5 border-b-2 font-bold cursor-pointer transition-colors ${
                    currentDemoStep === 2 
                      ? 'border-[#3E5C4B] text-[#3E5C4B] bg-[#3E5C4B]/5' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Step 2: Voice Dial
                </button>
                <button 
                  onClick={() => selectDemoStep(3)}
                  className={`py-3.5 border-b-2 font-bold cursor-pointer transition-colors ${
                    currentDemoStep === 3 
                      ? 'border-[#3E5C4B] text-[#3E5C4B] bg-[#3E5C4B]/5' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Step 3: Revise
                </button>
              </div>

              {/* Simulated Screen Playback View */}
              <div className="bg-stone-900 text-stone-100 p-6 font-mono text-xs flex-1 min-h-[16rem] flex flex-col justify-between">
                
                {/* Simulated Screen Body */}
                <div className="space-y-4">
                  {currentDemoStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <span className="text-stone-500 font-bold block">// EXTRACTING RAW PARAGRAPH</span>
                      <div className="bg-stone-800 p-4 rounded-lg text-stone-300 font-mono leading-relaxed max-w-full overflow-hidden text-[11px]">
                        "The actual thing here is that our applet operates super fast. Actually, what we do is pretty neat. You just paste whatever rambling email draft you got and click refine, and it solves everything."
                      </div>
                      <p className="text-[#C8A97E] text-[10px] tracking-wide font-sans mt-3">
                        ✓ File accepted. ScribeStone analyzed word weight: 31 words.
                      </p>
                    </motion.div>
                  )}

                  {currentDemoStep === 2 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <span className="text-stone-500 font-bold block">// OPTIMIZING ACTIVE PERSONA</span>
                      <div className="bg-stone-800 p-3.5 rounded-lg text-stone-300 flex items-center justify-between text-[11px]">
                        <span>Tone dialect selected:</span>
                        <span className="bg-[#3E5C4B] text-white px-3 py-1 rounded font-bold uppercase tracking-wider text-[10px]">
                          Executive Profile (Concise)
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 leading-relaxed font-sans space-y-1">
                        <p>• Removing passive voice constructs...</p>
                        <p>• Fine-tuning vocabulary markers inside double-pass database layers...</p>
                      </div>
                    </motion.div>
                  )}

                  {currentDemoStep === 3 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <span className="text-[#3E5C4B] font-bold block">// REVISION LEDGER DISPATCHED</span>
                      <div className="bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 p-4 rounded-lg text-stone-200 font-serif leading-relaxed text-[11px]">
                        "Our application optimizes text density in real-time. Simply submit your raw material to reduce syntactical friction across all communication lanes."
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-stone-400 font-sans pt-2">
                        <div>
                          <span className="text-[#C8A97E]">GRAMMAR:</span> 99% Perfect Audited
                        </div>
                        <div>
                          <span className="text-[#C8A97E]">COMPRESSED:</span> -42% Punctuation Noise
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="border-t border-stone-800 pt-4 mt-6 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">
                    Auto-playing: Loop {currentDemoStep}/3
                  </span>
                  
                  {/* Progress slide line */}
                  <div className="w-1/2 bg-stone-800 h-1.5 rounded-full overflow-hidden relative">
                    <div 
                      className="bg-[#C8A97E] h-full absolute top-0 left-0 transition-all duration-75"
                      style={{ width: `${demoProgress}%` }}
                    ></div>
                  </div>

                  <span className="text-[10px] text-stone-500 font-bold font-mono">
                    {Math.round(demoProgress)}%
                  </span>
                </div>

              </div>

              {/* Action Modal Footer bar */}
              <div className="bg-[#FAF9F6] border-t border-[#EBEAE4] px-5 py-4 flex items-center justify-end gap-3.5">
                <span className="text-[10px] text-[#8E8C82] flex items-center gap-1">
                  Ready to test? Get started instantly.
                </span>
                <button
                  onClick={() => {
                    setIsDemoOpen(false);
                    setView('ai-tool');
                  }}
                  className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Enter Tool Sandbox
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
