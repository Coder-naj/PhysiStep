import React, { useState } from 'react';
import { GravityConstant, PhysicsSolution } from '../../types';
import { solveForceFriction, solveInclinedPlane } from '../../utils/physicsEngine';
import { SolutionDisplay } from '../SolutionDisplay';
import { FreeBodyDiagram } from '../simulators/FreeBodyDiagram';
import { Sparkles, Sliders } from 'lucide-react';

interface ForceSolverProps {
  gravity: GravityConstant;
  onAskTutor?: (question: string) => void;
  activeMode?: 'flat_friction' | 'inclined_plane';
  onModeChange?: (mode: 'flat_friction' | 'inclined_plane') => void;
}

export const ForceSolver: React.FC<ForceSolverProps> = ({ 
  gravity, 
  onAskTutor,
  activeMode,
  onModeChange 
}) => {
  const [mode, setMode] = useState<'flat_friction' | 'inclined_plane'>(activeMode || 'flat_friction');

  // Flat Surface State
  const [massFlat, setMassFlat] = useState<string>('20');
  const [fPullFlat, setFPullFlat] = useState<string>('80');
  const [angleFlat, setAngleFlat] = useState<string>('25');
  const [muSFlat, setMuSFlat] = useState<string>('0.35');
  const [muKFlat, setMuKFlat] = useState<string>('0.25');

  // Incline State
  const [massInc, setMassInc] = useState<string>('15');
  const [angleInc, setAngleInc] = useState<string>('30');
  const [muKInc, setMuKInc] = useState<string>('0.2');
  const [dirInc, setDirInc] = useState<'sliding_down' | 'pushed_up'>('sliding_down');
  const [fAppInc, setFAppInc] = useState<string>('0');

  const [solution, setSolution] = useState<PhysicsSolution | null>(() => {
    try {
      return solveForceFriction({
        mass: 20,
        fPull: 80,
        angleDeg: 25,
        muS: 0.35,
        muK: 0.25,
        g: gravity,
      });
    } catch {
      return null;
    }
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSolveFlat = () => {
    setErrorMsg(null);
    try {
      const m = parseFloat(massFlat);
      const f = parseFloat(fPullFlat);
      const a = parseFloat(angleFlat) || 0;
      const ms = parseFloat(muSFlat) || 0;
      const mk = parseFloat(muKFlat) || 0;

      if (isNaN(m) || isNaN(f)) throw new Error('Please enter valid numbers for mass and applied force.');

      const res = solveForceFriction({
        mass: m,
        fPull: f,
        angleDeg: a,
        muS: ms,
        muK: mk,
        g: gravity,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error solving friction problem.');
    }
  };

  const handleSolveIncline = () => {
    setErrorMsg(null);
    try {
      const m = parseFloat(massInc);
      const angle = parseFloat(angleInc);
      const mk = parseFloat(muKInc) || 0;
      const fApp = parseFloat(fAppInc) || 0;

      if (isNaN(m) || isNaN(angle)) throw new Error('Please enter valid numbers for mass and ramp angle.');

      const res = solveInclinedPlane({
        mass: m,
        angleDeg: angle,
        muK: mk,
        direction: dirInc,
        fApplied: fApp,
        g: gravity,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error solving inclined plane dynamics.');
    }
  };

  const handleModeSelect = (newMode: 'flat_friction' | 'inclined_plane') => {
    setMode(newMode);
    onModeChange?.(newMode);
    if (newMode === 'flat_friction') {
      handleSolveFlat();
    } else {
      handleSolveIncline();
    }
  };

  // Synchronize when activeMode changes from external navigation
  React.useEffect(() => {
    if (activeMode && activeMode !== mode) {
      setMode(activeMode);
      if (activeMode === 'flat_friction') {
        handleSolveFlat();
      } else {
        handleSolveIncline();
      }
    }
  }, [activeMode]);

  return (
    <div className="space-y-6">
      {/* Subtopic Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => handleModeSelect('flat_friction')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            mode === 'flat_friction' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Flat Surface: Pull at Angle & Friction</span>
        </button>

        <button
          onClick={() => handleModeSelect('inclined_plane')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
            mode === 'inclined_plane' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Inclined Plane & Ramp Dynamics</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {mode === 'flat_friction' ? "Newton's 2nd Law & Friction on Flat Surface" : 'Inclined Plane Force Resolution'}
            </h3>
            <p className="text-xs text-slate-400">
              Calculate Normal force, static/kinetic friction, and net acceleration.
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

        {mode === 'flat_friction' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Mass (m) [kg]:</label>
                <input
                  type="number"
                  value={massFlat}
                  onChange={(e) => setMassFlat(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Applied Force (F) [N]:</label>
                <input
                  type="number"
                  value={fPullFlat}
                  onChange={(e) => setFPullFlat(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Angle Above Horizontal (θ) [°]:</label>
                <input
                  type="number"
                  value={angleFlat}
                  onChange={(e) => setAngleFlat(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Static Friction (μs):</label>
                <input
                  type="number"
                  step="0.05"
                  value={muSFlat}
                  onChange={(e) => setMuSFlat(e.target.value)}
                  placeholder="e.g. 0.35"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Kinetic Friction (μk):</label>
                <input
                  type="number"
                  step="0.05"
                  value={muKFlat}
                  onChange={(e) => setMuKFlat(e.target.value)}
                  placeholder="e.g. 0.25"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolveFlat}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Calculate Forces & Acceleration</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Mass (m) [kg]:</label>
                <input
                  type="number"
                  value={massInc}
                  onChange={(e) => setMassInc(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Incline Angle (θ) [°]:</label>
                <input
                  type="number"
                  value={angleInc}
                  onChange={(e) => setAngleInc(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Kinetic Friction (μk):</label>
                <input
                  type="number"
                  step="0.05"
                  value={muKInc}
                  onChange={(e) => setMuKInc(e.target.value)}
                  placeholder="e.g. 0.2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Motion Direction:</label>
                <select
                  value={dirInc}
                  onChange={(e) => setDirInc(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-400 font-medium outline-none focus:border-cyan-500"
                >
                  <option value="sliding_down">Sliding Downhill</option>
                  <option value="pushed_up">Moving Uphill</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">External Push (F) [N]:</label>
                <input
                  type="number"
                  value={fAppInc}
                  onChange={(e) => setFAppInc(e.target.value)}
                  placeholder="0 for gravity-only"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolveIncline}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Calculate Ramp Forces</span>
            </button>
          </div>
        )}
      </div>

      {/* Free Body Diagram Simulator */}
      <FreeBodyDiagram
        mass={mode === 'flat_friction' ? parseFloat(massFlat) || 20 : parseFloat(massInc) || 15}
        appliedForce={mode === 'flat_friction' ? parseFloat(fPullFlat) || 80 : parseFloat(fAppInc) || 0}
        angleDeg={mode === 'flat_friction' ? parseFloat(angleFlat) || 25 : parseFloat(angleInc) || 30}
        frictionCoeff={mode === 'flat_friction' ? parseFloat(muKFlat) || 0.25 : parseFloat(muKInc) || 0.2}
        gravity={gravity}
      />

      {/* Step-by-Step Solution */}
      {solution && <SolutionDisplay solution={solution} onAskTutor={onAskTutor} gravity={gravity} />}
    </div>
  );
};
