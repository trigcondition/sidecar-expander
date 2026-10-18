// index.html?mock - a fake Teensy for trying the page without a device: plain host-build lines every 2 s,
// the console answers in the firmware's wording (voiceloop.ino console_line, usb_host.h host_fifo).
// window.mockUnplug() / mockReplug() play a re-enumeration.
// The console answers and the web console protocol: mockdev.js (MockDevice). mockTransport(true) plays a running
// transport (card writes and installs wait for stop).
import { MockDevice } from "./mockdev.js";

class FakePort extends EventTarget {
  constructor(serial) { super(); this.serial = serial; this.readable = null; this.writable = null; }
  getInfo() { return { usbVendorId: 0x16c0, usbProductId: 0x0489 }; }
  async open() {
    const enc = new TextEncoder();
    let ctl, timer;
    const say = (s) => ctl && ctl.enqueue(enc.encode(s + "\r\n"));
    // one device across re-enumerations (its card, store and an open transfer stay); its output goes to this open
    if (!this.dev) this.dev = new MockDevice(() => {}, { psram: new URLSearchParams(location.search).has("psram"), oldRytm: new URLSearchParams(location.search).has("oldrytm") });
    const dev = (window.mockDevice = this.dev);
    dev.say = say;
    const st = dev.st;
    this.readable = new ReadableStream({
      start: (c) => {
        ctl = c;
        say("usb host: waiting for a device");
        timer = setInterval(() => {
          say(`cpu ${(20 + Math.random() * 5).toFixed(1)} % (8 voices, real time), peak block 26 %, with card reads 27 %, stream underruns 0`);
          const lo = st.fifo - 10 - ((Math.random() * 8) | 0);
          say(`usb host: ob streaming, in 48000 Hz out 48000 Hz, fifo ${st.fifo} (min ${lo} max ${st.fifo + 12} target ${st.fifo}), ` +
              `xruns 0 blocks 0 frames, bad 0 gaps 0 unanswered 0 rearms 0/0 queue fails 0; midi on, clock 120 BPM, sysex in 0 out 0 dropped 0`);
        }, 2000);
      },
      cancel: () => clearInterval(timer),
    });
    this.stop = () => { clearInterval(timer); try { ctl.error(new Error("The device has been lost.")); } catch {} ctl = null; };
    this.writable = new WritableStream({ write: (chunk) => dev.feed(chunk) });
  }
  async close() { if (this.stop) this.stop(); this.readable = this.writable = null; }
}

export function mockSerial(log) {
  const serial = new EventTarget();
  const port = new FakePort(serial);
  serial.requestPort = async () => port;
  serial.getPorts = async () => [];
  window.mockTransport = (on) => { if (window.mockDevice) { window.mockDevice.transport = !!on; window.mockDevice.recTransport(!!on); } };
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
