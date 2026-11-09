(()=>{
const btn=document.getElementById('snd');
const snd=new Audio('assets/audio/welcome.mp3');
snd.preload='auto';
const MUSIC='assets/audio/horizon.mp3',LEVEL=.3,XF=4;
let muted=false,played=false,busy=false,pending=false,armed=false;
let ctx=null,master=null,els=[],gains=[],cur=0,mStarted=false,mBusy=false,mPending=false,crossing=false,timer=0;
try{muted=localStorage.getItem('snd-muted')==='1'}catch(e){}
const sync=()=>{snd.muted=muted;
 if(master)master.gain.setTargetAtTime(muted?0:LEVEL,ctx.currentTime,.3);
 if(btn){btn.setAttribute('aria-pressed',String(!muted));btn.setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');btn.classList.toggle('off',muted);btn.classList.toggle('wait',(pending||mPending)&&!(played&&mStarted)&&!muted)}};
/* only events that browsers accept as a user activation (touchstart/pointerdown on touch do not count) */
const evts=['pointerup','touchend','mousedown','keydown','click'];
const arm=()=>{if(armed)return;armed=true;evts.forEach(e=>addEventListener(e,onGesture,true))};
const disarm=()=>{armed=false;evts.forEach(e=>removeEventListener(e,onGesture,true))};
function onGesture(e){if(btn&&btn.contains(e.target))return;play();startMusic()}
function done(){if(played&&mStarted){pending=false;mPending=false;disarm()}sync()}
function wait(){busy=false;pending=true;sync();arm()}
function play(){
 if(played||busy)return;
 busy=true;let p;
 try{p=snd.play()}catch(err){wait();return}
 if(!p||!p.then){played=true;busy=false;done();startMusic();return}
 p.then(()=>{played=true;busy=false;pending=false;done();startMusic()}).catch(wait);
}
/* ---- ambient music: two elements -> WebAudio gain, equal-power crossfade loop, very quiet ---- */
function musicInit(){
 if(ctx)return true;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 try{ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  for(let i=0;i<2;i++){const a=new Audio(MUSIC);a.preload='auto';const g=ctx.createGain();g.gain.value=0;ctx.createMediaElementSource(a).connect(g);g.connect(master);els.push(a);gains.push(g)}
 }catch(e){ctx=null;return false}
 return true}
function startMusic(){
 if(mStarted||mBusy||!musicInit())return;
 mBusy=true;
 ctx.resume().then(()=>{if(ctx.state!=='running')throw 0;return els[0].play()}).then(()=>{
  mBusy=false;mStarted=true;mPending=false;
  const t=ctx.currentTime;gains[0].gain.setValueAtTime(1,t);master.gain.setValueAtTime(0,t);master.gain.linearRampToValueAtTime(muted?0:LEVEL,t+10);
  timer=setInterval(tick,200);done()}).catch(()=>{mBusy=false;mPending=true;sync();arm()});
}
const UP=Float32Array.from({length:64},(_,i)=>Math.sin(i/63*Math.PI/2)),DN=Float32Array.from({length:64},(_,i)=>Math.cos(i/63*Math.PI/2));
function tick(){
 if(crossing||!mStarted||ctx.state!=='running')return;
 const a=els[cur],d=a.duration;if(!isFinite(d)||d<=XF*2)return;
 if(a.currentTime>=d-XF-.25){
  crossing=true;const n=1-cur,b=els[n],t=ctx.currentTime;
  b.currentTime=0;b.play().catch(()=>{});
  gains[n].gain.cancelScheduledValues(t);gains[n].gain.setValueCurveAtTime(UP,t,XF);
  gains[cur].gain.cancelScheduledValues(t);gains[cur].gain.setValueCurveAtTime(DN,t,XF);
  const old=cur;cur=n;
  setTimeout(()=>{els[old].pause();els[old].currentTime=0;crossing=false},XF*1000+200)}
}
if(btn)btn.addEventListener('click',()=>{
 if(!played||!mStarted){busy=false;play();startMusic();return}
 muted=!muted;try{localStorage.setItem('snd-muted',muted?'1':'0')}catch(e){}sync()});
sync();play();
const retry=()=>{if(!played&&!busy)play();if(!mStarted&&!mBusy&&played)startMusic()};
snd.addEventListener('canplaythrough',retry,{once:true});
addEventListener('pageshow',retry);addEventListener('focus',retry);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(ctx&&mStarted)ctx.suspend()}else{if(ctx&&mStarted)ctx.resume();retry()}});
addEventListener('pointermove',retry,{once:true});
addEventListener('pagehide',()=>{snd.pause();clearInterval(timer);els.forEach(a=>a.pause())});
})();
