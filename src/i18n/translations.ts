export type Language = 'en' | 'bn';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appTitleHighlight: string;
  appSubtitle: string;
  curriculumBadge: string;
  gravityLabel: string;
  languageSelect: string;
  themeToggle: string;
  themeDark: string;
  themeLight: string;

  // Navigation Tabs
  tabAiSolver: string;
  tabAiSolverBadge: string;
  tabMotion: string;
  tabForce: string;
  tabEnergy: string;
  tabUnitConverter: string;
  tabUnitConverterBadge: string;
  tabCheatsheet: string;
  tabQuiz: string;
  tabQuizBadge: string;

  // AI Solver
  aiSolverTitle: string;
  aiSolverSubtitle: string;
  curriculumExamplesTitle: string;
  curriculumExamplesSubtitle: string;
  inputProblemLabel: string;
  inputProblemPlaceholder: string;
  allUnitsSupportedNote: string;
  solveButton: string;
  solvingButton: string;
  tutorTitle: string;
  tutorSubtitle: string;
  tutorThinking: string;
  tutorPlaceholder: string;
  tutorSend: string;
  yourQuestion: string;
  tutorAnswerBadge: string;

  // Solvers Common
  solveStepByStep: string;
  gConstantNote: string;
  stepResults: string;
  finalResults: string;
  sanityCheckTitle: string;
  pitfallsTitle: string;
  givensTitle: string;
  unknownsTitle: string;
  principlesTitle: string;
  governingEquation: string;
  algebraicIsolation: string;
  substitutionWithUnits: string;
  askTutorAboutStep: string;
  askTutorAboutSolution: string;
  askTutorPlaceholder: string;
  copySolution: string;
  copied: string;
  exportPdfReport: string;
  exportingPdf: string;
  pdfExported: string;
  derivationTitle: string;
  stepsCount: string;

  // Motion Solver
  motion1DTab: string;
  motion2DTab: string;
  motion1DTitle: string;
  motion1DDesc: string;
  motion2DTitle: string;
  motion2DDesc: string;
  targetUnknownLabel: string;
  initialVelocity: string;
  finalVelocity: string;
  acceleration: string;
  time: string;
  displacement: string;
  launchSpeed: string;
  launchAngle: string;
  initialHeight: string;
  calculateTrajectory: string;

  // Force Solver
  forceFlatTab: string;
  forceInclineTab: string;
  forceFlatTitle: string;
  forceFlatDesc: string;
  forceInclineTitle: string;
  forceInclineDesc: string;
  mass: string;
  appliedForce: string;
  angleAboveHorizontal: string;
  staticFriction: string;
  kineticFriction: string;
  inclineAngle: string;
  motionDirection: string;
  slidingDownhill: string;
  movingUphill: string;
  externalPush: string;
  calculateForces: string;
  calculateRampForces: string;

  // Work & Energy Solver
  energyConservationTab: string;
  workDoneTab: string;
  powerEfficiencyTab: string;
  energyConservationTitle: string;
  energyConservationDesc: string;
  workDoneTitle: string;
  workDoneDesc: string;
  powerEfficiencyTitle: string;
  powerEfficiencyDesc: string;
  initialHeightH1: string;
  initialSpeedV1: string;
  finalHeightH2: string;
  thermalLoss: string;
  solveConservation: string;
  forceF: string;
  displacementD: string;
  angleBetweenFD: string;
  calculateWork: string;
  workOrEnergy: string;
  timeTaken: string;
  inputPowerOptional: string;
  calculatePower: string;

  // Unit Converter
  converterTitle: string;
  converterSubtitle: string;
  searchUnitPlaceholder: string;
  highSchoolPresets: string;
  fromSourceLabel: string;
  toTargetLabel: string;
  swapUnits: string;
  precisionLabel: string;
  scientificNotationLabel: string;
  stepAnalysisTitle: string;
  unitsCancellationBadge: string;
  directCalculation: string;
  liveEquivalentsTitle: string;
  unitsCount: string;
  equivalentOf: string;
  setAsTarget: string;
  setAsFrom: string;
  examTipsTitle: string;

  // Formula Cheatsheet
  cheatsheetTitle: string;
  cheatsheetSubtitle: string;
  searchFormulaPlaceholder: string;
  filterAll: string;
  filterMotion: string;
  filterForce: string;
  filterEnergy: string;
  filterPower: string;
  variablesAndUnits: string;
  whenToUse: string;
  examTrap: string;

  // Simulator Labels
  interactiveSimulatorTitle: string;
  liveSimulation: string;
  play: string;
  pause: string;
  reset: string;
  height: string;
  speed: string;
  timeElapsed: string;
  normalForce: string;
  gravityForce: string;
  frictionForce: string;
  kineticEnergy: string;
  potentialEnergy: string;
  totalMechanicalEnergy: string;

  // Footer
  footerTitle: string;
  footerCurricula: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appTitle: 'Physi',
    appTitleHighlight: 'Step',
    appSubtitle: 'Step-by-step Physics Math Engine & Interactive Simulators',
    curriculumBadge: 'HS Physics',
    gravityLabel: 'g:',
    languageSelect: 'Language',
    themeToggle: 'Switch Theme',
    themeDark: 'Dark Mode',
    themeLight: 'High-Contrast Light',

    tabAiSolver: 'AI Problem Solver & Tutor',
    tabAiSolverBadge: 'Smart',
    tabMotion: 'Motion & Kinematics',
    tabForce: 'Forces & Newton’s Laws',
    tabEnergy: 'Work, Power & Energy',
    tabUnitConverter: 'Physics Unit Converter',
    tabUnitConverterBadge: 'Tools',
    tabCheatsheet: 'Master Formula Reference',
    tabQuiz: 'Physics Practice Quiz',
    tabQuizBadge: 'Test',

    aiSolverTitle: 'AI High School Physics Problem Solver & Tutor',
    aiSolverSubtitle: 'Ask any word problem from high school physics curricula. Solved step-by-step with LaTeX derivations and physical intuition checks.',
    curriculumExamplesTitle: 'High School Curriculum Examples (AP Physics / GCSE / Standard)',
    curriculumExamplesSubtitle: 'Click any question to solve instantly',
    inputProblemLabel: 'Type or paste any Physics word problem (Motion, Force, Work, Power & Energy):',
    inputProblemPlaceholder: 'e.g. A 1200 kg car moving at 20 m/s hits the brakes and skids to a stop over 40 m. Find the friction force and stopping time...',
    allUnitsSupportedNote: 'Understands any unit (km/h, mph, grams, kW, hp, degrees, etc.)',
    solveButton: 'Generate Step-by-Step Solution',
    solvingButton: 'Deriving Physics Math Steps...',
    tutorTitle: 'Physics Tutor Conversation',
    tutorSubtitle: 'Get instant high-school conceptual explanations',
    tutorThinking: 'Thinking through the physics concept...',
    tutorPlaceholder: 'Ask a follow-up question (e.g. Why did kinetic energy double?)...',
    tutorSend: 'Send',
    yourQuestion: 'Your Question',
    tutorAnswerBadge: 'Physics Tutor Explanation',

    solveStepByStep: 'Solve Step-by-Step',
    gConstantNote: 'm/s²',
    stepResults: 'Step Result:',
    finalResults: 'Final Mathematical Results',
    sanityCheckTitle: 'Physics Intuition & Sanity Check',
    pitfallsTitle: 'High School Exam Pitfalls to Avoid',
    givensTitle: 'Identified Given Quantities (SI Converted)',
    unknownsTitle: 'Target Unknowns to Solve',
    principlesTitle: 'Fundamental Physics Principles',
    governingEquation: 'Governing Equation',
    algebraicIsolation: 'Algebraic Isolation:',
    substitutionWithUnits: 'Numerical Substitution with Units',
    askTutorAboutStep: 'Confused about this step? Ask AI Tutor',
    askTutorAboutSolution: 'Ask Physics Tutor About This Solution',
    askTutorPlaceholder: 'e.g., Why does normal force decrease when pulling at an angle?',
    copySolution: 'Copy Solution',
    copied: 'Copied Summary',
    exportPdfReport: 'Export PDF Report',
    exportingPdf: 'Generating PDF...',
    pdfExported: 'PDF Downloaded',
    derivationTitle: 'Step-by-Step Mathematical Derivation',
    stepsCount: 'Steps',

    motion1DTab: '1D Linear Motion (SUVAT)',
    motion2DTab: '2D Projectile Trajectory',
    motion1DTitle: '1D Kinematics Equation Solver',
    motion1DDesc: 'Select your target unknown and input at least 3 known values.',
    motion2DTitle: '2D Projectile Motion Solver',
    motion2DDesc: 'Enter launch velocity, angle, and initial elevation.',
    targetUnknownLabel: 'Select Target Unknown to Solve For:',
    initialVelocity: 'Initial Velocity (u):',
    finalVelocity: 'Final Velocity (v) [m/s]:',
    acceleration: 'Acceleration (a) [m/s²]:',
    time: 'Time (t) [s]:',
    displacement: 'Displacement (s) [m]:',
    launchSpeed: 'Launch Speed (v₀) [m/s]:',
    launchAngle: 'Launch Angle (θ) [degrees]:',
    initialHeight: 'Initial Height (y₀) [meters]:',
    calculateTrajectory: 'Calculate Projectile Flight',

    forceFlatTab: 'Flat Surface: Pull at Angle & Friction',
    forceInclineTab: 'Inclined Plane & Ramp Dynamics',
    forceFlatTitle: "Newton's 2nd Law & Friction on Flat Surface",
    forceFlatDesc: 'Calculate Normal force, static/kinetic friction, and net acceleration.',
    forceInclineTitle: 'Inclined Plane Force Resolution',
    forceInclineDesc: 'Calculate parallel & perpendicular gravity components, friction, and ramp acceleration.',
    mass: 'Mass (m) [kg]:',
    appliedForce: 'Applied Force (F) [N]:',
    angleAboveHorizontal: 'Angle Above Horizontal (θ) [°]:',
    staticFriction: 'Static Friction (μs):',
    kineticFriction: 'Kinetic Friction (μk):',
    inclineAngle: 'Incline Angle (θ) [°]:',
    motionDirection: 'Motion Direction:',
    slidingDownhill: 'Sliding Downhill',
    movingUphill: 'Moving Uphill',
    externalPush: 'External Push (F) [N]:',
    calculateForces: 'Calculate Forces & Acceleration',
    calculateRampForces: 'Calculate Ramp Forces',

    energyConservationTab: 'Conservation of Mechanical Energy (Ek + Ep)',
    workDoneTab: 'Work Done by Force (W = F·d·cosθ)',
    powerEfficiencyTab: 'Power & Mechanical Efficiency',
    energyConservationTitle: 'Mechanical Energy Conservation Engine',
    energyConservationDesc: 'Calculate final velocity or maximum height reached across energy states.',
    workDoneTitle: 'Work Calculation by Constant Force',
    workDoneDesc: 'Evaluate scalar energy transfer with directional angle factor.',
    powerEfficiencyTitle: 'Power Output & Motor Efficiency Calculator',
    powerEfficiencyDesc: 'Calculate energy transfer rate in Watts and conversion efficiency.',
    initialHeightH1: 'Initial Height (h₁) [m]:',
    initialSpeedV1: 'Initial Speed (v₁) [m/s]:',
    finalHeightH2: 'Final Height (h₂) [m]:',
    thermalLoss: 'Thermal Loss (W_loss) [J]:',
    solveConservation: 'Solve Energy Conservation',
    forceF: 'Force (F) [Newtons]:',
    displacementD: 'Displacement (d) [meters]:',
    angleBetweenFD: 'Angle between F & d (θ) [°]:',
    calculateWork: 'Calculate Work Done (Joules)',
    workOrEnergy: 'Work or Energy (W) [Joules]:',
    timeTaken: 'Time Taken (t) [seconds]:',
    inputPowerOptional: 'Input Power (P_in) [Watts, optional]:',
    calculatePower: 'Calculate Power & Efficiency',

    converterTitle: 'Physics Unit Converter & Dimensional Analysis',
    converterSubtitle: 'Convert between SI, Imperial, CGS, and physical constant units with step-by-step factor-label cancellation methods and KaTeX math proofs.',
    searchUnitPlaceholder: 'Search category or unit (e.g. cal, J, mph)...',
    highSchoolPresets: 'High School Presets:',
    fromSourceLabel: 'From (Source Value & Unit)',
    toTargetLabel: 'To (Target Converted Output)',
    swapUnits: 'Swap',
    precisionLabel: 'Precision:',
    scientificNotationLabel: 'Sci (10ⁿ)',
    stepAnalysisTitle: 'Step-by-Step Dimensional Analysis (Factor-Label Method)',
    unitsCancellationBadge: 'Units Cancellation',
    directCalculation: 'Direct Calculation:',
    liveEquivalentsTitle: 'Live Equivalent Values',
    unitsCount: 'units',
    equivalentOf: 'Equivalent value of',
    setAsTarget: 'set as target',
    setAsFrom: 'from',
    examTipsTitle: 'Exam Tips & Conversion Pitfalls',

    cheatsheetTitle: 'High School Physics Master Formula Reference',
    cheatsheetSubtitle: 'Curriculum formulas with variable definitions, SI units, usage conditions, and exam traps.',
    searchFormulaPlaceholder: 'Search formula, topic, law...',
    filterAll: 'All',
    filterMotion: 'Motion',
    filterForce: 'Force',
    filterEnergy: 'Work & Energy',
    filterPower: 'Power',
    variablesAndUnits: 'Variables & SI Units:',
    whenToUse: 'When to use:',
    examTrap: 'Exam Trap:',

    interactiveSimulatorTitle: 'Interactive Simulator Visualizing This Problem',
    liveSimulation: 'Interactive Visual Simulator',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    height: 'Height',
    speed: 'Speed',
    timeElapsed: 'Time Elapsed',
    normalForce: 'Normal Force',
    gravityForce: 'Gravity',
    frictionForce: 'Friction',
    kineticEnergy: 'Kinetic Energy (Ek)',
    potentialEnergy: 'Potential Energy (Ep)',
    totalMechanicalEnergy: 'Total Energy (E)',

    footerTitle: 'PhysiStep High School Physics Suite',
    footerCurricula: 'Covering AP Physics 1, GCSE & High School Curricula (Bengali & English)',
  },

  bn: {
    appTitle: 'ফিজি',
    appTitleHighlight: 'স্টেপ',
    appSubtitle: 'ধাপে ধাপে পদার্থবিজ্ঞান সমাধান ও ইন্টারঅ্যাক্টিভ সিমুলেটর',
    curriculumBadge: 'এইচএস ফিজিক্স',
    gravityLabel: 'g:',
    languageSelect: 'ভাষা',
    themeToggle: 'থিম পরিবর্তন',
    themeDark: 'ডার্ক মোড',
    themeLight: 'উচ্চ-কন্ট্রাস্ট লাইট',

    tabAiSolver: 'এআই পদার্থবিজ্ঞান সমাধান ও টিউটর',
    tabAiSolverBadge: 'স্মার্ট',
    tabMotion: 'গতি ও গতিবিদ্যা (Motion)',
    tabForce: 'বল ও নিউটনের গতিসূত্র (Force)',
    tabEnergy: 'কাজ, ক্ষমতা ও শক্তি (Energy)',
    tabUnitConverter: 'পদার্থবিজ্ঞান একক রূপান্তরকারী',
    tabUnitConverterBadge: 'টুলস',
    tabCheatsheet: 'পদার্থবিজ্ঞানের সূত্রাবলী (Cheatsheet)',
    tabQuiz: 'প্র্যাকটিস কুইজ ও সেলফ-টেস্ট',
    tabQuizBadge: 'টেস্ট',

    aiSolverTitle: 'এআই পদার্থবিজ্ঞান গাণিতিক সমাধানকারী ও টিউটর',
    aiSolverSubtitle: 'উচ্চ মাধ্যমিক ও মাধ্যমিক পদার্থবিজ্ঞানের যে কোনো গাণিতিক সমস্যা বাংলায় বা ইংরেজিতে লিখুন। ধাপে ধাপে সমীকরণ প্রতিপাদন, একক রূপান্তর ও বাস্তব ব্যাখ্যাসহ সমাধান পান।',
    curriculumExamplesTitle: 'পাঠ্যক্রমের নমুনা গাণিতিক সমস্যা (AP / GCSE / জাতীয় পাঠ্যক্রম)',
    curriculumExamplesSubtitle: 'তাৎক্ষণিক সমাধানের জন্য যেকোনো প্রশ্নে ক্লিক করুন',
    inputProblemLabel: 'পদার্থবিজ্ঞানের যেকোনো গাণিতিক সমস্যা লিখুন বা পেস্ট করুন (গতি, বল, কাজ, ক্ষমতা ও শক্তি):',
    inputProblemPlaceholder: 'উদাহরণ: একটি ১২০০ কেজি ভরের গাড়ি ২০ মি/সে বেগে চলার সময় ব্রেক চেপে ৪০ মিটার দূরত্বে গিয়ে থেমে যায়। রাস্তার ঘর্ষণ বল, ঘর্ষণ গুণাঙ্ক এবং থামতে কত সময় লাগবে নির্ণয় করো...',
    allUnitsSupportedNote: 'যেকোনো একক (km/h, mph, গ্রাম, kW, অশ্বক্ষমতা, ডিগ্রি ইত্যাদি) সমর্থন করে',
    solveButton: 'ধাপে ধাপে সমাধান তৈরি করুন',
    solvingButton: 'পদার্থবিজ্ঞানের সমাধান প্রতিপাদন হচ্ছে...',
    tutorTitle: 'পদার্থবিজ্ঞান টিউটর আলোচনা',
    tutorSubtitle: 'যেকোনো ধারণার সহজ ও স্পষ্ট ব্যাখ্যা পান',
    tutorThinking: 'পদার্থবিজ্ঞানের মূল সূত্র বিশ্লেষণ করা হচ্ছে...',
    tutorPlaceholder: 'সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন (যেমন: গতিশক্তি দ্বিগুণ হলো কেন?)...',
    tutorSend: 'পাঠান',
    yourQuestion: 'আপনার প্রশ্ন',
    tutorAnswerBadge: 'পদার্থবিজ্ঞান শিক্ষকের ব্যাখ্যা',

    solveStepByStep: 'ধাপে ধাপে সমাধান করুন',
    gConstantNote: 'm/s²',
    stepResults: 'ধাপের ফলাফল:',
    finalResults: 'চূড়ান্ত গাণিতিক ফলাফল',
    sanityCheckTitle: 'পদার্থবিজ্ঞানের ধারণা ও বাস্তব যাচাই (Sanity Check)',
    pitfallsTitle: 'পরীক্ষায় সাধারণ ভুলত্রুটি (Exam Traps)',
    givensTitle: 'প্রদত্ত রাশিমালা (SI এককে রূপান্তরিত)',
    unknownsTitle: 'নির্ণেয় রাশিমালা (Target Unknowns)',
    principlesTitle: 'ব্যবহৃত পদার্থবিজ্ঞানের মূলনীতি',
    governingEquation: 'মূল সমীকরণ',
    algebraicIsolation: 'বীজগাণিতিক পক্ষান্তর:',
    substitutionWithUnits: 'এককসহ সংখ্যাগত মান বসানো',
    askTutorAboutStep: 'এই ধাপে সমস্যা? এআই টিউটরকে জিজ্ঞাসা করুন',
    askTutorAboutSolution: 'এই সমাধান সম্পর্কে টিউটরকে জিজ্ঞাসা করুন',
    askTutorPlaceholder: 'যেমন: কোণে বল প্রয়োগ করলে অভিলম্বিক প্রতিক্রিয়া বল কেন কমে যায়?',
    copySolution: 'সমাধান কপি করুন',
    copied: 'কপি সম্পন্ন হয়েছে',
    exportPdfReport: 'পিডিএফ রিপোর্ট এক্সপোর্ট',
    exportingPdf: 'পিডিএফ তৈরি হচ্ছে...',
    pdfExported: 'পিডিএফ ডাউনলোড সম্পন্ন',
    derivationTitle: 'ধাপে ধাপে গাণিতিক প্রতিপাদন',
    stepsCount: 'টি ধাপ',

    motion1DTab: 'একমাত্রিক রৈখিক গতি (1D SUVAT)',
    motion2DTab: 'দ্বিমাত্রিক প্রক্ষেপক গতি (2D Projectile)',
    motion1DTitle: 'একমাত্রিক গতি সমীকরণ ক্যালকুলেটর',
    motion1DDesc: 'যে রাশিটি নির্ণয় করতে চান তা নির্বাচন করুন এবং কমপক্ষে ৩টি জানা মান লিখুন।',
    motion2DTitle: 'প্রক্ষেপক গতি (Projectile Motion) সমাধানকারী',
    motion2DDesc: 'নিক্ষেপণ বেগ, কোণ এবং প্রাথমিক উচ্চতা লিখুন।',
    targetUnknownLabel: 'নির্ণেয় রাশি নির্বাচন করুন:',
    initialVelocity: 'আদিবেগ (u):',
    finalVelocity: 'শেষবেগ (v) [m/s]:',
    acceleration: 'ত্বরণ (a) [m/s²]:',
    time: 'সময় (t) [s]:',
    displacement: 'সরণ (s) [m]:',
    launchSpeed: 'নিক্ষেপণ বেগ (v₀) [m/s]:',
    launchAngle: 'নিক্ষেপণ কোণ (θ) [ডিগ্রি]:',
    initialHeight: 'প্রাথমিক উচ্চতা (y₀) [মিটার]:',
    calculateTrajectory: 'প্রক্ষেপকের গতিপথ হিসাব করুন',

    forceFlatTab: 'অনুভূমিক তল: কোণে বল প্রয়োগ ও ঘর্ষণ',
    forceInclineTab: 'আনত তলের গতিবিদ্যা (Inclined Plane)',
    forceFlatTitle: 'নিউটনের ২য় সূত্র ও তলের ঘর্ষণ বল',
    forceFlatDesc: 'অভিলম্বিক প্রতিক্রিয়া বল, স্থিতি/গতীয় ঘর্ষণ এবং নিট ত্বরণ হিসাব করুন।',
    forceInclineTitle: 'আনত তলে বলের উপাংশ বিভাজন ও গতি',
    forceInclineDesc: 'তলের সমান্তরাল ও লম্ব উপাংশ, ঘর্ষণ বল এবং ত্বরান্বিত গতি নির্ণয় করুন।',
    mass: 'ভর (m) [kg]:',
    appliedForce: 'প্রযুক্ত বল (F) [N]:',
    angleAboveHorizontal: 'অনুভূমিকের সাথে কোণ (θ) [°]:',
    staticFriction: 'স্থিতি ঘর্ষণ গুণাঙ্ক (μs):',
    kineticFriction: 'গতীয় ঘর্ষণ গুণাঙ্ক (μk):',
    inclineAngle: 'আনত কোণ (θ) [°]:',
    motionDirection: 'গতির দিক:',
    slidingDownhill: 'নিচের দিকে পিছলে নামছে',
    movingUphill: 'উপরের দিকে তোলা হচ্ছে',
    externalPush: 'বাহ্যিক ধাক্কা বল (F) [N]:',
    calculateForces: 'বল ও ত্বরণ হিসাব করুন',
    calculateRampForces: 'আনত তলের বল ও ত্বরণ হিসাব করুন',

    energyConservationTab: 'যান্ত্রিক শক্তির নিত্যতা সূত্র (Ek + Ep)',
    workDoneTab: 'বল দ্বারা কৃতকাজ (W = F·d·cosθ)',
    powerEfficiencyTab: 'ক্ষমতা ও যান্ত্রিক কর্মদক্ষতা',
    energyConservationTitle: 'যান্ত্রিক শক্তি সংরক্ষণশীলতা হিসাবকারী',
    energyConservationDesc: 'শক্তির রূপান্তরে শেষ বেগ বা অর্জিত সর্বোচ্চ উচ্চতা নির্ণয় করুন।',
    workDoneTitle: 'ধ্রুব বল দ্বারা কৃতকাজের পরিমাপ',
    workDoneDesc: 'বলের মান, সরণ ও মধ্যবর্তী কোণ থেকে স্কেলার কাজ নির্ণয় করুন।',
    powerEfficiencyTitle: 'ক্ষমতা ও ইঞ্জিনের কর্মদক্ষতা পরিমাপক',
    powerEfficiencyDesc: 'কাজের হার (ওয়াট) এবং প্রদত্ত ও লভ্য কার্যকর ক্ষমতার শতকরা অনুপাত নির্ণয় করুন।',
    initialHeightH1: 'প্রাথমিক উচ্চতা (h₁) [m]:',
    initialSpeedV1: 'প্রাথমিক বেগ (v₁) [m/s]:',
    finalHeightH2: 'শেষ উচ্চতা (h₂) [m]:',
    thermalLoss: 'তাপীয় শক্তির ক্ষয় (W_loss) [J]:',
    solveConservation: 'শক্তির নিত্যতা সমাধান করুন',
    forceF: 'বল (F) [নিউটন]:',
    displacementD: 'সরণ (d) [মিটার]:',
    angleBetweenFD: 'F ও d এর মধ্যবর্তী কোণ (θ) [°]:',
    calculateWork: 'কৃতকাজ হিসাব করুন (জুল)',
    workOrEnergy: 'কাজ বা শক্তি (W) [জুল]:',
    timeTaken: 'প্রয়োজনীয় সময় (t) [সেকেন্ড]:',
    inputPowerOptional: 'প্রদত্ত মোট ক্ষমতা (P_in) [ওয়াট, ঐচ্ছিক]:',
    calculatePower: 'ক্ষমতা ও কর্মদক্ষতা হিসাব করুন',

    converterTitle: 'পদার্থবিজ্ঞান একক রূপান্তরকারী ও মাত্রা বিশ্লেষণ',
    converterSubtitle: 'এসআই (SI), ইম্পেরিয়াল ও সিজিএস এককের মধ্যে ধাপে ধাপে গুণক-লেবেল পদ্ধতির সাহায্যে KaTeX সমীকরণসহ একক রূপান্তর করুন।',
    searchUnitPlaceholder: 'একক বা রাশি খুঁজুন (যেমন: জুল, ক্যালরি, কিমি/ঘণ্টা)...',
    highSchoolPresets: 'নমুনা রূপান্তরসমূহ:',
    fromSourceLabel: 'প্রদত্ত মান ও উৎস একক (From)',
    toTargetLabel: 'কাঙ্ক্ষিত গন্তব্য একক (To)',
    swapUnits: 'অদলবদল',
    precisionLabel: 'দশমিক স্থান:',
    scientificNotationLabel: 'সূচকীয় মান (10ⁿ)',
    stepAnalysisTitle: 'ধাপে ধাপে মাত্রা বিশ্লেষণ পদ্ধতি (Factor-Label Method)',
    unitsCancellationBadge: 'একক কাটাকাটি পদ্ধতি',
    directCalculation: 'সরাসরি হিসাব:',
    liveEquivalentsTitle: 'সকল এককে সমতুল্য মানসমূহ',
    unitsCount: 'টি একক',
    equivalentOf: 'এর সমতুল্য মান:',
    setAsTarget: 'গন্তব্য হিসেবে নিন',
    setAsFrom: 'উৎস হিসেবে নিন',
    examTipsTitle: 'একক রূপান্তরের সতর্কতা ও পরামর্শ',

    cheatsheetTitle: 'পদার্থবিজ্ঞানের আবশ্যকীয় সূত্রের তালিকা (Formula Sheet)',
    cheatsheetSubtitle: 'রাশির প্রতীক, এসআই একক, সূত্রের প্রয়োগক্ষেত্র এবং পরীক্ষার সাধারণ ভুলত্রুটি।',
    searchFormulaPlaceholder: 'সূত্র, বিষয় বা নীতি খুঁজুন...',
    filterAll: 'সকল সূত্র',
    filterMotion: 'গতিবিদ্যা',
    filterForce: 'বলবিদ্যা',
    filterEnergy: 'কাজ ও শক্তি',
    filterPower: 'ক্ষমতা',
    variablesAndUnits: 'রাশিমালা ও এসআই একক:',
    whenToUse: 'কখন ব্যবহার করবেন:',
    examTrap: 'পরীক্ষার সতর্কতা:',

    interactiveSimulatorTitle: 'এই সমস্যার ইন্টারঅ্যাক্টিভ সিমুলেটর দৃশ্যমানকরণ',
    liveSimulation: 'সরাসরি দৃশ্যমান সিমুলেটর',
    play: 'প্লে',
    pause: 'পজ',
    reset: 'রিসেট',
    height: 'উচ্চতা',
    speed: 'বেগ',
    timeElapsed: 'অতিবাহিত সময়',
    normalForce: 'অভিলম্বিক বল',
    gravityForce: 'অভিকর্ষ বল',
    frictionForce: 'ঘর্ষণ বল',
    kineticEnergy: 'গতিশক্তি (Ek)',
    potentialEnergy: 'বিভব শক্তি (Ep)',
    totalMechanicalEnergy: 'মোট যান্ত্রিক শক্তি (E)',

    footerTitle: 'ফিজি-স্টেপ উচ্চ মাধ্যমিক পদার্থবিজ্ঞান সমাধান ইঞ্জিন',
    footerCurricula: 'মাধ্যমিক, উচ্চ মাধ্যমিক (HSC), AP Physics ও GCSE পাঠ্যক্রমের জন্য প্রস্তুত (বাংলা ও ইংরেজি)',
  },
};
