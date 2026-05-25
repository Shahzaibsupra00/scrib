interface LegalPagesProps {
  type: 'privacy' | 'terms';
}

export default function LegalPages({ type }: LegalPagesProps) {
  return (
    <div className="animate-soft-fade px-6 py-12 max-w-4xl mx-auto">
      
      {/* Container holding editorial format */}
      <div className="bg-white border border-[#EBEAE4] p-8 md:p-12 rounded-2xl shadow-xs">
        
        {type === 'privacy' ? (
          // Privacy policy template
          <div className="space-y-6">
            <div className="border-b border-[#F1EFEA] pb-6">
              <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-1">LEGAL DECLARATION</span>
              <h1 className="font-serif text-3xl font-bold text-[#1F1F1F]">Privacy Guidelines</h1>
              <p className="text-xs text-[#8E8C82] font-mono mt-1">Last revised: May 25, 2026</p>
            </div>

            <div className="font-serif text-xs leading-relaxed text-[#5C5A52] space-y-6 font-light">
              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">1. Dynamic Data Ingestion</h3>
              <p>
                ScribeStone ingests document files and text draft copy submitted via our Refinement Editor. This copy is evaluated server-side securely through our dedicated Gemini API pipeline. Our system does not store or process your documents for model training; drafts are cached purely for transaction logging and persistence inside your personal dashboard history table.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">2. Secure Session Storage</h3>
              <p>
                We collaborate with <strong>Clerk Authentication</strong> platforms to establish secure session control. Clerk handles user credentials, email directories, and metadata indexes. Word usage counters are updated dynamically during each editor transaction to respect plan credit limits.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">3. Financial Security and Checkout</h3>
              <p>
                Payment entries are securely routed through <strong>Stripe Billing</strong> gateways. No credit card or billing numbers are cached inside raw ScribeStone servers. Stripe controls the customer billing portal where plans are self-renewed or self-canceled.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">4. Direct Disclosures</h3>
              <p>
                ScribeStone guarantees we will never lease, sell, or disclose user document directories, spelling error patterns, or style preferences to third-party marketing channels. Data integrity is guarded by SQLite and PostgreSQL encryption protocols in production.
              </p>
            </div>
          </div>
        ) : (
          // Terms of service template
          <div className="space-y-6">
            <div className="border-b border-[#F1EFEA] pb-6">
              <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-1">LEGAL RULES</span>
              <h1 className="font-serif text-3xl font-bold text-[#1F1F1F]">Terms of Service</h1>
              <p className="text-xs text-[#8E8C82] font-mono mt-1">Last revised: May 25, 2026</p>
            </div>

            <div className="font-serif text-xs leading-relaxed text-[#5C5A52] space-y-6 font-light">
              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">1. Acceptable Utilization Metrics</h3>
              <p>
                Users are requested to use ScribeStone's Refinement Editor for legitimate document copywriting, proofreading, and style enhancements. Processing malicious payloads, automated script triggers, or using unauthorized API scraper wrappers violates server guidelines and leads to account suspension.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">2. Subscription Allowance Framework</h3>
              <p>
                ScribeStone measures words usage quotas. Every draft submission sent through the server-side analyze endpoint deducts dynamic word weights. When word counters exceed active limits, users must purchase expanded allowances. Account indicators are linked to Clerk Profiles and Stripe Customer logs.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">3. Intellectual Property Ownership</h3>
              <p>
                Refinement outputs, corrected drafts, and editorial modifications generated through ScribeStone's models belong exclusively to the user. ScribeStone claims zero royalties or copyrights over your final publication drafts.
              </p>

              <h3 className="font-sans font-bold text-sm text-[#1F1F1F]">4. Limit of Liabilities</h3>
              <p>
                ScribeStone and its API providers do not offer any guarantees regarding grammatical correctness, professional impact, or business accuracy. Refined documents should be checked by humans prior to enterprise publishing. ScribeStone is not liable for structural syntax errors, database outages, or transactional disruptions.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
