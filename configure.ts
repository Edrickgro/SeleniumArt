
let canvases = document.querySelectorAll("canvas");

canvases.forEach((canvas) => {
    let ctx = canvas.getContext("2d"); 
    // ctx.fillStyle = "#433E0E";
    ctx.fillStyle = "#dcdcdc";
    ctx.fillRect(0, 0, canvas.width,canvas.height);
});

let canvas = <HTMLCanvasElement> document.getElementById("image-canvas");
var dummyCanvas = <HTMLCanvasElement> document.getElementById("dummy-canvas");


let ctx = canvas.getContext("2d");
var dummyctx = dummyCanvas.getContext("2d");
let fileElement = document.getElementById("file-input");
let videoFileElement = document.getElementById("video-file-input");

var hiddenCanvas = <HTMLCanvasElement>document.getElementById("hidden-canvas");
var hiddenCanvasctx = hiddenCanvas.getContext("2d");

var image_width = 0;
var image_height = 0;


var dummyImageData = dummyctx.getImageData(0,0,dummyCanvas.width, dummyCanvas.height);
var dummyData = dummyImageData.data;

var unmutableImageData = structuredClone(dummyImageData);
var unmutableData = unmutableImageData.data;

fileElement.addEventListener("change", (e)=>{

    canvas.style.animationPlayState = "running";

    let reader = new FileReader();
    reader.readAsDataURL((<HTMLInputElement>e.target).files[0]);  
    reader.onload = function(event){
        let img = new Image;
        img.onload = function(){
            dummyCanvas.width = img.width;
            dummyCanvas.height = img.height;
            canvas.width = img.width;
            canvas.height = img.height;
            image_width = img.width;
            image_height = img.height;

            hiddenCanvas.width = img.width;
            hiddenCanvas.height = img.height;

            hiddenCanvas.getContext("2d").drawImage(img,0,0);
            dummyctx.drawImage(img,0,0);

            ctx.drawImage(img,0,0, canvas.width, canvas.height);

            canvas.style.animationPlayState = "paused";

            dummyImageData = dummyctx.getImageData(0,0,dummyCanvas.width, dummyCanvas.height);
            dummyData = dummyImageData.data;

            unmutableImageData = structuredClone(dummyImageData);
            unmutableData = unmutableImageData.data;
                             
        }

        // img.addEventListener("onload", ()=>setupCanvas(img), false);
        let result: string = event.target.result as string;
        img.src = result;
    }      


});


function videoCanvasSet(video){

    dummyCanvas.width = video.videoWidth;
    dummyCanvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    image_width = video.videoWidth;
    image_height = video.videoHeight;

    hiddenCanvas.width = video.videoWidth;
    hiddenCanvas.height = video.videoHeight;
    
}

async function setVideoFrame(videoFrame){

    hiddenCanvas.getContext("2d").drawImage(videoFrame,0,0);
    dummyctx.drawImage(videoFrame,0,0);
    ctx.drawImage(videoFrame,0,0, canvas.width, canvas.height);

    dummyImageData = dummyctx.getImageData(0,0,dummyCanvas.width, dummyCanvas.height);
    dummyData = dummyImageData.data;

    unmutableImageData = structuredClone(dummyImageData);
    unmutableData = unmutableImageData.data;
                     
}
