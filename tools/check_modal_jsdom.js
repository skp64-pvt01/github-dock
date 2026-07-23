const fs = require('fs');
const {JSDOM} = require('jsdom');
const fetch = require('node-fetch');

(async ()=>{
  try{
    const html = await fetch('http://127.0.0.1:3847/').then(r=>r.text());
    const dom = new JSDOM(html, {runScripts: "dangerously", resources: "usable", url: 'http://127.0.0.1:3847/'});
    // wait for scripts to load
    await new Promise(r=>setTimeout(r, 800));
    const win = dom.window;
    // Try to interact with the UI functions if available
    if(typeof win.openAccountManager === 'function'){
      try{ win.openAccountManager(); } catch(e){}
    }
    await new Promise(r=>setTimeout(r, 200));
    if(typeof win.openSetupView === 'function'){
      try{ win.openSetupView('skp64-pvt01'); } catch(e){}
    }
    await new Promise(r=>setTimeout(r, 200));
    if(typeof win.openTokenModal === 'function'){
      try{ win.openTokenModal('skp64-pvt01'); } catch(e){}
    }
    await new Promise(r=>setTimeout(r, 400));
    const btn = dom.window.document.getElementById('tokenModalDisconnectBtn');
    if(!btn) { console.log('MISSING'); process.exit(2); }
    const style = dom.window.getComputedStyle(btn);
    const visible = style && style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null;
    console.log('VISIBLE', visible);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(3);
  }
})();
