import React, { useState } from 'react';
import { GravityConstant, PhysicsSolution } from '../../types';
import { solveKinematics1D, solveProjectileMotion } from '../../utils/physicsEngine';
import { SolutionDisplay } from '../SolutionDisplay';
import { MotionSim } from '../simulators/MotionSim';
import { MathView } from '../MathView';
import { ArrowRight, Compass, Flame, Play, Sparkles } from 'lucide-react';

interface MotionSolverProps {
  gravity: GravityConstant;
  onAskTutor?: (question: string) => void;
}

export const MotionSolver: React.FC<MotionSolverProps> = ({ gravity, onAskTutor }) => {
  const [subtopic, setSubtopic] = useState<'1d' | 'projectile' | 'circular'>('1d');

  // 1D State
  const [u1D, setU1D] = useState<string>('0');
  const [v1D, setV1D] = useState<string>('25');
  const [a1D, setA1D] = useState<string>('5');
  const [t1D, setT1D] = useState<string>('5');
  const [s1D, setS1D] = useState<string>('');
  const [target1D, setTarget1D] = useState<'u' | 'v' | 'a' | 't' | 's'>('s');
  const [uUnit, setUUnit] = useState<'m/s' | 'km/h' | 'mph'>('m/s');

  // Projectile State
  const [v0Proj, setV0Proj] = useState<string>('20');
  const [angleProj, setAngleProj] = useState<string>('35');
  const [y0Proj, setY0Proj] = useState<string>('0');

  // Active Solution state
  const [solution, setSolution] = useState<PhysicsSolution | null>(() => {
    try {
      return solveKinematics1D({
        u: 0,
        v: 25,
        a: 5,
        t: 5,
        target: 's',
        g: gravity,
      });
    } catch {
      return null;
    }
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSolve1D = () => {
    setErrorMsg(null);
    try {
      // Unit conversion for initial velocity
      let uVal = u1D.trim() !== '' ? parseFloat(u1D) : undefined;
      if (uVal !== undefined) {
        if (uUnit === 'km/h') uVal = uVal / 3.6;
        else if (uUnit === 'mph') uVal = uVal * 0.44704;
      }

      const vVal = v1D.trim() !== '' ? parseFloat(v1D) : undefined;
      const aVal = a1D.trim() !== '' ? parseFloat(a1D) : undefined;
      const tVal = t1D.trim() !== '' ? parseFloat(t1D) : undefined;
      const sVal = s1D.trim() !== '' ? parseFloat(s1D) : undefined;

      const res = solveKinematics1D({
        u: target1D === 'u' ? undefined : uVal,
        v: target1D === 'v' ? undefined : vVal,
        a: target1D === 'a' ? undefined : aVal,
        t: target1D === 't' ? undefined : tVal,
        s: target1D === 's' ? undefined : sVal,
        target: target1D,
        g: gravity,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error solving kinematic equations.');
    }
  };

  const handleSolveProjectile = () => {
    setErrorMsg(null);
    try {
      const v0 = parseFloat(v0Proj);
      const angle = parseFloat(angleProj);
      const y0 = parseFloat(y0Proj) || 0;

      if (isNaN(v0) || isNaN(angle)) {
        throw new Error('Please enter valid numerical values for launch speed and angle.');
      }

      const res = solveProjectileMotion({
        v0,
        angleDeg: angle,
        y0,
        g: gravity,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error computing projectile trajectory.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtopic Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            setSubtopic('1d');
            handleSolve1D();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            subtopic === '1d' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>1D Linear Motion (SUVAT)</span>
        </button>

        <button
          onClick={() => {
            setSubtopic('projectile');
            handleSolveProjectile();
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            subtopic === 'projectile' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>2D Projectile Trajectory</span>
        </button>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {subtopic === '1d' ? '1D Kinematics Equation Solver' : '2D Projectile Motion Solver'}
            </h3>
            <p className="text-xs text-slate-400">
              {subtopic === '1d'
                ? 'Select your target unknown and input at least 3 known values.'
                : 'Enter launch velocity, angle, and initial elevation.'}
            </p>
          </div>
          <div className="text-xs text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            g = {gravity} m/s²
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1D Kinematics Inputs */}
        {subtopic === '1d' && (
          <div className="space-y-4">
            {/* Target Unknown Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Target Unknown to Solve For:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 's', label: 'Displacement (s)', formula: 's = ut + ½at²' },
                  { id: 'v', label: 'Final Velocity (v)', formula: 'v = u + at' },
                  { id: 'u', label: 'Initial Velocity (u)', formula: 'u = v - at' },
                  { id: 'a', label: 'Acceleration (a)', formula: 'a = (v-u)/t' },
                  { id: 't', label: 'Time (t)', formula: 't = (v-u)/a' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTarget1D(opt.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                      target1D === opt.id
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">{opt.formula}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Variables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Initial Velocity */}
              {target1D !== 'u' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium flex justify-between">
                    <span>Initial Velocity (u):</span>
                    <select
                      value={uUnit}
                      onChange={(e) => setUUnit(e.target.value as any)}
                      className="bg-slate-800 text-cyan-400 rounded px-1 text-[11px] outline-none"
                    >
                      <option value="m/s">m/s</option>
                      <option value="km/h">km/h</option>
                      <option value="mph">mph</option>
                    </select>
                  </label>
                  <input
                    type="number"
                    value={u1D}
                    onChange={(e) => setU1D(e.target.value)}
                    placeholder="e.g. 0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* Final Velocity */}
              {target1D !== 'v' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">
                    Final Velocity (v) [m/s]:
                  </label>
                  <input
                    type="number"
                    value={v1D}
                    onChange={(e) => setV1D(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* Acceleration */}
              {target1D !== 'a' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">
                    Acceleration (a) [m/s²]:
                  </label>
                  <input
                    type="number"
                    value={a1D}
                    onChange={(e) => setA1D(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* Time */}
              {target1D !== 't' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">
                    Time (t) [s]:
                  </label>
                  <input
                    type="number"
                    value={t1D}
                    onChange={(e) => setT1D(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}

              {/* Displacement */}
              {target1D !== 's' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">
                    Displacement (s) [m]:
                  </label>
                  <input
                    type="number"
                    value={s1D}
                    onChange={(e) => setS1D(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSolve1D}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Solve Step-by-Step</span>
            </button>
          </div>
        )}

        {/* Projectile Inputs */}
        {subtopic === 'projectile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Launch Speed (v₀) [m/s]:
                </label>
                <input
                  type="number"
                  value={v0Proj}
                  onChange={(e) => setV0Proj(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Launch Angle (θ) [degrees]:
                </label>
                <input
                  type="number"
                  value={angleProj}
                  onChange={(e) => setAngleProj(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Initial Height (y₀) [meters]:
                </label>
                <input
                  type="number"
                  value={y0Proj}
                  onChange={(e) => setY0Proj(e.target.value)}
                  placeholder="0 for ground level"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolveProjectile}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Calculate Projectile Flight</span>
            </button>
          </div>
        )}
      </div>

      {/* Simulator Component */}
      <MotionSim
        initialVelocity={subtopic === 'projectile' ? parseFloat(v0Proj) || 20 : parseFloat(u1D) || 0}
        acceleration={parseFloat(a1D) || 2}
        angleDeg={parseFloat(angleProj) || 35}
        initialHeight={parseFloat(y0Proj) || 0}
        gravity={gravity}
        simType={subtopic === 'projectile' ? 'projectile' : '1d'}
      />

      {/* Step-by-Step Derivation Display */}
      {solution && <SolutionDisplay solution={solution} onAskTutor={onAskTutor} gravity={gravity} />}
    </div>
  );
};
