// A machine package (.rmp, teensy/libraries/RytmPlugins/src/rmp_format.h) read in the page: what it needs, checked
// before it is sent - the Teensy checks the same again (webui.h web_pkg_fit) and refuses what will not fit.
import { crc32 } from "./proto.js";

export const RMP = { MAGIC: 0x31504d52, MAGIC_A64: 0x41504d52, HEADER: 96, PLUGIN_MAGIC: 0x504d5252, MAX_PKG: 64 * 1024 };

// bytes -> {id, ver, api, image, bss, code, state, cpu, name, size, ...} or {error}
export function parseRmp(b) {
  if (!(b instanceof Uint8Array)) b = new Uint8Array(b);
  if (b.length < RMP.HEADER) return { error: "too short for a package" };
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const magic = dv.getUint32(0, true);
  if (magic === RMP.MAGIC_A64) return { error: "an AArch64 package (for the Pi), not for the Teensy" };
  if (magic !== RMP.MAGIC) return { error: "not a machine package (.rmp)" };
  const h = {
    format: dv.getUint16(4, true), hdrApi: dv.getUint16(6, true),
    id: new TextDecoder().decode(b.subarray(8, 40)).replace(/\0.*$/s, ""),
    version: dv.getUint32(40, true), image: dv.getUint32(48, true), bss: dv.getUint32(52, true),
    entry: dv.getUint32(56, true), relocs: dv.getUint32(60, true), manifest: dv.getUint32(64, true),
    crc: dv.getUint32(72, true), size: b.length,
  };
  const need = RMP.HEADER + h.image + 8 * h.relocs + h.manifest;
  if (need > b.length || Math.ceil(need / 4) * 4 !== b.length) return { error: "the package is cut or padded wrongly", ...h };
  if (crc32(b.subarray(RMP.HEADER)) !== h.crc) return { error: "the package's CRC does not match (damaged file)", ...h };
  const e = RMP.HEADER + h.entry;
  if (e + 16 > RMP.HEADER + h.image) return { error: "no plugin table at the entry", ...h };
  const pm = dv.getUint32(e, true);
  const m = RMP.HEADER + h.image + 8 * h.relocs;
  const name = h.manifest >= 10 ? new TextDecoder().decode(b.subarray(m, m + 10)).replace(/\0.*$/s, "") : "";
  const v = h.version;
  return {
    ...h, name, ver: `${v >>> 16}.${(v >> 8) & 255}.${v & 255}`,
    api: dv.getUint32(e + 4, true), state: dv.getUint32(e + 8, true), cpu: dv.getUint32(e + 12, true),
    code: h.image + h.bss, tableOk: pm === RMP.PLUGIN_MAGIC,
  };
}

// The reasons a package will not install or play, from the Teensy's own numbers (`:mem`, `:plugins`):
// limits = {arena: [size, used], parena: [size, used] (PSRAM fitted only), state_limit, store: [size, free], api}. [] = it fits.
export function fitProblems(p, limits) {
  const out = [];
  if (p.error) return [p.error];
  if (!p.tableOk) out.push("no plugin table at the entry");
  if (p.size > RMP.MAX_PKG) out.push(`the package is ${p.size} B, over the store's 64 KB limit`);
  if (limits) {
    if (limits.api != null && p.api > limits.api) out.push(`built for plugin API ${p.api}, the firmware has ${limits.api}`);
    const [isz] = limits.arena || [];
    const [psz] = limits.parena || [];   // the PSRAM code arena (PSRAM fitted): the larger of the two decides
    const asz = Math.max(isz || 0, psz || 0);
    if (asz && p.code > asz) out.push(`code + data ${p.code} B, over the ${asz} B code arena`);
    if (limits.state_limit && p.state > limits.state_limit)
      out.push(`per-voice state ${p.state} B, over the ${limits.state_limit} B a voice has (PSRAM would add room)`);
    const [, sfree] = limits.store || [];
    if (sfree != null && p.size + 2 * 65536 > sfree) out.push(`the plugin store has ${sfree} B free; this needs ${p.size} B plus two 64 KB blocks`);
  }
  return out;
}

// Room in the arena with the current project's loads: a warning, not a refusal (another project may have room).
export function arenaNote(p, limits) {
  const [asz, aused] = (limits && limits.arena) || [];
  if (!asz) return "";
  const [psz, pused] = (limits && limits.parena) || [0, 0];   // PSRAM fitted: what overflows the internal arena goes there
  if (p.code <= asz - aused || p.code <= psz - pused) return "";
  return psz ? `needs ${p.code} B of the arena; ${asz - aused} B (internal) and ${psz - pused} B (PSRAM) are free with this project's slots loaded`
    : `needs ${p.code} B of the arena; ${asz - aused} B are free with this project's slots loaded`;
}
