import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const host=document.querySelector("#space");
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile=matchMedia("(max-width: 700px)").matches;
let renderer,scene,camera,points,material,geometry,running=!reducedMotion,lastTime=0,mode=0;
const pointer=new THREE.Vector2(1000,1000);
const targetPointer=new THREE.Vector2(1000,1000);
const clock=new THREE.Clock();

function fallback(error){
 host.innerHTML="";
 const c=document.createElement("canvas");c.width=1200;c.height=800;
 const ctx=c.getContext("2d");
 const bg=ctx.createRadialGradient(600,420,20,600,420,700);
 bg.addColorStop(0,"rgba(35,25,255,.2)");bg.addColorStop(.48,"rgba(255,0,168,.08)");bg.addColorStop(1,"#08090b");
 ctx.fillStyle=bg;ctx.fillRect(0,0,1200,800);
 for(let i=0;i<2600;i++){
  const x=Math.random()*1200,y=Math.random()*800;
  ctx.fillStyle=x/1200+y/800>1?"rgba(8,124,255,.6)":"rgba(255,0,168,.6)";
  ctx.fillRect(x,y,1.5,1.5);
 }
 host.appendChild(c);console.warn("Particle field fallback:",error);
}

try{
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
  pointer.lerp(targetPointer,.055);
  material.uniforms.uTime.value=t;
  material.uniforms.uPointer.value.copy(pointer);
  material.uniforms.uPulse.value*=.94;
  camera.position.x+=(pointer.x*.025-camera.position.x)*.012;
  camera.position.y+=(pointer.y*.025-camera.position.y)*.012;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 addEventListener("resize",resize,{passive:true});
 addEventListener("pointermove",e=>{
  const nx=(e.clientX/innerWidth-.5)*2;
  const ny=-((e.clientY/innerHeight-.5)*2);
  targetPointer.set(nx*20,ny*12);
  material.uniforms.uPointerForce.value=.9;
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
