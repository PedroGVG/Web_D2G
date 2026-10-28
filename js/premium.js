import { compareRound } from './demo-data.mjs';

const language=document.documentElement.lang==='en'?'en':'es';
const t=(es,en)=>language==='es'?es:en;
// Measurement hook only: no analytics service, storage, or network transmission.
// A site owner can subscribe to this event after selecting an analytics setup.
function track(name, properties={}) {
  window.dispatchEvent(new CustomEvent('d2g:interaction',{detail:{name,locale:language,path:location.pathname,...properties}}));
}
document.querySelectorAll('[data-track]').forEach(link=>link.addEventListener('click',()=>track(link.dataset.track)));

const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
const mobile=window.matchMedia('(max-width:760px)');
function setMenu(open, restoreFocus=false){
  menuButton?.setAttribute('aria-expanded',String(open));
  menuButton?.setAttribute('aria-label',open?t('Cerrar menú','Close menu'):t('Abrir menú','Open menu'));
  nav?.classList.toggle('is-open',open);
  if(restoreFocus)menuButton?.focus();
}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav?.classList.contains('is-open'))setMenu(false,true)});
document.addEventListener('click',event=>{if(nav?.classList.contains('is-open')&&!event.target.closest('.site-header'))setMenu(false)});
nav?.addEventListener('focusout',event=>{if(event.relatedTarget&&!event.relatedTarget.closest('.site-header'))setMenu(false)});
mobile.addEventListener('change',()=>setMenu(false));

const strategyData={
  controlled:{
    pinTee:t('Madera 3 · 240 yd','3-Wood · 240 yd'),
    pinLandingTag:t('0% riesgo de agua','0% water risk'),
    pinLandingTagClass:'tactical-badge tag-green',
    pinLanding:t('Calle ancha · margen total','Wide fairway · full margin'),
    pinGreenTag:t('+0.42 SG vs. campo','+0.42 SG vs field'),
    pinGreenTagClass:'tactical-badge tag-green',
    pinGreen:t('Centro del green → par asegurado','Green center → safe par'),
    summaryTee:t('100% calle (0% agua)','100% fairway (0% water)'),
    summaryTeeClass:'text-green',
    summaryApproach:t('Hierro 7 a centro','7-Iron to center'),
    summaryScore:t('Par seguro (+0.42 SG)','Safe par (+0.42 SG)'),
    summaryScoreClass:'text-green'
  },
  aggressive:{
    pinTee:t('Driver · 280 yd forzado','Forced driver · 280 yd'),
    pinLandingTag:t('32% de dispersión al agua','32% dispersion to water'),
    pinLandingTagClass:'tactical-badge tag-red',
    pinLanding:t('Calle estrecha · riesgo alto','Narrow fairway · high risk'),
    pinGreenTag:t('−0.65 SG vs. campo','−0.65 SG vs field'),
    pinGreenTagClass:'tactical-badge tag-red',
    pinGreen:t('Bandera corta → riesgo de bogey','Tucked pin → high bogey risk'),
    summaryTee:t('32% riesgo de agua (−1.82 SG)','32% water hazard (−1.82 SG)'),
    summaryTeeClass:'text-red',
    summaryApproach:t('Wedge forzado a bandera','Forced wedge to pin'),
    summaryScore:t('Bogey o peor (−0.65 SG)','Bogey or worse (−0.65 SG)'),
    summaryScoreClass:'text-red'
  }
};

let currentStrategy='controlled';
let isManualScrollLocked=false;
let manualScrollTimer=null;

function applyStrategy(key,fromScroll=false){
  if(key===currentStrategy && fromScroll)return;
  currentStrategy=key;
  const data=strategyData[key];
  if(!data)return;

  document.querySelectorAll('[data-strategy]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.strategy===key)));
  const visual=document.querySelector('[data-course-strategy]');
  if(visual)visual.dataset.courseStrategy=key;

  const pinTee=document.querySelector('[data-pin-tee]');
  if(pinTee)pinTee.textContent=data.pinTee;

  const pinLandingTag=document.querySelector('[data-pin-landing-tag]');
  if(pinLandingTag){
    pinLandingTag.textContent=data.pinLandingTag;
    pinLandingTag.className=data.pinLandingTagClass;
  }
  const pinLanding=document.querySelector('[data-pin-landing]');
  if(pinLanding)pinLanding.textContent=data.pinLanding;

  const pinGreenTag=document.querySelector('[data-pin-green-tag]');
  if(pinGreenTag){
    pinGreenTag.textContent=data.pinGreenTag;
    pinGreenTag.className=data.pinGreenTagClass;
  }
  const pinGreen=document.querySelector('[data-pin-green]');
  if(pinGreen)pinGreen.textContent=data.pinGreen;

  const summaryTee=document.querySelector('[data-summary-tee]');
  if(summaryTee){
    summaryTee.textContent=data.summaryTee;
    summaryTee.className=data.summaryTeeClass;
  }
  const summaryApproach=document.querySelector('[data-summary-approach]');
  if(summaryApproach)summaryApproach.textContent=data.summaryApproach;

  const summaryScore=document.querySelector('[data-summary-score]');
  if(summaryScore){
    summaryScore.textContent=data.summaryScore;
    summaryScore.className=data.summaryScoreClass;
  }

  track('strategy_change',{strategy:key,trigger:fromScroll?'scroll':'click'});
}

const strategyTrack=document.getElementById('strategy-track');

document.querySelectorAll('[data-strategy]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.strategy;
  isManualScrollLocked=true;
  clearTimeout(manualScrollTimer);
  applyStrategy(key,false);

  if(strategyTrack){
    const rect=strategyTrack.getBoundingClientRect();
    const scrollTop=window.scrollY||window.pageYOffset;
    const headerOffset=window.innerWidth<=760?72:88;
    const totalScroll=strategyTrack.offsetHeight-window.innerHeight;
    if(totalScroll>0){
      const targetProgress=key==='controlled'?0.15:0.85;
      const targetY=scrollTop+rect.top-headerOffset+(totalScroll*targetProgress);
      window.scrollTo({top:targetY,behavior:'smooth'});
    }
  }

  manualScrollTimer=setTimeout(()=>{
    isManualScrollLocked=false;
  },800);
}));

if(strategyTrack){
  let ticking=false;
  function onStrategyScroll(){
    if(isManualScrollLocked)return;
    const rect=strategyTrack.getBoundingClientRect();
    const headerOffset=window.innerWidth<=760?72:88;
    const totalScroll=strategyTrack.offsetHeight-window.innerHeight;
    if(totalScroll<=0)return;

    const scrolled=headerOffset-rect.top;
    const progress=scrolled/totalScroll;

    if(progress>0.52){
      applyStrategy('aggressive',true);
    }else if(progress<0.48){
      applyStrategy('controlled',true);
    }
  }

  window.addEventListener('scroll',()=>{
    if(!ticking){
      window.requestAnimationFrame(()=>{
        onStrategyScroll();
        ticking=false;
      });
      ticking=true;
    }
  },{passive:true});
}

const tabs=[...document.querySelectorAll('[data-product-tab]')];
let currentProductIndex=0;
let isProductManualScrollLocked=false;
let productManualScrollTimer=null;
const productTrack=document.getElementById('product-track');

function activateProduct(index,focus=false,fromScroll=false){
  if(index===currentProductIndex && fromScroll)return;
  currentProductIndex=index;
  tabs.forEach((tab,i)=>{
    const selected=i===index;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    const panel=document.getElementById(tab.getAttribute('aria-controls'));
    if(panel)panel.hidden=!selected;
  });
  if(focus)tabs[index]?.focus({preventScroll:true});
  track('product_view',{feature:tabs[index]?.dataset.productTab,trigger:fromScroll?'scroll':'click'});
}

function selectProductTab(index,focus=false){
  isProductManualScrollLocked=true;
  clearTimeout(productManualScrollTimer);
  activateProduct(index,focus);

  if(productTrack){
    const rect=productTrack.getBoundingClientRect();
    const scrollTop=window.scrollY||window.pageYOffset;
    const headerOffset=window.innerWidth<=760?72:88;
    const totalScroll=productTrack.offsetHeight-window.innerHeight;
    if(totalScroll>0){
      const targetProgress=index===0?0.12:index===1?0.50:0.88;
      const targetY=scrollTop+rect.top-headerOffset+(totalScroll*targetProgress);
      window.scrollTo({top:targetY,behavior:'smooth'});
    }
  }

  productManualScrollTimer=setTimeout(()=>{
    isProductManualScrollLocked=false;
  },750);
}

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>{
    selectProductTab(index);
  });
  tab.addEventListener('keydown',event=>{
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();
    selectProductTab(next,true);
  });
});

if(productTrack){
  let productTicking=false;
  function onProductScroll(){
    if(isProductManualScrollLocked)return;
    const rect=productTrack.getBoundingClientRect();
    const headerOffset=window.innerWidth<=760?72:88;
    const totalScroll=productTrack.offsetHeight-window.innerHeight;
    if(totalScroll<=0)return;

    const progress=(headerOffset-rect.top)/totalScroll;

    let targetTab=currentProductIndex;
    if(progress<0.28)targetTab=0;
    else if(progress>=0.66)targetTab=2;
    else if(currentProductIndex===0 && progress>=0.33)targetTab=1;
    else if(currentProductIndex===2 && progress<0.62)targetTab=1;

    if(targetTab!==currentProductIndex)activateProduct(targetTab,false,true);
  }

  window.addEventListener('scroll',()=>{
    if(!productTicking){
      window.requestAnimationFrame(()=>{
        onProductScroll();
        productTicking=false;
      });
      productTicking=true;
    }
  },{passive:true});

  onProductScroll();
}

// Mobile: the statistics gallery is wider than the screen. The first time it comes into view,
// slide it to the next screenshot and back so it is clear that it can be swiped.
const gallery=document.querySelector('.screenshot-gallery');
if(gallery && 'IntersectionObserver' in window){
  const galleryObserver=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    if(!mobile.matches || gallery.scrollWidth<=gallery.clientWidth)return;
    galleryObserver.disconnect();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const next=gallery.children[1];
    let returned=false;
    const slideBack=()=>{
      if(returned)return;
      returned=true;
      setTimeout(()=>gallery.scrollTo({left:0,behavior:'smooth'}),700);
    };
    setTimeout(()=>{
      gallery.addEventListener('scrollend',slideBack,{once:true});
      gallery.scrollTo({left:next?next.offsetLeft-gallery.offsetLeft:gallery.clientWidth*.7,behavior:'smooth'});
      setTimeout(slideBack,1500);
    },500);
  },{threshold:.6});
  galleryObserver.observe(gallery);
}

const selector=document.getElementById('benchmark-select');
selector?.addEventListener('change',()=>{
  selector.classList.remove('pulse-heartbeat');
  const { values,focus }=compareRound(selector.value);
  const reference=selector.selectedOptions[0].textContent;
  document.querySelector('[data-benchmark-label]').textContent=`VS ${reference}`;
  values.forEach((value,i)=>{
    document.querySelector(`[data-sg-value="${i}"]`).textContent=`${value>0?'+':''}${value.toFixed(2)}`;
    const bar=document.querySelector(`[data-sg-bar="${i}"]`);
    bar.style.setProperty('--bar-size',`${Math.min(Math.abs(value)/2*50,50)}%`);
    bar.classList.toggle('negative',value<0);bar.classList.toggle('positive',value>=0);
  });
  const areas=language==='es'?['las salidas','la aproximación','el juego corto','el putting']:['off-the-tee play','approach play','the short game','putting'];
  document.querySelector('[data-benchmark-insight]').textContent=values[focus]<0?t(`Frente a ${reference}, ${areas[focus]} es el área con más margen en esta ronda de ejemplo.`,`Against ${reference}, ${areas[focus]} offers the most room for improvement in this sample round.`):t(`En esta ronda de ejemplo, todas las áreas superan la referencia ${reference}. Cambia de nivel para explorar la comparación.`,`In this sample round, every area is above the ${reference} benchmark. Change the level to explore the comparison.`);
  track('benchmark_change',{reference:selector.value});
});

const dialog=document.querySelector('.image-dialog');
let zoomTrigger;
document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
  if(!dialog?.showModal)return;
  const image=dialog.querySelector('img');
  image.src=button.dataset.zoom;image.alt=button.querySelector('img').alt;
  dialog.querySelector('#image-dialog-title').textContent=image.alt;
  zoomTrigger=button;dialog.showModal();
  document.querySelector('.dialog-close').focus();
  track('screenshot_expand');
}));
dialog?.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});
dialog?.addEventListener('close',()=>zoomTrigger?.focus());

// Language preference persistence & smart language suggestion
function initLanguagePreferences() {
  document.querySelectorAll('.languages a[lang]').forEach(link => {
    link.addEventListener('click', () => {
      const chosen = link.getAttribute('lang');
      if (chosen === 'es' || chosen === 'en') {
        try {
          localStorage.setItem('d2g_lang', chosen);
          document.cookie = `d2g_lang=${chosen};path=/;max-age=31536000;SameSite=Lax`;
        } catch (e) {}
      }
    });
  });

  try {
    const saved = localStorage.getItem('d2g_lang');
    const dismissed = sessionStorage.getItem('d2g_lang_dismissed');
    if (!saved && !dismissed) {
      const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || ''];
      let esIdx = -1, enIdx = -1;
      for (let i = 0; i < langs.length; i++) {
        const c = (langs[i] || '').toLowerCase();
        if (esIdx === -1 && (c === 'es' || c.indexOf('es-') === 0 || c.indexOf('es_') === 0)) esIdx = i;
        if (enIdx === -1 && (c === 'en' || c.indexOf('en-') === 0 || c.indexOf('en_') === 0)) enIdx = i;
      }
      const preferred = (esIdx !== -1 && (enIdx === -1 || esIdx <= enIdx)) ? 'es' : 'en';
      if (preferred !== language) {
        const altLink = document.querySelector(`.languages a[lang="${preferred}"]`);
        if (altLink) {
          const banner = document.createElement('aside');
          banner.className = 'lang-notice';
          banner.setAttribute('role', 'status');
          banner.setAttribute('aria-live', 'polite');
          const isEnTarget = preferred === 'en';
          const msg = isEnTarget
            ? 'This page is in Spanish. Would you like to view it in English?'
            : 'Esta página está en inglés. ¿Deseas verla en español?';
          const btnText = isEnTarget ? 'View in English' : 'Ver en español';
          banner.innerHTML = `
            <div class="container lang-notice-inner">
              <span class="lang-notice-msg">${msg}</span>
              <div class="lang-notice-actions">
                <a class="lang-notice-btn" href="${altLink.getAttribute('href')}">${btnText}</a>
                <button type="button" class="lang-notice-close" aria-label="${isEnTarget ? 'Dismiss' : 'Cerrar'}">✕</button>
              </div>
            </div>
          `;
          banner.querySelector('.lang-notice-btn')?.addEventListener('click', () => {
            try {
              localStorage.setItem('d2g_lang', preferred);
              document.cookie = `d2g_lang=${preferred};path=/;max-age=31536000;SameSite=Lax`;
            } catch (e) {}
          });
          banner.querySelector('.lang-notice-close')?.addEventListener('click', () => {
            banner.remove();
            try { sessionStorage.setItem('d2g_lang_dismissed', '1'); } catch (e) {}
          });
          document.body.prepend(banner);
        }
      }
    }
  } catch (e) {}
}
initLanguagePreferences();

// Interactive AI Caddie Console
function initAiConsole() {
  const promptTabs = [...document.querySelectorAll('.ai-prompt-btn')];
  const panels = [...document.querySelectorAll('.ai-scenario')];
  const actionChips = document.querySelectorAll('.action-chip[data-ai-target]');
  const nextBtn = document.querySelector('.ai-next-btn');

  if (!promptTabs.length || !panels.length) return;

  let currentAiIndex = 0;

  function setScenario(index, focusTab = false, fromScroll = false) {
    if (fromScroll && index === currentAiIndex) return;
    currentAiIndex = index;

    promptTabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    if (window.innerWidth <= 760) {
      promptTabs[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    if (focusTab && promptTabs[index]) {
      promptTabs[index].focus();
    }

    track('ai_prompt_change', { promptIndex: index, trigger: fromScroll ? 'scroll' : 'click' });
  }

  function selectAiScenario(index, focusTab = false) {
    setScenario(index, focusTab);
  }

  promptTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectAiScenario(index));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % promptTabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + promptTabs.length) % promptTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = promptTabs.length - 1;
      else return;
      event.preventDefault();
      selectAiScenario(next, true);
    });
  });

  actionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const target = Number.parseInt(chip.dataset.aiTarget, 10);
      if (!Number.isNaN(target) && target >= 0 && target < promptTabs.length) {
        selectAiScenario(target, true);
      }
    });
  });

  function cycleNext() {
    const current = promptTabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = (current + 1) % promptTabs.length;
    selectAiScenario(next, false);
  }

  nextBtn?.addEventListener('click', cycleNext);
}
initAiConsole();

// Coaches (mobile): hide the sticky access bar while another access button is on screen.
function initMobileCta() {
  const bar = document.querySelector('.mobile-cta');
  const targets = document.querySelectorAll('.hero .hero-actions, .closing .hero-actions');
  if (!bar || !targets.length || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    bar.classList.toggle('is-hidden', visible.size > 0);
  });
  targets.forEach(target => observer.observe(target));
}
initMobileCta();
