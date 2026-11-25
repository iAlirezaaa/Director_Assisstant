"""Fetch pinned CC0 GLB assets, verify Git blob identity and bundle for file:// use."""
import base64,hashlib,json,struct,urllib.request,time,concurrent.futures
from pathlib import Path
ROOT=Path(__file__).resolve().parent
M=json.loads((ROOT/'asset-manifest.json').read_text())
def git_sha(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def fetch(a):
 p=ROOT/a['file'];p.parent.mkdir(exist_ok=True)
 b=p.read_bytes() if p.exists() else b''
 if git_sha(b)!=a['sha']:
  url='https://raw.githubusercontent.com/'+M['source']+'/'+M['revision']+'/'+a['path']
  for i in range(4):
   try:
    req=urllib.request.Request(url,headers={'User-Agent':'DirectorAssistant-AssetBuilder/1.0'})
    with urllib.request.urlopen(req,timeout=35) as response:b=response.read(25_000_001)
    if git_sha(b)!=a['sha']:raise ValueError('Git blob SHA mismatch')
    break
   except Exception:
    if i==3:raise
    time.sleep(2**i)
  p.write_bytes(b)
 assert len(b)>20 and b[:4]==b'glTF' and struct.unpack_from('<I',b,4)[0]==2 and struct.unpack_from('<I',b,8)[0]==len(b),a['id']
 return a['id'],base64.b64encode(b).decode('ascii')
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: data=dict(pool.map(fetch,M['assets']))
(ROOT/'asset-bundle.js').write_text('window.ATLAS_ASSET_BUNDLE = '+json.dumps(data,separators=(',',':'))+';\n')
print('Verified and bundled',len(data),'original Kenney CC0 GLBs')
