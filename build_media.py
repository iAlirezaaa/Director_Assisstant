import math,json,subprocess,concurrent.futures
from pathlib import Path
import cv2,numpy as np
cv2.setNumThreads(1)
ROOT=Path(__file__).resolve().parent;OUT=ROOT/'media';OUT.mkdir(exist_ok=True)
W,H,FPS,N=480,270,24,72
IDS=["static","dolly-in","dolly-out","fast-dolly","pan-left","pan-right","tilt-up","tilt-down","truck-left","truck-right","pedestal-up","pedestal-down","arc","orbit-180","orbit-360","whip","roll","handheld","leading","following","side-track","pov-walk","double-dolly","parallax","crane-up","crane-down","flyover","drone-reveal","drone-orbit","fpv-dive","low-angle","high-angle","top-down","dutch-angle","eye-level","shoulder-level","hip-level","knee-level","ground-level","worms-eye","aerial-angle","side-90","establishing","extreme-wide","wide","full","medium-wide","medium","medium-close","close","extreme-close","two-shot","three-shot","negative-space","zoom-in","zoom-out","crash-zoom","dolly-zoom","reverse-dolly-zoom","ultra-wide","wide-lens","normal-lens","telephoto","deep-focus","soft-focus","focus-reveal"]
PATHS=json.loads((ROOT/'motion-paths.json').read_text())
IDS=IDS+list(PATHS)
def cam(k,t):
 if k in PATHS:
  path=PATHS[k];keys=path['keys'];q=min(max(t,0),1)*(len(keys)-1);j=min(int(q),len(keys)-2);v=q-j;v=v*v*(3-2*v) if path.get('curve')=='smooth' else v
  kf=np.array(keys[j])*(1-v)+np.array(keys[j+1])*v
  return kf[:3],kf[3:6],np.array([kf[8],0,kf[9]]),kf[6],kf[7]
 e=t*t*(3-2*t);p=np.array([0.,1.65,-6.]);a=np.array([0.,1.05,0.]);s=np.zeros(3);f=50.;roll=0.
 if k=='dolly-in':p[2]=-7+4*e
 if k=='dolly-out':p[2]=-3-6*e
 if k=='fast-dolly':p[2]=-9+6*(1-(1-min(1,t*2.5))**2)
 if k in ('pan-left','pan-right','whip'):
  v=1/(1+math.exp(-35*(t-.5))) if k=='whip' else e;a[0]=(v-.5)*9*(-1 if k=='pan-left' else 1)
 if k in ('tilt-up','tilt-down'):a[1]=-.2+4*(e if k=='tilt-up' else 1-e)
 if k in ('truck-left','truck-right','parallax'):p[0]=(e-.5)*5*(-1 if k=='truck-left' else 1);a[0]=p[0] if k!='parallax' else 0
 if k in ('pedestal-up','pedestal-down'):p[1]=.4+3*(e if k=='pedestal-up' else 1-e);a[1]=p[1]-.5
 if k in ('arc','orbit-180','orbit-360','drone-orbit'):
  v={'arc':math.pi/2,'orbit-180':math.pi,'orbit-360':2*math.pi,'drone-orbit':math.pi}[k]*t;p=np.array([6*math.sin(v),5 if k=='drone-orbit' else 1.65,-6*math.cos(v)])
 if k=='roll':roll=(e-.5)*1.2
 if k=='handheld':p[0]+=.1*math.sin(30*t);p[1]+=.08*math.sin(52*t);a[0]+=.1*math.sin(23*t);roll=.035*math.sin(44*t)
 if k in ('leading','following','double-dolly'):s[2]=4*t;p[2]=s[2]+(4 if k=='following' else -4);a[2]=s[2]
 if k=='side-track':s[0]=4*(t-.5);p[0]=a[0]=s[0]
 if k=='pov-walk':p[2]=-8+5*t;p[1]=1.65+.07*math.sin(38*t);a[2]=p[2]+4;a[1]=p[1]-.05
 if k in ('crane-up','crane-down'):
  v=e if k=='crane-up' else 1-e;p[1]=1.5+5*math.sin(v*math.pi/2);p[2]=-4-3*v
 if k=='flyover':p=np.array([0.,7.,-9+12*t]);a=np.array([0.,0.,p[2]+4]);f=28
 if k=='drone-reveal':p=np.array([-3.,1.2+6*e,-7+2*e]);f=28
 if k=='fpv-dive':p=np.array([2*(1-e),9-7.5*e,-12+9*e]);f=24
 heights={'low-angle':.45,'high-angle':4.5,'eye-level':1.65,'shoulder-level':1.45,'hip-level':.95,'knee-level':.5,'ground-level':.10,'worms-eye':.08,'aerial-angle':7.5}
 if k in heights:p[1]=heights[k];p[2]=-3 if k=='worms-eye' else -6;a[1]=1.5 if k in ('low-angle','worms-eye') else 1.05
 if k=='top-down':p=np.array([0.,8.,0.]);a=np.zeros(3);f=35
 if k=='dutch-angle':roll=.32
 if k=='side-90':p=np.array([6.,1.65,0.])
 sizes={'establishing':(17,1),'extreme-wide':(24,1),'wide':(10,1),'full':(5.8,.9),'medium-wide':(4,.95),'medium':(3,1.25),'medium-close':(2.3,1.4),'close':(1.5,1.63),'extreme-close':(.85,1.65),'two-shot':(7,1),'three-shot':(8,1),'negative-space':(7,1)}
 if k in sizes:p[2]=-sizes[k][0];a[1]=sizes[k][1];p[1]=a[1]+.08
 if k=='negative-space':a[0]=2
 if k in ('zoom-in','zoom-out','crash-zoom'):f=28+62*(1-e if k=='zoom-out' else min(1,t*7) if k=='crash-zoom' else e)
 if k in ('dolly-zoom','reverse-dolly-zoom'):
  v=e if k=='dolly-zoom' else 1-e;p[2]=-8+5*v;f=65*np.linalg.norm(a-p)/math.hypot(8,a[1]-p[1])
 if k in ('ultra-wide','wide-lens','normal-lens','telephoto'):f={'ultra-wide':14,'wide-lens':24,'normal-lens':50,'telephoto':135}[k];p[2]=-6*f/50
 return p,a,s,f,roll
BG=np.zeros((H,W,3),np.uint8)
for y in range(H):BG[y]=[int(78-y*.10),int(63-y*.10),int(51-y*.09)]
def box(x,z,w,h,d,col):
 v=np.array([[x-w/2,0,z-d/2],[x+w/2,0,z-d/2],[x+w/2,h,z-d/2],[x-w/2,h,z-d/2],[x-w/2,0,z+d/2],[x+w/2,0,z+d/2],[x+w/2,h,z+d/2],[x-w/2,h,z+d/2]])
 return [(v[ix],tuple(int(c*m) for c in col)) for ix,m in [([0,1,2,3],1),([1,5,6,2],.65),([4,5,6,7],.85),([0,4,7,3],.75),([3,2,6,7],1.25)]]
FACES=[f for b in [(-3,-1,1,2.7,1,(105,137,156)),(3,2,1.6,3.7,1.4,(112,131,125)),(-3,5,1.4,3.6,1.4,(111,105,85)),(2,7,2.2,2.8,2,(92,116,150)),(-4,10,2.5,4,2,(103,122,129)),(5,-3,1.5,1.4,1.5,(93,111,131)),(0,12,2,5,2,(100,110,120))] for f in box(*b)]
GRID=np.array([l for n in range(-16,17,2) for l in [[(n,0,-18),(n,0,18)],[(-18,0,n),(18,0,n)]]],float)
def render(k,t):
 p,a,s,f,roll=cam(k,t);fw=a-p;fw/=np.linalg.norm(fw);up=np.array([0,0,1]) if abs(fw[1])>.999 else np.array([0,1,0]);right=np.cross(up,fw);right/=np.linalg.norm(right);up=np.cross(fw,right);r=right*math.cos(roll)+up*math.sin(roll);u=up*math.cos(roll)-right*math.sin(roll);basis=np.array([r,u,fw]).T;scale=W*f/36;im=BG.copy()
 def proj(v):
  q=(np.asarray(v)-p)@basis;z=q[...,2];return np.stack((W/2+scale*q[...,0]/np.maximum(z,.01),H/2-scale*q[...,1]/np.maximum(z,.01)),axis=-1),z
 def pts(v):return np.clip(v,-20000,20000).astype(np.int32)
 for line in GRID:
  q=(line-p)@basis;z=q[:,2]
  if max(z)<.1:continue
  if min(z)<.1:
   j=int(np.argmin(z));q[j]+=(q[1-j]-q[j])*(.1-z[j])/(z[1-j]-z[j])
  xy=np.column_stack((W/2+scale*q[:,0]/q[:,2],H/2-scale*q[:,1]/q[:,2]));cv2.line(im,tuple(pts(xy[0])),tuple(pts(xy[1])),(83,77,67),1,cv2.LINE_AA)
 faces=[]
 for v,c in FACES:
  q,z=proj(v)
  if min(z)>.1:faces.append((float(np.mean(z)),pts(q),c))
 for _,q,c in sorted(faces,key=lambda v:-v[0]):cv2.fillConvexPoly(im,q,c,cv2.LINE_AA);cv2.polylines(im,[q],True,(57,52,46),1,cv2.LINE_AA)
 people=[s]
 if k in ('two-shot','three-shot'):people=[np.array([-1.,0,0]),np.array([1.,0,0])]+([np.array([0.,0,1.4])] if k=='three-shot' else [])
 for x,y,z in people:
  step=.1*math.sin(t*math.pi*4) if k in ('leading','following','side-track','double-dolly') or (k in PATHS and np.linalg.norm(s)>.01) else 0
  q,depth=proj([[x,1.63,z],[x,1.35,z],[x,.75,z],[x-.22,1.27,z],[x+.22,1.27,z],[x-.35,.94,z],[x+.35,.94,z],[x-.18,.03,z+step],[x+.18,.03,z-step],[x,1.60,z-.14]])
  if min(depth)<.12:continue
  rad=max(2,min(85,int(scale*.14/depth[0])));q=pts(q)
  for aa,bb in [(1,2),(3,4),(3,5),(4,6),(2,7),(2,8)]:cv2.line(im,tuple(q[aa]),tuple(q[bb]),(75,139,237),max(2,int(rad*.85)),cv2.LINE_AA)
  cv2.circle(im,tuple(q[0]),rad,(107,175,248),-1,cv2.LINE_AA);cv2.circle(im,tuple(q[9]),max(1,rad//4),(50,60,80),-1,cv2.LINE_AA)
 if k=='soft-focus':im=cv2.GaussianBlur(im,(9,9),2.2)
 if k=='focus-reveal' and 7*(1-t)>.2:im=cv2.GaussianBlur(im,(0,0),7*(1-t))
 return im
STATIC=set('low-angle high-angle top-down dutch-angle eye-level shoulder-level hip-level knee-level ground-level worms-eye aerial-angle side-90 establishing extreme-wide wide full medium-wide medium medium-close close extreme-close two-shot three-shot negative-space static deep-focus soft-focus ultra-wide wide-lens normal-lens telephoto'.split())
def verify(path):
 d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration','-of','json',str(path)]));s=d['streams'][0]
 assert s['codec_name']=='h264' and s['width']==W and s['height']==H and s['r_frame_rate']=='24/1' and s['nb_frames']=='72' and abs(float(d['format']['duration'])-3)<.01,path
def make(k):
 dest=OUT/(k+'.mp4');tmp=OUT/(k+'.tmp.mp4')
 if dest.exists():
  try:verify(dest);return k
  except Exception:pass
 cmd=['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-threads','1','-preset','ultrafast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',str(tmp)]
 with subprocess.Popen(cmd,stdin=subprocess.PIPE) as proc:
  frames=[render(k,j/(N-1)) for j in range(N)] if k not in STATIC else [render(k,0)]*N
  for im in frames:proc.stdin.write(im.tobytes())
  proc.stdin.close()
  if proc.wait():raise RuntimeError(k)
 verify(tmp);tmp.replace(dest);return k
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for k in pool.map(make,IDS):print(k,flush=True)
 print('verified',len(IDS),'MP4 clips',flush=True)
