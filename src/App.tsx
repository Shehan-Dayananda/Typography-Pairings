/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Orbit, 
  Thermometer, 
  Globe, 
  Milestone, 
  Moon, 
  Clock, 
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Activity,
  Compass,
  Settings2,
  Music,
  Headphones,
  Flame,
  Cpu,
  Layers,
  Power,
  Wrench
} from 'lucide-react';
import { StellarCanvas, PlanetData } from './components/StellarCanvas';
import { EngineCanvas, EngineData } from './components/EngineCanvas';
import { ENGINE_DOSSIERS } from './data/engines';

// Comprehensive planet details including chemical composition and telemetry
interface AdvancedPlanet extends PlanetData {
  num: string;
  tagline: string;
  mass: string;
  gravity: string;
  pressure: string;
  composition: { name: string; percentage: number; color: string }[];
  funFact: string;
}

const ADVANCED_PLANETS: AdvancedPlanet[] = [
  {
    id: 'mercury',
    num: '01',
    name: 'Mercury',
    tagline: 'The Swift Messenger',
    type: 'Terrestrial',
    distance: 1.2,
    realDistance: '0.39 AU',
    size: 5,
    color: 'from-gray-400 to-gray-600',
    gradientColors: ['#9ca3af', '#4b5563'],
    speed: 4.1,
    moonsCount: 0,
    yearLength: '88 Days',
    temp: '-173°C to 427°C',
    mass: '0.055 M⊕',
    gravity: '3.7 m/s²',
    pressure: 'Trace (10⁻¹⁴ bar)',
    bgHex: '#9ca3af',
    composition: [
      { name: 'Oxygen', percentage: 42, color: 'bg-blue-400' },
      { name: 'Sodium', percentage: 29, color: 'bg-yellow-400' },
      { name: 'Hydrogen', percentage: 22, color: 'bg-sky-300' },
      { name: 'Helium', percentage: 7, color: 'bg-emerald-400' }
    ],
    funFact: 'Despite being closest to the Sun, Mercury is not the hottest planet; that title belongs to Venus due to its runaway greenhouse effect!'
  },
  {
    id: 'venus',
    num: '02',
    name: 'Venus',
    tagline: 'The Evening Star',
    type: 'Terrestrial',
    distance: 1.8,
    realDistance: '0.72 AU',
    size: 10,
    color: 'from-amber-400 to-yellow-600',
    gradientColors: ['#fbbf24', '#b45309'],
    speed: 1.6,
    moonsCount: 0,
    yearLength: '225 Days',
    temp: '462°C',
    mass: '0.815 M⊕',
    gravity: '8.87 m/s²',
    pressure: '92 bar',
    bgHex: '#fbbf24',
    composition: [
      { name: 'Carbon Dioxide', percentage: 96.5, color: 'bg-amber-500' },
      { name: 'Nitrogen', percentage: 3.5, color: 'bg-indigo-400' }
    ],
    funFact: 'Venus rotates on its axis backwards (retrograde rotation) compared to most other planets, meaning the Sun rises in the west.'
  },
  {
    id: 'earth',
    num: '03',
    name: 'Earth',
    tagline: 'The Oasis of Life',
    type: 'Terrestrial',
    distance: 2.5,
    realDistance: '1.00 AU',
    size: 11,
    color: 'from-blue-400 to-emerald-600',
    gradientColors: ['#3b82f6', '#059669'],
    speed: 1.0,
    moonsCount: 1,
    yearLength: '365.25 Days',
    temp: '-88°C to 58°C',
    mass: '1.000 M⊕',
    gravity: '9.81 m/s²',
    pressure: '1.013 bar',
    bgHex: '#3b82f6',
    composition: [
      { name: 'Nitrogen', percentage: 78, color: 'bg-indigo-400' },
      { name: 'Oxygen', percentage: 21, color: 'bg-emerald-400' },
      { name: 'Argon', percentage: 0.9, color: 'bg-gray-400' },
      { name: 'Carbon Dioxide', percentage: 0.1, color: 'bg-red-400' }
    ],
    funFact: 'Earth is the only place in the universe with known active liquid water oceans and vibrant bio-intelligence ecosystems.'
  },
  {
    id: 'mars',
    num: '04',
    name: 'Mars',
    tagline: 'The Red Planet',
    type: 'Terrestrial',
    distance: 3.2,
    realDistance: '1.52 AU',
    size: 7,
    color: 'from-red-500 to-orange-700',
    gradientColors: ['#ef4444', '#b91c1c'],
    speed: 0.53,
    moonsCount: 2,
    yearLength: '687 Days',
    temp: '-143°C to 35°C',
    mass: '0.107 M⊕',
    gravity: '3.71 m/s²',
    pressure: '0.006 bar',
    bgHex: '#ef4444',
    composition: [
      { name: 'Carbon Dioxide', percentage: 95.1, color: 'bg-red-500' },
      { name: 'Nitrogen', percentage: 2.6, color: 'bg-indigo-400' },
      { name: 'Argon', percentage: 1.9, color: 'bg-gray-400' },
      { name: 'Oxygen', percentage: 0.4, color: 'bg-emerald-400' }
    ],
    funFact: 'Mars is home to Olympus Mons, the tallest volcano in the solar system, which stands three times higher than Mount Everest.'
  },
  {
    id: 'jupiter',
    num: '05',
    name: 'Jupiter',
    tagline: 'The Sovereign Giant',
    type: 'Gas Giant',
    distance: 4.2,
    realDistance: '5.20 AU',
    size: 22,
    color: 'from-orange-400 to-amber-700',
    gradientColors: ['#f97316', '#c2410c'],
    speed: 0.08,
    moonsCount: 95,
    yearLength: '12 Years',
    temp: '-108°C',
    mass: '317.8 M⊕',
    gravity: '24.79 m/s²',
    pressure: 'Extremely High',
    bgHex: '#f97316',
    composition: [
      { name: 'Hydrogen', percentage: 89.8, color: 'bg-sky-400' },
      { name: 'Helium', percentage: 10.2, color: 'bg-yellow-400' }
    ],
    funFact: 'Jupiter acts as a giant cosmic shield for Earth, using its massive gravity to pull dangerous comets and asteroids away from us.'
  },
  {
    id: 'saturn',
    num: '06',
    name: 'Saturn',
    tagline: 'The Ringed Jewel',
    type: 'Gas Giant',
    distance: 5.3,
    realDistance: '9.58 AU',
    size: 18,
    color: 'from-yellow-300 to-amber-500',
    gradientColors: ['#eab308', '#a16207'],
    speed: 0.03,
    moonsCount: 146,
    yearLength: '29 Years',
    temp: '-139°C',
    mass: '95.2 M⊕',
    gravity: '10.44 m/s²',
    pressure: 'Extremely High',
    hasRings: true,
    bgHex: '#eab308',
    composition: [
      { name: 'Hydrogen', percentage: 96.3, color: 'bg-sky-400' },
      { name: 'Helium', percentage: 3.2, color: 'bg-yellow-400' },
      { name: 'Methane', percentage: 0.5, color: 'bg-emerald-400' }
    ],
    funFact: 'Saturn is the least dense planet in our solar system; if you could find a bathtub large enough, Saturn would float in water!'
  },
  {
    id: 'uranus',
    num: '07',
    name: 'Uranus',
    tagline: 'The Tilted Ice Giant',
    type: 'Ice Giant',
    distance: 6.3,
    realDistance: '19.2 AU',
    size: 14,
    color: 'from-cyan-400 to-blue-500',
    gradientColors: ['#06b6d4', '#1d4ed8'],
    speed: 0.011,
    moonsCount: 28,
    yearLength: '84 Years',
    temp: '-197°C',
    mass: '14.5 M⊕',
    gravity: '8.69 m/s²',
    pressure: 'Extremely High',
    hasRings: true,
    bgHex: '#06b6d4',
    composition: [
      { name: 'Hydrogen', percentage: 82.5, color: 'bg-sky-400' },
      { name: 'Helium', percentage: 15.2, color: 'bg-yellow-400' },
      { name: 'Methane', percentage: 2.3, color: 'bg-emerald-400' }
    ],
    funFact: 'Uranus spins horizontally on an extreme 98-degree axial tilt, likely caused by a ancient planet-sized impact.'
  },
  {
    id: 'neptune',
    num: '08',
    name: 'Neptune',
    tagline: 'The Windswept Abyss',
    type: 'Ice Giant',
    distance: 7.3,
    realDistance: '30.1 AU',
    size: 13,
    color: 'from-blue-500 to-indigo-700',
    gradientColors: ['#6366f1', '#3730a3'],
    speed: 0.006,
    moonsCount: 16,
    yearLength: '165 Years',
    temp: '-201°C',
    mass: '17.1 M⊕',
    gravity: '11.15 m/s²',
    pressure: 'Extremely High',
    bgHex: '#6366f1',
    composition: [
      { name: 'Hydrogen', percentage: 80, color: 'bg-sky-400' },
      { name: 'Helium', percentage: 19, color: 'bg-yellow-400' },
      { name: 'Methane', percentage: 1, color: 'bg-emerald-400' }
    ],
    funFact: 'Neptune suffers the most severe weather in the Solar System, with winds reaching up to 2,100 km/h—faster than a supersonic jet!'
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'explore' | 'propulsion'>('landing');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
  const [selectedEngineId, setSelectedEngineId] = useState<string>('raptor3');
  const [engineIgnition, setEngineIgnition] = useState<boolean>(false);
  const [engineViewMode, setEngineViewMode] = useState<'wireframe' | 'hologram' | 'shaded'>('hologram');
  const [engineCutaway, setEngineCutaway] = useState<boolean>(false);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1); // Speed slider
  const [isRealistic, setIsRealistic] = useState<boolean>(false); // Scale toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); // Audio beacon
  const [lastScannedId, setLastScannedId] = useState<string>('earth');
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  
  const musicNodesRef = useRef<{
    ctx: AudioContext;
    oscillators: OscillatorNode[];
    gains: GainNode[];
    filter: BiquadFilterNode;
    lfo: OscillatorNode;
    masterGain: GainNode;
  } | null>(null);

  // Clean up Web Audio nodes when App unmounts
  useEffect(() => {
    return () => {
      if (musicNodesRef.current) {
        try {
          musicNodesRef.current.oscillators.forEach(o => o.stop());
          musicNodesRef.current.lfo.stop();
          musicNodesRef.current.ctx.close();
        } catch (_) {}
      }
    };
  }, []);

  // Soft, gorgeous real-time space ambient music synthesizer
  const startTranquilMusic = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      // Ensure no double play
      if (musicNodesRef.current) {
        stopTranquilMusic();
      }

      const ctx = new AudioContextClass();
      
      // Warm lowpass filter (the "nebula" filter) to round off high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Ultra-slow LFO (low frequency oscillator) to sweep filter back and forth like ocean waves
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.05, ctx.currentTime); // 20 second loop
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime); // sweep between 120Hz and 400Hz

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Master volume control with beautiful smooth fade-in
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3.5);

      // Deep, tranquil open chord in F Major 7 / C 
      // F1 (43.65Hz), C2 (65.41Hz), A2 (110.00Hz), C3 (130.81Hz), E3 (164.81Hz)
      const frequencies = [43.65, 65.41, 110.00, 130.81, 164.81];
      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        // Alternating warm sine and soft triangle oscillators for extra depth
        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Micro-detuning for simulated analog tape chorus warmth
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

        const g = ctx.createGain();
        // Deep bass gets more gain, high tones are soft highlights
        const baseVolume = freq < 100 ? 0.35 : 0.12;
        g.gain.setValueAtTime(baseVolume, ctx.currentTime);

        osc.connect(g);
        g.connect(filter);
        osc.start();

        oscillators.push(osc);
        gains.push(g);
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      musicNodesRef.current = {
        ctx,
        oscillators,
        gains,
        filter,
        lfo,
        masterGain
      };
      setMusicPlaying(true);
    } catch (e) {
      console.warn("Could not instantiate cosmic synthesizer space music: ", e);
    }
  };

  const stopTranquilMusic = () => {
    if (musicNodesRef.current) {
      const { ctx, oscillators, lfo, masterGain } = musicNodesRef.current;
      try {
        // Soft fade out so music transitions gracefully
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        setTimeout(() => {
          try {
            oscillators.forEach(osc => osc.stop());
            lfo.stop();
            ctx.close();
          } catch (_) {}
        }, 1200);
      } catch (_) {
        try {
          oscillators.forEach(osc => osc.stop());
          lfo.stop();
          ctx.close();
        } catch (_) {}
      }
      musicNodesRef.current = null;
    }
    setMusicPlaying(false);
  };

  const toggleTranquilMusic = () => {
    if (musicPlaying) {
      stopTranquilMusic();
    } else {
      startTranquilMusic();
    }
  };

  const selectedPlanet = ADVANCED_PLANETS.find(p => p.id === selectedPlanetId) || ADVANCED_PLANETS[2];
  const selectedEngine = ENGINE_DOSSIERS.find(e => e.id === selectedEngineId) || ENGINE_DOSSIERS[0];

  // Futuristic Web Audio Synthesizer sound generator
  const playStellarSynth = (freq: number, type: OscillatorType = 'sine', duration = 0.4) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Sweep pitch up slightly to sound like a radar/scanner
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration * 0.8);

      // Add harmonic sub-oscillator for space weight
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq / 2, ctx.currentTime);
      oscHarmonic.frequency.exponentialRampToValueAtTime(freq * 0.75, ctx.currentTime + duration);

      // Low pass filter to keep it smooth and sci-fi
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      oscHarmonic.start();
      osc.stop(ctx.currentTime + duration);
      oscHarmonic.stop(ctx.currentTime + duration);
    } catch (e) {
      // Browser autoplay policy might block sound initially, fail silently
    }
  };

  const handleSelectPlanet = (id: string) => {
    setSelectedPlanetId(id);
    if (id !== lastScannedId) {
      setLastScannedId(id);
      // Play distinct audio frequencies for terrestrial vs giant gas planets
      const isGiant = id === 'jupiter' || id === 'saturn' || id === 'uranus' || id === 'neptune';
      const frequency = isGiant ? 180 : 340;
      playStellarSynth(frequency, 'sine', 0.5);
    }
  };

  const handleBeginJourney = () => {
    setCurrentView('explore');
    playStellarSynth(440, 'triangle', 0.8);
    if (!musicPlaying) {
      startTranquilMusic();
    }
  };

  const handleFreezeSystem = () => {
    setOrbitSpeed(prev => prev === 0 ? 1 : 0);
    playStellarSynth(orbitSpeed === 0 ? 280 : 150, 'sine', 0.2);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none text-white bg-[#020205]">
      
      {/* 1. CONDITIONAL BACKGROUND VIDEO (Only render in landing view to stop animation on Begin Journey) */}
      {currentView === 'landing' && (
        <div className="video-bg-container pointer-events-none select-none">
          <iframe
            className="video-bg-iframe"
            src="https://www.youtube.com/embed/ze-FCaRMC0M?autoplay=1&mute=1&controls=0&loop=1&playlist=ze-FCaRMC0M&playsinline=1&enablejsapi=1&rel=0&showinfo=0&iv_load_policy=3"
            title="Space Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* 2. SEMI-TRANSPARENT BACKGROUND OVERLAYS */}
      <div 
        className={`absolute inset-0 z-10 transition-colors duration-1000 ${
          currentView === 'landing' ? 'bg-black/45' : 'bg-[#030308]/90'
        }`}
      />

      {/* 3. MAIN COCKPIT DASHBOARD GRID */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between w-full h-full p-3.5 sm:p-4 lg:p-6 overflow-hidden">
        
        {/* HEADER RAIL */}
        <header className="flex items-center justify-between w-full z-30 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-3">
            <Orbit className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '12s' }} />
            <div>
              <span className="font-display tracking-[0.25em] font-bold text-xs sm:text-sm text-white">
                STELLAR ORRERY
              </span>
              <span className="text-[9px] font-tech text-indigo-400/80 hidden sm:inline ml-3 tracking-widest uppercase">
                SYSTEM SCANNER V3.5-ACTIVE
              </span>
            </div>
          </div>

          {/* DYNAMIC HEADER NAVIGATION TABS */}
          {currentView !== 'landing' && (
            <div className="flex items-center bg-black/45 border border-white/5 rounded-full p-0.5 mx-2 md:mx-6 backdrop-blur-md">
              <button
                onClick={() => {
                  setCurrentView('explore');
                  setEngineIgnition(false); // Stop engine fire
                  playStellarSynth(380, 'sine', 0.2);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-display uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  currentView === 'explore'
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                Orrery Scans
              </button>
              <button
                onClick={() => {
                  setCurrentView('propulsion');
                  playStellarSynth(480, 'sine', 0.2);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-display uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  currentView === 'propulsion'
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                Propulsion Lab
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Tranquil Music Toggle Controller */}
            <button
              onClick={toggleTranquilMusic}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-display tracking-wider transition-all duration-300 cursor-pointer ${
                musicPlaying 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'
              }`}
              title="Toggle Tranquil Cosmic Space Music"
            >
              <Headphones className={`w-3.5 h-3.5 ${musicPlaying ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Space Music</span>
              <span className="font-tech text-[9px] uppercase font-bold">
                {musicPlaying ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Audio Toggle Beacon */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  // Instant preview beep
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioContextClass) playStellarSynth(500, 'sine', 0.1);
                }
              }}
              className={`p-2 rounded-full border transition-all duration-300 cursor-pointer ${
                soundEnabled 
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' 
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Telemetry Beep Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Simulated telemetry tracker */}
            <div className="flex items-center gap-2 font-tech text-[9px] text-white/40 uppercase tracking-widest hidden md:flex">
              <Activity className="w-3.5 h-3.5 text-indigo-400/60 animate-pulse" />
              <span>LOGGED IN AS USER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            </div>
          </div>
        </header>

        {/* CORE INTERFACE */}
        <main className="flex-1 flex items-stretch justify-center w-full max-w-7xl mx-auto overflow-y-auto lg:overflow-hidden my-2 lg:my-3.5 scrollbar-none">
          <AnimatePresence mode="wait">
            
            {/* PORTAL PAGE */}
            {currentView === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center px-4 max-w-3xl z-30 m-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.8 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="font-tech text-[9px] tracking-[0.2em] text-indigo-200 uppercase">
                    Holographic Astrometric Archive
                  </span>
                </motion.div>

                <h1 className="font-display tracking-[0.1em] sm:tracking-[0.15em] text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white text-shadow-glow leading-none mb-6">
                  EXPLORE <br />
                  THE PLANETS
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-gray-300 font-sans font-light tracking-wide leading-relaxed mb-10 text-shadow-sm max-w-xl">
                  Dive into a full-scale interactive 3D virtual Orrery. Real-time dynamic orbits, customizable time scales, detailed atmospheric scans, and physical telemetry files await.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleBeginJourney}
                    className="px-8 py-4 text-xs sm:text-sm font-display uppercase tracking-[0.2em] text-white modern-btn-primary flex items-center gap-3 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                    Begin Journey
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setCurrentView('propulsion');
                      playStellarSynth(480, 'triangle', 0.8);
                      if (!musicPlaying) {
                        startTranquilMusic();
                      }
                    }}
                    className="px-8 py-4 text-xs sm:text-sm font-display uppercase tracking-[0.2em] text-white/80 border border-white/20 bg-white/5 hover:bg-white/10 hover:text-white rounded-full transition-all duration-300 flex items-center gap-3 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    Propulsion Lab
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* UNIMAGINED INTERACTIVE 3D ORRERY PANEL */}
            {currentView === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7 }}
                className="w-full h-auto lg:h-full flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5 items-stretch lg:overflow-hidden"
              >
                
                {/* COLUMN 1: INTERSTELLAR ASTRO-NAVIGATOR (LEFT 3 COLS) */}
                <div className="lg:col-span-3 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative min-h-0">
                  
                  {/* Decorative Scanlines */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-[pulse_3s_infinite]" />

                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="mb-4 flex items-center justify-between">
                      <button 
                        onClick={() => {
                          setCurrentView('landing');
                          playStellarSynth(180, 'sine', 0.2);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] font-tech tracking-wider text-indigo-400 hover:text-white transition-colors duration-200"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        EXIT ORRERY
                      </button>
                      
                      <div className="text-[8px] font-tech bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 uppercase tracking-widest rounded-full">
                        SECURE_NET
                      </div>
                    </div>

                    <h3 className="text-[10px] font-tech tracking-[0.2em] text-white/40 uppercase mb-3 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      CELESTIAL DIRECTORY
                    </h3>

                    {/* Planet selection list */}
                    <div className="flex-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pr-1 pb-1 lg:pb-0 scrollbar-none select-none">
                      {ADVANCED_PLANETS.map((planet) => {
                        const isSelected = planet.id === selectedPlanetId;
                        return (
                          <button
                            key={planet.id}
                            onClick={() => handleSelectPlanet(planet.id)}
                            className={`flex-shrink-0 lg:flex-shrink flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all duration-300 relative group cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                : 'bg-white/0 border-white/5 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-tech text-[10px] ${isSelected ? 'text-indigo-400 font-bold' : 'text-white/30'}`}>
                                {planet.num}
                              </span>
                              <span className={`font-display tracking-widest text-xs uppercase transition-colors ${
                                isSelected ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white'
                              }`}>
                                {planet.name}
                              </span>
                            </div>
                            
                            <span className="font-tech text-[9px] text-white/30 hidden lg:inline">
                              {planet.realDistance}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NAV-HUD Telemetry packet in bottom left */}
                  <div className="hidden lg:block border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center justify-between text-[8px] font-tech text-white/30 mb-1.5">
                      <span>RADAR SCAN BEACON</span>
                      <span className="text-emerald-400 animate-pulse">• ONLINE</span>
                    </div>
                    <div className="bg-[#05050f]/60 backdrop-blur-md p-2.5 rounded-xl border border-white/5 text-[9px] font-tech text-indigo-300/80 leading-relaxed">
                      COORD_X: <span className="text-white">{(selectedPlanet.distance * Math.sin(Date.now() * 0.0001)).toFixed(4)}</span><br />
                      COORD_Y: <span className="text-white">{(selectedPlanet.distance * Math.cos(Date.now() * 0.0001)).toFixed(4)}</span><br />
                      RADIAL_V: <span className="text-white">{(selectedPlanet.speed * 12.4).toFixed(2)} km/s</span>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: THE 3D INTERACTIVE COSMIC CANVAS (CENTER 6 COLS) */}
                <div className="lg:col-span-6 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden relative min-h-0">
                  
                  {/* Floating Holographic Compass Overlay */}
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-full pointer-events-none">
                    <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '30s' }} />
                    <span className="font-tech text-[9px] text-gray-300 uppercase tracking-widest">
                      CAMERA VIEW: FREE FLIGHT
                    </span>
                  </div>

                  {/* Center Canvas */}
                  <div className="flex-1 w-full relative min-h-[300px] lg:min-h-0 bg-[#020205]/40">
                    <StellarCanvas
                      planets={ADVANCED_PLANETS}
                      selectedPlanetId={selectedPlanetId}
                      onSelectPlanet={handleSelectPlanet}
                      orbitSpeedScale={orbitSpeed}
                      isRealisticScale={isRealistic}
                    />
                  </div>

                  {/* SandBox / Orrery parameters control bar */}
                  <div className="bg-[#040409]/90 border-t border-white/5 p-4 z-30 select-none grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-b-2xl backdrop-blur-md">
                    
                    {/* Time Speed Modifier */}
                    <div className="md:col-span-5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-tech">
                        <span className="text-white/50 uppercase tracking-wider">ORBIT SPEED CONTROLLER</span>
                        <span className="text-indigo-400 font-bold">{orbitSpeed === 0 ? 'FREEZE / PAUSED' : `${orbitSpeed}X SPEED`}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleFreezeSystem}
                          className={`p-2 rounded-full border cursor-pointer transition-all duration-300 ${
                            orbitSpeed === 0 
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                              : 'bg-transparent border-white/10 hover:border-white/30 text-white hover:bg-white/5'
                          }`}
                          title="Pause / Resume Orbits"
                        >
                          {orbitSpeed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={orbitSpeed}
                          onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            setOrbitSpeed(newSpeed);
                            if (newSpeed > 0 && orbitSpeed === 0) {
                              playStellarSynth(300, 'sine', 0.15);
                            }
                          }}
                          className="flex-1 accent-indigo-500 h-1 bg-white/15 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Scale Ratio Selector */}
                    <div className="md:col-span-4 flex flex-col gap-1.5">
                      <span className="text-[10px] font-tech text-white/50 uppercase tracking-wider">SYSTEM SCALE REPRESENTATION</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setIsRealistic(false);
                            playStellarSynth(240, 'sine', 0.2);
                          }}
                          className={`text-[9px] font-tech py-1.5 px-3 border rounded-full uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                            !isRealistic 
                              ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                              : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          Schematic
                        </button>
                        <button
                          onClick={() => {
                            setIsRealistic(true);
                            playStellarSynth(320, 'sine', 0.2);
                          }}
                          className={`text-[9px] font-tech py-1.5 px-3 border rounded-full uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                            isRealistic 
                              ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                              : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          Realistic
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset controls */}
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                      <span className="text-[10px] font-tech text-white/50 uppercase tracking-wider">ALIGNMENT RESET</span>
                      <button
                        onClick={() => {
                          setOrbitSpeed(1);
                          setIsRealistic(false);
                          playStellarSynth(440, 'triangle', 0.3);
                        }}
                        className="text-[10px] font-tech py-1.5 px-4 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 uppercase text-center text-white cursor-pointer transition-all duration-300"
                      >
                        RESET ENGINE
                      </button>
                    </div>

                  </div>

                </div>

                {/* COLUMN 3: SCIENTIFIC LABORATORY & CHEMICAL BLUEPRINT (RIGHT 3 COLS) */}
                <div className="lg:col-span-3 glass-panel rounded-2xl p-4 flex flex-col justify-between lg:overflow-hidden select-none min-h-0">
                  
                  {/* Active Planet Dossier Info */}
                  <div className="flex flex-col gap-4 overflow-y-auto lg:overflow-y-auto scrollbar-none flex-1 pr-1">
                    
                    {/* Header with scan line */}
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-tech text-indigo-400 block tracking-widest">SCANLOCK DETECTED //</span>
                        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wide text-white">
                          {selectedPlanet.name}
                        </h2>
                      </div>
                      <span className="text-xs font-tech font-bold" style={{ color: selectedPlanet.bgHex }}>
                        {selectedPlanet.type}
                      </span>
                    </div>

                    {/* Holographic Spinning Map Miniature (Mini vector visualization) */}
                    <div className="relative w-full h-24 bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden group rounded-xl">
                      {/* Scanning vertical line animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-indigo-500/50 shadow-[0_0_10px_#6366f1] top-0 animate-[bounce_4s_infinite] pointer-events-none" />
                      
                      {/* Planet circle with gradient */}
                      <div 
                        className="w-12 h-12 rounded-full absolute shadow-2xl transition-all duration-500"
                        style={{
                          background: `radial-gradient(circle at 12px 12px, ${selectedPlanet.gradientColors[0]}, ${selectedPlanet.gradientColors[1]} 80%, #000)`,
                          boxShadow: `0 0 20px ${selectedPlanet.bgHex}33`
                        }}
                      />

                      {/* Vector orbits */}
                      <div className="absolute w-16 h-16 rounded-full border border-dashed border-white/10 animate-[spin_12s_linear_infinite]" />
                      <div className="absolute w-20 h-20 rounded-full border border-dashed border-indigo-400/5 animate-[spin_20s_linear_infinite]" />

                      {/* Real-time scanning telemetry text overlay */}
                      <div className="absolute bottom-1 right-2 font-tech text-[7px] text-white/30">
                        REF_D: {selectedPlanet.distance.toFixed(1)}AU | M_ROT: {selectedPlanet.speed.toFixed(3)}
                      </div>
                      <div className="absolute top-1 left-2 font-tech text-[7px] text-white/30 flex items-center gap-1">
                        <Settings2 className="w-2.5 h-2.5 text-indigo-400" />
                        SPECTROSCOPIC BLUEPRINT
                      </div>
                    </div>

                    {/* Scientific Stats Log */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      
                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Solar Distance</span>
                        <span className="font-display font-semibold mt-0.5 block">{selectedPlanet.realDistance}</span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Surface Temp</span>
                        <span className="font-display font-semibold mt-0.5 block">{selectedPlanet.temp}</span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Mass Value</span>
                        <span className="font-display font-semibold mt-0.5 block">{selectedPlanet.mass}</span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Gravity Force</span>
                        <span className="font-display font-semibold mt-0.5 block">{selectedPlanet.gravity}</span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Barometric Press.</span>
                        <span className="font-display font-semibold mt-0.5 block truncate">{selectedPlanet.pressure}</span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Satellites</span>
                        <span className="font-display font-semibold mt-0.5 block">
                          {selectedPlanet.moonsCount === 0 ? 'No Moons' : `${selectedPlanet.moonsCount} Moons`}
                        </span>
                      </div>

                    </div>

                    {/* Scientific chemical blueprint - Highly unimagined visual item */}
                    <div>
                      <h4 className="font-tech text-[9px] tracking-wider text-white/40 uppercase mb-2">
                        ATMOSPHERE CHEMICAL CONSTITUENTS
                      </h4>
                      <div className="flex flex-col gap-2 bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl">
                        {selectedPlanet.composition.map((element, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between font-tech text-[9px]">
                              <span className="text-white/80">{element.name}</span>
                              <span className="text-indigo-300 font-semibold">{element.percentage}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${element.percentage}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full ${element.color}`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Planetary Lore Log */}
                    <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl">
                      <h4 className="font-tech text-[9px] tracking-wider text-indigo-400 uppercase mb-1.5">
                        ASTROMETRIC LOGBOOK
                      </h4>
                      <p className="text-xs text-gray-300 font-sans font-light leading-relaxed">
                        {selectedPlanet.funFact}
                      </p>
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* ROCKET PROPULSION LAB PANEL */}
            {currentView === 'propulsion' && (
              <motion.div
                key="propulsion"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7 }}
                className="w-full h-auto lg:h-full flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-5 items-stretch lg:overflow-hidden"
              >
                
                {/* COLUMN 1: PROPULSION DIRECTORY (LEFT 3 COLS) */}
                <div className="lg:col-span-3 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative min-h-0">
                  
                  {/* Decorative Scanlines */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-[pulse_3s_infinite]" />
                  
                  <div className="flex flex-col gap-4 overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setCurrentView('landing');
                          setEngineIgnition(false);
                          playStellarSynth(180, 'sine', 0.2);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] font-tech tracking-wider text-indigo-400 hover:text-white transition-colors duration-200"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        EXIT LAB
                      </button>
                      
                      <div className="text-[8px] font-tech bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 uppercase tracking-widest rounded-full">
                        ENGINE_NET
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <h3 className="text-[10px] font-tech tracking-[0.2em] text-white/40 uppercase mb-3 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        PROPULSION INVENTORY
                      </h3>
                    </div>

                    {/* Engine selection list */}
                    <div className="flex-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pr-1 pb-1 lg:pb-0 scrollbar-none select-none">
                      {ENGINE_DOSSIERS.map((engine, idx) => {
                        const isSelected = engine.id === selectedEngineId;
                        return (
                          <button
                            key={engine.id}
                            onClick={() => {
                              setSelectedEngineId(engine.id);
                              setEngineIgnition(false); // turn off ignition when switching engines
                              playStellarSynth(320 + idx * 40, 'triangle', 0.3);
                            }}
                            className={`flex-shrink-0 lg:flex-shrink flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all duration-300 relative group cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                : 'bg-white/0 border-white/5 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-tech text-[10px] ${isSelected ? 'text-indigo-400 font-bold' : 'text-white/30'}`}>
                                M_0{idx + 1}
                              </span>
                              <span className={`font-display tracking-widest text-xs uppercase transition-colors ${
                                isSelected ? 'text-white font-bold' : 'text-white/80 group-hover:text-white'
                              }`}>
                                {engine.name}
                              </span>
                            </div>
                            
                            <span className="font-tech text-[9px] text-white/30 hidden lg:inline">
                              {engine.status.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NAV-HUD Telemetry packet in bottom left */}
                  <div className="hidden lg:block border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center justify-between text-[8px] font-tech text-white/30 mb-1.5">
                      <span>CHAMBER FLOW READOUT</span>
                      <span className={engineIgnition ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}>
                        {engineIgnition ? '• ACTIVE EXHAUST' : '• STANDBY'}
                      </span>
                    </div>
                    <div className="bg-[#05050f]/60 backdrop-blur-md p-2.5 rounded-xl border border-white/5 text-[9px] font-tech text-indigo-300/80 leading-relaxed">
                      FUEL_FLOW: <span className="text-white">{engineIgnition ? '98.4 kg/s' : '0.0 kg/s'}</span><br />
                      PUMP_RPM: <span className="text-white">{engineIgnition ? '42,400 rpm' : '0 rpm'}</span><br />
                      CORE_TEMP: <span className="text-white">{engineIgnition ? '3,480 K' : '293 K'}</span>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: 3D ENGINE CANVAS INTERACTION (CENTER 6 COLS) */}
                <div className="lg:col-span-6 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden relative min-h-0">
                  
                  {/* Floating Holographic Compass Overlay */}
                  <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-full pointer-events-none">
                    <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '30s' }} />
                    <span className="font-tech text-[9px] text-gray-300 uppercase tracking-widest font-bold">
                      BLUEPRINT ANGLE: 3D FREE ORBIT
                    </span>
                  </div>

                  {/* Core 3D engine canvas component */}
                  <div className="flex-1 w-full min-h-[300px] lg:h-0 relative">
                    <EngineCanvas 
                      engine={selectedEngine}
                      ignitionActive={engineIgnition}
                      viewMode={engineViewMode}
                      showCutaway={engineCutaway}
                    />
                  </div>

                  {/* Diagnostic & control dashboard parameters bar */}
                  <div className="bg-[#040409]/90 border-t border-white/5 p-4 z-30 select-none grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-b-2xl backdrop-blur-md">
                    
                    {/* Propulsion Ignition System Toggle */}
                    <div className="md:col-span-5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-tech">
                        <span className="text-white/50 uppercase tracking-wider">PROPULSION TEST SYSTEM</span>
                        <span className={engineIgnition ? "text-rose-400 font-bold" : "text-white/40"}>
                          {engineIgnition ? "HOT FIRE RUNNING" : "IGNITION STANDBY"}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          const newState = !engineIgnition;
                          setEngineIgnition(newState);
                          if (newState) {
                            // Deep thrust ignition rumbling synth sound
                            playStellarSynth(75, 'sawtooth', 1.2);
                            setTimeout(() => {
                              if (newState) playStellarSynth(110, 'triangle', 0.8);
                            }, 400);
                          } else {
                            // Shutdown whine
                            playStellarSynth(400, 'sine', 0.5);
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-full border flex items-center justify-center gap-2.5 cursor-pointer text-xs font-display uppercase tracking-widest transition-all duration-300 ${
                          engineIgnition 
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse' 
                            : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        }`}
                      >
                        <Flame className={`w-4 h-4 ${engineIgnition ? 'animate-bounce' : ''}`} />
                        {engineIgnition ? "CUT FUEL / SHUTDOWN" : "HOT FIRE IGNITION"}
                      </button>
                    </div>

                    {/* View Modes (Wireframe / Hologram / Shaded) */}
                    <div className="md:col-span-4 flex flex-col gap-1.5">
                      <span className="text-[10px] font-tech text-white/50 uppercase tracking-wider">BLUEPRINT DISPLAY LAYER</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['wireframe', 'hologram', 'shaded'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              setEngineViewMode(mode);
                              playStellarSynth(240, 'sine', 0.15);
                            }}
                            className={`text-[9px] font-tech py-2 px-1 border rounded-full uppercase tracking-wider cursor-pointer text-center transition-all duration-300 ${
                              engineViewMode === mode 
                                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                : 'border-white/10 hover:border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {mode.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section cut cutaway diagnostic button */}
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                      <span className="text-[10px] font-tech text-white/50 uppercase tracking-wider">X-RAY DIAGNOSTICS</span>
                      <button
                        onClick={() => {
                          setEngineCutaway(prev => !prev);
                          playStellarSynth(engineCutaway ? 220 : 380, 'triangle', 0.25);
                        }}
                        className={`text-[9px] font-tech py-2 px-3 rounded-full border uppercase text-center cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          engineCutaway 
                            ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                            : 'border-white/10 hover:border-white/30 hover:bg-white/5 text-white/70 hover:text-white'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {engineCutaway ? "FULL_SHELL" : "SECT_CUTAWAY"}
                      </button>
                    </div>

                  </div>
                </div>

                {/* COLUMN 3: PROPULSION DOSSIER INFO (RIGHT 3 COLS) */}
                <div className="lg:col-span-3 glass-panel rounded-2xl p-4 flex flex-col justify-between overflow-y-auto lg:overflow-hidden select-none min-h-0">
                  
                  <div className="flex flex-col gap-4 overflow-y-auto lg:overflow-y-auto scrollbar-none flex-1 pr-1">
                    
                    {/* Header with scan line */}
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-tech text-indigo-400 block tracking-widest">CYBER_SYS BLUEPRINT //</span>
                        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wide text-white">
                          {selectedEngine.name}
                        </h2>
                      </div>
                      <span className="text-xs font-tech font-bold" style={{ color: selectedEngine.color }}>
                        {selectedEngine.type.split(' ')[0]}
                      </span>
                    </div>

                    {/* Scientific stats grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      
                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Propellant</span>
                        <span className="font-display font-semibold mt-0.5 block truncate" style={{ color: selectedEngine.color }}>
                          {selectedEngine.fuel}
                        </span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Specific Impulse</span>
                        <span className="font-display font-semibold mt-0.5 block text-indigo-300">
                          {selectedEngine.isp}
                        </span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Thrust Force</span>
                        <span className="font-display font-semibold mt-0.5 block text-rose-300 font-bold">
                          {selectedEngine.thrust}
                        </span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Chamber Press.</span>
                        <span className="font-display font-semibold mt-0.5 block truncate">
                          {selectedEngine.chamberPressure}
                        </span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Height / Diam.</span>
                        <span className="font-display font-semibold mt-0.5 block">
                          {selectedEngine.height} x {selectedEngine.diameter}
                        </span>
                      </div>

                      <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-2.5 rounded-lg">
                        <span className="font-tech text-[8px] text-white/40 block uppercase">Gimbal Angle</span>
                        <span className="font-display font-semibold mt-0.5 block truncate text-emerald-400">
                          {selectedEngine.gimbalAngle}
                        </span>
                      </div>

                    </div>

                    {/* Ratio indicators or fuel bar */}
                    <div>
                      <h4 className="font-tech text-[9px] tracking-wider text-white/40 uppercase mb-2">
                        FUEL COMPOSITION DENSITY
                      </h4>
                      <div className="flex flex-col gap-2 bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl">
                        {selectedEngine.id === 'raptor3' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Methane (CH4)</span>
                                <span className="text-indigo-300 font-semibold font-bold">22.2%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '22.2%' }} transition={{ duration: 0.8 }} className="h-full bg-indigo-400" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Oxygen (LOX)</span>
                                <span className="text-indigo-300 font-semibold font-bold">77.8%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '77.8%' }} transition={{ duration: 0.8 }} className="h-full bg-blue-500" />
                              </div>
                            </div>
                          </>
                        ) : selectedEngine.id === 'rs25' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Hydrogen (LH2)</span>
                                <span className="text-indigo-300 font-semibold font-bold">14.3%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '14.3%' }} transition={{ duration: 0.8 }} className="h-full bg-sky-400" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Oxygen (LOX)</span>
                                <span className="text-indigo-300 font-semibold font-bold">85.7%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '85.7%' }} transition={{ duration: 0.8 }} className="h-full bg-blue-500" />
                              </div>
                            </div>
                          </>
                        ) : selectedEngine.id === 'f1' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">RP-1 Rocket Kerosene</span>
                                <span className="text-indigo-300 font-semibold font-bold">28.5%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '28.5%' }} transition={{ duration: 0.8 }} className="h-full bg-amber-400" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Oxygen (LOX)</span>
                                <span className="text-indigo-300 font-semibold font-bold">71.5%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '71.5%' }} transition={{ duration: 0.8 }} className="h-full bg-blue-500" />
                              </div>
                            </div>
                          </>
                        ) : selectedEngine.id === 'nerva' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Liquid Hydrogen Propellant</span>
                                <span className="text-indigo-300 font-semibold font-bold">100.0%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '100.0%' }} transition={{ duration: 0.8 }} className="h-full bg-sky-300" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between font-tech text-[9px]">
                                <span className="text-white/80">Argon Injected Gas</span>
                                <span className="text-indigo-300 font-semibold font-bold">100.0%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '100.0%' }} transition={{ duration: 0.8 }} className="h-full bg-cyan-400" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Development narrative block */}
                    <div className="bg-[#050510]/60 backdrop-blur-sm border border-white/5 p-3.5 rounded-xl">
                      <h4 className="font-tech text-[9px] tracking-wider text-indigo-400 uppercase mb-1.5">
                        CHRONICLE OF DEVELOPMENT
                      </h4>
                      <p className="text-xs text-gray-300 font-sans font-light leading-relaxed">
                        {selectedEngine.history}
                      </p>
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* BOTTOM HUD STATUS RAIL */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-t border-white/5 pt-3 z-30 select-none">
          <div className="flex items-center gap-4">
            <span className="font-tech text-[8px] tracking-widest text-white/30 uppercase">
              COSMIC COMPASS: ECLIPTIC PLANE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 hidden sm:inline" />
            <span className="font-tech text-[8px] tracking-widest text-white/30 uppercase hidden sm:inline">
              PROJECTION MODE: PERSPECTIVE VECTOR
            </span>
          </div>

          <div className="flex items-center gap-5 text-[8px] font-tech text-white/30">
            <span className="hover:text-white transition-colors duration-200 cursor-pointer">TERMS //</span>
            <span className="hover:text-white transition-colors duration-200 cursor-pointer">COSMIC ATLAS</span>
            <span>/</span>
            <span className="hover:text-white transition-colors duration-200 cursor-pointer text-indigo-400">PLANET_ENGINE_V3D</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
