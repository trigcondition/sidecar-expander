---
title: Web API (Pi)
description: "The HTTP endpoints of sidecar.local: status, commands, files and user machines."
sidebar:
  order: 7
---

The Pi's web page is a client of a small HTTP API on port 80. The same API is open to your own tools. There is no authentication: use it on a direct cable or a trusted network. At most 4 connections are served at once; more are refused and counted.

## `GET /status`

JSON with the engine's state: host name, IP, uptime, the link, the USB-C gadget mode, computer audio, the Overbridge stream, whether the Rytm's USB MIDI is attached, temperature, `out`, `notes`, the FIFO target, underruns, the display (`screensaver`, `brightness`, `display`, `blank`), Wi-Fi (`mode`, `connected`, `networks`, ...), the recorder (`rec`: state, take, channels, frames, drops, card speed, free space, peaks), and the page's own cost (`web.maxus`, `web.refused`).

The page polls it once a second and keeps one request open at a time. Do the same.

## `GET /log?since=N`

The console log from byte N of a 64 KB ring. The first line is `START END`, then the bytes; poll again with `since=END`.

## `POST /cmd`

Form-encoded `c=<command>`: any console command, exactly as on the serial console (without the leading `:`). Examples:

| Command | |
|---|---|
| `notes=1`, `out=main` | MIDI notes, output mode |
| `notemach=0:plaits` | voice 0's machine for MIDI notes |
| `sendfx`, `sendfx=1:chorus`, `killfx` | show or override the send FX; fade the tails |
| `rec=start`, `rec=stop`, `rec=arm`, `rec=ch:in,voices`, `rec=bits:16`, `rec=name:PREFIX` | the recorder |
| `um`, `um=rescan`, `um=assign:1:sc.acid`, `um=clear:1`, `um=empty` | user machines |
| `screensaver=60`, `brightness=80` | the display |
| `wifi`, `wifi=scan` | Wi-Fi (in testing) |

The watchdog test is refused from the web.

## Files: `/fs/*`

| Request | |
|---|---|
| `GET /fs/ls?path=` | a folder listing; boot files are marked `"ro":1`, the kept folders `"ro":2` |
| `GET /fs/get?path=&off=&len=` | a file, in ranges (the page uses 64 KB) |
| `POST /fs/put?path=&off=&total=&crc=` | one chunk (multipart, one part). The file is written to `<path>.part`, checked as it goes, and moved into place only when the last chunk's CRC-32 matches the client's. `409 expected N` means resume from offset N |
| `POST /fs/del?path=` | delete a file or an empty folder |
| `POST /fs/mkdir?path=[&p=1]` | make a folder (`p=1`: every missing folder on the way) |
| `POST /fs/mv?path=&to=` | rename |

Every POST answers HTTP 200 with the text `<code> <message>`. Boot files are never written, deleted or renamed; `/.rytm`, `/Samples` and `/Plugins` are never deleted or renamed. A package uploaded into `/Plugins` is checked (header, size, CRC, API version, target) before it goes in place.

## `GET /um`

The user machines as an array of JSON objects, shared in shape with the Teensy console:

```
{"t":"plugin","id","ver","size","api","image","bss","state","cpu","ns","blocks","name","slots":[..],"fit","why","file","target","fp","status"}
{"t":"slot","slot":1..5,"id","ver","state","name","fp","ns","blocks","src","updated","collision","unknown","want_fp","want_name",...}
{"t":"plugins","n","project","arena":[size,used],"state_limit","block_ns","gen","scanning","prints"}
{"t":"mem","k":"code|data|state|sd","size","used"} ... {"t":"mem_end"}
```

`ns / block_ns` is the share of one render core a voice of that machine uses.

## The slot list file

Export and import use `{"format":"sidecar-slots","version":1,"project":"NAME","slots":[{"slot":1,"id","ver","name","fp"}, {"slot":5,"empty":true}]}`. Slots the file does not name are left alone.
