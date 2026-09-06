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

const strategyCopy={
  controlled:{
    title:t('Estrategia de Control: Margen óptimo','Controlled Strategy: Optimal Margin'),
    description:t('Madera 3 a zona ancha de calle, evitando todo peligro de agua, seguida de hierro cómodo a centro de green.','3-Wood to wide landing zone, eliminating water hazard, followed by controlled iron to center green.'),
    sg:'+0.42 SG',
    distance:'240 yd',
    risk:t('Menor (0% agua)','Lower (0% water)'),
    marker:t('Madera 3: Calle ancha · 0% agua','3-Wood: Wide fairway · 0% water'),
    'green-marker':t('Centro de Green: Par asegurado (+0.42 SG)','Center Green: Safe Par (+0.42 SG)'),
    tee:t('Madera 3 · 240 yd a calle ancha','3-Wood · 240 yd safe fairway'),
    'tee-sub':t('0% riesgo de obstáculo de agua','0% water hazard penalty risk'),
    approach:t('Hierro 7 · 178 yd a centro de green','7-Iron · 178 yd to green center'),
    'approach-sub':t('Zona amplia · Gran tolerancia de dispersión','Wide sector · High dispersion margin'),
    green:t('2 Putts controlados ➔ PAR Seguro','2 Controlled putts ➔ Safe PAR'),
    'green-sub':t('+0.42 Strokes Gained vs resto de jugadores','+0.42 Strokes Gained vs field average')
  },
  aggressive:{
    title:t('Estrategia Agresiva: Alto riesgo junto al agua','Aggressive Strategy: High risk near water'),
    description:t('El driver busca ganar 40 yardas pero expone una zona de caída crítica: 32% de dispersión cae al obstáculo de agua.','Driver seeks 40 extra yards but exposes a critical landing zone: 32% dispersion miss into water hazard.'),
    sg:'−0.65 SG',
    distance:'280 yd',
    risk:t('Crítico (32% agua)','Critical (32% water)'),
    marker:t('Driver: Cuello estrecho · 32% agua','Driver: Narrow neck · 32% water'),
    'green-marker':t('Bandera corta protegida: Volatilidad (−0.65 SG)','Tucked pin: High volatility (−0.65 SG)'),
    tee:t('Driver · 280 yd a cuello estrecho','Driver · 280 yd narrow fairway neck'),
    'tee-sub':t('32% de dispersión directa a obstáculo de agua (-1.82 SG)','32% direct dispersion into water hazard (-1.82 SG)'),
    approach:t('Wedge · 138 yd a bandera corta protegida','Wedge · 138 yd to tucked pin over bunker'),
    'approach-sub':t('Margen estrecho de error · Riesgo de bunker y rough denso','Narrow error margin · Bunker & thick rough hazard'),
    green:t('Putt comprometido o drop ➔ Bogey / Doble Bogey','Compromised putt or drop ➔ Bogey / Double Bogey'),
    'green-sub':t('−0.65 Strokes Gained medio por penalizaciones y fallos','−0.65 Strokes Gained average due to penalties & misses')
  }
};
document.querySelectorAll('[data-strategy]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.strategy;
  const copy=strategyCopy[key];
  if(!copy)return;
  document.querySelectorAll('[data-strategy]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const visual=document.querySelector('[data-course-strategy]');
  if(visual)visual.dataset.courseStrategy=key;
  const sgEl=document.querySelector('[data-strategy-sg]');
  if(sgEl){
    sgEl.textContent=copy.sg;
    sgEl.className=`strategy-sg-tag ${key==='controlled'?'text-green':'text-red'}`;
  }
  for(const [field,value] of Object.entries(copy)){
    const el=document.querySelector(`[data-strategy-${field}]`);
    if(el)el.textContent=value;
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
