import React, { useState } from 'react';
import { MathView } from '../MathView';
import { useLanguage } from '../../i18n/LanguageContext';
import { BookOpen, Search, Copy, Check } from 'lucide-react';

interface FormulaCard {
  title: string;
  titleBn: string;
  topic: 'Motion' | 'Force' | 'Work & Energy' | 'Power';
  topicBn: string;
  formulaLatex: string;
  variables: { symbol: string; meaning: string; meaningBn: string; siUnit: string }[];
  whenToUse: string;
  whenToUseBn: string;
  pitfall: string;
  pitfallBn: string;
}

const FORMULA_DATABASE: FormulaCard[] = [
  {
    title: 'Velocity-Time Kinematic Equation',
    titleBn: 'বেগ-সময় গতি সমীকরণ',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 'v = u + at',
    variables: [
      { symbol: 'v', meaning: 'Final Velocity', meaningBn: 'শেষবেগ', siUnit: 'm/s' },
      { symbol: 'u', meaning: 'Initial Velocity', meaningBn: 'আদিবেগ', siUnit: 'm/s' },
      { symbol: 'a', meaning: 'Acceleration (constant)', meaningBn: 'সুষম ত্বরণ', siUnit: 'm/s²' },
      { symbol: 't', meaning: 'Time elapsed', meaningBn: 'অতিবাহিত সময়', siUnit: 's' },
    ],
    whenToUse: 'When acceleration is constant and displacement (s) is unknown or not needed.',
    whenToUseBn: 'যখন ত্বরণ সুষম থাকে এবং সরণ (s) দেওয়া থাকে না বা প্রয়োজন নেই।',
    pitfall: 'Do not use if acceleration varies with time.',
    pitfallBn: 'ত্বরণ সময়ের সাথে পরিবর্তনশীল হলে এই সূত্র প্রযোজ্য নয়।',
  },
  {
    title: 'Displacement-Time Kinematic Equation',
    titleBn: 'সরণ-সময় গতি সমীকরণ',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 's = ut + \\frac{1}{2}at^2',
    variables: [
      { symbol: 's', meaning: 'Displacement', meaningBn: 'সরণ', siUnit: 'm' },
      { symbol: 'u', meaning: 'Initial Velocity', meaningBn: 'আদিবেগ', siUnit: 'm/s' },
      { symbol: 'a', meaning: 'Acceleration', meaningBn: 'ত্বরণ', siUnit: 'm/s²' },
      { symbol: 't', meaning: 'Time duration', meaningBn: 'সময়কাল', siUnit: 's' },
    ],
    whenToUse: 'When you know initial speed and acceleration, finding position over time.',
    whenToUseBn: 'আদিবেগ ও ত্বরণ জানা থাকলে নির্দিষ্ট সময়ে সরণ নির্ণয়ে।',
    pitfall: 'Displacement can be zero if an object returns to its starting point.',
    pitfallBn: 'বস্তু আদি অবস্থানে ফিরে আসলে মোট সরণ শূন্য হয় (দূরত্ব নয়)।',
  },
  {
    title: 'Timeless Kinematic Equation',
    titleBn: 'সময়হীন গতি সমীকরণ (Timeless Equation)',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 'v^2 = u^2 + 2as',
    variables: [
      { symbol: 'v', meaning: 'Final Velocity', meaningBn: 'শেষবেগ', siUnit: 'm/s' },
      { symbol: 'u', meaning: 'Initial Velocity', meaningBn: 'আদিবেগ', siUnit: 'm/s' },
      { symbol: 'a', meaning: 'Acceleration', meaningBn: 'ত্বরণ', siUnit: 'm/s²' },
      { symbol: 's', meaning: 'Displacement / Distance', meaningBn: 'সরণ বা অতিক্রান্ত দূরত্ব', siUnit: 'm' },
    ],
    whenToUse: 'When time (t) is NOT given and NOT asked for (e.g. stopping distance).',
    whenToUseBn: 'যখন সময় (t) দেওয়া নেই এবং নির্ণয়েরও দরকার নেই (যেমন: ব্রেকিং দূরত্ব)।',
    pitfall: 'Remember that deceleration means a is negative; v² - u² must have same sign as 2as.',
    pitfallBn: 'মন্দন হলে ত্বরণ ঋণাত্মক (-a) বসাতে হবে; v² - u² এর চিহ্ন 2as এর সাথে মিলতে হবে।',
  },
  {
    title: 'Projectile Maximum Apex Height',
    titleBn: 'প্রক্ষেপকের সর্বোচ্চ অর্জিত উচ্চতা',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 'H_{max} = y_0 + \\frac{v_0^2\\sin^2\\theta}{2g}',
    variables: [
      { symbol: 'H_{max}', meaning: 'Peak Altitude', meaningBn: 'সর্বোচ্চ উচ্চতা', siUnit: 'm' },
      { symbol: 'v_0', meaning: 'Launch Speed', meaningBn: 'নিক্ষেপণ বেগ', siUnit: 'm/s' },
      { symbol: '\\theta', meaning: 'Launch Angle', meaningBn: 'নিক্ষেপণ কোণ', siUnit: '°' },
      { symbol: 'g', meaning: 'Acceleration of Gravity', meaningBn: 'অভিকর্ষজ ত্বরণ', siUnit: 'm/s²' },
    ],
    whenToUse: 'Finding the highest point of a launched projectile.',
    whenToUseBn: 'নিক্ষিপ্ত কোনো বস্তুর সর্বোচ্চ উচ্চতা নির্ণয়ে।',
    pitfall: 'Square the sine term: (sin θ)², not sin(θ²).',
    pitfallBn: 'ত্রিকোণমিতিক পদের বর্গ করুন: (sin θ)², কখনোই sin(θ²) নয়।',
  },
  {
    title: 'Projectile Horizontal Range (Ground-to-Ground)',
    titleBn: 'প্রক্ষেপকের অনুভূমিক পাল্লা (Range)',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 'R = \\frac{v_0^2\\sin(2\\theta)}{g}',
    variables: [
      { symbol: 'R', meaning: 'Horizontal Range', meaningBn: 'অনুভূমিক পাল্লা', siUnit: 'm' },
      { symbol: 'v_0', meaning: 'Initial Velocity', meaningBn: 'নিক্ষেপণ বেগ', siUnit: 'm/s' },
      { symbol: '\\theta', meaning: 'Launch Angle', meaningBn: 'নিক্ষেপণ কোণ', siUnit: '°' },
      { symbol: 'g', meaning: 'Gravity', meaningBn: 'অভিকর্ষজ ত্বরণ', siUnit: 'm/s²' },
    ],
    whenToUse: 'Only valid when launch height equals landing height (y_final = y_initial).',
    whenToUseBn: 'কেবলমাত্র একই উচ্চতায় নিক্ষেপ ও পতনের ক্ষেত্রে প্রযোজ্য।',
    pitfall: 'Do not use this formula if projectile is launched from a cliff (y0 > 0).',
    pitfallBn: 'উঁচু পাহাড় বা ছাদ থেকে নিক্ষেপ করলে এই সরাসরি সূত্র খাটবে না।',
  },
  {
    title: 'Centripetal Acceleration & Force',
    titleBn: 'কেন্দ্রমুখী ত্বরণ ও কেন্দ্রমুখী বল',
    topic: 'Motion',
    topicBn: 'গতিবিদ্যা',
    formulaLatex: 'a_c = \\frac{v^2}{r} = \\omega^2 r, \\quad F_c = \\frac{mv^2}{r}',
    variables: [
      { symbol: 'a_c', meaning: 'Centripetal Acceleration', meaningBn: 'কেন্দ্রমুখী ত্বরণ', siUnit: 'm/s²' },
      { symbol: 'v', meaning: 'Tangential Speed', meaningBn: 'স্পর্শকীয় দ্রুতি', siUnit: 'm/s' },
      { symbol: 'r', meaning: 'Radius of Circular Path', meaningBn: 'বৃত্তাকার পথের ব্যাসার্ধ', siUnit: 'm' },
      { symbol: 'F_c', meaning: 'Net Inward Centripetal Force', meaningBn: 'কেন্দ্রমুখী বল', siUnit: 'N' },
    ],
    whenToUse: 'For objects in circular motion (satellites, cars turning, swinging ropes).',
    whenToUseBn: 'বৃত্তাকার পথে ঘূর্ণায়মান বস্তুর ক্ষেত্রে (উপগ্রহ, বাঁকে গাড়ি, সুতায় বাঁধা ঢিল)।',
    pitfall: 'Centripetal force is not a new physical force; it is provided by tension, gravity, or friction.',
    pitfallBn: 'কেন্দ্রমুখী বল কোনো নতুন বল নয়; এটি টান, ঘর্ষণ বা মহাকর্ষ বল দ্বারা সরবরাহ হয়।',
  },
  {
    title: "Newton's Second Law of Motion",
    titleBn: 'নিউটনের গতির দ্বিতীয় সূত্র',
    topic: 'Force',
    topicBn: 'বলবিদ্যা',
    formulaLatex: '\\Sigma \\vec{F} = m \\cdot \\vec{a}',
    variables: [
      { symbol: '\\Sigma F', meaning: 'Vector Sum of all external forces', meaningBn: 'লব্ধি বাহ্যিক বল', siUnit: 'N' },
      { symbol: 'm', meaning: 'Mass of object', meaningBn: 'বস্তুর ভর', siUnit: 'kg' },
      { symbol: 'a', meaning: 'Acceleration vector', meaningBn: 'ত্বরণ ভেক্টর', siUnit: 'm/s²' },
    ],
    whenToUse: 'The universal foundational equation relating net force to acceleration.',
    whenToUseBn: 'লব্ধি বল এবং ত্বরিত গতির সম্পর্কযুক্ত মৌলিক সমীকরণ।',
    pitfall: 'Always resolve forces along x and y components separately before applying F = ma.',
    pitfallBn: 'সর্বদা x এবং y অক্ষে বলের উপাংশ পৃথকভাবে বের করে F = ma প্রয়োগ করুন।',
  },
  {
    title: 'Coulomb Friction Laws (Static & Kinetic)',
    titleBn: 'ঘর্ষণ বলের সূত্রাবলী (স্থিতি ও চল ঘর্ষণ)',
    topic: 'Force',
    topicBn: 'বলবিদ্যা',
    formulaLatex: 'f_s \\le \\mu_s N, \\quad f_k = \\mu_k N',
    variables: [
      { symbol: 'f_s', meaning: 'Static Friction', meaningBn: 'স্থিতি ঘর্ষণ বল', siUnit: 'N' },
      { symbol: 'f_k', meaning: 'Kinetic Friction', meaningBn: 'গতীয়/চল ঘর্ষণ বল', siUnit: 'N' },
      { symbol: '\\mu_s, \\mu_k', meaning: 'Friction Coefficients', meaningBn: 'ঘর্ষণ গুণাঙ্ক', siUnit: 'মাত্রাহীন' },
      { symbol: 'N', meaning: 'Normal Force', meaningBn: 'অভিলম্বিক প্রতিক্রিয়া বল', siUnit: 'N' },
    ],
    whenToUse: 'Calculating resistance between dry surfaces in contact.',
    whenToUseBn: 'স্পর্শে থাকা দুটি তলের মধ্যবর্তী ঘর্ষণ বল নির্ণয়ে।',
    pitfall: 'Normal force N does NOT always equal mg (e.g. on inclines or when pulled at an angle).',
    pitfallBn: 'অভিলম্বিক বল N সবসময় mg এর সমান হয় না (আনত তল বা কোণে টানা হলে ভিন্ন হয়)।',
  },
  {
    title: 'Inclined Plane Force Breakdown',
    titleBn: 'আনত তলে বলের উপাংশ বিভাজন',
    topic: 'Force',
    topicBn: 'বলবিদ্যা',
    formulaLatex: 'F_\\parallel = mg\\sin\\theta, \\quad F_\\perp = mg\\cos\\theta, \\quad N = mg\\cos\\theta',
    variables: [
      { symbol: 'F_\\parallel', meaning: 'Gravity component down the slope', meaningBn: 'তল বরাবর নিচের দিকে বলের উপাংশ', siUnit: 'N' },
      { symbol: 'F_\\perp', meaning: 'Gravity component into the slope', meaningBn: 'তলের লম্ব উপাংশ', siUnit: 'N' },
      { symbol: '\\theta', meaning: 'Incline Angle', meaningBn: 'আনত কোণ', siUnit: '°' },
    ],
    whenToUse: 'Resolving gravity on ramps, slides, and slopes.',
    whenToUseBn: 'ঢালু তল, রাম্ফ ও আনত তলের গতি বিশ্লেষণে।',
    pitfall: 'Do not confuse sin and cos: sin goes WITH the slope, cos goes INTO the slope.',
    pitfallBn: 'sin এবং cos গুলিয়ে ফেলবেন না: sin উপাংশ ঢাল বরাবর নিচে, cos উপাংশ তলের লম্ব বরাবর।',
  },
  {
    title: 'Mechanical Work Done by Constant Force',
    titleBn: 'ধ্রুব বল দ্বারা কৃতকাজ',
    topic: 'Work & Energy',
    topicBn: 'কাজ ও শক্তি',
    formulaLatex: 'W = \\vec{F} \\cdot \\vec{d} = F \\cdot d \\cdot \\cos\\theta',
    variables: [
      { symbol: 'W', meaning: 'Mechanical Work', meaningBn: 'যান্ত্রিক কৃতকাজ', siUnit: 'J (জুল)' },
      { symbol: 'F', meaning: 'Force magnitude', meaningBn: 'বলের মান', siUnit: 'N' },
      { symbol: 'd', meaning: 'Displacement distance', meaningBn: 'সরণ', siUnit: 'm' },
      { symbol: '\\theta', meaning: 'Angle between Force and displacement', meaningBn: 'বল ও সরণের মধ্যবর্তী কোণ', siUnit: '°' },
    ],
    whenToUse: 'Calculating energy transferred to or from an object by a force.',
    whenToUseBn: 'কোনো বস্তুর উপর প্রযুক্ত বল দ্বারা রূপান্তরিত শক্তি বা কাজ নির্ণয়ে।',
    pitfall: 'If force is perpendicular to motion (θ = 90°), work done is EXACTLY ZERO.',
    pitfallBn: 'বল ও সরণ পরস্পর লম্ব হলে (θ = ৯০°) কৃতকাজ সর্বদা শূন্য হয়।',
  },
  {
    title: 'Kinetic & Gravitational Potential Energy',
    titleBn: 'গতিশক্তি ও মহাকর্ষীয় বিভব শক্তি',
    topic: 'Work & Energy',
    topicBn: 'কাজ ও শক্তি',
    formulaLatex: 'E_k = \\frac{1}{2}mv^2, \\quad E_p = mgh',
    variables: [
      { symbol: 'E_k', meaning: 'Kinetic Energy', meaningBn: 'গতিশক্তি', siUnit: 'J' },
      { symbol: 'E_p', meaning: 'Gravitational Potential Energy', meaningBn: 'মহাকর্ষীয় বিভব শক্তি', siUnit: 'J' },
      { symbol: 'm', meaning: 'Mass', meaningBn: 'ভর', siUnit: 'kg' },
      { symbol: 'v', meaning: 'Speed', meaningBn: 'বেগ', siUnit: 'm/s' },
      { symbol: 'h', meaning: 'Height above reference line', meaningBn: 'নির্দেশ তল থেকে উচ্চতা', siUnit: 'm' },
    ],
    whenToUse: 'State energy calculations for falling, sliding, or rolling objects.',
    whenToUseBn: 'পড়ন্ত, রোলিং বা ত্বরিত বস্তুর তাৎক্ষণিক শক্তি পরিমাপে।',
    pitfall: 'Kinetic energy depends on speed SQUARED (doubling speed quadruples energy!).',
    pitfallBn: 'গতিশক্তি বেগের বর্গের সমানুপাতিক (বেগ দ্বিগুণ হলে গতিশক্তি চারগুণ হয়!)।',
  },
  {
    title: 'Power & Mechanical Efficiency',
    titleBn: 'ক্ষমতা ও যান্ত্রিক কর্মদক্ষতা',
    topic: 'Power',
    topicBn: 'ক্ষমতা',
    formulaLatex: 'P = \\frac{W}{t} = \\vec{F} \\cdot \\vec{v}, \\quad \\eta = \\left(\\frac{P_{out}}{P_{in}}\\right) \\times 100\\%',
    variables: [
      { symbol: 'P', meaning: 'Power', meaningBn: 'ক্ষমতা', siUnit: 'W (ওয়াট) = J/s' },
      { symbol: 'W', meaning: 'Work Done', meaningBn: 'কৃতকাজ', siUnit: 'J' },
      { symbol: 't', meaning: 'Time', meaningBn: 'সময়', siUnit: 's' },
      { symbol: '\\eta', meaning: 'Efficiency percentage', meaningBn: 'কর্মদক্ষতা', siUnit: '%' },
    ],
    whenToUse: 'Calculating rates of energy delivery, engine power, elevator motors.',
    whenToUseBn: 'কাজ করার হার, মোটর বা ইঞ্জিনের ক্ষমতা ও কর্মদক্ষতা নির্ণয়ে।',
    pitfall: '1 Horsepower (hp) ≈ 746 Watts. Do not confuse Power (Watts) with Energy (Joules).',
    pitfallBn: '১ অশ্বক্ষমতা (hp) ≈ ৭৪৬ ওয়াট। ক্ষমতা (ওয়াট) এবং শক্তি (জুল) গুলিয়ে ফেলবেন না।',
  },
];

export const FormulaCheatSheet: React.FC = () => {
  const { t, isBangla } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const filterOptions = [
    { key: 'All', label: t.filterAll },
    { key: 'Motion', label: t.filterMotion },
    { key: 'Force', label: t.filterForce },
    { key: 'Work & Energy', label: t.filterEnergy },
    { key: 'Power', label: t.filterPower },
  ];

  const filtered = FORMULA_DATABASE.filter((item) => {
    const matchesTopic = selectedTopic === 'All' || item.topic === selectedTopic;
    const q = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.titleBn.toLowerCase().includes(q) ||
      item.whenToUse.toLowerCase().includes(q) ||
      item.whenToUseBn.toLowerCase().includes(q) ||
      item.formulaLatex.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  const handleCopy = (latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormula(latex);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              <span>{t.cheatsheetTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t.cheatsheetSubtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchFormulaPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* Topic Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedTopic(opt.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                selectedTopic === opt.key
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition group shadow-sm"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                  {isBangla ? item.topicBn : item.topic}
                </span>
                <button
                  onClick={() => handleCopy(item.formulaLatex)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded transition cursor-pointer"
                  title="Copy LaTeX Formula"
                >
                  {copiedFormula === item.formulaLatex ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {isBangla ? item.titleBn : item.title}
              </h3>

              {/* KaTeX Display */}
              <div className="bg-slate-950 rounded-xl p-3 my-2.5 border border-slate-800/80 text-center">
                <MathView math={item.formulaLatex} block />
              </div>

              {/* Variable Definitions */}
              <div className="space-y-1 my-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t.variablesAndUnits}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {item.variables.map((v, vIdx) => (
                    <div key={vIdx} className="bg-slate-950/50 border border-slate-800/60 rounded-lg px-2 py-1 flex items-center justify-between">
                      <span className="font-mono text-cyan-400 font-bold">
                        <MathView math={v.symbol} />
                      </span>
                      <span className="text-slate-300 text-[11px] truncate mx-1.5">
                        {isBangla ? v.meaningBn : v.meaning}
                      </span>
                      <span className="text-slate-500 text-[10px] font-mono">[{v.siUnit}]</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* When to Use & Pitfall */}
            <div className="space-y-2 border-t border-slate-800/80 pt-2.5 text-xs">
              <div className="text-slate-300">
                <span className="font-semibold text-emerald-400">{t.whenToUse} </span>
                <span>{isBangla ? item.whenToUseBn : item.whenToUse}</span>
              </div>
              <div className="text-slate-400 text-[11px] bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg">
                <span className="font-semibold text-amber-400">{t.examTrap} </span>
                <span>{isBangla ? item.pitfallBn : item.pitfall}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
