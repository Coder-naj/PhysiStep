import React, { useState, useRef, useEffect } from 'react';
import { useRecentTools, formatRelativeTime } from '../../context/RecentToolsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ToolIcon, getCategoryBadgeStyle } from './ToolIcon';
import { MathView } from '../MathView';
import { 
  History, 
  Search, 
  Trash2, 
  ArrowRight, 
  X, 
  ChevronRight, 
  SlidersHorizontal,
  Sparkles,
  PanelRightOpen
} from 'lucide-react';

export const RecentlyUsedHeaderDropdown: React.FC = () => {
  const { 
    recentTools, 
    triggerNavigate, 
    removeRecentTool, 
    clearRecentTools,
    toggleSidebar,
    isDropdownOpen,
    setIsDropdownOpen
  } = useRecentTools();
  
  const { isBangla } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  // Categories present in recent tools
  const categories = ['All', ...Array.from(new Set(recentTools.map(t => isBangla ? t.categoryBn : t.categoryEn)))];

  // Filtered recent tools
  const filteredTools = recentTools.filter((tool) => {
    const title = isBangla ? tool.titleBn : tool.titleEn;
    const category = isBangla ? tool.categoryBn : tool.categoryEn;
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      title.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.toLowerCase().includes(query)) ||
      (tool.formulaLatex && tool.formulaLatex.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Trigger Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
          isDropdownOpen
            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
            : 'bg-slate-900 hover:bg-slate-800/90 text-slate-300 hover:text-white border-slate-800'
        }`}
        title={isBangla ? 'সম্প্রতি ব্যবহৃত ২০টি পদার্থবিজ্ঞান সমাধান টুলস' : 'Recently Accessed Physics Solvers (Last 20)'}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <History className={`w-3.5 h-3.5 ${isDropdownOpen ? 'text-cyan-400' : 'text-cyan-400/90'}`} />
        <span className="hidden md:inline font-medium">
          {isBangla ? 'সম্প্রতি ব্যবহৃত' : 'Recently Used'}
        </span>
        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {recentTools.length}
        </span>
      </button>

      {/* Flyout Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[92vw] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      {isBangla ? 'সম্প্রতি ব্যবহৃত টুলস' : 'Recently Used Solvers'}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {recentTools.length}/20
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBangla ? 'সর্বশেষ অ্যাক্সেস করা ২০টি সমাধানের তালিকা' : 'Last 20 accessed physics solver tools'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {recentTools.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(isBangla ? 'আপনি কি সাম্প্রতিক তালিকা মুছে ফেলতে চান?' : 'Clear all recently used physics tools?')) {
                        clearRecentTools();
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition cursor-pointer"
                    title={isBangla ? 'ইতিহাস মুছে ফেলুন' : 'Clear Recent History'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Search inside Recents */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBangla ? 'টুল বা সূত্র অনুসন্ধান করুন...' : 'Search recent tools, formulas...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            {categories.length > 2 && (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List of Tracked Recent Tools */}
          <div className="overflow-y-auto max-h-[360px] p-2 space-y-1.5 divide-y divide-slate-800/40">
            {filteredTools.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                  <History className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {searchQuery 
                    ? (isBangla ? 'কোন মিল পাওয়া যায়নি' : 'No recent tools match your filter')
                    : (isBangla ? 'কোন সাম্প্রতিক টুল নেই' : 'No recently accessed tools yet')}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {isBangla 
                    ? 'পদার্থবিজ্ঞান সমাধানকারী বা একক রূপান্তরকারী ব্যবহার করলেই তা এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।'
                    : 'Any solver, simulator, quiz, or converter you use will automatically be pinned here.'}
                </p>
              </div>
            ) : (
              filteredTools.map((tool) => {
                const style = getCategoryBadgeStyle(tool.categoryEn);
                const title = isBangla ? tool.titleBn : tool.titleEn;
                const category = isBangla ? tool.categoryBn : tool.categoryEn;

                return (
                  <div
                    key={tool.id}
                    className="pt-1.5 first:pt-0 group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
                    onClick={() => triggerNavigate(tool)}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${style.bg} ${style.text} border ${style.border} shadow-sm mt-0.5`}>
                      <ToolIcon name={tool.iconName} className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition truncate">
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {formatRelativeTime(tool.lastAccessed, isBangla)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${style.bg} ${style.text} border ${style.border}`}>
                          {category}
                        </span>
                        {tool.badgeEn && (
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/50">
                            {isBangla ? (tool.badgeBn || tool.badgeEn) : tool.badgeEn}
                          </span>
                        )}
                      </div>

                      {tool.formulaLatex && (
                        <div className="mt-1 text-[11px] text-slate-300 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80 truncate">
                          <MathView math={tool.formulaLatex} inline />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1 opacity-80 group-hover:opacity-100 shrink-0 self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentTool(tool.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition cursor-pointer"
                        title={isBangla ? 'মুছুন' : 'Remove'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 text-cyan-400 group-hover:translate-x-0.5 transition"
                        title={isBangla ? 'টুল খুলুন' : 'Open tool'}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation to Full Sidebar */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              {recentTools.length} / 20 {isBangla ? 'সংরক্ষিত' : 'saved'}
            </span>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                toggleSidebar();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span>{isBangla ? 'সম্পূর্ণ সাইডবার খুলুন (২০)' : 'Open Full Sidebar (20)'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
