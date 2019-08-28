// Represents the song currently playing
let song;

// Represents the object which will hold the FFT (fast Fourier transform) object
// as well as the resultant spectrum
let fft;
let spectrum;

// Checks if the song is ready to be analyzed by the FFT
let isReady;

// Represents the number of histogram bins the FFT will hold
// This must be a power of two
const BINS = 1024;

// Represents the number of chromas (twelve)
const CHROMAS = 12;

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
// (Brilliance)
const FOREGROUNDS_MINIMUM = HIGHGROUNDS_MAXIMUM + 1;
const FOREGROUNDS_MAXIMUM = MAXIMUM_FREQUENCY;

// Set the colors and the sizes of the shapes, detecting beats along the way
let energy;
let scalingFactor;

let backgroundsHSBA = Array(CHROMAS).fill([0, 0]);
let lowgroundsHSBA = Array(CHROMAS).fill([0, 0]);
let highgroundsHSBA = Array(CHROMAS).fill([0, 0]);
let foregroundsHSBA = Array(CHROMAS).fill([0, 0]);

// Keep track of the history of the foreground
let foregroundsHistory = Array(Math.floor(44100 / 1000)).fill(0);

// The particle systems
let upperLeftParticleSystem;
let upperRightParticleSystem;
let lowerLeftParticleSystem;
let lowerRightParticleSystem;

// Get the size of the browser window
let size = {
    width: $(window).width() - 30,
    height: $(window).height() - 20
};

// Represents the chroma index
let index = 0;

// Get all necessary music data
let music_data = {};

// Get all the lyrics
let lyricsList = [];

// Represents the current lyric shown
let isLyricChanged = false;
let lyricsIndex = 0;

// Timer variables
let timeStart;

// Run these commands before anything else
function setup() {
    // Create a canvas of almost that size
    let canvas = createCanvas(size.width, size.height);
    canvas.style("filter: blur(2px)");
    canvas.class('centered');

    // Set the color mode to HSB
    colorMode(HSB, 360, 255, 255, 255);

    // Set the background to pitch black
    background(0, 0, 0, 0);

    // Disable fills and strokes for now
    noFill();
    noStroke();

    // Prepare the particle systems
    upperLeftParticleSystem = new ParticleSystem(createVector(0, 0));
    upperRightParticleSystem = new ParticleSystem(createVector(size.width, 0));

    lowerLeftParticleSystem = new ParticleSystem(createVector(0, size.height));
    lowerRightParticleSystem = new ParticleSystem(createVector(size.width, size.height));

    // Prepare the first song
    nextSong();

    // Finally, load the FFT object with the desired harshness of smoothing
    // and the specified number of bins
    fft = new p5.FFT(0.6, BINS);
}

// Load the song, then fire up beat detection once done
// This also resets the interface
function loadSong(url) {
    removeElements();

    isReady = false;

    song = loadSound(url, detectBeat);
}

// Get the times where a beat is detected
function detectBeat() {
    // Mark key points in the song
    markBeats(music_data['beat_times'], changeBackgrounds);
    markBeats(music_data['beat_times'], changeLowgrounds);
    markBeats(music_data['beat_times'], changeHighgrounds);
    markBeats(music_data['beat_times'], changeForegrounds);

    // Mark lyric changes in the song
    markLyrics(music_data['lyrics']);

    // Done processing the song, so load it now
    loaded();
}

// Load the next song
function nextSong() {
    // Get all necessary data about the analyzed song
    music_data = JSON.parse(localStorage.getItem('preprocessed-data'));

    console.log(music_data);

    // Load the song itself
    loadSong(music_data['music_url']);

    // After the song has finished playing, try to load and play another song
    song.onended(onHalted);
}

// Do these when the song ends
function onHalted() {
    alert('We\'re done!');

    // Then go back to the upload screen
    window.location.href = uploader_url;
}

// Mark lyric changes
function markLyrics(lyrics) {
    for (let timestamp in lyrics) {
        if (Object.prototype.hasOwnProperty.call(lyrics, timestamp)) {
            song.addCue(timestamp, function () {
                isLyricChanged = true
            });
        }
    }

    // Compile all lyrics into a list
    for (let key in music_data['lyrics']) {
        if (Object.prototype.hasOwnProperty.call(music_data['lyrics'], key)) {
            lyricsList.push(music_data['lyrics'][key]);
        }
    }
}

// Mark the beats
function markBeats(timestamps, changeHueSaturationFunction) {
    for (let index = 0; index < timestamps.length; index++) {
        song.addCue(timestamps[index], changeHueSaturationFunction);
    }
}

// Trigger a change in hue and saturation (triggered every beat)
function changeBackgrounds() {
    // Declare a static variable
    if (typeof changeBackgrounds.index === 'undefined') {
        changeBackgrounds.index = 2;
    }

    // At this slice, map the:
    // hue to the pitch class, and
    // saturation to the energy intensities
    let chroma = music_data['chroma_bass'];

    // For each chroma...
    for (let index = 0; index < CHROMAS; index++) {
        // Correspond the hue to the chroma index
        let hue = index * 30;

        // Get the raw energy from 0 to 1 on this chroma
        let rawEnergy = chroma[index][changeBackgrounds.index];

        // Translate the raw energy to the saturation and brightness and alpha values from 0 to 255
        let saturationBrightnessAlpha = rawEnergy * 255;

        // Append the hue and saturation value to the hue and saturation array
        backgroundsHSBA[index] = [hue, saturationBrightnessAlpha];
    }

    // Go to the next slice
    if (changeBackgrounds.index + 1 < chroma[index].length) {
        changeBackgrounds.index++;
    }
}

function changeLowgrounds() {
    // Declare a static variable
    if (typeof changeLowgrounds.index === 'undefined') {
        changeLowgrounds.index = 2;
    }

    // At this slice, map the:
    // hue to the pitch class, and
    // saturation to the energy intensities
    let chroma = music_data['chroma_lowmidrange'];

    // For each chroma...
    for (let index = 0; index < CHROMAS; index++) {
        // Correspond the hue to the chroma index
        let hue = index * 30;

        // Get the raw energy from 0 to 1 on this chroma
        let rawEnergy = chroma[index][changeLowgrounds.index];

        // Translate the raw energy to the saturation and brightness and alpha values from 0 to 255
        let saturationBrightnessAlpha = rawEnergy * 255;

        // Append the hue and saturation value to the hue and saturation array
        lowgroundsHSBA[index] = [hue, saturationBrightnessAlpha];
    }

    // Go to the next slice
    if (changeLowgrounds.index + 1 < chroma[index].length) {
        changeLowgrounds.index++;
    }
}

function changeHighgrounds() {
    // Declare a static variable
    if (typeof changeHighgrounds.index === 'undefined') {
        changeHighgrounds.index = 2;
    }

    // At this slice, map the:
    // hue to the pitch class, and
    // saturation to the energy intensities
    let chroma = music_data['chroma_highmidrange'];

    // For each chroma...
    for (let index = 0; index < CHROMAS; index++) {
        // Correspond the hue to the chroma index
        let hue = index * 30;

        // Get the raw energy from 0 to 1 on this chroma
        let rawEnergy = chroma[index][changeHighgrounds.index];

        // Translate the raw energy to the saturation and brightness and alpha values from 0 to 255
        let saturationBrightnessAlpha = rawEnergy * 255;

        // Append the hue and saturation value to the hue and saturation array
        highgroundsHSBA[index] = [hue, saturationBrightnessAlpha];
    }

    // Go to the next slice
    if (changeHighgrounds.index + 1 < chroma[index].length) {
        changeHighgrounds.index++;
    }
}

function changeForegrounds() {
    // Declare a static variable
    if (typeof changeForegrounds.index === 'undefined') {
        changeForegrounds.index = 2;
    }

    // At this slice, map the:
    // hue to the pitch class, and
    // saturation to the energy intensities
    let chroma = music_data['chroma_presence'];

    // For each chroma...
    for (let index = 0; index < CHROMAS; index++) {
        // Correspond the hue to the chroma index
        let hue = index * 30;

        // Get the raw energy from 0 to 1 on this chroma
        let rawEnergy = chroma[index][changeForegrounds.index];

        // Translate the raw energy to the saturation and brightness and alpha values from 0 to 255
        let saturationBrightnessAlpha = rawEnergy * 255;

        // Append the hue and saturation value to the hue and saturation array
        foregroundsHSBA[index] = [hue, saturationBrightnessAlpha];
    }

    // Go to the next slice
    if (changeForegrounds.index + 1 < chroma[index].length) {
        changeForegrounds.index++;
    }
}

// Run everything here once the sound file has finished loading and its beats
// have been processed
function loaded() {
    // The song is now ready to be analyzed by the FFT
    isReady = true;

    // Automatically play the song
    song.play();
}

// This represents a frame
// Everything juicy happens here
function draw() {
    // Set a black background
    background(0, 0, 0, 255);

    // Only every draw anything if the song is ready to be analyzed
    if (isReady) {
        // Isolate frequencies using the Fast Fourier Transform (FFT)
        // algorithm
        spectrum = fft.analyze();

        // WAVEFORM
        let waveform = fft.waveform();

        beginShape();
        noFill();

        stroke(0, 0, 255, 50);
        strokeWeight(1);

        for (let i = 0; i < waveform.length; i++) {
            let x = map(i, 0, waveform.length, 0, size.width);
            let y = map(waveform[i], -1, 1, 0, size.height);

            vertex(x, y);
        }

        endShape();
        noStroke();

        // BACKGROUNDS
        // Get the next energy value for this location
        energy = fft.getEnergy(BACKGROUNDS_MINIMUM, BACKGROUNDS_MAXIMUM);

        scalingFactor = 0.5;
        background(0, 0, energy * scalingFactor, energy * scalingFactor, energy * scalingFactor);

        scalingFactor = 2;

        // Create a rectangle for each chroma
        for (let index = 0; index < CHROMAS; index++) {
            fill(backgroundsHSBA[index][0], backgroundsHSBA[index][1], backgroundsHSBA[index][1] / scalingFactor, backgroundsHSBA[index][1]);
            // c1 = color(backgroundsHSBA[index][0], backgroundsHSBA[index][1], backgroundsHSBA[index][1] / scalingFactor, backgroundsHSBA[index][1]);
            // c2 = color(0, 0, 0, 0);

            let rectWidth = (energy / 255 * scalingFactor) * (size.width / 12);

            rect(
                (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
                0,
                rectWidth,
                size.height,
                rectWidth / 2 - (energy / 255) * (rectWidth / 2)
            );
            // rectGradient(
            //     (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
            //     0,
            //     (energy / 255 * scalingFactor) * (size.width / 12),
            //     size.height,
            //     c2,
            //     c1
            // );
        }

        // LOWGROUNDS
        // Get the next energy value for this location
        energy = fft.getEnergy(LOWGROUNDS_MINIMUM, LOWGROUNDS_MAXIMUM);

        // Apply the colors and shapes
        scalingFactor = 1.5;

        // Create a rectangle for each chroma
        for (let index = 0; index < CHROMAS; index++) {
            fill(lowgroundsHSBA[index][0], lowgroundsHSBA[index][1], lowgroundsHSBA[index][1] / scalingFactor, lowgroundsHSBA[index][1]);
            // c1 = color(lowgroundsHSBA[index][0], lowgroundsHSBA[index][1], lowgroundsHSBA[index][1] / scalingFactor, lowgroundsHSBA[index][1]);
            // c2 = color(0, 0, 0, 0);

            let rectWidth = (energy / 255 * scalingFactor) * (size.width / 12);

            rect(
                (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
                size.height * 0.2,
                rectWidth,
                size.height - size.height * 0.4,
                rectWidth / 2 - (energy / 255) * (rectWidth / 2)
            );
            // rectGradient(
            //     (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
            //     size.height * 0.2,
            //     (energy / 255 * scalingFactor) * (size.width / 12),
            //     size.height - size.height * 0.4,
            //     c2,
            //     c1
            // );
        }


        // HIGHGROUNDS
        // Get the next energy value for this location
        energy = fft.getEnergy(HIGHGROUNDS_MINIMUM, HIGHGROUNDS_MAXIMUM);

        // Apply the colors and shapes
        scalingFactor = 1.25;

        // Create a rectangle for each chroma
        for (let index = 0; index < CHROMAS; index++) {
            fill(highgroundsHSBA[index][0], highgroundsHSBA[index][1], highgroundsHSBA[index][1] / scalingFactor, highgroundsHSBA[index][1]);
            // c1 = color(highgroundsHSBA[index][0], highgroundsHSBA[index][1], highgroundsHSBA[index][1] / scalingFactor, highgroundsHSBA[index][1]);
            // c2 = color(0, 0, 0, 0);

            let rectWidth = (energy / 255 * scalingFactor) * (size.width / 12);

            rect(
                (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
                size.height * 0.4,
                rectWidth,
                size.height - size.height * 0.8,
                rectWidth / 2 - (energy / 255) * (rectWidth / 2)
            );
            // rectGradient(
            //     (size.width / 12 * index + size.width / 12 * 0.5) - ((energy / 255 * scalingFactor) * (size.width / 12 * 0.5)),
            //     size.height * 0.4,
            //     (energy / 255 * scalingFactor) * (size.width / 12),
            //     size.height - size.height * 0.8,
            //     c2,
            //     c1
            // );
        }


        // FOREGROUNDS
        // Get the next energy value for this location
        energy = fft.getEnergy(FOREGROUNDS_MINIMUM, FOREGROUNDS_MAXIMUM);

        // Apply the colors and shapes
        scalingFactor = 0.5;

        // Create a rectangle for each chroma
        for (let index = 0; index < CHROMAS; index++) {
            fill(foregroundsHSBA[index][0], foregroundsHSBA[index][1], foregroundsHSBA[index][1], foregroundsHSBA[index][1]);

            star(size.width / 12 * index + size.width / 12 * 0.5, size.height / 2, 5, energy * scalingFactor, 8);
        }

        // Fire up the particle systems if a threshold is reached
        if (energy >= 0.25 * 255 && energy > mean(foregroundsHistory)) {
            upperLeftParticleSystem.addParticle(0);
            upperLeftParticleSystem.addParticle(0);
            upperLeftParticleSystem.addParticle(0);

            upperRightParticleSystem.addParticle(0);
            upperRightParticleSystem.addParticle(0);
            upperRightParticleSystem.addParticle(0);

            lowerLeftParticleSystem.addParticle(0);
            lowerLeftParticleSystem.addParticle(0);
            lowerLeftParticleSystem.addParticle(0);

            lowerRightParticleSystem.addParticle(0);
            lowerRightParticleSystem.addParticle(0);
            lowerRightParticleSystem.addParticle(0);
        }

        upperLeftParticleSystem.run();
        upperRightParticleSystem.run();

        lowerLeftParticleSystem.run();
        lowerRightParticleSystem.run();

        // Remember this energy level
        foregroundsHistory.shift();
        foregroundsHistory.push(energy);

        // Display the white text song title
        // Display the counter
        let timeCurrent = new Date().getTime() - timeStart;
        let timeInSecondsText = timeCurrent / 1000;

        scalingFactor = 100;

        fill(0, 0, 255);
        textSize(30);
        textAlign(CENTER);
        text(music_data['name'], width / 2, 50);
        text(timeInSecondsText.toFixed(3), width / 2, 80);

        textSize(30 + 5 * (energy / 255));

        // Display lyrics, if any
        if (lyricsIndex !== 0 || isLyricChanged !== false) {
            text(lyricsList[lyricsIndex - 1], width / 2, height - 20);
        }

        if (isLyricChanged) {
            console.log(lyricsList[lyricsIndex]);

            lyricsIndex++;

            isLyricChanged = false;
        }
    } else {
        timeStart = new Date().getTime();
    }
}

// Draw a star
function star(x, y, radius1, radius2, npoints) {
    const TWO_PI = Math.PI * 2.0;

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

// Draw a rectangular gradient
// function rectGradient(x, y, w, h, c1, c2) {
//     noFill();
//     strokeWeight(2);
//
//     // Left to right gradient
//     for (let index = x; index <= x + Math.floor(w / 2); index++) {
//         let inter = map(index, x, x + Math.floor(w / 2), 0, 1);
//         let c = lerpColor(c1, c2, inter);
//         stroke(c);
//         line(index, y, index, y + h);
//     }
//
//     for (let index = x + Math.floor(w / 2) + 1; index <= x + w; index++) {
//         let inter = map(index, x + Math.floor(w / 2), x + w, 0, 1);
//         let c = lerpColor(c2, c1, inter);
//         stroke(c);
//         line(index, y, index, y + h);
//     }
// }

// Get the mean value of an array
function mean(arr) {
    let sum = 0;

    for (let index = 0; index < arr.length; index++) {
        sum += arr[index];
    }

    return sum / arr.length;
}
