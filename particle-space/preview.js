const host=document.querySelector("#space");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile=window.matchMedia("(max-width: 700px)").matches;

// Lightweight 2D renderer used on iOS and as a recovery path if WebGL is unavailable.
function fallback(error){
 if(!host)return;
 host.replaceChildren();
 const canvas=document.createElement("canvas");
 const ctx=canvas.getContext("2d",{alpha:false});
 if(!ctx){host.style.background="radial-gradient(ellipse at 50% 55%,rgba(35,25,255,.2),rgba(255,0,168,.08) 45%,#08090b 100%)";return;}
 canvas.setAttribute("aria-hidden","true");
 host.appendChild(canvas);
 let width=0,height=0,dpr=1,frame=0,last=0,running=!reducedMotion,mode=0;
 const count=isMobile?180:360;
 const particles=Array.from({length:count},()=>({
  x:Math.random(),y:Math.random(),size:.45+Math.random()*1.2,
  phase:Math.random()*Math.PI*2,speed:.08+Math.random()*.2,
  alpha:.22+Math.random()*.55,blue:Math.random()>.52
 }));
 function resize(){
  width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
  dpr=Math.min(window.devicePixelRatio||1,isMobile?1:1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width="100%";canvas.style.height="100%";
  ctx.setTransform(dpr,0,0,dpr,0,0);draw(0);
 }
 function draw(time){
  ctx.fillStyle="#08090b";ctx.fillRect(0,0,width,height);
  const glow=ctx.createRadialGradient(width*.5,height*.55,8,width*.5,height*.55,Math.max(width,height)*.72);
  glow.addColorStop(0,mode===1?"rgba(255,0,168,.12)":"rgba(35,25,255,.13)");
  glow.addColorStop(.48,mode===2?"rgba(0,95,255,.09)":"rgba(255,0,168,.055)");
  glow.addColorStop(1,"rgba(8,9,11,0)");
  ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  for(const p of particles){
   const drift=time*.00012*p.speed;
   const x=(p.x*width+Math.sin(drift+p.phase)*width*.018+width)%width;
   const y=(p.y*height+Math.cos(drift*.8+p.phase)*height*.014+height)%height;
   const blue=mode===1?false:mode===2?true:p.blue;
   ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);
   ctx.fillStyle=blue?`rgba(35,115,255,${p.alpha})`:`rgba(238,35,165,${p.alpha})`;
   ctx.shadowColor=blue?"rgba(35,115,255,.75)":"rgba(238,35,165,.75)";
   ctx.shadowBlur=isMobile?3:5;ctx.fill();
  }
  ctx.shadowBlur=0;
 }
 function animate(time){
  frame=requestAnimationFrame(animate);
  if(!running||document.hidden)return;
  if(time-last<(isMobile?40:24))return;
  last=time;draw(time);
 }
 window.addEventListener("resize",resize,{passive:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&running){cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);}});
 document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
  mode=button.dataset.mode==="tattoo"?1:button.dataset.mode==="motion"?2:0;
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
  draw(performance.now());
 }));
 const motionToggle=document.querySelector("#motion-toggle");
 if(motionToggle){
  motionToggle.textContent=running?"PAUSE MOTION":"RESUME MOTION";
  motionToggle.addEventListener("click",()=>{
   running=!running;motionToggle.textContent=running?"PAUSE MOTION":"RESUME MOTION";
   if(running){cancelAnimationFrame(frame);frame=requestAnimationFrame(animate);}else cancelAnimationFrame(frame);
  });
 }
 resize();
 if(running)frame=requestAnimationFrame(animate);
 console.info("Particle field running in lightweight 2D compatibility mode.",error||"iOS compatibility");
}

const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
if(isIOS){
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
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.35));
  renderer.setSize(innerWidth,innerHeight);
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
   running=!running;e.currentTarget.textContent=running?"PAUSE MOTION":"RESUME MOTION";
   if(running){clock.start();animate();}
  });
  if(reducedMotion)motionToggle.textContent="RESUME MOTION";
 }
 animate();
}catch(error){fallback(error);}

}
