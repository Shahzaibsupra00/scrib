import { useState } from 'react';
import { ViewType, UserSubscription } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ShieldCheck, 
  Zap, 
  Star, 
  Info,
  Server,
  Lock,
  Globe,
  CreditCard,
  Building
} from 'lucide-react';

interface PricingPageProps {
  setView: (view: ViewType) => void;
  subscription: UserSubscription;
  onSubscribe: (tier: 'pro' | 'enterprise', interval: 'month' | 'year') => void;
}

export default function PricingPage({ setView, subscription, onSubscribe }: PricingPageProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      id: 'free' as const,
      name: 'Starter',
      description: 'Sophisticated refinement tools for prose editors & independent professionals.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      wordTokens: 5000,
      badge: null,
      ctaLabel: 'Active Free Sandbox',
      features: [
        '5,000 words draft allowance count',
        'Standard single-pass grammar check',
        'Clean comparison splits view',
        '3 signature writing tone presets',
        'Offline-ready indexed database',
        'Basic local ledger archiving'
      ],
      notIncluded: [
        'Double-pass premium GPT/Gemini models',
        'Custom tone configuration slots',
        'Stripe billing priority pipeline',
        'Priority high-throughput servers'
      ],
      stripeTag: null
    },
    {
      id: 'pro' as const,
      name: 'Pro Scribe',
      description: 'Enhanced intelligence and style refinement for professional writers and agencies.',
      monthlyPrice: 19,
      yearlyPrice: 15,
      wordTokens: 50000,
      badge: 'MOST POPULAR',
      ctaLabel: 'Upgrade to Pro Scribe',
      features: [
        '50,000 words limit allocation',
        'Double-pass advanced LLM engine',
        'All 4 signature preset styles',
        'Custom terminology glossary options',
        'Priority workspace document recovery',
        'Stripe customer management access',
        'Dynamic visual metrics charts'
      ],
      notIncluded: [
        'Enterprise shared words allocation pool',
        'Dedicated server clustering throughput',
        'Custom API gateway integration'
      ],
      stripeTag: 'pro' as const,
    },
    {
      id: 'enterprise' as const,
      name: 'Team Studio',
      description: 'Collaborative control hubs for branding offices and scale publication structures.',
      monthlyPrice: 49,
      yearlyPrice: 39,
      wordTokens: 500000,
      badge: 'BEST VALUE',
      ctaLabel: 'Provision Team Studio',
      features: [
        '500,000 shared vocabulary allocation',
        'Dedicated sandbox custom prompt guidelines',
        'Multi-user shared document databases',
        'Advanced orthography pattern rules',
        'Slack & Workspace integration ports',
        'Guaranteed uptime & latency SLAs (<20ms)',
        'Full security encryption sandbox pass'
      ],
      notIncluded: [],
      stripeTag: 'enterprise' as const
    }
  ];

  // Specific categoric feature comparison table
  const comparativeFeatures = [
    {
      category: 'Prose & Grammar Core',
      items: [
        { name: 'Word limit counts', free: '5,000 / mo', pro: '50,000 / mo', enterprise: '500,000 / mo' },
        { name: 'Double-pass LLM pipeline', free: '✖', pro: '✓ standard', enterprise: '✓ ultra-low latency' },
        { name: 'Vocabulary styling levels', free: '3 presets', pro: 'All 4 presets', enterprise: 'Custom prompt presets' },
        { name: 'Orthography analysis rules', free: 'Basic punctuation', pro: 'High clarity checks', enterprise: 'Meticulous style systems' }
      ]
    },
    {
      category: 'Data & Environment Features',
      items: [
        { name: 'Storage architecture', free: 'Client cache / Local', pro: 'PostgreSQL client index', enterprise: 'Firestore sync + DB' },
        { name: 'Visual metrics charts', free: 'Static logs outline', pro: 'Dynamic SVG SVG weight log', enterprise: 'Team visual control desk' },
        { name: 'Historical record exports', free: '✖', pro: '✓ standard', enterprise: '✓ Bulk CSV/JSON pipelines' }
      ]
    },
    {
      category: 'Security & Integrations',
      items: [
        { name: 'Identity authentication', free: 'Clerk Sandbox', pro: 'Clerk Multi-Device', enterprise: 'Clerk SSO Enterprise' },
        { name: 'Integrations and API Ports', free: '✖', pro: 'Basic triggers', enterprise: 'Slack, Sheets, Webhooks' },
        { name: 'Support SLA status', free: 'Community boards', pro: '24 hr email responses', enterprise: 'Dedicated account lead group' }
      ]
    }
  ];

  // Frequently Asked Questions database
  const faqDatabase = [
    {
      question: 'How are my word tokens calculated?',
      answer: 'Every time you process a draft via ScribeStone, our system measures the text length. Only the input words are counted against your monthly active subscription token bucket. Repeated reviews of the same document do not re-bill your allowance.'
    },
    {
      question: 'What is the benefit of the Double-Pass LLM?',
      answer: 'The first pass scans for technical spelling issues and standard flow modifiers. The second pass reorganizes sentence hierarchy, improves vocabulary punch, and refines the draft without removing your authentic human tone.'
    },
    {
      question: 'Can I cancel or change my plan tier at any time?',
      answer: 'Yes. All payments are securely parsed via Stripe Checkout simulators. You can click "Stripe & Settings" inside your workspace dashboard to cancel, change intervals, or reset test data seamlessly.'
    },
    {
      question: 'Does ScribeStone share or train LLMs on my data?',
      answer: 'No. ScribeStone is committed to extreme data privacy. We handle data in temporary cloud containers and never use customer submissions to train commercial models. Your drafts are strictly saved in private databases.'
    }
  ];

  const handleCTABlick = (planId: 'free' | 'pro' | 'enterprise') => {
    if (planId === 'free') {
      setView('dashboard');
    } else {
      onSubscribe(planId, billingInterval);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F] font-sans">
      
      {/* 1. Header Display / Hero Section */}
      <section className="relative px-4 pt-12 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center space-y-5">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#3E5C4B]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#C8A97E]/5 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E5C4B]/15 border border-[#3E5C4B]/25 text-[10px] font-mono font-bold text-[#3E5C4B] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C8A97E]" />
          INVESTMENT & LICENSING SCALE
        </div>

        <h1 className="font-serif text-3.5xl sm:text-5xl font-semibold tracking-tight leading-none text-[#1F1F1F]">
          Simple, transparent pricing <br />
          for <span className="italic text-[#3E5C4B] font-serif font-normal">absolute clarity.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#5C5A52] font-light leading-relaxed">
          Upgrade to a double-pass AI structure with larger word quotas. Secure Stripe-backed sandbox environments mean simple test transactions and full sandbox capabilities.
        </p>

        {/* 2. Billing Interval Toggle Controls */}
        <div className="pt-4 flex items-center justify-center gap-4">
          <span className={`text-xs ${billingInterval === 'month' ? 'text-[#1F1F1F] font-bold' : 'text-[#8E8C82]'}`}>
            Monthly invoices
          </span>
          
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="w-14 h-7 p-1 rounded-full bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 transition-colors cursor-pointer relative flex items-center"
            id="billing-interval-switch"
            aria-label="Toggle Monthly/Yearly invoicing"
          >
            <div 
              className={`w-5.5 h-5.5 rounded-full bg-[#3E5C4B] text-[#FAF9F6] flex items-center justify-center shadow-md transition-transform duration-300 ${
                billingInterval === 'year' ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
            </div>
          </button>

          <span className={`text-xs flex items-center gap-1.5 ${billingInterval === 'year' ? 'text-[#3E5C4B] font-bold' : 'text-[#8E8C82]'}`}>
            Yearly commits
            <span className="bg-[#C8A97E]/20 text-[#7C5A14] text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Save ~20%
            </span>
          </span>
        </div>

      </section>

      {/* 3. Rounded Cards Pricing Grid Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch" id="pricing-plans-cards">
          
          {plans.map((p) => {
            const isTargetActive = subscription.tier === p.id;
            const cardPrice = billingInterval === 'month' ? p.monthlyPrice : p.yearlyPrice;
            const intervalLabel = billingInterval === 'month' ? 'mo' : 'yr';

            return (
              <div 
                key={p.id}
                className={`rounded-3xl bg-white border p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  isTargetActive 
                    ? 'border-[#3E5C4B] ring-1 ring-[#3E5C4B] shadow-lg scale-[1.01]' 
                    : 'border-[#EBEAE4] shadow-xs hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                {/* Visual Popular Flag Badge */}
                {p.badge && (
                  <span className="absolute -top-3.5 right-6 bg-[#3E5C4B] text-[#FAF9F6] border border-[#3E5C4B] text-[8px] font-mono font-bold px-2.5 py-1 rounded-full tracking-widest shadow-2xs">
                    {p.badge}
                  </span>
                )}

                <div>
                  
                  {/* Badge & Name */}
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-[#1F1F1F]">{p.name}</span>
                    {p.id === 'free' ? (
                      <span className="p-1 px-2.5 rounded text-[8px] font-mono font-bold bg-[#FAF9F6] text-[#8E8C82] border border-[#EBEAE4] uppercase">SANDBOX</span>
                    ) : p.id === 'pro' ? (
                      <span className="p-1 px-2.5 rounded text-[8px] font-mono font-bold bg-[#3E5C4B]/10 text-[#3E5C4B] border border-[#3E5C4B]/15 uppercase">AI POWER</span>
                    ) : (
                      <span className="p-1 px-2.5 rounded text-[8px] font-mono font-bold bg-[#C8A97E]/10 text-[#7C5A14] border border-[#C8A97E]/15 uppercase">TEAM NODE</span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#5C5A52] mt-2 font-light leading-relaxed min-h-[44px]">
                    {p.description}
                  </p>

                  {/* Pricing metrics */}
                  <div className="my-5 flex items-baseline">
                    <span className="text-3.5xl font-serif font-black text-[#1F1F1F]">${cardPrice}</span>
                    <span className="text-[11px] font-mono text-[#8E8C82] ml-1.5">
                      / user / {intervalLabel}
                    </span>
                  </div>

                  {/* Words Cap representation */}
                  <div className="bg-[#FAF9F6] border border-[#EBEAE4] p-3 rounded-2xl mb-6">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#5C5A52]">
                      <span>Words Allocation:</span>
                      <span className="font-bold text-[#3E5C4B]">{p.wordTokens.toLocaleString()}w</span>
                    </div>
                  </div>

                  <hr className="border-[#FAF9F6] mb-5" />

                  {/* Included features checklist */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-semibold text-[#8E8C82] tracking-widest uppercase block mb-1">CAPABILITIES INCLUDED</span>
                    <ul className="space-y-2.5 text-xs text-[#5C5A52] font-light">
                      {p.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#3E5C4B] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                      
                      {/* Grayed out non-available items */}
                      {p.notIncluded.map((nFeat, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-2.5 opacity-40 select-none">
                          <span className="text-stone-400 text-sm shrink-0 mt-px leading-none">×</span>
                          <span className="line-through">{nFeat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Card CTA Action buttons (Connect with checkout trigger) */}
                <div className="pt-8">
                  <button
                    onClick={() => handleCTABlick(p.id)}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isTargetActive 
                        ? 'bg-[#3E5C4B]/10 text-[#3E5C4B] border border-[#3E5C4B]/20 hover:bg-[#3E5C4B]/15'
                        : p.id === 'free' 
                          ? 'bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4]'
                          : 'bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] border border-transparent'
                    }`}
                  >
                    <span>{isTargetActive ? 'Current Subscribed Tier' : p.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  
                  {p.id !== 'free' && (
                    <span className="block text-center text-[9px] font-mono text-stone-400 mt-2">
                      Secure verification placeholder via Stripe
                    </span>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* 4. Feature Comparison Table Spreadsheet */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono uppercase text-[#C8A97E] tracking-widest font-bold">DETAILED SPECIFICATIONS</span>
          <h2 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Grand Feature Matrix</h2>
          <p className="text-xs text-[#5C5A52] font-light">Evaluate orthography precision algorithms, model behaviors, and server SLAs.</p>
        </div>

        <div className="bg-white border border-[#EBEAE4] rounded-2xl overflow-hidden shadow-xs">
          
          {comparativeFeatures.map((sec, secIdx) => (
            <div key={secIdx} className="border-b last:border-0 border-[#EBEAE4]">
              
              <div className="bg-[#FAF9F6] px-5 py-3 font-mono text-[9px] font-bold text-[#3E5C4B] tracking-wider uppercase border-b border-[#EBEAE4]">
                {sec.category}
              </div>

              <div className="divide-y divide-[#FAF9F6]/80">
                {sec.items.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-1 md:grid-cols-12 px-5 py-3.5 items-center text-xs gap-3">
                    <div className="md:col-span-5 font-semibold text-[#1F1F1F]">{row.name}</div>
                    
                    <div className="md:col-span-12 md:hidden h-px bg-[#FAF9F6]"></div>

                    <div className="grid grid-cols-3 md:col-span-7 gap-2.5 text-center text-[11px] font-mono">
                      <div>
                        <span className="block text-[8px] md:hidden text-stone-300">STARTER</span>
                        <span className="text-stone-500">{row.free}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] md:hidden text-[#3E5C4B] font-bold">PRO SCRIBE</span>
                        <span className="text-[#3E5C4B] font-bold">{row.pro}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] md:hidden text-[#C8A97E] font-bold">TEAM STUDIO</span>
                        <span className="text-[#C8A97E] font-semibold">{row.enterprise}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* 5. Frequently Asked Questions Accordion Grid */}
      <section className="bg-[#white] border-t border-[#EBEAE4] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <HelpCircle className="w-7 h-7 text-[#C8A97E] mx-auto" />
            <h2 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Pricing & Security FAQ</h2>
            <p className="text-xs text-[#5C5A52] font-light max-w-sm mx-auto">
              Answers to popular questions about document quotas, subscriptions, and security safeguards.
            </p>
          </div>

          <div className="space-y-4" id="pricing-faqs-accordion">
            {faqDatabase.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-[#FAF9F6] border border-[#EBEAE4] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-[#1F1F1F] hover:text-[#3E5C4B] cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8E8C82] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[#EBEAE4]/40"
                      >
                        <div className="px-5 py-4 text-xs text-[#5C5A52] font-light leading-relaxed bg-white">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Humanized Enterprise Support Contact footer bar */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#3E5C4B] text-[#FAF9F6] p-8 sm:p-12 rounded-3xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C8A97E]/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-2">
            <Building className="w-8 h-8 text-[#C8A97E] mx-auto" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold">Looking for custom API rates?</h3>
            <p className="text-xs text-stone-200 max-w-md mx-auto leading-relaxed font-light">
              Connect private models, customize orthography styles, or implement Workspace integrations across full-scale brand portfolios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setView('contact')}
              className="bg-[#FAF9F6] text-[#3E5C4B] hover:bg-stone-100 text-xs font-semibold px-6 py-3 rounded-xl transition-all w-full sm:w-auto cursor-pointer"
            >
              Consult with Editorial Concierge
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="px-6 py-3 text-xs text-stone-200 hover:text-white transition-all font-semibold"
            >
              Return to dashboard view
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
