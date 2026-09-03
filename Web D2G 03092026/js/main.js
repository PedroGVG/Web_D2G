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
    const pathLang = window.location.pathname.match(/^\/(es|en)(?:\/|$)/)?.[1];
    const savedLang = pathLang || urlLang || document.documentElement.lang || 'es';

    switchLanguage(savedLang);

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang) {
                localStorage.setItem('d2g_preferred_lang', lang);
            }
        });
    });
}

function switchLanguage(lang) {
    lang = lang === 'en' ? 'en' : 'es';
    currentLang = lang;

    // Update flag button states
    document.querySelectorAll('.lang-flag-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', isActive);
        if (isActive) {
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.removeAttribute('aria-current');
        }
    });

    // Update text elements
    document.querySelectorAll('[data-lang-es][data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            element.innerHTML = text;
        }
    });

    // Activate only the responsive screenshot set for the selected language.
    document.querySelectorAll('img[data-src-es][data-src-en]').forEach(img => {
        if (img.dataset.activeLang === lang) return;

        const targetSrc = img.getAttribute(`data-src-${lang}`);
        const targetSrcset = img.getAttribute(`data-srcset-${lang}`);
        const targetWidth = img.getAttribute(`data-width-${lang}`);
        const targetHeight = img.getAttribute(`data-height-${lang}`);
        if (!targetSrc) return;

        img.style.opacity = '0.6';
        if (targetWidth) img.setAttribute('width', targetWidth);
        if (targetHeight) img.setAttribute('height', targetHeight);

        const revealImage = () => { img.style.opacity = '1'; };
        img.addEventListener('load', revealImage, { once: true });

        if (targetSrcset) img.setAttribute('srcset', targetSrcset);
        img.setAttribute('src', targetSrc);
        img.dataset.activeLang = lang;

        if (img.complete && img.naturalWidth > 1) revealImage();
    });

    // Update document language tag
    document.documentElement.setAttribute('lang', lang);
}


/* ═════════════════════════════════════════════════════════════════
   2. AMBIENT TELEMETRY CANVAS (Optimized Grid & Particles)
   ═════════════════════════════════════════════════════════════════ */
function initAmbientTelemetryCanvas() {
    const canvas = document.getElementById('telemetry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0, height = 0;
    let particles = [];
    const particleCount = 25;
    let animId = null;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            const w = width > 0 ? width : 800;
            const h = height > 0 ? height : 600;
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.35 + 0.1;
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
        if (document.hidden) {
            animId = null;
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Draw faint telemetry grid lines in a single batched path
        if (width > 0 && height > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const gridSize = 80;
            for (let x = 0; x < width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        // Update & Draw Particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        animId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !animId) {
            animId = requestAnimationFrame(animate);
        }
    });

    animId = requestAnimationFrame(animate);
}

/* ═════════════════════════════════════════════════════════════════
   3. HERO CINEMATIC 3D TILT EFFECT (RAF Throttled, No Reflow)
   ═════════════════════════════════════════════════════════════════ */
function initHeroCinematicTilt() {
    const heroStage = document.querySelector('.hero-stage-cinematic');
    const cinematicFrame = document.querySelector('.cinematic-frame');
    if (!heroStage || !cinematicFrame || window.matchMedia('(pointer: coarse)').matches) return;

    let rect = null;
    let rafId = null;

    function updateRect() {
        rect = heroStage.getBoundingClientRect();
    }

    heroStage.addEventListener('mouseenter', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });

    heroStage.addEventListener('mousemove', (e) => {
        if (!rect) updateRect();
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
            if (!rect || rect.height === 0 || rect.width === 0) {
                rafId = null;
                return;
            }
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateX = (-y / rect.height) * 4;
            const rotateY = (x / rect.width) * 4;
            cinematicFrame.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
            rafId = null;
        });
    }, { passive: true });

    heroStage.addEventListener('mouseleave', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        cinematicFrame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
}

/* ═════════════════════════════════════════════════════════════════
   4. SCROLLYTELLING + FULLSCREEN ZOOM VIEWER (LIGHTBOX)
   ═════════════════════════════════════════════════════════════════ */
function initScrollyViewer() {
    const steps = document.querySelectorAll('.narrative-step');
    const overlay = document.getElementById('image-zoom-overlay');
    const viewerImg = document.getElementById('viewer-img-target');
    const closeBtn = document.getElementById('viewer-close-btn');
    
    if (!steps.length) return;
    
    function openViewer(src, alt) {
        if (!overlay || !viewerImg) return;
        viewerImg.src = src;
        viewerImg.alt = alt || 'Captura ampliada';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    
    function closeViewer() {
        if (!overlay) return;
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    // Attach click listener to each screenshot container and button
    steps.forEach((step) => {
        const imgWrap = step.querySelector('.mobile-step-img');
        const img = imgWrap ? imgWrap.querySelector('img') : null;
        const zoomBtn = imgWrap ? imgWrap.querySelector('.zoom-action-btn') : null;
        
        if (imgWrap && img) {
            imgWrap.style.cursor = 'zoom-in';
            imgWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                openViewer(img.currentSrc || img.src, img.alt);
            });
        }
        
        if (zoomBtn && img) {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openViewer(img.currentSrc || img.src, img.alt);
            });
        }
    });
    
    // Close modal when clicking anywhere on the dark overlay (outside the image)
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('viewer-dialog')) {
                closeViewer();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeViewer();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeViewer();
    });
    
    // Build side progress indicator
    const existingProgress = document.querySelector('.scrolly-side-progress');
    if (!existingProgress) {
        const progressEl = document.createElement('div');
        progressEl.className = 'scrolly-side-progress';
        progressEl.style.opacity = '0';
        progressEl.style.pointerEvents = 'none';
        progressEl.style.transition = 'opacity 0.3s ease';
        
        steps.forEach((step, i) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-target', step.getAttribute('data-step') || (i+1));
            progressEl.appendChild(dot);
        });
        
        document.body.appendChild(progressEl);
        
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
            
            progressEl.style.opacity = visibleSteps.size > 0 ? '1' : '0';
        }, { threshold: [0, 0.2, 0.5] });
        
        steps.forEach(s => scrollObserver.observe(s));
    }
}

/* ═════════════════════════════════════════════════════════════════
   5. STROKES GAINED BENCHMARK CALCULATOR (SAFEGUARDED)
   ═════════════════════════════════════════════════════════════════ */
function initSgBenchmarkCalculator() {
    const hcpSlider = document.getElementById('hcp-slider');
    if (!hcpSlider) return;

    const currentHcpDisplay = document.getElementById('current-hcp-display');
    const labelSpans = document.querySelectorAll('.hcp-slider-labels span');
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
            tee: { width: '72%', val: '+0.34 SG' },
            app: { width: '35%', val: '-0.11 SG' },
            short: { width: '30%', val: '-0.06 SG' },
            putt: { width: '55%', val: '-0.24 SG' }
        },
        hcp0: {
            tee: { width: '85%', val: '+0.78 SG' },
            app: { width: '50%', val: '+0.15 SG' },
            short: { width: '58%', val: '+0.18 SG' },
            putt: { width: '72%', val: '+0.42 SG' }
        },
        hcp5: {
            tee: { width: '92%', val: '+1.35 SG' },
            app: { width: '66%', val: '+0.58 SG' },
            short: { width: '70%', val: '+0.42 SG' },
            putt: { width: '80%', val: '+0.85 SG' }
        },
        hcp10: {
            tee: { width: '96%', val: '+2.05 SG' },
            app: { width: '80%', val: '+1.25 SG' },
            short: { width: '84%', val: '+0.95 SG' },
            putt: { width: '90%', val: '+1.50 SG' }
        },
        hcp15: {
            tee: { width: '98%', val: '+3.10 SG' },
            app: { width: '90%', val: '+2.30 SG' },
            short: { width: '92%', val: '+1.95 SG' },
            putt: { width: '95%', val: '+2.65 SG' }
        },
        hcp20: {
            tee: { width: '100%', val: '+4.40 SG' },
            app: { width: '98%', val: '+3.60 SG' },
            short: { width: '98%', val: '+3.20 SG' },
            putt: { width: '100%', val: '+3.95 SG' }
        }
    };

    const hcpMap = [
        { key: 'pga', display: 'PGA TOUR' },
        { key: 'hcp0', display: 'HCP 0' },
        { key: 'hcp5', display: 'HCP 5' },
        { key: 'hcp10', display: 'HCP 10' },
        { key: 'hcp15', display: 'HCP 15' },
        { key: 'hcp20', display: 'HCP 20' }
    ];

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
   6. CURSOR SPOTLIGHT TRACKER (RAF Throttled)
   ═════════════════════════════════════════════════════════════════ */
function initSpotlightCursor() {
    const spotlight = document.querySelector('.spotlight-cursor');
    if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

    let rafId = null;
    window.addEventListener('mousemove', (e) => {
        if (rafId) return;
        const x = e.clientX;
        const y = e.clientY;
        rafId = requestAnimationFrame(() => {
            spotlight.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
            rafId = null;
        });
    }, { passive: true });
}
