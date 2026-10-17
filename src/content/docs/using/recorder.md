---
title: The recorder
description: Multitrack recording of the Rytm's tracks, the Sidecar's voices and effects to the SD card.
sidebar:
  order: 5
---

## On the Pi

<span class="sc-ok">hardware</span>: a 5-minute take of 13 sources with no dropped audio.

The Pi records the Rytm's Overbridge channels, its own voices and the send effect returns to its SD card, **one WAV file per source, all sample-aligned**.

| Sources | |
|---|---|
| `00_MASTER` | the Rytm's main mix, stereo |
| `01_MAIN_L`, `02_MAIN_R` | the same as two mono files |
| `03_BD` .. `10_CY-CB` | the Rytm's 8 voice outputs |
| `11_IN_L`, `12_IN_R` | the Rytm's audio inputs |
| `13_VOICE1` .. `20_VOICE8` | the Sidecar's voices as rendered |
| `21_FX1`, `22_FX2` | each send effect's own return, stereo |

**How to record:** open `sidecar.local`, tab **Record**.

1. Tick the sources (groups, Select all / None).
2. Choose **manual** or **armed**. Armed starts a take when the Rytm's sequencer starts (MIDI PLAY) and stops on STOP, then arms again. The Rytm must send its transport over USB (MIDI CONFIG, TRANSPORT SEND).
3. Press **Record** (or **Arm**). The page shows the elapsed time, a peak meter per source, free space and the time left, the card's speed and a red warning if blocks were dropped.
4. **Stop**. The takes are listed below, each file downloadable.

The display shows a red `REC h:mm:ss` while recording.

- **Files:** `/Recordings/<name>_<NNN>/<NN>_<SOURCE>.wav`, 48 kHz, 24-bit (or 16-bit), mono or stereo. Every file of a take starts on the same frame and has the same length.
- **Power loss:** the files are synced every 2 seconds. After a power cut the next boot repairs the headers, and the take opens up to its last sync.
- **Limits:** a take stops before any file reaches 4 GB (FAT32): about 4 hours for a stereo 24-bit file. A full card stops the take and closes the files.
- **Card speed:** all 23 sources at 24-bit need about 3.6 MB/s. Use a fast card; the page shows whether it keeps up.
- **Latency:** the round trip to the Rytm (about 6 ms) is not compensated between the Rytm's channels and the Sidecar's voices.

## On the Teensy

<span class="sc-plan">planned</span>

The Teensy recorder is on the roadmap: first with PSRAM (room for a buffer), then a smaller version without PSRAM, which needs a careful card writer on the Teensy's 1 MB of RAM.
