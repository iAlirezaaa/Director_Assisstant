/* Beginner presentation layer. All scene data, rendering and export remain local. */
"use strict";
(()=>{
 const C=window.BEGINNER_CONTENT;
 const phone=matchMedia("(max-width:760px)"),reduced=matchMedia("(prefers-reduced-motion:reduce)");
 let viewMode="camera",focusMode=false,language="",signature="",lastFallback="",lastRatio="",lastDuration=0;
 let lessonMode="lens",toastTimer=0,hasInteracted=false,lastStatus="";
 const returnFocus=new WeakMap();
 const UI={worldVisible:false,updateGuides,syncControls,onFrame,onTab,openTool,openDialog,applyFraming,applyBeginnerLens};
 window.StudioUI=UI;
 const local=x=>typeof x==="object"&&x!==null?x[state.lang]??x.en??"":String(x??"");
 const put=(node,value)=>{if(node&&node.textContent!==String(value))node.textContent=String(value)};
 const number=(n,d=1)=>new Intl.NumberFormat(state.lang==="fa"?"fa-IR":"en-US",{maximumFractionDigits:d}).format(n);
 const seconds=n=>number(n)+tr(" ثانیه"," s");
 const clock=n=>String(Math.floor(n/60)).padStart(2,"0")+":"+String(Math.floor(n%60)).padStart(2,"0");
 function icon(name,cls="icon"){const e=E("img",null,cls);e.src="icons/"+name+".svg";e.alt="";return e}
 function press(button,on){button.setAttribute("aria-pressed",String(on))}
 function rangeFill(input){const size=Number(input.max)-Number(input.min);input.style.setProperty("--range",(clamp(size?(Number(input.value)-Number(input.min))/size:0,0,1)*100)+"%")}
 function movement(){return C.movements.find(m=>m.variants.some(v=>v.pathId===state.id))}
 function chosenLens(){const f=sample(0).focal;return C.lenses.find(l=>Math.abs(l.focalMM-f)<.05)}
 function chosenFrame(){
  return C.framing.find(f=>f.id===path.framingId&&Math.abs((path.framingFocal||0)-sample(0).focal)<.1&&path.framingRatio===state.ratio&&path.framingSensor===state.sensor&&path.framingHeight===state.height);
 }
 function ensureVisible(el){if(phone.matches)el?.scrollIntoView({block:"nearest",behavior:reduced.matches?"auto":"smooth"})}
 function updateGuides(){
  const box=$("cameraView"),guide=$("guidesOverlay"),w=box.clientWidth,h=box.clientHeight,a=ratioValue();
  const width=Math.min(w,h*a),height=width/a;
  Object.assign(guide.style,{width:width+"px",height:height+"px",left:(w-width)/2+"px",top:(h-height)/2+"px"});
 }
 function setView(mode){
  viewMode=mode==="scene"?"scene":"camera";
  $("viewGrid").dataset.view=viewMode;UI.worldVisible=viewMode==="scene";
  document.querySelectorAll("button[data-view]").forEach(b=>press(b,b.dataset.view===viewMode));
  updateGuides();draw();
 }
 function setFocus(on){
  focusMode=on;document.body.classList.toggle("focus-mode",on);press($("focusMode"),on);
  $("focusMode").setAttribute("aria-label",on?tr("خروج از پیش‌نمایش بزرگ","Exit expanded preview"):tr("بزرگ کردن پیش‌نمایش","Expand preview"));
  $("focusMode").title=$("focusMode").getAttribute("aria-label")+" (F)";
  updateGuides();
 }
 function closeMenus(){document.querySelector(".header-menu").open=false}
 function openDialog(name){
  const el=$(name.endsWith("Dialog")?name:name+"Dialog");if(!el)return;
  setFocus(false);closeMenus();
  const origin=document.activeElement;
  for(const d of document.querySelectorAll("dialog[open]"))if(d!==el)d.close();
  if(!el.open){returnFocus.set(el,origin);el.showModal()}
  if(el.id==="sceneDialog"){renderInstances();updateMirrors()}
  if(el.id==="exportDialog"){updateSummary();updateMirrors();put($("exportStatus"),"")}
  if(el.id==="helpDialog")$("helpDialog").querySelector("[data-close-dialog]").focus();
 }
 function openTool(name){
  if(["scene","export","help"].includes(name)){openDialog(name);return}
  setFocus(false);setTab(name);
  const advanced={catalog:"catalogDetails",timing:"timingDetails",mix:"mixDetails",keys:"keysDetails"};
  if(advanced[name]){const target=$(advanced[name]);$("advancedMotion").open=true;target.open=true;target.scrollIntoView({block:"start",behavior:reduced.matches?"auto":"smooth"})}
 }
 function openCatalog(current=false){
  setFocus(false);
  if(current){selectedTechnique=state.id;$("libraryQuery").value="";$("libraryCat").value="all";libraryFilter="all"}
  setTab("catalog");renderLibrary();
  $("catalogDetails").scrollIntoView({block:"start",behavior:reduced.matches?"auto":"smooth"});
  if(current)$("libraryList").querySelector('[data-technique-id="'+state.id+'"]')?.scrollIntoView({block:"nearest"});
 }
 function makeChoice(item,kind){
  const button=E("button",null,"choice-card");button.type="button";button.dataset[kind]=kind==="transition"?item.transitionId:item.id;press(button,false);
  const art=E("span",null,"choice-art"),text=E("span",null,"choice-copy");
  if(kind==="framing"&&MEDIA[item.pathId]?.file){
   const video=E("video");video.src=MEDIA[item.pathId].file;video.muted=true;video.playsInline=true;video.preload="metadata";video.setAttribute("aria-hidden","true");video.tabIndex=-1;
   video.addEventListener("loadedmetadata",()=>{video.currentTime=Math.min(.05,video.duration||0)},{once:true});art.append(video);
  }else art.append(icon(item.icon));
  text.append(E("strong",local(item.title)),E("small",local(item.subtitle)));
  if(state.lang==="fa")text.append(E("span",item.title.en,"choice-en"));
  button.append(art,text,icon("check","icon selection-dot"));
  if(kind==="motion")button.onclick=()=>chooseMovement(item);
  if(kind==="framing")button.onclick=()=>{lessonMode="framing";applyFraming(item.id);ensureVisible($("stagePanel"))};
  if(kind==="transition")button.onclick=()=>{state.transition.id=item.transitionId;state.t=0;state.playing=false;transitionControls();draw();prompt();ensureVisible($("stagePanel"))};
  return button;
 }
 function renderChoices(){
  $("beginnerMotionList").replaceChildren(...C.movements.map(x=>makeChoice(x,"motion")));
  $("framingChoices").replaceChildren(...C.framing.map(x=>makeChoice(x,"framing")));
  $("transitionChoices").replaceChildren(...C.transitions.map(x=>makeChoice(x,"transition")));
  $("lensChoices").replaceChildren(...C.lenses.map(l=>{
   const b=E("button");b.type="button";b.dataset.lensChoice=l.id;press(b,false);b.append(E("span",local(l.title)),E("small",l.focalMM+" mm"));
   b.onclick=()=>{lessonMode="lens";applyBeginnerLens(l.id);ensureVisible($("stagePanel"))};return b;
  }));
  $("sceneChoices").replaceChildren(...C.scenes.map(s=>{
   const b=E("button",null,"scene-choice");b.type="button";b.dataset.scene=s.sceneId;press(b,s.sceneId===state.scene);
   const text=E("span");text.append(E("strong",local(s.title)),E("small",local(s.subtitle)));b.append(icon(s.icon),text);
   b.onclick=()=>{state.scene=s.sceneId;$("scene").value=s.sceneId;draw();prompt()};return b;
  }));
  const choices=["close","medium","wide","dolly-in","pan-left","orbit-180"];
  if(!choices.includes(state.transition.next))choices.push(state.transition.next);
  optionList($("simpleShotB"),choices.filter(id=>PATHS[id]).map(id=>{const r=D.refs.find(x=>x.id===id);return[id,r?label(r):id]}),state.transition.next);
 }
 function applyBeginnerLens(id,refresh=true){
  const choice=C.lenses.find(l=>l.id===id);if(!choice)return;
  state.lensType="authored";state.lens=choice.focalMM/path.keys[0][6];state.beginnerLensChoice=id;
  state.distortion=0;state.vignette=0;state.lensShift=0;
  delete path.framingId;
  // Expand the expert multiplier's bounds to represent this valid focal scale.
  $("lens").min=Math.min(.25,state.lens);$("lens").max=Math.max(4,state.lens);
  if(refresh){controls();signature="";updateLearning()}
 }
 function applyFraming(id,refresh=true){
  const cfg=C.framing.find(f=>f.id===id);if(!cfg)return;
  const base=copy(path.framingBase||path);delete base.framingBase;delete base.framingId;if(path.timing)base.timing=copy(path.timing);base.curve=path.curve;
  const first=base.keys[0],focal=LE.focal(first[6],state);
  const span=cfg.spanFactor*state.height;
  const targetDistance=span*focal*ratioValue()/state.sensor;
  const sourceDistance=Math.hypot(first[0]-first[3],first[1]-first[4],first[2]-first[5]);
  const factor=clamp(targetDistance/(sourceDistance||1),.015,20),dy=cfg.targetHeightFactor*state.height-first[4];
  const stationary=base.keys.every(k=>k.slice(0,3).every((v,i)=>Math.abs(v-first[i])<1e-9));
  const next=copy(base);
  next.keys=base.keys.map(k=>{
   const a=k.slice(),pivot=stationary?first.slice(3,6):[k[8]+first[3]-first[8],first[4],k[9]+first[5]-first[9]];
   // Use one subject-relative pivot for camera AND target. Pan/tilt cameras
   // stay stationary, and tracked subjects keep their original blocking.
   for(let d=0;d<3;d++){a[d]=pivot[d]+(k[d]-pivot[d])*factor;a[d+3]=pivot[d]+(k[d+3]-pivot[d])*factor}
   a[1]+=dy;a[4]+=dy;return a;
  });
  if(!validPath(next))return;
  next.framingBase=base;next.framingId=id;next.framingFocal=focal;next.framingRatio=state.ratio;next.framingSensor=state.sensor;next.framingHeight=state.height;
  path=next;state.t=0;state.key=0;state.playing=false;comboUndo=[];lessonMode="framing";
  if(refresh){controls();signature="";updateLearning()}
 }
 function chooseMovement(item,pathId){
  const frame=chosenFrame()?.id,lens=state.beginnerLensChoice,ease=timingState().type;
  state.lensType="authored";state.lens=1;state.distortion=0;state.vignette=0;state.lensShift=0;
  choose(pathId||item.pathId);
  if(lens&&C.lenses.some(x=>x.id===lens))applyBeginnerLens(lens,false);
  if(frame)applyFraming(frame,false);
  setTiming({type:["smooth","linear","quad-in"].includes(ease)?ease:"smooth",scope:"shot",bezier:MT.defaultBezier.slice()});
  controls();ensureVisible($("stagePanel"));
 }
 function updateDirections(m){
  const box=$("motionDirection"),key=(m?.id||"custom")+"|"+state.lang;
  if(box.dataset.options!==key){
   box.dataset.options=key;
   box.replaceChildren(...(m?.variants||[]).map(v=>{
    const b=E("button",local(v.title));b.type="button";b.dataset.motionPath=v.pathId;press(b,v.pathId===state.id);b.onclick=()=>chooseMovement(m,v.pathId);return b;
   }));
   if(!m)box.append(E("p",tr("جهت این مسیر از قبل طراحی شده است.","This path has its own authored direction."),"control-help"));
  }
  box.querySelectorAll("[data-motion-path]").forEach(b=>press(b,b.dataset.motionPath===state.id));
  put($("directionHint"),m?.id==="orbit"?tr("مقدار چرخش دور سوژه را انتخاب کن.","Choose how far to travel around the subject."):tr("هر دو جهت را پخش و مقایسه کن.","Play both directions and compare."));
 }
 function updateLearning(){
  const m=movement(),lens=chosenLens(),frame=chosenFrame();
  const key=JSON.stringify([state.lang,activeTab,state.id,state.scene,state.subject,state.height,state.ratio,state.sensor,state.lensType,state.lens,state.focalMM,state.transition.id,state.transition.next,state.transition.overlap,state.duration,timingState().type,path.framingId,lessonMode]);
  if(key===signature)return;signature=key;
  if(language!==state.lang){language=state.lang;renderChoices()}
  document.querySelectorAll("[data-motion]").forEach(b=>press(b,b.dataset.motion===m?.id));
  document.querySelectorAll("[data-framing]").forEach(b=>press(b,b.dataset.framing===frame?.id));
  document.querySelectorAll("[data-lens-choice]").forEach(b=>press(b,b.dataset.lensChoice===lens?.id));
  document.querySelectorAll("[data-transition]").forEach(b=>{const c=C.transitions.find(x=>x.transitionId===b.dataset.transition);press(b,c?.transitionId===state.transition.id)});
  document.querySelectorAll("[data-ratio]").forEach(b=>press(b,b.dataset.ratio===state.ratio));
  document.querySelectorAll("[data-scene]").forEach(b=>press(b,b.dataset.scene===state.scene));
  document.querySelectorAll("[data-ease]").forEach(b=>press(b,b.dataset.ease===timingState().type));
  updateDirections(m);
  put($("durationOut"),seconds(state.duration));put($("heightOut"),number(Math.round(state.height*100),0)+tr(" سانتی‌متر"," cm"));
  put($("sceneName"),(SETS.scenes[state.scene]||[])[state.lang==="fa"?0:1]||"");
  put($("easeHint"),({smooth:tr("شروع و پایان آرام‌تر؛ حرکت در میانه تندتر می‌شود.","A gentle start and finish, with more speed in the middle."),linear:tr("سرعت در طول حرکت یکسان می‌ماند.","The movement keeps a constant pace."),"quad-in":tr("آرام شروع می‌شود و به‌تدریج سرعت می‌گیرد.","Starts slowly and builds speed.")})[timingState().type]||tr("زمان‌بندی سفارشی از تنظیمات بیشتر فعال است.","Custom timing is active in More controls."));
  put($("simpleLensHint"),local(lens?.subtitle)||tr("لنز فعلی سفارشی است. یکی از سه نمونه را امتحان کن.","Your lens is custom. Try one of these three examples."));
  const intro={library:tr("یک حرکت انتخاب کن و ببین چه تغییری در تصویر ایجاد می‌کند.","Choose a movement and see how it changes the image."),optics:tr("همان حرکت را نگه دار و اندازهٔ نما و زاویهٔ دید را امتحان کن.","Keep your movement and explore framing and field of view."),transitions:tr("ببین تصویر چگونه از نمای اول به نمای بعدی می‌رسد.","Explore how the image changes from the first shot to the next.")};
  put($("sectionIntro"),intro[activeTab]);
  const hints={library:tr("صحنه آماده است؛ برای شروع فقط یک حرکت را پخش کن.","The scene is ready. Just choose a movement and press play."),optics:tr("قاب و لنز با هم کار می‌کنند. نتیجه را در ابتدا و انتهای حرکت ببین.","Framing and lens work together. Check the start and end of the movement."),transitions:tr("اول نمای بعدی را انتخاب کن، بعد هر روش را پخش و مقایسه کن.","Choose the next shot, then play and compare each transition.")};
  put($("choiceHint"),hints[activeTab]);
  let lesson=m;
  if(activeTab==="optics")lesson=lessonMode==="framing"&&frame?frame:lens;
  if(activeTab==="transitions")lesson=C.transitions.find(x=>x.transitionId===state.transition.id);
  const fallback=activeTab==="library"?{
   title:{fa:ref().fa,en:ref().en},definition:{fa:describe(ref()),en:describe(ref())},use:{fa:"مسیر را پخش کن و رابطهٔ دوربین با سوژه را در نمای سه‌بعدی ببین.",en:"Play the path and explore the relationship between camera and subject in the 3D view."},tip:{fa:"برای زمان‌بندی و ویرایش مسیر، تنظیمات بیشتر را باز کن.",en:"Open More controls for timing and path editing."},icon:"video"
  }:activeTab==="optics"?{
   title:{fa:"قاب و لنز",en:"Frame and lens"},definition:{fa:"اندازهٔ نما می‌گوید چه مقدار از سوژه دیده شود. لنز مشخص می‌کند چه مقدار از فضای اطراف در تصویر جا بگیرد.",en:"Framing decides how much of the subject you see. The lens controls how much of the surroundings fits in the image."},use:{fa:"نمای نزدیک برای جزئیات، نمای متوسط برای چهره و بدن، و نمای باز برای دیدن محیط.",en:"Use close-ups for detail, medium shots for expression and body language, and wide shots for context."},tip:C.notes.framingAfterLens,icon:"aperture"
  }:{
   title:{fa:"ترنزیشن",en:"Transitions"},definition:{fa:state.transition.id==="none"?"ترنزیشن یعنی روش عوض شدن تصویر از یک نما به نمای دیگر. یکی از چهار نمونه را انتخاب کن.":transFa[state.transition.id]||"روش اتصال انتخابی را در پیش‌نمایش ببین.",en:state.transition.id==="none"?"A transition is how one shot changes into the next. Choose one of the four examples.":TE.byId[state.transition.id]?.description||"Preview the selected transition."},use:{fa:"کات برای تغییر فوری، دیزالو برای تغییر تدریجی و وایپ برای آشکار شدن نمای بعدی.",en:"Cut switches instantly, dissolve blends gradually, and wipe reveals the next shot."},tip:C.notes.totalDuration,icon:"transition-right"
  };
  lesson=lesson||fallback;
  put($("lessonTitle"),state.lang==="fa"?local(lesson.title)+" چیست؟":local(lesson.title)+" · how it works");
  put($("techDesc"),local(lesson.definition));put($("lessonUse"),local(lesson.use));put($("techNote"),local(lesson.tip));$("lessonIcon").src="icons/"+lesson.icon+".svg";
  const stageName=activeTab==="transitions"?tr("از یک نما به نمای بعد","From one shot to the next"):activeTab==="optics"?(frame?local(frame.title):tr("قاب را امتحان کن","Explore your framing")):(m?local(m.title):label(ref()));
  put($("techTitle"),stageName);put($("techTitleEn"),activeTab==="library"&&m&&state.lang==="fa"?m.title.en:"");$("techTitleEn").hidden=!$("techTitleEn").textContent;
  $("showReference").hidden=activeTab!=="library";
  put($("nextLesson"),activeTab==="library"?tr("حالا قابش را تغییر بده","Try framing this shot"):activeTab==="optics"?tr("اتصال دو نما را ببین","Explore transitions"):tr("حالا خروجی بگیر","Export your shot"));
  updateTransition();
  document.querySelectorAll("input[type=range]").forEach(rangeFill);
  if($("exportDialog").open)updateSummary();
 }
 function updateTransition(){
  const cfg=state.transition,current=$("simpleShotB");
  if(![...current.options].some(x=>x.value===cfg.next))current.add(new Option(label(D.refs.find(x=>x.id===cfg.next)||ref()),cfg.next));
  current.value=cfg.next;
  $("transitionDuration").min=(state.duration*.05).toFixed(2);$("transitionDuration").max=(state.duration*.9).toFixed(2);$("transitionDuration").value=cfg.overlap*state.duration;
  const instant=cfg.id==="cut"||cfg.id==="match",none=cfg.id==="none";
  $("transitionDuration").disabled=instant||none;$("previewTransition").disabled=none;
  put($("simpleTransitionOut"),instant?tr("آنی","Instant"):seconds(cfg.overlap*state.duration));
  put($("transitionDurationHint"),instant?tr("کات یک تغییر ناگهانی است و زمان محوشدن ندارد.","A cut changes instantly; there is no blending duration."):none?tr("اول یک روش اتصال انتخاب کن.","Choose a transition first."):tr("این زمان، بخشی از کل پیش‌نمایش است.","This duration is part of the whole preview."));
  put($("shotALabel"),tr("نمای اول: ","First: ")+label(ref()));
  const r=D.refs.find(x=>x.id===cfg.next);put($("shotBLabel"),tr("نمای بعد: ","Next: ")+(r?label(r):cfg.next));
 }
 function syncControls(){
  signature="";
  $("workspaceTabs").dir=state.lang==="fa"?"rtl":"ltr";
  $("libraryQuery").placeholder=tr("نام حرکت یا کاربردش را بنویس…","Search a movement or its purpose…");
  $("searchPreset").placeholder=tr("نام حرکت…","Movement name…");
  $("bodyQuery").setAttribute("aria-label",tr("جست‌وجوی بدنه دوربین","Search camera bodies"));
  $("helpButton").title=tr("راهنمای شروع","Getting started");$("helpButton").setAttribute("aria-label",$("helpButton").title);
  $("reset").setAttribute("aria-label",tr("بازگشت به ابتدای حرکت","Back to the start"));
  $("resetOrbit").setAttribute("aria-label",tr("بازیابی نمای صحنه","Reset scene view"));
  $("world").setAttribute("aria-label",tr("نمای سه‌بعدی؛ کلیدهای جهت برای چرخش، مثبت و منفی برای زوم","3D scene; arrow keys to orbit, plus and minus to zoom"));
  $("workspaceTabs").setAttribute("aria-label",tr("بخش‌های آموزش","Learning sections"));
  document.querySelectorAll("[data-close-dialog]").forEach(b=>{if(b.classList.contains("icon-button"))b.setAttribute("aria-label",tr("بستن","Close"))});
  $("lensLockHint").hidden=!$("lens").disabled;
  updateLearning();setFocus(focusMode);onFrame();
 }
 function onTab(){
  setFocus(false);signature="";updateLearning();
  if(phone.matches)$("workspaceTabs").scrollIntoView({block:"nearest",behavior:"instant"});
  updateGuides();
 }
 function updateMirrors(){
  const source=renderCam?$("program").hidden?$("camera"):$("program"):$("previewFallback");
  if(source.tagName==="VIDEO"&&source.readyState<2)return;
  for(const [id,dialog] of [["scenePreview","sceneDialog"],["exportPreview","exportDialog"]]){
   if(!$(dialog).open)continue;
   const canvas=$(id),ctx=canvas.getContext("2d");if(!ctx)continue;
   if(!renderCam){const label=$(dialog).querySelector(".preview-label");put(label,tr("نمونهٔ آماده؛ تغییرها روی این تصویر دیده نمی‌شوند","Recorded example · changes are not shown"));canvas.setAttribute("aria-label",tr("نمونهٔ آمادهٔ حرکت؛ تنظیمات جدید نمایش داده نمی‌شوند","Recorded example; new settings are not shown"))}
   ctx.fillStyle="#090f14";ctx.fillRect(0,0,canvas.width,canvas.height);
   const sw=source.videoWidth||source.width,sh=source.videoHeight||source.height;if(!sw||!sh)continue;
   const ratio=Math.min(canvas.width/sw,canvas.height/sh),w=sw*ratio,h=sh*ratio;
   try{ctx.drawImage(source,(canvas.width-w)/2,(canvas.height-h)/2,w,h)}catch{}
  }
 }
 function updateSummary(){
  const m=movement(),cfg=state.transition,rows=[
   [tr("حرکت دوربین","Movement"),m?local(m.title):label(ref())],
   [tr("مدت","Duration"),seconds(state.duration)],
   [tr("قاب","Frame"),state.ratio],
   [tr("لنز شروع","Starting lens"),number(sample(0).focal)+" mm"],
   [tr("ترنزیشن","Transition"),tr(TE.byId[cfg.id]?.fa||"بدون ترنزیشن",TE.byId[cfg.id]?.en||"None")]
  ];
  $("shotSummary").replaceChildren(...rows.map(([k,v])=>{const d=E("div");d.append(E("dt",k),E("dd",v));return d}));
  const media=MEDIA[state.id];$("downloadReference").hidden=!media;
  if(media){$("downloadReference").href=media.file;$("downloadReference").download=state.id+"-example.mp4"}
  if(!renderCam){
   $("record").disabled=true;put($("videoExportHint"),tr("ساخت ویدیوی شات به نمایش سه‌بعدی نیاز دارد. در این مرورگر می‌توانی نمونهٔ آماده را بگیری یا تنظیمات را ذخیره کنی.","Your shot needs 3D rendering to record. In this browser, download the original example or save your settings."));
  }else if(typeof MediaRecorder==="undefined"||!$("camera").captureStream){
   $("record").disabled=true;put($("videoExportHint"),tr("این مرورگر ضبط ویدیو را پشتیبانی نمی‌کند. نمونهٔ آماده یا فایل پروژه را بگیر.","This browser cannot record video. Download the example or project file instead."));
  }
 }
 function onFrame(){
  rangeFill($("time"));put($("timeText"),clock(state.t*state.duration)+" / "+clock(state.duration));
  $("time").setAttribute("aria-valuetext",seconds(state.t*state.duration)+tr(" از "," of ")+seconds(state.duration));
  if(lastDuration!==state.duration){lastDuration=state.duration;put($("timelineMiddle"),clock(state.duration/2));put($("timelineEnd"),clock(state.duration))}
  if(lastRatio!==state.ratio){lastRatio=state.ratio;updateGuides()}
  $("lensLockHint").hidden=!$("lens").disabled;
  if(!renderCam){
   const media=MEDIA[state.id],v=$("previewFallback");
   if(media?.file!==lastFallback){lastFallback=media?.file||"";if(lastFallback){v.src=lastFallback;v.hidden=false}else{v.removeAttribute("src");v.hidden=true}}
   if(Number.isFinite(v.duration)&&Math.abs(v.currentTime-state.t*v.duration)>.05)v.currentTime=state.t*v.duration;
  }
  updateLearning();updateMirrors();
 }
 for(const b of document.querySelectorAll("button[data-view]"))b.onclick=()=>setView(b.dataset.view);
 $("focusMode").onclick=()=>setFocus(!focusMode);
 $("resetOrbit").onclick=()=>{state.orbit={az:.8,el:.55,r:16};draw()};
 $("openScene").onclick=()=>openDialog("scene");$("openExport").onclick=()=>openDialog("export");$("helpButton").onclick=()=>openDialog("help");
 $("quickSave").onclick=()=>{closeMenus();$("save").click()};$("quickLoad").onclick=()=>{closeMenus();$("load").click()};
 $("showShortcuts").onclick=$("shortcutsFooter").onclick=()=>openDialog("shortcuts");
 $("browseLibrary").onclick=()=>openCatalog();$("showReference").onclick=()=>openCatalog(true);
 $("nextLesson").onclick=()=>activeTab==="transitions"?openDialog("export"):setTab(activeTab==="library"?"optics":"transitions");
 $("resetBeginner").onclick=()=>{delete state.beginnerLensChoice;state.lensType="authored";state.lens=1;state.duration=6;choose(state.id);setTiming({type:"smooth",scope:"shot",bezier:MT.defaultBezier.slice()});controls()};
 for(const b of document.querySelectorAll("[data-ease]"))b.onclick=()=>{state.playing=false;state.t=0;setTiming({type:b.dataset.ease,scope:"shot",bezier:MT.defaultBezier.slice()});signature="";updateLearning()};
 for(const b of document.querySelectorAll("[data-ratio]"))b.onclick=()=>{state.ratio=b.dataset.ratio;$("ratio").value=state.ratio;draw();prompt()};
 $("starterFrame").onclick=()=>{applyBeginnerLens("normal",false);applyFraming("medium");ensureVisible($("stagePanel"))};
 $("simpleShotB").onchange=()=>{state.transition.next=$("simpleShotB").value;state.t=0;state.playing=false;transitionControls();draw();prompt()};
 $("transitionDuration").oninput=()=>{state.transition.overlap=clamp(Number($("transitionDuration").value)/state.duration,.05,.9);state.playing=false;transitionControls();draw();prompt()};
 for(const b of document.querySelectorAll("[data-close-dialog]"))b.onclick=()=>b.closest("dialog").close();
 for(const d of document.querySelectorAll("dialog")){
  d.addEventListener("click",e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()});
  d.addEventListener("close",()=>{if(!document.querySelector("dialog[open]")){const origin=returnFocus.get(d);if(origin?.isConnected&&origin.getClientRects().length)origin.focus({preventScroll:true})}});
 }
 $("timingDetails").addEventListener("toggle",()=>{if($("timingDetails").open)drawTimingGraph()});
 $("catalogDetails").addEventListener("toggle",()=>{if(!$("catalogDetails").open)$("localReference").pause()});
 $("advancedMotion").addEventListener("toggle",()=>{if(!$("advancedMotion").open)$("localReference").pause()});
 document.addEventListener("input",e=>{if(e.target.matches("input[type=range]"))rangeFill(e.target)});
 document.addEventListener("change",e=>{if(["lensType","lens","focalMM","lensFamily"].includes(e.target.id))delete state.beginnerLensChoice;if(e.target.closest("#keyFields")){delete path.framingBase;delete path.framingId}});
 document.addEventListener("pointerdown",e=>{hasInteracted=true;const menu=document.querySelector(".header-menu");if(menu.open&&!menu.contains(e.target))menu.open=false});
 $("workspaceTabs").addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
  const tabs=[...$("workspaceTabs").querySelectorAll("[role=tab]")],i=tabs.indexOf(document.activeElement);if(i<0)return;
  let n=i;const rtl=state.lang==="fa";
  if(e.key==="Home")n=0;else if(e.key==="End")n=tabs.length-1;else n=(i+(e.key==="ArrowRight"?(rtl?-1:1):(rtl?1:-1))+tabs.length)%tabs.length;
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
  hasInteracted=true;
  if(e.defaultPrevented)return;
  const typing=e.target.matches("input,select,textarea,[contenteditable=true]");
  if((e.ctrlKey||e.metaKey)&&e.code==="KeyS"){e.preventDefault();$("save").click();return}
  if(document.querySelector("dialog[open]"))return;
  if(e.key==="Escape"){setFocus(false);closeMenus();return}
  if(typing||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;
  if(e.code==="Space"&&!e.target.closest("button,a,summary,video")){e.preventDefault();$("play").click()}
  else if(e.code==="KeyF"){e.preventDefault();setFocus(!focusMode)}
  else if(e.code==="KeyG"){e.preventDefault();$("frameGuides").click()}
  else if(e.key==="/"){e.preventDefault();openCatalog();$("libraryQuery").focus()}
  else if(e.key==="?"){e.preventDefault();openDialog("shortcuts")}
 });
 new MutationObserver(()=>{
  const text=$("status").textContent;if(text===lastStatus)return;lastStatus=text;
  if(text.startsWith("REC ")){put($("recordLabel"),tr("در حال ساخت ویدیو… ","Recording… ")+text.slice(4));put($("exportStatus"),tr("تا پایان ضبط این صفحه را باز نگه دار.","Keep this page open until recording finishes."));return}
  put($("recordLabel"),tr("دانلود ویدیوی شات","Download my shot"));
  if($("exportDialog").open)put($("exportStatus"),text);
  if(hasInteracted&&text&&!$("exportDialog").open){clearTimeout(toastTimer);put($("toast"),text);$("toast").hidden=false;toastTimer=setTimeout(()=>$("toast").hidden=true,4500)}
 }).observe($("status"),{childList:true,characterData:true,subtree:true});
 if(typeof ResizeObserver!=="undefined"){const ro=new ResizeObserver(updateGuides);ro.observe($("cameraView"))}
 window.addEventListener("resize",updateGuides);
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.playing){state.playing=false;draw()}});
 if(!renderCam){
  $("camera").hidden=true;$("program").hidden=true;$("noWebGL").hidden=false;$("previewBadge").hidden=true;
  $("frameGuides").disabled=true;$("frameGuides").checked=false;$("guidesOverlay").hidden=true;
  $("previewFallback").addEventListener("loadedmetadata",()=>onFrame());$("previewFallback").addEventListener("seeked",updateMirrors);
 }
 if(!renderWorld){$("worldUnavailable").hidden=false;$("world").hidden=true;$("resetOrbit").disabled=true;$("worldView").querySelector(".orbit-hint").hidden=true}
 setView("camera");syncControls();
 if(window.studioPendingTool){const requested=window.studioPendingTool;delete window.studioPendingTool;openTool(requested)}
})();
