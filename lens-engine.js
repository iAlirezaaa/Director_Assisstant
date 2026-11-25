/* Offline optics presets, calculations, and approximate image-space lens effects. */
(function(root){"use strict";
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),P=[];
function add(id,en,fa,kind,mm,squeeze=1,distortion=0,vignette=0,softness=0,description="",range=null,tilt=0){P.push({id,en,fa,kind,mm,squeeze,distortion,vignette,softness,description,range,tilt})}
add("authored","Authored focal path","لنز مسیر اصلی","authored",null,1,0,0,0,"Retains the focal-length animation in the selected path.");
for(let mm of [8,10,12,14,16,18,20,21,24,25,28,32,35,40,45,50,55,58,65,75,85,90,100,105,135,150,180,200,250,300,400,500,600,800]){let k=mm<=14?"ultra-wide":mm<=32?"wide":mm<=58?"standard":mm<=135?"portrait / telephoto":"super telephoto";add("prime-"+mm,mm+" mm rectilinear prime",mm+" میلی‌متر پرایم",k,mm,1,0,mm<=14?.12:0,0,"Fixed focal-length reference. At the same camera position, a narrower field of view enlarges the subject; perspective depends on camera distance.")}
for(let [a,b] of [[11,24],[14,24],[16,35],[18,55],[20,70],[24,70],[24,105],[28,135],[35,150],[70,200],[100,400],[150,600],[200,600]])add("zoom-"+a+"-"+b,a+"–"+b+" mm zoom",a+" تا "+b+" میلی‌متر زوم","zoom",(a+b)/2,1,0,0,0,"Optical zoom range; preserves animated focal variation within these bounds.",[a,b]);
for(let s of [1.33,1.5,1.8,2])for(let mm of [35,50,75])add("ana-"+String(s).replace(".","")+"-"+mm,mm+" mm anamorphic "+s+"×",mm+" میلی‌متر آنامورفیک "+s+"×","anamorphic",mm,s,.018,.12,.015,"Horizontal desqueezed field of view; stylized radial optics only, not a particular real lens design.");
for(let mm of [35,60,90,100,105,180])add("macro-"+mm,mm+" mm macro",mm+" میلی‌متر ماکرو","macro",mm,1,0,.12,0,"Close-detail framing and thin-lens depth-of-field estimate. Minimum focusing distance and macro magnification are not physically simulated.");
for(let mm of [8,10,12,15,16])add("fisheye-"+mm,mm+" mm fisheye look",mm+" میلی‌متر فیش‌آی","fisheye",mm,1,-.40,.35,0,"Approximate image-space barrel warp; not a true calibrated 180° fisheye projection.");
for(let mm of [17,24,45,90])add("tiltshift-"+mm,mm+" mm tilt-shift look",mm+" میلی‌متر تیلت شیفت","tilt-shift",mm,1,0,.08,.04,"Approximate shifted frame / selective blur, not a physically tilted focus plane.",null,.7);
add("vintage-58","58 mm vintage portrait","۵۸ میلی‌متر پرتره وینتیج","character",58,1,.05,.36,.16,"Stylized soft edges and vignetting, not a specific vintage lens replica.");
add("soft-85","85 mm soft focus","۸۵ میلی‌متر فوکوس نرم","character",85,1,0,.22,.35,"Image-space diffusion approximation.");
add("pinhole-24","24 mm pinhole look","۲۴ میلی‌متر پین‌هول","character",24,1,0,.48,.32,"Stylized pinhole vignetting / softness; exposure not simulated.");
add("probe-24","24 mm probe lens","۲۴ میلی‌متر پروب","macro",24,1,-.07,.08,0,"Wide close-detail composition; actual probe barrel clearance and focusing not simulated.");
add("barrel-35","35 mm barrel distortion","۳۵ میلی‌متر اعوجاج بشکه‌ای","distortion",35,1,-.22,.12,0,"Radial screen-space barrel distortion.");
add("pincushion-85","85 mm pincushion distortion","۸۵ میلی‌متر اعوجاج بالشتکی","distortion",85,1,.22,.1,0,"Radial screen-space pincushion distortion.");
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
function profile(state){let p=byId[state.lensType]||P[0];return {...p,distortion:clamp(p.distortion+(Number(state.distortion)||0),-.65,.65),vignette:clamp(p.vignette+(Number(state.vignette)||0),0,.95),shift:clamp(Number(state.lensShift)||0,-.5,.5),softness:p.softness}}
function focal(authored,state){let p=profile(state),v=clamp(authored*(Number(state.lens)||1),1,3200);if(p.range)v=clamp(v,p.range[0],p.range[1]);else if(p.id!=="authored")v=clamp(Number(state.focalMM)||p.mm||v,1,3200);return v}
function fov(sensor,focal,squeeze=1){return 2*Math.atan(sensor*squeeze/(2*focal))*180/Math.PI}
function dof(f,N,d,cc=.03){f=Math.max(1,f);N=Math.max(.5,N);d=Math.max(f+.001,d*1000);cc=Math.max(.001,cc);let H=f*f/(N*cc)+f;return{hyper:H/1000,near:H*d/(H+(d-f))/1000,far:H-(d-f)<=0?Infinity:H*d/(H-(d-f))/1000}}
root.LensEngine={presets:P,byId,profile,focal,fov,dof};
})(window);
