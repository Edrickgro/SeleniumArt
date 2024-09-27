//    @ts-nocheck

   //add variance to each filter
   //construction: repeated or not repeated, variance with object placement, allow overlap with objects?
   //steps:
   //1. grab objects and place them on scene
   //2. for each pixel in an object, calculate LBP value (unless its an edge), kmeans value
   let cannyButton = <HTMLButtonElement> document.getElementById("canny-button");
   let cannyCanvas = <HTMLCanvasElement> document.getElementById("canny-canvas");

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

   let generateButton = <HTMLButtonElement> document.getElementById("generate-button");
   let generateCanvas = <HTMLCanvasElement> document.getElementById("generate-canvas");

   let kmeansNumColors = <HTMLInputElement> document.getElementById("kmeans-num-colors");
 
   let settings_valid = true;
   
   let min_set = 0; 
   let max_set = 100;

   let objects_distance_threshold = 1;
   let objects_detect_distance_threshold = 1;
   let objects_detect_pixel_threshold = 0;

   let kmeans_num_colors = 1;

   let allow_overlap = false;
   let is_repeated = false; 
   let object_variance = 0;

   let buttonWorker = <HTMLButtonElement> document.getElementById("worker-button");
   let kButton = <HTMLButtonElement> document.getElementById("k-button");

   var objects_identified = [];


   const cv = new CV();

   objectsThresholdButton.addEventListener("input", (e) => {
    objects_distance_threshold = e.target.value; 

   })
   objectsDetectThreshold.addEventListener("input", (e) => {
    objects_detect_distance_threshold = e.target.value;
   })
   objectsDetectPixelButton.addEventListener("input", (e)=>{
    objects_detect_pixel_threshold = e.target.value;
   });

   kmeansNumColors.addEventListener("input", (e)=>{
    kmeans_num_colors = e.target.value;
   })


   objectsButton.addEventListener("click", () => objectsClick(), false); 

   async function objectsClick(){

        objectsCanvas.style.animationPlayState = "running";
        
        const imageData = cannyCanvas.getContext("2d").getImageData(0,0,cannyCanvas.width, cannyCanvas.height).data;
        await cv.load();
        const processedImage = await 
        cv.imageProcessing("fill", [imageData, image_width, objects_distance_threshold, objects_detect_distance_threshold, objects_detect_pixel_threshold]);

        dummyctx.putImageData(processedImage.data.payload[0], 0, 0);

        objectsCanvas.height = image_height; 
        objectsCanvas.width = image_width; 

        objectsCanvas.getContext("2d").drawImage(dummyctx.canvas, 0, 0, objectsCanvas.width, objectsCanvas.height);

        objects_identified = processedImage.data.payload[1];

        objectsCanvas.style.animationPlayState = "paused";


   }

  

   kmeansButton.addEventListener("click", () => kmeansClick(), false);

    async function kmeansClick(){

        kmeansCanvas.style.animationPlayState = "running";

        const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
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
        if(min_set < max_set){

            cannyCanvas.style.animationPlayState = "running";

            const image = hiddenCanvasctx.getImageData(0,0, hiddenCanvas.width, hiddenCanvas.height);
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
        //const objects_identified;
        const cannyData = cannyCanvas.getContext("2d").getImageData(0,0,cannyCanvas.width, cannyCanvas.height).data;
        const LBPData = LBPCanvas.getContext("2d").getImageData(0,0,LBPCanvas.width, LBPCanvas.height).data;
        const kMeansData = kmeansCanvas.getContext("2d").getImageData(0,0,kmeansCanvas.width, kmeansCanvas.height).data;
        
        await cv.load();

        const processedImage = await 
        cv.imageProcessing("generate", [cannyData, LBPData, kMeansData, objects_identified, allow_overlap, is_repeated, object_variance]);

        





    }
 

   cannyMaxSlider.addEventListener("input", (e) =>{
    cannyMaxOutput.textContent = e.target.value;
    max_set = parseInt(e.target.value);
    
   });

   cannyMinSlider.addEventListener("input", (e) =>{
    cannyMinOutput.textContent = e.target.value;
    min_set = parseInt(e.target.value);
    
   });

   
  
