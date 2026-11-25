import json,sys,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
def read_js(path,prefix):
 s=path.read_text().strip();assert s.startswith(prefix) and s.endswith(';'),path
 return json.loads(s[len(prefix):-1].strip())
D=read_js(ROOT/'camera-library.js','window.CAMERA_LIBRARY = ')
M=read_js(ROOT/'offline-media.js','window.OFFLINE_MEDIA = ')
B=read_js(ROOT/'camera-models.js','window.CAMERA_MODELS = ')
P=read_js(ROOT/'motion-paths.js','window.MOTION_PATHS = ')
L=read_js(ROOT/'legacy-motion-paths.js','window.LEGACY_MOTION_PATHS = ')
A=json.loads((ROOT/'asset-manifest.json').read_text())
assert P==json.loads((ROOT/'motion-paths.json').read_text())
assert len(D['refs'])==len({x['id'] for x in D['refs']})==302
assert len(B['models'])==len({x['id'] for x in B['models']})==97
files={v['file'] for v in M.values() if v};assert len(files)==251 and len(P)+len(L)==251
assert all((DIST/f).is_file() for f in files)
assert len(A['assets'])==17
for a in A['assets']:
 b=(DIST/a['file']).read_bytes()
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==a['sha']
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':960},accept_downloads=True)
 page.set_default_timeout(35000)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:8765/') or route.request.url.startswith('blob:') or route.request.url.startswith('data:') else route.abort())
 base='http://127.0.0.1:8765/'
 def tab(t):page.locator('#tab-'+t).click()
 page.goto(base+'?lang=en')
 page.wait_for_selector('#techTitle')
 assert '/studio.html' in page.url
 assert '251' in page.locator('#presetsCount').inner_text()
 assert page.locator('#program').is_visible(),page.locator('#status').inner_text()
 assert page.locator('#program').evaluate("""c=>{let gl=c.getContext('webgl');if(!gl)return false;let pix=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pix);let colors=new Set();for(let i=0;i<pix.length;i+=64)colors.add(pix[i]+','+pix[i+1]+','+pix[i+2]);return colors.size>4&&gl.getError()===0}""")
 # Local reference and direct routing into studio.
 page.goto(base+'references.html?id=helical-rise&lang=en')
 page.wait_for_selector('#libraryTitle')
 assert 'Helical rising orbit' in page.locator('#libraryTitle').inner_text()
 page.locator('#localReference').evaluate("v=>{v.preload='metadata';v.load()}")
 page.wait_for_function("document.getElementById('localReference').readyState>=1",timeout=20000)
 assert page.locator('#localReference').evaluate('(v)=>v.videoWidth')==480
 page.locator('#libraryQuery').fill('Dolly zoom')
 assert page.locator('#libraryList button').count()>0
 # Existing timing / composer / keyframes.
 page.goto(base+'studio.html?preset=timing-cubic-in&lang=en&tab=timing')
 assert page.locator('#ease option').count()==34
 assert abs(page.evaluate('sample(.5).pos[2]')+8.375)<1e-5
 page.locator('#ease').select_option('quad-out')
 assert abs(page.evaluate('sample(.5).pos[2]')+5.25)<1e-5
 page.locator('#ease').select_option('custom');page.locator('#bx1').fill('.25');page.locator('#bx1').press('Tab')
 assert abs(page.evaluate('timingState().bezier[0]')-.25)<1e-5
 page.locator('#preset').select_option('dolly-in');tab('mix')
 old=page.evaluate('sample(1).target')
 page.locator('#layer1').select_option('pan-right');page.locator('#channel1').select_option('aim')
 page.locator('#layerEase1').select_option('sine-inout');page.locator('#comboMode').select_option('parallel');page.locator('#applyCombo').click()
 assert page.evaluate('path.keys.length')==97
 new=page.evaluate('sample(1).target');assert sum((a-b)**2 for a,b in zip(old,new))>.01
 page.locator('#undoCombo').click();tab('keys')
 assert page.locator('#keys button').count()==25
 page.locator('#insert').click();assert page.locator('#keys button').count()==26
 page.locator('#delete').click();assert page.locator('#keys button').count()==25
 # Optics, actual fixed focal values and anamorphic projection.
 tab('optics')
 assert page.locator('#lensType option').count()==81
 page.locator('#lensType').select_option('prime-85')
 assert page.evaluate('sample(0).focal')==85 and page.evaluate('sample(1).focal')==85
 page.locator('#lensType').select_option('ana-2-50')
 assert abs(page.evaluate('LE.profile(state).squeeze')-2)<1e-6
 assert abs(page.evaluate('LE.fov(36,50,2)')-71.5077745)<.01
 page.locator('#bodyQuery').fill('ALEXA 265');assert page.locator('#bodyCatalog option').count()==1
 page.locator('#applyBody').click();assert abs(page.evaluate('state.sensor')-54.12)<.001
 page.locator('#compareBody').click();assert page.locator('#bodyTable tr').count()==2
 page.locator('#resetOptics').click()
 # All transition shader branches: red and blue sources are real textures.
 assert page.evaluate("""()=>{let a=document.createElement('canvas'),b=document.createElement('canvas'),c=document.createElement('canvas');a.width=b.width=c.width=64;a.height=b.height=c.height=36;for(let [x,color] of [[a,'#ff0000'],[b,'#0000ff']]){let g=x.getContext('2d');g.fillStyle=color;g.fillRect(0,0,64,36)}let f=TE.compositor(c),gl=c.getContext('webgl'),p=new Uint8Array(4),sample=(id,t)=>{f(a,b,id,t,{distortion:0,vignette:0,shift:0,softness:0,tilt:0});gl.readPixels(32,18,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);return [p[0],p[1],p[2]]};for(let d of TE.defs.filter(x=>x.id!=='none')){let x=sample(d.id,0),y=sample(d.id,1);sample(d.id,.47);if(x[0]<240||x[2]>15||y[2]<240||y[0]>15||gl.getError()!==0)return false}return true}""")
 tab('transitions');assert page.locator('#transitionType option').count()==36
 page.locator('#transitionType').select_option('dissolve');page.locator('#shotB').select_option('orbit-180');page.locator('#sceneB').select_option('snow')
 page.locator('#time').evaluate("e=>{e.value='.5';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 assert page.evaluate('state.transition.id')=='dissolve'
 assert page.evaluate('project().shotB.samples.length')==121
 page.locator('#clearTransition').click()
 # Imported geometry. Parse every bundled model with no network access.
 tab('scene');assert page.locator('#scene option').count()==9
 counts=page.evaluate("async()=>{let a=[];for(let m of AM.assets){let x=await ensureAsset(m.id);a.push(x.tris.length)}return a}")
 assert len(counts)==17 and all(n>0 for n in counts),counts
 page.locator('#assetChoice').select_option('chair');page.locator('#assetRole').select_option('prop');page.locator('#addAsset').click()
 page.wait_for_function("state.instances.some(i=>i.assetId==='chair')")
 page.locator('#modelFile').set_input_files({"name":"test.obj","mimeType":"text/plain","buffer":b"v 0 0 0 1 0 0\nv 1 0 0 0 1 0\nv 0 1 0 0 0 1\nf 1 2 3\n"})
 page.wait_for_function("state.instances.some(i=>i.assetId.startsWith('user-'))")
 assert page.evaluate("sceneMesh(sample(.5)).pos.length")>1000
 page.locator('#scene').select_option('forest');page.locator('#subject').select_option('robot')
 page.locator('#light').select_option('night')
 # Exports and local save.
 tab('export');page.locator('#save').click();page.locator('#load').click()
 with page.expect_download() as dl:page.locator('#json').click()
 j=json.loads(Path(dl.value.path()).read_text());assert len(j['samples'])==121 and j['version']==2
 with page.expect_download() as dl:page.locator('#obj').click()
 assert 'v ' in Path(dl.value.path()).read_text()
 with page.expect_download() as dl:page.locator('#blender').click()
 compile(Path(dl.value.path()).read_text(),'atlas-blender.py','exec')
 page.goto(base+'models.html?lang=en')
 page.wait_for_selector('#lensType')
 assert 'tab=optics' in page.url
 page.goto(base+'lab.html');assert page.locator('#view').count()==1
 assert not errors,errors
 browser.close()
 print('PASS: unified entry, local references, 81 lens profiles, 35 transition shader branches, 17 actual GLBs, user OBJ, timing, composer, keyframes, models, JSON/OBJ/Blender syntax.')
