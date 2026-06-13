import { useRef, useMemo, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { TorusKnot, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingShapes() {
  const group = useRef<THREE.Group>(null!);
  const shapes = useMemo(() => {
    const geo = [
      new THREE.IcosahedronGeometry(0.15, 0),
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.DodecahedronGeometry(0.1, 0),
    ];
    return Array.from({ length: 30 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 2,
      ] as [number, number, number],
      rot: (Math.random() - 0.5) * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
      geo: geo[i % geo.length],
      color: ["#f59e0b", "#fbbf24", "#fcd34d", "#a3e635", "#84cc16"][i % 5],
    }));
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <Float key={i} speed={s.speed} floatIntensity={0.5}>
          <mesh position={s.pos} rotation={[s.rot, s.rot, s.rot]}>
            <primitive object={s.geo} />
            <meshStandardMaterial
              color={s.color}
              transparent
              opacity={0.25}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function CoreKnot() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.15;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={0.5} floatIntensity={0.3}>
      <TorusKnot ref={mesh} args={[0.8, 0.3, 128, 16]} scale={1}>
        <MeshDistortMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.15}
          roughness={0.2}
          metalness={0.9}
          distort={0.15}
          speed={0.8}
          transparent
          opacity={0.6}
        />
      </TorusKnot>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 1500;
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      sz[i] = 0.005 + Math.random() * 0.025;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#fbbf24"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function MouseTracker({ children }: { children: ReactNode }) {
  const { pointer } = useThree();
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (group.current) {
      group.current.rotation.x = pointer.y * 0.05;
      group.current.rotation.y = pointer.x * 0.05;
    }
  });
  return <group ref={group}>{children}</group>;
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.4}
          color="#f59e0b"
        />
        <MouseTracker>
          <CoreKnot />
          <FloatingShapes />
        </MouseTracker>
        <Particles />
      </Canvas>
    </div>
  );
}
