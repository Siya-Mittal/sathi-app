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
  const [rotateX, setRotateX] = useState<number>(-4);
  const [rotateY, setRotateY] = useState<number>(6);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Dynamic light source coordinate (in percentage: 0% to 100%)
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 35, y: 25 });

  // Animation frame reference for smooth lerping
  const targetRotation = useRef<{ x: number; y: number }>({ x: -4, y: 6 });
  const currentRotation = useRef<{ x: number; y: number }>({ x: -4, y: 6 });
  const animFrameId = useRef<number | null>(null);
  const autoAngle = useRef<number>(0);

  // Scale dimensions based on size
  const dimensions = {
    sm: { width: 140, height: 160, scale: 0.55 },
    md: { width: 220, height: 250, scale: 0.8 },
    lg: { width: 300, height: 340, scale: 1.0 },
    hero: { width: 340, height: 380, scale: 1.15 },
  }[size];

  // Smooth lerp loop
  useEffect(() => {
    const updateLoop = () => {
      if (autoRotate && !isHovered && !isPressed) {
        autoAngle.current += 0.016;
        // Subtle organic breathing oscillation
        targetRotation.current.y = Math.sin(autoAngle.current * 0.9) * 12;
        targetRotation.current.x = -4 + Math.cos(autoAngle.current * 0.7) * 5;
        
        // Calculate corresponding light position
        const normY = targetRotation.current.y / 15;
        const normX = targetRotation.current.x / 10;
        setLightPos({
          x: 45 + normY * 20,
          y: 30 + normX * 15,
        });
      }

      // Smooth dampening
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

  // Pointer movement tracking
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Normalized coordinates (-1 to 1)
      const normX = (clientX / rect.width - 0.5) * 2;
      const normY = (clientY / rect.height - 0.5) * 2;

      // Set target rotation (max ~20 degrees on each axis)
      targetRotation.current = {
        x: -normY * 18,
        y: normX * 22,
      };

      // Set dynamic light position relative to pointer
      const lightX = Math.max(10, Math.min(90, (clientX / rect.width) * 100));
      const lightY = Math.max(10, Math.min(90, (clientY / rect.height) * 100));
      setLightPos({ x: lightX, y: lightY });
    },
    [interactive]
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    if (!autoRotate) {
      targetRotation.current = { x: -4, y: 6 };
    }
  };

  const handlePointerDown = () => {
    if (!interactive) return;
    setIsPressed(true);
    soundManager.triggerHaptic(20);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const resetOrientation = () => {
    targetRotation.current = { x: -4, y: 6 };
    setAutoRotate(true);
    setIsExploded(false);
    soundManager.triggerHaptic(15);
  };

  // Status configuration colors and auras
  const statusConfig = {
    safe: {
      aura: 'from-[#E8DDFB]/35 via-[#F6D3E2]/25 to-transparent',
      jewelGlow: 'rgba(201, 197, 250, 0.85)',
      ringGlow: 'rgba(232, 221, 251, 0.7)',
      badgeText: 'Guard Active',
      badgeBg: 'bg-emerald-500/15 text-emerald-800 border-emerald-300/40',
      dotColor: 'bg-emerald-500',
    },
    active_journey: {
      aura: 'from-[#C9C5FA]/40 via-[#E8DDFB]/30 to-transparent',
      jewelGlow: 'rgba(246, 211, 226, 0.95)',
      ringGlow: 'rgba(201, 197, 250, 0.85)',
      badgeText: 'Journey Protected',
      badgeBg: 'bg-purple-500/15 text-[#542A70] border-[#E8DDFB]',
      dotColor: 'bg-[#542A70]',
    },
    deviation: {
      aura: 'from-amber-200/40 via-amber-100/30 to-transparent',
      jewelGlow: 'rgba(251, 191, 36, 0.9)',
      ringGlow: 'rgba(245, 158, 11, 0.7)',
      badgeText: 'Route Check',
      badgeBg: 'bg-amber-500/15 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
    },
    sos: {
      aura: 'from-[#DF4B5E]/40 via-[#C62845]/30 to-transparent',
      jewelGlow: 'rgba(223, 75, 94, 0.95)',
      ringGlow: 'rgba(198, 40, 69, 0.85)',
      badgeText: 'Emergency Broadcast',
      badgeBg: 'bg-red-500/15 text-red-900 border-red-300',
      dotColor: 'bg-red-500',
    },
  }[status];

  // Layer Z-offsets (expanded in explode mode)
  const zLayers = isExploded
    ? {
        shadow: -80,
        rimBase: 0,
        outerShield: 40,
        midBevel: 75,
        plumMedallion: 110,
        emblemFiligree: 145,
        pearlCore: 180,
        orbitalRing: 85,
        glare: 195,
      }
    : {
        shadow: -45,
        rimBase: 0,
        outerShield: 14,
        midBevel: 26,
        plumMedallion: 38,
        emblemFiligree: 50,
        pearlCore: 64,
        orbitalRing: 32,
        glare: 68,
      };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Perspective Viewport */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          perspective: '1100px',
        }}
      >
        {/* Atmospheric Floating Aura Background */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${statusConfig.aura} blur-3xl pointer-events-none transition-all duration-700`}
          style={{
            transform: `scale(${isHovered ? 1.25 : 1.1})`,
            opacity: isHovered ? 0.9 : 0.7,
          }}
        />

        {/* 3D Sculptural Assembly Root (preserve-3d) */}
        <div
          className="relative transition-transform duration-100 ease-out will-change-transform"
          style={{
            width: '260px',
            height: '300px',
            transformStyle: 'preserve-3d',
            transform: `
              scale(${dimensions.scale * (isPressed ? 0.94 : isHovered ? 1.04 : 1.0)})
              rotateX(${rotateX}deg) 
              rotateY(${rotateY}deg)
            `,
          }}
        >
          {/* ================= 1. DYNAMIC CONTACT GROUND SHADOW ================= */}
          <div
            className="absolute left-1/2 bottom-[-18px] -translate-x-1/2 rounded-full pointer-events-none transition-all duration-200"
            style={{
              width: '240px',
              height: '56px',
              transformStyle: 'preserve-3d',
              transform: `
                translateZ(${zLayers.shadow}px) 
                translateX(${-rotateY * 1.8}px) 
                translateY(${rotateX * 1.2}px) 
                scale(${1 + Math.abs(rotateX) * 0.01})
              `,
              background: `radial-gradient(ellipse at center, 
                rgba(53, 27, 77, 0.28) 0%, 
                rgba(84, 42, 112, 0.12) 45%, 
                transparent 72%)`,
              filter: 'blur(10px)',
            }}
          />

          {/* ================= 2. 3D EXTRUDED CLAY RIM SLICES (Gives authentic bevel thickness) ================= */}
          {[-8, -4, 0, 4, 8].map((offsetZ, idx) => (
            <div
              key={`rim-slice-${idx}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${zLayers.rimBase + offsetZ}px)`,
                clipPath: 'polygon(50% 0%, 94% 16%, 94% 62%, 50% 100%, 6% 62%, 6% 16%)',
                background: `linear-gradient(145deg, #E6D8ED 0%, #D8C5E5 50%, #C3AED4 100%)`,
                opacity: 0.85,
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
                #FFF8F4 35%, 
                #F8F0F8 70%, 
                #EEDDF6 100%)`,
              boxShadow: `
                0 18px 36px -8px rgba(53, 27, 77, 0.25),
                inset 4px 5px 12px rgba(255, 255, 255, 1),
                inset -5px -6px 14px rgba(84, 42, 112, 0.16)
              `,
            }}
          >
            {/* Dynamic Specular Sheen across Ceramic Outer Shell */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-100"
              style={{
                background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                  rgba(255, 255, 255, 0.85) 0%, 
                  rgba(255, 255, 255, 0.25) 30%, 
                  transparent 65%)`,
                mixBlendMode: 'overlay',
              }}
            />

            {/* Subtle Iridescent Pastel Edge Highlights */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: 'linear-gradient(120deg, rgba(246, 211, 226, 0.5) 0%, transparent 40%, rgba(201, 197, 250, 0.5) 100%)',
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
                #FBF5FF 0%, 
                #F0E5F8 50%, 
                #E4D4F0 100%)`,
              boxShadow: `
                0 6px 16px rgba(53, 27, 77, 0.12),
                inset 3px 3px 6px rgba(255, 255, 255, 0.9),
                inset -3px -3px 8px rgba(84, 42, 112, 0.12)
              `,
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {/* Soft Concentric Guilloche / Filigree Arch Ring */}
            <svg
              viewBox="0 0 200 240"
              className="w-full h-full opacity-35"
              fill="none"
              stroke="#542A70"
              strokeWidth="0.8"
            >
              <circle cx="100" cy="115" r="70" strokeDasharray="3 3" />
              <circle cx="100" cy="115" r="82" strokeDasharray="1 4" />
              <path d="M50,40 Q100,10 150,40" strokeWidth="1.2" />
              <path d="M40,140 Q100,210 160,140" strokeWidth="1.2" />
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
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E8DDFB]"
                style={{
                  boxShadow: '0 2px 6px rgba(84, 42, 112, 0.35)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#542A70]" />
              </div>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md flex items-center justify-center border border-[#E8DDFB]"
              >
                <span className="w-1 h-1 rounded-full bg-[#DF4B5E]" />
              </div>
            </div>
          </div>

          {/* ================= 6. CENTRAL CLAY MEDALLION (Deep Plum Porcelain) ================= */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[138px] h-[138px] rounded-full flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.plumMedallion}px)`,
              background: `linear-gradient(135deg, #542A70 0%, #431E5B 45%, #2B133E 100%)`,
              border: '3px solid rgba(246, 211, 226, 0.75)',
              boxShadow: `
                0 12px 24px -4px rgba(35, 15, 55, 0.5),
                inset 0 3px 5px rgba(255, 255, 255, 0.35),
                inset 0 -3px 6px rgba(0, 0, 0, 0.45)
              `,
            }}
          >
            {/* Medallion Radial Sunburst Pattern */}
            <div
              className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'repeating-conic-gradient(from 0deg, #FFFFFF 0deg 8deg, transparent 8deg 18deg)',
              }}
            />

            {/* Specular glare across plum porcelain */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                  rgba(255, 255, 255, 0.45) 0%, 
                  transparent 55%)`,
              }}
            />
          </div>

          {/* ================= 7. SAFESAATHI EMBOSSED FILIGREE / GUARDIAN CREST ================= */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[112px] h-[112px] flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.emblemFiligree}px)`,
              filter: 'drop-shadow(0 4px 6px rgba(25, 10, 40, 0.45))',
            }}
          >
            {/* Sculpted SafeSaathi Lotus-Wings Protector Emblem */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Protective Wing Left */}
              <path
                d="M50 18 C38 28 22 42 22 62 C22 75 32 84 45 84 C38 78 35 68 37 57 C39 48 45 38 50 30 Z"
                fill="url(#wingGradientLeft)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.8"
              />
              {/* Outer Protective Wing Right */}
              <path
                d="M50 18 C62 28 78 42 78 62 C78 75 68 84 55 84 C62 78 65 68 63 57 C61 48 55 38 50 30 Z"
                fill="url(#wingGradientRight)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.8"
              />
              {/* Crown Diamond Arch */}
              <path
                d="M50 10 L54 18 L50 24 L46 18 Z"
                fill="#FFF8F4"
                stroke="rgba(246, 211, 226, 0.9)"
                strokeWidth="0.6"
              />

              <defs>
                <linearGradient id="wingGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#F6D3E2" />
                  <stop offset="100%" stopColor="#D99AB9" />
                </linearGradient>
                <linearGradient id="wingGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#C9C5FA" />
                  <stop offset="100%" stopColor="#A79DF5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* ================= 8. FLOATING PROTECTIVE PEARL CORE ================= */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.pearlCore}px)`,
            }}
          >
            {/* The Ceramic Pearl Sphere */}
            <div
              className="relative w-9 h-9 rounded-full transition-transform duration-300"
              style={{
                background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                  #FFFFFF 0%, 
                  #FFF8F4 30%, 
                  #F6D3E2 60%, 
                  #9B6FA8 100%)`,
                boxShadow: `
                  0 8px 18px rgba(35, 15, 55, 0.4),
                  0 0 16px ${statusConfig.jewelGlow},
                  inset -2px -2px 6px rgba(84, 42, 112, 0.5),
                  inset 2px 2px 4px rgba(255, 255, 255, 1)
                `,
              }}
            >
              {/* Intense Specular Light Glint on Pearl */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-white transition-all duration-75"
                style={{
                  top: `${Math.max(15, Math.min(45, lightPos.y * 0.45))}%`,
                  left: `${Math.max(15, Math.min(45, lightPos.x * 0.45))}%`,
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 4px #FFFFFF',
                }}
              />
            </div>
          </div>

          {/* ================= 9. DYNAMIC SPECULAR STUDIO GLARE OVERLAY ================= */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${zLayers.glare}px)`,
              clipPath: 'polygon(50% 0%, 94% 16%, 94% 62%, 50% 100%, 6% 62%, 6% 16%)',
              background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, 
                rgba(255, 255, 255, 0.35) 0%, 
                transparent 48%)`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>

      {/* Interactive Micro-Controls & Live Status Indicator */}
      {showControls && (
        <div className="w-full mt-3 flex flex-col items-center gap-2">
          {/* Status Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-colors duration-300 ${statusConfig.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
            <span>{statusConfig.badgeText}</span>
            <span className="text-[#62566F]/60">·</span>
            <span className="text-[11px] font-mono text-[#62566F] font-semibold">
              {rotateX.toFixed(0)}°X, {rotateY.toFixed(0)}°Y
            </span>
          </div>

          {/* Interactive Utility Buttons (Subtle, elegant) */}
          <div className="flex items-center gap-1.5 p-1 bg-white/90 border border-[#E8DDFB] rounded-2xl shadow-xs text-xs font-semibold text-[#62566F]">
            <button
              onClick={() => {
                setAutoRotate(!autoRotate);
                soundManager.triggerHaptic(15);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                autoRotate
                  ? 'bg-[#542A70] text-white shadow-xs'
                  : 'text-[#62566F] hover:text-[#351B4D] hover:bg-[#F8F0F8]'
              }`}
              title="Toggle automatic floating rotation"
            >
              <Sparkles className="w-3 h-3" />
              <span>{autoRotate ? 'Levitating' : 'Manual'}</span>
            </button>

            {enableExplode && (
              <button
                onClick={() => {
                  setIsExploded(!isExploded);
                  soundManager.triggerHaptic(20);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isExploded
                    ? 'bg-[#542A70] text-white shadow-xs'
                    : 'text-[#62566F] hover:text-[#351B4D] hover:bg-[#F8F0F8]'
                }`}
                title="Explode 3D layers to inspect spatial depth"
              >
                <Layers className="w-3 h-3" />
                <span>{isExploded ? 'Flatten' : 'Depth'}</span>
              </button>
            )}

            <button
              onClick={resetOrientation}
              className="px-2 py-1 rounded-xl text-xs font-bold text-[#62566F] hover:text-[#351B4D] hover:bg-[#F8F0F8] transition-all cursor-pointer flex items-center gap-1"
              title="Reset angle to default"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <span className="text-[11px] text-[#62566F] font-medium tracking-wide">
            Move mouse to cast light &amp; tilt · Click for tactile response
          </span>
        </div>
      )}
    </div>
  );
};
