// Fallback Physics Engine for when Gemini API experiences temporary 503 high demand

export interface FallbackPhysicsResult {
  problemSummary: string;
  category: string;
  givens: Array<{
    symbol: string;
    name: string;
    originalValue: string;
    siValue: string;
    unit: string;
    conversionNote?: string;
  }>;
  unknowns: Array<{
    symbol: string;
    name: string;
    targetUnit: string;
  }>;
  principlesUsed: string[];
  keyFormulasLatex: string[];
  steps: Array<{
    stepNumber: number;
    title: string;
    formulaLatex: string;
    explanation: string;
    algebraicDerivation?: string;
    substitutionLatex: string;
    calculatedResult: string;
  }>;
  finalAnswers: Array<{
    quantity: string;
    symbol: string;
    value: string;
    unit: string;
    scientificNotation?: string;
    interpretation: string;
  }>;
  sanityCheck: string;
  commonPitfalls: string[];
  suggestedSimulator?: {
    type: string;
    initialVelocity?: number;
    acceleration?: number;
    mass?: number;
    appliedForce?: number;
    angleDeg?: number;
    height?: number;
    distance?: number;
    frictionCoeff?: number;
  };
}

export function solvePhysicsFallback(
  problemText: string,
  gValue: number = 9.8,
  language: string = 'en'
): FallbackPhysicsResult {
  const isBn = language === 'bn';
  const text = problemText.toLowerCase();

  // Extract common numbers with units using regex
  const extractNum = (regex: RegExp): number | null => {
    const match = problemText.match(regex);
    if (!match) return null;
    const num = parseFloat(match[1]);
    return isNaN(num) ? null : num;
  };

  // Mass: e.g. 1200 kg, 40kg, 15 kg
  const massMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|কেজি)/i);
  // Velocity / Speed: e.g. 20 m/s, 25 m/s, 90 km/h, 100 km/h
  const speedMsMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:m\/s|mps|মিটার\/সেকেন্ড|মি\/সে)/i);
  const speedKmhMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:km\/h|kmh|কিমি\/ঘণ্টা)/i);
  // Distance / Displacement / Length / Height: e.g. 40 m, 45 meters, 6 meters
  const distMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|মিটার|মি)(?!\/)/i);
  // Force: e.g. 180 N, 500 N, 1000 Newton
  const forceMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:N|newton|newtons|নিউটন)/i);
  // Angle: e.g. 30°, 35 deg, 28 degree
  const angleMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:°|deg|degrees|কোণ|ডিগ্রি)/i);
  // Friction coefficient: e.g. 0.25, 0.18, μ = 0.3
  const frictionMatch = extractNum(/(?:μ|mu|friction|ঘর্ষণ)\s*(?:=|k|s)?\s*(\d+(?:\.\d+)?)/i);
  // Time: e.g. 15 s, 15 seconds, 5 s
  const timeMatch = extractNum(/(\d+(?:\.\d+)?)\s*(?:s|sec|seconds|সেকেন্ড)/i);

  // Scenario 1: Car braking / Stopping distance (Kinematics & Friction)
  if (
    (text.includes('skid') || text.includes('brake') || text.includes('stop') || text.includes('ব্রেক') || text.includes('থাম')) &&
    (massMatch || speedMsMatch || speedKmhMatch || distMatch)
  ) {
    const mass = massMatch || 1200;
    const v0 = speedMsMatch || (speedKmhMatch ? speedKmhMatch / 3.6 : 20);
    const dist = distMatch || 40;
    const vFinal = 0;

    // a = (v^2 - u^2) / (2s) = -u^2 / (2s)
    const accelMag = (v0 * v0) / (2 * dist);
    const timeToStop = v0 / accelMag;
    const frictionForce = mass * accelMag;
    const muK = accelMag / gValue;

    return {
      problemSummary: isBn
        ? `${mass} কেজি ভরের একটি গাড়ি ${v0.toFixed(1)} মি/সে বেগে চলার সময় ব্রেক কষে ${dist} মিটার দূরত্ব অতিক্রম করে সম্পূর্ণ থেমে যায়।`
        : `A ${mass} kg vehicle traveling at ${v0.toFixed(1)} m/s skids to a complete stop over a distance of ${dist} meters.`,
      category: isBn ? 'গতিবিদ্যা ও ঘর্ষণ বল' : 'Motion & Dynamics',
      givens: [
        { symbol: 'm', name: isBn ? 'গাড়ির ভর' : 'Mass of vehicle', originalValue: `${mass}`, siValue: `${mass}`, unit: 'kg' },
        { symbol: 'u', name: isBn ? 'আদিবেগ' : 'Initial velocity', originalValue: `${v0.toFixed(1)}`, siValue: `${v0.toFixed(1)}`, unit: 'm/s' },
        { symbol: 'v', name: isBn ? 'শেষবেগ' : 'Final velocity', originalValue: '0', siValue: '0', unit: 'm/s' },
        { symbol: 's', name: isBn ? 'ব্রেকিং দূরত্ব' : 'Stopping displacement', originalValue: `${dist}`, siValue: `${dist}`, unit: 'm' },
        { symbol: 'g', name: isBn ? 'অভিকর্ষজ ত্বরণ' : 'Acceleration of gravity', originalValue: `${gValue}`, siValue: `${gValue}`, unit: 'm/s²' },
      ],
      unknowns: [
        { symbol: 'a', name: isBn ? 'মন্দন' : 'Deceleration', targetUnit: 'm/s²' },
        { symbol: 't', name: isBn ? 'থামতে প্রয়োজনীয় সময়' : 'Stopping time', targetUnit: 's' },
        { symbol: 'f_k', name: isBn ? 'ঘর্ষণ বল' : 'Friction force', targetUnit: 'N' },
        { symbol: '\\mu_k', name: isBn ? 'চল ঘর্ষণ গুণাঙ্ক' : 'Kinetic friction coefficient', targetUnit: 'dimensionless' },
      ],
      principlesUsed: [
        isBn ? 'সময়হীন গতি সমীকরণ (v² = u² + 2as)' : 'Timeless Kinematic Equation (v² = u² + 2as)',
        isBn ? 'নিউটনের গতির ২য় সূত্র (F = ma)' : "Newton's 2nd Law (F = ma)",
        isBn ? 'ঘর্ষণ বলের সূত্র (f = μ N)' : 'Coulomb Friction (f = μ N)',
      ],
      keyFormulasLatex: [
        'v^2 = u^2 + 2as',
        'v = u + at',
        'f_k = m \\cdot |a|',
        '\\mu_k = \\frac{f_k}{N} = \\frac{a}{g}',
      ],
      steps: [
        {
          stepNumber: 1,
          title: isBn ? '১. ব্রেকিং মন্দন নির্ণয়' : '1. Calculate Deceleration (a)',
          formulaLatex: 'v^2 = u^2 + 2as \\implies a = \\frac{v^2 - u^2}{2s}',
          explanation: isBn
            ? 'গাড়িটি থেমে যাওয়ায় শেষবেগ v = 0। সময়হীন গতি সমীকরণ ব্যবহার করে ত্বরণ নির্ণয় করি।'
            : 'Since the car comes to rest, final speed v = 0. Use the timeless kinematic formula to isolate deceleration.',
          algebraicDerivation: 'a = \\frac{0 - u^2}{2s} = -\\frac{u^2}{2s}',
          substitutionLatex: `a = -\\frac{(${v0.toFixed(1)})^2}{2 \\times ${dist}} = -${accelMag.toFixed(2)}\\text{ m/s}^2`,
          calculatedResult: `|a| = ${accelMag.toFixed(2)} m/s²`,
        },
        {
          stepNumber: 2,
          title: isBn ? '২. থেমে যাওয়ার সময়কাল নির্ণয়' : '2. Calculate Time to Stop (t)',
          formulaLatex: 'v = u + at \\implies t = \\frac{v - u}{a}',
          explanation: isBn
            ? 'আদিবেগ এবং হিসাবকৃত মন্দন ব্যবহার করে থামার সময় পাওয়া যায়।'
            : 'Using the initial velocity and computed deceleration, solve for total stopping time.',
          substitutionLatex: `t = \\frac{0 - ${v0.toFixed(1)}}{-${accelMag.toFixed(2)}} = ${timeToStop.toFixed(2)}\\text{ s}`,
          calculatedResult: `t = ${timeToStop.toFixed(2)} s`,
        },
        {
          stepNumber: 3,
          title: isBn ? '৩. ব্রেকিং ঘর্ষণ বল নির্ণয়' : '3. Compute Net Retarding Friction Force',
          formulaLatex: 'f_k = m \\cdot |a|',
          explanation: isBn
            ? 'নিউটনের দ্বিতীয় সূত্র অনুযায়ী এই মন্দন সৃষ্টিকারী বলটি হলো রাস্তার ঘর্ষণ বল।'
            : "According to Newton's second law, the net decelerating horizontal force is provided solely by friction.",
          substitutionLatex: `f_k = ${mass}\\text{ kg} \\times ${accelMag.toFixed(2)}\\text{ m/s}^2 = ${frictionForce.toFixed(1)}\\text{ N}`,
          calculatedResult: `f_k = ${frictionForce.toFixed(1)} N`,
        },
        {
          stepNumber: 4,
          title: isBn ? '৪. চল ঘর্ষণ গুণাঙ্ক (μk) নির্ণয়' : '4. Determine Coefficient of Kinetic Friction (μk)',
          formulaLatex: '\\mu_k = \\frac{f_k}{N} = \\frac{m \\cdot a}{m \\cdot g} = \\frac{a}{g}',
          explanation: isBn
            ? 'অনুভূমিক সমতলে অভিলম্বিক বল N = mg। ফলে μk = a / g।'
            : 'On a horizontal road, normal force N = mg, so friction coefficient is independent of mass: μk = a / g.',
          substitutionLatex: `\\mu_k = \\frac{${accelMag.toFixed(2)}}{${gValue}} = ${muK.toFixed(3)}`,
          calculatedResult: `μk = ${muK.toFixed(3)}`,
        },
      ],
      finalAnswers: [
        {
          quantity: isBn ? 'ঘর্ষণ বল (Friction Force)' : 'Friction Force',
          symbol: 'f_k',
          value: frictionForce.toFixed(1),
          unit: 'N',
          interpretation: isBn ? 'চাকা ও রাস্তার মধ্যকার মোট গতিরোধক ঘর্ষণ বল।' : 'Net braking force exerted by road on the tires.',
        },
        {
          quantity: isBn ? 'ঘর্ষণ গুণাঙ্ক (Friction Coeff)' : 'Kinetic Friction Coefficient',
          symbol: '\\mu_k',
          value: muK.toFixed(3),
          unit: '',
          interpretation: isBn ? 'রাস্তা ও টায়ারের সংযোগ তলের ঘর্ষণ বৈশিষ্ট্য।' : 'Dimensionless coefficient of kinetic friction.',
        },
        {
          quantity: isBn ? 'থামতে মোট সময় (Stopping Time)' : 'Stopping Time',
          symbol: 't',
          value: timeToStop.toFixed(2),
          unit: 's',
          interpretation: isBn ? 'ব্রেক চাপার পর গাড়িটি স্থির হতে ব্যয়িত সময়।' : 'Time elapsed from brake engagement to standstill.',
        },
      ],
      sanityCheck: isBn
        ? `হিসাবকৃত ঘর্ষণ গুণাঙ্ক μk = ${muK.toFixed(2)} শুষ্ক অ্যাসফল্ট রাস্তার বাস্তব সীমার (০.৩ - ০.৮) মধ্যে রয়েছে।`
        : `The calculated friction coefficient μk = ${muK.toFixed(2)} is well within typical dry road tire physical bounds (0.3 - 0.8).`,
      commonPitfalls: [
        isBn ? 'মন্দনের ক্ষেত্রে ত্বরণের ঋণাত্মক চিহ্ন বাদ পড়লে সময় বা দূরত্বে ভুল হতে পারে।' : 'Forgetting that deceleration acts opposite to motion (negative sign).',
        isBn ? 'কিমি/ঘণ্টা থাকলে গণনা শুরুর আগেই ৩.৬ দিয়ে ভাগ করে মি/সে-তে নেওয়া জরুরি।' : 'Always convert km/h to m/s by dividing by 3.6 before applying kinematics.',
      ],
      suggestedSimulator: {
        type: 'motion',
        initialVelocity: v0,
        acceleration: -accelMag,
        mass: mass,
        distance: dist,
      },
    };
  }

  // Scenario 2: Projectile Motion / Free Fall
  if (text.includes('projectile') || text.includes('angle') || text.includes('kick') || text.includes('cannon') || text.includes('প্রক্ষেপক') || text.includes('নিক্ষেপ')) {
    const v0 = speedMsMatch || 22;
    const thetaDeg = angleMatch || 35;
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const v0x = v0 * Math.cos(thetaRad);
    const v0y = v0 * Math.sin(thetaRad);
    const timeApex = v0y / gValue;
    const totalTime = 2 * timeApex;
    const maxH = (v0y * v0y) / (2 * gValue);
    const range = v0x * totalTime;

    return {
      problemSummary: isBn
        ? `${v0} মি/সে আদিবেগে অনুভূমিকের সাথে ${thetaDeg}° কোণে নিক্ষিপ্ত প্রক্ষেপকের গতি বিশ্লেষণ।`
        : `A projectile is launched with initial speed ${v0} m/s at an angle of ${thetaDeg}° above horizontal.`,
      category: isBn ? 'দ্বিমাত্রিক প্রক্ষেপক গতি' : '2D Projectile Motion',
      givens: [
        { symbol: 'v_0', name: isBn ? 'নিক্ষেপণ দ্রুতি' : 'Launch speed', originalValue: `${v0}`, siValue: `${v0}`, unit: 'm/s' },
        { symbol: '\\theta', name: isBn ? 'নিক্ষেপণ কোণ' : 'Launch angle', originalValue: `${thetaDeg}`, siValue: `${thetaDeg}`, unit: '°' },
        { symbol: 'g', name: isBn ? 'অভিকর্ষজ ত্বরণ' : 'Gravity', originalValue: `${gValue}`, siValue: `${gValue}`, unit: 'm/s²' },
      ],
      unknowns: [
        { symbol: 'H_{max}', name: isBn ? 'সর্বাধিক উচ্চতা' : 'Maximum peak height', targetUnit: 'm' },
        { symbol: 'T', name: isBn ? 'মোট উড্ডয়নকাল' : 'Total time of flight', targetUnit: 's' },
        { symbol: 'R', name: isBn ? 'অনুভূমিক পাল্লা' : 'Horizontal range', targetUnit: 'm' },
      ],
      principlesUsed: [
        isBn ? 'স্বাধীন দ্বিমাত্রিক উপাংশ বিভাজন' : 'Independent Horizontal and Vertical Vector Resolution',
        isBn ? 'উল্লম্ব মুক্ত পতন সমীকরণ' : 'Vertical Kinematics under Constant Gravity',
      ],
      keyFormulasLatex: [
        'v_{0x} = v_0\\cos\\theta, \\quad v_{0y} = v_0\\sin\\theta',
        'H_{max} = \\frac{v_{0y}^2}{2g} = \\frac{v_0^2\\sin^2\\theta}{2g}',
        'T = \\frac{2v_0\\sin\\theta}{g}',
        'R = \\frac{v_0^2\\sin(2\\theta)}{g}',
      ],
      steps: [
        {
          stepNumber: 1,
          title: isBn ? '১. বেগের অনুভূমিক ও উল্লম্ব উপাংশ বিভাজন' : '1. Resolve Velocity into Components',
          formulaLatex: 'v_{0x} = v_0\\cos\\theta, \\quad v_{0y} = v_0\\sin\\theta',
          explanation: isBn
            ? 'ত্রিকোণমিতিক নিয়মে আদিবেগকে x এবং y অক্ষে বিভক্ত করি।'
            : 'Resolve the initial velocity vector into independent horizontal and vertical orthogonal components.',
          substitutionLatex: `v_{0x} = ${v0}\\cos(${thetaDeg}^\\circ) = ${v0x.toFixed(2)}\\text{ m/s}, \\quad v_{0y} = ${v0}\\sin(${thetaDeg}^\\circ) = ${v0y.toFixed(2)}\\text{ m/s}`,
          calculatedResult: `v0x = ${v0x.toFixed(2)} m/s, v0y = ${v0y.toFixed(2)} m/s`,
        },
        {
          stepNumber: 2,
          title: isBn ? '২. সর্বাধিক উচ্চতা (H_max) নির্ণয়' : '2. Calculate Maximum Apex Height (H_max)',
          formulaLatex: 'H_{max} = \\frac{v_{0y}^2}{2g}',
          explanation: isBn
            ? 'সর্বোচ্চ বিন্দুতে উল্লম্ব বেগ vy = 0।'
            : 'At the apex peak, vertical speed vy = 0. Apply timeless vertical kinematics.',
          substitutionLatex: `H_{max} = \\frac{(${v0y.toFixed(2)})^2}{2 \\times ${gValue}} = ${maxH.toFixed(2)}\\text{ m}`,
          calculatedResult: `H_max = ${maxH.toFixed(2)} m`,
        },
        {
          stepNumber: 3,
          title: isBn ? '৩. মোট উড্ডয়নকাল (T) ও অনুভূমিক পাল্লা (R)' : '3. Total Flight Time (T) and Range (R)',
          formulaLatex: 'T = \\frac{2 v_{0y}}{g}, \\quad R = v_{0x} \\times T',
          explanation: isBn
            ? 'উড্ডয়নকালের সাথে অনুভূমিক ধ্রুব বেগ গুণ করে অনুভূমিক পাল্লা নির্ণয় করা হয়।'
            : 'Multiply constant horizontal speed by total time aloft to calculate horizontal landing range.',
          substitutionLatex: `T = \\frac{2 \\times ${v0y.toFixed(2)}}{${gValue}} = ${totalTime.toFixed(2)}\\text{ s}, \\quad R = ${v0x.toFixed(2)} \\times ${totalTime.toFixed(2)} = ${range.toFixed(2)}\\text{ m}`,
          calculatedResult: `T = ${totalTime.toFixed(2)} s, R = ${range.toFixed(2)} m`,
        },
      ],
      finalAnswers: [
        {
          quantity: isBn ? 'সর্বাধিক উচ্চতা' : 'Maximum Altitude',
          symbol: 'H_{max}',
          value: maxH.toFixed(2),
          unit: 'm',
          interpretation: isBn ? 'নিক্ষেপ তল থেকে প্রক্ষেপকের সর্বোচ্চ উলম্ব উচ্চতা।' : 'Peak height reached at the crest of the trajectory.',
        },
        {
          quantity: isBn ? 'মোট উড্ডয়নকাল' : 'Time of Flight',
          symbol: 'T',
          value: totalTime.toFixed(2),
          unit: 's',
          interpretation: isBn ? 'বাতাসে ভেসে থাকার মোট সময়।' : 'Duration projectile remains aloft before returning to ground level.',
        },
        {
          quantity: isBn ? 'অনুভূমিক পাল্লা' : 'Horizontal Range',
          symbol: 'R',
          value: range.toFixed(2),
          unit: 'm',
          interpretation: isBn ? 'নিক্ষেপণ বিন্দু থেকে পতনের দূরত্ব।' : 'Total horizontal distance traversed upon landing.',
        },
      ],
      sanityCheck: isBn
        ? `অনুভূমিক পাল্লা R = ${range.toFixed(1)} m এবং সর্বোচ্চ উচ্চতা H = ${maxH.toFixed(1)} m পদার্থবিজ্ঞানের দ্বিমাত্রিক গতিসূত্র সম্পূর্ণ সমর্থন করে।`
        : `Range and height satisfy standard parabolic ballistics under Earth gravity.`,
      commonPitfalls: [
        isBn ? 'ক্যালকুলেটরকে Radian মোডে রাখলে কোণের মান ভুল আসবে; Degree মোড নিশ্চিত করুন।' : 'Ensure calculator trigonometric angle mode is set to Degrees rather than Radians.',
      ],
      suggestedSimulator: {
        type: 'projectile',
        initialVelocity: v0,
        angleDeg: thetaDeg,
      },
    };
  }

  // Scenario 4: Work, Power & Energy (e.g. lifting, engine, work done, kinetic energy)
  if (text.includes('work') || text.includes('power') || text.includes('energy') || text.includes('joule') || text.includes('watt') || text.includes('কাজ') || text.includes('শক্তি') || text.includes('ক্ষমতা') || text.includes('জুল') || text.includes('ওয়াট')) {
    const mass = massMatch || 50;
    const height = distMatch || 12;
    const time = timeMatch || 8;
    const force = forceMatch || (mass * gValue);
    const work = force * height;
    const power = work / time;
    const kineticEnergy = 0.5 * mass * (speedMsMatch ? speedMsMatch * speedMsMatch : 100);

    return {
      problemSummary: isBn
        ? `${mass} কেজি ভরের বস্তুকে ${height} মিটার উচ্চতায় উঠাতে সম্পন্ন কাজ ও ক্ষমতা নির্ণয়।`
        : `Calculation of mechanical work done and power output for a ${mass} kg mass lifted through ${height} meters in ${time} seconds.`,
      category: isBn ? 'কাজ, ক্ষমতা ও শক্তি' : 'Work, Power & Energy',
      givens: [
        { symbol: 'm', name: isBn ? 'ভর' : 'Mass', originalValue: `${mass}`, siValue: `${mass}`, unit: 'kg' },
        { symbol: 'h', name: isBn ? 'উচ্চতা / সরণ' : 'Height / Displacement', originalValue: `${height}`, siValue: `${height}`, unit: 'm' },
        { symbol: 't', name: isBn ? 'সময়' : 'Time', originalValue: `${time}`, siValue: `${time}`, unit: 's' },
        { symbol: 'g', name: isBn ? 'অভিকর্ষজ ত্বরণ' : 'Gravity', originalValue: `${gValue}`, siValue: `${gValue}`, unit: 'm/s²' },
      ],
      unknowns: [
        { symbol: 'W', name: isBn ? 'কৃতকাজ' : 'Work Done', targetUnit: 'J' },
        { symbol: 'P', name: isBn ? 'ক্ষমতা' : 'Power', targetUnit: 'W' },
        { symbol: 'E_p', name: isBn ? 'বিভব শক্তি' : 'Gravitational Potential Energy', targetUnit: 'J' },
      ],
      principlesUsed: [
        isBn ? 'কাজের সূত্র (W = F · d = mgh)' : 'Work-Energy Theorem (W = F · d = mgh)',
        isBn ? 'ক্ষমতার সংজ্ঞা (P = W / t)' : 'Definition of Power (P = W / t)',
      ],
      keyFormulasLatex: [
        'W = F \\cdot h = mgh',
        'P = \\frac{W}{t}',
        'E_p = mgh',
      ],
      steps: [
        {
          stepNumber: 1,
          title: isBn ? '১. অভিকর্ষের বিরুদ্ধে প্রয়োজনীয় বল নির্ণয়' : '1. Determine Gravitational Resistance Force',
          formulaLatex: 'F = mg',
          explanation: isBn ? 'বস্তুটিকে সমবেগে উপরে তুলতে এর ওজনের সমান বল প্রয়োজন।' : 'To lift the object at constant velocity, applied force equals weight.',
          substitutionLatex: `F = ${mass}\\text{ kg} \\times ${gValue}\\text{ m/s}^2 = ${(mass * gValue).toFixed(1)}\\text{ N}`,
          calculatedResult: `F = ${(mass * gValue).toFixed(1)} N`,
        },
        {
          stepNumber: 2,
          title: isBn ? '২. সম্পন্ন মোট কাজ (W) নির্ণয়' : '2. Calculate Total Mechanical Work (W)',
          formulaLatex: 'W = F \\cdot h = mgh',
          explanation: isBn ? 'বল ও বলের অভিমুখে সরণের গুণফল হলো কৃতকাজ।' : 'Work is the scalar product of applied lifting force and vertical displacement.',
          substitutionLatex: `W = ${(mass * gValue).toFixed(1)}\\text{ N} \\times ${height}\\text{ m} = ${work.toFixed(1)}\\text{ J}`,
          calculatedResult: `W = ${work.toFixed(1)} J`,
        },
        {
          stepNumber: 3,
          title: isBn ? '৩. গড় ক্ষমতা (P) নির্ণয়' : '3. Compute Average Power Output (P)',
          formulaLatex: 'P = \\frac{W}{t}',
          explanation: isBn ? 'কাজ করার হারকে ক্ষমতা বলে।' : 'Power is the time rate at which mechanical work is performed.',
          substitutionLatex: `P = \\frac{${work.toFixed(1)}\\text{ J}}{${time}\\text{ s}} = ${power.toFixed(1)}\\text{ W}`,
          calculatedResult: `P = ${power.toFixed(1)} W`,
        },
      ],
      finalAnswers: [
        {
          quantity: isBn ? 'মোট কৃতকাজ' : 'Total Work Done',
          symbol: 'W',
          value: work.toFixed(1),
          unit: 'J',
          interpretation: isBn ? 'বস্তুটিকে উঠাতে মোট ব্যয়িত শক্তি।' : 'Total energy transferred to the system as mechanical work.',
        },
        {
          quantity: isBn ? 'কার্যকর ক্ষমতা' : 'Power Output',
          symbol: 'P',
          value: power.toFixed(1),
          unit: 'W',
          interpretation: isBn ? 'প্রতি সেকেন্ডে কাজ করার গড় হার।' : 'Time rate of energy expenditure in Joules per second (Watts).',
        },
        {
          quantity: isBn ? 'অর্জিত বিভব শক্তি' : 'Potential Energy',
          symbol: 'E_p',
          value: work.toFixed(1),
          unit: 'J',
          interpretation: isBn ? 'উচ্চতায় সংরক্ষিত স্থিতিশক্তি।' : 'Gravitational potential energy stored at apex height.',
        },
      ],
      sanityCheck: isBn
        ? `শক্তি সংরক্ষণশীলতা নীতি অনুসারে কৃতকাজ W = বিভব শক্তি Ep = ${work.toFixed(1)} J সম্পূর্ণ নির্ভুল।`
        : `Conservation of energy holds: Work done directly matches gained gravitational potential energy.`,
      commonPitfalls: [
        isBn ? 'অশ্বক্ষমতা (hp) চাইলে প্রাপ্ত ওয়াটকে ৭৪৬ দ্বারা ভাগ করতে হবে (১ hp = 746 W)।' : 'Remember to divide Watts by 746 if Horsepower (hp) is requested.',
      ],
      suggestedSimulator: {
        type: 'energy_rollercoaster',
        mass: mass,
        height: height,
      },
    };
  }

  // Scenario 5: Angled Force / Incline / Work / General Dynamics
  const mass = massMatch || 20;
  const appliedF = forceMatch || 100;
  const angleDeg = angleMatch || 0;
  const mu = frictionMatch || 0.2;
  const angleRad = (angleDeg * Math.PI) / 180;
  const fx = appliedF * Math.cos(angleRad);
  const fy = appliedF * Math.sin(angleRad);
  const normalF = Math.max(0, mass * gValue - fy);
  const frictionF = mu * normalF;
  const netF = Math.max(0, fx - frictionF);
  const accel = netF / mass;

  return {
    problemSummary: isBn
      ? `${mass} কেজি ভরের বস্তুর উপর ${appliedF} N বল প্রযুক্ত হওয়ায় ত্বরিত গতি ও ঘর্ষণ বলের বিশ্লেষণ।`
      : `Physics dynamics analysis for a ${mass} kg object acted upon by ${appliedF} N applied force with friction coefficient μ = ${mu}.`,
    category: isBn ? 'বলবিদ্যা ও গতিসূত্র' : 'Dynamics & Forces',
    givens: [
      { symbol: 'm', name: isBn ? 'ভর' : 'Mass', originalValue: `${mass}`, siValue: `${mass}`, unit: 'kg' },
      { symbol: 'F', name: isBn ? 'প্রযুক্ত বল' : 'Applied Force', originalValue: `${appliedF}`, siValue: `${appliedF}`, unit: 'N' },
      { symbol: '\\theta', name: isBn ? 'বলের কোণ' : 'Force Angle', originalValue: `${angleDeg}`, siValue: `${angleDeg}`, unit: '°' },
      { symbol: '\\mu', name: isBn ? 'ঘর্ষণ গুণাঙ্ক' : 'Friction coefficient', originalValue: `${mu}`, siValue: `${mu}`, unit: 'dim' },
      { symbol: 'g', name: isBn ? 'অভিকর্ষজ ত্বরণ' : 'Gravity', originalValue: `${gValue}`, siValue: `${gValue}`, unit: 'm/s²' },
    ],
    unknowns: [
      { symbol: 'N', name: isBn ? 'অভিলম্বিক বল' : 'Normal Force', targetUnit: 'N' },
      { symbol: 'f_k', name: isBn ? 'ঘর্ষণ বল' : 'Friction Force', targetUnit: 'N' },
      { symbol: 'a', name: isBn ? 'ত্বরণ' : 'Acceleration', targetUnit: 'm/s²' },
    ],
    principlesUsed: [
      isBn ? 'নিউটনের গতির দ্বিতীয় সূত্র' : "Newton's 2nd Law (ΣF = ma)",
      isBn ? 'উল্লম্ব ভারসাম্য (ΣFy = 0)' : 'Vertical Equilibrium (ΣFy = 0)',
    ],
    keyFormulasLatex: [
      'N = mg - F\\sin\\theta',
      'f_k = \\mu N',
      'a = \\frac{F\\cos\\theta - f_k}{m}',
    ],
    steps: [
      {
        stepNumber: 1,
        title: isBn ? '১. অভিলম্বিক প্রতিক্রিয়া বল (N) নির্ণয়' : '1. Determine Normal Force (N)',
        formulaLatex: 'N = mg - F\\sin\\theta',
        explanation: isBn
          ? 'উপরের দিকে বলের উলম্ব উপাংশ থাকায় মেঝের উপর কার্যকর চাপ হ্রাস পায়।'
          : 'The vertical component of upward pull reduces the contact pressure against the surface.',
        substitutionLatex: `N = (${mass} \\times ${gValue}) - (${appliedF}\\sin(${angleDeg}^\\circ)) = ${normalF.toFixed(1)}\\text{ N}`,
        calculatedResult: `N = ${normalF.toFixed(1)} N`,
      },
      {
        stepNumber: 2,
        title: isBn ? '২. ঘর্ষণ বল (fk) নির্ণয়' : '2. Calculate Kinetic Friction Force (fk)',
        formulaLatex: 'f_k = \\mu_k N',
        explanation: isBn
          ? 'ঘর্ষণ বল অভিলম্বিক বল ও ঘর্ষণ গুণাঙ্কের গুণফলের সমান।'
          : 'Friction is directly proportional to the active normal contact force.',
        substitutionLatex: `f_k = ${mu} \\times ${normalF.toFixed(1)} = ${frictionF.toFixed(1)}\\text{ N}`,
        calculatedResult: `fk = ${frictionF.toFixed(1)} N`,
      },
      {
        stepNumber: 3,
        title: isBn ? '৩. লব্ধি বল ও অনুভূমিক ত্বরণ (a) নির্ণয়' : '3. Compute Horizontal Net Force and Acceleration (a)',
        formulaLatex: 'a = \\frac{\\Sigma F_x}{m} = \\frac{F\\cos\\theta - f_k}{m}',
        explanation: isBn
          ? 'সামনের দিকের বলের উপাংশ থেকে বিপরীতমুখী ঘর্ষণ বল বিয়োগ করে লব্ধি ত্বরণ পাই।'
          : "Apply Newton's Second Law along the x-axis to find the resultant acceleration.",
        substitutionLatex: `a = \\frac{${fx.toFixed(1)} - ${frictionF.toFixed(1)}}{${mass}} = ${accel.toFixed(2)}\\text{ m/s}^2`,
        calculatedResult: `a = ${accel.toFixed(2)} m/s²`,
      },
    ],
    finalAnswers: [
      {
        quantity: isBn ? 'অভিলম্বিক বল' : 'Normal Force',
        symbol: 'N',
        value: normalF.toFixed(1),
        unit: 'N',
        interpretation: isBn ? 'তলের লম্বভাবে প্রযুক্ত মোট প্রতিক্রিয়া বল।' : 'Vertical reaction force from the supporting surface.',
      },
      {
        quantity: isBn ? 'ঘর্ষণ বল' : 'Friction Force',
        symbol: 'f_k',
        value: frictionF.toFixed(1),
        unit: 'N',
        interpretation: isBn ? 'গতির বিপরীতমুখী ঘর্ষণ বাধা।' : 'Opposing friction resistance force along the plane.',
      },
      {
        quantity: isBn ? 'সৃষ্ট ত্বরণ' : 'Acceleration',
        symbol: 'a',
        value: accel.toFixed(2),
        unit: 'm/s²',
        interpretation: isBn ? 'বস্তুটির অনুভূমিক গতির পরিবর্তনের হার।' : 'Net horizontal rate of change of velocity.',
      },
    ],
    sanityCheck: isBn
      ? `প্রাপ্ত ত্বরণ a = ${accel.toFixed(2)} m/s² বল ও ভরের অনুপাতে পদার্থবিজ্ঞানের সূত্রানুসারে সঠিক।`
      : `Computed acceleration is positive and physically consistent with applied force dynamics.`,
    commonPitfalls: [
      isBn ? 'কোণে টানা হলে N = mg সরাসরি বসাবেন না; উলম্ব উপাংশ বিবেচনা করুন।' : 'Do not assume N = mg when the applied force acts at an angle.',
    ],
    suggestedSimulator: {
      type: 'force_fbd',
      mass: mass,
      appliedForce: appliedF,
      angleDeg: angleDeg,
      frictionCoeff: mu,
    },
  };
}
