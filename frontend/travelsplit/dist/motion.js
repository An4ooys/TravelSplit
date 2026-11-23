/* Living Forest: presentation-only motion. Trip access and records stay in the app. */
'use strict';
const JourneyMotion=(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  let allowed=Store.pref('motion','on')!=='off', lastSource='', backgroundTimer, swipe=null, suppressClick=false, frame=0;
  const reduced=()=>!allowed||media.matches;
  const ru=()=>document.documentElement.lang!=='en';
  const mood=tr=>tr?.image==='japan'?'blossom':tr?.image==='italy'?'coast':'forest';
  function preferences(){document.documentElement.dataset.motion=reduced()?'off':'on'}
  function settings(){return `<div class="motion-settings"><div><strong>${ru()?'Живой интерфейс':'Living interface'}</strong><p>${media.matches?(ru()?'Движение отключено настройками устройства.':'Motion is reduced by your device settings.'):(ru()?'Плавные переходы и движение природных деталей.':'Smooth transitions and floating botanical details.')}</p></div><button class="motion-switch" type="button" role="switch" aria-label="${ru()?'Анимации интерфейса':'Interface animations'}" aria-checked="${allowed}" data-motion-toggle><span></span></button></div>`}
  function offset(index,selected,count){let d=(index-selected+count)%count;if(d>count/2)d-=count;return d}
  function sync(background=true){
    const hero=document.querySelector('.hero');if(!hero)return;
    const options=heroTrips(),n=options.length;slide=n?((slide%n)+n)%n:0;
    const tr=options[slide];document.documentElement.dataset.scene=mood(tr);
    hero.dataset.scene=mood(tr);hero.tabIndex=0;
    document.querySelectorAll('.journey-card').forEach((card,i)=>{
      const d=offset(i,slide,Math.max(n,1)),active=i===slide;
      card.style.setProperty('--slot',String(d));card.dataset.slot=String(Math.max(-3,Math.min(3,d)));
      card.style.zIndex=String(5-Math.min(3,Math.abs(d)));
      card.setAttribute('aria-current',active?'true':'false');card.tabIndex=Math.abs(d)>1?-1:0;
      card.setAttribute('aria-hidden',String(Math.abs(d)>2));
      const trip=options[i];card.setAttribute('aria-label',`${active?(ru()?'Открыть':'Open'):(ru()?'Выбрать':'Select')} ${local(trip.name)}`);
    });
    document.querySelectorAll('.journey-dots button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===slide)));
    document.querySelectorAll('.carousel-controls button').forEach(b=>b.disabled=n<2);
    const count=hero.querySelector('.carousel-count');if(count)count.textContent=`${n?slide+1:0} / ${n}`;
    const label=hero.querySelector('.hero-label'),primary=hero.querySelector('.hero-copy .primary');
    if(tr){
      for(const b of [label,primary]){b.dataset.trip=tr.id;delete b.dataset.action}
      label.querySelector('.eyebrow').textContent=t(tr.status);
      label.querySelector('.serif').textContent=local(tr.name);label.querySelector('small').textContent=range(tr);
      const src=`assets/${tr.image==='mountains'?'forest-canopy':tr.image||'forest-canopy'}.jpg`;
      const photo=hero.querySelector('.photo-front:not(.journey-bg-out)');
      if(background&&lastSource&&lastSource!==src&&!reduced()){
        clearTimeout(backgroundTimer);hero.querySelectorAll('.journey-bg-out').forEach(el=>el.remove());
        const previous=photo.cloneNode();previous.classList.add('journey-bg-out');previous.alt='';previous.removeAttribute('fetchpriority');
        photo.parentElement.insertBefore(previous,photo.nextSibling);
        requestAnimationFrame(()=>previous.classList.add('leaving'));
        backgroundTimer=setTimeout(()=>previous.remove(),850);
      }
      photo.src=src;photo.alt=local(tr.name);lastSource=src;
    }
  }
  function shift(direction){const n=heroTrips().length;if(n<2)return;select((slide+direction+n)%n)}
  function select(index){const options=heroTrips();if(!Number.isInteger(index)||index<0||index>=options.length)return;
    slide=index;sync();
    if(!reduced()){
      const label=document.querySelector('.hero-label');
      label?.getAnimations?.().forEach(a=>a.cancel());
      label?.animate?.([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
    const status=document.querySelector('#journey-status');if(status)status.textContent=`${local(options[slide].name)} · ${range(options[slide])}`;
  }
  function enterPage(focus=false){const main=document.querySelector('#main');
    if(!reduced())main?.querySelector('.page')?.animate?.([{opacity:.15,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
    if(focus)main?.focus({preventScroll:true});
  }
  function mount(){preferences();sync(false);
    const hero=document.querySelector('.hero');if(hero&&!hero.querySelector('#journey-status')){const status=document.createElement('span');status.id='journey-status';status.className='visually-hidden';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');hero.append(status)}
  }
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-motion-toggle]');
    if(toggle){e.preventDefault();e.stopImmediatePropagation();allowed=!allowed;Store.setPref('motion',allowed?'on':'off');preferences();toggle.setAttribute('aria-checked',String(allowed));return}
    const card=e.target.closest('[data-journey-index]');if(!card)return;
    e.preventDefault();e.stopImmediatePropagation();if(suppressClick){suppressClick=false;return}
    const index=Number(card.dataset.journeyIndex);
    if(index===slide&&card.classList.contains('journey-card')){const tr=heroTrip();if(tr)tripDetail(tr.id)}else select(index);
  },true);
  document.addEventListener('keydown',e=>{
    if(!e.target.closest('.hero')||document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select'))return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();shift(e.key==='ArrowRight'?1:-1)}
  });
  document.addEventListener('pointerdown',e=>{
    const deck=e.target.closest('.journey-deck');if(!deck||e.button!==0)return;
    swipe={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  document.addEventListener('pointerup',e=>{
    if(!swipe||e.pointerId!==swipe.id)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6){suppressClick=true;shift(dx<0?1:-1);setTimeout(()=>suppressClick=false,400)}
  });
  document.addEventListener('pointercancel',()=>swipe=null);
  document.addEventListener('pointermove',e=>{
    if(reduced()||e.pointerType!=='mouse'||frame)return;
    const hero=e.target.closest('.hero');if(!hero)return;
    frame=requestAnimationFrame(()=>{frame=0;if(!hero.isConnected)return;const r=hero.getBoundingClientRect();hero.style.setProperty('--pointer-x',`${((e.clientX-r.left)/r.width-.5)*10}px`);hero.style.setProperty('--pointer-y',`${((e.clientY-r.top)/r.height-.5)*7}px`)});
  });
  document.addEventListener('visibilitychange',()=>document.documentElement.dataset.paused=document.hidden?'true':'false');
  media.addEventListener?.('change',preferences);
  return {mount,shift,select,enterPage,settings,offset,reduced};
})();
globalThis.JourneyMotion=JourneyMotion;
