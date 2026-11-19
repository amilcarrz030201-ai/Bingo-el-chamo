import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  triggerKey: number | string | null;
  active: boolean;
  intensity?: "normal" | "special" | "jackpot";
  onComplete?: () => void;
}

// Celebratory Venezuelan & Golden Bingo palette
const CELEBRATION_COLORS = [
  0xffd700, // Oro Imperial
  0xf59e0b, // Ámbar Brillante
  0xfbbf24, // Oro Amarillo
  0xef4444, // Rojo Rubí Festivo
  0x3b82f6, // Azul Real
  0x10b981, // Verde Esmeralda
  0xa855f7, // Púrpura Diamante
  0xffffff, // Destello Plateado
  0xf43f5e, // Rosa Neón
  0x06b6d4, // Cyan Eléctrico
];

interface ConfettiParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  flutterSpeed: number;
  flutterPhase: number;
  scaleBase: number;
  life: number;
  maxLife: number;
}

export const Tombola3DConfetti: React.FC<Props> = ({
  triggerKey,
  active,
  intensity = "special",
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeTriggerRef = useRef<number | string | null>(null);

  useEffect(() => {
    if (!active || triggerKey === null) return;
    if (activeTriggerRef.current === triggerKey) return;
    activeTriggerRef.current = triggerKey;

    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL as per threejs guidelines
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer (safe for WebViews where WebGL may be disabled)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.replaceChildren(renderer.domElement);
      rendererRef.current = renderer;
    } catch (webglErr) {
      console.warn("WebGL 3D confetti not available in this WebView:", webglErr);
      return;
    }

    // 3. Lighting (Warm Key + Ambient + Rim for high specular shine on confetti)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5cc, 2.0);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.0);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // 4. Geometries for 3D Confetti Pieces
    const ribbonGeo = new THREE.PlaneGeometry(0.18, 0.38);
    const squareGeo = new THREE.PlaneGeometry(0.22, 0.22);
    const diamondGeo = new THREE.PlaneGeometry(0.24, 0.24);
    diamondGeo.rotateZ(Math.PI / 4);

    // 5-pointed star geometry
    const starShape = new THREE.Shape();
    const outerRadius = 0.18;
    const innerRadius = 0.08;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    const starGeo = new THREE.ShapeGeometry(starShape);

    // Shared materials by color with double-sided rendering
    const materialMap = new Map<number, THREE.MeshStandardMaterial>();
    CELEBRATION_COLORS.forEach((hex) => {
      materialMap.set(
        hex,
        new THREE.MeshStandardMaterial({
          color: hex,
          side: THREE.DoubleSide,
          metalness: 0.75,
          roughness: 0.2,
          transparent: true,
          opacity: 1.0,
        })
      );
    });

    // 5. Particle Count based on intensity
    const totalCount =
      intensity === "jackpot" ? 180 : intensity === "special" ? 140 : 90;
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < totalCount; i++) {
      // Pick random geometry
      const r = Math.random();
      let geo: THREE.BufferGeometry = ribbonGeo;
      if (r < 0.45) geo = ribbonGeo;
      else if (r < 0.7) geo = squareGeo;
      else if (r < 0.85) geo = diamondGeo;
      else geo = starGeo;

      // Pick color
      const colorHex = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
      const mat = materialMap.get(colorHex)!;

      const mesh = new THREE.Mesh(geo, mat);

      // Start at or very near center of tombola (origin)
      const startX = (Math.random() - 0.5) * 0.4;
      const startY = (Math.random() - 0.5) * 0.4;
      const startZ = (Math.random() - 0.5) * 0.4;
      mesh.position.set(startX, startY, startZ);

      // Random initial 3D orientation
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // 3D explosive burst velocity: upwards, outwards and forward towards camera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6; // cone upwards
      const speed = 2.5 + Math.random() * 5.2;

      const vx = Math.sin(phi) * Math.cos(theta) * speed * 0.85;
      const vy = (Math.cos(phi) * speed * 1.1) + 1.8; // strong fountain thrust
      const vz = (Math.sin(phi) * Math.sin(theta) * speed * 0.9) + 1.2; // towards user

      const scale = 0.7 + Math.random() * 0.6;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);

      particles.push({
        mesh,
        vx,
        vy,
        vz,
        rotSpeedX: (Math.random() - 0.5) * 14.0,
        rotSpeedY: (Math.random() - 0.5) * 14.0,
        rotSpeedZ: (Math.random() - 0.5) * 8.0,
        flutterSpeed: 4.0 + Math.random() * 6.0,
        flutterPhase: Math.random() * Math.PI * 2,
        scaleBase: scale,
        life: 0,
        maxLife: 2.8 + Math.random() * 1.6, // seconds
      });
    }

    // 6. Animation Loop with Physics & 3D Tumbling
    let lastTime = performance.now();
    let isFinished = false;

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += dt;

        if (p.life < p.maxLife) {
          aliveCount++;

          // Aerodynamic drag
          p.vx *= 0.982;
          p.vz *= 0.982;
          p.vy *= 0.986;

          // Gravity pull downwards
          p.vy -= 4.2 * dt;

          // 3D Fluttering / Aerodynamic drift on X and Z
          const flutter = Math.sin(p.life * p.flutterSpeed + p.flutterPhase);
          p.mesh.position.x += p.vx * dt + flutter * 0.008;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt + Math.cos(p.life * p.flutterSpeed) * 0.006;

          // 3D Tumbling Rotation around all 3 axes
          p.mesh.rotation.x += p.rotSpeedX * dt;
          p.mesh.rotation.y += p.rotSpeedY * dt;
          p.mesh.rotation.z += p.rotSpeedZ * dt;

          // Fade out towards the end of life
          const progress = p.life / p.maxLife;
          if (progress > 0.65) {
            const fade = Math.max(0, 1.0 - (progress - 0.65) / 0.35);
            const currentScale = p.scaleBase * fade;
            p.mesh.scale.set(currentScale, currentScale, currentScale);
          }
        } else {
          p.mesh.visible = false;
        }
      }

      renderer.render(scene, camera);

      if (aliveCount > 0 && !isFinished) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        isFinished = true;
        if (onComplete) onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // 7. Cleanup on unmount or re-trigger
    return () => {
      isFinished = true;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      // Dispose Three.js objects
      particles.forEach((p) => {
        scene.remove(p.mesh);
      });
      ribbonGeo.dispose();
      squareGeo.dispose();
      diamondGeo.dispose();
      starGeo.dispose();
      materialMap.forEach((mat) => mat.dispose());

      renderer.dispose();
      if (container) {
        container.replaceChildren();
      }
    };
  }, [triggerKey, active, intensity, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30 overflow-visible"
      style={{
        width: "100%",
        height: "100%",
        transform: "scale(1.4)", // Extends explosion beyond container bounds
        transformOrigin: "center center",
      }}
    />
  );
};
