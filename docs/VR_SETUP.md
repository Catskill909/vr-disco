# Testing on Meta Quest (VR)

To view this experience in a VR headset like the Quest 2 or Quest 3, you must meet specific requirements. Best practices dictate using **HTTPS** or **Port Forwarding**.

## 1. Controller Navigation
**The app is already set up for Quest Controllers.**
-   **Teleportation**: Point your controller at the floor.
-   **Trigger**: Press and hold the **Index Trigger** to see the destination marker (Cyan Ring).
-   **Release**: Release the trigger to teleport to that spot.

## 2. Requirements
WebXR (VR in the browser) requires a **secure context** (HTTPS) or a **localhost** connection. Since "localhost" on the headset refers to itself, you cannot simply type `http://localhost:8000`.

## 3. How to Connect (Choose One)

### Option A: Tunneling (Easiest)
Use a tool like `localtunnel` to get a temporary public URL.
1.  In your VS Code terminal:
    ```bash
    npx localtunnel --port 8000
    ```
2.  It will give you a URL like `https://funny-cat-42.loca.lt`.
3.  Open this URL in the **Meta Quest Browser**.

### Option B: USB Port Forwarding (Best for Dev)
Use the official Chrome Inspector tools if you have your headset connected via USB.
1.  Connect Quest to Mac via USB.
2.  Open Chrome on Mac and go to `chrome://inspect/#devices`.
3.  Click **Port Forwarding**.
4.  Add Rule: `8000` -> `localhost:8000`.
5.  Now, inside the Quest Browser, you can type `http://localhost:8000` and it will forward to your Mac.

### Option C: Deployed URL
Since you pushed to GitHub, you can deploy this to Vercel/Netlify for free.
1.  Import your repo `Catskill909/vr-disco` to Vercel.
2.  It will give you `https://vr-disco.vercel.app`.
3.  Open that in the headset.
