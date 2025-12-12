import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { AppMode } from './types';
import { AUDIO_URL } from './constants';

const LoadingScreen = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-50 pointer-events-none">
    <div className="text-center">
      <div className="text-2xl font-serif mb-4 animate-pulse">Building the Portfolio Tree...</div>
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Auto-play music attempt
  useEffect(() => {
    const playMusic = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.log("Autoplay blocked, waiting for interaction");
        }
      }
    };
    playMusic();
  }, []);

  // Ensure music starts on first interaction if autoplay failed
  const handleInteraction = () => {
    if (!userInteracted && audioRef.current) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
      setUserInteracted(true);
    }
  };

  return (
    <div 
      className="w-full h-screen bg-black relative overflow-hidden"
      onClick={handleInteraction}
      onPointerDown={handleInteraction}
    >
      {/* Background Audio */}
      <audio ref={audioRef} src={AUDIO_URL} loop />

      {/* Header UI */}
      <div className="absolute top-8 left-0 right-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <h1 className="text-5xl md:text-7xl text-white font-serif tracking-widest text-center drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
          MERRY CHRISTMAS
        </h1>
        <p className="text-yellow-400/80 mt-2 font-light tracking-wider text-sm md:text-base font-serif">
          WALL STREET EDITION
        </p>
      </div>

      {/* Instructions Overlay (Fades out) */}
      {!userInteracted && (
        <div className="absolute bottom-10 left-0 right-0 z-10 pointer-events-none text-center animate-bounce">
          <p className="text-white/50 text-sm">Click to interact • Drag to rotate</p>
        </div>
      )}
      
      {/* Audio Toggle */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
          }
        }}
        className="absolute bottom-4 right-4 z-20 text-white/50 hover:text-white transition-colors"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        )}
      </button>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 55], fov: 45 }}
        dpr={[1, 2]} // Optimize pixel ratio
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} setMode={setMode} />
        </Suspense>
      </Canvas>
      
      {/* Show loading state outside canvas to avoid blank screen */}
      <Suspense fallback={<LoadingScreen />}>
        {/* Helper to trigger suspense boundary */}
        <AssetPreloader /> 
      </Suspense>
    </div>
  );
};

// Simple component to suspend until critical assets are checked
// Real asset preloading happens in individual components, 
// this just acts as a logic gate for the initial UI
const AssetPreloader = () => {
    return null; 
}

export default App;