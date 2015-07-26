$.getScript('http://cdn.tonejs.org/latest/Tone.min.js', function()
{
	(function(ext) {
	
		var tone = new Tone();
		
		var synthOptions = {
			oscillator: {
				type: "square"
			},
			envelope: {
				attack: 0.03,
				decay: 0.1,
				sustain: 0.1,
				release: 0.03
			},
			portamento: 0.05
		};			
		
		var osc = new Tone.SimpleSynth(synthOptions);
		var lowPassFilt = new Tone.Filter(20000, "lowpass");
		lowPassFilt.Q = 10;
		osc.connect(lowPassFilt);
		lowPassFilt.toMaster();
		var targetFreq = osc.frequency.value;
		
		var triggerQuarterHat = false;
		Tone.Transport.setInterval(function(time){
			triggerQuarterHat = true;
		}, "4n");
		Tone.Transport.start();

		// Cleanup function when the extension is unloaded
		ext._shutdown = function() {};

		// Status reporting code
		// Use this to report missing hardware, plugin or unsupported browser
		ext._getStatus = function() {
			return {status: 2, msg: 'Ready'};
		};

		ext.oscOn = function() {
			osc.frequency.value = targetFreq;
			osc.triggerAttack();
		};
		
		ext.oscOff = function() {
			osc.triggerRelease();
		};
		
		ext.oscSetFreq = function(freq) {
			targetFreq = freq;
			osc.setNote(targetFreq);
		};

		ext.oscChangeFreqBy = function(freq) {
			targetFreq += freq;
			osc.setNote(targetFreq);
		};
		
		ext.getFreq = function() {
			return targetFreq;
		};
		
		ext.freqForNote = function(noteNum) {
			return tone.toFrequency(tone.midiToNote(noteNum + 12));
		};
		
		ext.setLowPassFreq = function(freq) {
			lowPassFilt.frequency.value = freq;
		};

		ext.changeLowPassFreqBy = function(freq) {
			lowPassFilt.frequency.value += freq;
		};

		ext.quarterHat = function() {
			if (triggerQuarterHat) {
				triggerQuarterHat = false;
				return true;
			} else {
				return false;
			}
		};

		// Block and block menu descriptions
		var descriptor = {
			blocks: [
				// Block type, block name, function name
				[' ', 'oscillator on', 'oscOn'],
				[' ', 'oscillator off', 'oscOff'],
				[' ', 'set oscillator frequency %nHz', 'oscSetFreq', 440],
				[' ', 'change oscillator frequency by %nHz', 'oscChangeFreqBy', 20],
				['r', 'oscillator frequency', 'getFreq'],
				['r', 'frequency of note %n', 'freqForNote', 60],
				[' ', 'set lowpass filter frequency %nHz', 'setLowPassFreq', 200],
				[' ', 'change lowpass filter frequency by %nHz', 'changeLowPassFreqBy', 200],
				['h', 'every quarter note', 'quarterHat'],
			]
		};

		// Register the extension
		ScratchExtensions.register('Tone Synth extension', descriptor, ext);
	})({});
});
