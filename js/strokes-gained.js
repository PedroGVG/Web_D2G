/**
 * Strokes Gained Simulator - Data2Gain
 * Handles interactive reference level switching, animating SVG path morphing and HUD metrics.
 */

document.addEventListener('DOMContentLoaded', () => {
    initStrokesGainedSimulator();
});

function initStrokesGainedSimulator() {
    const tabs = document.querySelectorAll('.sg-tab');
    const mainPath = document.querySelector('.dash-path.main');
    const glowPath = document.querySelector('.dash-glow');
    const metricsContainer = document.querySelector('.dash-metrics');

    if (!tabs.length || !mainPath || !metricsContainer) return;

    // Dataset representing our Scratch/Elite player compared to different reference levels.
    // Coordinates are designed to morph the SVG path dynamically (Y goes from 0 [high/excellent] to 120 [low/poor]).
    const simulatorData = {
        pga: {
            metrics: [
                { label: 'TEE', val: '-0.25', height: '35%', colorClass: 'red' },
                { label: 'APP', val: '-0.58', height: '15%', colorClass: 'red' },
                { label: 'SHORT', val: '-0.18', height: '40%', colorClass: 'red' },
                { label: 'PUTT', val: '-0.42', height: '25%', colorClass: 'red' }
            ],
            // Low-altitude curve, below the Y=60 baseline
            path: 'M0,75 C40,80 80,95 120,105 C160,110 200,105 240,95 C280,90 320,95 360,100 L400,102'
        },
        hcp0: {
            metrics: [
                { label: 'TEE', val: '+0.04', height: '52%', colorClass: 'green' },
                { label: 'APP', val: '-0.21', height: '42%', colorClass: 'red' },
                { label: 'SHORT', val: '+0.02', height: '51%', colorClass: 'green' },
                { label: 'PUTT', val: '-0.15', height: '45%', colorClass: 'red' }
            ],
            // Right around the Y=60 baseline
            path: 'M0,60 C40,58 80,68 120,72 C160,78 200,75 240,68 C280,65 320,68 360,72 L400,75'
        },
        hcp5: {
            metrics: [
                { label: 'TEE', val: '+0.34', height: '70%', colorClass: 'gold' },
                { label: 'APP', val: '-0.11', height: '45%', colorClass: 'red' },
                { label: 'SHORT', val: '-0.06', height: '48%', colorClass: 'red' },
                { label: 'PUTT', val: '-0.24', height: '38%', colorClass: 'red' }
            ],
            // Default active state in HTML
            path: 'M0,52 C40,42 80,50 120,55 C160,62 200,65 240,58 C280,55 320,58 360,65 L400,68'
        },
        hcp10: {
            metrics: [
                { label: 'TEE', val: '+0.72', height: '78%', colorClass: 'green' },
                { label: 'APP', val: '+0.18', height: '60%', colorClass: 'green' },
                { label: 'SHORT', val: '+0.15', height: '58%', colorClass: 'green' },
                { label: 'PUTT', val: '-0.02', height: '49%', colorClass: 'red' }
            ],
            // Starting to rise above baseline
            path: 'M0,42 C40,32 80,38 120,42 C160,48 200,45 240,38 C280,35 320,42 360,48 L400,50'
        },
        hcp15: {
            metrics: [
                { label: 'TEE', val: '+1.15', height: '85%', colorClass: 'green' },
                { label: 'APP', val: '+0.48', height: '70%', colorClass: 'green' },
                { label: 'SHORT', val: '+0.35', height: '68%', colorClass: 'green' },
                { label: 'PUTT', val: '+0.12', height: '58%', colorClass: 'green' }
            ],
            // Rising highly above baseline
            path: 'M0,32 C40,22 80,28 120,32 C160,35 200,32 240,28 C280,25 320,30 360,35 L400,36'
        },
        hcp20: {
            metrics: [
                { label: 'TEE', val: '+1.68', height: '92%', colorClass: 'gold' },
                { label: 'APP', val: '+0.82', height: '80%', colorClass: 'green' },
                { label: 'SHORT', val: '+0.58', height: '76%', colorClass: 'green' },
                { label: 'PUTT', val: '+0.31', height: '66%', colorClass: 'green' }
            ],
            // Very high performance curve
            path: 'M0,22 C40,15 80,18 120,20 C160,22 200,18 240,15 C280,12 320,18 360,20 L400,21'
        },
        hcp25: {
            metrics: [
                { label: 'TEE', val: '+2.25', height: '98%', colorClass: 'gold' },
                { label: 'APP', val: '+1.28', height: '90%', colorClass: 'gold' },
                { label: 'SHORT', val: '+0.85', height: '85%', colorClass: 'green' },
                { label: 'PUTT', val: '+0.55', height: '75%', colorClass: 'green' }
            ],
            // Maximum performance curve relative to HCP 25
            path: 'M0,12 C40,8 80,10 120,12 C160,10 200,8 240,6 C280,5 320,8 360,10 L400,8'
        }
    };

    // Keep track of the active tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate other tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });

            // Activate current tab
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const referenceKey = tab.getAttribute('data-ref');
            const data = simulatorData[referenceKey];

            if (data) {
                updateVisuals(data);
            }
        });
    });

    // Update the SVG paths and the HUD metrics in the DOM
    function updateVisuals(data) {
        // Morph the curves smoothly
        mainPath.setAttribute('d', data.path);
        if (glowPath) {
            glowPath.setAttribute('d', data.path);
        }

        // Update the metrics
        const metricElements = metricsContainer.querySelectorAll('.metric');
        data.metrics.forEach((metricData, index) => {
            const el = metricElements[index];
            if (el) {
                // Update numerical value
                const valEl = el.querySelector('.val');
                if (valEl) {
                    valEl.textContent = metricData.val;
                }

                // Update progress bar fill height, color classes, and box shadow glows
                const barFill = el.querySelector('.metric-bar-fill');
                if (barFill) {
                    // Temporarily pause default infinite CSS keyframe to let static dynamic state reflect smoothly
                    barFill.style.animation = 'none';
                    
                    // Trigger a reflow to make the transition work
                    void barFill.offsetWidth;

                    // Apply new height
                    barFill.style.height = metricData.height;

                    // Clear previous color classes (gold, green, red)
                    barFill.classList.remove('gold', 'green', 'red');
                    barFill.classList.add(metricData.colorClass);

                    // Re-apply box-shadow dynamically based on the color to make it look extra premium
                    let shadowColor = 'var(--accent-gold)';
                    if (metricData.colorClass === 'green') shadowColor = 'var(--accent-green)';
                    if (metricData.colorClass === 'red') shadowColor = 'var(--accent-red)';
                    
                    barFill.style.boxShadow = `0 0 10px ${shadowColor}`;
                }
            }
        });
    }

    // Set initial state based on default active tab
    const initialActiveTab = document.querySelector('.sg-tab.active');
    if (initialActiveTab) {
        const ref = initialActiveTab.getAttribute('data-ref');
        if (simulatorData[ref]) {
            // Apply immediately without full transitions for initial load
            updateVisuals(simulatorData[ref]);
        }
    }
}
