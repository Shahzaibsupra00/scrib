import { useState, useMemo, FormEvent } from 'react';
import { BlogPost } from '../types';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  Bookmark, 
  Tag, 
  Search, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Check, 
  Heart, 
  Share2, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Art of Syntax Density: Writing Minimal Prose that Persuades",
    excerpt: "Excess adjectives dilute core value. In this essay, we inspect corporate strategies to tighten sentence flows, eliminate functional fluff, and style compelling executive-level communications.",
    content: `## The Art of Syntax Density: Writing Minimal Prose that Persuades

In professional environments, word volume does not equate to intelligence. In fact, excessive word density acts as a barrier to transaction approvals. When proposing critical structures to decision-makers, keeping prose tight and concise guarantees higher message retention.

### Modern Jargon Overload

Many teams fall into the trap of using passive fillers like "in order to clarify the structural metrics, it would be highly beneficial to inspect." Elevating syntax involves shortening such clauses directly: "To optimize metrics, evaluate."

1. **Delete Timid Qualifiers:** Replace statements like "I just think we might capture roughly 5%" with direct metrics declarations: "We are positioned to capture 5%."
2. **Eradicate Contractions in Executive Summaries:** Although warm tones work in newsletters, formal briefs require complete spelling assertions.
3. **Control Average Sentence Length:** Sentences exceeding 25 words increase reader cognitive fatigue by 40%. Break compound segments cleanly.

### High-Craft Examples

* **Before (Unrefined Jargon):** "We wanted to reach out to quickly provide a brief update regarding how our database is performing, which has lately been throwing errors and locking tables up."
* **After (ScribeStone Refined):** "Our database integrity logs indicate recurring transaction locks affecting production. Our engineering team is currently investigating."

By maintaining consistent density, business emails achieve immediate clarity and clear call-to-actions, preventing strategic friction.`,
    readTime: "4 min read",
    publishedAt: "May 24, 2026",
    category: "Writing Style",
    author: {
      name: "Arthur Stone",
      role: "Lead Editor, ScribeStone Studios",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
    }
  },
  {
    id: "blog-2",
    title: "Empathetic Text Heuristics inside Multi-User Collaboration Platforms",
    excerpt: "Ditch dry system notifications. Understand why supportive prose structures in team tools foster constructive triages, boost peer morale, and prevent workspace deadlocks.",
    content: `## Empathetic Text Heuristics inside Multi-User Collaboration Platforms

Communication is not merely an exchange of factual telemetry; it is an active emotional workspace. When writing code reviews, bug notices, or system notifications, keeping the tone warm and collaborative prevents friction and improves resolution velocity.

### Why Human Touch Speeds Up Bug Resolution

When server crashes or database tables experience locking issues, structural logs can sound accusatory: "User failed query constraint." Reframing logs into supportive observations empowers teams to act as partners rather than adversaries.

> "A message framed constructively boosts peer morale, accelerating correction times by roughly 30%."

### Reframing Drastic Notifications

* **Accusatory Brief:** "Your production build failed again due to missing environment variables. Set GEMINI_API_KEY immediately."
* **Supportive Reframing:** "We noticed your recent build was completed without the GEMINI_API_KEY environment configuration. Please select your API parameters inside the settings menu so we can re-compile your application."

### The Multi-User Feedback Loop

Clear text structures inspire clear responses. By incorporating consistent empathy into daily developer interfaces, companies build durable cultures that withstand live production pressures.`,
    readTime: "5 min read",
    publishedAt: "May 18, 2026",
    category: "Developer Relations",
    author: {
      name: "Sarah Cedar",
      role: "Director of UX Research",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    }
  },
  {
    id: "blog-3",
    title: "Maximizing Reader Retention through Dynamic Tone Modification Dials",
    excerpt: "Should your brand speak like a textbook or a coffee shop barista? Learn how custom style paradigms dictate reader retention and subscriber growth metrics.",
    content: `## Maximizing Reader Retention through Dynamic Tone Modification Dials

Brands today are expected to speak with a distinct human accent. The difficulty is that a single static tone struggles to accommodate all user demographics. That is where dynamic tone dials become crucial assets for modern SaaS providers.

### Balancing Style Paradigms

1. **Executive Tone:** Fits stakeholders, proposal briefs, and financial checkouts. It establishes security and confidence.
2. **Warm Tone:** Fits user onboarding guides, community journals, and customer service requests. It builds long-term brand affinity.
3. **Witty Tone:** Fits public product releases, newsletter subject lines, and marketing hooks. It drives early-stage conversion rates.

### Dynamic Alignment

Matching the copy's tone to the user's immediate state is paramount. A user confronting database deadlocks does not want a witty, humorous error flag; they demand a crisp, concise solution path. Conversely, a user accomplishing their first newsletter upload expects cheerful, encouraging congrats.

ScribeStone's preset dials allow you to toggle the active voice dynamically, helping you write copy perfectly aligned with every stage of the user journey.`,
    readTime: "3 min read",
    publishedAt: "May 10, 2026",
    category: "SaaS Marketing",
    author: {
      name: "Elena Gold",
      role: "Product Growth Strategist",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
    }
  },
  {
    id: "blog-4",
    title: "The Orthography Manifesto: Standardizing Microcopy Across Distributed Codebases",
    excerpt: "Inconsistent spelling in CTA buttons and tooltip descriptors reduces onboarding trust. Explore our standard system rules for maintaining pristine linguistic integrity.",
    content: `## The Orthography Manifesto: Standardizing Microcopy Across Distributed Teams

Consistency in microscopic details forms the silent foundation of design systems. When one team utilizes 'Sign In' while another uses 'Log in', or if spelling variations (British vs American English) slip through distributed nodes, customer Trust Scores drop.

### The True Cost of Microcopy Chaos

Vague terminology confuses prospects right at the conversion boundary. In a recent analysis of checkout funnel pings, interface alignment and microcopy consistency improved customer transaction speed by up to 12%.

### Core Standard Rules

* **Capitalization Consistency:** Choose Sentence case ('Create new space') over Title Case ('Create New Space') for all functional button items. Sentence case feels more conversational and less mechanical.
* **Punctuation of Tooltips:** Do not place terminal periods inside text blobs that are less than two complete sentences. Keep it minimal and atmospheric.
* **Active Verb Directives:** Avoid starting interface tooltips with passive instructions like 'This allows the selection of styles...' Select instead: 'Choose styles below...'

By documenting localized orthography guidelines inside a central manifesto, developers and designers maintain absolute alignment.`,
    readTime: "6 min read",
    publishedAt: "May 04, 2026",
    category: "Writing Style",
    author: {
      name: "Arthur Stone",
      role: "Lead Editor, ScribeStone Studios",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
    }
  },
  {
    id: "blog-5",
    title: "Engineering Low-Latency AI Text Workstreams with Double-Pass Buffers",
    excerpt: "A technical review of LLM token processing workflows. Learn how to configure server-side buffers to optimize streaming feedback without freezing your React frontends.",
    content: `## Engineering Low-Latency AI Text Workstreams

Processing paragraphs through dual-pass generative model APIs places a performance burden on web application state. If the request times out or causes excessive render flickering, user experience is severely hit.

### The Double-Pass Middleware Strategy

To achieve fluid, uninterrupted performance metrics:

1. **First-Pass Stream (Punctuation Tokenizer):** Stream raw typography directly into a client-side state buffer. This ensures immediate feedback so the user doesn't experience "spinning wait states."
2. **Second-Pass Thread (Style Parser):** Run contextual checks sequentially on backend services using clean Node environments. This compiles comprehensive corrections asynchronously.

### Optimal Node & React Configs

Keep the client-side state stabilized using primitives in the dependency arrays. This prevents infinite render storms and guarantees fluid 60FPS workspace layout updates even during complex text stream ingestion events.`,
    readTime: "8 min read",
    publishedAt: "April 28, 2026",
    category: "Engineering",
    author: {
      name: "Marcus Vance",
      role: "Principal Infrastructure Architect",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    }
  },
  {
    id: "blog-6",
    title: "Why High-Contrast Off-White Themes Prevent Prolonged Reading Fatigue",
    excerpt: "The science of visual readability. Review contrast metrics, color science, and why off-white palettes keep document evaluators focused for hours longer.",
    content: `## Why High-Contrast Off-White Themes Prevent Read Fatigue

Many modern SaaS builders default to either bright pure whites or intense glowing dark modes. While dark mode is excellent in low-light environments, intense white text on deep black canvases introduces a glowing optical interference known as halation.

### The Soft Comfort of Off-Whites

Studies in electronic ink and reading ergonomics dictate that subtle, non-reflective off-whites (like warm ivory or concrete beige) drastically lower strain on the eye's ciliary muscles.

* **Contrast Ratios:** Pure dark charcoal on warm off-white provides a soft, organic reading layout similar to premium editorial magazines.
* **Typographic Contrast:** Pairing Inter for controls and elegant Playfair or Garamond style display faces creates high readability rhythm.
* **Negative Space:** Giving sentences 1.62x line height allows the reader to scan clusters comfortably without losing path alignments.`,
    readTime: "4 min read",
    publishedAt: "April 15, 2026",
    category: "Product Design",
    author: {
      name: "Elena Gold",
      role: "Product Growth Strategist",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
    }
  }
];

const CATEGORIES = [
  "All Essays",
  "Writing Style",
  "Developer Relations",
  "SaaS Marketing",
  "Engineering",
  "Product Design"
];

export default function BlogPage() {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Essays');
  const [currentPage, setCurrentPage] = useState(1);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedList, setLikedList] = useState<Record<string, boolean>>({});
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isSubmittingMail, setIsSubmittingMail] = useState(false);

  const postsPerPage = 3;

  // Track Likes Simulators
  const handleLike = (postId: string) => {
    if (likedList[postId]) {
      setLikes(prev => ({ ...prev, [postId]: (prev[postId] || 0) - 1 }));
      setLikedList(prev => ({ ...prev, [postId]: false }));
    } else {
      setLikes(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      setLikedList(prev => ({ ...prev, [postId]: true }));
    }
  };

  // Newsletter Submission process
  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmittingMail(true);
    setTimeout(() => {
      setIsSubmittingMail(false);
      setNewsletterSubscribed(true);
      setEmailInput('');
    }, 1000);
  };

  // Filter & Search Logic
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'All Essays' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination Math
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage]);

  const featuredPost = useMemo(() => {
    // Return first blog post as featured
    return BLOG_POSTS[0];
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1); // Reset page index
  };

  // Smooth share simulation
  const handleShareSimulate = (title: string) => {
    alert(`Copied link to clipboard for: "${title}". (Shared via ScribeStone Editorial Channel)`);
  };

  if (activePost) {
    const isLiked = likedList[activePost.id] || false;
    const likeCount = (likes[activePost.id] || 0) + (activePost.id === 'blog-1' ? 42 : activePost.id === 'blog-2' ? 19 : 27);

    return (
      <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F] font-sans pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          
          {/* Back Action Header */}
          <div className="flex items-center justify-between mb-10 border-b border-[#EBEAE4] pb-4">
            <button
              onClick={() => setActivePost(null)}
              className="flex items-center gap-2 text-xs font-mono font-bold text-[#3E5C4B] hover:text-[#2F4739] transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              BACK TO JOURNAL LEDGER
            </button>
            <span className="text-[9px] font-mono text-[#8E8C82] tracking-wider uppercase">
              NOTION-STYLE COMPLIANT
            </span>
          </div>

          {/* Core Essay Article View */}
          <article className="space-y-8 animate-soft-fade">
            
            {/* Metadata Elements */}
            <div className="space-y-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3E5C4B]/5 text-[#3E5C4B] border border-[#3E5C4B]/15">
                {activePost.category}
              </span>
              
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1F1F1F] font-bold tracking-tight leading-tight">
                {activePost.title}
              </h1>

              {/* Author Info Widget */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EBEAE4]">
                <div className="flex items-center gap-3">
                  <img 
                    src={activePost.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"}
                    alt={activePost.author.name}
                    className="w-10 h-10 rounded-full border border-[#EBEAE4] object-cover bg-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-[#1F1F1F]">{activePost.author.name}</span>
                    <span className="block text-[10px] text-[#8E8C82]">{activePost.author.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-[#8E8C82]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activePost.publishedAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activePost.readTime}</span>
                </div>
              </div>

            </div>

            {/* Custom Styled Article Content */}
            <div className="prose prose-stone max-w-none text-[#1F1F1F] text-sm leading-relaxed space-y-6 pt-4 border-t border-[#FAF9F6]">
              
              {/* Parse Paragraphs nicely */}
              {activePost.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1F1F1F] mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#1F1F1F] mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={index} className="border-l-4 border-[#3E5C4B] bg-[#3E5C4B]/5 p-4.5 rounded-r-xl italic font-serif text-[#3E5C4B] my-6">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                  const listItems = paragraph.split('\n');
                  return (
                    <ul key={index} className="list-disc pl-5 space-y-2 my-4 text-xs sm:text-sm">
                      {listItems.map((li, lIdx) => (
                        <li key={lIdx}>{li.replace(/^[\*\-]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.match(/^\d+\./)) {
                  const listItems = paragraph.split('\n');
                  return (
                    <ol key={index} className="list-decimal pl-5 space-y-2 my-4 text-xs sm:text-sm">
                      {listItems.map((li, lIdx) => (
                        <li key={lIdx}>{li.replace(/^\d+\.\s+/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={index} className="leading-relaxed font-light text-stone-700 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                );
              })}

            </div>

            {/* Interaction Footer Controls */}
            <div className="flex items-center justify-between border-t border-[#EBEAE4] pt-8 mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(activePost.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-[#3E5C4B] text-white border-transparent'
                      : 'bg-white text-[#5C5A52] border-[#EBEAE4] hover:border-[#3E5C4B]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount} likes</span>
                </button>

                <button
                  onClick={() => handleShareSimulate(activePost.title)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border bg-white border-[#EBEAE4] text-xs text-[#5C5A52] hover:border-[#3E5C4B] transition-all cursor-pointer"
                  title="Copy share link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-[#8E8C82]">
                Refined with ScribeStone v2
              </span>
            </div>

          </article>

          {/* Related Articles Drawer Panel */}
          <section className="mt-16 border-t border-[#EBEAE4] pt-12 space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#1F1F1F]">Suggested Readings</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BLOG_POSTS.filter(p => p.id !== activePost.id).slice(0, 2).map(rPost => (
                <div 
                  key={rPost.id}
                  onClick={() => {
                    setActivePost(rPost);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white p-5 rounded-2xl border border-[#EBEAE4] hover:border-[#3E5C4B] transition-all cursor-pointer group space-y-2.5"
                >
                  <span className="text-[9px] font-mono text-[#8E8C82] tracking-wider uppercase block">{rPost.category}</span>
                  <h4 className="font-serif text-xs font-bold text-[#1F1F1F] group-hover:text-[#3E5C4B] transition-colors line-clamp-2">
                    {rPost.title}
                  </h4>
                  <p className="text-[11px] text-[#5C5A52] line-clamp-2 font-light">{rPost.excerpt}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F] font-sans pb-20">
      
      {/* ================= A. EDITORIAL TITLE BAR ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="border-b border-[#EBEAE4] pb-6">
          <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase block mb-1">
            SCRIBESTONE EDITORIAL JOURNAL & LEDGER
          </span>
          <h1 className="font-serif text-3.5xl sm:text-5xl font-semibold tracking-tight text-[#1F1F1F]">
            The Scribe's Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5A52] mt-1.5 font-light max-w-xl">
            Essays, case studies, and engineering guidelines regarding vocabulary selection, double-pass LLM heuristics, and pristine microcopy standards.
          </p>
        </div>
      </section>

      {/* ================= B. PREMIUM FEATURED ESSAY (Always Visible at Top level) ================= */}
      {searchQuery === '' && selectedCategory === 'All Essays' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-3xl border border-[#EBEAE4] overflow-hidden shadow-xs hover:border-[#3E5C4B]/20 transition-all grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Visual display illustration grid (Editorial styling) */}
            <div className="lg:col-span-5 bg-[#3E5C4B] text-[#FAF9F6] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-mono tracking-widest uppercase text-[#C8A97E] font-bold">
                  <BookOpen className="w-3 h-3 text-[#C8A97E]" /> READ OF THE MONTH
                </span>
                <span className="block text-[#FAF9F6]/60 text-xs font-mono">Vol. II — Issue 5</span>
              </div>

              <div className="relative pt-10 pb-8 space-y-4">
                <p className="font-serif text-lg italic text-[#C8A97E] leading-relaxed">
                  "Perfecting microcopy does not require flowery phrases; it requires an active deletion of functional interference."
                </p>
                <span className="block text-[10px] text-stone-300 uppercase tracking-widest font-mono">
                  — SCRIBESTONE DESIGN SYSTEMS
                </span>
              </div>

              <div className="relative text-[10px] text-stone-400 font-mono">
                SECURE SANDBOX INDEX
              </div>
            </div>

            {/* Featured Article Description Pane */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4.5">
                <div className="flex items-center gap-3 text-xs text-[#8E8C82] font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#3E5C4B]/10 text-[#3E5C4B] border border-[#3E5C4B]/15">
                    {featuredPost.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
                </div>

                <h2 
                  onClick={() => setActivePost(featuredPost)}
                  className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F1F] hover:text-[#3E5C4B] transition-colors cursor-pointer leading-tight"
                >
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#5C5A52] leading-relaxed font-light">
                  {featuredPost.excerpt}
                </p>
              </div>

              {/* Author & CTA box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#F1EFEA] pt-6 gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={featuredPost.author.avatarUrl} 
                    alt={featuredPost.author.name} 
                    className="w-10 h-10 rounded-full border border-[#EBEAE4] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-[#1F1F1F]">{featuredPost.author.name}</span>
                    <span className="block text-[9px] text-[#8E8C82] font-mono">{featuredPost.author.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActivePost(featuredPost)}
                  className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] px-5 py-2.5 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Read Essay Post</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ================= C. INTERACTIVE FILTERS ROW (Search & Category list) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#EBEAE4]">
          
          {/* Category Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 shrink-0 max-w-full md:max-w-2xl px-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#3E5C4B] text-white' 
                      : 'bg-[#FAF9F6] text-[#5C5A52] hover:bg-stone-150 border border-[#EBEAE4]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search essays, phrases, authors..."
              className="w-full text-xs bg-[#FAF9F6] border border-[#E5E3DC] rounded-xl pl-9 pr-4 py-2 outline-none focus:border-[#3E5C4B] focus:bg-white"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

        </div>
      </section>

      {/* ================= D. BLOG CARDS GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {paginatedPosts.length === 0 ? (
          
          /* Negative search query states */
          <div className="bg-white rounded-3xl border border-[#EBEAE4] py-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EBEAE4] mx-auto flex items-center justify-center">
              <Search className="w-5 h-5 text-stone-300" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#1F1F1F]">No journal entries matched</h4>
              <p className="text-[11px] text-[#8E8C82] mt-1 font-light leading-relaxed">
                We couldn't locate reports using <strong>"{searchQuery}"</strong>. Adjust filters or category dials to reveal original drafts.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Essays');
              }}
              className="bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] text-[10px] font-bold px-3.5 py-1.5 rounded-lg shadow-2xs cursor-pointer"
            >
              Exterminate Filters
            </button>
          </div>

        ) : (
          
          /* Card list workspace */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="blog-essays-grid">
            {paginatedPosts.map((post) => {
              const isLiked = likedList[post.id] || false;
              const postLikes = (likes[post.id] || 0) + (post.id === 'blog-1' ? 42 : post.id === 'blog-2' ? 19 : post.id === 'blog-3' ? 27 : 14);

              return (
                <article 
                  key={post.id}
                  className="bg-white rounded-2xl border border-[#EBEAE4] overflow-hidden shadow-2xs hover:border-[#3E5C4B] hover:shadow-xs transition-all group flex flex-col justify-between"
                >
                  
                  {/* Card upper content */}
                  <div className="p-6 space-y-4">
                    
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#8E8C82] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Tag className="w-3 h-3 text-[#C8A97E]" /> {post.category}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 
                      onClick={() => {
                        setActivePost(post);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="font-serif text-sm sm:text-base font-bold text-[#1F1F1F] group-hover:text-[#3E5C4B] transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs text-[#5C5A52] leading-relaxed line-clamp-3 font-light">
                      {post.excerpt}
                    </p>

                  </div>

                  {/* Card footer metrics panel */}
                  <div className="p-6 mt-auto border-t border-[#FAF9F6] bg-[#FAF9F6]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={post.author.avatarUrl} 
                        alt={post.author.name} 
                        className="w-7 h-7 rounded-full border border-[#EBEAE4] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-[#1F1F1F] truncate max-w-[90px]">
                          {post.author.name}
                        </span>
                        <span className="block text-[8px] text-[#8E8C82] truncate max-w-[90px] font-mono leading-none">
                          {post.publishedAt}
                        </span>
                      </div>
                    </div>

                    {/* Simple Interaction buttons inside cards */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`p-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                          isLiked 
                            ? 'bg-rose-50 text-rose-600 border-rose-200' 
                            : 'bg-white text-[#8E8C82] border-[#EBEAE4] hover:border-[#3E5C4B]'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{postLikes}</span>
                      </button>

                      <button 
                        onClick={() => {
                          setActivePost(post);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1 px-2 text-[10px] font-mono bg-white hover:bg-[#3E5C4B] hover:text-[#FAF9F6] border border-[#EBEAE4] hover:border-[#3E5C4B] rounded-lg transition-colors cursor-pointer"
                        title="Read this essay"
                      >
                        Read
                      </button>
                    </div>

                  </div>

                </article>
              );
            })}
          </div>

        )}

      </section>

      {/* ================= E. PAGINATION TRIGGERS ================= */}
      {totalPages > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex items-center justify-between border-t border-[#EBEAE4] pt-6 text-xs text-[#5C5A52] font-mono font-bold">
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 bg-white border border-[#EBEAE4] text-stone-700 hover:text-[#3E5C4B] hover:border-[#3E5C4B] disabled:opacity-40 disabled:hover:text-stone-700 p-2.5 px-4 rounded-xl cursor-pointer select-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prior</span>
            </button>

            <span className="text-[10px]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 bg-white border border-[#EBEAE4] text-stone-700 hover:text-[#3E5C4B] hover:border-[#3E5C4B] disabled:opacity-40 disabled:hover:text-stone-700 p-2.5 px-4 rounded-xl cursor-pointer select-none transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </section>
      )}

      {/* ================= F. NOTION-STYLE PREMIUM NEWSLETTER SIGNUP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-[#3E5C4B] rounded-3xl p-8 sm:p-12 text-[#FAF9F6] border border-transparent overflow-hidden shadow-lg relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A97E]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-mono tracking-widest uppercase text-[#C8A97E] font-bold">
              <Sparkles className="w-3 h-3" /> PRISTINE WEEKLY DISPATCH
            </div>
            
            <h2 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-tight text-[#FAF9F6]">
              Gain pristine insights, direct <br className="hidden sm:inline" />
              to your mailbox.
            </h2>
            
            <p className="text-xs sm:text-sm text-stone-200/80 max-w-md font-light leading-relaxed">
              We send structural editorial reviews, orthography manifestos, and technical double-pass API performance indicators. Zero spam, zero marketing noise.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-2xl relative">
            
            {newsletterSubscribed ? (
              <div className="text-center py-4 space-y-3 animate-soft-fade">
                <div className="w-10 h-10 rounded-full bg-[#C8A97E]/20 text-[#C8A97E] border border-[#C8A97E]/30 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-white">Registered Successfully!</span>
                  <span className="block text-[11px] text-stone-300 font-light font-mono">Simulated token received in playground.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-stone-300 font-bold block">
                    Secured Inbox Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. writer@scribe.com"
                      className="w-full text-xs bg-white/10 backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-[#C8A97E] focus:bg-white focus:text-[#1F1F1F] text-[#FAF9F6] transition-all placeholder:text-[#FAF9F6]/40"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingMail}
                  className="w-full bg-[#FAF9F6] hover:bg-stone-100 text-[#3E5C4B] py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
                >
                  {isSubmittingMail ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-[#3E5C4B]/20 border-t-[#3E5C4B] rounded-full"></div>
                      <span>Dispatching validation...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign up for the Journal</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-stone-400 font-mono text-center leading-none">
                  By joining, you consent to secure mock inbox sync checks.
                </p>

              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
