// A particle object
class Particle {
	constructor(position, hue) {
		this.color = hue;
		this.acceleration = createVector(0, 0.1);
		this.velocity = createVector(random(-15, 15), random(-15, 15));
		this.position = position.copy();
		this.lifespan = 255;
	}
	
	// Run the particle system
	run() {
		this.update();
		this.display();
	}
	
	// Update the position
	update() {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.lifespan -= 10;
	}
	
	// Display the particle
	display() {
		fill(this.color, 255 - this.lifespan, this.lifespan, this.lifespan);
		ellipse(this.position.x, this.position.y, 10, 10);
	}
	
	// Check whether the particle should still be displayed
	isDead() {
		return this.lifespan < 0;
	}
}
