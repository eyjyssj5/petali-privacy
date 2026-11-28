/* Crediti promozionali locali, indipendenti dagli acquisti permanenti.
   Non sono denaro, non sono trasferibili e non modificano gli entitlement. */
(function (w) {
  'use strict';
  const KEY='petali.rewards.v1', DAY=86400000, COST=10;
  const labels={
    it:['Crediti','Bonus giornaliero: +10','Guarda un video e sblocca','Usa 10 crediti','Sblocco per 24 ore','Acquista Premium permanente','Annulla','Video non disponibile o non completato. Riprova.','Crediti insufficienti.','Preferenze pubblicitarie','Sbloccato per 24 ore','100 crediti iniziali, +10 al giorno.','Video in caricamento…','Sblocca questo fiore','Operazione non riuscita. Riprova.','Video di prova (nessun ricavo)'],
    en:['Credits','Daily bonus: +10','Watch a video to unlock','Use 10 credits','Unlock for 24 hours','Buy permanent Premium','Cancel','Video unavailable or incomplete. Try again.','Not enough credits.','Ad privacy choices','Unlocked for 24 hours','100 starting credits, +10 per day.','Loading video…','Unlock this flower','Unable to complete. Try again.','Test video (no revenue)'],
    es:['Créditos','Bono diario: +10','Mira un vídeo y desbloquea','Usar 10 créditos','Desbloqueo durante 24 horas','Comprar Premium permanente','Cancelar','Vídeo no disponible o incompleto. Inténtalo de nuevo.','Créditos insuficientes.','Preferencias de publicidad','Desbloqueado durante 24 horas','100 créditos iniciales, +10 al día.','Cargando vídeo…','Desbloquea esta flor','No se pudo completar. Inténtalo de nuevo.','Vídeo de prueba (sin ingresos)'],
    pt:['Créditos','Bónus diário: +10','Vê um vídeo e desbloqueia','Usar 10 créditos','Desbloqueio por 24 horas','Comprar Premium permanente','Cancelar','Vídeo indisponível ou incompleto. Tenta novamente.','Créditos insuficientes.','Preferências de publicidade','Desbloqueado por 24 horas','100 créditos iniciais, +10 por dia.','A carregar vídeo…','Desbloqueia esta flor','Não foi possível concluir. Tenta novamente.','Vídeo de teste (sem receita)'],
    fr:['Crédits','Bonus quotidien : +10','Regarder une vidéo pour débloquer','Utiliser 10 crédits','Déblocage pendant 24 heures','Acheter Premium permanent','Annuler','Vidéo indisponible ou incomplète. Réessayez.','Crédits insuffisants.','Préférences publicitaires','Débloqué pendant 24 heures','100 crédits au départ, +10 par jour.','Chargement de la vidéo…','Débloquer cette fleur','Échec. Réessayez.','Vidéo de test (aucun revenu)'],
    de:['Credits','Tagesbonus: +10','Video ansehen und freischalten','10 Credits verwenden','24 Stunden freischalten','Dauerhaft Premium kaufen','Abbrechen','Video nicht verfügbar oder unvollständig. Erneut versuchen.','Nicht genug Credits.','Werbedatenschutz','24 Stunden freigeschaltet','100 Credits zu Beginn, +10 pro Tag.','Video wird geladen…','Diese Blume freischalten','Vorgang fehlgeschlagen. Erneut versuchen.','Testvideo (keine Einnahmen)']
  };
  const loyaltyLabels={
    it:["Accesso giornaliero","Giorni consecutivi","Premio ogni 10 giorni: +100 crediti","Premio ricevuto!","Chiudi","Crediti di benvenuto: 100; +10 ogni giorno; +100 ogni 10 giorni consecutivi."],
    en:["Daily check-in","Consecutive days","Reward every 10 days: +100 credits","Reward received!","Close","100 welcome credits; +10 each day; +100 every 10 consecutive days."],
    es:["Acceso diario","Días consecutivos","Premio cada 10 días: +100 créditos","¡Premio recibido!","Cerrar","100 créditos de bienvenida; +10 cada día; +100 cada 10 días consecutivos."],
    pt:["Acesso diário","Dias consecutivos","Prémio a cada 10 dias: +100 créditos","Prémio recebido!","Fechar","100 créditos de boas-vindas; +10 por dia; +100 a cada 10 dias consecutivos."],
    fr:["Connexion quotidienne","Jours consécutifs","Récompense tous les 10 jours : +100 crédits","Récompense reçue !","Fermer","100 crédits de bienvenue ; +10 par jour ; +100 tous les 10 jours consécutifs."],
    de:["Täglicher Login","Aufeinanderfolgende Tage","Belohnung alle 10 Tage: +100 Credits","Belohnung erhalten!","Schließen","100 Willkommens-Credits; +10 pro Tag; +100 alle 10 aufeinanderfolgenden Tage."]
  };
  function lang(){return (w.document?.documentElement?.lang||'it').split('-')[0]}
  function t(i){return (labels[lang()]||labels.en)[i]}
  function day(now){return Math.floor(now/DAY)}
  function write(s){w.localStorage.setItem(KEY,JSON.stringify(s));return s}
  function state(now=Date.now()){
    let s;try{s=JSON.parse(w.localStorage.getItem(KEY)||'null')}catch(_){s=null}
    if(!s||s.version!==1||!Number.isSafeInteger(s.balance)||s.balance<0||!Number.isSafeInteger(s.lastDay)||!s.unlocks||typeof s.unlocks!=='object'){
      return write({version:1,balance:110,lastDay:day(now),streak:1,unlocks:{}});
    }
    let dirty=false;
    if(!Number.isSafeInteger(s.streak)||s.streak<0||s.streak>10){s.streak=1;dirty=true}
    if(day(now)>s.lastDay){
      s.streak=day(now)===s.lastDay+1?(s.streak%10)+1:1;
      s.balance+=10+(s.streak===10?100:0);s.lastDay=day(now);dirty=true;
    }
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
  function showLoyalty(){
    const doc=w.document, l=loyaltyLabels[lang()]||loyaltyLabels.en,s=state();
    if(doc.getElementById("petali-loyalty-dialog"))return;
    const d=doc.createElement("dialog");d.id="petali-loyalty-dialog";
    d.style.cssText="max-width:min(360px,90vw);border:1px solid #e5bcd4;border-radius:20px;background:#fff5fa;color:#713858;padding:22px;text-align:center";
    const title=doc.createElement("h2");title.textContent=l[0];
    const balance=doc.createElement("p");balance.textContent=t(0)+": "+s.balance;
    const progress=doc.createElement("p");progress.textContent=l[1]+": "+s.streak+" / 10";
    const bar=doc.createElement("progress");bar.max=10;bar.value=s.streak;bar.setAttribute("aria-label",l[1]);bar.style.width="100%";
    const desc=doc.createElement("p");desc.textContent=l[2]+(s.streak===10?" · "+l[3]:"");
    const close=doc.createElement("button");close.type="button";close.textContent=l[4];close.onclick=()=>d.close();
    d.append(title,balance,progress,bar,desc,close);doc.body.append(d);
    d.addEventListener("close",()=>d.remove(),{once:true});d.showModal();
  }
  function render(){
    const doc=w.document;
    if(!doc)return;
    const status=doc.getElementById('petali-credit-status');
    if(status){try{status.textContent=t(0)+': '+state().balance+' · '+t(1)}catch(_){status.textContent=t(14)}}
    const l=loyaltyLabels[lang()]||loyaltyLabels.en;
    const info=doc.getElementById('petali-credit-info');if(info)info.textContent=l[5];
    const loyalty=doc.getElementById('petali-daily-login');
    if(loyalty){loyalty.textContent=l[0]+" · "+state().streak+"/10";loyalty.onclick=showLoyalty;}
    const privacy=doc.getElementById('petali-ad-privacy');
    if(privacy){privacy.textContent=t(9);privacy.hidden=!w.PetaliNative?.RewardAds?.available?.();privacy.onclick=async()=>{try{await w.PetaliNative.RewardAds.privacy()}catch(_){w.alert(t(14))}}}
    const privacyMenu=doc.getElementById('petali-privacy-menu');
    if(privacyMenu){privacyMenu.hidden=false;const toggle=doc.getElementById('petali-privacy-menu-toggle');if(toggle)toggle.setAttribute('aria-label',l[0]+' / '+t(9))}
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
