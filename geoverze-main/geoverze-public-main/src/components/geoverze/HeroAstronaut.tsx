import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * GVRZE astronaut for the home hero.
 *
 * The project ships no rigged character asset, so the figure is an articulated
 * three.js model built to the brand reference: rounded helmet with a silver
 * visor ring and side pods, padded segmented sleeves, chest equipment panel
 * with GVRZE plate and black harness straps, backpack, buckled belt, gloves
 * with articulated fingers, knee pads and strapped boots. Every limb is its
 * own pivot (shoulder → elbow → wrist → fingers, hip → knee) so the animation
 * drives real joints.
 *
 * Timeline (seconds after the hero scene first renders):
 *   0.0 – 1.6  entrance from beyond the bottom-right edge, pop + turn to camera
 *   1.75 – 4.9 raise right arm, wave three times, lower
 *   always     slow float, bob, drift and secondary arm motion
 *
 * It lives inside the globe Canvas so it shares the renderer, lights, render
 * gate and environment. It slides out as the globe takes over the frame.
 *
 * To swap in a rigged GLB later, keep the same pivot names and drive the
 * bones from the same pose values computed in useFrame.
 */

const DEG = Math.PI / 180;

/* Model extents in model units (hips at y = 0). */
const MODEL_TOP = 1.3;
const MODEL_FEET = -1.08;
const MODEL_HEIGHT = MODEL_TOP - MODEL_FEET;
const MODEL_CENTER = (MODEL_TOP + MODEL_FEET) / 2;

/*
 * Resting three-quarter stance: body toward the hero centre, helmet to camera.
 * The figure sits right of the camera axis, so ~0.37 rad of its yaw is eaten
 * by perspective; these values give a visible three-quarter turn on screen.
 */
const BODY_YAW = -0.75;
const HEAD_YAW = 0.45;

const ENTRANCE_DURATION = 1.6;
const WAVE_START = 1.75;
const WAVE_RAISE = 0.55;
const WAVE_HOLD = 1.9;
const WAVE_LOWER = 0.7;
const WAVE_HZ = 1.55;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** GVRZE wordmark decal, drawn once to a canvas. */
function makeBrandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f1115";
    ctx.font = "700 108px 'Montserrat', 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "12px";
    ctx.fillText("GVRZE", canvas.width / 2 + 6, canvas.height / 2 + 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Fine woven grain used as a bump map so the suit reads as fabric, not plastic. */
function makeFabricTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const weave = (Math.sin(x * 1.9) + Math.sin(y * 1.9)) * 10;
        const grain = (Math.random() - 0.5) * 42;
        const v = 128 + weave + grain;
        const i = (y * size + x) * 4;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.anisotropy = 4;
  return tex;
}

type Mats = {
  suit: THREE.MeshStandardMaterial;
  shell: THREE.MeshPhysicalMaterial;
  plate: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  visor: THREE.MeshPhysicalMaterial;
  brand: THREE.MeshBasicMaterial;
};

type Geo = ReturnType<typeof makeGeometry>;

function makeGeometry() {
  return {
    helmet: new THREE.SphereGeometry(0.3, 56, 40),
    visor: new THREE.SphereGeometry(0.272, 56, 40),
    visorRing: new THREE.TorusGeometry(0.252, 0.014, 12, 64),
    sidePod: new THREE.CylinderGeometry(0.055, 0.055, 0.035, 28),
    sidePodCore: new THREE.CylinderGeometry(0.03, 0.03, 0.04, 20),
    helmetCam: new THREE.BoxGeometry(0.07, 0.035, 0.06),
    neckRing: new THREE.TorusGeometry(0.205, 0.03, 14, 48),
    neckSeal: new THREE.CylinderGeometry(0.2, 0.22, 0.08, 36),
    torso: new THREE.CapsuleGeometry(0.27, 0.3, 10, 32),
    pelvis: new THREE.CapsuleGeometry(0.21, 0.12, 8, 28),
    chestPanel: new THREE.BoxGeometry(0.36, 0.22, 0.1),
    chestBrand: new THREE.PlaneGeometry(0.26, 0.081),
    chestButton: new THREE.CylinderGeometry(0.016, 0.016, 0.02, 14),
    chestSlot: new THREE.BoxGeometry(0.12, 0.022, 0.015),
    strap: new THREE.BoxGeometry(0.065, 0.62, 0.02),
    strapBuckle: new THREE.BoxGeometry(0.075, 0.05, 0.03),
    belt: new THREE.BoxGeometry(0.66, 0.075, 0.44),
    beltBuckle: new THREE.BoxGeometry(0.09, 0.05, 0.03),
    pouch: new THREE.BoxGeometry(0.1, 0.14, 0.1),
    backpack: new THREE.BoxGeometry(0.52, 0.6, 0.24),
    backpackTop: new THREE.CylinderGeometry(0.12, 0.12, 0.52, 24, 1, false, 0, Math.PI),
    backPanel: new THREE.BoxGeometry(0.44, 0.1, 0.03),
    shoulderPad: new THREE.SphereGeometry(0.135, 28, 20),
    upperArm: new THREE.CapsuleGeometry(0.1, 0.24, 8, 24),
    sleeveRib: new THREE.TorusGeometry(0.1, 0.012, 10, 36),
    armBrand: new THREE.PlaneGeometry(0.15, 0.047),
    elbowPad: new THREE.SphereGeometry(0.105, 24, 16),
    forearm: new THREE.CapsuleGeometry(0.088, 0.22, 8, 24),
    cuffRing: new THREE.TorusGeometry(0.092, 0.014, 10, 36),
    cuff: new THREE.CylinderGeometry(0.09, 0.095, 0.07, 24),
    palm: new THREE.BoxGeometry(0.12, 0.12, 0.055),
    finger: new THREE.CapsuleGeometry(0.017, 0.055, 4, 10),
    thumb: new THREE.CapsuleGeometry(0.018, 0.045, 4, 10),
    thigh: new THREE.CapsuleGeometry(0.13, 0.28, 8, 24),
    thighPocket: new THREE.BoxGeometry(0.04, 0.16, 0.12),
    kneePad: new THREE.SphereGeometry(0.115, 24, 16),
    shin: new THREE.CapsuleGeometry(0.105, 0.24, 8, 24),
    shinRib: new THREE.TorusGeometry(0.105, 0.012, 10, 36),
    boot: new THREE.BoxGeometry(0.22, 0.17, 0.32),
    bootToe: new THREE.CylinderGeometry(0.11, 0.11, 0.22, 20, 1, false, 0, Math.PI),
    bootStrap: new THREE.BoxGeometry(0.235, 0.035, 0.335),
    sole: new THREE.BoxGeometry(0.23, 0.05, 0.34),
  };
}

type ArmProps = {
  side: 1 | -1;
  mats: Mats;
  geo: Geo;
  shoulderRef: RefObject<THREE.Group | null>;
  elbowRef: RefObject<THREE.Group | null>;
  wristRef: RefObject<THREE.Group | null>;
  fingersRef: RefObject<THREE.Group | null>;
  patch?: boolean;
};

function Arm({ side, mats, geo, shoulderRef, elbowRef, wristRef, fingersRef, patch }: ArmProps) {
  return (
    <group ref={shoulderRef} position={[side * 0.4, 0.56, 0]}>
      <mesh geometry={geo.shoulderPad} material={mats.suit} />
      <mesh geometry={geo.upperArm} material={mats.suit} position={[0, -0.2, 0]} />
      <mesh geometry={geo.sleeveRib} material={mats.plate} position={[0, -0.13, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geo.sleeveRib} material={mats.plate} position={[0, -0.27, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {patch ? (
        <mesh geometry={geo.armBrand} material={mats.brand} position={[0, -0.2, 0.102]} />
      ) : null}
      <group ref={elbowRef} position={[0, -0.42, 0]}>
        <mesh geometry={geo.elbowPad} material={mats.rubber} scale={[1, 1, 0.85]} />
        <mesh geometry={geo.forearm} material={mats.suit} position={[0, -0.17, 0]} />
        <mesh geometry={geo.sleeveRib} material={mats.plate} position={[0, -0.26, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 0.9, 1]} />
        <group ref={wristRef} position={[0, -0.35, 0]}>
          <mesh geometry={geo.cuffRing} material={mats.metal} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.cuff} material={mats.dark} position={[0, -0.03, 0]} />
          <mesh geometry={geo.palm} material={mats.dark} position={[0, -0.12, 0]} />
          <group ref={fingersRef} position={[0, -0.18, 0.005]}>
            {[-0.042, -0.014, 0.014, 0.042].map((x) => (
              <mesh key={x} geometry={geo.finger} material={mats.dark} position={[x, -0.035, 0]} />
            ))}
          </group>
          <mesh
            geometry={geo.thumb}
            material={mats.dark}
            position={[side * -0.07, -0.1, 0.015]}
            rotation={[0.3, 0, side * 0.9]}
          />
        </group>
      </group>
    </group>
  );
}

type LegProps = {
  side: 1 | -1;
  mats: Mats;
  geo: Geo;
  hipRef: RefObject<THREE.Group | null>;
  kneeRef: RefObject<THREE.Group | null>;
};

function Leg({ side, mats, geo, hipRef, kneeRef }: LegProps) {
  return (
    <group ref={hipRef} position={[side * 0.15, -0.06, 0]}>
      <mesh geometry={geo.thigh} material={mats.suit} position={[0, -0.22, 0]} />
      <mesh geometry={geo.thighPocket} material={mats.plate} position={[side * 0.125, -0.24, 0.02]} />
      <group ref={kneeRef} position={[0, -0.47, 0]}>
        <mesh geometry={geo.kneePad} material={mats.rubber} position={[0, 0, 0.02]} scale={[1, 1.05, 0.85]} />
        <mesh geometry={geo.shin} material={mats.suit} position={[0, -0.2, 0]} />
        <mesh geometry={geo.shinRib} material={mats.plate} position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={geo.boot} material={mats.suit} position={[0, -0.47, 0.04]} />
        <mesh geometry={geo.bootToe} material={mats.suit} position={[0, -0.5, 0.2]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.9]} />
        <mesh geometry={geo.bootStrap} material={mats.dark} position={[0, -0.43, 0.04]} />
        <mesh geometry={geo.sole} material={mats.rubber} position={[0, -0.56, 0.05]} />
      </group>
    </group>
  );
}

type Props = {
  progress: RefObject<number>;
};

export function HeroAstronaut({ progress }: Props) {
  const { viewport, size } = useThree();
  const mobile = size.width < 768;

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const upperBody = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rShoulder = useRef<THREE.Group>(null);
  const rElbow = useRef<THREE.Group>(null);
  const rWrist = useRef<THREE.Group>(null);
  const rFingers = useRef<THREE.Group>(null);
  const lShoulder = useRef<THREE.Group>(null);
  const lElbow = useRef<THREE.Group>(null);
  const lWrist = useRef<THREE.Group>(null);
  const lFingers = useRef<THREE.Group>(null);
  const lHip = useRef<THREE.Group>(null);
  const rHip = useRef<THREE.Group>(null);
  const lKnee = useRef<THREE.Group>(null);
  const rKnee = useRef<THREE.Group>(null);
  const rimLight = useRef<THREE.PointLight>(null);
  const fillLight = useRef<THREE.PointLight>(null);

  const time = useRef(0);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const textures = useMemo(() => ({ brand: makeBrandTexture(), fabric: makeFabricTexture() }), []);

  const mats = useMemo<Mats>(
    () => ({
      suit: new THREE.MeshStandardMaterial({
        color: "#cfd6de",
        roughness: 0.94,
        metalness: 0.0,
        bumpMap: textures.fabric,
        bumpScale: 0.008,
        envMapIntensity: 0.25,
      }),
      shell: new THREE.MeshPhysicalMaterial({
        color: "#e3e7ec",
        roughness: 0.42,
        metalness: 0.05,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.6,
      }),
      plate: new THREE.MeshStandardMaterial({
        color: "#b4bcc6",
        roughness: 0.58,
        metalness: 0.12,
        envMapIntensity: 0.5,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#1d2025",
        roughness: 0.62,
        metalness: 0.1,
        envMapIntensity: 0.5,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: "#15181c",
        roughness: 0.78,
        metalness: 0.02,
        envMapIntensity: 0.35,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: "#c6ccd4",
        roughness: 0.3,
        metalness: 0.9,
        envMapIntensity: 1.1,
      }),
      visor: new THREE.MeshPhysicalMaterial({
        color: "#05070a",
        roughness: 0.06,
        metalness: 0.45,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.6,
      }),
      brand: new THREE.MeshBasicMaterial({
        map: textures.brand,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    }),
    [textures],
  );

  const geo = useMemo(makeGeometry, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      textures.brand.dispose();
      textures.fabric.dispose();
    },
    [geo, mats, textures],
  );

  const layout = useMemo(() => {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    // Sized against the viewport height, capped by width so portrait tablets
    // do not get a figure that crowds the hero copy and scroll cue.
    const height = Math.min(
      viewport.height * (mobile ? 0.36 : 0.46),
      viewport.width * (mobile ? 0.7 : 0.42),
    );
    const scale = height / MODEL_HEIGHT;
    // Centre of the right third, boots fully inside the frame.
    const x = mobile ? halfW * 0.5 : halfW * 0.56;
    const y = -halfH + height / 2 + viewport.height * 0.03;
    return {
      scale,
      height,
      target: new THREE.Vector3(x, y, 0),
      start: new THREE.Vector3(x + height * 0.6, y - height * 1.4, 0),
      rim: new THREE.Vector3(x + height * 0.35, y + height * 0.5, -height * 0.5),
      fill: new THREE.Vector3(x - height * 0.55, y + height * 0.15, height * 0.95),
      lightReach: height * 1.7,
    };
  }, [viewport.width, viewport.height, mobile]);

  useFrame((_, delta) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;

    time.current += Math.min(delta, 0.05);
    const t = reduced ? WAVE_START + WAVE_RAISE + WAVE_HOLD + WAVE_LOWER + 1 : time.current;
    const idle = reduced ? 0 : 1;

    // Hand the frame to the globe as it grows.
    const p = progress.current ?? 0;
    const vis = 1 - smoothstep(0.06, 0.3, p);
    g.visible = vis > 0.001;
    if (rimLight.current) rimLight.current.intensity = 2.2 * vis;
    if (fillLight.current) fillLight.current.intensity = 1.0 * vis;
    if (!g.visible) return;

    // Entrance.
    const u = clamp01(t / ENTRANCE_DURATION);
    const move = easeOutCubic(u);
    const pop = 0.8 + 0.2 * easeOutBack(u);
    const bodyTurn = smoothstep(0.15, 0.92, u);
    const torsoTurn = smoothstep(0.45, 1, u);
    const headTurn = smoothstep(0.58, 1, u);

    g.position.lerpVectors(layout.start, layout.target, move);
    g.position.y -= (1 - vis) * layout.height * 1.3;
    g.scale.setScalar(layout.scale * pop);

    // Float / drift.
    const floatY = Math.sin(t * 0.9) * 0.04 * idle;
    b.position.set(0, -MODEL_CENTER + floatY, 0);
    b.rotation.set(
      Math.sin(t * 0.33) * 0.015 * idle + (1 - move) * 0.25,
      THREE.MathUtils.lerp(0.9, BODY_YAW, bodyTurn) + Math.sin(t * 0.41) * 0.05 * idle,
      Math.sin(t * 0.57) * 0.02 * idle - (1 - move) * 0.35,
    );

    if (upperBody.current) {
      upperBody.current.rotation.y = THREE.MathUtils.lerp(0.4, 0.08, torsoTurn) + Math.sin(t * 0.47) * 0.02 * idle;
      upperBody.current.rotation.x = Math.sin(t * 0.52 + 1.2) * 0.012 * idle;
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(0.6, HEAD_YAW, headTurn) + Math.sin(t * 0.5) * 0.04 * idle;
      head.current.rotation.x = THREE.MathUtils.lerp(0.12, -0.02, headTurn) + Math.sin(t * 0.43 + 0.7) * 0.025 * idle;
    }

    // Wave with the right arm (model −X, screen-left when facing the camera):
    // shoulder raises, elbow folds, forearm + wrist swing, fingers open.
    const waveUp = WAVE_START + WAVE_RAISE;
    const waveDown = waveUp + WAVE_HOLD;
    const raise = smoothstep(WAVE_START, waveUp, t) * (1 - smoothstep(waveDown, waveDown + WAVE_LOWER, t));
    const swingWindow = smoothstep(waveUp - 0.2, waveUp + 0.15, t) * (1 - smoothstep(waveDown - 0.25, waveDown + 0.1, t));
    const swing = Math.sin((t - waveUp) * Math.PI * 2 * WAVE_HZ) * swingWindow;

    const rRestZ = -0.17 - Math.sin(t * 0.8) * 0.035 * idle;
    const rRestElbowX = -0.3 + Math.sin(t * 0.7 + 1) * 0.045 * idle;
    if (rShoulder.current) {
      rShoulder.current.rotation.z = THREE.MathUtils.lerp(rRestZ, -146 * DEG, raise);
      rShoulder.current.rotation.x = THREE.MathUtils.lerp(-0.06, -0.48, raise);
    }
    if (rElbow.current) {
      rElbow.current.rotation.z = THREE.MathUtils.lerp(0, -(0.82 + swing * 0.36), raise);
      rElbow.current.rotation.x = THREE.MathUtils.lerp(rRestElbowX, -0.08, raise);
    }
    if (rWrist.current) {
      rWrist.current.rotation.z = -swing * 0.28 * raise;
      rWrist.current.rotation.y = THREE.MathUtils.lerp(0, 0.35, raise);
    }
    if (rFingers.current) {
      rFingers.current.rotation.x = THREE.MathUtils.lerp(-0.55, -0.08, raise);
    }

    // Left arm (model +X) rests with secondary motion, fingers relaxed.
    if (lShoulder.current) {
      lShoulder.current.rotation.z = 0.17 + Math.sin(t * 0.8 + 0.6) * 0.035 * idle;
      lShoulder.current.rotation.x = -0.06 + Math.sin(t * 0.63) * 0.025 * idle;
    }
    if (lElbow.current) {
      lElbow.current.rotation.x = -0.32 + Math.sin(t * 0.7 + 2.1) * 0.045 * idle;
    }
    if (lWrist.current) {
      lWrist.current.rotation.x = -0.1 + Math.sin(t * 0.9 + 0.4) * 0.03 * idle;
    }
    if (lFingers.current) {
      lFingers.current.rotation.x = -0.55 + Math.sin(t * 0.75) * 0.04 * idle;
    }

    // Legs: relaxed standing stance with a slow sway.
    const legSway = Math.sin(t * 0.6) * 0.025 * idle;
    if (lHip.current) {
      lHip.current.rotation.x = -0.1 + legSway;
      lHip.current.rotation.z = 0.05;
    }
    if (rHip.current) {
      rHip.current.rotation.x = -0.07 - legSway;
      rHip.current.rotation.z = -0.05;
    }
    if (lKnee.current) lKnee.current.rotation.x = 0.2 - legSway * 0.5;
    if (rKnee.current) rKnee.current.rotation.x = 0.16 + legSway * 0.5;
  });

  return (
    <>
      <pointLight
        ref={rimLight}
        position={layout.rim}
        color="#b9d9f6"
        intensity={2.2}
        distance={layout.lightReach}
        decay={2}
      />
      <pointLight
        ref={fillLight}
        position={layout.fill}
        color="#eef5fb"
        intensity={1.0}
        distance={layout.lightReach}
        decay={2}
      />

      <group ref={root} visible={false}>
        <group ref={body}>
          {/* pelvis, belt, buckles and pouches */}
          <mesh geometry={geo.pelvis} material={mats.suit} position={[0, -0.03, 0]} scale={[1.2, 1, 0.9]} />
          <mesh geometry={geo.belt} material={mats.dark} position={[0, 0.06, 0]} />
          <mesh geometry={geo.beltBuckle} material={mats.metal} position={[0, 0.06, 0.225]} />
          <mesh geometry={geo.beltBuckle} material={mats.plate} position={[-0.16, 0.06, 0.2]} rotation={[0, -0.5, 0]} />
          <mesh geometry={geo.beltBuckle} material={mats.plate} position={[0.16, 0.06, 0.2]} rotation={[0, 0.5, 0]} />
          <mesh geometry={geo.pouch} material={mats.suit} position={[-0.3, -0.04, 0.06]} />
          <mesh geometry={geo.pouch} material={mats.suit} position={[0.3, -0.04, 0.06]} />

          <Leg side={-1} mats={mats} geo={geo} hipRef={lHip} kneeRef={lKnee} />
          <Leg side={1} mats={mats} geo={geo} hipRef={rHip} kneeRef={rKnee} />

          {/* upper body pivots at the waist */}
          <group ref={upperBody} position={[0, 0.08, 0]}>
            <mesh geometry={geo.torso} material={mats.suit} position={[0, 0.3, 0]} scale={[1.32, 1, 0.86]} />

            {/* chest equipment panel */}
            <mesh geometry={geo.chestPanel} material={mats.plate} position={[0, 0.43, 0.2]} />
            <mesh geometry={geo.chestBrand} material={mats.brand} position={[0, 0.46, 0.252]} />
            <mesh geometry={geo.chestSlot} material={mats.dark} position={[0, 0.37, 0.252]} />
            <mesh geometry={geo.chestButton} material={mats.dark} position={[-0.13, 0.37, 0.255]} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={geo.chestButton} material={mats.dark} position={[0.13, 0.37, 0.255]} rotation={[Math.PI / 2, 0, 0]} />

            {/* harness straps from shoulders to belt */}
            <mesh geometry={geo.strap} material={mats.dark} position={[-0.17, 0.33, 0.215]} rotation={[0, 0, 0.12]} />
            <mesh geometry={geo.strap} material={mats.dark} position={[0.17, 0.33, 0.215]} rotation={[0, 0, -0.12]} />
            <mesh geometry={geo.strapBuckle} material={mats.plate} position={[-0.2, 0.58, 0.215]} />
            <mesh geometry={geo.strapBuckle} material={mats.plate} position={[0.2, 0.58, 0.215]} />

            {/* backpack */}
            <mesh geometry={geo.backpack} material={mats.suit} position={[0, 0.3, -0.32]} />
            <mesh geometry={geo.backpackTop} material={mats.suit} position={[0, 0.6, -0.32]} rotation={[0, 0, Math.PI / 2]} />
            <mesh geometry={geo.backPanel} material={mats.dark} position={[0, 0.1, -0.45]} />
            <mesh geometry={geo.backPanel} material={mats.dark} position={[0, 0.42, -0.45]} />

            {/* neck seal */}
            <mesh geometry={geo.neckSeal} material={mats.dark} position={[0, 0.66, 0]} />
            <mesh geometry={geo.neckRing} material={mats.metal} position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]} />

            {/* helmet */}
            <group ref={head} position={[0, 0.95, 0]}>
              <mesh geometry={geo.helmet} material={mats.shell} scale={[1, 1.02, 1]} />
              <mesh geometry={geo.visor} material={mats.visor} position={[0, -0.005, 0.06]} />
              <mesh geometry={geo.visorRing} material={mats.metal} position={[0, -0.005, 0.163]} />
              <mesh geometry={geo.sidePod} material={mats.metal} position={[-0.29, 0.01, 0.03]} rotation={[0, 0, Math.PI / 2]} />
              <mesh geometry={geo.sidePodCore} material={mats.rubber} position={[-0.3, 0.01, 0.03]} rotation={[0, 0, Math.PI / 2]} />
              <mesh geometry={geo.sidePod} material={mats.metal} position={[0.29, 0.01, 0.03]} rotation={[0, 0, Math.PI / 2]} />
              <mesh geometry={geo.sidePodCore} material={mats.rubber} position={[0.3, 0.01, 0.03]} rotation={[0, 0, Math.PI / 2]} />
              <mesh geometry={geo.helmetCam} material={mats.plate} position={[-0.12, 0.26, 0.1]} rotation={[0.5, -0.3, 0]} />
            </group>

            {/* right arm waves; left arm carries the GVRZE patch */}
            <Arm
              side={-1}
              mats={mats}
              geo={geo}
              shoulderRef={rShoulder}
              elbowRef={rElbow}
              wristRef={rWrist}
              fingersRef={rFingers}
            />
            <Arm
              side={1}
              mats={mats}
              geo={geo}
              shoulderRef={lShoulder}
              elbowRef={lElbow}
              wristRef={lWrist}
              fingersRef={lFingers}
              patch
            />
          </group>
        </group>
      </group>
    </>
  );
}
