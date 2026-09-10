import React, { useState, useEffect } from 'react';
import { GravityConstant } from './types';
import { AiProblemSolver } from './components/ai/AiProblemSolver';
import { MotionSolver } from './components/solvers/MotionSolver';
import { ForceSolver } from './components/solvers/ForceSolver';
import { WorkEnergySolver } from './components/solvers/WorkEnergySolver';
import { FormulaCheatSheet } from './components/cheatsheet/FormulaCheatSheet';
import { UnitConverter } from './components/tools/UnitConverter';
import { PhysicsQuiz } from './components/quiz/PhysicsQuiz';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { AndroidModal } from './components/android/AndroidModal';
import { RecentToolsProvider, useRecentTools } from './context/RecentToolsContext';
import { RecentlyUsedHeaderDropdown } from './components/navigation/RecentlyUsedHeaderDropdown';
import { RecentlyUsedSidebar } from './components/navigation/RecentlyUsedSidebar';
import { RecentlyUsedRibbon } from './components/navigation/RecentlyUsedRibbon';
import { TabType, findToolByTabAndSubtopic } from './types/recentTools';
import { 
  Sparkles, 
  Activity, 
  Sliders, 
  Zap, 
  BookOpen, 
  ArrowRightLeft,
  Atom, 
  GraduationCap,
  Languages,
  BrainCircuit,
  Smartphone,
  History
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('ai_solver');
  const [motionSubtopic, setMotionSubtopic] = useState<'1d' | 'projectile' | 'circular'>('1d');
  const [forceMode, setForceMode] = useState<'flat_friction' | 'inclined_plane'>('flat_friction');
  const [energyTopic, setEnergyTopic] = useState<'work' | 'conservation' | 'power'>('conservation');
  const [unitCategory, setUnitCategory] = useState<string>('speed');
  const [cheatsheetTopic, setCheatsheetTopic] = useState<string>('All');

  const [gravity, setGravity] = useState<GravityConstant>(9.8);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const { t, language, setLanguage, isBangla } = useLanguage();
  const { setNavigationHandler, logToolAccess, toggleSidebar, recentTools } = useRecentTools();

  // Register navigation handler so clicks inside Recently Used smoothly activate the target solver & subtopic
  useEffect(() => {
    setNavigationHandler(({ tab, subtopic }) => {
      setActiveTab(tab);
      if (tab === 'motion' && subtopic) {
        setMotionSubtopic(subtopic as '1d' | 'projectile' | 'circular');
      } else if (tab === 'force' && subtopic) {
        setForceMode(subtopic as 'flat_friction' | 'inclined_plane');
      } else if (tab === 'energy' && subtopic) {
        setEnergyTopic(subtopic as 'work' | 'conservation' | 'power');
      } else if (tab === 'unit_converter' && subtopic) {
        setUnitCategory(subtopic);
      } else if (tab === 'cheatsheet' && subtopic) {
        setCheatsheetTopic(subtopic);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [setNavigationHandler]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    let currentSubtopic: string | undefined = undefined;
    if (tabId === 'motion') currentSubtopic = motionSubtopic;
    else if (tabId === 'force') currentSubtopic = forceMode;
    else if (tabId === 'energy') currentSubtopic = energyTopic;
    else if (tabId === 'unit_converter') currentSubtopic = unitCategory;
    else if (tabId === 'cheatsheet') currentSubtopic = cheatsheetTopic;

    const tool = findToolByTabAndSubtopic(tabId, currentSubtopic);
    if (tool) {
      logToolAccess(tool.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30 shrink-0">
              <Atom className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Physi<span className="text-cyan-400">Step</span>
                </span>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                  {isBangla ? 'পদার্থবিজ্ঞান' : 'HS Physics'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Header Controls: Recently Used, Theme Switcher, Language & Gravity */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Recently Used Header Dropdown (Last 20 Accessed Tools) */}
            <RecentlyUsedHeaderDropdown />

            {/* Quick Sidebar Drawer Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition cursor-pointer hidden lg:flex items-center gap-1 text-xs font-semibold"
              title={isBangla ? 'সর্বশেষ ২০টি টুল সাইডবারে খুলুন' : 'Open Recently Used Solvers Sidebar'}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBangla ? 'সাইডবার' : 'Sidebar'}</span>
            </button>

            {/* Theme Toggle (Dark & High-Contrast Light) */}
            <ThemeToggle />

            {/* Language Toggle (Bangla & English) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs shadow-inner">
              <div className="flex items-center gap-1 px-1.5 text-slate-400 hidden sm:flex">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  language === 'bn'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                বাংলা
              </button>
            </div>

            {/* Gravity Selector Quick Pill */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <span className="text-slate-400 px-1.5 font-mono font-medium hidden sm:inline">
                {t.gravityLabel}:
              </span>
              {[9.8, 9.81, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setGravity(val as GravityConstant)}
                  className={`px-2 py-1 rounded-lg font-mono text-xs transition cursor-pointer ${
                    gravity === val
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Set acceleration of gravity to ${val} m/s²`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Android Version & Install Button */}
            <button
              onClick={() => setShowAndroidModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-sm cursor-pointer"
              title={isBangla ? 'অ্যান্ড্রয়েড সংস্করণ ও ইনস্টলেশন' : 'Android App & APK Options'}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isBangla ? 'অ্যান্ড্রয়েড' : 'Android'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (Desktop & Tablet) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-slate-900/60 py-1.5">
          {[
            { id: 'ai_solver', label: t.tabAiSolver, icon: Sparkles, badge: isBangla ? 'স্মার্ট' : 'Smart' },
            { id: 'motion', label: t.tabMotion, icon: Activity },
            { id: 'force', label: t.tabForce, icon: Sliders },
            { id: 'energy', label: t.tabEnergy, icon: Zap },
            { id: 'quiz', label: t.tabQuiz, icon: BrainCircuit, badge: isBangla ? 'টেস্ট' : 'Quiz' },
            { id: 'unit_converter', label: t.tabUnitConverter, icon: ArrowRightLeft, badge: isBangla ? 'টুল' : 'Tools' },
            { id: 'cheatsheet', label: t.tabCheatsheet, icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Horizontal Recently Used Quick Ribbon */}
        <RecentlyUsedRibbon />
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {activeTab === 'ai_solver' && (
          <AiProblemSolver 
            gravity={gravity} 
          />
        )}

        {activeTab === 'motion' && (
          <MotionSolver 
            gravity={gravity} 
            activeSubtopic={motionSubtopic}
            onSubtopicChange={(sub) => {
              setMotionSubtopic(sub);
              logToolAccess(sub === 'projectile' ? 'motion_projectile' : 'motion_1d');
            }}
          />
        )}

        {activeTab === 'force' && (
          <ForceSolver 
            gravity={gravity} 
            activeMode={forceMode}
            onModeChange={(mode) => {
              setForceMode(mode);
              logToolAccess(mode === 'inclined_plane' ? 'force_incline' : 'force_flat');
            }}
          />
        )}

        {activeTab === 'energy' && (
          <WorkEnergySolver 
            gravity={gravity} 
            activeTopic={energyTopic}
            onTopicChange={(topic) => {
              setEnergyTopic(topic);
              logToolAccess(topic === 'work' ? 'energy_work' : topic === 'power' ? 'energy_power' : 'energy_conservation');
            }}
          />
        )}

        {activeTab === 'quiz' && (
          <PhysicsQuiz 
            gravity={gravity} 
          />
        )}

        {activeTab === 'unit_converter' && (
          <UnitConverter 
            initialCategory={unitCategory}
            onCategoryChange={(cat) => {
              setUnitCategory(cat);
              logToolAccess('unit_' + cat);
            }}
          />
        )}

        {activeTab === 'cheatsheet' && (
          <FormulaCheatSheet 
            activeTopic={cheatsheetTopic}
            onTopicChange={(topic) => {
              setCheatsheetTopic(topic);
              if (topic === 'Motion') logToolAccess('cheatsheet_motion');
              else if (topic === 'Force') logToolAccess('cheatsheet_force');
              else if (topic === 'Work & Energy') logToolAccess('cheatsheet_energy');
              else if (topic === 'Power') logToolAccess('cheatsheet_power');
            }}
          />
        )}
      </main>

      {/* Slide-over Recently Used Sidebar Drawer (Holds up to 20 accessed tools) */}
      <RecentlyUsedSidebar />

      {/* Mobile / Android Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl flex md:hidden items-center justify-around px-2 py-2 safe-area-pb">
        {[
          { id: 'ai_solver', label: isBangla ? 'এআই' : 'AI Solver', icon: Sparkles },
          { id: 'motion', label: isBangla ? 'গতি' : 'Motion', icon: Activity },
          { id: 'force', label: isBangla ? 'বল' : 'Force', icon: Sliders },
          { id: 'energy', label: isBangla ? 'শক্তি' : 'Energy', icon: Zap },
          { id: 'quiz', label: isBangla ? 'কুইজ' : 'Quiz', icon: BrainCircuit },
          { id: 'cheatsheet', label: isBangla ? 'সূত্র' : 'Formulas', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[50px] min-h-[44px] cursor-pointer ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 stroke-[2.5]' : 'text-slate-500'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Android Version & Installation Modal */}
      <AndroidModal isOpen={showAndroidModal} onClose={() => setShowAndroidModal(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-slate-500 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">PhysiStep High School Physics Suite</span>
            <span>•</span>
            <span>{isBangla ? 'এইচএসসি, এসএসসি ও এপি ফিজিক্সের জন্য বিশেষায়িত' : 'Covering AP Physics 1, GCSE & High School Curricula'}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>{isBangla ? 'গতিবিদ্যা (SUVAT)' : 'Kinematics (SUVAT)'}</span>
            <span>•</span>
            <span>{isBangla ? 'গতিসূত্র (F=ma)' : 'Dynamics (F=ma)'}</span>
            <span>•</span>
            <span>{isBangla ? 'কাজ ও শক্তি (Ek + Ep)' : 'Work & Energy (Ek + Ep)'}</span>
            <span>•</span>
            <span>{isBangla ? 'একক রূপান্তর' : 'Unit Converter'}</span>
            <span>•</span>
            <span>KaTeX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RecentToolsProvider>
          <AppContent />
        </RecentToolsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
