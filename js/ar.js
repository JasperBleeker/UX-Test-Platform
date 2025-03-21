import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio * 0.75);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

console.log("🚀 Three.js AR scene initialized");

// Add AR Button
const sessionInit = { requiredFeatures: ['hit-test'] };

document.getElementById('arButton').addEventListener('click', async () => {
    if (navigator.xr) {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (supported) {
            const session = await navigator.xr.requestSession('immersive-ar', sessionInit);

            // 🔍 Debug: Check which reference space types are supported
            session.requestReferenceSpace('local-floor')
                .then(() => console.log("✅ 'local-floor' reference space is supported"))
                .catch(() => console.warn("❌ 'local-floor' reference space is NOT supported"));

            session.requestReferenceSpace('local')
                .then(() => console.log("✅ 'local' reference space is supported"))
                .catch(() => console.warn("❌ 'local' reference space is NOT supported"));

            session.requestReferenceSpace('viewer')
                .then(() => console.log("✅ 'viewer' reference space is supported"))
                .catch(() => console.warn("❌ 'viewer' reference space is NOT supported"));

            // 👇 Important fix to avoid crash
            const refSpace = await session.requestReferenceSpace('local');
            renderer.xr.setReferenceSpaceType('local');
            await renderer.xr.setSession(session);

            // ✅ Now allow touch interaction inside AR session
            renderer.domElement.style.pointerEvents = 'auto';

            console.log('✅ AR Session started!');
        } else {
            alert("AR not supported on this device.");
        }
    } else {
        alert("WebXR not available in this browser.");
    }
});


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 3, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// GLTF Loader
const loader = new GLTFLoader();
let placedObject = null;

// Reticle (hit test marker)
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let controller;

function initAR() {
    try {
        controller = renderer.xr.getController(0);
        scene.add(controller);
        console.log("✅ WebXR Controller initialized.");

        // Reticle (circle marker)
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        reticle = new THREE.Mesh(geometry, material);
        reticle.visible = false;
        scene.add(reticle);
        console.log("✅ Reticle initialized for hit testing.");

        controller.addEventListener('select', onSelect);
    } catch (error) {
        console.error("❌ Error initializing AR:", error);
    }
}

// WebXR Hit Test Source
function onXRFrame(time, frame) {
    const session = renderer.xr.getSession();
    if (!session) return;

    if (!hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then((refSpace) => {
            session.requestHitTestSource({ space: refSpace }).then((source) => {
                hitTestSource = source;
                console.log("✅ Hit test source initialized.");
            }).catch((err) => {
                console.error("❌ Failed to initialize hit test source:", err);
            });
        });
        hitTestSourceRequested = true;
    }

    if (hitTestSource && !placedObject) { // Only update when no object is placed
        const referenceSpace = renderer.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);

            // ✅ Ensure the reticle updates BEFORE first placement
            reticle.visible = true;
            reticle.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
            reticle.updateMatrixWorld(true);
        } else {

            reticle.visible = false; // Hide reticle only if no object exists

        }
    }

    renderer.render(scene, camera);
}


// Model Placement (Only One at a Time)
function onSelect() {
    if (!reticle.visible) {
        console.warn("⚠️ Reticle is not in a valid position yet.");
        return;
    }

    console.log("📍 Placing model at", reticle.position);

    if (placedObject) {
        console.log("🗑 Removing previous model...");
        scene.remove(placedObject);
        placedObject = null;
    }

    loader.load('/models/ChairExport.glb',
        function (gltf) {
            gltf.scene.position.set(reticle.position.x, reticle.position.y, reticle.position.z);
            gltf.scene.scale.set(1, 1, 1);

            gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            scene.add(gltf.scene);
            placedObject = gltf.scene;

            reticle.visible = false; // Hide reticle after placement
            console.log("✅ Model placed successfully at", gltf.scene.position);
        },
        undefined,
        function (error) {
            console.error("❌ Error loading model:", error);
        }
    );
}




// 🖐 Improved Gesture Controls (Drag & Rotate - Fixed)
let touchStartX, touchStartY, initialRotation;
const dragFactor = 0.005; // Adjusts drag speed

document.addEventListener('touchstart', (event) => {
    if (!placedObject) return;

    if (event.touches.length === 1) {
        // Start tracking single-finger drag
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
        // Start tracking rotation
        initialRotation = placedObject.rotation.y;
    }
}, false);

document.addEventListener('touchmove', (event) => {
    if (!placedObject) return;

    // Get camera forward direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Ignore vertical tilt

    if (event.touches.length === 1) {
        // 🎯 Fixed Dragging (Move Forward & Backward)
        const deltaX = (event.touches[0].clientX - touchStartX) * dragFactor;
        const deltaY = (event.touches[0].clientY - touchStartY) * dragFactor;

        // Move along the world XZ plane in the direction of the camera's view
        placedObject.position.addScaledVector(cameraDirection, -deltaY);
        placedObject.position.x += deltaX * Math.cos(camera.rotation.y);
        placedObject.position.z += deltaX * Math.sin(camera.rotation.y);

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
    else if (event.touches.length === 2) {
        // 🎯 Fixed Rotation Calculation
        const angle = Math.atan2(
            event.touches[1].clientY - event.touches[0].clientY,
            event.touches[1].clientX - event.touches[0].clientX
        );
        placedObject.rotation.y = initialRotation - angle; // Corrected rotation
    }
}, false);

document.addEventListener('touchstart', (e) => {
    console.log("👆 touchstart", e.touches.length);
}, false);

document.addEventListener('touchmove', (e) => {
    console.log("👉 touchmove");
}, false);



// Attach WebXR Frame Loop
renderer.setAnimationLoop((time, frame) => {
    onXRFrame(time, frame);
});

// Initialize AR Features
initAR();
