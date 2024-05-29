const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

const particleCountSlider = document.getElementById('particleCount');
const particleSizeSlider = document.getElementById('particleSize');
const particleCountLabel = document.getElementById('particleCountLabel');
const particleSizeLabel = document.getElementById('particleSizeLabel');

particleCountSlider.addEventListener('input', () => {
    particleCountLabel.innerText = particleCountSlider.value;
    initializeParticles();
});

particleSizeSlider.addEventListener('input', () => {
    particleSizeLabel.innerText = particleSizeSlider.value;
    initializeParticles();
});

class Particle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
        };
        this.mass = 1;
    }

    draw() {
        // Ensure proper logging without repeated decimals
        console.log(`Drawing particle at (${this.x}, ${this.y}) with radius ${this.radius}`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(particles) {
        for (let particle of particles) {
            if (this === particle) continue;
            const dist = Math.hypot(this.x - particle.x, this.y - particle.y);

            if (dist - this.radius - particle.radius < 0) {
                resolveCollision(this, particle);
            }
        }

        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.velocity.y = -this.velocity.y;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.draw();
    }
}

// Rotates coordinate system for velocities
function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
}

// Swaps out two colliding particles' x and y velocities after running through
// an elastic collision reaction equation
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

let particles = [];

function initializeParticles() {
    particles = [];
    const numberOfParticles = parseInt(particleCountSlider.value);
    const particleRadius = parseInt(particleSizeSlider.value);

    console.log(`Initializing ${numberOfParticles} particles with radius ${particleRadius}`);
    for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * (canvas.width - particleRadius * 2) + particleRadius;
        let y = Math.random() * (canvas.height - particleRadius * 2) + particleRadius;
        const color = 'blue';

        if (i !== 0) {
            for (let j = 0; j < particles.length; j++) {
                if (Math.hypot(x - particles[j].x, y - particles[j].y) - particleRadius * 2 < 0) {
                    x = Math.random() * (canvas.width - particleRadius * 2) + particleRadius;
                    y = Math.random() * (canvas.height - particleRadius * 2) + particleRadius;

                    j = -1;
                }
            }
        }

        particles.push(new Particle(x, y, particleRadius, color));
    }
    console.log(`Particles initialized:`, particles);
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => particle.update(particles));
    console.log(`Canvas updated.`);
}

initializeParticles();
animate();
