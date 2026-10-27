/* Gate 3D: carica gioco.js solo dopo la verifica del diritto RevenueCat fiori_3d. */
(function () {
  'use strict';
  const commerce = window.PetaliCommerce;
  const main = document.querySelector('.layout');
  if (main) main.hidden = true;
  const gate = document.createElement('section');
  gate.id = 'petali-paywall-3d';
  gate.style.cssText = 'max-width:540px;margin:8vh auto;padding:28px 24px;border-radius:18px;background:#21252b;color:#fff;text-align:center;font:16px/1.5 system-ui,Arial';
  const title = document.createElement('h1');
  title.textContent = '🌸 Petali 3D Premium';
  const note = document.createElement('p');
  note.textContent = 'Tutti i 15 fiori 3D richiedono lo sblocco Premium. Le tre versioni 2D gratuite rimangono disponibili.';
  const status = document.createElement('p');
  status.setAttribute('role','status');
  status.textContent = 'Verifica acquisto in corso…';
  const buy = document.createElement('button');
  buy.type = 'button'; buy.textContent = 'Sblocca tutti i 3D';
  const restore = document.createElement('button');
  restore.type = 'button'; restore.textContent = 'Ripristina acquisti';
  const back = document.createElement('a');
  back.href = '../index.html'; back.textContent = 'Torna ai fiori gratuiti';
  for (const b of [buy, restore]) b.style.cssText = 'display:block;width:100%;margin:10px auto;padding:14px;border:0;border-radius:10px;cursor:pointer;';
  back.style.cssText = 'color:#ffc4df;display:inline-block;margin-top:14px';
  // PETALI_GATE_ANTEPRIME_15: solo anteprime 2D. Modelli GLB bloccati fino a acquisto verificato.
  const specie = [
    ['rosa-rossa','Rosa rossa'],['rosa-gialla','Rosa gialla'],['girasole','Girasole'],
    ['tulipano-rosso','Tulipano rosso'],['orchidea','Orchidea'],['lavanda','Lavanda'],
    ['papavero','Papavero'],['iris','Iris'],['garofano-rosso','Garofano rosso'],
    ['viola','Viola'],['ortensia','Ortensia'],['peonia','Peonia'],
    ['dalia','Dalia'],['ciliegio','Fiore di ciliegio'],['ibisco','Ibisco']
  ];
  const gallery = document.createElement('div');
  gallery.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:15px 0;max-height:350px;overflow:auto';
  for (const [id,nome] of specie) {
    const card=document.createElement('div');card.style.cssText='background:#39303b;border-radius:10px;padding:6px 4px';
    const img=document.createElement('img');img.src='../img/anteprime/'+id+'.svg';img.alt=nome;img.style.cssText='display:block;width:100%;height:78px;object-fit:contain';
    const cap=document.createElement('small');cap.textContent=nome+' · 🔒';cap.style.cssText='display:block;color:#fff;font:11px/1.3 system-ui,sans-serif';
    card.append(img,cap);gallery.append(card);
  }
  gate.append(title, note, gallery, status, buy, restore, back);

  document.body.append(gate);
  let opened = false;
  function unlock() {
    if (opened) return;
    opened = true;
    gate.remove();
    if (main) main.hidden = false;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'gioco.js';
    document.body.appendChild(script);
  }
  function message(e) { return e?.userCancelled ? 'Acquisto annullato.' : (e?.message || 'Operazione non disponibile.'); }
  async function check() {
    try {
      await commerce.refresh();
      if (commerce.has('3d')) { unlock(); return; }
      status.textContent = commerce.platform() === 'web'
        ? 'Per acquistare o ripristinare, apri l’app Android/iOS.'
        : 'Per giocare in 3D è necessario un acquisto verificato.';
    } catch (e) { status.textContent = 'Impossibile verificare l’acquisto: '+message(e); }
  }
  buy.onclick = async () => {
    buy.disabled = true; status.textContent = 'Apertura acquisto…';
    try { await commerce.buy('3d'); unlock(); }
    catch (e) { status.textContent = message(e); }
    finally { buy.disabled = false; }
  };
  restore.onclick = async () => {
    restore.disabled = true; status.textContent = 'Ripristino…';
    try { await commerce.restore(); if (commerce.has('3d')) unlock(); else status.textContent = 'Nessun acquisto 3D trovato.'; }
    catch (e) { status.textContent = message(e); }
    finally { restore.disabled = false; }
  };
  check();
})();
