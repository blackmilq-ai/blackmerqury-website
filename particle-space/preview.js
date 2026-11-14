import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const host=document.querySelector("#space");
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile=matchMedia("(max-width: 700px)").matches;
let renderer,scene,camera,points,material,geometry,trailPoints,trailGeometry,trailMaterial,trailPositions,trailLife,running=!reducedMotion,lastTime=0,mode=0,reducedQuality=true;
const pointer=new THREE.Vector2(1000,1000);
const targetPointer=new THREE.Vector2(1000,1000);
const clock=new THREE.Clock();
const TRAIL_COUNT=42;
let lastTrailPoint=new THREE.Vector3(1000,1000,0);

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
  const count=isMobile?(reducedQuality?4200:6500):(reducedQuality?8600:14000);
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


 // Cursor-driven particle afterglow: a short, fading chain of luminous points.
 trailPositions=new Float32Array(TRAIL_COUNT*3);
 trailLife=new Float32Array(TRAIL_COUNT);
 trailGeometry=new THREE.BufferGeometry();
 trailGeometry.setAttribute("position",new THREE.BufferAttribute(trailPositions,3));
 trailGeometry.setAttribute("aLife",new THREE.BufferAttribute(trailLife,1));
 const trailVertexShader=`
  attribute float aLife;
  varying float vLife;
  varying vec3 vTrailColor;
  uniform float uPointSize;
  void main(){
   vec4 mv=modelViewMatrix*vec4(position,1.0);
   gl_Position=projectionMatrix*mv;
   vLife=aLife;
   float perspective=34.0/max(1.0,-mv.z);
   gl_PointSize=max(.5,uPointSize*perspective*(.35+aLife*1.5));
   float flow=clamp((position.x+24.0)/48.0,0.0,1.0);
   vTrailColor=mix(vec3(1.0,.005,.58),vec3(.005,.32,1.0),smoothstep(.12,.9,flow));
  }`;
 const trailFragmentShader=`
  varying float vLife;
  varying vec3 vTrailColor;
  void main(){
   float d=length(gl_PointCoord-.5);
   float core=1.0-smoothstep(.02,.22,d);
   float glow=1.0-smoothstep(.08,.5,d);
   float alpha=(core+glow*.55)*vLife*.72;
   if(alpha<.008)discard;
   gl_FragColor=vec4(vTrailColor*(1.35+core*1.8),alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`;
 trailMaterial=new THREE.ShaderMaterial({
  uniforms:{uPointSize:{value:isMobile?1.9:2.4}},
  vertexShader:trailVertexShader,fragmentShader:trailFragmentShader,
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
 });
 trailPoints=new THREE.Points(trailGeometry,trailMaterial);
 trailPoints.frustumCulled=false;
 scene.add(trailPoints);

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
  for(let i=0;i<TRAIL_COUNT;i++)trailLife[i]=Math.max(0,trailLife[i]-.012);
  trailGeometry.attributes.aLife.needsUpdate=true;
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
  const nextPoint=new THREE.Vector3(nx*20,ny*12,1.7);
  if(lastTrailPoint.x>900||nextPoint.distanceToSquared(lastTrailPoint)>.035){
   for(let i=TRAIL_COUNT-1;i>0;i--){
    trailPositions[i*3]=trailPositions[(i-1)*3];
    trailPositions[i*3+1]=trailPositions[(i-1)*3+1];
    trailPositions[i*3+2]=trailPositions[(i-1)*3+2];
    trailLife[i]=trailLife[i-1]*.94;
   }
   trailPositions[0]=nextPoint.x;trailPositions[1]=nextPoint.y;trailPositions[2]=nextPoint.z;trailLife[0]=1.0;
   trailGeometry.attributes.position.needsUpdate=true;trailGeometry.attributes.aLife.needsUpdate=true;
   lastTrailPoint.copy(nextPoint);
  }
  material.uniforms.uPointerForce.value=.9;
 },{passive:true});
 addEventListener("pointerdown",()=>{
  material.uniforms.uPulse.value=1.0;
  material.uniforms.uPointerForce.value=1.25;
 },{passive:true});
 addEventListener("pointerleave",()=>{
  targetPointer.set(1000,1000);
  material.uniforms.uPointerForce.value=0;
  lastTrailPoint.set(1000,1000,0);
 },{passive:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&running)clock.start();});
 document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
  const selected=button.dataset.mode;
  mode=selected==="digital"?0:selected==="tattoo"?-.55:.65;
  material.uniforms.uMode.value=mode;
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
 }));
 document.querySelector("#motion-toggle").addEventListener("click",e=>{
  running=!running;e.currentTarget.textContent=running?"PAUSE MOTION":"RESUME MOTION";
  if(running){clock.start();animate();}
 });
 document.querySelector("#quality-toggle").addEventListener("click",e=>{
  const current=e.currentTarget.dataset.quality==="reduced";
  reducedQuality=!current;
  e.currentTarget.dataset.quality=reducedQuality?"reduced":"standard";
  buildParticles();
  e.currentTarget.textContent=reducedQuality?"STANDARD PARTICLES":"REDUCED PARTICLES";
 });
 if(reducedMotion)document.querySelector("#motion-toggle").textContent="RESUME MOTION";
 const qualityButton=document.querySelector("#quality-toggle");
 qualityButton.dataset.quality="reduced";
 animate();
}catch(error){fallback(error);}
