import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Compass, Navigation } from 'lucide-react';

interface SafeSaathi3DCorridorProps {
  progress?: number; // 0 to 1
  deviationMeters?: number;
  thresholdMeters?: number;
  headingDegrees?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  transportMode?: 'walk' | 'cab' | 'transit' | 'bike';
}

export const SafeSaathi3DCorridor: React.FC<SafeSaathi3DCorridorProps> = ({
  progress = 0.55,
  deviationMeters = 38,
  thresholdMeters = 500,
  headingDegrees = 42,
  className = '',
  size = 'md',
  transportMode = 'cab',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const beamRef = useRef<THREE.Mesh | null>(null);
  const waypointMeshRef = useRef<THREE.Mesh | null>(null);

  const targetRotation = useRef<{ x: number; y: number }>({ x: 0.35, y: 0 });

  const getDimensions = useCallback(() => {
    switch (size) {
      case 'sm':
        return { width: 140, height: 140 };
      case 'lg':
        return { width: 340, height: 260 };
      case 'md':
      default:
        return { width: 260, height: 200 };
    }
  }, [size]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 4.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Procedural Studio Environment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      pmremGenerator.dispose();
      roomEnv.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback in corridor:', e);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8fa, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1ea, 2.8);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce5ff, 1.6);
    fillLight.position.set(-2, -1, 2);
    scene.add(fillLight);

    // Root Group
    const rootGroup = new THREE.Group();
    rootGroupRef.current = rootGroup;
    scene.add(rootGroup);

    // 1. Translucent Base Disc with Concentric Deviation Rings
    const discGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.06, 64);
    const discMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FAF7FF'),
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.8,
      thickness: 0.8,
      ior: 1.48,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.92,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    rootGroup.add(disc);

    // 2. Concentric Safe Corridor Perimeters (100m, 300m, 500m threshold)
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#D8CCE8'),
      wireframe: false,
      transparent: true,
      opacity: 0.65,
    });
    [0.6, 1.0, 1.4].forEach((radius) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 8, 64), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.035;
      rootGroup.add(ring);
    });

    // 3. 3D Route Corridor Ribbon (Curved 3D spline representing the route)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.1, 0.05, 0.8),
      new THREE.Vector3(-0.4, 0.05, 0.3),
      new THREE.Vector3(0.1, 0.05, -0.1),
      new THREE.Vector3(0.7, 0.05, -0.6),
      new THREE.Vector3(1.1, 0.05, -0.9),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.024, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6C3A82'),
      metalness: 0.4,
      roughness: 0.2,
      emissive: new THREE.Color('#55276B'),
      emissiveIntensity: 0.3,
    });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    rootGroup.add(routeTube);

    // 4. Current User Beacon (Dimensional faceted pin hovering on route)
    const beaconGeo = new THREE.ConeGeometry(0.1, 0.24, 16);
    beaconGeo.center();
    const beaconMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#DF4B5E'),
      emissive: new THREE.Color('#DF4B5E'),
      emissiveIntensity: 0.45,
      metalness: 0.5,
      roughness: 0.2,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.rotation.x = Math.PI; // Inverted cone pointing at route
    beacon.position.set(0.1, 0.22, -0.1);
    rootGroup.add(beacon);
    waypointMeshRef.current = beacon;

    // 5. Escort Directional Guidance Beam
    const beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8B5CF6'),
      transparent: true,
      opacity: 0.75,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0.1, 0.1, -0.1);
    rootGroup.add(beam);
    beamRef.current = beam;

    // Pointer Parallax Handlers
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetRotation.current = {
        x: THREE.MathUtils.clamp(0.35 + ny * 0.25, 0.1, 0.6),
        y: THREE.MathUtils.clamp(nx * 0.45, -0.6, 0.6),
      };
    };

    const handlePointerLeave = () => {
      targetRotation.current = { x: 0.35, y: 0 };
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (rootGroup) {
        rootGroup.rotation.x = THREE.MathUtils.damp(rootGroup.rotation.x, targetRotation.current.x, 4.5, delta);
        rootGroup.rotation.y = THREE.MathUtils.damp(rootGroup.rotation.y, targetRotation.current.y, 4.5, delta);
      }

      // Bobbing beacon pin
      if (beacon) {
        beacon.position.y = 0.22 + Math.sin(elapsedTime * 3) * 0.035;
        beacon.rotation.y += delta * 1.5;
      }

      // Oscillating guidance beam
      if (beam) {
        beam.rotation.y = elapsedTime * 0.8;
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);

      discGeo.dispose();
      discMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [getDimensions]);

  const { width, height } = getDimensions();

  if (!webGlSupported) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-white border border-[#E8DEF3] p-4 ${className}`}
        style={{ width, height }}
      >
        <Compass className="w-8 h-8 text-[#6C3A82]" />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div
        ref={mountRef}
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ width, height }}
        title="3D Autonomous Safe Corridor — Drag to inspect corridor perimeter in 3D"
      />
      <div className="absolute top-2 left-3 pointer-events-none flex items-center gap-1.5 text-[10px] font-bold text-[#6C3A82] bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-purple-200/50">
        <Navigation className="w-3 h-3 text-[#6C3A82]" />
        <span>3D Corridor Radar</span>
      </div>
    </div>
  );
};
