import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BoardReference, Contour, MechanicalAssembly, MechanicalConfiguration, PcbPreview } from '@boardstudio/v2-contracts';
import type { ModelMesh } from '../modelMesh';
import { mechanicalExplodedOffset } from './mechanicalExplode';
import {
  boardObject,
  disposeScene,
  meshGeometry,
  pcbModelMatrix,
} from './pcbScene';
import './assembly-preview.css';

export type LoadedModel = { id: string; mesh: ModelMesh };
export type AssemblyBody = { id: string; name: string; mesh: ModelMesh };
type AssemblyView = 'assembled' | 'exploded' | 'section';

export function AssemblyScene({
  board,
  models,
  bodies = [],
  mechanical,
  mechanicalConfiguration,
  selectedLayer = '',
  reference,
  onSelect,
  onSelectLayer,
  colorScheme,
}: {
  board: PcbPreview;
  models: LoadedModel[];
  bodies?: AssemblyBody[];
  mechanical?: MechanicalAssembly;
  mechanicalConfiguration?: MechanicalConfiguration;
  selectedLayer?: string;
  reference?: BoardReference;
  onSelect?: (reference: string) => void;
  onSelectLayer?: (id: string) => void;
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
    [selected, setSelected] = useState(''),
    [view, setView] = useState<AssemblyView>('assembled');
  const interacted = useRef(false);
  const fittedModels = useRef(false);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const selectLayerRef = useRef(onSelectLayer);
  selectLayerRef.current = onSelectLayer;
  const mechanicalRef = useRef(mechanical);
  mechanicalRef.current = mechanical;
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
    renderer.localClippingEnabled = true;
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
        if (mechanicalRef.current?.stack.some((layer) => layer.id === label)) selectLayerRef.current?.(label);
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
      const pcbLayerIndex = mechanical?.stack.findIndex((layer) => layer.id === 'pcb') ?? -1;
      if (mechanical) pcb.position.z += -board.thickness + (view === 'exploded' ? mechanicalExplodedOffset(pcbLayerIndex) : 0);
      const boardGeometry = boardObject(board, hidden);
      if (mechanical) boardGeometry.userData.reference = 'pcb';
      if (selectedLayer === 'pcb') {
        boardGeometry.traverse((child) => {
          if (!(child instanceof THREE.Mesh) || !child.material) return;
          for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.emissive.set('#604613');
              material.emissiveIntensity = 0.3;
            }
          }
        });
      }
      pcb.add(boardGeometry);
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
      const layerOrder = new Map((mechanical?.stack ?? []).map((layer, index) => [layer.id, index]));
      for (const body of bodies) {
        const layerIndex = layerOrder.get(body.id);
        const isMechanical = layerIndex !== undefined;
        const isSelectedLayer = isMechanical && selectedLayer === body.id;
        const isFoam = /foam|gasket/i.test(body.id);
        const object = new THREE.Mesh(
          meshGeometry(body.mesh),
          new THREE.MeshStandardMaterial({
            color: isSelectedLayer ? '#d8a63d' : isFoam ? '#8e5aa5' : isMechanical && /plate/i.test(body.id) ? '#559077' : colorScheme === 'dark' ? '#a2aaba' : '#adb6c3',
            roughness: 0.68,
            transparent: isFoam,
            opacity: isFoam ? 0.62 : 1,
            emissive: isSelectedLayer ? '#604613' : '#000000',
          }),
        );
        object.position.z = isMechanical && view === 'exploded' ? mechanicalExplodedOffset(layerIndex ?? -1) : 0;
        object.userData.reference = body.id;
        object.visible = !hidden.has(body.id);
        root.add(object);
      }
      if (mechanical) {
        const battery = mechanicalConfiguration?.battery;
        if (battery) {
          const object = new THREE.Mesh(new THREE.BoxGeometry(battery.size.x, battery.size.y, battery.size.z), new THREE.MeshStandardMaterial({ color: selectedLayer === 'battery' ? '#d8a63d' : '#c77d45', roughness: 0.7, emissive: selectedLayer === 'battery' ? '#604613' : '#000000' }));
          const batteryLayer = mechanical.stack.find((layer) => layer.id === 'battery');
          object.position.set(battery.at.x, battery.at.y, batteryLayer ? batteryLayer.z + batteryLayer.thickness / 2 : battery.size.z / 2);
          if (view === 'exploded') object.position.z += mechanicalExplodedOffset(layerOrder.get('battery') ?? -1);
          object.userData.reference = 'battery';
          object.visible = !hidden.has('battery');
          root.add(object);
          const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(battery.at.x, battery.at.y, object.position.z), new THREE.Vector3(battery.cableExit.x, battery.cableExit.y, object.position.z)]), new THREE.LineBasicMaterial({ color: '#cf5b4d' }));
          cable.userData.reference = 'battery';
          cable.visible = !hidden.has('battery');
          root.add(cable);
        }
      }
      if (view === 'section') {
        const points = board.contours.flatMap((contour) => contour.points);
        const centreX = points.length ? (Math.min(...points.map((point) => point.x)) + Math.max(...points.map((point) => point.x))) / 2 : 0;
        const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), centreX);
        root.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.material) return;
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.clippingPlanes = [plane];
        });
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
  }, [ready, board, models, bodies, reference, hidden, colorScheme, mechanical, mechanicalConfiguration, selectedLayer, view]);
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
    ...(mechanical?.stack ?? []).map((layer) => layer.id === 'pcb' ? ['PCB', 'PCB'] : [layer.id, layer.id]),
  ].filter(([id], index, all) => all.findIndex(([candidate]) => candidate === id) === index);
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
      {mechanical && <div className="wb-mechanical-view-controls" role="group" aria-label="Mechanical assembly view">
        <button aria-pressed={view === 'assembled'} onClick={() => setView('assembled')}>Assembled</button>
        <button aria-pressed={view === 'exploded'} onClick={() => setView('exploded')}>Exploded</button>
        <button aria-pressed={view === 'section'} onClick={() => setView('section')}>Section</button>
      </div>}
      {mechanical && <output role="status" className="wb-mechanical-preview-status">{bodies.filter((body) => mechanical.case.bodies.some((entry) => entry.body.id === body.id)).length === mechanical.case.bodies.length ? `Generated CAD solids · ${mechanical.case.bodies.length} parts at revision ${mechanical.revision}` : `Building generated solids… ${bodies.filter((body) => mechanical.case.bodies.some((entry) => entry.body.id === body.id)).length}/${mechanical.case.bodies.length} parts at revision ${mechanical.revision}`}</output>}
      {view === 'section' && <output className="wb-mechanical-section-label">Section at board centre · half removed</output>}
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
