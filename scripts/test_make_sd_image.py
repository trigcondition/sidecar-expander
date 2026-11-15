#!/usr/bin/env python3
"""Tests of make_sd_image.py:  python3 scripts/test_make_sd_image.py   (the hdiutil / fsck_msdos part runs on macOS only)"""
import hashlib
import os
import platform
import shutil
import struct
import subprocess
import sys
import tempfile
import unittest
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_sd_image as m  # noqa: E402


def make_tree(root):
    """A tree with the awkward cases: LFN, dots, collisions of the short names, an empty file, multi-cluster files, a
    folder of more than one cluster of entries, non-ASCII."""
    def w(rel, data):
        p = os.path.join(root, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "wb") as f:
            f.write(data)
    rnd = hashlib.sha256(b"seed")
    def blob(n):
        out = b""
        while len(out) < n:
            out += rnd.digest(); rnd.update(out[-8:])
        return out[:n]
    w("config.txt", b"hdmi_cvt=800 480 60 6 0 0 0\n")
    w("cmdline.txt", b"sdport=0 socmaxtemp=78\n")
    w("KERNEL8.IMG", blob(100000))                    # exact 8.3 upper case: no LFN
    w("kernel_2712.img", blob(32768 * 3))             # exactly three clusters
    w("empty.txt", b"")
    w(".rytm/www-next/index.html", b"<html></html>")
    w(".rytm/www-next/index.html.gz", blob(500))
    w("Plugins/very long plugin name one.rmp", blob(70000))
    w("Plugins/very long plugin name two.rmp", blob(70001))      # short names collide: VERYLO~1, VERYLO~2
    w("Samples/Starter/ACID one-shot.wav", blob(100))
    w("Samples/été サンプル.wav", blob(10))
    for i in range(1100):                              # > 1024 entries: the folder takes two clusters
        w("many/file-number-%04d.txt" % i, b"%d\n" % i)


class Reader:
    """A small, independent FAT32 reader (long names, directory chains) to check the image without OS help."""
    def __init__(self, path):
        self.f = open(path, "rb")
        self.f.seek(m.START_LBA * 512)
        self.base = m.START_LBA * 512
        b = self.read(0, 512)
        (self.bps, self.spc, self.rsv, self.nfat) = struct.unpack_from("<HBHB", b, 11)
        self.fatsz = struct.unpack_from("<I", b, 36)[0]
        self.fat = self.read(self.rsv * 512, self.fatsz * 512)
    def read(self, off, n):
        self.f.seek(self.base + off)
        return self.f.read(n)
    def chain(self, c):
        out = []
        while c < 0x0FFFFFF8:
            out.append(c)
            c = struct.unpack_from("<I", self.fat, c * 4)[0] & 0x0FFFFFFF
        return out
    def data(self, c, size=None):
        cs = self.spc * 512
        start = (self.rsv + self.nfat * self.fatsz) * 512
        out = b"".join(self.read(start + (x - 2) * cs, cs) for x in self.chain(c))
        return out if size is None else out[:size]
    def walk(self, c=2, prefix=""):
        raw = self.data(c)
        lfn = {}
        for i in range(0, len(raw), 32):
            e = raw[i:i + 32]
            if e[0] == 0:
                break
            if e[0] == 0xE5:
                continue
            attr = e[11]
            if attr == 0x0F:
                lfn[e[0] & 0x3F] = (e[1:11] + e[14:26] + e[28:32])
                continue
            if attr == 0x08:
                continue
            short = e[0:11]
            if short[:2] in (b". ", b"..") and short[2:3] == b" ":
                lfn = {}
                continue
            if lfn:
                assert m.lfn_checksum(short) == raw[i - 32 + 13], "LFN checksum"
                u = b"".join(lfn[k] for k in sorted(lfn))
                name = u.decode("utf-16-le").split("\x00")[0]
            else:
                b, x = short[:8].decode().rstrip(), short[8:].decode().rstrip()
                b = b.lower() if e[12] & 0x08 else b
                x = x.lower() if e[12] & 0x10 else x
                name = b + ("." + x if x else "")
            lfn = {}
            cl = (struct.unpack_from("<H", e, 20)[0] << 16) | struct.unpack_from("<H", e, 26)[0]
            size = struct.unpack_from("<I", e, 28)[0]
            if attr & 0x10:
                yield from self.walk(cl, prefix + name + "/")
            else:
                yield prefix + name, self.data(cl, size) if size else b""


class Layout(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp()
        cls.tree = os.path.join(cls.tmp, "tree")
        make_tree(cls.tree)
        cls.img = os.path.join(cls.tmp, "a.img")
        cls.size, cls.used, cls.nclusters = m.build_image(cls.tree, cls.img)
        with open(cls.img, "rb") as f:
            cls.mbr = f.read(512)
            f.seek(m.START_LBA * 512)
            cls.boot = f.read(512)
            cls.fsinfo = f.read(512)
            f.seek((m.START_LBA + 6) * 512)
            cls.boot_bak = f.read(512)
            cls.fsinfo_bak = f.read(512)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp)

    def test_mbr(self):
        self.assertEqual(self.mbr[510:512], b"\x55\xaa")
        self.assertNotEqual(struct.unpack_from("<I", self.mbr, 440)[0], 0)
        e0 = self.mbr[446:462]
        self.assertEqual(e0[4], 0x0C)
        start, count = struct.unpack_from("<II", e0, 8)
        self.assertEqual(start, 8192)
        self.assertEqual(count, self.size // 512 - 8192)
        self.assertEqual(self.mbr[462:510], bytes(48), "entries 1..3 are zero")

    def test_bpb(self):
        b = self.boot
        self.assertEqual(b[510:512], b"\x55\xaa")
        self.assertEqual(b[3:11], b"SIDECAR ")
        bps, spc, rsv, nfat, rootent, tot16, media, fatsz16 = struct.unpack_from("<HBHBHHBH", b, 11)
        self.assertEqual((bps, spc, rsv, nfat, rootent, tot16, fatsz16), (512, 64, 32, 2, 0, 0, 0))
        hidden, tot32, fatsz32 = struct.unpack_from("<III", b, 28)
        self.assertEqual(hidden, 8192)
        self.assertEqual(tot32, self.size // 512 - 8192)
        self.assertEqual(struct.unpack_from("<I", b, 44)[0], 2, "root cluster")
        self.assertEqual(struct.unpack_from("<HH", b, 48), (1, 6), "FSInfo sector, backup boot sector")
        self.assertEqual(b[66], 0x29)
        self.assertEqual(b[71:82], b"SIDECAR    ")
        self.assertEqual(b[82:90], b"FAT32   ")
        self.assertEqual(self.boot_bak, self.boot, "backup boot sector")

    def test_fatsz_for_512_gib(self):
        fatsz = struct.unpack_from("<I", self.boot, 36)[0]
        self.assertEqual(fatsz, m.FATSZ32)
        # the FAT addresses every cluster a 512 GiB volume holds, and no FAT is larger than needed by more than a sector
        clusters = (2 ** 30 - 32 - 2 * fatsz) // 64
        self.assertEqual(fatsz, -(-((clusters + 2) * 4) // 512))
        self.assertEqual(fatsz, 131041)    # pinned: the grow code depends on it

    def test_cluster_count(self):
        self.assertGreaterEqual(self.nclusters, 70000)
        tot32 = struct.unpack_from("<I", self.boot, 32)[0]
        self.assertEqual(self.nclusters, (tot32 - 32 - 2 * m.FATSZ32) // 64)
        self.assertEqual(self.size % (256 << 20), 0)
        # the smallest multiple of 256 MiB that still has 70,000 clusters
        smaller = self.size - (256 << 20)
        self.assertLess(m.clusters_for_volume(smaller // 512 - 8192), 70000)
        self.assertEqual(os.path.getsize(self.img), self.size)

    def test_label_entry_in_root(self):
        with open(self.img, "rb") as f:
            f.seek((m.START_LBA + m.DATA_START) * 512)
            e = f.read(32)
        self.assertEqual(e[:11], b"SIDECAR    ")
        self.assertEqual(e[11], 0x08)

    def test_fsinfo(self):
        f = self.fsinfo
        self.assertEqual(struct.unpack_from("<I", f, 0)[0], 0x41615252)
        self.assertEqual(struct.unpack_from("<I", f, 484)[0], 0x61417272)
        self.assertEqual(struct.unpack_from("<I", f, 508)[0], 0xAA550000)
        free, nxt = struct.unpack_from("<II", f, 488)
        self.assertEqual(free, self.nclusters - self.used)
        self.assertEqual(nxt, self.used + 2)
        self.assertEqual(self.fsinfo_bak, self.fsinfo)

    def test_fats_equal_and_zero_beyond_used(self):
        with open(self.img, "rb") as f:
            base = (m.START_LBA + 32) * 512
            f.seek(base); fat1 = f.read((self.used + 2) * 4 + 4096)
            f.seek(base + m.FATSZ32 * 512); fat2 = f.read((self.used + 2) * 4 + 4096)
            f.seek(base + m.FATSZ32 * 512 - 4096); tail1 = f.read(4096)
        self.assertEqual(fat1, fat2)
        self.assertEqual(fat1[(self.used + 2) * 4:], bytes(4096))
        self.assertEqual(tail1, bytes(4096))
        self.assertEqual(struct.unpack_from("<II", fat1, 0), (0x0FFFFFF8, 0x0FFFFFFF))

    def test_files_read_back(self):
        got = dict(Reader(self.img).walk())
        want = {}
        for dp, _, fns in os.walk(self.tree):
            for fn in fns:
                p = os.path.join(dp, fn)
                want[os.path.relpath(p, self.tree)] = slurp(p)
        self.assertEqual(sorted(got), sorted(want))
        for k in want:
            self.assertEqual(got[k], want[k], k)

    def test_short_names_unique(self):
        taken = set()
        a = m.short_name("very long plugin name one.rmp", taken)[0]; taken.add(a)
        b = m.short_name("very long plugin name two.rmp", taken)[0]
        self.assertNotEqual(a, b)
        self.assertEqual(a, b"VERYLO~1RMP")
        self.assertEqual(m.short_name("KERNEL8.IMG", set())[:2], (b"KERNEL8 IMG", False))
        self.assertEqual(m.short_name(".rytm", set())[0], b"RYTM~1     ")

    def test_too_small_size_refused(self):
        with self.assertRaises(SystemExit):
            m.build_image(self.tree, os.path.join(self.tmp, "x.img"), size=512 << 20)

    def test_reproducible(self):
        other = os.path.join(self.tmp, "b.img")
        m.build_image(self.tree, other)
        self.assertEqual(sha(self.img), sha(other))

    def test_date_changes_bytes_only_when_asked(self):
        other = os.path.join(self.tmp, "c.img")
        m.build_image(self.tree, other, date=(2026, 6, 1))
        self.assertNotEqual(sha(self.img), sha(other))

    def test_zip_and_sha256(self):
        z = os.path.join(self.tmp, "a.img.zip")
        digest = m.write_zip(self.img, z)
        with zipfile.ZipFile(z) as zf:
            self.assertEqual(zf.namelist(), ["a.img"])
            h = hashlib.sha256()
            with zf.open("a.img") as src:
                for blk in iter(lambda: src.read(1 << 22), b""):
                    h.update(blk)
        self.assertEqual(h.hexdigest(), sha(self.img))
        self.assertEqual(slurp(z + ".sha256").decode(), "%s  a.img.zip\n" % digest)
        self.assertEqual(digest, sha(z))
        z2 = os.path.join(self.tmp, "b.img.zip")
        self.assertEqual(m.write_zip(self.img, z2, "a.img"), sha(z2))
        self.assertEqual(sha(z), sha(z2), "the zip is reproducible")


def root_entries(img):
    """The root directory's raw entries of an image: list of (short11, attr, ntres, lfn_count_before)."""
    out, lfn = [], 0
    with open(img, "rb") as f:
        f.seek((m.START_LBA + m.DATA_START) * 512)
        raw = f.read(m.CLUSTER)
    for i in range(0, len(raw), 32):
        e = raw[i:i + 32]
        if e[0] == 0:
            break
        if e[11] == 0x0F:
            lfn += 1
            continue
        out.append((e[0:11], e[11], e[12], lfn))
        lfn = 0
    return {k: (a, nt, l) for k, a, nt, l in out}


class ShortNames(unittest.TestCase):
    def test_non_ascii_gets_alias(self):
        # upper() of a non-ASCII letter can change it or grow it (ß -> SS): such names get NAME~N and an LFN
        for n in ("\u00df.txt", "\u00df\u00df\u00df\u00df\u00df.txt", "caf\u00e9.txt"):
            s, lfn, nt = m.short_name(n, set())
            self.assertEqual(len(s), 11, n)
            self.assertTrue(lfn, n)
            self.assertEqual(nt, 0, n)
            self.assertIn(b"~", s, n)

    def test_plain_names_no_alias(self):
        tmp = tempfile.mkdtemp()
        try:
            tree = os.path.join(tmp, "t"); os.mkdir(tree)
            for n in ("config.txt", "cmdline.txt", "start4.elf", "fixup4.dat", "kernel_2712.img", "Readme.txt", "UPPER.TXT",
                      "armstub8-rpi4.bin", "bcm2711-rpi-4-b.dtb", "noext", "Mixed.TXT"):
                with open(os.path.join(tree, n), "wb") as f:
                    f.write(b"x")
            for d in ("overlays", "firmware"):
                os.mkdir(os.path.join(tree, d))
            img = os.path.join(tmp, "a.img")
            m.build_image(tree, img)
            e = root_entries(img)
            self.assertEqual(e[b"CONFIG  TXT"], (0x20, 0x18, 0))      # base and extension lower case, no LFN
            self.assertEqual(e[b"CMDLINE TXT"], (0x20, 0x18, 0))
            self.assertEqual(e[b"START4  ELF"], (0x20, 0x18, 0))
            self.assertEqual(e[b"FIXUP4  DAT"], (0x20, 0x18, 0))
            self.assertEqual(e[b"UPPER   TXT"], (0x20, 0x00, 0))
            self.assertEqual(e[b"NOEXT      "], (0x20, 0x08, 0))
            self.assertEqual(e[b"OVERLAYS   "], (0x10, 0x08, 0))
            self.assertEqual(e[b"FIRMWARE   "], (0x10, 0x08, 0))
            self.assertEqual(e[b"README  TXT"], (0x20, 0x00, 1))      # mixed case: LFN + plain short, no NT bits
            self.assertEqual(e[b"MIXED   TXT"], (0x20, 0x00, 1))      # mixed base, upper ext
            self.assertEqual(e[b"KERNEL~1IMG"][0], 0x20)              # 11 chars base: needs ~1 and LFN
            self.assertGreaterEqual(e[b"KERNEL~1IMG"][2], 1)
            self.assertGreaterEqual(e[b"ARMSTU~1BIN"][2], 1)
            self.assertFalse([k for k in e if k.startswith(b"CONFIG~")])
        finally:
            shutil.rmtree(tmp)

    def test_plain_collision_falls_back_to_alias(self):
        taken = {b"README  TXT"}
        self.assertEqual(m.short_name("Readme.txt", taken)[:2], (b"README~1TXT", True))

    def test_reader_names(self):
        tmp = tempfile.mkdtemp()
        try:
            tree = os.path.join(tmp, "t"); os.mkdir(tree)
            for n in ("config.txt", "Readme.txt", "a long name.bin"):
                with open(os.path.join(tree, n), "wb") as f:
                    f.write(b"x")
            img = os.path.join(tmp, "a.img")
            m.build_image(tree, img)
            r = Reader(img)
            try:
                self.assertEqual(sorted(n for n, _ in r.walk()), ["Readme.txt", "a long name.bin", "config.txt"])
            finally:
                r.f.close()
        finally:
            shutil.rmtree(tmp)

    def test_case_collision_refused(self):
        tmp = tempfile.mkdtemp()
        try:
            tree = os.path.join(tmp, "t"); os.mkdir(tree)
            for n in ("File.txt", "file.TXT"):
                with open(os.path.join(tree, n), "wb") as f:
                    f.write(b"x")
            if len(os.listdir(tree)) == 2:      # a case-sensitive file system
                with self.assertRaises(SystemExit):
                    m.build_image(tree, os.path.join(tmp, "a.img"))
        finally:
            shutil.rmtree(tmp)

    def test_check_dir_names(self):
        m.check_dir_names(["a.txt", "b.txt"])
        with self.assertRaises(SystemExit):
            m.check_dir_names(["File.txt", "file.TXT"])
        with self.assertRaises(SystemExit):
            m.check_dir_names(["a*b"])

    def test_illegal_names_refused(self):
        for bad in ("a?b.txt", "a:b", 'q"q', "a<b", "trailing.", "trailing ", "tab\tname", "a|b"):
            tmp = tempfile.mkdtemp()
            try:
                tree = os.path.join(tmp, "t"); os.mkdir(tree)
                try:
                    with open(os.path.join(tree, bad), "wb") as f:
                        f.write(b"x")
                except OSError:
                    continue
                with self.assertRaises(SystemExit, msg=repr(bad)):
                    m.build_image(tree, os.path.join(tmp, "a.img"))
            finally:
                shutil.rmtree(tmp)


def slurp(p):
    with open(p, "rb") as f:
        return f.read()


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for blk in iter(lambda: f.read(1 << 22), b""):
            h.update(blk)
    return h.hexdigest()


@unittest.skipUnless(platform.system() == "Darwin", "skipped: hdiutil / fsck_msdos are macOS only")
class MacOS(unittest.TestCase):
    def test_fsck_mount_compare(self):
        tmp = tempfile.mkdtemp()
        dev = None
        try:
            tree = os.path.join(tmp, "tree")
            make_tree(tree)
            img = os.path.join(tmp, "a.img")
            m.build_image(tree, img)
            r = subprocess.run(["hdiutil", "attach", "-nomount", "-imagekey", "diskimage-class=CRawDiskImage", img],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            lines = [l.split() for l in r.stdout.splitlines() if l.strip()]
            dev = lines[0][0]
            slice_ = [l[0] for l in lines if "Windows_FAT_32" in l]
            self.assertEqual(len(slice_), 1, r.stdout)
            f = subprocess.run(["fsck_msdos", "-n", slice_[0]], capture_output=True, text=True)
            self.assertEqual(f.returncode, 0, f.stdout + f.stderr)
            mnt = os.path.join(tmp, "mnt"); os.mkdir(mnt)
            mt = subprocess.run(["mount", "-t", "msdos", "-o", "rdonly,nobrowse", slice_[0], mnt], capture_output=True, text=True)
            self.assertEqual(mt.returncode, 0, mt.stderr)
            try:
                want, got = {}, {}
                for base, store in ((tree, want), (mnt, got)):
                    for dp, _, fns in os.walk(base):
                        for fn in fns:
                            p = os.path.join(dp, fn)
                            store[os.path.relpath(p, base)] = slurp(p)
                import unicodedata
                norm = lambda d: {unicodedata.normalize("NFC", k): v for k, v in d.items()}
                self.assertEqual(sorted(norm(got)), sorted(norm(want)))
                for k, v in norm(want).items():
                    self.assertEqual(norm(got)[k], v, k)
            finally:
                subprocess.run(["umount", mnt], capture_output=True)
        finally:
            if dev:
                subprocess.run(["hdiutil", "detach", dev], capture_output=True)
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    if platform.system() != "Darwin":
        print("skipped: the hdiutil / fsck_msdos checks run on macOS only")
    unittest.main(verbosity=2)
