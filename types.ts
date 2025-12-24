export type Vector3 = [number, number, number];

export interface VisualizationState {
  vectors: Vector3[]; // Input vectors (v1, v2, v3)
  step: number; // Current step in the Gram-Schmidt process
  dimension: 2 | 3;
}

export interface CalculationResult {
  u: Vector3[]; // Orthogonal vectors
  e: Vector3[]; // Orthonormal vectors
  projections: {
    target: number; // index of vector being projected
    on: number; // index of vector being projected ONTO
    vector: Vector3; // The result of the projection
  }[];
}

export const COLORS = {
  v: '#94a3b8', // Slate 400 (Input vectors)
  u: '#3b82f6', // Blue 500 (Orthogonal)
  e: '#10b981', // Emerald 500 (Orthonormal)
  proj: '#f59e0b', // Amber 500 (Projections)
  grid: '#1e293b', // Slate 800
  axis: '#475569', // Slate 600
};
