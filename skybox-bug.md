# Skybox Bug Investigation

## Issue Description
- **Symptom**: Skybox is black/invisible. User reported "still no skybox" and "still to many particles".
- **Particles**: The "particles" seen were confirmed to be from `visual-effects.js` (Audio Visualizer), not the skybox stars.
- **Current State**: The application runs (particles are visible), implying `scene.js` executes without a hard crash, but the backing Nebula texture is not visible.

## Current Implementation
- **Library**: `@flodlc/nebula` (via `esm.sh`).
- **Method**:
  1.  Create a detached `<div>` container.
  2.  Run `createNebula(container, ...)` which appends a `<canvas>`.
  3.  Create `THREE.CanvasTexture(canvas)`.
  4.  Map texture to `THREE.SphereGeometry` (BackSide).
  5.  Update `texture.needsUpdate = true` in loop.

## Potential Failure Points

### 1. Import/Dependency Issue
- **Risk**: High.
- **Detail**: `esm.sh` might be serving a React-dependent version of the library if not specified otherwise. If `createNebula` fails silently or throws an error that allows execution to continue (unlikely in module top-level), the canvas stays empty.
- **Check**: Browser Console for "Uncaught TypeError" or "Module not found".

### 2. Canvas Rendering (The "Black Canvas" Theory)
- **Risk**: High.
- **Detail**: The 2D library might rely on the canvas being "visible" in the DOM for its internal sizing or animation loop (e.g., using `ResizeObserver` or checking visibility).
- **Test**: Force the raw 2D canvas to sit **on top** of the 3D scene (`z-index: 10000`) to see if it's drawing anything.

### 3. Texture Map Issue
- **Risk**: Medium.
- **Detail**: The `CanvasTexture` might not be grabbing the context if the canvas is 0x0 size at moment of creation.
- **Check**: We explicitly set `width/height` in `scene.js`.

### 4. Camera/Sphere Clipping
- **Risk**: Low.
- **Detail**: `Sphere` is radius 600. Camera far plane is 1000. It should be visible.

## Debugging Plan
1.  **Isolation Test**: Change `z-index` of the Nebula Container to `9999` and `opacity: 1`.
    -   *Goal*: See if the 2D canvas appears over the 3D scene.
    -   *Result A (Canvas Visible)*: Library works. Issue is Texture mapping.
    -   *Result B (Canvas Empty/White)*: Library is not drawing. Issue is Import or Config.
2.  **Console Check**: (User dependent) Ask user to look for red errors.

## Next Step
- Apply "Isolation Test" to `js/scene.js`.
