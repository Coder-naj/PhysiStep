import React, { useState } from 'react';
import { GravityConstant, PhysicsSolution } from '../../types';
import { solveWorkDone, solveEnergyConservation, solvePowerEfficiency } from '../../utils/physicsEngine';
import { SolutionDisplay } from '../SolutionDisplay';
import { EnergyBarSim } from '../simulators/EnergyBarSim';
import { Sparkles, Zap, Gauge } from 'lucide-react';

interface WorkEnergySolverProps {
  gravity: GravityConstant;
  onAskTutor?: (question: string) => void;
  activeTopic?: 'work' | 'conservation' | 'power';
  onTopicChange?: (topic: 'work' | 'conservation' | 'power') => void;
}

export const WorkEnergySolver: React.FC<WorkEnergySolverProps> = ({ 
  gravity, 
  onAskTutor,
  activeTopic,
  onTopicChange 
}) => {
  const [topic, setTopic] = useState<'work' | 'conservation' | 'power'>(activeTopic || 'conservation');

  // Work inputs
  const [forceVal, setForceVal] = useState<string>('120');
  const [dispVal, setDispVal] = useState<string>('15');
  const [angleVal, setAngleVal] = useState<string>('30');

  // Conservation inputs
  const [massCons, setMassCons] = useState<string>('500');
  const [h1Cons, setH1Cons] = useState<string>('35');
  const [v1Cons, setV1Cons] = useState<string>('0');
  const [h2Cons, setH2Cons] = useState<string>('0');
  const [wLossCons, setWLossCons] = useState<string>('0');

  // Power inputs
  const [workPower, setWorkPower] = useState<string>('300000');
  const [timePower, setTimePower] = useState<string>('15');
  const [inPower, setInPower] = useState<string>('25000');

  const [solution, setSolution] = useState<PhysicsSolution | null>(() => {
    try {
      return solveEnergyConservation({
        mass: 500,
        h1: 35,
        v1: 0,
        h2: 0,
        g: gravity,
      });
    } catch {
      return null;
    }
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSolveWork = () => {
    setErrorMsg(null);
    try {
      const f = parseFloat(forceVal);
      const d = parseFloat(dispVal);
      const a = parseFloat(angleVal) || 0;
      if (isNaN(f) || isNaN(d)) throw new Error('Please enter valid numbers for force and displacement.');
      const res = solveWorkDone({ force: f, displacement: d, angleDeg: a });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error calculating work done.');
    }
  };

  const handleSolveConservation = () => {
    setErrorMsg(null);
    try {
      const m = parseFloat(massCons);
      const h1 = parseFloat(h1Cons);
      const v1 = parseFloat(v1Cons) || 0;
      const h2 = h2Cons.trim() !== '' ? parseFloat(h2Cons) : undefined;
      const wLoss = parseFloat(wLossCons) || 0;
      if (isNaN(m) || isNaN(h1)) throw new Error('Please enter valid numbers for mass and initial height.');
      const res = solveEnergyConservation({
        mass: m,
        h1,
        v1,
        h2,
        wLoss,
        g: gravity,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error computing energy conservation.');
    }
  };

  const handleSolvePower = () => {
    setErrorMsg(null);
    try {
      const w = parseFloat(workPower);
      const t = parseFloat(timePower);
      const pIn = inPower.trim() !== '' ? parseFloat(inPower) : undefined;
      if (isNaN(w) || isNaN(t) || t <= 0) throw new Error('Please enter valid positive values for work and time.');
      const res = solvePowerEfficiency({
        workOrEnergy: w,
        time: t,
        inputPower: pIn,
      });
      setSolution(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error calculating power and efficiency.');
    }
  };

  const handleTopicSelect = (newTopic: 'work' | 'conservation' | 'power') => {
    setTopic(newTopic);
    onTopicChange?.(newTopic);
    if (newTopic === 'conservation') {
      handleSolveConservation();
    } else if (newTopic === 'work') {
      handleSolveWork();
    } else {
      handleSolvePower();
    }
  };

  // Synchronize when activeTopic changes from external navigation
  React.useEffect(() => {
    if (activeTopic && activeTopic !== topic) {
      setTopic(activeTopic);
      if (activeTopic === 'conservation') {
        handleSolveConservation();
      } else if (activeTopic === 'work') {
        handleSolveWork();
      } else {
        handleSolvePower();
      }
    }
  }, [activeTopic]);

  return (
    <div className="space-y-6">
      {/* Subtopic Selector */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => handleTopicSelect('conservation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            topic === 'conservation' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Conservation of Mechanical Energy (Ek + Ep)</span>
        </button>

        <button
          onClick={() => handleTopicSelect('work')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            topic === 'work' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Work Done by Force (W = F·d·cosθ)</span>
        </button>

        <button
          onClick={() => handleTopicSelect('power')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            topic === 'power' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Power & Mechanical Efficiency</span>
        </button>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {topic === 'conservation' && 'Mechanical Energy Conservation Engine'}
              {topic === 'work' && 'Work Calculation by Constant Force'}
              {topic === 'power' && 'Power Output & Motor Efficiency Calculator'}
            </h3>
            <p className="text-xs text-slate-400">
              {topic === 'conservation' && 'Calculate final velocity or maximum height reached across energy states.'}
              {topic === 'work' && 'Evaluate scalar energy transfer with directional angle factor.'}
              {topic === 'power' && 'Calculate energy transfer rate in Watts and conversion efficiency.'}
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

        {/* Conservation Form */}
        {topic === 'conservation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Mass (m) [kg]:</label>
                <input
                  type="number"
                  value={massCons}
                  onChange={(e) => setMassCons(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Initial Height (h₁) [m]:</label>
                <input
                  type="number"
                  value={h1Cons}
                  onChange={(e) => setH1Cons(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Initial Speed (v₁) [m/s]:</label>
                <input
                  type="number"
                  value={v1Cons}
                  onChange={(e) => setV1Cons(e.target.value)}
                  placeholder="0 for rest"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Final Height (h₂) [m]:</label>
                <input
                  type="number"
                  value={h2Cons}
                  onChange={(e) => setH2Cons(e.target.value)}
                  placeholder="0 for ground level"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Thermal Loss (W_loss) [J]:</label>
                <input
                  type="number"
                  value={wLossCons}
                  onChange={(e) => setWLossCons(e.target.value)}
                  placeholder="0 for frictionless"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolveConservation}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Solve Energy Conservation</span>
            </button>
          </div>
        )}

        {/* Work Form */}
        {topic === 'work' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Force (F) [Newtons]:</label>
                <input
                  type="number"
                  value={forceVal}
                  onChange={(e) => setForceVal(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Displacement (d) [meters]:</label>
                <input
                  type="number"
                  value={dispVal}
                  onChange={(e) => setDispVal(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Angle between F & d (θ) [°]:</label>
                <input
                  type="number"
                  value={angleVal}
                  onChange={(e) => setAngleVal(e.target.value)}
                  placeholder="0 for in-line push"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolveWork}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Calculate Work Done (Joules)</span>
            </button>
          </div>
        )}

        {/* Power Form */}
        {topic === 'power' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Work or Energy (W) [Joules]:</label>
                <input
                  type="number"
                  value={workPower}
                  onChange={(e) => setWorkPower(e.target.value)}
                  placeholder="e.g. 300000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Time Taken (t) [seconds]:</label>
                <input
                  type="number"
                  value={timePower}
                  onChange={(e) => setTimePower(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Input Power (P_in) [Watts, optional]:</label>
                <input
                  type="number"
                  value={inPower}
                  onChange={(e) => setInPower(e.target.value)}
                  placeholder="e.g. 25000 (for efficiency %)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSolvePower}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Calculate Power & Efficiency</span>
            </button>
          </div>
        )}
      </div>

      {/* Energy Bar Simulator Visualizer */}
      <EnergyBarSim
        mass={parseFloat(massCons) || 2}
        initialHeight={parseFloat(h1Cons) || 20}
        initialSpeed={parseFloat(v1Cons) || 0}
        gravity={gravity}
      />

      {/* Step-by-Step Solution Breakdown */}
      {solution && <SolutionDisplay solution={solution} onAskTutor={onAskTutor} gravity={gravity} />}
    </div>
  );
};
