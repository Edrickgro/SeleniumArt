/**
 * With OpenCV we have to work the images as cv.Mat (matrices),
 * so the first thing we have to do is to transform the
 * ImageData to a type that openCV can recognize.
 */

// @ts-nocheck

var imageWidth = 0; 
var imageHeight = 0; 
var globalData = 0;

function cannyProcess({ msg, payload }) {

    const src = cv.matFromImageData(payload[0])
    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    cv.Canny(src, dst, payload[1], payload[2], 3, false);

    postMessage({ msg, payload: imageDataFromMat(dst)});

}

function objectsFill({msg, payload}){
    imageWidth = payload[1];
    let data: Uint8ClampedArray = structuredClone(payload[0]);
    globalData = payload[0];

    let distanceThreshold = payload[2];
    let object_size_threshold = payload[4];
    
    
    imageHeight = (data.length/4)/imageWidth; 
    // let q = [];

    // q.push({edge: data[0] > 0 , visited: false, index: 0});

    let pixels = []; 

    for(let i =  0; i < data.length/4; i++){
        pixels.push({index: i, visited: false, background: false}); 
    }

    //FIRST ROW

    for(let j = 0; j < imageWidth; j++){

        let pixelObject = pixels[j];
        pixelObject.background = true; 

        if(pixelObject.visited) continue;

        let dataIndex = (j) * 4;

        fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    }

    //bottom row
    for(let j = 1; j < imageWidth + 1; j++){

        let pixelObject = pixels[pixels.length - j];
        pixelObject.background = true; 

        if(pixelObject.visited) continue;

        let dataIndex = (pixels.length - j) * 4;

        fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    }

    for(let j = [0]; j < imageHeight; j++){

        let pixelObject = pixels[imageWidth * j];
        pixelObject.background = true; 

        if(pixelObject.visited) continue;

        let dataIndex = (imageWidth * j) * 4;

        fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    }

    for(let j = 1; j < imageHeight + 1; j++){

    
        let pixelObject = pixels[(imageWidth * j) - 1];
        pixelObject.background = true; 

        if(pixelObject.visited) continue;

        let dataIndex = ((imageWidth * j) - 1) * 4;

        fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    }

    //DETECTING OBJECTS NOW

    distanceThreshold = payload[3];
    let identified_objects = [];
    let counter = 0;
    let randomR = 0; 
    let randomG = 0; 
    let randomB = 0;

    for(let i = 0; i < pixels.length; i++){

        let pixelObject = pixels[i];
        let dataIndex = (i) * 4;
        let objectData = data[dataIndex];
        
        if(pixelObject.background == true || pixelObject.visited == true || objectData == 255) continue;

        fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [identified_objects, object_size_threshold]);
    
    }

    
    for(let i = 0; i < identified_objects.length; i++){
        let object = identified_objects[i];
        randomR = Math.floor(Math.random() * (254 - 1) + 1);
        randomG = Math.floor(Math.random() * (254 - 1) + 1);
        randomB = Math.floor(Math.random() * (254 - 1) + 1);
        for(let j = 0; j < object.length; j++){
            data[object[j]] = randomR;
            data[object[j] + 1] = randomG;
            data[object[j] + 2] = randomB;
        }
    }

    const clampedArray = new ImageData(
        data,
        imageWidth
      )

    postMessage({msg, payload: [clampedArray, identified_objects]});



}

function validPixel(row, col){
    let validRow = row >= 0 && row < imageHeight;
    let validCol = col >= 0 && col < imageWidth;

    return validRow && validCol;
}

function fill(data, dataIndex, pixels, pixelObject, distanceThreshold, identifyObjectsData){

    let imageHeight = (data.length/4) / imageWidth; 

    let q = [];
    let object = [];
    q.push(pixelObject);
    pixelObject.visited = true; 

    while(q.length > 0){
        
        let {index, visited, background} = q.shift();

        if(background){
            data[(index * 4)] = 255;
        }
        else{
           
            object.push(index*4);
           
        }
  
        
        let row = Math.floor(index/imageWidth); //regular notation
        let column = index - (row * imageWidth);


        //have these in byte space
        let up = validPixel(row -1, column) ? ((row - 1) * imageWidth + (column)) * 4: -1; //regular notation and then * 4 for 8 bit array
        let right = validPixel(row, column + 1) ? ((row) * imageWidth + (column + 1)) * 4: -1;
        let bottom = validPixel(row + 1, column) ? ((row + 1) * imageWidth + (column)) * 4: -1;
        let left = validPixel(row, column - 1) ? ((row) * imageWidth + (column - 1)) * 4: -1;

       
        if( data[up] != undefined && pixels[up/4].visited == false && data[up] == 0 && pixelFillValid(data, up, distanceThreshold, true)){
            if(background) pixels[up/4].background = true;
            pixels[up/4].visited = true;
            q.push(pixels[up/4]);
        }
        if(data[right] != undefined && pixels[right/4].visited == false && data[right] == 0 && pixelFillValid(data, right, distanceThreshold, false)){
            if(background) pixels[right/4].background = true; 
            pixels[right/4].visited = true;
            q.push(pixels[right/4]);
        }
        if(data[bottom] != undefined && pixels[bottom/4].visited == false && data[bottom] == 0 && pixelFillValid(data, bottom, distanceThreshold, true)){
            if(background) pixels[bottom/4].background = true;
            pixels[bottom/4].visited = true; 
            q.push(pixels[bottom/4]);
        }
        if(data[left] != undefined && pixels[left/4].visited == false && data[left] == 0 && pixelFillValid(data, left, distanceThreshold, false)){
            if(background) pixels[left/4].background = true;
            pixels[left/4].visited = true; 
            q.push(pixels[left/4]);
        }

        if(q.length == 0 && identifyObjectsData[0] !== 0 && object.length > identifyObjectsData[1]){
            identifyObjectsData[0].push(object);
        }


    }
}


function pixelFillValid(data, dataIndex, distanceThreshold, axis){

    if(distanceThreshold == 0){
        return true;
    }

    let index = dataIndex/4; //regular notation; 
    let row = Math.floor(index/imageWidth);
    let column = index - (row * imageWidth); 

    let calculatedDistance = 0;

    let first = 0; 
    let second = 0; 
    let firstFound = false; 
    let secondFound = false;

    for(let i = 1; i < distanceThreshold + 1; i++){

        let j = i;
        if(axis == false){
            first = validPixel(row - i, column) ? ((row - i) * imageWidth + (column)) * 4: -1;
            second = validPixel(row + i, column) ? ((row + i) * imageWidth + (column)) * 4: -1;
        }else{

            first = validPixel(row, column - i) ? ((row) * imageWidth + (column - i)) * 4: -1;
            second = validPixel(row, column + i) ? ((row) * imageWidth + (column + i)) * 4: -1;

        }

        let firstPixel = globalData[first];
        let secondPixel = globalData[second];
        
    
        if(firstPixel == 0 && firstFound == false){
            calculatedDistance = calculatedDistance + 1;
        }else if (firstPixel != undefined){
            firstFound = true; 
        }
        if(secondPixel == 0 && secondFound == false){
            calculatedDistance = calculatedDistance + 1;
        }else if (secondPixel != undefined){
            secondFound = true; 
        }

        // if((firstFound && secondFound)){
        //     break;
        // }

    }

    // if(!(calculatedDistance <= distanceThreshold)){
    //     console.log("HE");
    // }
  
    return !(calculatedDistance <= distanceThreshold);
    
}

function generateProcess({msg, payload}){
//cannyData, LBPData, kMeansData, objects_identified, allow_overlap, is_repeated, object_variance
    const cannyData = payload[0];
    const LBPData = payload[1];
    const kMeansData = payload[2];
    const objects_identified = payload[3];
    const allow_overlap = payload[4];
    const is_repeated = payload[5];
    const object_variance = payload[6];

    const image_data = new Uint8ClampedArray(imageWidth * imageHeight);

    for(let i = 0; i < objects_identified.length; i++){
        let object = objects_identified[i];
        if(object_variance){

            

        }
        for(let j = 0;  j < object.length; j++){
            
            let pixelR = 0;
            let pixelG = 0;
            let pixelB = 0;
            let pixelA = 0; 
            
            let cannyPixel = cannyData[object[j]];
            let LBPPixel = LBPData[object[j]];

            pixelA = cannyPixel == 0 ? LBPPixel:255;
            
            pixelR = kMeansData[object[j]];
            pixelG = kMeansData[object[j] + 1];
            pixelB = kMeansData[object[j] + 2];


            
        }
    }
}

function imageDataFromMat(mat) {
    // converts the mat type to cv.CV_8U
    const img = new cv.Mat()
    const depth = mat.type() % 8
    const scale =
      depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0
    const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0
    mat.convertTo(img, cv.CV_8U, scale, shift)
  
    // converts the img type to cv.CV_8UC4
    switch (img.type()) {
      case cv.CV_8UC1:
        cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA)
        break
      case cv.CV_8UC3:
        cv.cvtColor(img, img, cv.COLOR_RGB2RGBA)
        break
      case cv.CV_8UC4:
        break
      default:
        throw new Error(
          'Bad number of channels (Source image must have 1, 3 or 4 channels)'
        )
    }
    const clampedArray = new ImageData(
      new Uint8ClampedArray(img.data),
      img.cols,
      img.rows
    )
    img.delete()
    return clampedArray
  }



function kmeansProcess({msg, payload}){
    postMessage({msg, payload: kMeans(payload)});
}
  
  /**
   * This function is to convert again from cv.Mat to ImageData
   */
function kMeans(payload) {
    


    let mat = cv.matFromImageData(payload[0]);
    let sample = new cv.Mat(mat.rows * mat.cols, 3, cv.CV_32F);

    for( var y = 0; y < mat.rows; y++ ){
        for( var x = 0; x < mat.cols; x++ ){
            for( var z = 0; z < 3; z++){
                sample.floatPtr(y + x*mat.rows)[z] = mat.ucharPtr(y,x)[z];
            }
        }
    }

        
    let clusterCount = parseInt(payload[1]);
    let labels= new cv.Mat();
    let attempts = 5;
    let centers= new cv.Mat();

    
    let crite= new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10000, 0.0001);
    let criteria = [1,10,0.0001];

    
    cv.kmeans(sample, clusterCount, labels, crite, attempts, cv.KMEANS_RANDOM_CENTERS, centers );


    var newImage= new cv.Mat(mat.size(),mat.type());
        for( var y = 0; y < mat.rows; y++ ){
            for( var x = 0; x < mat.cols; x++ )
                { 
                    let cluster_idx = labels.intAt(y + x*mat.rows,0);
                    let redChan = new Uint8Array(1);
                    let greenChan = new Uint8Array(1);
                    let blueChan = new Uint8Array(1);
                    let alphaChan = new Uint8Array(1);
                    redChan[0]=centers.floatAt(cluster_idx, 0);
                    greenChan[0]=centers.floatAt(cluster_idx, 1);
                    blueChan[0]=centers.floatAt(cluster_idx, 2);
                    alphaChan[0]=255;
                    newImage.ucharPtr(y,x)[0] =  redChan;
                    newImage.ucharPtr(y,x)[1] =  greenChan;
                    newImage.ucharPtr(y,x)[2] =  blueChan;
                    newImage.ucharPtr(y,x)[3] =  alphaChan;
                }

        }

    const clampedArray = new ImageData(
        new Uint8ClampedArray(newImage.data),
        newImage.cols,
        newImage.rows
    )

    newImage.delete();
    mat.delete();
    sample.delete(); 


    
    return clampedArray;
  }
  
  /**
   *  Here we will check from time to time if we can access the OpenCV
   *  functions. We will return in a callback if it has been resolved
   *  well (true) or if there has been a timeout (false).
   */

  var loaded = false;
  function waitForOpencv(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
    if (cv.Mat){
        callbackFn(true);
        loaded = true;

    } 
  
    let timeSpentMs = 0
    const interval = setInterval(() => {
      const limitReached = timeSpentMs > waitTimeMs
      if (cv.Mat || limitReached) {
        clearInterval(interval)
        return callbackFn(!limitReached)
      } else {
        timeSpentMs += stepTimeMs
      }
    }, stepTimeMs)
  }

  /**
   * This exists to capture all the events that are thrown out of the worker
   * into the worker. Without this, there would be no communication possible
   * with our project.
   */
  onmessage = function (e) {
    switch (e.data.msg) {
      case 'load': {
        if(!loaded){

        // Import Webassembly script
        self.importScripts('opencv.js');
        waitForOpencv(function (success) {
          if (success) postMessage({ msg: e.data.msg })
          else throw new Error('Error on loading OpenCV')
        })

        }
      
        break
      }
      case 'kmeans':
        return kmeansProcess(e.data);
      case 'canny':
        return cannyProcess(e.data);
      case 'fill':
        return objectsFill(e.data);
      case 'generate':
        return generateProcess(e.data);
      default:
        break
    }
  }