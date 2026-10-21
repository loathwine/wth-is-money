// Drive the game in headless Chrome over the DevTools protocol: run JS steps, take screenshots.
// Usage: node tools/drive.js <url> <outdir> <steps.js>
//   steps.js exports an array of { js?: string, wait?: ms, shot?: name, key?: 'e', tap?: [x, y] }
//   PHONE=1 emulates a 390×844 touch phone; a step with full: true screenshots the whole page.
const { spawn } = require('child_process');
const fs = require('fs');
const [url, out, stepsFile] = process.argv.slice(2);
const steps = require(require('path').resolve(stepsFile));
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('google-chrome-stable', ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`,
  '--window-size=1400,950', `--user-data-dir=/tmp/claude-1000/drive-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let tabs;
  for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
    if (d.method === 'Runtime.exceptionThrown') console.log('PAGE EXCEPTION', d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') console.log('console.error', d.params.args.map(a => a.value || a.description).join(' ')); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  const PHONE = !!process.env.PHONE;
  await send('Emulation.setDeviceMetricsOverride', PHONE ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } : { width: 1400, height: 950, deviceScaleFactor: 1, mobile: false });
  if (PHONE) { await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' }); }
  await send('Page.navigate', { url }); await sleep(1500);
  for (const s of steps) {
    if (s.js) { const r = await send('Runtime.evaluate', { expression: s.js, awaitPromise: true, returnByValue: true }); const v = r.result?.result?.value; if (v !== undefined) console.log('>', typeof v === 'string' ? v : JSON.stringify(v)); if (r.result?.exceptionDetails) console.log('EVAL ERROR', r.result.exceptionDetails.exception?.description); }
    if (s.key) for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: s.key, text: s.key });
    if (s.tap) for (const type of ['touchStart', 'touchEnd']) await send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: s.tap[0], y: s.tap[1] }] });
    if (s.wait) await sleep(s.wait);
    if (s.shot) { const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!process.env.PHONE && !!s.full }); fs.writeFileSync(`${out}/${s.shot}.png`, Buffer.from(r.result.data, 'base64')); console.log('shot', s.shot); }
  }
  ws.close(); chrome.kill();
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
