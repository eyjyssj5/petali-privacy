import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

// HD ORIGINAL: Petal_1..5 are the five large source surfaces.
// The central small Petal_6..14 stay attached to the flower at all times.
// 9-21 removable petals are reconstructed as individual, rotatable clones.
const $=id=>document.getElementById(id);
const yellowRose = new URLSearchParams(location.search).get("fiore")==="rosa-gialla";
const yellowNames={it:["Rosa gialla 3D a petali variabili","Rosa gialla"],en:["Yellow rose 3D, variable petals","Yellow rose"],es:["Rosa amarilla 3D, pétalos variables","Rosa amarilla"],pt:["Rosa amarela 3D, pétalas variáveis","Rosa amarela"],fr:["Rose jaune 3D à pétales variables","Rose jaune"],de:["Gelbe 3D-Rose mit wechselnden Blütenblättern","Gelbe Rose"]};
function recolorYellowPetalTextures(flowerModel){
 // Shift only genuinely red pixels to golden-yellow while retaining the
 // original 2048px photographic texture, pores, veins, roughness and normals.
 const textures=new WeakMap();
 flowerModel.traverse(o=>{
  if(!o.isMesh||!/petal[_ ]?[0-9]+[_ .-]*hp/i.test(o.name))return;
  const mat=o.material,old=mat?.map;
  if(!old?.image)return;
  if(!textures.has(old)){
   const src=old.image,w=src.width,h=src.height;
   if(!w||!h)return;
   const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext("2d",{willReadFrequently:true});
   ctx.drawImage(src,0,0,w,h);
   const img=ctx.getImageData(0,0,w,h),a=img.data;
   for(let i=0;i<a.length;i+=4){
    const R=a[i],G=a[i+1],B=a[i+2];
    // Preserve white highlights, green sepals, transparency and dark shadows
    if(R>G*1.15&&R>B*1.17&&R-G>18){
     const v=Math.max(R,70),shade=Math.min(1,(R-G)/100);
     a[i]=Math.min(255,Math.round(v*1.07+13*shade));
     a[i+1]=Math.min(255,Math.round(v*.89+30*shade));
     a[i+2]=Math.min(255,Math.round(B*.45+G*.15));
    }
   }
   ctx.putImageData(img,0,0);
   const t=new THREE.CanvasTexture(canvas);
   t.colorSpace=old.colorSpace;t.flipY=old.flipY;
   t.wrapS=old.wrapS;t.wrapT=old.wrapT;
   t.anisotropy=old.anisotropy||1;
   textures.set(old,t);
  }
  const replacement=textures.get(old);if(!replacement)return;
  const next=mat.clone();next.map=replacement;next.needsUpdate=true;o.material=next;
 });
}

const L={
it:["Rosa 3D, petali variabili","Ogni partita cambia il numero di petali grandi. Ruota il fiore e stacca i petali: il centro resta intatto.","Rosa rossa","Pronto. Scegli come iniziare.", "Non m'ama","M'ama","Stacca un petalo","Nuova partita","Petali staccati: "],
en:["3D rose, variable petals","Each round has a new number of full-sized petals. Rotate and pluck them, leaving the center intact.","Red rose","Ready. Pick the first phrase.","Loves me not","Loves me","Pluck a petal","New round","Petals plucked: "],
es:["Rosa 3D, pétalos variables","Cada partida cambia el número de pétalos grandes. Gira la rosa y arráncalos sin tocar su centro.","Rosa roja","Lista. Elige cómo empezar.","No me quiere","Me quiere","Quitar pétalo","Nueva partida","Pétalos quitados: "],
pt:["Rosa 3D, pétalas variáveis","Cada partida tem um número diferente de pétalas grandes. Roda e retira-as, sem alterar o centro.","Rosa vermelha","Pronta. Escolhe a primeira frase.","Não me ama","Ama-me","Retirar pétala","Nova partida","Pétalas retiradas: "],
fr:["Rose 3D à pétales variables","Le nombre de grands pétales change à chaque partie. Faites tourner la rose et retirez-les sans toucher au cœur.","Rose rouge","Prête. Choisissez la première formule.","Il ne m'aime pas","Il m'aime","Détacher un pétale","Nouvelle partie","Pétales retirés : "],
de:["3D-Rose mit wechselnden Blütenblättern","Jede Runde hat unterschiedlich viele große Blütenblätter. Drehe die Rose und zupfe die Blätter ab, der Kern bleibt.","Rote Rose","Bereit. Wähle den ersten Spruch.","Er liebt mich nicht","Er liebt mich","Blütenblatt abzupfen","Neue Runde","Entfernte Blütenblätter: "]
};
let lang=(navigator.language||"it").slice(0,2);
try{lang=localStorage.getItem("petali.lingua")||lang;}catch{}
if(!L[lang])lang="it";$("lang").value=lang;
let scene,renderer,camera,controls,head,baseModel,axesCenter;
let originals=new Map(), petals=[], animations=[], number=0,removed=0,lastNumber=0;
let mode="choose", startLove=true, clock=0;
const ray=new THREE.Raycaster(),axis=new THREE.Vector3(0,1,0);
function labels(){const t=L[lang];$("title").textContent=yellowRose?yellowNames[lang][0]:t[0];$("intro").textContent=t[1];$("flower").textContent=yellowRose?yellowNames[lang][1]:t[2];$("yes").textContent="❤️ "+t[5];$("no").textContent="💔 "+t[4];$("pluck").textContent="✿ "+t[6];$("again").textContent=t[7];document.documentElement.lang=lang;sync();}
function sync(){const t=L[lang];$("count").textContent=number?(number-removed)+" / "+number:"–";$("choices").hidden=mode!=="choose";$("game").hidden=mode!=="playing";$("done").hidden=mode!=="done";$("status").textContent=mode==="choose"?t[3]:t[8]+removed+" / "+number;if(mode==="done")$("result").textContent=((removed%2===1)===startLove?"❤️ "+t[5]:"💔 "+t[4]);}
function error(txt){$("notice").hidden=false;$("notice").textContent=txt;}
function resize(){if(!renderer)return;const w=$("stage").clientWidth,h=$("stage").clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function cameraReset(){if(!baseModel)return;controls.target.copy(axesCenter);camera.position.copy(axesCenter).add(new THREE.Vector3(.38,.20,1).normalize().multiplyScalar(1.15));camera.lookAt(axesCenter);controls.update();}
function pickCount(){let n=9+Math.floor(Math.random()*13);if(n===lastNumber)n=n===21?20:n+1;lastNumber=n;return n;}
function clonePetal(id,theta,radius,size){
 const ref=originals.get(id),src=ref.mesh;
 const thetaSource=Math.atan2(ref.center.x-axesCenter.x,ref.center.z-axesCenter.z);
 const pivot=new THREE.Group();pivot.position.copy(axesCenter);pivot.quaternion.setFromAxisAngle(axis,theta-thetaSource);
 const pos=new THREE.Vector3(),rot=new THREE.Quaternion(),scale=new THREE.Vector3();
 src.matrixWorld.decompose(pos,rot,scale);
 const petal=src.clone();
 petal.position.copy(pos).sub(axesCenter);petal.quaternion.copy(rot);petal.scale.copy(scale).multiplyScalar(size);
 petal.visible=true;petal.userData.removable=true;petal.userData.plucked=false;
 pivot.add(petal);
 const sourceRadius=Math.hypot(ref.center.x-axesCenter.x,ref.center.z-axesCenter.z);
 const radialAdjustment=radius-sourceRadius*size;
 pivot.position.x+=Math.sin(theta)*radialAdjustment;pivot.position.z+=Math.cos(theta)*radialAdjustment;
 scene.add(pivot);
 return {pivot,mesh:petal,baseMaterial:petal.material,basePos:pivot.position.clone(),baseQuat:pivot.quaternion.clone()};
}
function clearOld(){
 for(const p of petals){scene.remove(p.pivot);if(p.mesh.material!==p.baseMaterial)p.mesh.material.dispose();}
 petals=[];animations=[];
}
function newRound(){
 if(originals.size!==5)return;
 clearOld();number=pickCount();removed=0;mode="choose";
 const outside=Math.max(4,Math.round(number*.46)),middle=Math.max(3,Math.round(number*.34)),inside=number-outside-middle;
 const rings=[
  {qty:outside,sources:[1,2,3],radius:.28,size:1.01,phase:.17},
  {qty:middle,sources:[2,3,4],radius:.16,size:.84,phase:.63},
  {qty:inside,sources:[4,5],radius:.080,size:.92,phase:.40}
 ];
 for(const ring of rings){for(let i=0;i<ring.qty;i++){
   const angle=(i/ring.qty)*Math.PI*2+ring.phase;
   petals.push(clonePetal(ring.sources[i%ring.sources.length],angle,ring.radius,ring.size*(.97+.02*(i%4))));
 }}
 sync();
}
function start(yes){if(!number)return;startLove=yes;mode="playing";removed=0;sync();}
function take(p){
 if(mode!=="playing"||!p||p.mesh.userData.plucked)return;
 p.mesh.userData.plucked=true;removed++;
 p.mesh.material=p.baseMaterial.clone();p.mesh.material.transparent=true;p.mesh.material.depthWrite=false;
 animations.push({p,t:0,side:(removed%2?1:-1)*(.16+.09*Math.random())});
 sync();
 if(removed===number)setTimeout(()=>{if(mode==="playing"&&removed===number){mode="done";sync();}},1050);
}
function takeNext(){take(petals.find(x=>!x.mesh.userData.plucked));}
function tap(x,y){
 if(mode!=="playing")return;
 const r=renderer.domElement.getBoundingClientRect();
 ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2),camera);
 const hits=ray.intersectObjects(petals.filter(p=>!p.mesh.userData.plucked).map(p=>p.mesh),false);
 if(hits.length)take(petals.find(p=>p.mesh===hits[0].object));
}
function frame(ms){
 const dt=Math.min(.06,(ms-clock)/1000||.016);clock=ms;
 for(let i=animations.length-1;i>=0;i--){const a=animations[i],p=a.p;a.t+=dt;const t=Math.min(1,a.t/1.02);
  p.pivot.position.copy(p.basePos).add(new THREE.Vector3(a.side*t,-.4*t*t,.16*t));
  p.pivot.quaternion.copy(p.baseQuat).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(t*1.7,t*2,t*2.5)));
  p.mesh.material.opacity=1-t;
  if(t===1){p.pivot.visible=false;animations.splice(i,1);}
 }
 controls?.update();renderer?.render(scene,camera);
}
function init(){
 try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(37,1,.007,30);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
  $("stage").prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;
  controls.minDistance=.22;controls.maxDistance=3;
  scene.add(new THREE.HemisphereLight(0xfff9fa,0x435f46,1.8));
  const key=new THREE.DirectionalLight(0xfffafa,2.15);key.position.set(-2,3,3);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffdbe8,1.05);fill.position.set(2,1,-2);scene.add(fill);
  new ResizeObserver(resize).observe($("stage"));resize();renderer.setAnimationLoop(frame);
  new GLTFLoader().load("./rose_highpoly_realistic.glb",gltf=>{
   baseModel=gltf.scene;scene.add(baseModel);baseModel.updateMatrixWorld(true);if(yellowRose)recolorYellowPetalTextures(baseModel);
   const centers=[];
   baseModel.traverse(o=>{
    if(!o.isMesh)return;
    if(o.material){o.material.side=THREE.DoubleSide;o.material.needsUpdate=true;}
    const m=o.name.match(/petal[_ ]?([1-9]|1[0-4])[_ .-]*hp/i);
    if(!m)return;
    const n=Number(m[1]);if(n<1||n>5)return;
    o.geometry.computeBoundingBox();
    const center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
    centers.push(center);
    originals.set(n,{mesh:o,center});o.visible=false;
   });
   if(originals.size!==5){error("Il modello caricato non contiene i cinque petali sorgente richiesti.");return;}
   axesCenter=new THREE.Vector3(centers.reduce((a,c)=>a+c.x,0)/centers.length,1.22,centers.reduce((a,c)=>a+c.z,0)/centers.length);
   newRound();cameraReset();$("notice").hidden=true;
  },undefined,e=>{console.error(e);error("Manca il modello GLB su GitHub. Carica rose_highpoly_realistic.glb in gioco/rosa-variabile e ricarica.");});
 }catch(e){console.error(e);error("Impossibile avviare il visualizzatore WebGL su questo dispositivo.");}
}
let touch=null;
$("stage").addEventListener("pointerdown",e=>{touch={x:e.clientX,y:e.clientY,moved:false}},true);
$("stage").addEventListener("pointermove",e=>{if(touch&&Math.abs(e.clientX-touch.x)+Math.abs(e.clientY-touch.y)>10)touch.moved=true},true);
$("stage").addEventListener("pointerup",e=>{if(touch&&!touch.moved)tap(e.clientX,e.clientY);touch=null},true);
$("stage").addEventListener("pointercancel",()=>touch=null,true);
$("yes").addEventListener("click",()=>start(true));$("no").addEventListener("click",()=>start(false));
$("pluck").addEventListener("click",takeNext);$("again").addEventListener("click",()=>{newRound();cameraReset();});
$("reset").addEventListener("click",cameraReset);
$("lang").addEventListener("change",e=>{lang=e.target.value;try{localStorage.setItem("petali.lingua",lang)}catch{}labels();});
labels();init();