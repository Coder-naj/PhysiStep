import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { MathView } from '../MathView';

interface EnergyBarSimProps {
  mass?: number;
  initialHeight?: number;
  initialSpeed?: number;
  gravity?: number;
  frictionPercent?: number; // 0 to 20%
}

export const EnergyBarSim: React.FC<EnergyBarSimProps> = ({
  mass: initMass = 2,
  initialHeight: initH = 20,
  initialSpeed: initV = 0,
  gravity = 9.8,
  frictionPercent: initFriction = 0,
}) => {
  const [mass, setMass] = useState(initMass);
  const [maxHeight, setMaxHeight] = useState(initH);
  const [currentH, setCurrentH] = useState(initH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [friction, setFriction] = useState(initFriction);

  // Maximum initial mechanical energy
  const eMaxInitial = 0.5 * mass * initV * initV + mass * gravity * maxHeight;

  // Energy at current state
  const ep = mass * gravity * currentH;
  // Kinetic energy is difference minus thermal loss
  const lossFraction = (friction / 100) * ((maxHeight - currentH) / Math.max(1, maxHeight));
  const thermalLoss = eMaxInitial * lossFraction;
  const ek = Math.max(0, eMaxInitial - ep - thermalLoss);
  const currentSpeed = Math.sqrt((2 * ek) / mass);
  const currentTotal = ep + ek + thermalLoss;

  // Animation oscillation
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      phaseRef.current += 0.03;
      // Oscillate height smoothly between 0 and maxHeight
      const norm = (Math.sin(phaseRef.current) + 1) / 2; // 0 to 1
      setCurrentH(norm * maxHeight);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, maxHeight]);

  const epPct = Math.min(100, (ep / Math.max(1, currentTotal)) * 100);
  const ekPct = Math.min(100, (ek / Math.max(1, currentTotal)) * 100);
  const ethPct = Math.min(100, (thermalLoss / Math.max(1, currentTotal)) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Conservation of Mechanical Energy Simulator</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time transformation between Gravitational Potential Energy & Kinetic Energy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Animate Motion'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentH(maxHeight);
              phaseRef.current = 0;
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Reset to top"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Arena: Track Curve & Live Object */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Track Representation SVG */}
        <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-4 relative flex flex-col justify-between overflow-hidden min-h-[220px]">
          <svg viewBox="0 0 400 180" className="w-full h-auto select-none">
            <defs>
              <linearGradient id="ramp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Rollercoaster curved path */}
            <path
              d="M 30 20 Q 150 160 220 160 T 370 20"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Ground Baseline */}
            <line x1="10" y1="160" x2="390" y2="160" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
            <text x="20" y="172" className="fill-slate-600 font-mono text-[9px]">Ground Reference (h = 0 m)</text>

            {/* Animated Object Position on Track */}
            {(() => {
              // Map height (0 to maxHeight) to track coordinates
              // At currentH: fraction = currentH / maxHeight (1 at top, 0 at bottom)
              const fraction = currentH / Math.max(0.1, maxHeight);
              // Left half of curve from x=30 to x=220
              const objX = 30 + (1 - fraction) * 190;
              const objY = 20 + (1 - fraction) * 140;

              return (
                <g>
                  {/* Vertical Height Drop Line */}
                  <line x1={objX} y1={objY} x2={objX} y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x={objX + 8} y={(objY + 160) / 2} className="fill-amber-400 font-mono text-[9px] font-bold">
                    h = {currentH.toFixed(1)}m
                  </text>

                  {/* Velocity Vector Arrow */}
                  {currentSpeed > 0.5 && (
                    <line
                      x1={objX}
                      y1={objY}
                      x2={objX + (1 - fraction > 0.5 ? -1 : 1) * Math.min(45, currentSpeed * 2.5)}
                      y2={objY}
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Object sphere */}
                  <circle cx={objX} cy={objY} r="9" className="fill-amber-400 stroke-slate-900" strokeWidth="2" />
                  <circle cx={objX} cy={objY} r="3" fill="#ffffff" />
                </g>
              );
            })()}
          </svg>

          {/* Current State Gauge Pill */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-xs font-mono">
            <div>
              <span className="text-slate-400">Current Speed: </span>
              <span className="text-cyan-400 font-bold text-sm">{currentSpeed.toFixed(2)} m/s</span>
              <span className="text-slate-500 text-[10px] ml-1">({(currentSpeed * 3.6).toFixed(1)} km/h)</span>
            </div>
            <div>
              <span className="text-slate-400">Total Energy: </span>
              <span className="text-emerald-400 font-bold text-sm">{currentTotal.toFixed(1)} J</span>
            </div>
          </div>
        </div>

        {/* Dynamic Energy Bar Charts */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Energy Distribution
          </div>

          <div className="space-y-3">
            {/* Potential Energy Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-semibold">Potential (E_p = mgh)</span>
                <span className="text-white font-bold">{ep.toFixed(1)} J ({epPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-75 shadow-sm shadow-amber-500/30"
                  style={{ width: `${epPct}%` }}
                />
              </div>
            </div>

            {/* Kinetic Energy Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 font-semibold">Kinetic (E_k = ½mv²)</span>
                <span className="text-white font-bold">{ek.toFixed(1)} J ({ekPct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-75 shadow-sm shadow-cyan-500/30"
                  style={{ width: `${ekPct}%` }}
                />
              </div>
            </div>

            {/* Thermal Loss Bar if friction > 0 */}
            {friction > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-400 font-semibold">Friction Heat (W_loss)</span>
                  <span className="text-white font-bold">{thermalLoss.toFixed(1)} J ({ethPct.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-75"
                    style={{ width: `${ethPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-tight">
            <span className="font-semibold text-emerald-400">Law: </span>
            As height drops, potential energy decreases while kinetic energy increases by the exact same amount!
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Height Scrub Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Manual Height (h):</span>
            <span className="text-amber-400 font-mono font-bold">{currentH.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxHeight}
            step="0.2"
            value={currentH}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentH(Number(e.target.value));
            }}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Mass Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Mass (m):</span>
            <span className="text-cyan-400 font-mono font-bold">{mass} kg</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Max Elevation Top Hill */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Initial Drop Peak:</span>
            <span className="text-indigo-400 font-mono font-bold">{maxHeight} m</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={maxHeight}
            onChange={(e) => {
              setMaxHeight(Number(e.target.value));
              setCurrentH(Number(e.target.value));
            }}
            className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
