#!/usr/bin/env python3
"""Generate reversible 3D rose pilot in an independent Petali project copy.

Changes both GLB roses with a continuous Y transformation, so stems, leaves and
petals all keep their existing joints. Never hide stem meshes or touch 2D.
"""
from __future__ import annotations
import argparse
import json
import math
import struct
from pathlib import Path

CUTOFF = 0.444
STEM_SCALE = 0.34
PILOT_MARK = 'PETALI_ROSE_PILOTA_27_10_2026'
ROSE_FILES = ('rosa.glb', 'rosa-gialla.glb')

def read_glb(path: Path):
    raw = path.read_bytes()
    if len(raw) < 28 or raw[:4] != b'glTF' or struct.unpack_from('<I', raw, 4)[0] != 2:
        raise ValueError(f'Invalid glTF 2.0: {path}')
    if struct.unpack_from('<I', raw, 8)[0] != len(raw):
        raise ValueError(f'Invalid GLB length: {path}')
    off = 12
    chunks = []
    while off < len(raw):
        size, kind = struct.unpack_from('<II', raw, off)
        off += 8
        chunks.append((kind, raw[off:off+size]))
        off += size
    if len(chunks) != 2 or chunks[0][0] != 0x4e4f534a or chunks[1][0] != 0x004e4942:
        raise ValueError('Only standard JSON+BIN GLB supported')
    return json.loads(chunks[0][1].decode('utf-8')), bytearray(chunks[1][1])

def vectors(doc, binary, ix):
    a = doc['accessors'][ix]
    if a['componentType'] != 5126 or a['type'] != 'VEC3' or a.get('sparse'):
        raise ValueError(f'Only Float32 VEC3 supported: {ix}')
    v = doc['bufferViews'][a['bufferView']]
    stride = v.get('byteStride', 12)
    start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    end = v.get('byteOffset', 0) + v['byteLength']
    offsets = [start + i * stride for i in range(a['count'])]
    if offsets and offsets[-1] + 12 > end:
        raise ValueError('Accessor out of bounds')
    return offsets, [struct.unpack_from('<fff', binary, o) for o in offsets]

def transform_glb(src, dst):
    doc, binary = read_glb(src)
    changed = set()
    vertices_count = 0
    for mesh in doc['meshes']:
        for prim in mesh['primitives']:
            attr = prim['attributes']
            ix = attr['POSITION']
            if ix in changed:
                continue
            changed.add(ix)
            offsets, positions = vectors(doc, binary, ix)
            if not positions:
                continue
            remapped = []
            for pos, off in zip(positions, offsets):
                y = pos[1]
                newy = CUTOFF + (y - CUTOFF) * STEM_SCALE if y < CUTOFF else y
                if y != newy:
                    struct.pack_into('<f', binary, off + 4, newy)
                remapped.append((pos[0], newy, pos[2]))
            a = doc['accessors'][ix]
            a['min'] = [min(p[k] for p in remapped) for k in range(3)]
            a['max'] = [max(p[k] for p in remapped) for k in range(3)]
            vertices_count += len(positions)
            if 'NORMAL' in attr:
                n_offsets, normals = vectors(doc, binary, attr['NORMAL'])
                if len(normals) != len(positions):
                    raise ValueError('Normal count mismatch')
                for p, normal, o in zip(positions, normals, n_offsets):
                    if p[1] >= CUTOFF:
                        continue
                    x, y, z = normal
                    length = math.sqrt(x*x + (y/STEM_SCALE)**2 + z*z) or 1.0
                    struct.pack_into('<fff', binary, o, x/length, y/STEM_SCALE/length, z/length)
    if vertices_count < 1000:
        raise ValueError('Rose mesh unexpectedly small')
    doc.setdefault('asset', {}).setdefault('extras', {})['petali_pilot'] = {
        'marker': PILOT_MARK, 'cutoff_y': CUTOFF, 'stem_scale': STEM_SCALE
    }
    jb = json.dumps(doc, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    jb += b' ' * (-len(jb) % 4)
    bb = bytes(binary)
    bb += b'\0' * (-len(bb) % 4)
    data = struct.pack('<4sII', b'glTF', 2, 12+8+len(jb)+8+len(bb))
    data += struct.pack('<II', len(jb), 0x4e4f534a) + jb
    data += struct.pack('<II', len(bb), 0x004e4942) + bb
    dst.write_bytes(data)
    verified, _ = read_glb(dst)
    names = [n.get('name','') for n in verified.get('nodes',[])]
    assert 'Cut stem' in names
    assert sum('curved petal' in n for n in names) >= 18
    print('GLB OK:', dst.name, 'vertices:', vertices_count, 'nodes:', len(names))

def patch_player(path):
    s = path.read_text(encoding='utf-8')
    if PILOT_MARK in s:
        print('Player already patched')
        return
    old = "phase='pick';removedCount=0;zoom=1;yaw=-.26;pitch=.12;$('flowerName')"
    new = "phase='pick';removedCount=0;zoom=1;yaw=-.26;pitch=current?.metodo==='rose'?.53:.12;$('flowerName')"
    oldreset = "$('reset').onclick=()=>{zoom=1;yaw=-.26;pitch=.12;updateRosePhoto()}"
    newreset = "$('reset').onclick=()=>{zoom=1;yaw=-.26;pitch=current?.metodo==='rose'?.53:.12;updateRosePhoto()}"
    if s.count(old) != 1 or s.count(oldreset) != 1:
        raise ValueError('Unknown player.js version; no blind replacement')
    s = s.replace(old,new).replace(oldreset,newreset)
    path.write_text(s+f'\n/* {PILOT_MARK}: rose-only camera. */\n',encoding='utf-8')
    print('Player: rose-only camera patched')

def patch_appid(root):
    f = root/'capacitor.config.json'
    d = json.loads(f.read_text(encoding='utf-8'))
    if d.get('appId') == 'com.aivevia.petali.pilota':
        return
    if d.get('appId') != 'com.aivevia.petali':
        raise ValueError('Unexpected original appId')
    d['appId'] = 'com.aivevia.petali.pilota'
    d['appName'] = 'Petali 3D TEST'
    f.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('Distinct Android appId configured')

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('project',type=Path)
    root=ap.parse_args().project.expanduser().resolve()
    if root.name == 'petali-compilazione-finale':
        raise SystemExit('REFUSING to edit stable Petali original')
    p=root/'gioco/15-fiori-3d/player.js'
    if not p.exists() or not (root/'gioco/img/rosa-rossa-petalo.png').exists():
        raise SystemExit('Incomplete source tree, no change')
    for filename in ROSE_FILES:
        f=root/'gioco/15-fiori-3d/assets'/filename
        if not f.exists():
            raise SystemExit('Missing 3D model: '+str(f))
        backup=root/'PILOTA_BACKUP_MODELLI'/filename
        backup.parent.mkdir(exist_ok=True)
        if not backup.exists():
            backup.write_bytes(f.read_bytes())
        transform_glb(backup,f)
    patch_player(p)
    patch_appid(root)
    print('PILOT PREPARED: two roses only; stable original untouched')

if __name__=='__main__':
    main()
