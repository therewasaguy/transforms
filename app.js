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
	background(0);
	pixelDensity(1);
	noStroke();
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
		blues[i] = pxls[i*4 + 2];
		alphas[i] = pxls[i*4 + 3];
	}

	redFFT = doFFT(reds);
	greenFFT = doFFT(greens);
	blueFFT = doFFT(blues);

	console.log(redFFT);
	// redFFT = scaleFFT(redFFT, 20);
	// greenFFT = scaleFFT(greenFFT, 20);
	// blueFFT = scaleFFT(blueFFT, 20);

	var redInv = inverseFFT(redFFT);
	var greenInv = inverseFFT(greenFFT);
	var blueInv = inverseFFT(blueFFT);

	fillImageRGB(redInv.real, greenInv.real, blueInv.real, alphas);
}

function oscCol(complex, freq) {

	// REAL
	// var theMax = complex.real.max();
	// var theMin = complex.real.min();
	// var actualMax = Math.max(theMax, Math.abs(theMin));

	// var realBuffer = new Float32Array(complex.real.length);
	// for (var i = 0; i < complex.real.length; i++) {
	// 	realBuffer[i] = complex.real[i] / actualMax;
	// }

	// // IMAG
	// theMax = complex.real.max();
	// theMin = complex.real.min();
	// actualMax = Math.max(theMax, Math.abs(theMin));

	// var imagBuffer = new Float32Array(complex.real.length);
	// for (var i = 0; i < complex.real.length; i++) {
	// 	imagBuffer[i] = complex.imag[i] / actualMax;
	// }

	// make oscillator slicing one row
	for (var i = 0; i < h; i++) {
		complex.real[i] = 0.1;
		complex.imag[i] = 0.1;
		makeOscillator(complex.real.slice(i, i + w), complex.imag.slice(i, i +w), i, freq);
	}
}

function makeOscillator(realBuffer, imagBuffer, t, freq) {
	var osc = audioContext.createOscillator();
	var gain = audioContext.createGain();
	var now = audioContext.currentTime;

	var wave = audioContext.createPeriodicWave(realBuffer, imagBuffer, {disableNormalization: false});
	osc.setPeriodicWave(wave);

	osc.connect(gain);
	gain.connect(audioContext.destination);
	gain.gain.value = 0;
	osc.frequency.value = freq;

	osc.start(audioContext.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.5, now + t/100);
	gain.gain.exponentialRampToValueAtTime(0.00001, now + t/100 + 2);
}



// function playAColumn(num) {
// 	var allPixels = ctx.getImageData(0, 0, width, height).data;
// 	var columnData = new Array(h);
// 	for (var i = num; i < w; i += w) {
// 		columnData.push(allPixels[i]);
// 	}
// 	playColumn(columnData);

// }


function draw() {

}


//////// do the FFT with js.fft library
function doFFT(values) {
	var data = new complex_array.ComplexArray(values.length);
	data.real = new Float32Array(values);
	var frequencies = data.FFT();

	return frequencies;
}

function inverseFFT(complex) {
	var data = new complex_array.ComplexArray(complex.real.length);
	data.real = new Float32Array(complex.real);
	data.imag = new Float32Array(complex.imag);
	var inverse = data.InvFFT();
	return inverse;
}

function scaleFFT(complex, scalar) {
	var scalar = scalar || 20;
	// scale real
	for (var i = 0; i < complex.length; i++) {
		complex.real[i] = scalar*Math.log(Math.abs(complex.real[i]));
		complex.imag[i] = scalar*Math.log(Math.abs(complex.imag[i]));
	}
	return complex;
}


/////// fill image - alpha is 255 if not provided
function fillImageRGB(r, g, b, a) {
	var len = r.length*4;
	var imageDataArray = new Uint8ClampedArray(len);

	for (var i = 0; i < len/4; i++) {
		imageDataArray[i*4] = r[i];
		imageDataArray[i*4 + 1] = g[i];
		imageDataArray[i*4 + 2] = b[i];
		imageDataArray[i*4 + 3] = a ? a[i] : 255;
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