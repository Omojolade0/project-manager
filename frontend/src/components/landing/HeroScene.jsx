import { useEffect, useRef, useState } from "react";

// Interactive liquid hero scene (design handoff 3a). An iridescent blob that
// morphs, dents under the cursor, spins on drag and ripples on click, with
// three satellites orbiting it. Decorative only — all state is scene-local.

const PALETTE = [0x8c8ff3, 0x8ee3cf, 0xf2b8cf, 0xb6a8f7, 0x2a2a3c];
const R = 2.6;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export default function HeroScene({ className = "" }) {
  const containerRef = useRef(null);
  const [supported] = useState(() => typeof window !== "undefined" && hasWebGL());

  useEffect(() => {
    if (!supported) return;
    const container = containerRef.current;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([
      import("three"),
      import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ]).then(([THREE, { RoundedBoxGeometry }, { RoomEnvironment }]) => {
      if (disposed) return;
      cleanup = buildScene(THREE, RoundedBoxGeometry, RoomEnvironment, container);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [supported]);

  if (!supported) {
    return (
      <div className={className} aria-hidden="true">
        <div
          className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-[min(520px,80vw)] aspect-square rounded-full opacity-80"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #F2C6D6 0%, #B6A8F7 30%, #8C8FF3 60%, #7C7FF0 100%)",
            filter: "blur(2px)",
          }}
        />
      </div>
    );
  }

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

function buildScene(THREE, RoundedBox, RoomEnv, container) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const el = renderer.domElement;
  el.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none";
  container.appendChild(el);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnv(), 0.04).texture;
  scene.environment = envTexture;

  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0, 12);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc9ff, 0.9));
  const k1 = new THREE.DirectionalLight(0xffffff, 1.6);
  k1.position.set(-5, 5, 6);
  const k2 = new THREE.DirectionalLight(0xf2c6d6, 1.2);
  k2.position.set(6, -3, 4);
  const k3 = new THREE.DirectionalLight(0x8ee3cf, 0.7);
  k3.position.set(0, -6, -2);
  scene.add(k1, k2, k3);

  const root = new THREE.Group();
  scene.add(root);

  // Blob
  const geo = new THREE.IcosahedronGeometry(R, 64);
  const p = geo.attributes.position.array;
  const dirs = [];
  for (let i = 0; i < p.length; i += 3) dirs.push(new THREE.Vector3(p[i], p[i + 1], p[i + 2]).normalize());
  const palette = PALETTE.map((c) => new THREE.Color(c));
  let pIdx = 0;
  const colTarget = palette[0].clone();
  const mat = new THREE.MeshPhysicalMaterial({
    color: palette[0].clone(),
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.7,
    iridescenceIOR: 1.4,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xf2c6d6),
  });
  const blob = new THREE.Mesh(geo, mat);
  root.add(blob);

  // Satellites
  const satMat = mat.clone();
  satMat.color = new THREE.Color(0x8c8ff3);
  const sats = [
    new THREE.Mesh(new THREE.SphereGeometry(0.35, 48, 32), satMat),
    new THREE.Mesh(
      new RoundedBox(0.5, 0.5, 0.5, 5, 0.15),
      new THREE.MeshPhysicalMaterial({ color: 0x2a2a3c, roughness: 0.3, clearcoat: 1 })
    ),
    new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 32, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x8ee3cf, roughness: 0.25, clearcoat: 1 })
    ),
  ];
  sats.forEach((s, i) => {
    s.userData = { ph: i * 2.1, sp: 0.5 - i * 0.08, r: 3.5 - i * 0.2, push: new THREE.Vector3() };
    root.add(s);
  });

  // Interaction state
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(9, 9);
  const hitLocal = new THREE.Vector3();
  const ripples = [];
  let hoverAmt = 0;
  let hovering = false;
  let dragging = false;
  let moved = 0;
  let last = { x: 0, y: 0 };
  const vel = { x: 0, y: 0 };
  const spin = { x: 0, y: 0 };
  let energy = 0;

  const onContainerMove = (e) => {
    const b = container.getBoundingClientRect();
    mouse.tx = (e.clientX - b.left) / b.width - 0.5;
    mouse.ty = (e.clientY - b.top) / b.height - 0.5;
  };
  const onContainerLeave = () => {
    mouse.tx = 0;
    mouse.ty = 0;
  };
  const onMove = (e) => {
    const b = el.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    if (dragging) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      vel.x = dy * 0.006;
      vel.y = dx * 0.006;
      spin.x += vel.x;
      spin.y += vel.y;
      moved += Math.abs(dx) + Math.abs(dy);
      last = { x: e.clientX, y: e.clientY };
    }
  };
  const onLeave = () => {
    ndc.set(9, 9);
    dragging = false;
    el.style.cursor = "grab";
  };
  const onDown = (e) => {
    dragging = true;
    moved = 0;
    last = { x: e.clientX, y: e.clientY };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
  };
  const onUp = () => {
    dragging = false;
    el.style.cursor = hovering ? "pointer" : "grab";
    if (moved < 6 && hovering && !reducedMotion) {
      ripples.push({ dir: hitLocal.clone().normalize(), t0: performance.now() / 1000 });
      if (ripples.length > 6) ripples.shift();
      pIdx = (pIdx + 1) % palette.length;
      colTarget.copy(palette[pIdx]);
      energy = 1;
    }
  };

  if (!reducedMotion) {
    container.addEventListener("pointermove", onContainerMove);
    container.addEventListener("pointerleave", onContainerLeave);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
  } else {
    el.style.cursor = "default";
  }

  const hDir = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  const cursorWorld = new THREE.Vector3();
  const base = new THREE.Vector3();
  const away = new THREE.Vector3();

  const tick = (t) => {
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Spin with inertia; idle drift when untouched
    if (!dragging) {
      vel.x *= 0.95;
      vel.y *= 0.95;
      spin.x += vel.x;
      spin.y += vel.y + 0.0015;
    }
    blob.rotation.set(spin.x, spin.y, 0);
    blob.updateMatrixWorld();

    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObject(blob)[0];
    hovering = !!hit;
    if (hit) {
      inv.copy(blob.matrixWorld).invert();
      hitLocal.copy(hit.point).applyMatrix4(inv);
    }
    if (!dragging && !reducedMotion) el.style.cursor = hovering ? "pointer" : "grab";
    hoverAmt += ((hovering ? 1 : 0) - hoverAmt) * 0.08;
    energy *= 0.97;

    hDir.copy(hitLocal).normalize();
    const speed = 1 + hoverAmt * 0.6 + energy * 1.5;
    const now = performance.now() / 1000;
    for (let j = 0, i = 0; j < dirs.length; j++, i += 3) {
      const d0 = dirs[j];
      let d =
        Math.sin(d0.x * 2.1 + t * 0.7 * speed) * Math.cos(d0.y * 1.8 + t * 0.55 * speed) * (0.22 + energy * 0.12) +
        Math.sin(d0.z * 3.2 + t * 0.9 * speed) * 0.08;
      if (hoverAmt > 0.01) {
        const dot = d0.dot(hDir);
        if (dot > 0.6) {
          const f = (dot - 0.6) / 0.4;
          d -= f * f * 0.55 * hoverAmt;
        }
      }
      for (let k = 0; k < ripples.length; k++) {
        const rp = ripples[k];
        const age = now - rp.t0;
        if (age > 2.4) continue;
        const ang = Math.acos(Math.min(1, Math.max(-1, d0.dot(rp.dir))));
        const dist = ang - age * 2.2;
        d += Math.exp(-dist * dist * 18) * 0.28 * (1 - age / 2.4) * Math.cos(dist * 14);
      }
      const r = R + d;
      p[i] = d0.x * r;
      p[i + 1] = d0.y * r;
      p[i + 2] = d0.z * r;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    mat.color.lerp(colTarget, 0.05);

    // Satellites orbit, flee from the cursor, and get flung on click energy
    cursorWorld.set(ndc.x, ndc.y, 0.5).unproject(cam).sub(cam.position).normalize().multiplyScalar(12).add(cam.position);
    sats.forEach((s) => {
      const u = s.userData;
      const a = t * u.sp * (1 + energy * 2) + u.ph;
      base.set(Math.cos(a) * u.r * (1 + energy * 0.25), Math.sin(a) * 1.4 + 0.3, Math.sin(a) * 2);
      away.copy(base).sub(cursorWorld);
      away.z = 0;
      const dist = away.length();
      if (dist < 1.6 && ndc.x < 5) u.push.add(away.normalize().multiplyScalar((1.6 - dist) * 0.12));
      u.push.multiplyScalar(0.92);
      s.position.copy(base).add(u.push);
      s.rotation.x += 0.01;
      s.rotation.y += 0.013;
    });

    root.rotation.y = mouse.x * 0.25;
    root.rotation.x = mouse.y * 0.15;
  };

  const render = () => renderer.render(scene, cam);

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // Pull the camera back on narrow screens so the blob stays behind the headline
    cam.position.z = w < 900 ? 15 : 12;
    cam.updateProjectionMatrix();
    if (reducedMotion) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Render loop — paused when off-screen or the tab is hidden
  const clock = new THREE.Clock();
  let raf = 0;
  let elapsed = 0;
  let inView = true;
  const loop = () => {
    tick(clock.getElapsedTime());
    render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (!raf && inView && !document.hidden) {
      clock.start();
      clock.elapsedTime = elapsed;
      raf = requestAnimationFrame(loop);
    }
  };
  const stop = () => {
    if (raf) {
      elapsed = clock.getElapsedTime();
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  let io;
  const onVisibility = () => (document.hidden ? stop() : start());
  if (reducedMotion) {
    tick(0);
    render();
  } else {
    io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    });
    io.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    start();
  }

  return () => {
    stop();
    ro.disconnect();
    io?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    container.removeEventListener("pointermove", onContainerMove);
    container.removeEventListener("pointerleave", onContainerLeave);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointerup", onUp);
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
    el.remove();
  };
}
