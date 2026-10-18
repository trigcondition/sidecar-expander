// The page's user machines, memory and card sections (index.html): views over link.js. The Teensy decides what
// fits and refuses the rest; the page checks first so a refusal is explained before anything is sent.
import { fmtBytes, joinPath, parentPath, junkName, treeOf } from "./proto.js";
import { Cancelled } from "./link.js";
import { parseRmp, fitProblems, arenaNote } from "./rmp.js";
import { slotSrc, slotListExport, slotListParse, slotListCmds, slotListMissing } from "./slotlist.js";

const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e[k] = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c);
  return e;
};

// A small modal instead of confirm()/prompt() (they block the page and the link's timers).
function ask(text, { input = null, ok = "OK", danger = false } = {}) {
  return new Promise((resolve) => {
    const field = input !== null ? el("input", { value: input, class: "askin", spellcheck: "false" }) : null;
    const done = (v) => { back.remove(); resolve(v); };
    const okb = el("button", { class: danger ? "danger" : "primary", onclick: () => done(field ? field.value : true) }, ok);
    const back = el("div", { class: "modal" }, el("div", { class: "dialog", role: "dialog" },
      el("p", {}, text), field, el("div", { class: "row end" }, el("button", { onclick: () => done(null) }, "Cancel"), okb)));
    back.onkeydown = (e) => { if (e.key === "Escape") done(null); if (e.key === "Enter") okb.click(); };
    document.body.append(back);
    (field || okb).focus();
    if (field) field.select();
  });
}

export function initManage(link, log) {
  const state = { mem: {}, limits: null, pkgs: [], slots: [], cwd: "/", items: [], hidden: false, connected: false };
  const msg = (id, text, bad) => { const m = $(id); m.textContent = text; m.classList.toggle("bad", !!bad); };

  // ---- memory -------------------------------------------------------------------------------------------------------
  const REGIONS = [
    ["itcm", "ITCM (code in RAM1)", "fast code; the build's 32 KB blocks"],
    ["dtcm", "DTCM (RAM1 data)", "variables, the code arena, the stack"],
    ["ocram", "OCRAM (RAM2)", "DMA buffers and the heap"],
    ["flash", "Program flash", "the firmware image"],
    ["store", "Plugin store", "installed packages (LittleFS in flash)"],
    ["arena", "Code arena", "plugin code + data while loaded (DTCM, executable)"],
    ["sd", "SD card", ""],
  ];
  function drawMem() {
    const box = $("membars");
    box.textContent = "";
    for (const [k, label, title] of REGIONS) {
      const r = state.mem[k];
      if (!r) continue;
      let size = r.size, used = r.used, extra = "";
      if (k === "sd") { size = r.size_kb * 1024; used = r.used_kb != null ? r.used_kb * 1024 : null; extra = r.type || ""; }
      if (k === "dtcm" && r.stack_free != null) extra = `stack free ${fmtBytes(r.stack_free)}`;
      if (k === "itcm") extra = `${r.blocks} blocks, ${fmtBytes(size - used)} headroom`;
      if (k === "ocram") extra = `heap ${fmtBytes(r.heap)}`;
      const pct = used != null && size ? Math.min(100, (100 * used) / size) : 0;
      const free = used != null ? size - used : null;
      box.append(el("div", { class: "mem", title },
        el("span", { class: "ml" }, label),
        el("span", { class: "bar" + (pct > 92 ? " hot" : "") }, el("i", { style: `width:${pct.toFixed(1)}%` })),
        el("span", { class: "mv" }, used != null ? `${fmtBytes(used)} / ${fmtBytes(size)} · free ${fmtBytes(free)}` : `${fmtBytes(size)} · free: measure`),
        el("span", { class: "mx" }, extra)));
    }
    const st = state.mem.state, ps = state.mem.psram;
    if (st) box.append(el("div", { class: "note" }, `Per-voice plugin state: ${fmtBytes(st.voice)} a voice${ps && ps.size ? `, PSRAM ${fmtBytes(ps.size)}` : " (no PSRAM: a plugin's state must fit the voice's own memory)"}.`));
  }
  async function loadMem() {
    try {
      const regions = await link.mem();
      state.mem = Object.fromEntries(regions.map((r) => [r.k, r]));
      drawMem();
      drawFree();
    } catch (e) { msg("plmsg", `memory map: ${e.message}`, true); }
  }

  // ---- user machines ------------------------------------------------------------------------------------------------
  function slotSelect(p) {
    const s = el("select", { title: "assign to a user slot of the current project", "aria-label": `assign ${p.id}` },
      el("option", { value: "" }, "Assign…"), [1, 2, 3, 4, 5].map((u) => el("option", { value: u }, `U${u}`)));
    s.onchange = async () => {
      const u = s.value;
      s.value = "";
      if (!u) return;
      await act(`U${u} = ${p.id}`, () => link.plugin(`set:${u}:${p.id}`));
    };
    return s;
  }
  async function act(what, fn) {
    msg("plmsg", `${what}…`);
    try { await fn(); msg("plmsg", `${what}: done`); }
    catch (e) { msg("plmsg", `${what}: ${e.message}`, true); }
    await loadPlugins();
  }
  function drawPlugins() {
    const tb = $("pltable").tBodies[0];
    tb.textContent = "";
    if (!state.pkgs.length) tb.append(el("tr", {}, el("td", { colspan: 10, class: "note" }, state.connected ? "No user machines installed." : "Not connected.")));
    for (const p of state.pkgs) {
      const fit = p.fit ? el("span", { class: "ok" }, "fits") : el("span", { class: "bad", title: p.why || "" }, p.why || p.status || "no");
      const del = el("button", { class: "small danger", onclick: async () => {
        const used = p.slots && p.slots.length ? ` It is on ${p.slots.map((u) => "U" + u).join(", ")} in this project; those slots will be MISSING.` : "";
        if (!(await ask(`Delete ${p.name || p.id} (${p.id} ${p.ver || ""}) from the Teensy's plugin store?${used} Only this package is removed.`, { ok: "Delete", danger: true }))) return;
        await act(`delete ${p.id}`, () => link.plugin(`del:${p.id}`));
      } }, "Delete");
      tb.append(el("tr", {},
        el("td", {}, el("b", {}, p.name || "?"), el("div", { class: "note mono" }, p.id)),
        el("td", { class: "mono" }, p.ver || "-"),
        el("td", { class: "num" }, fmtBytes(p.size)),
        el("td", { class: "num", title: `image ${p.image} B + bss ${p.bss} B, in the code arena (RAM1/DTCM, executable) while loaded` }, p.code != null ? fmtBytes(p.code) : "-"),
        el("td", { class: "num", title: "per voice that plays it" }, p.state != null ? fmtBytes(p.state) : "-"),
        el("td", { class: "num", title: "declared CPU per voice" }, p.cpu != null ? `${(p.cpu / 10).toFixed(1)} %` : "-"),
        el("td", { class: "num" }, p.api ?? "-"),
        el("td", {}, (p.slots || []).map((u) => el("span", { class: "chip" }, "U" + u))),
        el("td", {}, fit),
        el("td", { class: "acts" }, p.fit ? slotSelect(p) : null, del)));
    }
    const sl = $("plslots");
    sl.textContent = "";
    for (const s of state.slots) {
      sl.append(el("div", { class: "slot " + (s.state || "").toLowerCase() },
        el("b", {}, `U${s.slot}`),
        el("span", {}, s.id ? `${s.name || s.id}` : "empty"),
        el("span", { class: "note" }, s.id ? `${s.state} ${s.ver}` : ""),
        (() => { const w = slotSrc(s); return el("span", { class: "src " + w.cls }, w.text); })(),
        s.id ? el("button", { class: "small", title: `U${s.slot} empty in this project (stays empty: nothing fills it)`, onclick: () => act(`U${s.slot} cleared`, () => link.plugin(`clr:${s.slot}`)) }, "Clear") : null));
    }
    const L0 = state.limits || {};
    $("plhow").textContent = !state.connected ? "" : L0.prints === "rytm" ? "slots resolved from the Rytm's report of the project's sounds"
      : L0.prints === "waiting" ? "waiting for the Rytm's report of the project's sounds"
      : "older Rytm firmware: slots fill from the sounds' tags as they play";
    const L = state.limits;
    $("plsum").textContent = L ? `Project ${L.project || "-"} · code arena ${fmtBytes(L.arena[1])} of ${fmtBytes(L.arena[0])} used · ` +
      `state up to ${fmtBytes(L.state_limit)} a voice · store ${fmtBytes(L.store[1])} free of ${fmtBytes(L.store[0])}` +
      (L.safe_mode ? " · SAFE MODE (user machines off this boot)" : "") + (L.transport ? " · transport running: installs wait for stop" : "") : "";
  }
  async function loadPlugins() {
    try {
      const r = await link.plugins();
      state.pkgs = r.pkgs; state.slots = r.slots; state.limits = r.summary;
      drawPlugins();
    } catch (e) { msg("plmsg", `plugin list: ${e.message}`, true); }
  }
  async function installFiles(files) {
    for (const f of files) {
      const data = new Uint8Array(await f.arrayBuffer());
      const p = parseRmp(data);
      const probs = fitProblems(p, state.limits && { ...state.limits });
      if (probs.length) { msg("plmsg", `${f.name}: not installed - ${probs.join("; ")}`, true); continue; }
      const same = state.pkgs.find((x) => x.id === p.id);
      if (same && !(await ask(`${p.id} ${same.ver} is installed. Replace it with ${p.ver}?`, { ok: "Replace" }))) continue;
      const note = arenaNote(p, state.limits);
      await queue(`install ${p.name || p.id} ${p.ver}`, async (prog, sig) => {
        const r = await link.upload("p", "", data, prog, sig);
        msg("plmsg", `${p.id} ${p.ver} installed (${fmtBytes(p.size)}, ${r.kbsPage.toFixed(0)} KB/s)${note ? " - " + note : ""}`);
      });
    }
    await loadPlugins();
    await loadMem();
  }

  // ---- transfers ----------------------------------------------------------------------------------------------------
  let chain = Promise.resolve();
  function queue(title, run) {
    const bar = el("i");
    const info = el("span", { class: "note" }, "waiting");
    const sig = { cancelled: false };
    const cancel = el("button", { class: "small", onclick: () => { sig.cancelled = true; info.textContent = "cancelling…"; } }, "Cancel");
    const row = el("div", { class: "xfer" }, el("span", { class: "xt" }, title), el("span", { class: "bar" }, bar), info, cancel);
    $("xfers").append(row);
    const prog = ({ sent, size, kbs, note }) => {
      bar.style.width = `${size ? (100 * sent) / size : 100}%`;
      info.textContent = `${fmtBytes(sent)} / ${fmtBytes(size)}${kbs ? ` · ${kbs.toFixed(0)} KB/s` : ""}${note ? " · " + note : ""}`;
    };
    const p = chain.then(async () => {
      if (sig.cancelled) throw new Cancelled();
      info.textContent = "starting";
      const t0 = performance.now();
      await run(prog, sig);
      return performance.now() - t0;
    });
    chain = p.catch(() => {});
    return p.then(() => {
      row.classList.add("done");
      cancel.remove();
      setTimeout(() => row.remove(), 8000);
    }, (e) => {
      row.classList.add("failed");
      info.textContent = e instanceof Cancelled ? "cancelled (nothing kept)" : `failed: ${e.message}`;
      cancel.textContent = "Dismiss";
      cancel.onclick = () => row.remove();
    });
  }

  // ---- the card -----------------------------------------------------------------------------------------------------
  function drawFree() {
    const r = state.mem.sd;
    $("cardfree").textContent = r ? (r.free_kb != null ? `${fmtBytes(r.free_kb * 1024)} free of ${fmtBytes(r.size_kb * 1024)} (${r.type})` : `${fmtBytes(r.size_kb * 1024)} (${r.type}), free space not measured`) : state.connected ? "no card" : "";
  }
  function crumbs() {
    const c = $("crumbs");
    c.textContent = "";
    const parts = state.cwd.split("/").filter(Boolean);
    c.append(el("a", { href: "#", onclick: (e) => { e.preventDefault(); go("/"); } }, "card"));
    parts.forEach((p, i) => {
      c.append(" / ", el("a", { href: "#", onclick: (e) => { e.preventDefault(); go("/" + parts.slice(0, i + 1).join("/")); } }, p));
    });
  }
  function drawFiles() {
    crumbs();
    const tb = $("ftable").tBodies[0];
    tb.textContent = "";
    const items = state.items.filter((i) => state.hidden || !i.n.startsWith(".")).sort((a, b) => b.d - a.d || a.n.localeCompare(b.n, undefined, { numeric: true }));
    if (state.cwd !== "/") tb.append(el("tr", { class: "dir" }, el("td"), el("td", { colspan: 4 }, el("a", { href: "#", onclick: (e) => { e.preventDefault(); go(parentPath(state.cwd)); } }, "↰ .."))));
    if (!items.length) tb.append(el("tr", {}, el("td"), el("td", { colspan: 4, class: "note" }, "Empty folder.")));
    for (const it of items) {
      const path = joinPath(state.cwd, it.n);
      const name = it.d ? el("a", { href: "#", onclick: (e) => { e.preventDefault(); go(path); } }, "▸ " + it.n + "/") : el("span", {}, it.n);
      tb.append(el("tr", { class: it.d ? "dir" : "" },
        el("td", {}, el("input", { type: "checkbox", "data-path": path, "data-dir": it.d ? 1 : 0, "aria-label": `select ${it.n}` })),
        el("td", { class: "fname" }, name),
        el("td", { class: "num" }, it.d ? "" : fmtBytes(it.s)),
        el("td", { class: "mono note" }, it.m || ""),
        el("td", { class: "acts" },
          it.d ? null : el("button", { class: "small", onclick: () => download(path, it.s) }, "Download"),
          el("button", { class: "small", onclick: () => rename(path, it.n) }, "Rename"),
          el("button", { class: "small danger", onclick: () => remove([{ path, dir: !!it.d }]) }, "Delete"))));
    }
    $("fsel").checked = false;
  }
  async function go(path) {
    msg("fmsg", "listing…");
    try {
      const r = await link.list(path);
      state.cwd = path;
      state.items = r.items;
      drawFiles();
      msg("fmsg", r.more ? "the first 4000 entries" : `${r.items.length} entries`);
    } catch (e) { msg("fmsg", `${path}: ${e.message}`, true); }
  }
  const refresh = () => go(state.cwd);
  async function download(path, size) {
    await queue(`download ${path.split("/").pop()}`, async (prog, sig) => {
      const data = await link.download(path, prog, sig);
      const a = el("a", { href: URL.createObjectURL(new Blob([data])), download: path.split("/").pop() });
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      if (size != null && data.length !== size) throw new Error(`got ${data.length} B of ${size}`);
    });
  }
  async function rename(path, name) {
    const nn = await ask(`Rename ${name} to:`, { input: name, ok: "Rename" });
    if (!nn || nn === name) return;
    if (nn.includes("/")) { msg("fmsg", "a name without '/'", true); return; }
    try { await link.rename(path, joinPath(parentPath(path), nn)); msg("fmsg", `renamed to ${nn}`); }
    catch (e) { msg("fmsg", `rename: ${e.message}`, true); }
    refresh();
  }
  async function removeTree(path) {   // a folder: its contents first (the Teensy removes only empty folders)
    const r = await link.list(path);
    for (const it of r.items) {
      const p = joinPath(path, it.n);
      if (it.d) await removeTree(p);
      else await link.del(p);
    }
    await link.del(path);
  }
  async function remove(list) {
    if (!list.length) return;
    const dirs = list.filter((x) => x.dir).length;
    const what = list.length === 1 ? list[0].path : `${list.length} items`;
    if (!(await ask(`Delete ${what} from the card${dirs ? " (folders with everything in them)" : ""}? This cannot be undone.`, { ok: "Delete", danger: true }))) return;
    for (const x of list) {
      try { msg("fmsg", `deleting ${x.path}…`); x.dir ? await removeTree(x.path) : await link.del(x.path); }
      catch (e) { msg("fmsg", `${x.path}: ${e.message}`, true); break; }
    }
    state.mem.sd && (state.mem.sd.free_kb = null);
    refresh();
  }
  async function uploadFiles(files) {
    for (const f of files) {
      const path = joinPath(state.cwd, f.name);
      if (state.items.some((i) => i.n === f.name && !i.d) && !(await ask(`${f.name} exists here. Replace it?`, { ok: "Replace" }))) continue;
      queue(`upload ${f.name}`, async (prog, sig) => {
        const data = new Uint8Array(await f.arrayBuffer());
        const r = await link.upload("f", path, data, prog, sig);
        log(`-- uploaded ${path}: ${fmtBytes(r.size)} in ${r.ms} ms (Teensy ${r.kbs} KB/s, page ${r.kbsPage.toFixed(0)} KB/s)`, "me");
      }).then(() => refresh());
    }
  }

  // a folder (dropped, or "Upload folder"): its folders made, then each file, one queue row with the overall bar
  function uploadTree(tree) {
    if (!tree.files.length && !tree.dirs.length) return;
    const base = state.cwd, top = (tree.dirs[0] || tree.files[0].rel).split("/")[0];
    const size = tree.files.reduce((n, x) => n + x.file.size, 0);
    queue(`folder ${top} (${tree.files.length} files, ${fmtBytes(size)})`, async (prog, sig) => {
      const r = await link.putTree(tree, base, prog, sig);
      log(`-- uploaded folder ${joinPath(base, top)}: ${r.files - r.failed.length}/${r.files} files, ${fmtBytes(r.bytes)}`, "me");
      if (r.failed.length) throw new Error(r.failed.map(([f, m]) => `${f}: ${m}`).join("; "));
    }).then(() => refresh());
  }
  const readAll = (dir) => new Promise((ok, bad) => {   // readEntries gives batches until an empty one
    const rd = dir.createReader(), out = [];
    const more = () => rd.readEntries((es) => { if (!es.length) return ok(out); out.push(...es); more(); }, bad);
    more();
  });
  async function walk(entry, rel, out) {
    if (junkName(entry.name)) return;
    if (entry.isFile) { out.push({ rel, file: await new Promise((ok, bad) => entry.file(ok, bad)) }); return; }
    out.push({ rel: rel + "/", dir: true });
    for (const e of await readAll(entry)) await walk(e, rel + "/" + e.name, out);
  }
  function treeWithDirs(list) {   // treeOf, plus empty folders
    const t = treeOf(list.filter((x) => !x.dir));
    for (const x of list) if (x.dir) { const d = x.rel.slice(0, -1); if (!t.dirs.includes(d)) t.dirs.push(d); }
    t.dirs.sort((a, b) => a.split("/").length - b.split("/").length || (a < b ? -1 : 1));
    return t;
  }

  // ---- wiring -------------------------------------------------------------------------------------------------------
  function dropzone(zone, onFiles, accept) {
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("over"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("over");
      const files = [...e.dataTransfer.files].filter((f) => !accept || accept(f));
      if (files.length) onFiles(files);
    });
  }
  dropzone($("pldrop"), installFiles, (f) => /\.rmp$/i.test(f.name));
  // the card's drop: folders whole (webkitGetAsEntry), loose files as before
  $("fdrop").addEventListener("dragover", (e) => { e.preventDefault(); $("fdrop").classList.add("over"); });
  $("fdrop").addEventListener("dragleave", () => $("fdrop").classList.remove("over"));
  $("fdrop").addEventListener("drop", async (e) => {
    e.preventDefault();
    $("fdrop").classList.remove("over");
    const ents = [...(e.dataTransfer.items || [])].map((i) => (i.kind === "file" && i.webkitGetAsEntry ? i.webkitGetAsEntry() : null));
    if (!ents.some((x) => x && x.isDirectory)) { uploadFiles([...e.dataTransfer.files].filter((f) => !junkName(f.name))); return; }
    const loose = [];
    for (const en of ents) {
      if (!en) continue;
      if (en.isFile) { if (!junkName(en.name)) loose.push(await new Promise((ok, bad) => en.file(ok, bad))); continue; }
      const list = [];
      try { await walk(en, en.name, list); } catch (err) { msg("fmsg", `${en.name}: cannot read the folder: ${err.message || err}`, true); continue; }
      uploadTree(treeWithDirs(list));
    }
    if (loose.length) uploadFiles(loose);
  });
  $("fpickdir").onchange = (e) => { uploadTree(treeOf([...e.target.files].map((f) => ({ rel: f.webkitRelativePath, file: f })))); e.target.value = ""; };
  $("plpick").onchange = (e) => { installFiles([...e.target.files]); e.target.value = ""; };
  $("fpick").onchange = (e) => { uploadFiles([...e.target.files]); e.target.value = ""; };
  $("plrefresh").onclick = () => { loadPlugins(); loadMem(); };
  $("plrescan").onclick = () => act("rescan", () => link.plugin("rescan"));
  // ---- the slot list as a file (slotlist.js): export, import (missing machines named), start empty
  $("plexport").onclick = () => {
    const l = slotListExport(state.limits && state.limits.project, state.slots);
    const a = el("a", { href: URL.createObjectURL(new Blob([JSON.stringify(l, null, 1) + "\n"], { type: "application/json" })), download: `${l.project || "project"}.slots.json` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  $("plimport").onclick = () => $("plimpfile").click();
  $("plimpfile").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    let l;
    try { l = slotListParse(await f.text()); } catch (err) { msg("plmsg", `import: ${err.message}`, true); return; }
    const cur = state.limits && state.limits.project;
    if (l.project && cur && l.project !== cur && !(await ask(`This slot list is for project ${l.project}. Apply it to ${cur}?`, { ok: "Apply" }))) return;
    await act(`import ${l.slots.length} slot${l.slots.length === 1 ? "" : "s"}`, async () => { for (const c of slotListCmds(l)) await link.plugin(c); });
    await loadPlugins();
    const miss = slotListMissing(l, state.pkgs);
    msg("plmsg", `imported ${l.slots.length} slot${l.slots.length === 1 ? "" : "s"}` + (miss.length ? " - not installed: " + miss.join(", ") : " - every machine is installed"), miss.length > 0);
  };
  $("plempty").onclick = async () => {
    if (!(await ask("Start this project with U1..U5 empty? Nothing is inherited or filled from the project's sounds.", { ok: "Empty" }))) return;
    await act("start empty", () => link.plugin("empty"));
    await loadPlugins();
  };
  $("memrefresh").onclick = loadMem;
  $("fup").onclick = () => go(parentPath(state.cwd));
  $("frefresh").onclick = refresh;
  $("fhidden").onchange = (e) => { state.hidden = e.target.checked; drawFiles(); };
  $("fmkdir").onclick = async () => {
    const n = await ask("New folder name:", { input: "New folder", ok: "Create" });
    if (!n) return;
    try { await link.mkdir(joinPath(state.cwd, n)); } catch (e) { msg("fmsg", `new folder: ${e.message}`, true); }
    refresh();
  };
  $("fdf").onclick = async () => {
    msg("fmsg", "measuring free space (one scan of the card's allocation table; a few hundred ms on a large card)…");
    try { const r = await link.df(); msg("fmsg", `free space measured in ${r.ms} ms`); await loadMem(); }
    catch (e) { msg("fmsg", `free space: ${e.message}`, true); }
  };
  const selected = () => [...$("ftable").querySelectorAll("tbody input:checked")].map((c) => ({ path: c.dataset.path, dir: c.dataset.dir === "1" }));
  $("fsel").onchange = (e) => $("ftable").querySelectorAll("tbody input[type=checkbox]").forEach((c) => (c.checked = e.target.checked));
  $("fdelsel").onclick = () => remove(selected());
  $("fdlsel").onclick = () => selected().filter((x) => !x.dir).forEach((x) => download(x.path, state.items.find((i) => joinPath(state.cwd, i.n) === x.path)?.s));

  return {
    connected(on) {
      state.connected = on;
      if (on) setTimeout(async () => { await loadMem(); await loadPlugins(); await go(state.cwd); }, 400);
      else { drawPlugins(); drawFree(); }
    },
  };
}
