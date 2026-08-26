import React, { useState } from 'react';
import { MathView } from '../MathView';
import { Eye, RotateCcw, Sliders } from 'lucide-react';

interface FreeBodyDiagramProps {
  mass?: number;
  appliedForce?: number;
  angleDeg?: number;
  frictionCoeff?: number;
  inclineAngleDeg?: number;
  gravity?: number;
  className?: string;
}

export const FreeBodyDiagram: React.FC<FreeBodyDiagramProps> = ({
  mass: initMass = 10,
  appliedForce: initF = 50,
  angleDeg: initAngle = 30,
  frictionCoeff: initMu = 0.2,
  inclineAngleDeg = 0,
  gravity = 9.8,
  className = '',
}) => {
  const [mass, setMass] = useState(initMass);
  const [appliedF, setAppliedF] = useState(initF);
  const [pullAngle, setPullAngle] = useState(initAngle);
  const [mu, setMu] = useState(initMu);
  const [showComponents, setShowComponents] = useState(true);

  // Calculations
  const weight = mass * gravity;
  const rad = (pullAngle * Math.PI) / 180;
  const fPullX = appliedF * Math.cos(rad);
  const fPullY = appliedF * Math.sin(rad);

  const normalForce = Math.max(0, weight - fPullY);
  const maxFriction = mu * normalForce;
  const isMoving = fPullX > maxFriction;
  const actualFriction = isMoving ? maxFriction : Math.min(fPullX, maxFriction);
  const netForceX = Math.max(0, fPullX - actualFriction);
  const acceleration = isMoving ? netForceX / mass : 0;

  // Visual scaling factors for SVG canvas
  const center = { x: 200, y: 160 };
  const blockSize = 64;
  const maxForceForScale = Math.max(100, weight, appliedF * 1.2);
  const scale = 80 / maxForceForScale; // pixels per Newton

  // Vector arrow endpoints
  const fgLen = weight * scale;
  const fnLen = normalForce * scale;
  const fPullLen = appliedF * scale;
  const fFrictLen = actualFriction * scale;
  const fNetLen = netForceX * scale;

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 text-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Interactive Free-Body Diagram (FBD)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Visual vector resolution of forces acting on the object
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComponents(!showComponents)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
              showComponents
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Components ({showComponents ? 'ON' : 'OFF'})</span>
          </button>

          <button
            onClick={() => {
              setMass(initMass);
              setAppliedF(initF);
              setPullAngle(initAngle);
              setMu(initMu);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden min-h-[300px]">
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs>
            <pattern id="fbd-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fbd-grid)" />
        </svg>

        <svg viewBox="0 0 400 300" className="w-full max-w-[440px] h-auto overflow-visible select-none">
          <defs>
            {/* Arrow Marker Definitions */}
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
            </marker>
            <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
            </marker>
            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker id="arrow-rose" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-indigo" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
            </marker>
          </defs>

          {/* Ground Surface */}
          <line x1="20" y1={center.y + blockSize / 2} x2="380" y2={center.y + blockSize / 2} stroke="#334155" strokeWidth="2.5" strokeDasharray="4 2" />
          <rect x="20" y={center.y + blockSize / 2} width="360" height="8" fill="#1e293b" opacity="0.4" />

          {/* Object Body */}
          <rect
            x={center.x - blockSize / 2}
            y={center.y - blockSize / 2}
            width={blockSize}
            height={blockSize}
            rx="6"
            className="fill-slate-800 stroke-cyan-500/60"
            strokeWidth="2"
          />
          <text
            x={center.x}
            y={center.y + 4}
            textAnchor="middle"
            className="fill-slate-200 font-mono text-[11px] font-bold"
          >
            {mass} kg
          </text>

          {/* Center of Mass Dot */}
          <circle cx={center.x} cy={center.y} r="3.5" fill="#38bdf8" />

          {/* 1. Gravity Vector (Downwards - Orange) */}
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x}
            y2={center.y + fgLen}
            stroke="#f97316"
            strokeWidth="2.5"
            markerEnd="url(#arrow-orange)"
          />
          <text x={center.x + 8} y={center.y + fgLen + 4} className="fill-orange-400 font-mono text-[10px] font-bold">
            F_g = {weight.toFixed(1)} N (mg)
          </text>

          {/* 2. Normal Force Vector (Upwards - Cyan) */}
          {normalForce > 0.5 && (
            <>
              <line
                x1={center.x}
                y1={center.y}
                x2={center.x}
                y2={center.y - fnLen}
                stroke="#06b6d4"
                strokeWidth="2.5"
                markerEnd="url(#arrow-cyan)"
              />
              <text x={center.x + 8} y={center.y - fnLen - 4} className="fill-cyan-400 font-mono text-[10px] font-bold">
                N = {normalForce.toFixed(1)} N
              </text>
            </>
          )}

          {/* 3. Applied Pulling Force (Emerald) */}
          {appliedF > 0 && (
            <>
              <line
                x1={center.x}
                y1={center.y}
                x2={center.x + fPullLen * Math.cos(rad)}
                y2={center.y - fPullLen * Math.sin(rad)}
                stroke="#10b981"
                strokeWidth="2.5"
                markerEnd="url(#arrow-emerald)"
              />
              <text
                x={center.x + fPullLen * Math.cos(rad) + 6}
                y={center.y - fPullLen * Math.sin(rad) - 6}
                className="fill-emerald-400 font-mono text-[10px] font-bold"
              >
                F = {appliedF} N ({pullAngle}°)
              </text>

              {/* Components of Applied Force (Dashed) */}
              {showComponents && pullAngle > 0 && (
                <>
                  {/* F_x horizontal */}
                  <line
                    x1={center.x}
                    y1={center.y}
                    x2={center.x + fPullX * scale}
                    y2={center.y}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text x={center.x + (fPullX * scale) / 2} y={center.y + 14} className="fill-emerald-300 text-[9px] font-mono">
                    F_x = {fPullX.toFixed(1)} N
                  </text>

                  {/* F_y vertical */}
                  <line
                    x1={center.x + fPullX * scale}
                    y1={center.y}
                    x2={center.x + fPullX * scale}
                    y2={center.y - fPullY * scale}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text x={center.x + fPullX * scale + 4} y={center.y - (fPullY * scale) / 2} className="fill-emerald-300 text-[9px] font-mono">
                    F_y = {fPullY.toFixed(1)} N
                  </text>
                </>
              )}
            </>
          )}

          {/* 4. Friction Force (Leftwards - Rose) */}
          {actualFriction > 0.1 && (
            <>
              <line
                x1={center.x}
                y1={center.y}
                x2={center.x - fFrictLen}
                y2={center.y}
                stroke="#f43f5e"
                strokeWidth="2.5"
                markerEnd="url(#arrow-rose)"
              />
              <text x={center.x - fFrictLen - 6} y={center.y - 6} textAnchor="end" className="fill-rose-400 font-mono text-[10px] font-bold">
                f = {actualFriction.toFixed(1)} N
              </text>
            </>
          )}

          {/* 5. Net Force Indicator (Indigo) */}
          {netForceX > 0.5 && (
            <g transform={`translate(20, 30)`}>
              <rect x="0" y="0" width="130" height="28" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" opacity="0.9" />
              <text x="8" y="18" className="fill-indigo-300 font-mono text-[10px] font-bold">
                F_net = {netForceX.toFixed(1)} N →
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Sliders & Live Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Mass Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Mass (m):</span>
            <span className="text-white font-mono">{mass} kg</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Applied Force Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Pulling Force (F):</span>
            <span className="text-emerald-400 font-mono">{appliedF} N</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={appliedF}
            onChange={(e) => setAppliedF(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Pulling Angle Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Angle (θ):</span>
            <span className="text-indigo-400 font-mono">{pullAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="75"
            step="5"
            value={pullAngle}
            onChange={(e) => setPullAngle(Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Friction Coeff Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Friction Coeff (μ):</span>
            <span className="text-rose-400 font-mono">{mu.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={mu}
            onChange={(e) => setMu(Number(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Real-time State Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Motion Status:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${
            isMoving ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {isMoving ? `Accelerating (a = ${acceleration.toFixed(2)} m/s²)` : 'Static Rest (f_s balances F_x)'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>N = {normalForce.toFixed(1)} N</span>
          <span>f = {actualFriction.toFixed(1)} N</span>
          <span>F_net = {netForceX.toFixed(1)} N</span>
        </div>
      </div>
    </div>
  );
};
