import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const host=document.querySelector("#space");
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile=matchMedia("(max-width: 700px)").matches;
let renderer,scene,camera,material,geometry,points;
let running=!reducedMotion,reducedQuality=isMobile,lastTime=0,mode=0;
const pointer=new THREE.Vector2(),targetPointer=new THREE.Vector2(100,100),clock=new THREE.Clock();

function fallback(error){
 host.innerHTML="";
 const c=document.createElement("canvas");c.width=1200;c.height=800;
 const ctx=c.getContext("2d");
 const bg=ctx.createRadialGradient(600,500,20,600,420,700);
 bg.addColorStop(0,"rgba(35,25,255,.24)");bg.addColorStop(.5,"rgba(255,0,168,.08)");bg.addColorStop(1,"#08090b");
 ctx.fillStyle=bg;ctx.fillRect(0,0,1200,800);
 for(let row=0;row<8;row++){
  ctx.beginPath();
  for(let x=0;x<=1200;x+=2){
   const y=420+row*20+Math.sin(x*.008+row*.55)*65+Math.sin(x*.019-row*.8)*22;
   if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   if(Math.random()>.48){ctx.fillStyle=row%2?"rgba(255,0,168,.5)":"rgba(8,124,255,.58)";ctx.fillRect(x,y+(Math.random()-.5)*8,1.5,1.5);}
  }
  ctx.strokeStyle="rgba(130,90,255,.12)";ctx.stroke();
 }
 host.appendChild(c);console.warn("Particle Projection fallback:",error);
}

try{
 renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.5));
 renderer.setSize(innerWidth,innerHeight);
 renderer.setClearColor(0x08090b,1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 host.appendChild(renderer.domElement);

 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,100);
 camera.position.set(0,-5.1,14.2);
 camera.lookAt(0,0,0);

 const vertexShader=`
 uniform float uTime;
 uniform float uPointSize;
 uniform float uMode;
 uniform vec2 uPointer;
 uniform float uPointerForce;
 uniform float uPointerPulse;
 attribute float aRandom;
 varying vec3 vColor;
 varying float vAlpha;
 varying float vHeight;

 float waveField(vec2 p,float t){
   vec2 flow=p+vec2(sin(p.y*.18+t*.08),cos(p.x*.13-t*.06))*1.15;
   float broad=sin(flow.x*.48+t*.15+sin(flow.y*.28-t*.07)*1.8);
   float crossWave=sin(flow.y*.43-t*.11+sin(flow.x*.19+t*.06)*1.4);
   float ridge=sin(flow.x*.92+flow.y*.34+t*.12);
   float detail=sin(flow.x*1.7-flow.y*.72+t*.09);
   float swell=sin((flow.x+flow.y)*.22-t*.055);
   return broad*1.05+crossWave*.52+ridge*.22+detail*.075+swell*.24;
 }

 void main(){
   vec3 p=position;
   float t=uTime;
   vec2 delta=p.xy-uPointer;
   float dist=max(length(delta),.001);
   float influence=exp(-dist*dist*.11)*uPointerForce;
   p.xy+=(delta/dist)*influence*1.25;
   p.z+=influence*(.9+sin(t*3.0-dist*1.25)*.35);
   float pulse=uPointerPulse*exp(-abs(dist-2.0)*1.4);
   p.z+=pulse*sin(dist*3.0-t*5.0)*.9;

   float h=waveField(p.xy,t);
   p.z+=h*1.72;
   p.z+=sin(p.x*.16+p.y*.12+t*.07)*.42;

   vec4 mv=modelViewMatrix*vec4(p,1.0);
   gl_Position=projectionMatrix*mv;
   float perspective=30.0/max(1.0,-mv.z);
   gl_PointSize=clamp(uPointSize*perspective*(.68+aRandom*.75),.9,4.8);

   float heightMix=clamp(.5+h*.23,0.0,1.0);
   float densityNoise=sin(p.x*.31+sin(p.y*.27+t*.04)*2.0)*.5+.5;
   densityNoise*=.62+.38*(sin(p.y*.19-p.x*.11)+1.0)*.5;
   float keep=step(.18+aRandom*.45,densityNoise);

   vec3 blue=vec3(.012,.19,1.0);
   vec3 magenta=vec3(1.0,0.0,.57);
   vec3 violet=vec3(.34,.035,.95);
   vec3 color=mix(blue,magenta,clamp(heightMix*.72+uMode*.12,0.0,1.0));
   color=mix(color,violet,.22+heightMix*.16);
   float crest=smoothstep(.72,1.38,h);
   color=mix(color,vec3(.78,.82,1.0),crest*.78);

   vColor=color;
   vHeight=h;
   vAlpha=(.38+aRandom*.62)*keep*smoothstep(-2.0,25.0,-mv.z);
 }
 `;

 const fragmentShader=`
 varying vec3 vColor;
 varying float vAlpha;
 varying float vHeight;
 void main(){
   vec2 q=gl_PointCoord-.5;
   float d=length(q);
   float core=1.0-smoothstep(.04,.22,d);
   float halo=1.0-smoothstep(.08,.5,d);
   float alpha=(core*.88+halo*.20)*vAlpha;
   if(alpha<.018)discard;
   gl_FragColor=vec4(vColor*(.85+core*1.0),alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
 }
 `;

 function buildGrid(){
  if(points){scene.remove(points);geometry.dispose();material.dispose();}
  const cols=reducedQuality?(isMobile?82:118):(isMobile?132:246);
  const rows=reducedQuality?(isMobile?50:72):(isMobile?82:154);
  const count=cols*rows;
  const positions=new Float32Array(count*3);
  const randoms=new Float32Array(count);
  let k=0;
  for(let y=0;y<rows;y++){
   for(let x=0;x<cols;x++){
    const i=k*3;
    positions[i]=(x/(cols-1)-.5)*48;
    positions[i+1]=(y/(rows-1)-.5)*29;
    positions[i+2]=0;
    randoms[k]=Math.random();
    k++;
   }
  }
  geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  geometry.setAttribute("aRandom",new THREE.BufferAttribute(randoms,1));
  material=new THREE.ShaderMaterial({
   uniforms:{
    uTime:{value:0},uPointSize:{value:isMobile?1.85:1.95},uMode:{value:0},
    uPointer:{value:new THREE.Vector2(1000,1000)},uPointerForce:{value:0},uPointerPulse:{value:0}
   },
   vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  points=new THREE.Points(geometry,material);
  scene.add(points);
 }
 buildGrid();

 function resize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.5));
  renderer.setSize(innerWidth,innerHeight);
 }
 function animate(now=0){
  requestAnimationFrame(animate);
  if(!running||document.hidden)return;
  if(now-lastTime<(reducedQuality?32:16))return;
  lastTime=now;
  const t=clock.getElapsedTime();
  material.uniforms.uTime.value=t;
  pointer.lerp(targetPointer,.06);
  material.uniforms.uPointer.value.set(pointer.x*24,pointer.y*14.5);
  material.uniforms.uPointerPulse.value*=.94;
  camera.position.x+=(pointer.x*.22-camera.position.x)*.012;
  camera.position.y+=(-5.1+pointer.y*.08-camera.position.y)*.012;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 addEventListener("resize",resize,{passive:true});
 addEventListener("pointermove",e=>{
  targetPointer.x=(e.clientX/innerWidth-.5)*2;
  targetPointer.y=-((e.clientY/innerHeight-.5)*2);
  material.uniforms.uPointerForce.value=.85;
 },{passive:true});
 addEventListener("pointerdown",()=>{
  material.uniforms.uPointerPulse.value=1.0;
  material.uniforms.uPointerForce.value=1.0;
 },{passive:true});
 addEventListener("pointerleave",()=>{
  targetPointer.set(100,100);
  material.uniforms.uPointerForce.value=0;
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
  reducedQuality=!reducedQuality;buildGrid();
  e.currentTarget.textContent=reducedQuality?"STANDARD GRID":"REDUCED GRID";
 });
 if(reducedMotion)document.querySelector("#motion-toggle").textContent="RESUME MOTION";
 animate();
}catch(error){fallback(error);}
