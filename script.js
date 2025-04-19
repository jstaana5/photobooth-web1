const cameraFeed = document.getElementById('cameraFeed');
const takePhotoButton = document.getElementById('takePhotoButton');
const photoStrip = document.getElementById('photoStrip');
const downloadButton = document.getElementById('downloadButton');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const canvasContext = hiddenCanvas.getContext('2d');
const layoutSelect = document.getElementById('layoutSelect');
const finalStripPreview = document.getElementById('finalStripPreview');
const finalPreviewCanvas = document.getElementById('finalPreviewCanvas');
const finalPreviewContext = finalPreviewCanvas.getContext('2d');
const finalDownloadButton = document.getElementById('finalDownloadButton');
const retakePhotosButton = document.getElementById('retakePhotosButton');
const flashOverlay = document.getElementById('flashOverlay'); // Get the flash overlay element

let stream;
const capturedImages = [];
const numberOfPhotos = 3; 
let currentLayout = 'vertical-3'; // Default


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


// take the pic
function takePhoto(){
    if(!stream) return;

     // Trigger the flash effect
     flashOverlay.style.opacity = 1;
     flashOverlay.style.display = 'block';
     setTimeout(() => {
         flashOverlay.style.opacity = 0;
         setTimeout(() => {
             flashOverlay.style.display = 'none';
         }, 300); // Duration of the fade-out (adjust as needed)
     }, 250); // Short delay for full white (adjust as needed)
 

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
        downloadButton.disabled = false; // Enable the preview button
    }
}

// func to reset the photobooth
function resetPhotobooth() {
    capturedImages.length = 0;
    photoStrip.innerHTML = '';
    takePhotoButton.disabled = false;
    downloadButton.disabled = true;
    finalStripPreview.style.display = 'none';
}

// func to preview the final photostrip before downloading
function previewStrip() {
    if (capturedImages.length === 0) return;

    const imageWidth = 200;
    const imageHeight = (cameraFeed.videoHeight / cameraFeed.videoWidth) * imageWidth;
    const padding = 10;
    let canvasWidth;
    let canvasHeight;
    let xOffset = 0;
    let yOffset = 0;

    switch (currentLayout) {
        case 'vertical-3':
            canvasWidth = imageWidth;
            canvasHeight = numberOfPhotos * imageHeight + (numberOfPhotos - 1) * padding;
            break;
        case 'horizontal-3':
            canvasWidth = numberOfPhotos * imageWidth + (numberOfPhotos - 1) * padding;
            canvasHeight = imageHeight;
            break;
        default:
            canvasWidth = imageWidth;
            canvasHeight = numberOfPhotos * imageHeight + (numberOfPhotos - 1) * padding;
            break;
    }

    finalPreviewCanvas.width = canvasWidth;
    finalPreviewCanvas.height = canvasHeight;
    finalPreviewContext.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous preview

    capturedImages.forEach(imageData => {
        const img = new Image();
        img.onload = () => {
            switch (currentLayout) {
                case 'vertical-3':
                    finalPreviewContext.drawImage(img, 0, yOffset, imageWidth, imageHeight);
                    yOffset += imageHeight + padding;
                    break;
                case 'horizontal-3':
                    finalPreviewContext.drawImage(img, xOffset, 0, imageWidth, imageHeight);
                    xOffset += imageWidth + padding;
                    break;
            }
        };
        img.src = imageData;
    });

    finalStripPreview.style.display = 'block'; // Show the preview section
}

// be able to download the photostrip
function downloadStrip() {
    if (capturedImages.length === 0) return;

    const selectedLayout = layoutSelect.value;
    const stripCanvas = document.createElement('canvas');
    const stripContext = stripCanvas.getContext('2d');
    const imageWidth = 200; // Adjust as needed
    const imageHeight = (cameraFeed.videoHeight / cameraFeed.videoWidth) * imageWidth;
    const padding = 10;

    let canvasWidth;
    let canvasHeight;

    switch (selectedLayout) {
        case 'vertical-3':
            canvasWidth = imageWidth;
            canvasHeight = numberOfPhotos * imageHeight + (numberOfPhotos - 1) * padding;
            break;
        case 'horizontal-3':
            canvasWidth = numberOfPhotos * imageWidth + (numberOfPhotos - 1) * padding; // Use imageWidth for horizontal width
            canvasHeight = imageHeight; // Use imageHeight for horizontal height
            break;
        default:
            canvasWidth = imageWidth;
            canvasHeight = numberOfPhotos * imageHeight + (numberOfPhotos - 1) * padding;
            break;
    }

    stripCanvas.width = canvasWidth;
    stripCanvas.height = canvasHeight;

    let yOffset = 0;
    let xOffset = 0;

    capturedImages.forEach((imageData, index) => {
        const img = new Image();
        img.onload = () => {
            switch (selectedLayout) {
                case 'vertical-3':
                    stripContext.drawImage(img, 0, yOffset, imageWidth, imageHeight);
                    yOffset += imageHeight + padding;
                    break;
                case 'horizontal-3':
                    stripContext.drawImage(img, xOffset, 0, imageWidth, imageHeight); // Use imageWidth for width
                    xOffset += imageWidth + padding;
                    break;
            }

            if (index === capturedImages.length - 1) {
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
downloadButton.addEventListener('click', previewStrip); // This line should use 'downloadButton'
finalDownloadButton.addEventListener('click', downloadStrip);
retakePhotosButton.addEventListener('click', () => {
    finalStripPreview.style.display = 'none';
    resetPhotobooth();
});
layoutSelect.addEventListener('change', (event) => {
    console.log("Layout changed to:", event.target.value);
    currentLayout = event.target.value;
    capturedImages.length = 0;
    photoStrip.innerHTML = '';
    takePhotoButton.disabled = false;
    downloadButton.disabled = true;
    finalStripPreview.style.display = 'none';
});

// Enable the camera when the page loads
enableCamera();