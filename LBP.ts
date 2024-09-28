let LBPCanvas = <HTMLCanvasElement>document.getElementById("LBP-canvas");
let LBPCanvasCtx = LBPCanvas.getContext("2d");
let button = document.getElementById("LBP-button");



function get_average(i){
    return (unmutableData[i] + unmutableData[i + 2] + unmutableData[i + 3])/3;
}

function check_binary(pixel_average, neighbor_average){

    if(neighbor_average == undefined || neighbor_average < pixel_average){
        return "0";
    }

    return "1"; 

}



button.addEventListener("click", (event)=>{

    LBPCanvas.style.animationPlayState = "running";

    // var uniformNum = [0, 1, 2, 3, 4, 6, 7, 8, 12, 14, 15, 16, 24, 28, 30, 31, 32, 48, 
    //     56, 60, 62, 63, 64, 96, 112, 120, 124, 126, 127, 128, 129, 131, 135, 143, 
    //     159, 191, 192, 193, 195, 199, 207, 223, 224, 225, 227, 231, 239, 240, 241, 
    //     243, 247, 248, 249, 251, 252, 253, 254, 255];

    for (let i = 0; i < unmutableData.length; i += 4) {
        let bitString = "";
        let index = i/4;
        let row = Math.floor(index/image_width);
        let column = index - (row * image_width);

        let average = (unmutableData[i] + unmutableData[i + 2] + unmutableData[i + 3])/3;


        let topLeft = ((row - 1) * image_width + (column - 1)) * 4;
        let topLeft_average = get_average(topLeft);
        bitString+=check_binary(average, topLeft_average);

        let topMiddle = ((row -1) * image_width + column) * 4;
        let topMiddle_average = get_average(topMiddle);
        bitString+=check_binary(average, topMiddle_average);

        let topRight = ((row - 1) * image_width + (column + 1)) * 4;
        let topRight_average = get_average(topRight);
        bitString+=check_binary(average, topRight_average);

        let rightMiddle = ((row) * image_width + (column + 1)) * 4;
        let rightMiddle_average = get_average(rightMiddle);
        bitString+=check_binary(average, rightMiddle_average);

        let rightBottom = ((row + 1) * image_width + (column + 1)) * 4;
        let rightBottom_average = get_average(rightBottom);
        bitString+=check_binary(average, rightBottom_average);

        let bottomMiddle = ((row + 1) * image_width + (column)) * 4;
        let bottomMiddle_average = get_average(bottomMiddle);
        bitString+=check_binary(average, bottomMiddle_average);

        let bottomLeft = ((row + 1) * image_width + (column - 1)) * 4;
        let bottomLeft_average = get_average(bottomLeft);
        bitString+=check_binary(average, bottomLeft_average);

        let leftMiddle = ((row) * image_width + (column - 1)) * 4;
        let leftMiddle_average = get_average(leftMiddle);
        bitString+=check_binary(average, leftMiddle_average);

        let binaryNumber = parseInt(bitString,2);

        // var closest = uniformNum.reduce(function(prev, curr) {
        // return (Math.abs(curr - binaryNumber) < Math.abs(prev - binaryNumber) ? curr : prev);
        // });
       
        dummyData[i] = binaryNumber;
        dummyData[i + 1] = binaryNumber;
        dummyData[i + 2] = binaryNumber;
        

    }

    // console.log(image_width);
    // console.log(LBP_data.length);

    // let LBPImageData = new ImageData(LBP_data, image_width);
    dummyctx.putImageData(dummyImageData, 0, 0);
    LBPCanvas.width = image_width;
    LBPCanvas.height = image_height;
    LBPCanvasCtx.drawImage(dummyctx.canvas, 0,0);

    LBPCanvas.style.animationPlayState = "paused";
    


});

// divide array by 4 for num pixels
// w = 10
// h = 8
// array[12/4 = 3]
// row = floor(index/width)
// colum = index - (row * width) 
// [2,2](20). =  [(row * width) + (column)] * 4   