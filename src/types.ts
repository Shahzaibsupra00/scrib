export interface AnalysisResult {
  grammarScore: number;   // 0 to 100
  clarityScore: number;   // 0 to 100
  spellingErrorsCount: number;
  tone: string;           // E.g. "Professional", "Warm", "Direct"
  keyImprovements: string[];
  grammarIssuesCount: number;
  grammarIssues: { original: string; suggested: string; explanation: string }[];
}

export interface AnalysisItem {
  id: string;
  title: string;
  originalText: string;
  analyzedText: string;
  analysis: AnalysisResult;
  style: string;
  createdAt: string;
  fileName?: string;
}

export interface UserSubscription {
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  billingInterval: 'month' | 'year';
  wordsUsed: number;
  wordsLimit: number;
  status: 'active' | 'incomplete' | 'canceled';
  role?: 'user' | 'admin';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  publishedAt: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

export type ViewType = 
  | 'landing' 
  | 'dashboard' 
  | 'ai-tool' 
  | 'history' 
  | 'settings' 
  | 'blog' 
  | 'contact' 
  | 'privacy' 
  | 'terms'
  | 'auth'
  | 'pricing'
  | 'secure-uploads'
  | 'admin'
  | 'design-system';
