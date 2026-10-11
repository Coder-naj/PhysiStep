import React from 'react';
import { useRecentTools } from '../../context/RecentToolsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ToolIcon, getCategoryBadgeStyle } from './ToolIcon';
import { History, ChevronRight, Sparkles } from 'lucide-react';

export const RecentlyUsedRibbon: React.FC = () => {
  const { recentTools, triggerNavigate, toggleSidebar } = useRecentTools();
  const { isBangla } = useLanguage();

  if (recentTools.length === 0) return null;

  // Show up to top 6 items in the quick ribbon
  const quickItems = recentTools.slice(0, 6);

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 flex items-center gap-2 overflow-hidden text-xs">
      {/* Label / Indicator */}
      <div 
        onClick={toggleSidebar}
        className="flex items-center gap-1.5 text-cyan-400 font-bold shrink-0 cursor-pointer hover:text-cyan-300 transition select-none"
        title={isBangla ? 'সর্বশেষ ২০টি টুল দেখতে ক্লিক করুন' : 'Click to view all 20 recent tools in sidebar'}
      >
        <History className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-semibold">
          {isBangla ? 'সাম্প্রতিক:' : 'Recent:'}
        </span>
      </div>

      {/* Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
        {quickItems.map((tool) => {
          const style = getCategoryBadgeStyle(tool.categoryEn);
          const title = isBangla ? tool.titleBn : tool.titleEn;

          return (
            <button
              key={tool.id}
              onClick={() => triggerNavigate(tool)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition shrink-0 cursor-pointer text-xs"
              title={`${title} (${tool.categoryEn})`}
            >
              <span className={`w-2 h-2 rounded-full ${style.dot} group-hover:scale-125 transition`} />
              <ToolIcon name={tool.iconName} className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
              <span className="font-medium whitespace-nowrap text-[11px]">
                {title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Open All (20) Sidebar Trigger */}
      <button
        onClick={toggleSidebar}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 shrink-0 border border-transparent hover:border-cyan-500/20 transition cursor-pointer"
        title={isBangla ? 'সব ২০টি টুল সাইডবারে দেখুন' : 'View all 20 recent tools in sidebar'}
      >
        <span className="hidden md:inline">{isBangla ? 'সব দেখুন' : 'View All'}</span>
        <span>({recentTools.length})</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
