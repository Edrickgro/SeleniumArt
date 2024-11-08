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
let loader = document.getElementById("loader");
let cannyButton = document.getElementById("canny-button");
let cannyCanvas = document.getElementById("canny-canvas");
let cannySelectSource = document.getElementById("canny-select-source");
let cannyMaxSlider = document.getElementById("canny-max-slider");
let cannyMinSlider = document.getElementById("canny-min-slider");
let cannyMaxOutput = document.getElementById("canny-max-output");
let cannyMinOutput = document.getElementById("canny-min-output");
let kmeansButton = document.getElementById("kmeans-button");
let kmeansCanvas = document.getElementById("kmeans-canvas");
let kmeansSelectSource = document.getElementById("kmeans-select-source");
let objectsButton = document.getElementById("objects-detect-button");
let objectsCanvas = document.getElementById("objects-canvas");
let objectsThresholdButton = document.getElementById("objects-threshold-button");
let objectsDetectThreshold = document.getElementById("objects-detect-threshold-button");
let objectsDetectPixelButton = document.getElementById("objects-detect-pixel-threshold-button");
let strict = document.getElementById("strict");
let dogCanvas = document.getElementById("dog-canvas");
let dogButton = document.getElementById("dog-button");
let dogstdcInput = document.getElementById("dog-stdc-input");
let dogstdeInput = document.getElementById("dog-stde-input");
let dogkInput = document.getElementById("dog-k-input");
let dogtInput = document.getElementById("dog-t-input");
let dogoInput = document.getElementById("dog-o-input");
let dogeInput = document.getElementById("dog-e-input");
let dogstdmInput = document.getElementById("dog-stdm-input");
let dogColorType = document.getElementById("dog-color-type");
let dogSelectSource = document.getElementById("dog-select-source");
let dogFactor = document.getElementById("dog-factor-input");
let videoCanvas = document.getElementById("videoCanvas");
let videoDogCheck = document.getElementById("video-dog-checkbox");
let videoLBPCheck = document.getElementById("video-lbp-checkbox");
let videoObjectsCheck = document.getElementById("video-objects-checkbox");
let videoStartButton = document.getElementById("video-start");
let videoPauseButton = document.getElementById("video-pause");
let videoEndButton = document.getElementById("video-stop");
let videoProgressBar = document.getElementById("video-progress-bar");
let videoProgressBarLabel = document.getElementById("video-progress-bar-label");
let videoStartTimeElement = document.getElementById("video-time-start");
let videoStepTimeElement = document.getElementById("video-time-step");
let videoPaused = false;
let generateButton = document.getElementById("generate-button");
let generateCanvas = document.getElementById("generate-canvas");
let kmeansNumColors = document.getElementById("kmeans-num-colors");
let kmeansFactor = document.getElementById("kmeans-factor-input");
let varianceInput = document.getElementById("variance-input");
let numColorBoxes = document.getElementById("num-color-boxes");
let objectPixelThreshold = document.getElementById("object-pixel-threshold");
let factor = document.getElementById("factor");
let emptyFill = document.getElementById("generate-empty-fill");
let colorFill = document.getElementById("generate-color-fill");
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
let videoTime = 0;
let videoStep = 0;
let videoWidth = 0;
let videoHeight = 0;
videoFileElement.addEventListener("change", (e) => {
    let videoElement = document.createElement("VIDEO");
    videoElement.id = "video";
    document.body.appendChild(videoElement);
    let media = URL.createObjectURL(e.target.files[0]);
    videoElement.src = media;
    videoElement.style.display = "none";
    videoElement.addEventListener('loadeddata', function () {
        this.currentTime = 0;
        videoWidth = this.videoWidth;
        videoHeight = this.videoHeight;
        videoCanvasSet(videoElement);
        setVideoFrame(videoElement);
    });
});
let videobutton = document.getElementById("video-start");
videobutton.addEventListener("click", function () {
    videoTime = parseFloat(videoStartTimeElement.value);
    videoStep = parseFloat(videoStepTimeElement.value);
    loader.style.animationPlayState = "running";
    videoClick();
}, false);
videoPauseButton.addEventListener("click", () => {
    if (videoPaused == false) {
        videoPauseButton.innerHTML = "Resume";
        loader.style.animationPlayState = "paused";
        videoPaused = true;
    }
    else {
        videoPauseButton.innerHTML = "Pause";
        loader.style.animationPlayState = "running";
        videoPaused = false;
        videoClick();
    }
}, false);
let mediaRecorder = recordSetup(generateCanvas);
mediaRecorder.pause();
let framesProcessed = 0;
function videoClick() {
    return __awaiter(this, void 0, void 0, function* () {
        if (videoTime <= video.duration) {
            videoTime += videoStep;
            video.currentTime = videoTime;
            yield setVideoFrame(video);
            if (videoDogCheck.checked)
                yield dogClick();
            if (videoObjectsCheck.checked) {
                yield cannyClick();
                yield objectsClick();
            }
            yield kmeansClick();
            if (videoLBPCheck.checked)
                yield LBPClick();
            yield resumeMedia();
            yield generateClick();
            yield requestVideoFrame();
            yield pauseMedia();
            framesProcessed++;
            if (framesProcessed % 20 == 0) {
                workerLoaded = false;
                console.log("LOADED NEW WORKER");
            }
            if (!videoPaused) {
                videoClick();
            }
            videoProgressBar.value = (videoTime / video.duration) * 100;
            videoProgressBarLabel.innerHTML = "Progress: " + Math.min(Math.round((videoTime / video.duration) * 100), 100) + "%";
            //capture frame into blob here
        }
        else {
            console.log("FINISHED");
            mediaRecorder.stop();
        }
    });
}
function resumeMedia() {
    return __awaiter(this, void 0, void 0, function* () {
        mediaRecorder.resume();
    });
}
function pauseMedia() {
    return __awaiter(this, void 0, void 0, function* () {
        mediaRecorder.pause();
    });
}
videoEndButton.addEventListener("click", () => {
    videoPaused = true;
    loader.style.animationPlayState = "paused";
    mediaRecorder.stop();
}, false);
function recordSetup(canvas) {
    let recordedChunks = [];
    let stream = canvas.captureStream();
    let mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs:vp9"
        // mimeType: "video/webm;codecs=opus,vp9"
    });
    mediaRecorder.start();
    mediaRecorder.ondataavailable = function (event) {
        recordedChunks.push(event.data);
    };
    mediaRecorder.onstop = function (event) {
        loader.style.animationPlayState = "paused";
        let blob = new Blob(recordedChunks, { type: "video/webm" });
        let url = URL.createObjectURL(blob);
        videoTime = 0;
        var videoOutput = document.createElement('VIDEO');
        videoOutput.controls = true;
        let videoContainer = document.getElementById("video-container");
        videoContainer.style.display = "block";
        videoContainer.appendChild(videoOutput);
        videoOutput.setAttribute('src', url);
    };
    return mediaRecorder;
}
function requestVideoFrame() {
    return __awaiter(this, void 0, void 0, function* () {
        mediaRecorder.requestData();
    });
}
let workerLoaded = false;
objectsButton.addEventListener("click", () => objectsClick(), false);
function objectsClick() {
    return __awaiter(this, void 0, void 0, function* () {
        let objects_distance_threshold = parseInt(objectsThresholdButton.value);
        let objects_detect_distance_threshold = parseInt(objectsDetectThreshold.value);
        let objects_detect_pixel_threshold = parseInt(objectsDetectPixelButton.value);
        let strict_value = parseInt(strict.value);
        objectsCanvas.style.animationPlayState = "running";
        const imageData = cannyCanvas.getContext("2d").getImageData(0, 0, cannyCanvas.width, cannyCanvas.height).data;
        if (!workerLoaded)
            yield cv.load();
        const processedImage = yield cv.imageProcessing("fill", [imageData, image_width, objects_distance_threshold, objects_detect_distance_threshold, objects_detect_pixel_threshold, strict_value]);
        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);
        objectsCanvas.height = image_height;
        objectsCanvas.width = image_width;
        objectsCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, objectsCanvas.width, objectsCanvas.height);
        objects_identified = processedImage.data.payload[1];
        workerLoaded = true;
        objectsCanvas.style.animationPlayState = "paused";
    });
}
dogButton.addEventListener("click", () => dogClick(), false);
function dogClick() {
    return __awaiter(this, void 0, void 0, function* () {
        dogCanvas.style.animationPlayState = "running";
        let std_e = parseFloat(dogstdeInput.value);
        let std_c = parseFloat(dogstdcInput.value);
        let std_m = parseFloat(dogstdmInput.value);
        let k = parseFloat(dogkInput.value);
        let t = parseFloat(dogtInput.value);
        let o = parseFloat(dogoInput.value);
        let e = parseFloat(dogeInput.value);
        let colorType = dogColorType.value == "bw" ? 1 : 0;
        let dog_factor = parseFloat(dogFactor.value);
        let image = 0;
        if (dogSelectSource.value == "kMeans") {
            image = kmeansCanvas.getContext("2d").getImageData(0, 0, kmeansCanvas.width, kmeansCanvas.height);
        }
        else if (dogSelectSource.value == "self") {
            image = dogCanvas.getContext("2d").getImageData(0, 0, dogCanvas.width, dogCanvas.height);
        }
        else {
            image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        }
        if (!workerLoaded)
            yield cv.load();
        // Processing image
        const processedImage = yield cv.imageProcessing("dog", [image, image_width, std_e, std_c, k, t, o, e, std_m, colorType, dog_factor]);
        dummyctx.putImageData(processedImage.data.payload, 0, 0);
        dogCanvas.height = image_height;
        dogCanvas.width = image_width;
        dogCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, dogCanvas.width, dogCanvas.height);
        workerLoaded = true;
        dogCanvas.style.animationPlayState = "paused";
    });
}
kmeansButton.addEventListener("click", () => kmeansClick(false), false);
function kmeansClick(isVideo) {
    return __awaiter(this, void 0, void 0, function* () {
        kmeans_num_colors = parseInt(kmeansNumColors.value);
        kmeans_factor = parseFloat(kmeansFactor.value);
        kmeansCanvas.style.animationPlayState = "running";
        let image = 0;
        if (kmeansSelectSource.value == "dog") {
            image = dogCanvas.getContext("2d").getImageData(0, 0, dogCanvas.width, dogCanvas.height);
        }
        else if (kmeansSelectSource.value == "self") {
            image = kmeansCanvas.getContext("2d").getImageData(0, 0, kmeansCanvas.width, kmeansCanvas.height);
        }
        else {
            image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        }
        // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);
        // Load the model
        if (!workerLoaded)
            yield cv.load();
        // Processing image
        const processedImage = yield cv.imageProcessing("kmeans", [image, kmeans_num_colors, kmeans_factor]);
        dummyctx.putImageData(processedImage.data.payload, 0, 0);
        kmeansCanvas.height = image_height;
        kmeansCanvas.width = image_width;
        kmeansCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, kmeansCanvas.width, kmeansCanvas.height);
        workerLoaded = true;
        kmeansCanvas.style.animationPlayState = "paused";
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
            else if (cannySelectSource.value == "dog") {
                image = dogCanvas.getContext("2d").getImageData(0, 0, dogCanvas.width, dogCanvas.height);
            }
            else if (cannySelectSource.value == "self") {
                image = cannyCanvas.getContext("2d").getImageData(0, 0, cannyCanvas.width, cannyCanvas.height);
            }
            else {
                image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            }
            cannyCanvas.style.animationPlayState = "running";
            // const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
            // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);
            if (!workerLoaded)
                yield cv.load();
            const processedImage = yield cv.imageProcessing("canny", [image, min_set, max_set]);
            dummyctx.putImageData(processedImage.data.payload, 0, 0);
            cannyCanvas.height = image_height;
            cannyCanvas.width = image_width;
            cannyCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, cannyCanvas.width, cannyCanvas.height);
            workerLoaded = true;
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
        let colorData;
        if (colorFill.value == "kmeans") {
            colorData = kmeansCanvas.getContext("2d").getImageData(0, 0, kmeansCanvas.width, kmeansCanvas.height).data;
        }
        else {
            colorData = dogCanvas.getContext("2d").getImageData(0, 0, dogCanvas.width, dogCanvas.height).data;
        }
        // const DoGData = dogCanvas.getContext("2d").getImageData(0,0,dogCanvas.width, dogCanvas.height).data;
        // const kMeansData = kmeansCanvas.getContext("2d").getImageData(0,0,kmeansCanvas.width, kmeansCanvas.height).data;
        if (!workerLoaded)
            yield cv.load();
        const processedImage = yield cv.imageProcessing("generate", [cannyData, LBPData, colorData,
            objects_identified, allow_overlap, is_repeated, object_variance, image_width, texture_threshold,
            object_pixel_threshold, factor_value, empty_fill_value]);
        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);
        generateCanvas.height = image_height;
        generateCanvas.width = image_width;
        generateCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, generateCanvas.width, generateCanvas.height);
        workerLoaded = true;
        generateCanvas.style.animationPlayState = "paused";
    });
}
cannyMaxSlider.addEventListener("input", (e) => {
    let num = parseInt(e.target.value) / 10;
    cannyMaxOutput.textContent = num.toString();
});
cannyMinSlider.addEventListener("input", (e) => {
    let num = parseInt(e.target.value) / 10;
    cannyMinOutput.textContent = num.toString();
});
