# Sky Visibility Bug Report

## Symptom
The Skybox (Nebula Shader) appears briefly during initialization but then "disappears" or becomes invisible shortly after other assets (GLB files) load.

## Observations
- **Logs**: `scene.js` reports "Custom Nebula Shader added to scene."
- **Visuals**: User sees it initially, then it vanishes.
- **Console**: No specific shader errors in recent logs.

## Root Causes Identified
1.  **Fog Conflict**: The scene has `scene.fog = new THREE.FogExp2(...)`.
    - **Issue**: The Skybox material did not have `fog: false`.
    - **Result**: As the camera moves or fog renders, the deep black fog obscures the sky mesh, effectively "erasing" it.
    - **Fix Attempted**: Tried to add `fog: false` to `js/scene.js`.
    - **Status**: **FAILED**. Evidence suggests the file edit did not persist (logs show old behavior).

2.  **Far Clip Plane**:
    - **Issue**: Camera `far` is 1000. Skybox radius was 1000.
    - **Result**: Z-fighting or clipping can cause the mesh to flicker out of existence.
    - **Fix Attempted**: Reduced radius to 500.
    - **Status**: **FAILED**. File edit likely didn't persist.

3.  **File Persistence**:
    - **Critical Failure**: The code controlling speaker count (Models) and Sky settings (Scene) is **NOT UPDATING**. The logs show only 4 speakers loading, whereas the new code dictates 24.
    - **Conclusion**: The "Whack-a-Mole" effect is caused by the AI believing code is updated when it is effectively reverted or never applied.

## Corrective Actions
1.  **Force Write**: Do not use "patch" tools. Overwrite `js/scene.js` and `js/models.js` completely to guarantee the "Standard" settings are present.
2.  **Standardization**:
    - Sky: `fog: false`, Radius: 500, `Side: BackSide`.
    - Models: Loop explicitly 12 times.

## Tracking
- [ ] Force Overwrite `js/scene.js`
- [ ] Force Overwrite `js/models.js`
- [ ] Verify content matches "Wall of Sound" (24 speakers)
