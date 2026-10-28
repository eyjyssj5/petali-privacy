/* Petali: accesso agli acquisti verificato esclusivamente via RevenueCat SDK.
   Il browser pubblico non concede accesso premium. Nessuna chiave segreta nel client. */
(function () {
  'use strict';
  const config = window.PetaliPayments || {};
  let started = null;
  let rights = { '2d': false, '3d': false };
  const listeners = new Set();
  const platform = () => window.PetaliNative?.platform || window.Capacitor?.getPlatform?.() || 'web';
  const sdk = () => window.PetaliNative?.Purchases || window.Capacitor?.Plugins?.Purchases;
  const key = () => platform() === 'ios' ? config.ios : config.android;
  const entName = kind => kind === '3d' ? (config.entitlement3d || 'fiori_3d') : (config.entitlement2d || 'fiori_2d');
  const validKey = s => typeof s === 'string' && /^(goog_|appl_|test_)/.test(s) && s.length > 12 && !/INSERISCI_|YOUR_|TODO/i.test(s);
  function emit() { for (const fn of listeners) { try { fn({ ...rights }); } catch (_) {} } }
  function apply(info) {
    const active = info?.entitlements?.active || {};
    rights = {
      '2d': Boolean(active[entName('2d')] || active[config.entitlementLegacy2d || 'sblocco']),
      '3d': Boolean(active[entName('3d')])
    };
    emit();
  }
  async function init() {
    if (platform() !== 'ios' && platform() !== 'android') return false;
    if (!sdk() || !validKey(key())) return false;
    if (!started) {
      started = sdk().configure({ apiKey: key() }).then(() => true).catch(e => {
        started = null;
        throw e;
      });
    }
    return started;
  }
  async function refresh() {
    if (!(await init())) { rights = { '2d': false, '3d': false }; emit(); return { ...rights }; }
    try {
      const response = await sdk().getCustomerInfo();
      apply(response.customerInfo);
    } catch (e) {
      rights = { '2d': false, '3d': false };
      emit();
      throw e;
    }
    return { ...rights };
  }
  async function buy(kind) {
    if (!['2d','3d'].includes(kind)) throw new Error('Tipo di acquisto non valido');
    if (!(await init())) throw new Error('Acquisti non configurati: imposta RevenueCat e usa Android/iOS');
    const offerings = await sdk().getOfferings();
    const desired = kind === '3d' ? (config.offering3d || 'fiori_3d') : (config.offering2d || 'fiori_2d');
    const offering = offerings?.all?.[desired] || (offerings?.current?.identifier === desired ? offerings.current : null);
    if (!offering) throw new Error('Offerta '+desired+' non configurata in RevenueCat');
    const pack = offering.lifetime || offering.availablePackages?.find(p => p.packageType === 'LIFETIME') || offering.availablePackages?.[0];
    if (!pack) throw new Error('Prodotto non disponibile per '+desired);
    const purchase = await sdk().purchasePackage({ aPackage: pack });
    apply(purchase?.customerInfo);
    if (!rights[kind]) {
      await refresh();
    }
    if (!rights[kind]) throw new Error('Acquisto effettuato ma diritto '+entName(kind)+' non attivo: verifica RevenueCat');
    return true;
  }
  async function restore() {
    if (!(await init())) throw new Error('Ripristino disponibile soltanto nell’app con RevenueCat configurato');
    const restored = await sdk().restorePurchases();
    apply(restored?.customerInfo);
    await refresh();
    return { ...rights };
  }
  window.PetaliCommerce = Object.freeze({
    platform, init, refresh, buy, restore,
    has: kind => Boolean(rights[kind]),
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); }
  });
})();
