/**
 * DATA2GAIN V2 — HIGH PERFORMANCE TELEMETRY, INTERACTIVITY & BILINGUAL ENGINE
 */

let currentLang = 'es';

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initAmbientTelemetryCanvas();
    initHeroCinematicTilt();
    initScrollytellingEngine();
    initMobileCarousel();
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
   4. SCROLLYTELLING ENGINE (Dynamic Real Screen Pinned Viewport)
   ═════════════════════════════════════════════════════════════════ */
let activeStepIndex = '1';

const scrollyTitles = {
    es: {
        1: 'RADAR TELEMETRY · DISPERSIÓN REAL',
        2: 'BAG MAPPING · COBERTURA & DISTANCIA',
        3: 'GREEN METRICS · MATRIZ SLOPE & PUTT'
    },
    en: {
        1: 'RADAR TELEMETRY · REAL DISPERSION',
        2: 'BAG MAPPING · COVERAGE & DISTANCE',
        3: 'GREEN METRICS · SLOPE & PUTT MATRIX'
    }
};

const scrollyBadges = {
    es: {
        1: 'TELEMETRÍA EN DIRECTO · RESOLUCIÓN POR IMPACTO',
        2: 'PROMEDIOS REALES · ELIMINACIÓN DE SOLAPES',
        3: 'CONTROL DE CAÍDA · MAKE RATE POR DISTANCIA'
    },
    en: {
        1: 'LIVE TELEMETRY · SHOT-BY-SHOT RESOLUTION',
        2: 'REAL AVERAGES · OVERLAP ELIMINATION',
        3: 'BREAK CONTROL · MAKE RATE BY DISTANCE'
    }
};

function updateScrollyTitles() {
    const stageTitle = document.getElementById('pinned-stage-title');
    const subBadge = document.getElementById('pinned-sub-badge');

    if (stageTitle && scrollyTitles[currentLang] && scrollyTitles[currentLang][activeStepIndex]) {
        stageTitle.textContent = scrollyTitles[currentLang][activeStepIndex];
    }
    if (subBadge && scrollyBadges[currentLang] && scrollyBadges[currentLang][activeStepIndex]) {
        subBadge.textContent = scrollyBadges[currentLang][activeStepIndex];
    }
}

function initScrollytellingEngine() {
    const steps = document.querySelectorAll('.narrative-step');
    const stageStates = {
        1: document.getElementById('stage-dispersion'),
        2: document.getElementById('stage-gap'),
        3: document.getElementById('stage-putt')
    };

    function handleScroll() {
        let currentStep = '1';
        steps.forEach(step => {
            const rect = step.getBoundingClientRect();
            // If the step is in the top 60% of the viewport, consider it active
            if (rect.top < window.innerHeight * 0.6) {
                currentStep = step.getAttribute('data-step') || '1';
            }
        });

        if (activeStepIndex !== currentStep) {
            activeStepIndex = currentStep;

            // Update text steps
            steps.forEach(s => s.classList.remove('active'));
            const activeStepEl = document.querySelector(`.narrative-step[data-step="${currentStep}"]`);
            if (activeStepEl) activeStepEl.classList.add('active');

            // Update pinned stage visual
            Object.keys(stageStates).forEach(k => {
                if (stageStates[k]) {
                    stageStates[k].classList.remove('active');
                }
            });

            if (stageStates[activeStepIndex]) {
                stageStates[activeStepIndex].classList.add('active');
            }

            updateScrollyTitles();
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize state on load
    handleScroll();
}

/* ═════════════════════════════════════════════════════════════════
   4.5. MOBILE SCREEN CAROUSEL + FULLSCREEN ZOOM VIEWER
   Replaces the desktop scrollytelling with a swipe carousel on mobile.
   Each slide shows step number, title, and full-width screenshot.
   Tap any screenshot to open a zoomable fullscreen viewer.
   Only active on mobile (≤960px). Tears down on desktop.
   ═════════════════════════════════════════════════════════════════ */
function initMobileCarousel() {
    const mq = window.matchMedia('(max-width: 960px)');
    let built = false;
    let carouselEl = null;
    let viewerEl = null;
    
    function build() {
        if (built) return;
        const stage = document.querySelector('.scrolly-stage');
        const steps = document.querySelectorAll('.narrative-step');
        if (!stage || !steps.length) return;
        
        // Hide desktop elements
        const pinnedPanel = stage.querySelector('.pinned-telemetry-panel');
        const narrativeCol = stage.querySelector('.scrolly-narrative-column');
        if (pinnedPanel) pinnedPanel.style.display = 'none';
        if (narrativeCol) narrativeCol.style.display = 'none';
        
        // Build carousel
        carouselEl = document.createElement('div');
        carouselEl.className = 'mobile-carousel';
        
        const track = document.createElement('div');
        track.className = 'carousel-track';
        
        const slides = [];
        steps.forEach((step, i) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            
            // Step number
            const stepNum = step.querySelector('.step-num');
            const numEl = document.createElement('div');
            numEl.className = 'carousel-step-num mono-text';
            if (stepNum) {
                numEl.textContent = stepNum.textContent;
                // Copy data-lang attributes
                if (stepNum.dataset.langEs) numEl.setAttribute('data-lang-es', stepNum.dataset.langEs);
                if (stepNum.dataset.langEn) numEl.setAttribute('data-lang-en', stepNum.dataset.langEn);
            }
            slide.appendChild(numEl);
            
            // Title
            const h3 = step.querySelector('h3');
            const titleEl = document.createElement('h3');
            titleEl.className = 'carousel-title';
            if (h3) {
                titleEl.textContent = h3.textContent;
                if (h3.dataset.langEs) titleEl.setAttribute('data-lang-es', h3.dataset.langEs);
                if (h3.dataset.langEn) titleEl.setAttribute('data-lang-en', h3.dataset.langEn);
            }
            slide.appendChild(titleEl);
            
            // Image
            const imgSrc = step.querySelector('.mobile-step-img img');
            if (imgSrc) {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'carousel-img-wrap';
                const img = document.createElement('img');
                img.src = imgSrc.src;
                img.alt = imgSrc.alt;
                img.className = 'carousel-img';
                if (imgSrc.dataset.imgEs) img.setAttribute('data-img-es', imgSrc.dataset.imgEs);
                if (imgSrc.dataset.imgEn) img.setAttribute('data-img-en', imgSrc.dataset.imgEn);
                img.setAttribute('loading', 'lazy');
                
                // Tap to open viewer
                imgWrap.addEventListener('click', () => openViewer(img.src));
                imgWrap.appendChild(img);
                slide.appendChild(imgWrap);
            }
            
            track.appendChild(slide);
            slides.push(slide);
        });
        
        carouselEl.appendChild(track);
        
        // Dots
        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'carousel-dots';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => {
                slides[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
            dotsWrap.appendChild(dot);
        });
        carouselEl.appendChild(dotsWrap);
        
        // Hint
        const hint = document.createElement('p');
        hint.className = 'carousel-hint mono-text';
        hint.setAttribute('data-lang-es', 'Desliza para explorar');
        hint.setAttribute('data-lang-en', 'Swipe to explore');
        hint.textContent = 'Desliza para explorar';
        carouselEl.appendChild(hint);
        
        stage.appendChild(carouselEl);
        
        // Scroll observer for dots
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = slides.indexOf(entry.target);
                    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, di) => {
                        d.classList.toggle('active', di === idx);
                    });
                }
            });
        }, { root: track, threshold: 0.6 });
        
        slides.forEach(s => observer.observe(s));
        
        // Build viewer overlay (hidden)
        viewerEl = document.createElement('div');
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
        
        // ESC key
        document.addEventListener('keydown', handleEsc);
        
        // Re-apply current language to new elements
        if (typeof switchLanguage === 'function' && typeof currentLang !== 'undefined') {
            switchLanguage(currentLang);
        }
        
        built = true;
    }
    
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
    
    function handleEsc(e) {
        if (e.key === 'Escape') closeViewer();
    }
    
    function teardown() {
        if (!built) return;
        const stage = document.querySelector('.scrolly-stage');
        
        // Show desktop elements
        const pinnedPanel = stage?.querySelector('.pinned-telemetry-panel');
        const narrativeCol = stage?.querySelector('.scrolly-narrative-column');
        if (pinnedPanel) pinnedPanel.style.display = '';
        if (narrativeCol) narrativeCol.style.display = '';
        
        // Remove carousel
        if (carouselEl) { carouselEl.remove(); carouselEl = null; }
        if (viewerEl) { viewerEl.remove(); viewerEl = null; }
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
        
        built = false;
    }
    
    function handleChange(e) {
        if (e.matches) build();
        else teardown();
    }
    
    handleChange(mq);
    mq.addEventListener('change', handleChange);
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
