// Requests and transfers over the console link (docs/webui-protocol.md): waits for '@' replies, uploads in
// CRC-checked chunks with resume and abort, downloads in streamed windows. No DOM.
import { F, crc32, MAX_CHUNK, joinPath } from "./proto.js";

export class Cancelled extends Error { constructor() { super("cancelled"); this.name = "Cancelled"; } }

export class Link {
  // io: { line(text) -> Promise, bytes(Uint8Array) -> Promise, connected() -> bool }
  constructor(io) {
    this.io = io;
    this.waiters = [];
    this.nextId = 1 + ((Math.random() * 200) | 0);
    this.ops = Promise.resolve();   // one card/store operation at a time (the Teensy runs one)
  }
  reply(o) {
    for (const w of [...this.waiters]) {
      const r = w.on(o);
      if (r !== undefined) {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        clearTimeout(w.timer);
        r instanceof Error ? w.reject(r) : w.resolve(r);
      }
    }
  }
  // on(o): undefined = not mine; a value resolves; an Error rejects.
  wait(on, ms = 3000, what = "reply") {
    return new Promise((resolve, reject) => {
      const w = { on, resolve, reject };
      w.timer = setTimeout(() => {
        this.waiters.splice(this.waiters.indexOf(w), 1);
        reject(new Error(`no ${what} within ${ms} ms`));
      }, ms);
      this.waiters.push(w);
    });
  }
  id() { this.nextId = (this.nextId % 250) + 1; return this.nextId; }
  serial(fn) { const p = this.ops.then(fn, fn); this.ops = p.catch(() => {}); return p; }

  // ':mem' -> [{k,size,used,...}]
  mem() {
    return this.serial(async () => {
      const regions = [];
      const done = this.wait((o) => {
        if (o.t === "mem") { regions.push(o); return undefined; }
        if (o.t === "mem_end") return regions;
        if (o.t === "busy") return new Error("the Teensy is busy");
      }, 5000, "memory map");
      await this.io.line("mem");
      return done;
    });
  }
  // ':plugins' -> {pkgs, slots, summary}
  plugins() {
    return this.serial(async () => {
      const pkgs = [], slots = [];
      const done = this.wait((o) => {
        if (o.t === "plugin") pkgs.push(o);
        else if (o.t === "slot") slots.push(o);
        else if (o.t === "plugins") return { pkgs, slots, summary: o };
        else if (o.t === "busy") return new Error("the Teensy is busy");
        return undefined;
      }, 15000, "plugin list");
      await this.io.line("plugins");
      return done;
    });
  }
  // ':plugin=...' -> the {"t":"pl"} reply
  plugin(cmd) {
    return this.serial(async () => {
      const done = this.wait((o) => (o.t === "pl" ? (o.st === "ok" ? o : new Error(o.why || "refused")) : undefined), 8000, "plugin reply");
      await this.io.line("plugin=" + cmd);
      return done;
    });
  }
  df() {
    return this.serial(async () => {
      const done = this.wait((o) => (o.t === "df" ? (o.st === "ok" ? o : new Error(o.why)) : o.t === "busy" ? new Error("busy") : undefined), 30000, "free space");
      await this.io.line("df");
      return done;
    });
  }
  list(path) {
    return this.serial(async () => {
      const items = [];
      const done = this.wait((o) => {
        if (o.t === "ls") { items.push(o); return undefined; }
        if (o.t === "ls_end") return o.st === "ok" ? { items, more: o.more } : new Error(o.why || "cannot list");
        if (o.t === "fs" && o.op === "l") return new Error(o.why || "cannot list");
        if (o.t === "busy") return new Error("the Teensy is busy");
      }, 20000, "listing");
      await this.io.bytes(F.list(path));
      return done;
    });
  }
  fsop(kind, frameBytes) {
    return this.serial(async () => {
      const done = this.wait((o) => (o.t === "fs" && o.op === kind ? (o.st === "ok" ? o : new Error(o.why || "refused")) : o.t === "busy" ? new Error("the Teensy is busy") : undefined), 8000, "answer");
      await this.io.bytes(frameBytes);
      return done;
    });
  }
  del(path) { return this.fsop("d", F.del(path)); }
  mkdir(path) { return this.fsop("m", F.mkdir(path)); }
  rename(a, b) { return this.fsop("n", F.rename(a, b)); }

  // A folder tree onto the card under base (proto.js treeOf): each folder made (one that exists is fine), then each
  // file uploaded in order. progress({sent, size, kbs, note}) over all the bytes, note "i/n name pct %".
  // Returns {files, bytes, failed: [[rel, message]]}; a cancel stops it (Cancelled).
  async putTree(tree, base, progress = () => {}, signal = {}) {
    const at = (rel) => joinPath(base, rel);
    for (const d of tree.dirs) {
      if (signal.cancelled) throw new Cancelled();
      try { await this.mkdir(at(d)); }
      catch (e) { try { await this.list(at(d)); } catch { throw new Error(`folder ${d}: ${e.message}`); } }   // there already
    }
    // each file {rel, data} or {rel, file} (a File/Blob, read when its turn comes)
    const size = (x) => (x.data ? x.data.length : x.file.size);
    const total = tree.files.reduce((n, x) => n + size(x), 0), n = tree.files.length, t0 = performance.now();
    let bytes = 0;
    const failed = [];
    for (let i = 0; i < n; ++i) {
      const x = tree.files[i];
      if (signal.cancelled) throw new Cancelled();
      try {
        const data = x.data || new Uint8Array(await x.file.arrayBuffer());
        await this.upload("f", at(x.rel), data, (p) => progress({
          sent: bytes + p.sent, size: total, kbs: (bytes + p.sent) / 1024 / ((performance.now() - t0) / 1000),
          note: `${i + 1}/${n} ${x.rel} ${data.length ? Math.floor((100 * p.sent) / data.length) : 100} %${p.note ? " · " + p.note : ""}` }), signal);
      } catch (e) {
        if (e instanceof Cancelled) throw e;
        failed.push([x.rel, e.message]);
      }
      bytes += size(x);
      progress({ sent: bytes, size: total, note: `${i + 1}/${n}` });
    }
    return { files: n, bytes: total, failed };
  }

  // An upload: kind 'f' (card file at path) or 'p' (plugin package). progress({sent, size, kbs, note}).
  // signal: {cancelled: bool}. Resumes after a lost connection (the Teensy keeps the transfer 30 s).
  async upload(kind, path, data, progress = () => {}, signal = {}) {
    const id = this.id(), size = data.length, crc = crc32(data);
    const t0 = performance.now();
    const isUp = (o) => o.t === "up" && o.x === id;
    const open = async () => {
      const r = this.wait((o) => (isUp(o) ? (o.st === "open" ? o : new Error(o.why || o.st)) : undefined), 10000, "open");
      await this.io.bytes(F.open(kind, id, size, crc, path));
      return r;
    };
    let o = await open();
    let off = o.off, max = Math.min(o.max || MAX_CHUNK, MAX_CHUNK), tries = 0;
    let note = "";
    while (off < size) {
      if (signal.cancelled) { await this.io.bytes(F.abort(id)).catch(() => {}); throw new Cancelled(); }
      if (!this.io.connected()) {   // the device went away: wait for it, then the same transfer again (resume)
        progress({ sent: off, size, note: "waiting for the device…" });
        await new Promise((r) => setTimeout(r, 500));
        if (this.io.connected()) { o = await open(); off = o.off; }
        continue;
      }
      const chunk = data.subarray(off, Math.min(off + max, size));
      const r = this.wait((x) => (isUp(x) && x.st !== "open" ? x : undefined), 2000, "acknowledgement");
      await this.io.bytes(F.write(id, off, chunk));
      let a;
      try { a = await r; } catch (e) { if (++tries > 8) throw e; continue; }   // resent (the Teensy re-acks a duplicate)
      tries = 0;
      if (a.st === "ack" || a.st === "want") { off = a.off; note = ""; }
      else if (a.st === "busy") { note = "paused: the Rytm's transport runs (writes wait for stop)"; await new Promise((res) => setTimeout(res, 400)); }
      else throw new Error(a.why || a.st);
      const s = (performance.now() - t0) / 1000;
      progress({ sent: off, size, kbs: off / 1024 / s, note });
    }
    const r = this.wait((x) => (isUp(x) && (x.st === "done" || x.st === "err") ? (x.st === "done" ? x : new Error(x.why)) : undefined), 20000, "commit");
    await this.io.bytes(F.commit(id));
    const d = await r;
    const secs = (performance.now() - t0) / 1000;
    d.kbsPage = size / 1024 / secs;
    progress({ sent: size, size, kbs: d.kbsPage, note: "" });
    return d;
  }

  // A download -> Uint8Array. Requests windows of `win` bytes; each line is CRC-checked, a bad one asked again.
  download(path, progress = () => {}, signal = {}, win = 32768) {
    return this.serial(async () => {
      const id = this.id();
      const t0 = performance.now();
      const op = this.wait((o) => (o.t === "dn" && o.x === id ? (o.st === "open" ? o : new Error(o.why)) : undefined), 8000, "open");
      await this.io.bytes(F.get(id, path));
      const { size } = await op;
      const out = new Uint8Array(size);
      let off = 0, tries = 0;
      while (off < size) {
        if (signal.cancelled) throw new Cancelled();
        const want = Math.min(win, size - off);
        let got = off, bad = false;
        const r = this.wait((o) => {
          if (o.t === "dn" && o.x === id && o.st === "err") return new Error(o.why);
          if (o.t === "busy") return new Error("busy");
          if (o.t !== "d" || o.x !== id) return undefined;
          if (!o.ok || o.off !== got) { bad = true; return got; }
          out.set(o.data, o.off);
          got = o.off + o.data.length;
          return got >= off + want || o.data.length === 0 ? got : undefined;
        }, 5000, "data");
        await this.io.bytes(F.read(id, off, want));
        try { got = await r; } catch (e) { if (++tries > 5) throw e; await this.drain(); continue; }
        if (bad) { if (++tries > 5) throw new Error("data kept arriving damaged"); await this.drain(); }
        else tries = 0;
        if (got === off && !bad) throw new Error("the file ended early");
        off = got;
        progress({ sent: off, size, kbs: off / 1024 / ((performance.now() - t0) / 1000) });
      }
      return out;
    });
  }
  // after a damaged line: let the rest of the window's lines pass before asking again
  drain() { return new Promise((r) => setTimeout(r, 300)); }
}
