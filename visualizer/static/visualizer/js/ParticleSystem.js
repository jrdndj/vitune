// A particle system
class ParticleSystem {
	constructor(position) {
		this.origin = position.copy();
		this.particles = [];
	}
	
	// Add a particle to the system
	addParticle(hue) {
		this.particles.push(new Particle(this.origin, hue));
	}
	
	// Run the particle system
	run() {
		for (let i = this.particles.length - 1; i >= 0; i--) {
			let p = this.particles[i];
			
			p.run();
			
			if (p.isDead()) {
				this.particles.splice(i, 1);
			}
		}
	}
}
 