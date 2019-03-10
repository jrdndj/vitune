// Detect the dominant pitch of a sample
class PitchDetector {
	// Detect the pitch of a sample
	static detect(loc, fft) {
		let currentAmplitude;
		
		// Take note of the highest amplitude found, and its pitch
		let maxAmplitude = 0;
		let pitch = Pitch.C;
		
		// Probe the strength of all pitches, then get the strongest one
		currentAmplitude = PitchDetector.detectC(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectCSharp(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectD(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectDSharp(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectE(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectF(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectFSharp(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectG(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectGSharp(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectA(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectASharp(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		currentAmplitude = PitchDetector.detectB(loc, fft);
		
		if (currentAmplitude[0] > maxAmplitude) {
			maxAmplitude = currentAmplitude[0];
			pitch = currentAmplitude[1];
		}
		
		return pitch;
	}
	
	static detectC(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(32.703), fft.getEnergy(65.406), fft.getEnergy(130.813)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(261.626), fft.getEnergy(523.251), fft.getEnergy(1046.502)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2093.005), fft.getEnergy(4186.009)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(8372.018);
				
				break;
		}
		
		return [amplitude, Pitch.C];
	}
	
	static detectCSharp(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(34.648), fft.getEnergy(69.296), fft.getEnergy(138.591)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(277.183), fft.getEnergy(554.365), fft.getEnergy(1108.731)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2217.461), fft.getEnergy(4434.922)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(8869.844);
				
				break;
		}
		
		return [amplitude, Pitch.C_SHARP];
	}
	
	static detectD(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(36.708), fft.getEnergy(73.416), fft.getEnergy(146.832)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(293.665), fft.getEnergy(587.330), fft.getEnergy(1174.659)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2349.318), fft.getEnergy(4698.636)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(9397.273);
				
				break;
		}
		
		return [amplitude, Pitch.D];
	}
	
	static detectDSharp(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(38.891), fft.getEnergy(77.782), fft.getEnergy(155.563)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(311.127), fft.getEnergy(622.254), fft.getEnergy(1244.508)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2489.016), fft.getEnergy(4978.032)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(9956.063);
				
				break;
		}
		
		return [amplitude, Pitch.D_SHARP];
	}
	
	static detectE(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(20.602), fft.getEnergy(41.203), fft.getEnergy(82.407), fft.getEnergy(164.814)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(329.628), fft.getEnergy(659.255), fft.getEnergy(1318.510)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2637.020), fft.getEnergy(5274.041)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(10548.082);
				
				break;
		}
		
		return [amplitude, Pitch.E];
	}
	
	static detectF(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(21.827), fft.getEnergy(43.654), fft.getEnergy(87.307), fft.getEnergy(174.614)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(349.228), fft.getEnergy(698.456), fft.getEnergy(1296.913)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2793.826), fft.getEnergy(5587.652)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(11175.303);
				
				break;
		}
		
		return [amplitude, Pitch.F];
	}
	
	static detectFSharp(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(23.125), fft.getEnergy(46.249), fft.getEnergy(92.499), fft.getEnergy(184.997)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(369.994), fft.getEnergy(739.989), fft.getEnergy(1479.978)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(2959.955), fft.getEnergy(5919.911)]);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(11839.822);
				
				break;
		}
		
		return [amplitude, Pitch.F_SHARP];
	}
	
	static detectG(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(24.500), fft.getEnergy(48.999), fft.getEnergy(97.999), fft.getEnergy(195.998)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(391.995), fft.getEnergy(783.991), fft.getEnergy(1567.982)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = fft.getEnergy(3135.963);
				
				break;
			case Loc.FOREGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(6271.927), fft.getEnergy(12543.854)]);
				
				break;
		}
		
		return [amplitude, Pitch.G];
	}
	
	static detectGSharp(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(25.957), fft.getEnergy(51.913), fft.getEnergy(103.826), fft.getEnergy(207.652)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(415.305), fft.getEnergy(830.609), fft.getEnergy(1661.219)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = fft.getEnergy(3322.438);
				
				break;
			case Loc.FOREGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(6644.875), fft.getEnergy(13289.750)]);
				
				break;
		}
		
		return [amplitude, Pitch.G_SHARP];
	}
	
	static detectA(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(27.500), fft.getEnergy(55.000), fft.getEnergy(110.000), fft.getEnergy(220.000)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(440.000), fft.getEnergy(880.000), fft.getEnergy(1760.000)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = fft.getEnergy(3520.000);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(7040.000);
				
				break;
		}
		
		return [amplitude, Pitch.A];
	}
	
	static detectASharp(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(29.135), fft.getEnergy(58.270), fft.getEnergy(116.541), fft.getEnergy(233.082)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(466.164), fft.getEnergy(932.328), fft.getEnergy(1864.655)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = fft.getEnergy(3729.310);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(7458.620);
				
				break;
		}
		
		return [amplitude, Pitch.A_SHARP];
	}
	
	static detectB(loc, fft) {
		let amplitude;
		
		switch (loc) {
			case Loc.BACKGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(30.868), fft.getEnergy(61.735), fft.getEnergy(123.471), fft.getEnergy(246.942)]);
				
				break;
			case Loc.LOWGROUND:
				amplitude = PitchDetector.mean([fft.getEnergy(493.883), fft.getEnergy(987.767), fft.getEnergy(1975.533)]);
				
				break;
			case Loc.HIGHGROUND:
				amplitude = fft.getEnergy(3951.066);
				
				break;
			case Loc.FOREGROUND:
				amplitude = fft.getEnergy(7902.133);
				
				break;
		}
		
		return [amplitude, Pitch.B];
	}
		
	static mean(values) {
		let sum = 0;
		
		for (let i = 0; i < values.length; i++) {
			sum += values[i];
		}
		
		return sum / values.length;
	}
}
