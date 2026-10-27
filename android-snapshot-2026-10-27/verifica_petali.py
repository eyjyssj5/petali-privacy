#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
import json,struct,subprocess
r=Path(__file__).parent
cat=json.loads((r/'gioco/15-fiori-3d/catalogo.json').read_text())
assert len(cat)==15 and len({c['id'] for c in cat})==15
for c in cat:
 a=(r/'gioco/15-fiori-3d'/c['file']).read_bytes()
 assert a[:4]==b'glTF' and struct.unpack_from('<I',a,4)[0]==2
 size=struct.unpack_from('<I',a,12)[0]
 doc=json.loads(a[20:20+size])
 assert len(doc.get('meshes',[]))>0 and len(doc.get('nodes',[]))>0
names=['rosa-rossa','rosa-gialla','girasole','tulipano-rosso','orchidea','ortensia','lavanda','ciliegio','papavero','iris','garofano-rosso','viola','peonia','dalia','ibisco']
for n in names:
 assert (r/'gioco/img'/(n+'-petalo.png')).stat().st_size>0
assert 'PETALI_V22_ORIGINALI_RESTAURATI' in (r/'gioco/app.js').read_text()
assert 'PetaliCommerce' in (r/'gioco/paywall.js').read_text()
for js in ['gioco/app.js','gioco/15-fiori-3d/player.js','gioco/paywall.js']:
 subprocess.run(['node','--check',str(r/js)],check=True)
print('PASS: 15 specie 3D, 15 PNG 2D v22, JS, pagamento Premium presente')
print('Nota: PASS non certifica resa Android o funzionamento RevenueCat')
