import * as THREE from 'three';
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, MeshDistortMaterial, ContactShadows, useCursor } from '@react-three/drei';
import { VEHICLE_TYPES } from '../../types';
import { VEHICLE_COLOR, VEHICLE_MATERIAL_PROPS } from '../../constants';
import Vehicle from './vehicles/VehicleModelLoader';

interface VehicleProps {
  type: string;
  active: boolean;
  position: [number, number, number];
  onClick: () => void;
}

const VehicleModel = ({ type, active, position, onClick }: VehicleProps) => {
  const mesh = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (mesh.current) {
      const elapsedTime = state.clock.getElapsedTime();
      
      // 1. Stable Rotation Logic
      // Cinematic 3/4 view angle offset
      const cinematicAngle = -Math.PI / 4;
      const orientationCorrection = type === 'truck' ? Math.PI / 2 : 0;
      const baseTarget = cinematicAngle + orientationCorrection;

      if (active) {
        // Find nearest rotation multiple to prevent "long-way-around" spinning
        const currentY = mesh.current.rotation.y;
        const diff = baseTarget - (currentY % (Math.PI * 2));
        const stabilizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const targetRotation = currentY + stabilizedDiff;
        
        mesh.current.rotation.y = THREE.MathUtils.lerp(currentY, targetRotation, 0.1);
        
        // Gentle stabilized hovering
        mesh.current.position.y = THREE.MathUtils.lerp(
          mesh.current.position.y, 
          position[1] + Math.sin(elapsedTime * 2) * 0.03, 
          0.1
        );
      } else {
        // Background rotation: consistent and smooth
        mesh.current.rotation.y += 0.008;
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, position[1], 0.1);
      }

      // 2. Optimized Scaling and Positioning
      const targetScaleValue = active ? 1.05 : 0.7;
      const scaleLerp = 0.12;
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScaleValue, scaleLerp);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScaleValue, scaleLerp);
      mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, targetScaleValue, scaleLerp);
      
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, position[0], 0.12);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, position[2], 0.12);
    }
  });

  const showroomMaterial = useMemo(() => (
    <meshStandardMaterial
      color={VEHICLE_COLOR}
      metalness={VEHICLE_MATERIAL_PROPS.metalness}
      roughness={VEHICLE_MATERIAL_PROPS.roughness}
      emissive={active ? "#0ea5e9" : "#000000"}
      emissiveIntensity={active ? 0.15 : 0}
    />
  ), [active]);

  return (
    <group
      ref={mesh}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Vehicle type={type} material={showroomMaterial} active={active} />
      
      {active && (
        <>
          {/* Key light to catch reflections on metallic black paint */}
          <pointLight position={[2, 3, 2]} intensity={35} color="#ffffff" />
          
          {/* Neon Underglow light */}
          <pointLight position={[0, -0.45, 0]} intensity={45} distance={4} color="#0ea5e9" decay={2} />
          
          {/* Back/Rim light to create a purple backdrop glow and highlight the vehicle's silhouette */}
          <pointLight position={[0, 1, -2.5]} intensity={75} distance={6} color="#7A5CFF" decay={1.5} />
        </>
      )}
    </group>
  );
};

interface VehicleSceneProps {
  currentVehicleIndex: number;
  onSelect: (index: number) => void;
  isZoomed: boolean;
}

const SceneController = ({ isZoomed }: { isZoomed: boolean }) => {
  useFrame((state) => {
    const targetFov = isZoomed ? 35 : 55;
    const camera = state.camera as THREE.PerspectiveCamera;
    if (camera.isPerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

export const VehicleScene = ({ currentVehicleIndex, onSelect, isZoomed }: VehicleSceneProps) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        shadows={{ type: THREE.PCFSoftShadowMap }} 
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]} 
      >
        <SceneController isZoomed={isZoomed} />
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 8]} 
        />
        
        <ambientLight intensity={0.3} />
        
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-bias={-0.0001}
          shadow-mapSize={[512, 512]}
        />
        
        <directionalLight 
          position={[-5, 3, -5]} 
          intensity={0.5} 
        />

        <group position={[0, -0.5, 0]}>
          {VEHICLE_TYPES.map((v, i) => {
            const isActive = currentVehicleIndex === i;
            // Circular / Horizontal layout logic
            const offset = (i - currentVehicleIndex) * (isZoomed ? 0 : 4);
            const zOffset = isActive ? 0 : -3;
            const yOffset = isActive ? 0 : -0.5;

            return (
              <VehicleModel
                key={v.id}
                type={v.id}
                active={isActive}
                position={[offset, yOffset, zOffset]}
                onClick={() => onSelect(i)}
              />
            );
          })}
        </group>

        <ContactShadows 
          resolution={512} 
          scale={20} 
          blur={1.5} 
          opacity={0.3} 
          far={10} 
          color={VEHICLE_COLOR} 
        />
        
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
};
