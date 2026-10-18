// The user slots' list as a file to share with a project (export / import), and where a slot's machine came from.
// The same format and texts as the Pi's page (pi/engine/www/index.html, User machines):
//   {"format":"sidecar-slots","version":1,"project":"NAME","slots":[{"slot":1,"id","ver","name","fp"} | {"slot":5,"empty":true}]}
// A slot not in the list is left as it is on import. A plain slot map ("U<n> <id> <a.b.c>" lines) imports too.
// The Teensy applies an entry with `plugin=put:U:ID:a.b.c[:NAME]` (webui.h), "-" for explicitly empty.

const SRCTXT = { saved: "saved with the project", sounds: "from the project's sounds", inherited: "inherited from the previous project",
  imported: "from an imported slot list", empty: "empty (cleared)", none: "" };

// A slot's @{"t":"slot"} line -> {text, cls} (cls ok | bad | note).
export function slotSrc(s) {
  const fp = s.want_fp, nm = s.want_name ? ` (${s.want_name})` : "";
  if (s.collision) return { text: `fingerprint ${fp} matches several machines: pick one`, cls: "bad" };
  if (s.unknown && s.src !== "empty") return { text: `needs a machine with fingerprint ${fp}${nm}`, cls: "bad" };
  if (s.state === "MISSING") return { text: `missing: install ${s.name || s.id}${s.ver ? " " + s.ver : ""}`, cls: "bad" };
  // why the device could not play it, in words ("no room: needs 23288 B, 584 B free", "muted: timed out")
  if (s.why && s.state && s.state !== "READY") return { text: s.why, cls: "bad" };
  let t = SRCTXT[s.src || "none"] || "";
  if (s.updated) t = "updated from the project's sounds";
  if (s.src === "empty" && fp) t += ` · its sounds use fingerprint ${fp}${nm}`;
  if (s.mixed) t += " · its sounds use more than one machine";
  return { text: t || "-", cls: s.updated ? "ok" : "note" };
}

// slots: the five @{"t":"slot"} objects (or a map slot -> object).
export function slotListExport(project, slots) {
  const S = Array.isArray(slots) ? Object.fromEntries(slots.map((s) => [s.slot, s])) : slots;
  const out = [];
  for (let n = 1; n <= 5; n++) {
    const s = S[n] || {};
    if (s.id) out.push({ slot: n, id: s.id, ver: s.ver || "", name: s.name || s.want_name || "", fp: s.fp || s.want_fp || 0 });
    else if (s.src === "empty") out.push({ slot: n, empty: true });
  }
  return { format: "sidecar-slots", version: 1, project: project || "", slots: out };
}

export function slotListParse(text) {   // -> {project, slots}; throws on anything else
  let j;
  try { j = JSON.parse(text); } catch {
    const slots = [];
    for (const l of text.split(/\r?\n/)) {
      const m = l.trim().match(/^U([1-5])\s+(\S+)\s+(\d+\.\d+\.\d+)$/);
      if (m) slots.push({ slot: +m[1], id: m[2], ver: m[3] });
      else if (l.trim()) throw new Error("not a slot list: " + l.trim().slice(0, 40));
    }
    return { project: "", slots };
  }
  if (!j || j.format !== "sidecar-slots" || !Array.isArray(j.slots)) throw new Error("not a Sidecar slot list");
  const slots = j.slots.filter((x) => x && x.slot >= 1 && x.slot <= 5 && (x.empty || (typeof x.id === "string" && /^\S{1,31}$/.test(x.id))))
    .map((x) => x.empty ? { slot: x.slot, empty: true } : { slot: x.slot, id: x.id, ver: /^\d+\.\d+\.\d+$/.test(x.ver || "") ? x.ver : "0.0.0",
      name: String(x.name || "").replace(/[^\x20-\x7e]/g, "_").replace(/:/g, "_").slice(0, 10), fp: x.fp | 0 });
  return { project: String(j.project || ""), slots };
}

// The plugin=... arguments that apply it; a name is left out where the console line (63 characters) would not hold it.
export function slotListCmds(list, max = 63 - ":plugin=".length) {
  return list.slots.map((x) => {
    if (x.empty) return `put:${x.slot}:-:0.0.0`;
    const a = `put:${x.slot}:${x.id}:${x.ver}`, b = x.name ? `${a}:${x.name}` : a;
    return b.length <= max ? b : a;
  });
}

// The entries whose package is not installed here (pkgs: the @{"t":"plugin"} objects), by name.
export function slotListMissing(list, pkgs) {
  const have = new Set(pkgs.filter((p) => p.fit).map((p) => p.id));
  return list.slots.filter((x) => !x.empty && !have.has(x.id)).map((x) => `U${x.slot} ${x.name || x.id} ${x.ver} (${x.id})`);
}
