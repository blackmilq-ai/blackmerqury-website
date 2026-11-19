(() => {
 const URL="https://qtwjrnicbkfuexnisivx.supabase.co",KEY="sb_publishable_WFf4Y1rsJLMr4WJ8GCwNog_OKQiNQwd",BUCKET="portfolio-media",PUBLIC_PREFIX=URL+"/storage/v1/object/public/"+BUCKET+"/";
 const client=window.supabase.createClient(URL,KEY),$=s=>document.querySelector(s),make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 let items=[],requests=[],active="tattoo",currentUser=null,siteContent={};
 function message(id,text){$(id).textContent=text||""}
 function parseVideoUrl(raw){
  if(!raw)return null;
  try{
   const url=new window.URL(raw.trim()),host=url.hostname.toLowerCase().replace(/^www\./,"").replace(/^m\./,"");
   if(host==="youtu.be"||host==="youtube.com"||host==="youtube-nocookie.com"){
    const parts=url.pathname.split("/").filter(Boolean);
    const id=host==="youtu.be"?parts[0]:(url.searchParams.get("v")||(["embed","shorts","live"].includes(parts[0])?parts[1]:null));
    return id?{provider:"youtube",id,embed:"https://www.youtube.com/embed/"+encodeURIComponent(id)+"?playsinline=1&rel=0"}:null;
   }
   if(host==="vimeo.com"||host==="player.vimeo.com"){
    const parts=url.pathname.split("/").filter(Boolean),id=[...parts].reverse().find(part=>/^\d+$/.test(part));
    const hash=url.searchParams.get("h")||parts.find(part=>/^[a-f0-9]{8,}$/i.test(part)&&part!==id)||"";
    return id?{provider:"vimeo",id,hash,embed:"https://player.vimeo.com/video/"+encodeURIComponent(id)+"?playsinline=1"+(hash?"&h="+encodeURIComponent(hash):"")}:null;
   }
  }catch(e){}
  return null;
 }
 async function verifyImageUrl(raw){try{const url=new window.URL(raw.trim());if(!["http:","https:"].includes(url.protocol))return false;return await new Promise(resolve=>{const probe=new Image();const timeout=setTimeout(()=>resolve(false),12000);probe.onload=()=>{clearTimeout(timeout);resolve(true)};probe.onerror=()=>{clearTimeout(timeout);resolve(false)};probe.src=url.href})}catch(e){return false}}
 async function getVimeoThumbnail(url){
  try{
   const response=await fetch("https://vimeo.com/api/oembed.json?url="+encodeURIComponent(url));
   if(!response.ok)return "";
   const data=await response.json();
   return data.thumbnail_url||"";
  }catch(e){return ""}
 }
 function parseSocialUrl(raw){
  if(!raw)return null;
  try{
   const url=new window.URL(raw.trim()),host=url.hostname.toLowerCase().replace(/^www\./,"");
   if(host==="instagram.com"||host==="m.instagram.com"){
    const path=url.pathname;
    if(path.startsWith("/p/")||path.startsWith("/reel/")||path.startsWith("/reels/")||path.startsWith("/tv/"))return {provider:"instagram",url:url.href};
   }
   if(host==="facebook.com"||host==="m.facebook.com"||host==="fb.watch"||host==="web.facebook.com"){
    const path=url.pathname.toLowerCase();
    if(host==="fb.watch"||path.includes("/posts/")||path.includes("/videos/")||path.includes("/reel")||path.includes("/watch")||path.includes("/photo")||path.includes("/share/")||path.includes("permalink.php")||path.includes("story.php")||url.searchParams.has("story_fbid"))return {provider:"facebook",url:url.href};
   }
  }catch(e){}
  return null;
 }
 function storagePath(url){if(!url||!url.startsWith(PUBLIC_PREFIX))return null;try{return decodeURIComponent(url.slice(PUBLIC_PREFIX.length))}catch{return null}}
 async function removeStoredMedia(url){const path=storagePath(url);if(!path)return;const {error}=await client.storage.from(BUCKET).remove([path]);if(error)message("#workspace-message","Database updated, but old media cleanup failed: "+error.message)}
 async function start(){const {data:{session}}=await client.auth.getSession();if(session)await enter();else showLogin()}
 function showLogin(){$("#login-panel").hidden=false;$("#workspace").hidden=true}
 async function enter(){const {data:{user}}=await client.auth.getUser();if(!user){showLogin();return}currentUser=user;$("#profile-email").textContent=user.email||"—";const {data,error}=await client.from("cms_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(error||!data){await client.auth.signOut();showLogin();message("#login-message","This account is not authorised for Backstage. Contact the site administrator.");return}$("#login-panel").hidden=true;$("#workspace").hidden=false;await load()}
 async function load(){message("#workspace-message","Loading portfolio…");const {data,error}=await client.from("portfolio_items").select("*").order("section").order("sort_order");if(error){message("#workspace-message",error.message);return}items=data||[];message("#workspace-message","");render();await refreshRequestCount();await loadSiteContent()}
 function render(){$("#profile-panel").hidden=active!=="profile";$("#site-content-panel").hidden=active!=="site-content";$("#editor-list").hidden=active==="profile"||active==="site-content";if(active==="site-content"){ $("#add-btn").hidden=true;$("#item-count-label").textContent=" SITE CONTENT";$("#item-count").textContent="";renderSiteContent();return }if(active==="profile"){ $("#add-btn").hidden=true;$("#item-count-label").textContent=" ACCOUNT";$("#item-count").textContent="";return }if(active==="inbox"){renderRequests();return}$("#add-btn").hidden=false;$("#item-count-label").textContent=" PORTFOLIO ITEMS";const root=$("#editor-list");root.replaceChildren();const filtered=items.filter(x=>x.section===active);$("#item-count").textContent=items.length;if(!filtered.length){root.append(make("p","empty-state","No items in this category yet."));return}filtered.forEach(item=>root.append(card(item)))}
 async function refreshRequestCount(){const {count,error}=await client.from("contact_requests").select("id",{count:"exact",head:true}).eq("status","new");if(!error)document.querySelector('[data-tab="inbox"]').textContent="INBOX"+(count?" ("+count+")":"")}
 async function loadRequests(){message("#workspace-message","Loading enquiries…");const {data,error}=await client.from("contact_requests").select("*").order("created_at",{ascending:false});if(error){message("#workspace-message",error.message);return}requests=data||[];const fresh=requests.filter(x=>x.status==="new").length;document.querySelector('[data-tab="inbox"]').textContent="INBOX"+(fresh?" ("+fresh+")":"");message("#workspace-message","");renderRequests()}
 function renderRequests(){const root=$("#editor-list");root.replaceChildren();$("#add-btn").hidden=true;$("#item-count-label").textContent=" ENQUIRIES";$("#item-count").textContent=requests.length;if(!requests.length){root.append(make("p","empty-state","No enquiries received yet."));return}requests.forEach(item=>{const card=make("article","request-item"),head=make("div","request-head"),identity=make("div","request-identity");identity.append(make("strong","",item.name),make("span","request-type",item.request_type.toUpperCase()));head.append(identity,make("time","",new Date(item.created_at).toLocaleString()));card.append(head);const contact=make("div","request-contact");const email=make("a","",item.email);email.href="mailto:"+item.email;contact.append(email);if(item.phone)contact.append(make("span","",item.phone));card.append(contact);card.append(make("p","request-description",item.description));const details=[item.preferred_date?"Preferred date: "+item.preferred_date:"",item.placement?"Placement: "+item.placement:"",item.size?"Size: "+item.size:"",item.reference_url?"Reference: "+item.reference_url:""].filter(Boolean);if(details.length)card.append(make("p","request-details",details.join(" · ")));const actions=make("div","request-actions"),status=make("select","request-status");[["new","NEW"],["reviewing","REVIEWING"],["replied","REPLIED"],["closed","CLOSED"]].forEach(([value,label])=>{const option=make("option","",label);option.value=value;option.selected=item.status===value;status.append(option)});status.addEventListener("change",async()=>{const {error}=await client.from("contact_requests").update({status:status.value}).eq("id",item.id);if(error){message("#workspace-message",error.message);return}item.status=status.value;message("#workspace-message","Enquiry status updated.");const fresh=requests.filter(x=>x.status==="new").length;document.querySelector('[data-tab="inbox"]').textContent="INBOX"+(fresh?" ("+fresh+")":"")});const notify=make("button","admin-button subtle",item.notification_sent_at?"EMAIL SENT":"SEND EMAIL");notify.type="button";notify.disabled=!!item.notification_sent_at;notify.addEventListener("click",async()=>{notify.disabled=true;message("#workspace-message","Sending enquiry notification…");const {error}=await client.functions.invoke("notify-inquiry",{body:{request_id:item.id}});if(error){notify.disabled=false;message("#workspace-message","Notification could not be sent. Check the Google Apps Script / Gmail function configuration.");return}message("#workspace-message","Notification sent.");await loadRequests()});const del=make("button","admin-button delete-item","DELETE");del.type="button";del.addEventListener("click",async()=>{if(!confirm("Delete this enquiry permanently?"))return;const {error}=await client.from("contact_requests").delete().eq("id",item.id);if(error){message("#workspace-message",error.message);return}requests=requests.filter(x=>x.id!==item.id);renderRequests();message("#workspace-message","Enquiry deleted.")});actions.append(status,notify,del);card.append(actions);root.append(card)})}

 const SITE_FIELDS=[
  ["menu.about","Main menu / About label","Navigation"],["menu.social","Main menu / Social link label","Navigation"],["menu.email","Main menu / Email link label","Navigation"],
  ["home.eyebrow","Homepage / Studio descriptor","Homepage"],["home.slogan","Homepage / Main slogan","Homepage"],
  ["about.eyebrow","About / Eyebrow","About"],["about.title","About / Heading","About"],["about.body","About / Main text (multiple paragraphs)","About","textarea"],["about.contact","About / Contact link","About"],
  ["tattoo.eyebrow","Tattoo / Eyebrow","Tattoo"],["tattoo.description","Tattoo / Description","Tattoo"],["tattoo.filter.all","Tattoo / Filter: All","Tattoo"],["tattoo.filter.realism","Tattoo / Filter: Realism","Tattoo"],["tattoo.filter.blackwork","Tattoo / Filter: Blackwork","Tattoo"],["tattoo.filter.ornamental","Tattoo / Filter: Ornamental","Tattoo"],["tattoo.form.eyebrow","Tattoo / Form eyebrow","Tattoo"],["tattoo.form.title","Tattoo / Form title","Tattoo"],["tattoo.form.description","Tattoo / Form description","Tattoo"],["tattoo.form.booking","Tattoo / Booking link","Tattoo"],["tattoo.form.submit","Tattoo / Submit button","Tattoo"],
  ["digital.eyebrow","Digital Art / Eyebrow","Digital Art"],["digital.description","Digital Art / Description","Digital Art"],["digital.filter.all","Digital Art / Filter: All","Digital Art"],["digital.filter.abstract","Digital Art / Filter: Abstract","Digital Art"],["digital.filter.3d","Digital Art / Filter: 3D","Digital Art"],["digital.filter.surreal","Digital Art / Filter: Surreal","Digital Art"],["digital.form.eyebrow","Digital Art / Form eyebrow","Digital Art"],["digital.form.title","Digital Art / Form title","Digital Art"],["digital.form.description","Digital Art / Form description","Digital Art"],["digital.form.submit","Digital Art / Submit button","Digital Art"],
  ["motion.eyebrow","Motion Design / Eyebrow","Motion Design"],["motion.description","Motion Design / Description","Motion Design"],["motion.filter.all","Motion Design / Filter: All","Motion Design"],["motion.filter.3d","Motion Design / Filter: 3D Motion","Motion Design"],["motion.filter.type","Motion Design / Filter: Typography","Motion Design"],["motion.filter.visual","Motion Design / Filter: Visual Systems","Motion Design"],["motion.form.eyebrow","Motion Design / Form eyebrow","Motion Design"],["motion.form.title","Motion Design / Form title","Motion Design"],["motion.form.description","Motion Design / Form description","Motion Design"],["motion.form.submit","Motion Design / Submit button","Motion Design"],
  ["footer.contact","Footer / Contact label","Footer"]
 ];
 const SITE_DEFAULTS_ADMIN={};
 async function loadSiteContent(){
  const {data,error}=await client.from("site_content").select("content").eq("id","main").maybeSingle();
  if(error){message("#workspace-message","Site content could not be loaded: "+error.message);return}
  siteContent=data?.content||{};
  if(active==="site-content")renderSiteContent();
 }
 function renderSiteContent(){
  const root=$("#site-content-fields");if(!root)return;root.replaceChildren();
  let group="";let section=null;
  SITE_FIELDS.forEach(([key,label,category,kind])=>{
   if(category!==group){group=category;section=make("section","site-content-group");section.append(make("h3","",category));root.append(section)}
   const value=siteContent[key]||{en:"",hu:""};
   const field=make("div","site-content-field");field.append(make("label","",label));
   const pair=make("div","site-content-pair");
   ["en","hu"].forEach(lang=>{const col=make("div","site-content-language"),tag=make("small","",lang==="en"?"ENGLISH":"MAGYAR");const input=make(kind==="textarea"?"textarea":"input");if(kind==="textarea"){input.rows=8;input.placeholder=lang==="en"?"Write the About text in English…":"Írd meg a bemutatkozást magyarul…"}else input.type="text";input.value=value[lang]||"";input.dataset.contentKey=key;input.dataset.contentLang=lang;col.append(tag,input);pair.append(col)});
   field.append(pair);section.append(field);
  });
 }
 async function saveSiteContent(){
  const next={...siteContent};
  document.querySelectorAll("[data-content-key]").forEach(input=>{const key=input.dataset.contentKey,lang=input.dataset.contentLang;next[key]={...(next[key]||{}),[lang]:input.value}});
  message("#site-content-message","Saving…");
  const {error}=await client.from("site_content").update({content:next,updated_at:new Date().toISOString(),updated_by:currentUser.id}).eq("id","main");
  if(error){message("#site-content-message","Save failed: "+error.message);return}
  siteContent=next;message("#site-content-message","Site content saved.");
 }
 $("#save-site-content").addEventListener("click",saveSiteContent);

 function card(item){const wrap=make("article","editor-item"+(item.is_published?"":" is-hidden"));let preview;if(item.media_type==="video"){preview=make("video","editor-thumb");preview.muted=true;preview.loop=true;preview.autoplay=true;preview.playsInline=true}else{preview=make("img","editor-thumb");preview.alt=item.alt_text||item.title}preview.src=item.image_url||"";preview.onerror=()=>preview.removeAttribute("src");wrap.append(preview);const fields=make("div","editor-fields");
 const input=(label,key,wide=false)=>{const box=make("div","editor-field"+(wide?" wide":""));box.append(make("label","",label));const el=make("input");el.type="text";el.value=item[key]||"";el.addEventListener("input",()=>{item[key]=el.value;if(key==="image_url"){preview.src=el.value;if(!item.video_url)item.media_type="image";}if(key==="title"&&preview.tagName==="IMG")preview.alt=item.alt_text||el.value});box.append(el);fields.append(box)};
 input("TITLE / LABEL","title");input("CATEGORY / FILTER","style");input("CAPTION / SOURCE LABEL","caption",true);input("DIRECT IMAGE URL / VIDEO POSTER URL","image_url",true);input("YOUTUBE / VIMEO EMBED URL","video_url",true);input("INSTAGRAM / FACEBOOK POST URL","social_url",true);
 const imageField=[...fields.querySelectorAll(".editor-field")].find(el=>el.querySelector("label")?.textContent==="DIRECT IMAGE URL / VIDEO POSTER URL");
 imageField?.append(make("small","field-hint","Paste a direct, publicly accessible image-file URL (JPG, PNG, WebP, GIF, AVIF, etc.). The image is displayed directly from that address; a webpage/share link is not sufficient."));input("ALT TEXT","alt_text",true);
 const socialField=[...fields.querySelectorAll(".editor-field")].find(el=>el.querySelector("label")?.textContent==="INSTAGRAM / FACEBOOK POST URL");
 const socialInput=socialField?.querySelector("input");
 if(socialField){socialInput.value=parseSocialUrl(item.video_url)?(item.video_url||""):"";socialField.append(make("small","field-hint","Paste a public Instagram post/reel URL or Facebook post/video URL. A direct image/poster URL is still required for the portfolio thumbnail. Social embeds may be restricted by the platform or the post owner."));socialInput.addEventListener("input",()=>{item.video_url=socialInput.value.trim();if(item.video_url)item.media_type="embed";else if(parseSocialUrl(item.video_url)===null)item.media_type="image"})}
 const videoField=[...fields.querySelectorAll(".editor-field")].find(el=>el.querySelector("label")?.textContent==="YOUTUBE / VIMEO EMBED URL");
 const videoInput=videoField?.querySelector("input");
 if(videoInput&&parseSocialUrl(item.video_url))videoInput.value="";
 if(videoInput){
  const hint=make("small","field-hint","Paste a YouTube or Vimeo link. The item is automatically saved as an embedded video. YouTube thumbnails are generated automatically; for Vimeo, the poster is fetched when available.");
  videoField.append(hint);
  videoInput.addEventListener("change",async()=>{
   const raw=videoInput.value.trim();
   if(!raw){item.video_url="";item.embed_url=null;item.media_type="image";return}
   const parsed=parseVideoUrl(raw);
   if(!parsed){message("#workspace-message","Unsupported video URL. Use a YouTube or Vimeo video link.");return}
   item.video_url=raw;item.embed_url=parsed.embed;item.media_type="embed";
   message("#workspace-message","Video link recognised: "+parsed.provider.toUpperCase()+". Preparing preview…");
   if(parsed.provider==="youtube"){
    item.image_url="https://i.ytimg.com/vi/"+encodeURIComponent(parsed.id)+"/hqdefault.jpg";
    if(preview.tagName==="IMG")preview.src=item.image_url;
   }else{
    const poster=await getVimeoThumbnail(raw);
    if(poster){item.image_url=poster;if(preview.tagName==="IMG")preview.src=poster;}
   }
   message("#workspace-message",item.image_url?"Video recognised. Save the item to publish the changes.":"Video recognised. Add a poster image URL in MEDIA / POSTER IMAGE URL, then save.");
  });
  videoInput.addEventListener("input",()=>{item.video_url=videoInput.value.trim()});
 }
 const upload=make("div","editor-field wide");upload.append(make("label","","UPLOAD IMAGE / VIDEO"));const file=make("input");file.type="file";file.accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm";file.addEventListener("change",async()=>{if(!file.files[0])return;const f=file.files[0];if(f.size>50*1024*1024){message("#workspace-message","File exceeds the 50 MB upload limit.");file.value="";return}message("#workspace-message","Uploading media…");const oldUrl=item.image_url,oldType=item.media_type||"image",path=crypto.randomUUID()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-");const {error}=await client.storage.from(BUCKET).upload(path,f,{upsert:false,contentType:f.type});if(error){message("#workspace-message",error.message);return}const {data}=client.storage.from(BUCKET).getPublicUrl(path);item.image_url=data.publicUrl;item.media_type=f.type.startsWith("video/")?"video":"image";item.video_url="";preview.src=data.publicUrl;if(item.media_type==="video"&&preview.tagName!=="VIDEO"){const v=make("video","editor-thumb");v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.src=data.publicUrl;preview.replaceWith(v);preview=v}else if(item.media_type==="image"&&preview.tagName!=="IMG"){const im=make("img","editor-thumb");im.alt=item.alt_text||item.title;im.src=data.publicUrl;preview.replaceWith(im);preview=im}const ok=await save(item,false);if(ok){if(oldUrl!==item.image_url)await removeStoredMedia(oldUrl)}else{await removeStoredMedia(data.publicUrl);item.image_url=oldUrl;item.media_type=oldType;await load()}file.value=""});upload.append(file);fields.append(upload);wrap.append(fields);
 const actions=make("div","editor-actions"),vis=make("label","visibility-toggle"),check=make("input");check.type="checkbox";check.checked=item.is_published;check.addEventListener("change",()=>{item.is_published=check.checked;wrap.classList.toggle("is-hidden",!check.checked)});vis.append(check,document.createTextNode("PUBLISHED"));actions.append(vis);
 const move=make("div","move-actions");["↑","↓"].forEach((sym,i)=>{const b=make("button","",sym);b.type="button";b.title=i?"Move down":"Move up";b.addEventListener("click",()=>reorder(item,i?1:-1));move.append(b)});actions.append(move);const saveBtn=make("button","admin-button","SAVE");saveBtn.addEventListener("click",()=>save(item));actions.append(saveBtn);const del=make("button","admin-button delete-item","DELETE");del.addEventListener("click",()=>remove(item));actions.append(del);wrap.append(actions);return wrap}
 async function save(item,refresh=true){
 if(!item.title?.trim()){message("#workspace-message","A title is required.");return false}
 const social=parseSocialUrl(item.video_url);
 const parsed=item.video_url&&!social?parseVideoUrl(item.video_url):null;
 if(item.media_type==="embed"&&item.video_url&&!social&&!parsed){message("#workspace-message","Unsupported embedded URL. Use YouTube, Vimeo, Instagram or Facebook.");return false}
 if(item.media_type==="social"&&!social){message("#workspace-message","Unsupported social URL. Use a public Instagram post/reel or Facebook post/video URL.");return false}
 if(item.video_url&&!social&&!parsed){message("#workspace-message","Unsupported video URL. Use a valid YouTube or Vimeo link.");return false}
 if(social){item.media_type="embed";item.embed_url=null}
 if(parsed){
  item.media_type="embed";item.embed_url=parsed.embed;
  if(parsed.provider==="youtube"&&!item.image_url)item.image_url="https://i.ytimg.com/vi/"+encodeURIComponent(parsed.id)+"/hqdefault.jpg";
  if(parsed.provider==="vimeo"&&!item.image_url)item.image_url=await getVimeoThumbnail(item.video_url);
 }
 if(item.is_published&&!item.image_url){message("#workspace-message","A direct image URL or poster image is required before publishing.");return false}
 if(item.image_url){message("#workspace-message","Checking image URL…");if(!await verifyImageUrl(item.image_url)){message("#workspace-message","The image URL could not be loaded. Use a direct, publicly accessible image-file URL.");return false}}
 message("#workspace-message","Saving…");
 const payload={title:item.title,style:item.style,image_url:item.image_url,alt_text:item.alt_text,caption:item.caption,video_url:item.video_url||null,embed_url:item.embed_url||null,media_type:(social||parsed)?"embed":(item.media_type||"image"),is_published:item.is_published,sort_order:item.sort_order};const {error}=await client.from("portfolio_items").update(payload).eq("id",item.id);message("#workspace-message",error?error.message:"Saved.");if(!error&&refresh)await load();return !error}
 async function reorder(item,delta){const group=items.filter(x=>x.section===item.section).sort((a,b)=>a.sort_order-b.sort_order),i=group.findIndex(x=>x.id===item.id),j=i+delta;if(j<0||j>=group.length)return;const other=group[j],old=item.sort_order;item.sort_order=other.sort_order;other.sort_order=old;const results=await Promise.all([saveOrder(item),saveOrder(other)]);if(results.every(Boolean))await load()}
 async function saveOrder(item){const {error}=await client.from("portfolio_items").update({sort_order:item.sort_order}).eq("id",item.id);if(error)message("#workspace-message",error.message);return !error}
 async function remove(item){if(!confirm("Delete this portfolio item permanently?"))return;const {error}=await client.from("portfolio_items").delete().eq("id",item.id);if(error){message("#workspace-message",error.message);return}await removeStoredMedia(item.image_url);message("#workspace-message","Item deleted.");await load()}
 $("#forgot-password").addEventListener("click",async()=>{const email=$("#login-email").value.trim();if(!email){message("#login-message","Enter your admin email address first.");$("#login-email").focus();return}message("#login-message","Sending password reset email…");const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/admin.html"});message("#login-message",error?"Could not send reset email: "+error.message:"If the account exists, a password reset email has been requested. Check Inbox and Spam.")});
 $("#recovery-form").addEventListener("submit",async e=>{e.preventDefault();const password=$("#new-password").value;if(password!==$("#confirm-password").value){message("#recovery-message","The passwords do not match.");return}message("#recovery-message","Updating password…");const {error}=await client.auth.updateUser({password});if(error){message("#recovery-message",error.message);return}message("#recovery-message","Password updated. You can now sign in.");$("#recovery-panel").hidden=true;$("#login-form").hidden=false;$("#forgot-password").hidden=false;$("#login-password").focus()});
 $("#login-form").addEventListener("submit",async e=>{e.preventDefault();message("#login-message","Signing in…");const {error}=await client.auth.signInWithPassword({email:$("#login-email").value,password:$("#login-password").value});if(error){message("#login-message",error.message);return}await enter()});
 $("#logout-btn").addEventListener("click",async()=>{await client.auth.signOut();showLogin()});
 $("#add-btn").addEventListener("click",async()=>{const {data,error}=await client.from("portfolio_items").insert({section:active,title:"NEW PROJECT",style:"",image_url:"",alt_text:"",caption:"",media_type:"image",sort_order:Math.max(0,...items.filter(x=>x.section===active).map(x=>x.sort_order))+1,is_published:false}).select().single();if(error){message("#workspace-message",error.message);return}items.push(data);render();message("#workspace-message","New unpublished item created. Add its media and details, then save.")});
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",async()=>{active=b.dataset.tab;document.querySelectorAll("[data-tab]").forEach(t=>t.classList.toggle("active",t===b));if(active==="inbox")await loadRequests();else if(active==="site-content"){render();await loadSiteContent()}else render()}));
 $("#profile-password-form").addEventListener("submit",async e=>{e.preventDefault();const current=$("#current-profile-password").value,newPassword=$("#profile-new-password").value,confirmPassword=$("#profile-confirm-password").value;if(newPassword.length<10){message("#profile-message","Use at least 10 characters.");return}if(newPassword!==confirmPassword){message("#profile-message","The new passwords do not match.");return}if(current&&current===newPassword){message("#profile-message","Choose a password different from the current one.");return}const button=$("#profile-password-form button[type=submit]");button.disabled=true;message("#profile-message","Updating password…");const attributes={password:newPassword};if(current)attributes.currentPassword=current;const {error}=await client.auth.updateUser(attributes);button.disabled=false;if(error){message("#profile-message","Password could not be updated: "+error.message);return}$("#profile-password-form").reset();message("#profile-message","Password updated successfully.");});
 client.auth.onAuthStateChange((event,session)=>{if(event==="PASSWORD_RECOVERY"){ $("#login-form").hidden=true;$("#forgot-password").hidden=true;$("#recovery-panel").hidden=false;$("#login-panel").hidden=false;$("#workspace").hidden=true;message("#recovery-message","Choose a new password for Backstage.");return}if(!session)showLogin()});start();
})();