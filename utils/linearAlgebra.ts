import { Vector3, CalculationResult } from '../types';

export const add = (a: Vector3, b: Vector3): Vector3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vector3, b: Vector3): Vector3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (v: Vector3, s: number): Vector3 => [v[0] * s, v[1] * s, v[2] * s];
export const dot = (a: Vector3, b: Vector3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const mag = (v: Vector3): number => Math.sqrt(dot(v, v));

export const normalize = (v: Vector3): Vector3 => {
  const m = mag(v);
  return m === 0 ? [0, 0, 0] : scale(v, 1 / m);
};

export const project = (v: Vector3, u: Vector3): Vector3 => {
  const u_dot_u = dot(u, u);
  if (u_dot_u === 0) return [0, 0, 0];
  const scalar = dot(v, u) / u_dot_u;
  return scale(u, scalar);
};

export const calculateGramSchmidt = (vectors: Vector3[]): CalculationResult => {
  const u: Vector3[] = [];
  const e: Vector3[] = [];
  const projections: CalculationResult['projections'] = [];

  // Step 1: u1 = v1
  if (vectors.length > 0) {
    u.push(vectors[0]);
    e.push(normalize(vectors[0]));
  }

  // Step 2: u2 = v2 - proj_u1(v2)
  if (vectors.length > 1) {
    const v2 = vectors[1];
    const u1 = u[0];
    const proj_v2_on_u1 = project(v2, u1);
    
    projections.push({ target: 1, on: 0, vector: proj_v2_on_u1 });
    
    const u2 = sub(v2, proj_v2_on_u1);
    u.push(u2);
    e.push(normalize(u2));
  }

  // Step 3: u3 = v3 - proj_u1(v3) - proj_u2(v3)
  if (vectors.length > 2) {
    const v3 = vectors[2];
    const u1 = u[0];
    const u2 = u[1];

    const proj_v3_on_u1 = project(v3, u1);
    const proj_v3_on_u2 = project(v3, u2);

    projections.push({ target: 2, on: 0, vector: proj_v3_on_u1 });
    projections.push({ target: 2, on: 1, vector: proj_v3_on_u2 });

    const u3 = sub(sub(v3, proj_v3_on_u1), proj_v3_on_u2);
    u.push(u3);
    e.push(normalize(u3));
  }

  return { u, e, projections };
};
