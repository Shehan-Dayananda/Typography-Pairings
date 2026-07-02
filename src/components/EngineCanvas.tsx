import React, { useRef, useEffect, useState } from 'react';

export interface EngineData {
  id: string;
  name: string;
  type: string;
  fuel: string;
  thrust: string;
  isp: string;
  chamberPressure: string;
  height: string;
  diameter: string;
  history: string;
  status: string;
  gimbalAngle: string;
  manufacturers: string;
  color: string;
  glowColor: string;
}

interface EngineCanvasProps {
  engine: EngineData;
  ignitionActive: boolean;
  viewMode: 'wireframe' | 'hologram' | 'shaded';
  showCutaway: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const EngineCanvas: React.FC<EngineCanvasProps> = ({
  engine,
  ignitionActive,
  viewMode,
  showCutaway,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotation & Scale Angles
  const [pitch, setPitch] = useState<number>(0.2); // slight tilt downwards to look from top-side
  const [yaw, setYaw] = useState<number>(0.7);    // slight angle to see depth
  const [zoom, setZoom] = useState<number>(1.1);

  // Interaction dragging states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentAngle = useRef({ pitch: 0.2, yaw: 0.7 });

  // Plume Particle storage
  const particlesRef = useRef<Particle[]>([]);

  // Mouse handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    currentAngle.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const speed = 0.007;
    let newPitch = currentAngle.current.pitch + dy * speed;
    let newYaw = currentAngle.current.yaw + dx * speed;

    // Clamp pitch to avoid turning completely upside down
    newPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, newPitch));

    setPitch(newPitch);
    setYaw(newYaw);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.08;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(2.5, prev + zoomSpeed));
    } else {
      setZoom(prev => Math.max(0.4, prev - zoomSpeed));
    }
  };

  // Touch support for tablets & mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      currentAngle.current = { pitch, yaw };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    const speed = 0.007;
    let newPitch = currentAngle.current.pitch + dy * speed;
    let newYaw = currentAngle.current.yaw + dx * speed;
    newPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, newPitch));

    setPitch(newPitch);
    setYaw(newYaw);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D coordinate transformations
    const project = (pt: Point3D, width: number, height: number): { x: number; y: number; zDepth: number } => {
      // 1. Rotate around Y axis (Yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      let x1 = pt.x * cosY - pt.z * sinY;
      let z1 = pt.x * sinY + pt.z * cosY;

      // 2. Rotate around X axis (Pitch)
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      let y2 = pt.y * cosX - z1 * sinX;
      let z2 = pt.y * sinX + z1 * cosX;

      // 3. Zoom, Perspective & Center
      const scale = 140 * zoom;
      const perspective = 800;
      const distance = 600; // view distance
      
      const factor = perspective / (perspective + z2 + distance);
      
      const screenX = width / 2 + x1 * scale * factor;
      // Flip Y axis so negative is down (thrust direction) or positive is up
      const screenY = height / 2 - y2 * scale * factor;

      return { x: screenX, y: screenY, zDepth: z2 };
    };

    // Helper to draw a projected ring (circle in 3D)
    const draw3DRing = (
      cy: number,
      radius: number,
      segments: number,
      color: string,
      lineWidth: number,
      dotted = false,
      fillColor: string | null = null
    ) => {
      const pts: Point3D[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push({
          x: Math.cos(theta) * radius,
          y: cy,
          z: Math.sin(theta) * radius,
        });
      }

      const projected = pts.map(pt => project(pt, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio));
      
      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();

      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (dotted) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Helper to connect two 3D rings with mesh lines
    const drawMeshStructure = (
      cy1: number, r1: number,
      cy2: number, r2: number,
      ringSegments: number,
      lineColor: string,
      lineWidth: number
    ) => {
      for (let i = 0; i < ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        const p1: Point3D = { x: Math.cos(theta) * r1, y: cy1, z: Math.sin(theta) * r1 };
        const p2: Point3D = { x: Math.cos(theta) * r2, y: cy2, z: Math.sin(theta) * r2 };

        const proj1 = project(p1, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
        const proj2 = project(p2, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

        // If cutaway mode is active, don't draw mesh elements in the front-left quadrant
        if (showCutaway && Math.cos(theta) > 0 && Math.sin(theta) > 0) {
          continue; 
        }

        ctx.beginPath();
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    // Main animation loop
    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const activeColor = engine.color;
      const glowColor = engine.glowColor;

      // Draw coordinate compass axis in corner
      const compassOrigin: Point3D = { x: -w * 0.0015, y: -h * 0.0015, z: 0 }; // relative shift
      const compassX = project({ x: 30, y: 0, z: 0 }, 100, h - 80);
      const compassY = project({ x: 0, y: 30, z: 0 }, 100, h - 80);
      const compassZ = project({ x: 0, y: 0, z: 30 }, 100, h - 80);
      const compOrigin = project({ x: 0, y: 0, z: 0 }, 100, h - 80);

      // Draw Axis Lines in Left-Bottom Panel
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(compOrigin.x, compOrigin.y);
      ctx.lineTo(compassX.x, compassX.y);
      ctx.strokeStyle = '#ef4444'; // Red for X
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px monospace';
      ctx.fillText('X', compassX.x + 4, compassX.y + 3);

      ctx.beginPath();
      ctx.moveTo(compOrigin.x, compOrigin.y);
      ctx.lineTo(compassY.x, compassY.y);
      ctx.strokeStyle = '#22c55e'; // Green for Y (thrust vector)
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Y (Thrust)', compassY.x - 15, compassY.y - 6);

      ctx.beginPath();
      ctx.moveTo(compOrigin.x, compOrigin.y);
      ctx.lineTo(compassZ.x, compassZ.y);
      ctx.strokeStyle = '#3b82f6'; // Blue for Z
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('Z', compassZ.x + 4, compassZ.y + 3);

      // Render the custom 3D model of selected Engine
      const engineId = engine.id;

      // Set styles based on view modes
      const stylePrimary = viewMode === 'shaded' ? 'rgba(255, 255, 255, 0.4)' : activeColor;
      const styleAccent = viewMode === 'wireframe' ? 'rgba(255, 255, 255, 0.2)' : glowColor;
      const opacityPower = viewMode === 'hologram' ? 0.35 : 0.15;
      const fillEngine = viewMode !== 'wireframe' ? `rgba(${engineId === 'vasimr' ? '56, 189, 248' : '99, 102, 241'}, ${opacityPower})` : null;

      // 1. ENGINE GEOMETRY DEFINITION (CYLINDERS, BELLS, PIPES)
      if (engineId === 'vasimr') {
        // VASIMR: Sleek futuristic triple magnetic coils
        // It has 3 thick outer ring assemblies and a translucent blue plasma channel running down center.
        
        // Central plasma core cylinder (inner tube)
        draw3DRing(1.5, 0.3, 16, 'rgba(56, 189, 248, 0.4)', 1, false, 'rgba(56, 189, 248, 0.2)');
        draw3DRing(0.5, 0.3, segmentsForEngine(), 'rgba(56, 189, 248, 0.4)', 1, false, 'rgba(56, 189, 248, 0.2)');
        draw3DRing(-0.5, 0.3, segmentsForEngine(), 'rgba(56, 189, 248, 0.4)', 1, false, 'rgba(56, 189, 248, 0.2)');
        draw3DRing(-1.5, 0.4, segmentsForEngine(), 'rgba(56, 189, 248, 0.5)', 1.5, false, 'rgba(56, 189, 248, 0.3)');

        drawMeshStructure(1.5, 0.3, -1.5, 0.3, 8, 'rgba(56, 189, 248, 0.15)', 1);

        // Three chunky Magnetic Coils
        // Ring 1: Gas Injection Coil
        draw3DRing(1.2, 0.7, 24, stylePrimary, 3, false, fillEngine);
        draw3DRing(0.9, 0.7, 24, stylePrimary, 3, false, fillEngine);
        drawMeshStructure(1.2, 0.7, 0.9, 0.7, 16, styleAccent, 1);

        // Ring 2: RF Helicon Heating Coil
        draw3DRing(0.2, 0.85, 24, stylePrimary, 4, false, fillEngine);
        draw3DRing(-0.1, 0.85, 24, stylePrimary, 4, false, fillEngine);
        drawMeshStructure(0.2, 0.85, -0.1, 0.85, 16, styleAccent, 1);

        // Ring 3: ICH Ion Acceleration Magnet
        draw3DRing(-0.8, 0.75, 24, stylePrimary, 3.5, false, fillEngine);
        draw3DRing(-1.1, 0.75, 24, stylePrimary, 3.5, false, fillEngine);
        drawMeshStructure(-0.8, 0.75, -1.1, 0.75, 16, styleAccent, 1);

        // Frame structure columns (3 parallel outer rods supporting magnets)
        for (let j = 0; j < 3; j++) {
          const theta = (j / 3) * Math.PI * 2;
          const startPt = { x: Math.cos(theta) * 0.9, y: 1.6, z: Math.sin(theta) * 0.9 };
          const endPt = { x: Math.cos(theta) * 0.9, y: -1.4, z: Math.sin(theta) * 0.9 };
          const p1 = project(startPt, w, h);
          const p2 = project(endPt, w, h);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

      } else if (engineId === 'nerva') {
        // NERVA Nuclear Thermal Rocket:
        // A huge reactor shield sphere/cylinder at the top, thick control drum cylinders, slender nozzle.
        
        // Main Reactor Vessel (chunky cylindrical dome)
        draw3DRing(1.6, 1.0, 24, stylePrimary, 2.5, false, fillEngine);
        draw3DRing(0.4, 1.0, 24, stylePrimary, 2.5, false, fillEngine);
        drawMeshStructure(1.6, 1.0, 0.4, 1.0, 16, styleAccent, 1);

        // Top Dome Cap
        draw3DRing(1.9, 0.5, 16, stylePrimary, 1.5, false);
        drawMeshStructure(1.9, 0.5, 1.6, 1.0, 12, stylePrimary, 1);

        // Side Fuel Inlet Pipes
        for (let j = 0; j < 4; j++) {
          const theta = (j / 4) * Math.PI * 2;
          const p1 = project({ x: Math.cos(theta) * 0.3, y: 2.3, z: Math.sin(theta) * 0.3 }, w, h);
          const p2 = project({ x: Math.cos(theta) * 1.05, y: 1.4, z: Math.sin(theta) * 1.05 }, w, h);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = styleAccent;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Reactor Core Inner lines (simulating fuel rods inside cutaway)
        if (showCutaway) {
          ctx.strokeStyle = '#f97316'; // Glowing nuclear orange
          ctx.lineWidth = 1.5;
          for (let rx = -0.6; rx <= 0.6; rx += 0.3) {
            const pStart = project({ x: rx, y: 1.5, z: 0 }, w, h);
            const pEnd = project({ x: rx, y: 0.5, z: 0 }, w, h);
            ctx.beginPath();
            ctx.moveTo(pStart.x, pStart.y);
            ctx.lineTo(pEnd.x, pEnd.y);
            ctx.stroke();
          }
        }

        // Narrow Throat
        draw3DRing(-0.1, 0.25, 16, stylePrimary, 2, false);
        drawMeshStructure(0.4, 1.0, -0.1, 0.25, 12, styleAccent, 1);

        // Nuclear Nozzle Bell (highly flared)
        draw3DRing(-0.5, 0.4, 16, stylePrimary, 1.5, false);
        draw3DRing(-1.1, 0.8, 24, stylePrimary, 2, false, 'rgba(239, 68, 68, 0.08)');
        draw3DRing(-1.6, 1.15, 32, stylePrimary, 3, false, 'rgba(239, 68, 68, 0.12)');

        drawMeshStructure(-0.1, 0.25, -0.5, 0.4, 12, styleAccent, 1);
        drawMeshStructure(-0.5, 0.4, -1.1, 0.8, 16, stylePrimary, 1);
        drawMeshStructure(-1.1, 0.8, -1.6, 1.15, 24, styleAccent, 1);

      } else {
        // CHEMICAL LIQUID ENGINES (F-1, RS-25, Raptor 3)
        // High density visual plumbing, combustion chamber, throat, and ribbed flared nozzle bell.
        
        // Propellant Manifolds & Gimbal Assembly (Top)
        const topRadius = engineId === 'f1' ? 0.7 : engineId === 'rs25' ? 0.5 : 0.45;
        draw3DRing(1.8, topRadius * 0.7, 16, styleAccent, 1.5, true);
        draw3DRing(1.5, topRadius, 20, stylePrimary, 2, false, fillEngine);
        drawMeshStructure(1.8, topRadius * 0.7, 1.5, topRadius, 12, stylePrimary, 1);

        // Turbopumps (Side modules)
        // Render 2 external spherical or cylindrical pump housings for RS-25 / F-1, smaller sleek pump for Raptor 3
        const pumpOffset = engineId === 'f1' ? 0.8 : engineId === 'rs25' ? 0.6 : 0.42;
        const pumpSize = engineId === 'f1' ? 0.28 : engineId === 'rs25' ? 0.2 : 0.14;
        
        // Pump 1: Fuel Turbopump
        const pump1Proj = project({ x: pumpOffset, y: 1.3, z: 0.1 }, w, h);
        ctx.beginPath();
        ctx.arc(pump1Proj.x, pump1Proj.y, pumpSize * 100 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = viewMode === 'shaded' ? '#1f2937' : 'rgba(99, 102, 241, 0.15)';
        ctx.fill();
        ctx.strokeStyle = stylePrimary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pump 1 pipe connection
        const pipe1_1 = project({ x: 0, y: 1.5, z: 0 }, w, h);
        const pipe1_2 = project({ x: pumpOffset, y: 1.3, z: 0.1 }, w, h);
        ctx.beginPath();
        ctx.moveTo(pipe1_1.x, pipe1_1.y);
        ctx.lineTo(pipe1_2.x, pipe1_2.y);
        ctx.strokeStyle = styleAccent;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pump 2: Oxidizer Turbopump (Opposite side)
        const pump2Proj = project({ x: -pumpOffset, y: 1.25, z: -0.1 }, w, h);
        ctx.beginPath();
        ctx.arc(pump2Proj.x, pump2Proj.y, pumpSize * 90 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = viewMode === 'shaded' ? '#111827' : 'rgba(99, 102, 241, 0.1)';
        ctx.fill();
        ctx.strokeStyle = stylePrimary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const pipe2_1 = project({ x: 0, y: 1.45, z: 0 }, w, h);
        const pipe2_2 = project({ x: -pumpOffset, y: 1.25, z: -0.1 }, w, h);
        ctx.beginPath();
        ctx.moveTo(pipe2_1.x, pipe2_1.y);
        ctx.lineTo(pipe2_2.x, pipe2_2.y);
        ctx.strokeStyle = styleAccent;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // F-1 Engine specific: Gigantic Heat Exchanger wrap (Turbine Exhaust Manifold wrapping around the nozzle midsection)
        if (engineId === 'f1') {
          draw3DRing(-0.35, 1.1, 24, styleAccent, 5.5, false, 'rgba(244,63,94,0.08)');
          draw3DRing(-0.45, 1.14, 24, styleAccent, 3.5, false);
          drawMeshStructure(-0.35, 1.1, -0.45, 1.14, 16, stylePrimary, 1);
          
          // Giant duct running from turbopump down to the manifold
          const ductStart = project({ x: pumpOffset * 0.8, y: 1.1, z: 0.1 }, w, h);
          const ductEnd = project({ x: 0.8, y: -0.35, z: 0.5 }, w, h);
          ctx.beginPath();
          ctx.moveTo(ductStart.x, ductStart.y);
          ctx.quadraticCurveTo(ductStart.x + 40, ductStart.y + 60, ductEnd.x, ductEnd.y);
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 5;
          ctx.stroke();
        }

        // Gimbal Structural Actuators (diagonal hydraulic cylinders)
        const act1_t = project({ x: -topRadius * 0.4, y: 1.8, z: 0 }, w, h);
        const act1_b = project({ x: -topRadius * 1.1, y: 1.4, z: 0.2 }, w, h);
        ctx.beginPath();
        ctx.moveTo(act1_t.x, act1_t.y);
        ctx.lineTo(act1_b.x, act1_b.y);
        ctx.strokeStyle = styleAccent;
        ctx.lineWidth = 4;
        ctx.stroke();

        const act2_t = project({ x: topRadius * 0.4, y: 1.8, z: 0 }, w, h);
        const act2_b = project({ x: topRadius * 1.1, y: 1.4, z: -0.2 }, w, h);
        ctx.beginPath();
        ctx.moveTo(act2_t.x, act2_t.y);
        ctx.lineTo(act2_b.x, act2_b.y);
        ctx.strokeStyle = styleAccent;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Main Combustion Chamber (Thick capsule cylinder)
        const chamberRadius = engineId === 'f1' ? 0.75 : engineId === 'rs25' ? 0.52 : 0.48;
        draw3DRing(1.2, chamberRadius, 24, stylePrimary, 2.5, false, fillEngine);
        draw3DRing(0.6, chamberRadius * 1.1, 24, stylePrimary, 2.5, false, fillEngine);
        drawMeshStructure(1.2, chamberRadius, 0.6, chamberRadius * 1.1, 16, styleAccent, 1);

        // Constricted Throat (The bottleneck)
        const throatRadius = engineId === 'f1' ? 0.26 : engineId === 'rs25' ? 0.18 : 0.15;
        draw3DRing(0.1, throatRadius, 16, stylePrimary, 3, false);
        drawMeshStructure(0.6, chamberRadius * 1.1, 0.1, throatRadius, 16, styleAccent, 1);

        // Injector manifold plate inside chamber (visible during cutaway)
        if (showCutaway) {
          ctx.fillStyle = '#6366f1';
          draw3DRing(1.1, chamberRadius * 0.9, 12, 'rgba(99, 102, 241, 0.7)', 1.5, false, 'rgba(99, 102, 241, 0.4)');
        }

        // Flared Nozzle Bell: composed of multiple rings with varying flared curves
        // F-1 is huge and chunky, RS-25 has an extremely elegant curve (high expansion ratio)
        // Raptor 3 has a high-pressure compact throat and bell.
        const nozzleRings = [
          { y: -0.2, r: throatRadius * 1.6 },
          { y: -0.5, r: throatRadius * 2.8 },
          { y: -0.9, r: throatRadius * 4.2 },
          { y: -1.3, r: throatRadius * 5.8 },
          { y: -1.8, r: throatRadius * 7.5 }, // Exit plane
        ];

        // Override exit expansion ratios based on engine lore
        if (engineId === 'f1') {
          nozzleRings[4].r = 1.65; // Wide stubby exit
        } else if (engineId === 'rs25') {
          nozzleRings[4].r = 1.35; // Tall highly expanded cryogenic nozzle
        } else if (engineId === 'rs25') {
          nozzleRings[4].r = 1.15;
        }

        // Draw Throat-to-Nozzle base transition
        drawMeshStructure(0.1, throatRadius, nozzleRings[0].y, nozzleRings[0].r, 16, styleAccent, 1);

        // Draw all successive nozzle rings
        for (let r = 0; r < nozzleRings.length; r++) {
          const ring = nozzleRings[r];
          // Dynamic heat glow on nozzle rings if ignited!
          let ringColor = stylePrimary;
          if (ignitionActive) {
            // Hot orange throat cooling down as you reach the nozzle exit
            const intensity = 1 - r / nozzleRings.length;
            ringColor = `rgb(249, ${Math.floor(115 + 100 * (1 - intensity))}, ${Math.floor(22 * intensity)})`;
          }
          
          draw3DRing(ring.y, ring.r, 24 + r * 4, ringColor, 1.5 + (r === nozzleRings.length - 1 ? 2.5 : 0), false, 
            viewMode !== 'wireframe' ? `rgba(255,255,255,${0.03 + (r / 20)})` : null
          );

          if (r > 0) {
            // Draw mesh stripes connecting rings
            drawMeshStructure(nozzleRings[r - 1].y, nozzleRings[r - 1].r, ring.y, ring.r, 20 + r * 2, styleAccent, 1);
          }
        }

        // Vertical regenerative cooling tubes (fine structural lines covering the entire outer surface of nozzle)
        if (viewMode !== 'wireframe') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 0.5;
          const tubes = 48;
          for (let t = 0; t < tubes; t++) {
            const theta = (t / tubes) * Math.PI * 2;
            if (showCutaway && Math.cos(theta) > 0 && Math.sin(theta) > 0) continue;
            
            ctx.beginPath();
            let startProj = project({ x: Math.cos(theta) * throatRadius, y: 0.1, z: Math.sin(theta) * throatRadius }, w, h);
            ctx.moveTo(startProj.x, startProj.y);

            nozzleRings.forEach((ring) => {
              const ptProj = project({ x: Math.cos(theta) * ring.r, y: ring.y, z: Math.sin(theta) * ring.r }, w, h);
              ctx.lineTo(ptProj.x, ptProj.y);
            });
            ctx.stroke();
          }
        }
      }

      // 2. DETAILED CUTAWAY SHADOW COVER (To show inside details for scientific diagnostic feel)
      if (showCutaway) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        // Draw crosshair indicator inside the chamber
        const coreLoc = project({ x: 0, y: 0.8, z: 0 }, w, h);
        ctx.beginPath();
        ctx.arc(coreLoc.x, coreLoc.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(coreLoc.x - 12, coreLoc.y);
        ctx.lineTo(coreLoc.x + 12, coreLoc.y);
        ctx.moveTo(coreLoc.x, coreLoc.y - 12);
        ctx.lineTo(coreLoc.x, coreLoc.y + 12);
        ctx.stroke();
        
        ctx.fillStyle = '#ef4444';
        ctx.font = '8px monospace';
        ctx.fillText('DIAG_CUTAWAY_SEC_Q1', coreLoc.x + 15, coreLoc.y - 4);
        ctx.restore();
      }

      // 3. DYNAMIC EXHAUST PLUME PARTICLE SIMULATOR (Draw shooting down from exit plane)
      if (ignitionActive) {
        // Spawn active flame particles!
        // Combustion nozzle exit coordinates (Bottom of engine)
        const exitY = engineId === 'vasimr' ? -1.5 : engineId === 'nerva' ? -1.6 : -1.8;
        const exitRadius = engineId === 'vasimr' ? 0.4 : engineId === 'nerva' ? 1.15 : (engineId === 'f1' ? 1.65 : 1.35);

        // Spawn speed based on engine type (VASIMR is ultra fast, NERVA is hot hydrogen, F1 is kerosene)
        const spawnCount = engineId === 'vasimr' ? 4 : engineId === 'nerva' ? 8 : 12;
        
        for (let k = 0; k < spawnCount; k++) {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.random() * exitRadius;
          const px = Math.cos(theta) * r;
          const pz = Math.sin(theta) * r;

          // Exhaust speed vectors
          const speedFactor = engineId === 'vasimr' ? 0.35 : engineId === 'nerva' ? 0.24 : 0.22;
          const spreadX = engineId === 'vasimr' ? 0.015 : 0.05;
          const spreadZ = engineId === 'vasimr' ? 0.015 : 0.05;

          particlesRef.current.push({
            x: px,
            y: exitY - 0.05,
            z: pz,
            vx: (Math.random() - 0.5) * spreadX,
            vy: -speedFactor - Math.random() * 0.12, // Shooting straight down (negative Y)
            vz: (Math.random() - 0.5) * spreadZ,
            life: 0,
            maxLife: 20 + Math.random() * 35,
            size: 3 + Math.random() * 8,
            color: engineId === 'vasimr' 
              ? `rgba(56, 189, 248, ${0.4 + Math.random() * 0.6})`  // Electric Cyan Argon plasma
              : engineId === 'nerva'
                ? `rgba(239, 68, 68, ${0.5 + Math.random() * 0.5})`  // Fiery reddish pink nucleated gas
                : engineId === 'rs25'
                  ? `rgba(147, 197, 253, ${0.4 + Math.random() * 0.6})` // Hydrolox blue translucent flame
                  : `rgba(249, 115, 22, ${0.6 + Math.random() * 0.4})` // Kerolox bright orange/yellow soot fire
          });
        }

        // Update and draw particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.life++;

          // Shrink size and expand spread as they shoot down
          const expandFactor = engineId === 'vasimr' ? 1.01 : 1.04;
          p.vx *= expandFactor;
          p.vz *= expandFactor;

          // Project to 3D space
          const ptProj = project({ x: p.x, y: p.y, z: p.z }, w, h);

          // Render particle
          const alpha = 1 - p.life / p.maxLife;
          ctx.beginPath();
          ctx.arc(ptProj.x, ptProj.y, p.size * alpha * zoom, 0, Math.PI * 2);
          
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Outer glow shadow
          ctx.shadowBlur = engineId === 'vasimr' ? 15 : 20;
          ctx.shadowColor = glowColor;
          ctx.fill();
          ctx.restore();

          // Delete dead particles
          if (p.life >= p.maxLife || ptProj.y > h + 50) {
            particles.splice(i, 1);
          }
        }

        // Draw central supersonic flame cone (Mach diamonds) for high-pressure engines
        if (engineId === 'rs25' || engineId === 'raptor3' || engineId === 'f1') {
          ctx.save();
          const corePoints = [
            { x: 0, y: exitY, z: 0 },
            { x: 0, y: exitY - 0.8, z: 0 },
            { x: 0, y: exitY - 1.5, z: 0 },
            { x: 0, y: exitY - 2.2, z: 0 },
          ];

          const radii = [exitRadius * 0.7, exitRadius * 0.25, exitRadius * 0.45, 0];
          
          for (let s = 1; s < corePoints.length; s++) {
            const p1 = project(corePoints[s-1], w, h);
            const p2 = project(corePoints[s], w, h);
            
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            const machColor = engineId === 'rs25' ? 'rgba(96,165,250,0.85)' : 'rgba(251,146,60,0.9)';
            grad.addColorStop(0, machColor);
            grad.addColorStop(0.5, 'rgba(255,255,255,0.95)'); // Bright white shock node
            grad.addColorStop(1, 'rgba(99,102,241,0.1)');

            ctx.beginPath();
            const w1 = radii[s-1] * 50 * zoom;
            const w2 = radii[s] * 50 * zoom;

            ctx.moveTo(p1.x - w1, p1.y);
            ctx.lineTo(p2.x - w2, p2.y);
            ctx.lineTo(p2.x + w2, p2.y);
            ctx.lineTo(p1.x + w1, p1.y);
            ctx.closePath();

            ctx.fillStyle = grad;
            ctx.shadowBlur = 30;
            ctx.shadowColor = glowColor;
            ctx.fill();
          }
          ctx.restore();
        }

      } else {
        // Slowly clear old particles
        if (particlesRef.current.length > 0) {
          particlesRef.current.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life += 2; // fade fast
          });
          particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [engine, yaw, pitch, zoom, ignitionActive, viewMode, showCutaway]);

  // segments based on view mode (optimize performance)
  const segmentsForEngine = () => {
    return viewMode === 'wireframe' ? 12 : 24;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />
      
      {/* HUD diagnostic stats overlaid in canvas */}
      <div className="absolute bottom-4 left-4 font-tech text-[8px] sm:text-[9px] text-white/40 tracking-wider pointer-events-none flex flex-col gap-1 bg-black/40 px-3 py-2 rounded-lg border border-white/5 backdrop-blur-md">
        <div>ORBIT_AZIMUTH: <span className="text-white">{(yaw * (180 / Math.PI)).toFixed(1)}°</span></div>
        <div>TILT_ELEVATION: <span className="text-white">{(pitch * (180 / Math.PI)).toFixed(1)}°</span></div>
        <div>BLUEPRINT_ZOOM: <span className="text-white">{(zoom * 100).toFixed(0)}%</span></div>
      </div>

      <div className="absolute top-4 right-4 font-tech text-[8px] sm:text-[9px] text-emerald-400 tracking-widest pointer-events-none flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <div className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${ignitionActive ? 'animate-ping' : ''}`} />
        <span>SYS_STATUS: {ignitionActive ? 'THRUST_ACTIVE' : 'NOMINAL_IDLE'}</span>
      </div>
    </div>
  );
};
