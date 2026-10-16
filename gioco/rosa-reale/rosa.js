import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const el=id=>document.getElementById(id);
const labels={
 it:["Rosa rossa","Pronta per giocare","Petali tolti","Stacca un petalo","Rigioca","M'ama","Non m'ama","Non riesco a caricare il modello 3D."],
 en:["Red rose","Ready to play","Petals removed","Pluck one petal","Play again","Loves me","Loves me not","Cannot load the 3D model."],
 es:["Rosa roja","Lista para jugar","Pétalos quitados","Quita un pétalo","Jugar otra vez","Me quiere","No me quiere","No se pudo cargar el modelo 3D."],
 pt:["Rosa vermelha","Pronta para jogar","Pétalas retiradas","Retirar uma pétala","Jogar novamente","Ama-me","Não me ama","Não foi possível carregar o modelo 3D."],
 fr:["Rose rouge","Prête à jouer","Pétales retirés","Détacher un pétale","Rejouer","Il m'aime","Il ne m'aime pas","Impossible de charger le modèle 3D."],
 de:["Rote Rose","Bereit zum Spielen","Abgezupfte Blütenblätter","Blütenblatt abzupfen","Noch einmal","Er liebt mich","Er liebt mich nicht","3D-Modell konnte nicht geladen werden."]
};
let lang=(navigator.language||"it").slice(0,2);
try{lang=localStorage.getItem("petali.lingua")||lang}catch(e){}
if(!labels[lang])lang="it";
el("lang").value=lang;
let scene,camera,renderer,controls,model,petals=[],active=[],lastTime=0,state="choose",removed=0,startWithLove=true,raycaster;
const falling=[];
function format(){
 const s=labels[lang];
 el("roseName").textContent=s[0];
 el("status").textContent=state==="choose"?s[1]:s[2]+": "+removed;
 el("count").textContent=active.filter(x=>x.userData.active).length+" / "+petals.length;
 el("pluck").textContent="✿ "+s[3];
 el("again").textContent=s[4];
 el("startYes").textContent="❤️ "+s[5];
 el("startNo").textContent="💔 "+s[6];
 el("choose").hidden=state!=="choose";
 el("playing").hidden=state!=="playing";
 el("finished").hidden=state!=="finished";
 if(state==="finished"){
   const loves=((removed%2===1)===startWithLove);
   el("outcome").textContent=(loves?"❤️ ":"💔 ")+s[loves?5:6];
 }
}
function resize(){
 if(!renderer)return;
 const w=el("viewer").clientWidth||390,h=el("viewer").clientHeight||440;
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function resetCamera(){
 if(!model)return;
 const bb=new THREE.Box3().setFromObject(model);
 const center=bb.getCenter(new THREE.Vector3());
 const dist=Math.max(.80,bb.getSize(new THREE.Vector3()).y*2.5);
 controls.target.copy(center);
 camera.position.copy(center).add(new THREE.Vector3(dist*.35,dist*.20,dist*.90));
 camera.lookAt(center);controls.update();
}
function start(yes){
 if(petals.length<1)return;
 startWithLove=yes;state="playing";removed=0;falling.length=0;
 active=petals.slice();
 for(const p of petals){
   p.visible=true;
   p.userData.active=true;
   p.position.copy(p.userData.startPosition);
   p.rotation.copy(p.userData.startRotation);
   if(p.material!==p.userData.originalMaterial){p.material.dispose();p.material=p.userData.originalMaterial;}
 }
 format();
}
function removePetal(mesh){
 if(!mesh||!mesh.userData.active||state!=="playing")return;
 mesh.userData.active=false;
 mesh.material=mesh.userData.originalMaterial.clone();
 mesh.material.transparent=true;mesh.material.depthWrite=false;
 removed++;
 falling.push({mesh,start:mesh.position.clone(),rotation:mesh.rotation.clone(),t:0,drift:(removed%2?1:-1)*(.07+.06*Math.random())});
 format();
 if(removed===petals.length)setTimeout(()=>{if(state==="playing"&&removed===petals.length){state="finished";format()}},1100);
}
function animate(ms){
 let dt=Math.min(.05,(ms-lastTime)/1000||.016);lastTime=ms;
 for(let i=falling.length-1;i>=0;i--){
   const a=falling[i];a.t+=dt;const t=Math.min(1,a.t/1.1);
   a.mesh.position.copy(a.start).add(new THREE.Vector3(a.drift*t,-.32*t*t,.14*t));
   a.mesh.rotation.x=a.rotation.x+1.8*t;a.mesh.rotation.y=a.rotation.y+2.1*t;
   a.mesh.material.opacity=1-t;
   if(t>=1){a.mesh.visible=false;falling.splice(i,1);}
 }
 controls.update();renderer.render(scene,camera);
}
function handleTap(x,y){
 if(state!=="playing")return;
 const rect=renderer.domElement.getBoundingClientRect();
 raycaster.setFromCamera(new THREE.Vector2((x-rect.left)*2/rect.width-1,1-(y-rect.top)*2/rect.height),camera);
 const found=raycaster.intersectObjects(active.filter(p=>p.userData.active),false);
 if(found.length)removePetal(found[0].object);
}
function error(msg){
 el("loading").hidden=true;el("loaderror").hidden=false;el("loaderror").textContent=msg;
}
function init(){
 try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(37,1,.005,30);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  el("viewer").prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;
  controls.minDistance=.22;controls.maxDistance=2.5;
  scene.add(new THREE.HemisphereLight(0xfff9fa,0x496343,1.95));
  const key=new THREE.DirectionalLight(0xfff3eb,2.3);key.position.set(-1.5,2.1,2.5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xf4e4f6,1.2);fill.position.set(1.5,.9,-2);scene.add(fill);
  raycaster=new THREE.Raycaster();
  new ResizeObserver(resize).observe(el("viewer"));resize();
  renderer.setAnimationLoop(animate);
  new GLTFLoader().load("./rosa.glb",(gltf)=>{
    model=gltf.scene;scene.add(model);
    model.traverse(obj=>{
      if(!obj.isMesh)return;
      if(obj.material){obj.material.side=THREE.DoubleSide;obj.material.needsUpdate=true;}
      const n=obj.name.toLowerCase().replaceAll("_"," ");
      if(/rose.*layer.*curved.*petal/.test(n)){
        obj.userData.active=true;
        obj.userData.startPosition=obj.position.clone();
        obj.userData.startRotation=obj.rotation.clone();
        obj.userData.originalMaterial=obj.material;
        petals.push(obj);
      }
    });
    if(petals.length<15){error("Il modello 3D non ha i petali separati richiesti.");return;}
    active=petals.slice();resetCamera();el("loading").hidden=true;
    el("roseInfo").textContent="Modello botanico texturizzato: "+petals.length+" petali tridimensionali indipendenti.";
    format();
  },undefined,(e)=>{console.error(e);error(labels[lang][7]);});
 }catch(e){console.error(e);error(labels[lang][7]);}
}
let down=null;
el("viewer").addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,moved:false}},true);
el("viewer").addEventListener("pointermove",e=>{if(down&&Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y)>9)down.moved=true},true);
el("viewer").addEventListener("pointerup",e=>{if(down&&!down.moved)handleTap(e.clientX,e.clientY);down=null},true);
el("viewer").addEventListener("pointercancel",()=>down=null,true);
el("startYes").addEventListener("click",()=>start(true));
el("startNo").addEventListener("click",()=>start(false));
el("pluck").addEventListener("click",()=>removePetal(active.find(p=>p.userData.active)));
el("again").addEventListener("click",()=>start(startWithLove));
el("reset").addEventListener("click",resetCamera);
el("lang").addEventListener("change",e=>{
 lang=e.target.value;
 try{localStorage.setItem("petali.lingua",lang)}catch(e){}
 format();
});
format();init();
