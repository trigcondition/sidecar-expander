---
title: The recorder
description: Multitrack recording of the Rytm's tracks, the Sidecar's voices and effects to the SD card.
sidebar:
  order: 5
---

## Sidecar (Pi)

<span class="sc-ok">hardware</span>: a 5-minute take of 13 sources with no dropped audio.

The Pi records the Rytm's Overbridge channels, its own voices and the send effect returns to its SD card, **one WAV file per source, all sample-aligned**.

| Sources | |
|---|---|
| `00_MASTER` | the Rytm's main mix, stereo |
| `01_MAIN_L`, `02_MAIN_R` | the same as two mono files |
| `03_BD` .. `10_CY-CB` | the Rytm's 8 voice outputs |
| `11_IN_L`, `12_IN_R` | the Rytm's audio inputs, or `11_FX_L`, `12_FX_R` while the IN L/R source is the Rytm's FX return (below) |
| `13_VOICE1` .. `20_VOICE8` | the Sidecar's voices as rendered |
| `21_FX1`, `22_FX2` | each send effect's own return, stereo |

**How to record:** open `sidecar.local`, tab **Record**.

1. Tick the sources (groups, Select all / None).
2. Choose **manual** or **armed**. Armed starts a take when the Rytm's sequencer starts (MIDI PLAY) and stops on STOP, then arms again. The Rytm must send its transport over USB (MIDI CONFIG, TRANSPORT SEND).
3. Press **Record** (or **Arm**). The page shows the elapsed time, a peak meter per source, free space and the time left, the card's speed and a red warning if blocks were dropped.
4. **Stop**. The takes are listed below, each file downloadable.

The display shows a red `REC h:mm:ss` while recording.

- **Files:** `/Recordings/<name>_<NNN>/<NN>_<SOURCE>.wav`, 48 kHz, 24-bit (or 16-bit), mono or stereo. Every file of a take starts on the same frame and has the same length.
- **Power loss:** one file is synced every 2 seconds, in turn (so each file every 2 s times the number of files). After a power cut the next boot repairs the headers, and the take opens up to its last sync.
- **Limits:** a take stops before any file reaches 4 GB (FAT32): about 4 hours for a stereo 24-bit file. A full card stops the take and closes the files.
- **Card speed:** all 23 sources at 24-bit need about 3.6 MB/s. Use a fast card; the page shows whether it keeps up.
- **Latency:** the round trip to the Rytm (about 6 ms) is not compensated between the Rytm's channels and the Sidecar's voices.

### The REC page on the Rytm

<span class="sc-ok">hardware</span>. Open the remote pages (TRK + YES) and press LEFT twice from SIDECAR (SCOPE, then REC). **YES** records and stops; encoder **A** arms (right) or disarms (left). The page shows the take's time in large digits, its name, the card's free space and the hours left, and the meters with the recorded channels marked.

![The REC page, armed: the take's time, TAKE-0008, 23 GB free, the meters, PLAY: REC](../../../assets/rytm/remote-rec.png)

### The REC page on the touchscreen (0.3)

<span class="sc-test">in testing</span> (Pi, 0.3 test line). The touchscreen has its own REC page: UP + T8 on the Rytm, or a tap on the home page's REC status. REC / STOP, ARM, the take's time, the 23 channels with a meter each (tap to record a channel or not, while idle) and the takes with delete. See [The touchscreen](/sidecar-expander/using/touchscreen/#rec-the-overbridge-recorder).

### Playback

<span class="sc-ok">hardware</span> (Pi). One channel of one take plays into the Rytm's MAIN, on top of everything else. On the REC page: **B** turned picks the channel, **B** pushed plays and stops, **C** picks the take, **D** sets the level. On `sidecar.local`, the Record tab has a play button per channel of each take, and Stop. A take that starts recording stops playback; playback never runs while a take records.

![The REC page playing: TAKE-0007, BD 2/3, the progress track, B STOP, D LEV 103, 1:30](../../../assets/rytm/remote-play.png)

Known: picking another take with C while one plays can glitch once; a fix is on the way.

### The FX return on IN L/R

<span class="sc-ok">hardware</span> (2026-10-18: echoes seen on SCOPE's FX source). The Rytm can put its own delay + reverb return on the Overbridge IN L/R instead of its audio inputs: **Sound** tab, **IN L/R source: FX return**. The recorder then names those files `11_FX_L` / `12_FX_R`, and the SCOPE page calls the source FX. **Never send these two channels back into the Rytm through the computer's audio** (a loop on your mixer): the effect would feed itself. The page warns while the switch is on.

