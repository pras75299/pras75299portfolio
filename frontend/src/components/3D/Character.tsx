import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Character() {
  const group = useRef<THREE.Group>();
  const { nodes, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf');

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.2;
    }
  });

  return (
    <group ref={group} dispose={null} scale={0.5} position={[0, 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials.Material}
      >
        <meshStandardMaterial
          color="#2563eb"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
    </group>
  );
}