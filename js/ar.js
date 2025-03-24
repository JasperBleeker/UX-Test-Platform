import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { XRGestures } from '../libs/XRGestures';


const gestures = new XRGestures( renderer );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

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
            console.log("✅ Canvas is now interactive");
            renderer.domElement.style.pointerEvents = 'auto';
            document.getElementById('arButton').style.display = 'none';

            setTimeout(() => {
                renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
                renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
            }, 100); // Let DOM update settle

            // Debug global touchstart
            window.addEventListener('touchstart', () => console.log('👋 GLOBAL touchstart fired'), { passive: false });


            // ✅attach gesture handlers
            renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
            renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });



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
            // console.log("📍 Reticle position:", reticle.position);
        } else {

            reticle.visible = false; // Hide reticle only if no object exists

        }
    }
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

            // ✅ Clean up the select listener
            controller.removeEventListener('select', onSelect);

            console.log("✅ Model placed successfully at", gltf.scene.position);
            console.log("Model position:", placedObject.position);
            console.log("Model scale:", placedObject.scale);
            console.log("Model visibility:", placedObject.visible);
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

function onTouchStart(event) {
    event.preventDefault(); // ⛔ Stops browser from hijacking gestures
    console.log("🖐 onTouchStart event:", event);
    if (!placedObject) return;

    if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
        initialRotation = placedObject.rotation.y;
    }

    console.log("👆 touchstart", event.touches.length);
}


function onTouchMove(event) {
    event.preventDefault(); // ⛔ Stops unwanted scrolling or zooming
    console.log("🖐 onTouchMove event:", event);
    if (!placedObject) return;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;

    if (event.touches.length === 1) {
        const deltaX = (event.touches[0].clientX - touchStartX) * dragFactor;
        const deltaY = (event.touches[0].clientY - touchStartY) * dragFactor;

        // Move along camera forward
        placedObject.position.addScaledVector(cameraDirection, -deltaY);

        // Compute right vector from forward
        const right = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
        placedObject.position.addScaledVector(right, deltaX);

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;

    }
    else if (event.touches.length === 2) {
        const angle = Math.atan2(
            event.touches[1].clientY - event.touches[0].clientY,
            event.touches[1].clientX - event.touches[0].clientX
        );
        placedObject.rotation.y = initialRotation - angle;
    }

    console.log("👉 touchmove");
}


// Attach WebXR Frame Loop
renderer.setAnimationLoop((time, frame) => {
    if (!frame) return;

    const session = renderer.xr.getSession();
    if (!session) return;

    const referenceSpace = renderer.xr.getReferenceSpace();

    if (!hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then((refSpace) => {
            session.requestHitTestSource({ space: refSpace }).then((source) => {
                hitTestSource = source;
                console.log("✅ Hit test source initialized.");
            });
        });
        hitTestSourceRequested = true;
    }

    if (hitTestSource && !placedObject) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose) {
                reticle.visible = true;
                reticle.position.set(
                    pose.transform.position.x,
                    pose.transform.position.y,
                    pose.transform.position.z
                );
                reticle.updateMatrixWorld(true);
                // console.log("📍 Reticle position:", reticle.position);
            }
        } else {
            reticle.visible = false;
        }
    }

    renderer.render(scene, camera);
});


// Initialize AR Features
initAR();
