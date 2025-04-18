const cameraFeed = document.getElementById('cameraFeed');
const takePhotoButton = document.getElementById('takePhotoButton');
const photoStrip = document.getElementById('photoStrip');
const downloadButton = document.getElementById('downloadButton');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const canvasContext = hiddenCanvas.getContext('2d');
const toggleMirrorButton = document.getElementById('toggleMirrorButton');

let stream;
const capturedImages = [];
const numberOfPhotos = 3; 
let isMirrored = true;      // starts the camera as mirrored

// get user's webcam
async function enableCamera(){
    console.log('enableCamera function called'); // Added debug log
    try{
        stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        cameraFeed.srcObject = stream;
    } catch (error){
        console.error('Error accessing camera. Please try again.', error);
    }
}

function updateMirrorEffect(){
    if(isMirrored){
        cameraFeed.style.transform = 'scaleX(-1)';
        cameraFeed.style.webkitTransform = 'scaleX(-1)';
        toggleMirrorButton.textContext = 'Disable Mirror';
    } else {
        cameraFeed.style.transform = 'scaleX(1)'    // not mirrored
        cameraFeed.style.webkitTransform = 'scaleX(1)';
        toggleMirrorButton.textContext = 'Enable Mirror';
    }
}

// take the pic
function takePhoto(){
    if(!stream) return;

    hiddenCanvas.width = cameraFeed.videoWidth;
    hiddenCanvas.height = cameraFeed.videoHeight;
    canvasContext.drawImage(cameraFeed, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

    const imageDataURL = hiddenCanvas.toDataURL('image/png');
    capturedImages.push(imageDataURL);

    const img = document.createElement('img');
    img.src = imageDataURL;
    photoStrip.appendChild(img);

    if(capturedImages.length === numberOfPhotos){
        takePhotoButton.disabled = true;
        downloadButton.disabled = false;
    }
}

// be able to download the photostrip
function downloadStrip() {
    if (capturedImages.length === 0) return;

    const stripCanvas = document.createElement('canvas');
    const stripContext = stripCanvas.getContext('2d');
    const imageWidth = 200;
    const imageHeight = (cameraFeed.videoHeight / cameraFeed.videoWidth) * imageWidth;
    const padding = 10;
    stripCanvas.width = capturedImages.length * imageWidth + (capturedImages.length - 1) * padding;
    stripCanvas.height = imageHeight;

    let xOffset = 0;
    capturedImages.forEach(imageData => {
        const img = new Image();
        img.onload = () => {
            stripContext.save();
            if (isMirrored) { // Apply mirroring to the downloaded image as well
                stripContext.translate(xOffset + imageWidth, 0);
                stripContext.scale(-1, 1);
            }
            stripContext.drawImage(img, 0, 0, imageWidth, imageHeight);
            stripContext.restore();
            xOffset += imageWidth + padding;

            if (xOffset >= stripCanvas.width) {
                const finalImageDataURL = stripCanvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = finalImageDataURL;
                a.download = 'photobooth_strip.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        };
        img.src = imageData;
    });
}

// Event listeners
takePhotoButton.addEventListener('click', takePhoto);
downloadButton.addEventListener('click', downloadStrip);
toggleMirrorButton.addEventListener('click', () =>{
    isMirrored = !isMirrored;
    updateMirrorEffect();
});

// Enable the camera when the page loads
enableCamera();