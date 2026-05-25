import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { AnalysisItem, UserSubscription } from '../types';
import { Sparkles, FileText, UploadCloud, Copy, Check, Info, ArrowRight, ShieldCheck, CornerDownRight, CheckCircle, BrainCircuit, RefreshCw } from 'lucide-react';

interface AIToolPageProps {
  subscription: UserSubscription;
  onAnalyze: (text: string, title: string, style: string) => Promise<AnalysisItem | null>;
  currentDoc: AnalysisItem | null;
  setCurrentDoc: (doc: AnalysisItem | null) => void;
}

const STYLES = [
  { name: "Professional", desc: "For executive proposals, team reports, and formal business emails." },
  { name: "Concise", desc: "For rapid product updates, text message copy, and trimming wordiness." },
  { name: "Warm & Encouraging", desc: "For collaborative reviews, support communications, or newsletters." },
  { name: "Witty & Engaging", desc: "For newsletter hooks, branding campaigns, and retaining reader engagement." }
];

export default function AIToolPage({ 
  subscription, 
  onAnalyze, 
  currentDoc, 
  setCurrentDoc 
}: AIToolPageProps) {

  // Form State
  const [inputText, setInputText] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Professional");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedRevision, setCopiedRevision] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed Values
  const wordsCount = inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length;

  // Handles text copying
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRevision(true);
    setTimeout(() => setCopiedRevision(false), 2000);
  };

  // Handles drag activity
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handles item drops
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await loadFileContent(file);
    }
  };

  // Click file manual input select
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await loadFileContent(file);
    }
  };

  // Reads the raw txt or markdown file content
  const loadFileContent = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const isTxt = file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json');
      if (!isTxt) {
        setErrorNotice("Unsupported document format. Please upload text (*.txt/ *.md) files.");
        resolve();
        return;
      }

      setErrorNotice(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setInputText(event.target.result);
          setDocTitle(file.name);
        }
        resolve();
      };
      reader.readAsText(file);
    });
  };

  // Triggers backend Express /api/analyze loop
  const handleFormSubmit = async () => {
    if (!inputText.trim()) {
      setErrorNotice("Please input or paste a text draft beforehand.");
      return;
    }

    if (subscription.wordsUsed + wordsCount > subscription.wordsLimit) {
      setErrorNotice("Account processed limits exhausted. Upgrade to Pro Tier or Enterprise to process long drafts.");
      return;
    }

    setErrorNotice(null);
    setIsAnalyzing(true);
    setCurrentDoc(null);

    const title = docTitle.trim() || `Draft-${new Date().toLocaleTimeString()}.txt`;
    
    try {
      const resultDoc = await onAnalyze(inputText, title, selectedStyle);
      if (resultDoc) {
        setCurrentDoc(resultDoc);
      } else {
        setErrorNotice("Analysis failed. Please verify your connection & credentials.");
      }
    } catch (err: any) {
      setErrorNotice("API Exception during execution: " + (err.message || err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      
      {/* Scribe Title details */}
      <div className="mb-6 justify-between flex items-end">
        <div>
          <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase">EDITORIAL CRUCIBLE</span>
          <h1 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Refinement Desk</h1>
        </div>
        <div className="text-[11px] font-mono text-[#8E8C82]">
          Session usage: <span className="text-[#1F1F1F] font-semibold">{wordsCount} words</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: User draft configs & input controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main settings and tone controls card */}
          <div className="bg-white p-5 rounded-xl border border-[#EBEAE4] shadow-xs">
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-2 font-mono uppercase tracking-wider">
              Document Title
            </label>
            <input 
              type="text" 
              placeholder="E.g. Newsletter Revision Draft.md" 
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg px-3.5 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white transition-colors"
            />
            
            <hr className="border-[#F1EFEA] my-5" />

            <label className="block text-xs font-semibold text-[#1F1F1F] mb-3.5 font-mono uppercase tracking-wider">
              1. Tone Dial Presets
            </label>
            <div className="space-y-2.5">
              {STYLES.map((st) => {
                const isActive = selectedStyle === st.name;
                return (
                  <button
                    key={st.name}
                    onClick={() => setSelectedStyle(st.name)}
                    className={`text-left w-full p-3 rounded-lg border cursor-pointer transition-all ${
                      isActive 
                        ? 'border-[#3E5C4B] bg-[#3E5C4B]/5 text-[#3E5C4B]' 
                        : 'border-[#E5E3DC] bg-white text-[#5C5A52] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold font-serif text-[#1F1F1F] group-hover:text-[#3E5C4B]">
                        {st.name}
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]"></div>}
                    </div>
                    <p className="text-[10px] leading-relaxed text-[#8E8C82] font-light">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger control */}
          <div className="bg-white p-5 rounded-xl border border-[#EBEAE4] shadow-xs">
            {errorNotice && (
              <div className="mb-4 bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice:</span> {errorNotice}
                </div>
              </div>
            )}

            <button
              onClick={handleFormSubmit}
              disabled={isAnalyzing || !inputText.trim()}
              className={`w-full py-3.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isAnalyzing || !inputText.trim()
                  ? 'bg-stone-200 text-stone-400 border border-stone-300 pointer-events-none'
                  : 'bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] shadow-sm'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Scribing Document through Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A97E] animate-pulse" />
                  Analyze and Refine Draft
                </>
              )}
            </button>

            <span className="text-[10px] text-[#8E8C82] text-center block mt-3 font-mono">
              Leverages gemini-3.5-flash server-side schema matrices
            </span>
          </div>

        </div>

        {/* Right column: Main text typing field and Output Results (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main workspace container */}
          <div className="bg-white rounded-xl border border-[#EBEAE4] overflow-hidden shadow-xs">
            
            {/* Nav pane selector */}
            <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-4 py-2.5 flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider font-semibold">2. Drafting Desk</span>
              <button 
                onClick={() => setInputText("")}
                className="text-[10px] font-mono text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear input
              </button>
            </div>

            {/* Input editor dropzone wrapper */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-4 transition-colors relative min-h-[14rem] ${dragActive ? 'bg-[#3E5C4B]/5' : ''}`}
            >
              {inputText.trim() === "" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-6">
                  <UploadCloud className="w-8 h-8 text-[#C8A97E] mb-2.5" />
                  <p className="text-xs font-semibold text-[#1F1F1F]">Drag & drop file or paste text content</p>
                  <p className="text-[10px] text-[#8E8C82] px-6 mt-1 font-mono uppercase tracking-wider leading-relaxed">
                    Processes raw markdown, txt or direct drafts
                  </p>
                  
                  {/* Dummy trigger button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3.5 bg-white pointer-events-auto border border-[#E5E3DC] text-[10px] font-semibold text-[#5C5A52] px-3 py-1.5 rounded-lg hover:border-[#3E5C4B] transition-colors cursor-pointer-parent"
                  >
                    Select File
                  </button>
                </div>
              )}

              <textarea
                placeholder="Draft stone-cold masterpieces here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full min-h-[14rem] text-xs font-serif leading-relaxed text-[#1F1F1F] bg-transparent resize-y outline-none border-none p-1 placeholder-stone-300"
              />

              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden" 
                accept=".txt,.md,.json"
              />
            </div>

          </div>

          {/* Core outputs display layer */}
          {(isAnalyzing || currentDoc) && (
            <div className="bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl p-5 md:p-6 animate-soft-fade">
              
              {isAnalyzing ? (
                <div className="py-20 text-center">
                  <BrainCircuit className="w-12 h-12 text-[#3E5C4B]/30 animate-pulse mx-auto mb-4" />
                  <p className="text-[#3E5C4B] font-serif text-sm font-semibold">Generating Editorial Breakdown</p>
                  <p className="text-[10px] text-[#8E8C82] font-mono mt-1">Wait while ScribeStone checks for stylistic balance...</p>
                </div>
              ) : (
                currentDoc && (
                  <div className="space-y-6">
                    
                    {/* Header score indices */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 bg-white p-4 rounded-xl border border-[#EBEAE4] gap-4">
                      
                      {/* Metric 1: Grammar */}
                      <div className="text-center font-serif">
                        <span className="block text-2.5xl font-bold text-[#3E5C4B]">
                          {currentDoc.analysis.grammarScore}%
                        </span>
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-widest">Grammar Accuracy</span>
                      </div>

                      {/* Metric 2: Clarity */}
                      <div className="text-center font-serif border-y sm:border-y-0 sm:border-x border-[#F1EFEA] py-2.5 sm:py-0">
                        <span className="block text-2.5xl font-bold text-[#C8A97E]">
                          {currentDoc.analysis.clarityScore}%
                        </span>
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-widest">Clarity Indicator</span>
                      </div>

                      {/* Metric 3: Grammar Issues Count */}
                      <div className="text-center font-serif">
                        <span className="block text-2.5xl font-bold text-red-700">
                          {currentDoc.analysis.spellingErrorsCount + currentDoc.analysis.grammarIssuesCount}
                        </span>
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-widest">Errors Addressed</span>
                      </div>

                    </div>

                    {/* Section: Key Improvements list */}
                    <div>
                      <h4 className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider font-semibold mb-3">Key Structural Adjustments</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {currentDoc.analysis.keyImprovements.map((item, id) => (
                          <div key={id} className="bg-white p-3.5 rounded-lg border border-[#F1EFEA] flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#5C5A52] leading-relaxed font-light">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section: Grammar Corrections Annotation Diff */}
                    {currentDoc.analysis.grammarIssues && currentDoc.analysis.grammarIssues.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider font-semibold mb-3">Draft corrections diff</h4>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {currentDoc.analysis.grammarIssues.map((issue, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-[#F1EFEA] text-xs">
                              <div className="flex flex-col sm:flex-row gap-2.5">
                                <div className="flex-1">
                                  <span className="text-[9px] font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded font-semibold mr-1.5 uppercase tracking-wide">Replace</span>
                                  <span className="font-mono text-red-700 text-stone-500 line-through">"{issue.original}"</span>
                                </div>
                                <div className="sm:border-l sm:border-[#F1EFEA] sm:pl-3 flex-1">
                                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-semibold mr-1.5 uppercase tracking-wide">With</span>
                                  <span className="font-mono text-emerald-700 font-bold">"{issue.suggested}"</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-[#8E8C82] mt-2 italic font-light flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3 text-[#C8A97E]" />
                                {issue.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section: Clean Refined Output Draft */}
                    <div className="bg-white border border-[#EBEAE4] rounded-xl overflow-hidden shadow-xs">
                      <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-4 py-3 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-[#3E5C4B] uppercase tracking-wider font-bold">Refined document result</span>
                        
                        <button
                          onClick={() => handleCopyToClipboard(currentDoc.analyzedText)}
                          className="flex items-center gap-1.5 bg-white hover:bg-[#FAF9F6] text-[#5C5A52] border border-[#E2E0D8] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          {copiedRevision ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#3E5C4B]" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Text
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="p-5 font-serif text-xs leading-relaxed text-[#1F1F1F] max-h-96 overflow-y-auto whitespace-pre-wrap">
                        {currentDoc.analyzedText}
                      </div>
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
