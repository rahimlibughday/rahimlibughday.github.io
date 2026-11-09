(()=>{
const $=id=>document.getElementById(id),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=$('hero'),work=$('work'),space=$('space'),gal=$('gallery'),persp=$('persp'),cvs=$('warp'),go=$('go'),back=$('back'),home=$('home'),dotsEl=$('dots'),hint=$('hint'),snd=$('snd');
if(!hero||!work||!go)return;
const fx=window.heroFX||{p:0,paused:false},frames=[...gal.children],N=frames.length,S=1600,P=1200;
const cl=t=>Math.max(0,Math.min(1,t)),rnd=(a,b)=>a+Math.random()*(b-a);
let mode='hero',pos=0,target=0,t0=0,cruise=.22,v=0,starA=0,ox=0,oy=0,mx=0,my=0,raf=0,last=0,prevPos=0,idleT=0,hinted=false,prog=0,lastIdx=0,lastB=0,bc=null,sv=0,tv=0,tl=0;
const FR=2.4,VM=14000;/* scroll glide: FR = friction (lower = longer glide), VM = max glide speed */
/* stars */
const g=cvs.getContext('2d'),stars=Array.from({length:matchMedia('(max-width:700px)').matches?300:560},()=>({x:rnd(-1.5,1.5),y:rnd(-1.5,1.5),z:Math.random()}));
let W=0,H=0,dpr=1;
function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=cvs.width=Math.round(innerWidth*dpr);H=cvs.height=Math.round(innerHeight*dpr)}
function reset(s,fromFar){s.x=rnd(-1.5,1.5);s.y=rnd(-1.5,1.5);s.z=fromFar?rnd(.9,1):rnd(.03,.1)}
function drawStars(dt){
 g.clearRect(0,0,W,H);if(starA<.01)return;
 g.globalCompositeOperation='lighter';g.lineCap='round';
 const f=.38*Math.max(W,H),cx=W*.5+ox*W*.025,cy=H*.5+oy*H*.025,vv=reduce?0:v;
 for(const s of stars){
  s.z-=vv*dt*.35;
  if(s.z<=.03){reset(s,true);continue}if(s.z>1.02){reset(s,false);continue}
  const zp=Math.max(.02,Math.min(1.6,s.z+Math.min(.5,vv*.06)+.003)),x1=cx+s.x/s.z*f,y1=cy+s.y/s.z*f,x0=cx+s.x/zp*f,y0=cy+s.y/zp*f;
  if(vv>=0&&(x1<-60||x1>W+60||y1<-60||y1>H+60)){reset(s,true);continue}
  const b=1-s.z;g.strokeStyle=window.Theme.c(150+b*105|0,255,220+b*35|0,((.15+b*.85)*starA).toFixed(3));g.lineWidth=(.4+b*1.8)*dpr;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
}
/* gallery */
function render(){
 frames.forEach((f,i)=>{const z=pos-i*S,far=cl((z+S*1.05)/(S*.8)),near=1-cl((z-.08*P)/(.5*P)),o=Math.min(far,near);
  if(o<.004){if(f._v){f.style.visibility='hidden';f._v=0}return}
  f._v=1;f.style.visibility='visible';f.style.transform='translate3d(0,0,'+z.toFixed(1)+'px)';f.style.opacity=o.toFixed(3);f.style.pointerEvents=o>.7?'auto':'none'});
 const a=Math.max(0,Math.min(N-1,Math.round(pos/S)));
 [...dotsEl.children].forEach((d,i)=>d.classList.toggle('on',i===a));
 if(a!==lastIdx){if(mode==='work')blip(a>lastIdx);lastIdx=a}
}
function setP(p){fx.p=p;hero.style.setProperty('--wp',p.toFixed(4))}
/* whoosh (synthesised, respects the sound button) */
function whoosh(rev){
 if(reduce||(snd&&snd.getAttribute('aria-pressed')==='false'))return;
 try{const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),d=rev?1.8:3.2,now=ac.currentTime,len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),ch=buf.getChannelData(0);
  for(let i=0;i<len;i++)ch[i]=Math.random()*2-1;
  const n=ac.createBufferSource();n.buffer=buf;n.loop=true;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;
  const lo=rev?2600:180,hi=rev?180:2600;bp.frequency.setValueAtTime(lo,now);bp.frequency.exponentialRampToValueAtTime(hi,now+d*.55);
  const gn=ac.createGain();gn.gain.setValueAtTime(.0001,now);gn.gain.exponentialRampToValueAtTime(.3,now+d*.4);gn.gain.exponentialRampToValueAtTime(.0001,now+d);
  const o=ac.createOscillator();o.type='sine';o.frequency.setValueAtTime(rev?190:55,now);o.frequency.exponentialRampToValueAtTime(rev?55:190,now+d*.6);const og=ac.createGain();og.gain.setValueAtTime(.0001,now);og.gain.exponentialRampToValueAtTime(.12,now+d*.4);og.gain.exponentialRampToValueAtTime(.0001,now+d);
  n.connect(bp).connect(gn).connect(ac.destination);o.connect(og).connect(ac.destination);n.start(now);o.start(now);n.stop(now+d+.1);o.stop(now+d+.1);setTimeout(()=>ac.close&&ac.close(),(d+.4)*1000)}catch(e){}
}
/* PIK: short synthesised tech blip when the next / previous project snaps into view (respects the sound button) */
function blipCtx(){if(bc)return bc;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;try{bc=new AC()}catch(e){bc=null}return bc}
function blip(fwd){
 if(snd&&snd.getAttribute('aria-pressed')==='false')return;
 const ac=blipCtx();if(!ac)return;
 if(ac.state!=='running'){ac.resume&&ac.resume().catch(()=>{});return}
 const nw=performance.now();if(nw-lastB<70)return;lastB=nw;
 try{
  const t=ac.currentTime+.005,f=fwd?1568:1175,out=ac.createGain();out.gain.value=1;out.connect(ac.destination);
  /* body: sine with a tiny downward chirp */
  const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.05,t);o.frequency.exponentialRampToValueAtTime(f,t+.035);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.085,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.2);
  o.connect(g).connect(out);o.start(t);o.stop(t+.22);
  /* sparkle: octave partial that dies fast, gives the crisp 'pik' attack */
  const o2=ac.createOscillator(),g2=ac.createGain();o2.type='sine';o2.frequency.setValueAtTime(f*2,t);
  g2.gain.setValueAtTime(.0001,t);g2.gain.exponentialRampToValueAtTime(.03,t+.004);g2.gain.exponentialRampToValueAtTime(.0001,t+.05);
  o2.connect(g2).connect(out);o2.start(t);o2.stop(t+.07);
  o.onended=()=>out.disconnect()
 }catch(e){}
}
/* timelines */
const out3=t=>1-Math.pow(1-t,3);
function tick(now){
 raf=requestAnimationFrame(tick);const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-t0)/1000;
 ox+=(mx-ox)*.06;oy+=(my-oy)*.06;persp.style.setProperty('--ox',ox.toFixed(3));persp.style.setProperty('--oy',oy.toFixed(3));
 if(mode==='in'){
  const e=Math.pow(cl(t/1.5),2.2);setP(e);starA=cl(t*2.2);
  v=t<1.5?.15+3.4*Math.pow(cl(t/1.5),3):cruise+(3.55-cruise)*Math.exp(-(t-1.5)/.75);
  if(t>.9&&!work.classList.contains('on')){work.classList.add('on');space.style.visibility='visible'}
  const wo=cl((t-.9)/.5);work.style.opacity=wo;space.style.opacity=wo;
  pos=-2.6*S*(1-out3(cl((t-.9)/2.4)));target=0;
  if(t>1.5&&hero.style.visibility!=='hidden'){hero.style.visibility='hidden';fx.paused=true;fx.onPause&&fx.onPause(true)}
  if(t>3.3){mode='work';v=cruise;document.body.classList.add('in-work');if(!hinted)hint.classList.add('show');prevPos=pos}
 }else if(mode==='work'){
  if(sv){target=clampT(target+sv*dt);sv*=Math.exp(-dt*FR);if(Math.abs(sv)<8||(target<=0&&sv<0)||(target>=(N-1)*S&&sv>0))sv=0}
  const d=target-pos;pos+=d*(1-Math.exp(-dt*6));const dp=(pos-prevPos)/Math.max(dt,.001)/S,sp=Math.abs(dp),dir=dp<-.03?-1:1;prevPos=pos;
  v+=((dir*(cruise+Math.min(3.5,sp*1.3)))-v)*(1-Math.exp(-dt*5));fx.v=v;starA+=(.5+Math.min(.5,sp*.4)-starA)*(1-Math.exp(-dt*3));
 }else if(mode==='out'){
  const e=cl(t/1.9);document.body.classList.remove('in-work');
  const wo=1-cl(t/.7);work.style.opacity=wo;space.style.opacity=wo;
  if(t>.25&&hero.style.visibility==='hidden'){hero.style.visibility='visible';fx.paused=false;fx.onPause&&fx.onPause(false)}
  setP(1-out3(cl((t-.25)/1.6)));v=t<.7?cruise-(cruise+3.4)*(t/.7):-3.4*(1-cl((t-.7)/1.2));starA=t>1.2?cl(1-(t-1.2)/.7):1;
  if(t>.8)work.classList.remove('on');
  if(e>=1){mode='hero';cancelAnimationFrame(raf);raf=0;space.style.visibility='hidden';starA=0;v=0;setP(0);pos=0;target=0;drawStars(0);work.style.opacity=0;frames.forEach(f=>{f.style.visibility='hidden';f.style.pointerEvents='none';f._v=0});hero.style.pointerEvents='';return}
 }
 render();drawStars(dt);
}
function begin(m){sv=0;mode=m;t0=performance.now();last=t0;if(!raf)raf=requestAnimationFrame(tick)}
function enter(){
 if(mode!=='hero')return;
 const ac=blipCtx();if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});
 if(reduce){setP(1);hero.style.visibility='hidden';fx.paused=true;fx.onPause&&fx.onPause(true);work.classList.add('on');space.style.visibility='visible';work.style.opacity=space.style.opacity=1;pos=target=0;starA=1;document.body.classList.add('in-work');mode='work';size();render();drawStars(0);hint.classList.add('show');return}
 size();whoosh(false);hero.style.pointerEvents='none';begin('in');setTimeout(()=>{hero.style.pointerEvents=''},3400)
}
function leave(){
 if(mode!=='work')return;
 if(reduce){setP(0);hero.style.visibility='visible';fx.paused=false;fx.onPause&&fx.onPause(false);work.classList.remove('on');work.style.opacity=space.style.opacity=0;space.style.visibility='hidden';document.body.classList.remove('in-work');starA=0;drawStars(0);frames.forEach(f=>{f.style.visibility='hidden';f.style.pointerEvents='none';f._v=0});mode='hero';return}
 whoosh(true);begin('out')
}
go.addEventListener('click',enter);back.addEventListener('click',leave);home.addEventListener('click',leave);
/* input */
const clampT=x=>Math.max(0,Math.min((N-1)*S,x));
function moved(){if(!hinted){hinted=true;hint.classList.remove('show')}}
const goTo=i=>{if(mode==='work'){sv=0;target=clampT(i*S);moved()}};
addEventListener('wheel',e=>{if(mode!=='work')return;e.preventDefault();const dy=Math.max(-400,Math.min(400,e.deltaMode===1?e.deltaY*32:e.deltaY));if(sv*dy<0)sv=0;sv=Math.max(-VM,Math.min(VM,sv+dy*3.4*FR));moved()},{passive:false});
let ty=null;
addEventListener('touchstart',e=>{ty=e.touches[0].clientY;sv=0;tv=0;tl=performance.now()},{passive:true});
addEventListener('touchmove',e=>{if(mode!=='work'||ty===null)return;const y=e.touches[0].clientY,n=performance.now(),dd=-(y-ty)*4.2;target=clampT(target+dd);tv=tv*.6+dd/(Math.max(8,n-tl)/1000)*.4;tl=n;ty=y;moved()},{passive:true});
addEventListener('touchend',()=>{if(ty!==null&&mode==='work'&&performance.now()-tl<90)sv=Math.max(-VM,Math.min(VM,tv*1.1));ty=null;tv=0});
addEventListener('keydown',e=>{if(mode!=='work')return;const a=Math.round(target/S);
 if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)&&!(e.target.closest&&e.target.closest('a,button')&&e.key===' ')){e.preventDefault();goTo(a+1)}
 else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();goTo(a-1)}
 else if(e.key==='Home'){e.preventDefault();goTo(0)}else if(e.key==='End'){e.preventDefault();goTo(N-1)}else if(e.key==='Escape')leave()});
frames.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',f.dataset.title||'Section '+(i+1));b.addEventListener('click',()=>goTo(i));dotsEl.appendChild(b)});
if(!reduce)addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});
addEventListener('resize',()=>{size();if(mode!=='hero'){render();if(!raf)drawStars(0)}});
addEventListener('pagehide',()=>{cancelAnimationFrame(raf);bc&&bc.close&&bc.close().catch(()=>{});bc=null});
size();
})();
