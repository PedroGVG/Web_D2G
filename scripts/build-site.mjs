import { mkdir, writeFile, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { compareRound, round } from '../js/demo-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://data2gain.com';
const app = 'https://app.data2gain.com/';
const slugs = { es: { home: '', players: 'jugadores/', coaches: 'coaches/', info: 'informacion/' }, en: { home: '', players: 'players/', coaches: 'coaches/', info: 'information/' } };
let lang = 'es';
const t = (es, en) => lang === 'es' ? es : en;
const route = (page, locale = lang) => `/${locale}/${slugs[locale][page]}`;
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const diagonal = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const check = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const flagEs = '<svg class="lang-flag" viewBox="0 0 640 480" width="16" height="12" aria-hidden="true"><path fill="#c60b1e" d="M0 0h640v480H0z"/><path fill="#ffc400" d="M0 120h640v240H0z"/></svg>';
const flagGb = '<svg class="lang-flag" viewBox="0 0 60 30" width="16" height="10" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg>';
const appleIcon = '<svg class="platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.06 1.7-0.93 2.73 1 .08 2.03-.48 2.65-1.23z"/></svg>';
const googlePlayIcon = '<svg class="platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.22-.395c-.244-.59-.39-1.312-.39-2.19V4.4c0-.877.146-1.6.39-2.19.064-.15.138-.284.22-.396zm1.424-1.05a2.53 2.53 0 0 1 1.488.293l10.87 6.208-2.894 2.893L5.033.764zm0 22.472l9.464-9.464 2.894 2.893-10.87 6.208a2.53 2.53 0 0 1-1.488.293zm11.758-7.398l3.414-1.95a1.69 1.69 0 0 0 0-2.936l-3.414-1.95-2.227 2.227 2.227 2.227z"/></svg>';
const webAppIcon = '<svg class="platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 6.5h.01M11 6.5h.01M14 6.5h.01"/></svg>';
const link = (href, text, kind = 'gold', tracking = '') => `<a class="button button-${kind}" href="${esc(href)}"${tracking ? ` data-track="${tracking}"` : ''}>${text}${arrow}</a>`;
const mail = subject => `mailto:info@data2gain.com?subject=${encodeURIComponent(subject)}`;
const eyebrow = text => `<p class="eyebrow">${text}</p>`;
const brand = () => `<span class="brand"><img src="/assets/logo-64.webp" width="32" height="32" alt=""><span>DATA<span class="brand-two">2</span>GAIN</span></span>`;
const platformStrip = () => `<div class="platform-strip" aria-label="${t('Plataformas disponibles','Available platforms')}"><span class="platform-caption">${t('Disponible en:','Available on:')}</span><div class="platform-badges"><a class="platform-badge" href="${app}" data-track="store_apple" aria-label="Apple App Store">${appleIcon}<span>App Store</span></a><a class="platform-badge" href="${app}" data-track="store_android" aria-label="Google Play">${googlePlayIcon}<span>Google Play</span></a><a class="platform-badge" href="${app}" data-track="store_webapp" aria-label="Web App">${webAppIcon}<span>Web App</span></a></div></div>`;

function header(page) {
  return `<a class="skip-link" href="#main">${t('Saltar al contenido', 'Skip to content')}</a>
  <header class="site-header"><div class="container header-inner">
    <a class="brand-link" href="${route('home')}" aria-label="${t('Data2Gain, inicio','Data2Gain, home')}">${brand()}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="${t('Abrir menú','Open menu')}"><span></span><span></span></button>
    <nav id="main-nav" class="main-nav" aria-label="${t('Navegación principal','Main navigation')}">
      <a href="${route('players')}"${page === 'players' ? ' aria-current="page"' : ''}>${t('Jugadores','Players')}</a>
      <a href="${route('coaches')}"${page === 'coaches' ? ' aria-current="page"' : ''}>Coaches</a>
      <a href="${route('home')}#como-funciona">${t('Cómo funciona','How it works')}</a>
      <a href="${route('home')}#precios">${t('Precios','Pricing')}</a>
      <div class="nav-utilities"><div class="languages" aria-label="${t('Idioma','Language')}"><a href="${route(page,'es')}" lang="es" hreflang="es" aria-label="Español"${lang === 'es' ? ' aria-current="true"' : ''}>${flagEs}<span>ES</span></a><span class="lang-divider" aria-hidden="true">/</span><a href="${route(page,'en')}" lang="en" hreflang="en" aria-label="English"${lang === 'en' ? ' aria-current="true"' : ''}>${flagGb}<span>EN</span></a></div>
      <a class="nav-access" href="${app}" data-track="app_open">${t('Acceder','Sign in')}${diagonal}</a></div>
      <div class="nav-mobile-platforms">${platformStrip()}</div>
    </nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><div><a class="brand-link" href="${route('home')}" aria-label="${t('Data2Gain, inicio','Data2Gain, home')}">${brand()}</a><p>${t('Tu juego. Tus datos. Tu siguiente paso.','Your game. Your data. Your next step.')}</p></div><nav aria-label="${t('Enlaces del pie','Footer navigation')}"><a href="${route('players')}">${t('Jugadores','Players')}</a><a href="${route('coaches')}">Coaches</a><a href="${route('home')}#precios">${t('Precios','Pricing')}</a><a href="mailto:info@data2gain.com">${t('Contacto','Contact')}</a></nav></div><div class="footer-bottom"><span>© 2026 Data2Gain</span><a href="${route('info')}">${t('Información y contacto','Information & contact')}</a><span class="footer-location">${t('Golf, con perspectiva.','A new perspective on golf.')}</span></div></div></footer>
  <dialog class="image-dialog" aria-labelledby="image-dialog-title"><div class="dialog-top"><p id="image-dialog-title">${t('Detalle del producto','Product detail')}</p><button type="button" class="dialog-close" aria-label="${t('Cerrar imagen','Close image')}">×</button></div><img alt=""></dialog>`;
}

function hero(page) {
  const home = page === 'home';
  const coach = page === 'coaches';
  const title = home
    ? t('Siente el golpe con intuición.<br><em>Decide la estrategia con datos.</em>', 'Feel the shot with intuition.<br><em>Decide strategy with data.</em>')
    : coach
    ? t('Tu criterio.<br>Sus datos.<br><em>100% Gratis para coaches.</em>', 'Your expertise.<br>Their data.<br><em>100% Free for coaches.</em>')
    : t('Conoce tu juego.<br>Encuentra tu<br><em>siguiente paso.</em>', 'Know your game.<br>Find your<br><em>next step.</em>');

  const eyebrowText = home
    ? t('Inteligencia de Tour · Sin el Tour', 'Tour intelligence · Without the Tour')
    : coach
    ? t('Para coaches y academias · 100% Gratuito', 'For coaches & academies · 100% Free')
    : t('Para jugadores', 'For players');

  const desc = home
    ? t('Ve más allá de las estadísticas convencionales: telemetría de Tour y analítica de precisión para decidir con certeza.', 'Go beyond conventional statistics: Tour telemetry and precision analytics to decide with confidence.')
    : coach
    ? t('Strokes Gained y telemetría de dispersión para tus clases, en una plataforma 100% gratuita.', 'Strokes Gained and dispersion telemetry for your lessons on a 100% free platform.')
    : t('Descubre tus patrones de juego con Strokes Gained, dispersión real e IA aplicada a tus datos.', 'Uncover your playing patterns with Strokes Gained, true dispersion and game-context AI.');

  const actions = home
    ? link(route('players'), t('Para jugadores', 'For players'), 'gold hero-cta-main', 'audience_players') + link(route('coaches'), t('Para coaches (Gratis)', 'For coaches (Free)'), 'outline hero-cta-coach', 'audience_coaches')
    : coach
    ? link(app, t('Acceder Gratis como Coach', 'Get Free Coach Access'), 'gold', 'coach_app')
    : link(app, t('Empezar con Data2Gain', 'Get started with Data2Gain'), 'gold', 'app_open');

  const footnote = home
    ? t('Analítica avanzada Strokes Gained · 8,95 €/mes para jugadores · 100% Gratis para coaches', 'Advanced Strokes Gained analytics · €8.95/month for players · 100% Free for coaches')
    : coach
    ? t('100% Gratuito para instructores y academias · Acceso directo e inmediato', '100% Free for instructors and academies · Direct instant access')
    : t('8,95 €/mes · Todas las funciones PRO · Cancela cuando quieras', '€8.95/month · All PRO features · Cancel anytime');

  const peekAlt = t('Vista del análisis de dispersión', 'Dispersion analysis preview');
  const insightIcon = coach
    ? `<span class="insight-icon">${diagonal}</span>`
    : `<img class="hero-product-peek" src="/assets/screens/${lang}/screen-dispersion-360.webp" width="78" height="86" alt="${esc(peekAlt)}">`;
  const insightEyebrow = coach ? t('Al servicio de tu criterio', 'Built around your expertise') : t('Dentro de Data2Gain', 'Inside Data2Gain');
  const insightStrong = coach ? t('Diagnóstico objetivo de cada alumno', 'Objective diagnosis for each player') : t('Encuentra el patrón en tus datos', 'Find the pattern in your data');
  const insightDetail = coach ? t('Planes de práctica basados en datos', 'Data-backed practice routines') : t('Dispersión · Strokes Gained · IA', 'Dispersion · Strokes Gained · AI');

  const photoSrc = coach
    ? '/assets/editorial/coaching.jpg'
    : home
    ? '/assets/editorial/strokesaver-22c.webp'
    : '/assets/editorial/golfer.webp';

  const photoSrcset = home
    ? ' srcset="/assets/editorial/strokesaver-22c-800.webp 800w, /assets/editorial/strokesaver-22c.webp 1376w" sizes="(max-width: 760px) 100vw, 52vw"'
    : '';

  const photoAlt = coach
    ? t('Un instructor acompaña a una joven golfista durante una sesión de práctica', 'An instructor guides a young golfer during practice')
    : home
    ? t('Joven golfista al atardecer con telemetría de Strokes Gained en transparencia', 'Young golfer at golden hour with translucent Strokes Gained telemetry overlay')
    : t('Golfista terminando su swing con la luz del atardecer', 'Golfer finishing a swing in the evening light');

  const photoWidth = coach ? 1400 : (home ? 1376 : 1600);
  const photoHeight = coach ? 1845 : (home ? 768 : 1067);

  const photoCaption1 = t('Una nueva forma de ver el golf', 'A new perspective on golf');
  const photoCaption2 = '01 — D2G';

  return `<section class="hero ${home ? 'hero-home' : 'hero-detail'}"><div class="container hero-grid"><div class="hero-copy">
    ${eyebrow(eyebrowText)}
    <h1>${title}</h1><p class="hero-description">${desc}</p>
    <div class="hero-actions">${actions}</div>
    ${platformStrip()}
    <p class="hero-footnote">${footnote}</p>
    </div><div class="hero-visual ${coach ? 'hero-coaching' : (home ? 'hero-strokesaver-stage' : '')}"><img class="hero-photo" src="${photoSrc}"${photoSrcset} alt="${esc(photoAlt)}" width="${photoWidth}" height="${photoHeight}" fetchpriority="high">
    <div class="photo-caption"><span>${photoCaption1}</span><span>${photoCaption2}</span></div>
    <a class="hero-insight" href="${coach ? '#enfoque' : '#producto'}">${insightIcon}<div><span class="eyebrow">${insightEyebrow}</span><strong>${insightStrong}</strong><span class="insight-detail">${insightDetail}</span></div></a>
    </div></div><div class="container hero-baseline"><span>${t('SIENTE EL GOLPE. ENTIENDE EL JUEGO.','FEEL THE SHOT. UNDERSTAND THE GAME.')}</span><a href="${coach ? '#enfoque' : '#como-funciona'}">${t('Explora Data2Gain','Explore Data2Gain')}<span aria-hidden="true">↓</span></a></div></section>`;
}

function how() {
  const steps = [
    [t('Juega. Registra.','Play. Record.'),t('Registra tu ronda en la app golpe a golpe en pocos minutos.','Record your round shot by shot in just a few minutes.')],
    [t('Encuentra el patrón.','Find the pattern.'),t('Descubre patrones profundos y la causa real detrás de cada fallo.','Uncover deep patterns and the true cause behind every miss.')],
    [t('Decide el siguiente paso.','Choose your next step.'),t('Convierte los datos en un plan de práctica con foco inmediato.','Turn your data into a focused practice routine right away.')]
  ];
  return `<section class="section section-light" id="como-funciona"><div class="container"><div class="section-heading horizontal">${eyebrow(t('01 / Del dato a la decisión','01 / From data to decisions'))}<h2>${t('Más claridad.<br>En cada paso.','More clarity.<br>At every step.')}</h2><p>${t('No necesitas saber de estadística.<br>Solo querer entender mejor tu golf.','You do not need to be a statistician.<br>Just curious about your golf.')}</p></div><div class="steps">${steps.map(([title,body],i)=>`<article class="step"><span class="step-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></div></section>`;
}

function audiences() {
  return `<section class="section section-light audience-section"><div class="container"><div class="section-heading"><div>${eyebrow(t('02 / Una ambición compartida','02 / One shared ambition'))}<h2>${t('Para quienes juegan.<br>Y para quienes enseñan.','For those who play.<br>And those who teach.')}</h2></div><p>${t('Dos perfiles, una misma meta:<br>entender el dato para tomar mejores decisiones en el campo.','Two perspectives, one shared goal:<br>using data to make better decisions on the course.')}</p></div><div class="audience-grid">
    <a class="audience-card" href="${route('players')}" data-track="audience_players"><img src="/assets/editorial/player-drive.webp" srcset="/assets/editorial/player-drive-800.webp 800w, /assets/editorial/player-drive.webp 1200w" sizes="(max-width: 760px) 92vw, 48vw" alt="${t('Golfista aficionado siguiendo el vuelo de su bola en el campo','Amateur golfer watching his ball flight on the course')}" width="896" height="1200" loading="lazy"><div class="audience-content"><span class="eyebrow">${t('Tu próxima mejor ronda','Your next better round')}</span><h3>${t('Soy jugador','I am a player')}</h3><p>${t('Conoce tus puntos fuertes.<br>Trabaja donde más importa.','Know your strengths.<br>Work where it matters most.')}</p><span class="text-link">${t('Descubre tu ventaja','Find your advantage')}${arrow}</span></div></a>
    <a class="audience-card" href="${route('coaches')}" data-track="audience_coaches"><img src="/assets/editorial/coaching.jpg" alt="${t('Instructor guiando a una alumna en la práctica de golf','Instructor guiding a student during golf practice')}" width="1400" height="1845" loading="lazy"><div class="audience-content"><span class="eyebrow">${t('100% Gratuito para coaches','100% Free for coaches')}</span><h3>${t('Soy coach','I am a coach')}</h3><p>${t('Diagnostica el juego real de tus alumnos con telemetría objetiva y sin coste.','Diagnose your students\' on-course play with objective telemetry at zero cost.')}</p><span class="text-link">${t('Acceder gratis a la plataforma','Free platform access')}${arrow}</span></div></a>
    </div></div></section>`;
}

function strategy() {
  return `<section class="section strategy-section" id="demo">
    <div class="container strategy-header-compact">
      <div class="sim-pill-badge"><span class="sim-beacon"></span>${t('SIMULACIÓN CONCEPTUAL · NO DISPONIBLE EN LA APP','CONCEPTUAL SIMULATION · NOT IN THE APP')}</div>
      <p class="eyebrow">${t('03 / Estrategia de Tour · Tee a Green','03 / Tour Strategy · Tee to Green')}</p>
      <h2>${t('Un mismo hoyo. Dos decisiones <em>estadísticas.</em>','One hole. Two statistical <em>decisions.</em>')}</h2>
      <p class="strategy-lead-compact">${t('Atacar por inercia o jugar con tu dispersión real. Comprueba directamente en el mapa táctico cómo cambia la tarjeta:','Attacking blindly vs playing with your true dispersion. See directly on the tactical map how the scorecard changes:')}</p>
    </div>

    <div class="strategy-scroll-track" id="strategy-track">
      <div class="strategy-sticky-stage">
        <div class="course-stage-fullbleed" data-course-strategy="controlled">
          <div class="course-canvas-wrap">
            <img class="course-photo" src="/assets/hero-hole-sg-1200.webp" srcset="/assets/hero-hole-sg-480.webp 480w, /assets/hero-hole-sg-800.webp 800w, /assets/hero-hole-sg-1200.webp 1200w" sizes="(max-width: 760px) 100vw, 780px" width="1200" height="805" loading="lazy" alt="${t('Mapa táctico de hoyo de golf a pantalla completa','Full-screen tactical golf hole map')}">

            <!-- STRATEGY BUTTONS INTEGRATED DIRECTLY ON THE MAP -->
            <div class="course-hud-top">
              <div class="course-hud-badge">
                <span>PAR 4 · 418 YDS</span>
              </div>
              <div class="strategy-controls-hud" role="group" aria-label="${t('Estrategia del hoyo','Hole strategy')}">
                <button type="button" data-strategy="controlled" aria-pressed="true">
                  <span class="hud-dot dot-green"></span>
                  <span class="hud-btn-copy">
                    <strong>${t('Control Inteligente','Smart Control')}</strong>
                    <span class="hud-btn-stat text-green">${t('+0.42 SG · 0% agua','+0.42 SG · 0% water')}</span>
                  </span>
                </button>
                <button type="button" data-strategy="aggressive" aria-pressed="false">
                  <span class="hud-dot dot-red"></span>
                  <span class="hud-btn-copy">
                    <strong>${t('Riesgo Innecesario','Unnecessary Risk')}</strong>
                    <span class="hud-btn-stat text-red">${t('−0.65 SG · 32% agua','−0.65 SG · 32% water')}</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- SVG FLIGHT TRACERS AND DISPERSION OVERLAY -->
            <svg class="course-svg-overlay" viewBox="0 0 1200 805" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <!-- CONTROLLED STRATEGY GRAPHICS -->
              <g class="strat-group-controlled">
                <path class="tracer tracer-controlled" d="M612 684 Q610 540 606 426"/>
                <ellipse class="dispersion-ellipse disp-controlled" cx="606" cy="426" rx="44" ry="60"/>
                <path class="tracer tracer-approach-controlled" d="M606 426 Q610 275 615 150"/>
                <circle class="target-ring target-controlled" cx="615" cy="150" r="32"/>
                <circle class="target-center-dot" cx="615" cy="150" r="4.5"/>
              </g>

              <!-- AGGRESSIVE STRATEGY GRAPHICS -->
              <g class="strat-group-aggressive">
                <path class="tracer tracer-aggressive" d="M612 684 Q590 470 558 300"/>
                <ellipse class="dispersion-ellipse disp-aggressive" cx="558" cy="300" rx="50" ry="72"/>
                <path class="tracer tracer-miss" d="M578 430 Q620 360 659 286"/>
                <circle class="hazard-splash" cx="659" cy="286" r="24"/>
                <path class="tracer tracer-approach-aggressive" d="M558 300 Q585 205 615 140"/>
                <circle class="target-hazard-pin" cx="615" cy="140" r="22"/>
              </g>
            </svg>

            <!-- TACTICAL MAP PINS -->
            <div class="course-map-pins">
              <!-- Pin: Tee Box (x: 51%, y: 85%) -->
              <div class="course-tactical-pin pin-tee" style="top:85%;left:51%">
                <span class="tactical-dot"></span>
                <div class="tactical-card">
                  <span class="tactical-sub">${t('Salida','Tee')}</span>
                  <strong data-pin-tee>${t('Madera 3 · 240 yd','3-Wood · 240 yd')}</strong>
                </div>
              </div>

              <!-- Pin: Fairway Landing Zone (x: 50.5%, y: 53%) -->
              <div class="course-tactical-pin pin-landing" style="top:53%;left:50.5%">
                <span class="tactical-dot"></span>
                <div class="tactical-card">
                  <span class="tactical-badge tag-green" data-pin-landing-tag>${t('0% Riesgo de Agua','0% Water Risk')}</span>
                  <strong data-pin-landing>${t('Calle Ancha · Margen Total','Wide Fairway · Full Margin')}</strong>
                </div>
              </div>

              <!-- Pin: Water Hazard Alert (x: 55%, y: 35.5%) -->
              <div class="course-tactical-pin pin-water" style="top:35.5%;left:55%">
                <span class="tactical-dot dot-red"></span>
                <div class="tactical-card card-alert">
                  <span class="tactical-badge tag-red">${t('32% Dispersión al Agua','32% Water Miss')}</span>
                  <strong>${t('Penalización (−1.82 SG)','Penalty (−1.82 SG)')}</strong>
                </div>
              </div>

              <!-- Pin: Green & Outcome (x: 51.25%, y: 18.6%) -->
              <div class="course-tactical-pin pin-green" style="top:18.6%;left:51.25%">
                <span class="tactical-dot dot-target"></span>
                <div class="tactical-card">
                  <span class="tactical-badge tag-green" data-pin-green-tag>${t('+0.42 SG vs Campo','+0.42 SG vs Field')}</span>
                  <strong data-pin-green>${t('Centro de Green ➔ Par Asegurado','Green Center ➔ Safe Par')}</strong>
                </div>
              </div>
            </div>

            <!-- FLOATING TELEMETRY HUD DIRECTLY ON MAP -->
            <div class="course-hud-bottom">
              <div class="hud-metric">
                <span class="hud-metric-label">${t('Salida','Tee')}</span>
                <strong class="text-green" data-summary-tee>${t('100% Calle (0% Agua)','100% Fairway (0% Water)')}</strong>
              </div>
              <div class="hud-metric-divider" aria-hidden="true"></div>
              <div class="hud-metric">
                <span class="hud-metric-label">${t('Aproximación','Approach')}</span>
                <strong data-summary-approach>${t('Hierro 7 a centro','7-Iron to center')}</strong>
              </div>
              <div class="hud-metric-divider" aria-hidden="true"></div>
              <div class="hud-metric">
                <span class="hud-metric-label">${t('Resultado','Result')}</span>
                <strong class="text-green" data-summary-score>${t('PAR Seguro (+0.42 SG)','Safe PAR (+0.42 SG)')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function screenshot(name, alt, extra = '') {
  return `<button class="screenshot-button ${extra}" type="button" data-zoom="/assets/screens/${lang}/${name}.png" aria-label="${esc(t('Ampliar: ','Enlarge: ')+alt)}"><img src="/assets/screens/${lang}/${name}-800.webp" srcset="/assets/screens/${lang}/${name}-360.webp 360w, /assets/screens/${lang}/${name}-800.webp 800w" sizes="(max-width: 760px) 88vw, 44vw" alt="${esc(alt)}" width="800" height="900" loading="lazy"><span class="zoom-indicator">${diagonal}<span>${t('Ampliar','Enlarge')}</span></span></button>`;
}

function product() {
  const tabs = [
    t('Radar de Dispersión','Dispersion Radar'),
    t('Bag Mapping y Distancias','Bag Mapping & Distances'),
    t('Todas las Áreas & Matriz de Putting','All Game Areas & Putting Matrix')
  ];
  const titles = [
    t('Scatter Plots y elipses.<br>Apunta con certeza estadística.','Scatter plots and ellipses.<br>Aim with statistical certainty.'),
    t('Distancias reales de carry.<br>Sin solapamientos ni huecos.','True carry distances.<br>No gaps, no guesswork.'),
    t('Desglose de cada área.<br>Matriz de slope y Strokes Gained.','Every area broken down.<br>Slope matrix and Strokes Gained.')
  ];
  const descriptions = [
    t('Visualiza la dispersión real de cada palo con scatter plots y elipses para apuntar con margen óptimo.', 'Visualize true club dispersion with scatter plots and radar ellipses to aim with optimal margin.'),
    t('Mide el carry real de tu bolsa en el campo para eliminar solapamientos y brechas de distancia.', 'Measure true on-course carry to eliminate distance overlaps and gaps between clubs.'),
    t('Telemetría completa en las cuatro áreas del juego y análisis de putt por pendiente para erradicar el tripateo.', 'Complete telemetry across all four game areas and slope-based putting analysis to eliminate 3-putts.')
  ];
  const images = ['screen-dispersion','screen-gap','screen-putt'];
  return `<section class="section section-light product-section" id="producto">
    <div class="container">
      <div class="section-heading">
        <div>${eyebrow(t('04 / Dentro de Data2Gain','04 / Inside Data2Gain'))}<h2>${t('La diferencia está<br>en lo que descubres.','The difference is<br>what you discover.')}</h2></div>
        <p>${t('Pantallas del producto.<br>Conclusiones que puedes llevar al campo.','Screens from the product.<br>Insights you can take to the course.')}</p>
      </div>
      <div class="product-scroll-track" id="product-track">
        <div class="product-sticky-stage">
          <div class="product-tabs" role="tablist" aria-label="${t('Explorar funciones','Explore features')}">
            ${tabs.map((text,i)=>`<button id="product-tab-${i}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="product-panel-${i}" tabindex="${i === 0 ? '0' : '-1'}" data-product-tab="${i}"><span class="tab-num">0${i+1}</span><span class="tab-label">${text}</span></button>`).join('')}
          </div>
          ${tabs.map((_,i)=>`<div class="product-panel" id="product-panel-${i}" role="tabpanel" aria-labelledby="product-tab-${i}" tabindex="0"${i ? ' hidden' : ''}><div class="product-screen">${screenshot(images[i],tabs[i])}<p class="screen-caption">${t('Captura de Data2Gain · Ejemplo de análisis','Data2Gain screenshot · Example analysis')}</p></div><div class="product-copy"><h3>${titles[i]}</h3><p>${descriptions[i]}</p><a class="text-link" href="${app}" data-track="app_open">${t('Explorar la app','Explore the app')}${arrow}</a></div></div>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function benchmark() {
  const values = compareRound('5').values;
  const labels = [t('Salidas','Off the tee'),t('Aproximación','Approach'),t('Juego corto','Short game'),'Putting'];
  return `<section class="section benchmark-section" id="strokes-gained"><div class="container benchmark-grid"><div>${eyebrow(t('Tu juego, en contexto','Your game, in context'))}<h2>${t('Elige tu referencia.<br>Entiende tu<br><em>rendimiento.</em>','Choose a benchmark.<br>Understand your<br><em>performance.</em>')}</h2><div class="benchmark-control"><div class="benchmark-control-meta"><label class="select-label" for="benchmark-select"><span class="pulse-beacon" aria-hidden="true"></span>${t('Nivel de referencia','Reference level')}</label></div><div class="select-pulse-wrapper"><select id="benchmark-select" class="pulse-heartbeat" aria-label="${t('Nivel de referencia para Strokes Gained','Reference level for Strokes Gained')}">${[['tour','Tour'],['0','HCP 0'],['5','HCP 5'],['10','HCP 10'],['15','HCP 15'],['20','HCP 20']].map(([key,label])=>`<option value="${key}"${key === '5' ? ' selected' : ''}>${label}</option>`).join('')}</select><svg class="select-arrow-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><p class="demo-label">${t('Datos ilustrativos. No es un diagnóstico personal.','Illustrative data. This is not a personal assessment.')}</p></div><div class="benchmark-chart"><div class="chart-heading"><span>${t('MISMA RONDA / OTRA PERSPECTIVA','SAME ROUND / ANOTHER PERSPECTIVE')}</span><span data-benchmark-label>VS HCP 5</span></div><div class="benchmark-rows">${labels.map((label,i)=>`<div class="benchmark-row"><span>${label}</span><div class="diverging-track"><span class="zero-line"></span><span data-sg-bar="${i}" class="sg-bar ${values[i]<0?'negative':'positive'}" style="--bar-size:${Math.min(Math.abs(values[i])/2*50,50)}%"></span></div><strong data-sg-value="${i}">${values[i]>0?'+':''}${values[i].toFixed(2)}</strong></div>`).join('')}</div><div class="chart-axis"><span>− SG</span><span>0</span><span>+ SG</span></div><p class="benchmark-insight" data-benchmark-insight aria-live="polite">${t('Frente a HCP 5, el putting es el área con más margen en esta ronda de ejemplo.','Against HCP 5, putting offers the most room for improvement in this sample round.')}</p><div class="round-facts"><span><strong>${round.distance} yd</strong>${t('Distancia de salida','Driving distance')}</span><span><strong>${round.fairways}%</strong>${t('Calles alcanzadas','Fairways hit')}</span><span>${t('Los datos de la ronda<br>se mantienen iguales.','The round data<br>stays the same.')}</span></div></div></div></section>`;
}

function aiConsole() {
  return `<div class="ai-console">
    <div class="ai-console-header">
      <div class="ai-console-title">
        <span class="agent-live-dot"></span>
        <span class="mono-text">D2G CADDIE AGENT · ${t('ANÁLISIS EN TIEMPO REAL','REAL-TIME ANALYSIS')}</span>
      </div>
      <div class="ai-console-meta">
        <span class="meta-tag">${t('5 RONDAS ANALIZADAS · VS HCP 5','5 ROUNDS ANALYZED · VS HCP 5')}</span>
      </div>
    </div>

    <!-- Interactive Prompt Selector Tabs -->
    <div class="ai-prompt-tabs" role="tablist" aria-label="${t('Seleccionar consulta para el agente IA','Select query for AI agent')}">
      <button type="button" class="ai-prompt-btn is-active" role="tab" id="ai-tab-0" aria-selected="true" aria-controls="ai-panel-0" tabindex="0" data-ai-prompt="0">
        <span class="ai-prompt-num">01</span>
        <span>${t('Balance SG','SG Balance')}</span>
      </button>
      <button type="button" class="ai-prompt-btn" role="tab" id="ai-tab-1" aria-selected="false" aria-controls="ai-panel-1" tabindex="-1" data-ai-prompt="1">
        <span class="ai-prompt-num">02</span>
        <span>${t('Dispersión H7-H8','7-8 Iron Dispersion')}</span>
      </button>
      <button type="button" class="ai-prompt-btn" role="tab" id="ai-tab-2" aria-selected="false" aria-controls="ai-panel-2" tabindex="-1" data-ai-prompt="2">
        <span class="ai-prompt-num">03</span>
        <span>${t('Plan 45 min','45-Min Routine')}</span>
      </button>
    </div>

    <div class="ai-console-body">
      <!-- Scenario 0: Strokes Gained Balance -->
      <div class="ai-scenario" id="ai-panel-0" role="tabpanel" aria-labelledby="ai-tab-0" tabindex="0">
        <div class="chat-msg chat-msg-user">
          <div class="chat-msg-avatar">👤</div>
          <div class="chat-bubble user-bubble">
            <p>${t('¿En qué áreas estoy perdiendo más golpes frente a HCP 5 y qué debería priorizar?','Where am I losing the most strokes against HCP 5 and what should I prioritize?')}</p>
          </div>
        </div>

        <div class="chat-msg chat-msg-agent">
          <div class="chat-msg-avatar agent-avatar">${brand()}</div>
          <div class="chat-bubble agent-bubble">
            <div class="agent-badge-row">
              <span class="agent-name">DATA2GAIN AI</span>
              <span class="agent-tag">${t('Diagnóstico Predictivo','Predictive Diagnosis')}</span>
            </div>
            <p class="agent-text">${t('Analizando tus últimas 5 rondas: tu principal fuga se concentra en <strong>Aproximación (120-160 m)</strong> con <em>−1.42 SG</em> y en <strong>Putting de media distancia (3-6 m)</strong> con <em>−0.88 SG</em> (24% 3-putts). En cambio, tus salidas son sólidas (<em>+0.35 SG</em>).','Analyzing your last 5 rounds: your primary leaks are in <strong>Approach (120-160m)</strong> with <em>−1.42 SG</em> and <strong>Mid-range Putting (3-6m)</strong> with <em>−0.88 SG</em> (24% 3-putts). Off the tee remains a solid strength (<em>+0.35 SG</em>).')}</p>

            <div class="ai-chart-card">
              <div class="ai-chart-header">
                <span class="mono-text">${t('BALANCE STROKES GAINED (VS HCP 5)','STROKES GAINED BALANCE (VS HCP 5)')}</span>
                <span class="ai-chart-unit">${t('SG / Ronda','SG / Round')}</span>
              </div>
              <div class="ai-chart-bars">
                <div class="ai-chart-row">
                  <span class="ai-bar-label">${t('Salidas (Tee)','Off the Tee')}</span>
                  <div class="ai-bar-track"><span class="ai-zero-line"></span><span class="ai-bar ai-bar-pos" style="width: 18%; left: 50%;"></span></div>
                  <strong class="ai-bar-val text-green">+0.35</strong>
                </div>
                <div class="ai-chart-row">
                  <span class="ai-bar-label">${t('Aproximación 120-160m','Approach 120-160m')}</span>
                  <div class="ai-bar-track"><span class="ai-zero-line"></span><span class="ai-bar ai-bar-neg" style="width: 44%; right: 50%;"></span></div>
                  <strong class="ai-bar-val text-red">−1.42</strong>
                </div>
                <div class="ai-chart-row">
                  <span class="ai-bar-label">${t('Juego Corto (<40m)','Short Game (<40m)')}</span>
                  <div class="ai-bar-track"><span class="ai-zero-line"></span><span class="ai-bar ai-bar-neg" style="width: 8%; right: 50%;"></span></div>
                  <strong class="ai-bar-val text-neutral">−0.15</strong>
                </div>
                <div class="ai-chart-row">
                  <span class="ai-bar-label">${t('Putting (3 a 6m)','Putting (3-6m)')}</span>
                  <div class="ai-bar-track"><span class="ai-zero-line"></span><span class="ai-bar ai-bar-neg" style="width: 28%; right: 50%;"></span></div>
                  <strong class="ai-bar-val text-red">−0.88</strong>
                </div>
              </div>
            </div>

            <div class="ai-actions-wrap">
              <span class="ai-actions-title">${t('EXPLORAR EN DETALLE:','EXPLORE IN DETAIL:')}</span>
              <div class="ai-action-chips">
                <button type="button" class="action-chip" data-ai-target="1">🎯 ${t('Ver dispersión Hierros 7 y 8','View 7 & 8 Iron Dispersion')}</button>
                <button type="button" class="action-chip" data-ai-target="2">📋 ${t('Generar rutina de práctica (45 min)','Generate 45-min Practice Routine')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 1: Dispersion Telemetry H7-H8 -->
      <div class="ai-scenario" id="ai-panel-1" role="tabpanel" aria-labelledby="ai-tab-1" tabindex="0" hidden>
        <div class="chat-msg chat-msg-user">
          <div class="chat-msg-avatar">👤</div>
          <div class="chat-bubble user-bubble">
            <p>${t('¿Por qué pierdo tantos golpes en aproximación con los hierros 7 y 8?','Why am I losing so many strokes on approach with 7 & 8 irons?')}</p>
          </div>
        </div>

        <div class="chat-msg chat-msg-agent">
          <div class="chat-msg-avatar agent-avatar">${brand()}</div>
          <div class="chat-bubble agent-bubble">
            <div class="agent-badge-row">
              <span class="agent-name">DATA2GAIN AI</span>
              <span class="agent-tag">${t('Telemetría de Radar','Radar Telemetry')}</span>
            </div>
            <p class="agent-text">${t('El radar detecta un patrón sistemático de <strong>fallo push a la derecha (+14 m)</strong> por cara abierta <em>+1.8° al impacto</em>. Solo logras un <strong>28% GIR</strong> frente al 58% de referencia HCP 5, costándote <em>−1.42 SG por vuelta</em>.','Radar detects a systematic <strong>push miss to the right (+14m)</strong> due to an open clubface <em>+1.8° at impact</em>. You achieve only <strong>28% GIR</strong> vs 58% HCP 5 benchmark, costing <em>−1.42 SG per round</em>.')}</p>

            <div class="ai-radar-card">
              <div class="ai-radar-header">
                <span class="mono-text">${t('TELEMETRÍA DE IMPACTO · HIERROS 7 Y 8','IMPACT TELEMETRY · 7 & 8 IRONS')}</span>
                <span class="ai-chart-unit">Radar D2G</span>
              </div>
              <div class="ai-radar-grid">
                <div class="ai-radar-stat">
                  <strong>28%</strong>
                  <span>${t('GIR (vs 58% HCP 5)','GIR (vs 58% HCP 5)')}</span>
                  <span class="badge-status badge-red">${t('Fuga crítica','Critical leak')}</span>
                </div>
                <div class="ai-radar-stat">
                  <strong>+14 m</strong>
                  <span>${t('Dispersión lateral push','Lateral push miss')}</span>
                  <span class="badge-status badge-red">${t('Fallo der.','Miss right')}</span>
                </div>
                <div class="ai-radar-stat">
                  <strong>142 m</strong>
                  <span>${t('Carry medio H7 (±3m)','Average H7 carry (±3m)')}</span>
                  <span class="badge-status badge-green">${t('Distancia sólida','Solid distance')}</span>
                </div>
                <div class="ai-radar-stat">
                  <strong>+1.8°</strong>
                  <span>${t('Cara abierta impacto','Open face at impact')}</span>
                  <span class="badge-status badge-neutral">${t('Ajustar cara','Face angle')}</span>
                </div>
              </div>

              <div class="ai-bias-wrap">
                <div class="ai-bias-meta">
                  <span>${t('← Izquierda (Pull)','← Left (Pull)')}</span>
                  <span>${t('Objetivo (0 m)','Target (0 m)')}</span>
                  <span class="text-red">${t('+14 m Derecha (Push) →','+14 m Right (Push) →')}</span>
                </div>
                <div class="ai-bias-track">
                  <span class="ai-bias-center"></span>
                  <span class="ai-bias-dot"></span>
                </div>
              </div>
            </div>

            <div class="ai-actions-wrap">
              <span class="ai-actions-title">${t('EXPLORAR EN DETALLE:','EXPLORE IN DETAIL:')}</span>
              <div class="ai-action-chips">
                <button type="button" class="action-chip" data-ai-target="2">📋 ${t('Diseñar rutina de corrección H7-H8','Design 7-8 Iron Correction Drill')}</button>
                <button type="button" class="action-chip" data-ai-target="0">⚖️ ${t('Volver al balance general SG','Return to SG Balance')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario 2: Practice Routine 45 Min -->
      <div class="ai-scenario" id="ai-panel-2" role="tabpanel" aria-labelledby="ai-tab-2" tabindex="0" hidden>
        <div class="chat-msg chat-msg-user">
          <div class="chat-msg-avatar">👤</div>
          <div class="chat-bubble user-bubble">
            <p>${t('Diseña una sesión de práctica de 45 min para corregir la fuga antes del fin de semana.','Design a 45-min practice session to fix these leaks before the weekend.')}</p>
          </div>
        </div>

        <div class="chat-msg chat-msg-agent">
          <div class="chat-msg-avatar agent-avatar">${brand()}</div>
          <div class="chat-bubble agent-bubble">
            <div class="agent-badge-row">
              <span class="agent-name">DATA2GAIN AI</span>
              <span class="agent-tag">${t('Prescripción de Práctica','Practice Prescription')}</span>
            </div>
            <p class="agent-text">${t('Sesión dividida en 2 bloques de alta intensidad enfocados exactamente en tus mayores fugas telemétricas para recuperar hasta <strong>+2.3 golpes por vuelta</strong>.','Structured 2-block high-intensity session targeting your exact telemetry leaks to recover up to <strong>+2.3 strokes per round</strong>.')}</p>

            <div class="ai-practice-card">
              <div class="ai-practice-list">
                <div class="ai-drill-card">
                  <div class="ai-drill-head">
                    <span class="ai-drill-tag">⏱️ ${t('BLOQUE 1 · 25 MIN (RADAR H7-H8)','BLOCK 1 · 25 MIN (7-8 IRONS)')}</span>
                    <span class="ai-drill-target">${t('Objetivo: ≥5/7 diana','Goal: ≥5/7 on target')}</span>
                  </div>
                  <strong class="ai-drill-title">${t('Calibración de ángulo de cara a 140 metros','Clubface angle calibration to 140m targets')}</strong>
                  <span class="ai-drill-desc">${t('3 series de 7 bolas con foco en cuadrar cara al impacto. Erradicar la dispersión push hacia la derecha.','3 sets of 7 shots focusing on squaring clubface at impact to eliminate lateral push dispersion.')}</span>
                </div>

                <div class="ai-drill-card">
                  <div class="ai-drill-head">
                    <span class="ai-drill-tag">⛳ ${t('BLOQUE 2 · 20 MIN (GREEN LADDER)','BLOCK 2 · 20 MIN (GREEN LADDER)')}</span>
                    <span class="ai-drill-target">${t('Objetivo: 0 tripateos','Goal: 0 3-putts')}</span>
                  </div>
                  <strong class="ai-drill-title">${t('Test ladder de velocidad en 4, 5 y 6 metros','Speed control ladder test at 4, 5 and 6 meters')}</strong>
                  <span class="ai-drill-desc">${t('10 putts alternando distancias. Criterio de éxito: ninguna bola puede quedar corta ni rebasar los 50 cm del hoyo.','10 putts alternating distances. Success criteria: no putt left short or beyond 2 feet past the cup.')}</span>
                </div>
              </div>
            </div>

            <div class="ai-actions-wrap">
              <span class="ai-actions-title">${t('EXPLORAR EN DETALLE:','EXPLORE IN DETAIL:')}</span>
              <div class="ai-action-chips">
                <button type="button" class="action-chip" data-ai-target="0">⚖️ ${t('Volver al balance general SG','Return to SG Balance')}</button>
                <button type="button" class="action-chip" data-ai-target="1">🎯 ${t('Ver telemetría de Hierros 7 y 8','View 7 & 8 Iron Dispersion')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Prompt Input Bar -->
    <div class="ai-console-footer">
      <div class="ai-input-box" role="button" tabindex="0" aria-label="${t('Siguiente consulta interactiva','Next interactive query')}">
        <span class="input-placeholder" data-ai-placeholder>${t('Preguntar sobre tus rondas, palos o estrategia...','Ask any question about your rounds, clubs or strategy...')}</span>
        <button type="button" class="ai-send-btn" aria-label="${t('Siguiente consulta','Next query')}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 14-7-4 14-3-4-7-3z"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

function ai() {
  return `<section class="section section-light ai-section" id="agente"><div class="container ai-grid"><div>
    ${eyebrow(t('El agente IA de Data2Gain · Caddie Inteligente','The Data2Gain AI agent · Smart Caddie'))}
    <h2>${t('Pregunta mejor.<br><em>Entrena con foco.</em>','Ask better questions.<br><em>Practice with focus.</em>')}</h2>
    <p>${t('Conecta tus preguntas con el análisis de tus rondas. El agente de Data2Gain te ayuda a interpretar los datos, identifica fugas críticas con gráficos y tablas, y te recomienda qué trabajar después.','Connect your questions with your round analysis. The Data2Gain agent helps you interpret the data, spots critical leaks with charts and tables, and recommends what to work on next.')}</p>
    <a class="text-link" href="${app}" data-track="app_open">${t('Probar el agente IA en la app','Try the AI agent in the app')}${arrow}</a>
  </div>
  <div class="ai-scroll-track" id="ai-track">
    <div class="ai-sticky-stage">
      ${aiConsole()}
    </div>
  </div>
  </div></section>`;
}

function pricing() {
  return `<section class="section section-light pricing-section" id="precios"><div class="container"><div class="section-heading"><div>${eyebrow(t('Tu siguiente paso','Your next step'))}<h2>${t('Empieza por<br>entender tu juego.','Start by<br>understanding your game.')}</h2></div><p>${t('Elige el camino que encaja contigo.','Choose the path that fits you.')}</p></div><div class="pricing-grid"><article class="price-card"><div class="price-card-top"><span class="eyebrow">${t('Para jugadores','For players')}</span><span class="plan-badge">DATA2GAIN PRO</span></div><p class="price">${t('8,95 €','€8.95')}<span>${t('/ mes','/ month')}</span></p><p>${t('Todas las funciones PRO en un solo plan.','All PRO features in one plan.')}</p><ul class="check-list">${[t('Análisis Strokes Gained avanzado','Advanced Strokes Gained analysis'),t('Dispersión y distancias reales por palo','Real club dispersion and carry distances'),t('Agente IA interactivo y análisis de tus rondas','Interactive AI agent and round analysis'),t('Cancela cuando quieras sin permanencia','Cancel anytime with no commitment')].map(text=>`<li>${check}${text}</li>`).join('')}</ul>${link(app,t('Empezar con Data2Gain','Get started with Data2Gain'),'dark','app_open')}<p class="price-note">${t('Suscripción mensual. Cancela cuando quieras.','Monthly subscription. Cancel anytime.')}</p></article>
  
  <article class="price-card price-coaches"><div class="price-card-top"><span class="eyebrow">${t('Para coaches y academias','For coaches & academies')}</span><span class="plan-badge plan-badge-free">${t('100% GRATIS','100% FREE')}</span></div><p class="price price-free">${t('0 €','€0')}<span>${t('gratis para siempre','free forever')}</span></p><p>${t('La plataforma completa para entrenadores, sin coste y con acceso inmediato. Sin solicitar demos ni esperas.','The complete coaching platform at zero cost with instant access. No demo requests, no delays.')}</p><ul class="check-list">${[t('Plataforma completa para coaches 100% gratuita','Complete coaching platform 100% free'),t('Monitorización y análisis de alumnos ilimitados','Unlimited player tracking and telemetry'),t('Informes de dispersión, distancias y Strokes Gained','Dispersion, distance and Strokes Gained reports'),t('Acceso directo e inmediato (sin solicitar demo)','Instant direct access (no demo required)')].map(text=>`<li>${check}${text}</li>`).join('')}</ul>${link(app,t('Crear cuenta de coach gratis','Create free coach account'),'gold','coach_signup')}<p class="price-note">${t('Acceso inmediato para entrenadores e instructores de golf.','Instant access for golf coaches and instructors.')}</p></article></div></div></section>`;
}

function faq() {
  const items = [
    [t('¿Necesito saber de estadística?','Do I need to understand statistics?'),t('No. Strokes Gained pone tu rendimiento en contexto: un valor positivo indica golpes ganados frente a la referencia y uno negativo, golpes perdidos. Los gráficos interactivos, tablas y el agente IA te ayudan a interpretar el análisis de forma visual y directa.','No. Strokes Gained puts your performance into context: a positive value means strokes gained against your benchmark; a negative value means strokes lost. Interactive charts, tables and the AI agent help you interpret the analysis in a clear, direct way.')],
    [t('¿Cuánto cuesta Data2Gain para coaches?','How much does Data2Gain cost for coaches?'),t('Para coaches y academias de golf la plataforma es 100% gratuita. No tienes que solicitar demostraciones ni pagar cuotas mensuales. Puedes darte de alta de forma inmediata en la app web y empezar a supervisar las rondas y la telemetría de tus alumnos sin barreras.','For golf coaches and academies the platform is 100% free. You do not need to request demos or pay monthly fees. You can sign up immediately in the web app and start tracking player telemetry with zero friction.')],
    [t('¿Cómo empiezo a usar Data2Gain como jugador?','How do I start using Data2Gain as a player?'),t('Accede a la app web en app.data2gain.com, sigue el proceso de alta y añade tus rondas. Puedes probar la analítica y suscribirte a Data2Gain PRO por solo 8,95 €/mes, cancelable cuando quieras.','Open the web app at app.data2gain.com, sign up and add your rounds. You can explore the analytics and subscribe to Data2Gain PRO for just €8.95/month, cancelable anytime.')],
    [t('¿Dónde puedo utilizar Data2Gain?','Where can I use Data2Gain?'),t('Puedes utilizar Data2Gain en su Web App (accesible desde cualquier navegador en móvil, tablet u ordenador en app.data2gain.com) y en sus aplicaciones nativas para Android y Apple (iOS).','You can use Data2Gain via its Web App (accessible from any browser on phone, tablet or desktop at app.data2gain.com) and in native apps for Android and Apple (iOS).')]
  ];
  return `<section class="section section-light faq-section"><div class="container faq-grid"><div>${eyebrow(t('Antes de empezar','Before you begin'))}<h2>${t('Preguntas<br>frecuentes.','Frequently asked<br>questions.')}</h2><p>${t('Si te queda alguna duda, hablamos.','If you have another question, get in touch.')}</p><a class="text-link" href="mailto:info@data2gain.com">info@data2gain.com${diagonal}</a></div><div class="faq-list">${items.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></div></section>`;
}

function closing(page) {
  const coach = page === 'coaches';
  return `<section class="closing"><div class="container closing-inner">
    ${eyebrow(coach ? t('100% Gratis para coaches y academias','100% Free for coaches & academies') : t('El próximo golpe empieza aquí','Your next shot starts here'))}
    <h2>${coach ? t('Tu criterio profesional.<br><em>Ahora con datos de Tour.</em>','Your coaching expertise.<br><em>Now with Tour data.</em>') : t('Juega con intuición.<br><em>Decide con datos.</em>','Play with intuition.<br><em>Decide with data.</em>')}</h2>
    <div class="hero-actions">${coach ? link(app, t('Acceder Gratis como Coach','Get Free Coach Access'), 'gold', 'coach_app') : link(route('players'), t('Soy jugador','I am a player'), 'gold', 'audience_players') + link(route('coaches'), t('Soy coach (Gratis)','I am a coach (Free)'), 'outline', 'audience_coaches')}</div>
  </div></section>`;
}

function coachContent() {
  const blocks = [
    [t('Antes de la sesión','Before the session'),t('Llega con una perspectiva más completa.','Start with a clearer picture.'),t('Las rondas ponen contexto a lo que ves en la práctica. Explora los patrones de juego y detecta los temas que merece la pena trabajar juntos.','Rounds give context to what you see in practice. Explore patterns and identify the topics worth working on together.')],
    [t('Durante la sesión','During the session'),t('Haz visible tu explicación.','Make your explanation visible.'),t('Apóyate en distancias, dispersión y Strokes Gained para explicar una prioridad. Los datos acompañan tu criterio profesional.','Use distances, dispersion and Strokes Gained to explain a priority. Data supports your professional judgement.')],
    [t('Después de la sesión','After the session'),t('Vuelve a los datos. Revisa el progreso.','Return to the data. Review progress.'),t('Usa las nuevas rondas como punto de partida para la siguiente conversación y ajusta el foco del entrenamiento.','Use new rounds as a starting point for your next conversation and adjust the focus of practice.')]
  ];
  return `<section class="section section-light" id="enfoque"><div class="container"><div class="section-heading"><div>${eyebrow(t('Datos al servicio del coaching','Data in service of coaching'))}<h2>${t('La conversación cambia<br>cuando ves el juego.','The conversation changes<br>when you can see the game.')}</h2></div></div><div class="coach-steps">${blocks.map(([k,h,p],i)=>`<article class="coach-step-card"><div class="coach-step-header"><span class="coach-step-num">0${i+1}</span><strong class="coach-step-phase">${k}</strong></div><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></div></section>
  <section class="section coach-product"><div class="container ai-grid"><div>${eyebrow(t('Una referencia compartida','A shared reference'))}<h2>${t('Sus datos.<br>Tu experiencia.','Their data.<br>Your experience.')}</h2><p>${t('El análisis de dispersión ayuda a poner una imagen a las tendencias de cada palo. Una herramienta para conversar, priorizar y trabajar con el jugador.','Dispersion analysis helps put a picture to each club’s tendencies. A tool for conversation, priorities and working with your player.')}</p><p class="demo-label">${t('Plataforma 100% gratuita para entrenadores. Sin solicitud de demos ni esperas.','100% free platform for coaches. No demo requests, no delays.')}</p>${link(app,t('Acceder Gratis como Coach','Get Free Coach Access'),'gold','coach_app')}</div><div class="coach-screen">${screenshot('screen-dispersion',t('Análisis de dispersión del jugador','Player dispersion analysis'))}</div></div></section>
  <section class="section section-light"><div class="container"><div class="section-heading"><div>${eyebrow(t('Servicios especializados opcionales','Optional specialized services'))}<h2>${t('Del análisis<br>a tu método.','From analysis<br>to your method.')}</h2><p>${t('La plataforma es 100% gratuita para coaches. Si además deseas acompañamiento personalizado:','The platform is 100% free for coaches. If you also want personalized support:')}</p></div></div><div class="services-list">${[[t('Consultoría Estratégica','Strategic Consulting'),t('Te ayudamos a interpretar los datos y a incorporarlos a la planificación de alto rendimiento con tus jugadores.','Get help interpreting data and bringing it into high-performance planning with your players.')],[t('Formación y Workshops','Workshops & Training'),t('Sesiones para academias que quieren integrar Strokes Gained y análisis predictivo en su enseñanza.','Sessions for academies looking to integrate Strokes Gained and predictive analytics into their coaching.')]].map(([h,p],i)=>`<article><span class="service-number">0${i+1}</span><div><h3>${h}</h3><p>${p}</p></div><a class="text-link" href="${mail(h)}" data-track="coach_contact">${t('Consultar por email','Enquire by email')}${diagonal}</a></article>`).join('')}</div></div></section>`;
}

function info() {
  return `<section class="section section-light info-page"><div class="container narrow">${eyebrow('Data2Gain')}<h1>${t('Información<br>y contacto.','Information<br>& contact.')}</h1><p class="lead">${t('Un punto de contacto para tus preguntas sobre Data2Gain.','A point of contact for your questions about Data2Gain.')}</p><article><h2>${t('Contacta con nosotros','Get in touch')}</h2><p>${t('Para información sobre la app, formación, condiciones de servicio o privacidad, escribe a','For information about the app, training, service terms or privacy, email')} <a href="mailto:info@data2gain.com">info@data2gain.com</a>.</p></article><article><h2>${t('Esta web y la aplicación','This website and the application')}</h2><p>${t('Esta web presenta Data2Gain y ejemplos de sus análisis. El acceso a la plataforma y la contratación se realizan en la aplicación. Revisa allí las condiciones aplicables antes de contratar.','This website presents Data2Gain and examples of its analysis. Platform access and subscriptions take place in the application. Review the applicable terms there before subscribing.')}</p>${link(app,t('Ir a la aplicación','Open the application'),'dark','app_open')}</article><article><h2>${t('Navegación y privacidad','Browsing and privacy')}</h2><p>${t('Los controles de demostración funcionan en tu navegador y no envían los valores seleccionados a un servidor. Esta versión de la web no incorpora formularios, cookies analíticas ni rastreadores publicitarios. Al contactar por email o acceder a la aplicación se abre un servicio distinto.','Demo controls run in your browser and do not send selected values to a server. This version of the website has no forms, analytics cookies or advertising trackers. Email contact and application links open a separate service.')}</p><p>${t('Para consultar la información legal completa o ejercer una solicitud sobre tus datos, contacta con info@data2gain.com.','For full legal information or requests concerning your data, contact info@data2gain.com.')}</p></article><article><h2>${t('Sobre las demostraciones','About the demonstrations')}</h2><p>${t('El mapa del hoyo es una simulación conceptual externa que no forma parte de la app. El comparador de Strokes Gained y la simulación de la conversación de IA contienen datos ilustrativos. No son un diagnóstico personal ni una garantía de mejora. Las fotografías ilustran la práctica del golf y no representan testimonios ni avales de sus protagonistas.','The hole map is an external conceptual simulation not included in the app. The Strokes Gained benchmark and AI conversation simulation contain illustrative data. They are not a personal assessment or a guarantee of improvement. Photos illustrate golf and do not represent testimonials or endorsements by the people pictured.')}</p></article><article><h2>${t('Créditos de fotografía','Photography credits')}</h2><p><a href="https://unsplash.com/photos/bJkezZ4W_So">Braden Egli / Unsplash</a> · <a href="https://www.pexels.com/photo/1325652/">Jopwell / Pexels</a>.</p></article></div></section>`;
}

function document(page) {
  const titles = { home:t('Data2Gain | Tu juego. Tus datos. Tu ventaja.','Data2Gain | Your game. Your data. Your advantage.'), players:t('Data2Gain para jugadores | Entiende tu golf','Data2Gain for players | Understand your golf'), coaches:t('Data2Gain para coaches y academias (100% Gratis)','Data2Gain for coaches & academies (100% Free)'), info:t('Información y contacto | Data2Gain','Information & contact | Data2Gain') };
  const description = page === 'coaches' ? t('Analítica de golf avanzada 100% gratuita para coaches y academias. Strokes Gained, dispersión y telemetría de tus alumnos sin coste.','Advanced golf analytics 100% free for coaches and academies. Strokes Gained, dispersion and player telemetry at zero cost.') : t('Encuentra el patrón. Telemetría de Tour, dispersión real y análisis con IA para transformar tus datos en mejores decisiones en el campo.','Find the pattern. Tour telemetry, true dispersion and AI analysis to turn your data into better on-course decisions.');
  const content = page === 'home' ? hero(page)+how()+audiences()+strategy()+product()+ai()+pricing()+faq()+closing(page) : page === 'players' ? hero(page)+how()+benchmark()+product()+ai()+pricing()+faq()+closing(page) : page === 'coaches' ? hero(page)+coachContent()+closing(page) : info();
  const schema = { '@context':'https://schema.org', '@type': page === 'info' ? 'ContactPage' : 'WebPage', name:titles[page], description, url:origin+route(page), inLanguage:lang, isPartOf:{'@type':'WebSite',name:'Data2Gain',url:origin} };
  return `<!doctype html>\n<html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titles[page]}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#101412"><link rel="canonical" href="${origin+route(page)}"><link rel="alternate" hreflang="es" href="${origin+route(page,'es')}"><link rel="alternate" hreflang="en" href="${origin+route(page,'en')}"><link rel="alternate" hreflang="x-default" href="${origin+route(page,'es')}"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site-${lang}.webmanifest"><meta property="og:type" content="website"><meta property="og:title" content="${titles[page]}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin+route(page)}"><meta property="og:image" content="https://data2gain.com/assets/hero-hole-sg.jpg"><meta property="og:locale" content="${lang==='es'?'es_ES':'en_US'}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${titles[page]}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="https://data2gain.com/assets/hero-hole-sg.jpg"><link rel="stylesheet" href="/css/premium.css?v=6"><script type="application/ld+json">${JSON.stringify(schema)}</script><script type="module" src="/js/premium.js?v=4"></script></head><body class="page-${page}">${header(page)}<main id="main">${content}</main>${footer()}</body></html>\n`;
}

await mkdir(path.join(root,'dist'),{recursive:true});
const publicPages = [];
for (const locale of ['es','en']) {
  lang=locale;
  for (const page of Object.keys(slugs[locale])) {
    const relative=`${locale}/${slugs[locale][page]}index.html`;
    const html=document(page);
    for (const base of [root,path.join(root,'dist')]) {
      await mkdir(path.dirname(path.join(base,relative)),{recursive:true});
      await writeFile(path.join(base,relative),html);
    }
    publicPages.push(route(page));
    if(locale==='es' && page==='home') {
      const rootHtml = html.replace('<head>', '<head><script>(function(){try{var s=localStorage.getItem("d2g_lang");var es=false;if(s==="es")es=true;else if(s==="en")es=false;else{var l=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||navigator.userLanguage||""];var ei=-1,ni=-1;for(var i=0;i<l.length;i++){var c=(l[i]||"").toLowerCase();if(ei===-1&&(c==="es"||c.indexOf("es-")===0||c.indexOf("es_")===0))ei=i;if(ni===-1&&(c==="en"||c.indexOf("en-")===0||c.indexOf("en_")===0))ni=i;}es=(ei!==-1&&(ni===-1||ei<=ni));}var target=es?"/es/":"/en/";var dest=target+window.location.search+window.location.hash;if(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")){window.location.replace(dest);}}catch(e){}})();</script>');
      for(const base of [root,path.join(root,'dist')]) await writeFile(path.join(base,'index.html'),rootHtml);
    }
  }
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPages.map(p=>`<url><loc>${origin+p}</loc></url>`).join('')}</urlset>\n`;
const robots=`User-agent: *\nAllow: /\nDisallow: /backups/\nDisallow: /scripts/\nDisallow: /tests/\nSitemap: ${origin}/sitemap.xml\n`;
for (const base of [root,path.join(root,'dist')]) {
  await writeFile(path.join(base,'sitemap.xml'),sitemap);
  await writeFile(path.join(base,'robots.txt'),robots);
}
for (const dir of ['assets','css','js']) await cp(path.join(root,dir),path.join(root,'dist',dir),{recursive:true});
for (const filename of (await readdir(root)).filter(n=>/^(favicon.*|apple-touch-icon\.png|icon-.*\.png|site-.*\.webmanifest|\.htaccess)$/.test(n))) await cp(path.join(root,filename),path.join(root,'dist',filename));
console.log(`Built ${publicPages.length} localized pages + Spanish root. Public output: dist/`);
