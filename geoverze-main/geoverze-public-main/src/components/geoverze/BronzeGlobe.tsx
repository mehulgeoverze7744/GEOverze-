import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import earthMap from "@/assets/earth-bronze-map.jpg";

const DEG = Math.PI / 180;
/** Rotates the texture so Europe/Africa face the camera at progress 0. */
const BASE_Y = -100 * DEG;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Normalized progress inside [a, b]. */
function phase(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Props = {
  progress: RefObject<number>;
  /** Where the emblem's globe sits at progress 0, in world units. */
  origin: [number, number];
  /** Final resting position on the right side. */
  parked: [number, number];
  startScale: number;
  bigScale: number;
  finalScale: number;
};

export function BronzeGlobe({ progress, origin, parked, startScale, bigScale, finalScale }: Props) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const idle = useRef(0);

  const texture = useLoader(THREE.TextureLoader, earthMap);

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.wrapS = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.035,
      color: new THREE.Color("#f0c193"),
      metalness: 0.55,
      roughness: 0.42,
      envMapIntensity: 0.85,
      transparent: true,
      opacity: 0,
    });
  }, [texture]);

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 96, 96), []);

  // Free GPU resources when the hero unmounts (route change / HMR).
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  useFrame((_, delta) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;

    const p = progress.current ?? 0;

    // --- emerge (0 -> 0.4): scale up from the emblem, drift to center
    const emerge = easeInOut(phase(p, 0, 0.4));
    // --- park (0.7 -> 1): slide to the right side
    const park = easeInOut(phase(p, 0.7, 1));
    // --- dominant hold (0.4 -> 0.7): slight extra growth
    const hold = phase(p, 0.4, 0.7);
    // --- reveal (0.05 -> 0.18): the globe is invisible inside the emblem first
    const reveal = easeInOut(phase(p, 0.05, 0.18));

    material.opacity = reveal;
    m.visible = reveal > 0.001;



    const cx = THREE.MathUtils.lerp(origin[0], 0, emerge);
    const cy = THREE.MathUtils.lerp(origin[1], 0, emerge);
    g.position.x = THREE.MathUtils.lerp(cx, parked[0], park);
    g.position.y = THREE.MathUtils.lerp(cy, parked[1], park);

    const grown = THREE.MathUtils.lerp(startScale, bigScale, emerge);
    const scale = THREE.MathUtils.lerp(grown, finalScale, park);
    g.scale.setScalar(scale);

    // Idle rotation only ramps in during the final phase, then keeps living.
    const idleWeight = Math.max(park, hold * 0.18);
    idle.current += delta * idleWeight * ((Math.PI * 2) / 10);

    // Europe/Africa face the camera at p = 0 (texture centered on 0deg lon).
    const scrollY = BASE_Y + emerge * 180 * DEG + hold * 145 * DEG + park * 110 * DEG;
    m.rotation.y = scrollY + idle.current;
    m.rotation.x = emerge * 9 * DEG + Math.sin(idle.current * 0.45) * 0.025;
    m.rotation.z = -6 * DEG * park + Math.cos(idle.current * 0.33) * 0.018;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry} material={material} />
    </group>
  );
}
