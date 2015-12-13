// audio
// 

var audioContext = new AudioContext();

var aNode = audioContext.createAnalyser();
aNode.fftSize = 512;
var bufferLength = aNode.frequencyBinCount;
var audioWaveform = new Float32Array(bufferLength);
var freqDomain = new Uint8Array(bufferLength);

function playColumn(imageData) {
	var audioBuffer = createAudioBuffer(imageData);
	var bufferSource = audioContext.createBufferSource();
	bufferSource.connect(audioContext.destination);
	bufferSource.buffer = audioBuffer;
	console.log(bufferSource);
	bufferSource.start();
}

function createAudioBuffer(imageData) {
	var channels = 1;
	var frameCount = Math.floor( imageData.length / channels );
	var audioBuffer = audioContext.createBuffer(channels, frameCount, audioContext.sampleRate);

	fillAudio(audioBuffer, imageData, frameCount, channels);
	return audioBuffer;
}


// take an array buffer of some data, and fill an audio buffer with that data
function fillAudio(audioBuffer, imageData, frameCount, channels) {
	for (var channel = 0; channel < channels; channel++) {
		// This gives us the actual ArrayBuffer that contains the data
		var nowBuffering = audioBuffer.getChannelData(channel);

		for (var i = 0; i < frameCount; i++) {
			nowBuffering[i] = imageData[i];
			// nowBuffering[i] = map(imageData[i], 0, 255, -1, 1);
		}
	}
}

function makeOsc(wave){
	var oscillator = audioContext.createOscillator();
	oscillator.setPeriodicWave(wave);
}