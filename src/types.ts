export type PhysicsCategory = 'motion' | 'force' | 'work_energy' | 'ai_solver' | 'simulators' | 'cheat_sheet' | 'practice';

export type GravityConstant = 9.8 | 9.81 | 10.0;

export interface StepDerivation {
  stepNumber: number;
  title: string;
  formulaLatex: string;
  explanation: string;
  algebraicDerivation?: string;
  substitutionLatex: string;
  calculatedResult: string;
}

export interface PhysicalQuantity {
  symbol: string;
  name: string;
  value: number | string;
  unit: string;
  siValue?: number | string;
  conversionNote?: string;
}

export interface PhysicsSolution {
  title: string;
  category: string;
  problemSummary: string;
  givens: PhysicalQuantity[];
  unknowns: { symbol: string; name: string; targetUnit: string }[];
  principlesUsed: string[];
  keyFormulasLatex: string[];
  steps: StepDerivation[];
  finalAnswers: {
    quantity: string;
    symbol: string;
    value: string;
    unit: string;
    scientificNotation?: string;
    interpretation: string;
  }[];
  sanityCheck: string;
  commonPitfalls: string[];
  simConfig?: {
    type: 'motion' | 'projectile' | 'inclined_plane' | 'force_fbd' | 'energy_rollercoaster';
    [key: string]: any;
  };
}

export interface PresetProblem {
  id: string;
  category: 'motion' | 'force' | 'work_energy';
  subtopic: string;
  subtopicBn?: string;
  difficulty: 'Foundation' | 'Standard' | 'Advanced AP';
  title: string;
  titleBn?: string;
  problemText: string;
  problemTextBn?: string;
  tags: string[];
  tagsBn?: string[];
}

export interface UnitOption {
  label: string;
  symbol: string;
  toBaseFactor: number; // Multiply input by this to get standard SI unit
}
