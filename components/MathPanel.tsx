import React from 'react';
import { Vector3, CalculationResult } from '../types';

interface Props {
  step: number;
  vectors: Vector3[];
  calc: CalculationResult;
  dimension: 2 | 3;
}

const formatVec = (v: Vector3 | undefined) => {
  if (!v) return '(?)';
  return `[${v.map(n => n.toFixed(1)).join(', ')}]`;
};

const MathPanel: React.FC<Props> = ({ step, vectors, calc, dimension }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">Math Process</h2>
      
      <div className="space-y-6">
        {/* Step 0: Input */}
        <div className={`transition-opacity duration-300 ${step >= 0 ? 'opacity-100' : 'opacity-20 blur-sm'}`}>
          <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">Input</h3>
          <div className="math-font text-lg text-slate-200">
            Let <span className="text-slate-400">v₁</span> = {formatVec(vectors[0])} <br/>
            Let <span className="text-slate-400">v₂</span> = {formatVec(vectors[1])} <br/>
            {dimension === 3 && <>Let <span className="text-slate-400">v₃</span> = {formatVec(vectors[2])}</>}
          </div>
        </div>

        {/* Step 1: u1 */}
        <div className={`transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-20 blur-sm hidden'}`}>
            <h3 className="text-sm uppercase tracking-wider text-blue-400 font-semibold mb-1">Step 1: First Orthogonal Vector</h3>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <p className="math-font text-blue-200">u₁ = v₁</p>
                <p className="text-slate-400 text-sm mt-1">u₁ = {formatVec(calc.u[0])}</p>
            </div>
        </div>

        {/* Step 2 & 3: u2 */}
        <div className={`transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-20 blur-sm hidden'}`}>
            <h3 className="text-sm uppercase tracking-wider text-blue-400 font-semibold mb-1">Step 2: Second Orthogonal Vector</h3>
            <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <p className="math-font text-amber-200 mb-2">proj₍u₁₎v₂ = <span className="text-xs"> (v₂⋅u₁ / u₁⋅u₁)</span> u₁</p>
                {step >= 3 && (
                    <>
                        <p className="math-font text-blue-200">u₂ = v₂ - proj₍u₁₎v₂</p>
                        <p className="text-slate-400 text-sm mt-1">u₂ = {formatVec(calc.u[1])}</p>
                    </>
                )}
            </div>
        </div>

        {/* Step 4 & 5: u3 (3D Only) */}
        {dimension === 3 && (
            <div className={`transition-opacity duration-300 ${step >= 4 ? 'opacity-100' : 'opacity-20 blur-sm hidden'}`}>
                <h3 className="text-sm uppercase tracking-wider text-blue-400 font-semibold mb-1">Step 3: Third Orthogonal Vector</h3>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                     <p className="math-font text-amber-200 mb-2">
                         Calculate proj₍u₁₎v₃ and proj₍u₂₎v₃
                     </p>
                    {step >= 5 && (
                        <>
                            <p className="math-font text-blue-200">u₃ = v₃ - proj₍u₁₎v₃ - proj₍u₂₎v₃</p>
                            <p className="text-slate-400 text-sm mt-1">u₃ = {formatVec(calc.u[2])}</p>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Final Step: Normalization */}
        <div className={`transition-opacity duration-300 ${step >= (dimension === 2 ? 4 : 6) ? 'opacity-100' : 'opacity-20 blur-sm hidden'}`}>
            <h3 className="text-sm uppercase tracking-wider text-emerald-400 font-semibold mb-1">Final Step: Normalization</h3>
            <div className="bg-slate-900 p-3 rounded border border-emerald-900/50">
                <p className="math-font text-emerald-200">eᵢ = uᵢ / ||uᵢ||</p>
                <div className="mt-2 space-y-1 text-sm text-slate-300">
                    <p>e₁ = {formatVec(calc.e[0])}</p>
                    <p>e₂ = {formatVec(calc.e[1])}</p>
                    {dimension === 3 && <p>e₃ = {formatVec(calc.e[2])}</p>}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MathPanel;