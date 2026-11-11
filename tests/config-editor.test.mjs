// node --test tests/  (npm test): the config editor's generator and parser, src/lib/sidecar-config.mjs.
// fixtures/card-0.4.4/: config.txt and cmdline.txt from the Sidecar 0.4.4 card zips, unchanged
// (sidecar-pi-sd-05c4818-800x480.zip, -1024x600.zip; their sha256 are in that release's BUILD-INFO-pi.txt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as C from '../src/lib/sidecar-config.mjs';

const fx = (f) => readFileSync(new URL(`./fixtures/card-0.4.4/${f}`, import.meta.url), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const CARD800 = fx('config-800x480.txt');
const CARD1024 = fx('config-1024x600.txt');
const CARDCMD = fx('cmdline.txt');

const opts = (f) => { const o = C.defaults(); f(o); return o; };
const settings = (text, board) => {
  // what a board's firmware reads ([all] and its own sections; the last value wins), as make-sd-dual.sh checks it
  let on = true;
  const out = {};
  for (let l of text.split('\n')) {
    l = l.split('#', 1)[0].trim();
    if (!l) continue;
    if (l.startsWith('[')) { on = l === '[all]' || l === `[${board}]`; continue; }
    if (!on) continue;
    const i = l.includes('=') ? l.indexOf('=') : l.indexOf(' ');
    out[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  return out;
};

test('the fixtures are the release card files (BUILD-INFO-pi.txt sha256)', () => {
  assert.equal(sha(CARD800), '1801ad8dcf7b0924f456966d5f79ca6263f0a9cc8ab3a937dd0c9122e0b9abd5');
  assert.equal(sha(CARD1024), '6585c867c4497cb2e5fae8fa3f62c6ca2d6ed61d764fb02dae48403bac27d3d9');
  assert.equal(CARDCMD, 'sdport=0 socmaxtemp=78\n');
});

test('defaults reproduce the 800x480 card byte for byte', () => {
  const o = C.defaults();
  assert.equal(C.generateConfig(o), CARD800);
  assert.equal(C.generateCmdline(o), CARDCMD);
  assert.deepEqual(C.check(o).errors, []);
});

test('HDMI 1024x600 reproduces the 1024x600 card byte for byte', () => {
  const o = opts((o) => { o.display = 'hdmi1024'; });
  assert.equal(C.generateConfig(o), CARD1024);
  assert.equal(C.generateCmdline(o), CARDCMD);
});

test('no display: the HDMI lines commented out as make-sd-dual.sh NO_DISPLAY=1 does', () => {
  const o = opts((o) => { o.display = 'none'; });
  const want = CARD800.split('\n');
  // the two HDMI blocks, from the [pi4] / [pi5] above each hdmi_force_hotplug=1
  const lines = CARD800.split('\n');
  const start4 = lines.indexOf('hdmi_force_hotplug=1') - 1; // the [pi4] above the first hdmi_force_hotplug
  const start5 = lines.lastIndexOf('hdmi_force_hotplug=1') - 1;
  for (const [s, n] of [[start4, 6], [start5, 7]]) for (let i = s; i < s + n; i++) want[i] = `# ${lines[i]}`;
  assert.equal(C.generateConfig(o), want.join('\n'));
  assert.equal(C.generateCmdline(o), 'sdport=0 socmaxtemp=78 display=0\n');
  assert.equal(settings(C.generateConfig(o), 'pi4').hdmi_force_hotplug, undefined);
  assert.equal(settings(C.generateConfig(o), 'pi4').kernel, 'sdboot.img');
});

test('the release files parse back to the defaults with nothing kept', () => {
  for (const [cfg, disp] of [[CARD800, 'hdmi800'], [CARD1024, 'hdmi1024']]) {
    const { options, notes } = C.fromFiles(cfg, CARDCMD);
    assert.deepEqual(notes, []);
    assert.equal(options.board, 'dual');
    assert.equal(options.display, disp);
    assert.deepEqual(options.keptConfig, []);
    assert.deepEqual(options.keptCmdline, []);
    assert.equal(C.generateConfig(options), cfg);
    assert.equal(C.generateCmdline(options), CARDCMD);
  }
});

test('Pi 5 + Touch Display 2, upside down', () => {
  const o = opts((o) => { o.board = 'pi5'; o.display = 'td2'; o.rotate = 'flip'; o.cmd.uistyle = 'classic'; });
  const cfg = C.generateConfig(o);
  const cmd = C.generateCmdline(o);
  assert.equal(cmd, 'sdport=0 socmaxtemp=78 dsi_rotate=90 uistyle=classic\n');
  assert.ok(!cfg.includes('[pi4]'), 'no [pi4] section on a Pi 5 file');
  assert.ok(!cfg.includes('kernel=sdboot.img') && !cfg.includes('# sidecar sdboot begin'), 'no sdboot block on a Pi 5 file');
  assert.ok(!/^lcd_rotate/m.test(cfg), 'lcd_rotate does nothing on a Pi 5');
  const s = settings(cfg, 'pi5');
  assert.equal(s.kernel, 'kernel_2712.img');
  assert.equal(s.arm_64bit, '1');
  assert.equal(s.hdmi_force_hotplug, '1');
  assert.ok(cfg.endsWith('hdmi_cvt=800 480 60 6 0 0 0\n'));
  assert.deepEqual(C.check(o).errors, []);
  // and back
  const { options } = C.fromFiles(cfg, cmd);
  assert.equal(options.board, 'pi5');
  assert.equal(options.display, 'td2');
  assert.equal(options.rotate, 'flip');
  assert.equal(options.cmd.uistyle, 'classic');
  assert.deepEqual(options.keptConfig, []);
  // the normal way up writes nothing
  o.rotate = 'normal';
  assert.equal(C.generateCmdline(o), 'sdport=0 socmaxtemp=78 uistyle=classic\n');
});

test('Touch Display 2 on a Pi 4 is an error, on a dual card a warning', () => {
  assert.ok(C.check(opts((o) => { o.board = 'pi4'; o.display = 'td2'; })).errors.length > 0);
  const c = C.check(opts((o) => { o.display = 'td2'; }));
  assert.equal(c.errors.length, 0);
  assert.ok(c.warnings.some((w) => /Pi 5 only/.test(w)));
});

test('dual card: both boards boot, each reads its own lines', () => {
  const o = opts((o) => { o.display = 'dsi1'; o.rotate = 'flip'; });
  const cfg = C.generateConfig(o);
  const p4 = settings(cfg, 'pi4');
  const p5 = settings(cfg, 'pi5');
  assert.equal(p4.kernel, 'sdboot.img');
  assert.equal(p4.initramfs, 'engine.img 0x02000000');
  assert.equal(p4.armstub, 'armstub8-rpi4.bin');
  assert.equal(p4.lcd_rotate, '2');
  assert.equal(p5.kernel, 'kernel_2712.img');
  assert.equal(p5.lcd_rotate, undefined);
  assert.equal(C.generateCmdline(o), 'sdport=0 socmaxtemp=78 dsi_rotate=180\n');
  const back = C.fromFiles(cfg, C.generateCmdline(o)).options;
  assert.equal(back.display, 'dsi1');
  assert.equal(back.rotate, 'flip');
  assert.deepEqual(back.keptConfig, []);
});

test('Pi 4 only: no [pi5] lines, the sdboot block kept exactly', () => {
  const cfg = C.generateConfig(opts((o) => { o.board = 'pi4'; }));
  assert.ok(!cfg.includes('[pi5]'));
  const block = CARD800.slice(CARD800.indexOf('# The Pi 4: sdboot.img'));
  assert.ok(cfg.endsWith(block));
  assert.equal(C.fromFiles(cfg, null).options.board, 'pi4');
});

test('other HDMI size: the mode in both sections, the comment says the size', () => {
  const o = opts((o) => { o.display = 'hdmiOther'; o.hdmiW = 1280; o.hdmiH = 800; });
  const cfg = C.generateConfig(o);
  assert.equal(settings(cfg, 'pi4').hdmi_cvt, '1280 800 60 5 0 0 0', '16:10: aspect 5');
  assert.equal(settings(cfg, 'pi5').hdmi_cvt, '1280 800 60 5 0 0 0');
  assert.equal(settings(cfg, 'pi5').framebuffer_width, '1280');
  assert.ok(cfg.includes("# The Pi 4's 1280x800 HDMI display"));
  const back = C.fromFiles(cfg, null).options;
  assert.deepEqual([back.display, back.hdmiW, back.hdmiH], ['hdmiOther', 1280, 800]);
  o.hdmiW = 12;
  assert.ok(C.check(o).errors.length > 0);
});

test('cmdline.txt is always one line, whatever goes in', () => {
  const o = C.defaults();
  for (const k of C.KEYS) {
    if (k.values) o.cmd[k.key] = k.values[k.values.length - 1];
    else if (k.int) o.cmd[k.key] = String(k.int[1]);
  }
  o.cmd.ip = '192.168.1.50';
  o.cmd.netmask = '255.255.255.0';
  o.cmd.touchscreen = '0,4095,0,4095';
  o.cmd.emuhost = '192.168.1.2:7301';
  o.pair = { mode: 'fixed', code: '13572468' };
  o.display = 'none';
  // a pasted file with tabs, CRLF and newlines inside: the kept tokens come back one space apart
  const p = C.parseCmdline('sdport=0\tfoo=bar\r\n  loglevel=4\n\nusbpowerdelay=1000 \n');
  o.keptCmdline = p.kept;
  const text = C.generateCmdline(o);
  assert.equal(text.indexOf('\n'), text.length - 1, 'exactly one newline, at the end');
  assert.ok(!/[\r\t]|  /.test(text));
  assert.ok(text.includes('foo=bar loglevel=4 usbpowerdelay=1000\n'));
  assert.ok(text.includes('paircode=13572468'));
  // bad values are never written (and are reported)
  const b = C.defaults();
  b.cmd.ip = '300.1.1.1';
  b.cmd.uistyle = 'neon';
  b.cmd.recbuf = 'lots of';
  assert.equal(C.generateCmdline(b), 'sdport=0 socmaxtemp=78\n');
  assert.equal(C.check(b).errors.length, 3);
  // an empty file is a single newline
  const e = C.defaults();
  e.cmd.sdport = '';
  e.cmd.socmaxtemp = '';
  assert.equal(C.generateCmdline(e), '\n');
});

test('unknown cmdline tokens are kept; a managed key set in the form replaces a kept token', () => {
  const p = C.parseCmdline('sdport=0 socmaxtemp=78 uistyle=neon osupdate=rytm logdev=tty1 paircode=12 display=0');
  assert.deepEqual(p.kept, ['uistyle=neon', 'osupdate=rytm', 'logdev=tty1', 'paircode=12']);
  assert.equal(p.display, 'none');
  const o = C.fromFiles(null, 'sdport=0 uistyle=neon logdev=tty1').options;
  assert.equal(o.cmd.socmaxtemp, '', 'not in the file: the firmware default');
  assert.equal(C.generateCmdline(o), 'sdport=0 uistyle=neon logdev=tty1\n');
  o.cmd.uistyle = 'oled';
  assert.equal(C.generateCmdline(o), 'sdport=0 uistyle=oled logdev=tty1\n');
});

test('pairing code: off and fixed are written, a bad code never is', () => {
  const o = C.defaults();
  o.pair = { mode: 'off', code: '' };
  assert.ok(C.generateCmdline(o).includes(' paircode=0'));
  assert.ok(C.check(o).warnings.some((w) => /private network/.test(w)));
  o.pair = { mode: 'fixed', code: '1234' };
  assert.ok(!C.generateCmdline(o).includes('paircode'));
  assert.ok(C.check(o).errors.length === 1);
  assert.equal(C.fromFiles(null, 'paircode=0').options.pair.mode, 'off');
  assert.deepEqual(C.fromFiles(null, 'paircode=87654321').options.pair, { mode: 'fixed', code: '87654321' });
});

test('config.txt: unknown lines are kept under their section; comments are not', () => {
  const text = CARD800.replace('max_framebuffers=2\n', 'max_framebuffers=2\ndtparam=audio=on\n# my note\n')
    .replace('[all]\narm_64bit=1\n', '[all]\narm_64bit=1\ngpu_mem=64\n')
    + '[EDID=GeeekPi]\nhdmi_cvt=1024 600 60 6 0 0 0\n';
  const p = C.parseConfig(text);
  // the file's last filter before [EDID=...] is the sdboot block's [pi4]: the two combine, so the chain is kept whole
  assert.deepEqual(p.kept.map(({ section, line }) => ({ section, line })), [
    { section: 'all', line: 'gpu_mem=64' },
    { section: 'pi4', line: 'dtparam=audio=on' },
    { section: 'pi4][EDID=GeeekPi', line: 'hdmi_cvt=1024 600 60 6 0 0 0' },
  ]);
  assert.equal(p.display, 'hdmi800');
  const o = C.fromFiles(text, null).options;
  const out = C.generateConfig(o);
  assert.ok(out.startsWith(CARD800));
  assert.ok(out.endsWith('[all]\ngpu_mem=64\n[all]\n[pi4]\ndtparam=audio=on\n[all]\n[pi4]\n[EDID=GeeekPi]\nhdmi_cvt=1024 600 60 6 0 0 0\n'));
  assert.equal(settings(out, 'pi4').dtparam, 'audio=on');
  // a kept line the docs forbid is warned about
  const bad = C.fromFiles(CARD800 + '[all]\ndtoverlay=vc4-kms-v3d\n', null).options;
  assert.ok(C.check(bad).warnings.some((w) => /vc4-kms-v3d/.test(w)));
  // CRLF and a BOM read the same
  assert.deepEqual(C.parseConfig('﻿' + CARD800.replace(/\n/g, '\r\n')).kept, []);
});

test('the Pi 5 card make-sd-pi5.sh writes parses as a Pi 5 file', () => {
  const pi5 = '# Sidecar Pi engine, Raspberry Pi 5 (docs/pi5.md)\narm_64bit=1\nkernel_address=0x80000\ninitial_turbo=0\nenable_uart=1\ndisable_splash=1\nboot_delay=0\nos_check=0\n\n[pi5]\nkernel=kernel_2712.img\n';
  const p = C.parseConfig(pi5);
  assert.equal(p.board, 'pi5');
  // its [all] lines that the dual card has under [pi5] are kept, so nothing the Pi read is lost
  assert.deepEqual(p.kept.map((k) => k.line), ['enable_uart=1', 'disable_splash=1', 'boot_delay=0', 'os_check=0']);
});

test('sidecar-wifi.txt: the firmware\'s checks, and values it would trim are quoted', () => {
  const w = { enabled: true, ssid: 'Home', psk: 'correct horse', band: '2g', open: false };
  assert.deepEqual(C.checkWifi(w), []);
  assert.equal(C.generateWifi(w).split('\n').filter((l) => !l.startsWith('#')).join('|'), 'ssid=Home|psk=correct horse|');
  assert.ok(C.generateWifi({ ...w, band: '5g' }).includes('\nband=5g\n'));
  assert.ok(C.generateWifi({ ...w, ssid: ' Cafe ' }).includes('ssid=" Cafe "'));
  assert.ok(C.generateWifi({ ...w, psk: '"quoted"x"' }).includes('psk=""quoted"x""'));
  assert.ok(C.generateWifi({ ...w, psk: '"abcdefgh"' }).includes('psk=""abcdefgh""'));
  assert.equal(C.checkWifi({ ...w, psk: 'short' }).length, 1);
  assert.equal(C.checkWifi({ ...w, psk: 'a'.repeat(64) }).length, 0);
  assert.equal(C.checkWifi({ ...w, psk: 'g'.repeat(64) }).length, 1);
  assert.equal(C.checkWifi({ ...w, ssid: 'x'.repeat(33) }).length, 1);
  assert.equal(C.checkWifi({ ...w, ssid: 'é'.repeat(17) }).length, 1, '34 bytes');
  assert.equal(C.checkWifi({ ...w, open: true }).length, 1, 'open takes no password');
  const open = C.generateWifi({ ...w, open: true, psk: '' });
  assert.ok(open.includes('\nopen=1\n') && !open.includes('psk'));
  // the Wi-Fi file never reaches cmdline.txt or config.txt
  const o = C.defaults();
  o.wifiFile = w;
  assert.ok(!C.generateCmdline(o).includes('correct') && !C.generateConfig(o).includes('correct'));
});

test('every cmdline key the editor writes for a version is one that version reads', () => {
  // GetAppOption* keys in pi/engine + pi/ui: sidecar-firmware v0.4.4, and the 0.5.0 line (merge/050-features ea80c4f);
  // ip/netmask (NetOption), screensaver/brightness/touchtest (the display settings' Value), and Circle's own options
  const k044 = 'a4 a4att a4ch bench capch cardq cpumhz display dsi dsi_port dsi_rotate dsitouch_inv emuhost fifo gadget idlewfe link midifake mirrorhold mirrormargin mirrorname msampram notes nvme obblocks obctr obout oboutdelay oburbs osupdate out paircode poolmono poolram recbuf res sampleram sdport selftest split testcard testsecs tohost trimpost trimpre uac2test uistyle um usb usbmidi usbreboot voicebudget web wifi ip netmask screensaver brightness touchtest'.split(' ');
  const k050 = [...k044, ...'net plugram updtrial usbip usbnet usbquiet usbtrust usbwait webupdate'.split(' ')];
  const circle = ['width', 'height', 'socmaxtemp', 'touchscreen'];
  for (const [v, list] of [['0.4.4', k044], ['0.5.0', k050]]) {
    // everything set: only keys of that version come out
    const o = C.defaults(v);
    for (const k of C.KEYS) o.cmd[k.key] = k.values ? k.values[k.values.length - 1] : k.int ? String(k.int[0]) : k.usbip ? '10.0.0.1' : k.ip ? '10.0.0.2' : '';
    o.cmd.touchscreen = '0,1,0,1';
    o.cmd.emuhost = '10.0.0.3:7301';
    o.display = 'none';
    o.pair = { mode: 'off', code: '' };
    for (const t of C.cmdlineTokens(o)) {
      const k = t.split('=')[0];
      assert.ok(list.includes(k) || circle.includes(k), `${v}: ${k}`);
    }
  }
});

test('0.5.0: the default files are what the 0.5.0 card scripts write, byte for byte', () => {
  const f = (n) => readFileSync(new URL(`./fixtures/card-0.5.0/${n}`, import.meta.url), 'utf8');
  const o = C.defaults('0.5.0');
  assert.equal(C.generateConfig(o), f('config-800x480.txt'));
  assert.equal(C.generateCmdline(o), f('cmdline.txt'));
  o.display = 'hdmi1024';
  assert.equal(C.generateConfig(o), f('config-1024x600.txt'));
});

test('0.5.0-only keys: written for 0.5.0, never for 0.4.4; a loaded one is kept and said', () => {
  const o = C.defaults('0.5.0');
  o.cmd.webupdate = '0';
  o.cmd.net = 'usb';
  o.cmd.usbip = '172.31.77.2';
  assert.equal(C.generateCmdline(o), 'sdport=0 socmaxtemp=78 webupdate=0 net=usb usbip=172.31.77.2\n');
  assert.ok(C.check(o).warnings.some((w) => /webupdate=0/.test(w)));
  // the same options for 0.4.4: none of them written
  const old = C.retarget(o, '0.4.4');
  assert.equal(C.generateCmdline(old), 'sdport=0 socmaxtemp=78\n');
  assert.deepEqual(C.check(old).errors, []);
  // and back: they return
  assert.equal(C.generateCmdline(C.retarget(old, '0.5.0')), C.generateCmdline(o));
  // a 0.4.4 card file with webupdate=0: kept as is, with a note and a warning
  const r = C.fromFiles(null, 'sdport=0 socmaxtemp=78 webupdate=0 usbnet=off', '0.4.4');
  assert.deepEqual(r.options.keptCmdline, ['webupdate=0', 'usbnet=off']);
  assert.equal(r.notes.length, 2);
  assert.ok(/does not read webupdate=/.test(r.notes[0]));
  assert.equal(C.generateCmdline(r.options), 'sdport=0 socmaxtemp=78 webupdate=0 usbnet=off\n');
  assert.equal(C.check(r.options).warnings.filter((w) => /does not read/.test(w)).length, 2);
  // switching that to 0.5.0 makes them form values
  const n = C.retarget(r.options, '0.5.0');
  assert.deepEqual(n.keptCmdline, []);
  assert.equal(n.cmd.webupdate, '0');
  assert.equal(n.cmd.usbnet, 'off');
  // loaded as 0.5.0 directly: no notes
  assert.deepEqual(C.fromFiles(null, 'webupdate=0', '0.5.0').notes, []);
  // usbip: the firmware's rules
  for (const [ip, ok] of [['172.31.77.1', true], ['10.1.2.3', true], ['127.0.0.1', false], ['0.1.2.3', false], ['224.0.0.1', false], ['10.0.0.0', false], ['10.0.0.255', false]])
    assert.equal(C.validValue('usbip', ip), ok, ip);
});

test('hdmi_cvt aspect code per size', () => {
  const cases = [[800, 480, 6], [1024, 600, 6], [1280, 800, 5], [1920, 1200, 5], [1440, 900, 5], [1280, 720, 3], [1920, 1080, 3],
    [1024, 768, 1], [640, 480, 1], [1280, 1024, 4], [1400, 900, 2]];
  for (const [w, h, a] of cases) {
    assert.equal(C.hdmiAspect(w, h), a, `${w}x${h}`);
    const o = opts((o) => { o.display = 'hdmiOther'; o.hdmiW = w; o.hdmiH = h; });
    const cfg = C.generateConfig(o);
    assert.equal(settings(cfg, 'pi4').hdmi_cvt, `${w} ${h} 60 ${a} 0 0 0`);
    // read back as the same display, the card's own hdmi_cvt line not kept twice
    const back = C.fromFiles(cfg, null).options;
    assert.deepEqual(back.keptConfig, []);
    assert.equal(C.generateConfig(back), cfg);
  }
  // a card with the old aspect 6 on 1280x800 reads as that size and comes out with 5, nothing kept
  const oldCard = CARD800.replaceAll('800 480 60 6 0 0 0', '1280 800 60 6 0 0 0');
  const b = C.fromFiles(oldCard, null).options;
  assert.deepEqual([b.display, b.hdmiW, b.hdmiH, b.keptConfig.length], ['hdmiOther', 1280, 800, 0]);
});

// ---- review fixes
test('a DSI-only card (no HDMI lines, the card comments kept) does not load as "no display"', () => {
  const dsi = CARD800.split('\n').filter((l) => !/^(hdmi_|disable_overscan|framebuffer_)/.test(l) && l !== '[pi4]' || l === '[pi4]').join('\n');
  const o = C.fromFiles(dsi, CARDCMD).options;
  assert.notEqual(o.display, 'none');
  assert.ok(!C.generateCmdline(o).includes('display=0'));
  // the editor's own "no display" output still loads as none
  const none = C.defaults(); none.display = 'none';
  assert.equal(C.fromFiles(C.generateConfig(none), null).options.display, 'none');
});

test('a dsi_rotate in cmdline keeps a loaded HDMI size', () => {
  for (const [cfg, size] of [[CARD1024, '1024 600'], [C.generateConfig(opts((o) => { o.display = 'hdmiOther'; o.hdmiW = 1280; o.hdmiH = 800; })), '1280 800']]) {
    const out = C.generateConfig(C.fromFiles(cfg, 'sdport=0 dsi_rotate=270').options);
    const cvt = out.split('\n').filter((l) => l.startsWith('hdmi_cvt='));
    assert.deepEqual(cvt.map((l) => l.slice(9, 9 + size.length)), [size, size]);
  }
});

test('kept config lines keep their combined section filters', () => {
  const cfg = CARD800 + '\n[all]\n[pi5]\n[HDMI:1]\nhdmi_mode=4\n[pi4]\nfoo=1\n';
  const out = C.generateConfig(C.fromFiles(cfg, null).options);
  const kept = out.slice(out.indexOf('# Kept as is'));
  const lines = kept.split('\n');
  const i = lines.indexOf('hdmi_mode=4');
  assert.deepEqual(lines.slice(i - 3, i), ['[all]', '[pi5]', '[HDMI:1]']);
  // foo=1: [pi4] with HDMI:1 still in force, so its own full chain
  const j = lines.indexOf('foo=1');
  assert.deepEqual(lines.slice(j - 3, j), ['[all]', '[HDMI:1]', '[pi4]']);
  assert.equal(settings(out, 'pi4').hdmi_mode, '87');
  assert.equal(settings(out, 'pi5').hdmi_mode, '87');
});

test('a second, different [pi5] hdmi_cvt is kept and noted', () => {
  const two = CARD800 + '\n[pi5]\nhdmi_cvt=1920 1080 60 3 0 0 0\n';
  const r = C.fromFiles(two, null);
  assert.ok(r.options.keptConfig.some((k) => k.line === 'hdmi_cvt=1920 1080 60 3 0 0 0'));
  assert.ok(r.notes.some((n) => n.includes('1920 1080')));
  assert.ok(C.generateConfig(r.options).includes('hdmi_cvt=1920 1080 60 3 0 0 0'));
});

test('a card without the sdboot block keeps it out, with a note, and it can be put back', () => {
  const nob = CARD800.replace(/# sidecar sdboot begin[\s\S]*# sidecar sdboot end\n/, '');
  assert.ok(!nob.includes('kernel=sdboot.img'));
  const r = C.fromFiles(nob, null);
  assert.ok(r.notes.some((n) => /sdboot/.test(n)));
  assert.ok(!C.generateConfig(r.options).includes('kernel=sdboot.img'));
  r.options.sdboot = true;
  assert.ok(C.generateConfig(r.options).includes('kernel=sdboot.img'));
  // the release card itself: no note
  assert.deepEqual(C.fromFiles(CARD800, null).notes, []);
});
