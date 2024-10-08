//    @ts-nocheck

   //add variance to each filter
   //construction: repeated or not repeated, variance with object placement, allow overlap with objects?
   //steps:
   //1. grab objects and place them on scene
   //2. for each pixel in an object, calculate LBP value (unless its an edge), kmeans value
   let cannyButton = <HTMLButtonElement> document.getElementById("canny-button");
   let cannyCanvas = <HTMLCanvasElement> document.getElementById("canny-canvas");
   let cannySelectSource = <HTMLSelectElement> document.getElementById("canny-select-source");

   let cannyMaxSlider = <HTMLInputElement> document.getElementById("canny-max-slider");
   let cannyMinSlider = <HTMLInputElement> document.getElementById("canny-min-slider");

   let cannyMaxOutput = <HTMLOutputElement> document.getElementById("canny-max-output");
   let cannyMinOutput = <HTMLOutputElement> document.getElementById("canny-min-output");

   let kmeansButton = <HTMLButtonElement> document.getElementById("kmeans-button");
   let kmeansCanvas = <HTMLCanvasElement> document.getElementById("kmeans-canvas");

   let objectsButton = <HTMLButtonElement> document.getElementById("objects-detect-button");
   let objectsCanvas = <HTMLCanvasElement> document.getElementById("objects-canvas");

   let objectsThresholdButton = <HTMLButtonElement> document.getElementById("objects-threshold-button");
   let objectsDetectThreshold = <HTMLButtonElement> document.getElementById("objects-detect-threshold-button");
   let objectsDetectPixelButton = <HTMLButtonElement> document.getElementById("objects-detect-pixel-threshold-button");
   let strict = <HTMLInputElement> document.getElementById("strict");

   let dogCanvas = <HTMLCanvasElement> document.getElementById("dog-canvas");
   let dogButton = <HTMLButtonElement> document.getElementById("dog-button"); 

   let generateButton = <HTMLButtonElement> document.getElementById("generate-button");
   let generateCanvas = <HTMLCanvasElement> document.getElementById("generate-canvas");

   let kmeansNumColors = <HTMLInputElement> document.getElementById("kmeans-num-colors");

   let varianceInput = <HTMLInputElement> document.getElementById("variance-input");
   let numColorBoxes = <HTMLInputElement> document.getElementById("num-color-boxes");
   let objectPixelThreshold = <HTMLInputElement> document.getElementById("object-pixel-threshold");
   let factor = <HTMLInputElement> document.getElementById("factor");
   let emptyFill = <HTMLSelectElement> document.getElementById("generate-empty-fill");
 
   let settings_valid = true;
   
   let objects_distance_threshold = 1;
   let objects_detect_distance_threshold = 1;
   let objects_detect_pixel_threshold = 0;

   let kmeans_num_colors = 1;

   let allow_overlap = true;
   let is_repeated = false; 
//    let object_variance = 5;

   let buttonWorker = <HTMLButtonElement> document.getElementById("worker-button");
   let kButton = <HTMLButtonElement> document.getElementById("k-button");

   var objects_identified = [];


   const cv = new CV();



   objectsButton.addEventListener("click", () => objectsClick(), false); 

   async function objectsClick(){

        let objects_distance_threshold = parseInt(objectsThresholdButton.value);
        let objects_detect_distance_threshold = parseInt(objectsDetectThreshold.value);
        let objects_detect_pixel_threshold = parseInt(objectsDetectPixelButton.value);
        let strict_value = parseInt(strict.value); 

        objectsCanvas.style.animationPlayState = "running";
        
        const imageData = cannyCanvas.getContext("2d").getImageData(0,0,cannyCanvas.width, cannyCanvas.height).data;
        await cv.load();
        const processedImage = await 
        cv.imageProcessing("fill", [imageData, image_width, objects_distance_threshold, objects_detect_distance_threshold, objects_detect_pixel_threshold, strict_value]);

        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);

        objectsCanvas.height = image_height; 
        objectsCanvas.width = image_width; 

        objectsCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, objectsCanvas.width, objectsCanvas.height);

        objects_identified = processedImage.data.payload[1];

        objectsCanvas.style.animationPlayState = "paused";


   }

   dogButton.addEventListener("click", ()=>dogClick(), false);

   async function dogClick(){

        dogCanvas.style.animationPlayState = "running";

        const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
        await cv.load();
        // Processing image
        
        const processedImage = await cv.imageProcessing("dog", [image, image_width]);
 
        dummyctx.putImageData(processedImage.data.payload, 0, 0);

        dogCanvas.height = image_height; 
        dogCanvas.width = image_width; 

        dogCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, dogCanvas.width, dogCanvas.height);

        dogCanvas.style.animationPlayState = "paused";


   }
 

   kmeansButton.addEventListener("click", () => kmeansClick(), false);

    async function kmeansClick(){


        kmeans_num_colors = parseInt(kmeansNumColors.value);
        

        kmeansCanvas.style.animationPlayState = "running";

        const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
        // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);

        // Load the model
        await cv.load();
        // Processing image
        const processedImage = await cv.imageProcessing("kmeans", [image, kmeans_num_colors]);

        dummyctx.putImageData(processedImage.data.payload, 0, 0);

        kmeansCanvas.height = image_height; 
        kmeansCanvas.width = image_width; 

        kmeansCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, kmeansCanvas.width, kmeansCanvas.height);

        kmeansCanvas.style.animationPlayState = "paused";
        
        // Render the processed image to the canvas
        
    }

    cannyButton.addEventListener("click", () => cannyClick(), false);

    async function cannyClick(){
        let min_set = parseInt(cannyMinSlider.value);
        let max_set = parseInt(cannyMaxSlider.value);
        if(min_set < max_set){
            let image = 0;

            if(cannySelectSource.value == "kMeans"){

                image = kmeansCanvas.getContext("2d").getImageData(0,0, kmeansCanvas.width, kmeansCanvas.height);
            }else{

                image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);

            }

            cannyCanvas.style.animationPlayState = "running";

            // const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
            // const image = dummyctx.getImageData(0,0, dummyCanvas.width, hiddenCanvas.height);
            await cv.load(); 
            const processedImage = await cv.imageProcessing("canny", [image, min_set, max_set]);

            dummyctx.putImageData(processedImage.data.payload, 0, 0);

            cannyCanvas.height = image_height; 
            cannyCanvas.width = image_width; 

            cannyCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, cannyCanvas.width, cannyCanvas.height);

            cannyCanvas.style.animationPlayState = "paused";

        }
        
    }

    generateButton.addEventListener("click", ()=> generateClick(), false);

    async function generateClick(){

        generateCanvas.style.animationPlayState = "running";
        let object_variance = parseInt(varianceInput.value); 
        let texture_threshold = parseInt(numColorBoxes.value);
        let object_pixel_threshold = parseInt(objectPixelThreshold.value);
        let factor_value = parseInt(factor.value);
        let empty_fill_value = emptyFill.value == "common" ? 1:0;
        //const objects_identified;
        const cannyData = cannyCanvas.getContext("2d").getImageData(0,0,cannyCanvas.width, cannyCanvas.height).data;
        const LBPData = LBPCanvas.getContext("2d").getImageData(0,0,LBPCanvas.width, LBPCanvas.height).data;
        const kMeansData = kmeansCanvas.getContext("2d").getImageData(0,0,kmeansCanvas.width, kmeansCanvas.height).data;
        
        await cv.load();

        const processedImage = await 
        cv.imageProcessing("generate",

            [cannyData, LBPData, kMeansData, 
            objects_identified, allow_overlap, is_repeated, object_variance, image_width, texture_threshold, 
            object_pixel_threshold, factor_value, empty_fill_value]);


        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);

        generateCanvas.height = image_height; 
        generateCanvas.width = image_width; 

        generateCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, generateCanvas.width, generateCanvas.height);


        generateCanvas.style.animationPlayState = "paused";



    }
 

   cannyMaxSlider.addEventListener("input", (e) =>{
    cannyMaxOutput.textContent = e.target.value;
    
   });

   cannyMinSlider.addEventListener("input", (e) =>{
    cannyMinOutput.textContent = e.target.value;
    
   });

   
  
