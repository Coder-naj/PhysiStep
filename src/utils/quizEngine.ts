import { GravityConstant } from '../types';

export type QuizTopic = 'All' | 'Motion' | 'Force' | 'Work & Energy' | 'Power';
export type QuizDifficulty = 'all' | 'easy' | 'medium' | 'hard';
export type QuestionType = 'numerical' | 'multiple_choice';

export interface QuizQuestion {
  id: string;
  topic: 'Motion' | 'Force' | 'Work & Energy' | 'Power';
  topicBn: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType;
  title: string;
  titleBn: string;
  questionText: string;
  questionTextBn: string;
  formulaLatex: string;
  algebraicIsolationLatex?: string;
  givens: { symbol: string; value: number; unit: string; name: string; nameBn: string }[];
  targetSymbol: string;
  targetUnit: string;
  correctAnswer: number;
  tolerancePercent: number; // e.g. 2 means +/- 2%
  options?: { id: string; text: string; textBn: string; value: number | string; isCorrect: boolean }[];
  hint: string;
  hintBn: string;
  explanation: string;
  explanationBn: string;
  commonPitfall: string;
  commonPitfallBn: string;
}

export interface QuizValidationResult {
  isCorrect: boolean;
  userValue: number | null;
  expectedValue: number;
  difference: number;
  percentError: number;
  feedbackMessage: string;
  feedbackMessageBn: string;
  status: 'correct' | 'close' | 'incorrect' | 'invalid_input';
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals: number = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function roundTo(val: number, decimals: number = 2): number {
  return parseFloat(val.toFixed(decimals));
}

/**
 * Generates a random physics quiz question using the formula database.
 */
export function generateRandomQuestion(
  topicFilter: QuizTopic = 'All',
  difficultyFilter: QuizDifficulty = 'all',
  gravity: GravityConstant = 9.8
): QuizQuestion {
  const g = gravity;

  // List of question generator blueprints
  const blueprints: (() => QuizQuestion)[] = [
    // 1. Motion: v = u + at (Velocity-Time)
    () => {
      const u = randInt(0, 20);
      const a = randFloat(1.5, 6, 1);
      const t = randInt(2, 12);
      const v = roundTo(u + a * t, 2);
      const id = `motion-v-uat-${Date.now()}-${Math.random()}`;

      const options = [
        { id: 'a', text: `${v} m/s`, textBn: `${v} মি/সে`, value: v, isCorrect: true },
        { id: 'b', text: `${roundTo(u + a * t * 0.5, 2)} m/s`, textBn: `${roundTo(u + a * t * 0.5, 2)} মি/সে`, value: roundTo(u + a * t * 0.5, 2), isCorrect: false },
        { id: 'c', text: `${roundTo(u * t + a, 2)} m/s`, textBn: `${roundTo(u * t + a, 2)} মি/সে`, value: roundTo(u * t + a, 2), isCorrect: false },
        { id: 'd', text: `${roundTo((u + a) * t, 2)} m/s`, textBn: `${roundTo((u + a) * t, 2)} মি/সে`, value: roundTo((u + a) * t, 2), isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        id,
        topic: 'Motion',
        topicBn: 'গতিবিদ্যা',
        difficulty: 'easy',
        type: 'numerical',
        title: 'Final Velocity under Uniform Acceleration',
        titleBn: 'সুষম ত্বরণে বস্তুর শেষবেগ নির্ণয়',
        questionText: `A vehicle starts with an initial velocity of ${u} m/s and accelerates uniformly at ${a} m/s² for ${t} seconds. Calculate its final velocity in m/s.`,
        questionTextBn: `একটি যানবাহন ${u} m/s আদিবেগে যাত্রা শুরু করে ${a} m/s² সুষম ত্বরণে ${t} সেকেন্ড চলল। এর শেষবেগ (m/s) নির্ণয় করো।`,
        formulaLatex: 'v = u + at',
        algebraicIsolationLatex: 'v = u + at',
        givens: [
          { symbol: 'u', value: u, unit: 'm/s', name: 'Initial Velocity', nameBn: 'আদিবেগ' },
          { symbol: 'a', value: a, unit: 'm/s²', name: 'Acceleration', nameBn: 'ত্বরণ' },
          { symbol: 't', value: t, unit: 's', name: 'Time duration', nameBn: 'সময়' },
        ],
        targetSymbol: 'v',
        targetUnit: 'm/s',
        correctAnswer: v,
        tolerancePercent: 2,
        options,
        hint: 'Use the first kinematic equation: v = u + at. Simply multiply acceleration by time and add to the initial velocity.',
        hintBn: 'প্রথম গতি সমীকরণ v = u + at ব্যবহার করুন। ত্বরণকে সময় দিয়ে গুণ করে আদিবেগের সাথে যোগ করুন।',
        explanation: `Substitute the known values into v = u + at:\nv = ${u} + (${a} × ${t}) = ${u} + ${roundTo(a * t, 2)} = ${v} m/s.`,
        explanationBn: `v = u + at সমীকরণে মান বসিয়ে:\nv = ${u} + (${a} × ${t}) = ${u} + ${roundTo(a * t, 2)} = ${v} মি/সে।`,
        commonPitfall: 'Do not multiply the initial velocity by time; only the acceleration term (at) contains time.',
        commonPitfallBn: 'আদিবেগকে সময় দিয়ে গুণ করবেন না; শুধুমাত্র ত্বরণের সাথে সময় গুণ হয় (at)।',
      };
    },

    // 2. Motion: s = ut + 0.5*a*t^2 (Displacement)
    () => {
      const u = randInt(2, 15);
      const a = randFloat(1, 4, 1);
      const t = randInt(3, 10);
      const s = roundTo(u * t + 0.5 * a * Math.pow(t, 2), 2);
      const id = `motion-s-ut-half-at2-${Date.now()}-${Math.random()}`;

      const options = [
        { id: 'a', text: `${s} m`, textBn: `${s} মি`, value: s, isCorrect: true },
        { id: 'b', text: `${roundTo(u * t + a * Math.pow(t, 2), 2)} m`, textBn: `${roundTo(u * t + a * Math.pow(t, 2), 2)} মি`, value: roundTo(u * t + a * Math.pow(t, 2), 2), isCorrect: false },
        { id: 'c', text: `${roundTo(u * t + 0.5 * a * t, 2)} m`, textBn: `${roundTo(u * t + 0.5 * a * t, 2)} মি`, value: roundTo(u * t + 0.5 * a * t, 2), isCorrect: false },
        { id: 'd', text: `${roundTo((u + a) * t, 2)} m`, textBn: `${roundTo((u + a) * t, 2)} মি`, value: roundTo((u + a) * t, 2), isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        id,
        topic: 'Motion',
        topicBn: 'গতিবিদ্যা',
        difficulty: 'medium',
        type: 'numerical',
        title: 'Displacement with Constant Acceleration',
        titleBn: 'সুষম ত্বরণে অতিক্রান্ত দূরত্ব / সরণ',
        questionText: `An object travels with an initial speed of ${u} m/s and experiences a constant acceleration of ${a} m/s² for ${t} s. What is the total displacement covered (in meters)?`,
        questionTextBn: `একটি বস্তু ${u} m/s আদিবেগে ${a} m/s² সুষম ত্বরণে ${t} সেকেন্ড গতিশীল থাকে। বস্তুটির মোট সরণ (মিটারে) কত হবে?`,
        formulaLatex: 's = ut + \\frac{1}{2}at^2',
        algebraicIsolationLatex: 's = ut + \\frac{1}{2}at^2',
        givens: [
          { symbol: 'u', value: u, unit: 'm/s', name: 'Initial Velocity', nameBn: 'আদিবেগ' },
          { symbol: 'a', value: a, unit: 'm/s²', name: 'Acceleration', nameBn: 'ত্বরণ' },
          { symbol: 't', value: t, unit: 's', name: 'Time', nameBn: 'সময়' },
        ],
        targetSymbol: 's',
        targetUnit: 'm',
        correctAnswer: s,
        tolerancePercent: 2,
        options,
        hint: 'Use s = ut + 0.5 × a × t². Make sure you square the time t before multiplying by 0.5 × a.',
        hintBn: 's = ut + ½at² সূত্রটি ব্যবহার করুন। সময়ের বর্গ (t²) করতে ভুলবেন না।',
        explanation: `Substitute the parameters into s = ut + 0.5*a*t²:\ns = (${u} × ${t}) + 0.5 × ${a} × (${t})² = ${u * t} + ${roundTo(0.5 * a * Math.pow(t, 2), 2)} = ${s} m.`,
        explanationBn: `s = ut + ½at² সূত্রে মান বসিয়ে:\ns = (${u} × ${t}) + 0.5 × ${a} × (${t})² = ${u * t} + ${roundTo(0.5 * a * Math.pow(t, 2), 2)} = ${s} মিটার।`,
        commonPitfall: 'Remember to square ONLY the time (t²), not (at)²',
        commonPitfallBn: 'শুধুমাত্র সময়ের বর্গ (t²) করতে হবে, সম্পূর্ণ (at) এর বর্গ নয়।',
      };
    },

    // 3. Motion: v^2 = u^2 + 2as (Stopping / Timeless)
    () => {
      const u = randInt(15, 35);
      const a = randFloat(2, 6, 1);
      // Stopping distance: v = 0 -> 0 = u^2 - 2*a*s -> s = u^2 / (2a)
      const s = roundTo(Math.pow(u, 2) / (2 * a), 2);
      const id = `motion-stopping-dist-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Motion',
        topicBn: 'গতিবিদ্যা',
        difficulty: 'medium',
        type: 'numerical',
        title: 'Braking / Stopping Distance',
        titleBn: 'গাড়ির ব্রেকিং দূরত্ব নির্ণয়',
        questionText: `A car cruising at ${u} m/s applies brakes causing a uniform deceleration of ${a} m/s² until it comes to a complete stop. Find its stopping distance in meters.`,
        questionTextBn: `একটি গাড়ি ${u} m/s বেগে চলার সময় ব্রেক চেপে ${a} m/s² সুষম মন্দন সৃষ্টি করে সম্পূর্ণ থেমে গেল। গাড়িটির ব্রেকিং দূরত্ব (মিটারে) কত?`,
        formulaLatex: 'v^2 = u^2 + 2as',
        algebraicIsolationLatex: 's = \\frac{v^2 - u^2}{2a} = \\frac{0 - u^2}{-2a} = \\frac{u^2}{2a}',
        givens: [
          { symbol: 'u', value: u, unit: 'm/s', name: 'Initial Velocity', nameBn: 'আদিবেগ' },
          { symbol: 'v', value: 0, unit: 'm/s', name: 'Final Velocity (Stop)', nameBn: 'শেষবেগ (থেমে যাওয়া)' },
          { symbol: 'a', value: -a, unit: 'm/s²', name: 'Deceleration (Retardation)', nameBn: 'মন্দন' },
        ],
        targetSymbol: 's',
        targetUnit: 'm',
        correctAnswer: s,
        tolerancePercent: 2,
        hint: 'Final velocity v = 0. Rearrange v² = u² + 2as to solve for s: s = u² / (2 × deceleration).',
        hintBn: 'যেহেতু গাড়িটি থেমে যায়, শেষবেগ v = 0। v² = u² + 2as থেকে s = u² / (2a) বের করুন।',
        explanation: `v² = u² + 2as\n0 = (${u})² + 2(-${a})s\n${roundTo(2 * a, 2)}s = ${Math.pow(u, 2)}\ns = ${Math.pow(u, 2)} / ${roundTo(2 * a, 2)} = ${s} m.`,
        explanationBn: `v² = u² + 2as\n0 = (${u})² + 2(-${a})s\n${roundTo(2 * a, 2)}s = ${Math.pow(u, 2)}\ns = ${Math.pow(u, 2)} / ${roundTo(2 * a, 2)} = ${s} মিটার।`,
        commonPitfall: 'Deceleration must be treated as negative acceleration, or s = u² / (2a).',
        commonPitfallBn: 'মন্দন হলে সমীকরণে ঋণাত্মক চিহ্ন বা সরাসরি s = u² / (2a) খেয়াল রাখুন।',
      };
    },

    // 4. Motion: Centripetal Acceleration a_c = v^2 / r
    () => {
      const v = randInt(10, 30);
      const r = randInt(25, 100);
      const ac = roundTo(Math.pow(v, 2) / r, 2);
      const id = `motion-centripetal-ac-${Date.now()}-${Math.random()}`;

      const options = [
        { id: 'a', text: `${ac} m/s²`, textBn: `${ac} মি/সে²`, value: ac, isCorrect: true },
        { id: 'b', text: `${roundTo(v / r, 2)} m/s²`, textBn: `${roundTo(v / r, 2)} মি/সে²`, value: roundTo(v / r, 2), isCorrect: false },
        { id: 'c', text: `${roundTo(Math.pow(v, 2) / Math.pow(r, 2), 2)} m/s²`, textBn: `${roundTo(Math.pow(v, 2) / Math.pow(r, 2), 2)} মি/সে²`, value: roundTo(Math.pow(v, 2) / Math.pow(r, 2), 2), isCorrect: false },
        { id: 'd', text: `${roundTo((v * 2) / r, 2)} m/s²`, textBn: `${roundTo((v * 2) / r, 2)} মি/সে²`, value: roundTo((v * 2) / r, 2), isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        id,
        topic: 'Motion',
        topicBn: 'গতিবিদ্যা',
        difficulty: 'easy',
        type: 'multiple_choice',
        title: 'Centripetal Acceleration in Circular Motion',
        titleBn: 'বৃত্তাকার পথে কেন্দ্রমুখী ত্বরণ',
        questionText: `A car rounds a circular bend of radius ${r} meters at a constant tangential speed of ${v} m/s. Calculate its centripetal acceleration in m/s².`,
        questionTextBn: `একটি গাড়ি ${r} মিটার ব্যাসার্ধের একটি বৃত্তাকার বাঁকে ${v} m/s দ্রুতিতে মোড় নিচ্ছে। গাড়িটির কেন্দ্রমুখী ত্বরণ (m/s²) কত?`,
        formulaLatex: 'a_c = \\frac{v^2}{r}',
        algebraicIsolationLatex: 'a_c = \\frac{v^2}{r}',
        givens: [
          { symbol: 'v', value: v, unit: 'm/s', name: 'Tangential Speed', nameBn: 'রৈখিক দ্রুতি' },
          { symbol: 'r', value: r, unit: 'm', name: 'Radius of Curvature', nameBn: 'বাঁকের ব্যাসার্ধ' },
        ],
        targetSymbol: 'a_c',
        targetUnit: 'm/s²',
        correctAnswer: ac,
        tolerancePercent: 2,
        options,
        hint: 'Use the centripetal acceleration equation: a_c = v² / r. Square the speed and divide by the radius.',
        hintBn: 'কেন্দ্রমুখী ত্বরণের সূত্র a_c = v² / r ব্যবহার করুন। বেগের বর্গকে ব্যাসার্ধ দিয়ে ভাগ করুন।',
        explanation: `a_c = v² / r = (${v})² / ${r} = ${Math.pow(v, 2)} / ${r} = ${ac} m/s².`,
        explanationBn: `a_c = v² / r = (${v})² / ${r} = ${Math.pow(v, 2)} / ${r} = ${ac} মি/সে²।`,
        commonPitfall: 'Do not forget to square the tangential velocity v before dividing by radius r.',
        commonPitfallBn: 'ব্যাসার্ধ r দিয়ে ভাগ করার আগে বেগের বর্গ (v²) করতে ভুলবেন না।',
      };
    },

    // 5. Force: F = ma
    () => {
      const m = randFloat(2, 50, 1);
      const a = randFloat(1.5, 8, 1);
      const F = roundTo(m * a, 2);
      const id = `force-f-ma-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Force',
        topicBn: 'বলবিদ্যা',
        difficulty: 'easy',
        type: 'numerical',
        title: "Newton's Second Law Net Force",
        titleBn: 'নিউটনের ২য় সূত্রানুসারে লব্ধি বল',
        questionText: `A net force causes an object of mass ${m} kg to accelerate at ${a} m/s². Determine the magnitude of the net force in Newtons (N).`,
        questionTextBn: `একটি লব্ধি বলের প্রভাবে ${m} kg ভরের একটি বস্তুতে ${a} m/s² ত্বরণ সৃষ্টি হলো। প্রযুক্ত লব্ধি বলের মান নিউটনে (N) নির্ণয় করো।`,
        formulaLatex: 'F_{net} = m \\cdot a',
        algebraicIsolationLatex: 'F = ma',
        givens: [
          { symbol: 'm', value: m, unit: 'kg', name: 'Mass', nameBn: 'ভর' },
          { symbol: 'a', value: a, unit: 'm/s²', name: 'Acceleration', nameBn: 'ত্বরণ' },
        ],
        targetSymbol: 'F_{net}',
        targetUnit: 'N',
        correctAnswer: F,
        tolerancePercent: 2,
        hint: "Multiply mass (in kg) directly by acceleration (in m/s²) according to Newton's Second Law F = ma.",
        hintBn: 'নিউটনের ২য় সূত্র F = ma অনুসারে বস্তুর ভর (kg) এবং ত্বরণ (m/s²) গুণ করুন।',
        explanation: `F = m × a = ${m} kg × ${a} m/s² = ${F} N.`,
        explanationBn: `F = m × a = ${m} kg × ${a} m/s² = ${F} নিউটন।`,
        commonPitfall: 'Ensure mass is in kilograms (kg) and acceleration is in m/s² for standard Newtons.',
        commonPitfallBn: 'ভরের একক কেজিতে (kg) ও ত্বরণের একক m/s² এ রাখা আবশ্যক।',
      };
    },

    // 6. Force: Friction Force f_k = mu_k * m * g
    () => {
      const m = randInt(5, 40);
      const mu_k = randFloat(0.15, 0.45, 2);
      const fk = roundTo(mu_k * m * g, 2);
      const id = `force-kinetic-friction-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Force',
        topicBn: 'বলবিদ্যা',
        difficulty: 'medium',
        type: 'numerical',
        title: 'Kinetic Friction on a Flat Horizontal Surface',
        titleBn: 'অনুভূমিক তলে চল ঘর্ষণ বল নির্ণয়',
        questionText: `A wooden crate of mass ${m} kg slides along a level floor with coefficient of kinetic friction μ_k = ${mu_k}. Taking g = ${g} m/s², calculate the kinetic friction force resisting motion (in Newtons).`,
        questionTextBn: `একটি ${m} kg ভরের কাঠের বাক্স মেঝের উপর পিছলে চলছে। মেঝের চল ঘর্ষণ গুণাঙ্ক μ_k = ${mu_k} এবং g = ${g} m/s² হলে গতীয় ঘর্ষণ বলের মান (নিউটনে) নির্ণয় করো।`,
        formulaLatex: 'f_k = \\mu_k N = \\mu_k mg',
        algebraicIsolationLatex: 'f_k = \\mu_k \\cdot (m \\cdot g)',
        givens: [
          { symbol: 'm', value: m, unit: 'kg', name: 'Mass', nameBn: 'ভর' },
          { symbol: '\\mu_k', value: mu_k, unit: '', name: 'Kinetic Friction Coefficient', nameBn: 'চল ঘর্ষণ গুণাঙ্ক' },
          { symbol: 'g', value: g, unit: 'm/s²', name: 'Gravity', nameBn: 'অভিকর্ষজ ত্বরণ' },
        ],
        targetSymbol: 'f_k',
        targetUnit: 'N',
        correctAnswer: fk,
        tolerancePercent: 2,
        hint: 'On a horizontal surface with no vertical applied forces, the normal force is N = mg. Then f_k = μ_k × N.',
        hintBn: 'অনুভূমিক তলে অভিলম্বিক প্রতিক্রিয়া বল N = mg। অতঃপর চল ঘর্ষণ f_k = μ_k × mg।',
        explanation: `Normal force N = m × g = ${m} × ${g} = ${roundTo(m * g, 2)} N.\nKinetic friction f_k = μ_k × N = ${mu_k} × ${roundTo(m * g, 2)} = ${fk} N.`,
        explanationBn: `অভিলম্বিক বল N = m × g = ${m} × ${g} = ${roundTo(m * g, 2)} N।\nচল ঘর্ষণ বল f_k = μ_k × N = ${mu_k} × ${roundTo(m * g, 2)} = ${fk} নিউটন।`,
        commonPitfall: 'The friction coefficient μ is dimensionless (has no unit); do not confuse it with friction force (N).',
        commonPitfallBn: 'ঘর্ষণ গুণাঙ্ক μ একটি মাত্রাহীন রাশি; একে ঘর্ষণ বলের (N) সাথে গুলিয়ে ফেলবেন না।',
      };
    },

    // 7. Force: Inclined Plane Acceleration (Frictionless) a = g * sin(theta)
    () => {
      const angles = [30, 45, 60];
      const theta = angles[randInt(0, angles.length - 1)];
      const rad = (theta * Math.PI) / 180;
      const a = roundTo(g * Math.sin(rad), 2);
      const id = `force-incline-accel-${Date.now()}-${Math.random()}`;

      const options = [
        { id: 'a', text: `${a} m/s²`, textBn: `${a} মি/সে²`, value: a, isCorrect: true },
        { id: 'b', text: `${roundTo(g * Math.cos(rad), 2)} m/s²`, textBn: `${roundTo(g * Math.cos(rad), 2)} মি/সে²`, value: roundTo(g * Math.cos(rad), 2), isCorrect: false },
        { id: 'c', text: `${roundTo(g * Math.tan(rad), 2)} m/s²`, textBn: `${roundTo(g * Math.tan(rad), 2)} মি/সে²`, value: roundTo(g * Math.tan(rad), 2), isCorrect: false },
        { id: 'd', text: `${roundTo(g / Math.sin(rad), 2)} m/s²`, textBn: `${roundTo(g / Math.sin(rad), 2)} মি/সে²`, value: roundTo(g / Math.sin(rad), 2), isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        id,
        topic: 'Force',
        topicBn: 'বলবিদ্যা',
        difficulty: 'hard',
        type: 'multiple_choice',
        title: 'Frictionless Incline Downward Acceleration',
        titleBn: 'ঘর্ষণহীন আনত তলে নিচের দিকের ত্বরণ',
        questionText: `A block slides down a frictionless inclined plane tilted at ${theta}° above the horizontal. With g = ${g} m/s², what is the acceleration of the block down the ramp in m/s²?`,
        questionTextBn: `একটি বস্তু অনুভূমিকের সাথে ${theta}° কোণে আনত একটি ঘর্ষণহীন তলে নিচের দিকে পিছলে নামছে। g = ${g} m/s² হলে বস্তুটির নিম্নমুখী ত্বরণ (m/s²) কত?`,
        formulaLatex: 'a = g\\sin\\theta',
        algebraicIsolationLatex: 'F_\\parallel = mg\\sin\\theta \\implies a = \\frac{F_\\parallel}{m} = g\\sin\\theta',
        givens: [
          { symbol: '\\theta', value: theta, unit: '°', name: 'Incline Angle', nameBn: 'আনত কোণ' },
          { symbol: 'g', value: g, unit: 'm/s²', name: 'Gravity', nameBn: 'অভিকর্ষজ ত্বরণ' },
        ],
        targetSymbol: 'a',
        targetUnit: 'm/s²',
        correctAnswer: a,
        tolerancePercent: 2,
        options,
        hint: 'The component of gravitational force pulling along the slope is mg·sin(θ). Dividing by mass m gives acceleration a = g·sin(θ).',
        hintBn: 'আনত তল বরাবর অভিকর্ষের উপাংশ mg·sin(θ)। ভর m দিয়ে ভাগ করলে ত্বরণ a = g·sin(θ)।',
        explanation: `a = g × sin(${theta}°) = ${g} × ${roundTo(Math.sin(rad), 4)} = ${a} m/s². (Notice that acceleration on a frictionless ramp is independent of mass!)`,
        explanationBn: `a = g × sin(${theta}°) = ${g} × ${roundTo(Math.sin(rad), 4)} = ${a} মি/সে²। (লক্ষ করুন: ঘর্ষণহীন আনত তলে ত্বরণ বস্তুর ভরের উপর নির্ভর করে না!)`,
        commonPitfall: 'Remember that sin(θ) drives motion down the slope, while cos(θ) acts perpendicular into the surface.',
        commonPitfallBn: 'মনে রাখবেন sin(θ) তল বরাবর গতি সৃষ্টি করে এবং cos(θ) তলের লম্ব বরাবর চাপ সৃষ্টি করে।',
      };
    },

    // 8. Work & Energy: W = F * d * cos(theta)
    () => {
      const F = randInt(20, 100);
      const d = randFloat(4, 25, 1);
      const theta = [0, 30, 45, 60][randInt(0, 3)];
      const rad = (theta * Math.PI) / 180;
      const W = roundTo(F * d * Math.cos(rad), 2);
      const id = `work-f-d-costheta-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Work & Energy',
        topicBn: 'কাজ ও শক্তি',
        difficulty: 'medium',
        type: 'numerical',
        title: 'Work Done by Force at an Angle',
        titleBn: 'নির্দিষ্ট কোণে বল দ্বারা কৃতকাজ',
        questionText: `A worker pulls a trolley across a floor with a force of ${F} N directed at an angle of ${theta}° above the horizontal. The trolley moves a distance of ${d} meters horizontally. Calculate the work done in Joules (J).`,
        questionTextBn: `একজন কর্মী অনুভূমিকের সাথে ${theta}° কোণে ${F} N বল প্রয়োগ করে একটি ট্রলিকে অনুভূমিক বরাবর ${d} মিটার টেনে নিল। কৃতকাজের পরিমাণ জুলে (J) কত?`,
        formulaLatex: 'W = F \\cdot d \\cdot \\cos\\theta',
        algebraicIsolationLatex: 'W = Fd\\cos\\theta',
        givens: [
          { symbol: 'F', value: F, unit: 'N', name: 'Force', nameBn: 'বল' },
          { symbol: 'd', value: d, unit: 'm', name: 'Displacement', nameBn: 'সরণ' },
          { symbol: '\\theta', value: theta, unit: '°', name: 'Angle with displacement', nameBn: 'বল ও সরণের মধ্যবর্তী কোণ' },
        ],
        targetSymbol: 'W',
        targetUnit: 'J',
        correctAnswer: W,
        tolerancePercent: 2,
        hint: 'Use the dot product formula: W = F × d × cos(θ). If angle is 0°, cos(0°) = 1.',
        hintBn: 'কৃতকাজের সূত্র W = F × d × cos(θ) ব্যবহার করুন। কোণ ০° হলে cos(0°) = 1 হয়।',
        explanation: `W = F × d × cos(${theta}°) = ${F} × ${d} × ${roundTo(Math.cos(rad), 4)} = ${W} Joules.`,
        explanationBn: `W = F × d × cos(${theta}°) = ${F} × ${d} × ${roundTo(Math.cos(rad), 4)} = ${W} জুল।`,
        commonPitfall: 'Angle θ is the angle between force vector and displacement direction, and use cos(θ), not sin(θ).',
        commonPitfallBn: 'কোণ θ হলো বল ও সরণের মধ্যকার কোণ এবং সবসময় cos(θ) গুণ হয়।',
      };
    },

    // 9. Work & Energy: Kinetic Energy Ek = 0.5 * m * v^2
    () => {
      const m = randFloat(0.5, 20, 1);
      const v = randInt(4, 25);
      const Ek = roundTo(0.5 * m * Math.pow(v, 2), 2);
      const id = `energy-ek-half-mv2-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Work & Energy',
        topicBn: 'কাজ ও শক্তি',
        difficulty: 'easy',
        type: 'numerical',
        title: 'Kinetic Energy Calculation',
        titleBn: 'বস্তুর গতিশক্তি নির্ণয়',
        questionText: `An object of mass ${m} kg moves at a linear speed of ${v} m/s. Calculate its total kinetic energy in Joules (J).`,
        questionTextBn: `${m} kg ভরের একটি বস্তু ${v} m/s দ্রুতিতে গতিশীল। এর গতিশক্তি জুলে (J) কত হবে?`,
        formulaLatex: 'E_k = \\frac{1}{2}mv^2',
        algebraicIsolationLatex: 'E_k = 0.5 \\cdot m \\cdot v^2',
        givens: [
          { symbol: 'm', value: m, unit: 'kg', name: 'Mass', nameBn: 'ভর' },
          { symbol: 'v', value: v, unit: 'm/s', name: 'Speed', nameBn: 'বেগ' },
        ],
        targetSymbol: 'E_k',
        targetUnit: 'J',
        correctAnswer: Ek,
        tolerancePercent: 2,
        hint: 'Kinetic energy equation is E_k = 0.5 × m × v². Remember to square the velocity.',
        hintBn: 'গতিশক্তির সমীকরণ E_k = ½mv²। বেগের বর্গ করতে ভুলবেন না।',
        explanation: `E_k = 0.5 × ${m} × (${v})² = 0.5 × ${m} × ${Math.pow(v, 2)} = ${Ek} J.`,
        explanationBn: `E_k = 0.5 × ${m} × (${v})² = 0.5 × ${m} × ${Math.pow(v, 2)} = ${Ek} জুল।`,
        commonPitfall: 'Doubling the speed quadruples the kinetic energy due to the v² term.',
        commonPitfallBn: 'বেগ দ্বিগুণ হলে v² এর কারণে গতিশক্তি চারগুণ বৃদ্ধি পায়।',
      };
    },

    // 10. Work & Energy: Potential Energy Ep = mgh
    () => {
      const m = randFloat(2, 50, 1);
      const h = randFloat(3, 30, 1);
      const Ep = roundTo(m * g * h, 2);
      const id = `energy-ep-mgh-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Work & Energy',
        topicBn: 'কাজ ও শক্তি',
        difficulty: 'easy',
        type: 'numerical',
        title: 'Gravitational Potential Energy',
        titleBn: 'মহাকর্ষীয় বিভব শক্তি নির্ণয়',
        questionText: `A crate weighing ${m} kg is lifted to a storage shelf ${h} meters above the floor. Taking g = ${g} m/s², what is its gravitational potential energy (in Joules)?`,
        questionTextBn: `${m} kg ভরের একটি বাক্সকে মেঝে থেকে ${h} মিটার উঁচু তাকে তোলা হলো। g = ${g} m/s² হলে এর মহাকর্ষীয় বিভব শক্তি (জুলে) কত?`,
        formulaLatex: 'E_p = mgh',
        algebraicIsolationLatex: 'E_p = m \\cdot g \\cdot h',
        givens: [
          { symbol: 'm', value: m, unit: 'kg', name: 'Mass', nameBn: 'ভর' },
          { symbol: 'g', value: g, unit: 'm/s²', name: 'Gravity', nameBn: 'অভিকর্ষজ ত্বরণ' },
          { symbol: 'h', value: h, unit: 'm', name: 'Height', nameBn: 'উচ্চতা' },
        ],
        targetSymbol: 'E_p',
        targetUnit: 'J',
        correctAnswer: Ep,
        tolerancePercent: 2,
        hint: 'Multiply mass, acceleration due to gravity, and height: E_p = m × g × h.',
        hintBn: 'ভর, অভিকর্ষজ ত্বরণ এবং উচ্চতা গুণ করুন: E_p = m × g × h।',
        explanation: `E_p = ${m} kg × ${g} m/s² × ${h} m = ${Ep} Joules.`,
        explanationBn: `E_p = ${m} kg × ${g} m/s² × ${h} m = ${Ep} জুল।`,
        commonPitfall: 'Potential energy is measured relative to a chosen reference height (datum).',
        commonPitfallBn: 'বিভব শক্তি সর্বদা একটি নির্দিষ্ট নির্দেশ তল বা মেঝের সাপেক্ষে মাপা হয়।',
      };
    },

    // 11. Power: P = W / t
    () => {
      const W = randInt(1200, 9600);
      const t = randInt(10, 60);
      const P = roundTo(W / t, 2);
      const id = `power-p-w-over-t-${Date.now()}-${Math.random()}`;

      const options = [
        { id: 'a', text: `${P} W`, textBn: `${P} ওয়াট`, value: P, isCorrect: true },
        { id: 'b', text: `${roundTo(W * t, 2)} W`, textBn: `${roundTo(W * t, 2)} ওয়াট`, value: roundTo(W * t, 2), isCorrect: false },
        { id: 'c', text: `${roundTo(W / (t * 60), 2)} W`, textBn: `${roundTo(W / (t * 60), 2)} ওয়াট`, value: roundTo(W / (t * 60), 2), isCorrect: false },
        { id: 'd', text: `${roundTo(t / W, 4)} W`, textBn: `${roundTo(t / W, 4)} ওয়াট`, value: roundTo(t / W, 4), isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      return {
        id,
        topic: 'Power',
        topicBn: 'ক্ষমতা',
        difficulty: 'easy',
        type: 'multiple_choice',
        title: 'Average Power Output',
        titleBn: 'গড় ক্ষমতা নির্ণয়',
        questionText: `An electric motor performs ${W} Joules of mechanical work in ${t} seconds. What is the average power output of the motor in Watts (W)?`,
        questionTextBn: `একটি বৈদ্যুতিক মোটর ${t} সেকেন্ডে ${W} জুল যান্ত্রিক কাজ সম্পন্ন করে। মোটরটির গড় ক্ষমতা ওয়াটে (W) কত?`,
        formulaLatex: 'P = \\frac{W}{t}',
        algebraicIsolationLatex: 'P = \\frac{W}{t}',
        givens: [
          { symbol: 'W', value: W, unit: 'J', name: 'Work Done', nameBn: 'কৃতকাজ' },
          { symbol: 't', value: t, unit: 's', name: 'Time taken', nameBn: 'সময়' },
        ],
        targetSymbol: 'P',
        targetUnit: 'W',
        correctAnswer: P,
        tolerancePercent: 2,
        options,
        hint: 'Power is the rate of doing work: P = Work (J) / Time (s). 1 Watt = 1 Joule per second.',
        hintBn: 'ক্ষমতা হলো কাজ করার হার: P = কাজ (J) / সময় (s)। ১ ওয়াট = ১ জুল/সেকেন্ড।',
        explanation: `P = W / t = ${W} J / ${t} s = ${P} Watts (J/s).`,
        explanationBn: `P = W / t = ${W} J / ${t} s = ${P} ওয়াট (জুল/সেকেন্ড)।`,
        commonPitfall: 'Do not multiply work by time; power is work divided by time.',
        commonPitfallBn: 'কাজকে সময় দিয়ে গুণ করবেন না; ক্ষমতা হলো কাজকে সময় দিয়ে ভাগফল।',
      };
    },

    // 12. Power & Efficiency: eta = (P_out / P_in) * 100%
    () => {
      const Pin = randInt(1500, 5000);
      const efficiency = randInt(65, 92);
      const Pout = roundTo((Pin * efficiency) / 100, 2);
      const id = `power-efficiency-calc-${Date.now()}-${Math.random()}`;

      return {
        id,
        topic: 'Power',
        topicBn: 'ক্ষমতা',
        difficulty: 'medium',
        type: 'numerical',
        title: 'Machine Mechanical Efficiency',
        titleBn: 'যান্ত্রিক কর্মদক্ষতা নির্ণয়',
        questionText: `A generator consumes an input power of ${Pin} W and delivers ${Pout} W of useful electrical output power. Calculate the efficiency of the generator (as a percentage %).`,
        questionTextBn: `একটি জেনারেটরে ${Pin} W প্রদত্ত ক্ষমতা (Input) সরবরাহ করা হলে এটি ${Pout} W কার্যকর ক্ষমতা (Output) প্রদান করে। জেনারেটরটির কর্মদক্ষতা (শতকরা % এ) কত?`,
        formulaLatex: '\\eta = \\left(\\frac{P_{out}}{P_{in}}\\right) \\times 100\\%',
        algebraicIsolationLatex: '\\eta = \\frac{P_{out}}{P_{in}} \\times 100',
        givens: [
          { symbol: 'P_{in}', value: Pin, unit: 'W', name: 'Input Power', nameBn: 'প্রদত্ত ক্ষমতা' },
          { symbol: 'P_{out}', value: Pout, unit: 'W', name: 'Output Power', nameBn: 'কার্যকর ক্ষমতা' },
        ],
        targetSymbol: '\\eta',
        targetUnit: '%',
        correctAnswer: efficiency,
        tolerancePercent: 1.5,
        hint: 'Efficiency η = (Useful Output Power / Total Input Power) × 100%.',
        hintBn: 'কর্মদক্ষতা η = (কার্যকর ক্ষমতা / মোট প্রদত্ত ক্ষমতা) × ১০০%।',
        explanation: `η = (${Pout} / ${Pin}) × 100% = ${efficiency}%.`,
        explanationBn: `η = (${Pout} / ${Pin}) × ১০০% = ${efficiency}%।`,
        commonPitfall: 'Efficiency can never exceed 100% in physical systems due to energy conservation.',
        commonPitfallBn: 'শক্তির সংরক্ষণশীলতার কারণে কর্মদক্ষতা কখনোই ১০০% এর বেশি হতে পারে না।',
      };
    },
  ];

  // Filter blueprints by topic if specified
  let candidatePool = blueprints.map((fn) => fn());
  if (topicFilter !== 'All') {
    candidatePool = candidatePool.filter((q) => q.topic === topicFilter);
  }
  if (difficultyFilter !== 'all') {
    candidatePool = candidatePool.filter((q) => q.difficulty === difficultyFilter);
  }

  // Fallback to full pool if filters are too restrictive
  if (candidatePool.length === 0) {
    candidatePool = blueprints.map((fn) => fn());
  }

  const selected = candidatePool[randInt(0, candidatePool.length - 1)];
  return selected;
}

/**
 * Validates a user's answer against the target with smart physical tolerance and feedback.
 */
export function validateQuizAnswer(
  question: QuizQuestion,
  userInput: string | number
): QuizValidationResult {
  const expected = question.correctAnswer;
  let val: number;

  if (typeof userInput === 'number') {
    val = userInput;
  } else {
    // Clean string input (handle scientific notation, comma, decimals)
    const cleaned = userInput.trim().replace(/,/g, '');
    val = parseFloat(cleaned);
  }

  if (isNaN(val)) {
    return {
      isCorrect: false,
      userValue: null,
      expectedValue: expected,
      difference: 0,
      percentError: 100,
      feedbackMessage: 'Please enter a valid numeric value.',
      feedbackMessageBn: 'দয়া করে একটি সঠিক সংখ্যা লিখুন।',
      status: 'invalid_input',
    };
  }

  const diff = Math.abs(val - expected);
  const percentError = expected !== 0 ? (diff / Math.abs(expected)) * 100 : diff * 100;
  const tolerance = question.tolerancePercent || 2.5;

  if (percentError <= tolerance || diff < 0.05) {
    return {
      isCorrect: true,
      userValue: val,
      expectedValue: expected,
      difference: roundTo(diff, 3),
      percentError: roundTo(percentError, 2),
      feedbackMessage: `Outstanding! Correct answer: ${expected} ${question.targetUnit} (${percentError <= 0.01 ? 'Exact match' : `within ${roundTo(percentError, 1)}% tolerance`}).`,
      feedbackMessageBn: `চমৎকার! সঠিক উত্তর: ${expected} ${question.targetUnit} (${percentError <= 0.01 ? 'একদম সঠিক' : `মাত্র ${roundTo(percentError, 1)}% ব্যবধান`})।`,
      status: 'correct',
    };
  }

  // Check if student was close (within 10% error, maybe rounding or forgot 1/2 or factor of g)
  if (percentError <= 15) {
    return {
      isCorrect: false,
      userValue: val,
      expectedValue: expected,
      difference: roundTo(diff, 3),
      percentError: roundTo(percentError, 2),
      feedbackMessage: `Very close! You answered ${val} ${question.targetUnit}, but the target is ${expected} ${question.targetUnit} (${roundTo(percentError, 1)}% off). Check intermediate rounding.`,
      feedbackMessageBn: `খুব কাছাকাছি! আপনার উত্তর ${val} ${question.targetUnit}, কিন্তু সঠিক মান ${expected} ${question.targetUnit} (${roundTo(percentError, 1)}% পার্থক্য)। মাঝের হিসাবগুলো পুনরায় দেখে নিন।`,
      status: 'close',
    };
  }

  // Check common mistakes (e.g. order of magnitude / 10x or 1/10x)
  let extraHint = '';
  let extraHintBn = '';
  if (Math.abs(val / expected - 10) < 0.5 || Math.abs(val / expected - 0.1) < 0.05) {
    extraHint = ' (Looks like a power of 10 or unit conversion issue)';
    extraHintBn = ' (সম্ভবত ১০ এর গুণিতক বা এককের রূপান্তরে গরমিল হয়েছে)';
  } else if (Math.abs(val / expected - 2) < 0.2 || Math.abs(val / expected - 0.5) < 0.1) {
    extraHint = ' (Did you forget or double a factor of 1/2 or 2?)';
    extraHintBn = ' (সম্ভবত ½ বা ২ দিয়ে গুণ/ভাগে ভুল হয়েছে)';
  }

  return {
    isCorrect: false,
    userValue: val,
    expectedValue: expected,
    difference: roundTo(diff, 3),
    percentError: roundTo(percentError, 2),
    feedbackMessage: `Incorrect answer: ${val} ${question.targetUnit}. Expected: ${expected} ${question.targetUnit}.${extraHint}`,
    feedbackMessageBn: `উত্তরটি সঠিক নয়: ${val} ${question.targetUnit}। সঠিক মান: ${expected} ${question.targetUnit}।${extraHintBn}`,
    status: 'incorrect',
  };
}
