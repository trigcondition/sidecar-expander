// The web console protocol (docs/webui-protocol.md, teensy/voiceloop/webui.h): '@' reply lines in, 'Y' frames out.
// Pure functions, no DOM: shared by the page, the mock and node tests.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; ++n) {
    let c = n;
    for (let k = 0; k < 8; ++k) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

// CRC-32 (IEEE 802.3, as zlib): crc32(bytes) or crc32(bytes, previous) to continue.
export function crc32(b, prev = 0) {
  let c = ~prev >>> 0;
  for (let i = 0; i < b.length; ++i) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
const utf8 = (s) => new TextEncoder().encode(s);

// 'Y' <n u16 LE> <payload> <crc32 u32 LE>
export function frame(payload) {
  const p = payload instanceof Uint8Array ? payload : Uint8Array.from(payload);
  const out = new Uint8Array(3 + p.length + 4);
  out[0] = 0x59;
  out[1] = p.length & 0xff;
  out[2] = p.length >> 8;
  out.set(p, 3);
  out.set(u32(crc32(p)), 3 + p.length);
  return out;
}
const cat = (...parts) => {
  const n = parts.reduce((a, x) => a + x.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const x of parts) { out.set(x, o); o += x.length; }
  return out;
};
const op = (c) => Uint8Array.of(c.charCodeAt(0));

export const MAX_CHUNK = 1024;
export const FRAME_MAX = 1 + 1 + 4 + MAX_CHUNK;

export const F = {
  // kind 'f' a card file at path, 'p' a plugin package (path ignored)
  open: (kind, id, size, crc, path = "") => frame(cat(op("o"), op(kind), Uint8Array.of(id), Uint8Array.from(u32(size)), Uint8Array.from(u32(crc)), utf8(path))),
  write: (id, off, data) => frame(cat(op("w"), Uint8Array.of(id), Uint8Array.from(u32(off)), data)),
  commit: (id) => frame(cat(op("c"), Uint8Array.of(id))),
  abort: (id) => frame(cat(op("a"), Uint8Array.of(id))),
  get: (id, path) => frame(cat(op("g"), Uint8Array.of(id), utf8(path))),
  read: (id, off, n) => frame(cat(op("r"), Uint8Array.of(id), Uint8Array.from(u32(off)), Uint8Array.from(u32(n)))),
  list: (path) => frame(cat(op("l"), utf8(path))),
  del: (path) => frame(cat(op("d"), utf8(path))),
  mkdir: (path) => frame(cat(op("m"), utf8(path))),
  rename: (from, to) => frame(cat(op("n"), utf8(from), Uint8Array.of(0), utf8(to))),
};

// The firmware writes names as byte strings (every byte outside printable ASCII as \u00XX): back to text.
export function bytesName(s) {
  if (typeof s !== "string" || !/[\u0080-ÿ]/.test(s)) return s;
  const b = Uint8Array.from([...s].map((c) => c.charCodeAt(0) & 0xff));
  return new TextDecoder().decode(b);
}

export function b64decode(s) {
  if (typeof atob === "function") return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  return new Uint8Array(Buffer.from(s, "base64"));
}
export function b64encode(b) {
  if (typeof btoa === "function") {
    let s = "";
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  return Buffer.from(b).toString("base64");
}

// A log line: a reply object, or null when it is not one. '@d id off crc b64' is {t:'d', x, off, crc, data, ok}.
export function parseReply(line) {
  if (!line || line[0] !== "@") return null;
  if (line.startsWith("@d ")) {
    const m = /^@d (\d+) (\d+) ([0-9a-f]{8}) ?([A-Za-z0-9+/=]*)$/.exec(line);
    if (!m) return { t: "d", bad: true };
    const data = b64decode(m[4]);
    return { t: "d", x: +m[1], off: +m[2], crc: parseInt(m[3], 16), data, ok: crc32(data) === parseInt(m[3], 16) };
  }
  if (line[1] !== "{") return null;
  try {
    const o = JSON.parse(line.slice(1));
    if (typeof o.n === "string") o.n = bytesName(o.n);
    if (typeof o.p === "string") o.p = bytesName(o.p);
    return o;
  } catch {
    return { t: "bad", line };
  }
}

export const fmtBytes = (n) => {
  if (n == null || isNaN(n)) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
};

export const joinPath = (dir, name) => (dir.endsWith("/") ? dir : dir + "/") + name;
export const parentPath = (p) => p.replace(/\/[^/]+\/?$/, "") || "/";

// ---- folder uploads (a dropped folder, or <input webkitdirectory>) ----------------------------------------------
// macOS / Windows junk left out of a folder upload.
export const junkName = (n) => n === ".DS_Store" || n.startsWith("._") || n === ".Trashes" || n === ".fseventsd" ||
  n === ".Spotlight-V100" || n === "Thumbs.db" || n === "desktop.ini";
// Files with relative paths ("Kit/sub/a.wav") -> {dirs: parents first, files: [{rel, file}]}, sorted, junk left out.
export function treeOf(list) {   // list: [{rel, file}]
  const tree = { dirs: [], files: [] }, seen = new Set();
  const xs = list.filter((x) => !x.rel.split("/").some(junkName)).sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  for (const x of xs) {
    const parts = x.rel.split("/");
    for (let i = 1; i < parts.length; ++i) {
      const d = parts.slice(0, i).join("/");
      if (!seen.has(d)) { seen.add(d); tree.dirs.push(d); }
    }
    tree.files.push(x);
  }
  return tree;
}
