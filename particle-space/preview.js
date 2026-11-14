import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
const host=document.querySelector("#space"),reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,isMobile=matchMedia("(max-width: 700px)").matches;
const config={desktopCount:24000,mobileCount:7000,reducedCount:4800,cameraEase:.016,pointSize:isMobile?1.65:1.9};
let renderer,scene,camera,material,geometry,points,running=!reducedMotion,reducedQuality=isMobile,lastTime=0,mode=0;
const pointer=new THREE.Vector2(),targetPointer=new THREE.Vector2(),clock=new THREE.Clock();
function fallback(error){
 host.innerHTML="";const c=document.createElement("canvas");c.width=1200;c.height=800;const x=c.getContext("2d");
 const bg=x.createRadialGradient(600,520,20,600,450,680);bg.addColorStop(0,"rgba(25,45,255,.24)");bg.addColorStop(.48,"rgba(130,0,255,.12)");bg.addColorStop(1,"#08090b");x.fillStyle=bg;x.fillRect(0,0,1200,800);
 for(let layer=0;layer<5;layer++){x.beginPath();for(let px=0;px<=1200;px+=3){const y=470+layer*52+Math.sin(px*.009+layer)*85+Math.sin(px*.021+layer*1.7)*28;if(px===0)x.moveTo(px,y);else x.lineTo(px,y);for(let k=0;k<2;k++){x.fillStyle=layer%2?"rgba(255,0,190,.48)":"rgba(15,95,255,.52)";x.fillRect(px,y+(Math.random()-.5)*24,1.5,1.5);}}x.strokeStyle=layer%2?"rgba(255,0,190,.2)":"rgba(15,95,255,.22)";x.lineWidth=2;x.stroke();}
 host.appendChild(c);console.warn("Infinite Particle Space fallback:",error);
}
try{
 renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x08090b,1);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);camera.position.set(0,1.1,15);camera.lookAt(0,0,-2);
 const vertexShader=`
 uniform float uTime;uniform float uPointSize;uniform float uMode;
 attribute float aSeed;attribute float aSize;attribute float aBand;attribute float aHue;
 varying vec3 vColor;varying float vAlpha;varying float vGlow;
 void main(){
 float t=uTime;vec3 p=position;float band=aBand;float x=p.x;float depth=p.z;float phase=band*1.72+depth*.16;
 float broad=sin(x*.43+t*.16+phase)*1.55;float fine=sin(x*.91-t*.11+phase*1.8)*.48;float ripple=cos(x*.23+t*.12+phase*.7)*.72;float crest=sin(x*.31+t*.13+phase)*.5+.5;
 p.y+=broad+fine+ripple+(aSeed-.5)*.58;p.z+=sin(x*.28+t*.10+phase)*.95+cos(x*.62-t*.08+phase)*.25;p.x+=sin(t*.075+band*1.5)*.28;
 vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uPointSize*aSize*(36.0/max(1.0,-mv.z)),1.0,5.5);
 float blue=clamp(.5+p.y*.075+aHue*.23+uMode*.12,0.0,1.0);vec3 magenta=vec3(1.0,.005,.58);vec3 electricBlue=vec3(.015,.19,1.0);vec3 violet=vec3(.36,.035,1.0);
 vColor=mix(mix(electricBlue,violet,.36),magenta,blue);vGlow=smoothstep(.58,.98,crest);vAlpha=(.25+.75*aSeed)*smoothstep(-13.0,13.0,depth+14.0);vAlpha*=.58+.42*smoothstep(-5.0,4.0,p.y);
 }`;
 const fragmentShader=`
 varying vec3 vColor;varying float vAlpha;varying float vGlow;
 void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float core=1.0-smoothstep(.035,.19,d);float halo=1.0-smoothstep(.08,.5,d);float alpha=(core*.82+halo*.18)*vAlpha;if(alpha<.025)discard;
 vec3 color=mix(vColor,vec3(.78,.76,1.0),vGlow*.52);gl_FragColor=vec4(color*(.82+core*.8+vGlow*.42),alpha);#include <tonemapping_fragment>
 #include <colorspace_fragment>}`;
 function buildParticles(){
 if(points){scene.remove(points);geometry.dispose();material.dispose();}
 const count=reducedQuality?config.reducedCount:(isMobile?config.mobileCount:config.desktopCount);geometry=new THREE.BufferGeometry();
 const positions=new Float32Array(count*3),seeds=new Float32Array(count),sizes=new Float32Array(count),bands=new Float32Array(count),hues=new Float32Array(count);
 for(let i=0;i<count;i++){const k=i*3;positions[k]=(Math.random()-.5)*25;positions[k+1]=(Math.random()-.5)*.8;positions[k+2]=(Math.random()-.5)*19-2;seeds[i]=Math.random();sizes[i]=.45+Math.pow(Math.random(),1.8)*2.4;bands[i]=Math.floor(Math.random()*5);hues[i]=Math.random();}
 geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.setAttribute("aSeed",new THREE.BufferAttribute(seeds,1));geometry.setAttribute("aSize",new THREE.BufferAttribute(sizes,1));geometry.setAttribute("aBand",new THREE.BufferAttribute(bands,1));geometry.setAttribute("aHue",new THREE.BufferAttribute(hues,1));
 material=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPointSize:{value:config.pointSize},uMode:{value:0}},vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});points=new THREE.Points(geometry,material);scene.add(points);
 }
 buildParticles();
 function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,isMobile?1:1.5));renderer.setSize(innerWidth,innerHeight);}
 function animate(now=0){requestAnimationFrame(animate);if(!running||document.hidden)return;if(now-lastTime<(reducedQuality?32:16))return;lastTime=now;material.uniforms.uTime.value=clock.getElapsedTime();pointer.lerp(targetPointer,.022);camera.position.x+=(pointer.x*.48-camera.position.x)*config.cameraEase;camera.position.y+=(1.1+pointer.y*.24-camera.position.y)*config.cameraEase;camera.lookAt(pointer.x*.12,pointer.y*.08,-2);renderer.render(scene,camera);}
 addEventListener("resize",resize,{passive:true});addEventListener("pointermove",e=>{targetPointer.x=(e.clientX/innerWidth-.5)*2;targetPointer.y=-((e.clientY/innerHeight-.5)*2);},{passive:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&running)clock.start();});
 document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{const s=b.dataset.mode;mode=s==="digital"?0:s==="tattoo"?-.7:.8;material.uniforms.uMode.value=mode;document.querySelectorAll("[data-mode]").forEach(n=>n.setAttribute("aria-pressed",String(n===b)));}));
 document.querySelector("#motion-toggle").addEventListener("click",e=>{running=!running;e.currentTarget.textContent=running?"PAUSE MOTION":"RESUME MOTION";if(running){clock.start();animate();}});
 document.querySelector("#quality-toggle").addEventListener("click",e=>{reducedQuality=!reducedQuality;buildParticles();e.currentTarget.textContent=reducedQuality?"STANDARD PARTICLES":"REDUCED PARTICLES";});
 if(reducedMotion)document.querySelector("#motion-toggle").textContent="RESUME MOTION";animate();
}catch(error){fallback(error);}
