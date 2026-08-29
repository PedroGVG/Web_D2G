/**
 * DATA2GAIN V2 — HIGH PERFORMANCE TELEMETRY, INTERACTIVITY & BILINGUAL ENGINE
 */

let currentLang = 'es';

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initAmbientTelemetryCanvas();
    initHeroCinematicTilt();
    initScrollyViewer();
    initSgBenchmarkCalculator();
    initSpotlightCursor();
});

/* ═════════════════════════════════════════════════════════════════
   1. BILINGUAL LANGUAGE SWITCHER (ES / EN)
   ═════════════════════════════════════════════════════════════════ */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-flag-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const savedLang = urlLang || localStorage.getItem('d2g_preferred_lang') || 'es';

    switchLanguage(savedLang);

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang && lang !== currentLang) {
                switchLanguage(lang);
                localStorage.setItem('d2g_preferred_lang', lang);
            }
        });
    });
}

function switchLanguage(lang) {
    currentLang = lang;

    // Update flag button states
    document.querySelectorAll('.lang-flag-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update text elements
    document.querySelectorAll('[data-lang-es][data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            element.innerHTML = text;
        }
    });

    // Update images (switching screenshots between ES and EN folders)
    document.querySelectorAll('img[data-img-es][data-img-en]').forEach(img => {
        const targetSrc = img.getAttribute(`data-img-${lang}`);
        if (targetSrc && img.getAttribute('src') !== targetSrc) {
            img.style.opacity = '0.6';
            img.setAttribute('src', targetSrc);
            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.onload = () => { img.style.opacity = '1'; };
            }
        }
    });

    // Update document language tag
    document.documentElement.setAttribute('lang', lang);

    // Refresh active scrollytelling title in the new language
    updateScrollyTitles();
}


/* ═════════════════════════════════════════════════════════════════
   2. AMBIENT TELEMETRY CANVAS (Subtle High-Tech Grid & Particles)
   ═════════════════════════════════════════════════════════════════ */
function initAmbientTelemetryCanvas() {
    const canvas = document.getElementById('telemetry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 35;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }
        draw() {
            ctx.fillStyle = `rgba(255, 179, 0, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw faint telemetry grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        const gridSize = 80;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Update & Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ═════════════════════════════════════════════════════════════════
   3. HERO CINEMATIC 3D TILT EFFECT
   ═════════════════════════════════════════════════════════════════ */
function initHeroCinematicTilt() {
    const heroStage = document.querySelector('.hero-stage-cinematic');
    const cinematicFrame = document.querySelector('.cinematic-frame');
    if (heroStage && cinematicFrame && !window.matchMedia('(pointer: coarse)').matches) {
        heroStage.addEventListener('mousemove', (e) => {
            const rect = heroStage.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateX = (-y / rect.height) * 4;
            const rotateY = (x / rect.width) * 4;
            cinematicFrame.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });

        heroStage.addEventListener('mouseleave', () => {
            cinematicFrame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
        });
    }
}

/* ═════════════════════════════════════════════════════════════════
   4. SCROLLYTELLING + FULLSCREEN ZOOM VIEWER
   Vertical flow with side progress dots and tap-to-zoom on screenshots.
   ═════════════════════════════════════════════════════════════════ */
function initScrollyViewer() {
    const stage = document.querySelector('.scrolly-stage');
    const steps = document.querySelectorAll('.narrative-step');
    if (!stage || !steps.length) return;
    
    // Build side progress indicator
    const progressEl = document.createElement('div');
    progressEl.className = 'scrolly-side-progress'; // renamed from mobile-side-progress
    progressEl.style.opacity = '0';
    progressEl.style.pointerEvents = 'none';
    progressEl.style.transition = 'opacity 0.3s ease';
    
    steps.forEach((step, i) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-target', step.getAttribute('data-step') || (i+1));
        progressEl.appendChild(dot);
        
        // Add click-to-zoom to the image container
        const imgWrap = step.querySelector('.mobile-step-img'); 
        const img = imgWrap ? imgWrap.querySelector('img') : null;
        if (imgWrap && img && !imgWrap.hasAttribute('data-zoom-attached')) {
            imgWrap.setAttribute('data-zoom-attached', 'true');
            
            // Create a real DOM button for the zoom icon (solves pseudo-element click bugs)
            const zoomBtn = document.createElement('div');
            zoomBtn.className = 'zoom-action-btn';
            imgWrap.appendChild(zoomBtn);
            
            // Attach listener to wrapper (bubbles from btn)
            imgWrap.addEventListener('click', () => openViewer(img.src));
        }
    });
    
    document.body.appendChild(progressEl);
    
    // Build viewer overlay
    const viewerEl = document.createElement('div');
    viewerEl.className = 'screen-viewer-overlay';
    viewerEl.innerHTML = `
        <button class="viewer-close" aria-label="Cerrar">&times;</button>
        <div class="viewer-content">
            <img class="viewer-img" src="" alt="">
        </div>
    `;
    viewerEl.querySelector('.viewer-close').addEventListener('click', closeViewer);
    viewerEl.addEventListener('click', (e) => {
        if (e.target === viewerEl) closeViewer();
    });
    document.body.appendChild(viewerEl);
    
    // Setup observer for progress dots
    const visibleSteps = new Set();
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSteps.add(entry.target);
                if (entry.intersectionRatio > 0.2) {
                    const stepId = entry.target.getAttribute('data-step');
                    progressEl.querySelectorAll('.progress-dot').forEach(d => {
                        d.classList.toggle('active', d.getAttribute('data-target') === stepId);
                    });
                }
            } else {
                visibleSteps.delete(entry.target);
            }
        });
        
        // Toggle container visibility
        progressEl.style.opacity = visibleSteps.size > 0 ? '1' : '0';
    }, { threshold: [0, 0.2, 0.5] });
    
    steps.forEach(s => scrollObserver.observe(s));
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeViewer();
    });
    
    function openViewer(src) {
        if (!viewerEl) return;
        const img = viewerEl.querySelector('.viewer-img');
        img.src = src;
        viewerEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeViewer() {
        if (!viewerEl) return;
        viewerEl.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ═════════════════════════════════════════════════════════════════
   5. STROKES GAINED BENCHMARK CALCULATOR
   ═════════════════════════════════════════════════════════════════ */
function initSgBenchmarkCalculator() {
    const benchBtns = document.querySelectorAll('.bench-btn');
    const barTee = document.getElementById('bar-tee');
    const barApp = document.getElementById('bar-app');
    const barShort = document.getElementById('bar-short');
    const barPutt = document.getElementById('bar-putt');

    const valTee = document.getElementById('val-tee');
    const valApp = document.getElementById('val-app');
    const valShort = document.getElementById('val-short');
    const valPutt = document.getElementById('val-putt');

    const datasets = {
        pga: {
            tee: { width: '72%', val: '+0.34 SG', green: true },
            app: { width: '35%', val: '-0.11 SG', green: false },
            short: { width: '30%', val: '-0.06 SG', green: false },
            putt: { width: '55%', val: '-0.24 SG', green: true }
        },
        hcp0: {
            tee: { width: '85%', val: '+0.78 SG', green: true },
            app: { width: '50%', val: '+0.15 SG', green: true },
            short: { width: '58%', val: '+0.18 SG', green: true },
            putt: { width: '72%', val: '+0.42 SG', green: true }
        },
        hcp5: {
            tee: { width: '92%', val: '+1.35 SG', green: true },
            app: { width: '66%', val: '+0.58 SG', green: true },
            short: { width: '70%', val: '+0.42 SG', green: true },
            putt: { width: '80%', val: '+0.85 SG', green: true }
        },
        hcp10: {
            tee: { width: '96%', val: '+2.05 SG', green: true },
            app: { width: '80%', val: '+1.25 SG', green: true },
            short: { width: '84%', val: '+0.95 SG', green: true },
            putt: { width: '90%', val: '+1.50 SG', green: true }
        },
        hcp15: {
            tee: { width: '98%', val: '+3.10 SG', green: true },
            app: { width: '90%', val: '+2.30 SG', green: true },
            short: { width: '92%', val: '+1.95 SG', green: true },
            putt: { width: '95%', val: '+2.65 SG', green: true }
        },
        hcp20: {
            tee: { width: '100%', val: '+4.40 SG', green: true },
            app: { width: '98%', val: '+3.60 SG', green: true },
            short: { width: '98%', val: '+3.20 SG', green: true },
            putt: { width: '100%', val: '+3.95 SG', green: true }
        }
    };

    const hcpSlider = document.getElementById('hcp-slider');
    const currentHcpDisplay = document.getElementById('current-hcp-display');
    const labelSpans = document.querySelectorAll('.hcp-slider-labels span');
    
    // Map slider values (0-5) to dataset keys and display names
    const hcpMap = [
        { key: 'pga', display: 'PGA TOUR' },
        { key: 'hcp0', display: 'HCP 0' },
        { key: 'hcp5', display: 'HCP 5' },
        { key: 'hcp10', display: 'HCP 10' },
        { key: 'hcp15', display: 'HCP 15' },
        { key: 'hcp20', display: 'HCP 20' }
    ];

    if (hcpSlider) {
        hcpSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            const mapping = hcpMap[val];
            if (!mapping) return;
            
            // Update the display text
            if (currentHcpDisplay) currentHcpDisplay.textContent = mapping.display;
            
            // Highlight the correct label
            labelSpans.forEach((span, i) => {
                span.style.color = i === val ? 'var(--text-main)' : 'var(--text-muted)';
            });

            const data = datasets[mapping.key];
            if (!data) return;

            // Apply updates
            applyRow(barTee, valTee, data.tee);
            applyRow(barApp, valApp, data.app);
            applyRow(barShort, valShort, data.short);
            applyRow(barPutt, valPutt, data.putt);
        });
        
        // Also allow clicking labels to move slider
        labelSpans.forEach((span, i) => {
            span.addEventListener('click', () => {
                hcpSlider.value = i;
                // Dispatch input event to trigger the update
                hcpSlider.dispatchEvent(new Event('input'));
            });
        });
        
        // Initialize first state
        hcpSlider.dispatchEvent(new Event('input'));
    }

    function applyRow(bar, valElem, item) {
        if (bar && valElem) {
            bar.style.setProperty('--val', item.width);
            const valStr = item.val.replace(' SG', '');
            valElem.textContent = valStr;
            
            const num = parseFloat(valStr.replace('+', ''));
            let colorClass = 'green';
            if (num <= -0.10) {
                colorClass = 'red';
            } else if (num < 0) {
                colorClass = 'amber';
            }
            
            bar.className = `dial-wrapper ${colorClass}`;
            valElem.className = 'hud-value mono-text'; /* Text will be white in CSS */
        }
    }
}

/* ═════════════════════════════════════════════════════════════════
   6. CURSOR SPOTLIGHT TRACKER
   ═════════════════════════════════════════════════════════════════ */
function initSpotlightCursor() {
    const spotlight = document.querySelector('.spotlight-cursor');
    if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('mousemove', (e) => {
        spotlight.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    });
}
