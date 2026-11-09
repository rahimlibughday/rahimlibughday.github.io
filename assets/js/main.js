(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=document.getElementById('hero');let cv=document.getElementById('gl');const Th=window.Theme,fx=window.heroFX={p:0,paused:false,onPause:null};
/* noise for continents */
const hs=(x,y,z)=>{const n=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return n-Math.floor(n)},sm=t=>t*t*(3-2*t),L=(a,b,t)=>a+(b-a)*t;
function vn(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),u=sm(x-i),v=sm(y-j),w=sm(z-k);
 return L(L(L(hs(i,j,k),hs(i+1,j,k),u),L(hs(i,j+1,k),hs(i+1,j+1,k),u),v),L(L(hs(i,j,k+1),hs(i+1,j,k+1),u),L(hs(i,j+1,k+1),hs(i+1,j+1,k+1),u),v),w)}
const land=p=>vn(p.x*1.7+3,p.y*1.7,p.z*1.7)*.6+vn(p.x*3.6,p.y*3.6+9,p.z*3.6)*.3+vn(p.x*7.5,p.y*7.5,p.z*7.5+5)*.1>.52;
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function initGL(){
const T=window.THREE;if(!T)return false;
let renderer;
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){return false}
renderer.setClearColor(0x000000,0);
const FOV=35,DIST=18,scene=new T.Scene(),cam=new T.PerspectiveCamera(FOV,1,.1,200);cam.position.set(0,0,DIST);
const U={uT:{value:0},uPR:{value:1},uA:{value:new T.Vector3()},uB:{value:new T.Vector3()}},OCU={uC1:{value:new T.Vector3()},uC2:{value:new T.Vector3()}},ATU={uC:{value:new T.Vector3()}},low=(navigator.hardwareConcurrency||8)<=4;
const gc=document.createElement('canvas');gc.width=gc.height=128;const glowTex=new T.CanvasTexture(gc);
function paintGlow(){const g=gc.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,Th.c(190,255,235,1));r.addColorStop(.25,Th.c(40,230,170,.5));r.addColorStop(1,Th.c(0,150,100,0));g.clearRect(0,0,128,128);g.fillStyle=r;g.fillRect(0,0,128,128);glowTex.needsUpdate=true}
paintGlow();
/* shared pulsing point material */
const PM=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'attribute float aS;attribute float aP;uniform float uT,uPR;varying float vA;void main(){float p=.62+.38*sin(uT*1.7+aP*6.2832);vA=p;gl_PointSize=aS*p*uPR;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying float vA;uniform vec3 uA,uB;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.12,.5,d);gl_FragColor=vec4(mix(uA,uB,vA)*a*1.5,a*vA);}'});
function pts(pos,size,ph){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
 g.setAttribute('aS',new T.Float32BufferAttribute(new Array(pos.length/3).fill(size),1));g.setAttribute('aP',new T.Float32BufferAttribute(ph,1));
 const p=new T.Points(g,PM);p.frustumCulled=false;return p}
const themed=[],lineMat=(c,o)=>{const m=new T.LineBasicMaterial({color:Th.x(c),transparent:true,opacity:o,depthWrite:false,blending:T.AdditiveBlending});themed.push([m,c]);return m};
/* the sphere */
const tilt=new T.Group(),sph=new T.Group();tilt.add(sph);tilt.rotation.set(.25,0,.4);scene.add(tilt);
sph.add(new T.Mesh(new T.SphereGeometry(.955,48,32),new T.ShaderMaterial({uniforms:OCU,vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vN;uniform vec3 uC1,uC2;void main(){float f=pow(1.-max(0.,dot(vN,vec3(0.,0.,1.))),2.5);gl_FragColor=vec4(mix(uC1,uC2,f),1.);}'})));
sph.add(new T.LineSegments(new T.WireframeGeometry(new T.IcosahedronGeometry(1,3)),lineMat(0x1fd6a0,.14)));
const N=low?2800:4500,ga=Math.PI*(3-Math.sqrt(5)),lands=[],lp=[],lph=[],op=[],oph=[];
for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=ga*i,p=new T.Vector3(Math.cos(th)*r,y,Math.sin(th)*r);
 if(land(p)){lands.push(p);lp.push(p.x*1.003,p.y*1.003,p.z*1.003);lph.push(rnd())}else if(i%3===0){op.push(p.x*1.002,p.y*1.002,p.z*1.002);oph.push(rnd())}}
sph.add(pts(op,2.4,oph),pts(lp,4.6,lph));
const hubs=lands.filter((_,i)=>i%11===0),hp=[],hph=[],seg=[];
hubs.forEach(a=>{hp.push(a.x*1.005,a.y*1.005,a.z*1.005);hph.push(rnd());
 hubs.map(b=>[b,a.distanceTo(b)]).filter(e=>e[1]>0&&e[1]<.42).sort((x,y)=>x[1]-y[1]).slice(0,3).forEach(([b])=>{
  const m=a.clone().add(b).normalize().multiplyScalar(1.006);seg.push(a.x*1.004,a.y*1.004,a.z*1.004,m.x,m.y,m.z,m.x,m.y,m.z,b.x*1.004,b.y*1.004,b.z*1.004)})});
sph.add(pts(hp,8,hph));
const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(seg,3));sph.add(new T.LineSegments(lg,lineMat(0x3dffc4,.22)));
/* arcs + travelling pulses */
const arcs=[];
for(let n=0;n<14&&hubs.length>2;n++){let A,B,tries=0;do{A=hubs[Math.floor(rnd()*hubs.length)];B=hubs[Math.floor(rnd()*hubs.length)];tries++}while((A.distanceTo(B)<.8||A.distanceTo(B)>1.8)&&tries<60);
 const d=A.distanceTo(B),C=A.clone().add(B).normalize().multiplyScalar(1+.5*d),P=[];
 for(let i=0;i<=64;i++){const t=i/64,q=new T.Vector3().addScaledVector(A,(1-t)*(1-t)).addScaledVector(C,2*t*(1-t)).addScaledVector(B,t*t).multiplyScalar(1.003);P.push(q)}
 arcs.push(P);sph.add(new T.Line(new T.BufferGeometry().setFromPoints(P),lineMat(0x6dffd8,.4)))}
const pulses=[];arcs.forEach((_,i)=>{pulses.push({a:i,t:rnd(),s:.1+rnd()*.08},{a:i,t:rnd(),s:.07+rnd()*.06})});
const pg=pts(new Array(pulses.length*3).fill(0),11,pulses.map(()=>.25));sph.add(pg);
/* atmosphere + halo */
tilt.add(new T.Mesh(new T.SphereGeometry(1.14,64,48),new T.ShaderMaterial({uniforms:ATU,side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vN;uniform vec3 uC;void main(){float i=pow(clamp(-dot(vN,vec3(0.,0.,1.))/.5,0.,1.),2.5);gl_FragColor=vec4(uC,1.)*i*.55;}'})));
const halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,blending:T.AdditiveBlending,transparent:true,opacity:.45,depthWrite:false}));halo.scale.setScalar(3.6);halo.position.z=-1.3;tilt.add(halo);
/* perspective light line */
const lineG=new T.Group();scene.add(lineG);let curve,lsp=[];
function buildLine(w,h){lineG.children.slice().forEach(c=>{lineG.remove(c);c.geometry&&c.geometry.dispose();c.material.dispose()});
 const P=(a,b,z)=>new T.Vector3(a*w,b*h,z);
 curve=new T.CatmullRomCurve3([P(-.55,-.4,8),P(-.28,-.2,3.5),P(0,-.1,-3.5),P(.3,-.02,-12),P(.62,.08,-26),P(.95,.2,-45)]);
 [[.02,.9],[.1,.11]].forEach(([r,o])=>{const g=new T.TubeGeometry(curve,200,r,6,false),a=g.attributes.position,v=new T.Vector3();for(let i=0;i<=200;i++){const c=curve.getPointAt(i/200),s=Math.pow((DIST-c.z)/DIST,.6);for(let j=0;j<=6;j++){const n=i*7+j;v.fromBufferAttribute(a,n).sub(c).multiplyScalar(s).add(c);a.setXYZ(n,v.x,v.y,v.z)}}lineG.add(new T.Mesh(g,new T.MeshBasicMaterial({color:Th.x(0x66ffd6),transparent:true,opacity:o,blending:T.AdditiveBlending,depthWrite:false})))});
 lsp=[0,.5].map(()=>{const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,blending:T.AdditiveBlending,transparent:true,depthWrite:false}));s.scale.setScalar(.9);lineG.add(s);return s})}
function layout(){const w=hero.clientWidth,h=hero.clientHeight,asp=w/h;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setSize(w,h,false);
 cam.aspect=asp;cam.updateProjectionMatrix();const vh=2*Math.tan(FOV*Math.PI/360)*DIST,vw=vh*asp;
 let cx=.6,cy=.52,R=.215*vh;if(asp<.8){cx=.4;cy=asp>.6?.52:.49;R=Math.min(.34*vw,.17*vh)}else if(asp<1.4){cx=.58;R=Math.min(.2*vh,.15*vw)}
 tilt.position.set((cx-.5)*vw,(.5-cy)*vh,0);tilt.scale.setScalar(R);
 U.uPR.value=renderer.getPixelRatio()*Math.max(.8,Math.min(1.4,h/1080));buildLine(vw,vh)}
let mx=0,my=0,sx=0,sy=0,last=performance.now(),raf=0,run=false;
function draw(now,dt){const t=now/1000;U.uT.value=t;sph.rotation.y+=dt*.1;
 sx+=(mx-sx)*.05;sy+=(my-sy)*.05;const e=fx.p*fx.p;cam.position.set(sx*.5,-sy*.3,DIST-e*13);if(cam.fov!==FOV+e*40){cam.fov=FOV+e*40;cam.updateProjectionMatrix()}cam.lookAt(0,0,0);
 hero.style.setProperty('--mx',sx.toFixed(3));hero.style.setProperty('--my',sy.toFixed(3));
 const a=pg.geometry.attributes.position;pulses.forEach((p,i)=>{p.t=(p.t+dt*p.s)%1;const q=arcs[p.a][Math.floor(p.t*64)];a.setXYZ(i,q.x,q.y,q.z)});a.needsUpdate=true;
 lsp.forEach((s,i)=>{const k=(now*.00011+i*.5)%1;s.position.copy(curve.getPoint(k));s.material.opacity=Math.sin(Math.PI*k)*.9});
 renderer.render(scene,cam)}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;draw(now,dt)}
const start=()=>{if(!run&&!reduce&&!fx.paused){run=true;last=performance.now();raf=requestAnimationFrame(loop)}},stop=()=>{run=false;cancelAnimationFrame(raf)};fx.onPause=b=>b?stop():start();
layout();draw(2000,0);
new ResizeObserver(()=>{layout();if(!run)draw(2000,0)}).observe(hero);
if(!reduce){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*2;my=((e.clientY-r.top)/r.height-.5)*2});
 hero.addEventListener('pointerleave',()=>{mx=my=0});
 new IntersectionObserver(([e])=>e.isIntersecting?start():stop()).observe(hero);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start())}
addEventListener('pagehide',()=>{stop();scene.traverse(o=>{o.geometry&&o.geometry.dispose();const m=o.material;m&&(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});glowTex.dispose();renderer.dispose()});
const applyTheme=()=>{U.uA.value.set(...Th.f3(38,242,179));U.uB.value.set(...Th.f3(191,255,242));OCU.uC1.value.set(...Th.f3(5,26,22));OCU.uC2.value.set(...Th.f3(13,107,87));ATU.uC.value.set(...Th.f3(26,255,179));themed.forEach(([m,c])=>m.color.setHex(Th.x(c)));lineG.children.forEach(m=>{if(m.isMesh)m.material.color.setHex(Th.x(0x66ffd6))});paintGlow();if(!run)draw(2000,0)};
applyTheme();Th.on(applyTheme);
return true}
function globe2d(){
 const c=document.createElement('canvas');c.id='gl';c.className=cv.className;c.style.cssText=cv.style.cssText;c.setAttribute('aria-hidden','true');cv.replaceWith(c);cv=c;
 const g=c.getContext('2d');if(!g)return;seed=7;
 const N=2200,ga=Math.PI*(3-Math.sqrt(5)),P=[],H=[];
 for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),th=ga*i,p={x:Math.cos(th)*r,y,z:Math.sin(th)*r,ph:rnd()};p.l=land(p);if(p.l||i%3===0)P.push(p);if(p.l&&i%11===0)H.push(p)}
 const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),links=[];
 H.forEach(a=>H.map(b=>[b,d(a,b)]).filter(e=>e[1]>0&&e[1]<.42).sort((x,y)=>x[1]-y[1]).slice(0,3).forEach(([b])=>links.push([a,b])));
 const arcs=[];for(let n=0;n<9&&H.length>2;n++){let A,B,k=0;do{A=H[Math.floor(rnd()*H.length)];B=H[Math.floor(rnd()*H.length)];k++}while((d(A,B)<.8||d(A,B)>1.8)&&k<60);
  const D=d(A,B),m=Math.hypot(A.x+B.x,A.y+B.y,A.z+B.z)||1,C={x:(A.x+B.x)/m*(1+.5*D),y:(A.y+B.y)/m*(1+.5*D),z:(A.z+B.z)/m*(1+.5*D)},pts=[];
  for(let i=0;i<=48;i++){const t=i/48,u=1-t;pts.push({x:(u*u*A.x+2*u*t*C.x+t*t*B.x)*1.003,y:(u*u*A.y+2*u*t*C.y+t*t*B.y)*1.003,z:(u*u*A.z+2*u*t*C.z+t*t*B.z)*1.003})}arcs.push({pts,t:rnd(),s:.1+rnd()*.08})}
 let W=0,Hh=0,dpr=1,cx,cy,R,rot=0,mx=0,my=0,sx=0,sy=0,last=performance.now(),run=false,raf=0;
 const cr=(a,b,c2,d2,t)=>.5*(2*b+(-a+c2)*t+(2*a-5*b+4*c2-d2)*t*t+(-a+3*b-3*c2+d2)*t*t*t);
 const KP=[[-.08,.9],[.2,.75],[.45,.64],[.6,.58],[.8,.5],[1.08,.4]];
 function size(){W=hero.clientWidth;Hh=hero.clientHeight;dpr=Math.min(devicePixelRatio||1,1.75);c.width=W*dpr;c.height=Hh*dpr;const asp=W/Hh;
  cx=.6*W;cy=.52*Hh;R=.215*Hh;if(asp<.8){cx=.4*W;cy=(asp>.6?.52:.49)*Hh;R=Math.min(.34*W,.17*Hh)}else if(asp<1.4){cx=.58*W;R=Math.min(.2*Hh,.15*W)}}
 const ct=Math.cos(.4),st=Math.sin(.4),cX=Math.cos(.25),sX=Math.sin(.25);
 function pr(p){const ca=Math.cos(rot),sa=Math.sin(rot);let x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca,y=p.y;const y2=y*cX-z*sX,z2=y*sX+z*cX;const x3=x*ct-y2*st,y3=x*st+y2*ct;return{x:cx+x3*R,y:cy-y3*R,z:z2}}
 function line(pts,col,w){g.strokeStyle=col;g.lineWidth=w;g.beginPath();let on=false;pts.forEach(p=>{const q=pr(p);if(q.z>0){on?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y);on=true}else on=false});g.stroke()}
 function draw(now,dt){const t=now/1000;c.style.transform=fx.p?'scale('+(1+fx.p*fx.p*2.5)+')':'';rot+=dt*.1;sx+=(mx-sx)*.05;sy+=(my-sy)*.05;hero.style.setProperty('--mx',sx.toFixed(3));hero.style.setProperty('--my',sy.toFixed(3));
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,Hh);g.globalCompositeOperation='lighter';
  const ox=cx,oy=cy;cx+=sx*8;cy+=sy*5;
  let h=g.createRadialGradient(cx,cy,R*.8,cx,cy,R*1.9);h.addColorStop(0,Th.c(40,230,170,.28));h.addColorStop(1,Th.c(0,150,100,0));g.fillStyle=h;g.fillRect(0,0,W,Hh);
  g.globalCompositeOperation='source-over';
  /* light line: perspective curve, passes behind the sphere */
  const S=[];for(let i=0;i<=140;i++){const u=i/140*(KP.length-1),k=Math.min(KP.length-2,Math.floor(u)),f=u-k,a=KP[Math.max(0,k-1)],b=KP[k],c3=KP[k+1],e=KP[Math.min(KP.length-1,k+2)];S.push([cr(a[0],b[0],c3[0],e[0],f)*W,cr(a[1],b[1],c3[1],e[1],f)*Hh])}
  g.globalCompositeOperation='lighter';g.lineCap='round';
  for(let i=1;i<S.length;i++){const w=4.5-3.3*i/S.length;g.strokeStyle=Th.c(60,255,200,.12);g.lineWidth=w*4;g.beginPath();g.moveTo(S[i-1][0],S[i-1][1]);g.lineTo(S[i][0],S[i][1]);g.stroke();g.strokeStyle=Th.c(120,255,220,.9);g.lineWidth=w;g.stroke()}
  const lt=(now*.00011)%1,li=S[Math.floor(lt*140)];h=g.createRadialGradient(li[0],li[1],0,li[0],li[1],16);h.addColorStop(0,Th.c(200,255,240,Math.sin(Math.PI*lt)));h.addColorStop(1,Th.c(0,200,140,0));g.fillStyle=h;g.fillRect(li[0]-16,li[1]-16,32,32);
  g.globalCompositeOperation='source-over';
  /* sphere body */
  h=g.createRadialGradient(cx-R*.25,cy-R*.3,R*.1,cx,cy,R);h.addColorStop(0,Th.h('#0b2a24'));h.addColorStop(.75,Th.h('#061a16'));h.addColorStop(1,Th.h('#0a4a3c'));g.fillStyle=h;g.beginPath();g.arc(cx,cy,R*.985,0,7);g.fill();
  g.globalCompositeOperation='lighter';g.strokeStyle=Th.c(61,255,196,.45);g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,R*.985,0,7);g.stroke();
  /* grid */
  for(let a=0;a<12;a++){const pts=[];for(let i=0;i<=48;i++){const v=i/48*Math.PI*2-Math.PI,th=a/12*Math.PI;pts.push({x:Math.cos(v)*Math.cos(th),y:Math.sin(v),z:Math.cos(v)*Math.sin(th)})}line(pts,Th.c(31,214,160,.14),.8)}
  for(let a=-4;a<=4;a++){const y=a/5,r=Math.sqrt(1-y*y),pts=[];for(let i=0;i<=64;i++){const v=i/64*Math.PI*2;pts.push({x:Math.cos(v)*r,y,z:Math.sin(v)*r})}line(pts,Th.c(31,214,160,.14),.8)}
  /* links, arcs */
  g.strokeStyle=Th.c(61,255,196,.22);g.lineWidth=.8;links.forEach(([a,b])=>{const p=pr(a),q=pr(b);if(p.z>0&&q.z>0){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke()}});
  arcs.forEach(a=>line(a.pts,Th.c(109,255,216,.4),1));
  /* nodes */
  P.forEach(p=>{const q=pr(p);if(q.z<=0)return;const pl=.62+.38*Math.sin(t*1.7+p.ph*6.28),s=(p.l?1.5:.8)*pl*Math.max(.8,R/230);g.fillStyle=Th.c(120,255,215,(.35+.5*pl)*(.4+.6*q.z));g.beginPath();g.arc(q.x,q.y,s,0,7);g.fill()});
  H.forEach(p=>{const q=pr(p);if(q.z<=0)return;const pl=.62+.38*Math.sin(t*1.7+p.ph*6.28);g.fillStyle=Th.c(190,255,236,pl);g.beginPath();g.arc(q.x,q.y,2.6*pl,0,7);g.fill()});
  arcs.forEach(a=>{a.t=(a.t+dt*a.s)%1;const q=pr(a.pts[Math.floor(a.t*48)]);if(q.z>0){g.fillStyle=Th.c(220,255,245,.95);g.beginPath();g.arc(q.x,q.y,2.4,0,7);g.fill()}});
  g.globalCompositeOperation='source-over';cx=ox;cy=oy}
 const loop=now=>{raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;draw(now,dt)};
 const start=()=>{if(!run&&!reduce&&!fx.paused){run=true;last=performance.now();raf=requestAnimationFrame(loop)}},stop=()=>{run=false;cancelAnimationFrame(raf)};fx.onPause=b=>b?stop():start();
 size();draw(2000,0);Th.on(()=>{if(!run)draw(2000,0)});new ResizeObserver(()=>{size();if(!run)draw(2000,0)}).observe(hero);
 if(!reduce){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*2;my=((e.clientY-r.top)/r.height-.5)*2});hero.addEventListener('pointerleave',()=>{mx=my=0});
  new IntersectionObserver(([e])=>e.isIntersecting?start():stop()).observe(hero);document.addEventListener('visibilitychange',()=>document.hidden?stop():start())}
 addEventListener('pagehide',stop)}
let ok=false;try{ok=initGL()}catch(err){console.warn('WebGL init failed, using 2D fallback',err)}
if(!ok){const fresh=cv.cloneNode(false);cv.replaceWith(fresh);cv=fresh;globe2d()}
})();
