import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {newCount,spreadParts,phrase} from './gameplay-core.mjs';
const $=id=>document.getElementById(id);
const view=$('viewport');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
view.appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff,0x96938c,2.7));
const key=new THREE.DirectionalLight(0xffffff,3.3);key.position.set(3,5,8);scene.add(key);
const fill=new THREE.DirectionalLight(0xebdef6,1.0);fill.position.set(-4,2,-3);scene.add(fill);
const camera=new THREE.PerspectiveCamera(39,1,.0001,1000);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.enablePan=false;
const loader=new GLTFLoader();const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();
let catalog=[],current=null,flower=null,parts=[],chosen=[],remaining=[],removed=0,previous=0,startMama=true,mode='idle',request=0;
function resize(){const a=view.getBoundingClientRect();if(a.width<1||a.height<1)return;
 renderer.setSize(a.width,a.height,false);camera.aspect=a.width/a.height;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(view);resize();
renderer.setAnimationLoop(()=>{orbit.update();renderer.render(scene,camera)});
function loadText(s){$('loading').textContent=s;$('loading').hidden=!s;}
function show(sel){['options','playing','rose'].forEach(x=>$(x).hidden=x!==sel);}
function cleanup(){if(flower){scene.remove(flower);const geometries=new Set(),materials=new Set();flower.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});
 // Do not dispose shared geometry while a copy is in use.
 for(const g of geometries)g?.dispose();for(const m of materials)m?.dispose();} flower=null;parts=[];chosen=[];remaining=[];removed=0;mode='idle';}
function cardList(){const list=$('flowers');list.replaceChildren();for(const x of catalog){const b=document.createElement('button');b.className='item'+(x===current?' active':'');
 const title=document.createElement('span');title.textContent=x.nome;
 const tiny=document.createElement('small');tiny.textContent=x.tipo==='approvato'?'✓':'3D';b.append(title,tiny);
 b.onclick=()=>select(x.id);list.append(b);}}
function allMeshes(root){const out=[];root.traverse(o=>{if(o.isMesh)out.push(o)});return out;}
function makeGroup(id,nodes,targets=nodes){return{id,nodes,targets:targets.filter(o=>o.isMesh)};}
function grouped(root,item){const all=allMeshes(root);const trim=n=>String(n||'').replace(/_/g,' ').trim();
 if(item.method==='sunflower')return all.filter(o=>/sunflower\s+finite\s+ray\s+floret\s+\d+$/i.test(trim(o.name))).map(o=>makeGroup(o.name,[o]));
 if(item.method==='hydrangea'){
  const m=new Map();for(const o of all){let found=/^Hydrangea Floret (\d+) (centre|enlarged sepal \d+)$/i.exec(trim(o.name));if(found){const key=+found[1];if(!m.has(key))m.set(key,[]);m.get(key).push(o)}}
  return [...m].filter(([k,v])=>v.length===5).map(([k,v])=>makeGroup('Fiorellino '+k,[...v,...all.filter(o=>trim(o.name)===`Hydrangea Hydrangea branching pedicel ${k}`)],v));
 }
 if(item.method==='orchid'){
  const groups=[];for(let n=1;n<=4;n++){
   const matching=all.filter(o=>trim(o.name).startsWith(`Orchid flower ${n} `));
   for(const a of matching.filter(o=>/Broad petal|Sepal/i.test(trim(o.name))))groups.push(makeGroup(a.name,[a]));
   const lips=matching.filter(o=>/Curled purple lip|Flared lip lobe/i.test(trim(o.name)));
   if(lips.length===3)groups.push(makeGroup(`Orchid flower ${n} lip`,lips));
  }return groups;
 }
 if(item.method==='tulip'){
  // Five original botanical flower copies, preserving all their source textures.
  const parent=new THREE.Group();parent.name='Tulipani';
  const layouts=[{x:0,y:0,s:1},{x:-.145,y:-.045,s:.77},{x:.145,y:-.055,s:.77},{x:-.245,y:-.135,s:.60},{x:.245,y:-.145,s:.60}];
  layouts.forEach(({x,y,s},i)=>{const clone=i===0?root:root.clone(true);clone.position.set(x,y,0);clone.scale.setScalar(s);parent.add(clone)});
  const groups=[];parent.children.forEach((r,i)=>{r.traverse(o=>{if(o.isMesh&&/Tulip Tulip (inner|outer) tepal \d+$/i.test(trim(o.name)))groups.push(makeGroup(`Tulip ${i+1} ${o.name}`,[o]));})});
  return{root:parent,parts:groups};
 }
 if(item.method==='lavender'){
  const byIndex=new Map();for(const o of all){const p=/^PETALO_(\d+)_(\d+)$/i.exec(o.name);if(p){const k=+p[1];if(!byIndex.has(k))byIndex.set(k,[]);byIndex.get(k).push(o)}}
  return [...byIndex].filter(([,v])=>v.length>=7).map(([k,v])=>makeGroup(`Spiga ${k}`,[...v,...all.filter(o=>o.name===`TALLO_${String(k).padStart(2,'0')}`)],v));
 }
 return all.filter(o=>/^PETALO_/.test(o.name)).map(o=>makeGroup(o.name,[o]));
}
function placeCamera(focusParts){if(!flower)return;const box=new THREE.Box3();
 for(const o of focusParts||[])box.expandByObject(o);
 if(box.isEmpty())box.setFromObject(flower);
 if(box.isEmpty())return;
 const sp=box.getBoundingSphere(new THREE.Sphere());const radius=Math.max(sp.radius,.04);
 const distance=radius/Math.tan(camera.fov*Math.PI/360)*1.18;
 camera.position.set(sp.center.x,sp.center.y+radius*.07,sp.center.z+distance);
 camera.near=Math.max(.00001,distance/10000);camera.far=Math.max(100,distance*120);camera.updateProjectionMatrix();
 orbit.target.copy(sp.center);orbit.update();
}
function selectHelp(item){if(item.method==='hydrangea')return 'Si rimuovono interi fiorellini, non quattro sepali separati.';
 if(item.method==='lavender')return 'Si rimuovono spighe fiorite complete.';
 if(item.method==='tulip')return 'Composizione di cinque tulipani ricavati dal modello botanico originale.';
 if(item.tipo==='prototipo botanico')return 'Modello 3D procedurale: giocabile, ma ancora da approvare esteticamente.';
 return 'Modello botanico da verificare su telefono prima della pubblicazione.';}
async function select(id){const token=++request;cleanup();current=catalog.find(x=>x.id===id);if(!current)return;
 $('flowerName').textContent=current.nome;$('category').textContent=current.tipo;
 $('disclaimer').textContent=selectHelp(current);
 $('source').hidden=!current.source;if(current.source)$('source').href=current.source;
 $('counter').hidden=true;cardList();show('');loadText('');
 if(current.rose){show('rose');$('roseLink').href=current.rose;loadText('Rosa approvata: usa il pulsante qui sotto per giocare senza modificare il modello originale.');return;}
 loadText('Caricamento del fiore…');
 try{const gltf=await loader.loadAsync(current.file);if(token!==request)return;
  flower=gltf.scene;let g=grouped(flower,current);
  if(g?.root){flower=g.root;parts=g.parts}else parts=g;
  scene.add(flower);
  if(parts.length<21)throw Error(`Trovate ${parts.length} parti indipendenti; ne occorrono almeno 21`);
  show('options');placeCamera(parts.flatMap(g=>g.targets));loadText('');
 }catch(e){show('');loadText('Modello non pronto: '+e.message);}
}
function begin(mama){if(!flower||parts.length<21)return;startMama=mama;previous=newCount(previous);
 chosen=spreadParts(parts,previous);const keep=new Set(chosen);
 parts.forEach(g=>g.nodes.forEach(o=>o.visible=keep.has(g)));
 remaining=[...chosen];removed=0;mode='play';$('counter').hidden=false;show('playing');update();placeCamera(chosen.flatMap(g=>g.targets));}
function update(){const left=remaining.length;$('counter').textContent=`${left} / ${chosen.length}`;
 const last=removed?phrase(removed,startMama):'';
 $('phrase').textContent=left?`${last} · Petali rimasti: ${left}`:`${phrase(removed,startMama)} ${phrase(removed,startMama)==="M'ama"?'❤️':'💔'} · Partita conclusa`;
 $('pluck').disabled=!left;}
function drop(group){if(mode!=='play'||!remaining.includes(group))return;
 group.nodes.forEach(o=>o.visible=false);remaining=remaining.filter(g=>g!==group);removed++;update();}
$('yes').onclick=()=>begin(true);$('no').onclick=()=>begin(false);
$('pluck').onclick=()=>{if(remaining.length)drop(remaining[0])};$('again').onclick=()=>begin(startMama);
let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!down||mode!=='play'||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
 const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
 raycaster.setFromCamera(mouse,camera);const visible=remaining.flatMap(g=>g.targets).filter(o=>o.visible);
 const hit=raycaster.intersectObjects(visible,false)[0];if(!hit)return;
 const group=remaining.find(g=>g.targets.includes(hit.object));if(group)drop(group);
});
try{const response=await fetch('catalogo.json',{cache:'no-store'});if(!response.ok)throw Error('Catalogo non disponibile');
 catalog=await response.json();if(catalog.length!==15)throw Error('Sono richiesti 15 fiori');
 const url=new URL(location.href);const id=url.searchParams.get('fiore');await select(catalog.some(x=>x.id===id)?id:'girasole');
}catch(e){loadText('Errore: '+e.message)}
