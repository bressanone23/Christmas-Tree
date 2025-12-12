import * as THREE from 'three';

export type ParticleShape = 'sphere' | 'cube';

export type ParticleData = {
  id: number;
  logoIndex: number;
  shape: ParticleShape;
  // Target vectors for different modes
  treePos: THREE.Vector3;
  explodePos: THREE.Vector3;
  textPos: THREE.Vector3;
  // Randomized rotation/scale for visual variety
  randomRotation: THREE.Euler;
  scale: number;
};

export enum AppMode {
  TREE = 0,
  EXPLODE = 1,
  TEXT = 2,
}