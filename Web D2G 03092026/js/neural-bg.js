/* ── Premium Precision Grid & Data Flow Background ──
   High-tech digital matrix featuring grid-aligned coordinate flows,
   target crosshairs, and data packets.
   Perfect fit for Data2Gain's golf analytics precision.
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
    let gridSpacing = 80;
    let particles = [];
    let pulses = [];
    let crosshairs = [];
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
        // Make grid spacing responsive
        gridSpacing = width < 768 ? 60 : 80;
    }

    // Grid Junction coordinates for targeting
    function getNearestGridPoint(x, y) {
        return {
            x: Math.round(x / gridSpacing) * gridSpacing,
            y: Math.round(y / gridSpacing) * gridSpacing
        };
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomize = false) {
            // Align to grid on reset
            const p = getNearestGridPoint(
                Math.random() * width,
                randomize ? Math.random() * height : -20
            );
            this.x = p.x;
            this.y = p.y;
            this.size = Math.random() * 1.5 + 0.6;
            this.speed = Math.random() * 0.8 + 0.3;
            
            // Choose one of the 8 grid directions (multiples of 45 deg in radians)
            const directions = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
            this.angle = directions[Math.floor(Math.random() * directions.length)];
            
            const r = Math.random();
            this.color = r > 0.85 ? '#FFB300' : (r > 0.45 ? '#00E89D' : '#ffffff');
            this.alpha = Math.random() * 0.3 + 0.08;
            this.stepsToNextDecision = Math.floor(Math.random() * 40) + 20;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            this.stepsToNextDecision--;

            // When close to grid junction and steps depleted, make a turn
            if (this.stepsToNextDecision <= 0) {
                const nearGrid = getNearestGridPoint(this.x, this.y);
                const distToJunction = Math.hypot(this.x - nearGrid.x, this.y - nearGrid.y);
                
                if (distToJunction < 5) {
                    // Snap to grid junction
                    this.x = nearGrid.x;
                    this.y = nearGrid.y;
                    
                    // Decides new angle (allows continuation, 90-degree turn, or 45-degree bend)
                    const turns = [-Math.PI/4, 0, Math.PI/4, -Math.PI/2, Math.PI/2];
                    const selectedTurn = turns[Math.floor(Math.random() * turns.length)];
                    this.angle = (this.angle + selectedTurn) % (Math.PI * 2);
                    
                    this.stepsToNextDecision = Math.floor(Math.random() * 50) + 30;
                }
            }

            // Loop / Reset if out of bounds
            if (this.x < -100 || this.x > width + 100 || this.y > height + 100 || this.y < -100) {
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

    class Pulse {
        constructor() {
            this.reset();
        }

        reset() {
            const start = getNearestGridPoint(Math.random() * width, Math.random() * height);
            this.x = start.x;
            this.y = start.y;
            this.speed = Math.random() * 3 + 2;
            const dirs = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
            this.angle = dirs[Math.floor(Math.random() * dirs.length)];
            this.color = Math.random() > 0.5 ? '#00E89D' : '#FFB300';
            this.alpha = 0.5;
            this.life = Math.floor(Math.random() * 80) + 40;
            this.trail = [];
        }

        update() {
            // Save trail
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) this.trail.shift();

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            this.life--;
            if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }

        draw() {
            if (this.trail.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.alpha * 0.4;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head pulse
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
        }
    }

    class Crosshair {
        constructor() {
            this.reset();
        }

        reset() {
            const pt = getNearestGridPoint(
                Math.random() * (width - 100) + 50,
                Math.random() * (height - 100) + 50
            );
            this.x = pt.x;
            this.y = pt.y;
            this.life = 0;
            this.maxLife = Math.floor(Math.random() * 150) + 100;
            this.size = Math.random() * 6 + 4;
            this.alpha = 0;
        }

        update() {
            this.life++;
            // Fade in, hold, fade out
            if (this.life < 30) {
                this.alpha = this.life / 30 * 0.15;
            } else if (this.life > this.maxLife - 30) {
                this.alpha = (this.maxLife - this.life) / 30 * 0.15;
            } else {
                this.alpha = 0.15;
            }

            if (this.life >= this.maxLife) {
                this.reset();
            }
        }

        draw() {
            ctx.strokeStyle = '#00E89D';
            ctx.globalAlpha = this.alpha;
            ctx.lineWidth = 0.75;
            
            // Draw crosshair '+'
            ctx.beginPath();
            ctx.moveTo(this.x - this.size, this.y);
            ctx.lineTo(this.x + this.size, this.y);
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x, this.y + this.size);
            ctx.stroke();

            // Draw small bounding circle occasionally
            if (this.size > 7) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    function initElements() {
        particles = [];
        pulses = [];
        crosshairs = [];

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 40 : 80;
        const pulseCount = isMobile ? 3 : 6;
        const crosshairCount = isMobile ? 4 : 8;

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        for (let i = 0; i < pulseCount; i++) pulses.push(new Pulse());
        for (let i = 0; i < crosshairCount; i++) crosshairs.push(new Crosshair());
    }

    function drawGridMatrix() {
        // Draw highly subtle background coordinates & lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 0.5;

        // Horizontals
        for (let y = 0; y < height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Verticals
        for (let x = 0; x < width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Interactive mouse scanner grid overlay
        if (mouse.active) {
            const nearMouse = getNearestGridPoint(mouse.x, mouse.y);
            
            // Draw subtle radar scanning circle
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 180);
            grad.addColorStop(0, 'rgba(0, 232, 157, 0.05)');
            grad.addColorStop(1, 'rgba(0, 232, 157, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
            ctx.fill();

            // Light up grid lines passing near mouse
            ctx.strokeStyle = 'rgba(0, 232, 157, 0.04)';
            ctx.beginPath();
            ctx.moveTo(0, nearMouse.y);
            ctx.lineTo(width, nearMouse.y);
            ctx.moveTo(nearMouse.x, 0);
            ctx.lineTo(nearMouse.x, height);
            ctx.stroke();
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        time += 0.002;

        // Clean screen with premium deep color
        ctx.fillStyle = 'rgba(5, 5, 8, 0.25)'; // slight trail effect
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, width, height);

        // Render basic tech grid
        drawGridMatrix();

        // Render crosshairs
        ctx.globalCompositeOperation = 'screen';
        crosshairs.forEach(ch => {
            ch.update();
            ch.draw();
        });

        // Render particles (data points)
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Render high speed pulses
        pulses.forEach(pulse => {
            pulse.update();
            pulse.draw();
        });
    }

    window.addEventListener('resize', () => {
        resize();
        initElements();
    }, { passive: true });

    resize();
    initElements();
    animate();

})();
