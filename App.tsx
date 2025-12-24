import React, { useState, useMemo, useEffect } from 'react';
import { Vector3, COLORS } from './types';
import { calculateGramSchmidt } from './utils/linearAlgebra';
import VectorsCanvas2D from './components/VectorsCanvas2D';
import VectorsCanvas3D from './components/VectorsCanvas3D';
import MathPanel from './components/MathPanel';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Layers, Box } from 'lucide-react';

// Default Scenarios
const SCENARIO_2D: Vector3[] = [[3, 1, 0], [2, 4, 0]];
const SCENARIO_3D: Vector3[] = [[2, 0, 0], [2, 2, 0], [2, 2, 2]]; // Simple basis

const parseInput = (str: string): number => {
  const clean = str.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
  }
  return parseFloat(clean);
};

const vecToStrings = (vecs: Vector3[]) => vecs.map(v => v.map(n => n.toString()));

const App: React.FC = () => {
  const [dimension, setDimension] = useState<2 | 3>(2);
  const [step, setStep] = useState(0);
  const [vectors, setVectors] = useState<Vector3[]>(SCENARIO_2D);
  const [rawInputs, setRawInputs] = useState<string[][]>(vecToStrings(SCENARIO_2D));

  // Use a handler to update dimension and vectors atomically
  const changeDimension = (newDim: 2 | 3) => {
    const newVecs = newDim === 2 ? SCENARIO_2D : SCENARIO_3D;
    setDimension(newDim);
    setVectors(newVecs);
    setRawInputs(vecToStrings(newVecs));
    setStep(0);
  };

  const maxSteps = dimension === 2 ? 4 : 6;

  // Memoize calculation so it doesn't re-run on every render/rotation
  const calcResult = useMemo(() => calculateGramSchmidt(vectors), [vectors]);

  const handleNext = () => setStep(s => Math.min(s + 1, maxSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 0));
  
  const handleReset = () => {
      const resetVecs = dimension === 2 ? SCENARIO_2D : SCENARIO_3D;
      setVectors(resetVecs);
      setRawInputs(vecToStrings(resetVecs));
      setStep(0);
  };

  const handleVectorChange = (idx: number, coord: 0 | 1 | 2, val: string) => {
    // Update raw input display
    const newRaw = [...rawInputs];
    if (!newRaw[idx]) newRaw[idx] = []; // Safety
    newRaw[idx] = [...newRaw[idx]];
    newRaw[idx][coord] = val;
    setRawInputs(newRaw);

    // Try to parse and update actual vector
    const num = parseInput(val);
    if (!isNaN(num)) {
        const newVecs = [...vectors];
        newVecs[idx] = [...newVecs[idx]] as Vector3;
        newVecs[idx][coord] = num;
        setVectors(newVecs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gram-Schmidt Visualizer</h1>
              <p className="text-xs text-slate-400">Interactive Orthogonalization</p>
            </div>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => changeDimension(2)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                dimension === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> 2D Mode
            </button>
            <button
              onClick={() => changeDimension(3)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                dimension === 3 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" /> 3D Mode
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Controls & Math */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Controls */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Input Vectors</h2>
            <div className="space-y-4">
              {vectors.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono w-6">v{i+1}</span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      value={rawInputs[i]?.[0] ?? v[0]} 
                      onChange={(e) => handleVectorChange(i, 0, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                      placeholder="x"
                    />
                    <input 
                      type="text" 
                      value={rawInputs[i]?.[1] ?? v[1]} 
                      onChange={(e) => handleVectorChange(i, 1, e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                      placeholder="y"
                    />
                    {dimension === 3 && (
                      <input 
                        type="text" 
                        value={rawInputs[i]?.[2] ?? v[2]} 
                        onChange={(e) => handleVectorChange(i, 2, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                        placeholder="z"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between gap-2 border-t border-slate-800 pt-6">
                <button 
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                   <button 
                    onClick={handlePrev}
                    disabled={step === 0}
                    className="text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                   >
                     <ChevronLeft className="w-6 h-6" />
                   </button>
                   <span className="font-mono font-bold w-16 text-center text-sm">
                     Step {step}/{maxSteps}
                   </span>
                   <button 
                    onClick={handleNext}
                    disabled={step === maxSteps}
                    className="text-white hover:text-blue-400 disabled:opacity-30 disabled:hover:text-white transition-colors"
                   >
                     {step === maxSteps ? <Play className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                   </button>
                </div>
            </div>
          </div>

          {/* Math Panel */}
          <div className="flex-1 min-h-[300px]">
            <MathPanel step={step} vectors={vectors} calc={calcResult} dimension={dimension} />
          </div>

        </div>

        {/* Right Col: Visualizer */}
        <div className="lg:col-span-8 h-[500px] lg:h-auto min-h-[500px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden relative">
           {dimension === 2 ? (
             <VectorsCanvas2D vectors={vectors} calc={calcResult} step={step} />
           ) : (
             <VectorsCanvas3D vectors={vectors} calc={calcResult} step={step} />
           )}

           {/* Legend overlay */}
           <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs space-y-2 pointer-events-none z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.v }}></div>
                <span className="text-slate-300">v (Input)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.proj }}></div>
                <span className="text-slate-300">Projection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.u }}></div>
                <span className="text-slate-300">u (Orthogonal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.e }}></div>
                <span className="text-slate-300">e (Orthonormal)</span>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;