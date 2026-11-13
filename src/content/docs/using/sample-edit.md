---
title: SAMPLE EDIT
description: "Cut, fade, normalise and save a sample from the pool as a new file: opening SAMPLE EDIT from a track, the POOL page or the file menu, the knobs, the functions, live play, saving and the limits."
sidebar:
  order: 3.31
---

<span class="sc-test">in testing</span> New in 0.5.0 (Sidecar on the Pi 4 and Pi 5). The Sidecar Mini has no sample editor.

**SAMPLE EDIT** loads one sample from the [SAMPLES pool](/sidecar-expander/using/pools/), lets you set a region, run a function on it (crop, normalise, trim, fades, reverse, gain), undo the last function and save the region as a **new file** next to the original. **The original is never written.**

The Rytm's screen and the touchscreen show the same edit and stay in step. Use either, or both.

## Opening it

- **From a track:** on the SRC view of a DSP SAMPLE or [SAMPLER](/sidecar-expander/using/machines/#sampler) track, **push knob B**. The editor opens the track's sample, and the region is the track's start to end.
- **From the POOL page:** pick a row of the SAMPLES list, turn knob D to **EDIT** and press **YES**. The region is the whole sample, and no track is attached.
- **From the sample browser:** the [file menu](/sidecar-expander/using/pools/#the-file-menu) has a **SAMPLE EDIT** row for the files of a SAMPLES list.
- **From the SIDECAR MENU** (UP + YES, then YES): the **SAMPLE EDIT** row opens the selected track's sample. If an edit is open already, it goes back to that edit.
- **On the touchscreen** the SAMPLE EDIT page appears by itself when an edit opens. While an edit is open, the VOICE key (and **UP + T4** on the Rytm) leads back to it.

Opening another sample while the edit has unsaved changes is refused (`SAVE OR DROP THE EDIT`). A track that is not a DSP SAMPLE or SAMPLER track is refused (`NOT A SAMPLE TRACK`). A project change on the Rytm closes the editor without saving.

## The Rytm page

The header shows the file's name. The waveform fills the middle: the region is solid, the rest is dithered, with a marker at the start and one at the end. If the edit goes over 0 dBFS (after a GAIN +3, say), the waveform is scaled down so its peak fits, and a dotted line on each side shows where 0 dBFS is: what lies outside will clip in the file. Zoomed in, a bar under the waveform shows which part of the sample you see. Under it are the region in seconds and the zoom (`X1` to `X256`; `*` marks unsaved changes). The footer shows the function (`E:CROP  YES:DO`), the progress of a job, or a short message.

| Control | Does |
|---|---|
| knob **A** | moves the region start |
| knob **B** | moves the region end |
| **FUNC** + A or B | jumps the marker to the next (turn right) or previous (turn left) **transient** |
| knob **C** | zoom: each step halves the window |
| knob **D** | moves the zoomed window through the sample. **FUNC**: eight times as far |
| knob **E** | picks the function |
| **YES** | runs the function on the region |
| **FUNC + YES** | the save choice (below) |
| **NO** | undoes the last function. With nothing to undo and no changes it leaves the page. With unsaved changes it asks `DISCARD EDIT?` |
| push **A** | plays the region once on the track (see Live play) |

**The markers land on zero crossings,** so a cut does not click. A marker goes to the crossing nearest the place you asked for, within about 5 ms. If there is none in reach (a sample with a DC offset, a very low note), it stays where you put it. The ends of the sample stay as they are. The window follows a marker that leaves it.

**Transients** are found in the background after every change. FUNC + A or B right after a change can say `FINDING TRANSIENTS` for a moment, and `NO MORE TRANSIENTS` means there is none in that direction.

### On the touchscreen

Drag a marker to move it (the editor puts it on a zero crossing when you let go). Drag anywhere else on the waveform to pan. **ZOOM -** and **ZOOM +** double or halve the window. The keys are PLAY, UNDO, SAVE and CLOSE, and one key per function: CROP, NORM, TRIM, FD IN, FD OUT, REV, GAIN+3 and GAIN-3. Each function key runs its function at once. SAVE opens the same choice as on the Rytm, and CLOSE with unsaved changes asks first.

## The functions

Each function works on the region (start to end), except TRIM, which looks at the whole sample.

| Function | Does |
|---|---|
| CROP | keeps only the region; the sample gets shorter |
| NORMALISE | scales the region so its peak is -0.1 dBFS. A silent region is left alone (`SILENT`) |
| TRIM | cuts the silence before and after the sound, keeping a little each side and fading out at the new end. If all of it is silent, nothing changes (`ALL SILENT`) |
| FADE IN | a linear fade from 0 to full level over the region |
| FADE OUT | a linear fade from full level to 0 over the region |
| REVERSE | plays the region backwards |
| GAIN +3 | +3 dB |
| GAIN -3 | -3 dB |

The editor works in floating point, so a gain over full level does not clip while you edit. Clipping happens only when the file is written and in the play buffers. There is **one level of undo**: NO (UNDO on the touchscreen) takes back the last function, and after that there is nothing to undo until the next one (`NOTHING TO UNDO`). While a function runs, a long sample takes a moment, and apply, undo, save and play say `BUSY`. Markers and zoom still work.

## Live play

While an edit is open, every DSP SAMPLE or SAMPLER track whose SMP is the edited row **plays the edit, not the file**: the pads, CHRO and the sequencer's trigs alike. A track uses a change from its **next trig**: a note that is already sounding keeps what it started with. Close the editor without saving and the track plays the original again.

If the Sidecar has no memory to spare for this, the editor still opens, but without live play: the footer says `NO LIVE PLAY: RAM`.

## Saving

**FUNC + YES** (SAVE on the touchscreen) asks what to do. Knob A picks, YES confirms, NO goes back.

- **SAVE + USE** (only when the edit was opened from a track): saves the region and points the track's SMP at the new row. If the new file's length differs from the one the track's start and end were set for, the track's start becomes 0 and its end 120, so it plays the whole new file. The footer says `SAVED, T3 USES A012`. If the Rytm is busy the Sidecar tries again for a second, then says `USE: RYTM BUSY`: the copy is saved and pooled, and you set SMP by hand. A write the Rytm refuses says `USE: RYTM REFUSED`.
- **SAVE:** saves the region and adds the file to the pool. The track stays on the original.
- **CANCEL:** back to the edit.

Only the **region** is written, with the functions applied: no CROP is needed first. Move the markers and save, and the new file is that part. With the markers around the whole sample it writes the whole sample. After a save the editor edits the new copy, with nothing to undo.

**The name** is `<name>-ed1.wav`, then `-ed2` and so on, in the original's folder: `kick.wav` saves as `kick-ed1.wav`, and `kick-ed1.wav` as `kick-ed2.wav`. The new file goes into the SAMPLES pool, in the original's bank if it has room.

- A copy that sounds exactly like a row the pool already has is not added twice: the footer says `SAVED: SAME AUDIO AS A003`.
- `SAVED, NOT IN POOL` means the file is on the card but the library took more than 5 seconds to list it. Add it by hand.
- `SAVED: REBOOT TO PLAY`: the row is in the pool and plays after the next boot (a limit of 128 new files a boot).
- `SAVED: NAME TOO LONG`: file names longer than 39 characters (with `.wav`) are saved and pooled but cannot play. Rename the file on the card and add it again.

## Formats and limits

- **In:** WAV, 16, 24 or 32-bit integer PCM, mono or stereo, any sample rate. Float, 8-bit and AIFF files are refused (`NOT 16/24/32-BIT PCM WAV`).
- **Out:** the same bit depth, channels and rate as the source. Loop and cue chunks in the WAV are not carried into the copy.
- **Length:** at most **87 seconds** (`TOO LONG (MAX 87 S)`). The sample is held whole in memory, with a copy for undo. If there is not enough memory, the open is refused (`NO RAM`).
- Card work runs in small pieces, so playing is not interrupted.

There is no time stretch, slicing or recording here. For slicing, see [CHOP](/sidecar-expander/using/chop/).
