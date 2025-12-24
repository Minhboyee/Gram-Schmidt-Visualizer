import React, { useState } from 'react';
import { Vector3, COLORS, CalculationResult } from '../types';
import { add, scale } from '../utils/linearAlgebra';

interface Props {
  vectors: Vector3[];
  calc: CalculationResult;
  step: number;
}

interface HoverData {
  vec: Vector3;
  label: string;
  x: number;
  y: number;
}

const VectorsCanvas2D: React.FC<Props> = ({ vectors, calc, step }) => {
  const [scaleFactor, setScaleFactor] = useState(40); // Pixels per unit
  const [hovered, setHovered] = useState<HoverData | null>(null);

  // Config
  const width = 600;
  const height = 400;
  const originX = width / 2;
  const originY = height / 2;

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    // e.deltaY is positive when scrolling down (zoom out), negative when scrolling up (zoom in)
    const newScale = scaleFactor * (1 - e.deltaY * zoomSpeed);
    setScaleFactor(Math.max(10, Math.min(200, newScale)));
  };

  // Coordinate Helper
  const toScreen = (v: Vector3) => ({
    x: originX + v[0] * scaleFactor,
    y: originY - v[1] * scaleFactor, // Flip Y for screen coords
  });

  const ArrowDef = ({ id, color }: { id: string; color: string }) => (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="10"
      refX="9"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L0,6 L9,3 z" fill={color} />
    </marker>
  );

  const DrawLine = ({
    from,
    to,
    color,
    dashed = false,
    label,
    markerId,
    width = 2,
    tooltipVec
  }: {
    from: Vector3;
    to: Vector3;
    color: string;
    dashed?: boolean;
    label?: string;
    markerId: string;
    width?: number;
    tooltipVec?: Vector3; // Vector to show in tooltip, usually 'to - from' or just 'to' relative to origin
  }) => {
    const start = toScreen(from);
    const end = toScreen(to);
    
    // Determine the actual vector value to display. If relative to origin, it's just 'to'. 
    // If it's a difference, we might want to pass it explicitly.
    // For this app, most vectors start at origin, or are projections.
    // We'll calculate the vector difference for display if not provided, assuming from is origin.
    // But 'u2' starts at origin. 'proj' starts at origin.
    // The visual subtraction line starts at proj head.
    const displayVec = tooltipVec || [to[0] - from[0], to[1] - from[1], to[2] - from[2]] as Vector3;

    return (
      <g
        onMouseEnter={(e) => {
            if (!label) return;
            const bounds = e.currentTarget.getBoundingClientRect();
            // Calculate center of line for tooltip pos, relative to container
            setHovered({
                vec: displayVec,
                label: label,
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
            });
        }}
        onMouseLeave={() => setHovered(null)}
        className="cursor-pointer"
      >
        {/* Invisible thick line for easier hit testing */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={12}
        />
        {/* Visible line */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dashed ? '4,4' : 'none'}
          markerEnd={`url(#${markerId})`}
        />
        {label && (
          <text
            x={(start.x + end.x) / 2 + 10}
            y={(start.y + end.y) / 2 - 10}
            fill={color}
            fontSize="12"
            className="font-bold font-mono pointer-events-none"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  const origin: Vector3 = [0, 0, 0];

  // Grid Generation
  const renderGrid = () => {
      const xStart = Math.floor(-originX / scaleFactor);
      const xEnd = Math.ceil((width - originX) / scaleFactor);
      const yStart = Math.floor(-(height - originY) / scaleFactor); // Y is inverted in screen space
      const yEnd = Math.ceil(originY / scaleFactor);

      const lines = [];

      // Vertical lines
      for (let x = xStart; x <= xEnd; x++) {
          if (x === 0) continue; // Axis handled separately
          const pos = toScreen([x, 0, 0]).x;
          lines.push(
            <line key={`v${x}`} x1={pos} y1={0} x2={pos} y2={height} stroke={COLORS.grid} strokeWidth={1} opacity={0.3} />
          );
      }
      // Horizontal lines
      for (let y = yStart; y <= yEnd; y++) {
          if (y === 0) continue;
          const pos = toScreen([0, y, 0]).y;
          lines.push(
            <line key={`h${y}`} x1={0} y1={pos} x2={width} y2={pos} stroke={COLORS.grid} strokeWidth={1} opacity={0.3} />
          );
      }
      return lines;
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative"
      onWheel={handleWheel}
    >
      <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono pointer-events-none">2D Plane (Z=0)</div>
      <div className="absolute top-2 right-2 text-xs text-slate-500 font-mono pointer-events-none">Scroll to Zoom ({Math.round(scaleFactor)}px)</div>
      
      {/* Tooltip */}
      {hovered && (
          <div 
            className="absolute z-50 pointer-events-none bg-slate-800 border border-slate-600 rounded shadow-xl p-2 transform -translate-x-1/2 -translate-y-[120%]"
            style={{ left: hovered.x, top: hovered.y }}
          >
             <div className="text-center font-bold text-xs mb-1 text-slate-300">{hovered.label}</div>
             <div className="flex flex-col items-center bg-slate-950/50 rounded px-2 py-1 border border-slate-700/50">
                {hovered.vec.map((n, i) => (
                    <span key={i} className="font-mono text-xs text-blue-200 block leading-tight">
                        {n.toFixed(2)}
                    </span>
                ))}
             </div>
          </div>
      )}

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="bg-slate-900 cursor-crosshair">
        <defs>
          <ArrowDef id="arrow-v" color={COLORS.v} />
          <ArrowDef id="arrow-u" color={COLORS.u} />
          <ArrowDef id="arrow-e" color={COLORS.e} />
          <ArrowDef id="arrow-proj" color={COLORS.proj} />
          <ArrowDef id="arrow-axis" color={COLORS.axis} />
        </defs>

        {/* Grid */}
        {renderGrid()}

        {/* Axes with Highlighted Basis Colors */}
        {/* X Axis - Red */}
        <line x1={0} y1={originY} x2={width} y2={originY} stroke="#ef4444" strokeWidth={2} opacity={0.6} />
        <text x={width - 20} y={originY - 10} fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">X</text>

        {/* Y Axis - Green */}
        <line x1={originX} y1={0} x2={originX} y2={height} stroke="#22c55e" strokeWidth={2} opacity={0.6} />
        <text x={originX + 10} y={20} fill="#22c55e" fontSize="14" fontWeight="bold" fontFamily="monospace">Y</text>

        {/* Step 0: Input Vectors */}
        {step >= 0 && (
          <>
            <DrawLine from={origin} to={vectors[0]} color={COLORS.v} label="v1" markerId="arrow-v" tooltipVec={vectors[0]} />
            <DrawLine from={origin} to={vectors[1]} color={COLORS.v} label="v2" markerId="arrow-v" tooltipVec={vectors[1]} />
          </>
        )}

        {/* Step 1: u1 (Same as v1) */}
        {step >= 1 && (
            <DrawLine from={origin} to={calc.u[0]} color={COLORS.u} width={3} label="u1" markerId="arrow-u" tooltipVec={calc.u[0]} />
        )}

        {/* Step 2: Projection of v2 on u1 */}
        {step >= 2 && calc.projections[0] && (
            <DrawLine from={origin} to={calc.projections[0].vector} color={COLORS.proj} dashed label="proj(v2)" markerId="arrow-proj" tooltipVec={calc.projections[0].vector} />
        )}

        {/* Step 3: u2 = v2 - proj */}
        {step >= 3 && (
            <>
                {/* Visualizing the subtraction: Draw line from Projection Head to v2 Head (equivalent to u2 shifted) */}
                <line 
                    x1={toScreen(calc.projections[0].vector).x} 
                    y1={toScreen(calc.projections[0].vector).y}
                    x2={toScreen(vectors[1]).x}
                    y2={toScreen(vectors[1]).y}
                    stroke={COLORS.u}
                    strokeWidth={1}
                    strokeDasharray="2,2"
                    opacity={0.5}
                />
                <DrawLine from={origin} to={calc.u[1]} color={COLORS.u} width={3} label="u2" markerId="arrow-u" tooltipVec={calc.u[1]} />
            </>
        )}

        {/* Step 4: Normalization */}
        {step >= 4 && (
            <>
                <DrawLine from={origin} to={calc.e[0]} color={COLORS.e} width={4} label="e1" markerId="arrow-e" tooltipVec={calc.e[0]} />
                <DrawLine from={origin} to={calc.e[1]} color={COLORS.e} width={4} label="e2" markerId="arrow-e" tooltipVec={calc.e[1]} />
            </>
        )}

      </svg>
    </div>
  );
};

export default VectorsCanvas2D;