import { GravityConstant, PhysicsSolution, StepDerivation } from '../types';

export function formatNum(num: number, decimals: number = 2): string {
  if (isNaN(num)) return 'NaN';
  if (!isFinite(num)) return 'Infinity';
  if (Math.abs(num) >= 1e5 || (Math.abs(num) < 0.001 && num !== 0)) {
    return num.toExponential(decimals);
  }
  // Trim trailing zeroes
  const fixed = num.toFixed(decimals);
  return parseFloat(fixed).toString();
}

export function toScientific(num: number): string {
  if (isNaN(num) || !isFinite(num) || num === 0) return '';
  return num.toExponential(2);
}

// -------------------------------------------------------------
// 1. MOTION: 1D Kinematics Solver
// -------------------------------------------------------------
export function solveKinematics1D(params: {
  u?: number; // initial velocity (m/s)
  v?: number; // final velocity (m/s)
  a?: number; // acceleration (m/s^2)
  t?: number; // time (s)
  s?: number; // displacement (m)
  target: 'u' | 'v' | 'a' | 't' | 's';
  g: GravityConstant;
}): PhysicsSolution {
  const { u, v, a, t, s, target } = params;
  const steps = [];

  // Helper variables
  let calculatedVal = 0;
  let formulaLatex = '';
  let derivationLatex = '';
  let substitutionLatex = '';
  let explanation = '';
  let unit = '';
  let targetName = '';

  if (target === 'v') {
    targetName = 'Final Velocity';
    unit = 'm/s';
    if (u !== undefined && a !== undefined && t !== undefined) {
      formulaLatex = 'v = u + at';
      calculatedVal = u + a * t;
      derivationLatex = 'v = u + at';
      substitutionLatex = `v = (${u}\\text{ m/s}) + (${a}\\text{ m/s}^2)(${t}\\text{ s})`;
      explanation = 'Use the first equation of motion since initial velocity, acceleration, and time are given.';
    } else if (u !== undefined && a !== undefined && s !== undefined) {
      formulaLatex = 'v^2 = u^2 + 2as \\implies v = \\sqrt{u^2 + 2as}';
      const inside = u * u + 2 * a * s;
      if (inside < 0) throw new Error('Mathematical domain error: u² + 2as is negative (cannot take square root).');
      calculatedVal = Math.sqrt(inside);
      derivationLatex = 'v = \\sqrt{u^2 + 2as}';
      substitutionLatex = `v = \\sqrt{(${u})^2 + 2(${a})(${s})} = \\sqrt{${formatNum(inside)}}`;
      explanation = 'Use the timeless kinematic equation since distance is provided without time.';
    } else if (s !== undefined && u !== undefined && t !== undefined && t > 0) {
      formulaLatex = 's = \\frac{u + v}{2}t \\implies v = \\frac{2s}{t} - u';
      calculatedVal = (2 * s) / t - u;
      derivationLatex = 'v = \\frac{2s}{t} - u';
      substitutionLatex = `v = \\frac{2(${s})}{${t}} - (${u})`;
      explanation = 'Use average velocity definition multiplied by time to solve for final velocity.';
    } else {
      throw new Error('Please provide at least 3 known kinematic variables to solve for final velocity (v).');
    }
  } else if (target === 's') {
    targetName = 'Displacement / Distance';
    unit = 'm';
    if (u !== undefined && t !== undefined && a !== undefined) {
      formulaLatex = 's = ut + \\frac{1}{2}at^2';
      calculatedVal = u * t + 0.5 * a * t * t;
      derivationLatex = 's = ut + \\frac{1}{2}at^2';
      substitutionLatex = `s = (${u}\\text{ m/s})(${t}\\text{ s}) + \\frac{1}{2}(${a}\\text{ m/s}^2)(${t}\\text{ s})^2`;
      explanation = 'Use the displacement formula under constant acceleration.';
    } else if (u !== undefined && v !== undefined && a !== undefined && a !== 0) {
      formulaLatex = 'v^2 = u^2 + 2as \\implies s = \\frac{v^2 - u^2}{2a}';
      calculatedVal = (v * v - u * u) / (2 * a);
      derivationLatex = 's = \\frac{v^2 - u^2}{2a}';
      substitutionLatex = `s = \\frac{(${v})^2 - (${u})^2}{2(${a})} = \\frac{${formatNum(v * v - u * u)}}{${formatNum(2 * a)}}`;
      explanation = 'Use the timeless equation to find stopping or travel distance directly.';
    } else if (u !== undefined && v !== undefined && t !== undefined) {
      formulaLatex = 's = \\left(\\frac{u + v}{2}\\right)t';
      calculatedVal = ((u + v) / 2) * t;
      derivationLatex = 's = \\frac{u+v}{2} \\cdot t';
      substitutionLatex = `s = \\left(\\frac{${u} + ${v}}{2}\\right)(${t})`;
      explanation = 'Multiply the average velocity by time elapsed.';
    } else {
      throw new Error('Please provide at least 3 known kinematic variables to solve for displacement (s).');
    }
  } else if (target === 'a') {
    targetName = 'Acceleration';
    unit = 'm/s²';
    if (v !== undefined && u !== undefined && t !== undefined && t > 0) {
      formulaLatex = 'v = u + at \\implies a = \\frac{v - u}{t}';
      calculatedVal = (v - u) / t;
      derivationLatex = 'a = \\frac{v - u}{t}';
      substitutionLatex = `a = \\frac{${v}\\text{ m/s} - ${u}\\text{ m/s}}{${t}\\text{ s}}`;
      explanation = 'Acceleration is defined as the rate of change of velocity over time.';
    } else if (v !== undefined && u !== undefined && s !== undefined && s !== 0) {
      formulaLatex = 'v^2 = u^2 + 2as \\implies a = \\frac{v^2 - u^2}{2s}';
      calculatedVal = (v * v - u * u) / (2 * s);
      derivationLatex = 'a = \\frac{v^2 - u^2}{2s}';
      substitutionLatex = `a = \\frac{(${v})^2 - (${u})^2}{2(${s})}`;
      explanation = 'Rearrange the third kinematic equation to isolate acceleration.';
    } else if (s !== undefined && u !== undefined && t !== undefined && t > 0) {
      formulaLatex = 's = ut + \\frac{1}{2}at^2 \\implies a = \\frac{2(s - ut)}{t^2}';
      calculatedVal = (2 * (s - u * t)) / (t * t);
      derivationLatex = 'a = \\frac{2(s - ut)}{t^2}';
      substitutionLatex = `a = \\frac{2(${s} - (${u})(${t}))}{(${t})^2}`;
      explanation = 'Isolate acceleration from the displacement quadratic equation.';
    } else {
      throw new Error('Please provide at least 3 known kinematic variables to solve for acceleration (a).');
    }
  } else if (target === 't') {
    targetName = 'Time Duration';
    unit = 's';
    if (v !== undefined && u !== undefined && a !== undefined && a !== 0) {
      formulaLatex = 'v = u + at \\implies t = \\frac{v - u}{a}';
      calculatedVal = (v - u) / a;
      if (calculatedVal < 0) {
        explanation = 'Note: Calculated time is negative; check the directional signs of u, v, and a.';
      } else {
        explanation = 'Isolate time from the standard acceleration formula.';
      }
      derivationLatex = 't = \\frac{v - u}{a}';
      substitutionLatex = `t = \\frac{${v} - (${u})}{${a}}`;
    } else if (s !== undefined && u !== undefined && v !== undefined && u + v !== 0) {
      formulaLatex = 's = \\left(\\frac{u + v}{2}\\right)t \\implies t = \\frac{2s}{u + v}';
      calculatedVal = (2 * s) / (u + v);
      derivationLatex = 't = \\frac{2s}{u + v}';
      substitutionLatex = `t = \\frac{2(${s})}{${u} + ${v}}`;
      explanation = 'Divide total displacement by average velocity.';
    } else {
      throw new Error('Please provide at least 3 known kinematic variables to solve for time (t).');
    }
  } else if (target === 'u') {
    targetName = 'Initial Velocity';
    unit = 'm/s';
    if (v !== undefined && a !== undefined && t !== undefined) {
      formulaLatex = 'v = u + at \\implies u = v - at';
      calculatedVal = v - a * t;
      derivationLatex = 'u = v - at';
      substitutionLatex = `u = ${v} - (${a})(${t})`;
      explanation = 'Rearrange the velocity formula backwards to find the initial launch/start speed.';
    } else if (v !== undefined && a !== undefined && s !== undefined) {
      formulaLatex = 'v^2 = u^2 + 2as \\implies u = \\sqrt{v^2 - 2as}';
      const inside = v * v - 2 * a * s;
      if (inside < 0) throw new Error('Mathematical domain error: v² - 2as is negative.');
      calculatedVal = Math.sqrt(inside);
      derivationLatex = 'u = \\sqrt{v^2 - 2as}';
      substitutionLatex = `u = \\sqrt{(${v})^2 - 2(${a})(${s})}`;
      explanation = 'Calculate initial velocity from final velocity and distance.';
    } else {
      throw new Error('Please provide at least 3 known kinematic variables to solve for initial velocity (u).');
    }
  }

  const givens = [];
  if (u !== undefined) givens.push({ symbol: 'u', name: 'Initial Velocity', value: u, unit: 'm/s' });
  if (v !== undefined) givens.push({ symbol: 'v', name: 'Final Velocity', value: v, unit: 'm/s' });
  if (a !== undefined) givens.push({ symbol: 'a', name: 'Acceleration', value: a, unit: 'm/s²' });
  if (t !== undefined) givens.push({ symbol: 't', name: 'Time Elapsed', value: t, unit: 's' });
  if (s !== undefined) givens.push({ symbol: 's', name: 'Displacement', value: s, unit: 'm' });

  steps.push({
    stepNumber: 1,
    title: 'Identify Variables and Coordinate System',
    formulaLatex: '\\text{Given: } ' + givens.map((g) => `${g.symbol} = ${g.value}\\text{ ${g.unit}}`).join(', '),
    explanation: 'List known physical quantities and ensure all units conform to standard SI (meters, seconds, m/s).',
    substitutionLatex: `\\text{Target: } ${target} = \\, ?`,
    calculatedResult: 'Ready for formula selection',
  });

  steps.push({
    stepNumber: 2,
    title: 'Select Appropriate Kinematic Formula',
    formulaLatex: formulaLatex,
    explanation: explanation,
    algebraicDerivation: derivationLatex,
    substitutionLatex: `\\text{Formula isolated for } ${target}: \\quad ${derivationLatex}`,
    calculatedResult: 'Formula ready',
  });

  steps.push({
    stepNumber: 3,
    title: 'Substitute Numerical Values and Compute',
    formulaLatex: derivationLatex,
    explanation: 'Substitute the given values with their directional signs (+ for forward/up, - for backward/down).',
    substitutionLatex: substitutionLatex,
    calculatedResult: `${target} = ${formatNum(calculatedVal)} ${unit}`,
  });

  const formattedAns = formatNum(calculatedVal);

  return {
    title: '1D Kinematics Constant Acceleration Solution',
    category: 'Motion',
    problemSummary: `An object is moving in 1D under constant acceleration. We are solving for ${targetName} (${target}) given the initial kinematic state.`,
    givens,
    unknowns: [{ symbol: target, name: targetName, targetUnit: unit }],
    principlesUsed: ["Newton's Kinematics of Linear Motion", 'Constant Acceleration Equations (SUVAT)'],
    keyFormulasLatex: [formulaLatex],
    steps,
    finalAnswers: [
      {
        quantity: targetName,
        symbol: target,
        value: formattedAns,
        unit: unit,
        scientificNotation: toScientific(calculatedVal),
        interpretation: `The object has a ${targetName.toLowerCase()} of ${formattedAns} ${unit}.`,
      },
    ],
    sanityCheck:
      calculatedVal >= 0
        ? `The value is positive, indicating motion/direction along the positive reference axis.`
        : `The negative sign indicates a vector pointing opposite to the chosen positive coordinate direction.`,
    commonPitfalls: [
      'Forgetting that deceleration means a negative acceleration value (a < 0).',
      'Confusing displacement (s) with distance travelled (displacement can be negative or zero in round trips).',
      'Using v = s/t when acceleration is NOT zero. (v = s/t only applies for constant velocity!)',
    ],
    simConfig: {
      type: 'motion',
      initialVelocity: u ?? 0,
      acceleration: a ?? (v !== undefined && u !== undefined && t ? (v - u) / t : 0),
      time: t ?? (calculatedVal > 0 ? calculatedVal : 5),
    },
  };
}

// -------------------------------------------------------------
// 2. MOTION: 2D Projectile Motion Solver
// -------------------------------------------------------------
export function solveProjectileMotion(params: {
  v0: number; // initial launch speed (m/s)
  angleDeg: number; // launch angle in degrees (0 = horizontal, 90 = vertical)
  y0?: number; // initial launch height in meters (default 0)
  g: GravityConstant;
}): PhysicsSolution {
  const { v0, angleDeg, y0 = 0, g } = params;
  const rad = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  // Time to apex (highest point)
  const tApex = v0y / g;
  // Maximum height above launch position
  const hApexAboveY0 = (v0y * v0y) / (2 * g);
  const hMaxTotal = y0 + hApexAboveY0;

  // Total flight time solving: y(t) = y0 + v0y*t - 0.5*g*t^2 = 0
  // 0.5*g*t^2 - v0y*t - y0 = 0
  const A = 0.5 * g;
  const B = -v0y;
  const C = -y0;
  const discriminant = B * B - 4 * A * C;
  const tTotal = (-B + Math.sqrt(Math.max(0, discriminant))) / (2 * A);

  // Horizontal Range
  const range = v0x * tTotal;

  // Impact velocity components
  const vImpactX = v0x;
  const vImpactY = v0y - g * tTotal;
  const vImpactSpeed = Math.sqrt(vImpactX * vImpactX + vImpactY * vImpactY);
  const impactAngleDeg = (Math.atan2(Math.abs(vImpactY), vImpactX) * 180) / Math.PI;

  const givens = [
    { symbol: 'v_0', name: 'Initial Launch Speed', value: v0, unit: 'm/s' },
    { symbol: '\\theta', name: 'Launch Angle', value: angleDeg, unit: '°' },
    { symbol: 'y_0', name: 'Initial Launch Height', value: y0, unit: 'm' },
    { symbol: 'g', name: 'Acceleration due to Gravity', value: g, unit: 'm/s²' },
  ];

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'Resolve Initial Velocity into Orthogonal Components',
      formulaLatex: 'v_{0x} = v_0 \\cos\\theta, \\quad v_{0y} = v_0 \\sin\\theta',
      explanation:
        'Motion along the horizontal (x) axis is uniform (a_x = 0), while motion along the vertical (y) axis experiences constant gravitational downward acceleration (a_y = -g).',
      algebraicDerivation: 'v_{0x} = v_0\\cos\\theta, \\quad v_{0y} = v_0\\sin\\theta',
      substitutionLatex: `v_{0x} = ${v0}\\cos(${angleDeg}^\\circ) = ${formatNum(v0x)}\\text{ m/s}, \\quad v_{0y} = ${v0}\\sin(${angleDeg}^\\circ) = ${formatNum(v0y)}\\text{ m/s}`,
      calculatedResult: `v_{0x} = ${formatNum(v0x)} m/s, \\, v_{0y} = ${formatNum(v0y)} m/s`,
    },
    {
      stepNumber: 2,
      title: 'Calculate Maximum Height (Apex)',
      formulaLatex: 'H_{max} = y_0 + \\frac{v_{0y}^2}{2g}',
      explanation: 'At the peak of the trajectory, the vertical velocity momentarily drops to zero (v_y = 0).',
      algebraicDerivation: 'v_y^2 = v_{0y}^2 - 2g(y - y_0) = 0 \\implies H_{max} = y_0 + \\frac{v_{0y}^2}{2g}',
      substitutionLatex: `H_{max} = ${y0} + \\frac{(${formatNum(v0y)})^2}{2(${g})} = ${y0} + \\frac{${formatNum(v0y * v0y)}}{${formatNum(2 * g)}} = ${formatNum(hMaxTotal)}\\text{ m}`,
      calculatedResult: `H_{max} = ${formatNum(hMaxTotal)} m (Peak reached at t = ${formatNum(tApex)} s)`,
    },
    {
      stepNumber: 3,
      title: 'Determine Total Flight Time',
      formulaLatex: 'y(t) = y_0 + v_{0y}t - \\frac{1}{2}gt^2 = 0',
      explanation: 'Set the vertical position to ground level (y = 0) and solve the quadratic equation for positive time t.',
      algebraicDerivation: `\\frac{1}{2}(${g})t^2 - (${formatNum(v0y)})t - (${y0}) = 0 \\implies t = \\frac{v_{0y} + \\sqrt{v_{0y}^2 + 2gy_0}}{g}`,
      substitutionLatex: `t_{flight} = \\frac{${formatNum(v0y)} + \\sqrt{(${formatNum(v0y)})^2 + 2(${g})(${y0})}}{${g}} = ${formatNum(tTotal)}\\text{ s}`,
      calculatedResult: `t_{flight} = ${formatNum(tTotal)} s`,
    },
    {
      stepNumber: 4,
      title: 'Compute Horizontal Range (Total Distance)',
      formulaLatex: 'R = v_{0x} \\cdot t_{flight}',
      explanation: 'Because horizontal acceleration is zero (air resistance ignored), the horizontal distance is simply velocity multiplied by total flight time.',
      algebraicDerivation: 'R = v_0\\cos\\theta \\cdot t_{flight}',
      substitutionLatex: `R = (${formatNum(v0x)}\\text{ m/s}) \\times (${formatNum(tTotal)}\\text{ s}) = ${formatNum(range)}\\text{ m}`,
      calculatedResult: `Range R = ${formatNum(range)} m`,
    },
    {
      stepNumber: 5,
      title: 'Impact Speed and Angle upon Landing',
      formulaLatex: 'v_{impact} = \\sqrt{v_x^2 + v_y^2}, \\quad \\theta_{impact} = \\arctan\\left(\\frac{|v_y|}{v_x}\\right)',
      explanation: 'Calculate vector magnitude from both velocity components just before hitting the ground.',
      substitutionLatex: `v_y = ${formatNum(v0y)} - (${g})(${formatNum(tTotal)}) = ${formatNum(vImpactY)}\\text{ m/s} \\implies v_{impact} = \\sqrt{(${formatNum(vImpactX)})^2 + (${formatNum(vImpactY)})^2} = ${formatNum(vImpactSpeed)}\\text{ m/s}`,
      calculatedResult: `v_{impact} = ${formatNum(vImpactSpeed)} m/s at ${formatNum(impactAngleDeg)}° below horizontal`,
    },
  ];

  return {
    title: '2D Projectile Motion Complete Trajectory Analysis',
    category: 'Motion',
    problemSummary: `A projectile is launched with speed ${v0} m/s at an angle of ${angleDeg}° from an initial height of ${y0} m.`,
    givens,
    unknowns: [
      { symbol: 'H_{max}', name: 'Maximum Altitude', targetUnit: 'm' },
      { symbol: 't_{flight}', name: 'Total Time of Flight', targetUnit: 's' },
      { symbol: 'R', name: 'Horizontal Range', targetUnit: 'm' },
      { symbol: 'v_{impact}', name: 'Landing Speed', targetUnit: 'm/s' },
    ],
    principlesUsed: [
      'Independence of Horizontal and Vertical Motions',
      'Uniform Linear Motion in X-axis (ax = 0)',
      'Uniformly Accelerated Motion in Y-axis (ay = -g)',
    ],
    keyFormulasLatex: [
      'v_{0x} = v_0\\cos\\theta, \\quad v_{0y} = v_0\\sin\\theta',
      'H_{max} = y_0 + \\frac{v_{0y}^2}{2g}',
      'R = v_{0x} \\cdot t_{flight}',
    ],
    steps,
    finalAnswers: [
      { quantity: 'Maximum Height', symbol: 'H_{max}', value: formatNum(hMaxTotal), unit: 'm', interpretation: `Reaches peak altitude of ${formatNum(hMaxTotal)} m at t = ${formatNum(tApex)} s.` },
      { quantity: 'Total Flight Time', symbol: 't_{flight}', value: formatNum(tTotal), unit: 's', interpretation: `Remains in the air for ${formatNum(tTotal)} seconds.` },
      { quantity: 'Horizontal Range', symbol: 'R', value: formatNum(range), unit: 'm', interpretation: `Lands ${formatNum(range)} meters away horizontally.` },
      { quantity: 'Impact Speed', symbol: 'v_{impact}', value: formatNum(vImpactSpeed), unit: 'm/s', interpretation: `Strikes the ground at ${formatNum(vImpactSpeed)} m/s (${formatNum(impactAngleDeg)}° below horizontal).` },
    ],
    sanityCheck: `When launched from ground (y0 = 0), peak height occurs exactly at half flight time (tApex = ${formatNum(tApex)} s, tTotal/2 = ${formatNum(tTotal / 2)} s). Symmetry holds!`,
    commonPitfalls: [
      'Using total launch speed v0 in horizontal distance instead of the horizontal component v0x = v0*cos(θ).',
      'Mixing up sine and cosine for the angle components (v0x = v0*cosθ, v0y = v0*sinθ with respect to horizontal).',
      'Assuming maximum range always occurs at 45° even when launch height y0 > 0 (for elevated launch, optimal angle is < 45°).',
    ],
    simConfig: {
      type: 'projectile',
      initialVelocity: v0,
      angleDeg: angleDeg,
      height: y0,
    },
  };
}

// -------------------------------------------------------------
// 3. FORCE: Friction & Newton's 2nd Law on Flat Surface
// -------------------------------------------------------------
export function solveForceFriction(params: {
  mass: number; // kg
  fPull: number; // Applied pulling force in Newtons
  angleDeg: number; // Pulling angle above horizontal (0 for horizontal pull)
  muS?: number; // Static friction coefficient
  muK?: number; // Kinetic friction coefficient
  g: GravityConstant;
}): PhysicsSolution {
  const { mass, fPull, angleDeg = 0, muS = 0.3, muK = 0.2, g } = params;
  const rad = (angleDeg * Math.PI) / 180;

  const fPullX = fPull * Math.cos(rad);
  const fPullY = fPull * Math.sin(rad);

  const weight = mass * g;
  // Normal force: N = mg - F_pull*sin(theta)
  const normalForce = Math.max(0, weight - fPullY);

  const maxStaticFriction = muS * normalForce;
  const kineticFriction = muK * normalForce;

  let willMove = false;
  let netForceX = 0;
  let acceleration = 0;
  let frictionApplied = 0;

  if (fPullY >= weight) {
    // Lifted off ground!
    willMove = true;
    netForceX = fPullX;
    acceleration = netForceX / mass;
    frictionApplied = 0;
  } else if (fPullX > maxStaticFriction) {
    willMove = true;
    frictionApplied = kineticFriction;
    netForceX = fPullX - kineticFriction;
    acceleration = netForceX / mass;
  } else {
    willMove = false;
    frictionApplied = fPullX;
    netForceX = 0;
    acceleration = 0;
  }

  const givens = [
    { symbol: 'm', name: 'Mass of Object', value: mass, unit: 'kg' },
    { symbol: 'F_{pull}', name: 'Applied Force', value: fPull, unit: 'N' },
    { symbol: '\\theta', name: 'Pull Angle', value: angleDeg, unit: '°' },
    { symbol: '\\mu_s', name: 'Static Friction Coefficient', value: muS, unit: '' },
    { symbol: '\\mu_k', name: 'Kinetic Friction Coefficient', value: muK, unit: '' },
    { symbol: 'g', name: 'Gravitational Field Strength', value: g, unit: 'm/s²' },
  ];

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'Calculate Weight and Decompose Applied Force',
      formulaLatex: 'W = mg, \\quad F_x = F\\cos\\theta, \\quad F_y = F\\sin\\theta',
      explanation: 'Find the gravitational force pulling downward and break the pulling force into horizontal and vertical components.',
      substitutionLatex: `W = (${mass}\\text{ kg})(${g}\\text{ m/s}^2) = ${formatNum(weight)}\\text{ N}, \\quad F_x = ${fPull}\\cos(${angleDeg}^\\circ) = ${formatNum(fPullX)}\\text{ N}, \\quad F_y = ${fPull}\\sin(${angleDeg}^\\circ) = ${formatNum(fPullY)}\\text{ N}`,
      calculatedResult: `Weight = ${formatNum(weight)} N, F_x = ${formatNum(fPullX)} N, F_y = ${formatNum(fPullY)} N`,
    },
    {
      stepNumber: 2,
      title: 'Determine the Normal Force (N)',
      formulaLatex: '\\Sigma F_y = N + F\\sin\\theta - mg = 0 \\implies N = mg - F\\sin\\theta',
      explanation: 'Because there is no vertical acceleration, upward forces must balance downward gravitational force.',
      substitutionLatex: `N = ${formatNum(weight)}\\text{ N} - ${formatNum(fPullY)}\\text{ N} = ${formatNum(normalForce)}\\text{ N}`,
      calculatedResult: `Normal Force N = ${formatNum(normalForce)} N`,
    },
    {
      stepNumber: 3,
      title: 'Evaluate Static vs Kinetic Friction Condition',
      formulaLatex: 'f_{s,\\max} = \\mu_s N, \\quad f_k = \\mu_k N',
      explanation: `Compare the horizontal pulling force F_x with the maximum threshold of static friction f_{s,max}.`,
      substitutionLatex: `f_{s,\\max} = (${muS})(${formatNum(normalForce)}\\text{ N}) = ${formatNum(maxStaticFriction)}\\text{ N}. \\quad \\text{Since } F_x (${formatNum(fPullX)}\\text{ N}) ${fPullX > maxStaticFriction ? '>' : '\\le'} f_{s,\\max} (${formatNum(maxStaticFriction)}\\text{ N}), \\text{ the block } ${willMove ? '\\textbf{WILL move}' : '\\textbf{remains AT REST}'}.`,
      calculatedResult: willMove ? `Moving with kinetic friction f_k = ${formatNum(kineticFriction)} N` : `Stationary (Static friction = ${formatNum(frictionApplied)} N)`,
    },
    {
      stepNumber: 4,
      title: 'Apply Newton’s 2nd Law for Horizontal Acceleration',
      formulaLatex: '\\Sigma F_x = m \\cdot a \\implies a = \\frac{F_x - f_k}{m}',
      explanation: 'The net unbalanced horizontal force divided by mass determines the acceleration of the object.',
      substitutionLatex: willMove
        ? `a = \\frac{${formatNum(fPullX)}\\text{ N} - ${formatNum(kineticFriction)}\\text{ N}}{${mass}\\text{ kg}} = \\frac{${formatNum(netForceX)}}{${mass}} = ${formatNum(acceleration)}\\text{ m/s}^2`
        : `a = 0\\text{ m/s}^2 \\text{ (Static equilibrium, net force } \\Sigma F = 0\\text{)}`,
      calculatedResult: `Acceleration a = ${formatNum(acceleration)} m/s²`,
    },
  ];

  return {
    title: "Newton's 2nd Law & Friction on Flat Surface",
    category: 'Force',
    problemSummary: `A ${mass} kg block is pulled with ${fPull} N at an angle of ${angleDeg}° with static friction μs = ${muS} and kinetic friction μk = ${muK}.`,
    givens,
    unknowns: [
      { symbol: 'N', name: 'Normal Force', targetUnit: 'N' },
      { symbol: 'f', name: 'Friction Force', targetUnit: 'N' },
      { symbol: 'F_{net}', name: 'Net Force', targetUnit: 'N' },
      { symbol: 'a', name: 'Acceleration', targetUnit: 'm/s²' },
    ],
    principlesUsed: [
      "Newton's First Law (Static Equilibrium in Y-axis)",
      "Newton's Second Law (F_net = ma in X-axis)",
      'Coulomb Friction Law (f_s <= mu_s * N, f_k = mu_k * N)',
    ],
    keyFormulasLatex: [
      'N = mg - F\\sin\\theta',
      'f_{s,\\max} = \\mu_s N, \\quad f_k = \\mu_k N',
      'F_{net} = F\\cos\\theta - f_k = ma',
    ],
    steps,
    finalAnswers: [
      { quantity: 'Normal Force', symbol: 'N', value: formatNum(normalForce), unit: 'N', interpretation: `The surface supports the block with ${formatNum(normalForce)} N.` },
      { quantity: 'Friction Force', symbol: 'f', value: formatNum(frictionApplied), unit: 'N', interpretation: willMove ? `Kinetic friction opposes motion with ${formatNum(frictionApplied)} N.` : `Static friction perfectly matches applied force with ${formatNum(frictionApplied)} N.` },
      { quantity: 'Acceleration', symbol: 'a', value: formatNum(acceleration), unit: 'm/s²', interpretation: willMove ? `Object accelerates forward at ${formatNum(acceleration)} m/s².` : `Object is stationary (a = 0).` },
    ],
    sanityCheck: `Pulling upward at an angle (${angleDeg}°) reduces the normal force (N = ${formatNum(normalForce)} N < mg = ${formatNum(weight)} N), which beneficially reduces friction!`,
    commonPitfalls: [
      'Assuming Normal force always equals mg (N = mg). When pulling at an angle, N = mg - F*sinθ.',
      'Using kinetic friction μk when the applied force is too small to overcome static friction μs.',
      'Assuming static friction is always equal to μs*N (it only equals μs*N at the impending slip point; otherwise f_s = F_applied).',
    ],
    simConfig: {
      type: 'force_fbd',
      mass,
      appliedForce: fPull,
      angleDeg,
      frictionCoeff: muK,
      acceleration,
    },
  };
}

// -------------------------------------------------------------
// 4. FORCE: Inclined Plane Dynamics
// -------------------------------------------------------------
export function solveInclinedPlane(params: {
  mass: number; // kg
  angleDeg: number; // incline angle in degrees
  muK?: number; // friction coefficient (default 0)
  direction: 'sliding_down' | 'pushed_up';
  fApplied?: number; // external force along the ramp
  g: GravityConstant;
}): PhysicsSolution {
  const { mass, angleDeg, muK = 0, direction, fApplied = 0, g } = params;
  const rad = (angleDeg * Math.PI) / 180;

  const weight = mass * g;
  const fParallel = weight * Math.sin(rad); // component down the ramp
  const fPerp = weight * Math.cos(rad); // component into the ramp
  const normalForce = fPerp;

  const frictionForce = muK * normalForce;

  let netForce = 0;
  let acceleration = 0;
  let explanationText = '';

  if (direction === 'sliding_down') {
    // Net force down the ramp: F_net = mg*sin(theta) + F_applied - f_k (f_k points UP the ramp)
    netForce = fParallel + fApplied - frictionForce;
    acceleration = netForce / mass;
    explanationText = 'Gravity pulls down the ramp (mg sinθ), external force acts down the ramp, while friction resists up the ramp.';
  } else {
    // Moving UP the ramp: friction points DOWN the ramp
    netForce = fApplied - fParallel - frictionForce;
    acceleration = netForce / mass;
    explanationText = 'Applied force pushes up the ramp, while both gravity (mg sinθ) and friction (μk N) oppose motion pointing down the ramp.';
  }

  const givens = [
    { symbol: 'm', name: 'Mass of Object', value: mass, unit: 'kg' },
    { symbol: '\\theta', name: 'Incline Angle', value: angleDeg, unit: '°' },
    { symbol: '\\mu_k', name: 'Kinetic Friction Coefficient', value: muK, unit: '' },
    { symbol: 'F_{ext}', name: 'External Applied Force', value: fApplied, unit: 'N' },
    { symbol: 'g', name: 'Gravity', value: g, unit: 'm/s²' },
  ];

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'Resolve Gravitational Force along Tilted Coordinate Axes',
      formulaLatex: 'F_\\parallel = mg\\sin\\theta, \\quad F_\\perp = mg\\cos\\theta',
      explanation: 'Align the x-axis parallel to the incline surface and the y-axis perpendicular to the surface.',
      substitutionLatex: `F_\\parallel = (${mass})(${g})\\sin(${angleDeg}^\\circ) = ${formatNum(fParallel)}\\text{ N}, \\quad F_\\perp = (${mass})(${g})\\cos(${angleDeg}^\\circ) = ${formatNum(fPerp)}\\text{ N}`,
      calculatedResult: `Parallel Gravity = ${formatNum(fParallel)} N, Perpendicular Gravity = ${formatNum(fPerp)} N`,
    },
    {
      stepNumber: 2,
      title: 'Calculate Normal Force and Friction Force',
      formulaLatex: 'N = mg\\cos\\theta, \\quad f_k = \\mu_k N = \\mu_k mg\\cos\\theta',
      explanation: 'Since the object does not sink into or fly off the ramp, N balances F_perp.',
      substitutionLatex: `N = ${formatNum(normalForce)}\\text{ N}, \\quad f_k = (${muK})(${formatNum(normalForce)}\\text{ N}) = ${formatNum(frictionForce)}\\text{ N}`,
      calculatedResult: `Normal Force N = ${formatNum(normalForce)} N, Friction f_k = ${formatNum(frictionForce)} N`,
    },
    {
      stepNumber: 3,
      title: 'Sum Forces along the Incline (Newton’s 2nd Law)',
      formulaLatex: direction === 'sliding_down' ? '\\Sigma F_\\parallel = mg\\sin\\theta - f_k = m \\cdot a' : '\\Sigma F_\\parallel = F_{app} - mg\\sin\\theta - f_k = m \\cdot a',
      explanation: explanationText,
      substitutionLatex: `a = \\frac{${formatNum(netForce)}\\text{ N}}{${mass}\\text{ kg}} = ${formatNum(acceleration)}\\text{ m/s}^2`,
      calculatedResult: `Net Force = ${formatNum(netForce)} N, Acceleration = ${formatNum(acceleration)} m/s²`,
    },
  ];

  return {
    title: 'Inclined Plane Dynamics & Force Resolution',
    category: 'Force',
    problemSummary: `A ${mass} kg block is on a ${angleDeg}° incline (${direction === 'sliding_down' ? 'sliding downward' : 'moving upward'}) with friction μ = ${muK}.`,
    givens,
    unknowns: [
      { symbol: 'N', name: 'Normal Force', targetUnit: 'N' },
      { symbol: 'F_\\parallel', name: 'Gravity Parallel', targetUnit: 'N' },
      { symbol: 'f_k', name: 'Friction Force', targetUnit: 'N' },
      { symbol: 'a', name: 'Acceleration along Ramp', targetUnit: 'm/s²' },
    ],
    principlesUsed: [
      'Tilted Coordinate System Transformation',
      "Newton's 2nd Law on Inclined Plane",
      'Kinetic Friction Definition',
    ],
    keyFormulasLatex: [
      'F_\\parallel = mg\\sin\\theta, \\quad F_\\perp = mg\\cos\\theta',
      'N = mg\\cos\\theta',
      'a = g(\\sin\\theta \\pm \\mu_k\\cos\\theta)',
    ],
    steps,
    finalAnswers: [
      { quantity: 'Acceleration', symbol: 'a', value: formatNum(acceleration), unit: 'm/s²', interpretation: `The block accelerates along the ramp at ${formatNum(acceleration)} m/s².` },
      { quantity: 'Normal Force', symbol: 'N', value: formatNum(normalForce), unit: 'N', interpretation: `Ramp presses against block with ${formatNum(normalForce)} N.` },
      { quantity: 'Parallel Gravity', symbol: 'F_\\parallel', value: formatNum(fParallel), unit: 'N', interpretation: `Gravity component pulling down slope is ${formatNum(fParallel)} N.` },
    ],
    sanityCheck: `Notice that for a frictionless ramp sliding down, a = g sin(${angleDeg}°) = ${formatNum(g * Math.sin(rad))} m/s², completely independent of mass!`,
    commonPitfalls: [
      'Mixing up sin and cos on the incline: F_parallel is mg sinθ, F_perp is mg cosθ.',
      'Forgetting that friction always OPPOSES the direction of velocity.',
    ],
    simConfig: {
      type: 'inclined_plane',
      mass,
      angleDeg,
      frictionCoeff: muK,
      acceleration,
    },
  };
}

// -------------------------------------------------------------
// 5. WORK, POWER & ENERGY: Work Done by Force
// -------------------------------------------------------------
export function solveWorkDone(params: {
  force: number; // N
  displacement: number; // m
  angleDeg: number; // angle between force and displacement vectors
}): PhysicsSolution {
  const { force, displacement, angleDeg } = params;
  const rad = (angleDeg * Math.PI) / 180;
  const cosTheta = Math.cos(rad);
  const work = force * displacement * cosTheta;

  let workType = '';
  if (Math.abs(cosTheta) < 1e-6) {
    workType = 'Zero Work (Force is perpendicular to displacement, e.g. holding a bag while walking horizontally or circular orbit).';
  } else if (cosTheta > 0) {
    workType = 'Positive Work (Force helps/speeds up motion, adding energy to the system).';
  } else {
    workType = 'Negative Work (Force opposes/slows down motion, removing energy from the system, e.g. friction).';
  }

  const givens = [
    { symbol: 'F', name: 'Force Magnitude', value: force, unit: 'N' },
    { symbol: 'd', name: 'Displacement Distance', value: displacement, unit: 'm' },
    { symbol: '\\theta', name: 'Angle between F and d', value: angleDeg, unit: '°' },
  ];

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'State the Definition of Mechanical Work (Dot Product)',
      formulaLatex: 'W = \\vec{F} \\cdot \\vec{d} = F \\cdot d \\cdot \\cos\\theta',
      explanation: 'Work is the scalar product of force and displacement vectors. Only the component of force in the direction of motion does work.',
      algebraicDerivation: 'W = F d \\cos\\theta',
      substitutionLatex: `W = (${force}\\text{ N}) \\times (${displacement}\\text{ m}) \\times \\cos(${angleDeg}^\\circ)`,
      calculatedResult: `cos(${angleDeg}°) = ${formatNum(cosTheta, 4)}`,
    },
    {
      stepNumber: 2,
      title: 'Compute Total Work Done and Dimensional Units',
      formulaLatex: 'W = F d \\cos\\theta',
      explanation: 'Multiply the magnitudes and directional cosine factor. 1 Joule (J) = 1 Newton-meter (N·m) = 1 kg·m²/s².',
      substitutionLatex: `W = (${force})(${displacement})(${formatNum(cosTheta, 4)}) = ${formatNum(work)}\\text{ J}`,
      calculatedResult: `Work W = ${formatNum(work)} J (Joules)`,
    },
  ];

  return {
    title: 'Work Done by a Constant Force',
    category: 'Work & Energy',
    problemSummary: `A force of ${force} N acts over a displacement of ${displacement} m at an angle of ${angleDeg}° relative to the displacement.`,
    givens,
    unknowns: [{ symbol: 'W', name: 'Work Done', targetUnit: 'J' }],
    principlesUsed: [
      'Definition of Mechanical Work (Dot Product)',
      'Energy Transfer Principle',
    ],
    keyFormulasLatex: ['W = F d \\cos\\theta'],
    steps,
    finalAnswers: [
      { quantity: 'Work Done', symbol: 'W', value: formatNum(work), unit: 'J', scientificNotation: toScientific(work), interpretation: `${workType}` },
    ],
    sanityCheck: `If angle = 0°, cos(0) = 1, giving maximum work W = ${formatNum(force * displacement)} J. At 90°, cos(90) = 0, work is 0 J.`,
    commonPitfalls: [
      'Entering angle with the vertical instead of the angle between force and displacement direction.',
      'Assuming work is a vector (Work is a SCALAR quantity with sign indicating energy gained or lost).',
    ],
    simConfig: {
      type: 'force_fbd',
      appliedForce: force,
      distance: displacement,
      angleDeg: angleDeg,
    },
  };
}

// -------------------------------------------------------------
// 6. WORK, POWER & ENERGY: Conservation of Mechanical Energy
// -------------------------------------------------------------
export function solveEnergyConservation(params: {
  mass: number; // kg
  h1: number; // initial height (m)
  v1: number; // initial velocity (m/s)
  h2?: number; // target height (m)
  v2?: number; // target velocity (m/s)
  wLoss?: number; // energy lost to friction/heat in Joules (default 0)
  g: GravityConstant;
}): PhysicsSolution {
  const { mass, h1, v1, h2, v2, wLoss = 0, g } = params;

  const ek1 = 0.5 * mass * v1 * v1;
  const ep1 = mass * g * h1;
  const eTotal1 = ek1 + ep1;

  let targetUnknown = '';
  let targetVal = 0;
  let targetUnit = '';
  let ek2 = 0;
  let ep2 = 0;

  if (v2 === undefined && h2 !== undefined) {
    // Solve for v2
    targetUnknown = 'Final Velocity (v2)';
    targetUnit = 'm/s';
    ep2 = mass * g * h2;
    // E_total1 - W_loss = E_p2 + E_k2  => E_k2 = E_total1 - W_loss - E_p2
    ek2 = Math.max(0, eTotal1 - wLoss - ep2);
    targetVal = Math.sqrt((2 * ek2) / mass);
  } else if (h2 === undefined && v2 !== undefined) {
    // Solve for h2
    targetUnknown = 'Final Height (h2)';
    targetUnit = 'm';
    ek2 = 0.5 * mass * v2 * v2;
    ep2 = Math.max(0, eTotal1 - wLoss - ek2);
    targetVal = ep2 / (mass * g);
  } else {
    // Default calculate final speed at ground h2 = 0
    targetUnknown = 'Velocity at Ground Level (h=0)';
    targetUnit = 'm/s';
    ep2 = 0;
    ek2 = Math.max(0, eTotal1 - wLoss);
    targetVal = Math.sqrt((2 * ek2) / mass);
  }

  const givens = [
    { symbol: 'm', name: 'Mass', value: mass, unit: 'kg' },
    { symbol: 'h_1', name: 'Initial Height', value: h1, unit: 'm' },
    { symbol: 'v_1', name: 'Initial Velocity', value: v1, unit: 'm/s' },
    { symbol: 'g', name: 'Gravity', value: g, unit: 'm/s²' },
  ];
  if (h2 !== undefined) givens.push({ symbol: 'h_2', name: 'Final Height', value: h2, unit: 'm' });
  if (v2 !== undefined) givens.push({ symbol: 'v_2', name: 'Final Velocity', value: v2, unit: 'm/s' });
  if (wLoss > 0) givens.push({ symbol: 'W_{loss}', name: 'Energy Lost (Thermal/Friction)', value: wLoss, unit: 'J' });

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'Calculate Initial Mechanical Energy (State 1)',
      formulaLatex: 'E_{total,1} = E_{k,1} + E_{p,1} = \\frac{1}{2}mv_1^2 + mgh_1',
      explanation: 'Sum the initial kinetic energy and gravitational potential energy.',
      substitutionLatex: `E_{k,1} = \\frac{1}{2}(${mass})(${v1})^2 = ${formatNum(ek1)}\\text{ J}, \\quad E_{p,1} = (${mass})(${g})(${h1}) = ${formatNum(ep1)}\\text{ J} \\implies E_{total,1} = ${formatNum(eTotal1)}\\text{ J}`,
      calculatedResult: `Initial Mechanical Energy = ${formatNum(eTotal1)} J`,
    },
    {
      stepNumber: 2,
      title: 'Apply the Work-Energy Conservation Theorem',
      formulaLatex: 'E_{total,1} - W_{loss} = E_{total,2} = E_{k,2} + E_{p,2}',
      explanation: 'In an isolated system without non-conservative forces, mechanical energy is strictly conserved. If friction/air resistance exists, subtract work lost.',
      substitutionLatex: `${formatNum(eTotal1)}\\text{ J} - ${wLoss}\\text{ J} = ${formatNum(eTotal1 - wLoss)}\\text{ J} = E_{k,2} + E_{p,2}`,
      calculatedResult: `Available Total Energy at State 2 = ${formatNum(eTotal1 - wLoss)} J`,
    },
    {
      stepNumber: 3,
      title: `Solve for ${targetUnknown}`,
      formulaLatex:
        v2 === undefined && h2 !== undefined
          ? 'v_2 = \\sqrt{\\frac{2(E_{total,2} - mgh_2)}{m}} = \\sqrt{v_1^2 + 2g(h_1 - h_2)}'
          : 'h_2 = \\frac{E_{total,2} - \\frac{1}{2}mv_2^2}{mg}',
      explanation: 'Isolate the unknown target quantity algebraically and substitute the known quantities.',
      substitutionLatex:
        v2 === undefined && h2 !== undefined
          ? `v_2 = \\sqrt{\\frac{2(${formatNum(ek2)})}{${mass}}} = ${formatNum(targetVal)}\\text{ m/s}`
          : `h_2 = \\frac{${formatNum(ep2)}}{(${mass})(${g})} = ${formatNum(targetVal)}\\text{ m}`,
      calculatedResult: `${targetUnknown} = ${formatNum(targetVal)} ${targetUnit}`,
    },
  ];

  return {
    title: 'Conservation of Mechanical Energy Analysis',
    category: 'Work & Energy',
    problemSummary: `An object of mass ${mass} kg starts at height ${h1} m with speed ${v1} m/s and moves to a second state.`,
    givens,
    unknowns: [{ symbol: targetUnit === 'm/s' ? 'v_2' : 'h_2', name: targetUnknown, targetUnit }],
    principlesUsed: [
      'Law of Conservation of Energy',
      'Gravitational Potential Energy (Ep = mgh)',
      'Kinetic Energy (Ek = 1/2 m v^2)',
    ],
    keyFormulasLatex: [
      'E_{total} = \\frac{1}{2}mv^2 + mgh',
      'E_{k,1} + E_{p,1} = E_{k,2} + E_{p,2}',
    ],
    steps,
    finalAnswers: [
      { quantity: targetUnknown, symbol: targetUnit === 'm/s' ? 'v_2' : 'h_2', value: formatNum(targetVal), unit: targetUnit, interpretation: `The object reaches ${formatNum(targetVal)} ${targetUnit} at the final state.` },
      { quantity: 'Total Initial Energy', symbol: 'E_1', value: formatNum(eTotal1), unit: 'J', interpretation: `Initial energy consists of ${formatNum(ek1)} J kinetic and ${formatNum(ep1)} J potential.` },
    ],
    sanityCheck: `Notice that dropping from rest (v1=0) gives v2 = √(2gh) = √(2*${g}*${h1}) = ${formatNum(Math.sqrt(2 * g * h1))} m/s, mass cancels out completely!`,
    commonPitfalls: [
      'Forgetting that speed is squared in kinetic energy (doubling speed quadruples kinetic energy!).',
      'Using the wrong height baseline (h=0 must be consistent throughout the whole calculation).',
    ],
    simConfig: {
      type: 'energy_rollercoaster',
      mass,
      height: h1,
      initialVelocity: v1,
    },
  };
}

// -------------------------------------------------------------
// 7. WORK, POWER & ENERGY: Power & Efficiency
// -------------------------------------------------------------
export function solvePowerEfficiency(params: {
  workOrEnergy?: number; // J
  time?: number; // s
  force?: number; // N
  velocity?: number; // m/s
  inputPower?: number; // W
}): PhysicsSolution {
  const { workOrEnergy, time, force, velocity, inputPower } = params;

  let power = 0;
  let formulaLatex = '';
  let substitutionLatex = '';
  let explanation = '';

  if (workOrEnergy !== undefined && time !== undefined && time > 0) {
    power = workOrEnergy / time;
    formulaLatex = 'P = \\frac{W}{t} = \\frac{\\Delta E}{\\Delta t}';
    derivationLatex: 'P = W / t';
    substitutionLatex = `P = \\frac{${workOrEnergy}\\text{ J}}{${time}\\text{ s}} = ${formatNum(power)}\\text{ W}`;
    explanation = 'Power is the rate at which work is done or energy is transformed per unit time.';
  } else if (force !== undefined && velocity !== undefined) {
    power = force * velocity;
    formulaLatex = 'P = F \\cdot v';
    derivationLatex: 'P = F v';
    substitutionLatex = `P = (${force}\\text{ N}) \\times (${velocity}\\text{ m/s}) = ${formatNum(power)}\\text{ W}`;
    explanation = 'For an object moving at constant speed against a resistive force, power is force times velocity.';
  } else {
    throw new Error('Please provide either (Work & Time) or (Force & Velocity) to calculate Power.');
  }

  const horsepower = power / 745.7;

  let efficiency = 100;
  if (inputPower !== undefined && inputPower > 0) {
    efficiency = (power / inputPower) * 100;
  }

  const givens = [];
  if (workOrEnergy !== undefined) givens.push({ symbol: 'W', name: 'Work / Energy', value: workOrEnergy, unit: 'J' });
  if (time !== undefined) givens.push({ symbol: 't', name: 'Time Interval', value: time, unit: 's' });
  if (force !== undefined) givens.push({ symbol: 'F', name: 'Force', value: force, unit: 'N' });
  if (velocity !== undefined) givens.push({ symbol: 'v', name: 'Velocity', value: velocity, unit: 'm/s' });
  if (inputPower !== undefined) givens.push({ symbol: 'P_{in}', name: 'Input Power Supplied', value: inputPower, unit: 'W' });

  const steps: StepDerivation[] = [
    {
      stepNumber: 1,
      title: 'State the Governing Power Formula',
      formulaLatex: formulaLatex,
      explanation: explanation,
      substitutionLatex: substitutionLatex,
      calculatedResult: `Power Output = ${formatNum(power)} W (${formatNum(horsepower, 2)} hp)`,
    },
  ];

  if (inputPower !== undefined && inputPower > 0) {
    steps.push({
      stepNumber: 2,
      title: 'Compute Mechanical Efficiency',
      formulaLatex: '\\eta = \\left(\\frac{P_{out}}{P_{in}}\\right) \\times 100\\%',
      explanation: 'Efficiency is the ratio of useful power output to total power consumed.',
      substitutionLatex: `\\eta = \\left(\\frac{${formatNum(power)}\\text{ W}}{${inputPower}\\text{ W}}\\right) \\times 100\\% = ${formatNum(efficiency)}\\%`,
      calculatedResult: `Efficiency = ${formatNum(efficiency)}%`,
    });
  }

  return {
    title: 'Power & Mechanical Efficiency Calculation',
    category: 'Power',
    problemSummary: `Calculating mechanical power output and energy transfer rate.`,
    givens,
    unknowns: [
      { symbol: 'P', name: 'Power Output', targetUnit: 'W' },
      ...(inputPower ? [{ symbol: '\\eta', name: 'Efficiency', targetUnit: '%' }] : []),
    ],
    principlesUsed: [
      'Definition of Power (Rate of Energy Transfer)',
      'Instantaneous Power for Uniform Velocity (P = Fv)',
      'Efficiency of Energy Conversion',
    ],
    keyFormulasLatex: [formulaLatex, '\\eta = \\frac{P_{useful}}{P_{total}} \\times 100\\%'],
    steps,
    finalAnswers: [
      { quantity: 'Power Output', symbol: 'P', value: formatNum(power), unit: 'W (Watts)', interpretation: `Delivers ${formatNum(power)} Joules of energy per second (${formatNum(horsepower, 2)} horsepower).` },
      ...(inputPower ? [{ quantity: 'Efficiency', symbol: '\\eta', value: formatNum(efficiency), unit: '%', interpretation: `${formatNum(efficiency)}% of supplied energy is converted to useful output.` }] : []),
    ],
    sanityCheck: `1 Watt = 1 Joule/second. 1 Horsepower ≈ 746 Watts (e.g. A standard car engine produces ~100 kW to 200 kW).`,
    commonPitfalls: [
      'Confusing Power (Watts = J/s) with Energy (Joules). Power is a RATE, Energy is the TOTAL AMOUNT.',
      'Forgetting that 1 kilowatt-hour (kWh) is a unit of ENERGY (1 kWh = 3.6 × 10⁶ Joules), NOT power!',
    ],
  };
}
