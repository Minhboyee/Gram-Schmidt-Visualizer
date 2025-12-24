import React, { useState, useRef } from 'react';
import { Vector3, COLORS, CalculationResult } from '../types';

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

const ArrowDef = ({ id, color }: { id: string; color: string }) => (
  <marker
    id={`3d-${id}`}
    markerWidth="8"
    markerHeight="8"
    refX="7"
    refY="3"
    orient="auto"
    markerUnits="strokeWidth"
  >
    <path d="M0,0 L0,6 L9,3 z" fill={color} />
  </marker>
);

interface DrawLine3DProps {
  from: Vector3;
  to: Vector3;
  color: string;
  dashed?: boolean;
  label?: string;
  markerId: string;
  width?: number;
  projectIso: (v: Vector3) => { x: number; y: number };
  onHover: (data: HoverData | null) => void;
  tooltipVec?: Vector3;
}

const DrawLine3D: React.FC<DrawLine3DProps> = ({
  from,
  to,
  color,
  dashed = false,
  label,
  markerId,
  width = 2,
  projectIso,
  onHover,
  tooltipVec
}) => {
  const start = projectIso(from);
  const end = projectIso(to);
  const displayVec = tooltipVec || [to[0] - from[0], to[1] - from[1], to[2] - from[2]] as Vector3;

  return (
    <g
        onMouseEnter={(e) => {
            if (!label) return;
            onHover({
                vec: displayVec,
                label: label,
                x: (start.x + end.x) / 2,
                y: (start.y + end.y) / 2
            });
        }}
        onMouseLeave={() => onHover(null)}
        className="cursor-pointer"
    >
      {/* Hit box */}
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
        markerEnd={`url(#3d-${markerId})`}
        opacity={0.9}
      />
      {label && (
        <text
          x={end.x}
          y={end.y}
          dx={5}
          dy={-5}
          fill={color}
          fontSize="10"
          className="font-bold font-mono select-none pointer-events-none"
        >
          {label}
        </text>
      )}
    </g>
  );
};

const VectorsCanvas3D: React.FC<Props> = ({ vectors, calc, step }) => {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [scaleFactor, setScaleFactor] = useState(40);
  const [hovered, setHovered] = useState<HoverData | null>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const width = 600;
  const height = 500;

  // Simple orthographic projection
  const projectIso = (v: Vector3) => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    // Rotate around Y axis
    const x1 = v[0] * Math.cos(radY) - v[2] * Math.sin(radY);
    const z1 = v[0] * Math.sin(radY) + v[2] * Math.cos(radY);

    // Rotate around X axis
    const y2 = v[1] * Math.cos(radX) - z1 * Math.sin(radX);
    // const z2 = v[1] * Math.sin(radX) + z1 * Math.cos(radX); // Depth, useful for z-index sorting later if needed

    return {
      x: width / 2 + x1 * scaleFactor,
      y: height / 2 - y2 * scaleFactor, // Flip Y
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation((prev) => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const newScale = scaleFactor * (1 - e.deltaY * zoomSpeed);
    setScaleFactor(Math.max(10, Math.min(200, newScale)));
  };

  const origin: Vector3 = [0, 0, 0];

  const renderGrid = () => {
      const size = 10;
      const lines = [];
      // Draw Grid on XZ plane (y=0)
      for (let i = -size; i <= size; i++) {
          // Lines parallel to X (varying Z)
          const p1 = projectIso([-size, 0, i]);
          const p2 = projectIso([size, 0, i]);
          lines.push(<line key={`x${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={COLORS.grid} strokeWidth={1} opacity={0.2} />);
          
          // Lines parallel to Z (varying X)
          const p3 = projectIso([i, 0, -size]);
          const p4 = projectIso([i, 0, size]);
          lines.push(<line key={`z${i}`} x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke={COLORS.grid} strokeWidth={1} opacity={0.2} />);
      }
      return lines;
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
        <div className="absolute top-2 left-2 text-xs text-slate-500 font-mono pointer-events-none">
            3D Viewer (Drag to Rotate)<br/>
            Rot: X{Math.round(rotation.x)} Y{Math.round(rotation.y)}
        </div>
        <div className="absolute top-2 right-2 text-xs text-slate-500 font-mono pointer-events-none">
          Scroll to Zoom
       </div>

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

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="pointer-events-none">
        <defs>
          <ArrowDef id="v" color={COLORS.v} />
          <ArrowDef id="u" color={COLORS.u} />
          <ArrowDef id="e" color={COLORS.e} />
          <ArrowDef id="proj" color={COLORS.proj} />
          <ArrowDef id="axis" color={COLORS.axis} />

          {/* Basis Colors */}
          <ArrowDef id="axis-x" color="#ef4444" />
          <ArrowDef id="axis-y" color="#22c55e" />
          <ArrowDef id="axis-z" color="#3b82f6" />
        </defs>

        {renderGrid()}

        {/* Axes Highlighted */}
        <DrawLine3D projectIso={projectIso} from={[-10, 0, 0]} to={[10, 0, 0]} color="#ef4444" markerId="axis-x" width={1.5} label="X" onHover={setHovered} />
        <DrawLine3D projectIso={projectIso} from={[0, -10, 0]} to={[0, 10, 0]} color="#22c55e" markerId="axis-y" width={1.5} label="Y" onHover={setHovered} />
        <DrawLine3D projectIso={projectIso} from={[0, 0, -10]} to={[0, 0, 10]} color="#3b82f6" markerId="axis-z" width={1.5} label="Z" onHover={setHovered} />

        {/* --- Render Logic --- */}

        {/* Step 0: Originals */}
        {step >= 0 && vectors.map((v, i) => (
             <DrawLine3D key={`v-${i}`} projectIso={projectIso} from={origin} to={v} color={COLORS.v} label={`v${i+1}`} markerId="v" onHover={setHovered} tooltipVec={v} />
        ))}

        {/* Step 1: u1 */}
        {step >= 1 && <DrawLine3D projectIso={projectIso} from={origin} to={calc.u[0]} color={COLORS.u} width={3} label="u1" markerId="u" onHover={setHovered} tooltipVec={calc.u[0]} />}

        {/* Step 2: Proj v2 on u1 */}
        {step >= 2 && calc.projections[0] && (
             <DrawLine3D projectIso={projectIso} from={origin} to={calc.projections[0].vector} color={COLORS.proj} dashed label="p(v2,u1)" markerId="proj" onHover={setHovered} tooltipVec={calc.projections[0].vector} />
        )}

        {/* Step 3: u2 */}
        {step >= 3 && <DrawLine3D projectIso={projectIso} from={origin} to={calc.u[1]} color={COLORS.u} width={3} label="u2" markerId="u" onHover={setHovered} tooltipVec={calc.u[1]} />}

        {/* Step 4: Proj v3 on u1, u2 */}
        {step >= 4 && vectors.length > 2 && (
            <>
                {calc.projections[1] && <DrawLine3D projectIso={projectIso} from={origin} to={calc.projections[1].vector} color={COLORS.proj} dashed label="p(v3,u1)" markerId="proj" onHover={setHovered} tooltipVec={calc.projections[1].vector} /> }
                {calc.projections[2] && <DrawLine3D projectIso={projectIso} from={origin} to={calc.projections[2].vector} color={COLORS.proj} dashed label="p(v3,u2)" markerId="proj" onHover={setHovered} tooltipVec={calc.projections[2].vector} /> }
            </>
        )}

        {/* Step 5: u3 */}
        {step >= 5 && vectors.length > 2 && (
             <DrawLine3D projectIso={projectIso} from={origin} to={calc.u[2]} color={COLORS.u} width={3} label="u3" markerId="u" onHover={setHovered} tooltipVec={calc.u[2]} />
        )}

        {/* Final: Orthonormal Basis */}
        {step >= 6 && calc.e.map((eVec, i) => (
             <DrawLine3D key={`e-${i}`} projectIso={projectIso} from={origin} to={eVec} color={COLORS.e} width={4} label={`e${i+1}`} markerId="e" onHover={setHovered} tooltipVec={eVec} />
        ))}

      </svg>
    </div>
  );
};

export default VectorsCanvas3D;