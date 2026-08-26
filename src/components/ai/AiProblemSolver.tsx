import React, { useState } from 'react';
import { GravityConstant, PhysicsSolution, PresetProblem } from '../../types';
import { PRESET_PROBLEMS } from '../../utils/physicsExamples';
import { SolutionDisplay } from '../SolutionDisplay';
import { MotionSim } from '../simulators/MotionSim';
import { FreeBodyDiagram } from '../simulators/FreeBodyDiagram';
import { EnergyBarSim } from '../simulators/EnergyBarSim';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Loader2, 
  MessageSquare, 
  Lightbulb, 
  Zap
} from 'lucide-react';

interface AiProblemSolverProps {
  gravity: GravityConstant;
  activeContextQuestion?: string;
}

export const AiProblemSolver: React.FC<AiProblemSolverProps> = ({ gravity }) => {
  const { t, language, isBangla } = useLanguage();
  const [problemText, setProblemText] = useState(
    'A 1200 kg car moving at 20 m/s hits the brakes and skids to a stop over a distance of 40 meters. Assuming constant deceleration, find the friction force exerted by the road on the tires, the coefficient of kinetic friction, and the time required to stop completely.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solution, setSolution] = useState<PhysicsSolution | null>(null);

  // Tutor chat follow-up state
  const [tutorChat, setTutorChat] = useState<{ question: string; answer: string; loading?: boolean }[]>([]);
  const [tutorInput, setTutorInput] = useState('');

  const handleSolve = async (customText?: string) => {
    const textToSolve = customText || problemText;
    if (!textToSolve.trim()) {
      setErrorMsg(isBangla ? 'অনুগ্রহ করে একটি পদার্থবিজ্ঞানের সমস্যা লিখুন।' : 'Please enter a physics problem to solve.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/solve-physics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: textToSolve,
          gravityValue: gravity,
          language: language,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to solve physics problem.');
      }

      const parsed = data.data;
      const formattedSolution: PhysicsSolution = {
        title: parsed.problemSummary ? `${parsed.category || (isBangla ? 'পদার্থবিজ্ঞান' : 'Physics')} ${isBangla ? 'সমাধান' : 'Math Solution'}` : (isBangla ? 'পদার্থবিজ্ঞানের ধাপে ধাপে গাণিতিক প্রতিপাদন' : 'Physics Step-by-Step Derivation'),
        category: parsed.category || (isBangla ? 'পদার্থবিজ্ঞান' : 'Physics'),
        problemSummary: parsed.problemSummary,
        givens: parsed.givens.map((g: any) => ({
          symbol: g.symbol,
          name: g.name,
          value: g.siValue || g.originalValue,
          unit: g.unit,
          conversionNote: g.conversionNote,
        })),
        unknowns: parsed.unknowns || [],
        principlesUsed: parsed.principlesUsed || [],
        keyFormulasLatex: parsed.keyFormulasLatex || [],
        steps: parsed.steps || [],
        finalAnswers: parsed.finalAnswers || [],
        sanityCheck: parsed.sanityCheck || (isBangla ? 'হিসাবকৃত ফলাফল ও এককসমূহ পদার্থবিজ্ঞানের নিয়ম অনুযায়ী যৌক্তিক।' : 'The calculated magnitude and units correspond to standard physical bounds.'),
        commonPitfalls: parsed.commonPitfalls || [isBangla ? 'স্থানাঙ্ক ব্যবস্থার দিক এবং এসআই মূল একক ব্যবহারে সতর্ক থাকুন।' : 'Remember to double check coordinate directions and SI standard units.'],
        simConfig: parsed.suggestedSimulator,
      };

      setSolution(formattedSolution);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isBangla ? 'পদার্থবিজ্ঞান ইঞ্জিনের সাথে সংযোগে সমস্যা হয়েছে।' : 'Error communicating with AI physics engine.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskTutor = async (questionText: string) => {
    if (!questionText.trim()) return;

    const newEntry = { question: questionText, answer: '', loading: true };
    setTutorChat((prev) => [...prev, newEntry]);
    setTutorInput('');

    try {
      const response = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          language: language,
          contextProblem: solution ? `${solution.problemSummary}. Final answers: ${solution.finalAnswers.map(a => `${a.quantity}=${a.value}${a.unit}`).join(', ')}` : problemText,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get answer from tutor.');
      }

      setTutorChat((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1 ? { ...item, answer: data.answer, loading: false } : item
        )
      );
    } catch (err: any) {
      setTutorChat((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1
            ? { ...item, answer: `⚠️ ${err.message || (isBangla ? 'টিউটর বর্তমানে উত্তর দিতে পারছে না।' : 'Tutor unavailable at the moment.')}`, loading: false }
            : item
        )
      );
    }
  };

  const handleLoadPreset = (preset: PresetProblem) => {
    const text = isBangla && preset.problemTextBn ? preset.problemTextBn : preset.problemText;
    setProblemText(text);
    handleSolve(text);
  };

  return (
    <div className="space-y-6">
      {/* Preset Problem Library */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t.curriculumExamplesTitle}</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {t.curriculumExamplesSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_PROBLEMS.slice(0, 4).map((p) => {
            const title = isBangla && p.titleBn ? p.titleBn : p.title;
            const subtopic = isBangla && p.subtopicBn ? p.subtopicBn : p.subtopic;
            const text = isBangla && p.problemTextBn ? p.problemTextBn : p.problemText;

            return (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition group flex flex-col justify-between space-y-2 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono truncate">
                      {subtopic}
                    </span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                      {p.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                    {title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Problem Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t.aiSolverTitle}
            </h3>
          </div>
          <div className="text-xs text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            g = {gravity} m/s²
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-semibold text-rose-200">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  {isBangla 
                    ? 'অনুরোধটি পুনরায় চেষ্টা করতে ডানপাশের বাটনে ক্লিক করুন অথবা উপরের ট্যাবগুলো থেকে তাৎক্ষণিক অফলাইন সলভার ব্যবহার করুন।'
                    : 'Click Retry below to attempt again or switch to the dedicated Motion, Force, or Energy solvers.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSolve()}
              disabled={isLoading}
              className="self-start sm:self-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer shadow"
            >
              {isBangla ? 'আবার চেষ্টা করুন (Retry)' : 'Retry Now'}
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {t.inputProblemLabel}
          </label>
          <textarea
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder={t.inputProblemPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition leading-relaxed resize-y font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{t.allUnitsSupportedNote}</span>
          </div>

          <button
            onClick={() => handleSolve()}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.solvingButton}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{t.solveButton}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Interactive Visual Simulator */}
      {solution && solution.simConfig && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{t.interactiveSimulatorTitle}</span>
          </div>
          {solution.simConfig.type === 'projectile' || solution.simConfig.type === 'motion' ? (
            <MotionSim
              initialVelocity={solution.simConfig.initialVelocity || 20}
              acceleration={solution.simConfig.acceleration || 0}
              angleDeg={solution.simConfig.angleDeg || 35}
              initialHeight={solution.simConfig.height || 0}
              gravity={gravity}
              simType={solution.simConfig.type === 'projectile' ? 'projectile' : '1d'}
            />
          ) : solution.simConfig.type === 'energy_rollercoaster' ? (
            <EnergyBarSim
              mass={solution.simConfig.mass || 10}
              initialHeight={solution.simConfig.height || 25}
              initialSpeed={solution.simConfig.initialVelocity || 0}
              gravity={gravity}
            />
          ) : (
            <FreeBodyDiagram
              mass={solution.simConfig.mass || 10}
              appliedForce={solution.simConfig.appliedForce || 50}
              angleDeg={solution.simConfig.angleDeg || 25}
              frictionCoeff={solution.simConfig.frictionCoeff || 0.2}
              gravity={gravity}
            />
          )}
        </div>
      )}

      {/* Generated Solution Display */}
      {solution && (
        <SolutionDisplay
          solution={solution}
          onAskTutor={(q) => handleAskTutor(q)}
          gravity={gravity}
        />
      )}

      {/* Follow-up AI Tutor Chat Threads */}
      {tutorChat.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {t.tutorTitle}
            </h3>
          </div>

          <div className="space-y-4">
            {tutorChat.map((chat, idx) => (
              <div key={idx} className="space-y-2 text-xs sm:text-sm">
                {/* Student Question */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 rounded-2xl rounded-tr-sm p-3 max-w-xl">
                    <div className="text-[10px] font-bold text-cyan-400 mb-0.5">{t.yourQuestion}</div>
                    <p>{chat.question}</p>
                  </div>
                </div>

                {/* Tutor Answer */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0 text-xs mt-1">
                    👨‍🏫
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-sm p-3.5 max-w-2xl text-slate-200 leading-relaxed space-y-2">
                    <div className="text-[10px] font-bold text-indigo-400">{t.tutorAnswerBadge}</div>
                    {chat.loading ? (
                      <div className="flex items-center gap-2 text-slate-400 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>{t.tutorThinking}</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-line text-slate-300 text-xs sm:text-sm">
                        {chat.answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Input Bar */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tutorInput.trim()) {
                  handleAskTutor(tutorInput);
                }
              }}
              placeholder={t.tutorPlaceholder}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleAskTutor(tutorInput)}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t.tutorSend}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
