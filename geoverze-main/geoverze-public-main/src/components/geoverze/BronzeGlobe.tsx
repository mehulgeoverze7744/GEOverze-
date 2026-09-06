import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { EARTH_SUN_POSITION, earthGlobeTextures } from "./earthGlobeAssets";
import {
  configureEarthColorMap,
  configureCloudMaskMap,
  configureEarthDataMap,
} from "./earthTextureUtils";

const DEG = Math.PI / 180;
/** Rotates the texture so the Americas face the camera at progress 0. */
const BASE_Y = 90 * DEG;

const SUN = new THREE.Vector3(...EARTH_SUN_POSITION);

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

const cloudVertexShader = /* glsl */ `
varying vec2 vCloudUv;
varying vec3 vWorldNormal;
void main() {
  vCloudUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cloudFragmentShader = /* glsl */ `
uniform sampler2D cloudMap;
uniform vec3 sunPosition;
uniform float cloudOpacity;
varying vec2 vCloudUv;
varying vec3 vWorldNormal;

float softBand(float x, float lo, float hi, float fade) {
  float a = smoothstep(lo, lo + fade, x);
  float b = 1.0 - smoothstep(hi - fade, hi, x);
  return a * b;
}

// Low-frequency warp so regional falloff is irregular, not a rectangle or circle
float weatherWarp(vec2 uv) {
  return 0.022 * sin(uv.y * 17.0 + uv.x * 8.4)
       + 0.016 * sin(uv.x * 13.0 - uv.y * 10.2)
       + 0.010 * sin((uv.x + uv.y) * 21.0);
}

// Amazon Basin / northern South America (~85°W–35°W, 16°S–8°N)
float tropicalAmazon(vec2 uv) {
  float w = weatherWarp(uv);
  float lon = softBand(uv.x + w * 0.55, 0.248, 0.412, 0.062);
  float lat = softBand(uv.y - w * 0.40, 0.400, 0.555, 0.055);
  return pow(lon * lat, 0.85);
}

// Maritime Southeast Asia / Indonesia (~92°E–155°E, 12°S–20°N)
float tropicalSeAsia(vec2 uv) {
  float w = weatherWarp(uv.yx * 1.07);
  float lon = softBand(uv.x - w * 0.50, 0.745, 0.932, 0.068);
  float lat = softBand(uv.y + w * 0.38, 0.430, 0.618, 0.058);
  return pow(lon * lat, 0.85);
}

// Soft equatorial humid belt — broad, feathered, not painted
float equatorialHumid(vec2 uv) {
  float w = weatherWarp(uv * 1.03);
  return softBand(uv.y + w * 0.35, 0.355, 0.645, 0.095);
}

void main() {
  vec3 cloudRgb = texture2D(cloudMap, vCloudUv).rgb;
  float cloudMask = dot(cloudRgb, vec3(0.299, 0.587, 0.114));

  float amazon = tropicalAmazon(vCloudUv);
  float seAsia = tropicalSeAsia(vCloudUv);
  float equatorial = equatorialHumid(vCloudUv);
  float tropical = max(max(amazon, seAsia), equatorial * 0.40);

  // ~50% target — include more texture wisps; suppress low haze via discard
  float discardFloor = mix(0.036, 0.015, tropical);
  if (cloudMask < discardFloor) discard;

  float coverage = smoothstep(0.038, 0.44, cloudMask);
  coverage = pow(coverage, 0.94);

  float mass = smoothstep(0.06, 0.40, cloudMask);
  float regional = 1.0 + tropical * 0.72 * mass;
  coverage = min(coverage * regional, 1.0);

  vec3 sunDir = normalize(sunPosition);
  float cosAngle = dot(normalize(vWorldNormal), sunDir);
  float dayFactor = smoothstep(-0.18, 0.28, cosAngle);

  float sunLit = clamp(cosAngle * 0.26 + 0.58, 0.42, 0.94);
  vec3 dayBright = vec3(0.91, 0.94, 0.97) * sunLit;
  vec3 dayShadow = vec3(0.40, 0.44, 0.50) * sunLit * 0.76;
  float thickness = mass * coverage;
  float interior = thickness * mix(0.32, 0.82, tropical);
  vec3 dayCloud = mix(dayBright, dayShadow, interior);
  dayCloud = mix(dayCloud, dayBright * 1.05, clamp(cosAngle, 0.0, 1.0) * thickness * 0.32);

  vec3 nightCloud = vec3(0.028, 0.033, 0.040);
  vec3 color = mix(nightCloud, dayCloud, dayFactor);

  float densityAlpha = mix(0.08, 0.42, pow(coverage, 0.88));
  densityAlpha *= mix(1.0, 1.50, tropical * mass);
  float alpha = densityAlpha * mix(0.18, 0.76, dayFactor) * cloudOpacity;
  if (alpha < 0.005) discard;

  gl_FragColor = vec4(color, alpha);
}
`;

const atmosphereVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = /* glsl */ `
uniform vec3 glowColor;
uniform vec3 sunPosition;
uniform float glowStrength;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 outwardNormal = -normalize(vWorldNormal);
  float rim = pow(clamp(1.0 - dot(outwardNormal, viewDir), 0.0, 1.0), 2.55);
  float sunFacing = clamp(dot(outwardNormal, normalize(sunPosition)), 0.0, 1.0);
  float dayRim = pow(sunFacing, 0.95);
  float intensity = rim * (0.2 + dayRim * 0.34) * glowStrength;
  gl_FragColor = vec4(glowColor, intensity);
}
`;

type Props = {
  progress: RefObject<number>;
  origin: [number, number];
  parked: [number, number];
  startScale: number;
  bigScale: number;
  finalScale: number;
};

export function BronzeGlobe({ progress, origin, parked, startScale, bigScale, finalScale }: Props) {
  const group = useRef<THREE.Group>(null);
  const rotator = useRef<THREE.Group>(null);
  const idle = useRef(0);

  const mobile = useThree((state) => state.size.width < 768);
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const textureUrls = useMemo(() => earthGlobeTextures(mobile), [mobile]);

  const [dayMap, nightMap, bumpMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    textureUrls.day,
    textureUrls.night,
    textureUrls.bump,
    textureUrls.clouds,
  ]);

  useEffect(() => {
    configureEarthColorMap(dayMap, maxAnisotropy);
    configureEarthColorMap(nightMap, maxAnisotropy);
    configureEarthDataMap(bumpMap, maxAnisotropy);
    configureCloudMaskMap(cloudsMap, maxAnisotropy);
  }, [bumpMap, cloudsMap, dayMap, maxAnisotropy, nightMap]);

  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      map: dayMap,
      bumpMap: bumpMap,
      bumpScale: 0.012,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: 0.22,
      transparent: true,
      opacity: 0,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.tNight = { value: nightMap };
      shader.uniforms.sunPosition = { value: SUN.clone() };

      shader.vertexShader = `varying vec3 vWorldNormal;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        uniform sampler2D tNight;
        uniform vec3 sunPosition;
        varying vec3 vWorldNormal;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        vec3 sunDir = normalize(sunPosition);
        float cosAngle = dot(normalize(vWorldNormal), sunDir);
        float nightMix = 1.0 - smoothstep(-0.22, 0.26, cosAngle);

        vec3 dayColor = diffuseColor.rgb;
        vec3 nightTex = texture2D(tNight, vMapUv).rgb;
        float cityLuma = dot(nightTex, vec3(0.299, 0.587, 0.114));

        vec3 darkBase = dayColor * 0.018;
        vec3 warmLight = nightTex * vec3(1.04, 0.9, 0.64);
        vec3 cityGlow = warmLight * (0.65 + cityLuma * 5.2);
        float cityMask = smoothstep(0.006, 0.048, cityLuma);
        vec3 nightColor = mix(darkBase, cityGlow, cityMask);

        diffuseColor.rgb = mix(dayColor, nightColor, nightMix);`,
      );

      material.userData.shader = shader;
    };

    material.customProgramCacheKey = () => "earth-day-night-v3";

    return material;
  }, [dayMap, nightMap, bumpMap]);

  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        cloudMap: { value: cloudsMap },
        sunPosition: { value: SUN.clone() },
        cloudOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [cloudsMap]);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        glowColor: { value: new THREE.Color("#8fd4ff") },
        sunPosition: { value: SUN.clone() },
        glowStrength: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
  }, []);

  const earthGeometry = useMemo(() => new THREE.SphereGeometry(1, 96, 96), []);
  const cloudGeometry = useMemo(() => new THREE.SphereGeometry(1.006, 96, 96), []);
  const atmosphereGeometry = useMemo(() => new THREE.SphereGeometry(1.034, 72, 72), []);

  useEffect(
    () => () => {
      earthGeometry.dispose();
      cloudGeometry.dispose();
      atmosphereGeometry.dispose();
      earthMaterial.dispose();
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
      dayMap.dispose();
      nightMap.dispose();
      bumpMap.dispose();
      cloudsMap.dispose();
    },
    [
      atmosphereGeometry,
      atmosphereMaterial,
      bumpMap,
      cloudGeometry,
      cloudMaterial,
      cloudsMap,
      dayMap,
      earthGeometry,
      earthMaterial,
      nightMap,
    ],
  );

  useFrame((_, delta) => {
    const g = group.current;
    const r = rotator.current;
    if (!g || !r) return;

    const p = progress.current ?? 0;

    const emerge = easeInOut(phase(p, 0, 0.4));
    const park = easeInOut(phase(p, 0.7, 1));
    const hold = phase(p, 0.4, 0.7);
    const reveal = easeInOut(phase(p, 0.05, 0.18));

    earthMaterial.opacity = reveal;
    cloudMaterial.uniforms.cloudOpacity.value = reveal;
    atmosphereMaterial.uniforms.glowStrength.value = reveal * 0.78;
    r.visible = reveal > 0.001;

    const cx = THREE.MathUtils.lerp(origin[0], 0, emerge);
    const cy = THREE.MathUtils.lerp(origin[1], 0, emerge);
    g.position.x = THREE.MathUtils.lerp(cx, parked[0], park);
    g.position.y = THREE.MathUtils.lerp(cy, parked[1], park);

    const grown = THREE.MathUtils.lerp(startScale, bigScale, emerge);
    const scale = THREE.MathUtils.lerp(grown, finalScale, park);
    g.scale.setScalar(scale);

    const idleWeight = Math.max(park, hold * 0.18);
    idle.current += delta * idleWeight * ((Math.PI * 2) / 10);

    const scrollY = BASE_Y + emerge * 180 * DEG + hold * 145 * DEG + park * 110 * DEG;
    r.rotation.y = scrollY + idle.current;
    r.rotation.x = emerge * 9 * DEG + Math.sin(idle.current * 0.45) * 0.025;
    r.rotation.z = -6 * DEG * park + Math.cos(idle.current * 0.33) * 0.018;

    const earthShader = earthMaterial.userData.shader as
      { uniforms: { sunPosition: { value: THREE.Vector3 } } } | undefined;
    if (earthShader) earthShader.uniforms.sunPosition.value.copy(SUN);
    cloudMaterial.uniforms.sunPosition.value.copy(SUN);
    atmosphereMaterial.uniforms.sunPosition.value.copy(SUN);
  });

  return (
    <group ref={group}>
      <group ref={rotator}>
        <mesh geometry={earthGeometry} material={earthMaterial} />
        <mesh geometry={cloudGeometry} material={cloudMaterial} />
        <mesh geometry={atmosphereGeometry} material={atmosphereMaterial} />
      </group>
    </group>
  );
}
