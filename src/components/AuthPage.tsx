import { useState, FormEvent } from 'react';
import { ViewType, UserSubscription } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  ChevronRight,
  BookmarkCheck,
  Globe,
  Quote
} from 'lucide-react';

interface AuthPageProps {
  setView: (view: ViewType) => void;
  subscription: UserSubscription;
  onUpdateSubscription: (updates: Partial<UserSubscription>) => void;
}

export default function AuthPage({ setView, subscription, onUpdateSubscription }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [emailForm, setEmailForm] = useState(subscription.email || 'suprasaab96@gmail.com');
  const [passwordForm, setPasswordForm] = useState('•••••••••••••');
  const [nameForm, setNameForm] = useState(subscription.name || 'Suprasaab User');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Auth Submit Action
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Simulate successful Clerk integration updating global subscription profile
      onUpdateSubscription({
        email: emailForm,
        name: authMode === 'signup' ? nameForm : (subscription.name || 'Suprasaab User'),
        tier: 'free', // maintain or defaults
      });

      alert(
        authMode === 'signup' 
          ? `Welcome to ScribeStone, ${nameForm ? nameForm : 'User'}! Your Clerk profile is registered successfully.` 
          : `Signed in successfully as ${emailForm}. Clerk session tokens issued.`
      );
      
      setView('dashboard');
    }, 1200);
  };

  // Google OAuth Auth simulation
  const handleGoogleAuth = () => {
    setIsSocialSubmitting(true);
    setTimeout(() => {
      setIsSocialSubmitting(false);
      onUpdateSubscription({
        email: "suprasaab.google@gmail.com",
        name: "Google Authenticated User",
      });
      alert("Clerk Google Sign-In request authorized cleanly using OAuth 2.0. Redirecting to workspace.");
      setView('dashboard');
    }, 1000);
  };

  // Forgot password handler
  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotEmailSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 bg-[#FAF9F6]">
      
      {/* ================= LEFT SIDE: PREMIUM COLORED EDITORIAL DISPLAY (Hidden on smaller viewports) ================= */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#3E5C4B] text-[#FAF9F6] p-12 flex-col justify-between relative overflow-hidden border-r border-[#3E5C4B]/20">
        
        {/* Soft geometric styling grid behind graphics */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#FAF9F6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Logo and App Title */}
        <div className="relative z-10">
          <button 
            onClick={() => setView('landing')} 
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FAF9F6] font-serif font-bold text-xl border border-white/10">
              S
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#FAF9F6] leading-tight block">
                ScribeStone
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#C8A97E] font-medium">
                CLERK CREDENTIAL MANAGER
              </span>
            </div>
          </button>
        </div>

        {/* Dynamic Display Presentation Card */}
        <div className="relative z-10 my-auto py-12 space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#FAF9F6]">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A97E]" />
              <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Verified Sandbox Encryption</span>
            </div>
            
            <h2 className="font-serif text-3xl xl:text-4.5xl leading-[1.15] font-semibold tracking-tight">
              Pristine prose <br className="hidden xl:inline" />
              and professional <br className="hidden xl:inline" />
              <span className="italic text-[#C8A97E] font-normal font-serif">editorial control.</span>
            </h2>
            
            <p className="text-xs text-stone-200/80 max-w-sm leading-relaxed font-light">
              Connect your secure Clerk account credentials to access advanced vocabulary analysis and custom database logs.
            </p>
          </div>

          {/* Aesthetic Bullet Benefits with ScribeStone's style */}
          <div className="space-y-3.5 pt-2 text-xs font-light">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
              <span>Double-pass grammar assessment engines.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
              <span>Full local storage and list persistence.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
              <span>Seamless Clerk identity synchronization.</span>
            </div>
          </div>

          {/* Minimal Humanized Testimonial quote inside display sidebar */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative">
            <Quote className="w-8 h-8 text-white/5 absolute right-4 top-4" />
            <p className="text-xs italic font-serif leading-relaxed text-stone-200">
              "ScribeStone simplifies executive draft preparation. Rephrasing is sophisticated, fast, and does not have the sterile feel of standard commercial bots."
            </p>
            <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-white/10">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-[#C8A97E]">
                EL
              </div>
              <div>
                <span className="block text-[10px] font-bold">Eleanor Vance</span>
                <span className="block text-[8px] font-mono text-stone-300">Brand Director, Vane Agency</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info inside sidebar */}
        <div className="relative z-10 text-[10px] text-stone-300 font-mono flex items-center justify-between">
          <span>© 2026 ScribeStone</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8A97E]" /> Secure Connection
          </span>
        </div>

      </div>

      {/* ================= RIGHT SIDE: AUTH FORM MODULE CONTAINER ================= */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-[#FAF9F6]">
        
        {/* Maximum container width for clean form cards */}
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header section toggle details */}
          <div className="space-y-2 text-center">
            
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3E5C4B]/5 border border-[#3E5C4B]/15 text-[9px] font-mono font-bold text-[#3E5C4B]">
              CLERK SECURE INGRESS POINT
            </div>
            
            {authMode === 'signin' && (
              <>
                <h1 className="font-serif text-2xl md:text-3.5xl font-semibold tracking-tight text-[#1F1F1F]">
                  Welcome back
                </h1>
                <p className="text-xs text-[#5C5A52] font-light">
                  Enter your keys below to access ScribeStone's dashboard.
                </p>
              </>
            )}

            {authMode === 'signup' && (
              <>
                <h1 className="font-serif text-2xl md:text-3.5xl font-semibold tracking-tight text-[#1F1F1F]">
                  Create your account
                </h1>
                <p className="text-xs text-[#5C5A52] font-light">
                  Embark with our Starter word allowance package instantly.
                </p>
              </>
            )}

            {authMode === 'forgot' && (
              <>
                <h1 className="font-serif text-2xl md:text-3.5xl font-semibold tracking-tight text-[#1F1F1F]">
                  Recover password
                </h1>
                <p className="text-xs text-[#5C5A52] font-light">
                  We will send structured instructions to regain access.
                </p>
              </>
            )}

          </div>

          {/* Social login option card (Universal for Sign-in and Sign-up fields) */}
          {authMode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSocialSubmitting}
                className="w-full bg-white hover:bg-[#F8F7F4] text-[#1F1F1F] border border-[#E5E3DC] rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-3xs transition-all hover:shadow-2xs active:scale-99"
              >
                {isSocialSubmitting ? (
                  <svg className="animate-spin h-4 w-4 text-[#3E5C4B]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M23.49 12.275c0-.825-.075-1.62-.213-2.385H12v4.515h6.44c-.278 1.48-.112 2.735-1.4 3.593v2.985h2.263c5.05-4.647 7.96-11.48 7.96-18.708z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.958-1.08 7.943-2.922l-2.263-2.985c-1.07.72-2.44 1.147-3.957 1.147-3.045 0-5.618-2.053-6.54-4.814H2.015v3.085C3.99 21.365 7.75 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.46 14.426a7.14 7.14 0 010-4.572V6.77H1.947a11.96 11.96 0 000 10.74l3.513-3.084z"
                    />
                    <path
                      fill="#4285F4"
                      d="M12 4.76c1.76 0 3.344.605 4.587 1.792l3.44-3.438C17.942 1.138 15.232 0 12 0 7.75 0 3.99 2.635 1.947 6.77l3.513 3.085c.922-2.76 3.495-4.814 6.54-4.814z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 h-px bg-[#EBEAE4]"></span>
                <span className="relative px-3 bg-[#FAF9F6] text-[10px] font-mono text-[#8E8C82] uppercase">
                  or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Core Interactive Forms Switcher */}
          <div className="bg-white p-6 rounded-2xl border border-[#EBEAE4] shadow-xs space-y-4">
            
            <AnimatePresence mode="wait">
              
              {/* Reset Password Flow Screen */}
              {authMode === 'forgot' ? (
                <motion.form 
                  key="forgot-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-4"
                >
                  {forgotEmailSent ? (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-[#3E5C4B]/10 border border-[#3E5C4B]/20 flex items-center justify-center mx-auto">
                        <BookmarkCheck className="w-5 h-5 text-[#3E5C4B]" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-[#1F1F1F] block">Recovery check dispatched</span>
                        <p className="text-[11px] text-[#5C5A52] leading-relaxed">
                          We mailed simulated reset tokens to <strong>{emailForm}</strong>. Look inside your local mock sandbox inbox.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmailSent(false);
                          setAuthMode('signin');
                        }}
                        className="w-full bg-[#FAF9F6] text-xs font-semibold py-2 rounded-lg border border-[#E5E3DC]"
                      >
                        Return to login screen
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-[#8E8C82] font-semibold flex items-center gap-1">
                          <Mail className="w-3w-3" /> Email Account
                        </label>
                        <input 
                          type="email" 
                          required
                          value={emailForm}
                          onChange={(e) => setEmailForm(e.target.value)}
                          placeholder="suprasaab96@gmail.com"
                          className="w-full text-xs bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl px-3 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? 'Mailing details...' : 'Request recovery details'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="w-full text-center text-[10px] font-semibold text-[#8E8C82] hover:text-[#1F1F1F] block pt-1.5"
                      >
                        ← Return to credentials log
                      </button>
                    </>
                  )}
                </motion.form>
              ) : (
                
                /* Login / Signup Dual Ingress flow card */
                <motion.form 
                  key="main-auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  
                  {/* Real-time Validation for Register (Signup state) metadata fields */}
                  {authMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-[#8E8C82] font-semibold flex items-center gap-1">
                        <User className="w-3 h-3 text-[#C8A97E]" /> Fully Human Name
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="E.g. Rowan Mercer"
                        value={nameForm}
                        onChange={(e) => setNameForm(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl px-3 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white font-serif"
                      />
                    </div>
                  )}

                  {/* Universal Email Box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-[#8E8C82] font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#C8A97E]" /> Email Account
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="suprasaab96@gmail.com"
                      value={emailForm}
                      onChange={(e) => setEmailForm(e.target.value)}
                      className="w-full text-xs bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl px-3 py-2.5 outline-none focus:border-[#3E5C4B] focus:bg-white"
                    />
                  </div>

                  {/* Universal Password Input Area (With Hide/show Toggling) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[10px] font-mono uppercase text-[#8E8C82] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#C8A97E]" /> Password Code
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[9px] font-semibold text-[#3E5C4B] hover:text-[#C8A97E] transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={passwordForm}
                        onChange={(e) => setPasswordForm(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl px-3 py-2.5 pr-10 outline-none focus:border-[#3E5C4B] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Checkbox area */}
                  {authMode === 'signin' && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-[#EBEAE4] text-[#3E5C4B] focus:ring-[#3E5C4B] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] text-[#5C5A52]">Remember me for 30 days</span>
                      </label>
                      
                      <span className="text-[8px] font-mono text-stone-300">Clerk v3</span>
                    </div>
                  )}

                  {/* Submit Credentials box */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-[#FAF9F6] text-xs font-semibold py-3 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Validating credentials with Clerk directory...</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === 'signin' ? 'Sign in with ScribeStone Account' : 'Create Sandbox Credentials'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </motion.form>
              )}
            </AnimatePresence>

          </div>

          {/* Form Toggle bottom block */}
          {authMode !== 'forgot' && (
            <div className="text-center text-xs text-[#5C5A52] font-light pt-2">
              {authMode === 'signin' ? (
                <span>
                  New to ScribeStone?{' '}
                  <button 
                    onClick={() => setAuthMode('signup')}
                    className="font-semibold text-[#3E5C4B] hover:underline"
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already signed in before?{' '}
                  <button 
                    onClick={() => setAuthMode('signin')}
                    className="font-semibold text-[#3E5C4B] hover:underline"
                  >
                    Log in here
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Interactive Back to App trigger */}
          <div className="text-center">
            <button
              onClick={() => setView('landing')}
              className="text-[11px] font-mono text-[#8E8C82] hover:text-[#1F1F1F] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Discard login and return to main landing page
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
