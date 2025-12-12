
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { LOGO_DATA } from '../constants';
import { generateParticles } from '../utils/geometry';
import { LogoGroup } from './LogoGroup';
import { TreeTopper } from './TreeTopper';
import { AppMode } from '../types';
import { ErrorBoundary } from './ErrorBoundary';

interface SceneProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Scene: React.FC<SceneProps> = ({ mode, setMode }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate all particle data once
  const allParticles = useMemo(() => generateParticles(), []);
  
  // Group particles by logo index to minimize draw calls
  const particlesByLogo = useMemo(() => {
    const groups = Array.from({ length: LOGO_DATA.length }, () => []);
    allParticles.forEach(p => {
      groups[p.logoIndex].push(p);
    });
    return groups;
  }, [allParticles]);

  // Click Interaction Logic
  const clickStartRef = useRef<number>(0);

  const handlePointerDown = () => {
    clickStartRef.current = Date.now();
  };

  const handlePointerUp = (e: any) => {
    // Only trigger if click duration is short (not a drag)
    if (Date.now() - clickStartRef.current < 200) {
      e.stopPropagation();
      // Logic: 
      // Tree (0) -> Explode (1)
      // Explode (1) -> Text (2)
      // Text (2) -> Tree (0)
      let nextMode = AppMode.TREE;
      if (mode === AppMode.TREE) nextMode = AppMode.EXPLODE;
      else if (mode === AppMode.EXPLODE) nextMode = AppMode.TEXT;
      else if (mode === AppMode.TEXT) nextMode = AppMode.TREE;
      
      setMode(nextMode);
    }
  };

  // Rotate the entire tree slowly
  useFrame((state, delta) => {
    if (groupRef.current && mode === AppMode.TREE) {
      groupRef.current.rotation.y += delta * 0.1;
    } else if (groupRef.current && mode === AppMode.TEXT) {
      // Smoothly reset rotation to face front when text is shown
       const currentRot = groupRef.current.rotation.y;
       // Lerp to closest 0 or 2PI
       groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, 0, delta * 2);
    }
  });

  return (
    <>
      <ambientLight intensity={1.8} /> 
      <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow /> 
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#dbeafe" />
      <pointLight position={[0, -5, 0]} intensity={1.0} color="#ffb700" distance={25} decay={2} />
      <pointLight position={[0, 20, 0]} intensity={0.8} color="#ffeb3b" distance={15} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" background={false} environmentIntensity={0.2} />

      <group 
        ref={groupRef} 
        onPointerDown={handlePointerDown} 
        onPointerUp={handlePointerUp}
      >
        <ErrorBoundary fallback={null}>
          <TreeTopper mode={mode} />
        </ErrorBoundary>
        
        {LOGO_DATA.map((data, index) => (
          <ErrorBoundary key={index} fallback={null}>
            <LogoGroup 
              data={data}
              particles={particlesByLogo[index]}
              mode={mode}
            />
          </ErrorBoundary>
        ))}
      </group>

      <ContactShadows position={[0, -20, 0]} opacity={0.5} scale={50} blur={2.5} far={20} />
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={10} 
        maxDistance={100}
      />
    </>
  );
};
