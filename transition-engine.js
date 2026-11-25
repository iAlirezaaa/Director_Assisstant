/* Two-shot optical/compositing preview; offline WebGL, no CDN. */
(function(root){"use strict";
const defs=[
["none","Single shot","بدون ترنزیشن","View only shot A."],
["cut","Hard cut","کات مستقیم","An immediate change from shot A to shot B."],
["dissolve","Cross dissolve","دیزالو","Blend the outgoing and incoming images."],
["fade-black","Dip to black","محو تا سیاهی","Fade A to black, then fade B in."],
["fade-white","Dip to white","محو تا سفیدی","Fade through a white frame."],
["wipe-left","Wipe left","وایپ چپ","Reveal B horizontally from the right."],
["wipe-right","Wipe right","وایپ راست","Reveal B horizontally from the left."],
["wipe-up","Wipe up","وایپ بالا","Reveal B vertically upward."],
["wipe-down","Wipe down","وایپ پایین","Reveal B vertically downward."],
["wipe-diagonal","Diagonal wipe","وایپ مورب","Reveal B along a diagonal edge."],
["iris-in","Iris reveal","آیریس بازشونده","Expand a circular reveal of B."],
["iris-out","Iris close","آیریس بسته‌شونده","Contract a circular view of A."],
["push-left","Push left","پوش چپ","A and B slide together to the left."],
["push-right","Push right","پوش راست","A and B slide together to the right."],
["push-up","Push up","پوش بالا","A and B slide upward together."],
["push-down","Push down","پوش پایین","A and B slide downward together."],
["slide-left","Slide overlay left","اسلاید روی تصویر","B slides over the stationary A."],
["zoom-in","Zoom-through","عبور با زوم","Enlarge A toward a center and blend into B."],
["zoom-out","Zoom-away","زوم به بیرون","Pull out of B from A with scale and blending."],
["whip-horizontal","Whip pan horizontal","پن شلاقی افقی","Simulated horizontal streak and displacement between shots."],
["whip-vertical","Whip tilt vertical","تیلت شلاقی عمودی","Simulated vertical streak and displacement."],
["spin","Spin transition","ترنزیشن چرخشی","Rotate and blend the two images."],
["blur","Defocus dissolve","دیزالو محو","Blend images with approximate blur in the middle."],
["flash","Light flash","فلش نوری","Brief light flash conceals the change."],
["pixel","Pixelation reveal","ترنزیشن پیکسلی","Coarsen the frame during the switch."],
["glitch","Digital glitch","گلیچ دیجیتال","Horizontal strip displacement and color separation."],
["split","Split from center","وایپ از مرکز","Reveal B symmetrically from the center."],
["clock","Clock wipe","وایپ ساعت‌گرد","Reveal B by a rotating radial wedge."],
["checker","Checker reveal","وایپ شطرنجی","Reveal alternating cells progressively."],
["film-burn","Film burn","فیلم‌برن","Stylized warm light leak conceals the change."],
["luma","Luma dissolve","دیزالو روشنایی","Reveal B using its image luminance."],
["match","Match cut","مچ کات","Instant cut; meaningful alignment depends on the two authored shots."],
["horizontal-blinds","Horizontal blinds","کرکره‌ای افقی","Reveal B in repeating horizontal stripes."],
["vertical-blinds","Vertical blinds","کرکره‌ای عمودی","Reveal B in repeating vertical stripes."],
["diamond","Diamond wipe","وایپ لوزی","Expand a diamond-shaped reveal."],
["ripple","Ripple dissolve","دیزالو موجی","Blend the images with a radial ripple."]
].map((a,i)=>({id:a[0],en:a[1],fa:a[2],description:a[3],code:i}));
const byId=Object.fromEntries(defs.map(d=>[d.id,d]));
function timing(t,overlap){let w=Math.max(.02,Math.min(.9,Number(overlap)||.25)),a=(1-w)/2,b=a+w;return{a:Math.min(1,t/b),b:Math.max(0,Math.min(1,(t-a)/(1-a))),mix:Math.max(0,Math.min(1,(t-a)/w)),start:a,end:b}}
function compositor(canvas){let gl=canvas.getContext("webgl",{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)throw Error("Program compositor unavailable");let vs="attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
let fs=`precision mediump float;
varying vec2 uv;uniform sampler2D A,B;uniform float mixT,distortion,vignette,shift,softness,tilt,aspect;uniform int mode;
vec2 warp(vec2 p){vec2 q=(p-.5)*vec2(aspect,1.);float r=dot(q,q);q*=1.-distortion*r;return q/vec2(aspect,1.)+.5+vec2(0.,shift);}
vec4 tex(sampler2D im,vec2 p){vec2 q=warp(p);float f=softness*.012+tilt*.012*pow(abs(p.y-.5)*2.,2.);vec4 c=texture2D(im,clamp(q,0.,1.));if(f>.0001){c=(c*4.+texture2D(im,clamp(q+vec2(f,0),0.,1.))+texture2D(im,clamp(q-vec2(f,0),0.,1.))+texture2D(im,clamp(q+vec2(0,f),0.,1.))+texture2D(im,clamp(q-vec2(0,f),0.,1.)))/8.;}float edge=1.-vignette*smoothstep(.18,.72,length((p-.5)*vec2(1.,.92)));c.rgb*=edge;return c;}
vec2 rot(vec2 q,float a){q-=.5;float c=cos(a),s=sin(a);return mat2(c,-s,s,c)*q+.5;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){float t=mixT,u=smoothstep(0.,1.,t);vec2 p=uv,q=p-.5;vec4 a=tex(A,p),b=tex(B,p),c=a;float w=.008;
if(mode==0){c=a;}else if(t<=0.){c=a;}else if(t>=1.){c=b;}else if(mode==1||mode==31){c=t<.5?a:b;}
else if(mode==2){c=mix(a,b,u);}
else if(mode==3||mode==4){vec4 k=mode==3?vec4(0.,0.,0.,1.):vec4(1.);c=t<.5?mix(a,k,t*2.):mix(k,b,(t-.5)*2.);}
else if(mode>=5&&mode<=9){float v=mode==5?1.-p.x:mode==6?p.x:mode==7?p.y:mode==8?1.-p.y:(p.x+p.y)*.5;c=mix(a,b,1.-smoothstep(u-w,u+w,v));}
else if(mode==10||mode==11){float d=length(q*vec2(aspect,1.))/length(vec2(.5*aspect,.5));float k=mode==10?1.-smoothstep(u-w,u+w,d):smoothstep(1.-u-w,1.-u+w,d);c=mix(a,b,k);}
else if(mode>=12&&mode<=16){vec2 d=mode==12||mode==16?vec2(1.,0.):mode==13?vec2(-1.,0.):mode==14?vec2(0.,-1.):vec2(0.,1.);vec2 aa=p+d*u,bb=p-d*(1.-u);bool valid=bb.x>=0.&&bb.x<=1.&&bb.y>=0.&&bb.y<=1.;c=valid?tex(B,bb):(mode==16?a:tex(A,aa));}
else if(mode==17||mode==18){float x=mode==17?1.+u*2.:1.+u*.7;float y=mode==17?1.+(1.-u)*.8:1.+(1.-u)*2.;c=mix(tex(A,.5+q/x),tex(B,.5+q/y),u);}
else if(mode==19||mode==20){vec2 d=mode==19?vec2(1.,0.):vec2(0.,1.);float s=sin(3.14159265*u)*.15;vec4 aa=vec4(0.),bb=vec4(0.);for(int i=0;i<9;i++){float j=(float(i)-4.)/4.;aa+=tex(A,p+d*(s*j+u*.13));bb+=tex(B,p+d*(s*j-(1.-u)*.13));}c=mix(aa/9.,bb/9.,u);}
else if(mode==21){c=mix(tex(A,rot(p,-u*3.14159)),tex(B,rot(p,(1.-u)*3.14159)),u);}
else if(mode==22){float s=sin(3.14159*u)*.034;vec4 aa=vec4(0.),bb=vec4(0.);for(int i=0;i<9;i++){float th=float(i)*.7854;vec2 d=vec2(cos(th),sin(th))*s;aa+=tex(A,p+d);bb+=tex(B,p+d);}c=mix(aa/9.,bb/9.,u);}
else if(mode==23){c=mix(mix(a,b,u),vec4(1.),pow(sin(3.14159*t),6.));}
else if(mode==24){float n=1.+floor(95.*sin(3.14159*u));vec2 z=floor(p*vec2(120./n+1.))/(120./n+1.);c=mix(tex(A,z),tex(B,z),u);}
else if(mode==25){float s=sin(3.14159*u)*.12;float d=(hash(vec2(floor(p.y*35.),floor(t*20.)))-.5)*s;vec2 z=p+vec2(d,0.);c=mix(tex(A,z),tex(B,z),u);c.r=mix(c.r,mix(tex(A,z+vec2(s*.14,0.)).r,tex(B,z+vec2(s*.14,0.)).r,u),.8);}
else if(mode==26){c=mix(a,b,1.-smoothstep(u-w,u+w,abs(q.x)*2.));}
else if(mode==27){float angle=(atan(q.y,q.x)+3.14159)/6.28318;c=mix(a,b,1.-smoothstep(u-w,u+w,angle));}
else if(mode==28){vec2 tile=floor(p*vec2(12.,8.));float v=hash(tile);c=mix(a,b,1.-smoothstep(u-w,u+w,v));}
else if(mode==29){float glow=pow(sin(3.14159*u),3.)*(.55+.45*sin(p.x*4.+p.y*3.));c=mix(mix(a,b,u),vec4(1.,.46,.14,1.),glow);}
else if(mode==30){float l=dot(b.rgb,vec3(.2126,.7152,.0722));c=mix(a,b,smoothstep(1.-u-.05,1.-u+.05,l));}
else if(mode==32||mode==33){float v=fract((mode==32?p.y:p.x)*12.);c=mix(a,b,1.-smoothstep(u-w,u+w,v));}
else if(mode==34){float d=(abs(q.x)+abs(q.y));c=mix(a,b,1.-smoothstep(u-w,u+w,d));}
else if(mode==35){float d=length(q);vec2 z=p+normalize(q+vec2(.0001))*.025*sin(d*70.-u*12.)*sin(3.14159*u);c=mix(tex(A,z),tex(B,z),u);}
gl_FragColor=vec4(c.rgb,1.);}
`;
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}let pr=gl.createProgram();gl.attachShader(pr,shader(gl.VERTEX_SHADER,vs));gl.attachShader(pr,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));let a=gl.getAttribLocation(pr,"p"),u=Object.fromEntries(["A","B","mixT","mode","distortion","vignette","shift","softness","tilt","aspect"].map(k=>[k,gl.getUniformLocation(pr,k)]));let buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);let tex=[gl.createTexture(),gl.createTexture()];for(let tx of tex){gl.bindTexture(gl.TEXTURE_2D,tx);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
return (A,B,id,t,lens)=>{if(canvas.width!==A.width)canvas.width=A.width;if(canvas.height!==A.height)canvas.height=A.height;gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);[A,B||A].forEach((im,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im)});gl.uniform1i(u.A,0);gl.uniform1i(u.B,1);gl.uniform1i(u.mode,byId[id]?.code||0);gl.uniform1f(u.mixT,t);for(let k of ["distortion","vignette","shift","softness","tilt"])gl.uniform1f(u[k],lens[k]||0);gl.uniform1f(u.aspect,Math.min(2.4,canvas.width/canvas.height));gl.drawArrays(gl.TRIANGLES,0,6);};}
root.TransitionEngine={defs,byId,timing,compositor};
})(window);
