"use client";

import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

// --- generatory punktów ---
function buildSphereVolume(count: number, R: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;
    let z = Math.random() * 2 - 1;
    const len = Math.hypot(x, y, z) || 1;
    x /= len; y /= len; z /= len;
    const r = Math.cbrt(Math.random()) * R;
    out[i * 3 + 0] = x * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = z * r;
  }
  return out;
}

function sampleEdges(edges: Array<[THREE.Vector3, THREE.Vector3]>, count: number): Float32Array {
  const lens = edges.map(([a, b]) => a.distanceTo(b));
  const total = lens.reduce((s, l) => s + l, 0);
  const alloc = lens.map((l) => Math.max(1, Math.round((l / total) * count)));
  let sum = alloc.reduce((s, n) => s + n, 0);
  while (sum > count) { const i = alloc.indexOf(Math.max(...alloc)); alloc[i]--; sum--; }
  while (sum < count) { const i = alloc.indexOf(Math.max(...alloc)); alloc[i]++; sum++; }

  const out = new Float32Array(count * 3);
  let k = 0;
  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e];
    const n = alloc[e];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const p = new THREE.Vector3().lerpVectors(a, b, t);
      out[k++] = p.x; out[k++] = p.y; out[k++] = p.z;
    }
  }
  return out;
}

function buildCubeWire(count: number, half: number): Float32Array {
  const H = half;
  const V = [
    new THREE.Vector3(-H, -H, -H), new THREE.Vector3( H, -H, -H),
    new THREE.Vector3( H,  H, -H), new THREE.Vector3(-H,  H, -H),
    new THREE.Vector3(-H, -H,  H), new THREE.Vector3( H, -H,  H),
    new THREE.Vector3( H,  H,  H), new THREE.Vector3(-H,  H,  H),
  ];
  const E: Array<[THREE.Vector3, THREE.Vector3]> = [
    [V[0], V[1]],[V[1], V[2]],[V[2], V[3]],[V[3], V[0]],
    [V[4], V[5]],[V[5], V[6]],[V[6], V[7]],[V[7], V[4]],
    [V[0], V[4]],[V[1], V[5]],[V[2], V[6]],[V[3], V[7]],
  ];
  return sampleEdges(E, count);
}

function buildTetraWire(count: number, R: number): Float32Array {
  const v0 = new THREE.Vector3( 1,  1,  1).normalize().multiplyScalar(R);
  const v1 = new THREE.Vector3(-1, -1,  1).normalize().multiplyScalar(R);
  const v2 = new THREE.Vector3(-1,  1, -1).normalize().multiplyScalar(R);
  const v3 = new THREE.Vector3( 1, -1, -1).normalize().multiplyScalar(R);
  const E: Array<[THREE.Vector3, THREE.Vector3]> = [
    [v0, v1],[v0, v2],[v0, v3],
    [v1, v2],[v1, v3],
    [v2, v3],
  ];
  return sampleEdges(E, count);
}

// --- komponent punktów ---
export default function ParticleMorph({
  progress,
  count = 16000,
  radius = 0.6,
}: {
  progress: number;
  count?: number;
  radius?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material, uniforms } = useMemo(() => {
    const sphere = buildSphereVolume(count, radius);
    const cube   = buildCubeWire(count, radius / Math.SQRT2);
    const tetra  = buildTetraWire(count, radius * 1.15);

    const rand = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      let rx = Math.random() * 2 - 1, ry = Math.random() * 2 - 1, rz = Math.random() * 2 - 1;
      const ln = Math.max(1e-6, Math.hypot(rx, ry, rz));
      rand[i * 3 + 0] = rx / ln; rand[i * 3 + 1] = ry / ln; rand[i * 3 + 2] = rz / ln;
      seed[i] = Math.random();
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geom.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
    geom.setAttribute("aCube",   new THREE.BufferAttribute(cube,   3));
    geom.setAttribute("aTetra",  new THREE.BufferAttribute(tetra,  3));
    geom.setAttribute("aRand",   new THREE.BufferAttribute(rand,   3));
    geom.setAttribute("aSeed",   new THREE.BufferAttribute(seed,   1));

    const uniforms = {
      uProgress:   { value: 0 },
      uTime:       { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1 },
    };

    const vertexShader = /* glsl */`
      precision highp float;
      attribute vec3 aSphere, aCube, aTetra, aRand;
      attribute float aSeed;
      uniform float uProgress, uTime, uPixelRatio;
      varying float vSeed, vProgress;

      float ease(float x){ return x*x*(3.0-2.0*x); }
      float bell(float x, float c, float w){ float d=(x-c)/max(w,1e-6); return exp(-d*d); }

      void main(){
        vSeed = aSeed;
        vProgress = uProgress;
        float p = uProgress;
        vec3 target;
        float localT;

        float sizeSphere = 5.6;
        float sizeCube   = 12.0;
        float sizeTetra  = 13.8;
        float size;

        if(p < 0.3333333){
          localT = ease(p / 0.3333333);
          target = mix(aSphere, aCube, localT);
          size   = mix(sizeSphere, sizeCube, localT);
        } else if(p < 0.6666667){
          localT = ease((p - 0.3333333) / 0.3333333);
          target = mix(aCube, aTetra, localT);
          size   = mix(sizeCube, sizeTetra, localT);
        } else {
          localT = ease((p - 0.6666667) / 0.3333333);
          target = mix(aTetra, aSphere, localT);
          size   = mix(sizeTetra, sizeSphere, localT);
        }

        float burst = max(bell(p, 0.166, 0.18), max(bell(p, 0.5, 0.18), bell(p, 0.834, 0.18)));
        float tw    = 0.5 + 0.5 * sin(uTime * 2.5 + aSeed * 10.0);
        vec3 offset = aRand * (0.18 * burst * tw);

        float ry = 0.10 * uTime, rx = 0.04 * uTime;
        float c1 = cos(ry), s1 = sin(ry), c2 = cos(rx), s2 = sin(rx);
        mat3 rotY = mat3( c1, 0.0, s1,  0.0, 1.0, 0.0,  -s1, 0.0, c1 );
        mat3 rotX = mat3( 1.0, 0.0, 0.0,  0.0, c2, -s2,  0.0, s2, c2 );

        vec3 pos = rotY * rotX * (target + offset);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        float dist = -mv.z;
        gl_PointSize = size * uPixelRatio * (1.0 / max(0.6, dist));
      }
    `;

    const fragmentShader = /* glsl */`
      precision highp float;
      varying float vSeed, vProgress;

      float ease(float x){ return x*x*(3.0-2.0*x); }

      void main(){
        float p = vProgress;
        float densSphere = 1.00, densCube = 0.55, densTetra = 0.38;
        float density;
        if(p < 0.3333333){
          float t = ease(p / 0.3333333); density = mix(densSphere, densCube, t);
        } else if(p < 0.6666667){
          float t = ease((p - 0.3333333) / 0.3333333); density = mix(densCube, densTetra, t);
        } else {
          float t = ease((p - 0.6666667) / 0.3333333); density = mix(densTetra, densSphere, t);
        }
        if (vSeed > density) discard;

        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r = length(uv);
        float core = pow(1.0 - smoothstep(0.0, 1.0, r), 0.6);
        float halo = smoothstep(1.0, 0.35, r) * 0.4;
        float alpha = max(core, halo);
        if(alpha <= 0.001) discard;
        vec3 color = vec3(1.0) * 2.6;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geom, material, uniforms };
  }, [count, radius]);

  // animacja / dpr
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uProgress.value = progress;
  });

  useEffect(() => {
    const update = () => (uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [uniforms]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}
