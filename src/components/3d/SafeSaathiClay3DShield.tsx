import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, Sparkles, Layers, RefreshCw, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export type ShieldStatus = 'safe' | 'active_journey' | 'deviation' | 'sos';

export interface SafeSaathiClay3DShieldProps {
  status?: ShieldStatus;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
  enableExplode?: boolean;
}

export const SafeSaathiClay3DShield: React.FC<SafeSaathiClay3DShieldProps> = ({
  status = 'safe',
  size = 'hero',
  className = '',
  interactive = true,
  showControls = true,
  enableExplode = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D rotation state (degrees)
  const [rotateX, setRotateX] = useState<number>(-3);
  const [rotateY, setRotateY] = useState<number>(5);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Dynamic light source coordinate (in percentage: 0% to 100%)
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 35, y: 25 });

  // Animation frame reference for smooth lerping
  const targetRotation = useRef<{ x: number; y: number }>({ x: -3, y: 5 });
  const currentRotation = useRef<{ x: number; y: number }>({ x: -3, y: 5 });
  const animFrameId = useRef<number | null>(null);
  const autoAngle = useRef<number>(0);

  // Scale dimensions based on size
  const dimensions = {
    sm: { width: 140, height: 160, scale: 0.55 },
    md: { width: 220, height: 250, scale: 0.8 },
    lg: { width: 300, height: 340, scale: 1.0 },
    hero: { width: 360, height: 400, scale: 1.2 },
  }[size];

  // Smooth lerp loop
  useEffect(() => {
    const updateLoop = () => {
      if (autoRotate && !isHovered && !isPressed) {
        autoAngle.current += 0.016;
        targetRotation.current.y = Math.sin(autoAngle.current * 0.8) * 10;
        targetRotation.current.x = -3 + Math.cos(autoAngle.current * 0.6) * 4;
        
        const normY = targetRotation.current.y / 15;
        const normX = targetRotation.current.x / 10;
        setLightPos({
          x: 45 + normY * 20,
          y: 30 + normX * 15,
        });
      }

      const lerp = 0.08;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerp;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerp;

      setRotateX(currentRotation.current.x);
      setRotateY(currentRotation.current.y);

      animFrameId.current = requestAnimationFrame(updateLoop);
    };

    animFrameId.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [autoRotate, isHovered, isPressed]);

  // Pointer movement tracking for realistic parallax
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = (clientX / rect.width - 0.5) * 2;
      const normY = (clientY / rect.height - 0.5) * 2;

      targetRotation.current = {
        x: -normY * 16,
        y: normX * 20,
      };

      const lightX = Math.max(10, Math.min(90, (clientX / rect.width) * 100));
      const lightY = Math.max(10, Math.min(90, (clientY / rect.height) * 100));
      setLightPos({ x: lightX, y: lightY });
    },
    [interactive]
  );

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    if (!autoRotate) {
      targetRotation.current = { x: -3, y: 5 };
    }
  };

  const handlePointerDown = () => {
    if (!interactive) return;
    setIsPressed(true);
    soundManager.triggerHaptic(20);
  };

  const handlePointerUp = () => setIsPressed(false);

  const resetOrientation = () => {
    targetRotation.current = { x: -3, y: 5 };
    setAutoRotate(true);
    setIsExploded(false);
    soundManager.triggerHaptic(15);
  };

  // Status configuration colors using the requested Warm Editorial system
  const statusConfig = {
    safe: {
      aura: 'from-[#C5A36A]/20 via-[#E9DFD2]/30 to-transparent',
      jewelGlow: 'rgba(200, 102, 80, 0.85)',
      ringGlow: 'rgba(197, 163, 106, 0.75)',
      badgeText: 'Guard Active',
      badgeBg: 'bg-[#7E927B]/15 text-[#3D6B4E] border-[#7E927B]/40',
      dotColor: 'bg-[#7E927B]',
    },
    active_journey: {
      aura: 'from-[#C86650]/30 via-[#E99583]/20 to-transparent',
      jewelGlow: 'rgba(233, 149, 131, 0.95)',
      ringGlow: 'rgba(200, 102, 80, 0.85)',
      badgeText: 'Journey Protected',
      badgeBg: 'bg-[#C86650]/15 text-[#702E46] border-[#C86650]/40',
      dotColor: 'bg-[#C86650]',
    },
    deviation: {
      aura: 'from-amber-400/30 via-orange-300/20 to-transparent',
      jewelGlow: 'rgba(245, 158, 11, 0.95)',
      ringGlow: 'rgba(245, 158, 11, 0.85)',
      badgeText: '30s Deviation Sentry',
      badgeBg: 'bg-amber-500/15 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
    },
    sos: {
      aura: 'from-[#BA223C]/40 via-[#E23856]/30 to-transparent',
      jewelGlow: 'rgba(186, 34, 60, 0.98)',
      ringGlow: 'rgba(186, 34, 60, 0.9)',
      badgeText: 'EMERGENCY SOS',
      badgeBg: 'bg-[#BA223C]/20 text-[#BA223C] border-[#BA223C]/50 font-black',
      dotColor: 'bg-[#BA223C]',
    },
  }[status];

  // Z-axis explosion distances (pixels)
  const zLayers = isExploded
    ? {
        shadow: -50,
        rimBase: 0,
        outerShield: 45,
        midBevel: 85,
        orbitalRing: 125,
        plumMedallion: 165,
        emblemFiligree: 200,
        floatingOrbs: 235,
        infoPanel: 260,
      }
    : {
        shadow: -25,
        rimBase: 0,
        outerShield: 14,
        midBevel: 26,
        orbitalRing: 36,
        plumMedallion: 46,
        emblemFiligree: 58,
        floatingOrbs: 70,
        infoPanel: 82,
      };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D Viewport Frame */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          perspective: '1200px',
        }}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        title="SafeSaathi 3D Protective Sculpture — Move pointer to interact"
      >
        {/* Ambient Warm Halo Aura */}
        <div
          className={`absolute -inset-10 rounded-full bg-gradient-to-tr ${statusConfig.aura} blur-3xl pointer-events-none transition-all duration-700`}
        />

        {/* 3D Rotational Stage */}
        <div
          style={{
            width: '280px',
            height: '320px',
            transformStyle: 'preserve-3d',
            transform: `
              rotateX(${rotateX}deg) 
              rotateY(${rotateY}deg) 
              scale(${isPressed ? 0.97 : 1})
            `,
            transition: isPressed ? 'transform 0.1s ease' : 'none',
          }}
          className="relative preserve-3d"
        >
          {/* ================= 1. CONTACT GROUNDING SHADOW ================= */}
          <div
            className="absolute left-1/2 -bottom-6 -translate-x-1/2 pointer-events-none"
            style={{
              width: '240px',
              height: '50px',
              transformStyle: 'preserve-3d',
              transform: `
                translateZ(${zLayers.shadow}px) 
                translateX(${-rotateY * 1.6}px) 
                translateY(${rotateX * 1.2}px) 
                scale(${1 + Math.abs(rotateX) * 0.01})
              `,
              background: `radial-gradient(ellipse at center, 
                rgba(69, 38, 63, 0.35) 0%, 
                rgba(112, 46, 70, 0.14) 45%, 
                transparent 72%)`,
              filter: 'blur(10px)',
            }}
          />

          {/* ================= 2. 3D EXTRUDED CLAY RIM SLICES (Bevel Thickness) ================= */}
          {[-8, -4, 0, 4, 8].map((offsetZ, idx) => (
            <div
              key={`rim-slice-${idx}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${zLayers.rimBase + offsetZ}px)`,
                clipPath: 'polygon(50% 0%, 94% 16%, 94% 62%, 50% 100%, 6% 62%, 6% 16%)',
                background: `linear-gradient(145deg, #FAF5EF 0%, #E9DFD2 50%, #DBCBB9 100%)`,
                opacity: 0.9,
              }}
            />
          ))}

          {/* ================= 3. SCULPTED OUTER CLAY SHIELD FACE ================= */}
          <div
            className="absolute inset-0 transition-shadow duration-300"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.outerShield}px)`,
              clipPath: 'polygon(50% 0%, 94% 16%, 94% 62%, 50% 100%, 6% 62%, 6% 16%)',
              background: `linear-gradient(145deg, 
                #FFFFFF 0%, 
                #FAF5EF 35%, 
                #F3E9DD 70%, 
                #E9DFD2 100%)`,
              boxShadow: `
                0 18px 36px -8px rgba(41, 37, 45, 0.25),
                inset 4px 5px 12px rgba(255, 255, 255, 1),
                inset -5px -6px 14px rgba(112, 46, 70, 0.14)
              `,
            }}
          >
            {/* Dynamic Specular Sheen across Ceramic Outer Shell */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-100"
              style={{
                background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                  rgba(255, 255, 255, 0.9) 0%, 
                  rgba(255, 255, 255, 0.25) 30%, 
                  transparent 65%)`,
                mixBlendMode: 'overlay',
              }}
            />

            {/* Subtle Terracotta & Champagne Edge Highlights */}
            <div
              className="absolute inset-0 pointer-events-none opacity-45"
              style={{
                background: 'linear-gradient(120deg, rgba(233, 149, 131, 0.5) 0%, transparent 40%, rgba(197, 163, 106, 0.5) 100%)',
              }}
            />
          </div>

          {/* ================= 4. SECONDARY INSET BEVEL PLATE ================= */}
          <div
            className="absolute inset-[14px] pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.midBevel}px)`,
              clipPath: 'polygon(50% 0%, 94% 16%, 94% 62%, 50% 100%, 6% 62%, 6% 16%)',
              background: `linear-gradient(145deg, 
                #FFFDFB 0%, 
                #FAF5EF 50%, 
                #EDE2D4 100%)`,
              boxShadow: `
                0 6px 16px rgba(41, 37, 45, 0.1),
                inset 3px 3px 6px rgba(255, 255, 255, 0.95),
                inset -3px -3px 8px rgba(112, 46, 70, 0.1)
              `,
              border: '1px solid rgba(255, 255, 255, 0.9)',
            }}
          >
            {/* Concentric Guilloche / Filigree Arch Ring */}
            <svg
              viewBox="0 0 200 240"
              className="w-full h-full opacity-35"
              fill="none"
              stroke="#702E46"
              strokeWidth="0.8"
            >
              <circle cx="100" cy="115" r="70" strokeDasharray="3 3" />
              <circle cx="100" cy="115" r="82" strokeDasharray="1 4" />
              <path d="M50,40 Q100,10 150,40" strokeWidth="1.2" stroke="#C5A36A" />
              <path d="M40,140 Q100,210 160,140" strokeWidth="1.2" stroke="#C86650" />
            </svg>
          </div>

          {/* ================= 5. FLOATING ORBITAL SAFE RING ================= */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: '280px',
              height: '280px',
              transformStyle: 'preserve-3d',
              transform: `
                translateZ(${zLayers.orbitalRing}px) 
                rotateX(68deg) 
                rotateY(16deg)
              `,
            }}
          >
            <div
              className="w-full h-full rounded-full border-2 border-dashed transition-all duration-1000"
              style={{
                borderColor: statusConfig.ringGlow,
                boxShadow: `0 0 16px ${statusConfig.ringGlow}, inset 0 0 12px ${statusConfig.ringGlow}`,
                animation: 'orbital-spin 24s linear infinite',
              }}
            >
              {/* Guardian Micro-Satellites orbiting the shield */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E9DFD2]"
                style={{
                  boxShadow: '0 2px 6px rgba(112, 46, 70, 0.35)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#702E46]" />
              </div>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E9DFD2]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86650]" />
              </div>
            </div>
          </div>

          {/* ================= 6. CENTRAL CLAY MEDALLION (Deep Berry & Rich Plum) ================= */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.plumMedallion}px)`,
              background: `linear-gradient(135deg, #702E46 0%, #582136 45%, #45263F 100%)`,
              border: '3px solid rgba(233, 149, 131, 0.75)',
              boxShadow: `
                0 14px 28px -4px rgba(41, 37, 45, 0.5),
                inset 0 3px 5px rgba(255, 255, 255, 0.35),
                inset 0 -3px 6px rgba(0, 0, 0, 0.45)
              `,
            }}
          >
            {/* Medallion Sunburst Pattern */}
            <div
              className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'repeating-conic-gradient(from 0deg, #FFFFFF 0deg 8deg, transparent 8deg 18deg)',
              }}
            />

            {/* Specular glare */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                  rgba(255, 255, 255, 0.45) 0%, 
                  transparent 55%)`,
              }}
            />
          </div>

          {/* ================= 7. PROTECTIVE EMBOSSED CREST / LOTUS EMBLEM ================= */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[114px] h-[114px] flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.emblemFiligree}px)`,
              filter: 'drop-shadow(0 4px 6px rgba(41, 37, 45, 0.5))',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="wingGradLeft" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FAF5EF" />
                  <stop offset="60%" stopColor="#E99583" />
                  <stop offset="100%" stopColor="#C86650" />
                </linearGradient>
                <linearGradient id="wingGradRight" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAF5EF" />
                  <stop offset="60%" stopColor="#C5A36A" />
                  <stop offset="100%" stopColor="#702E46" />
                </linearGradient>
              </defs>

              {/* Protective Left Wing */}
              <path
                d="M50 18 C38 28 22 42 22 62 C22 75 32 84 45 84 C38 78 35 68 37 57 C39 48 45 38 50 30 Z"
                fill="url(#wingGradLeft)"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.8"
              />

              {/* Protective Right Wing */}
              <path
                d="M50 18 C62 28 78 42 78 62 C78 75 68 84 55 84 C62 78 65 68 63 57 C61 48 55 38 50 30 Z"
                fill="url(#wingGradRight)"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.8"
              />

              {/* Center Guardian Flame / Lotus Petal */}
              <path
                d="M50 25 C46 36 43 50 43 62 C43 72 47 78 50 82 C53 78 57 72 57 62 C57 50 54 36 50 25 Z"
                fill="#FFFFFF"
                stroke="rgba(197, 163, 106, 0.9)"
                strokeWidth="1.2"
              />

              {/* Central Safety Pearl */}
              <circle
                cx="50"
                cy="56"
                r="7"
                fill="#FFFFFF"
                stroke="#C86650"
                strokeWidth="1.5"
              />
              <circle
                cx="50"
                cy="56"
                r="3"
                fill="#702E46"
              />
            </svg>
          </div>

          {/* ================= 8. FLOATING MULTI-TONE GLASS ORBS ================= */}
          {/* Orb 1: Warm Coral / Terracotta (Top Left) */}
          <div
            className="absolute -top-4 -left-4 w-9 h-9 rounded-full pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.floatingOrbs}px)`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(233, 149, 131, 0.8) 40%, rgba(200, 102, 80, 0.85) 85%)',
              boxShadow: '0 8px 16px rgba(200, 102, 80, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          />

          {/* Orb 2: Champagne Gold (Top Right) */}
          <div
            className="absolute -top-2 -right-5 w-8 h-8 rounded-full pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.floatingOrbs + 10}px)`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(246, 222, 175, 0.8) 40%, rgba(197, 163, 106, 0.85) 85%)',
              boxShadow: '0 8px 16px rgba(197, 163, 106, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          />

          {/* Orb 3: Muted Sage (Bottom Left) */}
          <div
            className="absolute bottom-8 -left-5 w-7 h-7 rounded-full pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.floatingOrbs - 8}px)`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(182, 203, 178, 0.8) 40%, rgba(126, 146, 123, 0.85) 85%)',
              boxShadow: '0 6px 14px rgba(126, 146, 123, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          />

          {/* ================= 9. FLOATING HIGH-CONTRAST STATUS PANEL ================= */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.infoPanel}px)`,
            }}
          >
            <div className="px-4 py-1.5 rounded-full bg-[#FAF5EF]/95 dark:bg-[#3A1F33]/95 backdrop-blur-md border border-[#E9DFD2] shadow-lg flex items-center gap-2 text-[11px] font-bold text-[#29252D] dark:text-[#FAF5EF]">
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-ping`} />
              <span>{statusConfig.badgeText}</span>
              <span className="text-[#C5A36A] font-black">·</span>
              <span className="font-mono text-[#702E46] dark:text-[#E99583]">30s Sentry</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating 3D Interaction HUD */}
      {showControls && (
        <div className="mt-3 flex items-center gap-2 p-1.5 rounded-2xl glass-panel shadow-xs border border-[#E9DFD2]">
          <button
            type="button"
            onClick={() => {
              setAutoRotate(!autoRotate);
              soundManager.triggerHaptic(15);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              autoRotate ? 'bg-[#702E46] text-white shadow-xs' : 'text-[#62566F] hover:text-[#29252D]'
            }`}
            title="Toggle autonomous floating movement"
          >
            {autoRotate ? 'Auto Drift' : 'Manual Pan'}
          </button>

          {enableExplode && (
            <button
              type="button"
              onClick={() => {
                setIsExploded(!isExploded);
                soundManager.triggerHaptic(20);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isExploded ? 'bg-[#C86650] text-white shadow-xs' : 'text-[#62566F] hover:text-[#29252D]'
              }`}
              title="Explode layers to inspect dimensional geometry"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Collapse' : 'Explode 3D'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetOrientation}
            className="p-1 rounded-xl text-[#62566F] hover:text-[#702E46] transition cursor-pointer"
            title="Reset shield orientation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
