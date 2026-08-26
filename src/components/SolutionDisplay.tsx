import React, { useState } from 'react';
import { PhysicsSolution } from '../types';
import { MathView } from './MathView';
import { useLanguage } from '../i18n/LanguageContext';
import { exportSolutionToPdf } from '../utils/pdfExport';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Lightbulb, 
  BookOpen, 
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileDown,
  Loader2
} from 'lucide-react';

interface SolutionDisplayProps {
  solution: PhysicsSolution;
  onAskTutor?: (question: string) => void;
  gravity?: number;
}

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, onAskTutor, gravity = 9.8 }) => {
  const { t, language, isBangla, formatNumberLocalized } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [customQuestion, setCustomQuestion] = useState('');

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: prev[stepNumber] === undefined ? false : !prev[stepNumber],
    }));
  };

  const handleCopySolution = () => {
    const text = `Physics Solution: ${solution.title}\n` +
      `Summary: ${solution.problemSummary}\n\n` +
      `Givens:\n` +
      solution.givens.map(g => `  - ${g.name} (${g.symbol}) = ${g.value} ${g.unit}`).join('\n') +
      `\n\nFinal Answers:\n` +
      solution.finalAnswers.map(a => `  - ${a.quantity} (${a.symbol}): ${a.value} ${a.unit} - ${a.interpretation}`).join('\n') +
      `\n\nSanity Check: ${solution.sanityCheck}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      exportSolutionToPdf({
        solution,
        language: language as 'en' | 'bn',
        gravity,
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleQuickAsk = (topicText: string) => {
    if (onAskTutor) {
      onAskTutor(topicText);
    }
  };

  return (
    <div id="solution-display-card" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {solution.category || (isBangla ? 'পদার্থবিজ্ঞান' : 'Physics')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {t.derivationTitle}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {solution.title || (isBangla ? 'পদার্থবিজ্ঞানের গাণিতিক সমাধান' : 'Physics Mathematical Solution')}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {solution.problemSummary}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            id="export-pdf-report-btn"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition border border-cyan-500/30 hover:border-cyan-400/50 shadow-sm cursor-pointer disabled:opacity-50"
            title="Download clean, printable PDF report"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : pdfDownloaded ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <FileDown className="w-4 h-4 text-cyan-400" />
            )}
            <span>
              {isExportingPdf
                ? t.exportingPdf
                : pdfDownloaded
                ? t.pdfExported
                : t.exportPdfReport}
            </span>
          </button>

          {/* Copy Plain Text Summary */}
          <button
            onClick={handleCopySolution}
            id="copy-solution-btn"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700 hover:border-slate-600 cursor-pointer"
            title="Copy full text summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copied : t.copySolution}</span>
          </button>
        </div>
      </div>

      {/* Given Quantities & Target Unknowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Givens */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t.givensTitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {solution.givens.map((g, idx) => (
              <div key={idx} className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-xs flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1 text-slate-400 mb-1">
                  <span className="font-medium truncate">{g.name}</span>
                  <span className="font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded text-[11px] border border-cyan-800/40">
                    <MathView math={g.symbol} />
                  </span>
                </div>
                <div className="text-sm font-semibold font-mono text-white">
                  {formatNumberLocalized(g.value)} <span className="text-xs text-slate-400 font-sans font-normal">{g.unit}</span>
                </div>
                {g.conversionNote && (
                  <div className="text-[10px] text-amber-400/90 mt-1 italic">
                    {g.conversionNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Target Unknowns & Physics Principles */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{t.unknownsTitle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {solution.unknowns.map((u, idx) => (
                <div key={idx} className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-mono font-bold">
                    <MathView math={u.symbol} />
                  </span>
                  <span className="text-slate-300 font-medium">{u.name}</span>
                  <span className="text-emerald-300 text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono">
                    [{u.targetUnit}]
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.principlesTitle}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {solution.principlesUsed.map((p, idx) => (
                <span key={idx} className="text-[11px] bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded-md font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Mathematical Derivations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
              Σ
            </span>
            <span>{t.derivationTitle}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {formatNumberLocalized(solution.steps.length)} {t.stepsCount}
          </span>
        </div>

        <div className="space-y-3.5">
          {solution.steps.map((step) => {
            const isCollapsed = expandedSteps[step.stepNumber] === false;
            return (
              <div
                key={step.stepNumber}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 rounded-xl overflow-hidden transition"
              >
                {/* Step Header */}
                <div
                  onClick={() => toggleStep(step.stepNumber)}
                  className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-900/50 cursor-pointer select-none border-b border-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20">
                      {formatNumberLocalized(step.stepNumber)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {step.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-200 p-1"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Step Content */}
                {!isCollapsed && (
                  <div className="p-4 space-y-3.5 text-sm">
                    {/* Explanation */}
                    <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {step.explanation}
                    </p>

                    {/* Formula Box */}
                    {step.formulaLatex && (
                      <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/80 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                          {t.governingEquation}
                        </div>
                        <MathView math={step.formulaLatex} block />
                      </div>
                    )}

                    {/* Algebraic Derivation if available */}
                    {step.algebraicDerivation && step.algebraicDerivation !== step.formulaLatex && (
                      <div className="bg-indigo-950/20 rounded-lg p-2.5 border border-indigo-900/30 text-xs">
                        <span className="font-semibold text-indigo-300 mr-2">{t.algebraicIsolation}</span>
                        <MathView math={step.algebraicDerivation} />
                      </div>
                    )}

                    {/* Substitution Box */}
                    {step.substitutionLatex && (
                      <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-900/40">
                        <div className="text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider mb-1">
                          {t.substitutionWithUnits}
                        </div>
                        <MathView math={step.substitutionLatex} block />
                      </div>
                    )}

                    {/* Intermediate / Final Calculation result */}
                    <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-3.5 py-2.5">
                      <div className="text-xs text-emerald-300 font-medium">
                        {t.stepResults}
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
                        {step.calculatedResult}
                      </div>
                    </div>

                    {/* Quick Clarify Button */}
                    {onAskTutor && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleQuickAsk(
                            isBangla 
                              ? `ধাপ ${step.stepNumber} ("${step.title}")-এ কেন ${step.formulaLatex} সূত্র ব্যবহার করা হয়েছে? এই ধাপের পেছনের পদার্থবিজ্ঞানের ধারণাটি একটু বুঝিয়ে বলো।`
                              : `In Step ${step.stepNumber} ("${step.title}"), why do we use ${step.formulaLatex}? Could you explain the physical intuition behind this step?`
                          )}
                          className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{t.askTutorAboutStep} ({isBangla ? `ধাপ ${formatNumberLocalized(step.stepNumber)}` : `Step ${step.stepNumber}`})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Answers Card */}
      <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {t.finalResults}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {solution.finalAnswers.map((ans, idx) => (
            <div key={idx} className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-xs text-slate-400 font-medium">
                  {ans.quantity}
                </div>
                <div className="text-lg sm:text-xl font-mono font-extrabold text-white mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-emerald-400">{ans.value}</span>
                  <span className="text-xs text-slate-300 font-sans font-normal">{ans.unit}</span>
                </div>
                {ans.scientificNotation && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    ≈ {ans.scientificNotation} {ans.unit}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-300/90 border-t border-slate-800/80 pt-2 leading-relaxed">
                {ans.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Sanity Check & Pitfalls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sanity Check */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-cyan-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>{t.sanityCheckTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {solution.sanityCheck}
          </p>
        </div>

        {/* Common Pitfalls & Exam Traps */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.pitfallsTitle}</span>
          </div>
          <ul className="space-y-1.5">
            {solution.commonPitfalls.map((pitfall, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Tutor Follow-Up Box */}
      {onAskTutor && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.askTutorAboutSolution}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {t.tutorSubtitle}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customQuestion.trim()) {
                  onAskTutor(customQuestion);
                  setCustomQuestion('');
                }
              }}
              placeholder={t.askTutorPlaceholder}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => {
                if (customQuestion.trim()) {
                  onAskTutor(customQuestion);
                  setCustomQuestion('');
                }
              }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition cursor-pointer"
            >
              {t.tutorSend}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
