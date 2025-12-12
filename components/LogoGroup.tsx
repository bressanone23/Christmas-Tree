
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleData, AppMode, ParticleShape } from '../types';

interface ParticleMeshProps {
  particles: ParticleData[];
  texture: THREE.Texture;
  mode: AppMode;
  shape: ParticleShape;
}

const tempObject = new THREE.Object3D();

// Helper to generate texture from data
function createLogoTexture(name: string, color: string, textColor: string) {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.Texture();

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dynamic font sizing based on name length
  // Increased font sizes significantly for better visibility on small 3D objects
  const fontSize = name.length > 10 ? 85 : 115;
  ctx.font = `bold ${fontSize}px sans-serif`;

  // Wrap text if needed or just center multiple words
  const words = name.split(' ');
  const lineHeight = fontSize * 1.1; // Slightly tighter line height for larger text
  const totalHeight = words.length * lineHeight;
  let startY = (size - totalHeight) / 2 + (lineHeight / 2);

  words.forEach((word) => {
    ctx.fillText(word, size / 2, startY);
    startY += lineHeight;
  });

  // Border for definition
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 20;
  ctx.strokeRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Inner component to handle rendering of a specific shape group
const ParticleMesh: React.FC<ParticleMeshProps> = ({ particles, texture, mode, shape }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Current positions array to handle interpolation for this specific subset of particles
  const currentPositions = useMemo(() => {
    const arr = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      arr[i * 3] = p.treePos.x;
      arr[i * 3 + 1] = p.treePos.y;
      arr[i * 3 + 2] = p.treePos.z;
    });
    return arr;
  }, [particles]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const lerpFactor = THREE.MathUtils.clamp(delta * 3.5, 0, 1);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      let target: THREE.Vector3;
      if (mode === AppMode.TREE) target = p.treePos;
      else if (mode === AppMode.EXPLODE) target = p.explodePos;
      else target = p.textPos;

      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      currentPositions[ix] += (target.x - currentPositions[ix]) * lerpFactor;
      currentPositions[iy] += (target.y - currentPositions[iy]) * lerpFactor;
      currentPositions[iz] += (target.z - currentPositions[iz]) * lerpFactor;

      tempObject.position.set(currentPositions[ix], currentPositions[iy], currentPositions[iz]);
      
      // Rotation logic
      if (mode === AppMode.TREE) {
         // Base rotation
         tempObject.rotation.copy(p.randomRotation);
         tempObject.rotation.y += delta * 0.5;
         
         // Specific rotations per shape to make them catch light differently
         if (shape === 'cube') {
             tempObject.rotation.x += delta * 0.3;
             tempObject.rotation.z += delta * 0.1;
         } else {
             tempObject.rotation.y += delta * 0.2;
         }
      } else if (mode === AppMode.TEXT) {
         // Face front in text mode
         tempObject.rotation.set(0, 0, 0); 
      } else {
         tempObject.rotation.copy(p.randomRotation);
         tempObject.rotation.x += delta;
         tempObject.rotation.y += delta;
      }

      tempObject.scale.setScalar(p.scale);
      tempObject.updateMatrix();
      
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particles.length]}
      castShadow
      receiveShadow
    >
      {shape === 'sphere' ? (
        // Reduced size from 0.52 to 0.42 (~20% smaller)
        <sphereGeometry args={[0.42, 32, 32]} />
      ) : (
        // Reduced size from 1.05 to 0.84 (~20% smaller)
        <boxGeometry args={[0.84, 0.84, 0.84]} />
      )}
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={1.0} 
        metalness={0.0} 
      />
    </instancedMesh>
  );
};

interface LogoGroupProps {
  data: { name: string; color: string; textColor: string };
  particles: ParticleData[];
  mode: AppMode;
}

export const LogoGroup: React.FC<LogoGroupProps> = ({ data, particles, mode }) => {
  // Generate texture on the fly
  const texture = useMemo(() => {
    return createLogoTexture(data.name, data.color, data.textColor);
  }, [data.name, data.color, data.textColor]);

  // Split particles into spheres and cubes to render separate instanced meshes
  const { sphereParticles, cubeParticles } = useMemo(() => {
    return {
      sphereParticles: particles.filter(p => p.shape === 'sphere'),
      cubeParticles: particles.filter(p => p.shape === 'cube')
    };
  }, [particles]);

  return (
    <group>
      {sphereParticles.length > 0 && (
        <ParticleMesh 
          shape="sphere" 
          particles={sphereParticles} 
          texture={texture} 
          mode={mode} 
        />
      )}
      {cubeParticles.length > 0 && (
        <ParticleMesh 
          shape="cube" 
          particles={cubeParticles} 
          texture={texture} 
          mode={mode} 
        />
      )}
    </group>
  );
};
