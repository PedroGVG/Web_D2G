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
    pinLandingTag:t('0% Riesgo de Agua','0% Water Risk'),
    pinLandingTagClass:'tactical-badge tag-green',
    pinLanding:t('Calle Ancha · Margen Total','Wide Fairway · Full Margin'),
    pinGreenTag:t('+0.42 SG vs Campo','+0.42 SG vs Field'),
    pinGreenTagClass:'tactical-badge tag-green',
    pinGreen:t('Centro de Green ➔ Par Asegurado','Green Center ➔ Safe Par'),
    summaryTee:t('100% Calle (0% Agua)','100% Fairway (0% Water)'),
    summaryTeeClass:'text-green',
    summaryApproach:t('Hierro 7 a centro','7-Iron to center'),
    summaryScore:t('PAR Seguro (+0.42 SG)','Safe PAR (+0.42 SG)'),
    summaryScoreClass:'text-green'
  },
  aggressive:{
    pinTee:t('Driver · 280 yd forzado','Forced Driver · 280 yd'),
    pinLandingTag:t('32% Dispersión al Agua','32% Dispersion to Water'),
    pinLandingTagClass:'tactical-badge tag-red',
    pinLanding:t('Cuello Estrecho · Alto Riesgo','Narrow Fairway · High Risk'),
    pinGreenTag:t('−0.65 SG vs Campo','−0.65 SG vs Field'),
    pinGreenTagClass:'tactical-badge tag-red',
    pinGreen:t('Bandera Corta ➔ Riesgo de Bogey','Tucked Pin ➔ High Bogey Risk'),
    summaryTee:t('32% Peligro de Agua (−1.82 SG)','32% Water Hazard (−1.82 SG)'),
    summaryTeeClass:'text-red',
    summaryApproach:t('Wedge forzado a bandera','Forced Wedge to pin'),
    summaryScore:t('BOGEY o Peor (−0.65 SG)','BOGEY or Worse (−0.65 SG)'),
    summaryScoreClass:'text-red'
  }
};
document.querySelectorAll('[data-strategy]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.strategy;
  const data=strategyData[key];
  if(!data)return;
  document.querySelectorAll('[data-strategy]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
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

  track('strategy_change',{strategy:key});
}));

const tabs=[...document.querySelectorAll('[data-product-tab]')];
function activateProduct(index,focus=false){
  tabs.forEach((tab,i)=>{
    const selected=i===index;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
  });
  if(focus)tabs[index].focus();
  track('product_view',{feature:tabs[index].dataset.productTab});
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activateProduct(index));
  tab.addEventListener('keydown',event=>{
    let next=index;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();activateProduct(next,true);
  });
});

const selector=document.getElementById('benchmark-select');
selector?.addEventListener('change',()=>{
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
