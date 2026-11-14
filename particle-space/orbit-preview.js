import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const host=document.querySelector("#space");
const mobile=matchMedia("(max-width:700px)").matches;
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer,scene,camera,points,material,geometry;
let running=!reducedMotion,reduced=!mobile;
const uniforms={time:{value:0}};
const TAU=Math.PI*2;

function buildField(){
  const innerCount=reduced?(mobile?9000:18000):(mobile?18000:50000);
  const outerCount=reduced?(mobile?16000:32000):(mobile?42000:100000);
  const count=innerCount+outerCount;
  const positions=new Float32Array(count*3);
  const sizes=new Float32Array(count);
  const shifts=new Float32Array(count*4);
  let k=0;
  function addPoint(x,y,z){
    const i=k*3;positions[i]=x;positions[i+1]=y;positions[i+2]=z;
    sizes[k]=Math.random()*1.5+.5;
    const s=k*4;
    shifts[s]=Math.random()*Math.PI;
    shifts[s+1]=Math.random()*TAU;
    shifts[s+2]=(Math.random()*.9+.1)*Math.PI*.1;
    shifts[s+3]=Math.random()*.9+.1;
    k++;
  }
  for(let i=0;i<innerCount;i++){
    const v=new THREE.Vector3().randomDirection().multiplyScalar(Math.random()*.5+9.5);
    addPoint(v.x,v.y,v.z);
  }
  for(let i=0;i<outerCount;i++){
    const rand=Math.pow(Math.random(),1.5),r=10,R=40;
    const radius=Math.sqrt(R*R*rand+(1-rand)*r*r);
    const theta=Math.random()*TAU;
    const y=(Math.random()-.5)*2;
    addPoint(Math.sin(theta)*radius,y,Math.cos(theta)*radius);
  }
  geometry?.dispose();
  geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  geometry.setAttribute("sizes",new THREE.BufferAttribute(sizes,1));
  geometry.setAttribute("shift",new THREE.BufferAttribute(shifts,4));
  if(points)scene.remove(points);
  points=new THREE.Points(geometry,material);
  points.rotation.order="ZYX";
  points.rotation.z=.2;
  scene.add(points);
}

function init(){
  try{
    scene=new THREE.Scene();
    scene.background=new THREE.Color(0x08040e);
    camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,1,1000);
    camera.position.set(0,4,21);
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.7));
    renderer.setSize(innerWidth,innerHeight);
    host.appendChild(renderer.domElement);
    material=new THREE.PointsMaterial({size:mobile?.105:.125,transparent:true,depthTest:false,blending:THREE.AdditiveBlending});
    material.onBeforeCompile=shader=>{
      shader.uniforms.time=uniforms;
      shader.vertexShader=`
        uniform float time;
        attribute float sizes;
        attribute vec4 shift;
        varying vec3 vColor;
        ${shader.vertexShader}
      `.replace("gl_PointSize = size;","gl_PointSize = size * sizes;").replace(
        "#include <color_vertex>",
        `#include <color_vertex>
        float radial = clamp(length(position.xz) / 40.0, 0.0, 1.0);
        vec3 innerColor = vec3(1.0, 0.0, 0.66);
        vec3 outerColor = vec3(0.03, 0.38, 1.0);
        vColor = mix(innerColor, outerColor, smoothstep(0.05, 0.98, radial));
        vColor = mix(vColor, vec3(0.58,0.28,1.0), sin(radial*3.14159)*0.24);
        `
      ).replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float moveT = mod(shift.x + shift.z * time, 6.2831853);
        float moveS = mod(shift.y + shift.z * time, 6.2831853);
        transformed += vec3(cos(moveS)*sin(moveT), cos(moveT), sin(moveS)*sin(moveT)) * shift.w;
        `
      );
      shader.fragmentShader=`
        varying vec3 vColor;
        ${shader.fragmentShader}
      `.replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float glowDist = length(gl_PointCoord.xy - 0.5);
        `
      ).replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        "vec4 diffuseColor = vec4(vColor, smoothstep(0.5, 0.08, glowDist) * 0.92);"
      );
    };
    buildField();
    window.addEventListener("resize",resize);
    document.querySelector("#motion-toggle").addEventListener("click",e=>{
      running=!running;e.currentTarget.textContent=running?"PAUSE MOTION":"RESUME MOTION";
    });
    document.querySelector("#quality-toggle").addEventListener("click",e=>{
      reduced=!reduced;buildField();e.currentTarget.textContent=reduced?"FULL PARTICLES":"REDUCED PARTICLES";
    });
    renderer.setAnimationLoop(()=>{
      if(running){
        uniforms.time.value=performance.now()*.0005*Math.PI;
        const t=performance.now()*.0005;
        points.rotation.y=t*.05;
      }
      renderer.render(scene,camera);
    });
  }catch(error){console.error("Particle prototype failed:",error);host.innerHTML='<div style="padding:24px;color:#fff;font:14px sans-serif">WebGL could not be initialized on this device.</div>';}
}
function resize(){
  if(!renderer)return;
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
init();
