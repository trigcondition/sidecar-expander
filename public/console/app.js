// The page: one WebSerial port, the log, the console lines (voiceloop.ino console_line).
import { StreamParser, parseStatus } from "./stream.js";
import { parseReply } from "./proto.js";
import { Pending, parseDevState } from "./seg.js";
import { Link } from "./link.js";
import { initManage } from "./manage.js";
import { initRec } from "./rec.js";
import { initFxin } from "./fxin.js";

const $ = (id) => document.getElementById(id);
const TEENSY = { usbVendorId: 0x16c0 }; // PJRC
const MAX_LINES = 3000;
const mock = new URLSearchParams(location.search).has("mock");

let port = null, reader = null, wanted = null; // wanted: the last port's {usbVendorId, usbProductId}
let paused = false, held = [];
let recUi = null;   // the Record tab (rec.js), made below
let fxinUi = null;  // the IN L/R source switch (fxin.js), made below

// --- log -----------------------------------------------------------------
// The USB audio mode: a change is sent, the device re-enumerates, the page reconnects and asks again.
let usbmodePending = false;
function usbmodeLine(text) {
  const m = /^usb: mode (multi|stereo|off)\b(.*)$/.exec(text);
  if (!m) return;
  if (/re-enumerating/.test(m[2])) { $("usbmodestate").textContent = "re-enumerating…"; usbmodePending = true; return; }
  $("usbmode").value = m[1];
  $("usbmodestate").textContent = m[2].replace(/^ *\(unchanged\)/, "").trim();
  usbmodePending = false;
}
function addLine(text, cls) {
  if (!cls) {   // the web console's replies ('@', webui.h): to the link; shown only with "replies" ticked, data never
    const o = parseReply(text);
    if (o) {
      if (o.t === "rec" && recUi) recUi.reply(o);
      if (o.t === "fxin" && fxinUi) fxinUi.reply(o);
      link.reply(o);
      if (o.t === "d" || !$("replies").checked) return;
    }
  }
  if (!cls) usbmodeLine(text);
  if (!cls) devLine(text);
  if (!cls) Object.entries(parseStatus(text)).forEach(([k, v]) => {
    const el = document.querySelector(`#status [data-k="${k}"]`);
    if (el) el.textContent = v;
  });
  if (paused) { held.push([text, cls]); return; }
  show(text, cls);
}
const PERIODIC = /^(cpu \d|usb host: ob |midi notes \d)/;   // the 2-second stats lines (the Status tab reads them)
function show(text, cls) {
  const log = $("log");
  const div = document.createElement("div");
  div.textContent = text;
  if (cls) div.className = cls;
  else if (PERIODIC.test(text)) div.className = "stats";
  const f = $("filter").value.toLowerCase();
  if (f && !text.toLowerCase().includes(f)) div.hidden = true;
  const atEnd = log.scrollTop + log.clientHeight >= log.scrollHeight - 4;
  log.appendChild(div);
  while (log.childElementCount > MAX_LINES) log.firstChild.remove();
  if (atEnd) log.scrollTop = log.scrollHeight;
}
$("filter").oninput = () => {
  const f = $("filter").value.toLowerCase();
  for (const d of $("log").children) d.hidden = !!f && !d.textContent.toLowerCase().includes(f);
};
$("pause").onclick = () => {
  paused = !paused;
  $("pause").textContent = paused ? "Resume" : "Pause";
  if (!paused) { held.forEach(([t, c]) => show(t, c)); held = []; }
};
$("showstats").onchange = (e) => $("log").classList.toggle("showstats", e.target.checked);

// --- Sound tab: the device's current state, choice groups that follow it -------------------------------------
// The state is what the console says: "notes" (on/off + the machine of each voice), "out", "mac", "fifo" (asked when
// the connection opens and when the tab shows) and the answer to every change. A click shows a pending state until
// the device's answer confirms it; no answer in 2 s (or a refusal) puts the old state back with a short message.
const dev = { notes: undefined, out: undefined, mac: undefined, fifo: undefined, fxsrc: undefined, mach: {} };
const fbText = (key, kind, text) => {
  const el = document.querySelector(`[data-fb="${key}"]`);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("err", kind === "err");
  clearTimeout(el._t);
  if (kind !== "pending" && text) el._t = setTimeout(() => (el.textContent = ""), kind === "err" ? 5000 : 2500);
};
const pend = new Pending((key, kind, text) => { fbText(key, kind, text); paintDev(); });
function paintDev() {
  document.querySelectorAll(".seg[data-key]").forEach((g) => {
    const k = g.dataset.key, want = pend.want(k), cur = dev[k] === undefined ? undefined : String(dev[k]);
    g.classList.toggle("pending", want !== undefined);
    g.setAttribute("aria-busy", String(want !== undefined));
    g.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-checked", String(cur === b.dataset.val));
      b.classList.toggle("pend", want === b.dataset.val);
      b.tabIndex = cur === b.dataset.val || (cur === undefined && b === g.querySelector("button")) ? 0 : -1;
    });
  });
  const v = $("mvoice").value, m = dev.mach[v];
  $("mcur").textContent = m ? `now: ${m}` : "";
  if (m && !pend.has("mach") && document.activeElement !== $("mname") && [...$("mname").options].some((o) => o.value === m)) $("mname").value = m;
  $("fifocur").textContent = dev.fifo !== undefined ? `now: ${dev.fifo} frames` : "";
  if (dev.fifo !== undefined && !pend.has("fifo") && document.activeElement !== $("fifo")) $("fifo").value = dev.fifo;
}
function devLine(text) {
  const o = parseDevState(text);
  if (!o) return;
  for (const [k, v] of Object.entries(o.state)) {
    if (k === "mach") {
      Object.assign(dev.mach, v);
      const mv = pend.want("mach");
      if (mv !== undefined) { const [vv, nn] = mv.split(":"); if (v[vv] === nn) pend.report("mach", mv); }
    } else if (k === "fifo" && !o.periodic && pend.has(k)) {   // the device may limit the target: its answer is the state
      const asked = pend.want(k);
      dev.fifo = v;
      pend.report(k, asked, String(v) === asked ? undefined : `set to ${v} (the limit)`);
    } else if (!(o.periodic && pend.has(k))) { dev[k] = v; pend.report(k, v); }
  }
  (o.reject || []).forEach((k) => pend.fail(k, o.text));
  paintDev();
}
const askDev = () => ["notes", "out", "mac", "fifo", "usbmode", "fxin"].forEach((c) => send(c, true).catch(() => {}));
function devConnected(on) {
  document.querySelectorAll(".seg[data-key] button, #mset, #fifoset").forEach((b) => (b.disabled = !on));
  if (!on) { pend.failAll("disconnected"); Object.assign(dev, { notes: undefined, out: undefined, mac: undefined, fifo: undefined, fxsrc: undefined, mach: {} }); }
  else askDev();
  paintDev();
}
const devSend = (key, want, line) => {
  pend.start(key, want);
  send(line, true).catch((e) => pend.fail(key, e.message === "not connected" ? "not connected" : "not sent"));
  if (key === "fxsrc") [400, 1500].forEach((ms) => setTimeout(() => fxinUi.poll(), ms));   // the Rytm's 27 comes after the 26
};

// --- tabs: #status, #sound, ... (deep links); the last one remembered ------
const TABS = [...document.querySelectorAll("#tabs a")].map((a) => a.dataset.tab);
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { return null; } };
function showTab(t) {
  if (!TABS.includes(t)) t = "status";
  document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === t));
  document.querySelectorAll(".tab").forEach((d) => d.classList.toggle("on", d.id === "tab-" + t));
  store("sidecar.teensy.tab", t);
  if (t === "log") $("log").scrollTop = $("log").scrollHeight;
  if (t === "record" && recUi) recUi.shown();
  if ((t === "sound" || t === "usb") && port) askDev();
}
window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));
showTab(location.hash.slice(1) || store("sidecar.teensy.tab") || "status");

$("clear").onclick = () => { $("log").textContent = ""; held = []; };

// --- connection ----------------------------------------------------------
function setState(on, text) {
  $("dot").classList.toggle("on", on);
  $("state").textContent = text;
  $("connect").disabled = on;
  $("disconnect").disabled = !on;
}

async function open(p) {
  try {
    await p.open({ baudRate: 115200 }); // USB serial: the rate is ignored
  } catch (e) {
    addLine(`open failed: ${e.message}`, "bad");
    return;
  }
  port = p;
  const info = p.getInfo ? p.getInfo() : {};
  if (info.usbVendorId) wanted = info;
  setState(true, "connected");
  addLine("-- connected", "me");
  readLoop(p);
  manage.connected(true);
  devConnected(true);
  if (usbmodePending) setTimeout(() => send("usbmode").catch(() => {}), 300);   // back after a mode change: confirm it
}

async function readLoop(p) {
  const parser = new StreamParser();
  while (port === p && p.readable) {
    reader = p.readable.getReader();
    let idle = null;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        parser.push(value).forEach((l) => addLine(l));
        clearTimeout(idle); // a partial plain line with nothing after it: shown after 500 ms
        idle = setTimeout(() => parser.push(new Uint8Array(0), true).forEach((l) => addLine(l)), 500);
      }
    } catch (e) {
      if (port === p) addLine(`read: ${e.message}`, "bad");
    } finally {
      clearTimeout(idle);
      reader.releaseLock();
      reader = null;
    }
    if (port === p) break; // the device went away (or a fatal read error)
  }
  if (port === p) await close(false);
}

async function close(byUser) {
  const p = port;
  port = null;
  try { if (reader) await reader.cancel(); } catch {}
  try { if (p) await p.close(); } catch {}
  setState(false, byUser ? "not connected" : "waiting for the device to come back");
  addLine(byUser ? "-- disconnected" : "-- connection lost", byUser ? "me" : "bad");
  if (byUser) wanted = null;
  manage.connected(false);
  devConnected(false);
}

// Every write goes through one queue (a console line never lands inside a frame, and the writer lock is never held twice).
let wq = Promise.resolve();
function write(bytes) {
  const p = wq.then(async () => {
    if (!port || !port.writable) throw new Error("not connected");
    const w = port.writable.getWriter();
    try { await w.write(bytes); } finally { w.releaseLock(); }
  });
  wq = p.catch(() => {});
  return p;
}
async function send(line, quiet = false) {
  line = line.trim();
  if (!line) return;
  if (line.startsWith(":")) line = line.slice(1);
  if (line.length > 63) { addLine(`not sent: over 63 characters`, "bad"); throw new Error("over 63 characters"); }
  if (!port || !port.writable) { if (!quiet) addLine(`not connected: ${line}`, "bad"); throw new Error("not connected"); }
  if (!quiet || $("replies").checked) addLine("> :" + line, "me");
  try {
    await write(new TextEncoder().encode(":" + line + "\n"));
  } catch (e) {
    addLine(`write: ${e.message}`, "bad");
    throw e;
  }
}
const link = new Link({ line: (t) => send(t, true), bytes: write, connected: () => !!(port && port.writable) });
const manage = initManage(link, addLine);
fxinUi = initFxin({ $, send, isTab: () => !!(port && port.writable) && $("tab-sound").classList.contains("on"),
  onChange: (v) => {   // the Rytm's confirmed state: the shared choice group (pend / dev) follows it
    recUi && recUi.names(v.names);
    dev.fxsrc = v.sel || undefined;
    if (v.sel) pend.report("fxsrc", v.sel);
    paintDev();
  } });
recUi = initRec({ $, send, store, isTab: () => !!(port && port.writable) && $("tab-record").classList.contains("on") });

// --- controls ------------------------------------------------------------
document.querySelectorAll(".seg[data-key] button").forEach((b) => (b.onclick = () => devSend(b.closest(".seg").dataset.key, b.dataset.val, b.dataset.cmd)));
document.querySelectorAll(".seg[data-key]").forEach((g) => (g.onkeydown = (e) => {   // radio group: arrows move and choose
  const bs = [...g.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
  const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (i < 0 || !d) return;
  e.preventDefault();
  const n = bs[(i + d + bs.length) % bs.length];
  n.focus(); n.click();
}));
for (let v = 0; v < 8; ++v) $("mvoice").add(new Option(`voice ${v}`, v));
$("mvoice").onchange = paintDev;
$("mset").onclick = () => { const v = $("mvoice").value, n = $("mname").value; devSend("mach", `${v}:${n}`, `notemach=${v}:${n}`); };
$("fifoset").onclick = () => {
  const n = $("fifo").value | 0;
  pend.start("fifo", n);
  send(`fifo=${n}`, true).catch(() => pend.fail("fifo", "not sent"));
};
$("usbmode").onchange = () => { usbmodePending = true; $("usbmodestate").textContent = "re-enumerating…"; send(`usbmode=${$("usbmode").value}`).catch(() => {}); };
$("send").onclick = () => { send($("cmd").value).catch(() => {}); $("cmd").select(); };
$("cmd").onkeydown = (e) => { if (e.key === "Enter") $("send").click(); };
$("disconnect").onclick = () => close(true);
devConnected(false);

const serial = mock ? (await import("./mock.js")).mockSerial(addLine) : navigator.serial;
if (!serial) {
  $("nosupport").style.display = "block";
  $("connect").disabled = true;
} else {
  $("connect").onclick = async () => {
    try { await open(await serial.requestPort({ filters: [TEENSY] })); }
    catch (e) { if (e.name !== "NotFoundError") addLine(`connect: ${e.message}`, "bad"); }
  };
  // Re-enumeration (a reboot, an upload): the same vendor/product comes back.
  serial.addEventListener("connect", (e) => {
    const i = e.target.getInfo ? e.target.getInfo() : {};
    if (!port && wanted && i.usbVendorId === wanted.usbVendorId && i.usbProductId === wanted.usbProductId) open(e.target);
  });
  // A port granted before: no picker needed.
  serial.getPorts().then((ps) => {
    const p = ps.find((x) => (x.getInfo ? x.getInfo() : {}).usbVendorId === TEENSY.usbVendorId);
    if (p && !port) open(p);
  });
}
