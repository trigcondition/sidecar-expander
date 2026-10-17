// The page: one WebSerial port, the log, the console lines (voiceloop.ino console_line).
import { StreamParser, parseStatus } from "./stream.js";

const $ = (id) => document.getElementById(id);
const TEENSY = { usbVendorId: 0x16c0 }; // PJRC
const MAX_LINES = 3000;
const mock = new URLSearchParams(location.search).has("mock");

let port = null, reader = null, wanted = null; // wanted: the last port's {usbVendorId, usbProductId}
let paused = false, held = [];

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
  if (!cls) usbmodeLine(text);
  if (!cls) Object.entries(parseStatus(text)).forEach(([k, v]) => {
    const el = document.querySelector(`#status [data-k="${k}"]`);
    if (el) el.textContent = v;
  });
  if (paused) { held.push([text, cls]); return; }
  show(text, cls);
}
function show(text, cls) {
  const log = $("log");
  const div = document.createElement("div");
  div.textContent = text;
  if (cls) div.className = cls;
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
  if (usbmodePending) setTimeout(() => send("usbmode"), 300);   // back after a mode change: confirm it
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
}

async function send(line) {
  line = line.trim();
  if (!line) return;
  if (line.startsWith(":")) line = line.slice(1);
  if (line.length > 63) { addLine(`not sent: over 63 characters`, "bad"); return; }
  if (!port || !port.writable) { addLine(`not connected: ${line}`, "bad"); return; }
  const w = port.writable.getWriter();
  addLine("> :" + line, "me");
  try {
    await w.write(new TextEncoder().encode(":" + line + "\n"));
  } catch (e) {
    addLine(`write: ${e.message}`, "bad");
  } finally {
    w.releaseLock();
  }
}

// --- controls ------------------------------------------------------------
document.querySelectorAll("[data-cmd]").forEach((b) => (b.onclick = () => send(b.dataset.cmd)));
for (let v = 0; v < 8; ++v) $("mvoice").add(new Option(`voice ${v}`, v));
$("mset").onclick = () => send(`notemach=${$("mvoice").value}:${$("mname").value}`);
$("fifoset").onclick = () => send(`fifo=${$("fifo").value | 0}`);
$("usbmode").onchange = () => { usbmodePending = true; $("usbmodestate").textContent = "re-enumerating…"; send(`usbmode=${$("usbmode").value}`); };
$("send").onclick = () => { send($("cmd").value); $("cmd").select(); };
$("cmd").onkeydown = (e) => { if (e.key === "Enter") $("send").click(); };
$("disconnect").onclick = () => close(true);

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
