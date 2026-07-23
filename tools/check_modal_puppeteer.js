const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r=>setTimeout(r, ms));
(async ()=>{
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  page.on('console', m=>{ try{ console.log('PAGE:', m.text()) }catch(e){} });
  await page.goto('http://127.0.0.1:3847/', {waitUntil:'networkidle2', timeout: 120000});
  // call UI functions if present
  await page.evaluate(()=>{ try{ if(window.openTokenModal) openTokenModal('skp64-pvt01'); }catch(e){} });
  // wait until the element becomes visible in the UI (display !== 'none')
  try{
    await page.waitForFunction(() => {
      const btn = document.getElementById('tokenModalDisconnectBtn');
      return btn && window.getComputedStyle(btn).display !== 'none';
    }, {timeout: 10000});
  }catch(e){ /* ignore */ }
  const visible = await page.evaluate(()=>{
    const btn = document.getElementById('tokenModalDisconnectBtn');
    if(!btn) return {found:false};
    const s = window.getComputedStyle(btn);
    return {found:true, display: s.display, visibility: s.visibility, opacity: s.opacity, visible: (s.display!=='none' && s.visibility!=='hidden' && parseFloat(s.opacity||1)>0)};
  });
  console.log('RESULT', visible);
  await browser.close();
})();
