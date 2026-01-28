# VR Dance Platform Walkthrough

![Final Club Visuals](file:///Users/paulhenshaw/.gemini/antigravity/brain/880f6408-9841-42ad-97e6-fdfaffadfdc2/final_club_state_1769621857858.png)

## How to Test on Desktop
Since your computer monitor is not a VR headset, the "VR NOT SUPPORTED" message is expected. We have enabled **Desktop Mode** for testing:

1.  **Click the Screen**: Click anywhere on the "Cosmic Club" title to start the audio engine.
2.  **Move Around**: Use your **Mouse** (Left Click + Drag) to rotate the camera.
3.  **Zoom**: Use the **Scroll Wheel** to move closer or further.
4.  **Pan**: Use **Right Click + Drag** to move the camera position.
5.  **Debug Mode**: Add `?debug=true` to the URL to auto-hide the overlay for faster iteration.

## Features Verified
-   **Audio Streaming**: Connects to `https://supersoul.site:8000/OSS-320`.
-   **Visual Effects**:
    -   **Pulse Floor**: Grid brightens with audio volume.
    -   **Particles**: Floating dust motes around the dance floor.
    -   **Lasers**: Green beams sweeping from the DJ booth.
-   **Environment**:
    -   **DJ Booth**: Procedural desk with decks and mixer.
    -   **Speakers**: Large stacks flanking the stage.

## Troubleshooting
-   **No Sound?**: Browsers block auto-playing audio. You MUST click the overlay initially.
-   **"VR NOT SUPPORTED"**: This is normal on a 2D screen. To test actual VR features (teleportation), you need a headset or the "Immersive Web Emulator" browser extension.
