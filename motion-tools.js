/* Director Assistant: deterministic time remapping and camera composition. No external dependencies. */
(function(root){
"use strict";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,PI=Math.PI;
const families={
quad:t=>t*t,cubic:t=>t*t*t,quart:t=>t**4,quint:t=>t**5,
sine:t=>1-Math.cos(t*PI/2),expo:t=>t===0?0:2**(10*t-10),
circ:t=>1-Math.sqrt(Math.max(0,1-t*t)),
back:t=>2.70158*t*t*t-1.70158*t*t,
elastic:t=>t===0||t===1?t:-(2**(10*t-10))*Math.sin((10*t-10.75)*(2*PI/3)),
bounce:t=>1-bounceOut(1-t)
};
function bounceOut(t){const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d){t-=1.5/d;return n*t*t+.75}if(t<2.5/d){t-=2.25/d;return n*t*t+.9375}t-=2.625/d;return n*t*t+.984375}
const presets={linear:"Linear",smooth:"Smoothstep",smoother:"Smootherstep",custom:"Custom cubic Bézier"};
for(const family of Object.keys(families))for(const mode of ["in","out","inout"]){let cap=family[0].toUpperCase()+family.slice(1);presets[family+"-"+mode]=cap+" "+({in:"Ease In",out:"Ease Out",inout:"Ease In-Out"}[mode])}
const defaultBezier=[.42,0,.58,1];
function sanitizeBezier(v){if(!Array.isArray(v)||v.length!==4||!v.every(Number.isFinite))return defaultBezier.slice();return [clamp(v[0],0,1),clamp(v[1],-1,2),clamp(v[2],0,1),clamp(v[3],-1,2)]}
function bezier(x,b){let [x1,y1,x2,y2]=sanitizeBezier(b);const at=(t,a,c)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*c+t*t*t;let l=0,h=1;for(let i=0;i<26;i++){let m=(l+h)/2;if(at(m,x1,x2)<x)l=m;else h=m}return at((l+h)/2,y1,y2)}
function ease(type,t,b){t=clamp(Number(t)||0,0,1);if(t===0||t===1)return t;if(type==="linear")return t;if(type==="smooth")return t*t*(3-2*t);if(type==="smoother")return t*t*t*(t*(t*6-15)+10);if(type==="custom")return bezier(t,b);const [name,mode]=String(type).split("-"),f=families[name];if(!f)return t;if(mode==="in")return f(t);if(mode==="out")return 1-f(1-t);return t<.5?f(2*t)/2:1-f(2-2*t)/2}
function slope(type,t,b){let a=Math.max(0,t-.001),c=Math.min(1,t+.001);return (ease(type,c,b)-ease(type,a,b))/(c-a||1)}
function timing(path){const x=path.timing||{};return {type:presets[x.type]?x.type:(path.curve==="smooth"?"smooth":"linear"),scope:x.scope==="segment"?"segment":"shot",bezier:sanitizeBezier(x.bezier)}}
function keyAt(path,t){let n=path.keys.length-1,tm=path.timing?timing(path):null,q=clamp(t,0,1)*n;
if(tm&&tm.scope==="shot")q=ease(tm.type,t,tm.bezier)*n;
let i=clamp(Math.floor(q),0,n-1),u=q-i;
if(tm&&tm.scope==="segment")u=ease(tm.type,u,tm.bezier);
else if(path.curve==="smooth"&&u>=0&&u<=1)u=ease("smooth",u);
let k=path.keys[i].map((x,j)=>mix(x,path.keys[i+1][j],u));k[6]=clamp(k[6],1,3200);if(Math.hypot(k[3]-k[0],k[4]-k[1],k[5]-k[2])<.0001){let a=path.keys[i];k[3]=k[0]+a[3]-a[0];k[4]=k[1]+a[4]-a[1];k[5]=k[2]+a[5]-a[2]}return k}
function angles(k,last=0){let dx=k[3]-k[0],dy=k[4]-k[1],dz=k[5]-k[2],h=Math.hypot(dx,dz),yaw=h<1e-6?last:Math.atan2(dx,dz);while(yaw-last>PI)yaw-=2*PI;while(yaw-last<-PI)yaw+=2*PI;return{yaw,pitch:Math.atan2(dy,h),distance:Math.max(.1,Math.hypot(dx,dy,dz))}}
function composition(primary,layers,mode="parallel",count=73){
if(!primary||!Array.isArray(primary.keys)||primary.keys.length<2)throw Error("Invalid primary path");layers=layers.filter(l=>l.path&&l.strength!==0).map(l=>({...l,strength:clamp(Number(l.strength)||0,-2,2)}));count=clamp(Math.round(count),2,241);
const all=[{path:primary,strength:1,channel:"all"},...layers],N=all.length;
const initial=all.map(l=>{let k=keyAt(l.path,0),a=angles(k);return {k,a,last:a.yaw}});
let keys=[];
for(let i=0;i<count;i++){let t=i/(count-1);let raw=all.map((l,j)=>{let u=mode==="sequence"?clamp(t*N-j,0,1):t,k=keyAt(l.path,u),a=angles(k,initial[j].last);initial[j].last=a.yaw;return{k,a}});
let k=raw[0].k.slice(),pos=k.slice(0,3),a=raw[0].a,yaw=a.yaw,pitch=a.pitch,focal=k[6],roll=k[7];
for(let j=1;j<N;j++){let l=all[j],r=raw[j],o=initial[j],s=l.strength,ch=l.channel||"all";
if(ch==="all"||ch==="translation")for(let z=0;z<3;z++)pos[z]+=(r.k[z]-o.k[z])*s;
if(ch==="all"||ch==="aim"){yaw+=(r.a.yaw-o.a.yaw)*s;pitch+=(r.a.pitch-o.a.pitch)*s;}
if(ch==="all"||ch==="lens")focal*=Math.exp(Math.log(Math.max(1,r.k[6])/Math.max(1,o.k[6]))*s);
if(ch==="all"||ch==="roll")roll+=(r.k[7]-o.k[7])*s;
}
pitch=clamp(pitch,-PI/2,PI/2);let dir=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)];let aim=pos.map((v,j)=>v+dir[j]*a.distance);keys.push([...pos,...aim,clamp(focal,1,3200),roll,k[8],k[9]].map(v=>Math.round(v*1e6)/1e6));
}return {keys,curve:"linear",timing:{type:"linear",scope:"shot",bezier:defaultBezier.slice()},composition:{mode,layers:layers.map(l=>({id:l.id,channel:l.channel,strength:l.strength}))}}}
root.MotionTools={presets,ease,slope,sanitizeBezier,timing,keyAt,composition,defaultBezier};
})(typeof window!=="undefined"?window:globalThis);
