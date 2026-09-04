// Live AI Studio - Camera + AI Face Swap Controller

let cameraStream = null;
let selectedFaceImage = null;
let animationFrame = null;
let aiReady = false;
let processing = false;

const camera = document.getElementById("camera");
const output = document.getElementById("output");

function setStatus(message) {
    const status = document.getElementById("status");

    if (status) {
        status.textContent = message;
    }

    console.log("[Live AI Studio]", message);
}


// ==============================
// START CAMERA
// ==============================

async function startCamera() {
    try {
        setStatus("Starting camera...");

        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        camera.srcObject = cameraStream;

        await camera.play();

        if (output) {
            output.width = camera.videoWidth || 640;
            output.height = camera.videoHeight || 480;
        }

        setStatus("Camera started");

        // Load the AI models
        if (typeof window.loadSwapModels === "function") {
            setStatus("Loading AI models...");

            aiReady = await window.loadSwapModels();

            if (aiReady) {
                setStatus("AI ready");

                startProcessing();
            } else {
                setStatus("AI failed to load");
            }
        } else {
            setStatus("AI engine not found");
        }

    } catch (error) {

        console.error("Camera error:", error);

        setStatus("Camera permission failed");
    }
}


// ==============================
// CHOOSE SOURCE FACE
// ==============================

function chooseFace() {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async function () {

        const file = input.files && input.files[0];

        if (!file) return;

        setStatus("Loading face photo...");

        const image = new Image();

        image.onload = async function () {

            selectedFaceImage = image;

            console.log(
                "Source image:",
                image.width,
                "x",
                image.height
            );

            if (typeof window.setSourceFace === "function") {

                await window.setSourceFace(image);

                setStatus("Face photo selected");
            } else {

                setStatus("Face engine not ready");
            }

            URL.revokeObjectURL(image.src);
        };

        image.onerror = function () {

            setStatus("Could not load face photo");
        };

        image.src = URL.createObjectURL(file);
    };

    input.click();
}


// ==============================
// CHOOSE BACKGROUND
// ==============================

function chooseBackground() {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = function () {

        const file = input.files && input.files[0];

        if (!file) return;

        const image = new Image();

        image.onload = function () {

            window.selectedBackground = image;

            setStatus("Background selected");

            URL.revokeObjectURL(image.src);
        };

        image.onerror = function () {

            setStatus("Could not load background");
        };

        image.src = URL.createObjectURL(file);
    };

    input.click();
}


// ==============================
// REMOVE BACKGROUND
// ==============================

function removeBackground() {

    setStatus(
        "Background removal will be connected after face swap."
    );
}


// ==============================
// DRAW CAMERA
// ==============================

function drawCamera() {

    if (!camera || !output) return;

    const ctx = output.getContext("2d");

    if (!ctx) return;

    const width = output.width;
    const height = output.height;

    ctx.clearRect(0, 0, width, height);

    // Mirror the camera like a normal selfie camera
    ctx.save();

    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        camera,
        0,
        0,
        width,
        height
    );

    ctx.restore();
}


// ==============================
// AI PROCESSING LOOP
// ==============================

async function processFrame() {

    if (!camera || !output) return;

    if (camera.readyState < 2) return;

    // Nothing selected yet:
    // simply show the camera.
    if (!selectedFaceImage || !aiReady) {

        drawCamera();

        return;
    }

    // Prevent multiple ONNX operations
    // from running at the same time.
    if (processing) return;

    processing = true;

    try {

        setStatus("Detecting face...");

        if (typeof window.swapFace === "function") {

            const result = await window.swapFace(
                camera,
                output,
                selectedFaceImage
            );

            if (result) {

                setStatus("Face swap active");

            } else {

                // Until the actual swap engine returns
                // a processed frame, keep the camera visible.
                drawCamera();
            }

        } else {

            drawCamera();

            setStatus("Swap engine not found");
        }

    } catch (error) {

        console.error("Face processing error:", error);

        drawCamera();

        setStatus("Face processing error");

    } finally {

        processing = false;
    }
}


// ==============================
// START AI LOOP
// ==============================

function startProcessing() {

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    async function loop() {

        await processFrame();

        animationFrame = requestAnimationFrame(loop);
    }

    loop();
}


// ==============================
// STOP CAMERA
// ==============================

function stopCamera() {

    if (animationFrame) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;
    }

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    if (camera) {
        camera.srcObject = null;
    }

    setStatus("Camera stopped");
}


// ==============================
// BUTTON CONNECTIONS
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    const startButton =
        document.getElementById("startCamera");

    const faceButton =
        document.getElementById("chooseFace");

    const backgroundButton =
        document.getElementById("chooseBackground");

    const removeButton =
        document.getElementById("removeBackground");


    if (startButton) {

        startButton.addEventListener(
            "click",
            startCamera
        );
    }


    if (faceButton) {

        faceButton.addEventListener(
            "click",
            chooseFace
        );
    }


    if (backgroundButton) {

        backgroundButton.addEventListener(
            "click",
            chooseBackground
        );
    }


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            removeBackground
        );
    }


    setStatus("Ready");
});


// ==============================
// GLOBAL FUNCTIONS
// ==============================

window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.chooseFace = chooseFace;
window.chooseBackground = chooseBackground;
window.removeBackground = removeBackground;
window.processFrame = processFrame;
