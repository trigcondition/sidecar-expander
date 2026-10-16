// index.html?mock - a fake Teensy for trying the page without a device: plain host-build lines every 2 s,
// the console answers in the firmware's wording (voiceloop.ino console_line, usb_host.h host_fifo).
// window.mockUnplug() / mockReplug() play a re-enumeration.
const NAMES = "plaits juno daisy dsps grain dd fm".split(" ");

class FakePort extends EventTarget {
  constructor(serial) { super(); this.serial = serial; this.readable = null; this.writable = null; }
  getInfo() { return { usbVendorId: 0x16c0, usbProductId: 0x0489 }; }
  async open() {
    const st = { notes: false, out: "tracks", fifo: 256, mac: true, usbmode: "multi", mach: Array(8).fill("plaits") };
    const enc = new TextEncoder();
    let ctl, timer;
    const say = (s) => ctl && ctl.enqueue(enc.encode(s + "\r\n"));
    this.readable = new ReadableStream({
      start: (c) => {
        ctl = c;
        say("usb host: waiting for a device");
        timer = setInterval(() => {
          say(`cpu ${(20 + Math.random() * 5).toFixed(1)} % (8 voices, real time), peak block 26 %, with card reads 27 %, stream underruns 0`);
          const lo = st.fifo - 10 - ((Math.random() * 8) | 0);
          say(`usb host: ob streaming, in 48000 Hz out 48000 Hz, fifo ${st.fifo} (min ${lo} max ${st.fifo + 12} target ${st.fifo}), ` +
              `xruns 0 blocks 0 frames, bad 0 gaps 0 unanswered 0 rearms 0/0 queue fails 0; midi on, clock 120 BPM, sysex in 0 out 0 dropped 0`);
          if (Math.random() < 0.5) say(`midi notes 8, channels 3, MIDI notes ${st.notes ? "on" : "off"}`);
        }, 2000);
      },
      cancel: () => clearInterval(timer),
    });
    this.stop = () => { clearInterval(timer); try { ctl.error(new Error("The device has been lost.")); } catch {} ctl = null; };
    let pend = "";
    this.writable = new WritableStream({
      write: (chunk) => {
        pend += new TextDecoder().decode(chunk);
        let i;
        while ((i = pend.indexOf("\n")) >= 0) {
          const p = pend.slice(1, i); // after ':'
          pend = pend.slice(i + 1);
          let m;
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
          else say(`console: unknown command "${p}" (notes=1|0, notemach=V:NAME, notes, out=main|tracks, out, fifo=N, fifo, cap=MS, mac=on|off, usbmode=multi|stereo|off)`);
        }
      },
    });
  }
  async close() { if (this.stop) this.stop(); this.readable = this.writable = null; }
}

export function mockSerial(log) {
  const serial = new EventTarget();
  const port = new FakePort(serial);
  serial.requestPort = async () => port;
  serial.getPorts = async () => [];
  window.mockUnplug = () => port.stop && port.stop();
  // WebSerial's 'connect' event has the port as its target
  window.mockReplug = () => {
    const ev = new Event("connect");
    Object.defineProperty(ev, "target", { value: port });
    serial.dispatchEvent(ev);
  };
  log("-- mock serial: no device is used (index.html without ?mock for the real one)", "me");
  return serial;
}
