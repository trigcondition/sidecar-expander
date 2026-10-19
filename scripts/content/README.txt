Sidecar | Expander - starter content @VERSION@
==============================================

Patch libraries for the Sidecar's JUNO and 6-OP FM machines, ready to use.
For Sidecar (Raspberry Pi 4B) and Sidecar Mini (Teensy 4.1).

What is inside
--------------
JUNO/Factory/   the Juno-106's 128 factory patches, one .syx file each
                ("001 A11 Brass Set 1.syx" ...), as Juno-106 patch dumps
DX7/            three 32-voice DX7 banks (4104-byte .syx), the voices the
                6-OP FM machine also plays from its built-in ROM
README.txt      this file
NOTICE.txt      where the content comes from, and its licences

Where it goes
-------------
Extract the zip to the ROOT of the Sidecar's SD card (the card in the Pi or
in the Teensy's slot), so you get /JUNO/Factory/ and /DX7/ on the card.
- It only adds files. If /JUNO or /DX7 already exist, merge the folders:
  nothing of yours is replaced (unless you kept files with the same names).
- On the Pi you can also upload the folders on http://sidecar.local
  (Files tab, "Upload folder").
- The Sidecar SD card package for the Pi already contains these folders.
- User machine packages are not in here: the Sidecar Mini (.rmp) and the
  Sidecar (.a64.rmp) packages come with each platform's release, and go to
  /Plugins/ on the Pi or into the Mini's plugin store (web console).

How to use it
-------------
1. On the Rytm, open the sample browser (FUNC + SMPL, DOWN, FUNC + YES) and
   enter the SIDECAR folder at the +Drive root.
2. In JUNO/Factory pick a patch, or in DX7 a bank and a voice, and choose
   LOAD TO PROJ: it is added to the project's JUNO or FM list.
3. On a track with the JUNO or 6-OP FM machine, the PAT knob steps through
   the project's list (up to 127 patches, p-lockable). Without a project list
   PAT plays the factory list (JUNO A11..B88, the FM ROM voices).
4. On the Pi's web page, the Pool & presets tab shows the lists and can save
   what a voice plays now ("Save current").

The lists live on each Sidecar's own card: copy the card's folders when you
move a project from a Sidecar Mini to a Sidecar.

Documentation: https://trigcondition.github.io/sidecar-expander/
Unofficial software, not affiliated with or endorsed by the maker of the
Analog Rytm.
