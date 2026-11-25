import json,re,subprocess,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
def read_js(path,prefix):
 s=path.read_text().strip()
 assert s.startswith(prefix) and s.endswith(';'),path
 return json.loads(s[len(prefix):-1].strip())
D=read_js(ROOT/'camera-library.js','window.CAMERA_LIBRARY = ')
M=read_js(ROOT/'offline-media.js','window.OFFLINE_MEDIA = ')
B=read_js(ROOT/'camera-models.js','window.CAMERA_MODELS = ')
P=read_js(ROOT/'motion-paths.js','window.MOTION_PATHS = ')
L=read_js(ROOT/'legacy-motion-paths.js','window.LEGACY_MOTION_PATHS = ')
assert P==json.loads((ROOT/'motion-paths.json').read_text())
assert len(D['refs'])==len({x['id'] for x in D['refs']})==302
assert len(B['models'])==len({x['id'] for x in B['models']})==97
files={v['file'] for v in M.values() if v}
assert len(files)==251 and len(P)+len(L)==251
assert all((DIST/f).is_file() for f in files)
assert all(len(k)==10 and k[6]>0 for a in [P,L] for p in a.values() for k in p['keys'])
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':960},accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 # Run all primary pages without any external network or external video requests.
 page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:8765/') or route.request.url.startswith('blob:') else route.abort())
 base='http://127.0.0.1:8765/'
 page.goto(base)
 page.wait_for_selector('#stats .stat')
 assert page.locator('#stats .stat').count()==5
 assert page.locator('#stats').inner_text().find('302')>=0
 page.goto(base+'references.html?id=helical-rise')
 assert page.locator('#title').inner_text()=='Helical rising orbit'
 page.wait_for_function("document.getElementById('video').readyState >= 1",timeout=20000)
 assert page.locator('#video').evaluate('(v)=>v.videoWidth')==480
 assert 'studio.html?preset=helical-rise' in page.locator('#sim').get_attribute('href')
 page.locator('#search').fill('Dolly zoom')
 assert 'Dolly' in page.locator('#title').inner_text()
 page.goto(base+'models.html')
 page.locator('#q').fill('ALEXA 265')
 assert page.locator('#cards .card').count()==1
 page.locator('#cards .card').click()
 assert '54.12' in page.locator('#metrics').inner_text()
 page.locator('#compareBtn').click()
 assert page.locator('#comparison tr').count()==2
 page.goto(base+'studio.html?preset=helical-rise&lang=en')
 page.wait_for_function("document.querySelectorAll('#metrics .metric').length===4")
 assert page.locator('#keys button').count()==9
 assert '251' in page.locator('#presetsCount').inner_text()
 assert page.locator('#camera').evaluate("""c=>{let gl=c.getContext('webgl');if(!gl)return false;let pix=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pix);let colors=new Set();for(let i=0;i<pix.length;i+=64)colors.add(pix[i]+','+pix[i+1]+','+pix[i+2]);return colors.size>4&&gl.getError()===0}""")
 page.locator('#insert').click()
 assert page.locator('#keys button').count()==10
 page.locator('#delete').click()
 assert page.locator('#keys button').count()==9
 page.locator('#height').evaluate("e=>{e.value='1.25';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 page.locator('#scene').select_option('corridor')
 page.locator('#subject').select_option('robot')
 page.locator('#save').click()
 page.locator('#load').click()
 with page.expect_download() as download:page.locator('#json').click()
 f=download.value.path()
 j=json.loads(Path(f).read_text());assert len(j['samples'])==121
 with page.expect_download() as download:page.locator('#obj').click()
 assert 'v ' in Path(download.value.path()).read_text()
 with page.expect_download() as download:page.locator('#blender').click()
 code=Path(download.value.path()).read_text()
 compile(code,'camera-atlas-blender.py','exec')
 # New timing and composition UI; compare actual sampled camera transforms.
 page.goto(base+'studio.html?preset=timing-cubic-in&lang=en')
 assert page.locator('#ease option').count()==34
 assert page.locator('#ease').input_value()=='cubic-in'
 assert abs(page.evaluate('sample(.5).pos[2]')+8.375)<1e-5
 page.locator('#ease').select_option('quad-out')
 assert abs(page.evaluate('sample(.5).pos[2]')+5.25)<1e-5
 page.locator('#ease').select_option('custom')
 page.locator('#bx1').fill('.25')
 page.locator('#bx1').press('Tab')
 assert abs(page.evaluate('timingState().bezier[0]')-.25)<1e-5
 assert page.locator('#curveGraph').evaluate("""c=>{let g=c.getContext('2d'),p=g.getImageData(0,0,c.width,c.height).data;let v=new Set();for(let i=0;i<p.length;i+=64)v.add(p[i]+','+p[i+1]+','+p[i+2]);return v.size>5}""")
 page.locator('#preset').select_option('dolly-in')
 old=page.evaluate('sample(1).target')
 page.locator('#layer1').select_option('pan-right')
 page.locator('#channel1').select_option('aim')
 page.locator('#layerEase1').select_option('sine-inout')
 page.locator('#comboMode').select_option('parallel')
 page.locator('#applyCombo').click()
 assert page.locator('#keys button').count()==97
 assert page.evaluate('path.composition.layers[0].id')=='pan-right'
 new=page.evaluate('sample(1).target')
 assert sum((a-b)**2 for a,b in zip(old,new))>.01
 page.locator('#undoCombo').click()
 assert page.locator('#keys button').count()==25
 assert page.locator('#scene option').count()==9
 assert page.locator('#light option').count()==6
 page.locator('#scene').select_option('forest')
 assert page.evaluate('state.scene')=='forest'
 count=page.evaluate('sceneMesh(sample(.5)).pos.length')
 assert count>1000
 page.locator('#scene').select_option('room')
 assert page.evaluate('sceneMesh(sample(.5)).pos.length')!=count
 page.locator('#subject').select_option('car')
 assert page.evaluate('state.subject')=='car'
 page.locator('#light').select_option('night')
 assert page.evaluate('state.light')=='night'
 page.locator('#backdrop').select_option('neutral')
 assert page.evaluate('look().amount')==0
 page.locator('#scene').select_option('snow')
 page.locator('#backdrop').select_option('full')
 full=page.evaluate('sceneMesh(sample(.5)).pos.length')
 page.locator('#backdrop').select_option('clean')
 assert page.evaluate('sceneMesh(sample(.5)).pos.length')<full
 page.goto(base+'references.html?id=timing-cubic-in')
 assert page.locator('#title').inner_text()=='Cubic Ease In'
 page.wait_for_function("document.getElementById('video').readyState >= 1",timeout=20000)
 assert page.locator('#video').evaluate('(v)=>v.videoWidth')==480
 page.goto(base+'lab.html')
 assert page.locator('#view').count()==1
 assert not errors,errors
 browser.close()
 print('PASS: data invariants, home, local MP4, search, body comparison, WebGL pixels, keyframe editing, local save/load, JSON/OBJ and Blender script syntax, classic lab, 34 easing options, Bézier editing, composition/undo, distinct 3D scenes, local easing video.')
