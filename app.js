(() => {
  const views = [...document.querySelectorAll("[data-view]")];
  const routes = ["tattoo", "digital-art", "motion-design"];
  function render() {
    const route = location.hash.replace("#", "");
    const target = routes.includes(route) ? route : "home";
    views.forEach(view => view.classList.toggle("is-active", view.dataset.view === target));
    document.body.classList.toggle("is-home", target === "home");
    document.title = target === "home" ? "BLACKMERQURY — Visual Alchemy" : target.toUpperCase().replace("-", " ") + " — BLACKMERQURY";
  }
  document.querySelector(".wordmark").addEventListener("click", event => {
    event.preventDefault(); history.pushState(null, "", location.pathname + location.search); render();
  });
  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
  render();
  const menuButton = document.querySelector(".menu-toggle"), menu = document.querySelector(".menu-panel");
  menuButton.addEventListener("click", () => { const open=menu.classList.toggle("open"); menuButton.setAttribute("aria-expanded",String(open)); });
  document.addEventListener("click", event => { if(!menu.contains(event.target)&&!menuButton.contains(event.target)){menu.classList.remove("open");menuButton.setAttribute("aria-expanded","false");} });
  document.getElementById("year").textContent = new Date().getFullYear();
  const canvas=document.getElementById("ambient"),ctx=canvas.getContext("2d"),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w,h,points=[];
  function resize(){const dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const count=Math.max(28,Math.min(78,Math.floor(w*h/18000)));points=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12}));draw();}
  function draw(){ctx.clearRect(0,0,w,h);for(const p of points){if(!reduced){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;}}for(let i=0;i<points.length;i++){const a=points[i];for(let j=i+1;j<points.length;j++){const b=points[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<Math.min(155,w*.18)){ctx.strokeStyle="rgba(210,215,225,"+(0.105*(1-dist/155))+")";ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}ctx.fillStyle="rgba(225,230,240,.32)";ctx.fillRect(a.x-.7,a.y-.7,1.4,1.4);}if(!reduced)requestAnimationFrame(draw);}
  addEventListener("resize",resize,{passive:true});resize();
})();