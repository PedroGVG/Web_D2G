document.addEventListener('DOMContentLoaded', () => {
    // Initialize Language Switcher
    initLanguageSwitcher();

    // Initialize Sticky Header
    initStickyHeader();

    initCounter();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Chat Input Interaction
    const chatInput = document.querySelector('.ai-chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Placeholder: Simulate sending
                const val = chatInput.value;
                if (val.trim() === '') return;

                chatInput.value = 'Analyzing... (Demo)';
                setTimeout(() => {
                    chatInput.value = '';
                    alert(`Thank you for your input: "${val}". Our AI team would contact you in a real scenario.`);
                }, 1000);
            }
        });
    }

    // Tracking for AI Button
    const aiBtn = document.getElementById('btn-ai-analysis');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            console.log('Event: ai_analysis_click', {
                timestamp: new Date().toISOString(),
                location: 'feature_section'
            });
        });
    }
});

function initCounter() {
    const counterElement = document.getElementById('hours-saved');
    const target = 14205; // Arbitrary "impressive" number
    const duration = 2500; // ms

    // Use Intersection Observer to start counting when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(counterElement, 0, target, duration);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const card = document.getElementById('card-automation');
    if (card) observer.observe(card);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Ease out wrapper
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Language Switcher Functions
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';

    // Set initial language
    switchLanguage(savedLang);

    // Add click listeners
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            switchLanguage(lang);
            localStorage.setItem('preferredLanguage', lang);
        });
    });
}

function switchLanguage(lang) {
    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update all elements with language data attributes
    document.querySelectorAll('[data-lang-es][data-lang-en]').forEach(element => {
        const text = element.getAttribute(`data-lang-${lang}`);
        if (text) {
            element.innerHTML = text;
        }
    });
}

// Sticky Header Functions
function initStickyHeader() {
    const stickyHeader = document.getElementById('sticky-header');
    const introSection = document.querySelector('.intro-section');

    if (!stickyHeader || !introSection) return;

    // Show/hide header on scroll
    window.addEventListener('scroll', () => {
        const introHeight = introSection.offsetHeight;
        const scrollPosition = window.scrollY;

        // Show header when scrolled past intro section
        if (scrollPosition > introHeight * 0.8) {
            stickyHeader.classList.add('visible');
        } else {
            stickyHeader.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicking logo
    const logoLink = stickyHeader.querySelector('.header-logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}
