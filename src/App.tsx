import { useState, useEffect } from 'react';
import { ViewType, UserSubscription, AnalysisItem } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AIToolPage from './components/AIToolPage';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import BlogPage from './components/BlogPage';
import ContactPage from './components/ContactPage';
import LegalPages from './components/LegalPages';
import AuthPage from './components/AuthPage';
import PricingPage from './components/PricingPage';
import SecureUploadsPage from './components/SecureUploadsPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import SaaSDesignSystem from './components/SaaSDesignSystem';
import { Sparkles, X, CreditCard, ShieldCheck, Mail, Lock, User, Check, RefreshCw } from 'lucide-react';

export default function App() {
  
  // Primary Navigation
  const [currentView, setView] = useState<ViewType>('landing');

  // Backend Synced States
  const [subscription, setSubscription] = useState<UserSubscription>({
    email: "suprasaab96@gmail.com",
    name: "Suprasaab User",
    tier: "free",
    billingInterval: "month",
    wordsUsed: 382,
    wordsLimit: 5000,
    status: "active"
  });
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [currentDoc, setCurrentDoc] = useState<AnalysisItem | null>(null);

  // Overlay / Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState(subscription.email);
  const [authName, setAuthName] = useState(subscription.name);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [pendingStripeTier, setPendingStripeTier] = useState<'pro' | 'enterprise'>('pro');
  const [pendingStripeInterval, setPendingStripeInterval] = useState<'month' | 'year'>('month');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load initial backend parameters
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSubscription(profileData);
        }

        const historyRes = await fetch('/api/history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData);
        }
      } catch (err) {
        console.error("Failed to query full-stack environment:", err);
      }
    };
    loadData();
  }, []);

  // Dispatch analysis payload to server secure route
  const handleAnalyze = async (text: string, title: string, style: string): Promise<AnalysisItem | null> => {
    try {
      const response = await fetch('/api/analyze', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title, style })
      });

      if (response.ok) {
        const newDocResult = await response.json();
        
        // Refresh local listings
        setHistory((prev) => [newDocResult, ...prev]);
        
        // Refresh profile stats
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSubscription(profileData);
        }

        return newDocResult;
      } else {
        const errDetails = await response.json();
        alert(`Analysis Error: ${errDetails.error || "Execution failed"}`);
        return null;
      }
    } catch (err: any) {
      console.error("Failed to process document analysis request:", err);
      return null;
    }
  };

  // Discard document history index
  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis record permanently? This row will be purged in PostgreSQL.")) {
      return;
    }
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (currentDoc?.id === id) {
          setCurrentDoc(null);
        }
      }
    } catch (err) {
      console.error("Failed to discard document log:", err);
    }
  };

  // Launch a Stripe Checkout Simulator session
  const triggerStripeMockCheckout = (tier: 'pro' | 'enterprise', interval: 'month' | 'year') => {
    setPendingStripeTier(tier);
    setPendingStripeInterval(interval);
    setIsStripeOpen(true);
  };

  // Execute checkout approval
  const executeStripePayment = async () => {
    setCheckoutLoading(true);
    setTimeout(async () => {
      try {
        const response = await fetch('/api/subscribe', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: pendingStripeTier, billingInterval: pendingStripeInterval })
        });
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.user);
          setIsStripeOpen(false);
          setCheckoutLoading(false);
          setView('dashboard');
          alert(`Congratulations! Strategic payment authorized cleanly. Your account is upgraded to ScribeStone ${pendingStripeTier} level.`);
        }
      } catch (err) {
        console.error("Error finalizing subscription details:", err);
        setCheckoutLoading(false);
      }
    }, 1500);
  };

  // Clerk Auth Simulation Update
  const updateClerkAccount = () => {
    const updatedSub = { ...subscription, email: authEmail, name: authName };
    setSubscription(updatedSub);
    setIsAuthOpen(false);
    alert("Clerk User Directory updated successfully.");
  };

  // Reset words limit (Mock debugging tool)
  const handleResetQuota = async () => {
    try {
      const response = await fetch('/api/subscribe', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "free" })
      });
      if (response.ok) {
        const data = await response.json();
        // Set wordsUsed to 0 locally for sandbox
        const updated = { ...data.user, wordsUsed: 0 };
        setSubscription(updated);
        alert("Words quota counter reset back to 0 successfully inside local profile cache.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Refresh general charts
  const handleRefreshAllLedgers = async () => {
    try {
      const historyRes = await fetch('/api/history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setSubscription(profileData);
      }
      alert("Workspace transactions and PostgreSQL indices updated with production metadata.");
    } catch (e) {
      console.error(e);
    }
  };

  const loadDocToEditorView = (id: string) => {
    const select = history.find((h) => h.id === id);
    if (select) {
      setCurrentDoc(select);
      setView('ai-tool');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ScribeStone Universal Header Navbar */}
      <Header 
        currentView={currentView} 
        setView={setView} 
        subscription={subscription} 
        onOpenAuth={() => setView('auth')} 
      />

      {/* Main active template segment render */}
      <main className="flex-1 bg-[#F8F7F4]">
        {currentView === 'landing' && (
          <LandingPage 
            setView={setView} 
            subscription={subscription} 
            onSubscribe={triggerStripeMockCheckout} 
          />
        )}
        
        {currentView === 'dashboard' && (
          <Dashboard 
            subscription={subscription} 
            history={history} 
            setView={setView} 
            onSelectDoc={loadDocToEditorView} 
            onDeleteDoc={handleDeleteDoc}
            onRefreshData={handleRefreshAllLedgers}
          />
        )}

        {currentView === 'ai-tool' && (
          <AIToolPage 
            subscription={subscription} 
            onAnalyze={handleAnalyze} 
            currentDoc={currentDoc}
            setCurrentDoc={setCurrentDoc}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage 
            history={history} 
            onSelectDoc={loadDocToEditorView} 
            onDeleteDoc={handleDeleteDoc}
            activeDoc={currentDoc}
            setActiveDoc={setCurrentDoc}
          />
        )}

        {currentView === 'secure-uploads' && (
          <SecureUploadsPage 
            subscription={subscription} 
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage 
            subscription={subscription} 
            setView={setView}
            onUpdateSubscription={(updates) => setSubscription((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {currentView === 'design-system' && (
          <SaaSDesignSystem 
            setView={setView}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage 
            subscription={subscription} 
            onSubscribe={triggerStripeMockCheckout} 
            setView={setView}
            onResetQuota={handleResetQuota}
          />
        )}

        {currentView === 'blog' && <BlogPage />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'pricing' && (
          <PricingPage 
            setView={setView} 
            subscription={subscription} 
            onSubscribe={triggerStripeMockCheckout}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            setView={setView} 
            subscription={subscription} 
            onUpdateSubscription={(updates) => setSubscription((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {(currentView === 'privacy' || currentView === 'terms') && (
          <LegalPages type={currentView} />
        )}
      </main>

      {/* Shared Footer Segment */}
      <Footer setView={setView} />

      {/* Interactive Overlay 1: Clerk Authentication Portal Simulator */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F1F1F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EBEAE4] max-w-sm w-full overflow-hidden shadow-2xl animate-soft-fade">
            
            {/* Header */}
            <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#3E5C4B] flex items-center justify-center text-[#F8F7F4] font-serif font-bold text-xs">
                  S
                </div>
                <span className="text-xs font-bold text-[#1F1F1F] font-serif">Clerk Registry Services</span>
              </div>
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-5 space-y-4">
              <div className="text-center pb-2">
                <span className="text-[10px] font-mono uppercase bg-[#C8A97E]/10 text-[#7C5A14] px-2 py-0.5 rounded border border-[#C8A97E]/20">
                  DEVELOPER SIMULATOR MODE
                </span>
                <p className="text-xs text-[#5C5A52] mt-2.5 font-light">
                  ScribeStone integrates <strong>Clerk Authentication</strong>. You can customize active user metadata fields to calibrate route permissions.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-1">Writer Nickname</label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg px-3 py-2 outline-none focus:border-[#3E5C4B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-1">Email Account</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg px-3 py-2 outline-none focus:border-[#3E5C4B] focus:bg-white"
                />
              </div>

              <button
                onClick={updateClerkAccount}
                className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] text-xs font-semibold py-2.5 rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Save Clerk Credentials
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Overlay 2: Stripe Billing Payment gateway Simulator */}
      {isStripeOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F1F1F]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EBEAE4] max-w-md w-full overflow-hidden shadow-2xl animate-soft-fade">
            
            {/* Header */}
            <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3E5C4B]" />
                <span className="text-xs font-mono font-bold text-[#1F1F1F]">Stripe checkout portal</span>
              </div>
              <button 
                onClick={() => setIsStripeOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">
              
              {/* Product meta card */}
              <div className="flex justify-between items-start border-b border-[#F1EFEA] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#8E8C82] uppercase">PURCHASING SUBSCRIPTION TIER</span>
                  <h3 className="font-serif font-bold text-heading text-[#1F1F1F]">
                    ScribeStone-Pro-Subscription
                  </h3>
                  <p className="text-xs text-[#5C5A52] font-light mt-1">Includes unlimited uploads & tone presets</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-[#1F1F1F]">
                    ${pendingStripeTier === 'pro' ? (pendingStripeInterval === 'month' ? '19' : '15') : (pendingStripeInterval === 'month' ? '99' : '79')}
                  </span>
                  <span className="block text-[9px] font-mono text-[#8E8C82]"> / {pendingStripeInterval}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-start gap-2.5 text-xs text-stone-600 font-light leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-[#3E5C4B] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1F1F1F]">Protected Stripe Environment</span>
                    <p className="mt-1">
                      This sandbox replicates real payment intents. Authorizing this payment upgrades your Clerk token permissions. No real credits will be deducted.
                    </p>
                  </div>
                </div>

                {/* Submitting indicator */}
                <button
                  onClick={executeStripePayment}
                  disabled={checkoutLoading}
                  className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-xs font-semibold py-3.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Securing transaction and registering tier...
                    </>
                  ) : (
                    <>
                      Authorize payment via Stripe Checkout
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setIsStripeOpen(false)}
                  className="text-stone-400 hover:text-stone-700 block text-xs text-center mx-auto cursor-pointer"
                >
                  Decline and return
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
