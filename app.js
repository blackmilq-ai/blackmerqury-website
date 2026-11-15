(() => {
 const URL="https://qtwjrnicbkfuexnisivx.supabase.co",KEY="sb_publishable_WFf4Y1rsJLMr4WJ8GCwNog_OKQiNQwd";
 const client=window.supabase?.createClient ? window.supabase.createClient(URL,KEY) : null;
 const views=[...document.querySelectorAll("[data-view]")],routes=["tattoo","digital-art","motion-design"];
 const pageMeta={home:{title:"BLACKMERQURY — Visual Alchemy",description:"Independent creative studio in Budapest. Tattoo, digital art and motion design.",canonical:"/"},tattoo:{title:"Tattoo — BLACKMERQURY · Budapest",description:"Custom tattoo work and private studio in Budapest. Explore the BLACKMERQURY tattoo portfolio and request an appointment.",canonical:"/tattoo/"}, "digital-art":{title:"Digital Art — BLACKMERQURY · Budapest",description:"Digital art, 3D, visual experiments and commissioned artwork by BLACKMERQURY.",canonical:"/digital-art/"}, "motion-design":{title:"Motion Design — BLACKMERQURY · Budapest",description:"Motion design, animation, 3D motion and moving image by BLACKMERQURY.",canonical:"/motion-design/"}};
 function currentRoute(){const p=location.pathname.replace(/\/+$/,"");const slug=p.split("/").filter(Boolean).pop();return routes.includes(slug)?slug:"home"}
 function renderRoute(){const target=currentRoute();views.forEach(v=>v.classList.toggle("is-active",v.dataset.view===target));document.body.classList.toggle("is-home",target==="home");const meta=pageMeta[target];document.title=meta.title;document.querySelector('meta[name="description"]')?.setAttribute("content",meta.description);document.querySelector('link[rel="canonical"]')?.setAttribute("href","https://blackmerqury.art"+meta.canonical);document.querySelector('meta[property="og:title"]')?.setAttribute("content",meta.title);document.querySelector('meta[property="og:description"]')?.setAttribute("content",meta.description);document.querySelector('meta[property="og:url"]')?.setAttribute("content","https://blackmerqury.art"+meta.canonical);if(location.hash&&location.hash!=="#")setTimeout(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"smooth"}),40);else scrollTo(0,0)}
 document.addEventListener("click",e=>{const link=e.target.closest('a[data-route]');if(!link)return;e.preventDefault();history.pushState(null,"",link.getAttribute("href"));renderRoute()});addEventListener("popstate",renderRoute);renderRoute();
 const menuButton=document.querySelector(".menu-toggle"),menu=document.querySelector(".menu-panel");menuButton.addEventListener("click",()=>{const open=menu.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});document.addEventListener("click",e=>{if(!menu.contains(e.target)&&!menuButton.contains(e.target)){menu.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}});
 document.getElementById("year").textContent=new Date().getFullYear();

 // Language switch: English is the default; the selection is remembered on this device.
 const translations={
  "A PRIVATE STUDIO EXPERIENCE":"PRIVÁT STÚDIÓÉLMÉNY","A tattoo should feel personal from the first conversation to the finished piece. Every project starts with your idea, placement and the way the design should live on your body.":"A tetoválás már az első beszélgetéstől legyen személyes élmény. Minden projekt a te elképzeléseddel, az elhelyezéssel és a testen működő kompozícióval kezdődik.",
  "CONSULTATION":"KONZULTÁCIÓ","We discuss the concept, references, placement, scale and practical details before the session.":"A tetoválás előtt átbeszéljük a koncepciót, a referenciákat, az elhelyezést, a méretet és a gyakorlati részleteket.",
  "CUSTOM DESIGN":"EGYEDI TERVEZÉS","The artwork is developed around your brief and adapted to the body area and composition.":"A terv az elképzelésed alapján készül, az adott testtájhoz és kompozícióhoz igazítva.",
  "PRIVATE SESSION":"PRIVÁT ALKALOM","A focused appointment in a private studio, with time for breaks and a considered pace.":"Nyugodt, privát stúdióalkalom, elegendő idővel a szünetekre és a megfelelő tempóra.",
  "IMAGE-MAKING / DIGITAL EXPERIMENT":"DIGITÁLIS KÉPALKOTÁS / KÍSÉRLETEZÉS","Digital art built around form, atmosphere and visual identity — from a single commissioned image to a coherent series of visual assets.":"Forma, atmoszféra és vizuális identitás köré épülő digitális alkotások — egyedi megrendelésre készülő képtől az összefüggő vizuális sorozatokig.",
  "3D / CGI":"3D / CGI","Dimensional forms, materials, lighting and rendered compositions for digital or print use.":"Térbeli formák, anyagok, fények és renderelt kompozíciók digitális vagy nyomtatott felhasználásra.",
  "KEY VISUALS":"KEY VISUALOK","Original campaign images, cover artwork and visual concepts developed to a clear brief.":"Egyedi kampányképek, borítóképek és vizuális koncepciók konkrét brief alapján.",
  "EXPERIMENTAL ART":"KÍSÉRLETI MŰVÉSZET","Surreal, generative and mixed-digital explorations with a distinctive visual language.":"Szürreális, generatív és vegyes digitális kísérletek sajátos vizuális nyelvezettel.",
  "MOTION / TIME / IMPACT":"MOTION / IDŐ / HATÁS","Motion design gives a visual idea rhythm, depth and presence. Projects are developed from concept and visual direction through animation and final delivery.":"A motion design ritmust, mélységet és jelenlétet ad a vizuális ötletnek. A projektek a koncepciótól és vizuális iránytól az animáción át a végleges átadásig épülnek fel.",
  "BRAND MOTION":"BRAND MOTION","Animated identities, titles, graphic systems and social-first motion assets.":"Animált arculati elemek, főcímek, grafikai rendszerek és közösségi felületekre készülő motion anyagok.",
  "VIDEO / EDIT":"VIDEÓ / VÁGÁS","Editing, compositing and finishing for short-form content and visual presentations.":"Vágás, kompozitálás és utómunka rövid videós tartalmakhoz és vizuális prezentációkhoz.",
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
 async function loadPortfolio(){if(!client)return;const {data,error}=await client.from("portfolio_items").select("*").eq("is_published",true).order("sort_order");if(error)return;const records=data||[];const configs=[{section:"tattoo",gallery:"tattoo",selector:".tattoo-grid"},{section:"digital-art",gallery:"digital",selector:".digital-grid"},{section:"motion-design",gallery:"motion",selector:".motion-grid"}];configs.forEach(cfg=>{const grid=document.querySelector(cfg.selector);if(!grid)return;grid.replaceChildren();records.filter(x=>x.section===cfg.section).forEach(item=>{const fig=document.createElement("figure");fig.className="portfolio-card"+(cfg.section==="motion-design"?" motion-card":"");fig.dataset.gallery=cfg.gallery;fig.dataset.style=item.style||"";let media;if(item.media_type==="video"){media=document.createElement("video");media.muted=true;media.autoplay=true;media.loop=true;media.playsInline=true;media.preload="metadata";media.setAttribute("aria-label",item.alt_text||item.title)}else{media=document.createElement("img");media.alt=item.alt_text||item.title;media.loading="lazy"}media.src=item.image_url;const cap=document.createElement("figcaption"),span=document.createElement("span"),small=document.createElement("small");span.textContent=item.title;small.textContent=item.caption||"BLACKMERQURY PORTFOLIO";cap.append(span,small);fig.append(media,cap);grid.append(fig)})});enableCardFocus()}
 function enableCardFocus(){document.querySelectorAll(".portfolio-card").forEach(card=>{card.tabIndex=0;card.setAttribute("role","button");if(!card.hasAttribute("aria-label"))card.setAttribute("aria-label","Open portfolio preview: "+(card.querySelector("figcaption span")?.textContent||"portfolio item"))})}enableCardFocus();setupFilters();loadPortfolio();
 document.querySelectorAll("[data-inquiry-form]").forEach(form=>form.addEventListener("submit",async e=>{e.preventDefault();const status=form.querySelector(".form-status"),button=form.querySelector('button[type="submit"]'),fd=new FormData(form);if(fd.get("website")){status.textContent="Thank you. Your request has been received.";form.reset();return}if(!client){status.textContent="The enquiry service is temporarily unavailable. Please email hello@blackmerqury.art.";return}button.disabled=true;status.textContent="Sending…";const payload={request_type:form.dataset.requestType,name:String(fd.get("name")||"").trim(),email:String(fd.get("email")||"").trim(),phone:String(fd.get("phone")||"").trim(),preferred_date:fd.get("preferred_date")||null,placement:String(fd.get("placement")||"").trim(),size:String(fd.get("size")||"").trim(),description:String(fd.get("description")||"").trim(),reference_url:String(fd.get("reference_url")||"").trim(),consent:fd.get("consent")==="on"};const {data,error}=await client.from("contact_requests").insert(payload).select("id").single();button.disabled=false;if(error){const fallbackEmail="hello@blackmerqury.art";status.textContent="Your request could not be sent. Please try again or contact "+fallbackEmail+".";return}form.reset();status.textContent="Request received. This is not a confirmed appointment. We will review your enquiry and reply by email.";client.functions.invoke("notify-inquiry",{body:{request_id:data.id}}).catch(()=>{})}));

 
 const lightbox=document.getElementById("portfolio-lightbox"),lightboxMedia=lightbox.querySelector(".lightbox-media"),lightboxCaption=lightbox.querySelector(".lightbox-caption");let lightboxItems=[],lightboxIndex=0,lastFocus=null;
 function closeLightbox(){if(lightbox.hidden)return;lightbox.hidden=true;lightboxMedia.replaceChildren();document.body.style.overflow="";if(lastFocus)lastFocus.focus()}
 function showLightbox(index){if(!lightboxItems.length)return;lightboxIndex=(index+lightboxItems.length)%lightboxItems.length;const card=lightboxItems[lightboxIndex],source=card.querySelector("img,video");lightboxMedia.replaceChildren();const media=source.cloneNode(false);media.removeAttribute("loading");media.removeAttribute("width");media.removeAttribute("height");if(media.tagName==="VIDEO"){media.controls=true;media.muted=false;media.autoplay=true;media.loop=true;media.playsInline=true;media.preload="metadata"}else{media.alt=source.alt||""}lightboxMedia.append(media);lightboxCaption.textContent=card.querySelector("figcaption")?.innerText.replace(/\\n/g," · ")||"";lightbox.hidden=false;document.body.style.overflow="hidden";lightbox.querySelector(".lightbox-close").focus()}
 document.addEventListener("click",e=>{const card=e.target.closest(".portfolio-card");if(!card||e.target.closest("button"))return;const grid=card.closest(".portfolio-grid");if(!grid)return;lightboxItems=[...grid.querySelectorAll(".portfolio-card")].filter(x=>!x.hidden);lastFocus=card;showLightbox(lightboxItems.indexOf(card))});
 document.addEventListener("keydown",e=>{if(lightbox.hidden){const card=e.target.closest?.(".portfolio-card");if(card&&(e.key==="Enter"||e.key===" ")){e.preventDefault();card.click()}return}});lightbox.querySelector(".lightbox-close").addEventListener("click",closeLightbox);lightbox.querySelector(".lightbox-prev").addEventListener("click",()=>showLightbox(lightboxIndex-1));lightbox.querySelector(".lightbox-next").addEventListener("click",()=>showLightbox(lightboxIndex+1));lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener("keydown",e=>{if(lightbox.hidden)return;if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")showLightbox(lightboxIndex-1);if(e.key==="ArrowRight")showLightbox(lightboxIndex+1);if(e.key==="Tab"){const controls=[lightbox.querySelector(".lightbox-close"),lightbox.querySelector(".lightbox-prev"),lightbox.querySelector(".lightbox-next")],first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();
