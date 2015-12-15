var baseNote = 36;
// var noteScale = [0, 2, 4, 5, 7, 9, 10, 12];
var noteScale = [0, 2, 4, 7, 9];
var octaveRange = 3;

// initialize audio components
var osc = new Tone.OmniOscillator('D2', 'sawtooth24');
var filter = new Tone.LowpassCombFilter();
filter.resonance.value = 0.2;
filter.delayTime.value = 0.2;
var gainNode = Tone.context.createGain();
var env = new Tone.Envelope({
	"attack" : 0.01,
	"decay" : 0.8,
	"sustain" : 0.01,
	"release" : 0.2,
});
env.connect(gainNode.gain);

// routing
osc.connect(gainNode);
gainNode.connect(filter);
filter.toMaster();

// start audio
osc.start();
Tone.Transport.bpm.value = 96;

// start loop
var loop = new Tone.Loop(function(time){
	counter++;
	curMatrixIndex = counter % (numRows * numCols);
	var noteIndex = ~~map(curColor[0], 0, 0.7, 0, noteScale.length*octaveRange);
	var note = noteScale[noteIndex % noteScale.length]
	var root = baseNote + Math.floor(noteIndex/noteScale.length)*12;
	osc.frequency.value = osc.midiToFrequency(note + root);

	filter.dampening.value = map(curColor[2], 0, 1, 30, 3500);

	if (curMatrixIndex !== prevMatrixIndex) {

		// trigger note!
		var vel = map(curColor[1], 0, 1, 0, 1);
		if (vel > 0.1) {
			env.triggerAttackRelease(0.2, undefined, vel);
		}
	}
	prevMatrixIndex = curMatrixIndex;


}, "16n").start(0);
Tone.Transport.start();