import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const host = document.querySelector("#space");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 700px)").matches;
const config = {
  desktopCount: 22000,
  mobileCount: 6500,
  reducedCount: 4500,
  depth: 30,
  drift: 0.16,
  cameraEase: 0.018,
  pointSize: isMobile ? 1.55 : 1.8
};

let renderer, scene, camera, material, geometry, points;
let running = !reducedMotion;
let reducedQuality = isMobile;
let frame = 0;
let lastTime = 0;
let mode = 0;
const pointer = new THREE.Vector2(0, 0);
const targetPointer = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();

function fallback(message) {
  host.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(600, 390, 30, 600, 390, 620);
  gradient.addColorStop(0, "rgba(255,0,168,.16)");
  gradient.addColorStop(.48, "rgba(8,124,255,.09)");
  gradient.addColorStop(1, "#08090b");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 800);
  let seed = 17;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i=0;i<1600;i++) {
    const x=rand()*1200, y=rand()*800, r=.35+rand()*1.1;
    ctx.fillStyle = rand()>.52 ? "rgba(255,0,168,.48)" : "rgba(8,124,255,.5)";
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  host.appendChild(canvas);
  if (message) console.warn("Infinite Particle Space:", message);
}

try {
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x08090b, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, window.innerWidth/window.innerHeight, .1, 100);
  camera.position.set(0, 0, 8.5);
  camera.lookAt(0, 0, -4);

  const vertexShader = `
    uniform float uTime;
    uniform float uPointSize;
    uniform float uMode;
    attribute float aSeed;
    attribute float aSize;
    attribute float aHue;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      float t = uTime;
      p.z = mod(p.z + t * 0.22 + 15.0, 30.0) - 15.0;
      float depthFactor = smoothstep(-15.0, 15.0, p.z);
      float waveA = sin(p.x * 0.34 + t * 0.19 + aSeed * 6.2831);
      float waveB = cos(p.y * 0.42 - t * 0.14 + aSeed * 4.2);
      p.x += waveA * (0.10 + depthFactor * 0.24) + sin(t * .09 + aSeed * 12.0) * .08;
      p.y += waveB * (0.08 + depthFactor * 0.18) + cos(t * .11 + aSeed * 8.0) * .06;
      p.x += sin(p.z * .16 + t * .12) * .28;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = clamp(uPointSize * aSize * (34.0 / max(1.0, -mvPosition.z)), 1.0, 5.0);
      float blueBias = clamp(aHue + p.x * .035 + uMode * .08, 0.0, 1.0);
      vec3 magenta = vec3(1.0, 0.0, 0.48);
      vec3 blue = vec3(0.025, 0.24, 1.0);
      vColor = mix(magenta, blue, blueBias);
      vAlpha = (0.25 + 0.75 * aSeed) * (0.34 + 0.66 * depthFactor);
    }`;
  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float core = 1.0 - smoothstep(0.03, 0.20, d);
      float glow = 1.0 - smoothstep(0.08, 0.5, d);
      float alpha = (core * .78 + glow * .22) * vAlpha;
      if (alpha < .025) discard;
      gl_FragColor = vec4(vColor * (0.78 + core * 0.7), alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;

  function buildParticles() {
    if (points) { scene.remove(points); geometry.dispose(); material.dispose(); }
    const count = reducedQuality ? config.reducedCount : (isMobile ? config.mobileCount : config.desktopCount);
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count*3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const hues = new Float32Array(count);
    for (let i=0;i<count;i++) {
      const i3=i*3;
      const depth = (Math.random()-.5)*config.depth;
      const spread = .72 + Math.random()*.5;
      positions[i3] = (Math.random()-.5)*24*spread;
      positions[i3+1] = (Math.random()-.5)*14*spread;
      positions[i3+2] = depth;
      seeds[i] = Math.random();
      sizes[i] = .55 + Math.pow(Math.random(), 2.2)*2.1;
      hues[i] = Math.random();
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds,1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes,1));
    geometry.setAttribute("aHue", new THREE.BufferAttribute(hues,1));
    material = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uPointSize:{value:config.pointSize}, uMode:{value:0} },
      vertexShader, fragmentShader, transparent:true, depthWrite:false,
      blending:THREE.AdditiveBlending
    });
    points = new THREE.Points(geometry, material);
    scene.add(points);
  }
  buildParticles();

  function resize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
    renderer.setSize(window.innerWidth,window.innerHeight);
  }
  function animate(now=0) {
    frame = requestAnimationFrame(animate);
    if (!running || document.hidden) return;
    if (now-lastTime < (reducedQuality ? 32 : 16)) return;
    lastTime=now;
    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;
    pointer.lerp(targetPointer, .025);
    camera.position.x += (pointer.x*.52-camera.position.x)*config.cameraEase;
    camera.position.y += (pointer.y*.28-camera.position.y)*config.cameraEase;
    camera.lookAt(pointer.x*.14, pointer.y*.08, -4);
    renderer.render(scene,camera);
  }
  window.addEventListener("resize",resize,{passive:true});
  window.addEventListener("pointermove",e=>{
    targetPointer.x=(e.clientX/window.innerWidth-.5)*2;
    targetPointer.y=-((e.clientY/window.innerHeight-.5)*2);
  },{passive:true});
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden && running) clock.start(); });
  document.querySelectorAll("[data-mode]").forEach(button=>{
    button.addEventListener("click",()=>{
      const selected=button.dataset.mode;
      mode=selected==="digital" ? 0 : selected==="tattoo" ? -0.7 : 0.8;
      material.uniforms.uMode.value=mode;
      document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
    });
  });
  document.querySelector("#motion-toggle").addEventListener("click",e=>{
    running=!running;e.currentTarget.textContent=running?"PAUSE MOTION":"RESUME MOTION";
    if(running){clock.start();animate();}
  });
  document.querySelector("#quality-toggle").addEventListener("click",e=>{
    reducedQuality=!reducedQuality;buildParticles();
    e.currentTarget.textContent=reducedQuality?"STANDARD PARTICLES":"REDUCED PARTICLES";
  });
  if (reducedMotion) document.querySelector("#motion-toggle").textContent="RESUME MOTION";
  animate();
} catch (error) {
  fallback(error);
}
