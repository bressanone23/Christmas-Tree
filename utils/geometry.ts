
import * as THREE from 'three';
import { ParticleData, AppMode, ParticleShape } from '../types';
import { PARTICLE_COUNT, LOGO_DATA } from '../constants';

// Helper to get random point in sphere
const randomInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Generate points for the text "MERRY CHRISTMAS" by scanning a 2D canvas
const generateTextPositions = (count: number): THREE.Vector3[] => {
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 200;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return Array(count).fill(new THREE.Vector3());

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MERRY CHRISTMAS', width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const validPixels: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y += 4) { // Step to reduce density check
    for (let x = 0; x < width; x += 4) {
      const alpha = data[(y * width + x) * 4]; // Red channel is enough since it's B&W
      if (alpha > 128) {
        validPixels.push({ x, y });
      }
    }
  }

  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
    // Map pixel 2D to 3D space
    // Center is (0,0), scale down
    const x = (pixel.x - width / 2) * 0.05;
    const y = -(pixel.y - height / 2) * 0.05; // Invert Y for 3D
    const z = (Math.random() - 0.5) * 1.0; // Give it some depth
    positions.push(new THREE.Vector3(x, y, z));
  }
  return positions;
};

export const generateParticles = (): ParticleData[] => {
  const particles: ParticleData[] = [];
  const textPositions = generateTextPositions(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // 1. Tree Positions (Cone / Spiral)
    const t = i / PARTICLE_COUNT;
    const angle = t * Math.PI * 40; // many turns
    const height = 30; // Total height
    const y = (t * height) - (height / 2); // -15 to +15
    const radius = ((height / 2) - y) * 0.4; // Radius gets smaller as Y goes up
    
    // Add some noise to the spiral so it looks like a full tree, not a line
    const spiralX = Math.cos(angle) * radius;
    const spiralZ = Math.sin(angle) * radius;
    const jitter = 0.5;
    
    const treePos = new THREE.Vector3(
      spiralX + (Math.random() - 0.5) * jitter,
      y * 1.3, // Stretch vertically a bit
      spiralZ + (Math.random() - 0.5) * jitter
    );

    // 2. Explosion Positions
    const explodePos = randomInSphere(35); // Big explosion radius

    // 3. Text Positions
    const textPos = textPositions[i];

    // 4. Assign Shape (50% Sphere, 50% Cube)
    const shape: ParticleShape = Math.random() > 0.5 ? 'sphere' : 'cube';

    particles.push({
      id: i,
      logoIndex: i % LOGO_DATA.length, // Distribute logos evenly
      shape,
      treePos,
      explodePos,
      textPos,
      randomRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      // Scale range reduced (was 1.2 + random * 0.8)
      scale: 0.9 + Math.random() * 0.6, 
    });
  }

  return particles;
};
