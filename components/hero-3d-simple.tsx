"use client"

import * as React from "react"
import * as THREE from "three"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { useAnimations, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

interface Hero3DSceneProps {
  scrollProgress: number
}

// Error boundary for post-processing effects
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any) {
    console.warn("[3D] Post-processing disabled:", error.message)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Removed 3D particle layer to ensure a single, consistent particle system across all pages

function SolanaModel({ scrollProgress }: { scrollProgress: number }) {
  const group = React.useRef<any>(null)
  const modelCameraRef = React.useRef<THREE.Camera | null>(null)
  const { camera, set } = useThree()
  const smoothScrollRef = React.useRef(0)
  
  const gltf = useLoader(GLTFLoader as any, "/solana-logo.glb")
  
  const scene = gltf.scene
  const animations = gltf.animations
  const { actions, mixer, names } = useAnimations(animations, group)
  
  const actionName = "solana logo"
  const durationRef = React.useRef(animations?.[0]?.duration || 5)

  // Disabled baked camera to prevent mobile aspect ratio issues
  // Using the responsive Canvas camera instead for proper mobile rendering
  // React.useEffect(() => {
  //   if (gltf.cameras && gltf.cameras.length > 0) {
  //     const bakedCamera = gltf.cameras[0]
  //     console.log("[Model] Using baked camera:", bakedCamera.name)
  //     modelCameraRef.current = bakedCamera
  //     
  //     // Replace the scene camera with the baked one
  //     set({ camera: bakedCamera })
  //   }
  // }, [gltf, set])

  React.useEffect(() => {
    if (!actionName) return
    const action = actions[actionName]
    if (!action) return
    action.reset()
    action.play()
    action.paused = true
    durationRef.current = action.getClip().duration || durationRef.current
  }, [actions, actionName])

  useFrame((state, delta) => {
    // Smooth interpolation for scroll progress (lerp)
    smoothScrollRef.current += (scrollProgress - smoothScrollRef.current) * Math.min(delta * 4, 1)
    
    // Update animation based on smoothed scroll
    const action = actionName ? actions[actionName] : undefined
    if (action) {
      action.time = smoothScrollRef.current * durationRef.current
      mixer?.update(0)
    }
    
    // Using standard camera animation based on scroll progress
  })

  React.useEffect(() => {
    if (!scene) return
    
    // Make all materials visible and add emissive glow
    scene.traverse((child: any) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          mat.needsUpdate = true
          // Add enhanced glow to materials
          mat.emissive = new THREE.Color("#00F9FF")
          mat.emissiveIntensity = 0.3
        }
      }
    })
  }, [scene])

  return (
    <group ref={group} scale={1.2}>
      <primitive object={scene} />
    </group>
  )
}

export function Hero3DScene({ scrollProgress }: Hero3DSceneProps) {
  const [mounted, setMounted] = React.useState(false)
  const [hasWebGL, setHasWebGL] = React.useState(true)

  React.useEffect(() => {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
      }
    } catch (e) {
      setHasWebGL(false)
    }
    setMounted(true)
  }, [])

  if (!mounted || !hasWebGL) {
    return <div style={{ width: "100%", height: "100%", background: "#000" }} />
  }

  return (
    <Canvas
      dpr={1.5}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      camera={{ position: [0, 0, 1.2], fov: 60 }}
      style={{ width: "100%", height: "100%", background: "#000" }}
    >
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#000", 5, 15]} />
      
      {/* Enhanced lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.8} />
      <pointLight position={[-3, -3, 3]} intensity={0.8} color="#9945FF" />
      <pointLight position={[3, -2, -2]} intensity={0.6} color="#14F195" />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#00F9FF" />
      
      <React.Suspense fallback={null}>
        <SolanaModel scrollProgress={scrollProgress} />
        
        {/* 3D particles removed to keep particles consistent via global 2D canvas */}
        
        {/* Environment lighting for reflections */}
        <Environment preset="city" resolution={128} background={false} />
      </React.Suspense>
      
      {/* Post-processing effects with error handling */}
      <ErrorBoundary fallback={null}>
        <EffectComposer>
          <Bloom 
            intensity={0.5} 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.3} 
            mipmapBlur 
          />
        </EffectComposer>
      </ErrorBoundary>
    </Canvas>
  )
}

