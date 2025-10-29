# WebGL Context Loss Issue - Debugging

## Problem
WebGL context is being immediately lost after creation, causing the error:
```
THREE.WebGLRenderer: Context Lost.
Cannot read properties of null (reading 'alpha')
```

## Potential Causes

### 1. **React 19 + R3F Version Mismatch**
Your versions:
- React: 19.2.0 (very new)
- React Three Fiber: 9.4.0 (older)
- @react-three/drei: 10.7.6

**Issue:** R3F 9.4.0 might not be fully compatible with React 19.2.0

**Solution Options:**
a) Downgrade React to 18.x (more stable)
b) Upgrade R3F to latest version

### 2. **Hot Module Reload (HMR) Conflict**
Next.js HMR might be destroying and recreating the Canvas too quickly.

**Current Fixes Applied:**
- ✅ Added `mounted` state check
- ✅ Added `preserveDrawingBuffer: true`
- ✅ Added `Suspense` boundary
- ✅ Added loading placeholder

### 3. **Multiple Canvas Instances**
If React is rendering multiple times, it might create multiple WebGL contexts.

**Check:** Look in browser DevTools → Console for "[3D] Canvas created successfully" - if you see it multiple times rapidly, that's the issue.

### 4. **Browser Extension Interference**
The Solana Actions extension (`solanaActionsContentScript.js`) might be interfering.

**Test:** Try in incognito mode with extensions disabled.

## Recommended Actions

### Option A: Downgrade to React 18 (Most Stable)
```bash
npm install react@18.2.0 react-dom@18.2.0
npm install @react-three/fiber@latest @react-three/drei@latest
```

### Option B: Upgrade R3F to Latest
```bash
npm install @react-three/fiber@latest @react-three/drei@latest @react-three/postprocessing@latest
```

### Option C: Simplify the Scene
Remove complex components one by one:
1. Remove `Environment`
2. Remove `Sparkles`
3. Remove `MeshTransmissionMaterial`
4. Keep just the model

### Option D: Use Error Boundary
Add error boundary around Canvas to catch and log the exact issue.

## Current Configuration

```tsx
<Canvas
  dpr={dpr}
  gl={{ 
    antialias: true, 
    alpha: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,  // Prevents context loss
    failIfMajorPerformanceCaveat: false
  }}
  frameloop="always"
  onCreated={({ gl }) => {
    gl.setClearColor("#000000")
    console.log("[3D] Canvas created successfully")
  }}
>
```

## Debug Steps

1. **Check console for "[3D] Canvas created successfully"**
   - If missing: Canvas never initializes
   - If multiple times: React is re-rendering too much

2. **Check if model loads**
   - Open Network tab → Look for `solana-logo.glb` request
   - Should be 200 OK

3. **Disable browser extensions**
   - The Solana extension might be interfering with Canvas

4. **Try in different browser**
   - Chrome vs Firefox vs Safari

5. **Check GPU**
   - Open `chrome://gpu` to verify WebGL is working

## Temporary Workaround

If nothing works, we can use the alternative implementation (`hero-3d-three.tsx`) which uses raw Three.js instead of R3F. It's more verbose but might be more stable with React 19.

