import { useState } from 'react';
import { ViewType, UserSubscription } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Settings, 
  User, 
  PenTool, 
  Sparkles, 
  ChevronDown, 
  LayoutDashboard, 
  Library, 
  HelpCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  subscription: UserSubscription;
  onOpenAuth: () => void;
}

export default function Header({ currentView, setView, subscription, onOpenAuth }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  // Helper to handle smooth scrolling to sections on the landing page
  const handleAnchorNav = (elementId: string) => {
    setIsMobileMenuOpen(false);
    
    // If not on landing, first transition to landing
    if (currentView !== 'landing') {
      setView('landing');
      // Delay slightly for React state render cycle
      setTimeout(() => {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSimpleView = (view: ViewType) => {
    setIsMobileMenuOpen(false);
    setView(view);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF9F6]/80 backdrop-blur-md border-b border-[#EBEAE4] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Design Signatures */}
          <button 
            onClick={() => handleSimpleView('landing')} 
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            id="nav-logo"
            aria-label="ScribeStone Home"
          >
            <div className="w-9 h-9 rounded-full bg-[#3E5C4B] flex items-center justify-center text-[#F8F7F4] font-serif font-bold text-lg shadow-xs transition-transform group-hover:scale-105 duration-300">
              S
            </div>
            <div>
              <span className="font-serif text-base font-bold tracking-tight text-[#1F1F1F] leading-tight block">
                ScribeStone
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#C8A97E] font-semibold mt-px">
                Editorial AI
              </span>
            </div>
          </button>

          {/* Center: Main Premium Navigation Menu Links */}
          <nav className="hidden md:flex items-center gap-7">
            
            {/* Features link with smooth anchor scroll */}
            <button
              onClick={() => handleAnchorNav('features-sec')}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer text-[#5C5A52] hover:text-[#3E5C4B]`}
              id="nav-link-features"
            >
              Features
            </button>

            {/* Pricing page view link */}
            <button
              onClick={() => handleSimpleView('pricing')}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                currentView === 'pricing' ? 'text-[#3E5C4B] font-semibold' : 'text-[#5C5A52] hover:text-[#3E5C4B]'
              }`}
              id="nav-link-pricing"
            >
              Pricing
            </button>

            {/* Blog Articles Link */}
            <button
              onClick={() => handleSimpleView('blog')}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                currentView === 'blog' ? 'text-[#3E5C4B] font-semibold' : 'text-[#5C5A52] hover:text-[#3E5C4B]'
              }`}
              id="nav-link-blog"
            >
              Blog
            </button>

            {/* Contact Concierge Link */}
            <button
              onClick={() => handleSimpleView('contact')}
              className={`text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                currentView === 'contact' ? 'text-[#3E5C4B] font-semibold' : 'text-[#5C5A52] hover:text-[#3E5C4B]'
              }`}
              id="nav-link-contact"
            >
              Contact
            </button>

            {/* Premium Workspace Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                onBlur={() => setTimeout(() => setIsWorkspaceMenuOpen(false), 200)}
                className="flex items-center gap-1 text-xs font-semibold tracking-wide text-[#3E5C4B] hover:text-[#2F4739] cursor-pointer"
                id="workspace-dropdown-trigger"
              >
                <span>Workspace Desk</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {isWorkspaceMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-52 bg-white rounded-xl border border-[#EBEAE4] shadow-lg py-1.5 overflow-hidden z-50 text-left"
                  >
                    <button
                      onClick={() => setView('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#C8A97E]" />
                      Dashboard & Metrics
                    </button>
                    <button
                      onClick={() => setView('ai-tool')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#3E5C4B]" />
                      Refinement Editor
                    </button>
                    <button
                      onClick={() => setView('history')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <Library className="w-3.5 h-3.5 text-[#8E8C82]" />
                      Historical Logs
                    </button>
                    <button
                      onClick={() => setView('secure-uploads')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C8A97E]" />
                      Secure Storage Hub
                    </button>
                    <button
                      onClick={() => setView('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#C8A97E]" />
                      Admin HQ Controls
                    </button>
                    <button
                      onClick={() => setView('design-system')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A97E]" />
                      SaaS Design System
                    </button>
                    <hr className="border-[#F1EFEA] my-1" />
                    <button
                      onClick={() => setView('settings')}
                      className="w-full text-left px-4 py-2 text-xs text-[#5C5A52] hover:text-[#3E5C4B] hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-stone-400" />
                      Account Settings
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </nav>

          {/* Right: Auth, User Profiling & Get Started Button */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Profile trigger (Login Simulation representation) */}
            <div className="flex items-center gap-2.5 pr-2.5 border-r border-[#EBEAE4]">
              <div className="text-right">
                <span className="block text-xs font-semibold text-[#1F1F1F] max-w-[110px] truncate leading-tight">
                  {subscription.name}
                </span>
                <span className="inline-flex items-center">
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-[#C8A97E]">
                    {subscription.tier} tier
                  </span>
                </span>
              </div>
              
              <button
                onClick={onOpenAuth}
                className="w-8.5 h-8.5 rounded-full bg-white hover:bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-[#5C5A52] cursor-pointer hover:text-[#1F1F1F] transition-all"
                title="Simulate Clerk Credentials & Login"
                id="btn-login-clerk"
              >
                <User className="w-4 h-4" />
              </button>
            </div>

            {/* Premium CTA Buttons */}
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-[#5C5A52] hover:text-[#1F1F1F] px-2 py-1.5 transition-colors cursor-pointer"
              id="header-btn-login"
            >
              Login
            </button>

            <button
              onClick={() => setView('ai-tool')}
              className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-xs cursor-pointer transition-all hover:shadow-md active:scale-98"
              id="header-btn-get-started"
            >
              Get Started
            </button>

          </div>

          {/* Mobile responsive hamburger toggle */}
          <div className="md:hidden flex items-center gap-2">
            
            {/* Quick Settings Icon */}
            <button
              onClick={() => setView('settings')}
              className="p-2 border border-[#E5E3DC] rounded-full text-[#5C5A52] hover:bg-[#FAF9F6] cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Icon directly */}
            <button
              onClick={onOpenAuth}
              className="p-2 border border-[#E5E3DC] rounded-full text-[#3E5C4B] hover:bg-[#FAF9F6] cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#1F1F1F] hover:bg-[#FAF9F6] cursor-pointer focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. Responsive Mobile Dropdown Drawer Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-[#EBEAE4] bg-[#FAF9F6] overflow-hidden"
          >
            <div className="px-5 py-6 space-y-5">
              
              {/* Profile Details for mobile */}
              <div className="bg-white p-4 rounded-xl border border-[#EBEAE4] flex items-center justify-between">
                <div>
                  <span className="block text-xs font-mono text-[#8E8C82] uppercase">SIGNED IN AS</span>
                  <span className="text-sm font-semibold text-[#1F1F1F] block">{subscription.name}</span>
                  <span className="text-[10px] text-[#5C5A52] block font-mono mt-0.5">{subscription.email}</span>
                </div>
                <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-[#3E5C4B]/10 text-[#3E5C4B] px-2.5 py-1 rounded-full border border-[#3E5C4B]/10">
                  {subscription.tier} plan
                </span>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-[#EBEAE4]">
                <button
                  onClick={() => handleAnchorNav('features-sec')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Features Log
                </button>
                <button
                  onClick={() => handleSimpleView('pricing')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Pricing Plans
                </button>
                <button
                  onClick={() => handleSimpleView('blog')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Editorial Blog
                </button>
                <button
                  onClick={() => handleSimpleView('contact')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Contact Help
                </button>
                <button
                  onClick={() => handleSimpleView('dashboard')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Dashboard UI
                </button>
                <button
                  onClick={() => handleSimpleView('ai-tool')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Refine Editor
                </button>
                <button
                  onClick={() => handleSimpleView('secure-uploads')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Secure Storage
                </button>
                <button
                  onClick={() => handleSimpleView('admin')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Admin Panel
                </button>
                <button
                  onClick={() => handleSimpleView('design-system')}
                  className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-white text-xs font-semibold text-[#5C5A52] transition-colors"
                >
                  Design System
                </button>
              </div>

              {/* Primary Mobile Action Controls */}
              <div className="space-y-3.5 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full bg-[#FAF9F6] border border-[#E5E3DC] text-[#1F1F1F] py-3 rounded-xl text-xs font-bold text-center cursor-pointer transition-colors hover:bg-[#F1EFEA]"
                >
                  Clerk Login Update
                </button>
                
                <button
                  onClick={() => handleSimpleView('ai-tool')}
                  className="w-full bg-[#3E5C4B] text-[#FAF9F6] py-3 rounded-xl text-xs font-bold text-center tracking-wide shadow-xs cursor-pointer hover:bg-[#2F4739] transition-colors"
                >
                  Try ScribeStone Free
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
