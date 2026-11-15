const host=document.querySelector("#space");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let isMobile=window.matchMedia("(max-width: 900px)").matches;

// Adaptive Canvas renderer for phones, tablets and devices without reliable WebGL.
function fallback(error){
 if(!host)return;
 host.replaceChildren();
 const canvas=document.createElement("canvas");
 const ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
 if(!ctx){host.style.background="radial-gradient(ellipse at 50% 55%,rgba(35,25,255,.2),rgba(255,0,168,.08) 45%,#08090b 100%)";return;}
 canvas.setAttribute("aria-hidden","true");
 host.appendChild(canvas);
 let width=0,height=0,dpr=1,frame=0,last=0,running=!reducedMotion,mode=0,particles=[],points=[];
 const motionToggle=document.querySelector("#motion-toggle");
 const deviceMemory=navigator.deviceMemory||4;
 function seedParticles(){
  const area=width*height;
  const base=Math.max(170,Math.min(440,Math.round(area/3600)));
  const count=Math.max(130,Math.round(base*(deviceMemory <= 2 ? 0.72 : deviceMemory <= 4 ? 0.88 : 1)));
  particles=Array.from({length:count},()=>({
   x:Math.random(),y:Math.random(),size:.45+Math.random()*1.15,
   phase:Math.random()*Math.PI*2,speed:.55+Math.random()*.95,
   alpha:.25+Math.random()*.55,blue:Math.random()>.52
  }));
  points=new Array(count);
 }
 function resize(){
  width=Math.max(1,window.visualViewport?.width||window.innerWidth);
  height=Math.max(1,window.visualViewport?.height||window.innerHeight);
  isMobile=window.matchMedia("(max-width: 900px)").matches;
  const saveData=navigator.connection?.saveData===true;
  dpr=Math.min(window.devicePixelRatio||1,saveData?1:isMobile?1.35:1.75);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width="100%";canvas.style.height="100%";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  seedParticles();draw(0);
 }
 function draw(time){
  ctx.fillStyle="#08090b";ctx.fillRect(0,0,width,height);
  const glow=ctx.createRadialGradient(width*.5,height*.55,8,width*.5,height*.55,Math.max(width,height)*.72);
  glow.addColorStop(0,mode===1?"rgba(255,0,168,.15)":"rgba(35,25,255,.15)");
  glow.addColorStop(.48,mode===2?"rgba(0,95,255,.11)":"rgba(255,0,168,.075)");
  glow.addColorStop(1,"rgba(8,9,11,0)");
  ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  const motionScale = reducedMotion ? 0.000035 : 0.00022;
  const maxLink=Math.max(38,Math.min(78,width*.065));
  for(let i=0;i<particles.length;i++){
   const p=particles[i],phase=time*motionScale*p.speed+p.phase;
   points[i]={
    x:p.x*width+Math.sin(phase)*width*.026,
    y:p.y*height+Math.cos(phase*.72+p.phase)*height*.022,
    blue:mode===1?false:mode===2?true:p.blue,
    alpha:p.alpha,size:p.size
   };
  }
  // Sparse, constantly changing connections create the wireframe field.
  ctx.lineWidth=.55;
  for(let i=0;i<points.length;i++){
   const p=points[i];
   for(let j=i+1;j<points.length;j++){
    const q=points[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
    if(d<maxLink){
     ctx.strokeStyle=`rgba(105,112,210,${(1-d/maxLink)*.13})`;
     ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    }
   }
  }
  for(const p of points){
   const blue=p.blue;
   ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
   ctx.fillStyle=blue?`rgba(35,125,255,${p.alpha})`:`rgba(238,35,165,${p.alpha})`;
   ctx.shadowColor=blue?"rgba(35,115,255,.8)":"rgba(238,35,165,.8)";
   ctx.shadowBlur=isMobile?3:6;ctx.fill();
  }
  ctx.shadowBlur=0;
 }
 function animate(time){
  frame=requestAnimationFrame(animate);
  if(!running||document.hidden)return;
  const interval=reducedMotion?125:isMobile?40:24;
  if(time-last<interval)return;
  last=time;draw(time);
 }
 function setMotionState(){
  if(motionToggle){
   motionToggle.textContent=document.documentElement.lang==="hu"?(running?"ANIMÁCIÓ SZÜNETELTETÉSE":"ANIMÁCIÓ FOLYTATÁSA"):(running?"PAUSE MOTION":"RESUME MOTION");
   motionToggle.setAttribute("aria-pressed",String(running));
   motionToggle.setAttribute("aria-label",running?"Pause background animation":"Resume background animation");
  }
 }
 window.addEventListener("resize",resize,{passive:true});
 window.visualViewport?.addEventListener("resize",resize,{passive:true});
 window.addEventListener("orientationchange",resize,{passive:true});
 document.addEventListener("visibilitychange",()=>{
  if(!document.hidden&&running){cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);}
 });
 document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
  mode=button.dataset.mode==="tattoo"?1:button.dataset.mode==="motion"?2:0;
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  draw(performance.now());
 }));
 if(motionToggle)motionToggle.addEventListener("click",()=>{
  running=!running;setMotionState();
  if(running){cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);}else cancelAnimationFrame(frame);
 });
 setMotionState();resize();
 if(running)frame=requestAnimationFrame(animate);
 console.info("Adaptive particle field: Canvas mode.",error||"mobile / low-power device");
}
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const lowPower=(navigator.deviceMemory||4)<=3||navigator.connection?.saveData===true;
if(isIOS||isMobile||lowPower){
 fallback("iOS Safari uses the lightweight 2D renderer to avoid WebGL preview failures.");
}else{
try{
 const THREE=await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
 let renderer,scene,camera,points,material,geometry,running=!reducedMotion,lastTime=0,mode=0;
 const pointer=new THREE.Vector2(1000,1000);
 const targetPointer=new THREE.Vector2(1000,1000);
 const clock=new THREE.Clock();
 renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.35));
 renderer.setSize(innerWidth,innerHeight);
 renderer.setClearColor(0x08090b,1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 host.appendChild(renderer.domElement);
 renderer.domElement.addEventListener("webglcontextlost",event=>{
  event.preventDefault();
  fallback("WebGL context lost; switched to adaptive Canvas rendering.");
 },{once:true});

 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);
 camera.position.set(0,0,22);
 camera.lookAt(0,0,0);

 const vertexShader=`
 uniform float uTime;
 uniform float uPointSize;
 uniform vec2 uPointer;
 uniform float uPointerForce;
 uniform float uPulse;
 uniform float uMode;
 attribute float aSeed;
 varying vec3 vColor;
 varying float vAlpha;
 varying float vQuiet;
 varying vec2 vVelocity;

 vec3 fieldPosition(vec3 seed,float t){
   vec3 p=seed;
   float a=sin(seed.x*.34+t*.20+sin(seed.y*.22-t*.11)*1.6);
   float b=cos(seed.y*.38-t*.16+sin(seed.z*.31+t*.09)*1.4);
   float c=sin(seed.z*.52+seed.x*.19+t*.13);
   float swirl=sin(seed.x*.17+seed.y*.21+seed.z*.25-t*.12);
   p.x+=a*1.15+sin(seed.z*.7+t*.22)*.34;
   p.y+=b*.92+cos(seed.x*.48-t*.18)*.3;
   p.z+=c*1.35+swirl*.75;
   return p;
 }

 void main(){
   float t=uTime;
   vec3 p=fieldPosition(position,t);
   vec3 prev=fieldPosition(position,t-.035);
   vec3 velocity=p-prev;

   vec2 pointerDelta=p.xy-uPointer;
   float distanceToPointer=max(length(pointerDelta),.001);
   float repel=exp(-distanceToPointer*distanceToPointer*.055)*uPointerForce;
   p.xy+=(pointerDelta/distanceToPointer)*repel*2.25;
   p.z+=repel*1.15;
   float pulse=uPulse*exp(-abs(distanceToPointer-2.4)*1.1);
   p.z+=pulse*sin(distanceToPointer*2.6-t*4.0)*1.1;

   vec4 mv=modelViewMatrix*vec4(p,1.0);
   gl_Position=projectionMatrix*mv;
   float perspective=34.0/max(1.0,-mv.z);
   gl_PointSize=clamp(uPointSize*perspective*(.65+aSeed*.9),.65,4.2);

   float colorFlow=clamp(((position.x+24.0)/48.0+(position.y+14.5)/29.0)*.5,0.0,1.0);
   vec3 magenta=vec3(1.0,.005,.56);
   vec3 violet=vec3(.56,.015,.95);
   vec3 blue=vec3(.005,.30,1.0);
   vec3 color=mix(magenta,violet,smoothstep(.08,.58,colorFlow));
   color=mix(color,blue,smoothstep(.42,.92,colorFlow));
   float blueCorner=smoothstep(.28,1.0,colorFlow)*smoothstep(-2.0,12.0,position.x)*smoothstep(-4.0,11.0,position.y);
   color=mix(color,vec3(.0,.42,1.0),blueCorner*.45);

   float quiet=1.0-smoothstep(.15,1.0,length(p.xy*vec2(.72,1.05)));
   float depthFade=smoothstep(-13.0,13.0,p.z)*.35+.65;
   float speed=length(velocity);
   color*=1.12+speed*.32+uMode*.045;
   color*=1.0-quiet*.94;
   vColor=color;
   vQuiet=quiet;
   vVelocity=velocity.xy;
   vAlpha=(.28+aSeed*.48+min(speed*.12,.22))*depthFade*(1.0-quiet*.96);
 }
 `;

 const fragmentShader=`
 varying vec3 vColor;
 varying float vAlpha;
 varying float vQuiet;
 varying vec2 vVelocity;
 void main(){
   vec2 q=gl_PointCoord-.5;
   float speed=length(vVelocity);
   float angle=atan(vVelocity.y,vVelocity.x);
   mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
   vec2 r=rot*q;
   float stretch=1.0+min(speed*1.8,.9);
   float d=length(vec2(r.x/stretch,r.y));
   float core=1.0-smoothstep(.025,.16,d);
   float halo=1.0-smoothstep(.10,.48,d);
   float bloom=1.0-smoothstep(.20,.72,d);
   float alpha=(core+halo*.48+bloom*.22)*vAlpha;
   if(alpha<.009)discard;
   gl_FragColor=vec4(vColor*(1.2+core*1.8+bloom*.7),alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
 }
 `;

 function buildParticles(){
  if(points){scene.remove(points);geometry.dispose();material.dispose();}
  const count=isMobile?2100:4300;
  const positions=new Float32Array(count*3);
  const seeds=new Float32Array(count);
  for(let i=0;i<count;i++){
   const j=i*3;
   // A loose volumetric cloud with more particles around the flowing mid-plane.
   const x=(Math.random()-.5)*48;
   const y=(Math.random()-.5)*29;
   const z=(Math.random()-.5)*13;
   positions[j]=x;
   positions[j+1]=y;
   positions[j+2]=z;
   seeds[i]=Math.random();
  }
  geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  geometry.setAttribute("aSeed",new THREE.BufferAttribute(seeds,1));
  material=new THREE.ShaderMaterial({
   uniforms:{
    uTime:{value:0},
    uPointSize:{value:isMobile?1.15:1.35},
    uPointer:{value:new THREE.Vector2(1000,1000)},
    uPointerForce:{value:0},
    uPulse:{value:0},
    uMode:{value:0}
   },
   vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  points=new THREE.Points(geometry,material);
  scene.add(points);
 }
 buildParticles();


 function resize(){
  const previousMobile=isMobile;
  isMobile=window.matchMedia("(max-width: 900px)").matches;
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  const saveData=navigator.connection?.saveData===true;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,saveData?1:isMobile?1.2:1.6));
  renderer.setSize(innerWidth,innerHeight);
  if(previousMobile!==isMobile)buildParticles();
 }
 function animate(now=0){
  requestAnimationFrame(animate);
  if(!running||document.hidden)return;
  if(now-lastTime< (isMobile?32:16))return;
  lastTime=now;
  const t=clock.getElapsedTime();
  pointer.lerp(targetPointer,.12);
  material.uniforms.uTime.value=t;
  material.uniforms.uPointer.value.copy(pointer);
  material.uniforms.uPulse.value*=.94;
  camera.position.x+=(pointer.x*.055-camera.position.x)*.035;
  camera.position.y+=(pointer.y*.055-camera.position.y)*.035;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 addEventListener("resize",resize,{passive:true});
 addEventListener("pointermove",e=>{
  const nx=(e.clientX/innerWidth-.5)*2;
  const ny=-((e.clientY/innerHeight-.5)*2);
  targetPointer.set(nx*20,ny*12);
  material.uniforms.uPointerForce.value=1.15;
 },{passive:true});
 addEventListener("pointerdown",()=>{
  material.uniforms.uPulse.value=1.0;
  material.uniforms.uPointerForce.value=1.25;
 },{passive:true});
 addEventListener("pointerleave",()=>{
  targetPointer.set(1000,1000);
  material.uniforms.uPointerForce.value=0;
 },{passive:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&running)clock.start();});
 document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
  const selected=button.dataset.mode;
  mode=selected==="digital"?0:selected==="tattoo"?-.55:.65;
  material.uniforms.uMode.value=mode;
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
 }));
 const motionToggle=document.querySelector("#motion-toggle");
 if(motionToggle){
  motionToggle.addEventListener("click",e=>{
   running=!running;e.currentTarget.textContent=document.documentElement.lang==="hu"?(running?"ANIMÁCIÓ SZÜNETELTETÉSE":"ANIMÁCIÓ FOLYTATÁSA"):(running?"PAUSE MOTION":"RESUME MOTION");
   e.currentTarget.setAttribute("aria-pressed",String(running));
   e.currentTarget.setAttribute("aria-label",running?"Pause background animation":"Resume background animation");
   if(running){clock.start();animate();}
  });
  motionToggle.textContent=document.documentElement.lang==="hu"?(running?"ANIMÁCIÓ SZÜNETELTETÉSE":"ANIMÁCIÓ FOLYTATÁSA"):(running?"PAUSE MOTION":"RESUME MOTION");
  motionToggle.setAttribute("aria-pressed",String(running));
  motionToggle.setAttribute("aria-label",running?"Pause background animation":"Resume background animation");
 }
 animate();
}catch(error){fallback(error);}

}
