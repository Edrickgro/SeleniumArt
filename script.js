//    @ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//add variance to each filter
//construction: repeated or not repeated, variance with object placement, allow overlap with objects?
//steps:
//1. grab objects and place them on scene
//2. for each pixel in an object, calculate LBP value (unless its an edge), kmeans value
let cannyButton = document.getElementById("canny-button");
let cannyCanvas = document.getElementById("canny-canvas");
let cannySelectSource = document.getElementById("canny-select-source");
let cannyMaxSlider = document.getElementById("canny-max-slider");
let cannyMinSlider = document.getElementById("canny-min-slider");
let cannyMaxOutput = document.getElementById("canny-max-output");
let cannyMinOutput = document.getElementById("canny-min-output");
let kmeansButton = document.getElementById("kmeans-button");
let kmeansCanvas = document.getElementById("kmeans-canvas");
let objectsButton = document.getElementById("objects-detect-button");
let objectsCanvas = document.getElementById("objects-canvas");
let objectsThresholdButton = document.getElementById("objects-threshold-button");
let objectsDetectThreshold = document.getElementById("objects-detect-threshold-button");
let objectsDetectPixelButton = document.getElementById("objects-detect-pixel-threshold-button");
let strict = document.getElementById("strict");
let dogCanvas = document.getElementById("dog-canvas");
let dogButton = document.getElementById("dog-button");
let generateButton = document.getElementById("generate-button");
let generateCanvas = document.getElementById("generate-canvas");
let kmeansNumColors = document.getElementById("kmeans-num-colors");
let varianceInput = document.getElementById("variance-input");
let numColorBoxes = document.getElementById("num-color-boxes");
let objectPixelThreshold = document.getElementById("object-pixel-threshold");
let factor = document.getElementById("factor");
let emptyFill = document.getElementById("generate-empty-fill");
let settings_valid = true;
let objects_distance_threshold = 1;
let objects_detect_distance_threshold = 1;
let objects_detect_pixel_threshold = 0;
let kmeans_num_colors = 1;
let allow_overlap = true;
let is_repeated = false;
//    let object_variance = 5;
let buttonWorker = document.getElementById("worker-button");
let kButton = document.getElementById("k-button");
var objects_identified = [];
const cv = new CV();
objectsButton.addEventListener("click", () => objectsClick(), false);
function objectsClick() {
    return __awaiter(this, void 0, void 0, function* () {
        let objects_distance_threshold = parseInt(objectsThresholdButton.value);
        let objects_detect_distance_threshold = parseInt(objectsDetectThreshold.value);
        let objects_detect_pixel_threshold = parseInt(objectsDetectPixelButton.value);
        let strict_value = parseInt(strict.value);
        objectsCanvas.style.animationPlayState = "running";
        const imageData = cannyCanvas.getContext("2d").getImageData(0, 0, cannyCanvas.width, cannyCanvas.height).data;
        yield cv.load();
        const processedImage = yield cv.imageProcessing("fill", [imageData, image_width, objects_distance_threshold, objects_detect_distance_threshold, objects_detect_pixel_threshold, strict_value]);
        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);
        objectsCanvas.height = image_height;
        objectsCanvas.width = image_width;
        objectsCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, objectsCanvas.width, objectsCanvas.height);
        objects_identified = processedImage.data.payload[1];
        objectsCanvas.style.animationPlayState = "paused";
    });
}
dogButton.addEventListener("click", () => dogClick(), false);
function dogClick() {
    return __awaiter(this, void 0, void 0, function* () {
        dogCanvas.style.animationPlayState = "running";
        const image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        yield cv.load();
        // Processing image
        const processedImage = yield cv.imageProcessing("dog", [image]);
        dummyctx.putImageData(processedImage.data.payload, 0, 0);
        dogCanvas.height = image_height;
        dogCanvas.width = image_width;
        dogCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, dogCanvas.width, dogCanvas.height);
        dogCanvas.style.animationPlayState = "paused";
    });
}
kmeansButton.addEventListener("click", () => kmeansClick(), false);
function kmeansClick() {
    return __awaiter(this, void 0, void 0, function* () {
        kmeans_num_colors = parseInt(kmeansNumColors.value);
        kmeansCanvas.style.animationPlayState = "running";
        const image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);
        // Load the model
        yield cv.load();
        // Processing image
        const processedImage = yield cv.imageProcessing("kmeans", [image, kmeans_num_colors]);
        dummyctx.putImageData(processedImage.data.payload, 0, 0);
        kmeansCanvas.height = image_height;
        kmeansCanvas.width = image_width;
        kmeansCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, kmeansCanvas.width, kmeansCanvas.height);
        kmeansCanvas.style.animationPlayState = "paused";
        // Render the processed image to the canvas
    });
}
cannyButton.addEventListener("click", () => cannyClick(), false);
function cannyClick() {
    return __awaiter(this, void 0, void 0, function* () {
        let min_set = parseInt(cannyMinSlider.value);
        let max_set = parseInt(cannyMaxSlider.value);
        if (min_set < max_set) {
            let image = 0;
            if (cannySelectSource.value == "kMeans") {
                image = kmeansCanvas.getContext("2d").getImageData(0, 0, kmeansCanvas.width, kmeansCanvas.height);
            }
            else {
                image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            }
            cannyCanvas.style.animationPlayState = "running";
            // const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
            // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);
            yield cv.load();
            const processedImage = yield cv.imageProcessing("canny", [image, min_set, max_set]);
            dummyctx.putImageData(processedImage.data.payload, 0, 0);
            cannyCanvas.height = image_height;
            cannyCanvas.width = image_width;
            cannyCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, cannyCanvas.width, cannyCanvas.height);
            cannyCanvas.style.animationPlayState = "paused";
        }
    });
}
generateButton.addEventListener("click", () => generateClick(), false);
function generateClick() {
    return __awaiter(this, void 0, void 0, function* () {
        generateCanvas.style.animationPlayState = "running";
        let object_variance = parseInt(varianceInput.value);
        let texture_threshold = parseInt(numColorBoxes.value);
        let object_pixel_threshold = parseInt(objectPixelThreshold.value);
        let factor_value = parseInt(factor.value);
        let empty_fill_value = emptyFill.value == "common" ? 1 : 0;
        //const objects_identified;
        const cannyData = cannyCanvas.getContext("2d").getImageData(0, 0, cannyCanvas.width, cannyCanvas.height).data;
        const LBPData = LBPCanvas.getContext("2d").getImageData(0, 0, LBPCanvas.width, LBPCanvas.height).data;
        const kMeansData = kmeansCanvas.getContext("2d").getImageData(0, 0, kmeansCanvas.width, kmeansCanvas.height).data;
        yield cv.load();
        const processedImage = yield cv.imageProcessing("generate", [cannyData, LBPData, kMeansData,
            objects_identified, allow_overlap, is_repeated, object_variance, image_width, texture_threshold,
            object_pixel_threshold, factor_value, empty_fill_value]);
        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);
        generateCanvas.height = image_height;
        generateCanvas.width = image_width;
        generateCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, generateCanvas.width, generateCanvas.height);
        generateCanvas.style.animationPlayState = "paused";
    });
}
cannyMaxSlider.addEventListener("input", (e) => {
    cannyMaxOutput.textContent = e.target.value;
});
cannyMinSlider.addEventListener("input", (e) => {
    cannyMinOutput.textContent = e.target.value;
});
