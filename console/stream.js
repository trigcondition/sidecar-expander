// The Teensy's serial stream as log lines (teensy/voiceloop/voiceloop.ino, log_line / teensy_to_rytm).
// Two shapes on the same port:
//   plain  - the host build until a development tool sends a frame letter: text lines ending '\n'
//   framed - the serial build always, the host build after a tool's frame: 'L' <len u8> <text>,
//            'X' <len u8> <SysEx F0..F7> (skipped), 'A' <n u16 LE> <n x 8 x i16 LE> (skipped)
// This page only sends ':' console lines, which do not switch the host build to framed.
// Auto-detection: a frame start is taken as framed only when it checks out (an 'X' whose payload starts F0;
// an 'L' whose text is printable, holds no newline and is followed by another frame letter); once framed
// was seen, 'L' and 'A' frames are trusted. Everything else is plain text, non-printing bytes dropped.

const PRINT = (b) => b >= 0x20 && b < 0x7f;
const LETTERS = [0x4c, 0x58, 0x41]; // L X A

export class StreamParser {
  constructor() {
    this.buf = new Uint8Array(0);
    this.framed = false;
    this.line = ""; // a plain line in progress
  }

  // Bytes in, finished log lines out. flush=true: a stalled partial plain line is given out too.
  push(bytes, flush = false) {
    const nb = new Uint8Array(this.buf.length + bytes.length);
    nb.set(this.buf);
    nb.set(bytes, this.buf.length);
    this.buf = nb;
    const out = [];
    let i = 0;
    const b = this.buf;
    while (i < b.length) {
      const atStart = this.line === "";
      const k = b[i];
      if (atStart && k === 0x58) { // 'X'
        if (i + 3 > b.length) break;
        if (b[i + 2] === 0xf0) {
          const n = b[i + 1];
          if (i + 2 + n > b.length) break;
          this.framed = true;
          i += 2 + n;
          continue;
        }
      } else if (atStart && k === 0x41 && this.framed) { // 'A'
        if (i + 3 > b.length) break;
        const n = b[i + 1] | (b[i + 2] << 8);
        if (n > 0 && n <= 4096) {
          if (i + 3 + n * 16 > b.length) break;
          i += 3 + n * 16;
          continue;
        }
      } else if (atStart && k === 0x4c) { // 'L'
        if (i + 2 > b.length) break;
        const n = b[i + 1];
        const end = i + 2 + n;
        let ok = n > 0;
        for (let j = i + 2; ok && j < Math.min(end, b.length); ++j) if (!PRINT(b[j])) ok = false;
        if (ok) {
          if (this.framed) {
            if (end > b.length) break;
          } else {
            if (end + 1 > b.length) {
              if (!flush) break;
              ok = false; // nothing follows to confirm: plain
            } else if (!LETTERS.includes(b[end])) ok = false;
          }
        }
        if (ok) {
          this.framed = true;
          out.push(new TextDecoder().decode(b.subarray(i + 2, end)));
          i = end;
          continue;
        }
      }
      // plain text
      if (k === 0x0a) {
        out.push(this.line);
        this.line = "";
      } else if (PRINT(k)) {
        this.line += String.fromCharCode(k);
      } // '\r', other control bytes: dropped
      ++i;
    }
    this.buf = this.buf.slice(i);
    if (flush && this.line) {
      out.push(this.line);
      this.line = "";
    }
    return out.filter((s) => s.length);
  }
}

// The periodic lines' numbers (voiceloop.ino stats_report, usb_host.h host_log), parsed defensively:
// a field that is missing stays out of the result.
export function parseStatus(line) {
  const r = {};
  let m;
  if ((m = /^cpu (\d+(?:\.\d+)?) %.*?peak block (\d+) %.*?stream underruns (\d+)/.exec(line))) {
    r.cpu = m[1]; r.peak = m[2]; r.underruns = m[3];
  }
  if ((m = /^usb host: ob ([\w-]+)/.exec(line))) r.ob = m[1];
  if ((m = /fifo (\d+) \(min (\d+) max (\d+) target (\d+)\)/.exec(line))) {
    r.fifo = m[1]; r.fifoMin = m[2]; r.fifoMax = m[3]; r.target = m[4];
  }
  if ((m = /xruns (\d+) blocks/.exec(line))) r.xruns = m[1];
  if ((m = /usb host: FIFO target (\d+) frames/.exec(line))) r.target = m[1];
  if ((m = /^midi notes (\d+), channels ([0-9a-f]+), MIDI notes (on|off)/.exec(line))) {
    r.notes = m[1]; r.chans = m[2]; r.notesOn = m[3];
  }
  if ((m = /^MIDI notes (on|off)/.exec(line))) r.notesOn = m[1];
  if ((m = /^output: (main|tracks)\b/.exec(line))) r.out = m[1];
  return r;
}
