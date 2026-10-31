import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

import { BronzeGlobe } from "./BronzeGlobe";
import { EARTH_SUN_POSITION } from "./earthGlobeAssets";
import { HeroAstronaut } from "./HeroAstronaut";

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
 * Pale lunar studio, generated in-code. Reflections pick up the same cool
 * blue-white as the homepage sky instead of a dark bronze room.
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
    grad.addColorStop(0, "#f4f8fb");
    grad.addColorStop(0.38, "#d5e6f2");
    grad.addColorStop(0.68, "#9ebcd2");
    grad.addColorStop(1, "#e7f1f8");
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
      <ambientLight intensity={0.52} color="#e7f2f8" />
      <hemisphereLight args={["#eef6fb", "#b7cfe0", 0.62]} />
      {/* sun key — direction shared with the Earth day/night shader */}
      <directionalLight position={[...EARTH_SUN_POSITION]} intensity={2.75} color="#f4f7fb" />
      {/* cool rim so the limb matches the lunar sky */}
      <directionalLight position={[-5, 1.4, -3.5]} intensity={0.9} color="#d7e8f4" />
      <pointLight position={[0, -3.5, 4]} intensity={1.5} distance={24} color="#c9dceb" />
      <StudioEnvironment />
      <BronzeGlobe progress={progress} {...layout} />
      <HeroAstronaut progress={progress} />
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
        dpr={[1, 2]}
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
          gl.toneMappingExposure = 1.18;
        }}
      >
        <Scene progress={progress} />
      </Canvas>
    </div>
  );
}
