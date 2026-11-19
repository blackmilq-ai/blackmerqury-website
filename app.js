(() => {
 const URL="https://qtwjrnicbkfuexnisivx.supabase.co",KEY="sb_publishable_WFf4Y1rsJLMr4WJ8GCwNog_OKQiNQwd";
 const client=window.supabase?.createClient ? window.supabase.createClient(URL,KEY) : null;
 const views=[...document.querySelectorAll("[data-view]")],routes=["tattoo","digital-art","motion-design"];
 function renderRoute(){const route=location.hash.replace("#",""),target=routes.includes(route)?route:"home";views.forEach(v=>v.classList.toggle("is-active",v.dataset.view===target));document.body.classList.toggle("is-home",target==="home");document.title=target==="home"?"BLACKMERQURY — Visual Alchemy":target.toUpperCase().replace("-"," ")+" — BLACKMERQURY"}
 document.querySelector(".wordmark").addEventListener("click",e=>{e.preventDefault();history.pushState(null,"",location.pathname+location.search);renderRoute()});addEventListener("hashchange",renderRoute);addEventListener("popstate",renderRoute);renderRoute();
 const menuButton=document.querySelector(".menu-toggle"),menu=document.querySelector(".menu-panel");menuButton.addEventListener("click",()=>{const open=menu.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});document.addEventListener("click",e=>{if(!menu.contains(e.target)&&!menuButton.contains(e.target)){menu.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}});
 document.getElementById("year").textContent=new Date().getFullYear();

 // Language switch: English is the default; the selection is remembered on this device.
 const translations={
  "Socials / Portfolio Links":"Közösségi oldalak / Portfólió","Email":"E-mail",
  "Independent Creative Studio":"Független kreatív stúdió","Explore disciplines":"Fedezd fel a területeket",
  "01 / DISCIPLINE":"01 / TERÜLET","02 / DISCIPLINE":"02 / TERÜLET","03 / DISCIPLINE":"03 / TERÜLET",
  "Custom tattoo work. Personal concepts, considered execution.":"Egyedi tetoválások. Személyes koncepciók, átgondolt kivitelezés.",
  "SELECTED VISUAL REFERENCES":"VÁLOGATOTT VIZUÁLIS REFERENCIÁK","Temporary placeholders — not BLACKMERQURY client works.":"Ideiglenes referenciaanyagok — nem BLACKMERQURY-munkák.",
  "ALL WORK":"ÖSSZES MUNKA","REALISM":"REALIZMUS","BLACKWORK":"BLACKWORK","ORNAMENTAL":"ORNAMENTÁLIS",
  "REFERENCE IMAGE · NOT OUR WORK":"REFERENCIAKÉP · NEM SAJÁT MUNKA","FLORAL / REALISM":"VIRÁGOS / REALIZMUS","PORTRAIT":"PORTRÉ",
  "START A PROJECT":"PROJEKT INDÍTÁSA","TATTOO BOOKING REQUEST":"TETOVÁLÁSI IDŐPONTKÉRÉS",
  "Send your idea and preferred details. This is a request, not a confirmed appointment.":"Írd le az elképzelésed és a fontos részleteket. Ez időpontkérés, nem visszaigazolt foglalás.",
  "VIEW AVAILABLE APPOINTMENTS ↗":"SZABAD IDŐPONTOK MEGTEKINTÉSE ↗","NAME":"NÉV","EMAIL":"E-MAIL","PHONE":"TELEFON",
  "OPTIONAL":"NEM KÖTELEZŐ","PREFERRED DATE":"PREFERÁLT DÁTUM","PLACEMENT":"ELHELYEZÉS","APPROXIMATE SIZE":"KÖRÜLBELÜLI MÉRET",
  "PROJECT DESCRIPTION":"PROJEKT LEÍRÁSA","REFERENCE LINK":"REFERENCIA-LINK","Privacy Notice":"Adatkezelési tájékoztató",
  "Hungarian version":"Magyar változat","SEND BOOKING REQUEST":"IDŐPONTKÉRÉS KÜLDÉSE",
  "PRIVATE STUDIO · BUDAPEST":"PRIVATE STUDIO · BUDAPEST","BOOK / PROJECT BRIEF ↓":"FOGLALÁS / PROJEKTLEÍRÁS ↓",
  "Digital image-making, visual experiments and commissioned artwork.":"Digitális képalkotás, vizuális kísérletek és megrendelésre készülő alkotások.",
  "SELECTED DIGITAL WORKS":"VÁLOGATOTT DIGITÁLIS MUNKÁK","Temporary visual references — to be replaced with original BLACKMERQURY artwork.":"Ideiglenes vizuális referenciák — később eredeti BLACKMERQURY-munkák váltják fel őket.",
  "ABSTRACT":"ABSZTRAKT","SURREAL":"SZÜRREÁL","ABSTRACT FORM":"ABSZTRAKT FORMA","VISUAL REFERENCE · PLACEHOLDER":"VIZUÁLIS REFERENCIA · HELYŐRZŐ",
  "SURREAL STUDY":"SZÜRREÁL TANULMÁNY","GENERATIVE FORM":"GENERATÍV FORMA","3D EXPERIMENT":"3D KÍSÉRLET","DIGITAL COMPOSITION":"DIGITÁLIS KOMPOZÍCIÓ",
  "COMMISSION / CUSTOM ORDER":"MEGRENDELÉS / EGYEDI MUNKA","START A DIGITAL ART PROJECT":"DIGITÁLIS MŰVÉSZETI PROJEKT INDÍTÁSA",
  "Share the brief, intended use and visual references for your commission.":"Oszd meg a feladatleírást, a tervezett felhasználást és a vizuális referenciákat.",
  "I have read the ":"Elolvastam az "," and the ":" és a "," , and understand how my enquiry data is used.":", és megértettem, hogyan használjuk fel a megkeresés során megadott adataimat.",
  " and understand how my enquiry data is used.":" és megértettem, hogyan használjuk fel a megkeresés során megadott adataimat.",
  "SEND COMMISSION REQUEST":"MEGRENDELÉS KÜLDÉSE","IMAGE · FORM · EXPERIMENT":"KÉP · FORMA · KÍSÉRLET","COMMISSION ↓":"MEGRENDELÉS ↓",
  "Motion-led visuals, animation and moving image.":"Mozgásalapú vizuális tartalmak, animáció és mozgókép.",
  "MOTION / VISUAL STUDIES":"MOTION / VIZUÁLIS TANULMÁNYOK","Static preview placeholders — motion reels will be added later.":"Statikus előnézeti képek — a motion anyagok később kerülnek fel.",
  "3D MOTION":"3D MOTION","TYPOGRAPHY":"TIPOGRÁFIA","VISUAL SYSTEMS":"VIZUÁLIS RENDSZEREK","3D MOTION STUDY":"3D MOTION TANULMÁNY",
  "STATIC PREVIEW · PLACEHOLDER":"STATIKUS ELŐNÉZET · HELYŐRZŐ","TYPE IN MOTION":"MOZGÓ TIPOGRÁFIA","VISUAL SYSTEM":"VIZUÁLIS RENDSZER",
  "DIMENSION / LIGHT":"DIMENZIÓ / FÉNY","ATMOSPHERIC LOOP":"ATMOSZFÉRIKUS LOOP","DESIGN PROCESS":"TERVEZÉSI FOLYAMAT",
  "PROJECT / GENERAL ENQUIRY":"PROJEKT / ÁLTALÁNOS MEGKERESÉS","TALK ABOUT A MOTION PROJECT":"BESZÉLJÜNK A MOTION PROJEKTRŐL",
  "For commissioned animation, motion systems, visual content or general enquiries.":"Animációs megrendelés, motion rendszerek, vizuális tartalmak vagy általános kérdések esetén.",
  "SEND PROJECT ENQUIRY":"PROJEKTMEGKERESÉS KÜLDÉSE","TIME · MOVEMENT · IMPACT":"IDŐ · MOZGÁS · HATÁS","PROJECT ENQUIRY ↓":"PROJEKTMEGKERESÉS ↓",
  "BACKSTAGE":"MŰHELY","CONTACT":"KAPCSOLAT","Open menu":"Menü megnyitása","Close menu":"Menü bezárása",
  "Your request could not be sent. Please try again or contact ":"A kérés küldése nem sikerült. Próbáld újra, vagy írj ide: ",
  "Request received. This is not a confirmed appointment. We will review your enquiry and reply by email.":"A kérésed megérkezett. Ez még nem visszaigazolt időpont. Átnézzük a megkeresést, és e-mailben válaszolunk.",
  "Thank you. Your request has been received.":"Köszönjük, a kérésed megérkezett.","Sending…":"Küldés…"
 };
 function setLanguage(lang){
  const selected=lang==="hu"?"hu":"en";
  document.documentElement.lang=selected;
  document.querySelectorAll("[data-lang]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.lang===selected)));
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   if(!node.__enText)node.__enText=node.nodeValue;
   const original=node.__enText,trimmed=original.trim();
   if(!trimmed)return;
   let translated=translations[trimmed];
   if(!translated && selected==="hu" && trimmed.startsWith("I have read the ")) translated=trimmed.replace("I have read the ","Elolvastam az ");
   if(!translated && selected==="hu" && trimmed.startsWith(" and understand how my enquiry data is used.")) translated=trimmed.replace(" and understand how my enquiry data is used."," és megértettem, hogyan használjuk fel a megkeresés során megadott adataimat.");
   if(!translated && selected==="hu" && trimmed.startsWith(", and understand how my enquiry data is used.")) translated=trimmed.replace(", and understand how my enquiry data is used.",", és megértettem, hogyan használjuk fel a megkeresés során megadott adataimat.");
   if(selected==="en")node.nodeValue=original;
   else if(translated)node.nodeValue=original.replace(trimmed,translated);
  });
  document.querySelectorAll("[placeholder]").forEach(el=>{
   if(!el.dataset.enPlaceholder)el.dataset.enPlaceholder=el.placeholder;
   const p=el.dataset.enPlaceholder;
   const map={"e.g. forearm, upper arm":"pl. alkar, felkar","e.g. 12 × 18 cm":"pl. 12 × 18 cm","Describe your idea, style, placement and any important details.":"Írd le az elképzelésed, a stílust, az elhelyezést és minden fontos részletet.","https://":"https://"};
   el.placeholder=selected==="hu"?(map[p]||p):p;
  });
  try{localStorage.setItem("blackmerqury-language",selected)}catch(e){}
 }
 document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>setLanguage(button.dataset.lang)));
 let savedLanguage="en";try{savedLanguage=localStorage.getItem("blackmerqury-language")||"en"}catch(e){}
 setLanguage(savedLanguage);

 function setupFilters(){document.querySelectorAll("[data-gallery-filter]").forEach(b=>b.addEventListener("click",()=>{const gallery=b.dataset.galleryFilter,filter=b.dataset.filter;document.querySelectorAll('[data-gallery-filter="'+gallery+'"]').forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll('[data-gallery="'+gallery+'"]').forEach(card=>card.hidden=filter!=="all"&&card.dataset.style!==filter)}))}
 async function loadPortfolio(){if(!client)return;const {data,error}=await client.from("portfolio_items").select("*").eq("is_published",true).order("sort_order");if(error)return;const records=data||[];const configs=[{section:"tattoo",gallery:"tattoo",selector:".tattoo-grid"},{section:"digital-art",gallery:"digital",selector:".digital-grid"},{section:"motion-design",gallery:"motion",selector:".motion-grid"}];configs.forEach(cfg=>{const grid=document.querySelector(cfg.selector);if(!grid)return;grid.replaceChildren();records.filter(x=>x.section===cfg.section).forEach(item=>{const fig=document.createElement("figure");fig.className="portfolio-card"+(cfg.section==="motion-design"?" motion-card":"");fig.dataset.gallery=cfg.gallery;fig.dataset.style=item.style||"";let media;if(item.media_type==="video"){media=document.createElement("video");media.muted=true;media.autoplay=true;media.loop=true;media.playsInline=true;media.preload="metadata";media.setAttribute("aria-label",item.alt_text||item.title)}else{media=document.createElement("img");media.alt=item.alt_text||item.title;media.loading="lazy";if(item.media_type==="embed"&&item.video_url){const host=new URL(item.video_url).hostname.toLowerCase().replace(/^www\\./,"").replace(/^m\\./,"");if(host.includes("instagram.com")||host==="facebook.com"||host==="fb.watch"||host==="web.facebook.com"){fig.dataset.socialUrl=item.video_url;fig.dataset.socialProvider=host.includes("instagram")?"instagram":"facebook"}else{fig.dataset.embedUrl=item.video_url;fig.dataset.videoUrl=item.video_url}}}media.src=item.image_url;const cap=document.createElement("figcaption"),span=document.createElement("span"),small=document.createElement("small");span.textContent=item.title;small.textContent=item.caption||"BLACKMERQURY PORTFOLIO";cap.append(span,small);fig.append(media,cap);grid.append(fig)})});enableCardFocus()}
 function enableCardFocus(){document.querySelectorAll(".portfolio-card").forEach(card=>{card.tabIndex=0;card.setAttribute("role","button");if(!card.hasAttribute("aria-label"))card.setAttribute("aria-label","Open portfolio preview: "+(card.querySelector("figcaption span")?.textContent||"portfolio item"))})}enableCardFocus();setupFilters();loadPortfolio();
 document.querySelectorAll("[data-inquiry-form]").forEach(form=>form.addEventListener("submit",async e=>{e.preventDefault();const status=form.querySelector(".form-status"),button=form.querySelector('button[type="submit"]'),fd=new FormData(form);if(fd.get("website")){status.textContent="Thank you. Your request has been received.";form.reset();return}if(!client){status.textContent="The enquiry service is temporarily unavailable. Please email hello@blackmerqury.art.";return}button.disabled=true;status.textContent="Sending…";const payload={request_type:form.dataset.requestType,name:String(fd.get("name")||"").trim(),email:String(fd.get("email")||"").trim(),phone:String(fd.get("phone")||"").trim(),preferred_date:fd.get("preferred_date")||null,placement:String(fd.get("placement")||"").trim(),size:String(fd.get("size")||"").trim(),description:String(fd.get("description")||"").trim(),reference_url:String(fd.get("reference_url")||"").trim(),consent:fd.get("consent")==="on"};const {data,error}=await client.from("contact_requests").insert(payload).select("id").single();button.disabled=false;if(error){const fallbackEmail="hello@blackmerqury.art";status.textContent="Your request could not be sent. Please try again or contact "+fallbackEmail+".";return}form.reset();status.textContent="Request received. This is not a confirmed appointment. We will review your enquiry and reply by email.";client.functions.invoke("notify-inquiry",{body:{request_id:data.id}}).catch(()=>{})}));

 
 const lightbox=document.getElementById("portfolio-lightbox"),lightboxMedia=lightbox.querySelector(".lightbox-media"),lightboxCaption=lightbox.querySelector(".lightbox-caption");let lightboxItems=[],lightboxIndex=0,lastFocus=null;
 function closeLightbox(){if(lightbox.hidden)return;lightbox.hidden=true;lightboxMedia.replaceChildren();document.body.style.overflow="";if(lastFocus)lastFocus.focus()}
 function parsePortfolioVideo(raw){
  if(!raw)return null;
  try{
   const url=new window.URL(raw.trim()),host=url.hostname.toLowerCase().replace(/^www\./,"").replace(/^m\./,"");
   if(host==="youtu.be"||host==="youtube.com"||host==="youtube-nocookie.com"){
    const parts=url.pathname.split("/").filter(Boolean);
    const id=host==="youtu.be"?parts[0]:(url.searchParams.get("v")||(["embed","shorts","live"].includes(parts[0])?parts[1]:null));
    return id?{provider:"youtube",id}:null;
   }
   if(host==="vimeo.com"||host==="player.vimeo.com"){
    const parts=url.pathname.split("/").filter(Boolean),id=[...parts].reverse().find(part=>/^\d+$/.test(part));
    const hash=url.searchParams.get("h")||parts.find(part=>/^[a-f0-9]{8,}$/i.test(part)&&part!==id)||"";
    return id?{provider:"vimeo",id,hash}:null;
   }
  }catch(e){}
  return null;
 }
 function showLightbox(index){
  if(!lightboxItems.length)return;
  lightboxIndex=(index+lightboxItems.length)%lightboxItems.length;
  const card=lightboxItems[lightboxIndex],source=card.querySelector("img,video");
  lightboxMedia.replaceChildren();
  if(card.dataset.embedUrl){
   const videoUrl=card.dataset.videoUrl||card.dataset.embedUrl,video=parsePortfolioVideo(videoUrl);
   if(video){
    const frame=document.createElement("iframe");
    frame.src=video.provider==="youtube"
     ?"https://www.youtube.com/embed/"+encodeURIComponent(video.id)+"?autoplay=0&controls=1&playsinline=1&rel=0"
     :"https://player.vimeo.com/video/"+encodeURIComponent(video.id)+"?autoplay=0&controls=1&playsinline=1"+(video.hash?"&h="+encodeURIComponent(video.hash):"");
    frame.title=source?.alt||card.querySelector("figcaption span")?.textContent||"BLACKMERQURY video";
    frame.allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen=true;
    frame.referrerPolicy="strict-origin-when-cross-origin";
    frame.setAttribute("loading","eager");
    frame.setAttribute("allowtransparency","true");
    lightboxMedia.append(frame);
   }else{
    const notice=document.createElement("p");
    notice.className="lightbox-error";
    notice.textContent="The video address is invalid or unsupported.";
    const link=document.createElement("a");
    link.href=videoUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="OPEN VIDEO";
    lightboxMedia.append(notice,link);
   }
  }else if(card.dataset.socialUrl){
   const socialUrl=card.dataset.socialUrl,provider=card.dataset.socialProvider;
   if(provider==="facebook"){
    const frame=document.createElement("iframe");
    frame.src="https://www.facebook.com/plugins/post.php?href="+encodeURIComponent(socialUrl)+"&show_text=true&width=550";
    frame.title="Facebook post";frame.loading="lazy";frame.allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
    frame.style.width="min(100%,550px)";frame.style.height="min(80vh,760px)";frame.style.border="0";frame.style.background="#fff";
    lightboxMedia.append(frame);
   }else{
    const quote=document.createElement("blockquote");
    quote.className="instagram-media";quote.setAttribute("data-instgrm-permalink",socialUrl);quote.setAttribute("data-instgrm-version","14");
    quote.style.background="#fff";quote.style.maxWidth="540px";quote.style.width="100%";quote.style.margin="0 auto";
    const link=document.createElement("a");link.href=socialUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="View this post on Instagram";quote.append(link);lightboxMedia.append(quote);
    let script=document.querySelector('script[src="https://www.instagram.com/embed.js"]');
    if(!script){script=document.createElement("script");script.src="https://www.instagram.com/embed.js";script.async=true;document.body.append(script)}
    script.addEventListener("load",()=>window.instgrm?.Embeds?.process?.(),{once:true});
    if(window.instgrm?.Embeds?.process)window.instgrm.Embeds.process();
   }
  }else if(source){
   const media=source.cloneNode(false);
   media.removeAttribute("loading");media.removeAttribute("width");media.removeAttribute("height");
   if(media.tagName==="VIDEO"){media.controls=true;media.muted=false;media.autoplay=false;media.loop=true;media.playsInline=true;media.preload="metadata"}
   else media.alt=source.alt||"";
   lightboxMedia.append(media);
  }
  lightboxCaption.textContent=card.querySelector("figcaption")?.innerText.replace(/\n/g," · ")||"";
  lightbox.hidden=false;document.body.style.overflow="hidden";lightbox.querySelector(".lightbox-close").focus();
 }
 document.addEventListener("click",e=>{const card=e.target.closest(".portfolio-card");if(!card||e.target.closest("button"))return;const grid=card.closest(".portfolio-grid");if(!grid)return;lightboxItems=[...grid.querySelectorAll(".portfolio-card")].filter(x=>!x.hidden);lastFocus=card;showLightbox(lightboxItems.indexOf(card))});
 document.addEventListener("keydown",e=>{if(lightbox.hidden){const card=e.target.closest?.(".portfolio-card");if(card&&(e.key==="Enter"||e.key===" ")){e.preventDefault();card.click()}return}});lightbox.querySelector(".lightbox-close").addEventListener("click",closeLightbox);lightbox.querySelector(".lightbox-prev").addEventListener("click",()=>showLightbox(lightboxIndex-1));lightbox.querySelector(".lightbox-next").addEventListener("click",()=>showLightbox(lightboxIndex+1));lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener("keydown",e=>{if(lightbox.hidden)return;if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")showLightbox(lightboxIndex-1);if(e.key==="ArrowRight")showLightbox(lightboxIndex+1);if(e.key==="Tab"){const controls=[lightbox.querySelector(".lightbox-close"),lightbox.querySelector(".lightbox-prev"),lightbox.querySelector(".lightbox-next")],first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();
