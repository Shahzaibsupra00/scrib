import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  Trash2, 
  Sliders, 
  SlidersHorizontal,
  Code, 
  Eye, 
  Copy,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  MoveRight,
  Sparkles,
  ExternalLink,
  Laptop,
  CheckCircle,
  FileText,
  Lock,
  Compass,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface SaaSDesignSystemProps {
  setView: (view: any) => void;
}

// Spacing scale item definition
interface SpacingItem {
  name: string;
  pixels: string;
  rem: string;
  tailwindClass: string;
  usage: string;
}

// Tab for categorizing components inside showcase
type DesignSystemTab = 'all' | 'buttons' | 'inputs' | 'cards' | 'dialogs' | 'tables' | 'dropdowns' | 'alerts' | 'typography' | 'spacing';

export default function SaaSDesignSystem({ setView }: SaaSDesignSystemProps) {
  const [activeCategory, setActiveCategory] = useState<DesignSystemTab>('all');
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'preview' | 'code'>>({});
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Component State Playgrounds
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSelection, setDropdownSelection] = useState('Select role...');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [checkboxState, setCheckboxState] = useState(false);
  const [mockNotification, setMockNotification] = useState<string | null>(null);

  // Dynamic code helper to copy snippets
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 1800);
  };

  // Helper code to toggle preview/code mode
  const toggleCodeTab = (id: string) => {
    setActiveCodeTab(prev => ({
      ...prev,
      [id]: prev[id] === 'code' ? 'preview' : 'code'
    }));
  };

  // Spacing System Guidelines Data
  const spacingScale: SpacingItem[] = [
    { name: "xs", pixels: "4px", rem: "0.25rem", tailwindClass: "p-1 or w-1", usage: "Tiny item spacing, compact inner paddings" },
    { name: "sm", pixels: "8px", rem: "0.5rem", tailwindClass: "p-2 or gap-2", usage: "Gap spacing in flexboxes, tight rows" },
    { name: "md", pixels: "16px", rem: "1rem", tailwindClass: "p-4 or gap-4", usage: "Standard card content padding, modular gaps" },
    { name: "lg", pixels: "24px", rem: "1.5rem", tailwindClass: "p-6 or gap-6", usage: "Desktop page headings margins, dashboard gaps" },
    { name: "xl", pixels: "32px", rem: "2rem", tailwindClass: "p-8 or pt-8", usage: "Generous section boundaries, layout negative space" },
    { name: "2xl", pixels: "48px", rem: "3rem", tailwindClass: "p-12", usage: "Landing page banner boundaries, footer borders" },
  ];

  // Component 1: Reusable Button Component Code
  const buttonCode = `// Premium Linear + Notion Inspired Custom Button Code
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3E5C4B]/20 select-none border";
  
  const variants = {
    primary: "bg-[#3E5C4B] hover:bg-[#2F4739] text-white border-transparent shadow-xs active:scale-[0.98]",
    secondary: "bg-[#F3F1ED] hover:bg-[#EBEAE4] text-[#1F1F1F] border-[#E5E3DC] active:scale-[0.98]",
    outline: "bg-white hover:bg-[#FAF9F6] text-[#5C5A52] hover:text-[#1F1F1F] border-[#EBEAE4] hover:border-[#1F1F1F] focus:border-[#3E5C4B]",
    ghost: "bg-transparent hover:bg-[#FAF9F6] text-[#5C5A52] hover:text-[#1F1F1F] border-transparent",
    accent: "bg-[#C8A97E] hover:bg-[#B8996E] text-white border-transparent shadow-xs active:scale-[0.98]",
    destructive: "bg-red-50 hover:bg-red-100 text-red-800 border-red-200 hover:border-red-300"
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3.5 text-sm"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={\`\${baseStyle} \${variants[variant]} \${sizes[size]} \${className} \${disabled || isLoading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}\`}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
      {children}
    </button>
  );
});`;

  // Component 2: Reusable Input Component Code
  const inputCode = `// Premium Minimal Form Input Controls Code
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8C82]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={\`w-full text-xs font-mono py-2.5 bg-[#FAF9F6] border rounded-xl focus:bg-white focus:outline-none transition-all duration-200
            \${icon ? 'pl-10' : 'pl-4'} pr-4
            \${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-[#EBEAE4] focus:border-[#3E5C4B] focus:ring-2 focus:ring-[#3E5C4B]/10'}\`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10px] text-red-600 block pl-1 font-serif">
          {error}
        </span>
      )}
    </div>
  );
});`;

  // Component 3: Reusable Card Component Code
  const cardCode = `// Notion-styled Fine Border Outline Card Primitives
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={\`bg-white border border-[#EBEAE4] rounded-2xl p-6 shadow-xs text-left transition-all duration-200
        \${hoverEffect ? 'hover:shadow-xs hover:border-[#3E5C4B] hover:translate-y-[-2px] cursor-pointer' : ''} 
        \${className}\`}
      {...props}
    >
      {children}
    </div>
  );
};`;

  // Component 4: Dialog Overlay Overlay Component Code
  const dialogCode = `// Interactive Animated Center Dismissible Dialog Frame
import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, description, children }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dynamic Backdrop */}
      <div 
        className="fixed inset-0 bg-[#2B251F]/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Content Container */}
      <div className="bg-white border border-[#EBEAE4] rounded-2xl w-full max-w-md p-6 relative shadow-lg text-left animate-soft-fade z-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-stone-400 hover:text-[#1F1F1F] hover:bg-stone-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="mb-4">
          <h3 className="font-serif text-[#1F1F1F] text-base font-bold">{title}</h3>
          {description && (
            <p className="text-[11px] text-[#5C5A52] font-light mt-0.5">{description}</p>
          )}
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};`;

  // Component 5: Reusable Dropdown Component Code
  const dropdownCode = `// Minimal Sleek Input-aligned Select Dropdown Primitive
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  label: string;
  value: string;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const Dropdown = ({ options, selectedValue, onChange, placeholder = "Select option...", label }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === selectedValue);

  return (
    <div ref={dropdownRef} className="relative w-full text-left">
      {label && (
        <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FAF9F6] border border-[#EBEAE4] px-4 py-2.5 rounded-xl text-xs font-mono select-none flex items-center justify-between text-[#1F1F1F] hover:bg-white focus:border-[#3E5C4B] transition-all"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={\`w-3.5 h-3.5 text-[#8E8C82] transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-30 bg-white border border-[#EBEAE4] rounded-xl shadow-md py-1 divide-y divide-[#F1EFEA]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#FAF9F6] text-xs font-serif text-[#1F1F1F] flex items-center justify-between group transition-colors"
            >
              <div>
                <span className={\`font-medium \${selectedValue === opt.value ? 'text-[#3E5C4B]' : ''}\`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="block text-[9px] font-mono text-[#8E8C82] mt-0.5 font-light">
                    {opt.description}
                  </span>
                )}
              </div>
              {selectedValue === opt.value && (
                <Check className="w-3.5 h-3.5 text-[#3E5C4B]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};`;

  // Component 6: Reusable Alert Box Elements Code
  const alertCode = `// Premium Notification Canvas with Color Border Accents
import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

export const Alert = ({ variant = 'info', title, description }: AlertProps) => {
  const configs = {
    info: {
      bg: "bg-[#F8F7F4]",
      border: "border-stone-200",
      accent: "border-l-[#C8A97E]",
      textTitle: "text-[#1F1F1F]",
      textBody: "text-[#5C5A52]",
      icon: <Info className="w-4 h-4 text-[#C8A97E]" />
    },
    success: {
      bg: "bg-[#3E5C4B]/5",
      border: "border-[#3E5C4B]/15",
      accent: "border-l-[#3E5C4B]",
      textTitle: "text-[#3E5C4B]",
      textBody: "text-stone-700",
      icon: <CheckCircle2 className="w-4 h-4 text-[#3E5C4B]" />
    },
    warning: {
      bg: "bg-amber-50/70",
      border: "border-amber-100",
      accent: "border-l-amber-500",
      textTitle: "text-amber-800",
      textBody: "text-amber-700",
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />
    },
    error: {
      bg: "bg-red-50/70",
      border: "border-red-100",
      accent: "border-l-red-500",
      textTitle: "text-red-800",
      textBody: "text-red-700",
      icon: <AlertCircle className="w-4 h-4 text-red-600" />
    }
  };

  const choice = configs[variant];

  return (
    <div className={\`flex items-start gap-3 p-4 rounded-xl border border-l-3 \${choice.bg} \${choice.border} \${choice.accent} text-left\`}>
      <div className="mt-0.5 shrink-0">
        {choice.icon}
      </div>
      <div>
        <h5 className={\`text-xs font-serif font-bold \${choice.textTitle}\`}>{title}</h5>
        <p className={\`text-[11px] \${choice.textBody} font-light mt-0.5 leading-relaxed\`}>{description}</p>
      </div>
    </div>
  );
};`;

  // Component 7: Dialog Slide Mock Overlay Modal Code
  const modalCode = `// Slide-over Sidebar Modal Overlays
import React from 'react';
import { X } from 'lucide-react';

interface SlideOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const SlideOverModal = ({ isOpen, onClose, title, children }: SlideOverModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[#2B251F]/35 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-sm">
          <div className="h-full flex flex-col bg-white border-l border-[#EBEAE4] shadow-xl text-left animate-soft-fade">
            <div className="px-5 py-4 border-b border-[#F1EFEA] flex justify-between items-center bg-[#FAF9F6]">
              <h3 className="font-serif text-sm font-bold text-[#1F1F1F]">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-stone-400 hover:text-[#1F1F1F] hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;

  // Simulate verification actions alert show
  const triggerNotification = (text: string) => {
    setMockNotification(text);
    setTimeout(() => setMockNotification(null), 3500);
  };

  // Set default view layout state keys
  const getTabLabel = (cat: DesignSystemTab): string => {
    if (cat === 'all') return "Full System Showcase";
    if (cat === 'buttons') return "Premium Button Primitives";
    if (cat === 'inputs') return "Form Input Controls";
    if (cat === 'cards') return "Notion Style Cards";
    if (cat === 'dialogs') return "Dismissible Center Dialogs";
    if (cat === 'tables') return "Compact Status Tables";
    if (cat === 'dropdowns') return "Filter Dropdowns";
    if (cat === 'alerts') return "Bespoke Informational Alerts";
    if (cat === 'typography') return "Editorial Typography Scaling";
    if (cat === 'spacing') return "Layout Spacing Matrices";
    return "";
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1F1F1F]">
      
      {/* Top Header Control Bar with Quick Link Back */}
      <div className="bg-[#FAF9F6] border-b border-[#EBEAE4] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3E5C4B] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-[#F8F7F4]" />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono text-[#C8A97E] uppercase block tracking-wider font-bold">Linear + Notion Aesthetics</span>
              <h1 className="font-serif text-base font-bold text-[#1F1F1F] leading-tight">ScribeStone System Design</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('dashboard')}
              className="bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4] rounded-lg px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-[#3E5C4B]" />
              Return To Workspace Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Verification Feed */}
      {mockNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B251F] text-white border border-[#C8A97E]/30 rounded-xl px-4.5 py-3 shadow-lg flex items-center gap-2.5 text-xs font-mono animate-soft-fade">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mockNotification}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="bg-[#EFEDE6]/40 border-b border-[#EBEAE4] px-6 py-12 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-[#3E5C4B]/10 px-2.5 py-1 rounded-full font-bold">
              🌿 Neutral Earthy Palette Configured
            </span>
            <h2 className="font-serif text-3xl font-regular tracking-tight text-[#1F1F1F]">
              Micro-SaaS Reusable Elements
            </h2>
            <p className="text-xs text-[#5C5A52] font-light max-w-2xl leading-relaxed">
              An interactive UI directory combining the structural pixel-perfections of Linear with the clean typographic serenity of Notion. Double-panel widgets enable immediate copy-paste verification of pure CSS variables, classes, and React components.
            </p>
          </div>
          
          <div className="md:col-span-4 bg-white border border-[#EBEAE4] p-4.5 rounded-2xl shadow-2xs space-y-2.5">
            <span className="text-[10px] font-mono text-[#8E8C82] tracking-wider uppercase block">DESIGN SYSTEM SUMMARY</span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-[#FAF9F6] border border-[#F1EFEA] py-2 rounded-xl">
                <span className="text-[18px] font-serif font-bold text-[#3E5C4B]">12</span>
                <span className="block text-[8px] font-mono text-[#8E8C82] uppercase">React UI Primitives</span>
              </div>
              <div className="bg-[#FAF9F6] border border-[#F1EFEA] py-2 rounded-xl">
                <span className="text-[18px] font-serif font-bold text-[#C8A97E]">CSS v4</span>
                <span className="block text-[8px] font-mono text-[#8E8C82] uppercase">Tailwind Engine</span>
              </div>
            </div>
            <p className="text-[9px] text-[#5C5A52] leading-relaxed text-center font-light italic">
              Built using customizable TypeScript React props, custom hooks alignment, and zero arbitrary external CSS imports.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Block */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Section Category Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <span className="block text-[10px] font-mono text-[#8E8C82] tracking-wider uppercase pl-2 mb-2">
              System Components
            </span>

            {[
              { id: 'all', label: 'All Components Showcase', icon: <SlidersHorizontal className="w-3.5 h-3.5 text-[#C8A97E]" /> },
              { id: 'buttons', label: 'Buttons (Action Units)', icon: <Sparkles className="w-3.5 h-3.5 text-[#3E5C4B]" /> },
              { id: 'inputs', label: 'Inputs & Form Elements', icon: <FileText className="w-3.5 h-3.5 text-[#C8A97E]" /> },
              { id: 'cards', label: 'Earthy Modular Cards', icon: <Compass className="w-3.5 h-3.5 text-[#3E5C4B]" /> },
              { id: 'dialogs', label: 'Alert Dialogs & Popovers', icon: <Minimize2 className="w-3.5 h-3.5 text-[#C8A97E]" /> },
              { id: 'tables', label: 'Modern Status Tables', icon: <Filter className="w-3.5 h-3.5 text-[#3E5C4B]" /> },
              { id: 'dropdowns', label: 'Action Dropdown Menus', icon: <ChevronDown className="w-3.5 h-3.5 text-[#8E8C82]" /> },
              { id: 'alerts', label: 'Inline Banners & Alerts', icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" /> },
              { id: 'typography', label: 'Typography Scale', icon: <BookOpen className="w-3.5 h-3.5 text-[#3E5C4B]" /> },
              { id: 'spacing', label: 'Spacing & Border Metrics', icon: <Sliders className="w-3.5 h-3.5 text-[#C8A97E]" /> },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveCategory(nav.id as DesignSystemTab)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between font-serif text-xs font-semibold cursor-pointer ${
                  activeCategory === nav.id
                    ? 'bg-white text-[#3E5C4B] border border-[#3E5C4B]/20 shadow-xs pl-5 font-bold'
                    : 'text-[#5C5A52] hover:bg-[#FAF9F6] hover:text-[#1F1F1F] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {nav.icon}
                  <span>{nav.label}</span>
                </div>
                {activeCategory === nav.id && <ChevronRight className="w-3 h-3 text-[#3E5C4B]" />}
              </button>
            ))}

            <div className="pt-6 border-t border-[#EBEAE4] mt-6">
              <div className="bg-[#EFEDE6]/50 p-4 rounded-xl space-y-2 text-xs font-serif text-[#5C5A52]">
                <h6 className="font-bold text-[#1F1F1F] flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-[#3E5C4B]" />
                  CSS variables block
                </h6>
                <p className="text-[10px] leading-relaxed font-light">
                  Tailwind v4 theme elements are mapped to semantic variables in `index.css`. All colors and display typography dynamically scale.
                </p>
              </div>
            </div>
          </div>

          {/* Core Interactive Showcase Panel */}
          <div className="lg:col-span-9 space-y-8 text-left">
            
            {/* Active Tab State Header */}
            <div className="border-b border-[#EBEAE4] pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1F1F]">
                  {getTabLabel(activeCategory)}
                </h3>
                <p className="text-xs text-[#5C5A52] font-light mt-0.5">
                  Browse custom markup structures, verify design settings, or preview interactive hover states.
                </p>
              </div>
              <span className="text-[9px] font-mono bg-white border border-[#EBEAE4] px-2.5 py-1 rounded-lg text-stone-500 uppercase tracking-widest font-semibold font-mono">
                ScribeStone v2 UI
              </span>
            </div>

            {/* 1. BUTTONS CATEGORY METRICS */}
            {(activeCategory === 'all' || activeCategory === 'buttons') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                {/* Visual Header */}
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C8A97E]" />
                    Buttons & Action Units
                  </span>
                  
                  {/* View Controls */}
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('buttons')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['buttons'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(buttonCode, 'buttons')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                      title="Copy reusable React code"
                    >
                      {copiedSnippet === 'buttons' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Sub Panel Display (Interactive Preview OR TSX Code) */}
                {activeCodeTab['buttons'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {buttonCode}
                  </pre>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Visual Button Playground Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="space-y-2 border border-[#FAF9F6] p-4 rounded-xl bg-[#FAF9F6]/40">
                        <span className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-2">Variant Styles</span>
                        <div className="flex flex-col gap-2.5">
                          <button 
                            onClick={() => triggerNotification("Clicked Primary Button")}
                            className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white border border-transparent font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center active:scale-[0.98]"
                          >
                            Primary Core (Green)
                          </button>
                          
                          <button 
                            onClick={() => triggerNotification("Clicked Secondary Button")}
                            className="bg-[#F3F1ED] hover:bg-[#EBEAE4] text-[#1F1F1F] border border-[#E5E3DC] font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center active:scale-[0.98]"
                          >
                            Secondary Subtle
                          </button>

                          <button 
                            onClick={() => triggerNotification("Clicked Outline Button")}
                            className="bg-white hover:bg-[#FAF9F6] text-[#5C5A52] hover:text-[#1F1F1F] border border-[#EBEAE4] hover:border-[#1F1F1F] font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center"
                          >
                            Outline Neutral
                          </button>

                          <button 
                            onClick={() => triggerNotification("Clicked Accent Button")}
                            className="bg-[#C8A97E] hover:bg-[#B8996E] text-white border border-transparent font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center shadow-xs active:scale-[0.98]"
                          >
                            Gold Accent Brand
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 border border-[#FAF9F6] p-4 rounded-xl bg-[#FAF9F6]/40">
                        <span className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-2">State Triggers</span>
                        <div className="flex flex-col gap-2.5">
                          <button 
                            onClick={() => {
                              setIsLoadingButton(true);
                              setTimeout(() => {
                                setIsLoadingButton(false);
                                triggerNotification("Completed asynchronous task sync!");
                              }, 2000);
                            }}
                            className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white border border-transparent font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center flex items-center justify-center gap-1.5"
                          >
                            {isLoadingButton ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A97E]" />
                                processing...
                              </>
                            ) : (
                              "Click to test loading"
                            )}
                          </button>

                          <button 
                            disabled 
                            className="bg-[#3E5C4B] text-white border border-transparent font-medium rounded-xl px-4 py-2.5 text-xs opacity-50 cursor-not-allowed text-center"
                          >
                            Disabled State
                          </button>

                          <button 
                            onClick={() => triggerNotification("Triggered warning action deletion!")}
                            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 hover:border-red-300 font-medium rounded-xl transition-all duration-200 cursor-pointer px-4 py-2.5 text-xs text-center"
                          >
                            Destructive Action Indicator
                          </button>

                          <button 
                            onClick={() => triggerNotification("Clicked Ghost Action")}
                            className="text-[#5C5A52] hover:text-[#1F1F1F] bg-transparent hover:bg-stone-50 font-medium rounded-xl transition-all duration-200 px-4 py-2.5 text-xs text-center border border-dashed border-[#EBEAE4] hover:border-stone-400"
                          >
                            Ghost Accent Dotted
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 border border-[#FAF9F6] p-4 rounded-xl bg-[#FAF9F6]/40 text-xs">
                        <span className="block text-[10px] font-mono text-[#8E8C82] uppercase mb-2">Size Hierarchy</span>
                        <div className="space-y-2.5 flex flex-col items-center justify-center h-full pb-6">
                          <button 
                            onClick={() => triggerNotification("Small Action Completed")}
                            className="bg-[#304B3D] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-mono font-bold tracking-widest uppercase cursor-pointer hover:bg-[#1F1F1F] transition-colors"
                          >
                            SM TACTICAL BUTTON
                          </button>

                          <button 
                            onClick={() => triggerNotification("Standard Workspace Selection")}
                            className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white font-serif font-semibold rounded-xl text-xs px-4 py-2.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            MD Standard (Serif Text)
                          </button>

                          <button 
                            onClick={() => triggerNotification("Enterprise Premium Tier Selection Initiated")}
                            className="bg-[#C8A97E] hover:bg-[#B8996E] text-white font-mono font-bold rounded-xl text-xs px-6 py-3.5 tracking-wider uppercase transition-all shadow-md cursor-pointer animate-pulse"
                          >
                            LG HERO PREMIUM BLOCK
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. INPUTS & FORM ELEMENTS */}
            {(activeCategory === 'all' || activeCategory === 'inputs') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <FileText className="w-x.5 h-4 text-[#3E5C4B]" />
                    Form Inputs & Selection Controls
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('inputs')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['inputs'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(inputCode, 'inputs')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                    >
                      {copiedSnippet === 'inputs' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {activeCodeTab['inputs'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {inputCode}
                  </pre>
                ) : (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interactive Fields */}
                      <div className="space-y-4">
                        <span className="block text-[10px] font-mono text-[#8E8C82] uppercase border-b border-[#F1EFEA] pb-1.5">Standard Fields</span>
                        
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                            Workspace Title Ingest
                          </label>
                          <input
                            type="text"
                            placeholder="Enter administrative token label..."
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value);
                              if(e.target.value.length > 0 && e.target.value.length < 4) {
                                setInputError("Label must contain at least 4 descriptive letters.");
                              } else {
                                setInputError("");
                              }
                            }}
                            className={`w-full text-xs font-mono px-4 py-2.5 bg-[#FAF9F6] border rounded-xl focus:bg-white focus:outline-none transition-all duration-200 ${
                              inputError ? 'border-red-300 focus:border-red-500' : 'border-[#EBEAE4] focus:border-[#3E5C4B]'
                            }`}
                          />
                          {inputError && (
                            <span className="text-[10px] text-red-600 font-serif block">{inputError}</span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-left relative">
                          <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                            Internal Search Filter with Icon input
                          </label>
                          <div className="relative">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Query server directory logs..."
                              className="w-full text-xs font-mono pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl focus:bg-white focus:outline-none focus:border-[#3E5C4B]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Textareas, checkboxes, radio selections */}
                      <div className="space-y-4">
                        <span className="block text-[10px] font-mono text-[#8E8C82] uppercase border-b border-[#F1EFEA] pb-1.5">Switches & Rich Controls</span>

                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                            Refinement System Prompt Instruction Matrix
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Instruct AI style directives..."
                            className="w-full text-xs font-mono p-3 bg-[#FAF9F6] border border-[#EBEAE4] rounded-xl focus:bg-white focus:outline-none focus:border-[#3E5C4B] resize-none"
                          />
                        </div>

                        {/* Custom Beige styled alignment check */}
                        <div className="flex items-center gap-3 py-2 text-left bg-[#FAF9F6]/50 border border-[#EFEDE6] p-4 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setCheckboxState(!checkboxState)}
                            className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                              checkboxState ? 'bg-[#3E5C4B] border-transparent' : 'border-[#EBEAE4] bg-white hover:border-[#3E5C4B]'
                            }`}
                          >
                            {checkboxState && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <div>
                            <span className="font-serif text-xs font-bold text-[#1F1F1F] block select-none cursor-pointer" onClick={() => setCheckboxState(!checkboxState)}>
                              Enable Realtime ClamAV Sandbox Scanning
                            </span>
                            <span className="text-[9px] font-mono text-[#8E8C82] block select-none">
                              Performs virus protection scans and sandboxing on uploaded objects.
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. EARTHY MODULAR CARDS */}
            {(activeCategory === 'all' || activeCategory === 'cards') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C8A97E]" />
                    Earthy Notion Cards System
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('cards')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['cards'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(cardCode, 'cards')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                    >
                      {copiedSnippet === 'cards' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {activeCodeTab['cards'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {cardCode}
                  </pre>
                ) : (
                  <div className="p-6 bg-[#FAF9F6]/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Standard Card with beautiful layout */}
                      <div className="bg-white border border-[#EBEAE4] p-6 rounded-2xl shadow-3xs text-left space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-emerald-800 bg-[#3E5C4B]/10 px-2 py-0.5 rounded font-bold">
                            SANDBOX STAGE ACTIVE
                          </span>
                          <span className="text-[10px] font-mono text-[#8E8C82]">ch_19823h1u283h</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-semibold text-[#1F1F1F]">Standard Invoicing Outline</h4>
                          <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed">
                            A traditional high-contrast clean card, combining precise paddings (`p-6`) and soft neutral borders (`#EBEAE4`). Use this for listing table data or setting properties.
                          </p>
                        </div>
                        
                        <div className="pt-3 border-t border-[#F1EFEA] flex justify-between items-center text-xs">
                          <span className="font-mono text-[#8E8C82]">Suprasaab Active Co.</span>
                          <span className="font-bold text-[#3E5C4B]">$499.00 USD</span>
                        </div>
                      </div>

                      {/* Interactive Hover Card inspired by Linear */}
                      <div 
                        onClick={() => triggerNotification("Interacted with Interactive Hover Card")}
                        className="bg-white border border-[#EBEAE4] hover:border-[#3E5C4B] p-6 rounded-2xl shadow-2xs text-left space-y-4 cursor-pointer transition-all duration-200 hover:translate-y-[-2px] group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-[#C8A97E] bg-[#C8A97E]/10 px-2 py-0.5 rounded font-bold uppercase">
                            Linear Mode
                          </span>
                          <span className="text-stone-300 group-hover:text-[#3E5C4B] transition-colors">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif text-sm font-bold text-[#1F1F1F] group-hover:text-[#3E5C4B] transition-colors flex items-center gap-1.5">
                            Linear Aesthetic Interface
                            <MoveRight className="w-3.5 h-3.5 invisible group-hover:visible animate-pulse" />
                          </h4>
                          <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed">
                            Hover, click, or test the responsive triggers of this card. Notice the border color transitions seamlessly to the core premium green (`#3E5C4B`) value.
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#F1EFEA] flex gap-2">
                          <span className="text-[9px] font-mono bg-stone-50 border border-stone-100 rounded p-1 text-stone-500">
                            P-6 padding scale
                          </span>
                          <span className="text-[9px] font-mono bg-stone-50 border border-stone-100 rounded p-1 text-stone-500">
                            Translate-Y active
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MODALS & ALERT DIALOGS */}
            {(activeCategory === 'all' || activeCategory === 'dialogs') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-[#3E5C4B]" />
                    Overlay Dialogs, Popovers & Slide-Overs
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('dialogs')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['dialogs'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(dialogCode, 'dialogs')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                    >
                      {copiedSnippet === 'dialogs' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {activeCodeTab['dialogs'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {dialogCode}
                  </pre>
                ) : (
                  <div className="p-6">
                    <div className="max-w-xl bg-[#FAF9F6] border border-[#EBEAE4] p-6 rounded-2xl text-center space-y-4 mx-auto">
                      <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest uppercase font-bold block">
                        MODAL COMPONENT ENGINE
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-[#1F1F1F]">Overlay Portals Controller</h4>
                      <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed max-w-md mx-auto">
                        In iFrames, dialog overlays are managed safely using local overlay gates. Click the buttons below as triggers to slide, pop, or render interactive modal state modules.
                      </p>

                      <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                        <button
                          onClick={() => setIsDialogOpen(true)}
                          className="bg-[#3E5C4B] hover:bg-[#2F4739] text-white text-xs font-serif font-semibold px-4.5 py-2.5 rounded-xl cursor-pointer shadow-2xs transition-all active:scale-95"
                        >
                          Trigger Center Dialog
                        </button>

                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#EBEAE4] text-xs font-serif font-semibold px-4.5 py-2.5 rounded-xl cursor-pointer shadow-3xs transition-all"
                        >
                          Trigger Slide-Over Modal
                        </button>
                      </div>
                    </div>

                    {/* Interactive Component A: Centered Dialog */}
                    {isDialogOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-[#2B251F]/40 backdrop-blur-xs transition-opacity" onClick={() => setIsDialogOpen(false)} />
                        
                        <div className="bg-white border border-[#EBEAE4] rounded-2xl w-full max-w-sm p-6 relative shadow-lg text-left animate-soft-fade z-10 space-y-4">
                          <div className="border-b border-[#F1EFEA] pb-3">
                            <span className="text-[10px] font-mono text-[#C8A97E] uppercase block">CRITICAL SECURITY ACCESS</span>
                            <h4 className="font-serif text-sm font-bold text-[#1F1F1F]">Revoke Active User S3 Session?</h4>
                          </div>
                          
                          <p className="text-[11px] text-[#5C5A52] font-light leading-relaxed">
                            This action will permanently restrict SarahMitchell's database tokens and invalidate all un-scanned PDF files inside the secure pre-signed AWS S3 bucket.
                          </p>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setIsDialogOpen(false)}
                              className="w-1/2 border border-[#E5E3DC] hover:bg-stone-50 text-stone-500 text-xs py-2 rounded-lg cursor-pointer"
                            >
                              No, Cancel
                            </button>
                            <button
                              onClick={() => {
                                setIsDialogOpen(false);
                                triggerNotification("Successfully revoked AWS S3 user credentials!");
                              }}
                              className="w-1/2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs py-2 rounded-lg font-semibold cursor-pointer"
                            >
                              Yes, Restrict Access
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Component B: Slide-Over Drawer Modal */}
                    {isModalOpen && (
                      <div className="fixed inset-0 z-50 overflow-hidden">
                        <div className="absolute inset-0 bg-[#2B251F]/35 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />
                        
                        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                          <div className="w-screen max-w-xs">
                            <div className="h-full flex flex-col bg-[#FAF9F6] border-l border-[#EBEAE4] shadow-xl text-left animate-soft-fade">
                              <div className="px-5 py-4.5 bg-white border-b border-[#EBEAE4] flex justify-between items-center">
                                <h3 className="font-serif text-xs font-bold text-[#1F1F1F]">System Ingest Hub</h3>
                                <button
                                  onClick={() => setIsModalOpen(false)}
                                  className="text-stone-400 hover:text-[#1F1F1F] p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                              
                              <div className="flex-1 p-5 space-y-4">
                                <span className="text-[9px] font-mono text-[#8E8C82] uppercase tracking-wider block">PREMIUM CONSOLE</span>
                                <p className="text-[11px] text-[#5C5A52] leading-relaxed font-light">
                                  This slide-over drawer is inspired by the command interfaces found in Linear. Outstanding for listing context properties of database columns in detail.
                                </p>

                                <div className="space-y-1 bg-white border border-[#EBEAE4] p-3 rounded-xl text-xs">
                                  <span className="text-[9px] font-mono text-stone-400 uppercase">Current Account User</span>
                                  <span className="block font-bold">suprasaab96@gmail.com</span>
                                </div>

                                <div className="space-y-1 bg-white border border-[#EBEAE4] p-3 rounded-xl text-xs">
                                  <span className="text-[9px] font-mono text-stone-400 uppercase">Clerk Security Auth Level</span>
                                  <span className="block font-bold font-mono text-emerald-800">ADMINISTRATOR</span>
                                </div>
                              </div>

                              <div className="p-4 bg-white border-t border-[#EBEAE4]">
                                <button
                                  onClick={() => {
                                    setIsModalOpen(false);
                                    triggerNotification("Ingest system synchronized!");
                                  }}
                                  className="w-full bg-[#3E5C4B] hover:bg-[#2F4739] text-white py-2 rounded-lg text-xs font-serif font-bold text-center cursor-pointer"
                                >
                                  Authorize Shuttle
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* 5. TABLES */}
            {(activeCategory === 'all' || activeCategory === 'tables') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs animate-soft-fade">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#3E5C4B]" />
                    Sleek Minimal Compact Data Tables
                  </span>
                  <span className="text-[9px] font-mono text-[#8E8C82] font-semibold uppercase">P-4 Table Alignments</span>
                </div>

                <div className="p-6 text-left space-y-4">
                  <p className="text-xs text-[#5C5A52] font-light max-w-2xl">
                    Our status tables feature small `px-4 py-3.5` font alignments, subtle separator division grids, and status badge identifiers mapping Notion table views.
                  </p>

                  <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#EBEAE4] font-mono text-[#8E8C82] text-[10px] uppercase">
                          <th className="p-4 font-semibold">Stripe ID</th>
                          <th className="p-4 font-semibold">User Customer</th>
                          <th className="p-4 font-semibold">Tier Metric</th>
                          <th className="p-4 text-center">Checkout Invoices</th>
                          <th className="p-4 text-center">Action Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1EFEA]">
                        {[
                          { id: 'ch_19823h1u283h', name: 'Alex Holder', email: 'alex.dev@gmail.com', tier: 'pro', value: '$29.00', status: 'PAID' },
                          { id: 'ch_90123h1u283z', name: 'Sarah Mitchell', email: 'sarah.m@designco.io', tier: 'enterprise', value: '$499.00', status: 'PAID' },
                          { id: 'ch_failed823u8', name: 'Entity Scam Company', email: 'unpaid_entity@scam.org', tier: 'pro', value: '$29.00', status: 'FAILED' }
                        ].map((m, idx) => (
                          <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                            <td className="p-4 font-mono font-bold text-stone-700">{m.id}</td>
                            <td className="p-4">
                              <span className="font-serif font-bold text-[#1F1F1F] block">{m.name}</span>
                              <span className="text-[10px] font-mono text-[#8E8C82] block">{m.email}</span>
                            </td>
                            <td className="p-4 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                m.tier === 'enterprise' ? 'bg-indigo-50 text-indigo-900 border border-indigo-100' : 'bg-stone-100 text-stone-600'
                              }`}>
                                {m.tier}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-stone-900">{m.value}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                m.status === 'PAID' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DROPDOWNS */}
            {(activeCategory === 'all' || activeCategory === 'dropdowns') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-[#C8A97E]" />
                    Filter Dropdowns & Input Alignments
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('dropdowns')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['dropdowns'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(dropdownCode, 'dropdowns')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                    >
                      {copiedSnippet === 'dropdowns' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {activeCodeTab['dropdowns'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {dropdownCode}
                  </pre>
                ) : (
                  <div className="p-6">
                    <div className="max-w-md text-left space-y-4">
                      <span className="block text-[10px] font-mono text-[#8E8C82] uppercase">Interactive Select Menu</span>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-[#FAF9F6] border border-[#EBEAE4] px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between text-[#1F1F1F] hover:bg-white focus:border-[#3E5C4B] transition-all"
                        >
                          <span>{dropdownSelection}</span>
                          <ChevronDown className="w-4 h-4 text-[#8E8C82]" />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 z-30 bg-white border border-[#EBEAE4] rounded-xl shadow-md py-1 divide-y divide-[#F1EFEA]">
                            {[
                              { label: 'Platform Administrator', desc: 'Can override billing matrices, toggle features, view telemetry.' },
                              { label: 'Technical Editor', desc: 'Can submit analysis drafts, review grammar scores.' },
                              { label: 'Billing Coordinator', desc: 'Can process refunds, examine checkout transactions.' }
                            ].map((opt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setDropdownSelection(opt.label);
                                  setIsDropdownOpen(false);
                                  triggerNotification(`Updated role filter to: ${opt.label}`);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-[#FAF9F6] text-xs font-serif text-[#1F1F1F] flex items-center justify-between group transition-colors"
                              >
                                <div>
                                  <span className="font-bold text-[#1F1F1F] block">{opt.label}</span>
                                  <span className="text-[9px] font-mono text-[#8E8C82] block mt-0.5">{opt.desc}</span>
                                </div>
                                {dropdownSelection === opt.label && <Check className="w-3.5 h-3.5 text-[#3E5C4B] shrink-0 ml-2" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. ALERTS */}
            {(activeCategory === 'all' || activeCategory === 'alerts') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] flex justify-between items-center">
                  <span className="text-xs font-bold font-serif text-[#1F1F1F] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Bespoke Informational Alerts
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleCodeTab('alerts')}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase cursor-pointer transition-colors ${
                        activeCodeTab['alerts'] === 'code' ? 'bg-[#3E5C4B] text-white' : 'bg-[#EBEAE4] text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Code Snippet
                    </button>
                    <button 
                      onClick={() => copyToClipboard(alertCode, 'alerts')}
                      className="p-1 px-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 cursor-pointer"
                    >
                      {copiedSnippet === 'alerts' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {activeCodeTab['alerts'] === 'code' ? (
                  <pre className="p-5 font-mono text-[10px] text-[#3E5C4B] bg-[#FAF9F6] overflow-x-auto max-h-96 leading-relaxed">
                    {alertCode}
                  </pre>
                ) : (
                  <div className="p-6 space-y-4">
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-l-3 bg-[#F8F7F4] border-stone-200 border-l-[#C8A97E] text-left">
                      <div className="mt-0.5 shrink-0">
                        <Info className="w-4 h-4 text-[#C8A97E]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-serif font-bold text-[#1F1F1F]">System Maintenance Advisory</h5>
                        <p className="text-[11px] text-[#5C5A52] font-light mt-0.5 leading-relaxed">
                          ScribeStone Postgres DB will undergo database index optimizations during the Sunday 02:00 UTC maintenance interval. Read/write API routes may encounter transient latency spikes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl border border-l-3 bg-[#3E5C4B]/5 border-[#3E5C4B]/15 border-l-[#3E5C4B] text-left">
                      <div className="mt-0.5 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#3E5C4B]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-serif font-bold text-[#3E5C4B]">Pre-Signed S3 Transfer Completed Successfully</h5>
                        <p className="text-[11px] text-stone-700 font-light mt-0.5 leading-relaxed">
                          The requested marketing metrics document has been safely processed by ClamAV sandbox, authorized, and stored inside the secure encrypted private storage directory.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl border border-l-3 bg-amber-50/70 border-amber-100 border-l-amber-500 text-left">
                      <div className="mt-0.5 shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <h5 className="text-xs font-serif font-bold text-amber-800">Monthly Usage Quota Nearing Standard Limit</h5>
                        <p className="text-[11px] text-amber-700 font-light mt-0.5 leading-relaxed">
                          Your active ScribeStone workspace has processed 42,900 of the 50,000 allocated word tokens. Upgrade settings to pro/enterprise to prevent API blockages.
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 8. TYPOGRAPHY */}
            {(activeCategory === 'all' || activeCategory === 'typography') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] text-left">
                  <h4 className="text-xs font-bold font-serif text-[#1F1F1F]">Editorial Typography Scaling Scale</h4>
                  <p className="text-[10px] text-[#8E8C82] font-mono uppercase mt-0.5">Classic serif styles paired with space-grotesk tracking</p>
                </div>

                <div className="p-6 text-left space-y-6">
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8E8C82] uppercase">Serif Large Serif Display</span>
                    <h1 className="font-serif text-3xl font-regular text-[#1F1F1F]">
                      "Playfair Display" - Serene & Organic Writing
                    </h1>
                    <p className="text-[10px] font-mono text-stone-400">Class: `font-serif text-3xl` • Intended Usage: Primary article headers, landing page titles</p>
                  </div>

                  <hr className="border-[#F1EFEA]" />

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8E8C82] uppercase">Grotesk Sans Core UI Headings</span>
                    <h2 className="font-sans text-lg font-bold text-[#1F1F1F] tracking-tight">
                      "Inter" Sans-Serif - Maximum Interface Legibility
                    </h2>
                    <p className="text-[10px] font-mono text-stone-400">Class: `font-sans text-lg font-bold` • Intended Usage: Small UI widget titles, properties tags</p>
                  </div>

                  <hr className="border-[#F1EFEA]" />

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8E8C82] uppercase">System Monochrome Developer Logs</span>
                    <p className="font-mono text-xs text-[#3E5C4B] bg-[#FAF9F6] p-3 rounded-xl border border-[#EBEAE4] leading-relaxed">
                      yarn build:server --bundle --sourcemap --platform=node
                    </p>
                    <p className="text-[10px] font-mono text-stone-400">Class: `font-mono text-xs` • Intended Usage: Technical logs, variables values, transaction ID maps</p>
                  </div>

                </div>
              </div>
            )}

            {/* 9. SPACING */}
            {(activeCategory === 'all' || activeCategory === 'spacing') && (
              <div className="border border-[#EBEAE4] rounded-2xl bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-[#FAF9F6] border-b border-[#EBEAE4] text-left">
                  <h4 className="text-xs font-bold font-serif text-[#1F1F1F]">Layout Spacing System Matrices</h4>
                  <p className="text-[10px] text-[#8E8C82] font-mono uppercase mt-0.5">Precise proportional margin alignment guidelines</p>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Spacing Table */}
                  <div className="overflow-x-auto border border-[#EBEAE4] rounded-xl text-left text-xs bg-white">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#EBEAE4] font-mono text-[10px] text-[#8E8C82] uppercase">
                          <th className="p-4">Matrix Scale</th>
                          <th className="p-4">Pixels Equivalent</th>
                          <th className="p-4">Rem Metric</th>
                          <th className="p-4">Visual Scale Indicator</th>
                          <th className="p-4">Standard In-App Assignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1EFEA]">
                        {spacingScale.map((s, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF9F6]/40">
                            <td className="p-4 font-mono font-bold text-[#3E5C4B]">--spacing-{s.name}</td>
                            <td className="p-4 font-mono text-stone-600">{s.pixels}</td>
                            <td className="p-4 font-mono text-stone-600">{s.rem}</td>
                            <td className="p-4">
                              <div className="h-2 rounded bg-[#C8A97E] inline-block" style={{ width: `${Math.max(4, (idx + 1) * 16)}px` }} />
                            </td>
                            <td className="p-4 text-[#5C5A52] font-light text-[11px] italic">{s.usage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Corner boundary scale */}
                  <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#EBEAE4] text-left space-y-3">
                    <span className="text-[10px] font-mono text-[#8E8C82] uppercase block">Corner Rounded Borders Scale</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-[11px]">
                      <div className="bg-white border border-[#EBEAE4] p-4.5 rounded-lg">
                        <span className="block font-bold">rounded-lg</span>
                        <span className="block text-stone-400 text-[10px] mt-1">Action Items, Input boxes (8px)</span>
                      </div>
                      <div className="bg-white border border-[#EBEAE4] p-4.5 rounded-xl">
                        <span className="block font-bold">rounded-xl</span>
                        <span className="block text-stone-400 text-[10px] mt-1">Dropdown cards, alert frames (12px)</span>
                      </div>
                      <div className="bg-white border border-[#EBEAE4] p-4.5 rounded-2xl">
                        <span className="block font-bold">rounded-2xl</span>
                        <span className="block text-stone-400 text-[10px] mt-1">Overlay Modals, outer panels (16px)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
