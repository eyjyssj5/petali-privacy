import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const $=id=>document.getElementById(id);
const assets=[
 {id:"tulipano-rosso",name:"Tulipano rosso",emoji:"🌷",file:"tulipano-rosso.glb",type:"tepal",note:"6 tepali botanici distinti"},
 {id:"girasole",name:"Girasole",emoji:"🌻",file:"girasole.glb",type:"ray",note:"Petali esterni (fiori ligulati) separati"},
 {id:"orchidea",name:"Orchidea",emoji:"🌸",file:"orchidea.glb",type:"orchid",note:"Petali dei singoli fiori dell'orchidea"},
 {id:"ortensia",name:"Ortensia",emoji:"💠",file:"ortensia.glb",type:"hydrangea",note:"Sepali dei piccoli fiori della corolla"},
 {id:"lavanda",name:"Lavanda",emoji:"🪻",file:"lavanda.glb",type:null,note:"Cespuglio 3D: richiede fiori rimovibili"},
 {id:"ciliegio",name:"Fiore di ciliegio",emoji:"🌸",file:"ciliegio.glb",type:null,note:"Albero 3D: il modello di un fiore singolo manca ancora"}
];
let renderer,camera,scene,controls,model,selected=assets[0],removeable=[],removed=0,animations=[],lastT=0;
let loader=new GLTFLoader(),raycaster=new THREE.Raycaster(),loadToken=0,dragStart=null;
function classify(mesh,kind){
 if(!mesh.isMesh)return false;
 const n=mesh.name.toLowerCase().replaceAll("_"," ");
 if(kind==="tepal")return /tepal/.test(n);
 if(kind==="ray")return /ray floret/.test(n);
 if(kind==="orchid")return /(broad petal|sepal|lip lobe|curled purple lip)/.test(n)&&/flower/.test(n);
 if(kind==="hydrangea")return /enlarged sepal/.test(n);
 return false;
}
function select(id){
 const item=assets.find(a=>a.id===id);
 if(!item)return;
 selected=item;removed=0;removeable=[];animations=[];
 $("name").textContent=item.name;
 $("status").textContent="Caricamento di "+item.name+"…";
 $("counter").textContent="…";$("pluck").disabled=true;
 $("notice").hidden=false;$("notice").textContent="Caricamento 3D: "+item.name;
 for(const b of document.querySelectorAll(".choice"))b.classList.toggle("selected",b.dataset.id===id);
 const token=++loadToken;
 loader.load("../modelli-botanici/"+item.file,(gltf)=>{
   if(token!==loadToken)return;
   if(model){scene.remove(model);model.traverse(o=>{if(o.geometry?.dispose)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}})}
   model=gltf.scene;scene.add(model);
   model.traverse(o=>{
     if(!o.isMesh)return;
     if(o.material){for(const mat of (Array.isArray(o.material)?o.material:[o.material])){mat.side=THREE.DoubleSide;mat.needsUpdate=true;}}
     if(classify(o,item.type)){o.userData.active=true;removeable.push(o)}
   });
   cameraReset();$("notice").hidden=true;
   $("counter").textContent=removeable.length+" / "+removeable.length;
   $("pluck").disabled=removeable.length===0;
   $("status").textContent=removeable.length ? item.note+" · tocca un petalo per staccarlo" : item.note+" · solo rotazione, per ora";
 },undefined,e=>{
   if(token!==loadToken)return;console.error(e);
   $("notice").hidden=false;$("notice").textContent="Impossibile caricare "+item.name+". Riprova ricaricando la pagina.";
 });
}
function cameraReset(){
 if(!model)return;
 const box=new THREE.Box3().setFromObject(model);
 const center=box.getCenter(new THREE.Vector3());
 const sizes=box.getSize(new THREE.Vector3());
 const r=Math.max(sizes.x,sizes.y,sizes.z);
 controls.target.copy(center);
 const fov=THREE.MathUtils.degToRad(camera.fov);
 const distance=Math.max(.15,(r/2)/Math.tan(fov/2)*1.25);
 camera.position.copy(center).add(new THREE.Vector3(.42,.23,1).normalize().multiplyScalar(distance));
 camera.lookAt(center);
 controls.minDistance=Math.max(.035,distance*.3);
 controls.maxDistance=Math.max(3,distance*6);
 controls.update();
}
function pluck(m){
 if(!m?.userData.active)return;
 m.userData.active=false;
 // Reparent without moving the petal in world space, preserving its shape
 model.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 scene.attach(m);
 if(m.material){m.material=m.material.clone();m.material.transparent=true;m.material.depthWrite=false;}
 animations.push({mesh:m,start:m.position.clone(),rotation:m.rotation.clone(),t:0,direction:(removed%2?1:-1),material:m.material});
 removed++;
 $("counter").textContent=(removeable.length-removed)+" / "+removeable.length;
 $("status").textContent="Petali staccati: "+removed+" · "+selected.note;
 if(removed>=removeable.length){$("pluck").disabled=true;$("status").textContent="Tutti i petali selezionati sono stati tolti. Scegli un altro fiore o ricarica questo."}
}
function pluckNext(){pluck(removeable.find(o=>o.userData.active))}
function clickPetal(x,y){
 if(!renderer||!camera)return;
 const r=renderer.domElement.getBoundingClientRect();
 const p=new THREE.Vector2((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);
 raycaster.setFromCamera(p,camera);
 const hits=raycaster.intersectObjects(removeable.filter(o=>o.userData.active),true);
 if(hits.length)pluck(hits[0].object);
}
function render(ms){
 const dt=Math.min(.05,(ms-lastT)/1000||.016);lastT=ms;
 for(let i=animations.length-1;i>=0;i--){
  const a=animations[i],t=Math.min(1,(a.t+=dt)/.9);
  a.mesh.position.copy(a.start).add(new THREE.Vector3(a.direction*t*.17,-.42*t*t,.12*t));
  a.mesh.rotation.y=a.rotation.y+t*1.8;a.mesh.rotation.z=a.rotation.z+t*2.2;
  if(a.material?.opacity!==undefined)a.material.opacity=1-t;
  if(t===1){scene.remove(a.mesh);a.mesh.geometry?.dispose();a.mesh.material?.dispose();animations.splice(i,1)}
 }
 controls?.update();renderer?.render(scene,camera);
}
function resize(){
 if(!renderer)return;
 const el=$("stage"),w=el.clientWidth||350,h=el.clientHeight||410;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function init(){
 try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.002,180);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setClearColor(0xffffff,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;
  $("stage").prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.09;controls.enablePan=false;controls.minPolarAngle=.06;controls.maxPolarAngle=Math.PI-.06;
  const sky=new THREE.HemisphereLight(0xffffff,0x62775b,2);scene.add(sky);
  const key=new THREE.DirectionalLight(0xfff9f4,2.4);key.position.set(-3,4,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe7defb,1.0);fill.position.set(2,0,-4);scene.add(fill);
  new ResizeObserver(resize).observe($("stage"));resize();
  renderer.setAnimationLoop(render);
  select(assets[0].id);
 }catch(e){console.error(e);$("notice").textContent="Errore WebGL: impossibile avviare l'anteprima 3D."}
}
for(const a of assets){
 const b=document.createElement("button");b.type="button";b.dataset.id=a.id;b.className="choice";
 const emoji=document.createElement("span");emoji.className="emoji";emoji.textContent=a.emoji;
 const name=document.createElement("span");name.textContent=a.name;
 b.append(emoji,name);b.addEventListener("click",()=>select(a.id));$("flowers").appendChild(b);
}
$("pluck").addEventListener("click",pluckNext);
$("reset").addEventListener("click",cameraReset);
$("stage").addEventListener("pointerdown",e=>{if(e.target.tagName==="BUTTON")return;dragStart={x:e.clientX,y:e.clientY,moved:false}},true);
$("stage").addEventListener("pointermove",e=>{if(dragStart&&(Math.abs(dragStart.x-e.clientX)+Math.abs(dragStart.y-e.clientY)>9))dragStart.moved=true},true);
$("stage").addEventListener("pointerup",e=>{if(dragStart&&!dragStart.moved&&e.target.tagName==="CANVAS")clickPetal(e.clientX,e.clientY);dragStart=null},true);
$("stage").addEventListener("pointercancel",()=>dragStart=null,true);
init();
