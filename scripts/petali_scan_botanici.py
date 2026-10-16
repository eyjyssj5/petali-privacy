#!/usr/bin/env python3
"""Fetch and audit CC0 botanical 3D candidates, without modifying approved rose.
These source models are only candidates pending visual and petal-removal QA.
"""
import json, subprocess, pathlib, sys, re
import trimesh
import numpy as np

BASE = pathlib.Path("gioco/modelli-botanici")
BASE.mkdir(parents=True,exist_ok=True)
models = [
  ("tulipano-rosso","tulip-flower-with-stem-a7a081fa"),
  ("girasole","sunflower-with-stem-46c9787a"),
  ("orchidea","orchid-in-pot-231b8e5f"),
  ("ortensia","hydrangea-flower-with-stem-77d795e6"),
  ("lavanda","lavender-bush-6d454088"),
  ("ciliegio","flowering-cherry-tree-6d80049e"),
]
results=[]
for flower,source in models:
   dest=BASE / (flower+".glb")
   url="https://www.innerscene.com/api/library/"+source+"/download"
   entry={"fiore":flower,"source":"https://www.innerscene.com/tools/library/3d-parts/"+source,"licenza":"CC0","status":"pending","file":str(dest)}
   try:
       if not dest.exists():
          subprocess.run(["curl","--fail","--location","--retry","3","--max-time","180","--silent","--show-error","--user-agent","Mozilla/5.0",url,"-o",str(dest)],check=True)
       magic=dest.open("rb").read(4)
       if magic != b"glTF":raise ValueError("Not a binary GLB "+str(magic))
       size=dest.stat().st_size
       if size>40000000:raise ValueError("GLB unreasonably large")
       scene=trimesh.load(dest,force="scene")
       count=len(scene.geometry)
       if not count:raise ValueError("No geometry")
       meshlist=[]
       for name,mesh in scene.geometry.items():
           if not isinstance(mesh,trimesh.Trimesh):continue
           material=getattr(mesh.visual,"material",None)
           meshlist.append({"name":name,"triangles":len(mesh.faces),"width":round(float((mesh.bounds[1]-mesh.bounds[0])[0]),5),"height":round(float((mesh.bounds[1]-mesh.bounds[0])[1]),5),"material":getattr(material,"name",None)})
       entry.update({"status":"candidate","bytes":size,"geometry_count":count,"triangles":sum(x["triangles"] for x in meshlist),"mesh_sample":meshlist,"bounds":np.round(scene.bounds,4).tolist()})
       print(f"{flower}: {size/1024/1024:.2f} MB {count} geometries / {entry['triangles']} triangles",flush=True)
   except Exception as e:
       entry.update({"status":"error","error":str(e)})
       if dest.exists():dest.unlink()
       print(f"{flower}: ERROR {e}",flush=True)
   results.append(entry)
(BASE/"AUDIT_MODELLI.json").write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf-8")
print("AUDIT SUMMARY",json.dumps([{k:v for k,v in r.items() if k in ["fiore","status","geometry_count","bytes","triangles","error"]} for r in results],ensure_ascii=False),flush=True)
