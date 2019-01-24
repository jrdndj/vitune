var song;
var button;

var fft;
var BINS = 256;

var w;

function preload() {
	
}

function setup() {
	var size = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight
	}
	
	console.log(size.width);
	console.log(size.height);
	
	createCanvas(size.width - 10, size.height - 30);
	
	background(0);
	stroke(255);
	
	noFill();
	
	song = loadSound("http://127.0.0.1:8080//songs/Fireflies.mp3", loaded);
	
	fft = new p5.FFT(0.6, BINS);
	w = width / BINS;
}

function togglePlaying() {
	if (!song.isPlaying()) {
		song.loop();
		song.setVolume(1);
		
		button.html("pause");
	} else {
		song.pause();
		
		button.html("play");
	}
}

function loaded() {
	button = createButton("play");
	button.mousePressed(togglePlaying);
}

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
	
	
	background(fillValue / 6, fillValue / 6, fillValue / 6);
	fillValue = average(lowgrounds);
	
	fill(fillValue / 4, fillValue / 4, fillValue / 4);
	ellipse(0.25 * width, 0.5 * height, fillValue * 4);
	ellipse(0.75 * width, 0.5 * height, fillValue * 4);
	
	fillValue = average(highgrounds);
	
	fill(fillValue / 2, fillValue / 2, fillValue / 2);
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
	
	stroke(255);
	noFill();
}

function average(values) {
	var sum = 0;
	
	for (var i = 0; i < values.length; i++) {
		sum += values[i];
	}
	
	console.log(sum);
	
	return sum / values.length;
}
