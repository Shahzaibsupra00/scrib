import { useState } from 'react';
import { UserSubscription, ViewType } from '../types';
import { CreditCard, User, HelpCircle, ShieldAlert, KeyRound, Check, RefreshCw } from 'lucide-react';

interface SettingsPageProps {
  subscription: UserSubscription;
  onSubscribe: (tier: 'free' | 'pro' | 'enterprise', interval: 'month' | 'year') => void;
  setView: (view: ViewType) => void;
  onResetQuota: () => void;
}

export default function SettingsPage({ 
  subscription, 
  onSubscribe, 
  setView, 
  onResetQuota 
}: SettingsPageProps) {

  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'secrets'>('profile');
  const [profileName, setProfileName] = useState(subscription.name);
  const [copiedKeyText, setCopiedKeyText] = useState(false);

  const handleSaveProfile = () => {
    subscription.name = profileName;
    alert("Profile configurations updated in in-memory Clerk directory.");
  };

  const handleCopyDummyKey = () => {
    navigator.clipboard.writeText("sk_live_51NyStS...P2A9");
    setCopiedKeyText(true);
    setTimeout(() => setCopiedKeyText(false), 2000);
  };

  return (
    <div className="animate-soft-fade px-6 py-10 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div className="mb-10 border-b border-[#EBEAE4] pb-5">
        <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase">ACCOUNT CONTROL CENTER</span>
        <h1 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Setting Preferences</h1>
        <p className="text-xs text-[#5C5A52] mt-1 font-light">Configure Clerk Auth definitions, manage Stripe billings, or review workspace capacities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Rail Selector (md:col-span-3) */}
        <div className="md:col-span-3 space-y-1 bg-white p-2 rounded-xl border border-[#EBEAE4] shadow-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'bg-[#3E5C4B]/5 text-[#3E5C4B]' 
                : 'text-[#5C5A52] hover:text-[#1F1F1F] hover:bg-[#FAF9F6]'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            Clerk User Profile
          </button>
          
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'billing' 
                ? 'bg-[#3E5C4B]/5 text-[#3E5C4B]' 
                : 'text-[#5C5A52] hover:text-[#1F1F1F] hover:bg-[#FAF9F6]'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            Stripe Subscription
          </button>

          <button
            onClick={() => setActiveTab('secrets')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'secrets' 
                ? 'bg-[#3E5C4B]/5 text-[#3E5C4B]' 
                : 'text-[#5C5A52] hover:text-[#1F1F1F] hover:bg-[#FAF9F6]'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            API & Secret Keys
          </button>
        </div>

        {/* Right Pane Body (md:col-span-9) */}
        <div className="md:col-span-9 bg-white border border-[#EBEAE4] p-6 rounded-xl shadow-xs">
          
          {/* Tab 1: Profile information */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-soft-fade">
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1F1F1F] mb-1">Clerk Profile Management</h3>
                <p className="text-[11px] text-[#8E8C82]">Review and update credential accounts provided via Clerk system integration.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#8E8C82] uppercase mb-1.5">User full name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg px-3.5 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-mono text-[#8E8C82] uppercase mb-1.5">Clerk Email Directory</label>
                  <input 
                    type="text" 
                    disabled
                    value={subscription.email}
                    className="w-full text-xs bg-stone-100 border border-stone-200 text-stone-400 rounded-lg px-3.5 py-2.5 outline-none pointer-events-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs"
                >
                  Save Profile Settings
                </button>
              </div>

              <hr className="border-[#F1EFEA] my-6" />

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#C8A97E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#7C5A14]">Auth Integration Protocol</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    Authentication triggers are fully registered using Clerk Auth schemas. Your user metadata is dynamically synced server-side for access token control.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stripe Billing management */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-soft-fade">
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1F1F1F] mb-1">Stripe Billing Portal</h3>
                <p className="text-[11px] text-[#8E8C82]">Upgrade, cancel or monitor active credit balances synced with Stripe APIs.</p>
              </div>

              {/* Tier visualizer */}
              <div className="bg-[#FAF9F6] border border-[#EBEAE4] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-[#8E8C82] block mb-0.5 uppercase tracking-wider">CURRENT SUBSCRIPTION</span>
                  <span className="text-base font-serif font-bold text-[#1F1F1F] capitalize">{subscription.tier} plan</span>
                  <p className="text-[11px] text-[#5C5A52] mt-1 font-light leading-relaxed">
                    Quota allowance: <span className="font-semibold text-stone-700">{subscription.wordsUsed.toLocaleString()}</span> of <span className="font-mono text-[10px] font-semibold">{subscription.wordsLimit.toLocaleString()} words</span> processed.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onResetQuota}
                    className="bg-white hover:bg-[#FAF9F6] text-[#5C5A52] border border-[#E5E3DC] text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                    title="Mock usage refresh"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Quota
                  </button>
                  
                  {subscription.tier === 'free' ? (
                    <button
                      onClick={() => setView('landing')}
                      className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#F8F7F4] text-[11px] font-semibold px-4.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition-all"
                    >
                      View Pro tiers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSubscribe('free', 'month');
                        alert("Subscription tier downgraded back to Starter free tier.");
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer transition-all"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>

              <hr className="border-[#F1EFEA] my-6" />

              <div>
                <h4 className="text-xs font-semibold text-[#1F1F1F] mb-3">Upgrade Package Demos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-[#F1EFEA] hover:border-[#3E5C4B] p-4 rounded-xl text-left cursor-pointer transition-all bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#3E5C4B] uppercase block">PRO LEVEL</span>
                      <span className="font-serif font-bold text-sm text-[#1F1F1F] block mt-1">ScribeStone Pro</span>
                      <p className="text-[10px] text-[#8E8C82] font-light leading-relaxed mt-1">50k processed words, local documents indexer, all tone paradigms unlocked.</p>
                    </div>
                    <button 
                      onClick={() => onSubscribe('pro', 'month')}
                      className="mt-4 bg-[#3E5C4B]/5 hover:bg-[#3E5C4B]/10 border border-[#3E5C4B]/15 text-[#3E5C4B] w-full py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer text-center"
                    >
                      {subscription.tier === 'pro' ? 'Currently Active' : 'Succeed Pro via Stripe'}
                    </button>
                  </div>

                  <div className="border border-[#F1EFEA] hover:border-[#3E5C4B] p-4 rounded-xl text-left cursor-pointer transition-all bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#C8A97E] uppercase block">ENTERPRISE CAP</span>
                      <span className="font-serif font-bold text-sm text-[#1F1F1F] block mt-1">ScribeStone Enterprise</span>
                      <p className="text-[10px] text-[#8E8C82] font-light leading-relaxed mt-1">1M words load, 2-hour Priority SLA help rails, customized company tones.</p>
                    </div>
                    <button 
                      onClick={() => onSubscribe('enterprise', 'year')}
                      className="mt-4 bg-[#3E5C4B]/5 hover:bg-[#3E5C4B]/10 border border-[#3E5C4B]/15 text-[#3E5C4B] w-full py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer text-center"
                    >
                      {subscription.tier === 'enterprise' ? 'Currently Active' : 'Succeed Corporate Plan'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Secrets credentials */}
          {activeTab === 'secrets' && (
            <div className="space-y-6 animate-soft-fade">
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1F1F1F] mb-1">API Integror Credentials</h3>
                <p className="text-[11px] text-[#8E8C82]">Manage webhooks, access developer tokens, or query secure Stripe keys.</p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8E8C82] uppercase mb-1.5">ScribeStone Sandbox SDK Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value="sk_live_51NyStS...P2A9"
                    className="flex-1 text-xs font-mono bg-stone-100 border border-stone-200 text-stone-500 rounded-lg px-3.5 py-2.5 outline-none"
                  />
                  <button
                    onClick={handleCopyDummyKey}
                    className="bg-white hover:bg-[#FAF9F6] text-[#5C5A52] border border-[#E5E3DC] px-4 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {copiedKeyText ? 'Copied' : 'Copy Key'}
                  </button>
                </div>
                <span className="text-[10px] font-light text-[#8E8C82] mt-1 block">
                  Keep secret keys safe. Do not publish on Github bundles or share publicly.
                </span>
              </div>

              <hr className="border-[#F1EFEA] my-6" />

              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed font-light text-stone-600">
                <HelpCircle className="w-5 h-5 text-[#8E8C82] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#1F1F1F] mb-1">Stripe Webhook Listeners</h4>
                  <p>
                    Webhook events are handled server-side at <code>/api/stripe-webhooks</code>. Stripe automatically triggers credential validation updates following user tier payments.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
