// Live AI Studio - InsightFace browser engine

let detectorSession = null;
let recognitionSession = null;
let swapperSession = null;
let sourceEmbedding = null;
let modelsLoaded = false;

const DETECTOR_MODEL = "./det_10g.onnx";
const RECOGNITION_MODEL = "./w600k_r50 (1).onnx";
const SWAPPER_MODEL = "./inswapper_128.onnx";

function status(message) {
    const el = document.getElementById("status");
    if (el) el.textContent = message;
    console.log("[AI]", message);
}

async function loadModel(path, name) {
    status("Loading " + name + "...");

    const session = await ort.InferenceSession.create(path, {
        executionProviders: ["wasm"]
    });

    console.log(name + " inputs:", session.inputNames);
    console.log(name + " outputs:", session.outputNames);

    return session;
}

async function loadSwapModels() {
    try {
        if (!window.ort) {
            throw new Error("ONNX Runtime Web is not loaded");
        }

        detectorSession = await loadModel(
            DETECTOR_MODEL,
            "face detector"
        );

        recognitionSession = await loadModel(
            RECOGNITION_MODEL,
            "face recognition"
        );

        swapperSession = await loadModel(
            SWAPPER_MODEL,
            "face swapper"
        );

        modelsLoaded = true;

        status("AI models loaded ✅");

        return true;

    } catch (error) {
        console.error("MODEL LOAD ERROR:", error);

        window.aiLoadError =
            error && error.message
                ? error.message
                : String(error);

        status("AI ERROR: " + window.aiLoadError);

        return false;
    }
}


// SOURCE FACE
window.setSourceFace = async function(image) {

    if (!modelsLoaded) {
        throw new Error("AI models are not loaded");
    }

    if (!image) {
        throw new Error("No source face image");
    }

    sourceEmbedding = image;

    console.log(
        "Source face:",
        image.width,
        "x",
        image.height
    );

    status("Source face loaded");
};


// FACE DETECTION
async function detectFace(imageElement) {

    if (!detectorSession) {
        throw new Error("Detector model is not loaded");
    }

    console.log(
        "Detector inputs:",
        detectorSession.inputNames
    );

    console.log(
        "Detector outputs:",
        detectorSession.outputNames
    );

    return null;
}


// FACE SWAP
window.swapFace = async function(
    camera,
    output,
    sourceImage
) {

    if (!modelsLoaded || !sourceImage) {
        return false;
    }

    const ctx = output.getContext("2d");

    if (!ctx) {
        return false;
    }

    // Camera preview until the complete
    // detection/alignment/embedding pipeline is connected.
    ctx.save();

    ctx.translate(output.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
        camera,
        0,
        0,
        output.width,
        output.height
    );

    ctx.restore();

    return false;
};

console.log("Live AI Studio engine loaded");
