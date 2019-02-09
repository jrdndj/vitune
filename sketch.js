/********** SET THE HOSTNAME **********/
const URL = "http://127.0.0.1:8080//songs//";

// Represent the song currently playing
var song;

// Represents the play/pause button
var playPauseButton;

// Represents the object which will hold the FFT (fast Fourier transform) object
var fft;

// Represents the number of histogram bins the FFT will hold`
// This must be a power of two
const BINS = 256;

// Represents the songs to be played
var songs = [
/*
	'Awitin Mo, Isasayaw Ko.mp3',
	'Blue (Da Ba Dee).mp3',
	'Cruel Angel_s Thesis.mp3',
	'I Like Hotto Dogu.mp3',
	'Katawan.mp3',
	'Komm süßer Tod.mp3',
	'Legs.mp3',
	'Lose Yourself - Eminem.mp3',
	'Fireflies.mp3',
	'Rock Baby Rock.mp3',
	'Royals.mp3',
	'Sound of Silence.mp3',
	'Tamashii no Refrain.mp3'
*/
];

// Represents the song index
var index;

// Run these commands before anything else
function setup() {
	if (songs.length > 0) {
		// Get the size of the browser window
		var size = {
			width: window.innerWidth || document.body.clientWidth,
			height: window.innerHeight || document.body.clientHeight
		}
		
		// Create a canvas of almost that size
		createCanvas(size.width, size.height - 30);
		
		// Set the background to pitch black, and the stroke to white
		background(0);
		stroke(255);
		
		// Disable fills for now
		noFill();
		
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

// Load the song, then fire up the specified callback function once done
// This also resets the interface
function loadSong(url) {
	removeElements();

	song = loadSound(url, loaded);
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

// Run everything here once the sound file has finished loading
function loaded() {	
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
	//background(0);
	
	var currentTime = song.currentTime();
	var spectrum = fft.analyze();
	
	noStroke();
	
	var backgrounds = [];
	var lowgrounds = [];
	var highgrounds = [];
	var foregrounds = [];
	
	for (var i = 0; i < spectrum.length; i++) {		
		var division = Math.floor(i / (BINS / 4));
		
		switch (division) {
			case 0:
				backgrounds.push(spectrum[i]);
			
				break;
			case 1:
				lowgrounds.push(spectrum[i]);
			
				break;
			case 2:
				highgrounds.push(spectrum[i]);
			
				break;
			case 3:
				foregrounds.push(spectrum[i]);
				
				break;
		}
	}
	
	var fillValue;
    
	fillValue = average(backgrounds);
	
	
	background(fillValue / 4, fillValue / 4, fillValue / 4);
	fillValue = average(lowgrounds);
	
	fill(fillValue / 2, fillValue / 2, fillValue / 2);
	ellipse(0.25 * width, 0.5 * height, fillValue * 4);
	ellipse(0.75 * width, 0.5 * height, fillValue * 4);
	
	fillValue = average(highgrounds);
	
	fill(fillValue, fillValue, fillValue);
	ellipse(width / 2, height / 2, fillValue * 2);
	ellipse(0.25 * width, 0.5 * height, fillValue * 2);
	ellipse(0.75 * width, 0.5 * height, fillValue * 2);
	
	//fillValue = average(foregrounds);
	//console.log(fillValue);
	
	fill(fillValue * 2, fillValue * 2, fillValue * 2);
	
	ellipse(width / 2, height / 2, fillValue);
	
	ellipse(0.5 * width - 0.25 * width, 0.25 * height, fillValue);
	ellipse(0.5 * width, 0.25 * height, fillValue);
	ellipse(0.5 * width + 0.25 * width, 0.25 * height, fillValue);
	
	ellipse(0.5 * width - 0.25 * width, 0.75 * height, fillValue);
	ellipse(0.5 * width, 0.75 * height, fillValue);
	ellipse(0.5 * width + 0.25 * width, 0.75 * height, fillValue);
	
	// stroke(255);
	// noFill();
	
	// Display the song title
	fill(255);
	textSize(20);
	textAlign(CENTER);
	text(songs[index - 1].split('.')[0], width / 2, 50);
}

function average(values) {
	var sum = 0;
	
	for (var i = 0; i < values.length; i++) {
		sum += values[i];
	}
	
	return sum / values.length;
}
