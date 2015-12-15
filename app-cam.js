// shims
var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame ||
		window.webkitCancelRequestAnimationFrame || 
		window.webkitCancelAnimationFrame ||
		window.mozCancelRequestAnimationFrame || window.mozCancelAnimationFrame ||
		window.oCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
		window.msCancelRequestAnimationFrame || window.msCancelAnimationFrame;

navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;

// two canvases / contexts
var cnv1, ctx1, cnv2, ctx2;
var video;

var numRows = 8;
var numCols = 2;
var counter = 0;
var curMatrixIndex, prevMatrixIndex;
var curColor = [0, 0, 0];

var w, h;
var pixelScaling = 12;

// event listeners
window.addEventListener('load', init);

function init() {
	w = window.innerWidth/pixelScaling;
	h = window.innerHeight/pixelScaling;

	cnv1 = document.createElement('canvas');
	cnv1.width = w;
	cnv1.height = h;

	ctx1 = cnv1.getContext('2d');
	// flip canvas
	ctx1.translate(cnv1.width, 0);
	ctx1.scale(-1, 1);

	cnv2 = document.createElement('canvas');
	cnv2.width = w*pixelScaling;
	cnv2.height = h*pixelScaling;
	ctx2 = cnv2.getContext('2d');
	ctx2.scale(pixelScaling,pixelScaling);
	var container = document.getElementById('container');
	container.appendChild(cnv2);

	video = document.createElement('video');
	video.width = w;
	video.height = h;
	video.hidden = true;
	document.body.appendChild(video);

	startCam();
	draw();
}

function startCam() {
	if (navigator.getUserMedia){
		navigator.getUserMedia({video: true}, function(stream) {
			video.src = window.URL.createObjectURL(stream) || stream;
			video.play();
		}, function(error) {alert("Your browser doesnt allow access to webcam. Try Chrome ");});
	}
};

function draw() {
	var rowWidth = Math.round(w/numRows);
	var colHeight = Math.round(h/numCols);

	// draw video to graphics context 1 (which is hidden)
	ctx1.drawImage(video, 0, 0, cnv1.width, cnv1.height);

	// keep track of which box we're in
	var indexCounter = 0;

	// split into rows and colums
	for (var col = 0; col < (h - colHeight); col+= colHeight) {
		for (var row = 0; row < (w - rowWidth); row+= rowWidth) {

			ctx2.globalAlpha=0.9;

			// get a rectangle of image data (pixels)
			var imgData = ctx1.getImageData(row, col, rowWidth, colHeight);

			// find average rgb value in this rectangle
			var avgRGB = getAverageRGB(imgData.data);

			// draw a rectangle on graphics context 2 (visible)
			var c = rgbToHex(avgRGB);
			ctx2.fillStyle=c;
			ctx2.fillRect(row, col, rowWidth, colHeight);

			// show which item we're on. curMatrixIndex is set by tone.loop in app-audio.js
			if (curMatrixIndex === indexCounter) {
				ctx2.globalAlpha=0.07;
				ctx2.fillStyle='#fffff0';
				ctx2.fillRect(row, col, rowWidth, colHeight);
				curColor = rgbToHsl(avgRGB);
			}

			indexCounter++;
		}
	}
	// call this function again in 50 ms
	setTimeout(draw,50);
}

//http://jsfiddle.net/jsonsigal/wL923om1/
function getAverageRGB(pxls) {
	var blockSize = 5, // only visit every 5 pixels
		rgb = {r: 0, g: 0, b: 0},
		i = -4,
		length,
		count = 0;

	var length = pxls.length;

	while ( (i += blockSize * 4) < length ) {
		++count;
		rgb.r += pxls[i];
		rgb.g += pxls[i+1];
		rgb.b += pxls[i+2];
	}

	// ~~ used to floor values
	rgb.r = ~~(rgb.r/count);
	rgb.g = ~~(rgb.g/count);
	rgb.b = ~~(rgb.b/count);
	
	return rgb;
}

// via http://stackoverflow.com/a/5624139
function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(c) {
		return "#" + componentToHex(c.r) + componentToHex(c.g) + componentToHex(c.b);
}

/**
 * via http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(c){
    var r = c.r/255, g = c.g/255, b = c.b/= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function map(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}