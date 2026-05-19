document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initStickyHeader();
    initScrollReveal();
    initSmoothScroll();
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
