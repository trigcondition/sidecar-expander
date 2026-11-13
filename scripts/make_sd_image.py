#!/usr/bin/env python3
"""Write a Sidecar SD card image (raw .img, MBR + one FAT32 partition) from a folder tree, with the standard library
only (no mkfs.fat, no mtools, no root, no disk access).

    make_sd_image.py TREE OUT.img [--size auto|SIZE] [--date YYYY-MM-DD] [--zip]
    make_sd_image.py TREE OUT.img.zip                 (the .img is built beside it and removed; + OUT.img.zip.sha256)

Layout (the contract with the Pi's first-boot grow code, Sidecar 0.5.0):
  * MBR, one partition: entry 0, type 0x0C, start LBA 8192, entries 1..3 zero, fixed disk signature.
  * FAT32 at LBA 8192: 512-byte sectors, 64 sectors a cluster (32 KiB), 32 reserved sectors, 2 FATs, root cluster 2,
    FSInfo at sector 1 (backup 7), backup boot sector at 6, OEM "SIDECAR ", label "SIDECAR    " (boot sector and a
    root-directory label entry). FATSz32 is sized for a 512 GiB volume (the cap), so the volume can grow later by
    changing only the sector counts.
  * The image is the smallest multiple of 256 MiB whose volume has at least 70,000 clusters (and room for the files).
  * Long file names (LFN entries), directories, every timestamp fixed (--date, default 2026-01-01): the same input
    gives the same bytes. Files and directories are laid out in sorted order, each file in one run of clusters.
"""
import argparse
import hashlib
import os
import struct
import sys
import zipfile

SECTOR = 512
SPC = 64                      # sectors per cluster
CLUSTER = SECTOR * SPC        # 32 KiB
RESERVED = 32
NUM_FATS = 2
START_LBA = 8192              # partition start (4 MiB)
CAP_SECTORS = (512 << 30) // SECTOR   # the volume size FATSz32 is sized for
MIN_CLUSTERS = 70000
IMG_ALIGN = 256 << 20
LABEL = b"SIDECAR    "
OEM = b"SIDECAR "
DISK_SIG = 0x5349444B         # "SIDK"
VOLUME_ID = 0x53494445        # "SIDE"
DEFAULT_DATE = (2026, 1, 1)
FILESIZE_MAX = 0xFFFFFFFF
FSINFO_SECTOR, BACKUP_BOOT, BACKUP_FSINFO = 1, 6, 7


def cap_fatsz():
    """FATSz32 for the 512 GiB volume: clusters = (volume - reserved - 2 FATs) / 64, FATSz32 = ceil((clusters+2)*4/512)."""
    fatsz = 0
    while True:
        clusters = (CAP_SECTORS - RESERVED - NUM_FATS * fatsz) // SPC
        new = -(-((clusters + 2) * 4) // SECTOR)
        if new == fatsz:
            return fatsz
        fatsz = new


FATSZ32 = cap_fatsz()
DATA_START = RESERVED + NUM_FATS * FATSZ32    # first data sector, relative to the volume start


def clusters_for_volume(vol_sectors):
    return (vol_sectors - DATA_START) // SPC


def image_bytes_for(used_clusters, min_clusters=MIN_CLUSTERS):
    """The smallest multiple of 256 MiB whose volume has >= min_clusters and room for used_clusters."""
    want = max(min_clusters, used_clusters)
    sectors = START_LBA + DATA_START + want * SPC
    nbytes = sectors * SECTOR
    return -(-nbytes // IMG_ALIGN) * IMG_ALIGN


def fat_datetime(date):
    y, m, d = date
    return ((y - 1980) << 9) | (m << 5) | d, 0     # (date word, time word): midnight


# ---- names -------------------------------------------------------------------------------------------------------

_SHORT_OK = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'()-@^_`{}~")


def _clean_short(s):
    return "".join(c if c in _SHORT_OK else "_" for c in s.upper().replace(" ", ""))


def short_name(name, taken):
    """An 8.3 name (11 bytes) for NAME, unique in TAKEN (a set of 11-byte names); returns (short11, needs_lfn)."""
    base, dot, ext = name.rpartition(".")
    if not dot:
        base, ext = name, ""
    lead = base.lstrip(".")
    if base == "" and dot:      # ".rytm": Windows drops the leading dot
        lead = ext
        ext = ""
    cb, ce = _clean_short(lead), _clean_short(ext)[:3]
    exact = (name == name.upper() and 1 <= len(lead) <= 8 and len(ext) <= 3 and cb == lead and ce == ext
             and not name.startswith(".") and name.count(".") <= 1 and " " not in name)
    if exact:
        s = cb.ljust(8) + ce.ljust(3)
        if s.encode("latin-1") not in taken:
            return s.encode("latin-1"), False
    n = 1
    while True:
        tail = "~%d" % n
        s = (cb[:8 - len(tail)] + tail).ljust(8) + ce.ljust(3)
        b = s.encode("latin-1")
        if b not in taken:
            return b, True
        n += 1


def lfn_checksum(short11):
    s = 0
    for c in short11:
        s = (((s & 1) << 7) + (s >> 1) + c) & 0xFF
    return s


def lfn_entries(name, short11):
    u = name.encode("utf-16-le")
    units = [u[i:i + 2] for i in range(0, len(u), 2)]
    if len(units) * 2 > 510:
        raise ValueError("file name too long: %r" % name)
    chk = lfn_checksum(short11)
    pad = units + ([b"\x00\x00"] if len(units) % 13 else []) + [b"\xff\xff"] * (-(len(units) + (1 if len(units) % 13 else 0)) % 13)
    nent = len(pad) // 13
    out = []
    for seq in range(nent, 0, -1):
        chunk = pad[(seq - 1) * 13:seq * 13]
        order = seq | (0x40 if seq == nent else 0)
        e = struct.pack("<B", order) + b"".join(chunk[0:5]) + b"\x0f\x00" + struct.pack("<B", chk) + b"".join(chunk[5:11]) \
            + b"\x00\x00" + b"".join(chunk[11:13])
        assert len(e) == 32
        out.append(e)
    return out


def dir_entry(short11, attr, cluster, size, date):
    d, t = fat_datetime(date)
    return struct.pack("<11sBBBHHHHHHHI", short11, attr, 0, 0, t, d, d, cluster >> 16, t, d, cluster & 0xFFFF, size)


# ---- tree --------------------------------------------------------------------------------------------------------

class Node:
    def __init__(self, name, path, is_dir):
        self.name, self.path, self.is_dir = name, path, is_dir
        self.children = []
        self.size = 0
        self.first = 0       # first cluster
        self.nclusters = 0
        self.entries = b""   # directory contents (set for dirs)


def scan(path, name=""):
    n = Node(name, path, True)
    for fn in sorted(os.listdir(path)):
        p = os.path.join(path, fn)
        if os.path.islink(p) and not os.path.exists(p):
            raise SystemExit("broken symlink: %s" % p)
        if os.path.isdir(p):
            n.children.append(scan(p, fn))
        elif os.path.isfile(p):
            c = Node(fn, p, False)
            c.size = os.path.getsize(p)
            if c.size > FILESIZE_MAX:
                raise SystemExit("file too big for FAT32: %s" % p)
            n.children.append(c)
        else:
            raise SystemExit("not a regular file or folder: %s" % p)
    return n


def assign_clusters(root, date):
    """Lay the tree out: clusters in sorted pre-order (a folder first, then what is in it). Returns the used count."""
    nxt = [2]

    def alloc(node, nbytes):
        node.nclusters = max(1, -(-nbytes // CLUSTER)) if (node.is_dir or nbytes) else 0
        node.first = nxt[0] if node.nclusters else 0
        nxt[0] += node.nclusters

    # pass 1: allocate (the folder's own size depends on its entries, which depend only on the names)
    def count_entries(node, is_root):
        taken, n = set(), 1 if is_root else 2
        for c in node.children:
            s11, need_lfn = short_name(c.name, taken)
            taken.add(s11)
            c._short, c._lfn = s11, need_lfn
            n += 1 + (len(lfn_entries(c.name, s11)) if need_lfn else 0)
        return n

    def walk(node, is_root):
        nent = count_entries(node, is_root)
        alloc(node, (nent + 1) * 32)   # + the end marker
        for c in node.children:
            if c.is_dir:
                walk(c, False)
            else:
                alloc(c, c.size)

    walk(root, True)
    if root.first != 2:
        raise AssertionError("root must start at cluster 2")

    # pass 2: directory contents with the final cluster numbers
    def fill(node, parent_first, is_root):
        ents = []
        if is_root:
            ents.append(dir_entry(LABEL, 0x08, 0, 0, date))
        else:
            ents.append(dir_entry(b".          ", 0x10, node.first, 0, date))
            ents.append(dir_entry(b"..         ", 0x10, parent_first, 0, date))
        for c in node.children:
            if c._lfn:
                ents.extend(lfn_entries(c.name, c._short))
            ents.append(dir_entry(c._short, 0x10 if c.is_dir else 0x20, c.first, 0 if c.is_dir else c.size, date))
        node.entries = b"".join(ents).ljust(node.nclusters * CLUSTER, b"\x00")
        for c in node.children:
            if c.is_dir:
                fill(c, 0 if is_root else node.first, False)

    fill(root, 0, True)
    return nxt[0] - 2


def all_nodes(root):
    yield root
    for c in root.children:
        yield from all_nodes(c)


# ---- sectors -----------------------------------------------------------------------------------------------------

def chs(lba):
    if lba >= 1024 * 255 * 63:
        return b"\xfe\xff\xff"
    c, rem = divmod(lba, 255 * 63)
    h, s = divmod(rem, 63)
    return bytes([h, (s + 1) | ((c >> 2) & 0xC0), c & 0xFF])


def mbr_sector(vol_sectors):
    m = bytearray(SECTOR)
    struct.pack_into("<I", m, 440, DISK_SIG)
    m[446:462] = (b"\x00" + chs(START_LBA) + b"\x0c" + chs(START_LBA + vol_sectors - 1)
                  + struct.pack("<II", START_LBA, vol_sectors))
    m[510:512] = b"\x55\xaa"
    return bytes(m)


def boot_sector(vol_sectors):
    b = bytearray(SECTOR)
    b[0:3] = b"\xeb\x58\x90"
    b[3:11] = OEM
    struct.pack_into("<HBHBHHBHHHII", b, 11, SECTOR, SPC, RESERVED, NUM_FATS, 0, 0, 0xF8, 0, 63, 255, START_LBA, vol_sectors)
    struct.pack_into("<IHHIHH", b, 36, FATSZ32, 0, 0, 2, FSINFO_SECTOR, BACKUP_BOOT)
    struct.pack_into("<BBBI", b, 64, 0x80, 0, 0x29, VOLUME_ID)
    b[71:82] = LABEL
    b[82:90] = b"FAT32   "
    b[90:93] = b"\xf4\xeb\xfd"      # not bootable: hlt; jmp $-1
    b[510:512] = b"\x55\xaa"
    return bytes(b)


def fsinfo_sector(free, nxt):
    f = bytearray(SECTOR)
    struct.pack_into("<I", f, 0, 0x41615252)
    struct.pack_into("<III", f, 484, 0x61417272, free, nxt)
    struct.pack_into("<I", f, 508, 0xAA550000)
    return bytes(f)


def build_image(tree, out, size=None, date=DEFAULT_DATE, min_clusters=MIN_CLUSTERS):
    """Write the raw image OUT from the folder TREE. SIZE: bytes (a multiple of 512) or None for the size rule.
    Returns (image bytes, used clusters, volume clusters)."""
    root = scan(tree)
    used = assign_clusters(root, date)
    if size is None:
        size = image_bytes_for(used, min_clusters)
    if size % SECTOR:
        raise SystemExit("--size must be a multiple of 512 bytes")
    vol = size // SECTOR - START_LBA
    nclusters = clusters_for_volume(vol)
    if nclusters < used:
        raise SystemExit("the files need %d clusters, the image has %d" % (used, nclusters))
    if nclusters < min_clusters and min_clusters == MIN_CLUSTERS:
        raise SystemExit("the image has %d clusters: FAT32 needs at least %d" % (nclusters, MIN_CLUSTERS))
    if vol > CAP_SECTORS:
        raise SystemExit("the volume is larger than the 512 GiB cap")

    fat = bytearray((used + 2) * 4)
    struct.pack_into("<II", fat, 0, 0x0FFFFFF8, 0x0FFFFFFF)
    for n in all_nodes(root):
        for i in range(n.nclusters):
            c = n.first + i
            struct.pack_into("<I", fat, c * 4, 0x0FFFFFFF if i == n.nclusters - 1 else c + 1)

    fsi = fsinfo_sector(nclusters - used, used + 2)
    boot = boot_sector(vol)
    with open(out, "wb") as f:
        f.truncate(size)
        f.seek(0)
        f.write(mbr_sector(vol))

        def at(rel_sector, data):
            f.seek((START_LBA + rel_sector) * SECTOR)
            f.write(data)
        tail = bytearray(SECTOR); tail[510:512] = b"\x55\xaa"
        at(0, boot); at(FSINFO_SECTOR, fsi); at(2, bytes(tail))
        at(BACKUP_BOOT, boot); at(BACKUP_FSINFO, fsi); at(BACKUP_BOOT + 2, bytes(tail))
        for k in range(NUM_FATS):
            at(RESERVED + k * FATSZ32, bytes(fat))

        def cluster_at(c):
            return (DATA_START + (c - 2) * SPC) * SECTOR
        for n in all_nodes(root):
            if n.is_dir:
                f.seek((START_LBA * SECTOR) + cluster_at(n.first))
                f.write(n.entries)
            elif n.size:
                f.seek((START_LBA * SECTOR) + cluster_at(n.first))
                with open(n.path, "rb") as src:
                    while True:
                        blk = src.read(1 << 20)
                        if not blk:
                            break
                        f.write(blk)
    return size, used, nclusters


def write_zip(img, zpath, name=None):
    """A zip with the single image in it (fixed date, deflate, zip64 where the size needs it) and zpath + '.sha256'."""
    name = name or os.path.basename(img)
    zi = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
    zi.compress_type = zipfile.ZIP_DEFLATED
    zi.external_attr = 0o644 << 16
    zi.file_size = os.path.getsize(img)
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf, open(img, "rb") as src, \
            zf.open(zi, "w", force_zip64=True) as dst:
        while True:
            blk = src.read(1 << 22)
            if not blk:
                break
            dst.write(blk)
    h = hashlib.sha256()
    with open(zpath, "rb") as z:
        for blk in iter(lambda: z.read(1 << 22), b""):
            h.update(blk)
    with open(zpath + ".sha256", "w") as f:
        f.write("%s  %s\n" % (h.hexdigest(), os.path.basename(zpath)))
    return h.hexdigest()


def parse_size(s):
    if s == "auto":
        return None
    mult = {"k": 1 << 10, "m": 1 << 20, "g": 1 << 30}
    if s[-1].lower() in mult:
        return int(float(s[:-1]) * mult[s[-1].lower()])
    return int(s)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("tree", help="the folder whose contents become the volume's files")
    ap.add_argument("out", help="OUT.img (raw) or OUT.img.zip (zip with the .img inside, + .sha256)")
    ap.add_argument("--size", default="auto", help="auto (the smallest multiple of 256 MiB with >= 70,000 clusters) or "
                    "bytes / 512M / 3G (a multiple of 512 bytes)")
    ap.add_argument("--date", default="%04d-%02d-%02d" % DEFAULT_DATE, help="the fixed timestamp of every entry")
    ap.add_argument("--zip", action="store_true", help="with OUT.img: also write OUT.img.zip and its .sha256")
    a = ap.parse_args(argv)
    if not os.path.isdir(a.tree):
        ap.error("not a folder: %s" % a.tree)
    date = tuple(int(x) for x in a.date.split("-"))
    zip_only = a.out.endswith(".zip")
    img = a.out[:-4] if zip_only else a.out
    size, used, nclusters = build_image(a.tree, img, parse_size(a.size), date)
    print("%s: %d MiB, %d clusters (%d used)" % (img, size >> 20, nclusters, used))
    if zip_only or a.zip:
        zpath = a.out if zip_only else img + ".zip"
        digest = write_zip(img, zpath, os.path.basename(img))
        print("%s: %d bytes, sha256 %s" % (zpath, os.path.getsize(zpath), digest))
        if zip_only:
            os.remove(img)
    return 0


if __name__ == "__main__":
    sys.exit(main())
