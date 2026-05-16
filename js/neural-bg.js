/* ── Neural Particle Background ──
   Performance-optimized: 30fps cap, IntersectionObserver pause,
   reduced particle count, prefers-reduced-motion support.
*/
(function () {
    'use strict';

    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* Respect motion preferences */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        canvas.style.display = 'none';
        return;
    }

    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 28;
    const CONNECTION_DIST = 140;
    const MOUSE_DIST = 180;
    const FPS = 30;
    const FRAME_INTERVAL = 1000 / FPS;

    const mouse = { x: null, y: null };
    let lastFrameTime = 0;
    let isVisible = true;
    let animId = null;

    /* ── Visibility Observer ── */
    const observer = new IntersectionObserver(
        ([entry]) => { isVisible = entry.isIntersecting; },
        { threshold: 0 }
    );
    observer.observe(canvas);

    /* ── Mouse ── */
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    /* ── Resize ── */
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    /* ── Particle ── */
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.size = Math.random() * 1.8 + 0.8;
            const r = Math.random();
            this.color = r > 0.65 ? '#FFB300' : (r > 0.35 ? '#00E89D' : 'rgba(255,255,255,0.6)');
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_DIST) {
                    const force = (MOUSE_DIST - dist) / MOUSE_DIST;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    /* ── Init ── */
    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    /* ── Connect ── */
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 232, 157, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    /* ── Animate (30fps capped) ── */
    function animate(timestamp) {
        animId = requestAnimationFrame(animate);

        if (!isVisible) return;

        const delta = timestamp - lastFrameTime;
        if (delta < FRAME_INTERVAL) return;
        lastFrameTime = timestamp - (delta % FRAME_INTERVAL);

        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
    }

    init();
    animate(0);
})();
