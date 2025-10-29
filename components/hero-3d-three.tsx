    "use client"

import * as React from "react"
import * as THREE from "three"
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

export default function Hero3DSceneThree() {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000)
    camera.position.set(0, 0.4, 2.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      position: "absolute",
      inset: "0",
      border: "1px solid rgba(0,255,163,0.18)",
    } as CSSStyleDeclaration)
    console.log("3D container size (mount):", container.clientWidth, container.clientHeight)

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    const hemi = new THREE.HemisphereLight(0x9affef, 0x0a0a0b, 0.6)
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(3, 3, 3)
    scene.add(ambient, hemi, dir)

    // Particles (Solana gradient)
    const particleGroup = new THREE.Group()
    const count = 300
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [new THREE.Color("#9945FF"), new THREE.Color("#14F195"), new THREE.Color("#00FFA3")]
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = 2.5 + Math.random() * 1.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i3 + 0] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({ size: 0.02, transparent: true, opacity: 0.28, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })
    const points = new THREE.Points(geo, mat)
    particleGroup.add(points)
    scene.add(particleGroup)

    // GLB model + animation
    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/")
    loader.setDRACOLoader(draco)
    let model: THREE.Object3D | null = null
    let mixer: THREE.AnimationMixer | null = null
    let action: THREE.AnimationAction | null = null
    let clipDuration = 5
    let followOffset = new THREE.Vector3(0, 0.25, 1.8)
    let boxHelper: THREE.BoxHelper | null = null
    let axesHelper: THREE.AxesHelper | null = null

    const rawPaths = ["/solana-logo.glb", "/solana%20logo.glb", "/solana logo.glb"]
    const urls = rawPaths.map((p) => {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      // Use encodeURI for paths with spaces
      const path = p.includes("%20") ? p : encodeURI(p)
      return base + path
    })

    const onLoad = (gltf: GLTF) => {
      const root = gltf.scene as THREE.Object3D
      model = root
      root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh
          m.castShadow = false
          m.receiveShadow = false
        }
      })
      // Center and scale to fit view
      const box = new THREE.Box3().setFromObject(root)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())

      // Re-center model at origin
      root.position.x += -center.x
      root.position.y += -center.y
      root.position.z += -center.z

      // Normalize model scale to a target radius so it fits camera comfortably
      const sphere = new THREE.Sphere()
      box.getBoundingSphere(sphere)
      const targetRadius = 0.8
      if (sphere.radius > 0 && Math.abs(sphere.radius - targetRadius) / targetRadius > 0.15) {
        const factor = targetRadius / sphere.radius
        root.scale.multiplyScalar(factor)
        // Recompute after scaling
        box.setFromObject(root)
        box.getBoundingSphere(sphere)
      }
      let dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov * 0.5))) * 1.1
      // Clamp distance to ensure it's within the far plane and visible size
      dist = Math.min(Math.max(dist, 2.2), 8)
      camera.position.set(0, 0.25, dist)
      followOffset.set(0, 0.25, dist)
      camera.lookAt(0, 0, 0)

      scene.add(root)
      // Debug helpers to ensure visibility and positioning
      boxHelper = new THREE.BoxHelper(root, 0x00ffa3)
      ;(boxHelper.material as THREE.LineBasicMaterial).depthTest = false
      boxHelper.renderOrder = 999
      scene.add(boxHelper)
      axesHelper = new THREE.AxesHelper(0.5)
      scene.add(axesHelper)

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(root)
        const preferred = gltf.animations.find((c) => c.name?.toLowerCase().includes("curve")) || gltf.animations[0]
        action = mixer.clipAction(preferred)
        action.enabled = true
        action.setEffectiveWeight(1)
        action.play()
        action.paused = true
        clipDuration = preferred.duration || clipDuration
      }
      console.log("GLB loaded:", {
        animations: gltf.animations?.map((a: THREE.AnimationClip) => a.name),
        size: { x: size.x, y: size.y, z: size.z },
      })
    }

    const tryLoad = async () => {
      // Attempt fetch+parse first to avoid any loader URL quirks, then fall back to loader.load
      for (const url of urls) {
        console.log("Trying GLB fetch:", url)
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const buf = await res.arrayBuffer()
          await new Promise<void>((resolve, reject) => {
            loader.parse(buf, "", (g: GLTF) => {
              onLoad(g)
              resolve()
            }, reject)
          })
          console.log("GLB fetch+parse success:", url)
          return
        } catch (e) {
          // continue
        }
      }
      // Fallback to loader.load
      let i = 0
      const attempt = () => {
        if (i >= urls.length) {
          console.error("Failed to load GLB from all paths:", urls)
          return
        }
        const url = urls[i++]
        console.log("Trying GLB loader.load:", url)
        loader.load(url, onLoad, undefined, () => attempt())
      }
      attempt()
    }
    void tryLoad()

    // Scroll -> progress (0..1)
    const pages = 3
    let scrollProgress = 0
    const updateScroll = () => {
      const max = Math.max(1, window.innerHeight * (pages - 1))
      scrollProgress = Math.max(0, Math.min(1, window.scrollY / max))
    }
    updateScroll()
    window.addEventListener("scroll", updateScroll, { passive: true })

    // Resize
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      console.log("3D container size (resize):", w, h)
    }
    window.addEventListener("resize", onResize)

    // Animation loop
    let raf = 0
    const target = new THREE.Vector3()
    const animate = () => {
      // Scrub animation time from scroll
      if (mixer) {
        mixer.setTime(scrollProgress * clipDuration)
      }

      // Camera follow (lerp to model position + offset)
      if (model) {
        model.getWorldPosition(target)
        const desiredX = target.x + followOffset.x
        const desiredY = target.y + followOffset.y
        const desiredZ = target.z + followOffset.z
        const lerp = 0.12
        camera.position.set(
          camera.position.x + (desiredX - camera.position.x) * lerp,
          camera.position.y + (desiredY - camera.position.y) * lerp,
          camera.position.z + (desiredZ - camera.position.z) * lerp,
        )
        camera.lookAt(target.x, target.y, target.z)
      }

      // Particle drift
      particleGroup.rotation.y += 0.0008

      if (boxHelper && model) boxHelper.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    onResize()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", updateScroll)
      container.removeChild(renderer.domElement)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (boxHelper) scene.remove(boxHelper)
      if (axesHelper) scene.remove(axesHelper)
    }
  }, [])

  return <div ref={containerRef} className="relative w-full h-full" />
}
