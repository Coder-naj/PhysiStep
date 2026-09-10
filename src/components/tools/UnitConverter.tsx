import React, { useState, useMemo } from 'react';
import { 
  UNIT_CATEGORIES, 
  UnitCategoryData, 
  UnitItem, 
  generateDimensionalAnalysis, 
  convertPhysicsUnit 
} from '../../utils/unitConverter';
import { MathView } from '../MathView';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  Search, 
  Activity, 
  Zap, 
  Sliders, 
  Compass, 
  Atom, 
  Hash
} from 'lucide-react';

interface UnitConverterProps {
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const CATEGORY_TRANSLATIONS_BN: Record<string, { name: string; siUnitName: string; description: string }> = {
  speed: {
    name: 'গতি ও দ্রুতি (Speed)',
    siUnitName: 'মিটার প্রতি সেকেন্ড (m/s)',
    description: 'সময়ের সাথে অবস্থানের পরিবর্তনের হার। এসআই একক m/s।'
  },
  energy: {
    name: 'কাজ, শক্তি ও তাপ (Energy)',
    siUnitName: 'জুল (J = N·m)',
    description: 'কাজ করার সামর্থ্য বা তাপীয় শক্তি স্থানান্তর। এসআই একক জুল (Joule)।'
  },
  force: {
    name: 'বল ও ওজন (Force & Weight)',
    siUnitName: 'নিউটন (N = kg·m/s²)',
    description: 'ভর ও ত্বরণের গুণফল। এসআই একক নিউটন।'
  },
  power: {
    name: 'ক্ষমতা (Power)',
    siUnitName: 'ওয়াট (W = J/s)',
    description: 'কাজ করার হার বা শক্তি ব্যবহারের হার।'
  },
  length: {
    name: 'দূরত্ব ও দৈর্ঘ্য (Length)',
    siUnitName: 'মিটার (m)',
    description: 'দৈর্ঘ্য ও সরণের মূল এসআই একক মিটার।'
  },
  mass: {
    name: 'ভর (Mass)',
    siUnitName: 'কিলোগ্রাম (kg)',
    description: 'বস্তুর জড়তা ও পদার্থের পরিমাপ। এসআই একক কেজি।'
  },
  acceleration: {
    name: 'ত্বরণ ও মন্দন (Acceleration)',
    siUnitName: 'মিটার প্রতি সেকেন্ড বর্গ (m/s²)',
    description: 'সময়ের সাথে বেগের পরিবর্তনের হার।'
  },
  pressure: {
    name: 'চাপ (Pressure)',
    siUnitName: 'প্যাসকেল (Pa = N/m²)',
    description: 'প্রতি একক ক্ষেত্রফলে প্রযুক্ত লম্ব বল।'
  },
  angle: {
    name: 'কোণ (Angle)',
    siUnitName: 'রেডিয়ান (rad)',
    description: 'ত্রিকোণমিতিক ও কৌণিক ঘূর্ণন।'
  },
  temperature: {
    name: 'তাপমাত্রা (Temperature)',
    siUnitName: 'কেলভিন (K)',
    description: 'পদার্থের অণুগুলোর গড় গতিশক্তির পরিমাপ।'
  },
};

export const UnitConverter: React.FC<UnitConverterProps> = ({ initialCategory = 'speed', onCategoryChange }) => {
  const { t, isBangla, formatNumberLocalized } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);

  // Synchronize when initialCategory changes from external navigation
  React.useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategoryId) {
      setSelectedCategoryId(initialCategory);
    }
  }, [initialCategory]);
  const [inputValue, setInputValue] = useState<string>('100');
  const [fromUnitId, setFromUnitId] = useState<string>('km_h');
  const [toUnitId, setToUnitId] = useState<string>('m_s');
  const [precision, setPrecision] = useState<number>(4);
  const [showScientific, setShowScientific] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Current category data
  const currentCategory: UnitCategoryData = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === selectedCategoryId) || UNIT_CATEGORIES[0];
  }, [selectedCategoryId]);

  const categoryDisplayName = useMemo(() => {
    if (isBangla && CATEGORY_TRANSLATIONS_BN[currentCategory.id]) {
      return CATEGORY_TRANSLATIONS_BN[currentCategory.id].name;
    }
    return currentCategory.name;
  }, [isBangla, currentCategory]);

  const categorySiUnitName = useMemo(() => {
    if (isBangla && CATEGORY_TRANSLATIONS_BN[currentCategory.id]) {
      return CATEGORY_TRANSLATIONS_BN[currentCategory.id].siUnitName;
    }
    return currentCategory.siUnitName;
  }, [isBangla, currentCategory]);

  // Handle category change: reset from/to units cleanly to sensible defaults
  const handleCategorySelect = (category: UnitCategoryData) => {
    setSelectedCategoryId(category.id);
    onCategoryChange?.(category.id);
    if (category.units.length >= 2) {
      const baseUnit = category.units.find((u) => u.id === category.baseUnitId) || category.units[0];
      const otherUnit = category.units.find((u) => u.id !== baseUnit.id) || category.units[1];
      setFromUnitId(otherUnit.id);
      setToUnitId(baseUnit.id);
    } else if (category.units.length === 1) {
      setFromUnitId(category.units[0].id);
      setToUnitId(category.units[0].id);
    }
  };

  // Swap From and To units
  const handleSwapUnits = () => {
    const prevFrom = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(prevFrom);
  };

  // Parsed numeric input
  const numericInput = useMemo(() => {
    const val = parseFloat(inputValue);
    return isNaN(val) ? 0 : val;
  }, [inputValue]);

  // Dimensional analysis calculations
  const stepResult = useMemo(() => {
    return generateDimensionalAnalysis(numericInput, fromUnitId, toUnitId, currentCategory);
  }, [numericInput, fromUnitId, toUnitId, currentCategory]);

  // Formatted main converted output
  const formattedOutput = useMemo(() => {
    const val = stepResult.outputValue;
    if (isNaN(val)) return '0';
    if (val === 0) return '0';
    if (showScientific) {
      return val.toExponential(precision);
    }
    if (Math.abs(val) < 1e-4 || Math.abs(val) >= 1e7) {
      return val.toExponential(precision);
    }
    return Number(val.toFixed(precision)).toString();
  }, [stepResult.outputValue, precision, showScientific]);

  // Copy result
  const handleCopyResult = () => {
    const textToCopy = `${inputValue} ${stepResult.fromUnit.symbol} = ${formattedOutput} ${stepResult.toUnit.symbol}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered categories for search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return UNIT_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return UNIT_CATEGORIES.filter((cat) => {
      const bnName = CATEGORY_TRANSLATIONS_BN[cat.id]?.name.toLowerCase() || '';
      return (
        cat.name.toLowerCase().includes(q) ||
        bnName.includes(q) ||
        cat.symbol.toLowerCase().includes(q) ||
        cat.units.some(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.symbol.toLowerCase().includes(q)
        )
      );
    });
  }, [searchQuery]);

  // Dynamic Icon mapper
  const renderCategoryIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Activity':
        return <Activity className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="unit-converter-root">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {t.converterTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {t.converterSubtitle}
            </p>
          </div>

          {/* Search filter for categories / units */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t.searchUnitPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              id="unit-search-input"
            />
          </div>
        </div>

        {/* Category Pills List */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {filteredCategories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const label = isBangla && CATEGORY_TRANSLATIONS_BN[cat.id]
              ? CATEGORY_TRANSLATIONS_BN[cat.id].name
              : cat.name;

            return (
              <button
                key={cat.id}
                id={`category-btn-${cat.id}`}
                onClick={() => handleCategorySelect(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {renderCategoryIcon(cat.iconName, `w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`)}
                <span>{label}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-0.5">({cat.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Problem Presets */}
      {currentCategory.presets && currentCategory.presets.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.highSchoolPresets}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {currentCategory.presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(preset.fromValue.toString());
                  setFromUnitId(preset.fromUnitId);
                  setToUnitId(preset.toUnitId);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-300 hover:text-amber-300 text-xs font-medium whitespace-nowrap transition cursor-pointer"
                title={preset.context}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Converter Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top Bar with SI Info */}
            <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {categoryDisplayName}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  SI Base: <span className="font-mono text-slate-200">{categorySiUnitName}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
                <span>Dim:</span>
                <MathView math={`[${currentCategory.siDimensionLatex}]`} />
              </div>
            </div>

            {/* From & To Converter Fields */}
            <div className="space-y-4">
              {/* Input Value & From Unit */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 focus-within:border-cyan-500/70 transition">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t.fromSourceLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <input
                      type="number"
                      step="any"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter value..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-base sm:text-lg font-mono font-bold text-white placeholder-slate-600 focus:outline-none transition"
                      id="unit-convert-input"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <select
                      value={fromUnitId}
                      onChange={(e) => setFromUnitId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 focus:outline-none transition cursor-pointer"
                      id="unit-select-from"
                    >
                      {currentCategory.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol}) {u.isSiBase ? '★ SI' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {stepResult.fromUnit.description && (
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    {stepResult.fromUnit.description}
                  </p>
                )}
              </div>

              {/* Swap Button Divider */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapUnits}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-cyan-400 transition shadow-lg flex items-center gap-1.5 text-xs font-semibold group cursor-pointer"
                  title="Swap From and To units"
                  id="unit-swap-btn"
                >
                  <ArrowRightLeft className="w-4 h-4 transition group-hover:rotate-180 duration-300" />
                  <span className="hidden sm:inline">{t.swapUnits}</span>
                </button>
              </div>

              {/* Output Result & To Unit */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 focus-within:border-cyan-500/70 transition">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t.toTargetLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6 flex items-center justify-between bg-slate-900 border border-slate-800/90 rounded-lg px-3 py-2 text-base sm:text-lg font-mono font-bold text-cyan-300 overflow-x-auto no-scrollbar">
                    <span id="unit-convert-output">{formattedOutput}</span>
                    <button
                      onClick={handleCopyResult}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2 shrink-0 cursor-pointer"
                      title="Copy result to clipboard"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="sm:col-span-6">
                    <select
                      value={toUnitId}
                      onChange={(e) => setToUnitId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 focus:outline-none transition cursor-pointer"
                      id="unit-select-to"
                    >
                      {currentCategory.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol}) {u.isSiBase ? '★ SI' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {stepResult.toUnit.description && (
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    {stepResult.toUnit.description}
                  </p>
                )}
              </div>
            </div>

            {/* Display & Precision Controls Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>{t.precisionLabel}</span>
                {[2, 4, 6].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrecision(p)}
                    className={`px-2 py-1 rounded-md font-mono text-xs font-semibold transition cursor-pointer ${
                      precision === p && !showScientific
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {formatNumberLocalized(p)} {isBangla ? 'দশমিক' : 'Dec'}
                  </button>
                ))}
                <button
                  onClick={() => setShowScientific(!showScientific)}
                  className={`px-2 py-1 rounded-md font-mono text-xs font-semibold transition cursor-pointer ${
                    showScientific
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.scientificNotationLabel}
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500">
                1 {stepResult.fromUnit.symbol} = {convertPhysicsUnit(1, stepResult.fromUnit.id, stepResult.toUnit.id, currentCategory).toPrecision(4)} {stepResult.toUnit.symbol}
              </div>
            </div>
          </div>

          {/* Step-by-Step Dimensional Analysis Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Hash className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.stepAnalysisTitle}
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                {t.unitsCancellationBadge}
              </span>
            </div>

            <div className="space-y-4">
              {/* KaTeX Proof Equation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-center">
                <MathView math={stepResult.latexDimensionalAnalysis} block />
              </div>

              {/* Direct Formula / Shortcut */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">{t.directCalculation}</span>
                  <div className="font-mono text-cyan-300">
                    <MathView math={stepResult.latexDirectFormula} />
                  </div>
                </div>
                <div className="sm:text-right text-slate-400 text-[11px] max-w-xs font-mono">
                  {stepResult.explanation}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Unit Live Grid & Quick Reference (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Multi-Unit Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.liveEquivalentsTitle}
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {formatNumberLocalized(currentCategory.units.length)} {t.unitsCount}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {t.equivalentOf} <span className="font-mono text-cyan-300 font-bold">{inputValue} {stepResult.fromUnit.symbol}</span>:
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {currentCategory.units.map((unit) => {
                const converted = convertPhysicsUnit(numericInput, fromUnitId, unit.id, currentCategory);
                let displayStr = '';
                if (Math.abs(converted) < 1e-4 || Math.abs(converted) >= 1e7) {
                  displayStr = converted.toExponential(4);
                } else {
                  displayStr = Number(converted.toFixed(4)).toString();
                }

                const isCurrentFrom = unit.id === fromUnitId;
                const isCurrentTo = unit.id === toUnitId;

                return (
                  <div
                    key={unit.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      isCurrentTo
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                        : isCurrentFrom
                        ? 'bg-slate-800/40 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {unit.name}
                        </span>
                        {unit.isSiBase && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            SI
                          </span>
                        )}
                        {isCurrentTo && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            TARGET
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {unit.symbol}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-bold text-slate-200">
                        {displayStr}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <button
                          onClick={() => setToUnitId(unit.id)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                        >
                          {t.setAsTarget}
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => setFromUnitId(unit.id)}
                          className="text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
                        >
                          {t.setAsFrom}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High School Physics Tips & Common Pitfalls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.examTipsTitle}
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  {isBangla ? (
                    <>
                      <strong>গণনা শুরুর আগে এসআই মূল এককে রূপান্তর আবশ্যক:</strong> গতির সমীকরণগুলোতে (<MathView math="v = u + at" /> ও <MathView math="s = ut + \frac{1}{2}at^2" />) সরাসরি মিটার (<MathView math="\text{m}" />) ও সেকেন্ড (<MathView math="\text{s}" />) ব্যবহার করতে হবে, কখনোই কিমি/ঘণ্টা নয়।
                    </>
                  ) : (
                    <>
                      <strong>Always convert to base SI before computing:</strong> Kinematics equations (<MathView math="v = u + at" /> and <MathView math="s = ut + \frac{1}{2}at^2" />) strictly require meters (<MathView math="\text{m}" />) and seconds (<MathView math="\text{s}" />), never km/h.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  {isBangla ? (
                    <>
                      <strong>বেগের ৩.৬ নিয়ম (Rule of 3.6):</strong> <MathView math="\text{km/h} \to \text{m/s}" /> নিতে ৩.৬ দিয়ে <em>ভাগ</em> করুন। আবার <MathView math="\text{m/s} \to \text{km/h}" /> নিতে ৩.৬ দিয়ে <em>গুণ</em> করুন।
                    </>
                  ) : (
                    <>
                      <strong>Rule of 3.6 for Velocity:</strong> To go from <MathView math="\text{km/h} \to \text{m/s}" />, <em>divide</em> by 3.6. To go from <MathView math="\text{m/s} \to \text{km/h}" />, <em>multiply</em> by 3.6.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  {isBangla ? (
                    <>
                      <strong>ক্যালরি ও জুল রূপান্তর:</strong> ১ খাদ্য ক্যালরি (বড় হাতের C) = ১ কিলোক্যালরি = ৪১৮৪ জুল (<MathView math="1\text{ kcal} = 4184\text{ J} = 4.184\text{ kJ}" />)।
                    </>
                  ) : (
                    <>
                      <strong>Calories vs calories:</strong> 1 food Calorie (with uppercase C) is actually 1 kilocalorie (<MathView math="1000\text{ cal} = 4184\text{ J} = 4.184\text{ kJ}" />).
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  {isBangla ? (
                    <>
                      <strong>ভর বনাম ওজন (Mass vs Weight):</strong> কিলোগ্রাম (<MathView math="\text{kg}" />) হলো বস্তুর ভর, আর নিউটন (<MathView math="\text{N}" />) হলো অভিকর্ষজ বল বা ওজন (<MathView math="W = mg" />)।
                    </>
                  ) : (
                    <>
                      <strong>Mass vs Weight:</strong> Kilogram (<MathView math="\text{kg}" />) is mass (matter/inertia), while Newton (<MathView math="\text{N}" />) and pound-force (<MathView math="\text{lbf}" />) are forces (<MathView math="W = mg" />).
                    </>
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
