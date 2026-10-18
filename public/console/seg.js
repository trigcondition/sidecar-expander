// Choice groups (segmented toggles) on the Sound tab: the device's CURRENT state, a click's pending state, the
// confirmation. Pure (no DOM): shared by app.js, rec.js and node web/seg.test.mjs.
//   Pending: one outstanding change per key. start(key, want) -> the click; report(key, actual) -> the device's
//   answer: it matches = confirmed (the UI follows the device), anything else is ignored until the timeout; fail(key,
//   msg) = the device refused. timeout / refusal: reverted, with a short message.
export class Pending {
  // on(key, kind, text): kind "pending" | "ok" | "err"
  constructor(on, { ms = 2000, set = (f, t) => setTimeout(f, t), clear = (h) => clearTimeout(h) } = {}) {
    this.on = on; this.ms = ms; this.set = set; this.clear = clear; this.p = new Map();
  }
  has(key) { return this.p.has(key); }
  want(key) { return this.p.has(key) ? this.p.get(key).want : undefined; }
  start(key, want) {
    this.drop(key);
    const t = this.set(() => { this.p.delete(key); this.on(key, "err", "no answer from the device, not changed"); }, this.ms);
    this.p.set(key, { want: String(want), t });
    this.on(key, "pending", "");
  }
  drop(key) { const q = this.p.get(key); if (q) { this.clear(q.t); this.p.delete(key); } }
  report(key, actual, okText = "saved ✓") {   // true when it confirmed a pending change
    const q = this.p.get(key);
    if (!q || String(actual) !== q.want) return false;
    this.drop(key);
    this.on(key, "ok", okText);
    return true;
  }
  fail(key, text) { if (this.p.has(key)) { this.drop(key); this.on(key, "err", text); return true; } return false; }
  failAll(text) { for (const k of [...this.p.keys()]) this.fail(k, text); }
}

// The console's answers (voiceloop.ino console_line, usb_host.h) as state. {state: {...}, periodic, reject: [keys]}
// or null. state keys: notes (bool), out ("main"|"tracks"), mac (bool), fifo (n), mach ({voice: name}), machOk (voice).
export function parseDevState(line) {
  let m;
  const r = (state, extra) => ({ state, periodic: false, ...extra });
  if ((m = /^midi notes \d+, channels [0-9a-f]+, MIDI notes (on|off)/.exec(line))) return r({ notes: m[1] === "on" }, { periodic: true });
  if ((m = /^MIDI notes (on|off): voices 0\.\.7 play ((?:\S+ ?)+)$/.exec(line))) {
    const mach = {};
    m[2].trim().split(/\s+/).forEach((n, v) => { mach[v] = n; });
    return r({ notes: m[1] === "on", mach });
  }
  if ((m = /^MIDI notes (on|off)\b/.exec(line))) return r({ notes: m[1] === "on" });
  if ((m = /^notes: voice (\d) plays (\S+)/.exec(line))) return r({ mach: { [m[1]]: m[2] } });
  if (/^notes: no machine /.test(line)) return { state: {}, periodic: false, reject: ["mach"], text: "no such machine" };
  if ((m = /^output: (main|tracks)\b/.exec(line))) return r({ out: m[1] });
  if (/^output: the host build/.test(line)) return { state: {}, periodic: false, reject: ["out"], text: "host build only" };
  if ((m = /^uac2: .*Overbridge inputs (on|off)\b/.exec(line))) return r({ mac: m[1] === "on" });
  if (/^uac2: not in this build/.test(line)) return { state: {}, periodic: false, reject: ["mac"], text: "not in this build" };
  if ((m = /^usb host: FIFO target (\d+) frames/.exec(line))) return r({ fifo: +m[1] });
  if ((m = /fifo \d+ \(min \d+ max \d+ target (\d+)\)/.exec(line))) return r({ fifo: +m[1] }, { periodic: true });
  if (/^console: unknown command "(out|mac|fifo)\b/.test(line)) {
    const k = /^console: unknown command "(\w+)/.exec(line)[1];
    return { state: {}, periodic: false, reject: [k], text: "not in this firmware" };
  }
  return null;
}
