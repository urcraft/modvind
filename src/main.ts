import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/600.css';
import './style.css';
import { createWorld } from './world';
import { newState, makeObstacles, changeLane, step } from './simulation';
import { chapterAt, ROUTE_LENGTH } from './route';
import { PedalInput } from './pedal-input';
import { GameAudio } from './audio';
const audio = new GameAudio();
const pedalInput = new PedalInput();

document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
<main class="shell">
 <div class="source-bar"><a href="https://github.com/urcraft/modvind" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⑂</span> Fork it in Github <span aria-hidden="true">↗</span></a></div>
 <header><a class="brand" href="./" aria-label="Modvind home">MODVIND<span class="wind-mark">≋</span><small>THE COMMUTE TO HERNING</small></a><div class="header-note">WEST JUTLAND, DENMARK<span>A little determination goes a long way.</span></div><button id="sound" class="sound-button" aria-label="Mute music and sound effects" aria-pressed="false">SOUND ON</button><button id="pause" class="icon-button" aria-label="Pause game" disabled>Ⅱ</button></header>
 <section class="game" aria-label="Cycling game">
  <div id="scene"></div><div class="vignette"></div>
  <div class="hud"><div class="energy-panel"><div class="eyebrow"><span>YOUR ENERGY</span><strong id="energyValue">100%</strong></div><div class="meter"><div id="energyBar"></div></div><span id="boost">POWERED BY PURE STUBBORNNESS</span></div><div class="distance-panel"><strong id="distance">0.00</strong><span> / ${(ROUTE_LENGTH/1000).toFixed(1)} km</span><small>← &nbsp; HEADWIND · ARCADE DISTANCE</small></div></div>
  <div class="chapter"><span class="chapter-dot"></span><div><strong id="chapterName">MCH Arena</strong><small id="road">Kaj Zartows Vej</small></div></div>
  <div id="feedback" aria-live="polite"></div>
  <div id="overlay" class="overlay"><div class="intro-card"><div class="eyebrow">MCH ARENA → AU HERNING</div><h1>Good morning.<br>Bad wind.</h1><p>One minute. Through the city. One very<br class="desktop"> stubborn Danish headwind.</p><div class="instructions"><span><kbd>SPACE</kbd> Hold to pedal</span><span><kbd>↑</kbd><kbd>↓</kbd> Change lane</span></div><button id="start" class="primary">LET’S RIDE <span>→</span></button><small class="intro-foot">Dodge the sheep. Grab a rundstykke. Make it to campus.</small></div></div>
  <div class="touch-controls"><div><button id="up" aria-label="Move to far lane">↑</button><button id="down" aria-label="Move to near lane">↓</button></div><button id="pedal" aria-label="Pedal harder">PEDAL <span>↗</span></button></div>
 </section>
 <section class="route-strip" aria-label="Route progress"><div class="route-label"><span class="eyebrow">SHORT CITY ROUTE</span><strong id="routeLabel">MCH Arena → AU Herning</strong></div><div class="route-track"><div class="track-line"><div id="progress"></div><i id="rider-dot"></i></div><div class="stops"><span>MCH ARENA</span><span>CITY CENTRE</span><span>BIRK</span><span>AU HERNING</span></div></div><div class="best"><span class="eyebrow">PERSONAL BEST</span><strong id="best">0.00 <small>km</small></strong></div></section>
 <footer><span id="flavour">The flags were trying to warn you.</span><span><kbd>SPACE</kbd> hold to pedal <b>·</b> <kbd>↑ ↓</kbd> steer <b>·</b> <kbd>P</kbd> pause</span></footer>
</main>`;
const el=(id:string)=>document.getElementById(id)!;
let state=newState(); let objects=makeObstacles(); let best=0;
try{best=Math.max(0,Math.min(ROUTE_LENGTH,Number(localStorage.getItem('modvind-city-short-v2-best'))||0));}catch{}
el('best').innerHTML=`${(best/1000).toFixed(2)} <small>km</small>`;
let world:ReturnType<typeof createWorld>;
try{world=createWorld(el('scene'),objects);}catch(error){el('overlay').innerHTML='<div class="intro-card"><h1>A small technical headwind.</h1><p>This game needs a browser with WebGL enabled. Try enabling hardware acceleration and reloading.</p></div>';throw error;}
let feedbackUntil=0; let accumulator=0; let last=performance.now();
function saveBest(){if(state.furthest>best){best=state.furthest;try{localStorage.setItem('modvind-city-short-v2-best',String(best));}catch{}el('best').innerHTML=`${(best/1000).toFixed(2)} <small>km</small>`;}}
function start(){audio.unlock();audio.setPlaying(false);audio.setPlaying(true);pedalInput.clear();if(document.activeElement instanceof HTMLElement)document.activeElement.blur();state=newState();state.status='playing';objects.forEach(o=>o.consumed=false);el('overlay').classList.add('hidden');(el('pause') as HTMLButtonElement).disabled=false;el('pause').textContent='Ⅱ';el('pause').setAttribute('aria-label','Pause game');el('feedback').textContent='';accumulator=0;}
function pause(){if(state.status!=='playing'&&state.status!=='paused')return;pedalInput.clear();if(state.status==='playing'){state.status='paused';audio.setPlaying(false);saveBest();el('overlay').classList.remove('hidden');el('overlay').innerHTML='<div class="intro-card compact"><div class="eyebrow">TAKE A BREATHER</div><h1>The wind can wait.</h1><p>Your commute is paused.</p><button id="resume" class="primary">KEEP RIDING →</button><button id="restart" class="text-button">Start again</button></div>';el('resume').onclick=pause;el('restart').onclick=start;el('pause').textContent='▶';el('pause').setAttribute('aria-label','Resume game');}else{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();state.status='playing';audio.unlock();audio.setPlaying(true);el('overlay').classList.add('hidden');el('pause').textContent='Ⅱ';el('pause').setAttribute('aria-label','Pause game');accumulator=0;}}
function finish(){pedalInput.clear();saveBest();const won=state.status==='won';audio.setPlaying(false);audio.effect(won?'win':'lose');el('overlay').classList.remove('hidden');el('overlay').innerHTML=`<div class="intro-card compact"><div class="eyebrow">${won?'AU HERNING · BIRK CENTERPARK 15':'THE HEADWIND WINS THIS ROUND'}</div><h1>${won?'You earned<br>that coffee.':'Out of puff.'}</h1><p>${won?'Made it to campus. Same time tomorrow?':'Tomorrow is another commute.'}</p><div class="result-distance">${(state.furthest/1000).toFixed(2)} <small>/ ${(ROUTE_LENGTH/1000).toFixed(1)} km</small></div><p class="stats">${state.rolls} rundstykker &nbsp; · &nbsp; ${state.hits} bumps &nbsp; · &nbsp; ${Math.floor(state.elapsed/60)}:${String(Math.floor(state.elapsed%60)).padStart(2,'0')}</p><button id="restart" class="primary">RIDE AGAIN →</button></div>`;el('restart').onclick=start;(el('pause')as HTMLButtonElement).disabled=true;}
el('start').onclick=start;el('pause').onclick=pause;
function updateSoundButton(){el('sound').textContent=audio.muted?'SOUND OFF':'SOUND ON';el('sound').setAttribute('aria-pressed',String(audio.muted));el('sound').setAttribute('aria-label',audio.muted?'Unmute music and sound effects':'Mute music and sound effects');}
el('sound').onclick=()=>{audio.toggle();updateSoundButton();};updateSoundButton();
function steer(delta:number){const before=state.lane;changeLane(state,delta);if(state.lane!==before)audio.effect('lane');}
function bindTouch(id:string,fn:()=>void){el(id).addEventListener('pointerdown',e=>{e.preventDefault();fn();});}
el('pedal').addEventListener('pointerdown',e=>{e.preventDefault();if(state.status!=='playing')return;pedalInput.pressPointer(e.pointerId);el('pedal').setPointerCapture(e.pointerId);});
for(const event of ['pointerup','pointercancel','lostpointercapture'] as const) el('pedal').addEventListener(event,e=>pedalInput.releasePointer(e.pointerId));
bindTouch('up',()=>steer(-1));bindTouch('down',()=>steer(1));
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','KeyW','KeyS','KeyP','Escape'].includes(e.code)){if((e.target as HTMLElement)?.tagName==='BUTTON'&&e.code==='Space')return;e.preventDefault();if(e.repeat)return;if(e.code==='Space'&&state.status==='playing')pedalInput.setKeyboard(true);if(e.code==='ArrowUp'||e.code==='KeyW')steer(-1);if(e.code==='ArrowDown'||e.code==='KeyS')steer(1);if(e.code==='KeyP'||e.code==='Escape')pause();}});
window.addEventListener('keyup',e=>{if(e.code==='Space')pedalInput.setKeyboard(false);});
// Remove button focus after pointer interaction so Space remains the pedal input.
document.addEventListener('pointerup',()=>{if(document.activeElement instanceof HTMLButtonElement)document.activeElement.blur();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pedalInput.clear();if(state.status==='playing')pause();}});
window.addEventListener('blur',()=>{pedalInput.clear();if(state.status==='playing')pause();});
window.addEventListener('pagehide',saveBest);
function frame(now:number){const dt=Math.min((now-last)/1000,.1);last=now;if(state.status==='playing'){accumulator+=dt;const hits=state.hits,rolls=state.rolls;while(accumulator>=1/120){step(state,1/120,objects,pedalInput.held);accumulator-=1/120;}if(state.hits>hits){audio.effect('hit');el('feedback').textContent='Oof. Keep pedaling!';feedbackUntil=now+1300;el('scene').classList.remove('bump');void el('scene').offsetWidth;el('scene').classList.add('bump');}if(state.rolls>rolls){audio.effect('pickup');el('feedback').textContent='RUNDSTYKKE! + ENERGY';feedbackUntil=now+1500;}if(['won','lost'].includes(state.status))finish();}
 if(now>feedbackUntil)el('feedback').textContent='';
 el('energyValue').textContent=`${Math.ceil(state.energy)}%`;el('energyBar').style.width=`${state.energy}%`;el('energyBar').classList.toggle('low',state.energy<25);el('distance').textContent=(state.distance/1000).toFixed(2);el('boost').textContent=state.boost>0?`RUNDSTYKKE BOOST · ${state.boost.toFixed(1)}s`:state.speed<0?'BLOWING BACKWARDS — HOLD SPACE TO PEDAL!':'POWERED BY PURE STUBBORNNESS';el('boost').classList.toggle('boosted',state.boost>0);const chapter=chapterAt(state.distance);el('chapterName').textContent=chapter.name;el('road').textContent=chapter.road;el('flavour').textContent=chapter.note;el('progress').style.width=`${state.distance/ROUTE_LENGTH*100}%`;el('rider-dot').style.left=`${state.distance/ROUTE_LENGTH*100}%`;audio.update(state.boost>0);world.render(state,now/1000);requestAnimationFrame(frame);
}requestAnimationFrame(frame);



