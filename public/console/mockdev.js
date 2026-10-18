// A fake Teensy for the page (index.html?mock) and the tests: the console lines in the firmware's wording
// (voiceloop.ino console_line, usb_host.h) and the web console protocol (webui.h): the plugin store, the slots,
// the memory map and an SD card in memory. No DOM. Timing: `rate` KB/s per direction (0 = no delay, tests).
import { crc32, b64encode, FRAME_MAX } from "./proto.js";

const NAMES = "plaits juno daisy dsps grain dd fm".split(" ");
const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");

// A minimal valid package: header, an image with the plugin table first, no relocations, a format-2 manifest head.
export function makeRmp({ id, name, version = 0x010000, image = 4096, bss = 8, state = 32, cpu = 25, api = 1 }) {
  const man = new Uint8Array(64);
  man.set(new TextEncoder().encode(name.slice(0, 10)));
  const img = new Uint8Array(image);
  const iv = new DataView(img.buffer);
  iv.setUint32(0, 0x504d5252, true); iv.setUint32(4, api, true); iv.setUint32(8, state, true); iv.setUint32(12, cpu, true);
  for (let i = 64; i < image; ++i) img[i] = (i * 7) & 0xff;
  const b = new Uint8Array(96 + image + man.length);
  const dv = new DataView(b.buffer);
  dv.setUint32(0, 0x31504d52, true); dv.setUint16(4, 2, true); dv.setUint16(6, 1, true);
  b.set(new TextEncoder().encode(id), 8);
  dv.setUint32(40, version, true); dv.setUint32(48, image, true); dv.setUint32(52, bss, true);
  dv.setUint32(56, 0, true); dv.setUint32(60, 0, true); dv.setUint32(64, man.length, true);
  b.set(img, 96); b.set(man, 96 + image);
  dv.setUint32(72, crc32(b.subarray(96)), true);
  return b;
}

function noise(n, seed) {
  const b = new Uint8Array(n);
  let x = seed | 1;
  for (let i = 0; i < n; ++i) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; b[i] = x & 0xff; }
  return b;
}

export class MockDevice {
  constructor(say, { rate = 450, framed = false, psram = false, oldRytm = false, now = () => Date.now() } = {}) {
    this.say = say;          // (line) -> void
    this.rate = rate;
    this.framed = framed;
    this.transport = false;
    this.old = oldRytm;      // a Rytm build without 0030-fx-in: never answers the fxin 26
    this.st = { notes: false, out: "tracks", fifo: 256, mac: true, usbmode: "multi", mach: Array(8).fill("plaits") };
    this.inbuf = new Uint8Array(0);
    this.now = now;
    // the recorder (rec_mini.h): stereo in a 32 KB ring without PSRAM, stems with it
    this.rec = { state: 0, arm: false, psram, mask: [0], bits: 24, prefix: "take", take: "", t0: 0, frames: 0, n: 0, error: "" };
    this.fs = new Map();
    const dir = (p) => this.fs.set(p, { dir: true, m: "2026-10-12 09:30" });
    const file = (p, data) => this.fs.set(p, { dir: false, data, m: "2026-10-14 21:05" });
    ["/", "/Samples", "/Samples/Kicks", "/Samples/Snares", "/Samples/Loops", "/MACHINES", "/PRESETS", "/PRESETS/rytm.sine_test", "/.rytm", "/.rytm/slots"].forEach(dir);
    file("/Samples/Kicks/BD Deep 01.wav", noise(88244, 1));
    file("/Samples/Kicks/BD Tight 02.wav", noise(41000, 2));
    file("/Samples/Snares/SD Crack.wav", noise(61210, 3));
    file("/Samples/Loops/Break 120bpm.wav", noise(1411244, 4));
    file("/PRESETS/rytm.sine_test/Soft.txt", new TextEncoder().encode("P1 40\nP2 64\n"));
    file("/.rytm/env", new TextEncoder().encode("hash=0123456789abcdef\nversion=4\n"));
    file("/.rytm/slots/MYPROJECT.txt", new TextEncoder().encode("U1 rytm.sine_test 1.0.0\n"));
    file("/Notes für Sidecar.txt", new TextEncoder().encode("ünïcode name\n"));
    this.store = new Map();
    for (const p of [
      { id: "rytm.sine_test", name: "SINE TEST", image: 4080, state: 32, cpu: 25 },
      { id: "befaco.np.atari", name: "NP ATARI", image: 6460, state: 3264, cpu: 20 },
      { id: "rytm.big_test", name: "BIG TEST", image: 30720, bss: 4096, state: 24000, cpu: 120, api: 2 },
    ]) this.store.set(p.id, makeRmp(p));
    this.slots = [{ id: "rytm.sine_test", ver: "1.0.0" }, { id: "" }, { id: "befaco.np.missing", ver: "1.0.0" }, { id: "" }, { id: "" }];
    this.xfer = null;
    this.cardTotal = 31914983424;
    this.cardUsed = 2147483648;
  }
  later(fn, bytes = 0) {
    const ms = this.rate ? Math.max(0.5, (bytes / 1024 / this.rate) * 1000) : 0;
    if (!ms) return fn();
    setTimeout(fn, ms);
  }
  // as the firmware: names and paths as byte strings (UTF-8 bytes as \u00XX)
  j(o) {
    const bs = (x) => String.fromCharCode(...new TextEncoder().encode(x));
    if (typeof o.n === "string") o = { ...o, n: bs(o.n) };
    if (typeof o.p === "string") o = { ...o, p: bs(o.p) };
    // and every non-ASCII code unit escaped (the log parser keeps printable ASCII only), as webui.h wj_str
    this.say("@" + JSON.stringify(o).replace(/[\u007f-\uffff]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")));
  }

  feed(bytes) {
    const b = new Uint8Array(this.inbuf.length + bytes.length);
    b.set(this.inbuf); b.set(bytes, this.inbuf.length);
    let i = 0;
    while (i < b.length) {
      if (b[i] === 0x3a) {   // ':' line
        const e = b.indexOf(0x0a, i);
        if (e < 0) break;
        this.console(new TextDecoder().decode(b.subarray(i + 1, e)).replace(/\r$/, ""));
        i = e + 1;
      } else if (b[i] === 0x59) {   // 'Y' frame
        if (i + 3 > b.length) break;
        const n = b[i + 1] | (b[i + 2] << 8);
        if (n > FRAME_MAX) { ++i; continue; }
        if (i + 7 + n > b.length) break;
        const p = b.slice(i + 3, i + 3 + n);
        const c = new DataView(b.buffer, b.byteOffset + i + 3 + n, 4).getUint32(0, true);
        this.frame(p, crc32(p) === c);
        i += 7 + n;
      } else ++i;
    }
    this.inbuf = b.slice(i);
  }

  console(p) {
    const st = this.st, say = this.say;
    let m;
    if (p === "mem") return this.later(() => this.mem());
    if (p === "df") return this.later(() => this.j({ t: "df", st: "ok", total_kb: Math.floor(this.cardTotal / 1024), free_kb: Math.floor((this.cardTotal - this.used()) / 1024), type: "exFAT", ms: 412 }), 4096);
    if (p === "plugins") return this.plugins();
    if (p === "rec" || p.startsWith("rec=")) return this.recCmd(p);
    if (p === "fxin" || /^fxin=[01?]$/.test(p)) return this.fxinCmd(p);
    if (p.startsWith("plugin=")) return this.pluginCmd(p.slice(7));
    if ((m = /^notemach=([0-7]):(.*)$/.exec(p))) {
      if (NAMES.includes(m[2])) { st.mach[m[1]] = m[2]; say(`notes: voice ${m[1]} plays ${m[2]}`); }
      else say(`notes: no machine "${m[2]}" (${NAMES.join(" ")})`);
    } else if (p.startsWith("notes=")) { st.notes = p[6] === "1"; say(`MIDI notes ${st.notes ? "on" : "off"}`); }
    else if (p === "out=main" || p === "out=tracks" || p === "out") { if (p[3]) st.out = p.slice(4); say(`output: ${st.out}`); }
    else if (/^fifo(=|$)/.test(p)) { if (p[4]) st.fifo = Math.max(24, Math.min(parseInt(p.slice(5)) || 0, 992)); say(`usb host: FIFO target ${st.fifo} frames`); }
    else if (/^usbmode(=|$)/.test(p)) {
      const desc = { multi: "(Serial + MIDI + audio 20 in / 12 out)", stereo: "(Serial + MIDI + audio 2 in / 2 out)", off: "(Serial + MIDI, no audio)" };
      const v = p.slice(8);
      if (!p[7]) say(`usb: mode ${st.usbmode} ${desc[st.usbmode]}`);
      else if (!desc[v]) say(`usb: no mode "${v}" (multi, stereo, off)`);
      else if (v === st.usbmode) say(`usb: mode ${v} (unchanged) ${desc[v]}`);
      else { st.usbmode = v; say(`usb: mode ${v}, re-enumerating (the serial port goes away for about a second)`); setTimeout(() => say(`usb: mode ${v} ${desc[v]}`), 1500); }
    }
    else if (/^mac(=|$)/.test(p)) { if (p[3]) st.mac = p.slice(4) === "on"; say(`uac2: the computer's OUT 1..12 to the Rytm's Overbridge inputs ${st.mac ? "on" : "off"} (MAIN L/R, MAIN FX L/R, BD SD RS BT LT MT CH CY)`); }
    else if (p === "notes") say(`MIDI notes ${st.notes ? "on" : "off"}: voices 0..7 play ${st.mach.join(" ")}`);
    else say(`console: unknown command "${p}" (notes=1|0, notemach=V:NAME, notes, out=main|tracks, out, fifo=N, fifo, cap=MS, mac=on|off, usbmode=multi|stereo|off, mem, df, plugins, plugin=...)`);
  }

  // IN L/R source (core::fxin): ?old = a Rytm without 0030 (never answers); else it answers the 26 after 200 ms
  fxinCmd(p) {
    const f = this.fxin || (this.fxin = { want: 0, rytm: this.old ? -1 : 0 });
    if (p[4] === "=" && p[5] !== "?") {
      f.want = +p[5];
      if (f.rytm >= 0) setTimeout(() => { f.rytm = f.want; }, 200);
    }
    const state = f.rytm === 1 ? "on" : f.rytm === 0 ? "off" : "unsupported";
    this.say(`fxin: IN L/R source ${f.want ? "FX return" : "inputs"}, the Rytm ${state}`);
    this.j({ t: "fxin", fxin: { want: f.want, state, rytm: f.rytm } });
  }

  recJson() {
    const r = this.rec, stems = r.mask.length > 1;
    if (r.state === 2) r.frames = Math.floor(((this.now() - r.t0) / 1000) * 48000);
    const fb = (r.bits / 8) * (stems ? 12 : 2), ringKB = r.psram ? (stems ? 64 : 768) : 16;
    const free = Math.floor((this.cardTotal - this.used()) / 1048576) - (r.state >= 2 ? Math.floor((r.frames * fb) / 1048576) : 0);
    const pk = (id) => (r.state && r.mask.includes(id) ? Math.floor(200 + Math.random() * 600) : 0);
    this.j({ t: "rec", state: r.state, arm: r.arm ? 1 : 0, ready: 1, psram: r.psram ? 1 : 0, maxs: r.psram ? 14 : 2, bits: r.bits,
      mode: stems ? "stems" : "stereo", prefix: r.prefix, take: r.take, ch: r.mask, frames: r.frames, bytes: Math.floor((r.frames * fb) / 1024),
      drops: 0, silence: 0, cardKBps: r.frames ? 9800 : 0, needKBps: Math.floor((fb * 48000) / 1024), worstWriteMs: r.frames ? 6 : 0, worstWriteUs: r.frames ? 6200 : 0,
      writes: Math.floor((r.frames * fb) / (r.psram ? 16384 : 4096)), busy: Math.floor(r.frames / 4800), ringMs: Math.floor((ringKB * 1024 * 1000) / (48000 * (r.bits / 8) * (stems ? 1 : 2))),
      ringKB, blockKB: r.psram ? 16 : 4, ringMax: r.frames ? 31 : 0, freeMB: free, totalMB: Math.floor(this.cardTotal / 1048576), error: r.error,
      peak: Array.from({ length: 13 }, (_, i) => pk(i)) });
  }
  recStart() {
    const r = this.rec;
    r.n += 1;
    r.take = `${r.prefix}_${String(r.n).padStart(3, "0")}`;
    r.state = 2; r.t0 = this.now(); r.frames = 0; r.error = "";
    this.fs.set("/Recordings", { dir: true, m: "2026-10-18 20:00" });
    this.fs.set("/Recordings/" + r.take, { dir: true, m: "2026-10-18 20:00" });
    this.say(`rec: ${r.take} started: ${r.mask.length > 1 ? 12 : 1} files, ${r.bits}-bit`);
  }
  recEnd() {
    const r = this.rec;
    if (r.state < 2) return;
    r.frames = Math.floor(((this.now() - r.t0) / 1000) * 48000);
    const names = r.mask.map((id) => `${String(id).padStart(2, "0")}_${["MASTER", "MAIN_L", "MAIN_R", "BD", "SD", "RS-CP", "BT", "LT", "MT-HT", "CH-OH", "CY-CB", this.fxin?.rytm === 1 ? "FX_L" : "IN_L", this.fxin?.rytm === 1 ? "FX_R" : "IN_R"][id]}.wav`);
    for (const n of names) this.fs.set(`/Recordings/${r.take}/${n}`, { dir: false, data: new Uint8Array(512), m: "2026-10-18 20:01" });
    this.say(`rec: ${r.take} stopped: ${r.frames} frames`);
    r.state = r.arm ? 1 : 0;
  }
  recCmd(p) {
    const r = this.rec, v = p.slice(4);
    let err = "";
    if (p === "rec") return this.recJson();
    if (v === "start") { if (r.state >= 2) err = "a take is running"; else { r.arm = false; this.recStart(); } }
    else if (v === "arm") { if (r.state >= 2) err = "a take is running"; else { r.arm = true; r.state = 1; } }
    else if (v === "stop") { r.arm = false; if (r.state === 1) r.state = 0; else this.recEnd(); }
    else if (r.state) err = "busy: stop first";
    else if (v === "mode:stereo") r.mask = [0];
    else if (v === "mode:stems") { if (r.psram) r.mask = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; else err = "stems need PSRAM: stereo (MASTER) only on this Teensy"; }
    else if (v === "bits:16" || v === "bits:24") r.bits = +v.slice(5);
    else if (v.startsWith("name:")) { if (/^[A-Za-z0-9_-]{1,24}$/.test(v.slice(5))) r.prefix = v.slice(5); else err = "name: 1..24 of A-Z a-z 0-9 _ -"; }
    else err = "rec=start|stop|arm|mode:stereo|mode:stems|ch:LIST|bits:16|24|name:PREFIX";
    if (err) this.say(`${p}: ${err}`);
    this.say(`rec: ${["idle", "armed", "recording", "finishing"][r.state]}${r.arm ? " (PLAY/STOP)" : ""}, ${r.bits}-bit, prefix ${r.prefix}`);
    this.recJson();
  }
  // the Rytm's PLAY / STOP (the tests; mockTransport in the page)
  recTransport(on) { const r = this.rec; if (r.arm && on && r.state === 1) this.recStart(); else if (r.arm && !on && r.state === 2) this.recEnd(); }

  used() { let n = this.cardUsed; for (const v of this.fs.values()) if (!v.dir) n += v.data.length; return n; }
  storeUsed() { let n = 3 * 65536; for (const b of this.store.values()) n += Math.ceil(b.length / 65536) * 65536; return n; }
  pkgInfo(id, b) {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const image = dv.getUint32(48, true), bss = dv.getUint32(52, true), v = dv.getUint32(40, true);
    const api = dv.getUint32(100, true), state = dv.getUint32(104, true), cpu = dv.getUint32(108, true);
    const name = new TextDecoder().decode(b.subarray(96 + image, 96 + image + 10)).replace(/\0.*$/s, "");
    const why = api > 2 ? "built for a newer plugin API" : image + bss > 32768 ? "code + data over the code arena" : state > 16384 ? "per-voice state over the voice memory (no PSRAM)" : null;
    const slots = this.slots.map((s, i) => (s.id === id ? i + 1 : 0)).filter(Boolean);
    return { t: "plugin", id, size: b.length, ver: `${v >>> 16}.${(v >> 8) & 255}.${v & 255}`, name, api, image, bss, code: image + bss, state, cpu, target: "arm32", slots, fit: !why, status: why ? "no fit" : "ok", ...(why ? { why } : {}) };
  }
  arenaUsed() {
    let n = 0;
    for (const s of this.slots) { const b = s.id && this.store.get(s.id); if (b) { const dv = new DataView(b.buffer, b.byteOffset); n += (dv.getUint32(48, true) + dv.getUint32(52, true) + 7) & ~7; } }
    return n;
  }
  plugins() {
    const ids = [...this.store.keys()];
    let k = 0;
    const step = () => {
      if (k < ids.length) { this.j(this.pkgInfo(ids[k], this.store.get(ids[k]))); ++k; return this.later(step, 2048); }
      this.slots.forEach((s, i) => {
        const b = s.id && this.store.get(s.id);
        this.j({ t: "slot", slot: i + 1, id: s.id, ver: s.id ? s.ver : "0.0.0", state: !s.id ? "EMPTY" : b ? "READY" : "MISSING", name: b ? this.pkgInfo(s.id, b).name : s.id.slice(0, 10),
          src: s.src || (s.id ? "saved" : "none"), updated: !!s.updated, collision: false, unknown: !!s.unknown, mixed: false,
          want_fp: s.want_fp || 0, want_n: 0, want_id: s.id, want_ver: s.id ? s.ver : "0.0.0", want_name: s.want_name || "", fp: 0 });
      });
      this.j({ t: "plugins", n: ids.length, more: 0, prints: "rytm", fresh: false, project: "MYPROJECT", arena: [32768, this.arenaUsed()], state_limit: 16384, store: [4194304, 4194304 - this.storeUsed()], api: 2, safe_mode: false, transport: this.transport });
    };
    this.later(step, 1024);
  }
  pluginCmd(a) {
    let m;
    const pl = (o) => this.later(() => this.j({ t: "pl", ...o }));
    if (a === "rescan") return pl({ op: "rescan", st: "ok" });
    if ((m = /^del:(.+)$/.exec(a))) {
      if (this.transport) return pl({ op: "del", id: m[1], st: "err", why: "STOP TO INSTALL: the transport runs" });
      if (!this.store.delete(m[1])) return pl({ op: "del", id: m[1], st: "err", why: "cannot remove" });
      this.say(`plugins: removed ${m[1]}`);
      return pl({ op: "del", id: m[1], st: "ok" });
    }
    if ((m = /^(set|clr):([1-5])(?::(.*))?$/.exec(a))) {
      const id = m[1] === "set" ? m[3] || "" : "";
      const b = id && this.store.get(id);
      if (id && !b) return pl({ op: "set", slot: +m[2], id, st: "err", why: "not installed" });
      this.slots[m[2] - 1] = id ? { id, ver: this.pkgInfo(id, b).ver, src: "saved" } : { id: "", src: "empty" };
      this.say(id ? `plugins: U${m[2]} = ${id} ${this.pkgInfo(id, b).ver} (/.rytm/slots/MYPROJECT.txt)` : `plugins: U${m[2]} cleared (/.rytm/slots/MYPROJECT.txt)`);
      return pl({ op: "set", slot: +m[2], id, st: "ok" });
    }
    if ((m = /^put:([1-5]):([^:]{1,31}):(\d+\.\d+\.\d+)(?::(.{0,10}))?$/.exec(a))) {   // an imported entry (webui.h)
      const id = m[2] === "-" ? "" : m[2];
      this.slots[m[1] - 1] = id ? { id, ver: m[3], src: "imported", want_name: m[4] || "" } : { id: "", src: "empty" };
      this.say(`plugins: U${m[1]} = ${id || "-"} (imported)`);
      return pl({ op: "put", slot: +m[1], id, st: "ok", ...(id ? { installed: this.store.has(id) } : {}) });
    }
    if (a === "empty") {
      this.slots = this.slots.map(() => ({ id: "", src: "empty" }));
      return pl({ op: "empty", st: "ok" });
    }
    pl({ st: "err", why: "plugin=rescan | del:ID | set:U:ID | clr:U | put:U:ID:a.b.c[:NAME] | empty" });
  }
  mem() {
    const r = (k, size, used, x = {}) => this.j({ t: "mem", k, size, used, ...x });
    r("itcm", 131072, 129048, { blocks: 4 });
    r("dtcm", 393216, 310272, { stack_free: 82200, stack_size: 82944 });
    r("ocram", 524288, 506176, { static: 506176, heap: 0 });
    r("flash", 8126464, 492540);
    r("store", 4194304, this.storeUsed(), { mounted: true, pkg_max: 65536 });
    r("arena", 32768, this.arenaUsed());
    r("state", 16384, 0, { voice: 16384, psram: 0 });
    r("psram", 0, 0);
    this.j({ t: "mem", k: "sd", size: 4294967295, size_kb: Math.floor(this.cardTotal / 1024), free_kb: Math.floor((this.cardTotal - this.used()) / 1024), used_kb: Math.floor(this.used() / 1024), type: "exFAT" });
    this.j({ t: "mem_end" });
  }

  frame(p, ok) {
    if (!ok) return this.j({ t: "frame", st: "crc", op: String.fromCharCode(p[0] || 63) });
    const dv = new DataView(p.buffer, p.byteOffset, p.byteLength);
    const str = (a, b) => new TextDecoder().decode(p.subarray(a, b));
    const op = String.fromCharCode(p[0]);
    const X = this.xfer;
    const up = (x, o) => this.j({ t: "up", x, ...o });
    const fs = (o, path, why) => this.j({ t: "fs", op: o, st: why ? "err" : "ok", p: path, ...(why ? { why } : {}) });
    const prot = (q) => q === "/" || q === "/.rytm" || q.startsWith("/.rytm/") || q === "/Samples";
    if (op === "o") {
      const kind = String.fromCharCode(p[1]), id = p[2], size = dv.getUint32(3, true), crc = dv.getUint32(7, true), path = str(11);
      if (X && X.kind === kind && X.id === id && X.size === size && X.crc === crc) return up(id, { st: "open", off: X.off, max: 1024, resume: true });
      this.xfer = null;
      if (this.transport) return up(id, { st: "err", why: "STOP TO WRITE: the transport runs" });
      if (kind === "f") {
        if (prot(path) || path.startsWith("/.rytm/")) return up(id, { st: "err", why: "protected (the engine's own files)" });
        const dir = path.replace(/\/[^/]*$/, "") || "/";
        if (!this.fs.get(dir)?.dir) return up(id, { st: "err", why: "cannot create the file (folder missing?)" });
      } else if (kind === "p") {
        if (size > 65536) return up(id, { st: "err", why: "package over 64 KB (the store's limit)" });
        if (size + 131072 > 4194304 - this.storeUsed()) return up(id, { st: "err", why: "not enough room in the plugin store" });
      } else return up(id, { st: "err", why: "unknown kind" });
      this.xfer = { kind, id, size, crc, path, off: 0, data: new Uint8Array(size), t0: Date.now() };
      return this.later(() => up(id, { st: "open", off: 0, max: 1024 }));
    }
    if (op === "w") {
      const id = p[1], off = dv.getUint32(2, true), d = p.subarray(6);
      if (!X || X.id !== id || X.kind === "g") return up(id, { st: "err", why: "not open" });
      if (this.transport) return up(id, { st: "busy", why: "transport" });
      if (off + d.length <= X.off) return up(id, { st: "ack", off: X.off });
      if (off !== X.off || off + d.length > X.size) return up(id, { st: "want", off: X.off });
      if (X.kind === "p" && off === 0) {
        const hv = new DataView(d.buffer, d.byteOffset, d.byteLength);
        const image = hv.getUint32(48, true), bss = hv.getUint32(52, true), state = hv.getUint32(104, true), api = hv.getUint32(100, true);
        const why = hv.getUint32(0, true) !== 0x31504d52 ? "not a valid .rmp header" : api > 2 ? "built for a newer plugin API" : image + bss > 32768 ? "code + data over the code arena" : state > 16384 ? "per-voice state over the voice memory (no PSRAM)" : null;
        if (why) { this.xfer = null; return up(id, { st: "err", why }); }
      }
      X.data.set(d, off);
      X.off = off + d.length;
      return this.later(() => up(id, { st: "ack", off: X.off }), d.length);
    }
    if (op === "c") {
      if (!X || X.kind === "g") return up(p[1], { st: "err", why: "not open" });
      if (X.off !== X.size) { this.xfer = null; return up(X.id, { st: "err", why: "commit before the end" }); }
      this.xfer = null;
      if (crc32(X.data) !== X.crc) return up(X.id, { st: "err", why: "CRC mismatch: the file differs, nothing kept" });
      const ms = Date.now() - X.t0;
      if (X.kind === "f") this.fs.set(X.path, { dir: false, data: X.data, m: now() });
      else {
        const id = new TextDecoder().decode(X.data.subarray(8, 40)).replace(/\0.*$/s, "");
        this.store.set(id, X.data);
        this.say(`plugins: installed ${id} (commit 912 us, longest write 410 us, ${ms} ms since the begin)`);
      }
      return this.later(() => up(X.id, { st: "done", size: X.size, ms, kbs: Math.round(X.size / 1024 / Math.max(ms, 1) * 1000), ...(X.kind === "p" ? { plugin: true } : {}) }), X.kind === "p" ? 40000 : 0);
    }
    if (op === "a") { const id = X ? X.id : p[1]; this.xfer = null; return up(id, { st: "aborted" }); }
    if (op === "g") {
      const id = p[1], path = str(2), f = this.fs.get(path);
      if (!f || f.dir) return this.j({ t: "dn", x: id, st: "err", why: "cannot open" });
      this.xfer = { kind: "g", id, path, size: f.data.length, data: f.data };
      return this.j({ t: "dn", x: id, st: "open", size: f.data.length, max: this.framed ? 168 : 768 });
    }
    if (op === "r") {
      const id = p[1];
      let off = dv.getUint32(2, true), n = dv.getUint32(6, true);
      if (!X || X.kind !== "g" || X.id !== id) return this.j({ t: "dn", x: id, st: "err", why: "not open" });
      const lim = this.framed ? 168 : 768;
      const step = () => {
        const k = Math.max(0, Math.min(lim, n, X.size - off));
        const d = X.data.subarray(off, off + k);
        this.say(`@d ${id} ${off} ${crc32(d).toString(16).padStart(8, "0")} ${b64encode(d)}`);
        off += k; n -= k;
        if (k && n > 0) this.later(step, k);
      };
      return this.later(step, Math.min(lim, n));
    }
    if (op === "l") {
      const path = str(1), d = this.fs.get(path);
      if (!d || !d.dir) return this.j({ t: "ls_end", p: path, st: "err", why: "not a folder" });
      const pre = path === "/" ? "/" : path + "/";
      const kids = [...this.fs.entries()].filter(([k]) => k !== path && k.startsWith(pre) && !k.slice(pre.length).includes("/"));
      for (const [k, v] of kids) this.j({ t: "ls", n: k.slice(pre.length), s: v.dir ? 0 : v.data.length, d: v.dir ? 1 : 0, m: v.m });
      return this.later(() => this.j({ t: "ls_end", p: path, st: "ok", n: kids.length, more: false }), kids.length * 64);
    }
    if (op === "d" || op === "m" || op === "n") {
      if (this.transport) return fs(op, str(1), "STOP TO WRITE: the transport runs");
      if (op === "d") {
        const path = str(1), f = this.fs.get(path);
        if (prot(path)) return fs("d", path, "protected (the engine's own files)");
        if (!f) return fs("d", path, "cannot remove");
        if (f.dir && [...this.fs.keys()].some((k) => k.startsWith(path + "/"))) return fs("d", path, "not empty, or cannot remove");
        this.fs.delete(path);
        return fs("d", path);
      }
      if (op === "m") {
        const path = str(1);
        if (this.fs.has(path)) return fs("m", path, "cannot make the folder (it exists?)");
        this.fs.set(path, { dir: true, m: now() });
        return fs("m", path);
      }
      const z = p.indexOf(0, 1), a = str(1, z), b = str(z + 1);
      if (prot(a) || prot(b)) return fs("n", a, "protected (the engine's own files)");
      if (this.fs.has(b)) return fs("n", a, "the new name exists");
      if (!this.fs.has(a)) return fs("n", a, "cannot rename");
      for (const [k, v] of [...this.fs.entries()]) if (k === a || k.startsWith(a + "/")) { this.fs.delete(k); this.fs.set(b + k.slice(a.length), v); }
      return fs("n", a);
    }
    this.j({ t: "frame", st: "unknown", op });
  }
}
