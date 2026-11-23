const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),events=new Map(),prefs=new Map();
function element(name){return {name,dataset:{},style:{setProperty(k,v){this[k]=v}},attributes:{},classList:{add(){},contains(c){return name==='card'&&c==='journey-card'}},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},querySelector(s){return elements.get(s)||null},querySelectorAll(s){return s==='.journey-bg-out'?[]:[]},append(el){elements.set('#'+el.id,el)},cloneNode(){return {...element('clone'),remove(){}}},parentElement:{insertBefore(){}},getAnimations(){return[]},animate(){this.animated=true},focus(){this.focused=true}}}
const hero=element('hero'),label=element('label'),primary=element('primary'),photo=element('photo');
for(const [s,e] of [['.hero',hero],['.hero-label',label],['.hero-copy .primary',primary],['.carousel-count',element('count')],['.eyebrow',element('status')],['.serif',element('name')],['small',element('dates')],['.photo-front:not(.journey-bg-out)',photo],['#main',element('main')]])elements.set(s,e);
let cards=[],dots=[],controls=[{},{}];
const document={documentElement:{lang:'ru',dataset:{}},querySelector:s=>elements.get(s)||null,querySelectorAll:s=>s==='.journey-card'?cards:s==='.journey-dots button'?dots:s==='.carousel-controls button'?controls:[],createElement:()=>element('span'),addEventListener(type,fn,capture){if(!events.has(type))events.set(type,[]);events.get(type).push({fn,capture})}};
const media={matches:false,addEventListener(type,fn){this.change=fn}};
const fixtures=[{id:'a',name:'Алтай',image:'mountains',status:'planned'},{id:'b',name:'Италия',image:'italy',status:'planned'},{id:'c',name:'Япония',image:'japan',status:'completed'}];
const context={document,window:{matchMedia:()=>media},Store:{pref:(k,v)=>prefs.get(k)||v,setPref:(k,v)=>prefs.set(k,v)},slide:0,heroTrips:()=>fixtures,heroTrip:()=>fixtures[context.slide],local:v=>v,t:v=>v,range:tr=>tr.id+' dates',tripDetail:id=>context.opened=id,requestAnimationFrame:fn=>{fn();return 1},setTimeout:()=>1,clearTimeout(){},console};
vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/../dist/motion.js','utf8'),context);
const motion=context.JourneyMotion;
function reset(){cards=fixtures.map(()=>element('card'));dots=fixtures.map(()=>element('dot'));context.slide=0;motion.mount()}
reset();assert.equal(cards[0].dataset.slot,'0');assert.equal(cards[1].dataset.slot,'1');assert.equal(cards[2].dataset.slot,'-1');assert.equal(photo.src,'assets/forest-canopy.jpg');assert.equal(document.documentElement.dataset.scene,'forest');
motion.shift(1);assert.equal(context.slide,1);assert.equal(primary.dataset.trip,'b');assert.equal(label.dataset.trip,'b');assert.equal(elements.get('.serif').textContent,'Италия');assert.equal(document.documentElement.dataset.scene,'coast');assert.equal(photo.src,'assets/italy.jpg');assert.equal(dots[1].attributes['aria-pressed'],'true');assert.equal(elements.get('#journey-status').textContent,'Италия · b dates');
motion.shift(1);assert.equal(context.slide,2);assert.equal(document.documentElement.dataset.scene,'blossom');motion.shift(1);assert.equal(context.slide,0);motion.shift(-1);assert.equal(context.slide,2);
for(let i=0;i<20;i++)motion.shift(1);assert.equal(context.slide,1);assert.equal(primary.dataset.trip,fixtures[1].id);
const before=context.slide;for(const bad of [-1,3,99,NaN,1.5])motion.select(bad);assert.equal(context.slide,before);
const click=events.get('click').find(e=>e.capture).fn;
function press(index,card=true){click({target:{closest:s=>s==='[data-motion-toggle]'?null:{dataset:{journeyIndex:String(index)},classList:{contains:()=>card}}},preventDefault(){},stopImmediatePropagation(){}})}
press(1);assert.equal(context.opened,'b');press(0,false);assert.equal(context.slide,0);assert.equal(context.opened,'b');
media.matches=true;media.change();assert.equal(motion.reduced(),true);assert.equal(document.documentElement.dataset.motion,'off');motion.shift(1);assert.equal(primary.dataset.trip,'b');media.matches=false;media.change();
const toggle=element('toggle');click({target:{closest:s=>s==='[data-motion-toggle]'?toggle:null},preventDefault(){},stopImmediatePropagation(){}});assert.equal(prefs.get('motion'),'off');assert.equal(motion.reduced(),true);assert.equal(toggle.attributes['aria-checked'],'false');
// Gesture direction, cancellation and vertical scrolling remain independent of motion preference.
const pointerDown=events.get('pointerdown')[0].fn,pointerUp=events.get('pointerup')[0].fn;
context.slide=0;pointerDown({target:{closest:()=>({})},button:0,pointerId:4,clientX:180,clientY:100});pointerUp({pointerId:4,clientX:80,clientY:110});assert.equal(context.slide,1);press(1);assert.equal(context.opened,'b');
pointerDown({target:{closest:()=>({})},button:0,pointerId:5,clientX:100,clientY:100});pointerUp({pointerId:5,clientX:120,clientY:230});assert.equal(context.slide,1);
pointerDown({target:{closest:()=>({})},button:0,pointerId:6,clientX:180,clientY:100});events.get('pointercancel')[0].fn();pointerUp({pointerId:6,clientX:60,clientY:100});assert.equal(context.slide,1);
let prevented=false;const keyboard=events.get('keydown')[0].fn;
keyboard({target:{closest:s=>s==='.hero'?hero:null},key:'ArrowRight',preventDefault(){prevented=true}});assert.equal(context.slide,2);assert(prevented);
keyboard({target:{closest:s=>s==='.hero'?hero:s==='input,textarea,select'?{}:null},key:'ArrowRight',preventDefault(){}});assert.equal(context.slide,2);
for(let n=1;n<20;n++)for(let selected=0;selected<n;selected++)for(let i=0;i<n;i++){const slot=motion.offset(i,selected,n);assert(Math.abs(slot)<=Math.ceil(n/2));assert.equal((selected+slot+n)%n,i)}
fixtures.splice(1);reset();motion.shift(1);assert.equal(context.slide,0);assert(controls.every(b=>b.disabled));fixtures.splice(0);reset();assert.equal(elements.get('.carousel-count').textContent,'0 / 0');motion.shift(-1);assert.equal(context.slide,0);
console.log('PASS: carousel order, rapid switching and wraparound; card selection vs opening; aligned trip links, image, status and palette; invalid index guard; live announcement; motion preference and device reduction; swipe direction, vertical scroll, cancellation and keyboard; one/zero trip states. DOM adapters do not replace visual browser QA.');
