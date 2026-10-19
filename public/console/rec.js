// The Record tab: the Sidecar Mini's recorder (teensy/voiceloop/rec_mini.h, docs/recorder-mini.md) over the console's
// rec lines: ':rec' answers @{"t":"rec",...} (polled while the tab shows), ':rec=start|stop|arm|mode:stereo|mode:stems|
// bits:16|24|name:PREFIX' change it. The look follows the Pi page's Record tab (pi/engine/www/index.html).
// The choice groups follow seg.js: the device's state filled, a click pending until the next @rec shows it.
// recModel() is pure (node web/rec.test.mjs); initRec() wires the DOM.

// the sources (core/rec/rec_names.h ids 0..12)
import { Pending } from "./seg.js";

export const REC_SOURCES = ["MASTER", "MAIN L", "MAIN R", "BD", "SD", "RS/CP", "BT", "LT", "MT/HT", "CH/OH", "CY/CB", "IN L", "IN R"];
export const REC_STEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const hms = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const okName = (n) => /^[A-Za-z0-9_-]{1,24}$/.test(n);
const mb = (m) => (m >= 10240 ? `${Math.round(m / 1024)} GB` : m >= 1024 ? `${(m / 1024).toFixed(1)} GB` : `${m} MB`);

// what the tab shows for one reply (r: the @rec object)
export function recModel(r, wantMode = "manual") {
  const st = r.state, rec = st === 2 || st === 3;
  const secs = (r.frames || 0) / 48000;
  const need = r.needKBps || 0;
  const v = {
    busy: st !== 0,
    button: st === 0 ? (wantMode === "arm" ? "● Arm" : "● Record") : st === 1 ? "■ Disarm" : "■ Stop",
    buttonClass: rec ? "on" : st === 1 ? "armed" : "",
    time: hms(st === 1 ? 0 : secs),
    timeClass: st === 2 ? "on" : "",
    state: !r.ready ? "recording is off (no card)" : st === 1 ? "armed: waiting for PLAY" + (r.take ? ` (last: ${r.take})` : "")
      : st === 2 ? r.take : st === 3 ? `${r.take}: closing the files` : r.take ? `last take: ${r.take}` : "",
    free: r.totalMB ? `${mb(r.freeMB)} free` + (need ? ` · ${hms((r.freeMB * 1024) / need)} at this selection` : "") : "",
    stemsOk: !!r.psram && r.maxs >= 12,
    mode: r.mode,
    bits: r.bits,
    warn: [],
    usb: !r.usbShared ? "" : r.usbPaused ? "USB audio to the computer is paused while the recorder is armed or records (they share the Teensy's memory); it is back when the take ends."
      : "Recording here pauses the USB audio to the computer (they share the Teensy's memory); USB MIDI keeps running.",
    card: "",
    levels: [],
  };
  if (r.drops) v.warn.push(`the card fell behind: ${r.drops} blocks dropped (${Math.round((r.silence || 0) / 48)} ms written as silence) - a faster card, or 16-bit`);
  if (r.error) v.warn.push(r.error);
  const buf = `${r.ringKB} KB buffer (${(r.ringMs / 1000).toFixed(2)} s) in ${r.psram ? "PSRAM" : "internal RAM"}, ${r.blockKB} KB writes`;
  v.card = r.writes ? `Card: ${(r.cardKBps / 1024).toFixed(1)} MB/s while writing (needs ${(need / 1024).toFixed(2)}), worst write ${r.worstWriteUs !== undefined ? (r.worstWriteUs / 1000).toFixed(1) : r.worstWriteMs} ms, ` +
    `buffer most used ${r.ringMax} %, card busy ${r.busy} polls, ${mb(Math.round((r.bytes || 0) / 1024))} written. ${buf}.`
    : r.ready ? `${buf}.` : "";
  const sel = new Set(r.ch || []);
  v.levels = REC_SOURCES.map((name, id) => ({ id, name, on: sel.has(id), pct: Math.min(100, (r.peak?.[id] || 0) / 10), hot: (r.peak?.[id] || 0) >= 990 }));
  return v;
}

export function initRec({ $, send, store, isTab }) {
  let last = null, mode = "manual", synced = false, prev = -1;
  try {
    const j = JSON.parse(store("sidecar.teensy.rec") || "null");
    if (j) { mode = j.mode === "arm" ? "arm" : "manual"; $("rec-name").value = okName(j.name || "") ? j.name : "take"; }
  } catch {}
  const save = () => store("sidecar.teensy.rec", JSON.stringify({ mode, name: $("rec-name").value }));
  $("rec-levels").innerHTML = REC_SOURCES.map((n, id) => `<div class="lv" data-id="${id}"><i></i><span>${n}</span></div>`).join("");
  const q = (l) => send(l, true).catch(() => {});
  const fb = $("rec-fb");
  const pend = new Pending((key, kind, text) => {
    fb.textContent = text; fb.classList.toggle("err", kind === "err");
    clearTimeout(fb._t);
    if (kind !== "pending" && text) fb._t = setTimeout(() => (fb.textContent = ""), kind === "err" ? 5000 : 2500);
    view();
  });
  const change = (key, want, line) => { pend.start(key, want); q(line); };
  const view = () => {
    const mark = (b, on, key) => {
      b.setAttribute("aria-checked", String(on));
      b.classList.toggle("pend", pend.want(key) === (b.dataset.rmode || b.dataset.rbits));
      b.tabIndex = on ? 0 : -1;
    };
    document.querySelectorAll("[data-rm]").forEach((b) => { mark(b, b.dataset.rm === mode, "-"); b.disabled = !!(last && last.state); });
    if (!last) return;
    const v = recModel(last, mode);
    document.querySelectorAll("[data-rmode]").forEach((b) => { mark(b, b.dataset.rmode === v.mode, "mode"); b.disabled = v.busy || (b.dataset.rmode === "stems" && !v.stemsOk); });
    document.querySelectorAll("[data-rbits]").forEach((b) => { mark(b, +b.dataset.rbits === v.bits, "bits"); b.disabled = v.busy; });
    $("rec-stems-note").textContent = v.stemsOk ? "" : "Stems (the 12 Overbridge channels) need PSRAM on the Teensy; this one records stereo.";
    $("rec-name").disabled = v.busy;
    const b = $("rec-go");
    b.textContent = v.button; b.className = v.buttonClass; b.disabled = !last.ready;
    $("rec-time").textContent = v.time; $("rec-time").className = v.timeClass;
    $("rec-state").textContent = v.state;
    $("rec-free").textContent = v.free;
    $("rec-warn").textContent = v.warn.join(" · ");
    $("rec-card").textContent = v.card;
    $("rec-usb").textContent = v.usb;
    $("rec-usb").classList.toggle("bad", !!last.usbPaused);
    for (const l of v.levels) {
      const el = document.querySelector(`#rec-levels [data-id="${l.id}"]`);
      el.classList.toggle("on", l.on); el.classList.toggle("hot", l.hot);
      el.querySelector("i").style.height = (l.on && last.state ? l.pct : 0) + "%";
    }
  };
  const push = async () => {   // the page's take name to the device (idle only)
    const n = $("rec-name").value;
    if (okName(n) && last && last.state === 0 && n !== last.prefix) await q("rec=name:" + n);
  };
  document.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { mode = b.dataset.rm; save(); view(); }));
  document.querySelectorAll("[data-rmode]").forEach((b) => (b.onclick = () => change("mode", b.dataset.rmode, "rec=mode:" + b.dataset.rmode)));
  document.querySelectorAll("[data-rbits]").forEach((b) => (b.onclick = () => change("bits", b.dataset.rbits, "rec=bits:" + b.dataset.rbits)));
  document.querySelectorAll("#tab-record .seg").forEach((g) => (g.onkeydown = (e) => {   // radio group: arrows move and choose
    const bs = [...g.querySelectorAll("button:not(:disabled)")], i = bs.indexOf(document.activeElement);
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (i < 0 || !d) return;
    e.preventDefault();
    const n = bs[(i + d + bs.length) % bs.length];
    n.focus(); n.click();
  }));
  $("rec-name").onchange = () => {
    const ok = okName($("rec-name").value);
    $("rec-msg").textContent = ok ? "" : "take name: 1 to 24 of A-Z a-z 0-9 _ -";
    $("rec-msg").classList.toggle("bad", !ok);
    if (ok) { save(); push(); }
  };
  $("rec-go").onclick = async () => {
    if (last && last.state) return q("rec=stop");
    await push();
    q(mode === "arm" ? "rec=arm" : "rec=start");
  };
  setInterval(() => { if (!document.hidden && isTab()) q("rec"); }, 500);
  return {
    names(n) {   // IN L / IN R, or FX L / FX R while the Rytm's FX return is on them (fxin.js)
      [11, 12].forEach((id, i) => { const el = document.querySelector(`#rec-levels [data-id="${id}"] span`); if (el) el.textContent = n[i]; });
    },
    reply(r) {   // an @rec object
      last = r;
      pend.report("mode", r.mode, "saved \u2713");
      pend.report("bits", r.bits, "saved \u2713");
      if (!synced && r.state === 0) { synced = true; push(); }
      if (r.state === 1 && r.arm) mode = "arm";
      if (r.state) $("rec-name").value = r.prefix;
      prev = r.state;
      view();
    },
    shown() { q("rec"); },
    get last() { return last; },
    get prev() { return prev; },
  };
}
