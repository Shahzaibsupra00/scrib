import React, { useState, useEffect } from 'react';
import { UserSubscription, ViewType } from '../types';
import { 
  Users, 
  TrendingUp, 
  Cpu, 
  Server, 
  Ticket, 
  ToggleLeft, 
  ToggleRight, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Calendar, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  PlusCircle, 
  RefreshCw, 
  Loader2, 
  ArrowUpRight,
  ShieldCheck,
  UserX,
  UserCheck,
  Zap,
  Lock,
  Compass,
  FileCheck,
  Filter,
  Check,
  HelpCircle,
  Hash
} from 'lucide-react';

interface AdminDashboardPageProps {
  subscription: UserSubscription;
  onUpdateSubscription?: (updates: Partial<UserSubscription>) => void;
  setView: (view: ViewType) => void;
}

// Sub-tabs for administrative sections
type AdminTab = 'overview' | 'users' | 'revenue' | 'ai-usage' | 'tickets' | 'features' | 'api-logs';

export default function AdminDashboardPage({ subscription, onUpdateSubscription, setView }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('admin_token'));
  
  // Promotion and credentials check state
  const [isPromoting, setIsPromoting] = useState(false);
  const [isInitializingAuth, setIsInitializingAuth] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState<string | null>(null);

  // Core metrics states
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [featuresList, setFeaturesList] = useState<any[]>([]);

  // Detailed filters / controllers
  const [userSearchText, setUserSearchText] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected object for drawer modal editing style
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [replyingTicket, setReplyingTicket] = useState<any | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplyStatus, setTicketReplyStatus] = useState('resolved');

  // Customer ticket generation simulation tool state
  const [simulationCategory, setSimulationCategory] = useState('technical');
  const [isCreatingSimulation, setIsCreatingSimulation] = useState(false);

  // Resolve authorization token on mount, auto-logging into PostgreSQL backend
  const resolveBackendToken = async (forcePromote: boolean = false) => {
    setIsInitializingAuth(true);
    setPromotionMessage(null);
    try {
      const email = subscription.email || 'suprasaab96@gmail.com';
      const password = 'ScribeStoneSandboxPass99!';
      const fullName = subscription.name || 'Suprasaab User';

      // 1. Attempt login
      let tokenValue = localStorage.getItem('admin_token');
      
      if (!tokenValue) {
        let authRes = await fetch('/api/v2/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!authRes.ok) {
          // Attempt registration first if login fails (not yet in postgres)
          const regRes = await fetch('/api/v2/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName })
          });

          if (regRes.ok) {
            // Relogin
            authRes = await fetch('/api/v2/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
          }
        }

        if (authRes.ok) {
          const authData = await authRes.json();
          tokenValue = authData.token;
          if (tokenValue) {
            localStorage.setItem('admin_token', tokenValue);
            setAuthToken(tokenValue);
          }
        }
      } else {
        setAuthToken(tokenValue);
      }

      // Check access with current token
      if (tokenValue) {
        const testRes = await fetch('/api/v2/admin/overview-stats', {
          headers: { 'Authorization': `Bearer ${tokenValue}` }
        });

        if (testRes.status === 403 || forcePromote) {
          // User exists but role is not admin yet, perform elevation trigger
          setIsPromoting(true);
          const promoteRes = await fetch('/api/v2/admin/promote-self', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${tokenValue}`,
              'Content-Type': 'application/json'
            }
          });

          if (promoteRes.ok) {
            setPromotionMessage("Sandbox Access Granted: Your account has been elevated to system administrator.");
            if (onUpdateSubscription) {
              onUpdateSubscription({ role: 'admin' });
            }
          } else {
            console.error('Failed self promotion query.');
          }
          setIsPromoting(false);
        }
      }
    } catch (err) {
      console.error('Failed resolving backend token authentication layers: ', err);
    } finally {
      setIsInitializingAuth(false);
    }
  };

  useEffect(() => {
    resolveBackendToken();
  }, [subscription.email]);

  // Unified dashboard loader
  const loadActiveTabData = async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      if (activeTab === 'overview') {
        const res = await fetch('/api/v2/admin/overview-stats', { headers });
        if (res.ok) {
          const data = await res.json();
          setOverviewStats(data.stats);
        }
      } else if (activeTab === 'users') {
        let url = `/api/v2/admin/users?search=${encodeURIComponent(userSearchText)}`;
        if (userTierFilter) url += `&tier=${userTierFilter}`;
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data.users || []);
        }
      } else if (activeTab === 'revenue') {
        const res = await fetch('/api/v2/admin/revenue', { headers });
        if (res.ok) {
          const data = await res.json();
          setRevenueStats({
            invoices: data.invoices || [],
            dailyRevenueChart: data.dailyRevenueChart || [],
            tierContribution: data.tierContribution || []
          });
        }
      } else if (activeTab === 'ai-usage') {
        const res = await fetch('/api/v2/admin/usage', { headers });
        if (res.ok) {
          const data = await res.json();
          setUsageStats({
            logs: data.logs || [],
            dailyAggr: data.dailyAggr || []
          });
        }
      } else if (activeTab === 'tickets') {
        const res = await fetch('/api/v2/admin/tickets', { headers });
        if (res.ok) {
          const data = await res.json();
          setTicketsList(data.tickets || []);
        }
      } else if (activeTab === 'features') {
        const res = await fetch('/api/v2/admin/features', { headers });
        if (res.ok) {
          const data = await res.json();
          setFeaturesList(data.features || []);
        }
      } else if (activeTab === 'api-logs') {
        const res = await fetch('/api/v2/admin/api-logs', { headers });
        if (res.ok) {
          const data = await res.json();
          setApiLogs(data.apiLogs || []);
        }
      }
    } catch (e) {
      console.error(`Error loading administrative parameters for tab ${activeTab}: `, e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveTabData();
  }, [activeTab, authToken, userTierFilter]);

  // Handle triggered search operations for Users section
  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadActiveTabData();
  };

  // Perform User profile parameter update overrides
  const handleSaveUserOverrides = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !editingUser) return;
    try {
      const res = await fetch(`/api/v2/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: editingUser.role,
          tier: editingUser.tier,
          wordsLimit: parseInt(editingUser.wordsLimit, 10),
          subscriptionStatus: editingUser.subscriptionStatus
        })
      });

      if (res.ok) {
        setEditingUser(null);
        loadActiveTabData();
      } else {
        alert('Could not update user parameters.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform Feature Toggle setting overrides
  const handleToggleFeature = async (flagKey: string, currentStatus: boolean) => {
    if (!authToken) return;
    try {
      // Optimiztic local state update to render toggle instantly
      setFeaturesList(prev => prev.map(f => f.flagKey === flagKey ? { ...f, isEnabled: !currentStatus } : f));

      const res = await fetch(`/api/v2/admin/features/${flagKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isEnabled: !currentStatus })
      });

      if (!res.ok) {
        // Revert on failure
        setFeaturesList(prev => prev.map(f => f.flagKey === flagKey ? { ...f, isEnabled: currentStatus } : f));
        alert('Could not synchronize feature toggle settings.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform active support ticket reply saving
  const handleSaveTicketResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !replyingTicket) return;
    try {
      const res = await fetch(`/api/v2/admin/tickets/${replyingTicket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: ticketReplyStatus,
          responseContent: ticketReplyText
        })
      });

      if (res.ok) {
        setReplyingTicket(null);
        setTicketReplyText('');
        loadActiveTabData();
      } else {
        alert('Could not write ticket follow up reply.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create a realistic support ticket simulator
  const handleTriggerSimulationTicket = async () => {
    if (!authToken) return;
    setIsCreatingSimulation(true);
    
    const simTickets: Record<string, { title: string; desc: string; email: string; name: string }> = {
      billing: {
        title: "Double charged on yearly plan renew",
        desc: "My credit card was processed twice during the Stripe billing checkout loop. Please analyze transaction records and emit corresponding credits.",
        email: "alex.holder@checkout.net",
        name: "Alex Holder"
      },
      technical: {
        title: "PDF active macro flags error during audit",
        desc: "ScribeStone GuardAV flagged a clean PDF from my marketing division as quarantined. The report indicates a JavaScript nesting failure, but it is standard raw text. Can you bypass scanning for my tenant id?",
        email: "sarah.architect@conflux.org",
        name: "Sarah Architect"
      },
      feature_request: {
        title: "Integration path with Slack workspaces",
        desc: "We would love to connect our copywriting channel directly to the voice refiner template. Do you have a Slack app endpoint or incoming webhook trigger on the roadmap?",
        email: "nate.slack@nomads.io",
        name: "Nate Corporate"
      },
      other: {
        title: "Bulk file transfers limit inquiry",
        desc: "Our Enterprise division requires uploading 150 documents concurrently via the pre-signed S3 url channel. ScribeStone rejected it at 10 items. Is there a custom CLI shuttle we should configure?",
        email: "cooper.executive@enterprise.com",
        name: "Cooper Enterprise"
      }
    };

    const targetSim = simTickets[simulationCategory] || simTickets.technical;

    try {
      const res = await fetch('/api/v2/admin/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: targetSim.title,
          description: targetSim.desc,
          category: simulationCategory,
          priority: 'high',
          userName: targetSim.name,
          userEmail: targetSim.email
        })
      });

      if (res.ok) {
        await loadActiveTabData();
      } else {
        alert('Failed generating test support query.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingSimulation(false);
    }
  };

  // Promote current logged in account to Admin
  const handlePromoteCurrentAccount = async () => {
    await resolveBackendToken(true);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F]">
      
      {/* Top Banner Control Panel for local staging */}
      <div className="bg-[#2B251F] text-stone-300 px-6 py-3.5 border-b border-[#C8A97E]/20 flex flex-wrap gap-4 items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#C8A97E] animate-pulse" />
          <span>SaaS Staging Sandbox Admin Panel</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isInitializingAuth ? (
            <span className="flex items-center gap-1.5 text-stone-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A97E]" />
              Authenticating PostgreSQL ledger...
            </span>
          ) : authToken ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              Postgres JWT Authorized Mode
            </span>
          ) : (
            <span className="text-amber-400">
              Postgres Disconnected
            </span>
          )}

          <button
            onClick={handlePromoteCurrentAccount}
            disabled={isPromoting || isInitializingAuth}
            className="bg-[#C8A97E]/20 hover:bg-[#C8A97E]/30 text-[#C8A97E] border border-[#C8A97E]/40 hover:border-[#C8A97E] font-bold px-3 py-1 rounded transition-colors text-[10px] cursor-pointer"
          >
            {isPromoting ? 'Elevating Account...' : 'Force Promote Me to Admin'}
          </button>
        </div>
      </div>

      {promotionMessage && (
        <div className="bg-[#3E5C4B]/10 border-b border-[#3E5C4B]/20 px-6 py-3 text-emerald-800 text-xs font-serif font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3E5C4B]" />
          {promotionMessage}
        </div>
      )}

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Block */}
        <div className="mb-10 text-left">
          <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-1">
            ScribeStone Headquarters
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#1F1F1F]">
            Micro-SaaS Command Center
          </h1>
          <p className="text-xs text-[#5C5A52] mt-1.5 font-light max-w-2xl leading-relaxed">
            Manage user accounts, audit multi-tenant revenues, review AI token metered logs, override support inquiries, toggle live feature releases, and examine real-time HTTP route latencies.
          </p>
        </div>

        {/* Tab System Sidebar + Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sub Navigation Sidebar Tab Selectors */}
          <div className="lg:col-span-3 space-y-1.5">
            <span className="block text-[10px] font-mono text-[#8E8C82] tracking-wider uppercase mb-2 pl-2">
              Management Modules
            </span>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#C8A97E]" />
                <span>Overview Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#3E5C4B]" />
                <span>User Directory</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('revenue')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'revenue'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#3E5C4B]" />
                <span>Revenue Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('ai-usage')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'ai-usage'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-[#C8A97E]" />
                <span>AI Usage Meters</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-[#3E5C4B]" />
                <span>Support Tickets</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ToggleRight className="w-4 h-4 text-[#C8A97E]" />
                <span>Feature Toggles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('api-logs')}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-medium cursor-pointer ${
                activeTab === 'api-logs'
                  ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                  : 'text-[#5C5A52] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-[#3E5C4B]" />
                <span>Live API Traffic Logs</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
            
            {/* Quick stats sync info */}
            <div className="pt-6 border-t border-[#EBEAE4] mt-6">
              <button 
                onClick={loadActiveTabData}
                className="w-full py-2.5 border border-[#E5E3DC] hover:border-[#1F1F1F] bg-white rounded-xl text-[#1F1F1F] text-[10px] font-mono tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-[#C8A97E]' : ''}`} />
                REFRESH DATA METRICS
              </button>
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="lg:col-span-9 bg-white border border-[#EBEAE4] rounded-2xl p-6 shadow-xs min-h-[500px]">
            
            {isLoading && (
              <div className="flex justify-end mb-2 text-[10px] font-mono text-[#8E8C82] items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-[#C8A97E]" />
                <span>Querying dynamic parameters...</span>
              </div>
            )}

            {/* A. OVERVIEW MODULE STATUS PANELS */}
            {activeTab === 'overview' && (
              <div className="space-y-8 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4">
                  <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">Operating Analytics</h2>
                  <p className="text-xs text-[#5C5A52] font-light mt-0.5">High-level aggregates of performance metrics generated live in PostgreSQL.</p>
                </div>

                {!overviewStats ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E] mx-auto mb-3" />
                    <span className="text-xs text-[#5C5A52] font-mono">Loading telemetry aggregates...</span>
                  </div>
                ) : (
                  <>
                    {/* Core Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-5 space-y-1">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block">Platform Users</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-2xl font-bold text-[#1F1F1F]">{overviewStats.totalUsers}</span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">+18%</span>
                        </div>
                        <p className="text-[10px] text-[#5C5A52] font-light">Free: {overviewStats.subMetrics.free} • Pro: {overviewStats.subMetrics.pro}</p>
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-5 space-y-1">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block">Monthly Recurring Rev</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-2xl font-bold text-[#3E5C4B]">${overviewStats.monthlyRecurringRevenue?.toFixed(2)}</span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-black">+24%</span>
                        </div>
                        <p className="text-[10px] text-[#5C5A52] font-light">Calculated over premium tiers</p>
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-5 space-y-1">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block">Lifetime Earnings</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-2xl font-bold text-[#1F1F1F]">${overviewStats.lifetimeEarnings?.toFixed(2)}</span>
                          <span className="text-[10px] font-mono text-[#8E8C82]">USD</span>
                        </div>
                        <p className="text-[10px] text-[#5C5A52] font-light">Paid invoices aggregate</p>
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-5 space-y-1">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block">Open Tickets</span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-2xl font-bold text-red-800">{overviewStats.activeTickets}</span>
                          <span className="text-[10px] font-mono text-[#8E8C82]">Active</span>
                        </div>
                        <p className="text-[10px] text-[#5C5A52] font-light">Requires coordinator action</p>
                      </div>

                    </div>

                    {/* S3 File Storage Block & AI tokens combined */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="border border-[#EBEAE4] rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#F1EFEA] pb-3">
                          <h4 className="font-serif text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#3E5C4B]" />
                            Subscribers Tier Mix
                          </h4>
                          <span className="text-[9px] font-mono text-stone-500 uppercase">Registered database accounts</span>
                        </div>

                        {/* Visually stunning HTML graphical progress metrics */}
                        <div className="space-y-3.5">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1 font-serif text-[#5C5A52]">
                              <span>Free Tier (5,000 words limit)</span>
                              <span className="font-bold">{overviewStats.subMetrics.free} user(s)</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#C8A97E] h-full"
                                style={{ width: `${(overviewStats.subMetrics.free / Math.max(1, overviewStats.totalUsers)) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1 font-serif text-[#5C5A52]">
                              <span>Pro Plan ($29/mo - 50,000 words)</span>
                              <span className="font-semibold text-emerald-800">{overviewStats.subMetrics.pro} user(s)</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#3E5C4B] h-full"
                                style={{ width: `${(overviewStats.subMetrics.pro / Math.max(1, overviewStats.totalUsers)) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1 font-serif text-[#5C5A52]">
                              <span>Enterprise ($499/yr - 1,000,000 words)</span>
                              <span className="font-semibold text-indigo-900">{overviewStats.subMetrics.enterprise} user(s)</span>
                            </div>
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-stone-800 h-full"
                                style={{ width: `${(overviewStats.subMetrics.enterprise / Math.max(1, overviewStats.totalUsers)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-[#EBEAE4] rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#F1EFEA] pb-3">
                          <h4 className="font-serif text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5">
                            <PlusCircle className="w-3.5 h-3.5 text-[#C8A97E]" />
                            Operating Activity Indicators
                          </h4>
                        </div>

                        <div className="divide-y divide-[#FAF9F6]">
                          <div className="py-2 flex justify-between items-center text-xs">
                            <span className="text-[#5C5A52] font-light">Total words rewritten by Gemini:</span>
                            <span className="font-mono font-bold text-[#1F1F1F] text-sm">{overviewStats.totalWordsProcessed?.toLocaleString()} words</span>
                          </div>

                          <div className="py-2 flex justify-between items-center text-xs">
                            <span className="text-[#5C5A52] font-light">S3 secure documents managed:</span>
                            <span className="font-mono font-bold text-[#1F1F1F] text-sm">{overviewStats.totalUploads} items</span>
                          </div>

                          <div className="py-2 flex justify-between items-center text-xs">
                            <span className="text-[#5C5A52] font-light font-serif text-[11px] italic text-[#C8A97E] block mt-1">
                              All metrics run dynamic SQL counts mapping database layers in real-time. Try creating simulation tickets or uploading items to see stats adjust dynamically.
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

            {/* B. USERS SECTION */}
            {activeTab === 'users' && (
              <div className="space-y-6 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4 flex flex-wrap justify-between items-end gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">User Directory Overrides</h2>
                    <p className="text-xs text-[#5C5A52] font-light mt-0.5">Edit subscription plans, adjust word allowances, configure roles, or restrict user authentication tags.</p>
                  </div>
                  
                  {/* Category filters */}
                  <div className="flex gap-2">
                    <select
                      value={userTierFilter}
                      onChange={(e) => setUserTierFilter(e.target.value)}
                      className="text-xs p-2 border border-[#E5E3DC] bg-white rounded-lg font-mono"
                    >
                      <option value="">ALL TIERS</option>
                      <option value="free">FREE</option>
                      <option value="pro">PRO</option>
                      <option value="enterprise">ENTERPRISE</option>
                    </select>
                  </div>
                </div>

                {/* Search query form */}
                <form onSubmit={handleUserSearch} className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search accounts by name or email query..."
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      className="w-full text-xs font-mono pl-10 pr-4 py-2.5 border border-[#EBEAE4] rounded-xl focus:border-[#3E5C4B] bg-[#FAF9F6] focus:bg-white transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-[#3E5C4B] hover:bg-[#3E5C4B]/90 text-white font-serif text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    Search Directory
                  </button>
                </form>

                {usersList.length === 0 ? (
                  <div className="py-20 text-center border rounded-2xl bg-[#FAF9F6] border-dashed border-[#E5E3DC]">
                    <UserX className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <span className="text-xs text-[#1F1F1F] font-serif block">No matching user records found</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#F1EFEA] font-mono text-[#8E8C82] text-[10px] uppercase">
                          <th className="p-4">Subscriber Info</th>
                          <th className="p-4">Admin Role</th>
                          <th className="p-4">Pricing Tier</th>
                          <th className="p-4">Words Budget (Used / Total)</th>
                          <th className="p-4 text-center">Checkout Status</th>
                          <th className="p-4 text-center">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1EFEA]">
                        {usersList.map((usr: any) => (
                          <tr key={usr.id} className="hover:bg-[#FAF9F6]/40 transition-colors">
                            <td className="p-4">
                              <span className="font-serif font-bold text-[#1F1F1F] block">{usr.fullName || 'No Name Provided'}</span>
                              <span className="text-[10px] font-mono text-[#8E8C82] block">{usr.email}</span>
                            </td>
                            <td className="p-4 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                usr.role === 'admin' 
                                  ? 'bg-[#C8A97E]/10 text-[#7C5A14] border border-[#C8A97E]/30' 
                                  : 'bg-stone-50 text-stone-500'
                              }`}>
                                {usr.role?.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                                usr.tier === 'pro' 
                                  ? 'bg-emerald-50 text-emerald-800' 
                                  : usr.tier === 'enterprise' 
                                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-100' 
                                    : 'bg-stone-50 text-stone-600'
                              }`}>
                                {usr.tier}
                              </span>
                            </td>
                            <td className="p-4 font-mono">
                              <div className="flex justify-between font-semibold font-mono text-[10px] mb-1 text-stone-500">
                                <span>{usr.wordsUsed?.toLocaleString()}</span>
                                <span>/ {usr.wordsLimit?.toLocaleString()}</span>
                              </div>
                              <div className="w-24 bg-stone-100 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#3E5C4B] h-full"
                                  style={{ width: `${Math.min(100, (usr.wordsUsed / Math.max(1, usr.wordsLimit)) * 100)}%` }}
                                />
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {usr.subscriptionStatus === 'canceled' ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-tight text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-bold">
                                  CANCELED
                                </span>
                              ) : usr.subscriptionStatus === 'incomplete' ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-tight text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold">
                                  UNPAID
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-tight text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setEditingUser(usr)}
                                className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg hover:text-[#1F1F1F] cursor-pointer transition-colors"
                                title="Adjust profile settings overrides"
                              >
                                <Zap className="w-4 h-4 text-[#C8A97E]" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* User overriding configurations drawer modal */}
                {editingUser && (
                  <div className="fixed inset-0 z-50 bg-[#2B251F]/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-[#EBEAE4] rounded-2xl w-full max-w-md p-6 relative shadow-lg text-left animate-soft-fade">
                      <div className="border-b border-[#F1EFEA] pb-4 mb-4">
                        <span className="text-[9px] font-mono text-[#C8A97E] uppercase block">CONFIGURATION MANAGER</span>
                        <h3 className="font-serif text-[#1F1F1F] font-bold text-base mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                          {editingUser.fullName}
                        </h3>
                        <span className="block text-[11px] font-mono text-[#8E8C82]">{editingUser.email}</span>
                      </div>

                      <form onSubmit={handleSaveUserOverrides} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Authorization Privilege Group</label>
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl"
                          >
                            <option value="user">USER (Standard Quota checks)</option>
                            <option value="admin">ADMIN (Elevated override privileges)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Active Subscription Plan Tier</label>
                          <select
                            value={editingUser.tier}
                            onChange={(e) => setEditingUser({ ...editingUser, tier: e.target.value })}
                            className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl"
                          >
                            <option value="free">FREE</option>
                            <option value="pro">PRO</option>
                            <option value="enterprise">ENTERPRISE</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Words Volume Allocated Limit</label>
                          <input
                            type="number"
                            value={editingUser.wordsLimit}
                            onChange={(e) => setEditingUser({ ...editingUser, wordsLimit: e.target.value })}
                            className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Stripe Billing Account Tag</label>
                          <select
                            value={editingUser.subscriptionStatus}
                            onChange={(e) => setEditingUser({ ...editingUser, subscriptionStatus: e.target.value })}
                            className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl"
                          >
                            <option value="active">Active Plan</option>
                            <option value="incomplete">Suspended / Unpaid</option>
                            <option value="canceled">Canceled Account</option>
                          </select>
                        </div>

                        <div className="flex gap-2.5 pt-4 border-t border-[#F1EFEA]">
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="w-1/2 border border-[#E5E3DC] text-stone-500 font-serif text-xs font-semibold py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer"
                          >
                            Dismiss Settings
                          </button>
                          
                          <button
                            type="submit"
                            className="w-1/2 bg-[#3E5C4B] hover:bg-[#3E5C4B]/90 text-white font-serif text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            Save Overrides
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* C. REVENUE ANALYTICS */}
            {activeTab === 'revenue' && (
              <div className="space-y-6 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4">
                  <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">Revenue Analytics & Billing Records</h2>
                  <p className="text-xs text-[#5C5A52] font-light mt-0.5">Aggregate invoice records, MRR tracking, and historical billing transactions from Stripe events.</p>
                </div>

                {!revenueStats ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E] mx-auto mb-3" />
                    <span className="text-xs text-[#5C5A52] font-mono">Analyzing Stripe transactions ledger...</span>
                  </div>
                ) : (
                  <>
                    {/* Visual custom SVG graph line */}
                    <div className="border border-[#EBEAE4] bg-[#FAF9F6] p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-[#8E8C82] font-semibold uppercase">Daily Realized Incomes ($ USD)</span>
                        <span className="text-[10px] font-mono text-[#3E5C4B] uppercase font-bold">PostgreSQL database ledger query</span>
                      </div>
                      
                      {revenueStats.dailyRevenueChart.length === 0 ? (
                        <p className="text-stone-400 font-serif text-xs py-10 text-center italic">No checkout invoices have been compiled yet.</p>
                      ) : (
                        <div className="w-full h-32 flex items-end gap-1 px-2 border-b border-[#E5E3DC]">
                          {revenueStats.dailyRevenueChart.map((d: any, index: number) => {
                            const val = parseFloat(d.total);
                            const percent = Math.min(100, Math.max(8, (val / 600) * 100));
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end">
                                {/* popover tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2B251F] text-[#FAF9F6] text-[9px] font-mono py-1 px-2 rounded whitespace-nowrap z-10 shadow-xs">
                                  Date: {d.date} • Sum: ${val.toFixed(2)}
                                </div>
                                <div 
                                  className="bg-[#3E5C4B] hover:bg-[#C8A97E] w-full rounded-t transition-all"
                                  style={{ height: `${percent}%` }}
                                />
                                <span className="text-[7px] font-mono text-[#8E8C82] rotate-45 transform mt-2 origin-left whitespace-nowrap hidden md:block">
                                  {d.date?.substring(5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-[10px] text-[#5C5A52] font-serif leading-relaxed italic pl-1 text-center pt-2">
                        Hover over custom histogram nodes to show detailed aggregate totals compiled on specific system dates.
                      </p>
                    </div>

                    {/* Historical Invoice lists */}
                    <div className="space-y-3.5">
                      <h3 className="font-serif text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5 pl-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#3E5C4B]" />
                        Stripe Ledger Log (Invoices)
                      </h3>

                      <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl bg-white shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#FAF9F6] border-b border-[#F1EFEA] font-mono text-[#8E8C82] text-[10px] uppercase">
                              <th className="p-4">Customer Email</th>
                              <th className="p-4">USD Value</th>
                              <th className="p-4">Tier Interval</th>
                              <th className="p-4">Payment status</th>
                              <th className="p-4">Transaction hash</th>
                              <th className="p-4 text-right">Settled Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1EFEA]">
                            {revenueStats.invoices.map((inv: any) => (
                              <tr key={inv.id} className="hover:bg-[#FAF9F6]/30 transition-colors">
                                <td className="p-4 font-mono font-semibold">{inv.userEmail}</td>
                                <td className="p-4 text-[#3E5C4B] font-bold font-mono">${parseFloat(inv.amountUsd).toFixed(2)}</td>
                                <td className="p-4">
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 block w-max">
                                    {inv.tier} • {inv.interval}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                    inv.status === 'paid' 
                                      ? 'bg-emerald-50 text-emerald-800' 
                                      : 'bg-rose-50 text-rose-800'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-stone-500 text-[11px] truncate max-w-[120px]" title={inv.transactionId}>
                                  {inv.transactionId}
                                </td>
                                <td className="p-4 text-right font-mono text-stone-500 text-[11px]">
                                  {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* D. AI SPECIALIZED USAGE METRICS */}
            {activeTab === 'ai-usage' && (
              <div className="space-y-6 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4">
                  <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">AI Model Usage & Credit Audits</h2>
                  <p className="text-xs text-[#5C5A52] font-light mt-0.5">Audit words budget allocations, Gemini 3.5 API request execution latencies, and cache-hit optimization quotients.</p>
                </div>

                {!usageStats ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8A97E] mx-auto mb-3" />
                    <span className="text-xs text-[#5C5A52] font-mono">Synchronizing telemetry databases...</span>
                  </div>
                ) : (
                  <>
                    {/* Charts block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="border border-[#EBEAE4] bg-[#FAF9F6] p-4.5 rounded-xl space-y-4">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block font-semibold">Gemini API Latency Trend (ms)</span>
                        {usageStats.dailyAggr.length === 0 ? (
                          <p className="text-xs text-stone-400 py-6 text-center italic">No dynamic log telemetry resides in PostgreSQL.</p>
                        ) : (
                          <div className="h-28 flex items-end gap-1.5 px-2 border-b border-[#E5E3DC]">
                            {usageStats.dailyAggr.map((u: any, index: number) => {
                              const lat = parseFloat(u.avgDurationMs);
                              const percent = Math.min(100, Math.max(10, (lat / 3000) * 100));
                              return (
                                <div key={index} className="flex-1 flex flex-col justify-end h-full relative group cursor-pointer text-center">
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2B251F] text-stone-300 text-[9px] font-mono px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                    Avg Latency: {lat.toFixed(0)}ms
                                  </div>
                                  <div className="bg-[#C8A97E] w-full rounded-t hover:bg-[#3E5C4B] transition-all" style={{ height: `${percent}%` }} />
                                  <span className="text-[7px] font-mono text-stone-500 mt-1 block">
                                    {u.date?.substring(5)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[9px] text-[#5C5A52] text-center font-serif leading-relaxed italic">
                          Measures average database process durations across all text analyzes.
                        </p>
                      </div>

                      <div className="border border-[#EBEAE4] bg-[#FAF9F6] p-4.5 rounded-xl space-y-4">
                        <span className="text-[9px] font-mono text-[#8E8C82] uppercase block font-semibold">Words Processed Daily (quota impact)</span>
                        {usageStats.dailyAggr.length === 0 ? (
                          <p className="text-xs text-stone-400 py-6 text-center italic font-light">No words usage traces archived.</p>
                        ) : (
                          <div className="h-28 flex items-end gap-1.5 px-2 border-b border-[#E5E3DC]">
                            {usageStats.dailyAggr.map((u: any, index: number) => {
                              const count = parseInt(u.wordsCount, 10);
                              const percent = Math.min(100, Math.max(10, (count / 5000) * 100));
                              return (
                                <div key={index} className="flex-1 flex flex-col justify-end h-full relative group cursor-pointer text-center">
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2B251F] text-stone-300 text-[9px] font-mono px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                    Tokens: {count?.toLocaleString()} words
                                  </div>
                                  <div className="bg-[#3E5C4B] w-full rounded-t hover:bg-[#C8A97E] transition-all" style={{ height: `${percent}%` }} />
                                  <span className="text-[7px] font-mono text-stone-500 mt-1 block">
                                    {u.date?.substring(5)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[9px] text-[#5C5A52] text-center font-serif leading-relaxed italic">
                          Aggregates vocabulary volume analyzed across all tenant endpoints.
                        </p>
                      </div>

                    </div>

                    {/* Ledger log */}
                    <div className="space-y-3.5">
                      <h3 className="font-serif text-xs font-semibold text-[#1F1F1F]">API Action Credits Ledger</h3>

                      <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl bg-white shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#FAF9F6] border-b border-[#F1EFEA] font-mono text-[#8E8C82] text-[10px] uppercase">
                              <th className="p-4">Operator Email</th>
                              <th className="p-4">Action Type</th>
                              <th className="p-4">System Model</th>
                              <th className="p-4">Metered units</th>
                              <th className="p-4">Latency (ms)</th>
                              <th className="p-4 text-center">Cache hit</th>
                              <th className="p-4 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1EFEA]">
                            {usageStats.logs.map((log: any) => (
                              <tr key={log.id} className="hover:bg-[#FAF9F6]/30 transition-colors">
                                <td className="p-4 font-mono font-semibold text-[#1F1F1F]">{log.userEmail || 'anonymous'}</td>
                                <td className="p-4">
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-100 text-[#5C5A52]">
                                    {log.requestType}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-stone-600 text-[11px]">{log.modelUsed || 's3-secure-shuttle'}</td>
                                <td className="p-4 font-mono font-bold text-[#1F1F1F]">{log.unitsMetered?.toLocaleString()} words</td>
                                <td className="p-4 font-mono text-[#1F1F1F]">{log.responseDurationMs || '180'}ms</td>
                                <td className="p-4 text-center">
                                  <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${log.isCachedHit ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-50 text-stone-400'}`}>
                                    {log.isCachedHit ? 'TRUE' : 'FALSE'}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-mono text-[#8E8C82] text-[11px]">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* E. SUPPORT TICKETS OVERRIDES */}
            {activeTab === 'tickets' && (
              <div className="space-y-6 text-left animate-soft-fade">
                
                {/* Header segment with Ticket Simulator controls */}
                <div className="border-b border-[#F1EFEA] pb-5 flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">Support Tickets Dispatch</h2>
                    <p className="text-xs text-[#5C5A52] font-light mt-0.5">Solve customer inquiries, write markdown replies, and adjust prioritization urgency triggers.</p>
                  </div>

                  {/* Simulator Control Block */}
                  <div className="bg-[#FAF9F6] border border-[#E5E3DC] p-3 rounded-xl flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-[#C8A97E] uppercase block font-bold">FLOW TESTER STAGE</span>
                      <select
                        value={simulationCategory}
                        onChange={(e) => setSimulationCategory(e.target.value)}
                        className="text-[10px] font-mono border-none p-0 bg-transparent focus:outline-none focus:ring-0 text-[#1F1F1F] font-semibold cursor-pointer"
                      >
                        <option value="technical">TECHNICAL INQUIRY</option>
                        <option value="billing">STRIPE DOUBLE CARD</option>
                        <option value="feature_request">SLACK WORKSPACE INTEGRATION</option>
                        <option value="other">CLI SHUTTLE SUPPORT</option>
                      </select>
                    </div>

                    <button
                      onClick={handleTriggerSimulationTicket}
                      disabled={isCreatingSimulation}
                      className="bg-[#3E5C4B] hover:bg-[#3E5C4B]/90 text-white border border-[#3E5C4B]/20 font-bold px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isCreatingSimulation ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <PlusCircle className="w-3 h-3" />
                      )}
                      GENERATE TEST TICKET
                    </button>
                  </div>
                </div>

                {ticketsList.length === 0 ? (
                  <div className="py-20 text-center border border-dashed rounded-2xl bg-[#FAF9F6] border-[#E5E3DC]">
                    <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <span className="text-xs text-[#5C5A52] font-serif block">Support queue is currently empty</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketsList.map((ticket: any) => (
                      <div 
                        key={ticket.id}
                        className={`border rounded-xl p-5 space-y-4 text-left transition-all relative overflow-hidden bg-white hover:shadow-xs border-[#EBEAE4] border-l-3 ${
                          ticket.status === 'open' 
                            ? 'border-l-red-600' 
                            : ticket.status === 'in_progress' 
                              ? 'border-l-[#C8A97E]' 
                              : 'border-l-stone-300 opacity-80'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-mono uppercase bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                #{ticket.category}
                              </span>
                              
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                ticket.priority === 'urgent' 
                                  ? 'bg-rose-100 text-rose-800 font-extrabold animate-pulse' 
                                  : ticket.priority === 'high' 
                                    ? 'bg-red-50 text-red-800' 
                                    : 'bg-stone-50 text-stone-600'
                              }`}>
                                {ticket.priority?.toUpperCase()} PRIORITY
                              </span>
                            </div>

                            <h4 className="font-serif font-bold text-xs text-[#1F1F1F] leading-tight line-clamp-1" title={ticket.title}>
                              {ticket.title}
                            </h4>
                          </div>

                          <span className={`text-[9px] font-mono font-black border px-1.5 py-0.5 rounded ${
                            ticket.status === 'open' 
                              ? 'bg-red-50 text-red-800 border-red-100' 
                              : ticket.status === 'in_progress'
                                ? 'bg-[#C8A97E]/10 text-amber-900 border-[#C8A97E]/30'
                                : 'bg-stone-50 text-stone-500 border-stone-200'
                          }`}>
                            {ticket.status?.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-[#5C5A52] font-light leading-relaxed line-clamp-3">
                          {ticket.description}
                        </p>

                        <div className="border-t border-[#FAF9F6] pt-3 flex justify-between items-baseline text-[10px] font-mono text-[#8E8C82]">
                          <span>From: {ticket.userName} ({ticket.userEmail})</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>

                        {ticket.responseContent && (
                          <div className="p-3 bg-[#FAF9F6] border border-[#F1EFEA] rounded-lg text-[11px] space-y-1 mt-2">
                            <span className="font-mono text-[9px] text-[#C8A97E] uppercase block font-bold">Admin Resolution Reply:</span>
                            <p className="text-[#3E5C4B] font-serif leading-relaxed italic">"{ticket.responseContent}"</p>
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setReplyingTicket(ticket);
                              setTicketReplyText(ticket.responseContent || '');
                              setTicketReplyStatus(ticket.status || 'resolved');
                            }}
                            className="bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#1F1F1F] font-serif text-[11px] font-medium text-[#1F1F1F] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#3E5C4B]" />
                            {ticket.responseContent ? 'Amend follow-up / Override Status' : 'Construct Resolution Answer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ticket Reply drawer modal */}
                {replyingTicket && (
                  <div className="fixed inset-0 z-50 bg-[#2B251F]/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-[#EBEAE4] rounded-2xl w-full max-w-lg p-6 relative shadow-lg text-left animate-soft-fade max-h-[85vh] overflow-y-auto">
                      <div className="border-b border-[#F1EFEA] pb-4 mb-4">
                        <span className="text-[9px] font-mono text-[#C8A97E] uppercase block">RESOLUTION INTERRUPTER</span>
                        <h3 className="font-serif text-sm font-bold text-[#1F1F1F] mt-0.5 leading-tight">{replyingTicket.title}</h3>
                        <p className="text-stone-400 font-mono text-[10px] mt-1">Submitted by: {replyingTicket.userName} ({replyingTicket.userEmail})</p>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#F1EFEA] text-xs font-serif leading-relaxed text-[#5C5A52]">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8C82] block mb-1">Customer Problem Briefing:</span>
                          "{replyingTicket.description}"
                        </div>

                        <form onSubmit={handleSaveTicketResponse} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Assign Ticket Status</label>
                            <select
                              value={ticketReplyStatus}
                              onChange={(e) => setTicketReplyStatus(e.target.value)}
                              className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl"
                            >
                              <option value="open">OPEN (Awaiting Action)</option>
                              <option value="in_progress">IN PROGRESS (Under evaluation)</option>
                              <option value="resolved">RESOLVED (Answer dispatched)</option>
                              <option value="closed">CLOSED (Archived issue)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Response Content / Actions logs</label>
                            <textarea
                              rows={4}
                              placeholder="Describe structural resolution steps, refund confirmations, or white-labeled exceptions..."
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              className="w-full text-xs font-mono p-2.5 border border-[#EBEAE4] bg-[#FAF9F6] rounded-xl resize-none focus:bg-white focus:ring-1 focus:ring-[#3E5C4B] transition-all"
                            />
                          </div>

                          <div className="flex gap-2.5 pt-4 border-t border-[#F1EFEA]">
                            <button
                              type="button"
                              onClick={() => setReplyingTicket(null)}
                              className="w-1/2 border border-[#E5E3DC] text-stone-500 font-serif text-xs font-semibold py-2.5 rounded-xl hover:bg-stone-50 cursor-pointer"
                            >
                              Dismiss Ticket
                            </button>
                            
                            <button
                              type="submit"
                              className="w-1/2 bg-[#3E5C4B] hover:bg-[#3E5C4B]/90 text-white font-serif text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              Confirm Answer
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* F. FEATURE TOGGLES MODULE */}
            {activeTab === 'features' && (
              <div className="space-y-6 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4 animate-soft-fade">
                  <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">Feature Toggles Configuration</h2>
                  <p className="text-xs text-[#5C5A52] font-light mt-0.5">Control live micro-services and deployment assets immediately for the entire tenant base with integrated Postgres synchronizations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuresList.map((flag: any) => (
                    <div 
                      key={flag.flagKey}
                      className="border border-[#EBEAE4] rounded-2xl p-5 hover:bg-[#FAF9F6]/20 transition-all text-left flex items-start justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-wide bg-[#C8A97E]/10 border border-[#C8A97E]/30 text-[#7C5A14] px-1.5 py-0.5 rounded font-black">
                            KEY: {flag.flagKey}
                          </span>
                        </div>
                        
                        <h4 className="font-serif text-xs font-bold text-[#1F1F1F]">
                          {flag.name}
                        </h4>
                        
                        <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed">
                          {flag.description}
                        </p>
                      </div>

                      {/* Clickable switch toggle */}
                      <button
                        onClick={() => handleToggleFeature(flag.flagKey, flag.isEnabled)}
                        className={`shrink-0 flex items-center p-0.5 w-11 h-6 rounded-full transition-colors cursor-pointer outline-none border-none ${
                          flag.isEnabled ? 'bg-[#3E5C4B]' : 'bg-stone-300'
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-xs transform transition-transform ${
                          flag.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-[#FAF9F6] bg-[#FAF9F6]/50 flex gap-3 text-left">
                  <HelpCircle className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-[#5C5A52] font-light">
                    <strong>Developer notice:</strong> Setting toggle flags to false restricts associated pipelines instantly across API threads. These flags are saved durably inside your PostgreSQL `feature_toggles` database.
                  </div>
                </div>
              </div>
            )}

            {/* G. LIVE API LOGGER METRICS */}
            {activeTab === 'api-logs' && (
              <div className="space-y-6 text-left animate-soft-fade">
                <div className="border-b border-[#F1EFEA] pb-4 flex justify-between items-end gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1F1F1F]">Live API Observability Traffic</h2>
                    <p className="text-xs text-[#5C5A52] font-light mt-0.5">Real-time HTTP requests logger capturing routes, statuses, requesters, IP addresses, and request execution latencies.</p>
                  </div>
                  <button 
                    onClick={loadActiveTabData}
                    className="p-1 px-2.5 border border-[#E5E3DC] hover:border-[#1F1F1F] bg-white rounded-lg text-stone-500 hover:text-[#1F1F1F] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    POLL TRAFFIC
                  </button>
                </div>

                {apiLogs.length === 0 ? (
                  <div className="py-20 text-center border border-dashed rounded-2xl bg-[#FAF9F6] border-[#E5E3DC]">
                    <Server className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <span className="text-xs text-stone-500 font-serif block">No API traffic recorded in telemetry yet. Perform file uploads or analyze queries to log events dynamically.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#F1EFEA] font-mono text-[#8E8C82] text-[10px] uppercase">
                          <th className="p-4">Method</th>
                          <th className="p-4">Route Path</th>
                          <th className="p-4">HTTP Status</th>
                          <th className="p-4">Requester Email</th>
                          <th className="p-4">IP Address</th>
                          <th className="p-4 text-right">Process Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1EFEA]">
                        {apiLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-[#FAF9F6]/30 transition-colors font-mono text-[11px]">
                            <td className="p-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.httpMethod === 'POST' 
                                  ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                                  : log.httpMethod === 'GET' 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                    : 'bg-stone-50 text-stone-600'
                              }`}>
                                {log.httpMethod}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-[#1F1F1F] max-w-[200px] truncate" title={log.requestPath}>
                              {log.requestPath}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                log.statusCode >= 500 
                                  ? 'bg-red-100 text-red-800 animate-pulse' 
                                  : log.statusCode >= 400 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {log.statusCode}
                              </span>
                            </td>
                            <td className="p-4 text-stone-600 truncate max-w-[120px]" title={log.userEmail}>
                              {log.userEmail}
                            </td>
                            <td className="p-4 text-stone-500 font-mono text-[10px]">
                              {log.clientIp || '127.0.0.1'}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-stone-700">
                              {log.latencyMs}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
