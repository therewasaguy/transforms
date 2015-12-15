var reds;
var greens;
var blues;
var zeroes;
var started = false;

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
	frameRate(5);
	reds = new Uint8ClampedArray(w*h);
	greens = new Uint8ClampedArray(w*h);
	blues = new Uint8ClampedArray(w*h);
	alphas = new Uint8ClampedArray(w*h);
	zeroes = new Uint8ClampedArray(w*h);

	// drawGradient();
	image(img, 0, 0);
	img.loadPixels();
	// pxls = ctx.getImageData(0, 0, width, height).data;
	pxls = img.pixels;

	for (var i = 0; i < pxls.length /4; i++) {
		reds[i] = pxls[i*4];
		greens[i] = pxls[i*4 + 1];
		blues[i] = pxls[i*4 + 2];
		alphas[i] = pxls[i*4 + 3];
	}

	redFFT = doFFT(reds);
	greenFFT = doFFT(greens);
	blueFFT = doFFT(blues);

	// redFFT = scaleFFT(redFFT, 20);
	// greenFFT = scaleFFT(greenFFT, 20);
	// blueFFT = scaleFFT(blueFFT, 20);

	var redInv = inverseFFT(redFFT);
	var greenInv = inverseFFT(greenFFT);
	var blueInv = inverseFFT(blueFFT);

	fillImageRGB(redInv.real, greenInv.real, blueInv.real, alphas);
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
	osc.frequency.value = freq + t/100;

	osc.start(audioContext.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.2, now + t/10);
	gain.gain.linearRampToValueAtTime(0, now + 0.2 + t/10);
	gain.connect(aNode);
}



function draw() {
	// background(0);
	// aNode.getFloatTimeDomainData(audioWaveform);

	// complexAudio = doFFT(audioWaveform);
	// inverseAudio = inverseFFT(complexAudio);

	// aNode.getFloatFrequencyData(freqDomain);
	if (started) {
		aNode.getByteFrequencyData(freqDomain);
		var len = freqDomain.length;

		// var rectSize = len/w;
		// var rectCount = w*h/len;

		// var c = 0;
		// for (var i = 0; i < rectCount; i++) {
		// 	for (var j = 0; j < rectCount; j++) {
		// 		// fill( Number(freqDomain[c] ), Number( freqDomain[c+1] ), Number( freqDomain[c+2] ), 50 );
		// 		fill(random(255), 0, 0);
		// 		rect(i*rectSize, j*rectSize, rectSize, rectSize);
		// 		// c = (c+4) % len;
		// 	}
		// }

		var rectWidth = w/len;

		var rectSize = h;
		for (var i = 0; i < len/4; i+=4) {
			fill(freqDomain[i], freqDomain[i+1], freqDomain[i+2]);
			rect(i*rectWidth*4, 0, rectSize, rectSize);
		}
	}
}

function keyPressed() {
	if (key === ' ') {
		// oscCol(greenFFT, 100);
		oscCol(blueFFT, 98);
		started = true;
	} else if (key === 'R') {
			oscCol(redFFT, 123);
	}
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