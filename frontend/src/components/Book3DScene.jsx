import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { createBookTextures, resolvePageHotspot } from '../utils/bookTextures';

function GroundGlowShadow({ currentSpread }) {
  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    g.addColorStop(0, 'rgba(2, 6, 23, 0.78)');
    g.addColorStop(0.5, 'rgba(15, 23, 42, 0.36)');
    g.addColorStop(0.8, 'rgba(34, 211, 238, 0.08)');
    g.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }, []);

  useEffect(() => () => shadowTex.dispose(), [shadowTex]);

  const isOpen = currentSpread >= 1 && currentSpread <= 4;
  return (
    <mesh position={[0, -2.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[isOpen ? 6.6 : 4.0, 2.2]} />
      <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
    </mesh>
  );
}

const PAGE_W = 2.45;
const PAGE_H = 3.4;
const COVER_OVERHANG = 0.055;
const STEP_Z = 0.036;

const LEAF_PAGE_PAIRS = [
  { frontPage: 1, backPage: 3, isCover: true },
  { frontPage: 2, backPage: 5, isCover: false },
  { frontPage: 4, backPage: 7, isCover: false },
  { frontPage: 6, backPage: 9, isCover: false },
  { frontPage: 8, backPage: 10, isCover: true },
];

/**
 * Single physical double-sided leaf (either rigid hardcover board or flexible heavy inner sheet)
 * hinged along x = 0 so dragging RIGHT (rotation.y: 0 -> PI) swings it toward the viewer (+Z)
 * from [-W, 0] to [0, +W].
 */
function BookLeaf({
  index,
  frontTexture,
  backTexture,
  paperEdgeTexture,
  isCover,
  leafAnglesRef,
  leafVelocitiesRef,
  activeDragLeafRef,
  lastDragEndTimeRef,
  onHoverHotspot,
  onSelectHotspot,
  onLeafPointerDown,
}) {
  const groupRef = useRef();
  const frontGeoRef = useRef();
  const backGeoRef = useRef();

  const width = isCover ? PAGE_W + COVER_OVERHANG : PAGE_W;
  const height = isCover ? PAGE_H + COVER_OVERHANG * 1.6 : PAGE_H;
  const thickness = isCover ? 0.042 : 0.018;
  const segX = isCover ? 6 : 24;
  const segY = isCover ? 4 : 10;

  // Store unbent vertex positions for clean real-time page-curl deformation
  const basePositions = useMemo(() => {
    const temp = new THREE.PlaneGeometry(width, height, segX, segY);
    const copy = new Float32Array(temp.attributes.position.array);
    temp.dispose();
    return copy;
  }, [width, height, segX, segY]);

  const edgeMaterial = useMemo(() => {
    if (isCover) {
      return new THREE.MeshStandardMaterial({
        color: '#0e1633',
        roughness: 0.42,
        metalness: 0.38,
      });
    }
    return new THREE.MeshStandardMaterial({
      map: paperEdgeTexture,
      color: '#e2e8f0',
      roughness: 0.65,
      metalness: 0.05,
    });
  }, [isCover, paperEdgeTexture]);

  useEffect(() => {
    return () => {
      edgeMaterial.dispose();
    };
  }, [edgeMaterial]);

  const isBentRef = useRef(false);

  useFrame(() => {
    if (!groupRef.current) return;
    const theta = leafAnglesRef.current[index] || 0;
    const progress = theta / Math.PI; // 0 (left stack) -> 1 (right stack)

    // Smooth z-stacking interpolation guarantees zero z-fighting in every state
    const zUnflipped = (2 - index) * STEP_Z;
    const zFlipped = (index - 2) * STEP_Z;
    const zBase = THREE.MathUtils.lerp(zUnflipped, zFlipped, progress);

    // Extra subtle lift at mid-turn so rotating leaves clear resting stacks cleanly
    const turnLift = Math.sin(theta) * 0.06;

    groupRef.current.position.set(0, 0, zBase + turnLift);
    groupRef.current.rotation.y = theta;

    // Organic page curvature on inner sheets during turn
    if (!isCover && frontGeoRef.current && backGeoRef.current) {
      const vel = leafVelocitiesRef.current[index] || 0;
      const isBeingDragged = activeDragLeafRef.current === index;
      const sinTheta = Math.sin(theta);
      const bendStrength =
        sinTheta * (isBeingDragged ? 0.22 : 0.14) + Math.max(-0.1, Math.min(0.1, vel * 0.05));

      const fPos = frontGeoRef.current.attributes.position;
      const bPos = backGeoRef.current.attributes.position;

      if (Math.abs(bendStrength) > 0.002) {
        isBentRef.current = true;
        for (let vi = 0; vi < fPos.count; vi += 1) {
          const bx = basePositions[vi * 3];
          const distFromSpine = (width / 2 - bx) / width;
          const arch = Math.sin(distFromSpine * Math.PI) * bendStrength;
          const tipCurl = Math.pow(distFromSpine, 2.1) * bendStrength * 0.3;
          const dz = arch - tipCurl;

          fPos.array[vi * 3 + 2] = dz;
          const bDistFromSpine = (bx + width / 2) / width;
          const bArch = Math.sin(bDistFromSpine * Math.PI) * bendStrength;
          const bTipCurl = Math.pow(bDistFromSpine, 2.1) * bendStrength * 0.3;
          bPos.array[vi * 3 + 2] = -(bArch - bTipCurl);
        }
        fPos.needsUpdate = true;
        bPos.needsUpdate = true;
        frontGeoRef.current.computeVertexNormals();
        backGeoRef.current.computeVertexNormals();
      } else if (isBentRef.current) {
        isBentRef.current = false;
        for (let vi = 0; vi < fPos.count; vi += 1) {
          fPos.array[vi * 3 + 2] = 0;
          bPos.array[vi * 3 + 2] = 0;
        }
        fPos.needsUpdate = true;
        bPos.needsUpdate = true;
        frontGeoRef.current.computeVertexNormals();
        backGeoRef.current.computeVertexNormals();
      }
    }
  });

  const { frontPage, backPage } = LEAF_PAGE_PAIRS[index];

  const handleFaceMove = useCallback(
    (pageNum, e) => {
      e.stopPropagation();
      const hit = resolvePageHotspot(pageNum, e.uv);
      onHoverHotspot(hit);
    },
    [onHoverHotspot]
  );

  const handleFaceClick = useCallback(
    (pageNum, e) => {
      e.stopPropagation();
      if (performance.now() - (lastDragEndTimeRef?.current || 0) < 240) {
        return;
      }
      const hit = resolvePageHotspot(pageNum, e.uv);
      if (hit) {
        onSelectHotspot(hit);
      }
    },
    [lastDragEndTimeRef, onSelectHotspot]
  );

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        onLeafPointerDown(index, e);
      }}
      onPointerOut={() => onHoverHotspot(null)}
    >
      {/* Core Slab on rigid hardcovers; perimeter paper-edge rim on flexible inner leaves so curved sheets never clip a flat interior slab */}
      {isCover ? (
        <mesh
          position={[-width / 2, 0, 0]}
          castShadow
          receiveShadow
          material={edgeMaterial}
        >
          <boxGeometry args={[width, height, thickness * 0.94]} />
        </mesh>
      ) : (
        <group>
          <mesh position={[-width + 0.015, 0, 0]} material={edgeMaterial}>
            <boxGeometry args={[0.03, height, thickness * 0.92]} />
          </mesh>
          <mesh position={[-width / 2, height / 2 - 0.015, 0]} material={edgeMaterial}>
            <boxGeometry args={[width, 0.03, thickness * 0.92]} />
          </mesh>
          <mesh position={[-width / 2, -height / 2 + 0.015, 0]} material={edgeMaterial}>
            <boxGeometry args={[width, 0.03, thickness * 0.92]} />
          </mesh>
        </group>
      )}

      {/*Metallic cyan/violet accent trim on outer fore-edge of hardcovers*/}
      {isCover && (
        <mesh position={[-width - 0.004, 0, 0]}>
          <boxGeometry args={[0.012, height * 0.96, thickness * 1.02]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.35}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Front Face (+Z when theta = 0, Left side of spine) */}
      <mesh
        position={[-width / 2, 0, thickness / 2 + 0.0015]}
        castShadow
        receiveShadow
        onPointerMove={(e) => handleFaceMove(frontPage, e)}
        onClick={(e) => handleFaceClick(frontPage, e)}
      >
        <planeGeometry ref={frontGeoRef} args={[width, height, segX, segY]} />
        <meshStandardMaterial
          map={frontTexture}
          roughness={isCover ? 0.34 : 0.48}
          metalness={isCover ? 0.22 : 0.06}
        />
      </mesh>

      {/* Back Face (faces +Z when rotated theta = PI onto Right side of spine) */}
      <mesh
        position={[-width / 2, 0, -thickness / 2 - 0.0015]}
        rotation={[0, Math.PI, 0]}
        castShadow
        receiveShadow
        onPointerMove={(e) => handleFaceMove(backPage, e)}
        onClick={(e) => handleFaceClick(backPage, e)}
      >
        <planeGeometry ref={backGeoRef} args={[width, height, segX, segY]} />
        <meshStandardMaterial
          map={backTexture}
          roughness={isCover ? 0.34 : 0.48}
          metalness={isCover ? 0.22 : 0.06}
        />
      </mesh>
    </group>
  );
}

/**
 * Complete 3D Book Assembly + Responsive Camera Rig + Spring Physics Engine.
 */
function BookRig({
  portfolioData,
  targetSpread,
  focusedPage,
  mobileFocusMode,
  leafAnglesRef,
  leafVelocitiesRef,
  activeDragLeafRef,
  lastDragEndTimeRef,
  dragTargetAngleRef,
  isPointerDraggingRef,
  pointerParallaxRef,
  onHoverHotspot,
  onSelectHotspot,
  onLeafPointerDown,
  onSceneReady,
}) {
  const { gl, camera, size } = useThree();
  const rootGroupRef = useRef();
  const spineMeshRef = useRef();

  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;

  const textures = useMemo(() => {
    const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy?.() || 4);
    return createBookTextures(portfolioData, maxAniso);
  }, [portfolioData, gl]);

  useEffect(() => {
    onSceneReadyRef.current?.();
  }, []);

  useEffect(() => {
    return () => {
      textures.pageTextures.forEach((t) => t.dispose());
      textures.spineTexture.dispose();
      textures.paperEdgeTexture.dispose();
    };
  }, [textures]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // Update each of the 5 physical leaves with damped spring physics
    let openFractionSum = 0;
    for (let i = 0; i < 5; i += 1) {
      let desired = i < targetSpread ? Math.PI : 0;

      if (isPointerDraggingRef.current && activeDragLeafRef.current === i) {
        desired = dragTargetAngleRef.current;
        const diff = desired - leafAnglesRef.current[i];
        const step = diff * Math.min(1, dt * 22);
        leafVelocitiesRef.current[i] = step / Math.max(dt, 0.008);
        leafAnglesRef.current[i] += step;
      } else {
        // Staggered spring stiffness for cascading multi-page jumps
        const stiffness = 14.5;
        const damping = 0.8;
        const force = (desired - leafAnglesRef.current[i]) * stiffness;
        leafVelocitiesRef.current[i] =
          (leafVelocitiesRef.current[i] + force * dt) * Math.pow(damping, dt * 60 * 0.16);
        leafAnglesRef.current[i] += leafVelocitiesRef.current[i] * dt * 4.2;

        if (
          Math.abs(desired - leafAnglesRef.current[i]) < 0.0015 &&
          Math.abs(leafVelocitiesRef.current[i]) < 0.002
        ) {
          leafAnglesRef.current[i] = desired;
          leafVelocitiesRef.current[i] = 0;
        }
      }

      leafAnglesRef.current[i] = THREE.MathUtils.clamp(leafAnglesRef.current[i], 0, Math.PI);
      openFractionSum += leafAnglesRef.current[i] / Math.PI;
    }

    // Centering logic:
    // - All 0 (Closed Front Cover spanning [-W, 0]) -> shift X by +W/2 so cover is centered!
    // - Open spread (1..4 leaves flipped, spanning [-W, +W]) -> X = 0 so spine is centered!
    // - All 5 flipped (Closed Back Cover spanning [0, +W]) -> shift X by -W/2 so back cover is centered!
    const firstLeafOpen = leafAnglesRef.current[0] / Math.PI; // 0..1
    const lastLeafOpen = leafAnglesRef.current[4] / Math.PI; // 0..1
    let targetBookX = (1 - firstLeafOpen) * (PAGE_W * 0.5) - lastLeafOpen * (PAGE_W * 0.5);

    // On narrow mobile screens in single-page focus mode, shift camera/book to spotlight left or right page
    const isNarrowMobile = size.width < 720;
    if (isNarrowMobile && mobileFocusMode === 'single' && targetSpread >= 1 && targetSpread <= 4) {
      const isRightPage = focusedPage % 2 === 1;
      targetBookX += isRightPage ? -PAGE_W * 0.48 : PAGE_W * 0.48;
    }

    if (rootGroupRef.current) {
      rootGroupRef.current.position.x = THREE.MathUtils.lerp(
        rootGroupRef.current.position.x,
        targetBookX,
        Math.min(1, dt * 8)
      );

      // Subtle floating levitation + tactile 3D tilt
      const floatY = Math.sin(t * 1.35) * 0.04;
      rootGroupRef.current.position.y = THREE.MathUtils.lerp(
        rootGroupRef.current.position.y,
        floatY,
        Math.min(1, dt * 6)
      );

      const px = pointerParallaxRef.current.x;
      const py = pointerParallaxRef.current.y;
      const baseTiltX = isPointerDraggingRef.current ? -0.05 : -0.08 + py * 0.08;
      const baseTiltY = isPointerDraggingRef.current ? 0 : px * 0.11;

      rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        rootGroupRef.current.rotation.x,
        baseTiltX,
        Math.min(1, dt * 6)
      );
      rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        rootGroupRef.current.rotation.y,
        baseTiltY,
        Math.min(1, dt * 6)
      );
    }

    // Rotate sculpted spine cylinder subtly as the book transitions from front to back
    if (spineMeshRef.current) {
      const avgOpen = openFractionSum / 5;
      spineMeshRef.current.rotation.y = -Math.PI / 2 + avgOpen * Math.PI;
    }

    // Responsive Perspective Camera Framing (adapts cleanly to every desktop & phone aspect ratio)
    const aspect = Math.max(0.42, size.width / Math.max(1, size.height));
    const isClosed = targetSpread === 0 || targetSpread === 5;
    const singleFocused = isNarrowMobile && mobileFocusMode === 'single' && !isClosed;

    const neededWidth = isClosed
      ? PAGE_W * (isNarrowMobile ? 1.56 : 1.42)
      : singleFocused
      ? PAGE_W * 1.48
      : PAGE_W * (isNarrowMobile ? 2.46 : 2.34);
    const neededHeight = PAGE_H * (isNarrowMobile ? 1.48 : 1.34);

    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const distForHeight = neededHeight / (2 * Math.tan(fovRad / 2));
    const distForWidth = neededWidth / (2 * Math.tan(fovRad / 2) * aspect);
    const desiredCamZ = Math.max(4.6, distForHeight, distForWidth);

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredCamZ, Math.min(1, dt * 6));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.08, Math.min(1, dt * 6));
    camera.lookAt(0, -0.02, 0);
  });

  const spineHeight = PAGE_H + COVER_OVERHANG * 1.62;

  return (
    <group ref={rootGroupRef}>
      {/* Sculpted Hardcover Spine Binder along x = 0 */}
      <mesh ref={spineMeshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEP_Z * 2.75, STEP_Z * 2.75, spineHeight, 24, 1, false, 0, Math.PI]}
        />
        <meshStandardMaterial
          map={textures.spineTexture}
          roughness={0.38}
          metalness={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top & Bottom Metallic Spine Headbands */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[0, dir * (spineHeight / 2 - 0.02), 0]}>
          <cylinderGeometry args={[STEP_Z * 2.8, STEP_Z * 2.8, 0.04, 20]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#a855f7"
            emissiveIntensity={0.4}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* 5 Double-Sided Physical Leaves = 10 Exact Logical Pages */}
      {LEAF_PAGE_PAIRS.map((pair, idx) => (
        <BookLeaf
          key={idx}
          index={idx}
          isCover={pair.isCover}
          frontTexture={textures.pageTextures[pair.frontPage - 1]}
          backTexture={textures.pageTextures[pair.backPage - 1]}
          paperEdgeTexture={textures.paperEdgeTexture}
          leafAnglesRef={leafAnglesRef}
          leafVelocitiesRef={leafVelocitiesRef}
          activeDragLeafRef={activeDragLeafRef}
          lastDragEndTimeRef={lastDragEndTimeRef}
          onHoverHotspot={onHoverHotspot}
          onSelectHotspot={onSelectHotspot}
          onLeafPointerDown={onLeafPointerDown}
        />
      ))}
    </group>
  );
}

/**
 * Interactive 3D Book Stage with Mouse & Touchscreen Drag-to-Open / Drag-to-Flip Physics.
 */
export default function Book3DScene({
  portfolioData,
  currentSpread,
  focusedPage,
  mobileFocusMode,
  onSpreadChange,
  onSelectHotspot,
  onWrongDirectionNudge,
  onSceneReady,
}) {
  const stageRef = useRef(null);

  // Physics refs shared with 60fps R3F loop
  const leafAnglesRef = useRef([0, 0, 0, 0, 0]);
  const leafVelocitiesRef = useRef([0, 0, 0, 0, 0]);
  const activeDragLeafRef = useRef(-1);
  const lastDragEndTimeRef = useRef(0);
  const dragTargetAngleRef = useRef(0);
  const isPointerDraggingRef = useRef(false);
  const pointerParallaxRef = useRef({ x: 0, y: 0 });

  const gestureRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    movedEnough: false,
    direction: 0, // +1 = dragging RIGHT (open / flip forward), -1 = dragging LEFT (flip backward / close)
    dragLeaf: -1,
    nudgedWrongDir: false,
  });

  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const handleHoverHotspot = useCallback((spot) => {
    setHoveredHotspot((prev) => {
      if (!prev && !spot) return null;
      if (prev?.label === spot?.label) return prev;
      return spot;
    });
  }, []);

  const beginGesture = useCallback((clientX, clientY, pointerId) => {
    gestureRef.current = {
      active: true,
      pointerId,
      startX: clientX,
      startY: clientY,
      lastX: clientX,
      lastTime: performance.now(),
      velocityX: 0,
      movedEnough: false,
      direction: 0,
      dragLeaf: -1,
      nudgedWrongDir: false,
    };
  }, []);

  const handleLeafPointerDown = useCallback(
    (_leafIndex, e) => {
      const native = e.nativeEvent;
      if (!native) return;
      beginGesture(native.clientX, native.clientY, native.pointerId);
    },
    [beginGesture]
  );

  const handleStagePointerDown = useCallback(
    (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (!gestureRef.current.active) {
        beginGesture(e.clientX, e.clientY, e.pointerId);
      }
      try {
        stageRef.current?.setPointerCapture?.(e.pointerId);
      } catch {
        // Ignore capture errors on synthetic pointers
      }
    },
    [beginGesture]
  );

  const handleStagePointerMove = useCallback(
    (e) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        pointerParallaxRef.current = {
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
      }

      const g = gestureRef.current;
      if (!g.active) return;

      const now = performance.now();
      const dt = Math.max(1, now - g.lastTime);
      const stepDx = e.clientX - g.lastX;
      g.velocityX = 0.7 * g.velocityX + 0.3 * (stepDx / dt);
      g.lastX = e.clientX;
      g.lastTime = now;

      const totalDx = e.clientX - g.startX;
      const totalDy = e.clientY - g.startY;

      if (!g.movedEnough) {
        if (Math.hypot(totalDx, totalDy) < 7) return;

        // Lock drag direction once movement exceeds threshold
        if (totalDx > 0) {
          // Dragging RIGHT -> Opens closed front cover OR flips forward to next spread
          if (currentSpread < 5) {
            g.direction = 1;
            g.dragLeaf = currentSpread; // Leaf 0 when closed, Leaf 1 on spread 1, etc.
            g.movedEnough = true;
            isPointerDraggingRef.current = true;
            activeDragLeafRef.current = g.dragLeaf;
            dragTargetAngleRef.current = leafAnglesRef.current[g.dragLeaf];
            setIsGrabbing(true);
          }
        } else if (totalDx < 0) {
          // Dragging LEFT -> Flips backward OR closes front cover
          if (currentSpread > 0) {
            g.direction = -1;
            g.dragLeaf = currentSpread - 1;
            g.movedEnough = true;
            isPointerDraggingRef.current = true;
            activeDragLeafRef.current = g.dragLeaf;
            dragTargetAngleRef.current = leafAnglesRef.current[g.dragLeaf];
            setIsGrabbing(true);
          } else if (currentSpread === 0 && !g.nudgedWrongDir) {
            // Visitor dragged left on closed front cover: gently remind them to drag RIGHT to open!
            g.nudgedWrongDir = true;
            onWrongDirectionNudge?.();
          }
        }
      }

      if (g.movedEnough && g.dragLeaf >= 0) {
        const vw = rect?.width || window.innerWidth || 800;
        const fullFlipPx = Math.min(Math.max(vw * 0.32, 145), 360);

        if (g.direction === 1) {
          const ratio = THREE.MathUtils.clamp(totalDx / fullFlipPx, 0, 1);
          dragTargetAngleRef.current = ratio * Math.PI;
        } else if (g.direction === -1) {
          const ratio = THREE.MathUtils.clamp(-totalDx / fullFlipPx, 0, 1);
          dragTargetAngleRef.current = (1 - ratio) * Math.PI;
        }
      }
    },
    [currentSpread, onWrongDirectionNudge]
  );

  const finishGesture = useCallback(
    (e) => {
      const g = gestureRef.current;
      if (!g.active) return;

      try {
        if (g.pointerId != null) {
          stageRef.current?.releasePointerCapture?.(g.pointerId);
        }
      } catch {
        // Ignore release errors
      }

      if (g.movedEnough && g.dragLeaf >= 0) {
        lastDragEndTimeRef.current = performance.now();
        const currentAngle = dragTargetAngleRef.current;
        if (g.direction === 1) {
          const shouldCompleteOpen =
            currentAngle > Math.PI * 0.25 || g.velocityX > 0.32;
          if (shouldCompleteOpen) {
            onSpreadChange(Math.min(5, currentSpread + 1));
          } else {
            onSpreadChange(currentSpread);
          }
        } else if (g.direction === -1) {
          const shouldCompleteBack =
            currentAngle < Math.PI * 0.75 || g.velocityX < -0.32;
          if (shouldCompleteBack) {
            onSpreadChange(Math.max(0, currentSpread - 1));
          } else {
            onSpreadChange(currentSpread);
          }
        }

        // Prevent synthetic click immediately after drag release
        e?.stopPropagation?.();
      }

      g.active = false;
      g.movedEnough = false;
      g.dragLeaf = -1;
      isPointerDraggingRef.current = false;
      activeDragLeafRef.current = -1;
      setIsGrabbing(false);
    },
    [currentSpread, onSpreadChange]
  );

  let cursorStyle = 'grab';
  if (isGrabbing) {
    cursorStyle = 'grabbing';
  } else if (hoveredHotspot) {
    cursorStyle = 'pointer';
  }

  return (
    <div
      ref={stageRef}
      className="book-canvas-stage"
      style={{ cursor: cursorStyle }}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handleStagePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
      onPointerLeave={() => {
        pointerParallaxRef.current = { x: 0, y: 0 };
      }}
      role="region"
      aria-label="Interactive 3D Portfolio Book — Drag cover right to open"
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.1, 6.2], fov: 38, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.78} color="#dbeafe" />

        {/* Primary directional key light with crisp real-time 3D shadows */}
        <directionalLight
          position={[3.5, 5.5, 6.5]}
          intensity={1.55}
          color="#f8fafc"
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.0004}
          shadow-camera-near={1}
          shadow-camera-far={18}
          shadow-camera-left={-4.5}
          shadow-camera-right={4.5}
          shadow-camera-top={4.5}
          shadow-camera-bottom={-4.5}
        />

        {/* Futuristic Neon Rim Lights (Purple, Electric Blue, Cyber Cyan) */}
        <pointLight position={[-4.8, 2.6, 3.2]} intensity={1.8} color="#a855f7" distance={14} />
        <pointLight position={[4.8, -1.8, 3.5]} intensity={1.7} color="#22d3ee" distance={14} />
        <pointLight position={[0, 3.8, -2.5]} intensity={1.1} color="#3b82f6" distance={12} />

        {/* Subtle spatial cosmic particles */}
        <Sparkles
          count={55}
          scale={[11, 7, 5]}
          size={1.9}
          speed={0.28}
          opacity={0.45}
          color="#67e8f9"
        />

        <BookRig
          portfolioData={portfolioData}
          targetSpread={currentSpread}
          focusedPage={focusedPage}
          mobileFocusMode={mobileFocusMode}
          leafAnglesRef={leafAnglesRef}
          leafVelocitiesRef={leafVelocitiesRef}
          activeDragLeafRef={activeDragLeafRef}
          lastDragEndTimeRef={lastDragEndTimeRef}
          dragTargetAngleRef={dragTargetAngleRef}
          isPointerDraggingRef={isPointerDraggingRef}
          pointerParallaxRef={pointerParallaxRef}
          onHoverHotspot={handleHoverHotspot}
          onSelectHotspot={onSelectHotspot}
          onLeafPointerDown={handleLeafPointerDown}
          onSceneReady={onSceneReady}
        />

        {/* Grounded 3D Shadow & Ambient Rim beneath the floating hardcover book */}
        <GroundGlowShadow currentSpread={currentSpread} />
      </Canvas>

      {/* Floating Hotspot Tooltip when hovering interactive elements on Pages 5, 8, 9 */}
      {hoveredHotspot && !isGrabbing && (
        <div className="hotspot-floating-pill" aria-live="polite">
          <span className="hotspot-dot" />
          <span>{hoveredHotspot.label}</span>
        </div>
      )}
    </div>
  );
}
