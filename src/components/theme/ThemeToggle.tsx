import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'header' | 'compact' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'header', 
  className = '' 
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, isBangla } = useLanguage();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700 shadow-sm'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 shadow-sm'
        } ${className}`}
        title={isDark ? (isBangla ? 'উচ্চ-কন্ট্রাস্ট লাইট মোডে পরিবর্তন করুন' : 'Switch to High-Contrast Light Mode') : (isBangla ? 'ডার্ক মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')}
        aria-label={t.themeToggle}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 stroke-[2.2]" />
            <span>{isBangla ? 'লাইট মোড' : 'Light Mode'}</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-700 fill-indigo-700/20 stroke-[2.2]" />
            <span>{isBangla ? 'ডার্ক মোড' : 'Dark Mode'}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs theme-switcher-box ${className}`}>
      <button
        onClick={() => {
          if (!isDark) toggleTheme();
        }}
        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          isDark
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title={isBangla ? 'ডার্ক মোড (বর্তমান)' : 'Dark Mode (Active)'}
        aria-label={t.themeDark}
        aria-pressed={isDark}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">{isBangla ? 'ডার্ক' : 'Dark'}</span>
      </button>

      <button
        onClick={() => {
          if (isDark) toggleTheme();
        }}
        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
          !isDark
            ? 'bg-cyan-500 text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title={isBangla ? 'উচ্চ-কন্ট্রাস্ট লাইট মোড' : 'High-Contrast Light Mode'}
        aria-label={t.themeLight}
        aria-pressed={!isDark}
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">{isBangla ? 'লাইট' : 'Light'}</span>
      </button>
    </div>
  );
};
