/********** SET THE HOSTNAME **********/
const URL = "http://127.0.0.1:8080//songs//";

// Represent the song currently playing
let song;

// Represents the play/pause button
let playPauseButton;

// Represents the object which will hold the FFT (fast Fourier transform) object
// as well as the resultant spectrum
let fft;
let specturm;

// Checks if the song is ready to be analyzed by the FFT
let isSongReady;

// Represents the number of histogram bins the FFT will hold`
// This must be a power of two
const BINS = 1024;

// REFERENCE
// [1] https://www.teachmeaudio.com/mixing/techniques/audio-spectrum/
// [2] https://github.com/processing/p5.js/blob/0.7.3/lib/addons/p5.sound.js#L2812

// Lowest frequency the human ear can hear
const MINIMUM_FREQUENCY = 20;

// Approxumate highest frequency the human hear can hear
const MAXIMUM_FREQUENCY = 14000;

// Backgrounds: 20-250 Hz (contains fundamentals of most instruments)
// (Sub-bass/Bass)
const BACKGROUNDS_MINIMUM = MINIMUM_FREQUENCY;
const BACKGROUNDS_MAXIMUM = 250;

// Lowgrounds: 251-2000 Hz (contains low vocals)
// (Low-midrange/Midrange)
const LOWGROUNDS_MINIMUM = BACKGROUNDS_MAXIMUM + 1;
const LOWGROUNDS_MAXIMUM = 2000;

// Highgrounds: 2001-6000 Hz (contains high vocals and low percussive instruments)
// (Upper-midrange/Presence)
const HIGHGROUNDS_MINIMUM = LOWGROUNDS_MAXIMUM + 1;
const HIGHGROUNDS_MAXIMUM = 6000;

// Foregrounds: 6001-14000 Hz (contains high percussive instruments)
// (Brillance)
const FOREGROUNDS_MINIMUM = HIGHGROUNDS_MAXIMUM + 1;
const FOREGROUNDS_MAXIMUM = MAXIMUM_FREQUENCY;

// Set the colors and the sizes of the shapes, detecting beats along the way
let energy;
let scalingFactor;

// Beat detection variables (for changing colors)
let average;

let backgroundsHue;
let lowgroundsHue;
let highgroundsHue;
let foregroundsHue;

// Keep track of the history of the foreground
let foregroundsHistory = Array(50).fill(0);

// The particle systems
let leftParticleSystem;
let rightParticleSystem;

// Represents the songs to be played
// BATCH 1
let batch1 = [
	'A1.mp3',
	'A2.mp3',
	'A3.mp3',
	'A4.mp3',
	'A5.mp3',
	'A6.mp3',
	'A7.mp3',
	'A8.mp3',
	'A9.mp3',
	'A10.mp3',
	'A11.mp3',
	'A12.mp3',
	'A13.mp3',
	'A14.mp3',
	'A15.mp3',
	'A16.mp3',
	'A17.mp3',
	'A18.mp3',
	'A19.mp3',
	'A20.mp3',
	'A21.mp3',
	'A22.mp3',
	'A23.mp3',
	'A24.mp3',
	'A25.mp3'
];

// BATCH 2
let batch2 = [
	'B1.mp3',
	'B2.mp3',
	'B3.mp3',
	'B4.mp3',
	'B5.mp3',
	'B6.mp3',
	'B7.mp3',
	'B8.mp3',
	'B9.mp3',
	'B10.mp3',
	'B11.mp3',
	'B12.mp3',
	'B13.mp3',
	'B14.mp3',
	'B15.mp3',
	'B16.mp3',
	'B17.mp3',
	'B18.mp3',
	'B19.mp3',
	'B20.mp3',
	'B21.mp3',
	'B22.mp3',
	'B23.mp3',
	'B24.mp3',
	'B25.mp3'
];

// Set the batch to be used here
let songs = batch2;

// Represents the song index
let index;

// Run these commands before anything else
function setup() {
	if (songs.length > 0) {
		// Get the size of the browser window
		let size = {
			width: window.innerWidth || document.body.clientWidth,
			height: window.innerHeight || document.body.clientHeight
		}
		
		// Create a canvas of almost that size
		createCanvas(size.width, size.height - 30);
		
		// Set the color mode to HSB
		colorMode(HSB, 360, 255, 255, 255);
		
		// Set the background to pitch black
		background(0, 0, 0, 0);
		
		// Disable fills and strokes for now
		noFill();
		noStroke();
		
		// Prepare the particle systems
		leftParticleSystem = new ParticleSystem(createVector(width / 2 - width / 4, height / 2));
		rightParticleSystem = new ParticleSystem(createVector(width / 2 + width / 4, height / 2));
		
		// Prepare the first song
		index = 0;
		nextSong();
		
		// Prompt the user to start the playlist
		alert('Click OK to start the playlist.');
		
		// Finally, load the FFT object with the desired harshness of smoothing
		// and the specified number of bins
		fft = new p5.FFT(0.6, BINS);
	} else {
		alert("Where are the songs? You haven't set them.");
	}
}

// Load the song, then fire up beat detection once done
// This also resets the interface
function loadSong(url) {
	removeElements();
	
	isReady = false;

	song = loadSound(url, detectBeat);
}

// Callback for when the song has stopped playing for any reason
function onHalted() {
	// Only play the next song when the current song is not paused
	if (!song.isPaused()) {
		nextSong();
	}
}

// Load the next song
function nextSong() {
	// If there's still a next song, load and play it
	if (index < songs.length) {
		// Load the next song
		loadSong(URL + songs[index]);
		
		// Increment the song index to prepare for the next song
		index++;
		
		// After the song has finished playing, try to load and play another song
		song.onended(onHalted);
	} else {
		alert("We're done");
	}
}

// Keep track of whether the song is playing or not
function togglePlaying() {
	// If the song isn't playing, play it
	if (!song.isPlaying()) {		
		song.play();
		song.setVolume(1);
		
		playPauseButton.html("pause");
	} else {
		// If the song is playing, pause it
		song.pause();
		
		playPauseButton.html("play");
	}
}

// Skip the current song, and go to the next song
function toggleNext() {
	// Stop the song if the song is playing
	// An internal callback will automatically recognize this
	// as a signal to begin the next song
	if (song.isPlaying()) {
		song.stop();
	} else {
		// But if the song is paused, just play the next song
		song.stop();
		
		nextSong();
	}
}

// Get the times where a beat is detected
function detectBeat() {
	// Fire up the built-in beat detection algorithm, then process
	// the times where beats were detected after
	song.processPeaks(processBeats, 0.9, 0.22, song.duration() * 2);
}

// Remind the visualizer to perform pitch detection during those times
function processBeats(timestamps) {	
	// First of all, mark the very first part of a song as a beat
	// so initial colors could be set
	timestamps.unshift(0.05);

	// Whenever the song reaches the time where a beat was detected, tell the visualizer
	// to perform pitch detection there
	for (let index = 0; index < timestamps.length; index++) {
		song.addCue(timestamps[index], changeHue);
	}
	
	// Done processing the song, so load it now
	loaded();
}

// Change the color scheme of the visualizer everytime a beat is detected
function changeHue() {
	backgroundsHue = getHue(Loc.BACKGROUND, fft);
	lowgroundsHue = getHue(Loc.LOWGROUND, fft);
	highgroundsHue = getHue(Loc.HIGHGROUND, fft);
	foregroundsHue = getHue(Loc.FOREGROUND, fft);
}

// Run everything here once the sound file has finished loading and its beats
// have been processed
function loaded() {	
	// The song is now ready to be analyzed by the FFT
	isReady = true;

	// Automatically play the song
	song.play();
	
	// Display the play button
	playPauseButton = createButton("pause");
	
	// Display the next button
	skipButton = createButton("next");
	
	// Then associate the pressing of the play/pause button with the
	// play/pause function
	playPauseButton.mousePressed(togglePlaying);
	
	// Also associate the pressing of the skip button with the
	// skip function
	skipButton.mousePressed(toggleNext);
}

// This represents a frame
// Everything juicy happens here
function draw() {
	// Only every draw anything if the song is ready to be analyzed
	if (isReady) {	
		// Isolate frequencies using the Fast Fourier Transform (FFT)
		// algorithm
		spectrum = fft.analyze();
		
		// BACKGROUNDS		
		// Get the next energy value for this location
		energy = fft.getEnergy(BACKGROUNDS_MINIMUM, BACKGROUNDS_MAXIMUM);
		
		// Apply the colors
		background(backgroundsHue + energy / 255 * 30, energy, energy / 2, 255);
		
		// LOWGROUNDS
		// Get the next energy value for this location
		energy = fft.getEnergy(LOWGROUNDS_MINIMUM, LOWGROUNDS_MAXIMUM);
		
		// Apply the colors and shapes
		scalingFactor = 3;
		
		fill(lowgroundsHue + energy / 255 * 30, energy, energy / 1.66, energy);
		
		ellipse(0.25 * width, 0.5 * height, energy * scalingFactor);
		ellipse(0.75 * width, 0.5 * height, energy * scalingFactor);
		
		// HIGHGROUNDS
		// Get the next energy value for this location
		energy = fft.getEnergy(HIGHGROUNDS_MINIMUM, HIGHGROUNDS_MAXIMUM);
		
		// Apply the colors and shapes
		scalingFactor = 1.5;
		
		fill(highgroundsHue + energy / 255 * 30, energy, energy / 1.33, energy);
		
		ellipse(width / 2, height / 2, energy * scalingFactor);
		ellipse(0.25 * width, 0.5 * height, energy * scalingFactor);
		ellipse(0.75 * width, 0.5 * height, energy * scalingFactor);
		
		// FOREGROUNDS
		// Get the next energy value for this location
		energy = fft.getEnergy(FOREGROUNDS_MINIMUM, FOREGROUNDS_MAXIMUM);
		
		// Apply the colors and shapes
		scalingFactor = 1;
		
		fill(foregroundsHue + energy / 255 * 30, energy, energy, energy);
		
		star(0.5 * width - 0.25 * width, 0.5 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width, 0.5 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width + 0.25 * width, 0.5 * height, 5, energy * scalingFactor / 2, 4);
		
		star(0.5 * width - 0.25 * width, 0.25 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width, 0.25 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width + 0.25 * width, 0.25 * height, 5, energy * scalingFactor / 2, 4);
		
		star(0.5 * width - 0.25 * width, 0.75 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width, 0.75 * height, 5, energy * scalingFactor / 2, 4);
		star(0.5 * width + 0.25 * width, 0.75 * height, 5, energy * scalingFactor / 2, 4);
		
		// Fire up the particle systems if a threshold is reached
		
		if (energy >= 0.25 * 255 && energy > mean(foregroundsHistory)) {
			leftParticleSystem.addParticle(foregroundsHue);
			leftParticleSystem.addParticle(foregroundsHue);
			
			rightParticleSystem.addParticle(foregroundsHue);
			rightParticleSystem.addParticle(foregroundsHue);
		}
		
		leftParticleSystem.run();
		rightParticleSystem.run();
		
		// Remember this energy level
		foregroundsHistory.shift();
		foregroundsHistory.push(energy);
		
		// Display the white text song title
		fill(0, 0, 255);
		textSize(20);
		textAlign(CENTER);
		text(songs[index - 1].split('.')[0], width / 2, 50);
	}
}

// Get the hue of the current sample
function getHue(loc, fft) {
	// Get the dominant pitch of the current sample
	let pitch = PitchDetector.detect(loc, fft);
	
	// Map each of the twelve pitches into the color wheel, with C as red
	// (0 degrees on the HSB color wheel)
	switch (pitch) {
		case Pitch.C:
			return 0;
		case Pitch.C_SHARP:
			return 30;
		case Pitch.D:
			return 60;
		case Pitch.D_SHARP:
			return 90;
		case Pitch.E:
			return 120;
		case Pitch.F:
			return 150;
		case Pitch.F_SHARP:
			return 180;
		case Pitch.G:
			return 210;
		case Pitch.G_SHARP:
			return 240;
		case Pitch.A:
			return 270;
		case Pitch.A_SHARP:
			return 300;
		case Pitch.B:
			return 330;
	}
}

// Draw a star
function star(x, y, radius1, radius2, npoints) {
	let angle = TWO_PI / npoints;
	let halfAngle = angle / 2.0;
	
	beginShape();
	
	for (let a = 0; a < TWO_PI; a += angle) {
		let sx = x + cos(a) * radius2;
		let sy = y + sin(a) * radius2;
		
		vertex(sx, sy);
		
		sx = x + cos(a + halfAngle) * radius1;
		sy = y + sin(a + halfAngle) * radius1;
		
		vertex(sx, sy);
	}
	
	endShape(CLOSE);
}

// Get the mean value of an array
function mean(arr) {
	let sum = 0;
	
	for (let index = 0; index < arr.length; index++) {
		sum += arr[index];
	}
	
	return sum / arr.length; 
}
