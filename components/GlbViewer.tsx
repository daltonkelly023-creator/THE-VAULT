"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface GlbViewerProps {
  modelUrl: string;
  /** Obsidian for Atelier, warm dark-earth for Terra — matches the
   *  atmosphere backgrounds used elsewhere in the app rather than a plain
   *  studio gray. */
  backgroundHex?: number;
}

export default function GlbViewer({ modelUrl, backgroundHex = 0x0a0908 }: GlbViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId: number;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundHex);

    const camera = new THREE.PerspectiveCamera(
      35,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.4, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Gold-leaning key light + soft fill, in keeping with the assay-plaque /
    // amber palette used throughout the rest of the site.
    const key = new THREE.DirectionalLight(0xffe8c2, 2.1);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8fb3ff, 0.4);
    fill.position.set(-2, -1, -1.5);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1; // gentle idle drift when not being dragged

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    function pauseIdleRotation() {
      controls.autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2200);
    }
    controls.addEventListener("start", pauseIdleRotation);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Center + normalize scale so every uploaded piece frames consistently
        // regardless of the source file's original units.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.4 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        scene.add(model);
        setStatus("ready");
      },
      undefined,
      (err) => {
        console.error("Failed to load .glb model:", err);
        if (!disposed) setStatus("error");
      }
    );

    function handleResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    function animate() {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.removeEventListener("start", pauseIdleRotation);
      if (idleTimer) clearTimeout(idleTimer);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [modelUrl, backgroundHex]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      {status === "loading" && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[0.3em] text-zinc-600">
          Loading model…
        </p>
      )}
      {status === "error" && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[0.3em] text-[#d97757]">
          Model failed to load
        </p>
      )}
    </div>
  );
}
