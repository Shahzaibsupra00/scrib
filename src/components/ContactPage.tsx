import { useState, FormEvent } from 'react';
import { 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Send, 
  Sparkles, 
  ChevronDown, 
  LifeBuoy, 
  User, 
  Check, 
  ExternalLink, 
  X,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "ticket-108",
      subject: "Stripe transaction invoice not received",
      message: "Upgraded my account to Pro billing last night but haven't received my corporate PDF invoice. Please forward it.",
      status: "Resolved",
      createdAt: "May 22, 2026"
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Active FAQ toggles
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Demo Live Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Welcome to ScribeStone Concierge. How can the editorial team assist you today?', time: 'Just now' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `ticket-${Math.floor(100 + Math.random() * 900)}`,
        subject: formData.subject || "General Inquiry",
        message: formData.message,
        status: "Open",
        createdAt: "Just now"
      };

      setTickets([newTicket, ...tickets]);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1200);
  };

  // Chat message submit
  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: chatInput, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Auto-reply context simulation
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Thank you for reaching out! Our team is actively reviewing your message. Since this is an offline playground simulator, your chat is registered. Would you like us to generate a support ticket for this?";
      if (chatInput.toLowerCase().includes('billing') || chatInput.toLowerCase().includes('stripe')) {
        replyText = "Ah, a billing inquiry. Standard Stripe subscription transactions are simulated instantaneously. For immediate resolution, toggle your active subscription inside the ScribeStone pricing layout.";
      } else if (chatInput.toLowerCase().includes('limit') || chatInput.toLowerCase().includes('token')) {
        replyText = "Word cap updates take effect immediately upon successful payment triggers or free sandbox resets. Check your active metrics inside ScribeStone's analytical panels.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText, time: 'Just now' }]);
    }, 1500);
  };

  const faqPreviews = [
    {
      q: "What is your standard support response time?",
      a: "Our editorial team is online 24/7. Pro Scribe subscriptions receive detailed reviews within 12 hours. Team Studio licenses feature dedicated accounts with <2-hour guaranteed SLA pings."
    },
    {
      q: "Does submitting a ticket register a real account?",
      a: "Yes. Ticket records are stored in your active client-side sandbox cache. If you register or authenticate via password guidelines, your tickets remain bound to your credentials safely."
    },
    {
      q: "How secure is ScribeStone with my draft guidelines?",
      a: "We deploy isolated secure containers. Your document tokens and vocabulary styles are fully encrypted, never shared, and never used to train third-party language systems."
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F] font-sans pb-24">
      
      {/* 1. Header Section */}
      <section className="relative px-4 pt-12 pb-14 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center space-y-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#3E5C4B]/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 text-[10px] font-mono font-bold text-[#3E5C4B] shadow-2xs">
          <LifeBuoy className="w-3.5 h-3.5 text-[#C8A97E]" />
          ALWAYS OPERATING • ACTIVE CONCIERGE PING
        </div>

        <h1 className="font-serif text-3.5xl sm:text-5xl font-semibold tracking-tight text-[#1F1F1F]">
          A collaborative touch is <br />
          <span className="italic text-[#3E5C4B] font-serif font-normal">always available.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#5C5A52] font-light leading-relaxed">
          Need custom word tokens, custom branding guidelines, or Stripe invoice information? Select our quick forms or open direct live chat channels below.
        </p>
      </section>

      {/* 2. Primary Layout Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. Left Card: The Premium Contact Form */}
          <div className="lg:col-span-7 bg-white border border-[#EBEAE4] rounded-3xl p-6 sm:p-8 shadow-xs">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#FAF9F6]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1F1F]">Send Pristine Message</h3>
                <p className="text-[11px] text-[#8E8C82] font-light">Your ticket will instantly populate our active dashboard registry logs.</p>
              </div>
              <Mail className="w-5 h-5 text-[#C8A97E]" />
            </div>

            {success && (
              <div className="mb-6 bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 p-4.5 rounded-2xl text-xs text-[#3E5C4B] flex items-start gap-3 animate-soft-fade">
                <CheckCircle2 className="w-5 h-5 text-[#3E5C4B] shrink-0 mt-px" />
                <div>
                  <span className="block font-bold">Ticket dispatched successfully!</span> 
                  <span className="block font-light text-[11px] text-stone-600 mt-1">
                    Your inquiry has been allocated active key <strong>#{Math.floor(1000 + Math.random() * 9000)}</strong>. The ScribeStone editorial board will issue validation to your registered email soon.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#8E8C82] uppercase font-bold tracking-wider">Your Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Arthur Stone"
                    required
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-4 py-3 outline-none focus:border-[#3E5C4B] focus:bg-white focus:ring-1 focus:ring-[#3E5C4B]/20 transition-all font-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#8E8C82] uppercase font-bold tracking-wider">Secure Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="arthur@writingstudios.com"
                    required
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-4 py-3 outline-none focus:border-[#3E5C4B] focus:bg-white focus:ring-1 focus:ring-[#3E5C4B]/20 transition-all font-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase font-bold tracking-wider">Subject of Inquiry</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Upgrade priority and Stripe invoicing"
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-4 py-3 outline-none focus:border-[#3E5C4B] focus:bg-white focus:ring-1 focus:ring-[#3E5C4B]/20 transition-all font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase font-bold tracking-wider">Detailed Message</label>
                <textarea 
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Kindly outline your support requests, customized billing options, or operational feedback guidelines..."
                  required
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl p-4 outline-none focus:border-[#3E5C4B] focus:bg-white focus:ring-1 focus:ring-[#3E5C4B]/20 transition-all resize-none font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] font-mono text-stone-400">
                  Secure processing verified via AI framework sandbox
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching telemetry...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Support Ticket</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* B. Right Sidebar: Info Cards & FAQ previews */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick response stats & active response times */}
            <div className="bg-[#3E5C4B] text-[#FAF9F6] rounded-3xl p-6 relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A97E]/10 rounded-full blur-2xl"></div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-[#C8A97E] tracking-widest font-bold">RESPONSE METRICS</span>
                <h4 className="font-serif text-lg font-bold">Average Latency Rules</h4>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[#8E8C82] text-[8px] font-mono uppercase">PRO SCRIBE SLA</span>
                  <span className="block text-sm font-serif font-black text-[#C8A97E] mt-0.5">&lt; 12 Hours</span>
                  <span className="block text-[8px] text-stone-300 mt-1">Secure email follow-up</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <span className="block text-[#8E8C82] text-[8px] font-mono uppercase">TEAM STUDIO SLA</span>
                  <span className="block text-sm font-serif font-black text-[#C8A97E] mt-0.5">&lt; 2 Hours</span>
                  <span className="block text-[8px] text-stone-300 mt-1">Priority routing line</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-stone-200/90 font-light flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>Our global registry is active. Current local team time is 2026 UTC.</span>
              </div>
            </div>

            {/* Email list box */}
            <div className="bg-white border border-[#EBEAE4] rounded-2xl p-5 space-y-3.5">
              <h4 className="text-xs font-semibold text-[#1F1F1F] font-serif uppercase tracking-wider text-[#3E5C4B]">Direct Dispatch Lines</h4>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2.5 bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl hover:border-[#3E5C4B]/20 transition-all">
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400">EDITORIAL CO-PILOT</span>
                    <span className="font-bold text-[#1F1F1F]">concierge@scribestone.com</span>
                  </div>
                  <Mail className="w-4 h-4 text-stone-400" />
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl hover:border-[#3E5C4B]/20 transition-all">
                  <div>
                    <span className="block text-[9px] font-mono text-stone-400">STRIPE BILLING SECURE</span>
                    <span className="font-bold text-[#1F1F1F]">billing@scribestone.com</span>
                  </div>
                  <Mail className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            </div>

            {/* FAQ Previews accordion */}
            <div className="bg-white border border-[#EBEAE4] rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-semibold text-[#1F1F1F] font-serif uppercase tracking-wider text-[#3E5C4B]">FAQ Quick Preview</h4>
              
              <div className="space-y-3">
                {faqPreviews.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="border-b last:border-0 border-[#FAF9F6] pb-3.5 last:pb-0">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left flex items-start justify-between gap-2 text-xs font-semibold text-[#1F1F1F] hover:text-[#3E5C4B] transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed mt-2 bg-[#FAF9F6] p-2.5 rounded-lg border border-[#EBEAE4]/40 animate-soft-fade">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Chat Action launcher widget */}
            <div className="bg-[#C8A97E]/10 border border-[#C8A97E]/30 rounded-2xl p-5 space-y-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold text-[#7C5A14] uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant Messenger Online
              </div>
              
              <div className="space-y-1">
                <h5 className="font-serif text-sm font-bold text-[#1F1F1F]">Start Live Simulation</h5>
                <p className="text-[11px] text-[#5C5A52] font-light font-sans max-w-sm mx-auto">
                  Engage instantly with real-time feedback and dynamic mock response bots.
                </p>
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Launch Live Concierge Room</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Render Historical Tickets Log (Persistence visual feedback) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl border border-[#EBEAE4] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#FAF9F6] pb-3">
            <ShieldCheck className="w-4.5 h-4.5 text-[#3E5C4B]" />
            <h4 className="font-serif text-sm font-semibold text-[#1F1F1F]">Registry Log: Active Tickets ({tickets.length})</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <div 
                key={t.id} 
                className="bg-[#FAF9F6] border border-[#EBEAE4] p-4 rounded-xl text-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200/40 pb-2">
                    <span className="font-semibold text-[#1F1F1F] truncate pr-4 max-w-[200px]">{t.subject}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase p-1 px-2 rounded-md ${
                      t.status === 'Resolved' ? 'bg-emerald-100 text-[#3E5C4B]' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed whitespace-pre-line font-serif italic py-2">
                    "{t.message}"
                  </p>
                </div>
                
                <div className="text-[9px] font-mono text-[#8E8C82] flex justify-between border-t border-stone-200/30 pt-2 items-center">
                  <span>ID: {t.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. IMMERSIVE FLOATING LIVE CHAT BOX COMPONENT (Triggered via state modal) */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white border border-[#EBEAE4] rounded-3xl shadow-xl overflow-hidden animate-soft-fade max-h-[480px] flex flex-col">
            
            {/* Chat header */}
            <div className="bg-[#3E5C4B] text-[#FAF9F6] p-4 pb-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
                    alt="Concierge avatar"
                    className="w-8 h-8 rounded-full border border-[#FAF9F6]/20 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#3E5C4B]"></span>
                </div>
                <div>
                  <span className="block text-xs font-bold leading-tight">Arthur Stone</span>
                  <span className="block text-[8px] text-[#C8A97E] font-mono tracking-wider uppercase font-bold leading-none mt-0.5">ScribeStone Concierge</span>
                </div>
              </div>

              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-[#FAF9F6]/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] min-h-[220px] bg-[#FAF9F6]/40">
              {chatMessages.map((msg, mIdx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={mIdx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-soft-fade`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-light ${
                        isUser 
                          ? 'bg-[#3E5C4B] text-[#FAF9F6] rounded-tr-none' 
                          : 'bg-white text-[#1F1F1F] border border-[#EBEAE4] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] font-mono text-stone-400 px-1">{msg.time}</span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono pl-3">
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-200"></div>
                  <span>Assistant typing...</span>
                </div>
              )}
            </div>

            {/* Chat input controls */}
            <form onSubmit={handleSendChat} className="border-t border-[#EBEAE4] p-3 flex gap-2 bg-white">
              <input 
                type="text"
                placeholder="Ask about tokens, billing, presets..."
                required
                className="flex-1 bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#3E5C4B] transition-colors"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] p-2 rounded-xl cursor-pointer"
                title="Send Chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
