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

    console.log(dst.data);

    postMessage({ msg, payload: imageDataFromMat(dst)});

}

function objectsFill({msg, payload}){
    imageWidth = payload[1];
    let data: Uint8ClampedArray = structuredClone(payload[0]);
    globalData = payload[0];

    let distanceThreshold = payload[2];
    let object_size_threshold = payload[4];
    let strict_value = payload[5];
    
    
    imageHeight = (data.length/4)/imageWidth; 
    // let q = [];

    // q.push({edge: data[0] > 0 , visited: false, index: 0});

    let pixels = []; 
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for(let i =  0; i < data.length/4; i++){
        pixels.push({index: i, visited: false, background: false}); 
    }

    

    //FIRST ROW

    if(strict_value){
        for(let j = 0; j < imageWidth; j++){
            let dataIndex = (j) * 4;
            let objectData = data[dataIndex];
    
            
    
    
            let pixelObject = pixels[j];
            pixelObject.background = true; 
    
            if(pixelObject.visited) continue;
    
            
    
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

    }

    // for(let j = 0; j < imageWidth; j++){
    //     let dataIndex = (j) * 4;
    //     let objectData = data[dataIndex];

        


    //     let pixelObject = pixels[j];
    //     pixelObject.background = true; 

    //     if(pixelObject.visited) continue;

        

    //     fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    // }

    // //bottom row
    // for(let j = 1; j < imageWidth + 1; j++){

    //     let pixelObject = pixels[pixels.length - j];
    //     pixelObject.background = true; 

    //     if(pixelObject.visited) continue;

    //     let dataIndex = (pixels.length - j) * 4;

    //     fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    // }

    // for(let j = [0]; j < imageHeight; j++){

    //     let pixelObject = pixels[imageWidth * j];
    //     pixelObject.background = true; 

    //     if(pixelObject.visited) continue;

    //     let dataIndex = (imageWidth * j) * 4;

    //     fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    // }

    // for(let j = 1; j < imageHeight + 1; j++){

    
    //     let pixelObject = pixels[(imageWidth * j) - 1];
    //     pixelObject.background = true; 

    //     if(pixelObject.visited) continue;

    //     let dataIndex = ((imageWidth * j) - 1) * 4;

    //     fill(data, dataIndex, pixels, pixelObject, distanceThreshold, [0]);

    // }

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

        if(pixelObject.background == true || pixelObject.visited == true || pixelObject == 255) continue;


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

function fillObject(data, dataIndex, pixels, pixelObject, distanceThreshold, identifyObjectsData){

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

       
        //performance is DRASTICALLY worsened if this is put into a for loop instead 

        if( data[up] != undefined && 
            pixels[up/4].visited == false && 
            data[up] == 0 && 
            pixelFillValid(data, up, distanceThreshold, true)){

            if(background) pixels[up/4].background = true;
            pixels[up/4].visited = true;
            q.push(pixels[up/4]);
        } 
        
        if( data[right] != undefined && 
            pixels[right/4].visited == false && 
            data[right] == 0 && 
            pixelFillValid(data, right, distanceThreshold, false)){

            if(background) pixels[right/4].background = true; 
            pixels[right/4].visited = true;
            q.push(pixels[right/4]);
        }
        if( data[bottom] != undefined && 
            pixels[bottom/4].visited == false && 
            data[bottom] == 0 && 
            pixelFillValid(data, bottom, distanceThreshold, true)){

            if(background) pixels[bottom/4].background = true;
            pixels[bottom/4].visited = true; 
            q.push(pixels[bottom/4]);
        }
        if( data[left] != undefined && 
            pixels[left/4].visited == false && 
            data[left] == 0 && 
            pixelFillValid(data, left, distanceThreshold, false)){

            if(background) pixels[left/4].background = true;
            pixels[left/4].visited = true; 
            q.push(pixels[left/4]);
        }

        //identifyObjectsData[0] == 0 means that we're filling the background
        //otherwise 

        if(q.length == 0 && identifyObjectsData[0] !== 0 && object.length > identifyObjectsData[1]){
            identifyObjectsData[0].push(object);
        }


    }
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
            data[(index * 4) + 2] = 255;
        }
        else{   
            object.push(index*4);
        }
  
        
        let row = Math.floor(index/imageWidth); //regular notation
        let column = index - (row * imageWidth);

        let isEdge = false;
        if(data[(index*4)] == 255) isEdge = true;


        //have these in byte space
        let up = validPixel(row -1, column) ? ((row - 1) * imageWidth + (column)) * 4: -1; //regular notation and then * 4 for 8 bit array
        let right = validPixel(row, column + 1) ? ((row) * imageWidth + (column + 1)) * 4: -1;
        let bottom = validPixel(row + 1, column) ? ((row + 1) * imageWidth + (column)) * 4: -1;
        let left = validPixel(row, column - 1) ? ((row) * imageWidth + (column - 1)) * 4: -1;

       
        //performance is DRASTICALLY worsened if this is put into a for loop instead 

        if( data[up] != undefined && 
            pixels[up/4].visited == false){

                let isValid = pixelFillValid(data, up, distanceThreshold, true);

                //not working because when the pixel is 0, it needs to be able to add edges from pixelFillValid but it doesn't
                //when detect edge from directions, add to object but do not add to heap

                //search initial object fill until not an edge or background
                //if current is blank(0) and neighbor is edge, add to object but not q
                //if current is blank(0) and neighbor is blank, add to q

                if(background && data[up] == 0 && isValid){
                    pixels[up/4].background = true;
                    pixels[up/4].visited = true;
                    q.push(pixels[up/4]);
                }else if(!background && data[up] == 0 && isValid){
                    pixels[up/4].visited = true;
                    q.push(pixels[up/4]);

                }else if(!background && data[up] == 255){
                    pixels[up/4].visited = true;
                    object.push(up);
                }
                //!background  (data[up] && isValid)


        } 
        
        if( data[right] != undefined && 
            pixels[right/4].visited == false){

                let isValid = pixelFillValid(data, right, distanceThreshold, false);
                
                if(background && data[right] == 0 && isValid){
                    pixels[right/4].background = true;
                    pixels[right/4].visited = true;
                    q.push(pixels[right/4]);
                }else if(!background && data[right] == 0 && isValid){
                    pixels[right/4].visited = true;
                    q.push(pixels[right/4]);

                }else if(!background && data[right] == 255){
                    pixels[right/4].visited = true;
                    object.push(right);
                }

                // if(background && data[right] == 0){
                //     pixels[right/4].background = true;
                //     pixels[right/4].visited = true;
                //     q.push(pixels[right/4]);
                // }else if(!background && (data[right] == 0 || data[right] == 255)){

                //     pixels[right/4].visited = true;
                //     q.push(pixels[right/4]);

                // }

        }
        if( data[bottom] != undefined && 
            pixels[bottom/4].visited == false){

                let isValid = pixelFillValid(data, bottom, distanceThreshold, true);


                if(background && data[bottom] == 0 && isValid){
                    pixels[bottom/4].background = true;
                    pixels[bottom/4].visited = true;
                    q.push(pixels[bottom/4]);
                }else if(!background && data[bottom] == 0 && isValid){
                    pixels[bottom/4].visited = true;
                    q.push(pixels[bottom/4]);

                }else if(!background && data[bottom] == 255){
                    pixels[bottom/4].visited = true;
                    object.push(bottom);
                }
                // if(background && data[bottom] == 0){
                //     pixels[bottom/4].background = true;
                //     pixels[bottom/4].visited = true;
                //     q.push(pixels[bottom/4]);
                // }else if(!background && (data[bottom] == 0 || data[bottom] == 255)){

                //     pixels[bottom/4].visited = true;
                //     q.push(pixels[bottom/4]);

                // }
        }
        if( data[left] != undefined && 
            pixels[left/4].visited == false){

                let isValid = pixelFillValid(data, left, distanceThreshold, false);


                if(background && data[left] == 0 && isValid){
                    pixels[left/4].background = true;
                    pixels[left/4].visited = true;
                    q.push(pixels[left/4]);
                }else if(!background && data[left] == 0 && isValid){
                    pixels[left/4].visited = true;
                    q.push(pixels[left/4]);

                }else if(!background && data[left] == 255){
                    pixels[left/4].visited = true;
                    object.push(left);
                }

                // if(background && data[left] == 0){
                //     pixels[left/4].background = true;
                //     pixels[left/4].visited = true;
                //     q.push(pixels[left/4]);
                // }else if(!background && (data[left] == 0 || data[left] == 255)){

                //     pixels[left/4].visited = true;
                //     q.push(pixels[left/4]);

                // }
        }

        //identifyObjectsData[0] == 0 means that we're filling the background
        //otherwise 

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



    for(let i = 1; i < distanceThreshold + 2; i++){

        let j = i;
        if(axis == false){
            first = validPixel(row - i, column) ? ((row - i) * imageWidth + (column)) * 4: -1;
            second = validPixel(row + i, column) ? ((row + i) * imageWidth + (column)) * 4: -1;
        }else{

            first = validPixel(row, column - i) ? ((row) * imageWidth + (column - i)) * 4: -1;
            second = validPixel(row, column + i) ? ((row) * imageWidth + (column + i)) * 4: -1;

        }

        let firstPixel = globalData[first]; //looking at cannyData so there only exists black and white pixels
        let secondPixel = globalData[second];
        
        //isValid counts how many black pixels, otherwise we have found ()
    
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

    }

    // if(!(calculatedDistance <= distanceThreshold)){
    //     console.log("HE");
    // }

    //don't let pixel fill pass if distance is less than given threshold !(true) = false
    //let pixel fill pass if distance is greater than threshold !(false) = true
    //let pixel fill pass if last first pixel or last second pixel is same color and current color
  
    return !(calculatedDistance <= (distanceThreshold));
    
}

function genRandomObjectVariance(direction, dis, row, column){
    
    switch(direction){
        case "TopLeft":
            return validPixel(row -dis, column -dis) ? ((row - dis) * imageWidth + (column -dis)) * 4: -1; 
        case "TopMid":
            return validPixel(row -dis, column) ? ((row - dis) * imageWidth + (column)) * 4: -dis; 
        case "TopRight":
            return validPixel(row -dis, column + dis) ? ((row - dis) * imageWidth + (column + dis)) * 4: -1; 
        case "Right":
            return validPixel(row, column + dis) ? ((row) * imageWidth + (column + dis)) * 4: -dis; 
        case "BottomRight":
            return validPixel(row + dis, column + dis) ? ((row + dis) * imageWidth + (column + dis)) * 4: -1; 
        case "BottomMid":
            return validPixel(row + dis, column) ? ((row + dis) * imageWidth + (column)) * 4: -dis; 
        case "BottomLeft":
            return validPixel(row + dis, column - dis) ? ((row + dis) * imageWidth + (column - dis)) * 4: -1; 
        case "Left":
            return validPixel(row, column - dis) ? ((row) * imageWidth + (column - dis)) * 4: -1; 
        default:
            break;
    }

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
    const maxBoost = payload[8];
    const object_pixel_threshold = payload[9];
    const factor_value = payload[10];
    const empty_fill = payload[11];

    let color_box_values = [];

    imageWidth = payload[7];

    imageHeight = (cannyData.length/4)/imageWidth;

    let image_data = new Uint8ClampedArray(cannyData.length);

    const neighbors = ["TopLeft", "TopMid", "TopRight", "Right", "BottomRight", "BottomMid", "BottomLeft", "Left"];


    
    let unique_colors = {};
    let max_color_count = 0;
    let color_fill = [0,0,0]; 


    if(empty_fill){

        for(let i = 0; i < kMeansData.length; i++){
            let r = kMeansData[i];
            let g = kMeansData[i + 1];
            let b = kMeansData[i + 2];
            let a = 255;

            //00000011
            //00000100
            //00000111
    
            let color = 0;
            color |= a;
            color |= r << 16;
            color |= g << 8;
            color |= b << 24;
    
    
    
            if(unique_colors[color] == undefined){
                unique_colors[color] = 1;
            }else{
                unique_colors[color] = unique_colors[color] + 1;
                if(unique_colors[color] > max_color_count){
                    max_color_count = unique_colors[color];
                    color_fill = [r,g,b];
                }
            }
        }
    

    }
    

    let original_object_pixels = new Uint8ClampedArray((cannyData.length)/4);

    
    for(let i = 0; i < objects_identified.length; i++){
        let object = objects_identified[i];
        for(let j = 0; j < object.length; j++){

            let data_index = object[j];

            image_data[data_index] = color_fill[0];
            image_data[data_index + 1] = color_fill[1];
            image_data[data_index + 2] = color_fill[2];
            image_data[data_index + 3] = 255;
        }
    }

    
    for(let i = 0; i < objects_identified.length; i++){
        let object = objects_identified[i];
        let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        let distance = Math.floor(Math.random() * (object_variance));

        for(let j = 0;  j < object.length; j++){

            let data_index = object[j];

            if(object_variance){

                let row = Math.floor((object[j]/4)/imageWidth); 
                let column = (object[j]/4) - (row * imageWidth);

                if(object.length < object_pixel_threshold){
                    data_index = genRandomObjectVariance(randomNeighbor, parseInt(distance/factor_value), row, column);
                    
                }else{
                    data_index = genRandomObjectVariance(randomNeighbor, distance, row, column);

                }

                original_object_pixels[object[j]/4] = 1;
                original_object_pixels[data_index/4] = 0;

                
                
                //if the displaced pixel is out of bounds, just skip its calculations
                if(data_index == -1) continue;

                // image_data[object[j]] = most_common_color[0];
                // image_data[object[j] + 1] = most_common_color[1];
                // image_data[object[j] + 2] = most_common_color[2];
                

                if(!allow_overlap && image_data[data_index] !== 0){
                    i--; 
                    break;
                }

            }

            let cannyPixel = cannyData[object[j]];
            let LBPPixel = LBPData[object[j]];


            let pixelR = 0;
            let pixelG = 0;
            let pixelB = 0;

            if(LBPPixel > 128){

                let LBPMidRatio = LBPPixel/128 - 1; 
                let boost = maxBoost * LBPMidRatio;
               
                pixelR = Math.max((kMeansData[object[j]] - boost), 0);
                pixelG = Math.max((kMeansData[object[j] + 1] - boost), 0);
                pixelB = Math.max((kMeansData[object[j] + 2] - boost), 0);
                
            }else{
                let LBPMidRatio = 1 - LBPPixel/128; 
                let boost = maxBoost * LBPMidRatio;

                pixelR = Math.min((kMeansData[object[j]] + boost), 255);
                pixelG = Math.min((kMeansData[object[j] + 1] + boost), 255);
                pixelB = Math.min((kMeansData[object[j] + 2] + boost), 255);
                
            }
            

            // let pixelA = cannyPixel == 0 ? LBPPixel:255;
            let pixelA = 255;

            // let redRatio = kMeansData[object[j]]/LBPPixel;
            // let greenRatio = kMeansData[object[j] + 1]/LBPPixel;
            // let blueRatio = kMeansData[object[j] + 2]/LBPPixel;

            // let newLBP = color_box_values.reduce(function(prev, curr) {
            //     return (Math.abs(curr - LBPPixel) < Math.abs(prev - LBPPixel) ? curr : prev);
            // });

            // let pixelR = parseInt(newLBP * redRatio);
            // let pixelG = parseInt(newLBP * greenRatio);
            // let pixelB = parseInt(newLBP * blueRatio);


            image_data[data_index] = pixelR;
            image_data[data_index + 1] = pixelG;
            image_data[data_index + 2] = pixelB;
            image_data[data_index + 3] = pixelA;


            
        }
    }

    // console.log(image_data); 
    // console.log(cannyData); 

    

    for(let i = 0; i < image_data.length; i+=4){
        if((image_data[i + 3]) == 0){
            image_data[i+3] = 255;
            image_data[i] = kMeansData[i];
            image_data[i+1] = kMeansData[i + 1];
            image_data[i+2] = kMeansData[i + 2];

            // image_data[i+3] = 255;
            // image_data[i] = 0;
            // image_data[i+1] = 255;
            // image_data[i+2] = 0;
            
        }
    }

    const clampedArray = new ImageData(
        image_data,

        imageWidth
        
    )

   

    postMessage({msg, payload: [clampedArray]});
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
    let attempts = 1;
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

  function crossEdgeBlur(stc_e, direction, data){
    
    let mid = Math.floor(stc_e/2);

    let interp_list = [];

    for(let r = -mid; r <= mid; r++){

        let x = r * Math.cos(direction);
        let y = r * Math.sin(direction);

        if(!validPixel(y,x)){
            interp_list.push(0);
            continue;
        }

        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let y2 = 0;

        if(x % 1 == 0){
            x1 = x - 1;
            x2 = x + 1;
        }else{
            x1 = Math.floor(x);
            x2 = Math.ceil(x);
        }
        if(y % 1 == 0){
            y1 = y - 1;
            y2 = y + 1;
        }else{

            y1 = Math.floor(y);
            y2 = Math.ceil(y);

        }

        let dataIndex = ((y) * imageWidth + (x)) * 4;

        let demon = ((x2-x1)*(y2-y1));
        //row, col

        let upLeft = validPixel(y1, x1) ? data[((y1) * imageWidth + (x1)) * 4]: 0;
        let upRight = validPixel(y1, x2) ? data[((y1) * imageWidth + (x2)) * 4]: 0;
        let bottomLeft = validPixel(y2,x1) ? data[((y2) * imageWidth + (x1)) * 4]: 0;
        let bottomRight = validPixel(y2, x2) ? data[((y2) * imageWidth + (x2)) * 4]: 0;

        let interpolated = 
        (((x2-x) * (y2-y))/demon) * upLeft +
        (((x-x1) * (y2-y))/demon) * upRight +
        (((x2-x) * (y-y1))/demon) * bottomLeft +
        (((x-x1) * (y-y1))/demon) * bottomRight;

        interp_list.push(interpolated);
    }

    return interp_list;


  }

  function oneDimensionalGaussian(stc_e, interp_list){
    let mid = Math.floor(stc_e/2);

    let kernel = [];
    if(stc_e == 3){
        kernel = [1,2,1];
    }else{
        kernel = [1,5,10,10,5,1];
    }

    let sum = 0;
    if(stc_e == 3){
        sum = 4; 
    }else{
        sum = 32;
    }

    // for(let x = -mid; x <= mid; x++){

    //     let distance = Math.abs(x);
    //     let root = (1/(Math.sqrt(2*Math.PI*stc_e*stc_e)));
    //     let power = -(distance*distance)/(2*stc_e*stc_e);
    //     let epsi = Math.pow(Math.E, power);
    //     let gValue = root*epsi;

    //     sum = sum + gValue; 
    //     kernel.push(gValue);
    // }

    let gaussianSum = 0;

    // for(let i = 0; i < kernel.length; i++){
    //     let gaussianValue = kernel[i]/sum;
    //     gaussianSum = gaussianSum + (gaussianValue*interp_list[i]); 
    // }

    // for(let i = 0; i < kernel.length; i++){
    //     let gaussianValue = kernel[i]/sum;
    //     gaussianSum = gaussianSum + (gaussianValue*interp_list[i]); 
    // }

    for(let i = 0; i < kernel.length; i++){
        let gaussianValue = kernel[i] * interp_list[i];
        gaussianSum+=gaussianValue; 
    }



    return gaussianSum/sum;
    
  }

  function generateDog({msg, payload}){
    
    let std_c = 0.1; //standard deviation of sobel gaussian blur
    let stc_e = 3; //standard deviation of one dimension across edge gaussian blur
    let k = 2; //second gaussian std scalar
    let t = 1; //second gaussian scalar
    
    let o = 1;
    let e = 0;

    let src = cv.matFromImageData(payload[0]);
    // const srcClone = src.clone(); 
    // let firstGaussian = new cv.Mat();
    // let secondGaussian = new cv.Mat();

    // let ksize = new cv.Size(0, 0);
    // cv.GaussianBlur(src, firstGaussian, ksize, std_c, cv.BORDER_DEFAULT);
    // cv.GaussianBlur(src, secondGaussian, ksize, (std_c*k), cv.BORDER_DEFAULT);

    // let difference = new cv.Mat(firstGaussian.size(), firstGaussian.type());
    // for(var y = 0; y < firstGaussian.rows; y++ ){
    //     for(var x = 0; x < firstGaussian.cols; x++)
    //         { 
                
    //             let differencePixel = difference.ucharPtr(y,x);
    //             let first = firstGaussian.ucharPtr(y, x);
    //             let second = secondGaussian.ucharPtr(y, x);

    //             differencePixel[0] = first[0] - second[0];
    //             let debug = differencePixel[0];
                

    //         }
    // }

    // firstGaussian.delete();
    // secondGaussian.delete();
    // src.delete();

    let imageData: Uint8ClampedArray = structuredClone(payload[0].data); 
    imageWidth = payload[1];
    imageHeight = (imageData.length/4) / imageWidth;
    let I_X = new cv.Mat(src.rows, src.cols, 6);
    let I_Y = new cv.Mat(src.rows, src.cols, 6);

    //CONVERT TO GRAY SCALE
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);

    //input, output, depth, orderx, ordery, kernel size
    cv.Sobel(src, I_X, cv.CV_64F, 1, 0, 3, cv.BORDER_DEFAULT);
    // cv.convertScaleAbs(I_X, I_X, 1, 0);

    cv.Sobel(src, I_Y, cv.CV_64F, 0, 1, 3, cv.BORDER_DEFAULT);
    // cv.convertScaleAbs(I_Y, I_Y, 1, 0);

    let numberTest: number = new Number(I_X.ucharPtr(0,31)[0]);
    console.log(numberTest); 
    console.log(I_X.data);
    cv.convertScaleAbs(I_X, I_X, 1, 0);
    console.log("convered");
    console.log(I_X.ucharPtr(0,31)[0]); 
    console.log(I_X.data);

    let I_X2 = I_X.mul(I_X,1);
    let numberTester: number = new Number(I_X2.ucharPtr(0,31)[0]);
    console.log(numberTester);
    let I_Y2 = I_Y.mul(I_Y,1);
    let I_XY = I_X.mul(I_Y,1);
    
    
    
    let E = new cv.Mat();
    let F = new cv.Mat();
    let G = new cv.Mat();
    let ksize = new cv.Size(0, 0);
    cv.GaussianBlur(I_X2, E, ksize, std_c, cv.BORDER_DEFAULT);
    cv.GaussianBlur(I_XY, F, ksize, std_c, cv.BORDER_DEFAULT);
    cv.GaussianBlur(I_Y2, G, ksize, std_c, cv.BORDER_DEFAULT);

    

    //(E+G +- sqrt( (E-G)^2 + 4F^2)  )/2

    let newImage = new cv.Mat(G.size(),G.type());

    let ten = Math.floor(G.rows);

    for(var y = 0; y < G.rows; y++ ){
        for(var x = 0; x < G.cols; x++)
            { 
                let e = E.ucharPtr(y,x)[0];
                let f = F.ucharPtr(y,x)[0];
                let g = G.ucharPtr(y,x)[0];

                let EGSquare = (e-g) * (e-g);
                let FSquare = f * f;
                let rootbytwo = (Math.sqrt(EGSquare + (4*FSquare)))/2;
                
                let lambdaOne =  (e + g) + rootbytwo;
                // let lambdaTwo = (e + g) - rootbytwo;

                let eigenvector = [lambdaOne - e, -f];
                let directionRadians = Math.atan2(eigenvector[1], eigenvector[0]);
                let directionDegrees = (Math.atan2(eigenvector[1], eigenvector[0]) * 180) / Math.PI;
                if(directionDegrees < 0){
                    directionDegrees = directionDegrees + 360; 
                }
                let directionDiffernce = (directionDegrees * 0.70);

                let pixel = newImage.ucharPtr(y, x);

                // let interp_list_primary = crossEdgeBlur(stc_e, directionRadians, imageData);
                // let primaryGaussianValue = oneDimensionalGaussian(stc_e, interp_list_primary);
                // let interp_list_secondary = crossEdgeBlur((stc_e *k), directionRadians, imageData);
                // let secondaryGaussianValue = oneDimensionalGaussian((stc_e * k), interp_list_secondary);

                // let difference_of_gaussians = (1 + t)*primaryGaussianValue - (t) * secondaryGaussianValue;
                // let difference_of_gaussians = primaryGaussianValue - secondaryGaussianValue;

                

                pixel[0] = Math.floor(directionDegrees);

            }
    }

    console.log(newImage.data);

    
    let finalImage = imageDataFromMat(I_Y);

    console.log(finalImage.data);

    postMessage({ msg, payload: finalImage});
    
    I_X2.delete();
    I_Y2.delete();
    I_XY.delete();
    I_X.delete(); 
    I_Y.delete();
    E.delete();
    F.delete();
    G.delete();
    src.delete();

    

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
      case 'dog':
        return generateDog(e.data);
      default:
        break
    }
  }

//REPEAT OJBECTS DUHHHH LIKE OMGG???
//ADD OPTIONAL COLOR PALETTES FOR IMAGE GENERATION BASED ON ORIGINAL IMAGE 