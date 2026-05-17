/* ── Premium Tech Data Flow Background ──
   Dynamic, fluid matrix with glowing trails and network connections.
   World-class aesthetic for Data2Gain. Subtlety focused.
*/
(function () {
    'use strict';

    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        canvas.style.display = 'none';
        return;
    }

    let width, height;
    let particles = [];
    let time = 0;
    const mouse = { x: -1000, y: -1000, active: false };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }, { passive: true });
    
    window.addEventListener('mouseout', () => {
        mouse.active = false;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    }, { passive: true });

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomize = false) {
            this.x = randomize ? Math.random() * width : Math.random() * width;
            this.y = randomize ? Math.random() * height : -10;
            this.vx = 0;
            this.vy = 0;
            this.size = Math.random() * 1.2 + 0.4;
            // Slower, more elegant speed
            this.baseSpeed = Math.random() * 0.4 + 0.1;
            this.angle = Math.random() * Math.PI * 2;
            const r = Math.random();
            this.color = r > 0.8 ? '#FFB300' : (r > 0.4 ? '#00E89D' : '#ffffff');
            // Much lower opacity to remain in the background
            this.alpha = Math.random() * 0.25 + 0.05;
        }

        update() {
            // Slower noise field
            const noiseX = Math.sin(this.x * 0.002 + time) * 0.5 + Math.cos(this.y * 0.0015 - time) * 0.5;
            const noiseY = Math.cos(this.x * 0.002 - time) * 0.5 + Math.sin(this.y * 0.0015 + time) * 0.5;
            
            this.angle += noiseX * 0.02;
            
            // Softer mouse interaction
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    this.vx -= (dx / dist) * force * 0.2;
                    this.vy -= (dy / dist) * force * 0.2;
                }
            }

            // Continuous fluid movement
            this.vx += Math.cos(this.angle) * 0.03;
            this.vy += Math.sin(this.angle) * 0.03 + 0.15; // Very gentle downward drift

            // Friction
            this.vx *= 0.94;
            this.vy *= 0.94;

            this.x += this.vx * this.baseSpeed;
            this.y += this.vy * this.baseSpeed;

            // Loop around if out of bounds
            if (this.x < -50 || this.x > width + 50 || this.y > height + 50 || this.y < -50) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Reduced count to avoid visual noise
        const count = window.innerWidth > 768 ? 110 : 50;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        ctx.globalAlpha = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;
                
                // Connect if within 110px (12100 dist squared)
                if (dist < 12100) {
                    const opacity = 1 - (dist / 12100);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    // Extremely subtle connections
                    ctx.strokeStyle = `rgba(0, 232, 157, ${opacity * 0.04})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        // Slower time progression
        time += 0.0015;

        // Stronger clear layer for shorter trails
        ctx.fillStyle = 'rgba(5, 5, 8, 0.35)'; 
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, width, height);

        // Draw network connections
        drawConnections();

        // Draw glowing particles
        ctx.globalCompositeOperation = 'screen';
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }

    resize();
    initParticles();
    animate();

})();
