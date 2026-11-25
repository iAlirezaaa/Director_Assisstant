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
assert (DIST/'favicon.svg').is_file()
font=(DIST/'fonts/Vazirmatn.woff2').read_bytes()
assert font[:4]==b'wOF2' and font==(ROOT/'fonts/Vazirmatn.woff2').read_bytes()
assert 'SIL OPEN FONT LICENSE Version 1.1' in (DIST/'fonts/OFL.txt').read_text()
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
 # UI regressions use the real rendered interface with all external requests blocked.
 page.goto(base+'studio.html?lang=fa&tab=library')
 page.wait_for_selector('#libraryList [data-technique-id="orbit-180"]')
 assert page.locator('html').get_attribute('dir')=='rtl'
 assert page.evaluate("""async()=>{
  const faces=await document.fonts.load('400 16px Vazirmatn','پچژگکی فارسی');
  await document.fonts.ready;
  return faces.length>0&&faces.every(f=>f.family==='Vazirmatn'&&f.status==='loaded')
   &&getComputedStyle(document.body).fontFamily.includes('Vazirmatn');
 }"""), 'The bundled Persian font must actually load while external requests are blocked'

 # Choosing a card must preserve that DOM node, keyboard focus and list position.
 card=page.locator('#libraryList [data-technique-id="orbit-180"]')
 card.scroll_into_view_if_needed();card.focus()
 card_node=card.element_handle()
 list_scroll=page.locator('#libraryList').evaluate('(el)=>el.scrollTop')
 card.press('Enter')
 assert page.evaluate('state.id')=='orbit-180'
 assert card_node.evaluate("el=>el.isConnected&&document.activeElement===el&&el.getAttribute('aria-pressed')==='true'"), 'Selection replaced the card or lost its focus'
 assert abs(page.locator('#libraryList').evaluate('(el)=>el.scrollTop')-list_scroll)<=1
 card_node.dispose()

 # Empty search and an emptied favorites list both have a visible recovery action.
 page.locator('#libraryQuery').fill('no-such-technique-4823')
 assert page.locator('#libraryEmpty').is_visible()
 assert page.locator('#referenceDetail').is_hidden()
 page.locator('#clearLibrary').click()
 assert page.locator('#libraryQuery').input_value()==''
 assert page.locator('#libraryQuery').evaluate('(el)=>el===document.activeElement')
 assert page.locator('#libraryList [data-technique-id]').count()==302
 page.locator('#favoriteTechnique').click()
 favorite_id=page.evaluate('selectedTechnique')
 page.locator('[data-library-filter="favorites"]').click()
 assert page.locator('#libraryList [data-technique-id]').count()==1
 assert page.locator('#libraryList [data-technique-id]').get_attribute('data-technique-id')==favorite_id
 assert favorite_id in page.evaluate("JSON.parse(localStorage.getItem('camera-studio-favorites'))")
 page.locator('#favoriteTechnique').click()
 assert page.locator('#libraryEmpty').is_visible() and page.locator('#referenceDetail').is_hidden()
 page.locator('#clearLibrary').click()
 assert page.locator('#libraryList [data-technique-id]').count()==302
 assert page.locator('[data-library-filter="all"]').get_attribute('aria-pressed')=='true'

 # RTL arrow-key direction and roving tab focus must agree with the visible panel.
 page.locator('#tab-library').focus();page.keyboard.press('ArrowLeft')
 assert page.locator('#tab-scene').evaluate("el=>el===document.activeElement&&el.tabIndex===0&&el.getAttribute('aria-selected')==='true'")
 assert page.locator('#panel-scene').is_visible() and page.locator('#panel-library').is_hidden()
 page.keyboard.press('ArrowRight')
 assert page.locator('#tab-library').evaluate('(el)=>el===document.activeElement')
 page.keyboard.press('End')
 assert page.locator('#tab-export').evaluate('(el)=>el===document.activeElement')
 assert page.locator('#panel-export').is_visible()
 page.keyboard.press('Home')
 assert page.locator('#tab-library').evaluate('(el)=>el===document.activeElement')
 assert page.locator('[role="tab"][tabindex="0"]').count()==1

 # Focus and preview layouts preserve the working shot while skipping a hidden world view.
 page.locator('#time').evaluate("e=>{e.value='.37';e.dispatchEvent(new Event('input',{bubbles:true}))}")
 shot_before=page.evaluate('({id:state.id,t:state.t,keys:path.keys.length})')
 page.locator('button[data-view="camera"]').click()
 assert page.evaluate('StudioUI.worldVisible') is False and page.locator('#worldMonitor').is_hidden()
 page.locator('#focusMode').click()
 assert page.locator('#focusMode').get_attribute('aria-pressed')=='true'
 assert page.locator('#workspaceTabs').is_hidden() and page.locator('#shotInspector').is_hidden()
 assert page.locator('#program').is_visible()
 assert page.evaluate('({id:state.id,t:state.t,keys:path.keys.length})')==shot_before
 page.keyboard.press('Escape')
 assert page.locator('#workspaceTabs').is_visible()
 page.locator('button[data-view="scene"]').click()
 assert page.evaluate('StudioUI.worldVisible') is True and page.locator('#worldMonitor').is_visible()
 assert page.locator('.camera-monitor').is_hidden()
 page.locator('button[data-view="split"]').click()
 assert page.locator('#worldMonitor').is_visible() and page.locator('.camera-monitor').is_visible()
 assert page.evaluate('({id:state.id,t:state.t,keys:path.keys.length})')==shot_before

 # Reference navigation clears restrictive filters and leaves focus mode.
 page.locator('#libraryQuery').fill('Dolly zoom')
 assert page.locator('#libraryList [data-technique-id="orbit-180"]').count()==0
 page.locator('#focusMode').click()
 assert page.locator('#workspaceTabs').is_hidden()
 page.locator('#showReference').click()
 assert page.locator('#focusMode').get_attribute('aria-pressed')=='false'
 assert page.locator('#panel-library').is_visible()
 assert page.locator('#libraryQuery').input_value()==''
 assert page.evaluate('selectedTechnique===state.id&&activeTab==="library"')
 assert page.locator('#libraryList [data-technique-id="orbit-180"]').get_attribute('aria-pressed')=='true'
 assert page.evaluate('({id:state.id,t:state.t,keys:path.keys.length})')==shot_before

 # At phone width, split becomes camera-only and settings remain keyboard accessible.
 page.set_viewport_size({'width':390,'height':844})
 page.wait_for_function("matchMedia('(max-width:700px)').matches&&!StudioUI.worldVisible")
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth+1'), '390px RTL layout overflows horizontally'
 assert page.locator('#shotInspector').is_hidden()
 page.locator('#focusMode').click()
 assert page.locator('#focusMode').get_attribute('aria-pressed')=='true'
 page.locator('#toggleInspector').click()
 assert page.locator('#focusMode').get_attribute('aria-pressed')=='false', 'Opening mobile settings must leave focus mode'
 assert page.locator('#toggleInspector').get_attribute('aria-expanded')=='true'
 assert page.locator('#shotInspector').is_visible() and page.locator('#inspectorBackdrop').is_visible()
 assert page.locator('#closeInspector').evaluate('(el)=>el===document.activeElement')
 page.keyboard.press('Shift+Tab')
 assert page.evaluate("""()=>{const fields=[...document.querySelectorAll('#shotInspector button,#shotInspector input,#shotInspector select,#shotInspector summary,#shotInspector a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);return document.activeElement===fields.at(-1)}"""), 'Drawer focus escaped backward'
 page.keyboard.press('Tab')
 assert page.locator('#closeInspector').evaluate('(el)=>el===document.activeElement'), 'Drawer focus escaped forward'
 page.locator('#ratio').select_option('9:16')
 assert page.evaluate('state.ratio')=='9:16'
 page.keyboard.press('Escape')
 assert page.locator('#shotInspector').is_hidden() and page.locator('#inspectorBackdrop').is_hidden()
 assert page.locator('#toggleInspector').evaluate('(el)=>el===document.activeElement')
 assert page.locator('#toggleInspector').get_attribute('aria-expanded')=='false'

 # Guides fit the visible portrait image, not the full letterboxed monitor.
 page.locator('#frameGuides').check()
 page.wait_for_function("""()=>{
  const box=document.getElementById('cameraView'),canvas=document.getElementById('program'),guide=document.getElementById('guidesOverlay');
  const b=box.getBoundingClientRect(),g=guide.getBoundingClientRect(),ratio=canvas.width/canvas.height;
  const width=Math.min(box.clientWidth,box.clientHeight*ratio),height=width/ratio;
  return !guide.hidden&&g.width>0&&g.height>0&&Math.abs(g.width-width)<2&&Math.abs(g.height-height)<2
   &&Math.abs(g.width/g.height-9/16)<.002&&Math.abs((g.left+g.right)-(b.left+b.right))<2
   &&Math.abs((g.top+g.bottom)-(b.top+b.bottom))<2;
 }""",timeout=10000)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 tab('optics')
 page.locator('#focalMM').fill('35');page.locator('#focalMM').press('Tab')
 assert abs(page.evaluate('sample(0).focal')-35)<.01

 # A short laptop may scroll, but the active tool panel and its controls stay usable.
 page.set_viewport_size({'width':1366,'height':660})
 page.wait_for_function("!matchMedia('(max-width:980px)').matches&&StudioUI.worldVisible")
 tab('export')
 assert page.locator('#panel-export').evaluate('(el)=>el.clientHeight>=100')
 page.locator('#load').scroll_into_view_if_needed()
 page.locator('#load').click(trial=True)
 assert page.locator('#load').evaluate("el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1}"), 'Export controls are outside the reachable laptop viewport'
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 page.goto(base+'lab.html');assert page.locator('#view').count()==1

 # Reviewable screenshots of the real software-WebGL render; kept outside dist.
 preview_dir=ROOT/'qa-previews';preview_dir.mkdir(exist_ok=True)
 page.set_viewport_size({'width':1440,'height':960})
 page.goto(base+'studio.html?lang=fa&tab=library')
 page.wait_for_function("renderCam&&renderWorld&&preview?.compose&&state.instances.some(i=>i.assetId==='person-a')")
 page.evaluate('async()=>{await document.fonts.ready}')
 page.locator('#localReference').evaluate("v=>{v.preload='auto';v.load()}")
 page.wait_for_function("document.getElementById('localReference').readyState>=2")
 page.wait_for_function("""()=>{
  const c=document.getElementById('program'),gl=c.getContext('webgl');
  if(!gl)return false;
  const pixels=new Uint8Array(c.width*c.height*4),colors=new Set();
  gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  for(let i=0;i<pixels.length;i+=64)colors.add(pixels[i]+','+pixels[i+1]+','+pixels[i+2]);
  return colors.size>4&&gl.getError()===0;
 }""")
 page.evaluate('window.scrollTo(0,0)')
 page.screenshot(path=str(preview_dir/'desktop-fa.png'),animations='disabled')
 page.set_viewport_size({'width':390,'height':844})
 page.wait_for_function("matchMedia('(max-width:700px)').matches&&!StudioUI.worldVisible")
 page.evaluate('window.scrollTo(0,0)')
 page.screenshot(path=str(preview_dir/'mobile-fa.png'),animations='disabled')
 assert not errors,errors
 browser.close()
 print('PASS: unified entry, local references, 81 lens profiles, 35 transition shader branches, 17 actual GLBs, user OBJ, timing, composer, keyframes, models, JSON/OBJ/Blender syntax, offline font, cached/focused cards, search/favorites recovery, RTL keyboard tabs, focus/view modes, mobile drawer, portrait guides, short-laptop controls.')
