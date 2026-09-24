import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type * as Three from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type Mesh = { positions: Float32Array; normals: Float32Array; revision: number };
type ComponentPreview = {
  id: string;
  reference: string;
  pose: { at: { x: number; y: number }; rotation: number };
  side: 'front' | 'back';
  model: { offset: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number }; scale: { x: number; y: number; z: number } };
  mesh: { positions: Float32Array; normals: Float32Array };
};

export function componentSideScale(side: 'front' | 'back'): [number, number, number] {
  return side === 'back' ? [-1, 1, -1] : [1, 1, 1];
}

export function componentSideSvgTransform(side: 'front' | 'back'): string {
  return side === 'back' ? 'scale(-1 1)' : '';
}

export function componentPoseSvgTransform(at: { x: number; y: number }, rotation: number, side: 'front' | 'back'): string {
  const pose = `translate(${at.x} ${at.y}) rotate(${rotation})`;
  const sideTransform = componentSideSvgTransform(side);
  return sideTransform ? `${pose} ${sideTransform}` : pose;
}
type Controls = OrbitControls;
const emptyPreviews: ComponentPreview[] = [];

const samePreviews = (left: ComponentPreview[], right: ComponentPreview[]): boolean => left.length === right.length && left.every((item, index) => {
  const other = right[index];
  return item.id === other.id
    && item.reference === other.reference
    && item.pose.at.x === other.pose.at.x
    && item.pose.at.y === other.pose.at.y
    && item.pose.rotation === other.pose.rotation
    && item.side === other.side
    && item.model.offset.x === other.model.offset.x
    && item.model.offset.y === other.model.offset.y
    && item.model.offset.z === other.model.offset.z
    && item.model.rotation.x === other.model.rotation.x
    && item.model.rotation.y === other.model.rotation.y
    && item.model.rotation.z === other.model.rotation.z
    && item.model.scale.x === other.model.scale.x
    && item.model.scale.y === other.model.scale.y
    && item.model.scale.z === other.model.scale.z
    && item.mesh.positions === other.mesh.positions
    && item.mesh.normals === other.mesh.normals;
});

const CasePreview = ({ mesh, componentPreviews, boardThickness = 0, colorScheme = 'light', controlsTarget }: {
  mesh?: Mesh;
  componentPreviews?: ComponentPreview[];
  boardThickness?: number;
  colorScheme?: 'light' | 'dark';
  controlsTarget?: HTMLElement | null;
}) => {
  const incomingPreviews = componentPreviews ?? emptyPreviews;
  const previewsRef = useRef(incomingPreviews);
  if (!samePreviews(previewsRef.current, incomingPreviews)) previewsRef.current = incomingPreviews;
  const previews = previewsRef.current;
  const renderableComponentCount = previews.filter((component) => component.mesh.positions.length >= 9 && component.mesh.positions.length % 3 === 0).length;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    const caseMesh = mesh && mesh.positions.length >= 9 && mesh.positions.length % 3 === 0 ? mesh : undefined;
    const components = previews.filter((component) => component.mesh.positions.length >= 9 && component.mesh.positions.length % 3 === 0);
    setReady(false);
    if (!canvas || (!caseMesh && components.length === 0)) return;
    let disposed = false;
    let renderer: Three.WebGLRenderer | undefined;
    let controls: Controls | undefined;
    let frame = 0;
    const geometries: Three.BufferGeometry[] = [];
    const materials: Three.MeshStandardMaterial[] = [];
    let observer: ResizeObserver | undefined;

    const build = async () => {
      const [THREE, controlsModule] = await Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
      ]);
      if (disposed) return;

      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        setError('WebGL is unavailable in this browser.');
        return;
      }
      setError('');
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const darkMode = colorScheme === 'dark';
      // Let the shared canvas surface show through instead of duplicating its palette in WebGL.
      renderer.setClearColor(0x000000, 0);
      const theme = getComputedStyle(canvas);
      const geometryColor = (role: string) => new THREE.Color(theme.getPropertyValue(`--wb-geometry-${role}`).trim());

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 10000);
      camera.up.set(0, 0, 1);
      let fittedDistance = 1;

      const previewObjects: Three.Object3D[] = [];
      const makeGeometry = (positions: Float32Array, normals: Float32Array) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        if (normals.length === positions.length) {
          geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        } else {
          geometry.computeVertexNormals();
        }
        geometry.computeBoundingBox();
        geometries.push(geometry);
        return geometry;
      };

      if (caseMesh) {
        const geometry = makeGeometry(caseMesh.positions, caseMesh.normals);
        const material = new THREE.MeshStandardMaterial({ color: geometryColor('board'), roughness: 0.74, metalness: 0.04, side: THREE.DoubleSide });
        materials.push(material);
        const caseObject = new THREE.Mesh(geometry, material);
        scene.add(caseObject);
        previewObjects.push(caseObject);
      }

      components.forEach((component, index) => {
        const partGroup = new THREE.Group();
        partGroup.position.set(component.pose.at.x, component.pose.at.y, component.side === 'front' ? boardThickness : 0);
        partGroup.rotation.z = THREE.MathUtils.degToRad(component.pose.rotation);

        const sideGroup = new THREE.Group();
        sideGroup.scale.set(...componentSideScale(component.side));
        partGroup.add(sideGroup);

        const modelGroup = new THREE.Group();
        modelGroup.position.set(component.model.offset.x, component.model.offset.y, component.model.offset.z);
        modelGroup.rotation.set(
          THREE.MathUtils.degToRad(component.model.rotation.x),
          THREE.MathUtils.degToRad(component.model.rotation.y),
          THREE.MathUtils.degToRad(component.model.rotation.z),
        );
        modelGroup.scale.set(component.model.scale.x, component.model.scale.y, component.model.scale.z);
        sideGroup.add(modelGroup);

        const geometry = makeGeometry(component.mesh.positions, component.mesh.normals);
        const material = new THREE.MeshStandardMaterial({ color: geometryColor(index % 2 === 0 ? 'key' : 'part'), roughness: 0.62, metalness: 0.08, side: THREE.DoubleSide });
        materials.push(material);
        modelGroup.add(new THREE.Mesh(geometry, material));
        scene.add(partGroup);
        previewObjects.push(partGroup);
      });
      scene.add(new THREE.HemisphereLight(darkMode ? 0xf2f4f8 : 0xffffff, darkMode ? 0x525252 : 0xa8a8a8, 2.2));
      const keyLight = new THREE.DirectionalLight(darkMode ? 0xd0e2ff : 0xffffff, 2.4);
      keyLight.position.set(-3, 5, 4);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(darkMode ? 0xbe95ff : 0xd0e2ff, 1.1);
      fillLight.position.set(4, 1, -4);
      scene.add(fillLight);

      controls = new controlsModule.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.screenSpacePanning = true;
      controlsRef.current = controls;
      const render = () => {
        frame = 0;
        if (disposed) {
          return;
        }

        const moving = controls?.update() ?? false;
        renderer?.render(scene, camera);
        if (controls) setZoomPercent(Math.round(fittedDistance / camera.position.distanceTo(controls.target) * 100));
        if (moving) {
          requestRender();
        }
      };
      const requestRender = () => {
        if (!disposed && !frame) {
          frame = requestAnimationFrame(render);
        }
      };
      controls.addEventListener('change', requestRender);

      const fitCamera = () => {
        scene.updateMatrixWorld(true);
        const bounds = new THREE.Box3();
        previewObjects.forEach((object) => bounds.expandByObject(object));
        if (bounds.isEmpty()) return;
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const radius = Math.max(sphere.radius, 0.1);
        const verticalFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const horizontalFov = Math.atan(Math.tan(verticalFov) * camera.aspect);
        const distance = radius / Math.sin(Math.min(verticalFov, horizontalFov)) * 1.12;
        fittedDistance = distance;
        controls?.target.copy(sphere.center);
        camera.position.copy(new THREE.Vector3(0.72, 0.72, 0.55).normalize().multiplyScalar(distance).add(sphere.center));
        camera.near = Math.max(radius / 1000, 0.01);
        camera.far = distance + radius * 8;
        camera.updateProjectionMatrix();
        if (controls) {
          controls.minDistance = radius * 0.2;
          controls.maxDistance = distance * 4;
          controls.update();
        }
        requestRender();
      };
      fitRef.current = fitCamera;

      const resize = () => {
        const width = Math.max(canvas.clientWidth, 1);
        const height = Math.max(canvas.clientHeight, 1);
        renderer?.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        requestRender();
      };
      resize();
      fitCamera();
      setReady(true);
      observer = new ResizeObserver(resize);
      observer.observe(canvas);

    };

    build().catch(() => setError('The 3D preview could not initialize.'));
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      controls?.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      controlsRef.current = null;
      fitRef.current = null;
    };
  }, [mesh?.positions, mesh?.normals, mesh?.revision, previews, boardThickness, colorScheme]);

  const zoom = (factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.object.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
    controls.update();
  };

  if ((!mesh || mesh.positions.length < 9) && renderableComponentCount === 0) return <div className="wb-case-preview-empty">
    <span className="wb-case-preview-wire"><CaseWire /></span>
    <strong>{error || 'Waiting for a case assembly'}</strong>
    <small>The 3D preview appears when the settled geometry is ready.</small>
  </div>;

  const viewControls = <div className={controlsTarget ? 'wb-footer-zoom' : 'wb-case-preview-controls'} role="group" aria-label="3D view controls">
    <button aria-label="Fit preview" title="Fit preview" disabled={!ready} onClick={() => fitRef.current?.()}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4M3 3l4 4m10-4-4 4M3 17l4-4m10 4-4-4" /></svg></button>
    <button aria-label="Zoom out" title="Zoom out" disabled={!ready} onClick={() => zoom(1.2)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10" /></svg></button>
    <output aria-label="Preview zoom" title="Zoom relative to the fitted preview">{zoomPercent}%</output>
    <button aria-label="Zoom in" title="Zoom in" disabled={!ready} onClick={() => zoom(1 / 1.2)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10M10 5v10" /></svg></button>
  </div>;

  return <div className="wb-case-preview" aria-label={`Case and component mesh preview, ${renderableComponentCount} components`}>
    <canvas ref={canvasRef} aria-label="Interactive 3D case preview. Drag to orbit and scroll to zoom." />
    <div className="wb-case-preview-label"><span>Case + components</span><span>{renderableComponentCount} {renderableComponentCount === 1 ? 'component' : 'components'}</span>{mesh && <span className="wb-case-preview-revision">r{mesh.revision}</span>}</div>
    <div className="wb-case-preview-disclaimer">Visual preview · not clearance proof</div>
    {controlsTarget ? createPortal(viewControls, controlsTarget) : viewControls}
    {error && <div className="wb-case-preview-error" role="status">{error}</div>}
  </div>;
};

const CaseWire = () => <svg viewBox="0 0 80 60" aria-hidden="true">
  <path d="m10 20 30-12 30 12-30 12zM10 20v25l30 12V32M70 20v25L40 57" />
  <path d="m20 24 20 8 20-8M20 30v9l20 8 20-8v-9M28 38v8m24-8v8" />
</svg>;

export { CasePreview };
export type { ComponentPreview };
