const host=document.querySelector("#space");
if(!host) throw new Error("Missing #space background host");

const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
if(!ctx) throw new Error("Canvas 2D context unavailable");
canvas.setAttribute("aria-hidden","true");
host.replaceChildren(canvas);

const motionToggle=document.querySelector("#motion-toggle");
const pointer={x:-1000,y:-1000,active:false};
let width=1,height=1,dpr=1,particles=[],raf=0,lastFrame=0;
let running=!reducedMotion;
let isMobile=matchMedia("(max-width: 900px)").matches;

const rand=(min,max)=>min+Math.random()*(max-min);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function createParticles(){
  const count=isMobile?190:340;
  particles=Array.from({length:count},()=>({
    x:rand(0,width),y:rand(0,height),
    homeX:0,homeY:0,
    vx:0,vy:0,
    size:rand(.65,1.65),
    alpha:rand(.28,.78),
    phase:rand(0,Math.PI*2),
    drift:rand(.12,.42),
    side:Math.random()<.5?0:1
  }));
  particles.forEach(p=>{p.homeX=p.x;p.homeY=p.y});
}

function resize(){
  width=Math.max(1,window.visualViewport?.width||window.innerWidth);
  height=Math.max(1,window.visualViewport?.height||window.innerHeight);
  isMobile=matchMedia("(max-width: 900px)").matches;
  const saveData=navigator.connection?.saveData===true;
  dpr=Math.min(window.devicePixelRatio||1,saveData?1:isMobile?1.25:1.5);
  canvas.width=Math.round(width*dpr);
  canvas.height=Math.round(height*dpr);
  canvas.style.width="100%";
  canvas.style.height="100%";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  createParticles();
  draw(0);
}

function draw(time){
  const t=time*.001;
  ctx.globalCompositeOperation="source-over";
  ctx.fillStyle="#08090b";
  ctx.fillRect(0,0,width,height);
  for(const p of particles){
    const driftX=Math.sin(t*p.drift+p.phase)*5;
    const driftY=Math.cos(t*p.drift*.8+p.phase)*4;
    const homeX=p.homeX+driftX;
    const homeY=p.homeY+driftY;

    if(pointer.active){
      const dx=p.x-pointer.x;
      const dy=p.y-pointer.y;
      const distance=Math.sqrt(dx*dx+dy*dy)||.001;
      const radius=isMobile?105:145;
      if(distance<radius){
        const force=(1-distance/radius)*.72;
        p.vx+=(dx/distance)*force;
        p.vy+=(dy/distance)*force;
      }
    }

    p.vx+=(homeX-p.x)*.012;
    p.vy+=(homeY-p.y)*.012;
    p.vx*=.91;
    p.vy*=.91;
    p.x+=p.vx;
    p.y+=p.vy;

    const pulse=.82+.18*Math.sin(t*1.1+p.phase);
    const alpha=p.alpha*pulse;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fillStyle=p.side===0
      ? "rgba(245,55,185,"+alpha+")"
      : "rgba(65,180,235,"+alpha+")";
    ctx.fill();
  }
}

function setMotionState(){
  if(!motionToggle)return;
  const label=running?"PAUSE MOTION":"RESUME MOTION";
  motionToggle.textContent=document.documentElement.lang==="hu"
    ?(running?"ANIMÁCIÓ SZÜNETELTETÉSE":"ANIMÁCIÓ FOLYTATÁSA")
    :label;
  motionToggle.setAttribute("aria-pressed",String(running));
  motionToggle.setAttribute("aria-label",running?"Pause background animation":"Resume background animation");
}

function animate(now){
  raf=requestAnimationFrame(animate);
  if(!running||document.hidden)return;
  const interval=reducedMotion?125:(isMobile?40:25);
  if(now-lastFrame<interval)return;
  lastFrame=now;
  draw(now);
}

if(motionToggle){
  motionToggle.addEventListener("click",()=>{
    running=!running;
    setMotionState();
    if(running){
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(animate);
    }else{
      cancelAnimationFrame(raf);
    }
  });
}

window.addEventListener("resize",resize,{passive:true});
window.visualViewport?.addEventListener("resize",resize,{passive:true});
window.addEventListener("orientationchange",resize,{passive:true});
window.addEventListener("pointermove",event=>{
  pointer.x=event.clientX;
  pointer.y=event.clientY;
  pointer.active=true;
},{passive:true});
window.addEventListener("pointerleave",()=>{
  pointer.active=false;
},{passive:true});
window.addEventListener("blur",()=>{pointer.active=false});
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden&&running){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(animate);
  }
});

setMotionState();
resize();
if(running)raf=requestAnimationFrame(animate);
console.info("BLACKMERQURY minimal interactive particle field initialized");
