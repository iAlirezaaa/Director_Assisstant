/* Presentation and interaction layer. No network or external dependencies. */
"use strict";
(()=>{
 const mobile=matchMedia("(max-width:980px)"),phone=matchMedia("(max-width:700px)"),reduced=matchMedia("(prefers-reduced-motion:reduce)");
 let viewMode="split",focusMode=false,lastRatio="",lastDuration=0,lastFallback="",returnFocus=null;
 try{const saved=localStorage.getItem("camera-studio-view");if(["camera","split","scene"].includes(saved))viewMode=saved}catch{}
 const UI={worldVisible:true,updateGuides,syncControls,onFrame,onTab,openTool};
 window.StudioUI=UI;
 const put=(el,value)=>{if(el.textContent!==value)el.textContent=value};
 function rangeFill(input){let n=(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min));input.style.setProperty("--range",(clamp(n,0,1)*100)+"%")}
 function updateGuides(){
  const box=$("cameraView"),guide=$("guidesOverlay"),w=box.clientWidth,h=box.clientHeight,a=ratioValue();
  const width=Math.min(w,h*a),height=width/a;
  Object.assign(guide.style,{width:width+"px",height:height+"px",left:(w-width)/2+"px",top:(h-height)/2+"px"});
 }
 function setView(mode,persist=true){
  viewMode=mode;$("viewGrid").dataset.view=mode;
  const effective=phone.matches&&mode==="split"?"camera":mode;
  document.querySelectorAll("[data-view]").forEach(b=>{if(b.tagName==="BUTTON")b.setAttribute("aria-pressed",String(b.dataset.view===effective))});
  UI.worldVisible=effective!=="camera";
  if(persist)try{localStorage.setItem("camera-studio-view",mode)}catch{}
  updateGuides();draw();
 }
 function setFocus(on){
  focusMode=on;document.body.classList.toggle("focus-mode",on);$("focusMode").setAttribute("aria-pressed",String(on));
  const label=$("focusMode").querySelector("span");put(label,on?tr("خروج از تمرکز","Exit focus"):tr("تمرکز","Focus"));
  $("focusMode").title=on?tr("خروج از حالت تمرکز (F)","Exit focus mode (F)"):tr("حالت تمرکز (F)","Focus mode (F)");
  if(on)closeDrawer();updateGuides();
 }
 function openDrawer(){
  if(!mobile.matches)return;
  setFocus(false);
  returnFocus=document.activeElement;
  $("shotInspector").classList.add("drawer-open");document.body.classList.add("drawer-open-body");
  $("inspectorBackdrop").hidden=false;$("toggleInspector").setAttribute("aria-expanded","true");
  $("closeInspector").focus();
 }
 function closeDrawer(restore=false){
  const wasOpen=$("shotInspector").classList.contains("drawer-open");
  $("shotInspector").classList.remove("drawer-open");document.body.classList.remove("drawer-open-body");
  $("inspectorBackdrop").hidden=true;$("toggleInspector").setAttribute("aria-expanded","false");
  if(restore&&wasOpen&&returnFocus?.isConnected)returnFocus.focus();
 }
 function openTool(name){setFocus(false);closeDrawer();setTab(name);if(phone.matches)$("workspaceTabs").scrollIntoView({block:"start",behavior:reduced.matches?"auto":"smooth"})}
 function shortcuts(){document.querySelector(".header-menu").open=false;$("shortcutsDialog").showModal()}
 function onTab(name){
  const b=$("tab-"+name);if(b)b.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
 }
 function syncControls(){
  $("libraryQuery").placeholder=tr("جست‌وجوی حرکت، لنز یا تکنیک…","Search movements, lenses or techniques…");
  $("searchPreset").placeholder=tr("نام حرکت…","Find a motion…");
  $("lensLockHint").hidden=!$("lens").disabled;
  $("play").title=tr("پخش / توقف (Space)","Play / pause (Space)");
  $("reset").title=tr("بازگشت به ابتدا","Back to start");
  $("reset").setAttribute("aria-label",$("reset").title);
  $("resetOrbit").title=tr("بازیابی زاویهٔ صحنه","Reset scene view");
  $("resetOrbit").setAttribute("aria-label",$("resetOrbit").title);
  $("quickSave").title=tr("ذخیره در همین مرورگر (Ctrl / ⌘ + S)","Save in this browser (Ctrl / ⌘ + S)");
  $("world").setAttribute("aria-label",tr("نمای صحنه؛ کلیدهای جهت برای چرخش، مثبت و منفی برای زوم","Scene view; arrow keys to orbit, plus and minus to zoom"));
  document.querySelectorAll("input[type=range]").forEach(rangeFill);
  const metricLabels=state.lang==="fa"?["لنز","زاویه دید","ارتفاع","فاصله"]:["FOCAL","HFOV","HEIGHT","DISTANCE"];
  $("metrics").querySelectorAll("small").forEach((el,i)=>put(el,metricLabels[i]));
  setFocus(focusMode);onFrame(sample(state.t));
 }
 function onFrame(){
  rangeFill($("time"));
  $("time").setAttribute("aria-valuetext",(state.t*state.duration).toFixed(1)+tr(" ثانیه از "," seconds of ")+state.duration);
  if(lastDuration!==state.duration){lastDuration=state.duration;put($("timelineMiddle"),(state.duration/2).toFixed(1)+"s");put($("timelineEnd"),state.duration.toFixed(1)+"s")}
  if(lastRatio!==state.ratio){lastRatio=state.ratio;updateGuides()}
  $("lensLockHint").hidden=!$("lens").disabled;
  if(!renderCam){
   const m=MEDIA[state.id],video=$("previewFallback");
   if(m?.file!==lastFallback){lastFallback=m?.file||"";if(lastFallback){video.src=lastFallback;video.hidden=false}else{video.removeAttribute("src");video.hidden=true}}
   if(Number.isFinite(video.duration)&&Math.abs(video.currentTime-state.t*video.duration)>.05)video.currentTime=state.t*video.duration;
  }
 }
 for(const b of document.querySelectorAll("button[data-view]"))b.onclick=()=>setView(b.dataset.view);
 $("focusMode").onclick=()=>setFocus(!focusMode);
 $("resetOrbit").onclick=()=>{state.orbit={az:.8,el:.55,r:16};draw()};
 $("toggleInspector").onclick=openDrawer;
 $("closeInspector").onclick=()=>closeDrawer(true);$("inspectorBackdrop").onclick=()=>closeDrawer(true);
 $("quickSave").onclick=()=>$("save").click();$("openExport").onclick=()=>openTool("export");
 for(const b of document.querySelectorAll("[data-open-tab]"))b.onclick=()=>openTool(b.dataset.openTab);
 $("showShortcuts").onclick=$("shortcutsFooter").onclick=shortcuts;
 document.addEventListener("input",e=>{if(e.target.matches("input[type=range]"))rangeFill(e.target)});
 $("workspaceTabs").addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
  const tabs=[...document.querySelectorAll("[role=tab]")],i=tabs.indexOf(document.activeElement);if(i<0)return;
  const rtl=state.lang==="fa";let n=i;
  if(e.key==="Home")n=0;else if(e.key==="End")n=tabs.length-1;
  else n=(i+(e.key==="ArrowRight"?(rtl?-1:1):(rtl?1:-1))+tabs.length)%tabs.length;
  e.preventDefault();setTab(tabs[n].dataset.tab);tabs[n].focus({preventScroll:true});
 });
 $("world").addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Home"].includes(e.key))return;
  e.preventDefault();e.stopPropagation();
  if(e.key==="Home")state.orbit={az:.8,el:.55,r:16};
  if(e.key==="ArrowLeft")state.orbit.az-=.12;if(e.key==="ArrowRight")state.orbit.az+=.12;
  if(e.key==="ArrowUp")state.orbit.el=clamp(state.orbit.el+.1,.08,1.48);if(e.key==="ArrowDown")state.orbit.el=clamp(state.orbit.el-.1,.08,1.48);
  if(["+","="].includes(e.key))state.orbit.r=clamp(state.orbit.r/1.1,3,45);if(e.key==="-")state.orbit.r=clamp(state.orbit.r*1.1,3,45);draw();
 });
 document.addEventListener("keydown",e=>{
  const typing=e.target.matches("input,select,textarea,[contenteditable=true]");
  if((e.ctrlKey||e.metaKey)&&e.code==="KeyS"){e.preventDefault();$("save").click();return}
  if(e.key==="Escape"){
   if($("shortcutsDialog").open)return;
   closeDrawer(true);setFocus(false);document.querySelector(".header-menu").open=false;return;
  }
  if($("shortcutsDialog").open)return;
  if(e.key==="Tab"&&mobile.matches&&$("shotInspector").classList.contains("drawer-open")){
   const fields=[...$("shotInspector").querySelectorAll("button,input,select,summary,a[href]")].filter(el=>!el.disabled&&el.getClientRects().length);
   const first=fields[0],last=fields.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}return;
  }
  if(typing||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
  if(e.code==="Space"&&!e.target.closest("button,a,summary,video")){e.preventDefault();$("play").click()}
  else if(e.code==="KeyF"){e.preventDefault();setFocus(!focusMode)}
  else if(e.code==="KeyG"){e.preventDefault();$("frameGuides").click()}
  else if(e.key==="/"){e.preventDefault();openTool("library");$("libraryQuery").focus()}
  else if(e.key==="?"){e.preventDefault();shortcuts()}
 });
 if(typeof ResizeObserver!=="undefined"){const observer=new ResizeObserver(updateGuides);observer.observe($("cameraView"))}
 window.addEventListener("resize",()=>{if(!mobile.matches)closeDrawer();setView(viewMode,false);updateGuides()});
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.playing){state.playing=false;draw()}});
 if(!renderCam){$("camera").hidden=true;$("program").hidden=true;$("noWebGL").hidden=false;$("frameGuides").disabled=true;$("frameGuides").checked=false;$("guidesOverlay").hidden=true;$("previewFallback").addEventListener("loadedmetadata",()=>onFrame())}
 if(!renderWorld){$("worldUnavailable").hidden=false;$("world").hidden=true;$("resetOrbit").disabled=true;$("worldView").querySelector(".orbit-hint").hidden=true;$("worldView").querySelector(".axis-gizmo").hidden=true}
 setView(viewMode,false);syncControls();
})();
