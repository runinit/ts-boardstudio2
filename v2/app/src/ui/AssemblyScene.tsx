import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BoardReference, PcbPreview } from '@boardstudio/v2-contracts';
import type { ModelMesh } from '../modelMesh';
import {
  boardObject,
  disposeScene,
  meshGeometry,
  pcbModelMatrix,
} from './pcbScene';
import './assembly-preview.css';

export type LoadedModel = { id: string; mesh: ModelMesh };
export type AssemblyBody = { id: string; name: string; mesh: ModelMesh };
export function AssemblyScene({
  board,
  models,
  bodies = [],
  reference,
  onSelect,
  colorScheme,
}: {
  board: PcbPreview;
  models: LoadedModel[];
  bodies?: AssemblyBody[];
  reference?: BoardReference;
  onSelect?: (reference: string) => void;
  colorScheme: 'light' | 'dark';
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    render: () => void;
    fit: (direction?: THREE.Vector3) => void;
    root?: THREE.Group;
  }>();
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [hidden, setHidden] = useState<Set<string>>(new Set()),
    [selected, setSelected] = useState('');
  const interacted = useRef(false);
  const fittedModels = useRef(false);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  useEffect(() => {
    if (!canvas.current) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
        antialias: true,
        alpha: true,
      });
    } catch {
      setError('WebGL is unavailable. The 2D editor remains available.');
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(34, 1, 0.01, 10000);
    camera.up.set(0, 0, 1);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x687181, 2.4));
    const light = new THREE.DirectionalLight(0xffffff, 2.8);
    light.position.set(-50, 50, 100);
    scene.add(light);
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;
    let frame = 0;
    const render = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          const moving = controls.update();
          renderer.render(scene, camera);
          if (moving) render();
        });
    };
    const fit = (direction = new THREE.Vector3(0.7, -0.8, 0.65)) => {
      const root = runtime.current?.root;
      if (!root) return;
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      if (box.isEmpty()) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = Math.max(sphere.radius, 1);
      const distance =
        (radius /
          Math.sin(
            Math.min(
              (camera.fov * Math.PI) / 360,
              Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
            ),
          )) *
        1.12;
      controls.target.copy(sphere.center);
      camera.position
        .copy(sphere.center)
        .add(direction.normalize().multiplyScalar(distance));
      camera.near = Math.max(radius / 1000, 0.01);
      camera.far = distance + radius * 20;
      camera.updateProjectionMatrix();
      controls.update();
      render();
    };
    runtime.current = { scene, camera, controls, render, fit };
    controls.addEventListener('change', render);
    controls.addEventListener('start', () => { interacted.current = true; });
    const resize = () => {
      if (!canvas.current) return;
      const w = Math.max(canvas.current.clientWidth, 1),
        h = Math.max(canvas.current.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.current);
    resize();
    let down = { x: 0, y: 0 };
    const pointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const pointerUp = (e: PointerEvent) => {
      if (
        Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4 ||
        !runtime.current?.root
      )
        return;
      const bounds = canvas.current!.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
          (-(e.clientY - bounds.top) / bounds.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray
        .intersectObject(runtime.current.root, true)
        .find((hit) => {
          let p: THREE.Object3D | null = hit.object;
          while (p) {
            if (!p.visible) return false;
            p = p.parent;
          }
          return true;
        });
      if (hit) {
        let p: THREE.Object3D | null = hit.object;
        while (p && !p.userData.reference) p = p.parent;
        const label = p?.userData.reference ?? 'PCB';
        setSelected(label);
        selectRef.current?.(label);
      }
    };
    canvas.current.addEventListener('pointerdown', pointerDown);
    canvas.current.addEventListener('pointerup', pointerUp);
    const element = canvas.current;
    setReady(true);
    return () => {
      setReady(false);
      observer.disconnect();
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointerup', pointerUp);
      cancelAnimationFrame(frame);
      controls.dispose();
      if (runtime.current?.root) disposeScene(runtime.current.root);
      renderer.dispose();
      runtime.current = undefined;
    };
  }, []);
  const fitted = useRef(false);
  useEffect(() => {
    const rt = runtime.current;
    if (!ready || !rt) return;
    const root = new THREE.Group(),
      pcb = new THREE.Group();
    root.add(pcb);
    if (reference) {
      pcb.position.set(
        reference.pose.at.x,
        reference.pose.at.y,
        reference.elevation,
      );
      pcb.rotation.z = (reference.pose.rotation * Math.PI) / 180;
    }
    try {
      pcb.add(boardObject(board, hidden));
      const cache = new Map<ModelMesh, THREE.BufferGeometry>();
      for (const loaded of models) {
        const model = board.models.find((m) => m.id === loaded.id);
        if (!model) continue;
        let geometry = cache.get(loaded.mesh);
        if (!geometry) {
          geometry = meshGeometry(loaded.mesh);
          cache.set(loaded.mesh, geometry);
        }
        const material = new THREE.MeshStandardMaterial({
          color: loaded.mesh.colors ? '#ffffff' : '#aeb7c2',
          vertexColors: Boolean(loaded.mesh.colors),
          roughness: 0.55,
          metalness: 0.12,
        });
        const object = new THREE.Mesh(geometry, material);
        object.applyMatrix4(pcbModelMatrix(model, board.thickness));
        object.userData.reference = model.reference;
        object.visible =
          !hidden.has('Models') &&
          !hidden.has(model.id) &&
          !(/keycap/i.test(model.path) && hidden.has('Keycaps'));
        pcb.add(object);
      }
      for (const body of bodies) {
        const object = new THREE.Mesh(
          meshGeometry(body.mesh),
          new THREE.MeshStandardMaterial({
            color: colorScheme === 'dark' ? '#a2aaba' : '#adb6c3',
            roughness: 0.68,
          }),
        );
        object.userData.reference = body.name;
        object.visible = !hidden.has(body.id);
        root.add(object);
      }
      const previous = rt.root;
      rt.scene.add(root);
      rt.root = root;
      if (previous) {
        rt.scene.remove(previous);
        disposeScene(previous);
      }
      if (!fitted.current || (models.length > 0 && !fittedModels.current && !interacted.current)) {
        rt.fit();
        fitted.current = true;
      }
      if (models.length > 0) fittedModels.current = true;
      rt.render();
      setError('');
    } catch (cause) {
      disposeScene(root);
      setError(String(cause));
    }
  }, [ready, board, models, bodies, reference, hidden, colorScheme]);
  const toggle = (id: string) =>
    setHidden((old) => {
      const next = new Set(old);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const controls = [
    ['PCB', 'PCB'],
    ['Copper', 'Copper'],
    ['Silkscreen', 'Silkscreen'],
    ['Models', 'Models'],
    ['Keycaps', 'Keycaps'],
    ...bodies.map((b) => [b.id, b.name]),
  ];
  return (
    <div
      className="wb-assembly-scene"
      aria-label="Complete PCB assembly preview"
    >
      <canvas
        ref={canvas}
        aria-label="3D PCB assembly. Drag to orbit, scroll to zoom."
      />
      <details className="wb-assembly-layers">
        <summary>Visibility</summary>
        {controls.map(([id, label]) => (
          <label key={id}>
            <input
              type="checkbox"
              checked={!hidden.has(id)}
              onChange={() => toggle(id)}
            />
            {label}
          </label>
        ))}
        <details>
          <summary>Components ({board.models.length})</summary>
          {board.models.map((m) => (
            <label key={m.id}>
              <input
                type="checkbox"
                checked={!hidden.has(m.id)}
                onChange={() => toggle(m.id)}
              />
              {m.reference} · {m.path.split('/').pop()}
            </label>
          ))}
        </details>
      </details>
      <div
        className="wb-assembly-controls"
        role="group"
        aria-label="Assembly camera"
      >
        <button onClick={() => runtime.current?.fit()}>Fit</button>
        <button
          onClick={() => runtime.current?.fit(new THREE.Vector3(0, 0, 1))}
        >
          Top
        </button>
        <button
          onClick={() => runtime.current?.fit(new THREE.Vector3(0, 0, -1))}
        >
          Bottom
        </button>
        <button onClick={() => runtime.current?.fit()}>Isometric</button>
      </div>
      <output className="wb-assembly-caption">
        {selected ||
          `${models.length} / ${board.models.length} models · ${board.thickness} mm PCB`}
      </output>
      {error && (
        <p className="wb-assembly-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
