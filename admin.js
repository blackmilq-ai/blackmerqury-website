(() => {
  const STORAGE_KEY = "blackmerqury.portfolioDraft.v1";
  const sections = ["tattoo", "digital-art", "motion-design"];
  const list = document.getElementById("editor-list");
  const tabs = [...document.querySelectorAll("[data-tab]")];
  let activeTab = "tattoo";
  let original = [];
  let items = [];
  const $ = (tag, attrs={}, text="") => { const el=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{if(k==="className")el.className=v;else el.setAttribute(k,v)}); if(text)el.textContent=text; return el; };
  function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));document.getElementById("draft-status").textContent="DRAFT SAVED IN THIS BROWSER";}
  function loadDraft(){try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return Array.isArray(data)?data:null}catch{return null}}
  function render(){
    list.replaceChildren();
    const filtered=items.filter(x=>x.section===activeTab);
    document.getElementById("item-count").textContent=items.length;
    if(!filtered.length){list.append($("p",{className:"empty-state"},"No portfolio items in this section."));return}
    filtered.forEach((item)=>{
      const card=$("article",{className:"editor-item"+(item.visible?"":" is-hidden")});
      const img=$("img",{className:"editor-thumb",src:item.image||"",alt:item.alt||""});img.onerror=()=>{img.removeAttribute("src")};card.append(img);
      const fields=$("div",{className:"editor-fields"});
      const field=(label,key,wide=false)=>{const wrap=$("div",{className:"editor-field"+(wide?" wide":"")});wrap.append($("label",{},label));const input=$("input",{type:"text",value:item[key]||"", "aria-label":label});input.addEventListener("input",()=>{item[key]=input.value;if(key==="image")img.src=input.value;if(key==="title")card.querySelector("img").alt=item.alt||item.title;save()});wrap.append(input);fields.append(wrap)};
      field("TITLE / LABEL","title");field("CATEGORY / FILTER","style");field("IMAGE URL","image",true);field("ALT TEXT","alt",true);
      card.append(fields);
      const actions=$("div",{className:"editor-actions"});
      const visible=$("label",{className:"visibility-toggle"});const check=$("input",{type:"checkbox"});check.checked=!!item.visible;check.addEventListener("change",()=>{item.visible=check.checked;card.classList.toggle("is-hidden",!check.checked)});visible.append(check,document.createTextNode("VISIBLE"));actions.append(visible);
      const moves=$("div",{className:"move-actions"});["↑","↓"].forEach((symbol,idx)=>{const b=$("button",{type:"button","aria-label":idx?"Move down":"Move up"},symbol);b.addEventListener("click",()=>move(item.id,idx?-1:1));moves.append(b)});actions.append(moves);card.append(actions);list.append(card);
    });
  }
  function move(id,delta){const from=items.findIndex(x=>x.id===id),to=from+delta;if(to<0||to>=items.length||items[to].section!==items[from].section)return;[items[from],items[to]]=[items[to],items[from]];save();render()}
  function exportBackup(){const blob=new Blob([JSON.stringify({format:"BLACKMERQURY_PORTFOLIO_DRAFT",version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=$("a",{href:url,download:"blackmerqury-portfolio-draft.json"});a.click();URL.revokeObjectURL(url)}
  document.getElementById("export-btn").addEventListener("click",exportBackup);
  document.getElementById("import-file").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.format!=="BLACKMERQURY_PORTFOLIO_DRAFT"||!Array.isArray(data.items))throw Error("Invalid backup");items=data.items;save();render()}catch{alert("The selected file is not a valid BLACKMERQURY backup.")}e.target.value=""});
  const dialog=document.getElementById("confirm-dialog");document.getElementById("reset-btn").addEventListener("click",()=>dialog.showModal());dialog.addEventListener("close",()=>{if(dialog.returnValue==="confirm"){items=structuredClone(original);localStorage.removeItem(STORAGE_KEY);document.getElementById("draft-status").textContent="ORIGINAL CONTENT";render()}});
  tabs.forEach(tab=>tab.addEventListener("click",()=>{activeTab=tab.dataset.tab;tabs.forEach(t=>t.classList.toggle("active",t===tab));render()}));
  fetch("/").then(r=>r.text()).then(html=>{const doc=new DOMParser().parseFromString(html,"text/html");const counts={"tattoo":0,"digital-art":0,"motion-design":0};doc.querySelectorAll(".portfolio-card").forEach(card=>{const gallery=card.dataset.gallery;const section=gallery==="digital"?"digital-art":gallery==="motion"?"motion-design":"tattoo";counts[section]++;items.push({id:section+"-"+counts[section],section,title:card.querySelector("figcaption span")?.textContent||"",style:card.dataset.style||"",image:card.querySelector("img")?.getAttribute("src")||"",alt:card.querySelector("img")?.getAttribute("alt")||"",visible:!card.hidden})});original=structuredClone(items);const draft=loadDraft();if(draft)items=draft;render()}).catch(()=>{list.textContent="Could not load the portfolio structure. Open this page from the website domain."});
})();