import React from "react";
import { Edges } from "@react-three/drei";
import { VEHICLE_COLOR, VEHICLE_MATERIAL_PROPS } from "../../../constants";

export function Wheel({ position, radius = 0.3, width = 0.4 }: { position: [number, number, number], radius?: number, width?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, width, 16]} />
      <meshStandardMaterial 
        color={VEHICLE_COLOR} 
        metalness={VEHICLE_MATERIAL_PROPS.metalness}
        roughness={VEHICLE_MATERIAL_PROPS.roughness}
      />
      <Edges color={VEHICLE_COLOR} opacity={0.3} transparent />
    </mesh>
  );
}
