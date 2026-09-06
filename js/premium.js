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
  controlled:{title:t('Una zona de caída más amplia.','A wider landing area.'),description:t('La madera 3 se queda antes del estrechamiento. Menos distancia, más margen para el siguiente golpe.','The 3-wood lands before the fairway narrows. Less distance, more room for your next shot.'),distance:'240 yd',risk:t('Menor','Lower'),marker:t('Más margen de calle','More fairway to work with')},
  aggressive:{title:t('Más cerca. Con menos margen.','Closer. With less room.'),description:t('El driver gana distancia, pero su zona de caída se acerca al agua y a la parte estrecha de la calle. Valora el riesgo antes de elegir.','The driver gains distance, but its landing area is closer to the water and the narrow fairway. Weigh the risk before choosing.'),distance:'280 yd',risk:t('Mayor','Higher'),marker:t('Menos margen junto al agua','Less room beside the water')}
};
document.querySelectorAll('[data-strategy]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.strategy;
  const copy=strategyCopy[key];
  if(!copy)return;
  document.querySelectorAll('[data-strategy]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  document.querySelector('[data-course-strategy]').dataset.courseStrategy=key;
  for(const [field,value] of Object.entries(copy))document.querySelector(`[data-strategy-${field}]`).textContent=value;
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
