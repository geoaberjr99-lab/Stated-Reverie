const b=document.querySelector('.menu-toggle'),n=document.querySelector('.site-nav');b?.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o))});document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click',()=>n.classList.remove('open')));if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const w=[...document.querySelectorAll('.watermark')];addEventListener('scroll',()=>{const y=scrollY;w.forEach((m,i)=>m.style.transform=`translateY(${y*.025*(i%2? -1:1)}px) rotate(${i%2?5:-3}deg)`)},{passive:true})}

// V38 — natural hourglass grains mapped to the ACTUAL CSS background-position and cover crop.
(()=>{
  const hero=document.querySelector('.hero');
  const canvas=document.querySelector('.hourglass-sand-canvas');
  if(!hero||!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx=canvas.getContext('2d');
  const IW=1672, IH=819;
  // Measured directly from assets/hero-hourglass.jpg.
  const throat={x:974,y:374}, landingY=625;
  const grains=Array.from({length:34},(_,i)=>({
    p:(i/34+Math.random()*.12)%1,
    speed:.0028+Math.random()*.0025,
    drift:(Math.random()-.5)*8,
    size:.55+Math.random()*1.15,
    alpha:.34+Math.random()*.55
  }));
  let W=0,H=0,dpr=1,last=performance.now();
  function resize(){
    const r=hero.getBoundingClientRect(); W=r.width; H=r.height;
    dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function map(x,y){
    const sc=Math.max(W/IW,H/IH);
    const rw=IW*sc, rh=IH*sc;
    // Match CSS background-position exactly.  The site uses center 44% on desktop
    // and 60% 44% on smaller screens, so assuming 50%/50% shifts the overlay.
    const bp=getComputedStyle(hero).backgroundPosition.trim().split(/\s+/);
    const pct=v=>v&&v.endsWith('%')?parseFloat(v)/100:0.5;
    const px=pct(bp[0]), py=pct(bp[1]||'50%');
    return {x:(W-rw)*px+x*sc,y:(H-rh)*py+y*sc,s:sc};
  }
  function frame(now){
    const dt=Math.min(32,now-last); last=now;
    ctx.clearRect(0,0,W,H);
    for(const g of grains){
      g.p=(g.p+g.speed*dt)%1;
      // Slight acceleration makes the grains feel like falling sand, not a conveyor belt.
      const t=g.p, fall=t*t*(3-2*t);
      const sy=throat.y+(landingY-throat.y)*fall;
      const sx=throat.x+g.drift*Math.sin(t*Math.PI);
      const m=map(sx,sy);
      const fade=Math.min(1,t/.08,(1-t)/.12);
      ctx.beginPath();
      ctx.fillStyle=`rgba(244,190,92,${g.alpha*Math.max(0,fade)})`;
      ctx.arc(m.x,m.y,Math.max(.45,g.size*m.s),0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize',resize,{passive:true}); requestAnimationFrame(frame);
})();

// V41 — opening-page Memory Frame crossfade. Auto-advances every 3 seconds,
// pauses for hover/focus, and becomes manual-only for reduced-motion visitors.
(()=>{
  const rotator=document.querySelector('.memory-frame-rotator');
  if(!rotator) return;
  const slides=[...rotator.querySelectorAll('.rotator-slide')];
  const captions=['Family Tree','Music & CD','Heirloom Watch','Illuminated Lithophane','Event Keepsake','Pocket Watch'];
  const caption=rotator.querySelector('#rotator-caption');
  const dotsWrap=rotator.querySelector('.rotator-dots');
  const prev=rotator.querySelector('.rotator-prev');
  const next=rotator.querySelector('.rotator-next');
  let index=0,timer=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dots=slides.map((_,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='rotator-dot'+(i===0?' active':'');
    b.setAttribute('aria-label',`Show ${captions[i]}`); b.addEventListener('click',()=>{show(i);restart()}); dotsWrap.appendChild(b); return b;
  });
  function show(i){index=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===index));dots.forEach((d,n)=>d.classList.toggle('active',n===index));caption.textContent=captions[index]}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  function start(){if(!reduced&&!timer)timer=setInterval(()=>show(index+1),3000)}
  function restart(){stop();start()}
  prev?.addEventListener('click',()=>{show(index-1);restart()}); next?.addEventListener('click',()=>{show(index+1);restart()});
  rotator.addEventListener('mouseenter',stop); rotator.addEventListener('mouseleave',start); rotator.addEventListener('focusin',stop); rotator.addEventListener('focusout',start);
  start();
})();
