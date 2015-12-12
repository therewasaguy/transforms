var reds;
var greens;
var blues;
var zeroes;

// pixels uint8
var pxls;

var w = 512, h = 512;

var img;

function preload() {
	img = loadImage('img/coolcity512.jpg');
}

function setup() {
	cnv = createCanvas(w, h);
	ctx = cnv.elt.getContext('2d');
	// background(0);
	pixelDensity(1);
	// noStroke();
	frameRate(1);

	reds = new Uint8ClampedArray(w*h);
	greens = new Uint8ClampedArray(w*h);
	blues = new Uint8ClampedArray(w*h);
	alphas = new Uint8ClampedArray(w*h);

	zeroes = new Uint8ClampedArray(w*h);

	// drawGradient();
	image(img, 0, 0);

	pxls = ctx.getImageData(0, 0, width, height).data;

	for (var i = 0; i < pxls.length /4; i++) {
		reds[i] = pxls[i*4];
		greens[i] = pxls[i*4 + 1];
		blue[i] = pxls[i*4 + 2];
		alphas[i] = pxls[i*4 + 3];
	}

	// var newReds = new Uint8ClampedArray( doFFT(reds).real );
	// var newGreens = new Uint8ClampedArray( doFFT(greens).real );
	// var newBlues = new Uint8ClampedArray( doFFT(blues).real );

	miniFFT(reds, zeroes);
	zeroes = new Uint8ClampedArray(w*h);

	miniFFT(greens, zeroes);
	zeroes = new Uint8ClampedArray(w*h);

	miniFFT(blues, zeroes);

	// miniFFT(alphas, zeroes);


	fillImageRGB(reds, greens, blues, alphas);

	// var newImgData = new Uint8ClampedArray ( fft.FFTImageDataRGBA(pxls, w, h).real );
	// console.log(newImgData);
	// fillImageFromData(newImgData);


	// zeroes = new Uint8ClampedArray(w*h);
	// miniFFT(reds, zeroes);

	// zeroes = new Uint8ClampedArray(w*h);
	// miniFFT(greens, zeroes);

	// zeroes = new Uint8ClampedArray(w*h);
	// miniFFT(blues, zeroes);

	// fillImageRGB(reds, greens, blues);

}

function draw() {
	// fillImageRGB(reds, greens, blues);

	// createAudioBuffer(pxls);
	// createOfflineBuffer(pxls);
}


//////// do the FFT with js.fft library
function doFFT(values) {

	var data = new complex_array.ComplexArray(values.length);

	// Use the in-place mapper to populate the data.
	data.map(function(value, i, n) {
	  value.real = (i > n/3 && i < 2*n/3) ? 1 : 0
	});

	var frequencies = data.FFT();

	return frequencies;
}


/////// fill image
function fillImageRGB(r, g, b, a) {
	var len = r.length*4;
	var imageDataArray = new Uint8ClampedArray(len);

	for (var i = 0; i < len/4; i++) {
		imageDataArray[i*4] = r[i];
		imageDataArray[i*4 + 1] = g[i];
		imageDataArray[i*4 + 2] = b[i];
		imageDataArray[i*4 + 3] = a[i];
	}

	fillImageFromData(imageDataArray);

}

function fillImageFromData(newData) {
	var imageData = new ImageData(newData, width, height);
	imageData.data = newData;
	ctx.putImageData(imageData, 0, 0, 0, 0, width, height);
}

function drawGradient() {
	colorDensity = floor(random(2, 100));
	colorMode(HSB, colorDensity);
	var pixelSize = width / colorDensity;

	for (i = 0; i < colorDensity; i++) {
		for (j = 0; j < colorDensity; j++) {
			fill(i, j, colorDensity, 100);
			rect(i * pixelSize, j*pixelSize, pixelSize, pixelSize);
		}
	}
}