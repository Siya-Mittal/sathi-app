import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Shield, Sparkles, Layers, Eye, RefreshCw } from 'lucide-react';

export type ShieldViewMode = 'all' | 'glass' | 'core' | 'orbital';

interface SafeSaathi3DShieldProps {
  status?: 'safe' | 'active_journey' | 'deviation' | 'sos';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  showLayerControls?: boolean;
}

export const SafeSaathi3DShield: React.FC<SafeSaathi3DShieldProps> = ({
  status = 'safe',
  className = '',
  size = 'md',
  interactive = true,
  showLayerControls = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<ShieldViewMode>('all');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const glassMeshRef = useRef<THREE.Mesh | null>(null);
  const innerFiligreeRef = useRef<THREE.Mesh | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const pearlsGroupRef = useRef<THREE.Group | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // Target pointer tilt and pulse factor
  const targetRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pulseFactor = useRef<number>(1);
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dimensions based on size
  const getDimensions = useCallback(() => {
    switch (size) {
      case 'sm':
        return { width: 130, height: 130 };
      case 'lg':
        return { width: 340, height: 340 };
      case 'hero':
        return { width: 400, height: 400 };
      case 'md':
      default:
        return { width: 240, height: 240 };
    }
  }, [size]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const { width, height } = getDimensions();

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with pleasant portrait angle
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    // 3. Renderer with ACESFilmicToneMapping & sRGB Color Space
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Procedural Studio Environment for authentic physical glass reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      pmremGenerator.dispose();
      roomEnv.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback:', e);
    }

    // 5. Studio Lighting Rig: Warm ivory key + Pale periwinkle fill + Rim backlight
    const ambientLight = new THREE.AmbientLight(0xfff8fa, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff2e6, 3.2);
    keyLight.position.set(3.5, 4.2, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce5ff, 2.0);
    fillLight.position.set(-3.5, -2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfce7f3, 2.4);
    rimLight.position.set(0, 3.5, -3.2);
    scene.add(rimLight);

    // Dynamic inner core jewel point light
    const pointLight = new THREE.PointLight(0xf5d0fe, 2.8, 7.5);
    pointLight.position.set(0, 0, 0.6);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 6. Build Composite 3D Sculpture Hierarchy (`THREE.Group`)
    const rootGroup = new THREE.Group();
    rootGroupRef.current = rootGroup;
    scene.add(rootGroup);

    // A. Soft Grounding Radial Contact Shadow Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(69, 38, 63, 0.35)');
      grad.addColorStop(0.5, 'rgba(112, 46, 70, 0.12)');
      grad.addColorStop(1, 'rgba(112, 46, 70, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.65;
    scene.add(shadowPlane);

    // B. Outer Protective Sculptural Glass Shield
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.35);
    shieldShape.bezierCurveTo(0.72, 1.35, 1.18, 1.05, 1.18, 0.38);
    shieldShape.bezierCurveTo(1.18, -0.45, 0.68, -1.05, 0, -1.48);
    shieldShape.bezierCurveTo(-0.68, -1.05, -1.18, -0.45, -1.18, 0.38);
    shieldShape.bezierCurveTo(-1.18, 1.05, -0.72, 1.35, 0, 1.35);

    const shieldExtrude: THREE.ExtrudeGeometryOptions = {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.07,
      bevelThickness: 0.07,
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, shieldExtrude);
    shieldGeometry.center();

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FAF5EF'),
      metalness: 0.08,
      roughness: 0.12,
      transmission: 0.82,
      thickness: 1.5,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      iridescence: 0.95,
      iridescenceIOR: 1.38,
      attenuationColor: new THREE.Color('#F4EBE0'),
      attenuationDistance: 1.6,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
    });

    const shieldMesh = new THREE.Mesh(shieldGeometry, glassMaterial);
    shieldMesh.renderOrder = 2;
    rootGroup.add(shieldMesh);
    glassMeshRef.current = shieldMesh;

    // C. Internal Champagne-Gold Filigree Lattice (Protective Arch)
    const innerBorderGeo = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    });
    innerBorderGeo.center();
    innerBorderGeo.scale(0.85, 0.85, 0.85);

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C5A36A'),
      metalness: 0.88,
      roughness: 0.22,
    });

    const innerFiligree = new THREE.Mesh(innerBorderGeo, goldMaterial);
    innerFiligree.renderOrder = 1;
    rootGroup.add(innerFiligree);
    innerFiligreeRef.current = innerFiligree;

    // D. Radiant Faceted Jewel Core (Deep Berry with Terracotta emissive)
    const coreGeometry = new THREE.OctahedronGeometry(0.36, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#702E46'),
      emissive: new THREE.Color('#C86650'),
      emissiveIntensity: 0.48,
      metalness: 0.25,
      roughness: 0.1,
      clearcoat: 1.0,
      transmission: 0.55,
      ior: 1.65,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.set(0, 0.04, 0.22);
    coreMesh.renderOrder = 3;
    rootGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // E. Dual Precision Gyroscopic Champagne & Terracotta Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C5A36A'),
      metalness: 0.86,
      roughness: 0.2,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.44, 0.02, 16, 96), ringMat);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);
    ring1Ref.current = ring1;

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.018, 16, 96), ringMat);
    ring2.rotation.y = Math.PI / 3.4;
    ring2.rotation.x = -Math.PI / 5.5;
    rootGroup.add(ring2);
    ring2Ref.current = ring2;

    // F. Floating Iridescent Guardian Pearl Orbs (Coral & Ivory)
    const pearlsGroup = new THREE.Group();
    const pearlGeo = new THREE.SphereGeometry(0.065, 24, 24);
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      metalness: 0.15,
      roughness: 0.14,
      clearcoat: 1.0,
      iridescence: 0.85,
    });

    const pearlCount = 6;
    for (let i = 0; i < pearlCount; i++) {
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.userData = { angleOffset: (i / pearlCount) * Math.PI * 2, radius: 1.7 };
      pearlsGroup.add(pearl);
    }
    rootGroup.add(pearlsGroup);
    pearlsGroupRef.current = pearlsGroup;

    // Pointer Interaction Handlers (Smooth Drag / Orbit)
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isPointerDown.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      pointerStart.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDown.current) {
        const dx = (clientX - pointerStart.current.x) * 0.008;
        const dy = (clientY - pointerStart.current.y) * 0.008;
        targetRotation.current.x = THREE.MathUtils.clamp(targetRotation.current.x + dy, -0.7, 0.7);
        targetRotation.current.y = THREE.MathUtils.clamp(targetRotation.current.y + dx, -0.9, 0.9);
        pointerStart.current = { x: clientX, y: clientY };
      } else {
        const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotation.current = {
          x: THREE.MathUtils.clamp(ny * 0.42, -0.45, 0.45),
          y: THREE.MathUtils.clamp(nx * 0.52, -0.55, 0.55),
        };
      }
    };

    const handlePointerUp = () => {
      isPointerDown.current = false;
    };

    const handlePointerLeave = () => {
      isPointerDown.current = false;
      targetRotation.current = { x: 0, y: 0 };
    };

    // Click pulse trigger
    const handleClick = () => {
      pulseFactor.current = 1.15;
      setIsInteracting(true);
      setTimeout(() => setIsInteracting(false), 450);
    };

    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('touchend', handlePointerUp);
    container.addEventListener('click', handleClick);

    // 7. Render Loop with Frame-Rate Independent Exponential Damping
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (rootGroup) {
        // Damped rotation to target orientation
        rootGroup.rotation.x = THREE.MathUtils.damp(
          rootGroup.rotation.x,
          targetRotation.current.x + Math.sin(elapsedTime * 0.8) * 0.035,
          5.5,
          delta
        );
        rootGroup.rotation.y = THREE.MathUtils.damp(
          rootGroup.rotation.y,
          targetRotation.current.y + Math.cos(elapsedTime * 0.65) * 0.045,
          5.5,
          delta
        );

        // Gentle floating respiration
        rootGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.07;

        // Pulse decay
        pulseFactor.current = THREE.MathUtils.damp(pulseFactor.current, 1.0, 4.2, delta);
        const s = pulseFactor.current;
        rootGroup.scale.set(s, s, s);
      }

      // Orbital rings rotation
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += delta * 0.32;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.x += delta * 0.25;
      }

      // Inner jewel subtle spinning & glowing respiration
      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y += delta * 0.75;
        coreMeshRef.current.rotation.z = Math.sin(elapsedTime * 1.3) * 0.18;
      }

      // Floating guardian pearls orbit in wave
      if (pearlsGroupRef.current) {
        pearlsGroupRef.current.children.forEach((p, idx) => {
          const u = p.userData as { angleOffset: number; radius: number };
          const theta = elapsedTime * 0.45 + u.angleOffset;
          p.position.x = Math.cos(theta) * u.radius;
          p.position.y = Math.sin(theta) * (u.radius * 0.4) + Math.sin(elapsedTime * 2 + idx) * 0.08;
          p.position.z = Math.sin(theta) * 0.8;
        });
      }

      renderer.render(scene, camera);
    };

    render();

    // 8. Resource Disposal on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchstart', handlePointerDown);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('touchend', handlePointerUp);
      container.removeEventListener('click', handleClick);

      shieldGeometry.dispose();
      glassMaterial.dispose();
      innerBorderGeo.dispose();
      goldMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      pearlGeo.dispose();
      pearlMat.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [getDimensions, interactive]);

  // Adjust material colors and illumination based on safety status
  useEffect(() => {
    if (!pointLightRef.current || !coreMeshRef.current) return;
    const coreMat = coreMeshRef.current.material as THREE.MeshPhysicalMaterial;

    switch (status) {
      case 'sos':
        pointLightRef.current.color.set('#DF4B5E');
        pointLightRef.current.intensity = 4.5;
        coreMat.emissive.set('#C82B3E');
        coreMat.emissiveIntensity = 0.9;
        break;
      case 'deviation':
        pointLightRef.current.color.set('#F59E0B');
        pointLightRef.current.intensity = 3.4;
        coreMat.emissive.set('#D97706');
        coreMat.emissiveIntensity = 0.65;
        break;
      case 'active_journey':
        pointLightRef.current.color.set('#818CF8');
        pointLightRef.current.intensity = 3.2;
        coreMat.emissive.set('#4F6BC4');
        coreMat.emissiveIntensity = 0.6;
        break;
      case 'safe':
      default:
        pointLightRef.current.color.set('#F5D0FE');
        pointLightRef.current.intensity = 2.6;
        coreMat.emissive.set('#9D5BBA');
        coreMat.emissiveIntensity = 0.4;
        break;
    }
  }, [status]);

  // Handle layer inspection visibility mode
  useEffect(() => {
    if (!glassMeshRef.current || !innerFiligreeRef.current || !coreMeshRef.current || !ring1Ref.current || !ring2Ref.current || !pearlsGroupRef.current) {
      return;
    }

    const glassMat = glassMeshRef.current.material as THREE.MeshPhysicalMaterial;
    const filigreeMat = innerFiligreeRef.current.material as THREE.MeshStandardMaterial;

    switch (activeLayer) {
      case 'glass':
        glassMeshRef.current.visible = true;
        glassMat.opacity = 0.98;
        glassMat.transmission = 0.65;
        innerFiligreeRef.current.visible = false;
        coreMeshRef.current.visible = false;
        ring1Ref.current.visible = false;
        ring2Ref.current.visible = false;
        pearlsGroupRef.current.visible = false;
        break;
      case 'core':
        glassMeshRef.current.visible = false;
        innerFiligreeRef.current.visible = true;
        filigreeMat.opacity = 0.8;
        coreMeshRef.current.visible = true;
        ring1Ref.current.visible = false;
        ring2Ref.current.visible = false;
        pearlsGroupRef.current.visible = true;
        break;
      case 'orbital':
        glassMeshRef.current.visible = false;
        innerFiligreeRef.current.visible = false;
        coreMeshRef.current.visible = true;
        ring1Ref.current.visible = true;
        ring2Ref.current.visible = true;
        pearlsGroupRef.current.visible = true;
        break;
      case 'all':
      default:
        glassMeshRef.current.visible = true;
        glassMat.opacity = 0.95;
        glassMat.transmission = 0.78;
        innerFiligreeRef.current.visible = true;
        coreMeshRef.current.visible = true;
        ring1Ref.current.visible = true;
        ring2Ref.current.visible = true;
        pearlsGroupRef.current.visible = true;
        break;
    }
  }, [activeLayer]);

  const { width, height } = getDimensions();

  // If WebGL is not supported, provide elegant dimensional CSS fallback
  if (!webGlSupported) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-3xl p-6 ${className}`}
        style={{ width, height }}
      >
        <div className="w-28 h-32 rounded-3xl bg-gradient-to-br from-[#FFF5F8] via-[#F8F1FD] to-[#EFF4FE] border border-[#E8DEF3] shadow-lg flex flex-col items-center justify-center p-3 text-center">
          <Shield className="w-10 h-10 text-[#6C3A82] mb-1" />
          <span className="text-[11px] font-bold text-[#2A1637]">SafeSaathi Guard</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Canvas Mount Viewport */}
      <div
        className="relative flex items-center justify-center group cursor-grab active:cursor-grabbing"
        style={{ width, height }}
        title="SafeSaathi Dimensional Protective Emblem — Drag to inspect 3D layers, click to pulse"
      >
        <div ref={mountRef} className="w-full h-full flex items-center justify-center" />

        {/* Ambient Iridescent Soft Glow Backing */}
        <div
          className="absolute inset-4 rounded-full pointer-events-none -z-10 blur-3xl opacity-40 transition-all duration-700"
          style={{
            background:
              status === 'sos'
                ? 'radial-gradient(circle, rgba(223, 75, 94, 0.45) 0%, transparent 70%)'
                : status === 'deviation'
                ? 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)'
                : status === 'active_journey'
                ? 'radial-gradient(circle, rgba(79, 107, 196, 0.35) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(235, 205, 248, 0.6) 0%, rgba(225, 234, 255, 0.35) 45%, transparent 75%)',
          }}
        />
      </div>

      {/* Layer Inspection Controls (Collapsible or Shown when Requested) */}
      {showLayerControls && (
        <div className="mt-2 flex items-center gap-1 p-1 bg-white/80 dark:bg-purple-950/60 backdrop-blur-md rounded-2xl border border-[#E8DEF3] shadow-xs">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'glass', label: 'Prismatic Shell' },
            { id: 'core', label: 'Guardian Core' },
            { id: 'orbital', label: 'Orbital Gyro' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLayer(tab.id as ShieldViewMode)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeLayer === tab.id
                  ? 'bg-gradient-to-r from-[#6C3A82] to-[#55276B] text-white shadow-xs'
                  : 'text-[#5E486D] hover:text-[#2A1637] hover:bg-purple-50/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
