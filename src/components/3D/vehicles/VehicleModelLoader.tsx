import React, { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";
import { VEHICLE_COLOR, VEHICLE_MATERIAL_PROPS } from "../../../constants";

const getAssets = (type: string) => {
  const paths: Record<string, string> = {
    car: "/models/car.glb",
    suv: "/models/suv.glb",
    truck: "/models/truck.glb",
    van: "/models/van.glb"
  };

  return [paths[type] || paths.car];
};

function GLTFModel({
  type,
  onLoaded,
  onFailed
}: {
  type: string;
  onLoaded: () => void;
  onFailed: () => void;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  const urls = useMemo(() => getAssets(type), [type]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VEHICLE_COLOR,
        metalness: VEHICLE_MATERIAL_PROPS.metalness,
        roughness: VEHICLE_MATERIAL_PROPS.roughness,
        emissive: VEHICLE_COLOR,
        emissiveIntensity: 0.1
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);

    const load = (index: number) => {
      if (index >= urls.length) {
        onFailed();
        return;
      }

      loader.load(
        urls[index],
        (gltf) => {
          if (!mounted) return;

          const obj = gltf.scene;

          // Normalize + center
          const box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3.5 / maxDim;

          obj.scale.setScalar(scale);

          obj.position.x = -center.x * scale;
          obj.position.y = -box.min.y * scale;
          obj.position.z = -center.z * scale;

          // Apply material (no fallback geometry anywhere)
          obj.traverse((child: any) => {
            if (child.isMesh) {
              child.material = material;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          setScene(obj);
          onLoaded();
        },
        undefined,
        () => load(index + 1)
      );
    };

    load(0);

    return () => {
      mounted = false;
    };
  }, [urls, material, onLoaded, onFailed]);

  if (!scene) return null;

  return <primitive object={scene} dispose={null} />;
}

export default function Vehicle({
  type,
  active,
  material
}: {
  type: string;
  active: boolean;
  material: any;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [type]);

  return (
    <group scale={active ? 1.05 : 0.95}>
      <GLTFModel
        type={type}
        onLoaded={() => setLoaded(true)}
        onFailed={() => console.warn("Model failed to load")}
      />
    </group>
  );
}