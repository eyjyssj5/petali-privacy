/* PETALI: Android usa Google Play Billing; iOS mantiene RevenueCat.
   Nessun diritto premium viene concesso nel browser o prima della conferma dello store. */
(function () {
  'use strict';
  const config = window.PetaliPayments || {};
  let started = null;
  let rights = { '2d': false, '3d': false };
  const listeners = new Set();
  const platform = () => window.PetaliNative?.platform || window.Capacitor?.getPlatform?.() || 'web';
  const sdk = () => window.PetaliNative?.Purchases || window.Capacitor?.Plugins?.Purchases;
  const play = () => window.PetaliNative?.Billing || window.Capacitor?.Plugins?.PetaliBilling;
  const key = () => config.ios;
  const productId = kind => kind === '3d' ? (config.androidProduct3d || 'fiori_3d') : (config.androidProduct2d || 'fiori_2d');
  const entName = kind => kind === '3d' ? (config.entitlement3d || 'fiori_3d') : (config.entitlement2d || 'fiori_2d');
  const validKey = s => typeof s === 'string' && /^(appl_|test_)/.test(s) && s.length > 12 && !/INSERISCI_|YOUR_|TODO/i.test(s);
  function emit() { for (const fn of listeners) { try { fn({ ...rights }); } catch (_) {} } }
  function apply(info) {
    const active = info?.entitlements?.active || {};
    rights = {
      '2d': Boolean(active[entName('2d')] || active[config.entitlementLegacy2d || 'sblocco']),
      '3d': Boolean(active[entName('3d')])
    };
    emit();
  }
  function applyPlay(result) {
    const purchased = new Set(Array.isArray(result?.purchased) ? result.purchased : []);
    rights = {
      '2d': purchased.has(productId('2d')) || purchased.has(config.androidProductLegacy2d || 'sblocco'),
      '3d': purchased.has(productId('3d'))
    };
    emit();
  }
  const ready = () => platform() === 'android' ? Boolean(play()) : platform() === 'ios' && Boolean(sdk()) && validKey(key());
  async function init() {
    if (!ready()) return false;
    if (platform() === 'android') return true;
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
      if (platform() === 'android') {
        applyPlay(await play().getPurchases());
      } else {
        const response = await sdk().getCustomerInfo();
        apply(response.customerInfo);
      }
    } catch (e) {
      rights = { '2d': false, '3d': false };
      emit();
      throw e;
    }
    return { ...rights };
  }
  async function product(kind) {
    if (!['2d','3d'].includes(kind)) throw new Error('Tipo di acquisto non valido');
    if (!(await init())) throw new Error('Gli acquisti non sono disponibili in questa versione di prova. I fiori gratuiti restano utilizzabili.');
    if (platform() === 'android') return { productId: productId(kind) };
    const offerings = await sdk().getOfferings();
    const desired = kind === '3d' ? (config.offering3d || 'fiori_3d') : (config.offering2d || 'fiori_2d');
    const offering = offerings?.all?.[desired] || (offerings?.current?.identifier === desired ? offerings.current : null);
    if (!offering) throw new Error('Offerta ' + desired + ' non configurata in RevenueCat');
    // PETALI vende sblocchi permanenti, non abbonamenti.
    const pack = offering.lifetime || offering.availablePackages?.find(p => p.packageType === 'LIFETIME');
    if (!pack) throw new Error('Pacchetto Lifetime non disponibile per ' + desired);
    return pack;
  }
  async function buy(kind) {
    const pack = await product(kind);
    if (platform() === 'android') {
      await play().purchase({ productId: pack.productId });
      await refresh();
    } else {
      const purchase = await sdk().purchasePackage({ aPackage: pack });
      apply(purchase?.customerInfo);
      if (!rights[kind]) await refresh();
    }
    if (!rights[kind]) throw new Error('Acquisto non confermato da ' + (platform() === 'android' ? 'Google Play' : 'RevenueCat'));
    return true;
  }
  async function restore() {
    if (!(await init())) throw new Error('Ripristino non disponibile in questa versione di prova.');
    if (platform() === 'android') {
      return refresh();
    }
    const restored = await sdk().restorePurchases();
    apply(restored?.customerInfo);
    await refresh();
    return { ...rights };
  }
  window.PetaliCommerce = Object.freeze({
    platform, ready, init, refresh, product, buy, restore,
    has: kind => Boolean(rights[kind]),
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); }
  });
})();
