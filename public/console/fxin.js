// The Sound tab's IN L/R source switch (core/host_link.h, teensy/voiceloop/voiceloop.ino fxin_console, rytm-mods
// 0030-fx-in): ':fxin' answers @{"t":"fxin","fxin":{"want":0|1,"state":"on|off|unknown|unsupported","rytm":1|0|-1}};
// ':fxin=1' FX return on the Overbridge IN L/R (channels 10/11), ':fxin=0' the AUDIO IN. The switch shows the Rytm's
// confirmed state (the unasked 27 on connect), not the setting. The choice group itself is app.js's shared one
// (seg.js Pending, data-key="fxsrc"); this reports the state through onChange. fxinModel() is pure (node web/fxin.test.mjs).

export const FX_NAMES = ["FX L", "FX R"];

// what the switch shows for one reply (o: the @fxin object, or null before the first)
export function fxinModel(o) {
  const f = o && o.fxin ? o.fxin : null;
  const on = !!f && f.state === "on";
  return {
    on,
    sel: !f ? "" : f.state === "on" ? "fx" : f.state === "off" ? "in" : "",
    warn: on,
    note: !f ? "" : on ? "FX return on IN L/R (channels 10/11)" : f.state === "unsupported" ? "not supported by this Rytm build"
      : f.state === "unknown" ? (f.want ? "waiting for the Rytm" : "") : f.want ? "asked, the Rytm still shows inputs" : "",
    names: on ? FX_NAMES : ["IN L", "IN R"],
  };
}

export function initFxin({ $, send, isTab, onChange }) {
  const q = (l) => send(l, true).catch(() => {});
  let last = null;
  const view = () => {
    const v = fxinModel(last);
    $("fxin-note").textContent = v.note;
    $("fxin-warn").hidden = !v.warn;
    if (onChange) onChange(v);
  };
  view();
  setInterval(() => { if (!document.hidden && isTab()) q("fxin"); }, 3000);   // the Rytm's 27 comes by itself on a connect
  return {
    reply(o) { if (o.t === "fxin") { last = o; view(); } },
    poll() { q("fxin"); },
  };
}
