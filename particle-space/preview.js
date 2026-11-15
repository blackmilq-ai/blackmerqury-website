const host=document.querySelector("#space");
if(!host) throw new Error("Missing #space background host");
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
if(!ctx) throw new Error("Canvas 2D context unavailable");
canvas.setAttribute("aria-hidden","true");host.replaceChildren(canvas);
let width=1,height=1,dpr=1,raf=0,lastFrame=0,running=!reducedMotion;
let particles=[],hubs=[],dust=[],pointer={x:.5,y:.5,tx:.5,ty:.5};
let isMobile=matchMedia("(max-width: 900px)").matches;
const motionToggle=document.querySelector("#motion-toggle");
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function makeParticles(){
 const area=width*height,base=isMobile?Math.round(area/2100):Math.round(area/1250);
 const count=clamp(base,isMobile?300:560,isMobile?520:1050);
 particles=Array.from({length:count},()=>{const left=Math.random()<.48,x=left?rand(-.12,.56):rand(.38,1.12),depth=rand(.18,1);return{x,y:rand(-.08,1.08),ox:x,oy:0,depth,phase:rand(0,6.28),speed:rand(.45,1.3),radius:rand(.35,1.35),alpha:rand(.22,.8),group:left?0:1}});
 particles.forEach(p=>p.oy=p.y);
 hubs=Array.from({length:isMobile?16:28},(_,i)=>({x:i%2===0?rand(.02,.48):rand(.52,.98),y:rand(.04,.96),r:rand(2.2,5.5),phase:rand(0,6.28),group:i%2}));
 dust=Array.from({length:isMobile?150:320},()=>({x:Math.random(),y:Math.random(),r:rand(.3,1.7),phase:rand(0,6.28),alpha:rand(.12,.48),group:Math.random()<.48?0:1}));
}
function resize(){
 width=Math.max(1,visualViewport?.width||innerWidth);height=Math.max(1,visualViewport?.height||innerHeight);
 isMobile=matchMedia("(max-width: 900px)").matches;
 const saveData=navigator.connection?.saveData===true;
 dpr=Math.min(devicePixelRatio||1,saveData?1:isMobile?1.35:1.75);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 canvas.style.width="100%";canvas.style.height="100%";ctx.setTransform(dpr,0,0,dpr,0,0);
 makeParticles();render(0);
}
function glow(x,y,r,color,alpha){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,color.replace("A",String(alpha)));g.addColorStop(1,color.replace("A","0"));
 ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function render(time){
 const t=time*.001;ctx.globalCompositeOperation="source-over";ctx.fillStyle="#03070d";ctx.fillRect(0,0,width,height);
 glow(width*.72+Math.sin(t*.11)*width*.025,height*.48,width*.62,"rgba(0,190,220,A)",.32);
 glow(width*.43,height*.36,width*.34,"rgba(0,150,205,A)",.22);
 glow(width*.08,height*.44,width*.34,"rgba(240,25,175,A)",.22);
 glow(width*.18,height*.78,width*.27,"rgba(205,20,155,A)",.16);
 for(let i=0;i<26;i++){const x=((i*137.5)%100)/100*width+Math.sin(t*.12+i)*18,y=((i*71.3)%100)/100*height+Math.cos(t*.1+i)*14,r=(i%5+2)*(isMobile?3.2:5.5);glow(x,y,r,i%2?"rgba(0,205,235,A)":"rgba(235,40,180,A)",.055)}
 ctx.save();ctx.globalCompositeOperation="screen";
 for(let k=0;k<17;k++){
  const left=k<9,u=(k%9)/8,x0=left?-width*.12:width*.48+u*width*.7,y0=height*(left?.08+u*.92:u*.02),x1=left?width*(.2+u*.35):width*1.08,y1=height*(left?.24+u*.7:.12+u*.82),bend=Math.sin(t*.16+k*.7)*width*.035;
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(width*(left?.12:.58)+bend,y0-height*.18,width*(left?.16:.78)-bend,y1+height*.2,x1,y1);
  ctx.strokeStyle=left?"rgba(246,55,190,.19)":"rgba(0,190,240,.12)";ctx.lineWidth=left?(isMobile?1.2:2.2):(isMobile?.65:1.1);ctx.shadowBlur=left?13:9;ctx.shadowColor=left?"#ed39bd":"#00bde8";ctx.stroke();
 }
 ctx.restore();
 const pos=new Array(particles.length);
 for(let i=0;i<particles.length;i++){const p=particles[i],phase=t*p.speed*.48+p.phase;pos[i]={x:(p.ox+Math.sin(phase)*.018*p.depth+(pointer.x-.5)*.012*p.depth)*width,y:(p.oy+Math.cos(phase*.73+p.phase)*.016*p.depth+(pointer.y-.5)*.01*p.depth)*height,p}}
 const cell=Math.max(38,Math.min(72,width*.052)),buckets=new Map();
 for(let i=0;i<pos.length;i++){const p=pos[i],key=Math.floor(p.x/cell)+":"+Math.floor(p.y/cell);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i)}
 ctx.save();ctx.globalCompositeOperation="screen";ctx.lineWidth=.65;
 for(let i=0;i<pos.length;i++){
  const a=pos[i],gx=Math.floor(a.x/cell),gy=Math.floor(a.y/cell);
  for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const list=buckets.get((gx+ox)+":"+(gy+oy));if(!list)continue;
   for(const j of list){if(j<=i)continue;const b=pos[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy,limit=cell*cell*.9;if(d2<limit){const d=Math.sqrt(d2),same=a.p.group===b.p.group,alpha=(1-d/(cell*.95))*(same?.19:.07)*Math.min(a.p.depth,b.p.depth);ctx.strokeStyle=same?(a.p.group===0?"rgba(245,65,190,"+alpha+")":"rgba(0,190,235,"+alpha+")"):"rgba(105,155,205,"+(alpha*.55)+")";ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
  }
 }
 ctx.restore();ctx.save();ctx.globalCompositeOperation="screen";
 for(const q of pos){const p=q.p,pulse=.72+.28*Math.sin(t*1.7+p.phase),color=p.group===0?"rgba(255,65,205,A)":"rgba(0,205,255,A)",r=p.radius*(.65+p.depth*.45)*pulse;if(p.alpha>.48&&p.depth>.55)glow(q.x,q.y,r*(isMobile?5:7),color,.12*p.alpha);ctx.beginPath();ctx.arc(q.x,q.y,r,0,6.283);ctx.fillStyle=p.group===0?"rgba(255,105,220,"+(p.alpha*pulse)+")":"rgba(85,225,255,"+(p.alpha*pulse)+")";ctx.fill()}
 for(const h of hubs){const x=h.x*width+Math.sin(t*.22+h.phase)*8,y=h.y*height+Math.cos(t*.2+h.phase)*7,pulse=.7+.3*Math.sin(t*1.8+h.phase),r=h.r*pulse;glow(x,y,r*9,h.group===0?"rgba(255,45,195,A)":"rgba(0,205,245,A)",.38);ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fillStyle=h.group===0?"rgba(255,125,225,.95)":"rgba(115,235,255,.95)";ctx.fill()}
 for(const d of dust){const tw=.55+.45*Math.sin(t*1.25+d.phase),x=d.x*width+Math.sin(t*.13+d.phase)*5,y=d.y*height+Math.cos(t*.12+d.phase)*5;ctx.beginPath();ctx.arc(x,y,d.r,0,6.283);ctx.fillStyle=d.group===0?"rgba(255,105,220,"+(d.alpha*tw)+")":"rgba(80,220,255,"+(d.alpha*tw)+")";ctx.fill()}
 ctx.restore();
}
function setMotionState(){if(!motionToggle)return;motionToggle.textContent=document.documentElement.lang==="hu"?(running?"ANIMÁCIÓ SZÜNETELTETÉSE":"ANIMÁCIÓ FOLYTATÁSA"):(running?"PAUSE MOTION":"RESUME MOTION");motionToggle.setAttribute("aria-pressed",String(running));motionToggle.setAttribute("aria-label",running?"Pause background animation":"Resume background animation")}
function animate(now){raf=requestAnimationFrame(animate);if(!running||document.hidden)return;const interval=reducedMotion?125:isMobile?40:25;if(now-lastFrame<interval)return;lastFrame=now;render(now)}
if(motionToggle)motionToggle.addEventListener("click",()=>{running=!running;setMotionState();if(running){cancelAnimationFrame(raf);raf=requestAnimationFrame(animate)}else cancelAnimationFrame(raf)});
window.addEventListener("resize",resize,{passive:true});visualViewport?.addEventListener("resize",resize,{passive:true});window.addEventListener("orientationchange",resize,{passive:true});
window.addEventListener("pointermove",e=>{pointer.x=e.clientX/Math.max(1,width);pointer.y=e.clientY/Math.max(1,height)},{passive:true});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&running){cancelAnimationFrame(raf);raf=requestAnimationFrame(animate)}});
setMotionState();resize();if(running)raf=requestAnimationFrame(animate);
console.info("BLACKMERQURY adaptive magenta/cyan particle field initialized");
