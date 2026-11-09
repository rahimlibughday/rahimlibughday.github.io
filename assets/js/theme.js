(()=>{
const KEY='site-theme',root=document.documentElement,L=[],cache=new Map();
function rgb2hls(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
 if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[h,l,s]}
function hls2rgb(h,l,s){if(!s)return[l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t%1+1)%1;return(t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p)*255};return[f(h+1/3),f(h),f(h-1/3)]}
/* teal -> neon purple on matte black (same mapping the CSS variables use) */
function map(r,g,b){const k=r<<16|g<<8|b;let m=cache.get(k);if(m)return m;
 const[h0,l,s]=rgb2hls(r,g,b),hd=h0*360;let h2=h0,s2=s;
 if(s<.001){m=[r,g,b]}else{
  if(s<.25||(l<.25&&s<.35)){h2=270/360;s2=s<.25?s*.35:.12}else if(hd>=90&&hd<=260)h2=(272+(hd-170)*.4)/360;
  m=hls2rgb(h2,l,s2).map(x=>Math.max(0,Math.min(255,Math.round(x))))}
 cache.set(k,m);return m}
const T={name:'teal',
 m(r,g,b){return T.name==='purple'?map(r|0,g|0,b|0):[r|0,g|0,b|0]},
 c(r,g,b,a){const m=T.m(r,g,b);return'rgba('+m[0]+','+m[1]+','+m[2]+','+a+')'},
 h(s){if(T.name!=='purple')return s;const m=map(parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16));return'#'+m.map(x=>x.toString(16).padStart(2,'0')).join('')},
 x(n){const m=T.m(n>>16&255,n>>8&255,n&255);return m[0]<<16|m[1]<<8|m[2]},
 f3(r,g,b){return T.m(r,g,b).map(x=>x/255)},
 on(fn){L.push(fn)},
 set(n,fade){n=n==='purple'?'purple':'teal';if(fade){root.classList.add('tfade');setTimeout(()=>root.classList.remove('tfade'),800)}
  T.name=n;if(n==='purple')root.setAttribute('data-theme','purple');else root.removeAttribute('data-theme');
  try{localStorage.setItem(KEY,n)}catch(e){}
  const mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',n==='purple'?'#0d0c0e':'#0a0f10');
  const ic=document.querySelector('link[rel="icon"]');if(ic)ic.setAttribute('href',n==='purple'?'assets/favicon-purple.svg':'assets/favicon.svg');
  const b=document.getElementById('theme');if(b){b.setAttribute('aria-label',n==='purple'?'Switch to green palette':'Switch to purple palette');b.setAttribute('aria-pressed',String(n==='purple'))}
  L.forEach(f=>{try{f(n)}catch(e){}})},
 toggle(){T.set(T.name==='purple'?'teal':'purple',true)}};
window.Theme=T;
let saved='teal';try{saved=localStorage.getItem(KEY)==='purple'?'purple':'teal'}catch(e){}
T.name=saved;T.set(saved,false);
const btn=document.getElementById('theme');if(btn)btn.addEventListener('click',()=>T.toggle());
})();
