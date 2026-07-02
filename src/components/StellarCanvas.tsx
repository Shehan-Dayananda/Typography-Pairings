import React, { useRef, useEffect, useState } from 'react';

export interface PlanetData {
  id: string;
  name: string;
  distance: number; // For visualization spacing
  realDistance: string; // Textual AU
  size: number; // For drawing
  color: string; // Base color
  gradientColors: [string, string]; // Holographic colors
  speed: number; // Orbital speed multiplier
  moonsCount: number;
  yearLength: string;
  type: string;
  temp: string;
  bgHex: string;
  hasRings?: boolean;
}

interface StellarCanvasProps {
  planets: PlanetData[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  orbitSpeedScale: number; // 0 = paused, 1 = normal, etc.
  isRealisticScale: boolean; // schematic vs realistic representation
}

// 3D Point Interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const StellarCanvas: React.FC<StellarCanvasProps> = ({
  planets,
  selectedPlanetId,
  onSelectPlanet,
  orbitSpeedScale,
  isRealisticScale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Projection Angles (in radians)
  const [pitch, setPitch] = useState<number>(0.5); // Rotation around X axis
  const [yaw, setYaw] = useState<number>(-0.6);   // Rotation around Y axis
  const [zoom, setZoom] = useState<number>(0.9);

  // Interactive Dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentAngle = useRef({ pitch: 0.5, yaw: -0.6 });

  // Keep track of planet orbital positions
  const orbitalAngles = useRef<{ [key: string]: number }>({
    mercury: 0,
    venus: 1.2,
    earth: 2.5,
    mars: 3.8,
    jupiter: 0.5,
    saturn: 4.8,
    uranus: 2.1,
    neptune: 5.5,
  });

  // Track animation frame
  const lastTime = useRef<number>(performance.now());

  // Mouse drag handlers to rotate space
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    currentAngle.current = { pitch, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Adjust sensitivity
    const speed = 0.007;
    let newPitch = currentAngle.current.pitch + dy * speed;
    let newYaw = currentAngle.current.yaw + dx * speed;

    // Clamp pitch to avoid flipping upside down completely
    newPitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, newPitch));

    setPitch(newPitch);
    setYaw(newYaw);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom control via wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    setZoom((prev) => Math.max(0.3, Math.min(2.5, prev + zoomDelta)));
  };

  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Handle resizing
    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dynamic Starfield background particles
    const stars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 2000,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const render = () => {
      const now = performance.now();
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;

      // Clear with soft space-black gradient overlay
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, width, height);

      // Grid/telemetry lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 80) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Compass Rose in the corner
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText('N', cx, 30);
      ctx.fillText('S', cx, height - 20);
      ctx.fillText('W', 30, cy);
      ctx.fillText('E', width - 40, cy);

      // 3D Rotation helper function
      const project3D = (p: Point3D): { sx: number; sy: number; sz: number; depth: number } => {
        // Rotate around Y (Yaw)
        const x1 = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
        const z1 = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);

        // Rotate around X (Pitch)
        const y2 = p.y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = p.y * Math.sin(pitch) + z1 * Math.cos(pitch);

        // Apply zoom scale
        const scaleFactor = zoom * 300;
        
        // Orthographic projection
        const sx = cx + x1 * zoom * 2.2;
        const sy = cy + y2 * zoom * 2.2;
        
        // Return screen coordinates and depth factor (z-buffer helper)
        return { sx, sy, sz: z2, depth: z2 };
      };

      // 1. Draw Starfield in 3D
      stars.forEach((star) => {
        const proj = project3D(star);
        if (proj.sx >= 0 && proj.sx <= width && proj.sy >= 0 && proj.sy <= height) {
          const brightness = Math.max(0.1, 1 - (proj.depth + 1000) / 2000);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.7})`;
          ctx.beginPath();
          ctx.arc(proj.sx, proj.sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Compute current positions of all planets
      const renderElements: any[] = [];

      // Add the Sun to the central position
      const sunProj = project3D({ x: 0, y: 0, z: 0 });
      renderElements.push({
        type: 'sun',
        depth: sunProj.depth,
        x: sunProj.sx,
        y: sunProj.sy,
        size: 32 * zoom,
      });

      // Compute orbits
      planets.forEach((planet) => {
        // Update orbital position based on delta & speed multiplier
        if (orbitSpeedScale > 0) {
          const baseSpeed = 0.2; // base velocity
          orbitalAngles.current[planet.id] += baseSpeed * planet.speed * orbitSpeedScale * delta;
        }

        const angle = orbitalAngles.current[planet.id];
        
        // Determine orbit radius visually
        const r = isRealisticScale 
          ? planet.distance * 15 // realistic scale compressed a bit for viewport
          : planet.distance * 35 + 25; // schematic scale

        // Calculate 3D position
        const p3d: Point3D = {
          x: r * Math.cos(angle),
          y: 0,
          z: r * Math.sin(angle),
        };

        const proj = project3D(p3d);

        // Planet size sizing
        let size = planet.size;
        if (isRealisticScale) {
          // Exaggerate slightly so Mercury isn't 0.01px
          size = Math.max(2, planet.size * 0.5);
        }

        renderElements.push({
          type: 'planet',
          id: planet.id,
          name: planet.name,
          depth: proj.depth,
          x: proj.sx,
          y: proj.sy,
          size: size * zoom,
          color: planet.color,
          gradientColors: planet.gradientColors,
          hasRings: planet.hasRings,
          bgHex: planet.bgHex,
          r3d: r, // Keep visual 3D radius for orbit ring drawing
          p3d,
          angle,
        });
      });

      // Sort elements by depth (highest depth is closest to viewer/front, lowest is furthest/back)
      // We draw from back to front (painter's algorithm)
      renderElements.sort((a, b) => a.depth - b.depth);

      // --- DRAW ORBIT RING WIREFRAMES (Always draw under planets) ---
      planets.forEach((planet) => {
        const r = isRealisticScale 
          ? planet.distance * 15 
          : planet.distance * 35 + 25;

        ctx.beginPath();
        const segments = 120;
        const isSelected = planet.id === selectedPlanetId;

        ctx.strokeStyle = isSelected 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = isSelected ? 1.5 : 1;

        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const p = {
            x: r * Math.cos(theta),
            y: 0,
            z: r * Math.sin(theta),
          };
          const proj = project3D(p);
          if (i === 0) {
            ctx.moveTo(proj.sx, proj.sy);
          } else {
            ctx.lineTo(proj.sx, proj.sy);
          }
        }
        ctx.stroke();
      });

      // Draw standard coordinate lines from Sun
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();

      // --- DRAW SORTED ELEMENTS (Sun, Planets, Labels) ---
      renderElements.forEach((el) => {
        if (el.type === 'sun') {
          // Draw Glowing Sun
          const glow = ctx.createRadialGradient(el.x, el.y, 2, el.x, el.y, el.size * 2.5);
          glow.addColorStop(0, '#ffffff');
          glow.addColorStop(0.2, '#fef08a'); // yellow-200
          glow.addColorStop(0.5, '#ca8a04'); // yellow-600 with opacity
          glow.addColorStop(1, 'rgba(202, 138, 4, 0)');
          
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
          ctx.fill();

          // Core details
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = '8px monospace';
          ctx.fillText('SOLAR CORE', el.x + el.size + 6, el.y - 2);
        } else if (el.type === 'planet') {
          const isSelected = el.id === selectedPlanetId;

          // Draw orbital connection ray
          ctx.beginPath();
          ctx.strokeStyle = isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)';
          ctx.moveTo(sunProj.sx, sunProj.sy);
          ctx.lineTo(el.x, el.y);
          ctx.stroke();

          // 3D Planet sphere
          const planetGrad = ctx.createRadialGradient(
            el.x - el.size * 0.3, 
            el.y - el.size * 0.3, 
            1, 
            el.x, 
            el.y, 
            el.size
          );
          planetGrad.addColorStop(0, el.gradientColors[0]);
          planetGrad.addColorStop(0.7, el.gradientColors[1]);
          planetGrad.addColorStop(1, '#000000'); // Shadow side

          // Atmosphere glow layer
          if (isSelected) {
            ctx.shadowColor = el.bgHex;
            ctx.shadowBlur = 15;
          }

          ctx.fillStyle = planetGrad;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
          ctx.fill();

          // Reset shadows
          ctx.shadowBlur = 0;

          // Draw planet rings in 3D projection if Saturn or Uranus
          if (el.hasRings) {
            ctx.strokeStyle = el.bgHex + '66'; // semi transparent
            ctx.lineWidth = 3 * zoom;
            ctx.beginPath();
            // Rings are drawn as concentric circles on the planet XZ plane
            const ringRadius = el.size * 1.8;
            for (let i = 0; i <= 60; i++) {
              const theta = (i / 60) * Math.PI * 2;
              const rp3d = {
                x: el.p3d.x + ringRadius * Math.cos(theta),
                y: el.p3d.y,
                z: el.p3d.z + ringRadius * Math.sin(theta),
              };
              const rproj = project3D(rp3d);
              if (i === 0) ctx.moveTo(rproj.sx, rproj.sy);
              else ctx.lineTo(rproj.sx, rproj.sy);
            }
            ctx.stroke();
          }

          // Selection Reticle overlay
          if (isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size + 8, 0, Math.PI * 2);
            ctx.stroke();

            // Crosshairs
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            // top
            ctx.moveTo(el.x, el.y - el.size - 14); ctx.lineTo(el.x, el.y - el.size - 8);
            // bottom
            ctx.moveTo(el.x, el.y + el.size + 8); ctx.lineTo(el.x, el.y + el.size + 14);
            // left
            ctx.moveTo(el.x - el.size - 14, el.y); ctx.lineTo(el.x - el.size - 8, el.y);
            // right
            ctx.moveTo(el.x + el.size + 8, el.y); ctx.lineTo(el.x + el.size + 14, el.y);
            ctx.stroke();
          }

          // Active planet labels with visual HUD line
          if (isSelected || el.size > 8) {
            ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
            ctx.font = isSelected ? 'bold 11px Space Grotesk' : '9px Inter';
            ctx.fillText(el.name.toUpperCase(), el.x + el.size + 8, el.y - 2);

            // Distance Tag
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '8px monospace';
            const distanceText = `${(el.r3d / 35).toFixed(2)} AU`;
            ctx.fillText(distanceText, el.x + el.size + 8, el.y + 8);
          }
        }
      });

      // 3. Draw diagnostic telemetry metrics in corner
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '8px monospace';
      ctx.fillText(`YAW: ${(yaw * (180 / Math.PI)).toFixed(1)}°`, 20, 50);
      ctx.fillText(`PITCH: ${(pitch * (180 / Math.PI)).toFixed(1)}°`, 20, 62);
      ctx.fillText(`ZOOM: ${(zoom * 100).toFixed(0)}%`, 20, 74);
      ctx.fillText(`TIME ENGINE: ${orbitSpeedScale > 0 ? `${orbitSpeedScale}X` : 'FREEZE'}`, 20, 86);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [pitch, yaw, zoom, planets, selectedPlanetId, orbitSpeedScale, isRealisticScale]);

  // Click on canvas to select nearest planet
  const handleCanvasClick = (e: React.MouseEvent) => {
    // If we dragged, don't trigger click selection
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const cx = width / 2;
    const cy = height / 2;

    // Helper to calculate project point and find distance
    let closestPlanetId: string | null = null;
    let minDistance = 30; // Max click distance threshold

    const project3D = (p: Point3D): { sx: number; sy: number } => {
      const x1 = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
      const z1 = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
      const y2 = p.y * Math.cos(pitch) - z1 * Math.sin(pitch);
      
      const sx = cx + x1 * zoom * 2.2;
      const sy = cy + y2 * zoom * 2.2;
      return { sx, sy };
    };

    planets.forEach((planet) => {
      const angle = orbitalAngles.current[planet.id];
      const r = isRealisticScale 
        ? planet.distance * 15 
        : planet.distance * 35 + 25;

      const p3d = {
        x: r * Math.cos(angle),
        y: 0,
        z: r * Math.sin(angle),
      };

      const proj = project3D(p3d);
      const dist = Math.sqrt((proj.sx - clickX) ** 2 + (proj.sy - clickY) ** 2);

      if (dist < minDistance) {
        minDistance = dist;
        closestPlanetId = planet.id;
      }
    });

    if (closestPlanetId) {
      onSelectPlanet(closestPlanetId);
    }
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
      onClick={handleCanvasClick}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Visual Canvas Overlay HUD Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md border border-white/5 p-3 rounded-none">
        <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">NAVIGATIONAL GRAPHICS</span>
        <div className="text-[10px] text-gray-300 font-mono">
          • Left-Click + Drag to Rotate Solar System<br />
          • Use Mouse Wheel to Zoom In / Out<br />
          • Click on a Planet sphere to Lock Scan
        </div>
      </div>
    </div>
  );
};
