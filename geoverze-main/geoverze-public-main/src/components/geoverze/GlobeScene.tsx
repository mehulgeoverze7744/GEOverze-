import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

import { BronzeGlobe } from "./BronzeGlobe";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function CameraRig({ progress }: { progress: RefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = progress.current ?? 0;
    const inClose = easeInOut(THREE.MathUtils.clamp((p - 0.35) / 0.4, 0, 1));
    const target = THREE.MathUtils.lerp(6.2, 5.1, inClose);
    camera.position.z += (target - camera.position.z) * 0.08;
    camera.position.y += (Math.sin(p * Math.PI) * 0.12 - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * Warm studio environment generated in-code (no HDRI download). Reproduces the
 * previous preset's bronze-leaning reflections at a fraction of the cost.
 */
function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, "#4b423b");
    grad.addColorStop(0.42, "#9b8471");
    grad.addColorStop(0.62, "#2b2622");
    grad.addColorStop(1, "#0b0a09");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const source = new THREE.CanvasTexture(canvas);
    source.mapping = THREE.EquirectangularReflectionMapping;
    source.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(source);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      source.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Scene({ progress }: { progress: RefObject<number> }) {
  const { viewport, size } = useThree();
  const mobile = size.width < 768;

  const layout = useMemo(() => {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    // The hero emblem sits below the navbar on the left; the globe inside it is ~40% of it.
    const pxToWorld = viewport.width / Math.max(size.width, 1);
    const emblem = mobile ? 104 : 150;
    const inset = mobile ? 24 : 48;
    const navOffset = mobile ? 92 : 108;
    const originX = -halfW + (inset + emblem / 2) * pxToWorld;
    const originY = halfH - (navOffset + emblem / 2) * pxToWorld;
    return {
      origin: [originX, originY] as [number, number],
      parked: [mobile ? 0 : halfW * 0.46, mobile ? halfH * 0.28 : 0] as [number, number],
      startScale: emblem * 0.2 * pxToWorld,
      bigScale: Math.min(halfW, halfH) * (mobile ? 0.86 : 0.9),
      finalScale: Math.min(halfW, halfH) * (mobile ? 0.55 : 0.6),
    };
  }, [viewport.width, viewport.height, size.width, mobile]);

  return (
    <>
      <CameraRig progress={progress} />
      <ambientLight intensity={0.34} />
      {/* soft key light */}
      <directionalLight position={[4, 5, 6]} intensity={3.8} color="#ffe0b8" />
      {/* bronze rim light */}
      <directionalLight position={[-6, 2, -4]} intensity={2.4} color="#b8763a" />
      {/* dim fill */}
      <pointLight position={[0, -4, 4]} intensity={6} distance={22} color="#5a687a" />
      <StudioEnvironment />
      <BronzeGlobe progress={progress} {...layout} />
    </>
  );
}

/**
 * Renders only while the hero is on screen and the tab is visible: outside of
 * that the render loop is switched off entirely rather than burning frames.
 */
function useRenderGate(hostRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    let visible = !document.hidden;
    let onScreen = true;
    const sync = () => setActive(visible && onScreen);

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(node);

    const onVisibility = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hostRef]);

  return active;
}

export default function GlobeScene({ progress }: { progress: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  const active = useRenderGate(host);

  return (
    <div ref={host} aria-hidden className="absolute inset-0">
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          alpha: true,
        }}
        shadows={false}
        camera={{ fov: 42, position: [0, 0, 6.2], near: 0.1, far: 60 }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.shadowMap.enabled = false;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  );
}
