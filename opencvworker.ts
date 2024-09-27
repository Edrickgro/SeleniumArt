
// @ts-nocheck

let CVLoaded = false;

function openCvReady() {
    cv['onRuntimeInitialized']=()=>{
      CVLoaded = true; 
      postMessage(["READY!", undefined]);
    };
    
}

function kMeans(image){

    console.log(1);

    let mat = cv.matFromImageData(image);
    let sample = new cv.Mat(mat.rows * mat.cols, 3, cv.CV_32F);

    for( var y = 0; y < mat.rows; y++ ){
        for( var x = 0; x < mat.cols; x++ ){
            for( var z = 0; z < 3; z++){
                sample.floatPtr(y + x*mat.rows)[z] = mat.ucharPtr(y,x)[z];
            }
        }
    }

        
    let clusterCount = 3;
    let labels= new cv.Mat();
    let attempts = 5;
    let centers= new cv.Mat();

    
    let crite= new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 10000, 0.0001);
    let criteria = [1,10,0.0001];

    
    cv.kmeans(sample, clusterCount, labels, crite, attempts, cv.KMEANS_RANDOM_CENTERS, centers );

    console.log(2);

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


    postMessage(["kmeans", clampedArray]);

}

function edges(image){

    let src = cv.matFromImageData(image);

    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    let min_set = 50;
    let max_set = 200;
    // You can try more different parameters
    cv.Canny(src, dst, min_set, max_set, 3, false);
    console.log("SUCCESSFULLY");

}





onmessage = function(e) {
switch(e.data[0]) {
    case "load": {
    
    // Import Webassembly script
    importScripts("opencv.js");
    openCvReady();
    break;
    }
    case "kmeans":{

        console.log("CALLING KMEANS");
        kMeans(e.data[1]);
        // edges(e.data[1]);

    
    break;
    }
    case "edges":{

    }
    default: break;
}  
}
