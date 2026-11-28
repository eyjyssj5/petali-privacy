import {writeFileSync} from 'node:fs';
const url=(process.env.PETALI_SUPABASE_URL||'').trim().replace(/\/$/,'');
const key=(process.env.PETALI_SUPABASE_PUBLISHABLE_KEY||'').trim();
if(Boolean(url)!==Boolean(key))throw Error('Petali wallet requires both project URL and publishable key');
if(url&&(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)||!/^sb_publishable_[a-zA-Z0-9_-]+$/.test(key)))throw Error('Invalid public Petali wallet configuration; never use a service-role key');
writeFileSync(new URL('../gioco/wallet-config.js',import.meta.url),'window.PetaliWalletConfig='+JSON.stringify({url,key})+';\n');
