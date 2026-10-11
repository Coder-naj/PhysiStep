import React, { useState } from 'react';
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
  Clock, 
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';

export const RecentlyUsedSidebar: React.FC = () => {
  const { 
    recentTools, 
    triggerNavigate, 
    removeRecentTool, 
    clearRecentTools,
    isSidebarOpen,
    setIsSidebarOpen 
  } = useRecentTools();

  const { isBangla } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isSidebarOpen) return null;

  // Derive unique categories from tracked tools
  const categories = ['All', ...Array.from(new Set(recentTools.map(t => isBangla ? t.categoryBn : t.categoryEn)))];

  // Filter tools based on search and category
  const filteredTools = recentTools.filter((tool) => {
    const title = isBangla ? tool.titleBn : tool.titleEn;
    const category = isBangla ? tool.categoryBn : tool.categoryEn;
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      title.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.toLowerCase().includes(query)) ||
      (tool.descriptionEn && tool.descriptionEn.toLowerCase().includes(query)) ||
      (tool.formulaLatex && tool.formulaLatex.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-700/80 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-sm">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white">
                    {isBangla ? 'সম্প্রতি ব্যবহৃত পদার্থবিজ্ঞান টুলস' : 'Recently Used Solvers'}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {recentTools.length}/20
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isBangla ? 'আপনার শেষ ২০টি ব্যবহৃত সমাধানকারী ও সমীকরণ' : 'Last 20 accessed physics equations & tools'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              title={isBangla ? 'বন্ধ করুন' : 'Close Sidebar'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'টুল, সমীকরণ বা সূত্র অনুসন্ধান করুন...' : 'Search recent tools, formulas, SUVAT...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 text-sm"
              >
                ×
              </button>
            )}
          </div>

          {/* Category filter pills */}
          {categories.length > 2 && (
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of recent tools */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTools.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">
                {searchQuery 
                  ? (isBangla ? 'কোন সমাধানকারী পাওয়া যায়নি' : 'No tools match your filter')
                  : (isBangla ? 'কোন সাম্প্রতিক টুল নেই' : 'No recently accessed tools')}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {isBangla
                  ? 'গতিবিদ্যা, বলবিদ্যা বা শক্তি সমাধানকারী ব্যবহার করলে এখানে স্বয়ংক্রিয়ভাবে ক্রম অনুসারে প্রদর্শিত হবে।'
                  : 'As you navigate through kinematics, dynamics, energy solvers or converters, your last 20 tools will be tracked here.'}
              </p>
            </div>
          ) : (
            filteredTools.map((tool, index) => {
              const style = getCategoryBadgeStyle(tool.categoryEn);
              const title = isBangla ? tool.titleBn : tool.titleEn;
              const category = isBangla ? tool.categoryBn : tool.categoryEn;
              const description = isBangla ? tool.descriptionBn : tool.descriptionEn;

              return (
                <div
                  key={tool.id}
                  onClick={() => triggerNavigate(tool)}
                  className="group relative bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-3.5 transition cursor-pointer shadow-sm hover:shadow-lg hover:shadow-cyan-500/5"
                >
                  {/* Top line: Index, Category, Time, Delete */}
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                        {category}
                      </span>
                      {tool.badgeEn && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {isBangla ? (tool.badgeBn || tool.badgeEn) : tool.badgeEn}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatRelativeTime(tool.lastAccessed, isBangla)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentTool(tool.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition cursor-pointer"
                        title={isBangla ? 'তালিকা থেকে মুছুন' : 'Remove from recent history'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${style.bg} ${style.text} border ${style.border} shadow-sm`}>
                      <ToolIcon name={tool.iconName} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                        {title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* Formula display */}
                  {tool.formulaLatex && (
                    <div className="mt-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono flex items-center justify-between">
                      <div className="overflow-x-auto no-scrollbar">
                        <MathView math={tool.formulaLatex} inline />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2 group-hover:translate-x-1 transition" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {recentTools.length} of 20 {isBangla ? 'সংরক্ষিত' : 'saved'}
          </div>

          {recentTools.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(isBangla ? 'আপনি কি সাম্প্রতিক সব রেকর্ড মুছে ফেলতে চান?' : 'Clear all recently used physics tools?')) {
                  clearRecentTools();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBangla ? 'ইতিহাস মুছে ফেলুন' : 'Clear All History'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
