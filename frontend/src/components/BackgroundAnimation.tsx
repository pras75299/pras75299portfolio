import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// Color stops for scroll gradient (cyan -> purple -> blue)
const colorStops = [
  new THREE.Color("#4fd1c5"), // Cyan (top)
  new THREE.Color("#a78bfa"), // Purple (middle)
  new THREE.Color("#60a5fa"), // Blue (bottom)
];

const lerpColor = (scroll: number): THREE.Color => {
  const t = Math.max(0, Math.min(1, scroll));
  
  if (t < 0.5) {
    const localT = t * 2;
    return colorStops[0].clone().lerp(colorStops[1], localT);
  } else {
    const localT = (t - 0.5) * 2;
    return colorStops[1].clone().lerp(colorStops[2], localT);
  }
};

interface WaveGridProps {
  scrollProgressRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

const WaveGrid = ({ scrollProgressRef, mouseRef }: WaveGridProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointMaterialRef = useRef<THREE.PointsMaterial>(null);

  // Smoothed mouse position for lerping
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

        if (j < gridSize - 1) {
          indices.push(index, index + 1);
        }
        if (i < gridSize - 1) {
          indices.push(index, index + gridSize);
        }
      }
    }

    return {
      positions: pos,
      originalPositions: original,
      lineIndices: new Uint16Array(indices),
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const scrollProgress = scrollProgressRef.current ?? 0;
    const mouse = mouseRef.current ?? { x: 0, y: 0 };

    // Smooth mouse interpolation
    smoothMouse.current.x += (mouse.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (mouse.y - smoothMouse.current.y) * 0.05;

    if (pointsRef.current && linesRef.current) {
      const pointsAttr = pointsRef.current.geometry.attributes.position;
      const linesAttr = linesRef.current.geometry.attributes.position;
      const pointsArr = pointsAttr.array as Float32Array;
      const linesArr = linesAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const x = originalPositions[idx];
        const z = originalPositions[idx + 2];

        // Base wave motion
        let y =
          Math.sin(x * 0.4 + t * 0.5) * 0.3 +
          Math.cos(z * 0.4 + t * 0.4) * 0.3;

        // Mouse influence - create ripple effect based on distance from mouse
        const mouseInfluenceX = smoothMouse.current.x * 8; // Scale to grid space
        const mouseInfluenceZ = smoothMouse.current.y * 8;
        const distToMouse = Math.sqrt(
          Math.pow(x - mouseInfluenceX, 2) + Math.pow(z - mouseInfluenceZ, 2)
        );
        const mouseWave = Math.sin(distToMouse * 0.5 - t * 2) * Math.max(0, 1 - distToMouse * 0.08) * 0.4;
        y += mouseWave;

        pointsArr[idx + 1] = y;
        linesArr[idx + 1] = y;
      }

      pointsAttr.needsUpdate = true;
      linesAttr.needsUpdate = true;
    }

    // Update colors based on scroll
    const currentColor = lerpColor(scrollProgress);
    if (lineMaterialRef.current) {
      lineMaterialRef.current.color = currentColor;
    }
    if (pointMaterialRef.current) {
      pointMaterialRef.current.color = currentColor;
    }

    if (groupRef.current) {
      // Base rotation + mouse parallax
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
          color="#4fd1c5"
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
          color="#4fd1c5"
          transparent
          opacity={0.28}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

const BackgroundAnimation = () => {
  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      scrollProgressRef.current = progress;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll();

    return () => {
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
        <WaveGrid scrollProgressRef={scrollProgressRef} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};

export default BackgroundAnimation;

