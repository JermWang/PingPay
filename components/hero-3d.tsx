"use client"

import * as React from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber"
import { useAnimations, Environment, Sparkles, Text, MeshTransmissionMaterial } from "@react-three/drei"
import { useIsMobile } from "@/hooks/use-mobile"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

// Create a context to pass scroll progress from page level
const ScrollProgressContext = React.createContext(0)

function ModelFollower({ url }: { url: string }) {
  const group = React.useRef<any>(null)
  const gltf = useLoader(
    GLTFLoader,
    url,
    (loader: GLTFLoader) => {
      const draco = new DRACOLoader()
      draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/")
      loader.setDRACOLoader(draco)
    },
  )
  const scene = gltf.scene
  const animations = gltf.animations
  const { camera } = useThree()
  const { actions, mixer, names } = useAnimations(animations, group)
  const scrollProgress = React.useContext(ScrollProgressContext)

  const actionName = React.useMemo(() => names?.[0], [names])
  const durationRef = React.useRef(animations?.[0]?.duration || 5)

  React.useEffect(() => {
    if (!actionName) return
    const action = actions[actionName]
    if (!action) return
    action.reset()
    action.play()
    action.paused = true // we'll scrub time manually
    durationRef.current = action.getClip().duration || durationRef.current
  }, [actions, actionName])

  useFrame((state, dt) => {
    // Scrub animation time based on scroll progress from page (0..1)
    const t = scrollProgress
    const action = actionName ? actions[actionName] : undefined
    if (action) {
      action.time = t * durationRef.current
      mixer?.update(0) // ensure update
    }

    // Follow the model's world position
    if (group.current) {
      const target = new THREE.Vector3()
      group.current.getWorldPosition(target)

      const desiredX = target.x + 0.8
      const desiredY = target.y + 0.5
      const desiredZ = target.z + 1.8
      const lerp = 0.12
      camera.position.set(
        camera.position.x + (desiredX - camera.position.x) * lerp,
        camera.position.y + (desiredY - camera.position.y) * lerp,
        camera.position.z + (desiredZ - camera.position.z) * lerp,
      )
      camera.lookAt(target.x, target.y, target.z)
    }
  })

  React.useEffect(() => {
    if (!scene) return
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if ((mesh as any).isMesh) {
        mesh.castShadow = false
        mesh.receiveShadow = false
      }
    })
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.sub(center)
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    const targetRadius = 0.8
    if (sphere.radius > 0) {
      const factor = targetRadius / sphere.radius
      scene.scale.setScalar(factor)
    }
  }, [scene])

  return <primitive ref={group} object={scene} />
}

interface Hero3DSceneProps {
  scrollProgress: number
}

export function Hero3DScene({ scrollProgress }: Hero3DSceneProps) {
  const [mounted, setMounted] = React.useState(false)
  const isMobile = useIsMobile()
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2]

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render Canvas until client-side mounted
  if (!mounted) {
    return <div style={{ width: "100%", height: "100%", background: "#000" }} />
  }

  return (
    <ScrollProgressContext.Provider value={scrollProgress}>
      <Canvas
        dpr={dpr}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false
        }}
        camera={{ position: [0, 0.6, 2.2], fov: 50 }}
        style={{ width: "100%", height: "100%", background: "#000" }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor("#000000")
          console.log("[3D] Canvas created successfully")
        }}
      >
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />

        <React.Suspense fallback={null}>
          <ModelFollower url={"/solana-logo.glb"} />
          <ParallaxTitle />
          
          {/* Solana gradient particles using drei Sparkles (three lightweight layers) */}
          <Sparkles count={80} scale={[6, 6, 6]} size={1} speed={0.15} color="#9945FF" opacity={0.25} />
          <Sparkles count={80} scale={[6, 6, 6]} size={1} speed={0.18} color="#14F195" opacity={0.22} />
          <Sparkles count={80} scale={[6, 6, 6]} size={1} speed={0.20} color="#00FFA3" opacity={0.22} />
          <Environment preset="city" resolution={64} background={false} />
        </React.Suspense>
      </Canvas>
    </ScrollProgressContext.Provider>
  )
}



function ParallaxTitle() {
  const group = React.useRef<THREE.Group>(null)
  const glowPlane = React.useRef<THREE.Mesh>(null)
  const glassPlane = React.useRef<THREE.Mesh>(null)
  const scrollProgress = React.useContext(ScrollProgressContext)
  const { camera } = useThree()

  useFrame((state, dt) => {
    const t = scrollProgress
    const pointer = state.pointer

    // Gentle parallax based on pointer and scroll
    if (group.current) {
      const targetRotX = -pointer.y * 0.12 + (t - 0.5) * 0.08
      const targetRotY = pointer.x * 0.2
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.08
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.08

      const targetX = pointer.x * 0.25
      const targetY = pointer.y * 0.18 + (0.5 - t) * 0.2
      const targetZ = -0.2 - t * 0.4
      group.current.position.x += (targetX - group.current.position.x) * 0.08
      group.current.position.y += (targetY - group.current.position.y) * 0.08
      group.current.position.z += (targetZ - group.current.position.z) * 0.1
    }

    // Emissive response to camera and pointer
    if (glowPlane.current) {
      const mat = glowPlane.current.material as THREE.MeshStandardMaterial
      const camYaw = camera.rotation.y
      const reactivity = 0.35 + Math.min(0.65, Math.abs(pointer.x) * 0.6 + Math.abs(camYaw) * 0.2)
      mat.emissiveIntensity += (reactivity - mat.emissiveIntensity) * 0.08
    }
  })

  // Word rows and slight Z offsets for depth layering
  const line1 = [
    { text: "Pay", x: -1.35, z: 0.0 },
    { text: "Per", x: -0.35, z: -0.02 },
    { text: "Request", x: 0.7, z: -0.04 },
    { text: "APIs", x: 1.65, z: -0.06 },
  ] as const
  const line2 = [
    { text: "Powered", x: -0.9, z: -0.03 },
    { text: "by", x: -0.1, z: -0.05 },
    { text: "Solana", x: 0.7, z: -0.07 },
  ] as const

  return (
    <group ref={group} position={[0, 0, -0.8]}>
      {/* Glass-like refractive slab behind text */}
      <mesh ref={glassPlane} position={[0, 0.1, -0.82]}>
        <planeGeometry args={[4.2, 1.5, 1, 1]} />
        <MeshTransmissionMaterial
          resolution={256}
          thickness={0.25}
          roughness={0.2}
          transmission={1}
          ior={1.3}
          chromaticAberration={0.02}
          anisotropy={0.05}
          distortion={0.04}
          distortionScale={0.15}
          temporalDistortion={0.02}
          color="#9AFFEF"
          attenuationColor="#00F9FF"
          attenuationDistance={2.5}
        />
      </mesh>

      {/* Emissive glow plane responding to motion */}
      <mesh ref={glowPlane} position={[0, 0.1, -0.81]}>
        <planeGeometry args={[4.25, 1.55]} />
        <meshStandardMaterial color="#00F9FF" emissive="#00F9FF" emissiveIntensity={0.35} transparent opacity={0.08} />
      </mesh>

      {/* Title words - front line */}
      {line1.map((w, i) => (
        <Text
          key={`l1-${i}`}
          position={[w.x, 0.45, w.z]}
          fontSize={0.3}
          color="#F5F5F5"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#00F9FF"
        >
          {w.text}
        </Text>
      ))}

      {/* Subtitle words - second line */}
      {line2.map((w, i) => (
        <Text
          key={`l2-${i}`}
          position={[w.x, -0.05, w.z]}
          fontSize={0.22}
          color="#9AFFEF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#00F9FF"
        >
          {w.text}
        </Text>
      ))}
    </group>
  )
}
