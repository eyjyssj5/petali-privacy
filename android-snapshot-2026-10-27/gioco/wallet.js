/* Native-only, separately configured PETALI wallet. No service credentials in the client. */
(function(w){
'use strict';
const cfg=w.PetaliWalletConfig||{},native=w.PetaliNative?.platform;
const enabled=['android','ios'].includes(native)&&/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(cfg.url||'')&&/^sb_publishable_[a-zA-Z0-9_-]+$/.test(cfg.key||'');
const doc=w.document, KEY='petali.wallet.session.v1', PENDING='petali.wallet.pending.v1', INVITE='petali.wallet.invite.v1';
let session=null,snap=null,refreshing=null,dialog=null,dialogKind='account',pendingLogin=null,busy=false;
const storage={get(k){try{return JSON.parse(w.localStorage.getItem(k)||'null')}catch{return null}},set(k,v){if(v===null)w.localStorage.removeItem(k);else w.localStorage.setItem(k,JSON.stringify(v))}};
if(enabled){const stored=storage.get(KEY);if(stored?.access_token&&stored?.refresh_token)session=stored}
function lang(){return doc.documentElement.lang||'it'}
function t(k,params={}){const d=w.PetaliWalletLabels[lang()]||w.PetaliWalletLabels.en;return d[k].replace(/\{(\w+)\}/g,(_,x)=>String(params[x]??''))}
function notify(){w.dispatchEvent(new Event('petali-wallet-change'));renderMenu()}
function setSession(s){session=s;snap=null;storage.set(KEY,s);if(!s){storage.set(INVITE,null);storage.set(PENDING,null)}notify()}
function normalSession(d){if(!d?.access_token||!d?.refresh_token)throw Error('AUTH_REQUIRED');return {access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Number(d.expires_at)||Math.floor(Date.now()/1000)+Number(d.expires_in||3600),user_id:d.user?.id||null}}
class WalletError extends Error{constructor(status,code){super(code);this.status=status;this.code=code}}
async function request(path,body,token){
 if(!enabled)throw new WalletError(503,'UNAVAILABLE');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
 const h={apikey:cfg.key,'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;
 const r=await fetch(cfg.url+path,{method:'POST',headers:h,body:JSON.stringify(body||{}),signal:controller.signal});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new WalletError(r.status,String(d.message||d.error_code||d.code||'UNAVAILABLE').slice(0,200));return d
 }finally{clearTimeout(timer)}
}
async function refresh(force=false){if(!session)throw new WalletError(401,'AUTH_REQUIRED');if(!force&&session.expires_at>Date.now()/1000+60)return session.access_token;
 if(!refreshing)refreshing=(async()=>{try{const d=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});const ns=normalSession(d);session=ns;storage.set(KEY,ns);return ns.access_token}catch(e){if(e.status===400||e.status===401)setSession(null);throw e}finally{refreshing=null}})();return refreshing}
async function rpc(name,body={}){let token=await refresh();try{return await request('/rest/v1/rpc/'+name,body,token)}catch(e){if(e.status===401){token=await refresh(true);return request('/rest/v1/rpc/'+name,body,token)}throw e}}
function accept(d){if(!d||!Number.isSafeInteger(d.balance)||d.balance<0||!/^PET-[0-9A-F]{16}$/.test(d.code)||!Number.isInteger(d.streak)||!Array.isArray(d.unlocks))throw new WalletError(503,'UNAVAILABLE');snap=d;notify();return d}
async function checkin(invite){const p=invite??storage.get(INVITE);const d=accept(await rpc('petali_checkin',{p_invite:p||null}));storage.set(INVITE,null);return d}
async function requestOtp(email,invite){if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||invite&&!/^PET-[0-9A-F]{16}$/.test(invite))throw new WalletError(400,'INVALID');await request('/auth/v1/otp',{email,create_user:true});pendingLogin={email,invite};}
async function verifyOtp(code){if(!pendingLogin||!/^\d{6}$/.test(code))throw new WalletError(400,'INVALID');const {email,invite}=pendingLogin;const d=await request('/auth/v1/verify',{email,token:code,type:'email'});const s=normalSession(d);setSession(s);storage.set(INVITE,invite||null);pendingLogin=null;return checkin(invite)}
async function sendCredits(code,amount){
 if(!/^PET-[0-9A-F]{16}$/.test(code)||!Number.isInteger(amount)||amount<1||amount>100000||!snap||snap.code===code)throw new WalletError(400,'INVALID');
 let pending=storage.get(PENDING);
 if(pending&&pending.user!==session?.user_id)throw new WalletError(409,'PENDING');
 if(pending&&(pending.code!==code||pending.amount!==amount))throw new WalletError(409,'PENDING');
 if(!pending){if(snap.balance<amount)throw new WalletError(400,'INVALID');pending={user:session?.user_id,code,amount,id:crypto.randomUUID()};storage.set(PENDING,pending)}
 try{const d=accept(await rpc('petali_send_credits',{p_code:code,p_amount:amount,p_request_id:pending.id}));storage.set(PENDING,null);return d}catch(e){if(e.status>=400&&e.status<500&&e.status!==401&&e.status!==429)storage.set(PENDING,null);throw e}
}
const canon=id=>id==='tulipano'?'tulipano-rosso':id==='garofano'?'garofano-rosso':id;
function isUnlocked(mode,id,now=Date.now()){return !!snap?.unlocks?.some(x=>x.mode===mode&&x.flower_id===canon(id)&&Date.parse(x.expires_at)>now)}
async function unlock(mode,id){try{accept(await rpc('petali_unlock_flower',{p_mode:mode,p_flower_id:canon(id)}));return true}catch(e){if(e.code.includes('INSUFFICIENT_CREDITS'))return false;throw e}}
async function logout(){try{if(session){const token=await refresh();await request('/auth/v1/logout?scope=local',{},token)}}finally{setSession(null)}}
async function deleteAccount(){await rpc('petali_delete_account');setSession(null)}
function errorText(e){if(e?.code==='PENDING')return t('pendingRetry');if(e?.status===400||e?.status===409||e?.status===422)return t('invalid');if(e?.status===401)return t('authRequired');return t('unavailable')}
function el(tag,txt){const x=doc.createElement(tag);if(txt!==undefined)x.textContent=txt;return x}
function btn(txt,fn){const b=el('button',txt);b.type='button';b.onclick=fn;return b}
function field(label,kind='text',value=''){const wrap=el('label',label),input=el('input');input.type=kind;input.value=value;input.autocomplete='off';input.required=true;wrap.append(input);return {wrap,input}}
function open(kind='account'){
 if(!enabled)return;if(dialog){dialogKind=kind;paint();return}dialogKind=kind;dialog=el('dialog');dialog.id='petali-wallet-dialog';dialog.style.cssText='max-width:min(400px,90vw);max-height:85vh;overflow:auto;border:1px solid #e5bcd4;border-radius:20px;background:#fff5fa;color:#713858;padding:20px';doc.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();dialog=null;pendingLogin=null},{once:true});paint();dialog.showModal()
}
function paint(){
 if(!dialog)return;const d=dialog;d.replaceChildren();const h=el('h2',t(dialogKind==='invite'?'inviteTitle':dialogKind==='send'?'sendTitle':'account'));const status=el('p');status.setAttribute('role','status');
 d.append(h,status);const close=btn(t('close'),()=>{if(!busy)d.close()});
 async function run(fn,ok){if(busy)return;busy=true;const buttons=Array.from(d.querySelectorAll('button'));buttons.forEach(x=>x.disabled=true);status.textContent=t('loading');try{await fn();if(dialog===d){paint();if(ok){const node=d.querySelector('[role=status]');if(node)node.textContent=ok}}}catch(e){if(dialog===d)status.textContent=errorText(e)}finally{busy=false;buttons.forEach(x=>x.disabled=false)}}
 if(!session){
  if(pendingLogin){
   const code=field(t('otp'));code.input.inputMode='numeric';code.input.maxLength=6;d.append(code.wrap,btn(t('verify'),()=>void run(()=>verifyOtp(code.input.value.trim()))),btn(t('login'),()=>{pendingLogin=null;paint()}));
  }else{
   const email=field(t('email'),'email'),invite=field(t('inviteOptional'));invite.input.required=false;invite.input.maxLength=20;email.input.autocomplete='email';
   const consent=el('label',t('consent'));const check=el('input');check.type='checkbox';consent.prepend(check);
   d.append(el('p',t('authRequired')),email.wrap,invite.wrap,consent,btn(t('sendOtp'),()=>{if(!check.checked){status.textContent=t('consent');return}if(!email.input.reportValidity())return;void run(()=>requestOtp(email.input.value.trim().toLowerCase(),invite.input.value.trim().toUpperCase()),t('emailSent'))}));
  }
 }else if(!snap){
  const inv=field(t('inviteOptional'),'text',storage.get(INVITE)||'');inv.input.required=false;d.append(inv.wrap,btn(t('verify'),()=>{storage.set(INVITE,inv.input.value.trim().toUpperCase()||null);void run(()=>checkin())}),btn(t('logout'),()=>void run(logout)));
 }else{
  const balance=el('p',((w.PetaliRewards?.label?.(0))||t('amount'))+': '+snap.balance);
  const own=el('p',t('code')+': '+snap.code);own.dir='ltr';
  d.append(balance,own,btn(t('copyCode'),()=>void run(async()=>{if(navigator.share&&dialogKind==='invite')await navigator.share({text:t('inviteTitle')+': '+snap.code});else if(navigator.clipboard)await navigator.clipboard.writeText(snap.code);else throw new WalletError(503,'UNAVAILABLE')},t('copied'))));
  if(dialogKind==='invite')d.append(el('p',t('inviteProgress',{n:snap.referrals,reward:snap.referral_credits})),el('p',t('rewardDesc')));
  if(dialogKind==='send'){const p=storage.get(PENDING);const rec=field(t('recipient'),'text',p?.code||''),amt=field(t('amount'),'number',p?String(p.amount):'');rec.input.maxLength=20;rec.input.dir='ltr';amt.input.min='1';amt.input.max='100000';amt.input.step='1';d.append(rec.wrap,amt.wrap,btn(t('send'),()=>{const code=rec.input.value.trim().toUpperCase(),amount=Number(amt.input.value);if(!rec.input.reportValidity()||!amt.input.reportValidity())return;if(!w.confirm(t('confirmSend',{amount,code})))return;void run(()=>sendCredits(code,amount),t('sent'))}));}
  d.append(el('small',t('legacy')),btn(t('logout'),()=>void run(logout)),btn(t('delete'),()=>{if(w.confirm(t('delete')+'?'))void run(deleteAccount)}));
 }d.append(close)
}
function renderMenu(){if(!doc)return;for(const [id,k,kind] of [['petali-wallet-account','account','account'],['petali-wallet-send','sendTitle','send'],['petali-wallet-invite','inviteTitle','invite']]){const e=doc.getElementById(id);if(e){e.hidden=!enabled;if(enabled){e.textContent=t(k);e.onclick=()=>open(kind)}}}}
async function bootstrap(){if(!enabled)return;renderMenu();if(session){try{await checkin()}catch(e){console.warn('[PETALI wallet]',e.code||e.name);notify()}}}
w.PetaliWallet=Object.freeze({enabled,isAuthenticated:()=>!!session,snapshot:()=>snap,isUnlocked,unlock,bootstrap,open,renderMenu,deleteAccount});
if(doc){doc.addEventListener('DOMContentLoaded',()=>{renderMenu();void bootstrap();new MutationObserver(renderMenu).observe(doc.documentElement,{attributes:true,attributeFilter:['lang']});doc.addEventListener('visibilitychange',()=>{if(!doc.hidden&&session)void bootstrap()})})}
})(window);
