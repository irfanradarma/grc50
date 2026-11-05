# Mengelola modul materi dan dummy aplikasi

Admin mempunyai tab **Modul & materi**. Setiap paket memuat modul berurutan. Modul mempunyai judul, deskripsi, slide, dan pilihan latihan. Paket awal mempertahankan 45 slide serta workspace SIGNAL yang sudah tersedia.

## Menyesuaikan sesi

1. Buka `/admin/`, masuk, lalu pilih **Modul & materi**.
2. Matikan **Aktif** untuk menyembunyikan modul; tombol panah mengubah urutannya. **Copot modul** menghapusnya dari draft. Ekspor modul dahulu jika ingin memasangnya lagi.
3. Tambah modul atau tambah slide. Setiap slide bisa dinonaktifkan, dipindahkan, dihapus, atau diedit. Pilih **Judul dan isi** untuk mengganti desain bawaan dengan materi yang dapat diedit. **Desain bawaan** mempertahankan artwork, diagram, dan interaksi lama; judul digunakan dalam navigasi dan catatan bisa disunting.
4. Pilih dummy aplikasi: tanpa latihan, SIGNAL bawaan, atau dummy kustom. Dummy kustom mempunyai label isian, tipe teks/angka/pilihan, data contoh, petunjuk, dan tahapan keputusan yang dapat diubah lewat editor.
5. **Simpan draft** menyimpan pekerjaan di server. **Pratinjau dummy** mencoba draft tanpa menyimpan hasil latihan. **Pratinjau deck** membuka seluruh susunan draft di tab lain; preview tidak mengontrol tayangan langsung.
6. Hentikan presentasi dan siaran demo, kemudian **Terbitkan**. Backend menolak publikasi ketika tayangan sedang berlangsung. Deck yang terbuka memuat ulang ketika identitas paket berubah. Susunan baru digunakan oleh navigasi admin dan peserta.
7. Bagikan `/modules/` untuk katalog seluruh materi/latihan, atau tautan deck biasa. `/audience/` tetap membuka SIGNAL bila itu satu-satunya latihan. Jika ada dummy kustom atau SIGNAL dilepas, halaman peserta menampilkan katalog. Tautan **Materi & latihan** juga tersedia dari aplikasi SIGNAL.

Dummy kustom dapat dipasang langsung ke slide melalui tampilan **Dummy aplikasi modul**. Kartu pada katalog juga membuka latihan secara mandiri. SIGNAL mempertahankan kendali pelepasan sinyal dan penyimpanan PostgreSQL yang ada; latihan kustom menyimpan data simulasi hanya dalam browser peserta. Versi paket dan ID modul memisahkan penyimpanan; penerbitan versi baru memulai ruang latihan kustom baru tanpa menghapus versi lama. Dummy tertanam pada deck mempunyai ruang browser tersendiri dari latihan peserta. Dummy kustom tidak menjalankan backend bisnis atau model AI.

## Paket yang dapat dipindahkan

**Ekspor paket** menghasilkan JSON berisi seluruh modul dan materi. **Ekspor modul** menghasilkan satu modul beserta konfigurasi dummy-nya. **Impor paket / modul** memvalidasi format sebelum memasukkannya ke draft. Paket penuh mengganti draft; modul tunggal ditambahkan. ID modul dan key slide harus unik. Gunakan **Duplikat modul** bila ingin membuat variasi dalam paket yang sama; editor membuat ID baru otomatis.

Tidak ada HTML atau JavaScript bebas dalam materi maupun dummy. Teks ditampilkan sebagai teks. Paket harus mempertahankan sedikitnya satu slide aktif; slide demo harus mempunyai dummy yang terpasang. Satu paket hanya dapat mengaktifkan satu workspace SIGNAL. Draft yang disimpan memakai revision check agar admin lain tidak diam-diam menimpa perubahan.

## Acuan pengembang

- `app/shared/content.ts`: skema versi 1, paket bawaan, template dummy, seleksi slide aktif dan identitas versi deck.
- `app/server/content.ts`: GET publik `/api/content`; GET/PUT admin `/api/admin/content`; draft dan publikasi disimpan dalam JSONB ruang seminar yang sudah ada, tanpa migrasi tabel baru.
- `app/src/ContentStudio.tsx`: editor paket dan modul.
- `app/src/ModuleAudience.tsx`: katalog dan runtime dummy kustom; dapat diperluas dengan jenis runtime baru melalui discriminated union pada skema.
- `website/assets/keynote/content-modules.mjs`: komposisi renderer slide bawaan dan slide konfigurasi. Built-in key mereferensikan desain pada `keynote.js`; mematikan modul mengeluarkan slide dari urutan dan kontrak live.
- `app/server/presentation.ts`: urutan berasal dari paket terbit, bukan array slide tetap. Penerbitan memilih slide aktif terdekat yang masih tersedia atau slide pertama, mempertahankan riwayat peserta SIGNAL dan menghentikan tayangan sampai admin memulainya.

Reset latihan SIGNAL mempertahankan konfigurasi materi. Mengembalikan **Paket bawaan** hanya mengubah draft sampai diterbitkan. Perubahan isi organisasi internal SIGNAL tetap merupakan perubahan skenario pada `app/shared/strategicScenario.ts`; untuk skenario latihan baru tanpa mengubah kode, buat dummy kustom.

Rilis backend lebih dahulu, lalu frontend/Pages. Verifikasi tes server/deck, build, paket Pages, akses anonim katalog, larangan publikasi bagi guest, konflik revision, pratinjau draft, serta perubahan urutan dan jumlah slide setelah publikasi. Jangan menjalankan reset seminar produksi sebagai tes deployment.
