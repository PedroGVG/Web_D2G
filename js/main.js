document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initStickyHeader();
    initScrollReveal();
    initSmoothScroll();
    init3DTilt();
});

/* ═══════════════════════════════════════════
   Scroll Reveal (IntersectionObserver)
   ═══════════════════════════════════════════ */
function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion) {
        reveals.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -80px 0px' });

    reveals.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════
   Smooth Scroll
   ═══════════════════════════════════════════ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/* ═══════════════════════════════════════════
   Language Switcher
   ═══════════════════════════════════════════ */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';

    switchLanguage(savedLang);

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            switchLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
        });
    });
}

function switchLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-lang-es][data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) element.innerHTML = text;
    });

    document.documentElement.setAttribute('lang', lang);
}

/* ═══════════════════════════════════════════
   Sticky Header
   ═══════════════════════════════════════════ */
function initStickyHeader() {
    const stickyHeader = document.getElementById('sticky-header');
    if (!stickyHeader) return;

    const handleScroll = () => {
        if (window.scrollY > 20) {
            stickyHeader.classList.add('scrolled');
        } else {
            stickyHeader.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run initially

    const logoLink = stickyHeader.querySelector('.header-logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ═══════════════════════════════════════════
   3D Mouse Tilt Card Interaction
   ═══════════════════════════════════════════ */
function init3DTilt() {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    // 1. Regular smartphone mockups in feature beats
    const mobileMockups = document.querySelectorAll('.smartphone-mockup:not(.hero-mobile-overlap)');
    mobileMockups.forEach(mockup => {
        mockup.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;

            const rect = mockup.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update custom properties for reflection highlight
            mockup.style.setProperty('--x', `${(x / rect.width) * 100}%`);
            mockup.style.setProperty('--y', `${(y / rect.height) * 100}%`);

            // Normalize coordinates relative to center of mockup (-1 to 1)
            const normX = (x / rect.width) * 2 - 1;
            const normY = (y / rect.height) * 2 - 1;
            
            const rotateX = -normY * 7;
            const rotateY = normX * 7;

            // Apply 3D tilt transformation
            mockup.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.025)`;
        });

        mockup.addEventListener('pointerleave', () => {
            mockup.style.transform = '';
            mockup.style.setProperty('--x', '50%');
            mockup.style.setProperty('--y', '50%');
        });
    });

    // 2. High-impact Dual-Device Hero Showcase Parallax
    const heroShowcase = document.querySelector('.hero-devices');
    if (heroShowcase) {
        const desktop = heroShowcase.querySelector('.desktop-mockup');
        const mobile = heroShowcase.querySelector('.hero-mobile-overlap');

        heroShowcase.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;

            const rect = heroShowcase.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const normX = (x / rect.width) * 2 - 1;
            const normY = (y / rect.height) * 2 - 1;

            if (desktop) {
                const rotX = 7 - (normY * 4);
                const rotY = -5 + (normX * 4);
                const transX = normX * -6;
                const transY = normY * -6;
                desktop.style.transform = `perspective(1500px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(-1deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0px)`;
            }

            if (mobile) {
                // Update reflection inside phone
                const mobRect = mobile.getBoundingClientRect();
                const mobX = e.clientX - mobRect.left;
                const mobY = e.clientY - mobRect.top;
                mobile.style.setProperty('--x', `${(mobX / mobRect.width) * 100}%`);
                mobile.style.setProperty('--y', `${(mobY / mobRect.height) * 100}%`);

                const rotX = 4 - (normY * 7);
                const rotY = -8 + (normX * 7);
                const transX = normX * 16;
                const transY = normY * 16;
                mobile.style.transform = `perspective(1000px) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 90px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(2deg)`;
            }
        });

        heroShowcase.addEventListener('pointerleave', () => {
            if (desktop) {
                desktop.style.transform = '';
            }
            if (mobile) {
                mobile.style.transform = '';
                mobile.style.setProperty('--x', '50%');
                mobile.style.setProperty('--y', '50%');
            }
        });
    }
}
