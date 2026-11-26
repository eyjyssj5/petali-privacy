/* Crediti promozionali locali, indipendenti dagli acquisti permanenti.
   Non sono denaro, non sono trasferibili e non modificano gli entitlement. */
(function (w) {
  'use strict';
  const KEY='petali.rewards.v1', DAY=86400000, COST=10;
  const labels={
    it:['Crediti','Bonus giornaliero: +10','Guarda un video e sblocca','Usa 10 crediti','Sblocco per 24 ore','Acquista Premium permanente','Annulla','Video non disponibile o non completato. Riprova.','Crediti insufficienti.','Preferenze pubblicitarie','Sbloccato per 24 ore','Crediti locali: 100 iniziali, +10 al giorno.','Video in caricamento…','Sblocca questo fiore','Operazione non riuscita. Riprova.','Video di prova (nessun ricavo)'],
    en:['Credits','Daily bonus: +10','Watch a video to unlock','Use 10 credits','Unlock for 24 hours','Buy permanent Premium','Cancel','Video unavailable or incomplete. Try again.','Not enough credits.','Ad privacy choices','Unlocked for 24 hours','Local credits: 100 initially, +10 per day.','Loading video…','Unlock this flower','Unable to complete. Try again.','Test video (no revenue)'],
    es:['Créditos','Bono diario: +10','Mira un vídeo y desbloquea','Usar 10 créditos','Desbloqueo durante 24 horas','Comprar Premium permanente','Cancelar','Vídeo no disponible o incompleto. Inténtalo de nuevo.','Créditos insuficientes.','Preferencias de publicidad','Desbloqueado durante 24 horas','Créditos locales: 100 iniciales, +10 al día.','Cargando vídeo…','Desbloquea esta flor','No se pudo completar. Inténtalo de nuevo.','Vídeo de prueba (sin ingresos)'],
    pt:['Créditos','Bónus diário: +10','Vê um vídeo e desbloqueia','Usar 10 créditos','Desbloqueio por 24 horas','Comprar Premium permanente','Cancelar','Vídeo indisponível ou incompleto. Tenta novamente.','Créditos insuficientes.','Preferências de publicidade','Desbloqueado por 24 horas','Créditos locais: 100 iniciais, +10 por dia.','A carregar vídeo…','Desbloqueia esta flor','Não foi possível concluir. Tenta novamente.','Vídeo de teste (sem receita)'],
    fr:['Crédits','Bonus quotidien : +10','Regarder une vidéo pour débloquer','Utiliser 10 crédits','Déblocage pendant 24 heures','Acheter Premium permanent','Annuler','Vidéo indisponible ou incomplète. Réessayez.','Crédits insuffisants.','Préférences publicitaires','Débloqué pendant 24 heures','Crédits locaux : 100 au départ, +10 par jour.','Chargement de la vidéo…','Débloquer cette fleur','Échec. Réessayez.','Vidéo de test (aucun revenu)'],
    de:['Credits','Tagesbonus: +10','Video ansehen und freischalten','10 Credits verwenden','24 Stunden freischalten','Dauerhaft Premium kaufen','Abbrechen','Video nicht verfügbar oder unvollständig. Erneut versuchen.','Nicht genug Credits.','Werbedatenschutz','24 Stunden freigeschaltet','Lokale Credits: 100 zu Beginn, +10 pro Tag.','Video wird geladen…','Diese Blume freischalten','Vorgang fehlgeschlagen. Erneut versuchen.','Testvideo (keine Einnahmen)']
  };
  function lang(){return (w.document?.documentElement?.lang||'it').split('-')[0]}
  function t(i){return (labels[lang()]||labels.en)[i]}
  function day(now){return Math.floor(now/DAY)}
  function write(s){w.localStorage.setItem(KEY,JSON.stringify(s));return s}
  function state(now=Date.now()){
    let s;try{s=JSON.parse(w.localStorage.getItem(KEY)||'null')}catch(_){s=null}
    if(!s||s.version!==1||!Number.isSafeInteger(s.balance)||s.balance<0||!Number.isSafeInteger(s.lastDay)||!s.unlocks||typeof s.unlocks!=='object'){
      return write({version:1,balance:100,lastDay:day(now),unlocks:{}});
    }
    let dirty=false;
    if(day(now)>s.lastDay){s.balance+=10;s.lastDay=day(now);dirty=true}
    for(const k of Object.keys(s.unlocks)){if(!Number.isFinite(s.unlocks[k])||s.unlocks[k]<=now){delete s.unlocks[k];dirty=true}}
    return dirty?write(s):s;
  }
  function key(kind,id){if(!['2d','3d'].includes(kind)||typeof id!=='string'||!/^[a-z0-9-]{1,80}$/i.test(id))throw Error('Invalid flower');return kind+':'+id}
  function isUnlocked(kind,id,now=Date.now()){try{return (state(now).unlocks[key(kind,id)]||0)>now}catch(_){return false}}
  function useCredits(kind,id,now=Date.now()){
    const k=key(kind,id),s=state(now);
    if((s.unlocks[k]||0)>now)return true;
    if(s.balance<COST)return false;
    s.balance-=COST;s.unlocks[k]=now+DAY;write(s);return true;
  }
  let busy=false;
  async function watch(kind,id){
    if(busy)return false;
    const k=key(kind,id);
    if(isUnlocked(kind,id))return true;
    const ads=w.PetaliNative?.RewardAds;
    if(!ads?.available?.())return false;
    busy=true;
    try{
      const rewarded=await ads.watch();
      if(rewarded!==true)return false;
      const now=Date.now(),s=state(now);s.unlocks[k]=now+DAY;write(s);return true;
    }finally{busy=false}
  }
  function render(){
    const doc=w.document;
    if(!doc)return;
    const status=doc.getElementById('petali-credit-status');
    if(status){try{status.textContent=t(0)+': '+state().balance+' · '+t(1)}catch(_){status.textContent=t(14)}}
    const info=doc.getElementById('petali-credit-info');if(info)info.textContent=t(11);
    const privacy=doc.getElementById('petali-ad-privacy');
    if(privacy){privacy.textContent=t(9);privacy.hidden=!w.PetaliNative?.RewardAds?.available?.();privacy.onclick=async()=>{try{await w.PetaliNative.RewardAds.privacy()}catch(_){w.alert(t(14))}}}
    const test=doc.getElementById('petali-test-ad');if(test){test.textContent=t(15);test.hidden=w.PetaliAdConfig?.test!==true}
  }
  function showOffer(kind,id,onUnlock,onPurchase){
    const doc=w.document;
    if(!doc||doc.getElementById('petali-reward-dialog'))return;
    if(isUnlocked(kind,id)){onUnlock();return}
    const overlay=doc.createElement('div');overlay.id='petali-reward-dialog';
    overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#0009;display:grid;place-items:center;padding:18px';
    const panel=doc.createElement('div');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',t(13));
    panel.style.cssText='width:min(100%,400px);max-height:85vh;overflow:auto;background:#fff5fa;color:#473044;padding:20px;border-radius:20px;box-shadow:0 12px 50px #0005;display:grid;gap:12px';
    const heading=doc.createElement('strong');heading.textContent=t(13);heading.style.fontSize='20px';
    const desc=doc.createElement('div');desc.textContent=t(4);
    const status=doc.createElement('div');status.setAttribute('role','status');
    const buttons=[];
    function button(label,fn){const b=doc.createElement('button');b.type='button';b.textContent=label;b.style.cssText='width:100%;padding:12px;border:1px solid #c98bab;border-radius:12px;background:white;color:#713858;font:inherit;font-weight:600;cursor:pointer';b.onclick=fn;buttons.push(b);panel.append(b);return b}
    function close(){overlay.remove();render()}
    function lock(v){buttons.forEach(b=>b.disabled=v)}
    function done(){close();onUnlock()}
    panel.append(heading,desc,status);
    let balance=0;try{balance=state().balance}catch(_){}
    status.textContent=t(0)+': '+balance;
    button(t(2),async()=>{lock(true);status.textContent=t(12);try{if(await watch(kind,id)){done();return}status.textContent=t(7)}catch(_){status.textContent=t(7)}finally{lock(false)}});
    button(t(3),()=>{try{if(useCredits(kind,id)){done();return}status.textContent=t(8)}catch(_){status.textContent=t(14)}});
    button(t(5),async()=>{lock(true);try{await onPurchase();if(w.PetaliCommerce?.has(kind)){done();return}status.textContent=t(14)}catch(_){status.textContent=t(14)}finally{lock(false)}});
    button(t(6),close);
    overlay.append(panel);doc.body.append(overlay);buttons[0].focus();
  }
  w.PetaliRewards=Object.freeze({state,isUnlocked,useCredits,watch,showOffer,render,label:t});
})(window);
