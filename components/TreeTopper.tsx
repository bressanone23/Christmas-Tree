
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppMode } from '../types';

interface TreeTopperProps {
  mode: AppMode;
}

export const TreeTopper: React.FC<TreeTopperProps> = ({ mode }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Rotate constantly
    meshRef.current.rotation.y += delta;
    
    // Move slightly based on mode
    const targetY = mode === AppMode.TREE ? 20 : 50; // Fly away if not tree
    const targetScale = mode === AppMode.TREE ? 1 : 0; // Shrink if not tree

    meshRef.current.position.y += (targetY - meshRef.current.position.y) * delta * 2;
    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
    meshRef.current.scale.setScalar(newScale);
  });

  return (
    <mesh ref={meshRef} position={[0, 20, 0]}>
      {/* Reduced size from 2.5 to 2.0 (-20%) */}
      <octahedronGeometry args={[2.0, 0]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFAA00"
        emissiveIntensity={0.8}
        roughness={1.0}
        metalness={0.0}
      />
      <pointLight distance={20} intensity={2} color="#FFD700" />
    </mesh>
  );
};
