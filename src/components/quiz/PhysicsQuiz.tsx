import React, { useState, useEffect, useRef } from 'react';
import { GravityConstant } from '../../types';
import { 
  QuizTopic, 
  QuizDifficulty, 
  QuizQuestion, 
  QuizValidationResult, 
  generateRandomQuestion, 
  validateQuizAnswer 
} from '../../utils/quizEngine';
import { MathView } from '../MathView';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  BrainCircuit, 
  Sparkles, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Lightbulb, 
  Target, 
  Clock, 
  Layers,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface PhysicsQuizProps {
  gravity: GravityConstant;
}

export const PhysicsQuiz: React.FC<PhysicsQuizProps> = ({ gravity }) => {
  const { t, isBangla } = useLanguage();

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('all');
  
  // Current question & state
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userNumericalInput, setUserNumericalInput] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<QuizValidationResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showDerivation, setShowDerivation] = useState<boolean>(false);

  // Gamification & Session Stats
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset question
  const loadNewQuestion = (topic = selectedTopic, diff = selectedDifficulty) => {
    const q = generateRandomQuestion(topic, diff, gravity);
    setCurrentQuestion(q);
    setUserNumericalInput('');
    setSelectedOptionId(null);
    setValidationResult(null);
    setShowHint(false);
    setShowDerivation(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Initial load
  useEffect(() => {
    loadNewQuestion(selectedTopic, selectedDifficulty);
  }, [gravity]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !validationResult) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, validationResult]);

  // Handle topic change
  const handleTopicChange = (topic: QuizTopic) => {
    setSelectedTopic(topic);
    loadNewQuestion(topic, selectedDifficulty);
  };

  // Handle difficulty change
  const handleDifficultyChange = (diff: QuizDifficulty) => {
    setSelectedDifficulty(diff);
    loadNewQuestion(selectedTopic, diff);
  };

  // Submit & Validate Answer
  const handleCheckAnswer = (answerOverride?: number | string) => {
    if (!currentQuestion || validationResult) return;

    let inputToValidate: string | number = userNumericalInput;
    if (answerOverride !== undefined) {
      inputToValidate = answerOverride;
    } else if (currentQuestion.type === 'multiple_choice' && selectedOptionId) {
      const opt = currentQuestion.options?.find((o) => o.id === selectedOptionId);
      if (opt) inputToValidate = opt.value;
    }

    const result = validateQuizAnswer(currentQuestion, inputToValidate);
    setValidationResult(result);
    setIsTimerRunning(false);

    setTotalAnswered((prev) => prev + 1);

    if (result.isCorrect) {
      const pointsEarned = showHint ? 5 : 10;
      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  // Handle Key Down in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (validationResult) {
        loadNewQuestion();
      } else {
        handleCheckAnswer();
      }
    }
  };

  // Reset Session
  const handleResetStats = () => {
    setStreak(0);
    setBestStreak(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setScore(0);
    loadNewQuestion();
  };

  if (!currentQuestion) return null;

  const accuracyRate = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;

  const topicsList: { key: QuizTopic; label: string; labelBn: string }[] = [
    { key: 'All', label: 'All Topics', labelBn: 'সকল বিষয়' },
    { key: 'Motion', label: 'Motion & Kinematics', labelBn: 'গতিবিদ্যা' },
    { key: 'Force', label: 'Forces & Dynamics', labelBn: 'বলবিদ্যা' },
    { key: 'Work & Energy', label: 'Work & Energy', labelBn: 'কাজ ও শক্তি' },
    { key: 'Power', label: 'Power & Efficiency', labelBn: 'ক্ষমতা' },
  ];

  const difficultyList: { key: QuizDifficulty; label: string; labelBn: string }[] = [
    { key: 'all', label: 'All Levels', labelBn: 'সকল স্তর' },
    { key: 'easy', label: 'Level 1: Foundational', labelBn: 'স্তর ১: মৌলিক' },
    { key: 'medium', label: 'Level 2: Standard', labelBn: 'স্তর ২: মধ্যম' },
    { key: 'hard', label: 'Level 3: Challenger', labelBn: 'স্তর ৩: উচ্চতর' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Gamification Scoreboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{isBangla ? 'পদার্থবিজ্ঞান প্র্যাকটিস কুইজ ও সেলফ-টেস্ট' : 'Physics Practice Quiz & Self-Test'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  {isBangla ? 'রিয়েল-টাইম মূল্যায়ন' : 'Real-time Validation'}
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {isBangla
                ? 'সূত্র লাইব্রেরি থেকে স্বয়ংক্রিয়ভাবে তৈরি হওয়া বিভিন্ন গাণিতিক সমস্যার উত্তর দিন এবং রিয়েল-টাইমে যাচাই করুন।'
                : 'Master core physics equations with dynamically generated questions and instant mathematical validation.'}
            </p>
          </div>

          {/* Gamification Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* Score */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBangla ? 'স্কোর' : 'Score'}</div>
                <div className="text-base sm:text-lg font-mono font-bold text-amber-300">{score} pts</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${streak > 0 ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 animate-pulse' : 'bg-slate-800 text-slate-500'} border flex items-center justify-center shrink-0`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBangla ? 'ধারাবাহিকতা' : 'Streak'}</div>
                <div className="text-base sm:text-lg font-mono font-bold text-orange-400 flex items-center gap-1">
                  <span>{streak}</span>
                  {streak > 2 && <span className="text-xs">🔥</span>}
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBangla ? 'নির্ভুলতা' : 'Accuracy'}</div>
                <div className="text-base sm:text-lg font-mono font-bold text-cyan-300">{accuracyRate}%</div>
              </div>
            </div>

            {/* Questions Answered */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{isBangla ? 'সমাধান' : 'Solved'}</div>
                <div className="text-base sm:text-lg font-mono font-bold text-emerald-300">{correctCount}/{totalAnswered}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Topic Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">
              {isBangla ? 'বিষয়:' : 'Topic:'}
            </span>
            {topicsList.map((tItem) => (
              <button
                key={tItem.key}
                onClick={() => handleTopicChange(tItem.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedTopic === tItem.key
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isBangla ? tItem.labelBn : tItem.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-1.5 text-[11px] font-medium hidden md:inline">
                {isBangla ? 'স্তর:' : 'Level:'}
              </span>
              {difficultyList.map((d) => (
                <button
                  key={d.key}
                  onClick={() => handleDifficultyChange(d.key)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    selectedDifficulty === d.key
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isBangla ? d.labelBn.split(':')[0] : d.label.split(':')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetStats}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs border border-slate-700 cursor-pointer"
              title={isBangla ? 'পরিসংখ্যান রিসেট করুন' : 'Reset Session Stats'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Question Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold">
              {isBangla ? currentQuestion.topicBn : currentQuestion.topic}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
              currentQuestion.difficulty === 'easy'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                : currentQuestion.difficulty === 'medium'
                ? 'bg-sky-950/60 text-sky-300 border-sky-800/50'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timerSeconds}s</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>g = {gravity} m/s²</span>
          </div>
        </div>

        {/* Problem Title & Text Prompt */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {isBangla ? currentQuestion.titleBn : currentQuestion.title}
          </h3>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            {isBangla ? currentQuestion.questionTextBn : currentQuestion.questionText}
          </div>
        </div>

        {/* Givens & Target Quantities Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">
            {isBangla ? 'প্রদত্ত রাশিসমূহ:' : 'Given Parameters:'}
          </span>
          {currentQuestion.givens.map((g, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800/90 px-2.5 py-1 rounded-lg text-xs font-mono"
            >
              <span className="text-cyan-400 font-bold">{g.symbol}</span>
              <span className="text-slate-500">=</span>
              <span className="text-slate-200 font-semibold">{g.value}</span>
              {g.unit && <span className="text-slate-400">{g.unit}</span>}
            </div>
          ))}

          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1 rounded-lg text-xs font-mono text-cyan-300 ml-auto">
            <span className="font-bold">{isBangla ? 'নির্ণেয় মান:' : 'Target:'}</span>
            <span className="font-semibold">{currentQuestion.targetSymbol}</span>
            <span>[{currentQuestion.targetUnit}]</span>
          </div>
        </div>

        {/* Interactive Answer Input Form */}
        <div className="pt-2">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
            /* Multiple Choice Mode */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                {isBangla ? 'সঠিক বিকল্পটি নির্বাচন করুন:' : 'Select the correct mathematical result:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOptionId === opt.id;
                  const optLetter = String.fromCharCode(65 + i);

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900';
                  if (isSelected && !validationResult) {
                    btnStyle = 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10';
                  } else if (validationResult) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !opt.isCorrect) {
                      btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={!!validationResult}
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        if (!validationResult) {
                          handleCheckAnswer(opt.value);
                        }
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border font-mono text-sm font-semibold transition cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-cyan-400 font-bold shrink-0">
                          {optLetter}
                        </span>
                        <span>{isBangla ? opt.textBn : opt.text}</span>
                      </div>
                      {validationResult && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {validationResult && isSelected && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Direct Numerical Input Mode */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                {isBangla
                  ? `আপনার হিসাবকৃত উত্তর লিখুন (${currentQuestion.targetUnit} এককে):`
                  : `Enter your calculated numerical result (in ${currentQuestion.targetUnit}):`}
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    disabled={!!validationResult}
                    value={userNumericalInput}
                    onChange={(e) => setUserNumericalInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isBangla ? 'যেমন: 24.5' : 'e.g., 24.5 (Enter numerical value)'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base sm:text-lg font-mono font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-70"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    {currentQuestion.targetUnit}
                  </div>
                </div>

                {!validationResult ? (
                  <button
                    onClick={() => handleCheckAnswer()}
                    disabled={!userNumericalInput.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isBangla ? 'উত্তর যাচাই করুন' : 'Check Answer'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => loadNewQuestion()}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>{isBangla ? 'পরবর্তী প্রশ্ন' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Validation Feedback Alert Banner */}
        {validationResult && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            validationResult.status === 'correct'
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
              : validationResult.status === 'close'
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
              : 'bg-red-950/70 border-red-500/60 text-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {validationResult.status === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : validationResult.status === 'close' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isBangla ? validationResult.feedbackMessageBn : validationResult.feedbackMessage}
                </p>
                {validationResult.status !== 'correct' && (
                  <p className="text-xs text-slate-400 mt-1">
                    {isBangla
                      ? `প্রত্যাশিত নির্ভুল মান: ${currentQuestion.correctAnswer} ${currentQuestion.targetUnit} (সহনশীলতা ±${currentQuestion.tolerancePercent}%)`
                      : `Target exact value: ${currentQuestion.correctAnswer} ${currentQuestion.targetUnit} (Tolerance ±${currentQuestion.tolerancePercent}%)`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setShowDerivation(!showDerivation)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition text-slate-300 cursor-pointer flex items-center gap-1.5"
              >
                <span>{isBangla ? 'প্রতিপাদন দেখুন' : 'View Derivation'}</span>
                {showDerivation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => loadNewQuestion()}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition cursor-pointer flex items-center gap-1"
              >
                <span>{isBangla ? 'পরবর্তী' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Helper Controls: Hint & Formula Preview */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? (isBangla ? 'ইঙ্গিত লুকান' : 'Hide Hint') : (isBangla ? 'ইঙ্গিত / সূত্র প্রয়োজন?' : 'Need a Hint?')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Formula:
            </span>
            <div className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-xs">
              <MathView math={currentQuestion.formulaLatex} />
            </div>
          </div>
        </div>

        {/* Revealed Hint Box */}
        {showHint && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs sm:text-sm text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>{isBangla ? 'পদার্থবিজ্ঞানের দিকনির্দেশনা ও সূত্র:' : 'Physics Formula Guide & Hint:'}</span>
            </div>
            <p>{isBangla ? currentQuestion.hintBn : currentQuestion.hint}</p>
            <div className="mt-2 p-2 bg-slate-950/80 rounded border border-amber-500/20 font-mono text-center text-cyan-300">
              <MathView math={currentQuestion.algebraicIsolationLatex || currentQuestion.formulaLatex} displayMode={true} />
            </div>
          </div>
        )}

        {/* Full Step-by-Step Derivation & Examination Pitfalls Breakdown */}
        {showDerivation && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{isBangla ? 'পূর্ণাঙ্গ গাণিতিক প্রতিপাদন:' : 'Full Mathematical Derivation:'}</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Equation: <MathView math={currentQuestion.formulaLatex} />
              </span>
            </div>

            {/* Derivation Text */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3.5 text-slate-300 font-mono whitespace-pre-line leading-relaxed">
              {isBangla ? currentQuestion.explanationBn : currentQuestion.explanation}
            </div>

            {/* Common Examination Pitfalls */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-400">
              <span className="text-amber-400 font-semibold mr-1">
                {isBangla ? 'পরীক্ষার সাধারণ ভুল:' : 'Common Exam Trap:'}
              </span>
              <span>{isBangla ? currentQuestion.commonPitfallBn : currentQuestion.commonPitfall}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
