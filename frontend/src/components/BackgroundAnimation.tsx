import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// ── Theme-aware color stops ───────────────────────────────────────────────────
// Dark mode: bright orange/amber visible on near-black background
const darkColorStops = [
  new THREE.Color("#F97316"), // orange-500  (top of page)
  new THREE.Color("#FBBF24"), // amber-400   (mid scroll)
  new THREE.Color("#FB923C"), // orange-400  (bottom)
];
// Light mode: deeper orange/amber for contrast on white background
const lightColorStops = [
  new THREE.Color("#C2410C"), // orange-700
  new THREE.Color("#D97706"), // amber-600
  new THREE.Color("#EA580C"), // orange-600
];

const lerpColor = (scroll: number, isDark: boolean): THREE.Color => {
  const stops = isDark ? darkColorStops : lightColorStops;
  const t = Math.max(0, Math.min(1, scroll));
  if (t < 0.5) {
    return stops[0].clone().lerp(stops[1], t * 2);
  }
  return stops[1].clone().lerp(stops[2], (t - 0.5) * 2);
};

// ── WaveGrid ─────────────────────────────────────────────────────────────────
interface WaveGridProps {
  scrollProgressRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  isDarkRef: React.RefObject<boolean>;
}

const WaveGrid = ({ scrollProgressRef, mouseRef, isDarkRef }: WaveGridProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null);

  const smoothMouse = useRef({ x: 0, y: 0 });

  const gridSize = 28;
  const spacing = 0.8;
  const count = gridSize * gridSize;

  const { positions, originalPositions, lineIndices } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const original = new Float32Array(count * 3);
    const indices: number[] = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const idx = index * 3;
        const x = (i - gridSize / 2) * spacing;
        const z = (j - gridSize / 2) * spacing;

        pos[idx] = x;
        pos[idx + 1] = 0;
        pos[idx + 2] = z;
        original[idx] = x;
        original[idx + 1] = 0;
        original[idx + 2] = z;

        if (j < gridSize - 1) indices.push(index, index + 1);
        if (i < gridSize - 1) indices.push(index, index + gridSize);
      }
    }

    return {
      positions: pos,
      originalPositions: original,
      lineIndices: new Uint16Array(indices),
    };
  }, [count, gridSize, spacing]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scrollProgress = scrollProgressRef.current ?? 0;
    const mouse = mouseRef.current ?? { x: 0, y: 0 };
    const isDark = isDarkRef.current ?? true;

    // Smooth mouse
    smoothMouse.current.x += (mouse.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (mouse.y - smoothMouse.current.y) * 0.05;

    // Update wave geometry
    if (pointsRef.current && linesRef.current) {
      const pointsAttr = pointsRef.current.geometry.attributes.position;
      const linesAttr = linesRef.current.geometry.attributes.position;
      const pointsArr = pointsAttr.array as Float32Array;
      const linesArr = linesAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const x = originalPositions[idx];
        const z = originalPositions[idx + 2];

        let y =
          Math.sin(x * 0.4 + t * 0.5) * 0.3 +
          Math.cos(z * 0.4 + t * 0.4) * 0.3;

        const mouseInfluenceX = smoothMouse.current.x * 8;
        const mouseInfluenceZ = smoothMouse.current.y * 8;
        const distToMouse = Math.sqrt(
          Math.pow(x - mouseInfluenceX, 2) + Math.pow(z - mouseInfluenceZ, 2),
        );
        y +=
          Math.sin(distToMouse * 0.5 - t * 2) *
          Math.max(0, 1 - distToMouse * 0.08) *
          0.4;

        pointsArr[idx + 1] = y;
        linesArr[idx + 1] = y;
      }

      pointsAttr.needsUpdate = true;
      linesAttr.needsUpdate = true;
    }

    // Theme-aware color + opacity
    const currentColor = lerpColor(scrollProgress, isDark);
    if (lineMaterialRef.current) {
      lineMaterialRef.current.color = currentColor;
      // Higher opacity on light bg so lines stay visible against white
      lineMaterialRef.current.opacity = isDark ? 0.15 : 0.28;
    }
    if (pointMaterialRef.current) {
      pointMaterialRef.current.color = currentColor;
      pointMaterialRef.current.opacity = isDark ? 0.28 : 0.45;
    }

    // Group transform
    if (groupRef.current) {
      groupRef.current.rotation.x = -0.5 + smoothMouse.current.y * 0.1;
      groupRef.current.rotation.z = t * 0.02 + smoothMouse.current.x * 0.05;
      groupRef.current.position.x = smoothMouse.current.x * 0.5;
      groupRef.current.position.y = smoothMouse.current.y * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions.slice()}
            count={count}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            array={lineIndices}
            count={lineIndices.length}
            itemSize={1}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color="#F97316"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointMaterialRef}
          size={0.05}
          color="#F97316"
          transparent
          opacity={0.28}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// ── BackgroundAnimation ───────────────────────────────────────────────────────
const BackgroundAnimation = () => {
  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDarkRef = useRef(!document.documentElement.classList.contains("light"));

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current =
        scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // Watch light ↔ dark class toggle on <html>
    const observer = new MutationObserver(() => {
      isDarkRef.current = !document.documentElement.classList.contains("light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 6, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <WaveGrid
          scrollProgressRef={scrollProgressRef}
          mouseRef={mouseRef}
          isDarkRef={isDarkRef}
        />
      </Canvas>
    </div>
  );
};

export default BackgroundAnimation;
