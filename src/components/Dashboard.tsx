import { useState, useEffect, FormEvent } from 'react';
import { AnalysisItem, UserSubscription, ViewType } from '../types';
import { 
  PenTool, 
  Library, 
  HardDrive, 
  Database, 
  CreditCard, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  Trash2, 
  ArrowUpRight, 
  Sparkles, 
  User, 
  Settings, 
  Layers, 
  Zap, 
  Plus, 
  FileText, 
  ShieldCheck, 
  Check, 
  LayoutDashboard, 
  HelpCircle,
  Eye,
  Sliders,
  TrendingUp,
  X,
  Server,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  subscription: UserSubscription;
  history: AnalysisItem[];
  setView: (view: ViewType) => void;
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onRefreshData: () => void;
}

export default function Dashboard({ 
  subscription, 
  history, 
  setView, 
  onSelectDoc, 
  onDeleteDoc, 
  onRefreshData 
}: DashboardProps) {

  // State controls for developer experience and simulation
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [quickIngestText, setQuickIngestText] = useState('');
  const [quickIngestTitle, setQuickIngestTitle] = useState('');
  const [quickIngestStyle, setQuickIngestStyle] = useState('Concise');
  const [isQuickIngestOpen, setIsQuickIngestOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Active items count based on simulator toggles
  const activeHistory = simulateEmpty ? [] : history;
  const filteredHistory = activeHistory.filter(item => {
    const matchesStyle = filterStyle === 'all' || item.style.toLowerCase() === filterStyle.toLowerCase() || (filterStyle === 'Executive' && item.style.includes('Executive'));
    const matchesSearch = item.title.toLowerCase().includes(searchDocQuery.toLowerCase()) || item.originalText.toLowerCase().includes(searchDocQuery.toLowerCase());
    return matchesStyle && matchesSearch;
  });

  const pctUsed = Math.min(100, Math.round((subscription.wordsUsed / subscription.wordsLimit) * 100));

  // Dynamic calculations based on active dataset
  const totalAnalyzed = filteredHistory.length;
  const avgGrammarScore = filteredHistory.length > 0 
    ? Math.round(filteredHistory.reduce((acc, h) => acc + h.analysis.grammarScore, 0) / filteredHistory.length) 
    : 0;
  const avgClarityScore = filteredHistory.length > 0 
    ? Math.round(filteredHistory.reduce((acc, h) => acc + h.analysis.clarityScore, 0) / filteredHistory.length) 
    : 0;

  // Simulate loading skeleton briefly when requested by user click
  const handleTriggerLoadingPulse = () => {
    setIsLoadingState(true);
    setTimeout(() => {
      setIsLoadingState(false);
    }, 1200);
  };

  // Process quick inline text ingestion
  const handleInlineIngest = async (e: FormEvent) => {
    e.preventDefault();
    if (!quickIngestText.trim()) return;

    setIsIngesting(true);
    const resolvedTitle = quickIngestTitle.trim() || `Untitled Fragment ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    try {
      // Simulate real process pipeline
      const response = await fetch('/api/analyze', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: quickIngestText, 
          title: resolvedTitle, 
          style: quickIngestStyle 
        })
      });

      if (response.ok) {
        // Force parent components list update
        onRefreshData();
        setQuickIngestText('');
        setQuickIngestTitle('');
        setIsQuickIngestOpen(false);
      } else {
        alert("Failed to refine draft via Gemini server endpoint. Check quota threshold.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsIngesting(false);
    }
  };

  // Custom high-aesthetic points for Past Refinements Timeline
  const pointsList = [
    { label: "Mon", val: 110, wordCount: 420 },
    { label: "Tue", val: 80, wordCount: 950 },
    { label: "Wed", val: 130, wordCount: 310 },
    { label: "Thu", val: 55, wordCount: 1200 },
    { label: "Fri", val: 95, wordCount: 880 },
    { label: "Sat", val: 35, wordCount: 1650 }
  ];
  const linePoints = pointsList.map((pt, idx) => `${30 + idx * 100},${pt.val}`).join(" ");

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F] font-sans">
      
      {/* 1. Double-Pane Sidebar Layout wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT PANE: CONTEMPORARY NOTION-LIKE SIDEBAR ================= */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* A. Compact User Profile Widget */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBEAE4] shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#3E5C4B]/10 text-[#3E5C4B] border border-[#3E5C4B]/20 flex items-center justify-center font-serif font-bold text-base shadow-inner">
                {subscription.name ? subscription.name.charAt(0).toUpperCase() : 'W'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#1F1F1F] block truncate">
                    {subscription.name || "Scribe User"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active Socket Synced"></span>
                </div>
                <span className="text-[10px] text-[#8E8C82] block truncate font-mono">{subscription.email}</span>
              </div>
            </div>

            {/* Micro Metadata Table */}
            <div className="bg-[#FAF9F6] rounded-xl p-3 border border-[#F1EFEA] space-y-2 text-[10px] font-mono">
              <div className="flex justify-between text-[#5C5A52]">
                <span className="text-stone-400">Security:</span>
                <span className="text-[#3E5C4B] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> sandbox_pass
                </span>
              </div>
              <div className="flex justify-between text-[#5C5A52]">
                <span className="text-stone-400">Postgres Status:</span>
                <span className="text-stone-700 font-semibold uppercase">Connected</span>
              </div>
              <div className="flex justify-between text-[#5C5A52]">
                <span className="text-stone-400">L3 Ping:</span>
                <span className="text-[#3E5C4B] font-bold">14ms</span>
              </div>
            </div>

            {/* Dynamic subscription tag */}
            <div className="mt-3 text-center">
              <span className={`inline-block w-full py-1 rounded-lg text-[9px] font-bold font-mono tracking-wider uppercase border ${
                subscription.tier !== 'free' 
                  ? 'bg-[#3E5C4B]/10 text-[#3E5C4B] border-[#3E5C4B]/25' 
                  : 'bg-[#C8A97E]/10 text-[#7C5A14] border-[#C8A97E]/35'
              }`}>
                {subscription.tier} Premium Access
              </span>
            </div>
          </div>

          {/* B. Sidebar Navigation Sections */}
          <div className="bg-white rounded-2xl p-4 border border-[#EBEAE4] shadow-xs space-y-4">
            <span className="text-[9px] font-mono tracking-widest text-[#8E8C82] uppercase ml-1 block">NAVIGATION STATIONS</span>
            
            <div className="space-y-1">
              <button 
                onClick={() => setView('dashboard')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-[#3E5C4B] bg-[#3E5C4B]/5 border border-[#3E5C4B]/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#3E5C4B]" />
                  Overview Desk
                </span>
                <span className="text-[9px] bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 min-w-4 px-1 rounded text-center font-mono">
                  {totalAnalyzed}
                </span>
              </button>

              <button 
                onClick={() => setView('ai-tool')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-stone-400" />
                  Voice Tuning Editor
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
              </button>

              <button 
                onClick={() => setView('history')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-stone-400" />
                  Persisted Ledger
                </span>
                <span className="text-[9px] text-[#8E8C82] font-mono">SQLite v2</span>
              </button>

              <button 
                onClick={() => setView('settings')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-stone-400" />
                  Stripe & Settings
                </span>
                <Sparkles className="w-3 h-3 text-[#C8A97E]" />
              </button>
            </div>
          </div>

          {/* C. Strategic Demo Toggles (Highly requested for QA testing) */}
          <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EBEAE4] space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-[#EBEAE4] pb-2">
              <Sliders className="w-3.5 h-3.5 text-[#C8A97E]" />
              <span className="text-[10px] font-mono tracking-wider text-[#1F1F1F] font-bold uppercase">PREVIEW CONTROLLERS</span>
            </div>
            
            <p className="text-[11px] text-[#5C5A52] leading-relaxed font-light">
              Toggle dashboard data states instantly to review loading skeletons and raw empty parameters.
            </p>

            <div className="space-y-2 pt-1 font-mono text-[9px]">
              
              {/* Toggle Skeletons */}
              <button 
                onClick={handleTriggerLoadingPulse}
                className="w-full flex items-center justify-between bg-white hover:bg-stone-50 text-stone-700 border border-[#EBEAE4] px-2.5 py-1.5 rounded-lg font-semibold transition-all"
              >
                <span>Trigger Loading Pulse</span>
                <span className="bg-[#3E5C4B]/10 text-[#3E5C4B] px-1 rounded font-bold uppercase">Run skeletal</span>
              </button>

              {/* Toggle Empty State */}
              <button 
                onClick={() => setSimulateEmpty(!simulateEmpty)}
                className={`w-full flex items-center justify-between border px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  simulateEmpty 
                    ? 'bg-amber-50 text-[#7C5A14] border-amber-300' 
                    : 'bg-white text-stone-700 border-[#EBEAE4] hover:bg-stone-50'
                }`}
              >
                <span>Mock Clear Database</span>
                <span className={`px-1 rounded font-bold uppercase ${
                  simulateEmpty ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-700'
                }`}>
                  {simulateEmpty ? "EMPTY" : "LOADED"}
                </span>
              </button>

            </div>
          </div>

        </aside>

        {/* ================= RIGHT PANE: LINEAR-INSPIRED SaaS WORKSPACE ================= */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* A. Dynamic Applet Banner */}
          <div className="bg-white rounded-2xl p-6 border border-[#EBEAE4] relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#3E5C4B]/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 mb-2.5 text-[9px] text-[#3E5C4B] font-mono font-bold">
                  <Server className="w-3 h-3 text-[#C8A97E]" />
                  ENVIRONMENT STATUS: CALIBRATED AND ACTIVE
                </div>
                <h2 className="font-serif text-xl md:text-2xl text-[#1F1F1F] font-semibold tracking-tight">
                  Editorial Command Center
                </h2>
                <p className="text-xs text-[#5C5A52] max-w-xl mt-1 font-light">
                  ScribeStone checks orthography consistency and vocabulary weight using dual-pass LLM structures. Review your dynamic metrics below.
                </p>
              </div>

              {/* Quick Action Button Box */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button 
                  onClick={onRefreshData}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#5C5A52] hover:text-[#3E5C4B] bg-white hover:bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl transition-all"
                  title="Force refresh database ledgers from Firestore emulator"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Indices
                </button>

                <button 
                  onClick={() => setIsQuickIngestOpen(true)}
                  className="flex items-center gap-1 bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-97"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Quick Ingest Drawer
                </button>
              </div>
            </div>
          </div>

          {/* B. Loading Skeletons Renderer (Toggled via state control) */}
          {isLoadingState ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs space-y-3.5 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-20 bg-stone-200 rounded-sm"></div>
                      <div className="h-4 w-4 bg-stone-100 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-stone-200 rounded-md"></div>
                      <div className="h-2 w-full bg-stone-100 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-[#EBEAE4] p-6 space-y-4">
                <div className="h-4 w-1/4 bg-stone-200 rounded"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-[#FAF9F6] animate-pulse">
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-1/3 bg-stone-200 rounded"></div>
                        <div className="h-2 w-1/4 bg-stone-100 rounded"></div>
                      </div>
                      <div className="h-4 w-12 bg-stone-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* C. SaaS Bento Grid: Usage statistics & Subscription Plans */}
              <div id="stats-bento-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Words Limit Progress (Span 5) */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs flex flex-col justify-between md:col-span-5 hover:border-stone-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider">Words Allowance Quota</span>
                    <Database className="w-4 h-4 text-[#C8A97E]" />
                  </div>
                  <div>
                    <span className="block text-2xl font-serif font-bold text-[#1F1F1F]">
                      {subscription.wordsUsed.toLocaleString()}
                      <span className="text-xs text-[#8E8C82] font-mono font-normal"> / {subscription.wordsLimit.toLocaleString()} words</span>
                    </span>
                    
                    {/* Minimal progress bar (Not neon) */}
                    <div className="w-full bg-[#FAF9F6] h-2.5 rounded-full mt-3.5 border border-[#EBEAE4] overflow-hidden">
                      <div 
                        className="bg-[#3E5C4B] h-full rounded-full transition-all duration-75"
                        style={{ width: `${pctUsed}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] font-mono text-[#8E8C82]">{pctUsed}% capacity spent</span>
                      <button 
                        onClick={() => setView('settings')}
                        className="text-[10px] font-semibold text-[#3E5C4B] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Buy spacing allowance <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Current Stripe Tier Card (Span 4) */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs flex flex-col justify-between md:col-span-4 hover:border-stone-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider">Selected License Plan</span>
                    <CreditCard className="w-4 h-4 text-[#3E5C4B]" />
                  </div>
                  <div>
                    <span className="block text-xl font-serif font-bold text-[#1F1F1F] capitalize flex items-center gap-1.5">
                      {subscription.tier} Plan
                      <span className="w-2 h-2 rounded-full bg-[#3E5C4B]"></span>
                    </span>
                    <span className="text-[11px] text-[#5C5A52] leading-none mt-1 block">
                      Renewals recurring {subscription.billingInterval}ly
                    </span>
                    
                    <hr className="border-[#FAF9F6] my-3" />
                    
                    <button
                      onClick={() => setView('settings')}
                      className="text-[10px] font-semibold text-[#3E5C4B] hover:text-[#2F4739] flex items-center justify-between w-full cursor-pointer group"
                    >
                      <span className="group-hover:underline">Stripe Checkout simulator</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Global AI Index Scores (Span 3) */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs flex flex-col justify-between md:col-span-3 hover:border-stone-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider">Performance Average</span>
                    <Layers className="w-4 h-4 text-[#C8A97E]" />
                  </div>
                  <div>
                    <div className="grid grid-cols-2 divide-x divide-[#FAF9F6] text-center">
                      <div>
                        <span className="block text-xl font-serif font-bold text-[#3E5C4B]">{avgGrammarScore}%</span>
                        <span className="text-[8px] font-mono text-[#8E8C82] uppercase tracking-wider">Grammar</span>
                      </div>
                      <div>
                        <span className="block text-xl font-serif font-bold text-[#C8A97E]">{avgClarityScore}%</span>
                        <span className="text-[8px] font-mono text-[#8E8C82] uppercase tracking-wider">Clarity</span>
                      </div>
                    </div>
                    <div className="mt-3 text-[9px] text-center text-[#8E8C82] font-mono">
                      Calculated from current logs
                    </div>
                  </div>
                </div>

              </div>

              {/* D. Inline Quick Action Widget panel (Linear Inspired) */}
              <div id="quick-actions-bar" className="bg-[#FAF9F6] p-4.5 rounded-2xl border border-[#EBEAE4] grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 self-center">
                  <span className="block text-[8px] font-mono text-[#8E8C82] uppercase tracking-widest font-bold">WORKSPACE WIDGETS</span>
                  <span className="text-xs font-semibold text-[#1F1F1F]">Instant Action Controls</span>
                </div>
                
                <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                  
                  {/* Action 1: Draft new document */}
                  <button
                    onClick={() => setView('ai-tool')}
                    className="bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4] rounded-xl px-2 py-2.5 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#3E5C4B]" />
                    Refine Text
                  </button>

                  {/* Action 2: Trigger quick inputs modal */}
                  <button
                    onClick={() => setIsQuickIngestOpen(true)}
                    className="bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4] rounded-xl px-2 py-2.5 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#3E5C4B]" />
                    Inline Ingest
                  </button>

                  {/* Action 3: Secure Uploads Station */}
                  <button
                    onClick={() => setView('secure-uploads')}
                    className="bg-white hover:bg-stone-100 text-[#1F1F1F] border border-[#C8A97E]/30 rounded-xl px-2 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all hover:border-[#3E5C4B]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C8A97E]" />
                    S3 Uploads
                  </button>

                  {/* Action 4: Upgrade sandbox tier */}
                  <button
                    onClick={() => setView('settings')}
                    className="bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4] rounded-xl px-2 py-2.5 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C8A97E]" />
                    Upgrade Limits
                  </button>

                </div>
              </div>

              {/* E. SVG Timeline Graph (Double Col Span layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Visual timeline charts element (Span 8) */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs lg:col-span-8 hover:border-[#3E5C4B]/20 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#3E5C4B]" />
                        Refined Text Weight Index
                      </h3>
                      <p className="text-[10px] text-[#8E8C82]">Calculated word frequencies refined across active session intervals</p>
                    </div>
                    <span className="text-[9px] font-mono bg-[#3E5C4B]/5 text-[#3E5C4B] border border-[#3E5C4B]/15 px-2 py-0.5 rounded">
                      6-Day Frame
                    </span>
                  </div>

                  {/* Visualizer SVG drawing Area */}
                  <div className="relative">
                    <div className="w-full h-36 overflow-visible">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
                        
                        {/* Soft interior support grids */}
                        <line x1="0" y1="30" x2="600" y2="30" stroke="#F8F7F4" strokeWidth="1" />
                        <line x1="0" y1="75" x2="600" y2="75" stroke="#F8F7F4" strokeWidth="1" />
                        <line x1="0" y1="120" x2="600" y2="120" stroke="#F8F7F4" strokeWidth="1" />
                        
                        {/* Delicate Area fill gradient (Beige and Forest Green) */}
                        <path
                          d="M 30,110 L 130,80 L 230,130 L 330,55 L 430,95 L 530,35 L 530,140 L 30,140 Z"
                          fill="url(#dashboardSageGradient)"
                          opacity="0.22"
                        />
                        
                        {/* Connecting track line */}
                        <polyline
                          fill="none"
                          stroke="#3E5C4B"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={linePoints}
                        />
                        
                        {/* Circular indicators */}
                        {pointsList.map((pt, idx) => {
                          const x = 30 + idx * 100;
                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={pt.val}
                                r="4"
                                fill="#white"
                                stroke="#C8A97E"
                                strokeWidth="1.5"
                              />
                              <circle
                                cx={x}
                                cy={pt.val}
                                r="2"
                                fill="#3E5C4B"
                              />
                            </g>
                          );
                        })}

                        <defs>
                          <linearGradient id="dashboardSageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3E5C4B" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-[#8E8C82] px-6 mt-2 border-t border-[#FAF9F6] pt-2">
                      {pointsList.map((pt, idx) => (
                        <div key={idx} className="text-center">
                          <span className="block text-[#1F1F1F] font-bold">{pt.wordCount}w</span>
                          <span>{pt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 2. Compact Subscription Checklist FAQ (Span 4) */}
                <div className="bg-white p-5 rounded-2xl border border-[#EBEAE4] shadow-xs lg:col-span-4 flex flex-col justify-between hover:border-stone-300 transition-colors">
                  <div>
                    <span className="text-[10px] font-mono text-[#C8A97E] tracking-wider uppercase block mb-1">STRATEGIC SUPPORT</span>
                    <h3 className="font-serif text-sm font-semibold text-[#1F1F1F] mb-3">Tuning Guidelines</h3>
                    
                    <ul className="space-y-2.5 text-[11px] text-[#5C5A52] font-light">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3E5C4B] shrink-0 mt-0.5" />
                        Executive: formal reporting metrics.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3E5C4B] shrink-0 mt-0.5" />
                        Concise: removes passive sentences.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#3E5C4B] shrink-0 mt-0.5" />
                        Witty: increases emotional engagement.
                      </li>
                    </ul>
                  </div>

                  <span className="block text-[8px] font-mono text-stone-400 mt-4 bg-[#FAF9F6] p-2 rounded-lg border border-[#F1EFEA]">
                    Pro Tip: Submit documents in .txt to maintain paragraphs structure.
                  </span>
                </div>

              </div>

              {/* F. AI Request History & Recent Uploads List */}
              <div id="request-history-ledger" className="bg-white rounded-2xl border border-[#EBEAE4] overflow-hidden shadow-xs">
                
                {/* Ledger Header Controls */}
                <div className="p-5 border-b border-[#EBEAE4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                      <Library className="w-4 h-4 text-[#3E5C4B]" />
                      Refinement Transaction History
                    </h3>
                    <p className="text-[10px] text-[#8E8C82] mt-0.5">Meticulous log rows containing document metadata parameters.</p>
                  </div>

                  {/* Operational Filters Row */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#5C5A52] w-full sm:w-auto">
                    
                    {/* Style search */}
                    <input 
                      type="text"
                      className="text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-2.5 py-1.5 outline-none focus:border-[#3E5C4B] shrink-0 max-w-[130px]"
                      placeholder="Search title..."
                      value={searchDocQuery}
                      onChange={(e) => setSearchDocQuery(e.target.value)}
                    />

                    {/* Simple toggle select */}
                    <select
                      value={filterStyle}
                      onChange={(e) => setFilterStyle(e.target.value)}
                      className="bg-white border border-[#EBEAE4] text-xs px-2.5 py-1.5 rounded-xl text-[#1F1F1F] focus:outline-none focus:ring-1 focus:ring-[#3E5C4B]"
                    >
                      <option value="all">All Styles</option>
                      <option value="Executive">Executive</option>
                      <option value="Concise">Concise</option>
                      <option value="Warm">Warm</option>
                      <option value="Witty">Witty</option>
                    </select>

                    <button 
                      onClick={() => {
                        setFilterStyle('all');
                        setSearchDocQuery('');
                      }} 
                      className="p-1 px-2 hover:bg-stone-50 rounded text-xs font-mono"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Empty State View */}
                {filteredHistory.length === 0 ? (
                  <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 bg-[#FAF9F6] border border-[#EBEAE4] rounded-full mx-auto flex items-center justify-center">
                      <FileText className="w-5 h-5 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#1F1F1F]">No logs found</h4>
                      <p className="text-[11px] text-[#8E8C82] mt-1 font-light">
                        {simulateEmpty 
                          ? "Preview controller is toggled to clear state. Switch it off to restore rows."
                          : "Begin pasting copy drafts into the writer sandbox to populate database indexes."
                        }
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {simulateEmpty && (
                        <button
                          onClick={() => setSimulateEmpty(false)}
                          className="bg-white hover:bg-stone-50 text-[#1F1F1F] text-[10px] font-bold py-1.5 px-3 rounded-lg border border-[#EBEAE4] cursor-pointer"
                        >
                          Disable simulation
                        </button>
                      )}
                      
                      <button
                        onClick={() => setView('ai-tool')}
                        className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xs cursor-pointer"
                      >
                        Refine draft now
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* 3. Fully Polished Table Grid (Inspired by Linear) */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#5C5A52] border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#EBEAE4] font-mono text-[9px] text-[#8E8C82] uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Refined Document Title</th>
                          <th className="px-4 py-3 font-semibold">Tone Preset</th>
                          <th className="px-4 py-3 font-semibold">Grammar</th>
                          <th className="px-4 py-3 font-semibold text-center">Clarity</th>
                          <th className="px-4 py-3 font-semibold">Analyzed On</th>
                          <th className="px-5 py-3 text-right font-semibold">Ledger Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF9F6]">
                        {filteredHistory.map((doc) => (
                          <tr 
                            key={doc.id}
                            className="hover:bg-[#FAF9F6]/50 transition-colors group"
                          >
                            <td className="px-5 py-3.5">
                              <div className="min-w-0">
                                <button
                                  onClick={() => onSelectDoc(doc.id)}
                                  className="text-left font-semibold text-[#1F1F1F] hover:text-[#3E5C4B] transition-colors truncate block max-w-xs focus:outline-none cursor-pointer"
                                >
                                  {doc.title}
                                </button>
                                <span className="block text-[10px] text-[#8E8C82] font-mono truncate max-w-xs mt-0.5">
                                  "{doc.originalText.slice(0, 60)}..."
                                </span>
                              </div>
                            </td>
                            
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#3E5C4B]/5 text-[#3E5C4B] border border-[#3E5C4B]/20">
                                {doc.style}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1">
                                <span className={`font-mono text-[10px] font-semibold ${
                                  doc.analysis.grammarScore >= 90 ? 'text-emerald-700' : 'text-[#7C5A14]'
                                }`}>
                                  {doc.analysis.grammarScore}%
                                </span>
                                <div className="w-12 bg-stone-100 h-1.5 rounded-full overflow-hidden shrink-0 border border-stone-200/50">
                                  <div 
                                    className={`h-full rounded-full ${
                                      doc.analysis.grammarScore >= 90 ? 'bg-emerald-600' : 'bg-[#C8A97E]'
                                    }`}
                                    style={{ width: `${doc.analysis.grammarScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span className="font-mono text-[11px] font-bold text-[#1F1F1F]">
                                {doc.analysis.clarityScore}%
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-[#8E8C82] font-mono text-[10px]">
                              {new Date(doc.createdAt).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>

                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onSelectDoc(doc.id)}
                                  className="p-1 px-2 rounded-lg bg-white border border-[#E5E3DC] hover:border-[#3E5C4B] text-[#5C5A52] hover:text-[#3E5C4B] font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                                  title="View Comparison Editor"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Review
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteDoc(doc.id);
                                  }}
                                  className="p-1 text-[#8E8C82] hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                  title="Purge Document from cache"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </main>

      </div>

      {/* ================= G. INLINE QUICK INGEST DRAWER MODAL ================= */}
      {isQuickIngestOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F1F1F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EBEAE4] max-w-lg w-full overflow-hidden shadow-2xl animate-soft-fade">
            
            {/* Header */}
            <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#3E5C4B]" />
                <span className="text-xs font-mono font-bold text-[#1F1F1F] uppercase tracking-wider">
                  ScribeStone Quick Document Ingestion
                </span>
              </div>
              <button 
                onClick={() => setIsQuickIngestOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ingest Form */}
            <form onSubmit={handleInlineIngest} className="p-6 space-y-4">
              <div className="bg-[#FAF9F6] border border-[#F1EFEA] p-3 rounded-xl text-neutral-600 font-light text-[11px] leading-relaxed">
                🚀 This utility dispatches raw materials directly to Gemini models for background optimization. You do not need to redirect away from your dashboard overview.
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-1">Document Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="E.g. Engineering Bulletin"
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-3 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white font-serif"
                  value={quickIngestTitle}
                  onChange={(e) => setQuickIngestTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-1">Tone dialect</label>
                  <select
                    value={quickIngestStyle}
                    onChange={(e) => setQuickIngestStyle(e.target.value)}
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-3 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Concise">Concise</option>
                    <option value="Warm">Warm & Supportive</option>
                    <option value="Witty">Witty</option>
                  </select>
                </div>

                <div className="self-end text-[10px] text-[#8E8C82] leading-tight pb-2 font-mono">
                  Quota remaining: <span className="text-[#3E5C4B] font-bold">{(subscription.wordsLimit - subscription.wordsUsed).toLocaleString()}w</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-1">Raw prose draft</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Paste rambling email drafts, Slack messages, or raw bullet points..."
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl p-3 outline-none focus:border-[#3E5C4B] focus:bg-white resize-none font-sans"
                  value={quickIngestText}
                  onChange={(e) => setQuickIngestText(e.target.value)}
                ></textarea>
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#F1EFEA]">
                <button
                  type="button"
                  onClick={() => setIsQuickIngestOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-700 bg-white border border-[#EBEAE4] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIngesting || !quickIngestText.trim()}
                  className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-xs font-semibold py-2 px-5 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  {isIngesting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      Ingest Draft
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
