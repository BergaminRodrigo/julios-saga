// Headless Chrome smoke test via CDP. Boots the game, collects console
// messages + exceptions, optionally clicks, and screenshots.
// Usage: node tools/cdp_check.mjs <url> <outPng> [clicksJSON]
const [url, out, clicksRaw] = process.argv.slice(2);
const clicks = clicksRaw ? JSON.parse(clicksRaw) : [];

async function targets() {
  const r = await fetch('http://127.0.0.1:9222/json');
  return r.json();
}
let id = 0;
const pending = new Map();
function send(ws, method, params = {}) {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise(res => pending.set(mid, res));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const list = (await targets()).filter(t => t.type === 'page');
const page = list.find(t => t.url.includes('127.0.0.1:8080')) || list[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
const logs = [], errors = [];
await new Promise(r => ws.addEventListener('open', r));
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    const txt = (m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ');
    logs.push(`[${m.params.type}] ${txt}`);
    if (m.params.type === 'error') errors.push(txt);
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    errors.push('EXCEPTION: ' + (d.exception?.description || d.text));
  }
});
await send(ws, 'Runtime.enable');
await send(ws, 'Page.enable');
await send(ws, 'Log.enable');
const VK = { ArrowRight:39, ArrowLeft:37, ArrowUp:38, ArrowDown:40, Space:32, KeyJ:74 };
async function key(type, code) {
  await send(ws, 'Input.dispatchKeyEvent', {
    type, key: code === 'Space' ? ' ' : code.replace('Key',''), code,
    windowsVirtualKeyCode: VK[code], nativeVirtualKeyCode: VK[code],
  });
}
await send(ws, 'Page.navigate', { url });
await sleep(3500);
for (const c of clicks) {
  if (c.click) {
    await send(ws, 'Input.dispatchMouseEvent', { type:'mousePressed',  x:c.click.x, y:c.click.y, button:'left', clickCount:1 });
    await send(ws, 'Input.dispatchMouseEvent', { type:'mouseReleased', x:c.click.x, y:c.click.y, button:'left', clickCount:1 });
  } else if (c.hold) {
    await key('keyDown', c.hold);
    if (c.tap) { await key('keyUp', c.hold); }       // single tap
    else { await sleep(c.ms || 1000); await key('keyUp', c.hold); }
  }
  await sleep(c.wait || 1000);
}
const shot = await send(ws, 'Page.captureScreenshot', { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('CONSOLE:', logs.length);
console.log('ERRORS :', errors.length);
errors.slice(0, 20).forEach(e => console.log('  !', e));
ws.close();
process.exit(errors.length ? 1 : 0);
