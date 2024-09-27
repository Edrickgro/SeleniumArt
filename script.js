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
//2. for each pixel in an object, calculate LBP value, kmeans value, 
let cannyButton = document.getElementById("canny-button");
let cannyCanvas = document.getElementById("canny-canvas");
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
let kmeansNumColors = document.getElementById("kmeans-num-colors");
let settings_valid = true;
let min_set = 0;
let max_set = 100;
let objects_distance_threshold = 1;
let objects_detect_distance_threshold = 1;
let objects_detect_pixel_threshold = 0;
let kmeans_num_colors = 1;
let buttonWorker = document.getElementById("worker-button");
let kButton = document.getElementById("k-button");
const cv = new CV();
objectsThresholdButton.addEventListener("input", (e) => {
    objects_distance_threshold = e.target.value;
});
objectsDetectThreshold.addEventListener("input", (e) => {
    objects_detect_distance_threshold = e.target.value;
});
objectsDetectPixelButton.addEventListener("input", (e) => {
    objects_detect_pixel_threshold = e.target.value;
});
kmeansNumColors.addEventListener("input", (e) => {
    kmeans_num_colors = e.target.value;
});
objectsButton.addEventListener("click", () => objectsClick(), false);
function objectsClick() {
    return __awaiter(this, void 0, void 0, function* () {
        objectsCanvas.style.animationPlayState = "running";
        const imageData = cannyCanvas.getContext("2d").getImageData(0, 0, cannyCanvas.width, cannyCanvas.height).data;
        yield cv.load();
        const processedImage = yield cv.imageProcessing("fill", [imageData, image_width, objects_distance_threshold, objects_detect_distance_threshold, objects_detect_pixel_threshold]);
        dummyctx.putImageData(processedImage.data.payload, 0, 0);
        objectsCanvas.height = image_height;
        objectsCanvas.width = image_width;
        objectsCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, objectsCanvas.width, objectsCanvas.height);
        objectsCanvas.style.animationPlayState = "paused";
    });
}
kmeansButton.addEventListener("click", () => kmeansClick(), false);
function kmeansClick() {
    return __awaiter(this, void 0, void 0, function* () {
        kmeansCanvas.style.animationPlayState = "running";
        const image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
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
        if (min_set < max_set) {
            cannyCanvas.style.animationPlayState = "running";
            const image = hiddenCanvasctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
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
cannyMaxSlider.addEventListener("input", (e) => {
    cannyMaxOutput.textContent = e.target.value;
    max_set = parseInt(e.target.value);
});
cannyMinSlider.addEventListener("input", (e) => {
    cannyMinOutput.textContent = e.target.value;
    min_set = parseInt(e.target.value);
});
//    var cannyData = cannyCanvas.getContext("2d").getImageData(0,0, cannyCanvas.width, cannyCanvas.height);
//    var worker = new Worker("opencvworker.js");
//    kmeansButton.addEventListener("click", ()=> kmeanCalc(), false);
//    buttonWorker.addEventListener("click", () => {
//         console.log("SENDING WORKER MESSAGE");
//        worker.postMessage(["load"]);
//    });
//    kButton.addEventListener("click", (e)=>{
//        console.log("LOGGED");
//        let image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
//        worker.postMessage(["kmeans", image]);
//     });
//     worker.onmessage = (e) => {
//         console.log("Message received from worker: " + e.data[0]);
//         if(e.data[0] == "kmeans"){
//             dummyctx.putImageData(e.data[1], 0, 0);
//         }
//      };
function onOpenCvReady() {
    cv['onRuntimeInitialized'] = () => {
        let javascriptStatus = document.getElementById("javascript-status");
        javascriptStatus.innerHTML = "Javascript Satus: Loaded!";
        cannyButton.addEventListener("click", (e) => {
            if (min_set < max_set) {
                let src = cv.imread("hidden-canvas");
                let dst = new cv.Mat();
                cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
                // You can try more different parameters
                cv.Canny(src, dst, min_set, max_set, 3, false);
                cv.imshow("canny-canvas", dst);
                cv.imshow("dummy-canvas", dst);
            }
        });
        function kmeanCalc() {
            // let mat = cv.imread("hidden-canvas");
            // let sample = new cv.Mat(mat.rows * mat.cols, 3, cv.CV_32F);
            // for( var y = 0; y < mat.rows; y++ ){
            //     for( var x = 0; x < mat.cols; x++ ){
            //         for( var z = 0; z < 3; z++){
            //             sample.floatPtr(y + x*mat.rows)[z] = mat.ucharPtr(y,x)[z];
            //         }
            //     }
            // }
            // let clusterCount = 3;
            // let labels= new cv.Mat();
            // let attempts = 5;
            // let centers= new cv.Mat();
            // let crite= new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10000, 0.0001);
            // let criteria = [1,10,0.0001];
            //   cv.kmeans(sample, clusterCount, labels, crite, attempts, cv.KMEANS_RANDOM_CENTERS, centers );
            //  var newImage= new cv.Mat(mat.size(),mat.type());
            //  for( var y = 0; y < mat.rows; y++ ){
            //     for( var x = 0; x < mat.cols; x++ )
            //         { 
            //             let cluster_idx = labels.intAt(y + x*mat.rows,0);
            //             let redChan = new Uint8Array(1);
            //             let greenChan = new Uint8Array(1);
            //             let blueChan = new Uint8Array(1);
            //             let alphaChan = new Uint8Array(1);
            //             redChan[0]=centers.floatAt(cluster_idx, 0);
            //             greenChan[0]=centers.floatAt(cluster_idx, 1);
            //             blueChan[0]=centers.floatAt(cluster_idx, 2);
            //             alphaChan[0]=255;
            //             newImage.ucharPtr(y,x)[0] =  redChan;
            //             newImage.ucharPtr(y,x)[1] =  greenChan;
            //             newImage.ucharPtr(y,x)[2] =  blueChan;
            //             newImage.ucharPtr(y,x)[3] =  alphaChan;
            //         }
            //  }
            // cv.imshow('kmeans-canvas', newImage);
        }
    };
}
