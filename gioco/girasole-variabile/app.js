import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

/* Only 24 original large ligulate ray florets are playable.
   Never detach the central disc florets, receptacle or flower stem.
   Each round repositions 9–21 full-sized ray florets evenly around
   the original flower-head disc in 3D. */
const $=id=>document.getElementById(id);
let scene,renderer,camera,controls,model,ray=new THREE.Raycaster();
let petals=[],center=new THREE.Vector3(),normal=new THREE.Vector3(0,0,1);
let refU=new THREE.Vector3(1,0,0),refV=new THREE.Vector3(0,1,0);
let stageReady=false,mode="choose",number=0,removed=0,lastNumber=0,firstLove=true,clock=0;
const falling=[];
const initialView={camera:new THREE.Vector3(),target:new THREE.Vector3()};
function selectCount(){
 let n=9+Math.floor(Math.random()*13);
 if(n===lastNumber)n=n===21?20:n+1;
 lastNumber=n;return n;
}
function getBoxCenter(obj){
 return new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
}
function centerDisc(){
 let disc=null;
 model.traverse(o=>{
  if(o.isMesh&&/Composite convex disc receptacle/i.test(o.name))disc=o;
 });
 if(!disc)throw Error("Disco centrale non trovato nel girasole.");
 center=getBoxCenter(disc);
 return disc;
}
function buildPetals(){
 petals=[];
 const meshes=[];
 model.traverse(o=>{
  if(o.isMesh&&/finite[_ ]ray[_ ]floret/i.test(o.name))meshes.push(o);
 });
 meshes.sort((a,b)=>{
  const ai=+(a.name.match(/(\d+)\s*$/)?.[1]||0),bi=+(b.name.match(/(\d+)\s*$/)?.[1]||0);
  return ai-bi;
 });
 if(meshes.length!==24)throw Error("Il modello deve contenere 24 petali esterni interi: trovati "+meshes.length);
 const places=meshes.map(m=>getBoxCenter(m));
 let left=places[0].clone().sub(center),middle=places[6].clone().sub(center),right=places[12].clone().sub(center);
 normal=middle.clone().sub(left).cross(right.clone().sub(left)).normalize();
 if(normal.lengthSq()<.8)normal.set(0,0,1);
 refU=left.addScaledVector(normal,-left.dot(normal)).normalize();
 if(refU.lengthSq()<.5)refU.set(1,0,0);
 refV=new THREE.Vector3().crossVectors(normal,refU).normalize();
 meshes.forEach((mesh,i)=>{
  // Preserve original mesh surface and embedded PBR texture;
  // parent each to a pivot at the flower's centre.
  const pc=new THREE.Group();pc.position.copy(center);scene.add(pc);
  pc.attach(mesh);
  const radial=places[i].clone().sub(center);
  const angle=Math.atan2(radial.dot(refV),radial.dot(refU));
  const material=mesh.material;
  const p={mesh,pivot:pc,originalAngle:angle,originalMaterial:material,baseScale:mesh.scale.clone(),active:false,dy:0};
  petals.push(p);
 });
}
function configure(n){
 if(!stageReady)return;
 falling.length=0;
 number=n;removed=0;mode="choose";
 const q=new THREE.Quaternion(),delta=new THREE.Vector3();
 petals.forEach((p,i)=>{
  p.mesh.material!==p.originalMaterial&&p.mesh.material?.dispose();
  p.mesh.material=p.originalMaterial;
  p.pivot.position.copy(center);
  p.pivot.quaternion.identity();p.mesh.scale.copy(p.baseScale);
  p.mesh.userData.active=false;p.active=false;p.mesh.visible=false;
  if(i>=n)return;
  const target=2*Math.PI*i/n,angle=target-p.originalAngle;
  q.setFromAxisAngle(normal,angle);
  p.pivot.quaternion.copy(q);
  // Subtle enlargement to keep a visually full sunflower at low ray counts.
  const size=1+Math.max(0,24-n)*.016;
  p.mesh.scale.copy(p.baseScale).multiplyScalar(size);
  p.mesh.userData.active=true;p.active=true;p.mesh.visible=true;
 });
 display();
}
function newRound(){configure(selectCount())}
function start(loves){mode="playing";firstLove=loves;removed=0;display()}
function display(){
 $("counter").textContent=number?(number-removed)+" / "+number:"…";
 $("choice").hidden=mode!=="choose";$("playing").hidden=mode!=="playing";$("finished").hidden=mode!=="finished";
 $("message").textContent=mode==="choose"?"Pronto: scegli la prima frase.":mode==="playing"?"Petali staccati: "+removed+" / "+number:"Ultimo petalo staccato. Il centro del girasole rimane.";
 if(mode==="finished")$("outcome").textContent=((removed%2===1)===firstLove)?"❤️ M'ama":"💔 Non m'ama";
}
function detach(p){
 if(mode!=="playing"||!p||!p.active)return;
 p.active=false;p.mesh.userData.active=false;removed++;
 p.mesh.material=p.originalMaterial.clone();
 p.mesh.material.transparent=true;p.mesh.material.depthWrite=false;
 falling.push({p,t:0,start:p.pivot.position.clone(),baseQ:p.pivot.quaternion.clone(),side:(removed%2?1:-1)});
 display();
 if(removed>=number){
  setTimeout(()=>{if(mode==="playing"&&removed===number){mode="finished";display()}},1100);
 }
}
function pluckNext(){detach(petals.find(p=>p.active))}
function touchPetal(x,y){
 if(mode!=="playing")return;
 const rect=renderer.domElement.getBoundingClientRect();
 const ndc=new THREE.Vector2(2*(x-rect.left)/rect.width-1,1-2*(y-rect.top)/rect.height);
 ray.setFromCamera(ndc,camera);
 const intersects=ray.intersectObjects(petals.filter(p=>p.active).map(p=>p.mesh),false);
 if(intersects.length)detach(petals.find(p=>p.mesh===intersects[0].object));
}
function animate(ms){
 let dt=Math.min(.045,(ms-clock)/1000||.016);clock=ms;
 for(let i=falling.length-1;i>=0;i--){
  const a=falling[i],p=a.p,t=Math.min(1,(a.t+=dt)/1);
  p.pivot.position.copy(a.start).add(new THREE.Vector3(a.side*t*.14,-.26*t*t,t*.12));
  p.pivot.quaternion.copy(a.baseQ).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(t*1.7,t*2.1,t*2.2)));
  p.mesh.material.opacity=1-t;
  if(t>=1){p.mesh.visible=false;falling.splice(i,1);}
 }
 controls?.update();
 renderer?.render(scene,camera);
}
function resetCamera(){
 if(!model)return;
 const bbox=new THREE.Box3().setFromObject(model);
 const size=bbox.getSize(new THREE.Vector3()).length();
 controls.target.copy(center);
 const dist=Math.max(.20,size*.96);
 camera.position.copy(center).add(new THREE.Vector3(.22,.19,1).normalize().multiplyScalar(dist));
 camera.lookAt(center);controls.update();
 controls.minDistance=dist*.36;controls.maxDistance=dist*4;
}
function resize(){
 if(!renderer)return;
 const w=$("stage").clientWidth,h=$("stage").clientHeight;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function load(){
 try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.005,100);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
  renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
  $("stage").prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;
  scene.add(new THREE.HemisphereLight(0xfffaf9,0x536947,2));
  const key=new THREE.DirectionalLight(0xfffaec,2.4);key.position.set(-3,5,4);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffe0bd,1);fill.position.set(2,0,-2);scene.add(fill);
  new ResizeObserver(resize).observe($("stage"));resize();renderer.setAnimationLoop(animate);
  new GLTFLoader().load("../modelli-botanici/girasole.glb",gltf=>{
   model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
   model.traverse(o=>{if(o.isMesh&&o.material){for(const mat of(Array.isArray(o.material)?o.material:[o.material])){mat.side=THREE.DoubleSide;mat.needsUpdate=true;}}});
   centerDisc();buildPetals();stageReady=true;newRound();resetCamera();$("loading").hidden=true;
   console.log("Girasole loaded: 24 original full-sized ray florets, variable petals",number);
  },undefined,e=>{console.error(e);$("loading").textContent="Impossibile caricare il girasole 3D.";});
 }catch(e){console.error(e);$("loading").textContent="Errore WebGL nel girasole 3D: "+e.message;}
}
let down=null;
$("stage").addEventListener("pointerdown",e=>{if(e.target.tagName==="BUTTON")return;down={x:e.clientX,y:e.clientY,moved:false}},true);
$("stage").addEventListener("pointermove",e=>{if(down&&(Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y))>10)down.moved=true},true);
$("stage").addEventListener("pointerup",e=>{if(down&&!down.moved&&e.target.tagName==="CANVAS")touchPetal(e.clientX,e.clientY);down=null},true);
$("stage").addEventListener("pointercancel",()=>{down=null},true);
$("startYes").addEventListener("click",()=>start(true));$("startNo").addEventListener("click",()=>start(false));
$("pluck").addEventListener("click",pluckNext);$("again").addEventListener("click",()=>{newRound();resetCamera()});
$("reset").addEventListener("click",resetCamera);
display();load();