// The Sidecar card's config.txt, cmdline.txt and sidecar-wifi.txt as pure functions: options -> text, text -> options.
// Used by the config editor page (src/components/ConfigEditor.astro) and by tests/config-editor.test.mjs.
//
// Ground truth, Sidecar 0.4.4 (card 05c4818):
// - config.txt: the text sidecar-firmware's pi/circle/make-sd-dual.sh writes (HDMI_RES=800x480 / 1024x600,
//   NO_DISPLAY=1), the sdboot block from pi/circle/sdboot.py. The defaults reproduce the release card's files byte for byte.
// - cmdline.txt: the keys the engine reads (GetAppOption* in pi/engine, pi/ui) and Circle's own documented ones (width,
//   height, socmaxtemp, touchscreen), as docs/pi-engine.md "Options", docs/pi-display.md and docs/pi5.md describe them.
// - sidecar-wifi.txt: pi/engine/wifi_conf.cpp parse_import / check_join (docs/pi-engine.md "Wi-Fi without a cable").
// Nothing here is stored anywhere: the page keeps the options in memory only.

export const CARD = { version: '0.4.4', commit: '05c4818', cmdline: 'sdport=0 socmaxtemp=78' };

// The Sidecar versions the editor writes for. A key is written only for a version that reads it (KEYS' since). 0.5.0:
// the 0.5.0 line (sidecar-firmware merge/050-features ea80c4f); its card scripts write the same default files as 0.4.4.
export const VERSIONS = [
  { id: '0.4.4', label: '0.4.4', note: 'the current release', commit: '05c4818', cmdline: 'sdport=0 socmaxtemp=78' },
  { id: '0.5.0', label: '0.5.0', note: 'coming', commit: null, cmdline: 'sdport=0 socmaxtemp=78' },
];
const vIndex = (v) => VERSIONS.findIndex((x) => x.id === v);

export const BOARDS = ['dual', 'pi4', 'pi5'];
export const DISPLAYS = ['hdmi800', 'hdmi1024', 'hdmiOther', 'td2', 'dsi1', 'none'];

// ---------------------------------------------------------------------------------------------------------------------
// cmdline.txt keys. Each: the default the firmware uses when the key is absent (def, text for people), the values it
// takes (values: a list, or int: [min, max], or a pattern), a group and a one-line explanation. A value '' in the
// options means "not in the file" (the firmware's default). Keys the display, network and pairing sections own are
// written from those (display, dsi_rotate, paircode) and are not in this table.

export const KEYS = [
  // the release card's two keys, first, in the card's order
  { key: 'sdport', group: 'network', def: '1 (the card sets 0)', values: ['0', '1'], label: 'Network install port (TCP 7310)',
    help: 'sdport=0 (the release card) turns off writing boot files over the network; 1 lets sdboot.py install a kernel over the network (behind the pairing code).' },
  { key: 'socmaxtemp', group: 'temp', def: '60 (the card sets 78)', int: [40, 78], label: 'Temperature limit (°C)',
    help: "Circle's throttle: above this the Pi drops its clock to 600 MHz (a Pi 5 to 1500) and raises it 3 °C below. 78 is the highest allowed; the firmware still protects itself at 80 and 85 °C." },
  // display
  { key: 'res', group: 'display', def: 'auto', values: ['auto', '800x480', '1024x600', '1280x720'], label: 'UI layout size',
    help: 'The touchscreen UI\'s size. Auto follows the frame buffer (and the EDID on a Pi 5, 1280x720 on Touch Display 2). A size that does not fit is refused.' },
  { key: 'uistyle', group: 'display', def: 'oled', values: ['oled', 'classic'], label: 'UI style',
    help: 'The touchscreen theme, also for the boot screen: OLED (dot matrix) or CLASSIC (the Rytm MKII look). Wins over Settings > Display.' },
  { key: 'dsi', group: 'display', def: '1', values: ['0', '1'], label: 'Use a DSI display',
    help: '0: draw on HDMI even with a DSI display connected (and no DSI touch).' },
  { key: 'dsi_port', group: 'display', def: '2 (both, DISP0 first)', values: ['0', '1', '2'], boards: ['pi5'], label: 'DSI port (Pi 5)',
    help: 'Pi 5: look for the DSI display only on CAM/DISP 0 or 1 (2: both, DISP0 first).' },
  { key: 'dsitouch_inv', group: 'display', def: '0', values: ['0', '1', '2', '3'], label: 'DSI touch mirror',
    help: 'DSI touch mirrored: 1 x, 2 y, 3 both. Swapped axes are not handled.' },
  { key: 'touchscreen', group: 'display', def: '(the touch controller\'s range)', pattern: /^\d{1,5},\d{1,5},\d{1,5},\d{1,5}$/,
    placeholder: 'minx,maxx,miny,maxy', label: 'USB touch range',
    help: "Circle's touch calibration, minx,maxx,miny,maxy. Settings > Display > Touch cal on the touchscreen is easier and wins over it." },
  { key: 'width', group: 'display', def: '(the display\'s)', int: [320, 3840], label: 'Frame buffer width',
    help: 'Pi 4: the frame buffer size, for an HDMI display other than 800x480 (with height=). Pi 5: the UI\'s size (scaled to the firmware\'s mode).' },
  { key: 'height', group: 'display', def: '(the display\'s)', int: [240, 2160], label: 'Frame buffer height',
    help: 'With width=, as above.' },
  { key: 'screensaver', group: 'display', def: '60', int: [0, 1440], label: 'Screensaver (minutes)',
    help: 'Minutes without a touch before the screen goes dark; 0 never. Overrides Settings > Display at boot.' },
  { key: 'brightness', group: 'display', def: '100', int: [5, 100], label: 'Brightness (%)',
    help: 'The display brightness at boot, 5 to 100. Overrides Settings > Display.' },
  { key: 'touchtest', group: 'display', def: '1', values: ['0', '1'], label: 'Touch test on the home page',
    help: '0 hides the home page\'s touch test panel (the SIDECAR panel shows instead).' },
  // network
  { key: 'ip', group: 'network', def: '169.254.61.60', ip: true, label: 'Ethernet address',
    help: "The Pi's address on the Ethernet cable (no DHCP there). The default is a link-local address: a computer with no manual address reaches it." },
  { key: 'netmask', group: 'network', def: '255.255.0.0', ip: true, label: 'Ethernet netmask', help: 'With ip=.' },
  { key: 'web', group: 'network', def: '1', values: ['0', '1'], label: 'Web page',
    help: 'The web page at http://sidecar.local; 0: no web server and no mDNS (the network stays up).' },
  { key: 'wifi', group: 'network', def: '(the saved setting)', values: ['on', 'scan', 'off'], label: 'Wi-Fi at boot',
    help: 'Not set: Wi-Fi as saved in /.rytm/wifi.txt (off on a new card). on: join the saved network; scan: the chip up for scans, Ethernet stays; off: Ethernet.' },
  // USB-C
  { key: 'usb', group: 'usb', def: 'sidecar', values: ['sidecar', 'mirror'], label: 'USB-C mode',
    help: 'sidecar: CLASS COMPLIANT, the Sidecar\'s own audio and MIDI device. mirror: OVERBRIDGE, the attached Rytm passed through to the computer. A mode saved on the unit (Settings, SIDECAR menu) wins.' },
  { key: 'gadget', group: 'usb', def: 'sidecar (on)', values: ['sidecar', '0'], label: 'USB-C to a computer',
    help: 'gadget=0 turns the USB-C audio and MIDI device off on both boards.' },
  { key: 'mirrorhold', group: 'usb', def: '10', int: [0, 600], label: 'Overbridge hold (seconds)',
    help: 'OVERBRIDGE mode: the seconds the box may be gone before the Sidecar device comes back on USB-C.' },
  { key: 'usbmidi', group: 'usb', def: 'os:off', values: ['os:off', 'os:on', 'os:emu'], label: 'Rytm OS updates over USB-C',
    help: 'os:on lets Elektron Transfer upgrade the Rytm\'s OS through the Sidecar\'s USB-C MIDI port; os:emu only towards rytm-emu. Off by default.' },
  // 0.5.0: the web update and the USB-C network (docs/web-update.md, docs/usb-network.md)
  { key: 'webupdate', since: '0.5.0', group: 'network', def: '1', values: ['0', '1'], label: 'Update from the web page',
    help: 'Settings › Update on the web page installs a .scu update file, on trial, going back by itself if it does not start. 0 turns it off: the card is then updated in a computer.' },
  { key: 'net', since: '0.5.0', group: 'network', def: 'auto', values: ['auto', 'usb', 'wifi', 'lan'], label: 'Network at boot',
    help: 'auto: the USB-C network when a computer on USB-C starts its network driver at boot, else Wi-Fi or Ethernet. usb: always USB-C; wifi: never USB-C (Wi-Fi if stored, else Ethernet); lan: Ethernet even with Wi-Fi stored.' },
  { key: 'usbnet', since: '0.5.0', group: 'usb', def: 'on', values: ['on', 'off'], label: 'USB-C network',
    help: 'The network function in the USB-C device (the web page over the cable). off: the USB-C device as in 0.4.2, byte for byte.' },
  { key: 'usbip', since: '0.5.0', group: 'usb', def: '172.31.77.1', usbip: true, label: 'USB-C network address',
    help: 'The Pi\'s address on the cable (/24); the computer gets .2 by DHCP (.1 when the Pi is .2). Not 0.x, 127.x, multicast, or a .0 / .255 host.' },
  { key: 'usbwait', since: '0.5.0', group: 'usb', def: '5', int: [1, 30], label: 'USB-C network wait (s)',
    help: 'net=auto: how long a computer on USB-C may take to start its network driver at boot.' },
  { key: 'usbquiet', since: '0.5.0', group: 'usb', def: '700', int: [100, 5000], label: 'USB-C quiet time (ms)',
    help: 'net=auto: no USB traffic this long after the device starts means no computer.' },
  { key: 'usbtrust', since: '0.5.0', group: 'usb', def: '1', values: ['1', '0'], label: 'Trust the USB-C cable',
    help: '1: no pairing code over the USB-C cable. 0: the code there too, as on Wi-Fi and Ethernet.' },
  // performance
  { key: 'cpumhz', group: 'temp', def: '1500', values: ['1500', '1200', '1000'], label: 'CPU clock (MHz)',
    help: '1500 is the board\'s full clock (a Pi 5 keeps its 2400); 1200 and 1000 run cooler (a Pi 5: 1500). Wins over Settings > System.' },
  // sound and engine
  { key: 'out', group: 'engine', def: 'tracks', values: ['tracks', 'main'], label: 'Voice outputs',
    help: 'tracks: each voice on its track\'s Overbridge channel (what the Rytm mods expect); main: summed on MAIN (a stock Rytm).' },
  { key: 'notes', group: 'engine', def: 'off', values: ['off', 'on'], label: 'MIDI notes play voices',
    help: 'MIDI channels 1-8 play voices 1-8 (the note adapter; not needed with the mods).' },
  { key: 'nvme', group: 'engine', def: '0', values: ['0', '1'], boards: ['pi5'], label: 'NVMe SSD (Pi 5)',
    help: 'Pi 5: look for an NVMe SSD on the PCIe connector at boot.' },
  { key: 'recbuf', group: 'engine', def: 'auto', int: [0, 1024], label: 'Recorder memory (MB)',
    help: 'The recorder\'s memory, reserved at boot. Auto: up to 256 MB (about 55 s of all channels on a Pi 4), 64 MB on a 1 GB board; 0 turns recording off.' },
  { key: 'poolram', group: 'engine', def: '1024 (3072 on 8 GB)', int: [64, 6144], label: 'Pool RAM (MB)',
    help: 'The sample cache shared by GRANULAR, DSP SAMPLE and MULTISAMPLE.' },
  { key: 'sampleram', group: 'engine', def: '256 (on)', values: ['0'], label: 'DSP SAMPLE from RAM',
    help: '0: DSP SAMPLE streams from the card only; any other value keeps it in the pool RAM.' },
  { key: 'a4', group: 'engine', def: '0', values: ['0', '1'], label: 'Analog Four MKII on USB-A',
    help: 'An A4 in OVERBRIDGE mode: its MAIN goes into the Rytm\'s PRE pair. Not needed for an A4 with the a4 mod.' },
  { key: 'a4ch', group: 'engine', def: '0 (MAIN)', int: [0, 15], label: 'A4 input pair', help: 'With a4=1: the A4\'s IN pair.' },
  { key: 'a4att', group: 'engine', def: '6', int: [0, 60], label: 'A4 attenuation (dB)', help: 'With a4=1: dB down.' },
  { key: 'voicebudget', group: 'engine', def: '50', int: [5, 100], label: 'Voice budget (%)',
    help: 'A voice\'s share of a block before the guard may mute it (only while its core is overloaded), scaled with the CPU clock.' },
  { key: 'fifo', group: 'engine', def: 'per link (USB 96)', int: [24, 1024], label: 'Output FIFO (frames)',
    help: 'The output FIFO target; latency added N / 48 ms.' },
  { key: 'split', group: 'engine', def: '4', int: [1, 7], label: 'Core split',
    help: 'Voices 1..N render on core 1, the rest on core 2.' },
  { key: 'plugram', since: '0.5.0', group: 'engine', def: 'by RAM: 64 (2 GB), 128 (4 GB), 256 (8 GB)', int: [0, 1024], label: 'Plugin RAM (MB)',
    help: 'The user machines\' memory pool (plugin API 3), taken at boot before the pool RAM.' },
  { key: 'idlewfe', group: 'engine', def: '1', values: ['0', '1'], label: 'Idle sleep',
    help: '0 turns off the idle sleep added for the heat (for an A/B).' },
  // developer
  { key: 'bench', group: 'dev', def: '1', values: ['0', '1'], label: 'Boot bench',
    help: 'The boot bench (1 s of audio per machine and core); 0 boots without it.' },
  { key: 'selftest', group: 'dev', def: '0', values: ['0', '1'], label: 'Self-test at boot',
    help: 'Start the self-test transport at boot (no Rytm).' },
  { key: 'tohost', group: 'dev', def: '1', values: ['0', '1'], label: 'Host-link replies',
    help: 'The engine\'s replies go to the Rytm\'s USB MIDI; 0 drops them (the behaviour before 2026-10-16).' },
  { key: 'link', group: 'dev', def: 'usb', values: ['usb', 'tcp'], label: 'Host link',
    help: 'usb: the Rytm on USB-A; tcp: rytm-emu over Ethernet (emuhost=).' },
  { key: 'emuhost', group: 'dev', def: '169.254.61.59:7301', pattern: /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/, placeholder: '169.254.61.59:7301',
    label: 'rytm-emu address', help: 'link=tcp: the emulator\'s address and port.' },
  { key: 'usbreboot', group: 'dev', def: '0', values: ['0', '1'], label: 'Reboot from USB-C MIDI',
    help: 'A developer\'s option: a SysEx from the computer reboots the Pi. Never on a unit used to play live.' },
];

for (const k of KEYS) k.since ??= '0.4.4';
export const KEY = Object.fromEntries(KEYS.map((k) => [k.key, k]));
// does this Sidecar version read the key? (the keys the display and network sections own: every version)
export function reads(version, key) {
  if (key === 'display' || key === 'dsi_rotate' || key === 'paircode') return true;
  return !!KEY[key] && vIndex(version) >= vIndex(KEY[key].since);
}
// the order keys are written in: the card's two first, then the table's, the owned keys in their place
export const KEY_ORDER = ['sdport', 'socmaxtemp', 'display', 'dsi_rotate', ...KEYS.slice(2).map((k) => k.key)];
KEY_ORDER.splice(KEY_ORDER.indexOf('web') + 1, 0, 'paircode');
const OWNED = new Set(['display', 'dsi_rotate', 'paircode']);

export function isIPv4(s) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  return !!m && m.slice(1).every((x) => Number(x) <= 255 && String(Number(x)) === x);
}

// is v a value the firmware takes for this key? ('' is always fine: not written)
export function validValue(key, v) {
  const k = KEY[key];
  if (!k) return false;
  if (v === '') return true;
  if (/\s/.test(v)) return false;
  if (k.values) return k.values.includes(v);
  if (k.int) return /^\d+$/.test(v) && String(Number(v)) === v && Number(v) >= k.int[0] && Number(v) <= k.int[1];
  if (k.ip) return isIPv4(v);
  if (k.usbip) {
    if (!isIPv4(v)) return false;
    const q = v.split('.').map(Number);
    return q[0] !== 0 && q[0] !== 127 && q[0] < 224 && q[3] !== 0 && q[3] !== 255;
  }
  if (k.pattern) return k.pattern.test(v) && (key !== 'emuhost' || isIPv4(v.split(':')[0]));
  return false;
}

// ---------------------------------------------------------------------------------------------------------------------
// the options

export function defaults(version = '0.4.4') {
  const cmd = Object.fromEntries(KEYS.map((k) => [k.key, '']));
  cmd.sdport = '0';
  cmd.socmaxtemp = '78';
  return {
    version,
    board: 'dual',
    display: 'hdmi800',
    hdmiW: 1280,
    hdmiH: 800,
    rotate: 'normal', // DSI displays: 'normal' or 'flip' (upside down)
    pair: { mode: 'random', code: '' }, // 'random' (the card), 'fixed' (paircode=<8 digits>), 'off' (paircode=0)
    cmd,
    keptCmdline: [], // tokens from a loaded cmdline.txt the editor does not manage, written back as they were
    keptConfig: [], // { section, line } from a loaded config.txt, written back at the end under their section
    wifiFile: { enabled: false, ssid: '', psk: '', band: '2g', open: false },
  };
}

export function clone(o) {
  return {
    ...o,
    pair: { ...o.pair },
    cmd: { ...o.cmd },
    keptCmdline: [...o.keptCmdline],
    keptConfig: o.keptConfig.map((x) => ({ ...x })),
    wifiFile: { ...o.wifiFile },
  };
}

// the HDMI mode written in config.txt: the display's, or the card's 800x480 (DSI and none keep the card's lines)
export function hdmiSize(o) {
  if (o.display === 'hdmi1024') return [1024, 600];
  if (o.display === 'hdmiOther') return [Number(o.hdmiW), Number(o.hdmiH)];
  return [800, 480];
}

// hdmi_cvt's aspect field: 1 4:3, 2 14:9, 3 16:9, 4 5:4, 5 16:10, 6 15:9 (Raspberry Pi config.txt). 800x480 and
// 1024x600 keep 6, as the card and the docs have them; any other size the nearest ratio.
export const ASPECTS = [[1, 4 / 3], [2, 14 / 9], [3, 16 / 9], [4, 5 / 4], [5, 16 / 10], [6, 15 / 9]];
export function hdmiAspect(w, h) {
  if ((w === 800 && h === 480) || (w === 1024 && h === 600)) return 6;
  const r = w / h;
  let best = ASPECTS[0];
  for (const a of ASPECTS) if (Math.abs(Math.log(r / a[1])) < Math.abs(Math.log(r / best[1]))) best = a;
  return best[0];
}

function validHdmi(o) {
  const [w, h] = hdmiSize(o);
  return Number.isInteger(w) && Number.isInteger(h) && w >= 320 && w <= 3840 && h >= 240 && h <= 2160;
}

// ---------------------------------------------------------------------------------------------------------------------
// config.txt

const HEAD = {
  dual: [
    '# Sidecar | Expander, one card for the Raspberry Pi 4B and the Raspberry Pi 5.',
    "# Each board's firmware reads these lines in order: after [pi4] only a Pi 4 (4B, 400, CM4) uses the lines, after [pi5]",
    '# only a Pi 5 (5, 500, CM5), after [all] both. A later setting wins over an earlier one.',
  ],
  pi4: [
    '# Sidecar | Expander, Raspberry Pi 4B only (the release card\'s own file serves the Raspberry Pi 5 too).',
    '# The firmware reads these lines in order: after [pi4] only a Pi 4 (4B, 400, CM4) uses the lines, after [all] every',
    '# board. A later setting wins over an earlier one.',
  ],
  pi5: [
    '# Sidecar | Expander, Raspberry Pi 5 only (the release card\'s own file serves the Raspberry Pi 4B too).',
    '# The firmware reads these lines in order: after [pi5] only a Pi 5 (5, 500, CM5) uses the lines, after [all] every',
    '# board. A later setting wins over an earlier one.',
  ],
};

const ALL = ['[all]', 'arm_64bit=1', 'kernel_address=0x80000', 'initial_turbo=0', ''];

function pi4Block(o) {
  return [
    '[pi4]',
    'armstub=armstub8-rpi4.bin',
    'max_framebuffers=2',
    '# A DSI display (the official 7" v1 or a compatible) needs no line: the firmware drives it and the engine prefers it',
    '# (docs/pi-display.md). Upside down: lcd_rotate=2 here. Never ignore_lcd=1, disable_touchscreen=1, a vc4-kms-*',
    '# overlay or display_auto_detect=1 (Circle has no KMS: the screen would stay dark).',
    ...(o.display === 'dsi1' && o.rotate === 'flip' ? ['lcd_rotate=2'] : []),
    '',
  ];
}

function pi4Hdmi(o) {
  const [w, h] = hdmiSize(o);
  const d = o.display === 'none' ? '# ' : '';
  return [
    `# The Pi 4's ${w}x${h} HDMI display (optional; without a display these lines do no harm). The engine draws the`,
    "# frame buffer's size if it is 800x480 or 1024x600, else 800x480 centred. A 1024x600 panel (GeeekPi EP-0194):",
    '# hdmi_cvt=1024 600 60 6 0 0 0 (HDMI_RES=1024x600 when the card is made); a 800x480 one: hdmi_cvt=800 480 60 6 0 0 0.',
    `${d}[pi4]`,
    `${d}hdmi_force_hotplug=1`,
    `${d}hdmi_group=2`,
    `${d}hdmi_mode=87`,
    `${d}hdmi_cvt=${w} ${h} 60 ${hdmiAspect(w, h)} 0 0 0`,
    `${d}disable_overscan=1`,
    '',
  ];
}

const PI5 = [
  '# The Pi 5: its boot firmware is in its EEPROM; it starts kernel_2712.img directly (no sdboot on the Pi 5 yet).',
  '[pi5]',
  'kernel=kernel_2712.img',
  'enable_uart=1',
  'disable_splash=1',
  'boot_delay=0',
  'os_check=0',
  '# A DSI display on CAM/DISP 0 or 1 needs no line either: the engine drives it itself (Circle\'s addon/rp1dsi) and',
  '# prefers it to HDMI. Upside down: dsi_rotate=180 in cmdline.txt, 90 on a Touch Display 2 (lcd_rotate does nothing on the Pi 5); dsi=0 there:',
  '# HDMI only. No vc4-kms-* overlay or display_auto_detect=1 (they are for Linux).',
  '',
];

function pi5Hdmi(o) {
  const [w, h] = hdmiSize(o);
  const d = o.display === 'none' ? '# ' : '';
  return [
    '# The Pi 5\'s HDMI display (micro-HDMI 0, next to USB-C, on before power-on; docs/pi5.md "HDMI display"): only',
    "# hdmi_force_hotplug=1 matters (measured). The Pi 5's firmware picks the mode itself (1920x1080 on an 800x480 LCD) and",
    "# the engine scales its 800x480 UI to it (1024x600 when the display's EDID prefers 1024x600, or res=1024x600 in",
    '# cmdline.txt); the other five lines are ignored by the Pi 5 (measured), kept as harmless.',
    `${d}[pi5]`,
    `${d}hdmi_force_hotplug=1`,
    `${d}framebuffer_width=${w}`,
    `${d}framebuffer_height=${h}`,
    `${d}hdmi_group=2`,
    `${d}hdmi_mode=87`,
    `${d}hdmi_cvt=${w} ${h} 60 ${hdmiAspect(w, h)} 0 0 0`,
    '',
  ];
}

// pi/circle/sdboot.py block(): sdboot.py disable / enable edit exactly this, keep it as it is
const SDBOOT = [
  '# The Pi 4: sdboot.img checks and starts engine.img (the block below; sdboot.py disable/enable edits it).',
  '# sidecar sdboot begin (pi/circle/sdboot.py disable removes this block; config.txt.bak is the original)',
  '[pi4]',
  'kernel=sdboot.img',
  'initramfs engine.img 0x02000000',
  'disable_splash=1',
  'boot_delay=0',
  '# sidecar sdboot end',
];
const SDBOOT_BEGIN = '# sidecar sdboot begin';
const SDBOOT_END = '# sidecar sdboot end';

// the generated lines without the kept ones
function configLines(o) {
  const L = [...HEAD[o.board], ...ALL];
  if (o.board !== 'pi5') L.push(...pi4Block(o), ...pi4Hdmi(o));
  if (o.board !== 'pi4') L.push(...PI5, ...pi5Hdmi(o));
  if (o.board !== 'pi5') L.push(...SDBOOT);
  else while (L[L.length - 1] === '') L.pop();
  return L;
}

export function generateConfig(o) {
  const L = configLines(o);
  if (o.keptConfig.length) {
    L.push('', '# Kept as is from the loaded config.txt (lines the Sidecar card does not have):');
    let sec = null;
    for (const { section, line } of o.keptConfig) {
      if (section !== sec) L.push(`[${section}]`);
      sec = section;
      L.push(line);
    }
  }
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------------------------------------------------------------
// cmdline.txt: ONE line, the keys space-separated, ending in one newline as the card's (make-sd-dual.sh: echo)

function ownedValue(o, key) {
  if (key === 'display') return o.display === 'none' ? '0' : '';
  if (key === 'dsi_rotate') {
    if (o.rotate !== 'flip') return '';
    return o.display === 'dsi1' ? '180' : o.display === 'td2' ? '90' : '';
  }
  if (key === 'paircode') {
    if (o.pair.mode === 'off') return '0';
    if (o.pair.mode === 'fixed' && /^\d{8}$/.test(o.pair.code)) return o.pair.code;
    return '';
  }
  return '';
}

export function cmdlineTokens(o) {
  const set = new Set();
  const out = [];
  for (const key of KEY_ORDER) {
    if (!reads(o.version, key)) continue;
    const v = OWNED.has(key) ? ownedValue(o, key) : o.cmd[key] ?? '';
    if (v === '' || (!OWNED.has(key) && !validValue(key, v))) continue;
    out.push(`${key}=${v}`);
    set.add(key);
  }
  for (const t of o.keptCmdline) {
    const k = t.split('=', 1)[0];
    if (!set.has(k)) out.push(t);
  }
  return out;
}

export function generateCmdline(o) {
  return cmdlineTokens(o).join(' ') + '\n';
}

// ---------------------------------------------------------------------------------------------------------------------
// sidecar-wifi.txt: read once at the next boot (the key derived and saved), then deleted from the card

const enc = (s) => new TextEncoder().encode(s);

export function checkWifi(w) {
  const errors = [];
  const ssid = w.ssid ?? '';
  const nb = enc(ssid).length;
  if (nb < 1 || nb > 32) errors.push('The network name must be 1 to 32 bytes.');
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(ssid)) errors.push('The network name cannot hold control characters.');
  if (w.open) {
    if (w.psk) errors.push('An open network takes no password: leave it empty.');
  } else {
    const p = w.psk ?? '';
    const hex = /^[0-9a-fA-F]{64}$/.test(p);
    if (!hex && !(p.length >= 8 && p.length <= 63 && /^[\x20-\x7e]*$/.test(p)))
      errors.push('The password must be 8 to 63 characters (printable ASCII) or a 64-digit hex key.');
  }
  if (!['2g', '5g', 'any'].includes(w.band)) errors.push('The band must be 2g, 5g or any.');
  return errors;
}

// the firmware trims a value and takes one pair of matching quotes off it: quote when that would change the value
function wifiValue(v) {
  const trimmed = v.trim() !== v;
  const quoted = v.length >= 2 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0];
  return trimmed || quoted ? `"${v}"` : v;
}

export function generateWifi(w) {
  const L = [
    '# Sidecar: Wi-Fi for the first boot. The Pi reads this file once at the next boot, saves only the derived key',
    '# (never this password) and deletes the file. Do not share the card while this file is on it.',
    `ssid=${wifiValue(w.ssid)}`,
  ];
  if (w.open) L.push('open=1');
  else L.push(`psk=${wifiValue(w.psk)}`);
  if (w.band !== '2g') L.push(`band=${w.band}`);
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------------------------------------------------------------
// checks: what does not make sense together, said in words (errors: a value the firmware would not take)

export function check(o) {
  const errors = [];
  const warnings = [];
  if (o.display === 'hdmiOther' && !validHdmi(o)) errors.push('The HDMI size must be whole pixels, 320 to 3840 by 240 to 2160.');
  if (o.pair.mode === 'fixed' && !/^\d{8}$/.test(o.pair.code)) errors.push('A fixed pairing code is exactly 8 digits.');
  for (const k of KEYS) {
    const v = o.cmd[k.key] ?? '';
    if (reads(o.version, k.key) && !validValue(k.key, v)) errors.push(`${k.key}=${v}: ${describeValues(k)}.`);
  }
  if (o.display === 'td2' && o.board === 'pi4')
    errors.push('Touch Display 2 does not work on a Pi 4 (Circle has no driver for it there): choose a Pi 5.');
  if (o.display === 'td2' && o.board === 'dual')
    warnings.push('Touch Display 2 works on the Pi 5 only; on a Pi 4 it stays dark.');
  if (o.pair.mode === 'off')
    warnings.push('Pairing code OFF: anyone on the network can open the web page, read the card and install firmware. Only on a private network you control, never on a card you share.');
  if (o.pair.mode === 'fixed')
    warnings.push('A fixed pairing code is in cmdline.txt in plain text: anyone who reads the card knows it. Do not share the card or a photo of the file.');
  if (o.cmd.sdport === '1') warnings.push('sdport=1: kernels can be installed over the network (behind the pairing code).');
  if (o.cmd.usbreboot === '1') warnings.push('usbreboot=1: any program on the computer can reboot the Pi. A developer\'s option, never live.');
  if (o.cmd.usbmidi === 'os:on') warnings.push('usbmidi=os:on: a Rytm OS file sent to the USB-C port goes to the Rytm. Turn it off again after the update.');
  if (o.wifiFile.enabled && o.cmd.wifi === 'off')
    warnings.push('wifi=off in cmdline.txt keeps the Pi on Ethernet: the network in sidecar-wifi.txt is saved but not joined.');
  if (o.wifiFile.enabled) errors.push(...checkWifi(o.wifiFile).map((e) => `sidecar-wifi.txt: ${e}`));
  for (const t of o.keptCmdline) {
    const key = t.split('=', 1)[0];
    if (KEY[key] && !reads(o.version, key))
      warnings.push(`cmdline.txt keeps "${t}" as it was, but Sidecar ${o.version} does not read ${key}= (from ${KEY[key].since} on).`);
  }
  if (o.cmd.webupdate === '0' && reads(o.version, 'webupdate'))
    warnings.push('webupdate=0: no updates from the web page; update this card in a computer.');
  if (o.cmd.usbtrust === '0' && reads(o.version, 'usbtrust'))
    warnings.push('usbtrust=0: the USB-C cable asks for the pairing code too.');
  for (const { line } of o.keptConfig) {
    if (/^(ignore_lcd=1|disable_touchscreen=1|display_auto_detect=1)$|^dtoverlay=vc4-kms/.test(line))
      warnings.push(`config.txt keeps "${line}": the Sidecar docs say never (Circle has no KMS; the screen may stay dark).`);
  }
  return { errors, warnings };
}

export function describeValues(k) {
  if (k.values) return `one of ${k.values.join(', ')}`;
  if (k.int) return `a whole number ${k.int[0]} to ${k.int[1]}`;
  if (k.ip || k.usbip) return 'an IPv4 address such as 192.168.1.50';
  if (k.placeholder) return `like ${k.placeholder}`;
  return 'a value without spaces';
}

// ---------------------------------------------------------------------------------------------------------------------
// text -> options

// cmdline.txt: the managed keys set the options; anything else is kept as it is. Returns the changes to apply on top
// of the defaults with the card's sdport/socmaxtemp removed (what is not in the file is the firmware's default).
export function parseCmdline(text, version = '0.4.4') {
  const cmd = Object.fromEntries(KEYS.map((k) => [k.key, '']));
  const r = { cmd, display: null, rotate: null, pair: { mode: 'random', code: '' }, kept: [], notes: [] };
  const seen = new Set();
  for (const t of String(text).split(/\s+/).filter(Boolean)) {
    const eq = t.indexOf('=');
    const key = eq > 0 ? t.slice(0, eq) : '';
    const v = eq > 0 ? t.slice(eq + 1) : '';
    if (key && seen.has(key) && (KEY[key] || OWNED.has(key))) {
      r.notes.push(`${t}: ${key}= is in the file twice; the first one is used.`);
      continue;
    }
    if (key === 'display' && (v === '0' || v === '1')) {
      if (v === '0') r.display = 'none';
    } else if (key === 'dsi_rotate' && ['0', '90', '180', '270'].includes(v)) {
      if (v === '180') (r.display = 'dsi1'), (r.rotate = 'flip');
      else if (v === '90') (r.display = 'td2'), (r.rotate = 'flip');
      else if (v === '270') (r.display = 'td2'), (r.rotate = 'normal');
    } else if (key === 'paircode' && (v === '0' || /^\d{8}$/.test(v))) {
      r.pair = v === '0' ? { mode: 'off', code: '' } : { mode: 'fixed', code: v };
    } else if (KEY[key] && !reads(version, key)) {
      r.kept.push(t);
      r.notes.push(`${t}: Sidecar ${version} does not read ${key}= (from ${KEY[key].since} on); kept as is.`);
      continue;
    } else if (KEY[key] && v !== '' && validValue(key, v)) {
      cmd[key] = v;
    } else {
      r.kept.push(t);
      continue;
    }
    seen.add(key);
  }
  return r;
}

// config.txt: board, display and the DSI rotation from the lines the card has; the other lines (comments aside) kept
export function parseConfig(text) {
  const lines = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  let sec = 'all';
  let inSdboot = false;
  const body = []; // { section, line } of every setting line outside the sdboot block
  let pi4 = false;
  let pi5 = false;
  let cvt = null;
  let commented = false;
  let lcdRotate = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith(SDBOOT_BEGIN)) { inSdboot = true; pi4 = true; continue; }
    if (line.startsWith(SDBOOT_END)) { inSdboot = false; continue; }
    if (/^#\s*hdmi_cvt=/.test(line)) commented = true;
    if (!line || line.startsWith('#')) continue;
    const m = /^\[([^\]]+)\]$/.exec(line);
    if (m) { sec = m[1]; continue; }
    if (inSdboot) continue;
    if (sec === 'pi4' && /^(armstub=armstub8-rpi4\.bin|kernel=sdboot\.img)$/.test(line)) pi4 = true;
    if (sec === 'pi5' && line === 'kernel=kernel_2712.img') pi5 = true;
    const c = /^hdmi_cvt=(\d+) (\d+) 60 [1-6] 0 0 0$/.exec(line);
    if (c && (sec === 'pi4' || sec === 'pi5')) {
      // the editor writes the mode itself (with the aspect for the size): a card's own hdmi_cvt is not kept twice
      if (!cvt) cvt = [Number(c[1]), Number(c[2])];
      continue;
    }
    if (sec === 'pi5' && /^framebuffer_(width|height)=\d+$/.test(line)) continue; // written from the size too
    if (sec === 'pi4' && line === 'lcd_rotate=2') lcdRotate = true;
    body.push({ section: sec, line });
  }
  const r = { board: pi4 && !pi5 ? 'pi4' : pi5 && !pi4 ? 'pi5' : 'dual', display: null, hdmiW: null, hdmiH: null, rotate: null, kept: [], notes: [] };
  if (cvt) {
    const [w, h] = cvt;
    r.display = w === 800 && h === 480 ? 'hdmi800' : w === 1024 && h === 600 ? 'hdmi1024' : 'hdmiOther';
    if (r.display === 'hdmiOther') (r.hdmiW = w), (r.hdmiH = h);
  } else if (commented) r.display = 'none';
  if (lcdRotate) (r.display = 'dsi1'), (r.rotate = 'flip');
  // what the editor would write for this: every line of the file not in it is kept
  const o = defaults();
  o.board = r.board;
  o.display = r.display ?? 'hdmi800';
  if (r.hdmiW) (o.hdmiW = r.hdmiW), (o.hdmiH = r.hdmiH);
  if (r.rotate) o.rotate = r.rotate;
  const have = new Set();
  sec = 'all';
  for (const raw of configLines(o)) {
    const line = raw.trim();
    const mm = /^\[([^\]]+)\]$/.exec(line);
    if (mm) sec = mm[1];
    else if (line && !line.startsWith('#')) have.add(`${sec}\n${line}`);
  }
  const keptSet = new Set();
  for (const b of body) {
    const id = `${b.section}\n${b.line}`;
    if (have.has(id) || keptSet.has(id)) continue;
    keptSet.add(id);
    r.kept.push(b);
  }
  if (!pi4 && !pi5) r.notes.push('No [pi4] or [pi5] kernel line found: this does not look like a Sidecar card\'s config.txt.');
  return r;
}

// options from loaded files: the card's defaults, then config.txt (board, display, kept lines), then cmdline.txt (its
// keys, kept tokens, and the display when it says display=0 or a DSI rotation). A file not given: the card's.
export function fromFiles(configText, cmdlineText, version = '0.4.4') {
  const o = defaults(version);
  const notes = [];
  if (configText != null) {
    const p = parseConfig(configText);
    o.board = p.board;
    if (p.display) o.display = p.display;
    if (p.hdmiW) (o.hdmiW = p.hdmiW), (o.hdmiH = p.hdmiH);
    if (p.rotate) o.rotate = p.rotate;
    o.keptConfig = p.kept.map((x) => ({ ...x }));
    notes.push(...p.notes);
  }
  if (cmdlineText != null) {
    const p = parseCmdline(cmdlineText, version);
    o.cmd = { ...p.cmd };
    o.keptCmdline = [...p.kept];
    o.pair = { ...p.pair };
    if (p.display) o.display = p.display;
    if (p.rotate) o.rotate = p.rotate;
    notes.push(...p.notes);
  }
  return { options: o, notes };
}

// the options for another Sidecar version: kept tokens the new version reads (and takes) become form values; values
// for keys it does not read stay in the options but are not written (switching back brings them back)
export function retarget(o, version) {
  const n = clone(o);
  n.version = version;
  n.keptCmdline = [];
  for (const t of o.keptCmdline) {
    const eq = t.indexOf('=');
    const key = eq > 0 ? t.slice(0, eq) : '';
    const v = eq > 0 ? t.slice(eq + 1) : '';
    if (KEY[key] && reads(version, key) && v !== '' && validValue(key, v) && !n.cmd[key]) n.cmd[key] = v;
    else n.keptCmdline.push(t);
  }
  return n;
}

// the lines of a generated file that differ from the release card's for the same board and HDMI size (for the page's
// marks): a Set of line indexes
export function changedLines(text, reference) {
  const ref = new Set(reference.split('\n'));
  const out = new Set();
  text.split('\n').forEach((l, i) => { if (!ref.has(l)) out.add(i); });
  return out;
}

export function cardConfig(display = 'hdmi800') {
  const o = defaults();
  o.display = display === 'hdmi1024' ? 'hdmi1024' : 'hdmi800';
  return generateConfig(o);
}
