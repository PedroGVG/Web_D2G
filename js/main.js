/**
 * DATA2GAIN V2 — HIGH PERFORMANCE TELEMETRY, INTERACTIVITY & BILINGUAL ENGINE
 */

let currentLang = 'es';

document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initAmbientTelemetryCanvas();
    initHeroCinematicTilt();
    initHeroStrategySwitch();
    initScrollyViewer();
    initStrokesGainedBenchmark();
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

    // Refresh dynamic benchmark texts if loaded
    if (typeof window.__updateSgBenchmarkLang === 'function') {
        window.__updateSgBenchmarkLang();
    }
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
   3. HERO STRATEGY TACTIC SWITCHER (3-WOOD vs DRIVER)
   ═════════════════════════════════════════════════════════════════ */
function initHeroStrategySwitch() {
    const btnTactical = document.getElementById('btn-strat-tactical');
    const btnAggressive = document.getElementById('btn-strat-aggressive');
    const heroStage = document.querySelector('.hero-stage-cinematic');
    
    const hudStratName = document.getElementById('hud-strat-name');
    const hudStratRisk = document.getElementById('hud-strat-risk');
    const hudStratDisp = document.getElementById('hud-strat-dispersion');
    
    const fairwayLabel = document.getElementById('fairway-strat-label');
    const fairwaySg = document.getElementById('fairway-sg-val');
    const fairwayDetail = document.getElementById('fairway-strat-detail');
    const waterDetail = document.getElementById('water-strat-detail');
    
    if (!btnTactical || !btnAggressive || !heroStage) return;

    function applyStrategy(strat) {
        const isTactical = strat === 'tactical';
        
        btnTactical.classList.toggle('active', isTactical);
        btnTactical.setAttribute('aria-pressed', isTactical ? 'true' : 'false');
        btnAggressive.classList.toggle('active', !isTactical);
        btnAggressive.setAttribute('aria-pressed', !isTactical ? 'true' : 'false');
        
        heroStage.classList.toggle('strat-tactical', isTactical);
        heroStage.classList.toggle('strat-aggressive', !isTactical);
        
        const lang = currentLang || 'es';
        
        if (isTactical) {
            if (hudStratName) {
                hudStratName.textContent = lang === 'en' ? '3-WOOD (+0.42 SG vs DRIVER)' : 'MADERA 3 (+0.42 SG vs DRIVER)';
                hudStratName.className = 'text-gold';
            }
            if (hudStratRisk) {
                hudStratRisk.textContent = lang === 'en' ? 'LOW (0% WATER RISK)' : 'BAJO (0% RIESGO AGUA)';
                hudStratRisk.className = 'text-green';
            }
            if (hudStratDisp) {
                hudStratDisp.textContent = lang === 'en' ? '18 YD (SAFE ZONE)' : '18 YD (ZONA SEGURA)';
            }
            if (fairwayLabel) {
                fairwayLabel.textContent = lang === 'en' ? 'OPTIMAL FAIRWAY (3W)' : 'CALLE ÓPTIMA (3W)';
            }
            if (fairwaySg) {
                fairwaySg.textContent = '+0.55 SG';
                fairwaySg.className = 'hazard-sg text-green';
            }
            if (fairwayDetail) {
                fairwayDetail.textContent = lang === 'en' ? '240y Carry · 18y Dispersion' : '240y Carry · Dispersión 18y';
            }
            if (waterDetail) {
                waterDetail.textContent = lang === 'en' ? '0% risk with 3-Wood' : '0% riesgo con Madera 3';
            }
        } else {
            if (hudStratName) {
                hudStratName.textContent = lang === 'en' ? 'DRIVER AGGRESSIVE (-0.85 SG vs 3W)' : 'DRIVER AL LÍMITE (-0.85 SG vs 3W)';
                hudStratName.className = 'text-red';
            }
            if (hudStratRisk) {
                hudStratRisk.textContent = lang === 'en' ? 'CRITICAL (32% WATER HAZARD)' : 'CRÍTICO (32% RIESGO AGUA)';
                hudStratRisk.className = 'text-red';
            }
            if (hudStratDisp) {
                hudStratDisp.textContent = lang === 'en' ? '38 YD (PENALTY CONE)' : '38 YD (CONO DE PENALIZACIÓN)';
            }
            if (fairwayLabel) {
                fairwayLabel.textContent = lang === 'en' ? 'FAIRWAY / ROUGH' : 'CALLE / ROUGH';
            }
            if (fairwaySg) {
                fairwaySg.textContent = '+0.12 SG';
                fairwaySg.className = 'hazard-sg text-gold';
            }
            if (fairwayDetail) {
                fairwayDetail.textContent = lang === 'en' ? '275y Carry · 38y Dispersion' : '275y Carry · Dispersión 38y';
            }
            if (waterDetail) {
                waterDetail.textContent = lang === 'en' ? '32% Water Hazard Probability' : '32% Probabilidad de agua';
            }
        }
    }

    btnTactical.addEventListener('click', () => applyStrategy('tactical'));
    btnAggressive.addEventListener('click', () => applyStrategy('aggressive'));
}

/* ═════════════════════════════════════════════════════════════════
   4. SCROLLYTELLING + TWO-PANE STAGE OBSERVER + LIGHTBOX
   ═════════════════════════════════════════════════════════════════ */
function initScrollyViewer() {
    const steps = document.querySelectorAll('.narrative-step');
    const overlay = document.getElementById('image-zoom-overlay');
    const viewerImg = document.getElementById('viewer-img-target');
    const closeBtn = document.getElementById('viewer-close-btn');
    const deckSlides = document.querySelectorAll('.telemetry-deck-slide');
    const statusLabel = document.getElementById('deck-status-label');
    
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
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeViewer();
    });

    // Observer to synchronize the Desktop Sticky Telemetry Deck with scrolling steps
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                const stepNum = entry.target.getAttribute('data-step');
                
                // Update active state on narrative steps
                steps.forEach(s => {
                    s.classList.toggle('active', s.getAttribute('data-step') === stepNum);
                });

                // Update active slide on sticky deck
                deckSlides.forEach(slide => {
                    slide.classList.toggle('active', slide.getAttribute('data-deck-slide') === stepNum);
                });

                // Update status label
                if (statusLabel) {
                    statusLabel.textContent = `DATA2GAIN PRO · TELEMETRY VIEW 0${stepNum}/03`;
                }
            }
        });
    }, { threshold: [0.25, 0.5] });

    steps.forEach(s => stepObserver.observe(s));
}

/* ═════════════════════════════════════════════════════════════════
   5. STROKES GAINED BENCHMARK SIMULATOR (POINT 3)
   ═════════════════════════════════════════════════════════════════ */
function initStrokesGainedBenchmark() {
    const tabBtns = document.querySelectorAll('.sg-tab-btn');
    if (!tabBtns.length) return;

    const valTee = document.getElementById('sg-val-tee');
    const barTee = document.getElementById('sg-bar-tee');
    const kpiTee = document.getElementById('sg-kpi-tee');

    const valApp = document.getElementById('sg-val-app');
    const barApp = document.getElementById('sg-bar-app');
    const kpiApp = document.getElementById('sg-kpi-app');

    const valShort = document.getElementById('sg-val-short');
    const barShort = document.getElementById('sg-bar-short');
    const kpiShort = document.getElementById('sg-kpi-short');

    const valPutt = document.getElementById('sg-val-putt');
    const barPutt = document.getElementById('sg-bar-putt');
    const kpiPutt = document.getElementById('sg-kpi-putt');

    const diagMsg = document.getElementById('sg-diag-message');

    const datasets = {
        pga: {
            tee: { val: '-0.25 SG', width: '38%', color: 'fill-red', textColor: 'text-red', kpiEs: '265 yd · 58% Calle', kpiEn: '265 yd · 58% Fairway' },
            app: { val: '-0.58 SG', width: '22%', color: 'fill-red', textColor: 'text-red', kpiEs: '12.4m desde 150m', kpiEn: '12.4m from 150m' },
            short: { val: '-0.18 SG', width: '42%', color: 'fill-red', textColor: 'text-red', kpiEs: '52% Recuperación', kpiEn: '52% Scrambling' },
            putt: { val: '-0.42 SG', width: '30%', color: 'fill-red', textColor: 'text-red', kpiEs: '41% en 1.5 - 3m', kpiEn: '41% make rate 5-10ft' },
            diagEs: 'Frente a un profesional del PGA Tour, la mayor brecha está en la precisión de tiro a green (-0.58 SG) y el putt (-0.42 SG). La distancia de salida solo representa el 17% de la diferencia total.',
            diagEn: 'Against a PGA Tour pro, the largest gap lies in iron approach proximity (-0.58 SG) and putting (-0.42 SG). Off-the-tee distance accounts for only 17% of the total difference.'
        },
        hcp0: {
            tee: { val: '+0.04 SG', width: '54%', color: 'fill-green', textColor: 'text-green', kpiEs: '258 yd · 62% Calle', kpiEn: '258 yd · 62% Fairway' },
            app: { val: '-0.21 SG', width: '42%', color: 'fill-red', textColor: 'text-red', kpiEs: '10.5m desde 150m', kpiEn: '10.5m from 150m' },
            short: { val: '+0.02 SG', width: '50%', color: 'fill-green', textColor: 'text-green', kpiEs: '50% Recuperación', kpiEn: '50% Scrambling' },
            putt: { val: '-0.15 SG', width: '44%', color: 'fill-red', textColor: 'text-red', kpiEs: '46% en 1.5 - 3m', kpiEn: '46% make rate 5-10ft' },
            diagEs: 'Frente a un jugador Scratch (HCP 0), tu juego largo y salidas son competitivas, pero cedes 0.36 golpes por vuelta en tiros de approach de 130-170 metros y lectura de greens.',
            diagEn: 'Against a Scratch player (HCP 0), your driving is comparable, but you lose 0.36 strokes per round on approach shots from 140-180 yards and green reading.'
        },
        hcp5: {
            tee: { val: '+0.34 SG', width: '72%', color: 'fill-green', textColor: 'text-green', kpiEs: '248 yd · 64% Calle', kpiEn: '248 yd · 64% Fairway' },
            app: { val: '-0.11 SG', width: '45%', color: 'fill-red', textColor: 'text-red', kpiEs: '9.8m desde 140-160m', kpiEn: '9.8m from 140-160m' },
            short: { val: '-0.06 SG', width: '52%', color: 'fill-amber', textColor: 'text-amber', kpiEs: '46% Recuperación', kpiEn: '46% Scrambling' },
            putt: { val: '-0.24 SG', width: '38%', color: 'fill-red', textColor: 'text-red', kpiEs: '48% Embocado', kpiEn: '48% Make rate' },
            diagEs: 'Frente a un jugador HCP 5, tu mayor fuga de golpes está en los tiros a green (-0.11 SG) y en putts de media distancia (-0.24 SG). Enfocar el 60% de tu práctica en proximidad a 150m reducirá tu hándicap en 2.1 golpes.',
            diagEn: 'Against an HCP 5 player, your largest leak is on approach shots (-0.11 SG) and mid-range putts (-0.24 SG). Focusing 60% of practice on 150m proximity will lower your handicap by 2.1 strokes.'
        },
        hcp10: {
            tee: { val: '+0.72 SG', width: '78%', color: 'fill-green', textColor: 'text-green', kpiEs: '242 yd · 68% Calle', kpiEn: '242 yd · 68% Fairway' },
            app: { val: '+0.18 SG', width: '60%', color: 'fill-green', textColor: 'text-green', kpiEs: '8.8m desde 140-160m', kpiEn: '8.8m from 140-160m' },
            short: { val: '+0.15 SG', width: '58%', color: 'fill-green', textColor: 'text-green', kpiEs: '56% Recuperación', kpiEn: '56% Scrambling' },
            putt: { val: '-0.02 SG', width: '49%', color: 'fill-amber', textColor: 'text-amber', kpiEs: '52% Embocado', kpiEn: '52% Make rate' },
            diagEs: 'Frente a HCP 10, ganas golpes holgadamente desde el tee (+0.72 SG) y en aproximación (+0.18 SG). Tu consistencia desde la calle es tu mayor ventaja competitiva.',
            diagEn: 'Against HCP 10, you easily gain strokes off the tee (+0.72 SG) and on approach (+0.18 SG). Fairway consistency is your strongest competitive advantage.'
        },
        hcp15: {
            tee: { val: '+1.15 SG', width: '85%', color: 'fill-green', textColor: 'text-green', kpiEs: '240 yd · 72% Calle', kpiEn: '240 yd · 72% Fairway' },
            app: { val: '+0.48 SG', width: '70%', color: 'fill-green', textColor: 'text-green', kpiEs: '7.9m desde 140-160m', kpiEn: '7.9m from 140-160m' },
            short: { val: '+0.35 SG', width: '68%', color: 'fill-green', textColor: 'text-green', kpiEs: '62% Recuperación', kpiEn: '62% Scrambling' },
            putt: { val: '+0.12 SG', width: '58%', color: 'fill-green', textColor: 'text-green', kpiEs: '58% Embocado', kpiEn: '58% Make rate' },
            diagEs: 'Superas con amplitud al promedio de HCP 15 en todas las facetas del juego (+2.10 SG total). Tu estrategia conservadora desde el tee elimina dobles bogeys.',
            diagEn: 'You significantly outperform average HCP 15 players across all categories (+2.10 SG total). Playing smarter club selections virtually eliminates double bogeys.'
        },
        hcp20: {
            tee: { val: '+1.68 SG', width: '92%', color: 'fill-green', textColor: 'text-green', kpiEs: '238 yd · 75% Calle', kpiEn: '238 yd · 75% Fairway' },
            app: { val: '+0.82 SG', width: '80%', color: 'fill-green', textColor: 'text-green', kpiEs: '7.1m desde 140-160m', kpiEn: '7.1m from 140-160m' },
            short: { val: '+0.58 SG', width: '76%', color: 'fill-green', textColor: 'text-green', kpiEs: '68% Recuperación', kpiEn: '68% Scrambling' },
            putt: { val: '+0.31 SG', width: '66%', color: 'fill-green', textColor: 'text-green', kpiEs: '65% Embocado', kpiEn: '65% Make rate' },
            diagEs: 'Ganas más de 3.3 golpes por vuelta frente a un jugador HCP 20. El control de distancias y la eliminación de penalizaciones al agua marcan la diferencia radical.',
            diagEn: 'You gain more than 3.3 strokes per round over HCP 20 players. Avoiding penalty strokes and managing distance gaps create a massive scoring edge.'
        }
    };

    function updateMetric(valEl, barEl, kpiEl, data) {
        if (!valEl || !barEl || !data) return;
        valEl.textContent = data.val;
        valEl.className = `sg-val-badge ${data.textColor}`;
        barEl.style.width = data.width;
        barEl.className = `sg-bar-fill ${data.color}`;
        if (kpiEl) {
            const lang = currentLang || 'es';
            kpiEl.textContent = lang === 'en' ? data.kpiEn : data.kpiEs;
        }
    }

    function applyBenchmark(key) {
        const d = datasets[key];
        if (!d) return;

        tabBtns.forEach(btn => {
            const isActive = btn.getAttribute('data-ref') === key;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        updateMetric(valTee, barTee, kpiTee, d.tee);
        updateMetric(valApp, barApp, kpiApp, d.app);
        updateMetric(valShort, barShort, kpiShort, d.short);
        updateMetric(valPutt, barPutt, kpiPutt, d.putt);

        if (diagMsg) {
            const lang = currentLang || 'es';
            diagMsg.textContent = lang === 'en' ? d.diagEn : d.diagEs;
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const ref = btn.getAttribute('data-ref');
            if (ref) applyBenchmark(ref);
        });
    });

    // Expose language re-render function
    window.__updateSgBenchmarkLang = () => {
        const activeTab = document.querySelector('.sg-tab-btn.active');
        const ref = activeTab ? activeTab.getAttribute('data-ref') : 'hcp5';
        applyBenchmark(ref);
    };
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
