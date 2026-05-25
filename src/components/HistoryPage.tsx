import { useState } from 'react';
import { AnalysisItem } from '../types';
import { Library, Search, Clock, Trash2, ArrowRight, CornerDownRight, Check, Copy } from 'lucide-react';

interface HistoryPageProps {
  history: AnalysisItem[];
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  activeDoc: AnalysisItem | null;
  setActiveDoc: (doc: AnalysisItem | null) => void;
}

export default function HistoryPage({ 
  history, 
  onSelectDoc, 
  onDeleteDoc, 
  activeDoc, 
  setActiveDoc 
}: HistoryPageProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Filter history items based on search query
  const filteredHistory = history.filter((item) => {
    const textMatch = item.originalText.toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const styleMatch = item.style.toLowerCase().includes(searchQuery.toLowerCase());
    return textMatch || titleMatch || styleMatch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="animate-soft-fade px-6 py-10 max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div className="mb-8 border-b border-[#EBEAE4] pb-5">
        <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase">PERSISTENT TRANSACTION LOGS</span>
        <h1 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Historical Records</h1>
        <p className="text-xs text-[#5C5A52] mt-1 font-light">Inspect past stylistic analysis results, review grammar audits, or retrieve completed drafts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Grid: Listing (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title, style or draft text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-[#E5E3DC] rounded-lg pl-9.5 pr-4 py-2.5 outline-none focus:border-[#3E5C4B] transition-colors"
            />
          </div>

          {/* Records lists */}
          {filteredHistory.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#EBEAE4]">
              <Library className="w-8 h-8 text-[#E5E3DC] mx-auto mb-3" />
              <p className="text-xs text-[#8E8C82]">No matching records found.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[34rem] overflow-y-auto pr-1">
              {filteredHistory.map((item) => {
                const isSelected = activeDoc?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all relative group ${
                      isSelected 
                        ? 'bg-[#3E5C4B]/5 border-[#3E5C4B]' 
                        : 'bg-white border-[#EBEAE4] hover:bg-[#FAF9F6]'
                    }`}
                    onClick={() => setActiveDoc(item)}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="block text-xs font-semibold text-[#1F1F1F] truncate pr-4 max-w-[150px]">
                        {item.title}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(item.id);
                          if (isSelected) setActiveDoc(null);
                        }}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex shrink-0"
                        title="Delete log permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-[#5C5A52] truncate line-clamp-1 font-light italic mt-1.5">
                      "{item.originalText}"
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono mt-3 text-[#8E8C82] border-t border-[#F1EFEA] pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[#3E5C4B] font-semibold uppercase tracking-wider">{item.style}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Grid: Expanded Details comparison view (lg:col-span-8) */}
        <div className="lg:col-span-8">
          
          {!activeDoc ? (
            <div className="bg-[#FAF9F6] border border-dashed border-[#D9D6CE] rounded-xl p-24 text-center">
              <Library className="w-12 h-12 text-[#D9D6CE] mx-auto mb-4" />
              <p className="text-sm font-serif text-[#1F1F1F] font-medium">No Document Opened</p>
              <p className="text-xs text-[#8E8C82] max-w-xs mx-auto mt-1 leading-relaxed">
                Select a historical record file ledger on the left side menu column to inspect comparison indices and corrections.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#EBEAE4] rounded-xl p-6 space-y-6 animate-soft-fade">
              
              {/* Report Header detail */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F1EFEA] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-[#1F1F1F] font-bold text-lg">{activeDoc.title}</h2>
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-[#3E5C4B]/10 text-[#3E5C4B] px-2 py-0.5 rounded font-bold">
                      {activeDoc.style}
                    </span>
                  </div>
                  <span className="block text-[10px] font-mono text-[#8E8C82] mt-1">
                    Processed date: {new Date(activeDoc.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(activeDoc.analyzedText)}
                    className="flex items-center gap-1.5 bg-white hover:bg-[#FAF9F6] text-[#5C5A52] border border-[#E2E0D8] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3E5C4B]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Result
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveDoc(null)}
                    className="text-stone-400 hover:text-stone-700 text-xs px-2 py-1 flex items-center-center shrink-0 cursor-pointer"
                  >
                    Close report
                  </button>
                </div>
              </div>

              {/* Index metrics */}
              <div className="grid grid-cols-2 bg-[#F8F7F4] p-4 rounded-xl border border-[#F1EFEA] divide-x divide-[#EBEAE4] text-center">
                <div>
                  <span className="block text-2.5xl font-serif font-bold text-[#3E5C4B]">{activeDoc.analysis.grammarScore}%</span>
                  <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-widest block mt-0.5">Grammar Index</span>
                </div>
                <div>
                  <span className="block text-2.5xl font-serif font-bold text-[#C8A97E]">{activeDoc.analysis.clarityScore}%</span>
                  <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-widest block mt-0.5">Clarity Index</span>
                </div>
              </div>

              {/* Comparative Split screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#F1EFEA] rounded-xl overflow-hidden">
                <div className="bg-[#FAF9F6] p-4 border-b md:border-b-0 md:border-r border-[#F1EFEA]">
                  <span className="text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider block mb-2.5">Original Entry draft</span>
                  <div className="text-xs leading-relaxed text-[#5C5A52] max-h-48 overflow-y-auto font-serif">
                    {activeDoc.originalText}
                  </div>
                </div>
                <div className="bg-white p-4">
                  <span className="text-[10px] font-mono text-[#3E5C4B] uppercase tracking-wider block mb-2.5">Scribed Revision result</span>
                  <div className="text-xs leading-relaxed text-[#1F1F1F] max-h-48 overflow-y-auto whitespace-pre-wrap font-serif">
                    {activeDoc.analyzedText}
                  </div>
                </div>
              </div>

              {/* Adjustments notes list */}
              <div>
                <h4 className="text-[10px] font-mono tracking-wider text-[#8E8C82] uppercase mb-2.5">Style Annotations</h4>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {activeDoc.analysis.keyImprovements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs text-[#5C5A52] font-light pl-1">
                      <span className="text-[#C8A97E] mt-0.5 font-bold">•</span>
                      <p>{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar highlights */}
              {activeDoc.analysis.grammarIssues && activeDoc.analysis.grammarIssues.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono tracking-wider text-[#8E8C82] uppercase mb-2.5">Grammar corrections index</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-44 overflow-y-auto">
                    {activeDoc.analysis.grammarIssues.map((issue, idx) => (
                      <div key={idx} className="p-3 border border-[#F1EFEA] rounded-lg text-xs bg-[#FAF9F6]">
                        <p className="line-through text-stone-400 font-mono mb-1 text-[11px]">"{issue.original}"</p>
                        <p className="text-[#3E5C4B] font-mono font-bold mb-1 pl-2.5 border-l-2 border-[#C8A97E]">"{issue.suggested}"</p>
                        <p className="text-[10px] text-[#8E8C82] font-light mt-1.5 italic font-sans flex items-center gap-1 leading-relaxed">
                          <CornerDownRight className="w-3 h-3 text-[#C8A97E] shrink-0" />
                          {issue.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
