import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity, Compass } from 'lucide-react';
import { MathView } from '../MathView';

interface MotionSimProps {
  initialVelocity?: number;
  acceleration?: number;
  angleDeg?: number;
  initialHeight?: number;
  gravity?: number;
  simType?: '1d' | 'projectile';
}

export const MotionSim: React.FC<MotionSimProps> = ({
  initialVelocity = 20,
  acceleration = 2,
  angleDeg = 40,
  initialHeight = 0,
  gravity = 9.8,
  simType: defaultType = 'projectile',
}) => {
  const [mode, setMode] = useState<'projectile' | '1d'>(defaultType);
  const [v0, setV0] = useState(initialVelocity);
  const [a1D, setA1D] = useState(acceleration);
  const [angle, setAngle] = useState(angleDeg);
  const [y0, setY0] = useState(initialHeight);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 2D Projectile derived parameters
  const rad = (angle * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  const tApex = v0y / gravity;
  const hApex = y0 + (v0y * v0y) / (2 * gravity);

  // Total flight time for projectile
  const discr = v0y * v0y + 2 * gravity * y0;
  const tTotalProjectile = Math.max(0.1, (v0y + Math.sqrt(Math.max(0, discr))) / gravity);
  const rangeTotal = v0x * tTotalProjectile;

  // Total time for 1D simulation
  const tTotal1D = 8; // standard 8s duration for 1D

  const maxTime = mode === 'projectile' ? tTotalProjectile : tTotal1D;

  // Animation Loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current != null) {
        const deltaSec = ((timestamp - lastTimeRef.current) / 1000) * playbackSpeed;
        setCurrentTime((prev) => {
          const next = prev + deltaSec;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }
      lastTimeRef.current = timestamp;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, maxTime, playbackSpeed]);

  // Current instantaneous values at currentTime t
  let posX = 0;
  let posY = 0;
  let vx = 0;
  let vy = 0;
  let currentSpeed = 0;

  if (mode === 'projectile') {
    posX = v0x * currentTime;
    posY = Math.max(0, y0 + v0y * currentTime - 0.5 * gravity * currentTime * currentTime);
    vx = v0x;
    vy = v0y - gravity * currentTime;
    currentSpeed = Math.sqrt(vx * vx + vy * vy);
  } else {
    // 1D motion
    posX = Math.max(0, v0 * currentTime + 0.5 * a1D * currentTime * currentTime);
    posY = 0;
    vx = v0 + a1D * currentTime;
    vy = 0;
    currentSpeed = Math.abs(vx);
  }

  // Trajectory points generator for SVG
  const trajectoryPoints: string[] = [];
  const numSteps = 60;
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * maxTime;
    let px = 0;
    let py = 0;
    if (mode === 'projectile') {
      px = v0x * t;
      py = Math.max(0, y0 + v0y * t - 0.5 * gravity * t * t);
    } else {
      px = Math.max(0, v0 * t + 0.5 * a1D * t * t);
      py = 0;
    }
    trajectoryPoints.push(`${px},${py}`);
  }

  // SVG coordinate mapping
  const svgWidth = 520;
  const svgHeight = 260;
  const margin = { left: 45, right: 30, top: 30, bottom: 40 };
  const graphW = svgWidth - margin.left - margin.right;
  const graphH = svgHeight - margin.top - margin.bottom;

  const scaleX = mode === 'projectile' ? graphW / Math.max(10, rangeTotal * 1.08) : graphW / Math.max(10, (v0 * maxTime + 0.5 * a1D * maxTime * maxTime) * 1.08);
  const scaleY = mode === 'projectile' ? graphH / Math.max(5, hApex * 1.2) : 1;

  const mapToSvg = (x: number, y: number) => {
    const cx = margin.left + x * scaleX;
    const cy = svgHeight - margin.bottom - y * scaleY;
    return { cx, cy };
  };

  const currentObjPos = mapToSvg(posX, posY);

  // SVG path for trajectory
  const svgPathD = trajectoryPoints
    .map((pt, idx) => {
      const [x, y] = pt.split(',').map(Number);
      const coords = mapToSvg(x, y);
      return `${idx === 0 ? 'M' : 'L'} ${coords.cx} ${coords.cy}`;
    })
    .join(' ');

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 text-slate-200">
      {/* Simulator Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Interactive Motion & Trajectory Visualizer</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time vector kinematics with position and velocity tracking
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
          <button
            onClick={() => {
              setMode('projectile');
              handleReset();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === 'projectile' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D Projectile Trajectory
          </button>
          <button
            onClick={() => {
              setMode('1d');
              handleReset();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === '1d' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            1D Accelerated Motion
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="traj-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <marker id="vel-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Ground Line */}
          <line
            x1={margin.left - 15}
            y1={svgHeight - margin.bottom}
            x2={svgWidth - 10}
            y2={svgHeight - margin.bottom}
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text x={margin.left} y={svgHeight - margin.bottom + 20} className="fill-slate-500 text-[10px] font-mono">
            0 m
          </text>
          <text x={svgWidth - margin.right} y={svgHeight - margin.bottom + 20} textAnchor="end" className="fill-slate-500 text-[10px] font-mono">
            x ({mode === 'projectile' ? rangeTotal.toFixed(1) : (posX).toFixed(1)} m)
          </text>
          {mode === 'projectile' && (
            <text x={margin.left - 10} y={margin.top + 10} textAnchor="end" className="fill-slate-500 text-[10px] font-mono">
              y (max: {hApex.toFixed(1)}m)
            </text>
          )}

          {/* Apex Indicator Line if projectile */}
          {mode === 'projectile' && hApex > y0 && (
            <>
              {(() => {
                const apexCoords = mapToSvg(v0x * tApex, hApex);
                return (
                  <g>
                    <line
                      x1={apexCoords.cx}
                      y1={svgHeight - margin.bottom}
                      x2={apexCoords.cx}
                      y2={apexCoords.cy}
                      stroke="#6366f1"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={apexCoords.cx} cy={apexCoords.cy} r="3" fill="#818cf8" />
                    <text x={apexCoords.cx} y={apexCoords.cy - 8} textAnchor="middle" className="fill-indigo-300 text-[9px] font-mono font-bold">
                      Apex: {hApex.toFixed(1)}m (t={tApex.toFixed(2)}s)
                    </text>
                  </g>
                );
              })()}
            </>
          )}

          {/* Trajectory Trail Path */}
          {mode === 'projectile' && (
            <path
              d={svgPathD}
              fill="none"
              stroke="url(#traj-gradient)"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.75"
            />
          )}

          {/* 1D Road Track Line */}
          {mode === '1d' && (
            <line
              x1={margin.left}
              y1={svgHeight - margin.bottom}
              x2={svgWidth - margin.right}
              y2={svgHeight - margin.bottom}
              stroke="#06b6d4"
              strokeWidth="3"
              opacity="0.4"
            />
          )}

          {/* Velocity Vector Arrow on Projectile/Cart */}
          {currentSpeed > 0.1 && (
            <line
              x1={currentObjPos.cx}
              y1={currentObjPos.cy}
              x2={currentObjPos.cx + (vx / Math.max(1, v0)) * 40}
              y2={currentObjPos.cy - (vy / Math.max(1, v0)) * 40}
              stroke="#10b981"
              strokeWidth="2.5"
              markerEnd="url(#vel-arrow)"
            />
          )}

          {/* Moving Object (Ball / Cart) */}
          <circle
            cx={currentObjPos.cx}
            cy={currentObjPos.cy}
            r="8"
            className="fill-cyan-400 stroke-slate-950"
            strokeWidth="2"
          />
          {/* Inner Glow */}
          <circle cx={currentObjPos.cx} cy={currentObjPos.cy} r="3" fill="#ffffff" />
        </svg>

        {/* Live Telemetry Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1">
          <div className="text-slate-400">
            Time (t): <span className="text-cyan-400 font-bold">{currentTime.toFixed(2)} s</span> / {maxTime.toFixed(2)} s
          </div>
          <div className="text-slate-400">
            Distance (x): <span className="text-emerald-400 font-bold">{posX.toFixed(1)} m</span>
          </div>
          {mode === 'projectile' && (
            <div className="text-slate-400">
              Altitude (y): <span className="text-indigo-400 font-bold">{posY.toFixed(1)} m</span>
            </div>
          )}
          <div className="text-slate-400">
            Speed (|v|): <span className="text-amber-400 font-bold">{currentSpeed.toFixed(1)} m/s</span>
          </div>
        </div>
      </div>

      {/* Scrub Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentTime >= maxTime) setCurrentTime(0);
              setIsPlaying(!isPlaying);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Reset Time to 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 0.5 : playbackSpeed === 0.5 ? 2 : 1)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold border border-slate-700 transition"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">0s</span>
          <input
            type="range"
            min="0"
            max={maxTime}
            step="0.01"
            value={currentTime}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTime(Number(e.target.value));
            }}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <span className="text-xs font-mono text-cyan-400 font-bold">{maxTime.toFixed(1)}s</span>
        </div>
      </div>

      {/* Physics Configuration Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Launch Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-400 font-medium">
            <span>Initial Velocity (v₀):</span>
            <span className="text-cyan-400 font-mono font-bold">{v0} m/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={v0}
            onChange={(e) => {
              setV0(Number(e.target.value));
              handleReset();
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Angle if projectile / Acceleration if 1D */}
        {mode === 'projectile' ? (
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Launch Angle (θ):</span>
              <span className="text-indigo-400 font-mono font-bold">{angle}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="85"
              step="1"
              value={angle}
              onChange={(e) => {
                setAngle(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Acceleration (a):</span>
              <span className="text-indigo-400 font-mono font-bold">{a1D} m/s²</span>
            </div>
            <input
              type="range"
              min="-5"
              max="10"
              step="0.5"
              value={a1D}
              onChange={(e) => {
                setA1D(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        )}

        {/* Initial Elevation / Launch Height */}
        {mode === 'projectile' && (
          <div className="space-y-1">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Launch Height (y₀):</span>
              <span className="text-emerald-400 font-mono font-bold">{y0} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={y0}
              onChange={(e) => {
                setY0(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};
