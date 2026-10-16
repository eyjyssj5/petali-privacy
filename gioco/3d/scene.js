import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

/* PETALI 3D: WebGL geometry, not a rotating photograph.
   Each game petal is an independent closed mesh with thickness and normals.
   Nothing here alters the legacy /gioco/ page. */
const $ = id => document.getElementById(id);
const flowers = window.Fiori?.FIORI || [];
const stage = $("stage");
const stageError = msg => {
  $("loader").hidden = true;
  $("error").hidden = false;
  $("error").textContent = msg;
};
const langs = ["it","en","es","pt","fr","de"];
const phrases = {
 it:{preview:"ANTEPRIMA INTERATTIVA",title:"Un fiore vero, da ogni lato.",intro:"Trascina per ruotare in tutte le direzioni. Con due dita ingrandisci. Tocca un petalo per staccarlo.",rotate:"Ruota con il dito · pizzica per zoom",load:"Creazione della geometria 3D…",choose:"Scegli uno dei 15 fiori",start:"Da quale frase vuoi iniziare?",pluck:"Stacca un petalo",again:"Rigioca con questo fiore",note:"Modelli 3D procedurali con petali indipendenti. Anteprima interattiva: non è ancora un'app pubblicata negli store.",progress:"Petalo {n} di {tot}",remaining:"{n} petali rimasti",error:"Il dispositivo non riesce ad avviare WebGL."},
 en:{preview:"INTERACTIVE PREVIEW",title:"A real 3D flower, from every angle.",intro:"Drag to rotate in any direction. Pinch to zoom. Tap a petal to pull it off.",rotate:"Drag to rotate · pinch to zoom",load:"Creating 3D geometry…",choose:"Choose one of 15 flowers",start:"Which phrase would you like to start with?",pluck:"Pluck a petal",again:"Play again with this flower",note:"Procedural 3D models with individually removable petals. Interactive preview; not yet a store release.",progress:"Petal {n} of {tot}",remaining:"{n} petals left",error:"This device could not start WebGL."},
 es:{preview:"VISTA PREVIA INTERACTIVA",title:"Una flor 3D de verdad, desde todos los ángulos.",intro:"Arrastra para girar en cualquier dirección. Pellizca para ampliar. Toca un pétalo para arrancarlo.",rotate:"Arrastra para girar · pellizca para ampliar",load:"Creando geometría 3D…",choose:"Elige una de las 15 flores",start:"¿Con qué frase quieres empezar?",pluck:"Arranca un pétalo",again:"Juega de nuevo con esta flor",note:"Modelos 3D procedimentales con pétalos independientes. Vista previa, todavía no publicada en las tiendas.",progress:"Pétalo {n} de {tot}",remaining:"Quedan {n} pétalos",error:"Este dispositivo no puede iniciar WebGL."},
 pt:{preview:"PRÉ-VISUALIZAÇÃO INTERATIVA",title:"Uma flor 3D verdadeira, vista de qualquer lado.",intro:"Arrasta para rodar em todas as direções. Usa dois dedos para ampliar. Toca numa pétala para a retirar.",rotate:"Arrasta para rodar · aproxima com dois dedos",load:"A criar a geometria 3D…",choose:"Escolhe uma das 15 flores",start:"Com que frase queres começar?",pluck:"Retirar uma pétala",again:"Jogar novamente com esta flor",note:"Modelos 3D procedurais com pétalas independentes. Pré-visualização; ainda não publicada nas lojas.",progress:"Pétala {n} de {tot}",remaining:"Restam {n} pétalas",error:"Não foi possível iniciar o WebGL."},
 fr:{preview:"APERÇU INTERACTIF",title:"Une vraie fleur en 3D, sous tous les angles.",intro:"Glissez pour la faire tourner dans tous les sens. Pincez pour zoomer. Touchez un pétale pour le détacher.",rotate:"Glissez pour tourner · pincez pour zoomer",load:"Création de la géométrie 3D…",choose:"Choisissez parmi les 15 fleurs",start:"Par quelle formule commencer ?",pluck:"Détacher un pétale",again:"Rejouer avec cette fleur",note:"Modèles 3D procéduraux aux pétales indépendants. Aperçu interactif, pas encore publié dans les boutiques.",progress:"Pétale {n} sur {tot}",remaining:"Il reste {n} pétales",error:"Impossible de démarrer WebGL sur cet appareil."},
 de:{preview:"INTERAKTIVE VORSCHAU",title:"Eine echte 3D-Blume aus jedem Blickwinkel.",intro:"Mit dem Finger in jede Richtung drehen. Mit zwei Fingern zoomen. Ein Blütenblatt antippen, um es abzuziehen.",rotate:"Ziehen zum Drehen · zwei Finger zum Zoomen",load:"3D-Geometrie wird erstellt…",choose:"Wähle eine von 15 Blumen",start:"Mit welchem Spruch möchtest du beginnen?",pluck:"Blütenblatt abzupfen",again:"Mit dieser Blume erneut spielen",note:"Prozedurale 3D-Modelle mit einzeln abnehmbaren Blütenblättern. Interaktive Vorschau, noch nicht in den Stores.",progress:"Blütenblatt {n} von {tot}",remaining:"Noch {n} Blütenblätter",error:"WebGL konnte auf diesem Gerät nicht gestartet werden."}
};
let lang = (() => {
  try { const s = localStorage.getItem("petali.lingua"); return langs.includes(s) ? s : (langs.includes(navigator.language.slice(0,2)) ? navigator.language.slice(0,2) : "it"); } catch { return "it"; }
})();
let current = flowers[0], remaining = [], gameTotal = 0, removedCount = 0, firstMama = true, previousCount = 0, phase = "choice";
let renderer, scene, camera, root, raycaster;
let lastFrame = 0;
const animations = [], pointers = new Map();
let initialPinch = null, initialZoom = 6.3, touchStart = null;
const geometryCache = new Map();

const SPECS = {
 "rosa-rossa":{type:"rose",petal:"#b90436",edge:"#e73b57",heart:"#9b1438",shape:"round",width:.58,length:1.05,layers:3,heartRadius:.15,petalCurl:.32},
 "rosa-gialla":{type:"rose",petal:"#f9be18",edge:"#ffe077",heart:"#e7a313",shape:"round",width:.58,length:1.05,layers:3,heartRadius:.15,petalCurl:.32},
 "girasole":{type:"sunflower",petal:"#f3a91b",edge:"#ffdf43",heart:"#513018",shape:"point",width:.21,length:1.12,layers:2,heartRadius:.42,petalCurl:.10},
 "tulipano-rosso":{type:"tulip",petal:"#d60a34",edge:"#f85255",heart:"#dfb637",shape:"cup",width:.47,length:1.18,layers:2,heartRadius:.11,petalCurl:.53},
 "orchidea":{type:"orchid",petal:"#d6a3dd",edge:"#ffe2f5",heart:"#9d2c9b",shape:"butterfly",width:.60,length:1.05,layers:2,heartRadius:.12,petalCurl:.40},
 "lavanda":{type:"lavender",petal:"#7861bc",edge:"#cdb5ed",heart:"#6d56ad",shape:"spike",width:.15,length:.33,layers:1,heartRadius:.05,petalCurl:.18},
 "papavero":{type:"poppy",petal:"#d6222e",edge:"#f9634e",heart:"#232020",shape:"silk",width:.77,length:1.12,layers:2,heartRadius:.19,petalCurl:.33},
 "iris":{type:"iris",petal:"#3f48b7",edge:"#999be5",heart:"#e2ac27",shape:"iris",width:.51,length:1.00,layers:2,heartRadius:.12,petalCurl:.42},
 "garofano-rosso":{type:"carnation",petal:"#ba1139",edge:"#fa5368",heart:"#95203a",shape:"ruffle",width:.47,length:.92,layers:3,heartRadius:.10,petalCurl:.44},
 "viola":{type:"pansy",petal:"#613fa8",edge:"#a66bcd",heart:"#e7b631",shape:"round",width:.70,length:.96,layers:2,heartRadius:.14,petalCurl:.18},
 "ortensia":{type:"hydrangea",petal:"#7193d5",edge:"#b5d7f6",heart:"#89c0c9",shape:"cluster",width:.26,length:.39,layers:2,heartRadius:.06,petalCurl:.13},
 "peonia":{type:"peony",petal:"#da447f",edge:"#ffc3d8",heart:"#b53d72",shape:"ruffle",width:.53,length:.99,layers:3,heartRadius:.16,petalCurl:.39},
 "dalia":{type:"dahlia",petal:"#f06d21",edge:"#ffc153",heart:"#c85424",shape:"point",width:.28,length:1.04,layers:3,heartRadius:.12,petalCurl:.18},
 "ciliegio":{type:"cherry",petal:"#f3b2cf",edge:"#ffe7f0",heart:"#e4af36",shape:"round",width:.42,length:.70,layers:2,heartRadius:.11,petalCurl:.15},
 "ibisco":{type:"hibiscus",petal:"#d5275a",edge:"#fb6591",heart:"#8f1437",shape:"silk",width:.75,length:1.19,layers:2,heartRadius:.16,petalCurl:.28}
};
const EMOJI={"rosa-rossa":"🌹","rosa-gialla":"🌹","girasole":"🌻","tulipano-rosso":"🌷","orchidea":"🌸","lavanda":"🪻","papavero":"🌺","iris":"🌸","garofano-rosso":"🌹","viola":"🌺","ortensia":"💠","peonia":"🌺","dalia":"🌼","ciliegio":"🌸","ibisco":"🌺"};

function randomUnit(seed){let x=Math.sin(seed*78.233+8.123)*43758.5453;return x-Math.floor(x);}
function range(min,max,t){return min+(max-min)*t;}
function color(hex){return new THREE.Color(hex);}
function createGeometry(length,width,opts,seed){
 const m=11, n=16, vertices=[], col=[], uv=[], indices=[];
 const base=color(opts.base), rim=color(opts.rim), bottom=color(opts.bottom||opts.base);
 const thickness=.018;
 for(let face=0;face<2;face++){
  for(let j=0;j<=n;j++){
   let t=j/n, taper=Math.pow(Math.max(0,Math.sin(Math.PI*t)),opts.point?1.05:.58);
   if(opts.cup)taper=Math.min(1,Math.pow(Math.sin(Math.PI*(.12+.82*t)),.52));
   if(opts.heart && t>.75)taper*=1-.17*Math.sin((t-.75)*Math.PI*4);
   for(let i=0;i<=m;i++){
    const u=(2*i/m)-1;
    let w=width*taper*(1+.065*Math.sin(t*40+seed*1.3+u*9));
    if(opts.ruffle)w*=1+.11*Math.sin(u*24+t*12+seed);
    let x=u*w+Math.sin(t*2.5+seed*.5)*.022*t;
    let y=length*t +.055*Math.sin(t*11+seed)*t;
    let z=.18*Math.sin(t*Math.PI)+opts.curl*t*t+opts.cupDepth*u*u*Math.sin(t*Math.PI)+Math.sin(u*5+t*17+seed)*opts.wrinkle*t;
    if(face===1)z-=thickness*(1-.3*t);
    vertices.push(x,y,z);
    let gradient=range(.04,.78,t)+Math.abs(u)*.15;
    const shade=base.clone().lerp(rim,Math.min(.88,gradient));
    if(face===1)shade.multiplyScalar(.77);
    if(Math.abs(u)>.7)shade.lerp(rim,.14);
    col.push(shade.r,shade.g,shade.b);uv.push((u+1)/2,t);
   }
  }
 }
 const per=(n+1)*(m+1);
 for(let face=0;face<2;face++)for(let j=0;j<n;j++)for(let i=0;i<m;i++){
  const a=face*per+j*(m+1)+i,b=a+1,c=a+m+1,d=c+1;
  if(face===0)indices.push(a,b,c,b,d,c);
  else indices.push(a,c,b,b,c,d);
 }
 for(let i=0;i<m;i++){
  let a=i,b=i+1,c=per+i,d=per+i+1;indices.push(a,c,b,b,c,d);
  a=n*(m+1)+i;b=a+1;c=per+a;d=per+b;indices.push(a,b,c,b,d,c);
 }
 for(let j=0;j<n;j++){
  let a=j*(m+1),b=(j+1)*(m+1),c=per+a,d=per+b;indices.push(a,b,c,b,d,c);
  a=j*(m+1)+m;b=(j+1)*(m+1)+m;c=per+a;d=per+b;indices.push(a,c,b,b,c,d);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
 g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));
 g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(indices);g.computeVertexNormals();
 return g;
}
function physicalMaterial(rough=.62){
 return new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:rough,metalness:0,transparent:true,opacity:1});
}
function leafMaterial(){
 return new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.78});
}
function leafAt(group,y,angle,scale=1,stemX=0){
 const a=(angle*Math.PI/180);
 const mesh=new THREE.Mesh(createGeometry(.85*scale,.25*scale,{base:"#1e6e3f",rim:"#7ba952",cupDepth:.07,curl:.22,wrinkle:.025},Math.abs(angle)*.13),leafMaterial());
 mesh.position.set(stemX,y,-.32); mesh.rotation.z=-a;mesh.rotation.x=-.5;mesh.rotation.y=angle>0?-.35:.25;
 group.add(mesh);
}
function curvedTube(points,radius,mat,steps=30){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2])));
 return new THREE.Mesh(new THREE.TubeGeometry(curve,steps,radius,7,false),mat);
}
function sphere(r,mat,pos,segments=20){
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,segments,12),mat);
 mesh.position.set(pos[0],pos[1],pos[2]); return mesh;
}
function chooseSpec(id){return SPECS[id]||SPECS["rosa-rossa"];}
function makeAnatomy(group,id,spec){
 const green=new THREE.MeshStandardMaterial({color:0x39783e,roughness:.87});
 const top=spec.type==="lavender"?1.65:.78;
 group.add(curvedTube([[.03,-2.05,-.43],[.01,-1.14,-.29],[-.10,-.28,-.31],[0,top,-.29]],.062,green));
 if(spec.type!=="lavender"){
  leafAt(group,-1.28,75,1);leafAt(group,-.83,-64,.8);
  if(spec.type==="rose"||spec.type==="peony")leafAt(group,-1.7,-69,.65);
  for(let i=0;i<5;i++){
   let a=i*2*Math.PI/5;
   const g=createGeometry(.48,.19,{base:"#265a34",rim:"#548646",cupDepth:.10,curl:.12,wrinkle:0,point:true},i*3);
   const leaf=new THREE.Mesh(g,leafMaterial());
   leaf.position.set(.04*Math.sin(a),top,.00);leaf.rotation.z=-a;leaf.rotation.x=-.55;
   group.add(leaf);
  }
 }else{leafAt(group,-1.2,59,.48);leafAt(group,-.65,-65,.37);leafAt(group,.0,51,.28)}
}
function center(group,spec){
 const y=.82;
 if(spec.type==="lavender"){return}
 const dark=new THREE.MeshStandardMaterial({color:spec.heart,roughness:.9,side:THREE.DoubleSide});
 const r=spec.heartRadius;
 let z=.15;
 if(spec.type==="sunflower"||spec.type==="poppy"){
   const disc=sphere(r,dark,[0,y,z],32);disc.scale.z=.56;group.add(disc);
   const seeds=spec.type==="sunflower"?155:29;
   for(let i=0;i<seeds;i++){
    const t=Math.sqrt((i+.3)/seeds),a=i*2.39996;
    const rr=t*r*.88;
    const c=spec.type==="sunflower"?(i%3===0?0x8c592b:i%2?0x28150f:0xc68a42):0x34272c;
    const seed=sphere(spec.type==="sunflower"?.026:.024,new THREE.MeshStandardMaterial({color:c,roughness:1}),[rr*Math.cos(a),y+rr*Math.sin(a),z+.51*r],7);
    group.add(seed);
   }
 }else if(["ibisco","cherry","orchid","iris","pansy"].includes(spec.type)){
    group.add(sphere(r,dark,[0,y,z],18));
    const yellow=new THREE.MeshStandardMaterial({color:0xe7b44d,roughness:.6});
    const stamenCount=spec.type==="ibisco"?10:spec.type==="cherry"?13:5;
    for(let i=0;i<stamenCount;i++){
      const angle=2*Math.PI*i/stamenCount,rad=.055+Math.sqrt(i/stamenCount)*r*.6;
      const x=rad*Math.cos(angle), yy=y+rad*Math.sin(angle);
      const stalk=curvedTube([[x*.2,y, z+.05],[x,yy,z+.17],[x*1.3,yy+.02,z+.34]],.009,yellow,9);
      group.add(stalk);
      group.add(sphere(.029,yellow,[x*1.3,yy+.02,z+.34],7));
    }
    if(spec.type==="ibisco"){
     const pin=new THREE.MeshStandardMaterial({color:0xc92f4f,roughness:.7});
     group.add(curvedTube([[0,y,z+.08],[0,y+.05,z+.34],[0,y+.18,z+.74],[0,y+.20,z+.86]],.027,pin,24));
     for(let i=0;i<5;i++)group.add(sphere(.044,yellow,[.085*Math.cos(i*1.256),y+.20+.085*Math.sin(i*1.256),z+.83],8));
    }
 }else{
   group.add(sphere(r,dark,[0,y,z],17));
   if(spec.type==="rose"||spec.type==="peony"||spec.type==="carnation")for(let j=0;j<7;j++){
     const a=j*2.39996, rr=.035*Math.sqrt(j+1);
     const bud=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshStandardMaterial({color:j%2?spec.edge:spec.petal,roughness:.8}));
     bud.position.set(rr*Math.cos(a),y+rr*Math.sin(a),z+.1);group.add(bud);
   }
 }
}
function petalOptions(spec,id){
 const r=randomUnit(id*23.7);
 return {base:spec.petal,rim:spec.edge,bottom:spec.heart,point:spec.shape==="point",cup:spec.shape==="cup",heart:spec.shape==="butterfly",ruffle:spec.shape==="ruffle",cupDepth:(spec.type==="tulip"?.53:.20)+.12*r,curl:spec.petalCurl+(.07*r),wrinkle:spec.type==="poppy"||spec.type==="hibiscus"?.040:.015};
}
function makePetal(spec,i,n){
 const opts=petalOptions(spec,i);
 const layers=spec.layers;
 const frac=i/n;
 const l=Math.floor(frac*layers), level=i-Math.ceil(n/layers)*l;
 const rand=randomUnit(i*9.3+n);
 let len=spec.length*(1-.18*l)*(0.91+.16*rand), width=spec.width*(1-.13*l);
 let x=0,y=.82,z=.02,angle=2*Math.PI*i/n;
 if(spec.type==="lavender"){
    const height=range(.30,1.70,(i+.6)/n);
    angle=2*Math.PI*(i%5)/5;
    const rr=.065+.08*Math.sin(Math.PI*(height-.3)/1.4);
    x=rr*Math.sin(angle);y=height;z=-.28+rr*Math.cos(angle);
    len=range(.25,.13,(height-.3)/1.4);
    width=.105;angle+=.1;
 }else if(spec.type==="hydrangea"){
    angle=i*2.399963;
    let f=Math.sqrt((i+.5)/n);
    x=1.02*f*Math.sin(angle);
    y=.82+1.02*f*Math.cos(angle);
    z=.06+.65*Math.sqrt(Math.max(0,1-f*f));
    len=.31*(.85+.3*rand);width=.24;angle+=.5;
 }else if(spec.type==="cherry"){
    const cluster=i%3, a=cluster*2*Math.PI/3;
    const cx=Math.sin(a)*.38, cy=.82+Math.cos(a)*.38;
    angle=(i*2.39996)+cluster*.15;
    x=cx+.05*Math.sin(angle);y=cy+.05*Math.cos(angle);z=.12+(.04*(i%2));
    len=.70*(.9+.15*rand);width=.42;
 }else{
    const ringCount=Math.max(1,Math.ceil(n/layers));
    angle=2*Math.PI*((i%ringCount)/ringCount)+(l%2)*.27;
    let rr=(spec.type==="sunflower"?.32:.03)+l*.12;
    x=rr*Math.sin(angle);y=.82+rr*Math.cos(angle);
    z=(l*.105)+.02;
    if(spec.type==="pansy" && i%3===0){width*=1.26;len*=1.19}
    if(spec.type==="orchid"&&i%4===0){width*=1.30;len*=1.22}
    if(spec.type==="iris"&&i%3===1){width*=.68;len*=1.17}
    if(spec.type==="dahlia"){width*=.86}
    if(spec.type==="tulip"){z-=.15;rr+=.16}
 }
 const geometry=createGeometry(len,width,opts,i);
 const mesh=new THREE.Mesh(geometry,physicalMaterial(spec.type==="orchid"?.48:.7));
 mesh.position.set(x,y,z);
 mesh.rotation.z=-angle;
 mesh.rotation.x=spec.type==="tulip"?.47:spec.type==="lavender"?-.43:-.17;
 mesh.rotation.y=(rand-.5)*.42;
 mesh.userData={petal:true,active:true,index:i};
 mesh.castShadow=false;
 return mesh;
}
function rebuild(n){
 if(!root) return;
 for(const o of [...root.children]){
   o.traverse(obj=>{
     if(obj.geometry?.dispose) obj.geometry.dispose();
     // unique petal materials may be faded on animation, dispose all.
     if(obj.material?.dispose) obj.material.dispose();
   });
   root.remove(o);
 }
 animations.length=0;remaining=[];
 const spec=chooseSpec(current.id);
 makeAnatomy(root,current.id,spec);
 for(let i=0;i<n;i++){
  const p=makePetal(spec,i,n);
  root.add(p);remaining.push(p);
 }
 center(root,spec);
}
function initRenderer(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance",preserveDrawingBuffer:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.65;
  renderer.setClearColor(0xffffff,0);
  stage.appendChild(renderer.domElement);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(39,1,.1,100);
  camera.position.set(0,.05,6.2);camera.lookAt(0,0,0);
  root=new THREE.Group();scene.add(root);
  scene.add(new THREE.HemisphereLight(0xfff1fa,0x578d6e,2.0));
  const key=new THREE.DirectionalLight(0xffffff,3.25);key.position.set(-3,5,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe2d8ff,1.45);fill.position.set(4,0,-2);scene.add(fill);
  const edge=new THREE.DirectionalLight(0xffd6d8,1.25);edge.position.set(-2,-3,0);scene.add(edge);
  raycaster=new THREE.Raycaster();
  root.rotation.set(-.16,-.28,.02);
  let obs=new ResizeObserver(resize);obs.observe(stage);resize();
  requestAnimationFrame(draw);
  $("loader").hidden=true;
 }catch(e){console.error(e);stageError(phrases[lang].error);return false}
 return true;
}
function resize(){
 if(!renderer)return;
 const w=stage.clientWidth||340,h=stage.clientHeight||390;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function draw(ms){
 requestAnimationFrame(draw);
 const dt=Math.min(.05,(ms-lastFrame)/1000||.016);lastFrame=ms;
 for(let i=animations.length-1;i>=0;i--){
   const a=animations[i];a.t+=dt;const t=Math.min(1,a.t/1.05);
   const ease=t*t*(3-2*t);
   a.mesh.position.set(a.start.x+a.dx*ease,a.start.y-1.8*t*t,a.start.z+.7*Math.sin(Math.PI*t));
   a.mesh.rotation.z=a.rot+ease*(a.dx>0?3.5:-3.5);
   a.mesh.rotation.y=a.rotY+ease*4.3;
   a.mesh.material.opacity=1-t;
   if(t>=1){root.remove(a.mesh);a.mesh.geometry.dispose();a.mesh.material.dispose();animations.splice(i,1)}
 }
 renderer?.render(scene,camera);
}
function detatch(mesh){
 if(phase!=="playing"||!mesh?.userData?.active)return;
 mesh.userData.active=false;
 const orig=mesh.position.clone();
 const side=(removedCount%2===0?1:-1);
 animations.push({mesh,start:orig,rot:mesh.rotation.z,rotY:mesh.rotation.y,dx:side*(1.0+.5*Math.random()),t:0});
 removedCount++;
 refreshCounter();
 const label=(removedCount%2===1)===firstMama?"mama":"nonMama";
 $("progress").textContent=phrases[lang].progress.replace("{n}",removedCount).replace("{tot}",gameTotal)+" · "+(label==="mama"?current.messaggi.mama[lang]:current.messaggi.nonMama[lang]);
 if(removedCount>=gameTotal){phase="result";setTimeout(()=>{if(phase==="result")renderGame()},700)}
}
function refreshCounter(){
 $("count").textContent=phase==="choice"?"15 ✿":(gameTotal-removedCount)+" / "+gameTotal;
}
function rayPluck(clientX,clientY){
 if(phase!=="playing"||!renderer)return;
 const rect=renderer.domElement.getBoundingClientRect();
 const mouse=new THREE.Vector2(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
 raycaster.setFromCamera(mouse,camera);
 const hits=raycaster.intersectObjects(remaining.filter(x=>x.userData.active),false);
 if(hits.length)detatch(hits[0].object);
}
function clampZoom(){camera.position.z=THREE.MathUtils.clamp(camera.position.z,3.5,10)}
stage.addEventListener("pointerdown",ev=>{
 if(!renderer)return;
 stage.setPointerCapture?.(ev.pointerId);
 pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(pointers.size===1)touchStart={x:ev.clientX,y:ev.clientY,moved:false};
 else if(pointers.size===2){const p=[...pointers.values()];initialPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);initialZoom=camera.position.z;touchStart=null}
});
stage.addEventListener("pointermove",ev=>{
 if(!pointers.has(ev.pointerId)||!renderer)return;
 const previous=pointers.get(ev.pointerId);
 const dx=ev.clientX-previous.x,dy=ev.clientY-previous.y;
 pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
 if(pointers.size>=2){
  const p=[...pointers.values()];
  let distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  if(initialPinch&&distance>8){camera.position.z=initialZoom*initialPinch/distance;clampZoom()}
 }else{
  if(touchStart&&(Math.abs(ev.clientX-touchStart.x)+Math.abs(ev.clientY-touchStart.y))>7)touchStart.moved=true;
  root.rotation.y+=dx*.010;root.rotation.x+=dy*.010;
 }
});
stage.addEventListener("pointerup",ev=>{
 const shouldRay=touchStart&&!touchStart.moved&&pointers.size===1;
 pointers.delete(ev.pointerId);initialPinch=null;
 if(shouldRay)rayPluck(ev.clientX,ev.clientY);
 if(!pointers.size)touchStart=null;
});
stage.addEventListener("pointercancel",ev=>{pointers.delete(ev.pointerId);initialPinch=null;touchStart=null});
stage.addEventListener("wheel",ev=>{if(!renderer)return;ev.preventDefault();camera.position.z+=ev.deltaY*.006;clampZoom()},{passive:false});
function localize(){
 document.documentElement.lang=lang;
 try{localStorage.setItem("petali.lingua",lang)}catch{}
 const q=phrases[lang];
 $("previewLabel").textContent=q.preview;$("headline").textContent=q.title;$("intro").textContent=q.intro;
 $("indicatorText").textContent=q.rotate;$("loadingText").textContent=q.load;
 $("chooseTitle").textContent=q.choose;$("startQuestion").textContent=q.start;
 $("pluckText").textContent=q.pluck;$("again").textContent=q.again;$("note").textContent=q.note;
 const t=window.PetaliLingueExtra?.UI?.[lang];
 const built={it:["M'ama","Non m'ama"],en:["Loves me","Loves me not"],es:["Me quiere","No me quiere"]};
 const labels=t?[t.mama,t.nonMama]:(built[lang]||built.it);
 $("startYesText").textContent=labels[0];$("startNoText").textContent=labels[1];
 $("flowerName").textContent=current?.nome?.[lang]||current?.nome?.it||"";
 $("meaning").textContent=current?.significato?.[lang]||current?.significato?.it||"";
 $("lang").value=lang;
 buildCatalog();renderGame();
}
function buildCatalog(){
 const parent=$("flowerGrid");parent.replaceChildren();
 for(const flower of flowers){
  const b=document.createElement("button");b.type="button";b.className="flower-choice"+(flower===current?" selected":"");
  b.dataset.id=flower.id;
  const dot=document.createElement("span");dot.className="dot";dot.textContent=EMOJI[flower.id]||"✿";
  const n=document.createElement("span");n.className="name";n.textContent=flower.nome[lang]||flower.nome.it;
  b.append(dot,n);
  b.addEventListener("click",()=>selectFlower(flower));
  parent.appendChild(b);
 }
}
function selectFlower(flower){
 current=flower;phase="choice";removedCount=0;gameTotal=0;
 rebuild(15);resetCamera();localize();
 window.scrollTo({top:0,behavior:"smooth"});
}
function resetCamera(){
 if(!root)return;
 root.rotation.set(-.16,-.28,.02);
 camera.position.set(0,.05,6.2);camera.lookAt(0,0,0);
}
function startGame(first){
 firstMama=first;
 const outcome=(Math.random()<.5?"M'ama":"Non m'ama");
 gameTotal=window.Fiori.numeroPerRisultato(first,outcome,previousCount);
 previousCount=gameTotal;removedCount=0;phase="playing";
 rebuild(gameTotal);renderGame();
}
function renderGame(){
 if(!current)return;
 $("flowerName").textContent=current.nome[lang]||current.nome.it;
 $("meaning").textContent=current.significato[lang]||current.significato.it;
 $("startControls").hidden=phase!=="choice";
 $("playing").hidden=phase!=="playing";
 $("result").hidden=phase!=="result";
 if(phase==="result"){
  const yes=((gameTotal%2===1)===firstMama);
  const key=yes?"mama":"nonMama";
  const ui=window.PetaliLingueExtra?.UI?.[lang];
  const builtin={it:["M'ama","Non m'ama"],en:["Loves me","Loves me not"],es:["Me quiere","No me quiere"]};
  $("resultPhrase").textContent=ui?ui[key]:(builtin[lang]||builtin.it)[yes?0:1];
  $("resultMessage").textContent=current.messaggi[key][lang]||current.messaggi[key].it;
 }else $("progress").textContent="";
 refreshCounter();
}
$("lang").addEventListener("change",ev=>{if(langs.includes(ev.target.value)){lang=ev.target.value;localize()}});
$("startYes").addEventListener("click",()=>startGame(true));
$("startNo").addEventListener("click",()=>startGame(false));
$("again").addEventListener("click",()=>{phase="choice";removedCount=0;gameTotal=0;rebuild(15);renderGame()});
$("pluck").addEventListener("click",()=>{const choice=remaining.find(p=>p.userData.active);if(choice)detatch(choice)});
$("reset").addEventListener("click",resetCamera);
window.addEventListener("keydown",ev=>{if(ev.key==="Escape")resetCamera()});
if(!flowers.length){stageError("Flower data unavailable. Please reload.");}
else if(initRenderer()){rebuild(15);localize()}
